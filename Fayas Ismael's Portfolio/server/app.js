import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { openDatabase, contentStore, SQLiteSessionStore, transaction } from './database.js';
import { requireAdmin, requireCsrf, verifyPassword } from './auth.js';
import { HttpError, validateProject, validateExperience } from './validation.js';

const root = fileURLToPath(new URL('../', import.meta.url));

export function createApp(config) {
  const app = express();
  const db = openDatabase(config.databasePath);
  const content = contentStore(db);
  const sessions = new SQLiteSessionStore(db);
  mkdirSync(config.uploadDir, { recursive: true });
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'blob:'],
    connectSrc: ["'self'", 'https://formspree.io'], formAction: ["'self'", 'https://formspree.io'],
    upgradeInsecureRequests: config.production ? [] : null
  } }, strictTransportSecurity: config.production ? undefined : false }));
  app.use(express.json({ limit: '64kb' }));
  app.use(session({ name: 'portfolio.sid', secret: config.sessionSecret, store: sessions,
    resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure: config.production, maxAge: 8 * 60 * 60 * 1000 }
  }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    const expected = config.siteUrl || `${req.protocol}://${req.get('host')}`;
    if (req.get('sec-fetch-site') === 'cross-site' || (origin && origin !== expected)) {
      return res.status(403).json({ error: 'Cross-site requests are not allowed.' });
    }
    next();
  });
  app.get('/api/auth/session', (req, res) => {
    req.session.csrf ||= randomBytes(32).toString('hex');
    res.json({ authenticated: !!req.session.admin, csrf: req.session.csrf });
  });
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
    standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
  app.post('/api/auth/login', loginLimiter, requireCsrf, async (req, res, next) => {
    const valid = await verifyPassword(req.body?.password, config.adminPasswordHash);
    if (!valid || req.body?.username !== config.adminUsername) return res.status(401).json({ error: 'Incorrect username or password.' });
    req.session.regenerate(error => {
      if (error) return next(error);
      req.session.admin = true;
      req.session.csrf = randomBytes(32).toString('hex');
      req.session.save(error => error ? next(error) : res.json({ authenticated: true, csrf: req.session.csrf }));
    });
  });
  app.post('/api/auth/logout', requireAdmin, requireCsrf, (req, res, next) => {
    req.session.destroy(error => {
      if (error) return next(error);
      res.clearCookie('portfolio.sid', { httpOnly: true, sameSite: 'strict', secure: config.production });
      res.json({ success: true });
    });
  });

  for (const kind of ['projects', 'experience']) {
    const route = `/api/${kind}`;
    app.get(route, (_req, res) => res.json(content.list(kind)));
    app.put(`${route}/reorder`, requireAdmin, requireCsrf, (req, res) => {
      const ids = req.body?.ids;
      const existing = content.list(kind);
      if (!Array.isArray(ids) || ids.length !== existing.length || new Set(ids).size !== ids.length ||
        ids.some(id => !existing.some(item => item.id === id))) throw new HttpError(400, 'Provide every current item exactly once. Refresh and try again.');
      content.reorder(kind, ids);
      res.json(content.list(kind));
    });
    function save(req, res) {
      const previous = req.params.id ? content.get(kind, req.params.id) : null;
      if (req.params.id && !previous) throw new HttpError(404, 'This item no longer exists.');
      const fields = kind === 'projects' ? validateProject(req.body ?? {}) : validateExperience(req.body ?? {});
      if (kind === 'projects' && fields.image) {
        const filename = fields.image.startsWith('/uploads/')
          ? path.join(config.uploadDir, path.basename(fields.image)) : path.join(root, fields.image.slice(1));
        if (!existsSync(filename)) throw new HttpError(400, 'The selected image is missing. Upload it again.');
      }
      const item = { ...fields, id: previous?.id || randomUUID(),
        order: previous?.order ?? Math.max(-1, ...content.list(kind).map(item => item.order)) + 1,
        createdAt: previous?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      transaction(db, () => {
        if (kind === 'projects' && fields.featured && content.list(kind).filter(p => p.featured && p.id !== item.id).length >= 3) {
          throw new HttpError(400, 'You can feature only 3 projects on the homepage.');
        }
        content.save(kind, item);
      });
      res.status(previous ? 200 : 201).json(item);
    }
    app.post(route, requireAdmin, requireCsrf, save);
    app.put(`${route}/:id`, requireAdmin, requireCsrf, save);
    app.delete(`${route}/:id`, requireAdmin, requireCsrf, (req, res) => {
      if (!content.remove(kind, req.params.id).changes) throw new HttpError(404, 'This item no longer exists.');
      res.json({ success: true });
    });
  }

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
    fileFilter: (_req, file, cb) => cb(null, ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) });
  const uploadLimiter = rateLimit({ windowMs: 60_000, limit: 20, message: { error: 'Too many uploads. Please wait a minute.' } });
  app.post('/api/uploads', requireAdmin, requireCsrf, uploadLimiter, upload.single('image'), async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Choose a PNG, JPG, JPEG or WebP image (maximum 5 MB).');
    const image = sharp(req.file.buffer, { limitInputPixels: 40_000_000, animated: false });
    let buffer;
    try {
      const metadata = await image.metadata();
      if (!['png', 'jpeg', 'webp'].includes(metadata.format)) throw Error();
      buffer = await image.rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch { throw new HttpError(400, 'This is not a valid PNG, JPEG or WebP image, or it exceeds 40 megapixels.'); }
    const filename = `${randomUUID()}.webp`;
    const { writeFile } = await import('node:fs/promises');
    await writeFile(path.join(config.uploadDir, filename), buffer, { flag: 'wx' });
    res.status(201).json({ url: `/uploads/projects/${filename}` });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
  for (const dir of ['css', 'js', 'assets']) app.use(`/${dir}`, express.static(path.join(root, dir), { dotfiles: 'deny', index: false }));
  app.use('/uploads/projects', express.static(config.uploadDir, { dotfiles: 'deny', index: false, maxAge: '7d', immutable: true }));
  function publicPage(file) {
    return (_req, res) => {
      let html = readFileSync(path.join(root, file), 'utf8');
      if (config.siteUrl) html = html.replaceAll('content="/assets/', `content="${config.siteUrl}/assets/`);
      res.type('html').send(html);
    };
  }
  app.get(['/', '/index.html'], publicPage('index.html'));
  app.get('/works.html', publicPage('works.html'));
  app.get('/portfolio.html', (_req, res) => res.redirect(301, '/index.html'));
  app.get('/edit.html', (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    res.sendFile(path.join(root, req.session.admin ? 'edit.html' : 'login.html'));
  });
  app.get('/robots.txt', (_req, res) => res.type('text').send('User-agent: *\nDisallow: /edit.html\nDisallow: /api/auth/\n'));
  app.use((_req, res) => res.status(404).type('text').send('Page not found. Return to /index.html.'));
  app.use((error, _req, res, _next) => {
    const status = error instanceof multer.MulterError ? 400 : error.status || 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ error: error instanceof multer.MulterError ? 'Upload one image, no larger than 5 MB.' : status >= 500 ? 'Unable to complete the request. Please try again.' : error.message });
  });
  return { app, db, close() { sessions.close(); db.close(); } };
}

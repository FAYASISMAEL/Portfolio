import path from 'node:path';
import { createApp } from './app.js';

const production = process.env.NODE_ENV === 'production';
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET } = process.env;
if (!ADMIN_USERNAME || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(ADMIN_PASSWORD_HASH || '') || SESSION_SECRET?.length < 32 || !SESSION_SECRET) {
  console.error('Admin setup is required. Run npm run setup:admin before starting the server.');
  process.exit(1);
}
let siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
if (siteUrl) {
  const parsed = new URL(siteUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== siteUrl) throw Error('SITE_URL must be an origin without a path.');
}
if (production && !siteUrl?.startsWith('https://')) throw Error('Set SITE_URL to your public HTTPS origin in production.');
const runtime = createApp({ production, siteUrl, adminUsername: ADMIN_USERNAME, adminPasswordHash: ADMIN_PASSWORD_HASH,
  sessionSecret: SESSION_SECRET, trustProxy: Number(process.env.TRUST_PROXY || 0),
  databasePath: path.resolve(process.env.DATABASE_PATH || 'storage/portfolio.sqlite'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads/projects') });
const port = Number(process.env.PORT || 3000);
const server = runtime.app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Portfolio running at ${siteUrl || `http://localhost:${port}`}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { runtime.close(); process.exit(0); }));

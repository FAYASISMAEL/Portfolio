import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, options);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 1024 || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(encoded)) return false;
  const [, salt, hash] = encoded.split(':');
  const actual = await scrypt(password, salt, 64, options);
  return timingSafeEqual(Buffer.from(hash, 'hex'), actual);
}

export function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: 'Please log in to continue.' });
  next();
}

export function requireCsrf(req, res, next) {
  const token = req.get('X-CSRF-Token');
  if (!token || token !== req.session.csrf) return res.status(403).json({ error: 'Your session changed. Refresh and try again.' });
  next();
}

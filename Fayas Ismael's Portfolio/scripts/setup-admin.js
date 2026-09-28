import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { hashPassword } from '../server/auth.js';

let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stdout.write(chunk); callback(); } });
const rl = createInterface({ input: process.stdin, output, terminal: !!process.stdin.isTTY });
try {
  const username = (await rl.question('Admin username or email: ')).trim();
  if (!/^[a-zA-Z0-9@._+-]{3,100}$/.test(username)) throw Error('Use 3–100 letters, numbers, or @ . _ + - for the username.');
  process.stdout.write('Password (at least 12 characters; hidden): ');
  muted = true;
  const password = await rl.question('');
  muted = false;
  process.stdout.write('\nConfirm password (hidden): ');
  muted = true;
  const confirm = await rl.question('');
  muted = false;
  process.stdout.write('\n');
  if (password.length < 12 || password.length > 1024 || password !== confirm) throw Error('Passwords must match and contain 12–1024 characters.');
  let env = existsSync('.env') ? readFileSync('.env', 'utf8') : readFileSync('.env.example', 'utf8');
  for (const [key, value] of Object.entries({ ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: await hashPassword(password), SESSION_SECRET: randomBytes(48).toString('hex') })) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    env = pattern.test(env) ? env.replace(pattern, line) : `${env}\n${line}\n`;
  }
  writeFileSync('.env', env, { mode: 0o600 });
  console.log('Admin configured in .env. Restart the server. Existing sessions are invalidated.');
} catch (error) { muted = false; console.error(error.message); process.exitCode = 1; }
finally { rl.close(); }

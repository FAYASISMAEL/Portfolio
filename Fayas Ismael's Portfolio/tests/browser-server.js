import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.js';
import { hashPassword } from '../server/auth.js';

const directory = mkdtempSync(path.join(tmpdir(), 'portfolio-browser-test-'));
const runtime = createApp({ databasePath: path.join(directory, 'test.sqlite'), uploadDir: path.join(directory, 'uploads'),
  adminUsername: 'browser-test', adminPasswordHash: await hashPassword('browser-test-password-only'),
  sessionSecret: 'browser-test-secret-not-for-production-123456', production: false });
const server = runtime.app.listen(3107, '127.0.0.1', () => console.log('Isolated test portfolio at http://127.0.0.1:3107'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { runtime.close(); process.exit(0); }));

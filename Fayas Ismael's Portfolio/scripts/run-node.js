import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';

function supported(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number);
  return major > 22 || (major === 22 && minor >= 14);
}

// Use an installed compatible runtime without changing the user's global Node version.
let executable = supported(process.version) ? process.execPath : null;
if (!executable) {
  const roots = new Set([
    process.env.NVM_HOME,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'nvm'),
    path.join(process.env.NVM_DIR || path.join(os.homedir(), '.nvm'), 'versions', 'node')
  ].filter(Boolean));
  const candidates = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || !/^v\d+\.\d+\.\d+$/.test(entry.name) || !supported(entry.name)) continue;
      const binary = path.join(root, entry.name, process.platform === 'win32' ? 'node.exe' : 'bin/node');
      if (existsSync(binary)) candidates.push({ binary, version: entry.name });
    }
  }
  candidates.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.binary, ['--input-type=module', '-e', 'await import("node:sqlite")'], { stdio: 'ignore', windowsHide: true });
    if (probe.status === 0) { executable = candidate.binary; break; }
  }
}

if (!executable) {
  console.error(`This project needs Node.js 22.14 or newer for SQLite; your shell uses ${process.version}.\nInstall Node 22.14+ or run "nvm use 22.14.0", then retry the npm command.`);
  process.exit(1);
}
if (executable !== process.execPath) console.log('Using installed Node 22+ for this project (shell Node version unchanged).');

const env = { ...process.env };
const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
env[pathKey] = `${path.dirname(executable)}${path.delimiter}${env[pathKey] || ''}`;
const child = spawn(executable, process.argv.slice(2), { stdio: 'inherit', env, windowsHide: true });
child.on('error', error => { console.error(`Unable to start Node: ${error.message}`); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { if (!child.killed) child.kill(signal); });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1); });

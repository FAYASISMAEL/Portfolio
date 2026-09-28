import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:3107', browserName: 'chromium', channel: process.env.BROWSER_CHANNEL || 'msedge', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/browser-server.js', url: 'http://127.0.0.1:3107', reuseExistingServer: false, timeout: 30_000 }
});

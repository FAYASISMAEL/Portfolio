import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import sharp from 'sharp';
import { createApp } from '../server/app.js';
import { hashPassword } from '../server/auth.js';
import { featuredProjects } from '../js/selection.js';

test('featured selection respects order, limit and latest fallback', () => {
  const items = Array.from({ length: 5 }, (_, i) => ({ id: i, featured: false, order: i, createdAt: `2026-01-0${i + 1}` }));
  assert.deepEqual(featuredProjects(items).map(item => item.id), [4, 3, 2]);
  items[0].featured = true; items[3].featured = true;
  assert.deepEqual(featuredProjects(items).map(item => item.id), [0, 3]);
  items.forEach(item => { item.featured = true; });
  assert.equal(featuredProjects(items).length, 3);
});

test('persistent CMS, authentication, validation, uploads and private files', async t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'portfolio-api-test-'));
  const config = { databasePath: path.join(directory, 'test.sqlite'), uploadDir: path.join(directory, 'uploads'),
    adminUsername: 'test-admin', adminPasswordHash: await hashPassword('test-password-only'), sessionSecret: 'test-secret-not-for-production-123456789', production: false };
  let runtime, server, base, cookie = '', csrf = '';
  async function start() { runtime = createApp(config); server = runtime.app.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`; }
  async function stop() { await new Promise(resolve => server.close(resolve)); runtime.close(); }
  await start(); t.after(stop);
  async function request(route, { method = 'GET', body, authenticated = true, token = csrf, headers = {} } = {}) {
    const isForm = body instanceof FormData;
    const response = await fetch(base + route, { method, headers: { ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(token ? { 'X-CSRF-Token': token } : {}), ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie && authenticated) cookie = setCookie.split(';')[0];
    return response;
  }
  const projects = await (await request('/api/projects')).json();
  assert.equal(projects.length, 4); assert.equal(projects.filter(p => p.featured).length, 3);
  assert.equal((await (await request('/api/experience')).json()).length, 3);
  assert.match(await (await request('/edit.html')).text(), /id="login-form"/);
  for (const route of ['/api/projects', '/api/experience', '/api/uploads']) {
    assert.equal((await request(route, { method: 'POST', body: {}, authenticated: false })).status, 401);
  }
  csrf = (await (await request('/api/auth/session')).json()).csrf;
  assert.equal((await request('/api/auth/login', { method: 'POST', body: { username: 'test-admin', password: 'wrong' } })).status, 401);
  const login = await request('/api/auth/login', { method: 'POST', body: { username: 'test-admin', password: 'test-password-only' } });
  assert.equal(login.status, 200); csrf = (await login.json()).csrf;
  assert.match(await (await request('/edit.html')).text(), /id="project-form"/);
  assert.equal((await request('/api/projects', { method: 'POST', body: projects[0], token: 'wrong' })).status, 403);
  assert.equal((await request('/api/projects', { method: 'POST', body: projects[0], headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await request('/api/projects', { method: 'POST', body: projects[0] })).status, 400);
  assert.equal((await request('/api/projects', { method: 'POST', body: { ...projects[0], featured: false, github: 'javascript:alert(1)' } })).status, 400);
  assert.equal((await request('/api/projects', { method: 'POST', body: { ...projects[0], featured: false, image: '/../../.env' } })).status, 400);
  const image = await sharp({ create: { width: 30, height: 20, channels: 3, background: '#D14B1F' } }).png().toBuffer();
  const multipart = new FormData(); multipart.append('image', new Blob([image], { type: 'image/png' }), '../../attack.png');
  const uploaded = await request('/api/uploads', { method: 'POST', body: multipart });
  assert.equal(uploaded.status, 201);
  const { url } = await uploaded.json(); assert.match(url, /^\/uploads\/projects\/[a-f0-9-]+\.webp$/);
  assert.ok(existsSync(path.join(config.uploadDir, path.basename(url))));
  assert.equal((await request(url)).headers.get('content-type'), 'image/webp');
  const invalid = new FormData(); invalid.append('image', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }), 'fake.png');
  assert.equal((await request('/api/uploads', { method: 'POST', body: invalid })).status, 400);
  const oversized = new FormData(); oversized.append('image', new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
  assert.equal((await request('/api/uploads', { method: 'POST', body: oversized })).status, 400);
  let created = await request('/api/projects', { method: 'POST', body: { ...projects[0], name: 'Persistence test', featured: false, image: url } });
  assert.equal(created.status, 201); created = await created.json();
  assert.notEqual(created.id, projects[0].id);
  const updated = { ...created, name: 'Edited project', liveUrl: 'https://example.com/' };
  assert.equal((await request(`/api/projects/${created.id}`, { method: 'PUT', body: updated })).status, 200);
  let order = (await (await request('/api/projects')).json()).map(p => p.id).reverse();
  assert.equal((await request('/api/projects/reorder', { method: 'PUT', body: { ids: order } })).status, 200);
  assert.equal((await request('/api/projects/reorder', { method: 'PUT', body: { ids: [order[0], order[0]] } })).status, 400);
  const exp = { role: 'Test role', company: 'Test company', startDate: '2025-01', endDate: '', current: true, description: 'Test description', tags: ['JavaScript'] };
  assert.equal((await request('/api/experience', { method: 'POST', body: { ...exp, current: false, endDate: '2024-01' } })).status, 400);
  const createdExp = await (await request('/api/experience', { method: 'POST', body: exp })).json();
  assert.equal((await request(`/api/experience/${createdExp.id}`, { method: 'PUT', body: { ...exp, role: 'Updated role' } })).status, 200);
  const expOrder = (await (await request('/api/experience')).json()).map(e => e.id).reverse();
  assert.equal((await request('/api/experience/reorder', { method: 'PUT', body: { ids: expOrder } })).status, 200);
  await stop(); await start();
  assert.equal((await (await request('/api/auth/session')).json()).authenticated, true);
  const persisted = await (await request('/api/projects')).json();
  assert.deepEqual(persisted.map(p => p.id), order); assert.equal(persisted[0].name, 'Edited project');
  assert.equal((await (await request('/api/experience')).json())[0].role, 'Updated role');
  assert.equal((await request(`/api/projects/${created.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await request(`/api/experience/${createdExp.id}`, { method: 'DELETE' })).status, 200);
  for (const route of ['/.env', '/data/portfolio-data.json', '/server/app.js', '/storage/portfolio.sqlite', '/package.json']) {
    assert.equal((await request(route)).status, 404);
  }
  assert.equal((await request('/edit.html')).headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal((await request('/api/auth/logout', { method: 'POST' })).status, 200);
  assert.equal((await request('/api/projects', { method: 'POST', body: updated })).status, 401);
  assert.equal((await (await request('/api/projects')).json()).length, 4);
});

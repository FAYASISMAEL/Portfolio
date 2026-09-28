import { test, expect } from '@playwright/test';
import path from 'node:path';
import { readFileSync } from 'node:fs';

async function captureRevealedPage(page, path) {
  for (const row of await page.locator('[data-reveal]').all()) {
    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveClass(/visible/);
    await expect(row).toHaveCSS('opacity', '1');
  }
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  if (await page.locator('.hero-title').count()) await expect(page.locator('.hero-title')).toHaveCSS('opacity', '1');
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
}

test('existing desktop layout and styles stay consistent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/__original.html', route => route.fulfill({ contentType: 'text/html', body: readFileSync('portfolio.html', 'utf8') }));
  for (const name of ['image.png', 'Screenshot 2026-04-02 032341.png', 'Screenshot 2026-04-02 035616.png']) {
    await page.route(`**/${encodeURIComponent(name)}`, route => route.fulfill({ contentType: 'image/png', body: readFileSync(name) }));
  }
  async function measurements() {
    await page.evaluate(() => document.fonts.ready);
    return page.evaluate(() => {
      const selectors = ['#navbar', '#hero', '#about', '#experience', '.hero-title', '.about-big', '.experience-item', '.project-info', '.project-name'];
      return Object.fromEntries(selectors.map(selector => {
        const el = document.querySelector(selector); const style = getComputedStyle(el); const rect = el.getBoundingClientRect();
        return [selector, { width: Math.round(rect.width), height: Math.round(rect.height), font: style.fontFamily, size: style.fontSize,
          color: style.color, background: style.backgroundColor, padding: style.padding }];
      }));
    });
  }
  await page.goto('/__original.html');
  const before = await measurements();
  await page.goto('/'); await expect(page.locator('.project-row')).toHaveCount(3);
  const after = await measurements();
  expect(after).toEqual(before);
  await captureRevealedPage(page, 'test-results/home-desktop.png');
});

test('public content, responsive menu, fallback images and contact feedback', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.project-row')).toHaveCount(3);
  await expect(page.locator('.experience-item')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Fayas Ismael' })).toBeVisible();
  await page.getByRole('link', { name: 'View More Works' }).click();
  await expect(page.locator('.project-row')).toHaveCount(4);
  await expect(page.getByText('Preview coming soon')).toBeVisible();
  await expect(page.locator('.project-row').last().locator('img')).toHaveCount(0);
  await captureRevealedPage(page, 'test-results/works-desktop.png');
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/works.html'); await expect(page.locator('.project-row')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Works at ${width}px`).toBe(true);
    await page.goto('/'); await expect(page.locator('.project-row')).toHaveCount(3);
    const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => `${el.tagName}.${el.className}: ${Math.round(el.getBoundingClientRect().right)}`) }));
    expect(layout.scroll, JSON.stringify(layout)).toBeLessThanOrEqual(width);
    if (width <= 768) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Experience', exact: true })).toBeVisible();
      await page.getByRole('link', { name: 'Experience', exact: true }).click();
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await captureRevealedPage(page, 'test-results/home-mobile.png');
  await page.route('https://formspree.io/**', route => route.fulfill({ status: 500, body: '{}' }));
  await page.getByLabel('Your Name').fill('Test Visitor');
  await page.getByLabel('Email Address').fill('visitor@example.com');
  await page.getByLabel('Tell me about your project').fill('Browser test only; no external submission.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#formError')).toContainText('Unable to send');
  await page.unroute('https://formspree.io/**');
  await page.route('https://formspree.io/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#formSuccess')).toBeVisible();
  expect(errors).toEqual([]);
});

test('admin login, image preview, CRUD, ordering, feature limit and logout', async ({ page }) => {
  await page.goto('/edit.html');
  await expect(page.locator('#login-form')).toBeVisible();
  await page.getByLabel('Email / Username').fill('browser-test');
  await page.getByLabel('Password', { exact: true }).fill('browser-test-password-only');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('#admin-projects .admin-row')).toHaveCount(4);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Admin at ${width}px`).toBe(true);
  }
  await page.getByLabel('Show on Homepage').click();
  await expect(page.getByLabel('Show on Homepage')).not.toBeChecked();
  await expect(page.locator('#project-feedback')).toContainText('only 3');
  await page.getByLabel('Project Name', { exact: true }).fill('Browser project');
  await page.getByLabel('Project Category').fill('Test category');
  await page.getByLabel('Project Year').fill('2026');
  await page.getByLabel('Project Description').fill('A test project description.');
  await page.getByLabel('Technology Stack').fill('HTML, CSS, JavaScript');
  await page.getByLabel('GitHub URL').fill('https://github.com/example/project');
  await page.getByLabel('Live Project URL').fill('https://example.com');
  await page.getByLabel('Project Image').setInputFiles(path.resolve('assets/images/coinmetric-ai.png'));
  await expect(page.locator('#image-preview img')).toBeVisible();
  await page.getByRole('button', { name: 'Save Project' }).click();
  await expect(page.locator('#project-feedback')).toContainText('added successfully');
  await expect(page.locator('#admin-projects .admin-row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Edit: Browser project', exact: true }).click();
  await page.getByLabel('Project Name', { exact: true }).fill('Updated browser project');
  await page.getByRole('button', { name: 'Save Project' }).click();
  await expect(page.locator('#project-feedback')).toContainText('updated successfully');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Updated browser project', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Move Up: Updated browser project', exact: true }).click();
  await expect(page.locator('#admin-projects .admin-row').nth(3)).toContainText('Updated browser project');
  await page.getByLabel('Job Role').fill('Browser role');
  await page.getByLabel('Company', { exact: true }).fill('Browser company');
  await page.getByLabel('Start Date').fill('2026-01');
  await page.getByLabel('Currently Working Here').check();
  await page.locator('#experience-description').fill('Browser experience description.');
  await page.getByLabel('Skills / Tags').fill('Testing, JavaScript');
  await page.getByRole('button', { name: 'Save Experience' }).click();
  await expect(page.locator('#experience-feedback')).toContainText('added successfully');
  await page.getByRole('button', { name: 'Edit: Browser role', exact: true }).click();
  await page.getByLabel('Job Role').fill('Updated browser role');
  await page.getByRole('button', { name: 'Save Experience' }).click();
  await expect(page.locator('#experience-feedback')).toContainText('updated successfully');
  await page.getByRole('button', { name: 'Move Up: Updated browser role', exact: true }).click();
  await expect(page.locator('#admin-experience .admin-row').nth(2)).toContainText('Updated browser role');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Delete: Updated browser project', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#admin-projects .admin-row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Delete: Updated browser project', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.locator('#admin-projects .admin-row')).toHaveCount(4);
  await page.getByRole('button', { name: 'Delete: Updated browser role', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.locator('#admin-experience .admin-row')).toHaveCount(3);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page.locator('#login-form')).toBeVisible();
});

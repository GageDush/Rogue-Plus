import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = (process.env.ROGUE_PLUS_BASE_URL || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const errors = [];
const fail = [];
try {
  const desktop = await browser.newContext({ viewport: { width: 1330, height: 850 }, acceptDownloads: true });
  const page = await desktop.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) fail.push(response.url()); });

  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Try sample view/i }).click();
  await page.locator('.hero-grid .kpi').first().waitFor();
  assert.ok(await page.locator('.hero-grid .kpi').count() >= 4, 'Home KPIs missing');

  const nav = name => page.locator('.desktop-sidebar').getByRole('button', { name, exact: true });
  await nav('Dex').click();
  await page.locator('.pokemon-card').first().waitFor();
  assert.ok(await page.locator('.pokemon-card').count() >= 8, 'Dex did not render synthetic collection');
  await page.locator('.pokemon-card').first().click();
  await page.locator('.pokemon-hero').waitFor();
  await page.getByRole('button', { name: 'Back to Pokédex' }).click();

  await nav('Build').click();
  await page.locator('.team-header-card').waitFor();
  await nav('Goals').click();
  await page.locator('.hunt-list').waitFor();
  await nav('Run').click();
  await page.getByText('RUNS · PLANNED').waitFor();
  await nav('Goals').click();
  await page.locator('.hunt-list').waitFor();
  await nav('More').click();
  await page.locator('.more-grid').getByRole('button', { name: /Trainer/i }).click();
  await page.locator('.progress-list').waitFor();
  await nav('More').click();
  await page.locator('.more-grid').getByRole('button', { name: /Modules/i }).click();
  await page.getByText('MODULE REGISTRY · PLANNED').waitFor();
  await nav('More').click();
  await page.locator('.more-grid').getByRole('button', { name: /Import \/ Settings/i }).click();
  await page.locator('.settings-hero').waitFor();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Export backup/i }).click(),
  ]);
  const backup = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(backup.kind, 'pokerogue-command-center-backup');
  assert.ok(backup.state.current, 'Synthetic backup missing current account');
  assert.ok(backup.state.current.pokemon.length >= 8, 'Synthetic backup missing collection');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.hero-grid .kpi').first().waitFor();
  console.log('PASS: Desktop navigation and IndexedDB reload');

  // A second browser context is isolated from the first account. No actual user saves are used.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage();
  phone.on('pageerror', error => errors.push(error.message));
  await phone.goto(base, { waitUntil: 'domcontentloaded' });
  await phone.locator('input[accept=".json,application/json"]').setInputFiles({
    name: 'synthetic-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await phone.locator('.hero-grid .kpi').first().waitFor();
  assert.ok(await phone.locator('.hero-grid .kpi').count() >= 4, 'Mobile backup restore did not load');
  await phone.locator('.bottom-nav').getByRole('button', { name: 'Dex', exact: true }).click();
  await phone.locator('.pokemon-card').first().waitFor();
  await phone.locator('.bottom-nav').getByRole('button', { name: 'Build', exact: true }).click();
  await phone.locator('.team-header-card').waitFor();
  await phone.locator('.bottom-nav').getByRole('button', { name: 'Run', exact: true }).click();
  await phone.getByText('RUNS · PLANNED').waitFor();
  await phone.getByRole('button', { name: 'More navigation' }).click();
  await phone.locator('.more-grid').getByRole('button', { name: /Import \/ Settings/i }).waitFor();
  assert.equal(await phone.locator('.bottom-nav .nav-button').count(), 5, 'Mobile navigation must contain five primary destinations');
  const pageWidth = await phone.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(pageWidth <= 390, 'Horizontal overflow on iPhone-width viewport: '+pageWidth);
  console.log('PASS: Mobile navigation, responsive layout and cross-profile synthetic backup restore');

  assert.deepEqual(errors, [], 'Unexpected client JS error(s)');
  assert.deepEqual(fail, [], 'Failed application assets');
  console.log('PASS: No JavaScript errors or failed same-origin requests');
  await desktop.close();
  await mobile.close();
} finally {
  await browser.close();
}

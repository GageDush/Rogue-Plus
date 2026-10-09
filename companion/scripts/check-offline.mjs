// CI-only isolated browser verification. Never use a player's browser profile/data.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base = (process.env.ROGUE_PLUS_BASE_URL || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base);
  await page.getByRole('button', { name: 'Try sample view', exact: true }).click();
  await page.getByText('Sample collection · Local only', { exact: true }).waitFor();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) throw new Error('No active offline worker');
  });
  // Reload once to acquire the installed worker, then start a genuinely new page offline.
  await page.reload();
  await page.getByText('Sample collection · Local only', { exact: true }).waitFor();
  await context.setOffline(true);
  await page.close();
  const cold = await context.newPage();
  const errors = []; cold.on('pageerror', error => errors.push(error.message));
  await cold.goto(base);
  await cold.getByRole('heading', { name: 'Profile overview', exact: true }).waitFor();
  await cold.getByText('Sample collection · Local only', { exact: true }).waitFor();
  await cold.locator('.desktop-sidebar').getByRole('button', { name: 'Dex', exact: true }).click();
  await cold.getByRole('button', { name: 'All Pokémon', exact: true }).click();
  await cold.getByRole('textbox', { name: 'Search Pokémon or collection gaps' }).fill('Garchomp');
  await cold.getByRole('button', { name: /^Garchomp / }).click();
  await cold.getByRole('heading', { name: 'Garchomp', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'Offline cold page had client errors');
  await context.close();
  console.log('PASS: new offline page boots complete built shell, retains synthetic account and opens bundled reference detail');
} finally { await browser.close(); }

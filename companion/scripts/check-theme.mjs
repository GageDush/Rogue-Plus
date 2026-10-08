import assert from 'node:assert/strict';

// Fresh isolated contexts with synthetic sample data only.
export async function checkTheme(browser, base) {
  for (const width of [320, 390, 1330]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: 'dark' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const actual = () => page.locator('html').getAttribute('data-theme');
    const nav = name => page.locator(width >= 980 ? '.desktop-sidebar' : '.bottom-nav').getByRole('button', { name, exact: true });
    async function settings() {
      if (width >= 980) await page.locator('.desktop-sidebar').getByRole('button', { name: 'Import / Settings', exact: true }).click();
      else {
        await page.getByRole('button', { name: 'More navigation', exact: true }).click();
        await page.locator('.more-grid').getByRole('button', { name: /Import \/ Settings/ }).click();
      }
      await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor();
    }
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Try sample view/ }).waitFor();
    assert.equal(await actual(), 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.getByRole('button', { name: /Try sample view/ }).click();
    // Stress the real KPI layout with a long synthetic value, without changing domain state.
    await page.locator('.kpi > strong').nth(2).evaluate(el => { el.textContent = '2,077 / 2,288'; });
    assert.ok(await page.locator('.kpi > strong').nth(2).evaluate(el => el.scrollWidth <= el.clientWidth), 'Long collection total is clipped');
    await settings();
    for (const mode of ['Dark', 'Light']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      assert.equal(await actual(), mode.toLowerCase());
      assert.equal(await page.getByRole('button', { name: mode, exact: true }).getAttribute('aria-pressed'), 'true');
      await page.emulateMedia({ colorScheme: mode === 'Dark' ? 'light' : 'dark' });
      assert.equal(await actual(), mode.toLowerCase());
      for (const destination of ['Home', 'Dex', 'Build', 'Run', 'Goals']) {
        await nav(destination).click();
        assert.equal(await actual(), mode.toLowerCase());
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, destination + ' overflows ' + width);
      }
      await settings();
    }
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await page.reload();
    await page.locator('.hero-grid .kpi').first().waitFor();
    assert.equal(await actual(), 'dark');
    await settings();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear local data', exact: true }).click();
    await page.getByRole('button', { name: /Try sample view/ }).waitFor();
    assert.equal(await actual(), 'dark');
    await page.reload();
    await page.getByRole('button', { name: /Try sample view/ }).waitFor();
    assert.equal(await actual(), 'dark');
    await settings();
    await page.getByRole('button', { name: 'System', exact: true }).click();
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: Light/dark/system, live OS changes, explicit override, reload/reset isolation and five routes at 320/390/1330px');
}

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
        await page.locator('.more-popover').getByRole('button', { name: /Import \/ Settings/ }).click();
      }
      await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor();
    }
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    // Desktop automation has zero native safe-area values. Simulate camera and
    // home-indicator insets to catch later CSS overrides; real iOS is separate.
    if (width < 980) await page.addStyleTag({ content: ':root { --safe-top: 59px; --safe-bottom: 34px; }' });
    await page.getByRole('button', { name: /Try sample view/ }).waitFor();
    assert.equal(await actual(), 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.getByRole('button', { name: /Try sample view/ }).click();
    // Stress the real KPI layout with a long synthetic value, without changing domain state.
    await page.locator('.collection-progress .progress-summary small').nth(2).evaluate(el => { el.textContent = '2,077 / 2,288'; });
    assert.ok(await page.locator('.collection-progress .progress-summary small').nth(2).evaluate(el => el.scrollWidth <= el.clientWidth), 'Long collection total is clipped');
    await settings();
    for (const mode of ['Dark', 'Light']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      assert.equal(await actual(), mode.toLowerCase());
      assert.equal(await page.getByRole('button', { name: mode, exact: true }).getAttribute('aria-pressed'), 'true');
      await page.emulateMedia({ colorScheme: mode === 'Dark' ? 'light' : 'dark' });
      assert.equal(await actual(), mode.toLowerCase());
      for (const destination of ['Home', 'Dex', 'Build', 'Run', 'Goals']) {
        await nav(destination).click();
        assert.equal(await page.locator('.topbar .import-button').count(), destination === 'Home' ? 1 : 0);
        if (destination === 'Home') {
          await page.getByRole('heading', { name: 'Profile overview', exact: true }).waitFor();
          assert.equal(await page.getByRole('progressbar').count(), 4);
          assert.equal(await page.locator('.priority-row').filter({ hasText: /Finish egg moves|Unlock egg/ }).count(), 0);
          const all = page.getByRole('button', { name: /Browse all/ });
          assert.equal(await all.count(), 1, 'Synthetic candy list must exercise expansion');
          await all.click();
          assert.ok(await page.locator('.priority-row').count() > 3);
          assert.ok(await page.locator('.priority-row').count() <= 20, 'Candy browser must load bounded batches');
          await page.getByRole('combobox', { name: 'Candy action type', exact: true }).selectOption('eggs');
          assert.ok(await page.locator('.priority-row').count() > 0);
          assert.equal(await page.locator('.priority-row').filter({ hasText: /Unlock passive|Reduce starter cost/ }).count(), 0);
          await page.getByRole('textbox', { name: 'Search candy priorities', exact: true }).fill('no-such-pokemon');
          await page.getByText('No matching candy priorities', { exact: true }).waitFor();
          await page.getByRole('button', { name: 'Clear candy search', exact: true }).click();
          await page.getByRole('combobox', { name: 'Candy action type', exact: true }).selectOption('all');
          await page.getByRole('button', { name: 'Show fewer', exact: true }).click();
          assert.equal(await page.locator('.priority-row').count(), 3);
          await page.getByRole('combobox', { name: 'Egg order' }).selectOption('least-progress');
          await page.getByRole('combobox', { name: 'Egg order' }).selectOption('most-eggs');
          await page.locator('.priority-row').first().click();
          await page.getByRole('button', { name: 'Back to Pokédex' }).click();
        }
        assert.equal(await actual(), mode.toLowerCase());
        if (destination === 'Dex') {
          const search = page.getByRole('textbox', { name: 'Search Pokémon or collection gaps', exact: true });
          await search.fill('a');
          await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
          if (width >= 980) {
            assert.equal(await page.locator('.desktop-more-toggle').isVisible(), false, 'Tall desktop should expose destinations directly');
            assert.equal(await page.locator('.desktop-secondary').isVisible(), true);
            await page.setViewportSize({ width, height: 600 });
            assert.equal(await page.locator('.desktop-secondary').isVisible(), false);
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          }
          const settledScroll = await page.evaluate(() => window.scrollY);
          const more = width >= 980 ? page.locator('.desktop-sidebar').getByRole('button', { name: 'More', exact: true }) : page.getByRole('button', { name: 'More navigation', exact: true });
          for (const dismissal of ['toggle', 'outside', 'escape']) {
            await more.click();
            await page.locator('.more-popover').waitFor();
            assert.equal(await more.getAttribute('aria-expanded'), 'true');
            if (width >= 980) {
              const trigger = await more.boundingBox();
              const menu = await page.locator('.more-popover').boundingBox();
              assert.ok(menu.x >= trigger.x + trigger.width && menu.x < trigger.x + trigger.width + 24, 'Desktop panel must open beside sidebar toggle');
              assert.ok(menu.y >= 0 && menu.y + menu.height <= 600, 'Desktop panel must fit short window');
            }
            assert.equal(await search.inputValue(), 'a');
            if (dismissal === 'toggle') await more.click();
            else if (dismissal === 'outside') await page.mouse.click(width / 2, width >= 980 ? 550 : 830);
            else await page.keyboard.press('Escape');
            assert.equal(await page.locator('.more-popover').count(), 0);
            assert.equal(await more.getAttribute('aria-expanded'), 'false');
            assert.equal(await search.inputValue(), 'a');
            assert.equal(await page.evaluate(() => window.scrollY), settledScroll, 'Menu dismissal must preserve scroll');
            await page.getByRole('heading', { name: 'Pokédex', exact: true }).waitFor();
          }
          if (width >= 980) {
            await page.setViewportSize({ width, height: 390 });
            await more.click();
            const compactMenu = await page.locator('.more-popover').boundingBox();
            assert.ok(compactMenu.y >= 0 && compactMenu.y + compactMenu.height <= 390, 'Very short desktop panel must remain bounded');
            await page.setViewportSize({ width, height: 844 });
            await page.locator('.more-popover').waitFor({ state: 'hidden' });
            assert.equal(await page.locator('.more-popover').count(), 0, 'Resize hiding the trigger must dismiss More');
            assert.equal(await page.locator('.desktop-secondary').isVisible(), true);
          }
          await search.fill('');
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, destination + ' overflows ' + width);
        if (destination === 'Dex' || destination === 'Build') {
          assert.ok(await page.locator(destination === 'Dex' ? '.dex-toolbar' : '.team-tabs').evaluate(el => el.scrollWidth <= el.clientWidth), 'Filter/tab options are hidden horizontally');
        }
        if (width < 980) {
          assert.ok(await page.locator('.topbar').evaluate(el => parseFloat(getComputedStyle(el).paddingTop) >= 71), 'Camera inset lost to stylesheet override');
          assert.ok(await page.locator('.topbar-copy').evaluate(el => el.getBoundingClientRect().top >= 59), 'Brand enters status area');
          assert.ok(await page.locator('.bottom-nav').evaluate(el => parseFloat(getComputedStyle(el).paddingBottom) >= 42), 'Home indicator padding missing');
        }
      }
      if (width < 980) {
        await page.setViewportSize({ width: 844, height: 390 });
        const landscape = await page.addStyleTag({ content: ':root { --safe-top: 0px; --safe-left: 59px; --safe-right: 59px; --safe-bottom: 21px; }' });
        assert.ok(await page.locator('.content').evaluate(el => parseFloat(getComputedStyle(el).paddingLeft) >= 83 && parseFloat(getComputedStyle(el).paddingRight) >= 83), 'Landscape camera side clearance missing');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 844), 'Landscape overflow');
        await page.getByRole('button', { name: 'More navigation', exact: true }).click();
        assert.ok(await page.locator('.more-popover').evaluate(el => {
          const r = el.getBoundingClientRect();
          return r.left >= 59 && r.right <= 844 - 59 && r.top >= 0 && r.bottom <= 390 - 21;
        }), 'Landscape menu leaves safe viewport');
        await page.keyboard.press('Escape');
        await landscape.evaluate(el => el.remove());
        await page.setViewportSize({ width, height: 844 });
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

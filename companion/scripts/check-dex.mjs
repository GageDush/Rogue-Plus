import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

/** Run against a local Vite dev server; browser contexts contain synthetic data only. */
export async function checkDex(browser, base, captures) {
  if (captures) await mkdir(captures, { recursive: true });
  for (const [width, height] of [[320, 720], [390, 844], [1100, 390], [1600, 900]]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /Try sample view/ }).waitFor();
      // Fixture changes account facts only in this isolated test context.
      await page.evaluate(async () => {
        const { buildDemoState } = await import('/src/pokerogue.ts');
        const { saveState } = await import('/src/store.ts');
        const state = buildDemoState();
        Object.assign(state.current.pokemon.reduce((first, row) => row.id < first.id ? row : first), {
          name: 'Synthetic Bloodmoon Ursaluna With A Long Name', unlocked: true,
          perfectIvs: undefined, eggCount: undefined, passiveUnlocked: undefined,
          progressGaps: '',
        });
        state.current.pokemon.find(row => row.id === 290).unlocked = false;
        await saveState(state);
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      const nav = name => page.locator(width >= 980 ? '.desktop-sidebar' : '.bottom-nav').getByRole('button', { name, exact: true });
      await nav('Dex').click();
      await page.locator('.pokemon-card').first().waitFor();
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const button = name => page.getByRole('button', { name, exact: true });
      const cards = page.locator('.pokemon-card');
      const search = page.getByRole('textbox', { name: 'Search Pokémon or collection gaps' });
      assert.equal(await button('Collected').getAttribute('aria-pressed'), 'true');
      assert.equal(await button('Grid').getAttribute('aria-pressed'), 'true');
      const columns = await page.locator('.dex-results').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.ok(width < 980 ? columns === 3 : columns >= 3 && columns <= 8, `Grid columns ${columns} at ${width}`);
      if (width === 1600) assert.equal(columns, 8);
      assert.match(await cards.first().innerText(), /Unknown/);
      assert.match(await cards.first().innerText(), /Progress unavailable/);
      assert.ok(await cards.first().locator('strong').evaluate(el => el.scrollWidth <= el.clientWidth), 'Long name clipped');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Grid overflow');
      if (captures) await page.screenshot({ path: `${captures}/dex-${width}-${theme}.png` });
      await button('List').click();
      if (captures && width === 390) await page.screenshot({ path: `${captures}/list-${width}-${theme}.png` });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'List overflow');
      assert.ok(await cards.first().locator('strong').evaluate(el => el.scrollWidth <= el.clientWidth), 'List name clipped');
      await button('Grid').click();
      const collected = await cards.count();
      await button('All Pokémon').click();
      assert.ok(await cards.count() >= collected);
      assert.ok(await page.getByText('Locked', { exact: true }).count() > 0, 'All scope must label locked starters');
      await button('Filters').click();
      const panel = page.getByRole('dialog', { name: 'Filters' });
      await panel.getByRole('checkbox', { name: 'Red shiny owned' }).check();
      await panel.getByRole('button', { name: 'Cancel', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Remove Red shiny owned', exact: true }).count(), 0);
      assert.equal(await button('Filters').evaluate(el => el === document.activeElement), true, 'Cancel restores focus');
      await button('Filters').click();
      await panel.getByRole('checkbox', { name: 'Red shiny owned' }).check();
      await panel.getByRole('button', { name: 'Apply', exact: true }).click();
      await button('Remove Red shiny owned').waitFor();
      assert.deepEqual(await cards.evaluateAll(elements => elements.map(el => Number(el.dataset.pokemonId))), [19, 300, 898, 932], 'Red filter must match owned red tiers');
      await button('Filters').click();
      await panel.getByRole('checkbox', { name: 'Red shiny owned' }).uncheck();
      await page.keyboard.press('Escape');
      await button('Remove Red shiny owned').waitFor();
      await button('Remove Red shiny owned').click();
      await button('Sort').click();
      await page.getByLabel('Sort by', { exact: true }).selectOption('name');
      await page.getByLabel('Direction', { exact: true }).selectOption('desc');
      await page.getByRole('dialog').getByRole('button', { name: 'Apply', exact: true }).click();
      assert.match(await page.locator('.result-meta').innerText(), /Name · Descending/);
      await button('Advanced').click();
      const advanced = page.getByRole('dialog', { name: 'Advanced' });
      const box = await advanced.boundingBox();
      if (captures && (width === 390 || width === 1100)) await page.screenshot({ path: `${captures}/panel-${width}-${theme}.png` });
      assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, 'Panel outside viewport');
      if (width >= 980) {
        const trigger = await button('Advanced').boundingBox();
        assert.ok(Math.abs(box.x - trigger.x) < 360, 'Desktop panel far from trigger');
      }
      await page.getByRole('textbox', { name: 'Candy balance minimum', exact: true }).fill('20');
      await page.getByRole('textbox', { name: 'Candy balance maximum', exact: true }).fill('10');
      await advanced.getByRole('button', { name: 'Apply', exact: true }).click();
      await advanced.getByRole('alert').waitFor();
      assert.equal(await advanced.isVisible(), true, 'Invalid range must retain draft');
      await page.getByRole('textbox', { name: 'Candy balance minimum', exact: true }).fill('0');
      await advanced.getByRole('button', { name: 'Apply', exact: true }).click();
      await button('Remove Candy balance').waitFor();
      await button('Clear all').click();
      await button('Advanced').click();
      await advanced.getByRole('button', { name: 'Apply', exact: true }).focus();
      await page.keyboard.press('Tab');
      assert.equal(await advanced.evaluate(el => el.contains(document.activeElement)), true, 'Focus escaped dialog');
      await page.keyboard.press('Escape');
      assert.equal(await button('Advanced').evaluate(el => el === document.activeElement), true);
      await button('Filters').click();
      await page.mouse.click(2, 2);
      assert.equal(await page.getByRole('dialog').count(), 0, 'Backdrop must cancel');
      await search.fill('no-such-starter');
      await page.getByText('No matches', { exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await button('Clear all').click();
      await button('Filters').click();
      await panel.getByRole('checkbox', { name: 'Hidden ability unlocked' }).check();
      await panel.getByRole('button', { name: 'Apply', exact: true }).click();
      await search.fill('a');
      await button('List').click();
      const target = cards.last();
      await target.scrollIntoViewIfNeeded();
      const id = await target.getAttribute('data-pokemon-id');
      const scroll = await page.evaluate(() => window.scrollY);
      await target.click();
      await page.getByRole('button', { name: 'Back to Pokédex' }).click();
      assert.equal(await search.inputValue(), 'a');
      await button('Remove Hidden ability unlocked').waitFor();
      assert.match(await page.locator('.result-meta').innerText(), /Name · Descending/);
      assert.equal(await button('List').getAttribute('aria-pressed'), 'true');
      assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - scroll) <= 2, 'Detail round trip lost scroll');
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-pokemon-id')), id, 'Detail return lost focus');
      if (height < 720 || width < 980) {
        const more = width >= 980 ? page.locator('.desktop-sidebar').getByRole('button', { name: 'More', exact: true }) : button('More navigation');
        const before = await page.evaluate(() => window.scrollY);
        await more.click(); await page.locator('.more-popover').waitFor(); await page.keyboard.press('Escape');
        assert.equal(await search.inputValue(), 'a');
        assert.equal(await page.evaluate(() => window.scrollY), before, 'More dismissal lost scroll');
      }
      assert.deepEqual(errors, []);
      console.log(`PASS: Dex ${width}x${height} ${theme}, ${columns} columns, grid/list/scope/drafts/ranges/empty/partial/focus/detail/menu`);
      await context.close();
    }
  }
}

// Optional standalone runner. Install Playwright separately, as with check-ui.mjs.
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    await checkDex(browser, process.env.ROGUE_PLUS_BASE_URL || 'http://127.0.0.1:5173/', process.env.ROGUE_PLUS_CAPTURE_DIR);
  } finally { await browser.close(); }
}

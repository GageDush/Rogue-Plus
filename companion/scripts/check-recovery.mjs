import assert from 'node:assert/strict';

// Run against the built React app in isolated contexts, never real player state.
export async function checkRecovery(browser, base) {
  const empty = { current: null, snapshots: [], history: [] };
  const future = { kind: 'pokerogue-command-center-state', schemaVersion: 900,
    referenceVersion: 'synthetic', savedAt: '2026-01-01T00:00:00.000Z', state: empty };
  const valid = { ...future, schemaVersion: 2 };
  const cases = [
    { name: 'future IndexedDB with legacy', current: future, legacy: empty },
    { name: 'malformed IndexedDB with legacy', current: { broken: true }, legacy: empty },
    { name: 'future IndexedDB with valid fallback', current: future, raw: JSON.stringify(valid) },
    { name: 'malformed IndexedDB with valid fallback', current: { broken: true }, raw: JSON.stringify(valid) },
    { name: 'malformed localStorage over valid IndexedDB', current: valid, raw: '{broken-json' },
    { name: 'future fallback localStorage', current: valid, raw: JSON.stringify(future) },
    { name: 'malformed legacy', legacy: { broken: true } },
  ];

  for (const width of [320, 390, 1330]) {
    for (const fixture of cases) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.getByRole('button', { name: /Try sample view/i }).waitFor();
      // Await the initial empty-state save's transaction before seeding.
      await page.evaluate(async () => {
        for (let i = 0; i < 50; i++) {
          const saved = await new Promise(resolve => {
            const req = indexedDB.open('pokerogue-command-center', 2);
            req.onsuccess = () => { const db = req.result; const tx = db.transaction('state');
              const read = tx.objectStore('state').get('app-state-v2');
              tx.oncomplete = () => { db.close(); resolve(read.result); }; };
          });
          if (saved) return;
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        throw new Error('Initial app autosave did not settle');
      });
      await page.evaluate(async fixture => {
        localStorage.removeItem('app-state-v2');
        localStorage.removeItem('app-state');
        await new Promise((resolve, reject) => {
          const req = indexedDB.open('pokerogue-command-center', 2);
          req.onsuccess = () => {
            const db = req.result; const tx = db.transaction('state', 'readwrite'); const store = tx.objectStore('state');
            store.delete('app-state-v2'); store.delete('app-state');
            if (fixture.current !== undefined) store.put(fixture.current, 'app-state-v2');
            if (fixture.legacy !== undefined) store.put(fixture.legacy, 'app-state');
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
          };
          req.onerror = () => reject(req.error);
        });
        if (fixture.raw !== undefined) localStorage.setItem('app-state-v2', fixture.raw);
      }, fixture);
      const stored = () => page.evaluate(async () => {
        const local = [localStorage.getItem('app-state-v2'), localStorage.getItem('app-state')];
        const values = await new Promise((resolve, reject) => {
          const req = indexedDB.open('pokerogue-command-center', 2);
          req.onsuccess = () => {
            const db = req.result; const tx = db.transaction('state'); const store = tx.objectStore('state');
            const current = store.get('app-state-v2'); const legacy = store.get('app-state');
            tx.oncomplete = () => { db.close(); resolve([current.result ?? null, legacy.result ?? null]); };
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        });
        return { local, values };
      });
      const before = await stored();
      await page.reload();
      const recovery = page.getByRole('heading', { name: 'Local data needs recovery' });
      await recovery.waitFor();
      await page.waitForTimeout(200);
      assert.deepEqual(await stored(), before, fixture.name + ': startup overwrote stored data');
      await page.getByRole('button', { name: 'Retry loading', exact: true }).click();
      await recovery.waitFor();
      assert.deepEqual(await stored(), before, fixture.name + ': retry overwrote stored data');
      await page.reload();
      await recovery.waitFor();
      assert.deepEqual(await stored(), before, fixture.name + ': reload overwrote stored data');
      page.once('dialog', dialog => dialog.dismiss());
      await page.getByRole('button', { name: 'Reset local account…', exact: true }).click();
      assert.deepEqual(await stored(), before, fixture.name + ': cancelled reset changed data');
      assert.ok(await recovery.isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, 'Recovery overflow at ' + width);
      if (fixture.name === cases[0].name) {
        await page.waitForTimeout(3800);
        assert.ok(await recovery.isVisible(), 'Recovery must persist beyond toast expiry');
        await page.getByRole('button', { name: 'Retry loading', exact: true }).focus();
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Reset local account…');
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Retry loading');
        if (process.env.ROGUE_RECOVERY_SCREENSHOTS) {
          await page.screenshot({ path: process.env.ROGUE_RECOVERY_SCREENSHOTS + '/recovery-' + width + '.png' });
        }
      }
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Reset local account…', exact: true }).click();
      await page.getByRole('button', { name: /Try sample view/i }).waitFor();
      await page.getByRole('button', { name: /Try sample view/i }).click();
      await page.locator('.hero-grid .kpi').first().waitFor();
      await page.reload();
      await page.locator('.hero-grid .kpi').first().waitFor();
      assert.deepEqual(errors, [], 'Unexpected client errors: ' + fixture.name);
      await context.close();
    }
  }

  // Transient IndexedDB errors must not silently enable fallback autosave.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.recoveryOriginalOpen = indexedDB.open;
    indexedDB.open = () => {
      const request = { error: new Error('Synthetic IndexedDB unavailable') };
      setTimeout(() => request.onerror?.(), 0);
      return request;
    };
  });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Local data needs recovery' }).waitFor();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset local account…', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Reset could not finish' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('app-state-v2')), null);
  await page.evaluate(() => { indexedDB.open = window.recoveryOriginalOpen; });
  await page.getByRole('button', { name: 'Retry loading', exact: true }).click();
  await page.getByRole('button', { name: /Try sample view/i }).waitFor();
  await context.close();
  console.log('PASS: Real React startup effects preserve rejected bytes, retry/reload/cancel/reset, keyboard and 320/390/1330px recovery layouts');
}

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

/** Reference integration; isolated synthetic fixtures, no user account facts. */
export async function checkDexReference(browser,base,captures) {
  if(captures)await mkdir(captures,{recursive:true});
  for(const [width,height] of [[320,720],[390,844],[1100,390],[1600,900]])for(const theme of ['light','dark']) {
    const context=await browser.newContext({viewport:{width,height},colorScheme:theme});
    const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Try sample view/}).waitFor();
    await page.evaluate(async()=>{
      const {buildDemoState}=await import('/src/pokerogue.ts');const {saveState}=await import('/src/store.ts');
      const state=buildDemoState();state.current.pokemon=[{...state.current.pokemon[0],id:4,name:'Charmander',unlocked:true,haUnlocked:false,passiveUnlocked:true,passiveEnabled:false,eggCount:0,egg1:false,egg2:false,egg3:false,egg4:false,t1:false,t2:false,t3:false,luck:0,visual:{...state.current.pokemon[0].visual,shinyTier:0},
        source:{caughtAttr:'128',seenAttr:'128',natureAttr:'0',abilityMask:1,passiveMask:1,eggMoveMask:0}}];
      await saveState(state);
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator(width>=980?'.desktop-sidebar':'.bottom-nav').getByRole('button',{name:'Dex',exact:true}).click();
    const button=name=>page.getByRole('button',{name,exact:true});
    const search=page.getByRole('textbox',{name:'Search Pokémon or collection gaps'});
    await search.fill('Bitter Blade');await page.getByText('No matches',{exact:true}).waitFor();
    await button('All Pokémon').click();
    const charmander=page.locator('[data-pokemon-id="4"]');await charmander.waitFor();assert.match(await charmander.innerText(),/Locked move: Bitter Blade/);
    await charmander.click();
    const options=page.getByRole('region',{name:'Standard starter options'});await options.waitFor();
    assert.match(await options.innerText(),/Bitter Blade[\s\S]*locked/);assert.match(await options.innerText(),/Enabled: no/);
    assert.match(await page.getByRole('region',{name:'Game reference'}).innerText(),/Base stat total: 309/);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Detail overflow');
    assert.ok(await page.locator('.hero-copy h2').evaluate(el=>el.scrollWidth<=el.clientWidth),'Clipped detail title');
    if(captures)await page.screenshot({path:`${captures}/starter-${width}-${theme}.png`,fullPage:true});
    await button('Back to Pokédex').click();assert.equal(await search.inputValue(),'Bitter Blade');
    await search.fill('Garchomp');const evolved=page.locator('[data-pokemon-id="445"]');await evolved.waitFor();
    await evolved.click();await page.getByRole('heading',{name:'Garchomp',exact:true}).waitFor();
    assert.equal(await page.getByRole('heading',{name:'Account completion'}).count(),0);
    await page.getByLabel('Reference form').selectOption('1');
    assert.match(await page.getByRole('region',{name:'Game reference'}).innerText(),/Base stat total: 700/);
    if(captures)await page.screenshot({path:`${captures}/evolved-${width}-${theme}.png`,fullPage:true});
    await button('Gible').click();await page.getByRole('heading',{name:'Gible',exact:true}).waitFor();
    assert.match(await page.getByRole('region',{name:'Standard starter options'}).innerText(),/Ownership unknown/i);
    await button('Back to Pokédex').click();assert.equal(await search.inputValue(),'Garchomp');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-pokemon-id')),'445');
    await button('Clear all').click();await button('Filters').click();
    const filters=page.getByRole('dialog',{name:'Filters'});
    await filters.getByRole('checkbox',{name:'Fire',exact:true}).check();await filters.getByRole('checkbox',{name:'Gen 1',exact:true}).check();
    await filters.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await button('Remove type Fire').count(),0);
    await button('Filters').click();await filters.getByRole('checkbox',{name:'Fire',exact:true}).check();await filters.getByRole('checkbox',{name:'Gen 1',exact:true}).check();
    await filters.getByRole('button',{name:'Apply',exact:true}).click();await button('Remove type Fire').waitFor();await button('Remove generation 1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Filtered grid overflow');
    if(captures)await page.screenshot({path:`${captures}/filters-${width}-${theme}.png`});
    await button('Sort').click();await page.getByLabel('Sort by',{exact:true}).selectOption('baseStatTotal');await page.getByLabel('Direction',{exact:true}).selectOption('desc');
    await page.getByRole('dialog').getByRole('button',{name:'Apply',exact:true}).click();assert.match(await page.locator('.result-meta').innerText(),/Base stat total · Descending/);
    assert.deepEqual(errors,[]);console.log(`PASS: reference ${width}x${height} ${theme}, options/unknown/forms/roots/filters/stat-sort/return`);await context.close();
  }
}

if(process.argv[1] && import.meta.url===(await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const {chromium}=await import('playwright');
  const {checkDex}=await import('./check-dex.mjs');
  const browser=await chromium.launch({headless:true});
  try {
    const base=process.env.ROGUE_PLUS_BASE_URL || 'http://127.0.0.1:4174/';
    await checkDex(browser,base);
    await checkDexReference(browser,base);
  } finally {await browser.close();}
}

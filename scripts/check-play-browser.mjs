// Headless browser integration test against the isolated deployed Alpha preview.
// Does not log in, write a game save, or use private user data.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base=process.env.ROGUE_PLUS_PREVIEW_URL || 'https://alpha-play-integration-rogue-plus.gagedush-bff.workers.dev';
const browser=await chromium.launch({
  headless:true,
  args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
// Playwright's open-source Chromium build lacks some H.264 codec declarations.
// Shim capability detection for boot QA only; real browsers use native support.
await page.addInitScript(() => {
 const original = HTMLMediaElement.prototype.canPlayType;
 HTMLMediaElement.prototype.canPlayType = function(type) {
   if (type.includes('video/mp4') || type.includes('video/x-m4v')) return 'probably';
   return original.call(this,type);
 };
});
const errors=[];
const badResponses=[];
page.on('pageerror',e=>errors.push((e.stack || e.message).slice(0,4000)));
page.on('console',m=>{if(m.type()==='error') console.log('BROWSER CONSOLE ERROR:',m.text().slice(0,400));});
page.on('requestfailed',q=>console.log('BROWSER FAILED REQUEST:',q.url(),q.failure()?.errorText));
page.on('response',r=>{if(r.status()>=400 && new URL(r.url()).origin===new URL(base).origin)badResponses.push([r.status(),r.url()]);});
try {
 await page.goto(base+'/play/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForSelector('canvas',{timeout:120000});
 await page.waitForSelector('button.rp-launch',{timeout:120000});
 await page.getByRole('button',{name:'Toggle Rogue+ Damage Preview'}).click();
 await page.getByRole('button',{name:'Refresh battle'}).waitFor({timeout:5000});
 const output=await page.locator('.rp-panel').innerText();
 if(!output.includes('Damage Preview'))throw new Error('Missing visible Damage Preview panel');
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/play-alpha-smoke.png',animations:'disabled'});
 console.log('PASS: Phaser canvas, Rogue+ extension button, toggle and module panel');
 console.log('GAME PANEL:',output.slice(0,400).replace(/\s+/g,' '));
 console.log('PAGE ERRORS:',JSON.stringify(errors.slice(0,15),null,2));
 console.log('FAILED SAME-ORIGIN REQUESTS:',JSON.stringify(badResponses.slice(0,20)));
 if(errors.length) throw new Error('Browser runtime errors: '+errors.slice(0,3).join(' | '));
 if(badResponses.length) throw new Error('Failed assets: '+JSON.stringify(badResponses.slice(0,5)));
} finally {
 await browser.close();
}

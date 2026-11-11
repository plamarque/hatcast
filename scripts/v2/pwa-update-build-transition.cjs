const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const dirs = process.argv.slice(2).map(p => path.resolve(p));
if (dirs.length !== 2) throw new Error('Provide two production browser build directories');
let current = 0;
const ids = dirs.map(d => JSON.parse(fs.readFileSync(path.join(d, 'ngsw.json'))).appData.hatcastBuildId);
const types = { '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.html':'text/html', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
const server = http.createServer((req,res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (p.startsWith('/api/')) {res.writeHead(401); return res.end('{}');}
  let f = path.join(dirs[current], p === '/' ? 'index.html' : p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    if (path.extname(p)) {res.writeHead(404); return res.end();}
    f = path.join(dirs[current], 'index.html');
  }
  res.setHeader('Content-Type',types[path.extname(f)] || 'application/octet-stream');
  res.setHeader('Cache-Control','no-cache'); fs.createReadStream(f).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await context.addInitScript(() => {
    window.__pwaConfirmed = false;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (this === sessionStorage && key === 'hatcast.showChangelogAfterReload' && value === '1') window.__pwaConfirmed = true;
      return original.call(this, key, value);
    };
  });
  const page=await context.newPage();
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>navigator.serviceWorker.controller !== null, null, {timeout:60000});
  const second = await context.newPage();
  // Simulate a tab that missed VERSION_READY while preserving real worker and cache events.
  await second.addInitScript(() => {
    const worker = navigator.serviceWorker;
    const add = worker.addEventListener.bind(worker);
    worker.addEventListener = (type, listener, options) => {
      if (type !== 'message' || typeof listener !== 'function') return add(type, listener, options);
      return add(type, (event) => { if (event.data?.type !== 'VERSION_READY') listener.call(worker, event); }, options);
    };
  });
  await second.goto(origin,{waitUntil:'domcontentloaded'});
  await second.waitForFunction(()=>navigator.serviceWorker.controller !== null, null, {timeout:60000});
  await page.waitForTimeout(1500);
  current=1;
  await context.setOffline(true);
  await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({action:'CHECK_FOR_UPDATES',nonce:992}));
  await page.waitForTimeout(2000);
  if (await page.locator('[data-testid="pwa-update-banner-apply"]').count()) throw new Error('Update offered while offline before version was ready');
  await context.setOffline(false);
  await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({action:'CHECK_FOR_UPDATES',nonce:993}));
  await page.locator('[data-testid="pwa-update-banner-apply"]').waitFor({timeout:60000});
  const before=await page.locator('app-pwa-update-banner').innerText();
  if (process.env.PWA_SCREENSHOT) await page.screenshot({path:process.env.PWA_SCREENSHOT});
  if (await second.locator('[data-testid="pwa-update-banner-apply"]').count()) throw new Error('Second tab should have missed VERSION_READY');
  await second.evaluate(() => { history.pushState({}, '', '/?pwa-check=1'); dispatchEvent(new PopStateEvent('popstate')); });
  await second.locator('[data-testid="pwa-update-banner-apply"]').waitFor({timeout:60000});
  if (process.env.PWA_TEST_STORAGE_DENIED) {
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (this === sessionStorage && key === 'hatcast.pwa.pending-update.v1') throw new Error('Storage denied');
        return original.call(this, key, value);
      };
    });
    await page.locator('[data-testid="pwa-update-banner-apply"]').click();
    await page.getByText('La mise à jour ne pourra pas être vérifiée sur cet appareil. Tu peux recharger quand même.').waitFor();
    if (process.env.PWA_WARNING_SCREENSHOT) await page.screenshot({path:process.env.PWA_WARNING_SCREENSHOT});
  }
  await page.locator('[data-testid="pwa-update-banner-apply"]').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  const result=await page.evaluate(()=>({confirmed:window.__pwaConfirmed,pending:sessionStorage.getItem('hatcast.pwa.pending-update.v1'),banner:document.querySelector('app-pwa-update-banner')?.textContent, scripts:Array.from(document.scripts).map(s=>s.src)}));
  const fromB=result.scripts.some(s=>s.includes(fs.readFileSync(path.join(dirs[1],'index.html'),'utf8').match(/main-[\w]+\.js/)?.[0]));
  await second.locator('[data-testid="pwa-update-banner-apply"]').click();
  await second.waitForLoadState('domcontentloaded');
  await second.waitForTimeout(1000);
  const secondResult=await second.evaluate(()=>({confirmed:window.__pwaConfirmed,pending:sessionStorage.getItem('hatcast.pwa.pending-update.v1'),banner:document.querySelector('app-pwa-update-banner')?.textContent, scripts:Array.from(document.scripts).map(s=>s.src)}));
  const secondFromB=secondResult.scripts.some(s=>s.includes(fs.readFileSync(path.join(dirs[1],'index.html'),'utf8').match(/main-[\w]+\.js/)?.[0]));
  console.log(JSON.stringify({ids,before,result,fromB,secondResult,secondFromB},null,2));
  if (!fromB || !secondFromB || (process.env.PWA_TEST_STORAGE_DENIED ? result.confirmed : !result.confirmed) || !secondResult.confirmed || result.pending || secondResult.pending || result.banner?.includes('Impossible de confirmer') || secondResult.banner?.includes('Impossible de confirmer') || result.banner?.includes('pas pu être appliquée') || secondResult.banner?.includes('pas pu être appliquée')) process.exitCode=1;
  await browser.close(); server.close();
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

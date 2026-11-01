// Tests the built Angular worker against a synthetic private API, never a real backend.
const { createServer } = require('node:http')
const { readFile } = require('node:fs/promises')
const { resolve, extname, join } = require('node:path')
const { chromium } = require('@playwright/test')
const assert = require('node:assert/strict')

;(async () => {
  const root = resolve(process.env.ADVENT_WORKER_BUILD ?? 'dist/web/browser')
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json' }
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/v1/advent/')) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' })
      return res.end(JSON.stringify({ identity: req.headers['x-fixture-identity'] || 'anonymous' }))
    }
    const file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '')
    const target = resolve(root, file)
    if (!target.startsWith(root + '/')) { res.writeHead(400); return res.end() }
    try { const data = await readFile(target); res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream' }); res.end(data) }
    catch { res.writeHead(404); res.end() }
  })
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject))
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`http://127.0.0.1:${server.address().port}/`)
    await page.evaluate(async () => { await navigator.serviceWorker.register('/ngsw-worker.js'); await navigator.serviceWorker.ready })
    await page.reload()
    assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'worker must control the page')
    for (const identity of ['first', 'second']) {
      const result = await page.evaluate(async identity => {
        const r = await fetch('/v1/advent/doors/23/result', { headers: { 'X-Advent-Preview': 'true', 'X-Fixture-Identity': identity }, cache: 'no-store' })
        return { body: await r.json(), cache: r.headers.get('Cache-Control') }
      }, identity)
      assert.equal(result.body.identity, identity)
      assert.match(result.cache, /no-store/)
    }
    const cached = await page.evaluate(async () => {
      const paths = []
      for (const key of await caches.keys()) for (const request of await (await caches.open(key)).keys()) {
        if (new URL(request.url).pathname.startsWith('/v1/advent/')) paths.push(request.url)
      }
      return paths
    })
    assert.deepEqual(cached, [])
    await context.setOffline(true)
    const offline = await page.evaluate(() => fetch('/v1/advent/doors/23/result', { headers: { 'X-Advent-Preview': 'true' } }).then(r => ({ ok: r.ok, status: r.status }), () => ({ ok: false, status: 0 })))
    assert.equal(offline.ok, false, `offline preview must not return cached data (status ${offline.status})`)
    await context.close()
    console.log('PASS: active worker does not cache preview data or reuse it across accounts')
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
})().catch(error => { console.error(error); process.exitCode = 1 })

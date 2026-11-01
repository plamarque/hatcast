// Real PostHog SDK and synthetic content only; all traffic stays on this local server.
const { createServer } = require('node:http')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { gunzipSync } = require('node:zlib')
const { build } = require('esbuild')
const { chromium } = require('@playwright/test')
const assert = require('node:assert/strict')

;(async () => {
  const root = resolve(__dirname, '../../../..')
  const bundled = await build({ stdin: { contents: `import { initPostHogBrowser } from './apps/web/src/app/core/analytics/posthog-browser.client'; import posthog from 'posthog-js'; window.startFixture = async () => { await initPostHogBrowser({apiKey:'fixture',apiHost:location.origin,uiHost:location.origin}); window.ph = posthog; posthog.startSessionRecording({force:true}); posthog.capture('fixture_control'); };`, resolveDir: root, loader: 'ts' }, bundle: true, write: false, format: 'iife', platform: 'browser' })
  const template = readFileSync(resolve(root, 'apps/web/src/app/pages/advent-test/advent-test.html'), 'utf8')
  const rootClass = /<main\s+class="([^"]+)"/.exec(template)?.[1]
  assert(rootClass, 'Advent root class must be present')
  const received = []
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(`<html><body><button id="public">Public control</button><main class="${rootClass}"><button id="private">CHOICE_SYNTHETIC_SECRET</button><p>EXPLANATION_SYNTHETIC_SECRET RESULT_SYNTHETIC_SECRET</p></main><script src="/fixture.js"></script></body></html>`) }
    if (url.pathname === '/fixture.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(bundled.outputFiles[0].contents) }
    if (/recorder.*\.js$/.test(url.pathname)) { res.setHeader('Content-Type', 'text/javascript'); return res.end(readFileSync(require.resolve('posthog-js/dist/' + url.pathname.split('/').pop()))) }
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      let body = Buffer.concat(chunks)
      if (req.headers['content-encoding'] === 'gzip' || (body[0] === 0x1f && body[1] === 0x8b)) body = gunzipSync(body)
      received.push({ path: url.pathname, body: body.toString(), query: url.search })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ autocapture_opt_out: false, sessionRecording: { endpoint: '/s/' }, config: { enable_collect_everything: true }, featureFlags: {} }))
    })
  })
  await new Promise((ok, fail) => server.listen(0, '127.0.0.1', ok).once('error', fail))
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' })
    await page.route('**/*', route => new URL(route.request().url()).origin === `http://127.0.0.1:${server.address().port}` ? route.continue() : route.abort())
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); Object.defineProperty(navigator, 'userAgentData', { get: () => undefined }) })
    await page.goto(`http://127.0.0.1:${server.address().port}/`)
    await page.evaluate(() => window.startFixture())
    await page.waitForTimeout(3000)
    await page.click('#public')
    await page.click('#private')
    await page.waitForTimeout(8000)
    const decoded = received.map(({path, body, query}) => {
      const params = new URLSearchParams(body)
      const data = params.get('data')
      if (data) {
        let payload = Buffer.from(data, 'base64')
        if (payload[0] === 0x1f && payload[1] === 0x8b) payload = gunzipSync(payload)
        body += payload.toString('utf8')
      }
      return `${path} ${query} ${body}`
    }).join('\n')
    assert.match(decoded, /\$autocapture/, 'real autocapture request must be observed')
    assert.match(decoded, /\$snapshot/, 'real replay snapshot request must be observed')
    const snapshots = received.flatMap(({ body }) => {
      try {
        const events = JSON.parse(body)
        return Array.isArray(events) ? events.filter(event => event.event === '$snapshot').flatMap(event => event.properties.$snapshot_data) : []
      } catch { return [] }
    })
    const replay = snapshots.map(snapshot => {
      if (typeof snapshot.data !== 'string') return JSON.stringify(snapshot)
      const bytes = Buffer.from(snapshot.data, 'latin1')
      return bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes).toString('utf8') : snapshot.data
    }).join('\n')
    assert(replay.includes('Public control'), 'decoded replay must contain the public control')
    for (const secret of ['CHOICE_SYNTHETIC_SECRET', 'EXPLANATION_SYNTHETIC_SECRET', 'RESULT_SYNTHETIC_SECRET']) assert(!replay.includes(secret), `${secret} leaked to replay`)
    for (const secret of ['CHOICE_SYNTHETIC_SECRET', 'EXPLANATION_SYNTHETIC_SECRET', 'RESULT_SYNTHETIC_SECRET']) assert(!decoded.includes(secret), `${secret} leaked to analytics`)
    console.log('PASS: real PostHog autocapture and replay omit synthetic Advent content')
  } finally { await browser.close(); await new Promise(ok => server.close(ok)) }
})().catch(error => { console.error(error); process.exitCode = 1 })

// Isolated offline test only. Requires the seeded test API on 8080 and the
// production-local build served on localhost:4322 with a test proxy mapping
// Origin 4322 to the documented 4200 offline origin. This resets test state.
const { chromium } = require('@playwright/test')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 320, height: 720 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const base = 'https://localhost:4322'
  async function login(email, password) {
    await page.goto(`${base}/connexion`)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Mot de passe', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL(url => !url.pathname.includes('connexion'), { timeout: 30000 })
  }
  async function api(path, method = 'GET', simulated = null) {
    return page.evaluate(async ({ path, method, simulated }) => {
      const sessionResponse = await fetch('/v1/advent/session', { cache: 'no-store' })
      if (!sessionResponse.ok) return { status: sessionResponse.status }
      const session = await sessionResponse.json()
      const csrf = document.cookie.split('; ').find(x => x.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
      const response = await fetch(path, { method, cache: 'no-store', headers: { 'X-Advent-Test-Session': session.sessionId, ...(simulated ? { 'X-Advent-Simulated-Date': simulated } : {}), ...(csrf ? { 'X-XSRF-TOKEN': decodeURIComponent(csrf) } : {}) } })
      return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json().catch(() => null) }
    }, { path, method, simulated })
  }
  await page.goto(base)
  await page.evaluate(async () => {
    await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker not ready')), 45000))])
  })
  await page.reload()
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'worker must control page')
  await login('patrice@seed.improbots.test', 'patricep')
  assert.equal((await api('/v1/advent/session/reset', 'POST')).status, 200)
  await page.goto(`${base}/avent`)
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click()
  await page.getByRole('radio').first().focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await page.getByText('Ta réponse', { exact: false }).first().waitFor()
  const pending = await api('/v1/advent/doors/1/result')
  assert.equal(pending.status, 404); assert.match(pending.cache, /no-store/)
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).focus()
  await page.keyboard.press('Enter')
  const title = page.getByRole('heading', { name: 'Bravo, tu as trouvé !' })
  await title.waitFor()
  await page.waitForFunction(() => document.activeElement?.id === 'advent-result-title')
  assert.equal(await page.locator('.advent__confetti').evaluate(el => getComputedStyle(el).animationName), 'none')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  const accessibility = await page.locator('.advent__reveal p').first().evaluate(el => {
    const luminance = color => {
      const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(x => { x /= 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 })
      return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
    }
    const foreground = getComputedStyle(el).color
    let node = el
    let background = 'rgba(0, 0, 0, 0)'
    while (node) {
      const candidate = getComputedStyle(node).backgroundColor
      if (!candidate.startsWith('rgba') || !candidate.endsWith(', 0)')) { background = candidate; break }
      node = node.parentElement
    }
    const a = luminance(foreground), b = luminance(background)
    return { ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
  })
  assert.ok(accessibility.ratio >= 4.5, `reveal text contrast: ${accessibility.ratio}`)
  for (const control of await page.locator('.advent__reveal button').all()) {
    const box = await control.boundingBox()
    assert.ok(box && box.width >= 44 && box.height >= 44, 'reveal controls must be at least 44px')
  }

  const result = await api('/v1/advent/doors/1/result', 'GET', '2026-12-02')
  assert.equal(result.status, 200); assert.match(result.cache, /no-store/)
  const sessionId = await page.evaluate(async () => (await (await fetch('/v1/advent/session', { cache: 'no-store' })).json()).sessionId)
  await context.setOffline(true)
  const offline = await page.evaluate(async sessionId => {
    try {
      const response = await fetch('/v1/advent/doors/1/result', { cache: 'no-store', headers: { 'X-Advent-Test-Session': sessionId } })
      const body = await response.text()
      return { status: response.status, type: response.headers.get('content-type'), containsResult: /selectedChoice|falseChoice|responsePoints|participationPoints|bonusPoints|totalPoints|answerId/.test(body) }
    } catch { return { status: 0, type: null, containsResult: false } }
  }, sessionId)
  console.log(`Offline response: status=${offline.status}, content-type=${offline.type ?? 'none'}, result fields=${offline.containsResult}`)
  assert.ok(offline.status === 0 || offline.status >= 400, 'offline must not return a successful response')
  assert.equal(offline.containsResult, false, 'offline response must not contain result fields')
  await context.setOffline(false)
  const sensitiveEntries = await page.evaluate(async () => {
    const found = []
    for (const name of await caches.keys()) {
      const cache = await caches.open(name)
      for (const request of await cache.keys()) if (new URL(request.url).pathname.startsWith('/v1/advent/')) found.push(request.url)
    }
    return found.length
  })
  assert.equal(sensitiveEntries, 0)
  await page.goto(`${base}/compte`)
  const dismiss = page.locator('.pwa-system-banner__dismiss')
  for (let i = 0; i < 3 && await dismiss.first().isVisible(); i++) {
    try { await dismiss.first().click({ timeout: 2000 }) }
    catch (error) { if (await dismiss.first().isVisible()) throw error }
  }
  await page.getByTestId('account-logout').click()
  await login('charlene@seed.improbots.test', 'charlene')
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true)
  const other = await api('/v1/advent/doors/1/result')
  assert.equal(other.status, 404); assert.match(other.cache, /no-store/)
  const latest = await api('/v1/advent/results/latest-unseen')
  assert.equal(latest.status, 200); assert.equal(latest.body.result, null); assert.match(latest.cache, /no-store/)
  console.log('PASS: worker actif, no-store, aucun cache Avent, indisponible hors ligne, changement de compte, focus et mouvement réduit')
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })

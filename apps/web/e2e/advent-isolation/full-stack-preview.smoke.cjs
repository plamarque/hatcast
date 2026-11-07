// The e2e-profile stack and its in-memory synthetic data only.
const { chromium } = require('@playwright/test')
const assert = require('node:assert/strict')
const base = 'http://127.0.0.1:14331'
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.route('https://accounts.google.com/**', route => route.abort())
  async function login(token) {
    // End requests from the previous document before replacing its session cookie.
    await page.goto('about:blank')
    const r = await page.request.post(`${base}/v1/auth/google`, { data: { idToken: token, rememberMe: true } })
    assert.equal(r.status(), 200, `synthetic sign-in ${token}`)
    const expected = { 'e2e-member': 'd0000001-0000-4000-8000-000000000001', 'advent-preview-one': 'd0000001-0000-4000-8000-000000000022', 'advent-preview-two': 'd0000001-0000-4000-8000-000000000003' }
    const me = await page.request.get(`${base}/v1/auth/me`)
    assert.equal(me.status(), 200, 'new session must be available before navigation')
    assert.equal((await me.json()).user.id, expected[token], 'new session must belong to the requested identity')
  }
  async function api(path, preview = false) {
    return page.evaluate(async ({ path, preview }) => {
      const session = await (await fetch('/v1/advent/session', { cache: 'no-store' })).json()
      const r = await fetch(path, { cache: 'no-store', headers: { 'X-Advent-Test-Session': session.sessionId, ...(preview ? { 'X-Advent-Preview': 'true' } : {}) } })
      return { status: r.status, cache: r.headers.get('Cache-Control'), body: await r.json().catch(() => null) }
    }, { path, preview })
  }
  async function mutate(path, body = {}) {
    return page.evaluate(async ({ path, body }) => {
      const session = await (await fetch('/v1/advent/session', { cache: 'no-store' })).json()
      const csrf = document.cookie.split('; ').find(part => part.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
      const r = await fetch(path, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-Advent-Test-Session': session.sessionId, 'X-Advent-Preview': 'true', ...(csrf ? { 'X-XSRF-TOKEN': decodeURIComponent(csrf) } : {}) }, body: JSON.stringify(body) })
      return r.status
    }, { path, body })
  }
  async function openPreview() {
    await page.goto(`${base}/avent?preview=1`)
    const welcome = page.getByRole('button', { name: /Commencer à jouer/i })
    const calendar = page.locator('.advent__calendar-door').first()
    try { await welcome.or(calendar).first().waitFor({ state: 'visible', timeout: 12000 }) } catch (error) {
      console.error('Preview session:', JSON.stringify(await page.evaluate(async () => (await fetch('/v1/advent/session', { cache: 'no-store' })).json())))
      console.error('Preview page:', (await page.locator('body').innerText()).slice(0, 800))
      throw error
    }
    assert.equal(await page.getByText('Prévisualisation privée : tu peux effacer ta réponse pour rejouer.').count(), 0)
    if (await welcome.isVisible()) await welcome.click()
  }
  async function answer(day, explanation) {
    const gift = page.locator(`.advent__calendar-door[data-day="${day}"]`)
    try { await gift.waitFor({ timeout: 10000 }) } catch (error) {
      console.error('Synthetic preview page:', (await page.locator('main.advent').innerText()).slice(0, 800))
      throw error
    }
    await gift.focus(); await page.keyboard.press('Enter')
    await page.getByRole('button', { name: `Ouvrir le cadeau du jour ${day}` }).click()
    await page.getByRole('radio').nth(1).check()
    await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
    await page.getByText(explanation).waitFor()
    await page.getByText('Prévisualisation privée : tu peux effacer ta réponse pour rejouer.').waitFor()
  }
  try {
    const guard = await page.request.get(`${base}/v1/e2e/fixtures/advent-preview-guard`, { headers: { 'X-Hatcast-E2E-Key': 'e2e-fixtures-secret' } })
    assert.equal(guard.status(), 200, 'isolated e2e guard required')
    assert.equal((await guard.json()).environment, 'advent-e2e-memory')
    await login('e2e-member')
    if (process.env.ADVENT_SMOKE_BOUNDARY === 'transition') await page.clock.install()
    await page.goto(`${base}/accueil`)
    if (process.env.ADVENT_SMOKE_BOUNDARY === 'transition') {
      assert.equal((await api('/v1/advent/entry')).status, 404)
      assert.equal(await page.locator('#advent-entry-mobile, #advent-entry-desktop').count(), 0)
      const advance = await page.request.post(`${base}/v1/e2e/fixtures/advent-preview-guard/open`, { headers: { 'X-Hatcast-E2E-Key': 'e2e-fixtures-secret' } })
      assert.equal(advance.status(), 200)
      await page.clock.fastForward(60_000)
      await page.getByRole('button', { name: /Commencer à jouer/i }).waitFor()
      console.log('PASS: stationary page opens at the server boundary')
      return
    }
    if (process.env.ADVENT_SMOKE_BOUNDARY === 'after') {
      assert.equal((await api('/v1/advent/entry')).status, 200)
      await page.getByRole('button', { name: /Commencer à jouer/i }).waitFor()
      console.log('PASS: ordinary entry opens at Paris midnight')
      return
    }
    assert.equal((await api('/v1/advent/entry')).status, 404)
    assert.equal((await api('/v1/advent/doors/23', true)).status, 404)
    assert.equal(await page.locator('#advent-entry-mobile, #advent-entry-desktop').count(), 0)
    assert.equal(await page.getByText(/quiz de l’avent|calendrier de l’avent/i).count(), 0)
    await page.evaluate(async () => {
      await navigator.serviceWorker.register('/ngsw-worker.js')
      await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Worker not ready')), 45000))])
    })
    await page.reload()
    assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true)
    await login('advent-preview-one')
    await openPreview(); await answer(23, 'Explication fictive vingt-trois')
    const own = await api('/v1/advent/doors/23/result', true)
    assert.equal(own.status, 200); assert.equal(own.body.selectedChoice, 1); assert.match(own.cache, /no-store/)
    assert.equal(await mutate('/v1/advent/session/reset'), 404)
    await page.getByRole('button', { name: 'Actions de prévisualisation' }).click()
    await page.getByRole('menuitem', { name: 'Effacer ma réponse et rejouer' }).click()
    await page.getByRole('button', { name: 'Effacer ma réponse', exact: true }).click()
    await page.getByRole('radio').nth(1).check()
    await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
    await page.getByText('Explication fictive vingt-trois').waitFor()
    await page.reload()
    const explanation = page.getByText('Explication fictive vingt-trois')
    const savedGift = page.locator('.advent__calendar-door[data-day="23"]')
    await explanation.or(savedGift).first().waitFor({ state: 'visible' })
    if (!(await explanation.isVisible())) {
      await page.locator('.advent__calendar-door[data-day="23"]').click()
      await explanation.waitFor()
    }
    await page.getByText('Prévisualisation privée : tu peux effacer ta réponse pour rejouer.').waitFor()
    await login('advent-preview-two')
    await openPreview()
    assert.equal((await api('/v1/advent/doors/23/result', true)).status, 404)
    await answer(7, 'Explication fictive sept')
    const second = await api('/v1/advent/doors/7/result', true)
    assert.equal(second.status, 200); assert.equal(second.body.selectedChoice, 1)
    await login('e2e-member'); await page.goto(`${base}/accueil`)
    assert.equal((await api('/v1/advent/doors/7', true)).status, 404)
    assert.equal((await api('/v1/advent/doors/7/result', true)).status, 404)
    await page.setViewportSize({ width: 1280, height: 800 }); await page.reload()
    assert.equal(await page.locator('#advent-entry-mobile, #advent-entry-desktop').count(), 0)
    const cached = await page.evaluate(async () => {
      const paths = []
      for (const key of await caches.keys()) for (const request of await (await caches.open(key)).keys()) {
        if (new URL(request.url).pathname.startsWith('/v1/advent/')) paths.push(request.url)
      }
      return paths
    })
    assert.deepEqual(cached, [])
    await context.setOffline(true)
    const offline = await page.evaluate(() => fetch('/v1/advent/doors/23/result', { headers: { 'X-Advent-Preview': 'true' } }).then(r => r.ok, () => false))
    assert.equal(offline, false)
    console.log('PASS: real API, synthetic identities, personal replay, account isolation and active worker')
  } finally { await context.close(); await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })

import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

// Normalized bounds correspond to the face and raised fist in the current assets.
// They are conservative visual landmarks, and must be revisited if artwork changes.
async function assertResultPortraitLayout(page: import('@playwright/test').Page, correct: boolean) {
  const portrait = page.locator('.advent__reveal-portrait')
  const title = page.locator('#advent-result-title')
  const art = page.locator('.advent__reveal-mood img')
  await expect(portrait).toBeVisible()
  await expect.poll(() => portrait.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  const [p, t, a] = await Promise.all([portrait.boundingBox(), title.boundingBox(), art.boundingBox()])
  expect(p).not.toBeNull(); expect(t).not.toBeNull(); expect(a).not.toBeNull()
  if (!p || !t || !a) throw new Error('Missing result layout bounds')
  const overlaps = (x: {x: number, y: number, width: number, height: number}, y: {x: number, y: number, width: number, height: number}) =>
    x.x < y.x + y.width && y.x < x.x + x.width && x.y < y.y + y.height && y.y < x.y + x.height
  const region = (left: number, top: number, right: number, bottom: number) => ({
    x: a.x + a.width * left, y: a.y + a.height * top, width: a.width * (right - left), height: a.height * (bottom - top),
  })
  expect(overlaps(p, t), 'portrait overlaps heading').toBe(false)
  expect(overlaps(p, correct ? region(.36, .20, .73, .59) : region(.40, .24, .75, .61)), 'portrait overlaps elf face').toBe(false)
  if (correct) expect(overlaps(p, region(.80, .07, 1, .32)), 'portrait overlaps raised fist').toBe(false)
}

test('member confirmation and ranking remain neutral and accessible', async ({ page, context }, testInfo) => {
  await context.grantPermissions([])
  await page.setViewportSize({ width: 320, height: 700 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requests: string[] = []
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    requests.push(path)
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fictif', slug: 'test', displayName: 'Fictif', email: 'fictif@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/reminder-preference') return route.fulfill({ json: { enabled: false } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Lutin fictif', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['Première affirmation fictive.', 'Deuxième affirmation fictive.', 'Troisième affirmation fictive.'] } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'generation' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: route.request().method() === 'POST' ? 'recorded' : 'available' } })
    if (path === '/v1/advent/ranking') return route.fulfill({ json: { priorityResult: null, ranking: { score: 0, rank: 2, entries: [{ name: 'Fictif', score: 0, rank: 2, mine: true }, { name: 'Camille', score: 0, rank: 2, mine: false }] } } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  const gift = page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })
  await expect(gift).toBeVisible()
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await expect(page.getByText('Mode test')).toHaveCount(0)
  await gift.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#quiz-title')).toBeFocused()
  await page.getByRole('radio').first().focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.locator('.advent__recorded')).not.toContainText(/bonne réponse|mauvaise réponse|points/i)
  await expect(page.locator('.advent__recorded-art img')).toHaveAttribute('src', '/advent/confirmation-scene-v2.png')
  await expect.poll(() => page.locator('.advent__recorded-art img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator('.advent__portrait-scene')).toHaveCount(0)
  const reminder = page.getByRole('checkbox', { name: 'Ne rate aucun quiz !' })
  await expect(reminder).toBeVisible()
  await expect(reminder).toHaveAccessibleDescription('On t’enverra un (et un seul) rappel à 10H chaque jour, si tu oublies de jouer.')
  await reminder.focus()
  await page.keyboard.press('Space')
  await expect(reminder).not.toBeChecked()
  await expect(page.locator('.advent__reminder')).toContainText('Autorise les alertes dans les réglages de ton navigateur')
  await expect(page.locator('.advent__reminder [role="alert"]')).toBeVisible()
  const legibility = await page.locator('.advent__reminder [role="alert"]').evaluate(element => {
    const text = element.firstChild!
    const start = text.textContent!.indexOf('navigateur')
    const range = document.createRange()
    range.setStart(text, start)
    range.setEnd(text, start + 'navigateur'.length)
    const luminance = (color: string) => {
      const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
    }
    const foreground = luminance(getComputedStyle(element).color)
    const background = luminance(getComputedStyle(element.parentElement!).backgroundColor)
    return { lines: range.getClientRects().length, contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) }
  })
  expect(legibility.lines).toBe(1)
  expect(legibility.contrast).toBeGreaterThanOrEqual(4.5)
  await page.locator('.advent__reminder').screenshot({ path: testInfo.outputPath('reminder-denied-320-enlarged.png'), animations: 'disabled' })
  for (const width of [320, 375, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 700 })
    const overflow = await page.locator('main.advent').evaluate(root => ({ client: root.clientWidth, scroll: root.scrollWidth }))
    expect(overflow.scroll, JSON.stringify({ width, ...overflow })).toBeLessThanOrEqual(overflow.client)
    const label = await page.locator('.advent__reminder-label').boundingBox()
    expect(label?.height).toBeGreaterThanOrEqual(44)
  }
  await page.getByRole('button', { name: 'Voir le classement' }).click()
  await expect(page.getByRole('heading', { name: 'Classement', exact: true })).toBeFocused()
  await expect(page.locator('.advent__ranking')).toContainText('Ton score actuel : 0 points')
  await expect(page.locator('.advent__ranking')).not.toContainText('Mode test')
  for (const width of [320, 375, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    const overflow = await page.locator('main.advent').evaluate(root => ({ client: root.clientWidth, scroll: root.scrollWidth, offenders: [...root.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > root.getBoundingClientRect().right + 1).map(el => ({ tag: el.tagName, className: String(el.className), right: Math.round(el.getBoundingClientRect().right) })).slice(0, 20) }))
    expect(overflow.scroll, JSON.stringify({ viewport: width, ...overflow })).toBeLessThanOrEqual(overflow.client)
  }
  expect(requests.every(path => !path.startsWith('/v1/advent-test/'))).toBe(true)
})

test('pending calendar revisit has its own sleeping elf and server countdown', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let recorded = false
  await page.route('**/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fiction', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01', effectiveInstant: '2026-12-01T12:00:00Z', nextMidnight: '2026-12-01T23:00:00Z', simulated: false } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/calendar') return route.fulfill({ json: { priorityResult: null, days: [{ day: 1, state: recorded ? 'played' : 'today', outcome: recorded ? 'pending' : null }] } })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Lutin fictif', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['Première affirmation fictive.', 'Deuxième affirmation fictive.', 'Troisième affirmation fictive.'] } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'generation' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer') && request.method() === 'POST') { recorded = true; return route.fulfill({ json: { status: 'recorded', late: false } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: recorded ? 'recorded' : 'available', late: false } })
    if (path.endsWith('/result')) return route.fulfill({ status: 404 })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.locator('.advent__recorded')).toContainText('est enregistrée')
  await expect(page.locator('.advent__waiting')).toHaveCount(0)
  await page.getByRole('button', { name: 'Voir le calendrier' }).click()
  await page.locator('.advent__calendar-door[data-day="1"]').click()
  const waiting = page.locator('.advent__waiting')
  await expect(waiting).toBeVisible()
  await expect(waiting.getByRole('heading', { name: 'Reviens demain !' })).toBeVisible()
  await expect(waiting).toContainText('Ton résultat sera disponible à minuit, heure de Paris.')
  await expect(page.locator('.advent__recorded')).toHaveCount(0)
  await expect(waiting).not.toContainText(/anecdote fausse|bonne réponse|points/i)
  await expect(waiting.locator('img')).toHaveAttribute('src', '/advent/elf-sleeping-v1.webp')
  await expect.poll(() => waiting.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  const timer = waiting.locator('.advent__waiting-clock')
  await expect(timer.locator('.advent__waiting-unit')).toHaveCount(3)
  await expect(timer.locator('.advent__waiting-number')).toHaveCount(3)
  await expect(timer).toHaveAttribute('aria-live', 'off')
  await expect(timer).toContainText(/heures.*minutes.*secondes/)
  const initial = await timer.textContent()
  await expect.poll(() => timer.textContent(), { timeout: 4000 }).not.toBe(initial)
  await expect(page.getByRole('button', { name: 'Voir le calendrier' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Classement', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Fermer le quiz' })).toBeEnabled()
  const assertNoHorizontalOverflow = async () => {
    const sizes = await page.locator('main.advent').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }))
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
  }
  await assertNoHorizontalOverflow()
  await page.screenshot({ path: testInfo.outputPath('waiting-320.png'), fullPage: true })
  // Simulate 200% page zoom with a 640px physical viewport, leaving 320 CSS pixels.
  await page.setViewportSize({ width: 640, height: 1200 })
  await page.evaluate(() => { document.documentElement.style.zoom = '2' })
  await expect(waiting).toBeVisible()
  await expect(timer).toBeVisible()
  await assertNoHorizontalOverflow()
  await page.screenshot({ path: testInfo.outputPath('waiting-zoom-200.png'), fullPage: true })
})

test('verified operator controls use the same Advent URL and member API', async ({ page }, testInfo) => {
  const date = '2026-12-01'
  const paths: string[] = []
  const replays: { date: string | undefined; body: unknown }[] = []
  let cleared = false
  let calendarLoaded = false
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    paths.push(path)
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'operator', slug: 'operator', displayName: 'Opérateur fictif', email: 'operator@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Opérateur fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/calendar') { calendarLoaded = true; return route.fulfill({ json: { priorityResult: null, days: [{ day: 1, state: cleared ? 'today' : 'played', outcome: cleared ? null : 'pending' }, { day: 25, state: 'locked' }] } }) }
    if (path === '/v1/advent/doors/1' || path === '/v1/advent/doors/2') return route.fulfill({ json: { day: Number(path.split('/').pop()), name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Une', 'Deux', 'Trois'] } })
    if (path.endsWith('/answer/replay')) { replays.push({ date: route.request().headers()['x-advent-simulated-date'], body: route.request().postDataJSON() }); cleared = true; return route.fulfill({ json: { status: 'cleared' } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: calendarLoaded && path.includes('/1/') ? { status: 'recorded', replayToken: 'own-token' } : { status: 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await expect(page).toHaveURL(/\/avent$/)
  await expect(page.getByText('Mode test')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })).toBeVisible()
  const toggle = page.getByRole('button', { name: 'Activer le mode test' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(toggle).toBeEnabled()
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Désactiver le mode test' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.advent__test-actions')).toBeVisible()
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(page.getByRole('status', { name: 'Jour simulé : 2 décembre' })).toBeVisible()
  expect(paths).not.toContain('/v1/advent/clock/next-day')
  expect(paths.every(path => !path.startsWith('/v1/advent-test/'))).toBe(true)
  await page.setViewportSize({ width: 320, height: 700 })
  const toolbarFits = await page.locator('.advent__test-actions').evaluate(el => {
    const bounds = el.getBoundingClientRect()
    return el.scrollWidth <= el.clientWidth && [...el.querySelectorAll('button')].every(button => {
      const rect = button.getBoundingClientRect()
      return rect.left >= bounds.left && rect.right <= bounds.right
    })
  })
  expect(toolbarFits).toBe(true)
  await page.getByRole('button', { name: 'Voir le calendrier' }).click()
  await expect(page.locator('.advent__test-actions').getByRole('button', { name: 'Revoir la confirmation de réponse' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await page.getByRole('menuitem', { name: 'Revoir la confirmation de réponse' }).click()
  await expect(page.locator('.advent__recorded')).toBeVisible()
  await page.getByRole('button', { name: 'Voir le calendrier' }).click()
  const close = page.getByRole('menuitem', { name: 'Refermer mon cadeau du jour et effacer ma réponse' })
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await expect(close).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('.advent__calendar-cell button')).toHaveCount(2)
  await expect(page.getByRole('button', { name: '25 décembre : Verrouillé' })).toBeDisabled()
  await page.getByRole('button', { name: 'Revenir au jour précédent' }).click()
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await expect(close).toBeEnabled()
  await close.focus()
  await expect.poll(async () => (await close.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44)
  const closeBox = await close.boundingBox()
  expect(closeBox!.width).toBeGreaterThanOrEqual(44)
  expect(closeBox!.height).toBeGreaterThanOrEqual(44)
  expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(320)
  await page.screenshot({ path: testInfo.outputPath('calendar-operator-focus-320.png') })
  await close.click()
  await expect(page.getByText('Ta réponse à ce cadeau sera effacée. Tu pourras rejouer.')).toBeVisible()
  await page.getByRole('button', { name: 'Effacer ma réponse', exact: true }).click()
  await expect.poll(() => replays).toEqual([{ date: '2026-12-01', body: { replayToken: 'own-token', close: true } }])
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await expect(close).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.screenshot({ path: testInfo.outputPath('calendar-operator-320.png') })
})

test('each operator tab simulates independently of the other operator and member', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'block', baseURL, ignoreHTTPSErrors: true })
  const pages = await Promise.all([context.newPage(), context.newPage(), context.newPage(), context.newPage()])
  const observed: { who: string; path: string; method: string; date?: string }[] = []
  for (const [index, page] of pages.entries()) {
    const who = ['patrice', 'antoine', 'membre', 'patrice'][index]
    await page.route('**/v1/**', async route => {
      const request = route.request(), path = new URL(request.url()).pathname
      observed.push({ who, path, method: request.method(), date: request.headers()['x-advent-simulated-date'] })
      if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: who, slug: who, displayName: who, email: `${who}@example.test`, avatarUrl: null }, platformAdmin: false } })
      if (path === '/v1/troupes') return route.fulfill({ json: [] })
      if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: who, preferredRoleKeys: [] } })
      if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: index !== 2, sessionId: 'shared-game' } })
      if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01' } })
      if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
      if (path.match(/\/doors\/\d+$/)) return route.fulfill({ json: { day: Number(path.split('/').pop()), name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] } })
      if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
      return route.fulfill({ json: {} })
    })
    await page.goto('/avent')
    await expect(page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })).toBeVisible()
  }
  for (const index of [0, 1, 3]) await pages[index].getByRole('button', { name: 'Activer le mode test' }).click()
  await pages[0].getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(pages[0].getByRole('status', { name: 'Jour simulé : 2 décembre' })).toBeVisible()
  await expect(pages[1].getByRole('status', { name: 'Jour simulé : 1 décembre' })).toBeVisible()
  await expect(pages[2].getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })).toBeVisible()
  await expect(pages[3].getByRole('status', { name: 'Jour simulé : 1 décembre' })).toBeVisible()
  expect(observed.some(x => x.who === 'patrice' && x.path.endsWith('/latest-unseen') && x.date === '2026-12-02')).toBe(true)
  expect(observed.filter(x => x.who === 'membre').every(x => !x.date)).toBe(true)
  expect(observed.filter(x => x.path.startsWith('/v1/advent/')).every(x => x.method === 'GET')).toBe(true)
  await context.close()
})

test('calendar remains legible at 320px and past unplayed content can be answered without points', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let lateRecorded = false
  const lateResult = { answerId: 'late', day: 1, selectedChoice: 0, falseChoice: 1, correct: false, responsePoints: 0, participationPoints: 0, bonusPoints: 0, totalPoints: 0, seen: true, late: true }
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fiction', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fiction' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-02' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/ranking') return route.fulfill({ json: { priorityResult: null, ranking: { score: 0, rank: 1, entries: [] } } })
    if (path === '/v1/advent/calendar') return route.fulfill({ json: { priorityResult: null, days: Array.from({ length: 25 }, (_, i) => ({ day: i + 1, state: i === 0 ? 'past-unplayed' : i === 1 ? 'today' : i >= 3 && i <= 5 ? 'played' : i === 6 ? 'missing' : i === 24 ? 'christmas' : 'locked', outcome: i === 3 ? 'pending' : i === 4 ? 'correct' : i === 5 ? 'incorrect' : null })) } })
    if (path === '/v1/advent/doors/1/history') return route.fulfill({ json: { priorityResult: null, quiz: { day: 1, name: 'Fiction', portrait: '/advent/elf-encouragement-v1.webp', statements: ['A', 'B', 'C'] }, falseChoice: null, result: lateRecorded ? lateResult : null } })
    if (path === '/v1/advent/doors/1/result') return route.fulfill({ json: lateResult })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Fiction', portrait: '/advent/elf-encouragement-v1.webp', statements: ['A', 'B', 'C'] } })
    if (path === '/v1/advent/doors/1/answer' && route.request().method() === 'POST') { lateRecorded = true; return route.fulfill({ json: { status: 'recorded', late: true } }) }
    if (path === '/v1/advent/doors/1/answer' && lateRecorded) return route.fulfill({ json: { status: 'recorded', late: true } })
    if (path === '/v1/advent/doors/2') return route.fulfill({ json: { day: 2, name: 'Fiction', portrait: '', statements: ['A', 'B', 'C'] } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'generation' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: route.request().method() === 'POST' ? 'recorded' : 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await expect(page.getByRole('tablist')).toHaveCount(0)
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 2' }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByRole('button', { name: 'Voir le calendrier' })).toBeVisible()
  await page.getByRole('button', { name: /Voir le classement/ }).click()
  await page.locator('.advent__ranking-action').getByRole('button', { name: 'Voir le calendrier' }).click()
  await expect(page.getByRole('heading', { name: 'Calendrier de l’Avent' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Classement', exact: true })).toBeVisible()
  const cells = page.locator('.advent__calendar button')
  await expect(cells).toHaveCount(25)
  for (const index of [0, 3]) {
    await expect.poll(() => cells.nth(index).locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
    expect((await cells.nth(index).locator('img').boundingBox())!.width).toBeGreaterThan(40)
  }
  await expect(cells.nth(2)).toBeDisabled()
  expect(await page.locator('.advent__calendar').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4)
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.locator('.advent__calendar').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4)
    const boxes = await cells.evaluateAll(elements => elements.map(el => {
      const rect = el.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    }))
    expect(boxes.every(box => box.width >= 48 && box.height >= 48)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`calendar-${width}.png`) })
  }
  await page.setViewportSize({ width: 320, height: 700 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/gift-open-v2.png?failure=1', route => route.abort())
  await cells.nth(3).locator('img').evaluate((el: HTMLImageElement) => { el.src = '/advent/gifts/gift-open-v2.png?failure=1' })
  await expect(cells.nth(3).locator('img')).toBeHidden()
  await expect(cells.nth(3).locator('.advent__gift-lid')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('calendar-fallback-reduced-motion.png') })
  await page.setViewportSize({ width: 320, height: 700 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await page.screenshot({ path: testInfo.outputPath('calendar-320-large-text.png') })
  const boxes = await cells.evaluateAll(elements => elements.slice(0, 4).map(el => {
    const rect = el.getBoundingClientRect()
    return { left: rect.left, right: rect.right }
  }))
  expect(boxes.every((box, index) => index === 0 || boxes[index - 1].right <= box.left)).toBe(true)
  await cells.nth(1).focus()
  await page.keyboard.press('Tab')
  await expect(cells.nth(3)).toBeFocused()
  const focusedVisible = await cells.nth(3).evaluate(el => {
    const button = el.getBoundingClientRect()
    const container = el.closest('.advent__calendar')!.getBoundingClientRect()
    return button.left >= container.left && button.right <= container.right && button.left >= 0 && button.right <= window.innerWidth
  })
  expect(focusedVisible).toBe(true)
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })
  await cells.first().click()
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click()
  await expect(page.getByText(/sans gagner de points/)).toBeVisible()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByText(/réponse après le jour du quiz/)).toBeVisible()
  await expect(page.locator('.advent__reveal-mood img')).toHaveAttribute('src', '/advent/elf-disappointed-v1.png')
  await expect.poll(() => page.locator('.advent__reveal-mood img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  await assertResultPortraitLayout(page, false)
  await page.screenshot({ path: testInfo.outputPath('result-incorrect.png'), fullPage: true })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expect(page.locator('#advent-result-title')).toBeVisible()
  const zoomScene = await page.locator('.advent__reveal').evaluate(el => {
    const date = el.querySelector('.advent__date') as HTMLElement
    const art = el.querySelector('.advent__reveal-mood img') as HTMLElement
    const heading = el.querySelector('#advent-result-title') as HTMLElement
    const reminder = el.querySelector('.advent__reminder-copy') as HTMLElement
    const lineHeight = parseFloat(getComputedStyle(date).lineHeight)
    return { dateHeight: date.getBoundingClientRect().height, lineHeight, artWidth: art.getBoundingClientRect().width,
      headingSize: parseFloat(getComputedStyle(heading).fontSize), reminderWidth: reminder.getBoundingClientRect().width }
  })
  expect(zoomScene.dateHeight).toBeLessThanOrEqual(zoomScene.lineHeight * 2 + 2)
  expect(zoomScene.artWidth).toBeGreaterThanOrEqual(100)
  expect(zoomScene.headingSize).toBeGreaterThanOrEqual(32)
  expect(zoomScene.reminderWidth).toBeGreaterThanOrEqual(150)
  await expect(page.locator('.advent__result-points')).toBeVisible()
  await expect(page.locator('.advent__result-answer--truth')).toBeVisible()
  await assertResultPortraitLayout(page, false)
  const enlargedLayout = await page.locator('.advent__reveal').evaluate(el => {
    const heading = el.querySelector('#advent-result-title')!.getBoundingClientRect()
    const points = el.querySelector('.advent__result-points')!.getBoundingClientRect()
    return { heading: { left: heading.left, right: heading.right, bottom: heading.bottom }, pointsTop: points.top, viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }
  })
  expect(enlargedLayout.heading.left).toBeGreaterThanOrEqual(0)
  expect(enlargedLayout.heading.right).toBeLessThanOrEqual(enlargedLayout.viewport)
  expect(enlargedLayout.heading.bottom).toBeLessThanOrEqual(enlargedLayout.pointsTop)
  expect(enlargedLayout.scrollWidth).toBeLessThanOrEqual(enlargedLayout.viewport)
  const action = page.getByRole('button', { name: 'Voir le classement' })
  await action.scrollIntoViewIfNeeded()
  await expect(action).toBeVisible()
  await expect(action).toBeEnabled()
  const actionBox = await action.boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox!.width).toBeGreaterThanOrEqual(44)
  expect(actionBox!.height).toBeGreaterThanOrEqual(44)
  await page.screenshot({ path: testInfo.outputPath('result-incorrect-320-large-text.png'), fullPage: true })
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })

  for (const width of [375, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await assertResultPortraitLayout(page, false)
    await page.screenshot({ path: testInfo.outputPath(`result-incorrect-${width}.png`), fullPage: true })
  }
  await page.setViewportSize({ width: 320, height: 700 })
  await expect(page.locator('.advent__confetti')).toHaveCount(0)
})

test('operator can opt in from outside the member window and return without reset', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  const seen: { path: string; mode?: string; date?: string; method: string }[] = []
  await page.route('**/v1/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname, headers = req.headers()
    seen.push({ path, mode: headers['x-advent-test-mode'], date: headers['x-advent-simulated-date'], method: req.method() })
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'operator', slug: 'operator', displayName: 'Fictif', email: 'operator@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'shared' } })
    if (path === '/v1/advent/clock') return headers['x-advent-test-mode'] === 'true' ? route.fulfill({ json: { date: '2026-12-01' } }) : route.fulfill({ status: 404 })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Fictif', portrait: '', statements: ['A', 'B', 'C'] } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await expect(page.getByText('Il n’y a rien ici. Reviens plus tard !')).toBeVisible()
  await expect(page.locator('.advent__test-actions')).toHaveCount(0)
  await page.getByRole('button', { name: 'Activer le mode test' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })).toBeVisible()
  const geometry = await page.locator('main.advent').evaluate(root => {
    const header = root.querySelector('.advent__header')!.getBoundingClientRect()
    const bar = root.querySelector('.advent__test-actions')!.getBoundingClientRect()
    const content = root.querySelector('.advent__content')!.getBoundingClientRect()
    return { headerBottom: header.bottom, barTop: bar.top, barBottom: bar.bottom, contentTop: content.top }
  })
  expect(geometry.barTop).toBeGreaterThanOrEqual(geometry.headerBottom)
  expect(geometry.contentTop).toBeGreaterThanOrEqual(geometry.barBottom)
  expect(seen.some(x => x.path.endsWith('/clock') && x.mode === 'true' && x.date === '2026-12-01')).toBe(true)
  await page.getByRole('button', { name: 'Désactiver le mode test' }).click()
  await expect(page.getByText('Il n’y a rien ici. Reviens plus tard !')).toBeVisible()
  expect(seen.filter(x => x.path.endsWith('/clock')).at(-1)?.mode).toBeUndefined()
  expect(seen.some(x => x.path.endsWith('/session/reset'))).toBe(false)
})


test('missing and error states show the illustrated recovery', async ({ page }, testInfo) => {
  let doorStatus = 404
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: {} })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fiction' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/doors/1') return route.fulfill({ status: doorStatus, body: '' })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/avent')
  await expect(page.getByText('Il n’y a rien ici. Reviens plus tard !')).toBeVisible()
  await expect(page.locator('.advent__state-art img')).toHaveAttribute('src', '/advent/elf-encouragement-v1.webp')
  await page.screenshot({ path: testInfo.outputPath('missing.png'), fullPage: true })
  doorStatus = 500
  await page.getByRole('button', { name: 'Réessayer' }).click()
  await expect(page.getByText('Le lutin est indisponible. Réessaie.')).toBeVisible()
  await expect(page.locator('.advent__state-art img')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('error.png'), fullPage: true })
})

test('first welcome is responsive and opens the personal calendar', async ({ page }, testInfo) => {
  let discovered = false
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fictif', email: 'fiction@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01' } })
    if (path === '/v1/advent/discovery' && route.request().method() === 'POST') {
      discovered = true
      return route.fulfill({ json: { days: [{ day: 1, state: 'today' }, { day: 2, state: 'locked' }] } })
    }
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered, attemptId: discovered ? null : 'issued-attempt' } })
    return route.fulfill({ json: {} })
  })
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/avent')
  const action = page.getByRole('button', { name: 'Commencer à jouer' })
  const returnAction = page.getByRole('button', { name: 'Revenir à HatCast' })
  expect(await page.locator('.advent__welcome-logo').evaluate(async (img: HTMLImageElement) => { await img.decode(); return img.naturalWidth })).toBeGreaterThan(0)
  await expect(action).toBeVisible()
  expect(await action.evaluate(el => el.getBoundingClientRect().bottom <= window.innerHeight)).toBe(true)
  expect(await page.locator('.advent__welcome-scene img').evaluate(async (img: HTMLImageElement) => { await img.decode(); return img.naturalWidth })).toBeGreaterThan(0)
  const village = await page.request.get('/advent/welcome-village-v1.webp')
  expect(village.ok()).toBe(true)
  expect(village.headers()['content-type']).toContain('image/')
  expect(await page.evaluate(async () => { const img = new Image(); img.src = '/advent/welcome-village-v1.webp'; await img.decode(); return img.naturalWidth })).toBeGreaterThan(0)
  await expect(page.getByRole('heading', { name: 'Le Quizz de l’Avent' })).toBeFocused()
  await page.screenshot({ path: testInfo.outputPath('welcome-320.png'), fullPage: true })
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  for (const width of [320, 375, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    expect(await page.locator('main.advent').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await expect(action).toBeVisible()
    const labelFits = await action.evaluate(button => { const b = button.getBoundingClientRect(); const label = button.querySelector('.mdc-button__label')!.getBoundingClientRect(); return label.left >= b.left && label.right <= b.right && label.top >= b.top && label.bottom <= b.bottom })
    expect(labelFits).toBe(true)
    await expect(returnAction).toBeVisible()
    const returnLabelFits = await returnAction.evaluate(button => { const b = button.getBoundingClientRect(); const label = button.querySelector('.mdc-button__label')!.getBoundingClientRect(); return label.left >= b.left && label.right <= b.right && label.top >= b.top && label.bottom <= b.bottom })
    expect(returnLabelFits).toBe(true)
    if (width === 320 || width === 430) await page.screenshot({ path: testInfo.outputPath(`welcome-${width}-200.png`), fullPage: true })
  }
  await action.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Calendrier de l’Avent' })).toBeFocused()
  await expect(page.getByRole('button', { name: /1 décembre/ })).toBeVisible()
})

test('reminder consent registers this device before enabling the shared preference', async ({ page }) => {
  const operations: string[] = []
  await page.addInitScript(() => {
    const json = { endpoint: 'https://push.example.test/device', keys: { p256dh: 'device-key', auth: 'device-auth' } }
    const subscription = { endpoint: json.endpoint, toJSON: () => json }
    const manager = { getSubscription: async () => subscription, subscribe: async () => subscription }
    const registration = { active: {}, pushManager: manager }
    Object.defineProperty(window, 'PushManager', { configurable: true, value: function () {} })
    Object.defineProperty(window, 'Notification', { configurable: true, value: { permission: 'default', requestPermission: async () => 'granted' } })
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { getRegistration: async () => registration, ready: Promise.resolve(registration), addEventListener: () => {}, removeEventListener: () => {} } })
  })
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    const method = route.request().method()
    if (path.startsWith('/v1/advent/reminder-')) operations.push(`${method} ${path}`)
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fictif', slug: 'test', displayName: 'Fictif', email: 'fictif@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-01' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Fictif', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['A', 'B', 'C'] } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'generation' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: method === 'POST' ? 'recorded' : 'available' } })
    if (path === '/v1/advent/reminder-preference') return route.fulfill({ json: { enabled: method === 'PUT' ? route.request().postDataJSON().enabled : false } })
    if (path === '/v1/advent/reminder-device') return route.fulfill({ status: 200, body: '' })
    if (path === '/v1/advent/reminder-device/status') return route.fulfill({ json: { owned: true } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  const checkbox = page.getByRole('checkbox', { name: 'Ne rate aucun quiz !' })
  await expect(checkbox).not.toBeChecked()
  await checkbox.click()
  await expect.poll(() => operations.filter(operation => operation.startsWith('PUT ')).length).toBe(2)
  await expect(checkbox).toBeChecked()
  expect(operations.filter(operation => operation.startsWith('PUT '))).toEqual([
    'PUT /v1/advent/reminder-device', 'PUT /v1/advent/reminder-preference',
  ])
  await checkbox.click()
  await expect.poll(() => operations.filter(operation => operation.startsWith('PUT ')).length).toBe(3)
  await expect(checkbox).not.toBeChecked()
  expect(operations.at(-1)).toBe('PUT /v1/advent/reminder-preference')
})

test('direct preview recovers and replays its personal result', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let recorded = false
  const result = { answerId: 'fictif', day: 23, selectedChoice: 1, falseChoice: 1, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: true, explanation: 'Explication fictive' }
  const quiz = { day: 23, name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Un', 'Deux', 'Trois'] }
  await page.route('**/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'preview', slug: 'preview', displayName: 'Fictif', email: 'fixture@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, productionPreview: true, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/entry') return route.fulfill({ status: 404 })
    if (!path.startsWith('/v1/advent/')) return route.fulfill({ json: {} })
    expect(request.headers()['x-advent-preview']).toBe('true')
    expect(request.headers()['x-advent-test-mode']).toBeUndefined()
    if (path.endsWith('/clock')) return route.fulfill({ json: { date: '2026-11-30' } })
    if (path.endsWith('/discovery')) return route.fulfill({ json: { discovered: true } })
    if (path.endsWith('/calendar')) return route.fulfill({ json: { days: [{ day: 23, state: recorded ? 'played' : 'today', outcome: recorded ? 'correct' : null }], priorityResult: null } })
    if (path.endsWith('/doors/23')) return route.fulfill({ json: quiz })
    if (path.endsWith('/history')) return route.fulfill({ json: { quiz, result, priorityResult: null } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'fixture' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer/replay')) { recorded = false; return route.fulfill({ json: { status: 'available' } }) }
    if (path.endsWith('/answer') && request.method() === 'POST') { recorded = true; return route.fulfill({ json: { status: 'recorded', replayToken: 'fictif' } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: recorded ? 'recorded' : 'available', ...(recorded ? { replayToken: 'fictif' } : {}) } })
    if (path.endsWith('/result')) return route.fulfill({ json: result })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent?preview=1')
  const previewNotice = page.getByText('Prévisualisation privée : tu peux effacer ta réponse pour rejouer.')
  await expect(previewNotice).toHaveCount(0)
  const gift = page.getByRole('button', { name: '23 décembre : Cadeau disponible' })
  await gift.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 23' }).click()
  await expect(previewNotice).toHaveCount(0)
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByText('Explication fictive')).toBeVisible()
  await expect(previewNotice).toBeVisible()
  await expect(page.getByText('Mode test')).toHaveCount(0)
  const size = await page.locator('main.advent').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }))
  expect(size.scroll).toBeLessThanOrEqual(size.client)
  await page.reload()
  await page.locator('.advent__calendar-door[data-day="23"]').click()
  await expect(page.getByText('Explication fictive')).toBeVisible()
  await page.getByRole('button', { name: 'Actions de prévisualisation' }).click()
  const previewMenu = page.getByRole('menu')
  await expect(previewMenu).toBeVisible()
  const bounds = await previewMenu.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
  await page.screenshot({ path: testInfo.outputPath('preview-replay-menu-320.png') })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expect(page.getByText('Actions de prévisualisation', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.screenshot({ path: testInfo.outputPath('preview-replay-menu-320-text-200.png') })
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })
  await expect(page.getByRole('menuitem', { name: 'Réinitialiser toute la partie de test' })).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'Effacer ma réponse et rejouer' }).click()
  await expect(page.getByRole('heading', { name: 'Effacer ta réponse du 23 décembre ?' })).toBeFocused()
  await page.getByRole('button', { name: 'Effacer ma réponse', exact: true }).click()
  await expect(page.getByRole('radio')).toHaveCount(3)
})

test('ordinary navigation stays silent when the entry request fails', async ({ page }) => {
  let failure: '404' | '500' | 'network' | 'timeout' = '404'
  let checks = 0
  await page.addInitScript(() => {
    const original = AbortSignal.timeout.bind(AbortSignal)
    AbortSignal.timeout = ms => {
      const signal = original(ms === 10_000 ? 100 : ms)
      if (ms === 10_000) signal.addEventListener('abort', () => { document.documentElement.dataset.adventTimedOut = 'true' })
      return signal
    }
  })
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'member', slug: 'member', displayName: 'Membre fictif', email: 'fixture@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/advent/entry') {
      checks++
      if (failure === 'network') return route.abort('failed')
      if (failure === 'timeout') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        try { await route.fulfill({ status: 500 }) } catch { /* The client aborted its timed-out request. */ }
        return
      }
      return route.fulfill({ status: Number(failure) })
    }
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Membre fictif', preferredRoleKeys: [] } })
    return route.fulfill({ json: [] })
  })
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    for (const state of ['404', '500', 'network', 'timeout'] as const) {
      failure = state
      const previous = checks
      await page.goto('/accueil')
      await expect.poll(() => checks).toBeGreaterThan(previous)
      if (state === 'timeout') await expect(page.locator('html')).toHaveAttribute('data-advent-timed-out', 'true')
      await expect(page.locator('#advent-entry-mobile, #advent-entry-desktop')).toHaveCount(0)
      await expect(page.getByText(/quiz de l’avent|calendrier de l’avent/i)).toHaveCount(0)
      await expect(page).not.toHaveURL(/\/avent/)
      await page.reload()
      await expect(page.locator('#advent-entry-mobile, #advent-entry-desktop')).toHaveCount(0)
    }
  }
})

test('isolated tester can project and restore a fictional ranking', async ({ page }, testInfo) => {
  const methods: string[] = []
  await page.setViewportSize({ width: 320, height: 700 })
  await page.route('**/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    methods.push(request.method())
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fiction', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fiction' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-26' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/ranking') return route.fulfill({ json: { priorityResult: null, ranking: { score: 0, rank: null, entries: [{ name: 'Alex', score: 0, rank: 2, mine: false }, { name: 'Camille', score: 0, rank: 2, mine: false }] } } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await page.getByRole('button', { name: 'Activer le mode test' }).click()
  await page.getByRole('button', { name: 'Classement', exact: true }).click()
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  const menu = page.getByRole('button', { name: 'Actions du mode test' })
  const generate = page.getByRole('menuitem', { name: 'Générer un classement fictif', exact: true })
  await page.getByRole('button', { name: 'Fermer le quiz' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Envoyer un rappel test sur cet appareil' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(menu).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(generate).toBeVisible()
  await generate.click()
  await expect(page.getByRole('status').filter({ hasText: 'Classement fictif' })).toBeVisible()
  await expect(page.locator('.advent__ranking-summary')).toContainText('hors classement')
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    const size = await page.locator('main.advent').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }))
    expect(size.scroll).toBeLessThanOrEqual(size.client)
    await page.locator('main.advent').screenshot({ path: testInfo.outputPath(`fictional-ranking-${width}.png`), animations: 'disabled' })
  }
  await page.getByRole('button', { name: 'Revenir au classement calculé' }).click()
  await expect(menu).toBeFocused()
  await expect(page.locator('.advent__ranking-summary')).toContainText('0 points')
  expect(methods.every(method => method === 'GET')).toBe(true)
})

test('authorized future gift works without test mode on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  let recorded = false
  const dates: string[] = []
  const quiz = { day: 23, name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Un', 'Deux', 'Trois'] }
  const result = { answerId: 'fictif', day: 23, selectedChoice: 1, falseChoice: 1, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: true, explanation: 'Explication fictive' }
  await page.route('**/v1/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    if (path.includes('/doors/23')) dates.push(req.headers()['x-advent-simulated-date'])
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'operator', slug: 'operator', displayName: 'Fictif', email: 'fixture@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fixture-session' } })
    if (path.endsWith('/clock')) return route.fulfill({ json: { date: '2026-12-01', effectiveInstant: '2026-12-01T12:00:00Z', nextMidnight: '2026-12-01T23:00:00Z', simulated: req.headers()['x-advent-test-mode'] === 'true' } })
    if (path.endsWith('/discovery')) return route.fulfill({ json: { discovered: true } })
    if (path.endsWith('/results/latest-unseen')) return route.fulfill({ json: { result: null } })
    if (path.endsWith('/calendar')) return route.fulfill({ json: { days: [{ day: 23, state: recorded ? 'played' : 'today', outcome: recorded ? 'pending' : null }, { day: 25, state: 'locked' }], priorityResult: null } })
    if (path.endsWith('/doors/23')) return route.fulfill({ json: quiz })
    if (path.endsWith('/answer/replay')) { recorded = false; return route.fulfill({ json: { status: 'available' } }) }
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'fixture' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer') && req.method() === 'POST') { recorded = true; return route.fulfill({ json: { status: 'recorded', replayToken: 'fictif' } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: recorded ? 'recorded' : 'available', ...(recorded ? { replayToken: 'fictif' } : {}) } })
    if (path.endsWith('/result')) return route.fulfill({ status: 404 })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await expect(page.getByRole('button', { name: 'Activer le mode test' })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'Voir le calendrier' }).click()
  const gift = page.getByRole('button', { name: '23 décembre : Cadeau disponible' })
  await expect(page.getByRole('button', { name: '25 décembre : Verrouillé' })).toBeDisabled()
  await gift.focus(); await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 23' }).click()
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByText('Reviens après le 23 décembre pour découvrir le résultat !')).toBeVisible()
  await expect(page.getByText('Explication fictive')).toHaveCount(0)
  await page.getByRole('button', { name: 'Actions du cadeau' }).click()
  await page.getByRole('menuitem', { name: 'Effacer ma réponse et rejouer' }).click()
  await page.getByRole('button', { name: 'Effacer ma réponse', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Confirmer ma réponse' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  expect(dates.length).toBeGreaterThan(0)
  expect(dates.every(date => date === undefined)).toBe(true)
})

test('future answer reveals only after advancing the simulated date past its gift day', async ({ page }) => {
  let recorded = false
  let seen = false
  const headersSeen: string[] = []
  const quiz = { day: 2, name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Un', 'Deux', 'Trois'] }
  const result = { answerId: 'fictif', day: 2, selectedChoice: 1, falseChoice: 1, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false, explanation: 'Explication fictive' }
  await page.route('**/v1/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname
    const date = req.headers()['x-advent-simulated-date'] ?? '2026-12-01'
    headersSeen.push(date)
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'operator', slug: 'operator', displayName: 'Fictif', email: 'fixture@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: {} })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fixture-session' } })
    if (path.endsWith('/clock')) return route.fulfill({ json: { date, effectiveInstant: `${date}T12:00:00Z`, nextMidnight: `${date}T23:00:00Z`, simulated: req.headers()['x-advent-test-mode'] === 'true' } })
    if (path.endsWith('/discovery')) return route.fulfill({ json: { discovered: true } })
    if (path.endsWith('/results/latest-unseen')) return route.fulfill({ json: { result: recorded && !seen && date >= '2026-12-03' ? result : null } })
    if (path.endsWith('/calendar')) return route.fulfill({ json: { days: [{ day: 2, state: recorded ? 'played' : 'today', outcome: recorded ? 'pending' : null }], priorityResult: null } })
    if (path.endsWith('/doors/2')) return route.fulfill({ json: quiz })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'fixture' } })
    if (path.endsWith('/answer/reserve')) return route.fulfill({ json: { status: 'available' } })
    if (path.endsWith('/answer') && req.method() === 'POST') { recorded = true; return route.fulfill({ json: { status: 'recorded', replayToken: 'fictif' } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: recorded ? 'recorded' : 'available', ...(recorded ? { replayToken: 'fictif' } : {}) } })
    if (path.endsWith('/result/acknowledge')) { seen = true; return route.fulfill({ status: 200 }) }
    if (path.endsWith('/result')) return recorded && date >= '2026-12-03' ? route.fulfill({ json: result }) : route.fulfill({ status: 404 })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await page.getByRole('button', { name: 'Activer le mode test' }).click()
  await page.getByRole('button', { name: 'Voir le calendrier' }).click()
  await page.getByRole('button', { name: '2 décembre : Cadeau disponible' }).click()
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 2' }).click()
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByText('Explication fictive')).toHaveCount(0)
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(page.getByText('Explication fictive')).toHaveCount(0)
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(page.getByText('Explication fictive')).toBeVisible()
  expect(headersSeen).toContain('2026-12-03')
})


test('direct day link opens the authorized calendar destination and survives reload', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.route('**/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fictif', email: 'fiction@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, productionPreview: true, sessionId: 'fixture' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-11-30' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/calendar') return route.fulfill({ json: { days: [{ day: 6, state: 'today' }], priorityResult: null } })
    if (path === '/v1/advent/doors/6') return route.fulfill({ json: { day: 6, name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Un', 'Deux', 'Trois'] } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent?preview=1&jour=6&source=notification')
  const gift = page.getByRole('button', { name: 'Ouvrir le cadeau du jour 6' })
  await expect(gift).toBeVisible()
  await gift.focus(); await page.keyboard.press('Enter')
  await expect(page.locator('#quiz-title')).toBeFocused()
  expect(await page.locator('main.advent').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.reload()
  await expect(gift).toBeVisible()
  expect(new URL(page.url()).search).toBe('?preview=1&jour=6&source=notification')
})

test('Christmas podium remains usable at narrow width and opens the final ranking', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 700 })
  const board = { score: 10, rank: 3, entries: [
    { name: 'Camille', score: 30, rank: 1, mine: false },
    { name: 'Alexandrine au très très long nom', score: 20, rank: 2, mine: false },
    { name: 'Fiction', score: 10, rank: 3, mine: true, tieReason: 'NAME' },
    { name: 'Zoé', score: 10, rank: 4, mine: false },
  ] }
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fiction', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: false, sessionId: 'fiction' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-25' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/ranking') return route.fulfill({ json: { priorityResult: null, ranking: board } })
    return route.fulfill({ json: {} })
  })
  const probe = async () => page.evaluate(() => {
    const element = document.createElement('button')
    element.textContent = 'HatCast'
    document.body.appendChild(element)
    const style = getComputedStyle(element)
    const result = [style.fontFamily, style.fontSize, style.color, style.backgroundColor, style.borderRadius]
    element.remove()
    return result
  })
  await page.goto('/')
  const hatcastStyles = await probe()
  await page.goto('/avent')
  expect(await probe()).toEqual(hatcastStyles)
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    const places = page.locator('.advent__podium-place')
    await expect(places).toHaveCount(3)
    const first = await places.nth(0).boundingBox()
    const second = await places.nth(1).boundingBox()
    const third = await places.nth(2).boundingBox()
    expect(first!.x).toBeGreaterThan(second!.x)
    expect(third!.x).toBeGreaterThan(first!.x)
    const heights = await places.locator('.advent__podium-rank').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height))
    expect(heights[0]).toBeGreaterThan(heights[1])
    expect(heights[1]).toBeGreaterThan(heights[2])
    await page.locator('main.advent').screenshot({ path: testInfo.outputPath(`christmas-podium-3-${width}.png`), animations: 'disabled' })
  }
  await page.setViewportSize({ width: 320, height: 700 })
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await expect(page.locator('.advent__podium-place')).toHaveCount(3)
  await expect(page.locator('.advent__podium')).toContainText('Alexandrine au très très long nom')
  await expect(page.locator('.advent__podium-reason')).toContainText('ordre alphabétique')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('main.advent').screenshot({ path: testInfo.outputPath('christmas-podium-320-zoom.png'), animations: 'disabled' })
  const cta = page.getByRole('button', { name: 'Voir le classement final' })
  await cta.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Classement', exact: true })).toBeVisible()
  await expect(page.locator('.advent__ranking-list li')).toHaveCount(4)
  await expect(page.locator('.advent__ranking-list li').nth(2)).toContainText('Fiction')
  const entries = board.entries.slice()
  for (const count of [0, 1, 2]) {
    board.entries.splice(0, board.entries.length, ...entries.slice(0, count))
    await page.setViewportSize({ width: 390, height: 700 })
    await page.goto('/avent')
    await expect(page.locator('.advent__podium-place')).toHaveCount(count)
    await page.locator('main.advent').screenshot({ path: testInfo.outputPath(`christmas-podium-${count}-390.png`), animations: 'disabled' })
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/avent')
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    await expect(page.locator('.advent__podium-place')).toHaveCount(count)
    await expect(page.getByRole('heading', { name: 'Joyeux Noël !' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Voir le classement final' })).toBeVisible()
    await page.locator('main.advent').screenshot({ path: testInfo.outputPath(`christmas-podium-${count}-320-zoom.png`), animations: 'disabled' })
  }
})


test('Christmas preview keeps its fictional ranking and calendar works', async ({ page }) => {
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'fiction', slug: 'fiction', displayName: 'Fiction', email: 'fiction@example.test' }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Fiction', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fiction' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date: '2026-12-25' } })
    if (path === '/v1/advent/discovery') return route.fulfill({ json: { discovered: true } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/ranking') return route.fulfill({ json: { priorityResult: null, ranking: { score: 0, rank: null, entries: [{ name: 'Réel', score: 0, rank: 1, mine: false }] } } })
    if (path === '/v1/advent/calendar') return route.fulfill({ json: { priorityResult: null, days: Array.from({ length: 25 }, (_, i) => ({ day: i + 1, state: i === 24 ? 'christmas' : 'past-unplayed' })) } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await page.getByRole('button', { name: 'Activer le mode test' }).click()
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await page.getByRole('menuitem', { name: 'Aperçu Noël : place ex æquo' }).click()
  await expect(page.locator('.advent__podium')).toContainText('Lou')
  await page.locator('.advent__christmas-actions').getByRole('button', { name: 'Voir le calendrier' }).click()
  await expect(page.getByRole('heading', { name: 'Calendrier de l’Avent' })).toBeVisible()
  await page.getByRole('button', { name: 'Actions du mode test' }).click()
  await page.getByRole('menuitem', { name: 'Aperçu Noël : place ex æquo' }).click()
  await page.getByRole('button', { name: 'Voir le classement final' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Classement fictif' })).toBeVisible()
  await expect(page.locator('.advent__ranking-list')).toContainText('Zoé')
  await expect(page.locator('.advent__ranking-list')).not.toContainText('Réel')
  await page.locator('.advent__ranking-action').getByRole('button', { name: 'Voir le calendrier' }).click()
  await expect(page.getByRole('heading', { name: 'Calendrier de l’Avent' })).toBeVisible()
})

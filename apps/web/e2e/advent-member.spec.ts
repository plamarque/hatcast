import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })
test('member confirmation and ranking remain neutral and accessible', async ({ page }) => {
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
  await expect(page.locator('.advent__recorded-art img')).toHaveAttribute('src', '/advent/elf-confirmation-v1.webp')
  await expect.poll(() => page.locator('.advent__recorded-art img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator('.advent__portrait-scene--recorded img')).toBeVisible()
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
  const close = page.getByRole('button', { name: 'Refermer mon cadeau du jour et effacer ma réponse' })
  await expect(close).toHaveCount(0)
  await expect(page.locator('.advent__calendar-cell button')).toHaveCount(2)
  await expect(page.getByRole('button', { name: '25 décembre : Verrouillé' })).toBeDisabled()
  await page.getByRole('button', { name: 'Revenir au jour précédent' }).click()
  await expect(close).toBeEnabled()
  await close.focus()
  const closeBox = await close.boundingBox()
  expect(closeBox!.width).toBeGreaterThanOrEqual(44)
  expect(closeBox!.height).toBeGreaterThanOrEqual(44)
  expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(320)
  await page.screenshot({ path: testInfo.outputPath('calendar-operator-focus-320.png') })
  await close.click()
  await expect(page.getByText('Ta réponse à ce cadeau sera effacée. Tu pourras rejouer.')).toBeVisible()
  await page.getByRole('button', { name: 'Effacer ma réponse', exact: true }).click()
  await expect.poll(() => replays).toEqual([{ date: '2026-12-01', body: { replayToken: 'own-token', close: true } }])
  await expect(close).toHaveCount(0)
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
    if (path === '/v1/advent/doors/1/history') return route.fulfill({ json: { priorityResult: null, quiz: { day: 1, name: 'Fiction', portrait: '', statements: ['A', 'B', 'C'] }, falseChoice: null, result: lateRecorded ? lateResult : null } })
    if (path === '/v1/advent/doors/1/result') return route.fulfill({ json: lateResult })
    if (path === '/v1/advent/doors/1') return route.fulfill({ json: { day: 1, name: 'Fiction', portrait: '', statements: ['A', 'B', 'C'] } })
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
  await expect(page.locator('.advent__reveal-mood img')).toHaveAttribute('src', '/advent/elf-encouragement-v1.webp')
  await expect.poll(() => page.locator('.advent__reveal-mood img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  await page.screenshot({ path: testInfo.outputPath('result-incorrect.png'), fullPage: true })
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

test('direct preview opens a future gift and recovers its final personal result', async ({ page }) => {
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
    if (path.endsWith('/answer') && request.method() === 'POST') { recorded = true; return route.fulfill({ json: { status: 'recorded' } }) }
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: recorded ? 'recorded' : 'available' } })
    if (path.endsWith('/result')) return route.fulfill({ json: result })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent?preview=1')
  await expect(page.getByText('Prévisualisation : tes réponses sont définitives.')).toBeVisible()
  const gift = page.getByRole('button', { name: '23 décembre : Cadeau disponible' })
  await gift.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 23' }).click()
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByText('Explication fictive')).toBeVisible()
  await expect(page.getByText('Mode test')).toHaveCount(0)
  const size = await page.locator('main.advent').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }))
  expect(size.scroll).toBeLessThanOrEqual(size.client)
  await page.reload()
  await page.locator('.advent__calendar-door[data-day="23"]').click()
  await expect(page.getByText('Explication fictive')).toBeVisible()
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

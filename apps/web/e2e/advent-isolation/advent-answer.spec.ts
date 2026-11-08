import { expect, test, type Locator, type Page } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

async function styles(locator: Locator) {
  return locator.evaluate(element => {
    const style = getComputedStyle(element)
    const box = element.getBoundingClientRect()
    return {
      color: style.color,
      background: style.backgroundColor,
      font: style.fontFamily,
      size: style.fontSize,
      weight: style.fontWeight,
      lineHeight: style.lineHeight,
      border: style.border,
      radius: style.borderRadius,
      width: box.width,
      height: box.height,
      advent: style.getPropertyValue('--hatcast-avent-red').trim(),
    }
  })
}

async function settleHome(page: Page) {
  const heading = page.getByRole('heading', { name: 'Accueil', level: 1 })
  const button = page.getByRole('button', { name: 'Rejoindre la troupe de démonstration' })
  await expect(heading).toBeVisible()
  await expect(button).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  return { heading, button }
}

async function settleGiftImage(page: Page) {
  const gift = page.locator('.member-shell__advent-entry:visible img')
  await expect(gift).toBeVisible()
  await gift.evaluate(async (image: HTMLImageElement) => {
    await image.decode()
  })
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
}

for (const width of [320, 375, 390, 430, 768, 1280]) {
test(`Advent preserves the HatCast home at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now())))
  const result = { answerId: 'one', day: 1, selectedChoice: 0, falseChoice: 0, correct: true, responsePoints: 10, participationPoints: 1, bonusPoints: 0, totalPoints: 11, seen: false, stories: ['Un\n\nDeux', null, 'Trois'] }
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    const revealed = route.request().headers()['x-advent-simulated-date'] === '2026-12-02'
    let body: unknown = {}
    if (path === '/v1/auth/me') body = { user: { id: 'isolation-user', slug: 'test', displayName: 'Test', email: 'test@example.test', avatarUrl: null }, platformAdmin: false }
    else if (path === '/v1/troupes') body = []
    else if (path === '/v1/me/preferences') body = { memberDisplayName: 'Test', preferredRoleKeys: [] }
    else if (path === '/v1/me/inbox') body = { actions: [], nextEvent: null, noParticipation: true, shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} } }
    else if (path === '/v1/me/agenda') body = { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, filterBarVisible: false, noParticipation: true }
    else if (path === '/v1/advent/discovery') body = { discovered: true }
    else if (path === '/v1/advent/clock') body = { date: revealed ? '2026-12-02' : '2026-12-01' }
    else if (path === '/v1/advent/results/latest-unseen') body = { result: revealed ? result : null }
    else if (path === '/v1/advent/session') body = { sessionId: 'isolation-session', testControls: true }
    else if (path === '/v1/advent/discovery') body = { discovered: true }
    else if (path.endsWith('/answer/reconcile')) body = { status: 'available', generation: 'isolation-generation' }
    else if (path.endsWith('/answer/reserve')) body = { status: 'available' }
    else if (path === '/v1/advent/doors/1/answer') body = route.request().method() === 'POST' || revealed ? { status: 'recorded', replayToken: 'isolation-token' } : { status: 'available' }
    else if (path === '/v1/advent/doors/1/result') body = result
    else if (path === '/v1/advent/doors/1') body = { day: 1, name: 'Lutin', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['A', 'B', 'C'] }
    await route.fulfill({ json: body })
  })

  await page.goto('/accueil')
  const before = await settleHome(page)
  await settleGiftImage(page)
  const headingStyles = await styles(before.heading)
  const buttonStyles = await styles(before.button)
  expect(headingStyles.advent).toBe('')
  expect(buttonStyles.advent).toBe('')
  const headingImage = await before.heading.screenshot({ animations: 'disabled' })
  const buttonImage = await before.button.screenshot({ animations: 'disabled' })
  await page.mouse.move(width - 10, 400)
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur() })
  const homeImage = await page.screenshot({ path: testInfo.outputPath('hatcast-before-advent.png'), animations: 'disabled', fullPage: true })

  await page.goto('/avent')
  await page.getByRole('button', { name: 'Activer le mode test' }).click()
  await expect(page.locator('.advent__scene')).toBeVisible()
  expect(await page.locator('.advent').evaluate(element => getComputedStyle(element).getPropertyValue('--hatcast-avent-red').trim())).not.toBe('')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click({ position: { x: 8, y: 8 } })
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.locator('.advent__recorded')).toBeVisible()
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(page.getByRole('heading', { name: 'Bravo, tu as trouvé !' })).toBeVisible()
  const storyHeaders = page.locator('mat-expansion-panel-header')
  await expect(storyHeaders).toHaveCount(2)
  await storyHeaders.first().click()
  await expect(storyHeaders.first()).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('button', { name: 'Fermer le quiz' }).click()
  await expect(page).toHaveURL(/\/accueil$/)
  const after = await settleHome(page)
  await settleGiftImage(page)
  expect(await styles(after.heading)).toEqual(headingStyles)
  expect(await styles(after.button)).toEqual(buttonStyles)
  expect(await after.heading.screenshot({ animations: 'disabled' })).toEqual(headingImage)
  expect(await after.button.screenshot({ animations: 'disabled' })).toEqual(buttonImage)
  await page.mouse.move(width - 10, 400)
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur() })
  const afterImage = await page.screenshot({ path: testInfo.outputPath('hatcast-after-advent.png'), animations: 'disabled', fullPage: true })
  expect(afterImage).toEqual(homeImage)
})
}

test('private editor preserves computed HatCast home styles', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.addInitScript(() => localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now())))
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    let body: unknown = {}
    if (path === '/v1/auth/me') body = { user: { id: 'fiction', slug: 'test', displayName: 'Test', email: 'fiction@example.test', avatarUrl: null }, platformAdmin: false }
    else if (path === '/v1/troupes') body = []
    else if (path === '/v1/me/preferences') body = { memberDisplayName: 'Test', preferredRoleKeys: [] }
    else if (path === '/v1/me/inbox') body = { actions: [], nextEvent: null, noParticipation: true, shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} } }
    else if (path === '/v1/me/agenda') body = { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, filterBarVisible: false, noParticipation: true }
    else if (path === '/v1/advent/entry') return route.fulfill({ status: 404 })
    else if (path === '/v1/advent/session') body = { sessionId: 'fiction', testControls: false, productionPreview: true, quizEditing: true }
    else if (path === '/v1/advent/editor/days') body = { days: [23], refreshAfterMs: 60000 }
    else if (path.endsWith('/doors/23')) body = { day: 23, name: 'Fictif', portrait: '', statements: ['A', 'B', 'C'], genericElf: true }
    else if (path.endsWith('/answer/reconcile')) body = { status: 'available', generation: 'fixture' }
    else if (path.endsWith('/answer')) body = { status: 'available' }
    else if (path === '/v1/advent/editor/23') body = { day: 23, name: 'Fictif', version: '1', content: { statements: ['A', 'B', 'C'], stories: [null, null, null], falseChoice: 0, explanation: null } }
    else if (path === '/v1/advent/clock') body = { date: '2026-11-30' }
    else if (path === '/v1/advent/discovery') body = { discovered: true }
    else if (path === '/v1/advent/calendar') body = { days: [{ day: 23, state: 'today' }], priorityResult: null }
    await route.fulfill({ json: body })
  })
  await page.goto('/accueil')
  const before = await settleHome(page)
  await expect(page.locator('.member-shell__advent-entry:visible')).toHaveCount(0)
  const heading = await styles(before.heading), button = await styles(before.button)
  await page.goto('/avent?preview=1')
  await page.locator('[data-day="23"]').click()
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 23' }).click()
  await page.getByRole('button', { name: 'Modifier le quiz du 23 décembre' }).click()
  await expect(page.locator('#edit-statement-0')).toBeVisible()
  await page.goto('/accueil')
  const after = await settleHome(page)
  await expect(page.locator('.member-shell__advent-entry:visible')).toHaveCount(0)
  expect(await styles(after.heading)).toEqual(heading)
  expect(await styles(after.button)).toEqual(button)
  expect((await styles(after.heading)).advent).toBe('')
})

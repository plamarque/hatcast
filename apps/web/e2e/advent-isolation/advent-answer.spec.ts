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

for (const width of [320, 375, 390, 430, 768, 1280]) {
test(`Advent preserves the HatCast home at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now())))
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    let body: unknown = {}
    if (path === '/v1/auth/me') body = { user: { id: 'isolation-user', slug: 'test', displayName: 'Test', email: 'test@example.test', avatarUrl: null }, platformAdmin: false }
    else if (path === '/v1/troupes') body = []
    else if (path === '/v1/me/preferences') body = { memberDisplayName: 'Test', preferredRoleKeys: [] }
    else if (path === '/v1/me/inbox') body = { actions: [], nextEvent: null, noParticipation: true, shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} } }
    else if (path === '/v1/me/agenda') body = { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, filterBarVisible: false, noParticipation: true }
    else if (path.endsWith('/answer/reconcile')) body = { status: 'available', generation: 'isolation-generation' }
    else if (path.endsWith('/answer/reserve')) body = { status: 'available' }
    else if (path === '/v1/advent-test/doors/1/answer') body = route.request().method() === 'POST' ? { status: 'recorded', replayToken: 'isolation-token' } : { status: 'available' }
    else if (path === '/v1/advent-test/doors/1') body = { day: 1, name: 'Lutin', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['A', 'B', 'C'] }
    await route.fulfill({ json: body })
  })

  await page.goto('/accueil')
  const before = await settleHome(page)
  const headingStyles = await styles(before.heading)
  const buttonStyles = await styles(before.button)
  expect(headingStyles.advent).toBe('')
  expect(buttonStyles.advent).toBe('')
  const headingImage = await before.heading.screenshot({ animations: 'disabled' })
  const buttonImage = await before.button.screenshot({ animations: 'disabled' })
  await page.mouse.move(width - 10, 400)
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur() })
  const homeImage = await page.screenshot({ path: testInfo.outputPath('hatcast-before-advent.png'), animations: 'disabled', fullPage: true })

  await page.goto('/avent-test')
  await expect(page.locator('.advent__scene')).toBeVisible()
  expect(await page.locator('.advent').evaluate(element => getComputedStyle(element).getPropertyValue('--hatcast-avent-red').trim())).not.toBe('')
  await page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' }).click({ position: { x: 8, y: 8 } })
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.locator('.advent__recorded')).toBeVisible()
  await page.getByRole('link', { name: 'Fermer le quiz' }).click()
  await expect(page).toHaveURL(/\/accueil$/)
  const after = await settleHome(page)
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

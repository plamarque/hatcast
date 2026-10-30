import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test('keyboard answers on a narrow enlarged screen with reduced motion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now())))
  await page.setViewportSize({ width: 320, height: 700 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let reservedAttempt: string | undefined
  let confirmed: { choice: number; attemptId: string } | undefined
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'test-user', slug: 'test', displayName: 'Test', email: 'test@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Test', preferredRoleKeys: [] } })
    if (path.endsWith('/answer/reconcile')) return route.fulfill({ json: { status: 'available', generation: 'test-generation' } })
    if (path.endsWith('/answer/reserve')) {
      const body = route.request().postDataJSON()
      expect(body.generation).toBe('test-generation')
      reservedAttempt = body.attemptId
      return route.fulfill({ json: { status: 'available' } })
    }
    if (path.endsWith('/answer') && route.request().method() === 'POST') confirmed = route.request().postDataJSON()
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: route.request().method() === 'POST' ? 'recorded' : 'available' } })
    if (path === '/v1/advent-test/doors/1') return route.fulfill({ json: { day: 1, name: 'Lutin', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['Une affirmation fictive assez longue pour vérifier que le texte reste lisible à grande taille.', 'Une deuxième affirmation.', 'Une troisième affirmation.'] } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent-test')
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  const gift = page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })
  await expect(gift).toBeVisible()
  expect(await page.locator('.advent__elf').evaluate(el => getComputedStyle(el).animationName)).toBe('none')
  await gift.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#quiz-title')).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const choices = page.getByRole('radio')
  await expect(choices).toHaveCount(3)
  await choices.first().focus()
  await page.keyboard.press('Space')
  await expect(choices.first()).toBeChecked()
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByRole('status')).toContainText('Ta réponse est enregistrée')
  expect(reservedAttempt).toBeTruthy()
  expect(confirmed).toEqual({ choice: 0, attemptId: reservedAttempt })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

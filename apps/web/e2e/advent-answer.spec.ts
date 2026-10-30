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
    if (path.endsWith('/answer')) return route.fulfill({ json: route.request().method() === 'POST' ? { status: 'recorded', replayToken: 'test-token' } : { status: 'available' } })
    if (path === '/v1/advent-test/doors/1') return route.fulfill({ json: { day: 1, name: 'Lutin', portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', genericElf: true, statements: ['Une affirmation fictive assez longue pour vérifier que le texte reste lisible à grande taille.', 'Une deuxième affirmation.', 'Une troisième affirmation.'] } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/accueil')
  const homeStyles = await page.locator('body').evaluate(el => {
    const style = getComputedStyle(el)
    return { font: style.fontFamily, color: style.color, background: style.backgroundColor, advent: style.getPropertyValue('--hatcast-avent-red').trim() }
  })
  const homeHeadingStyles = await page.locator('h1').first().evaluate(el => {
    const style = getComputedStyle(el)
    return { font: style.fontFamily, size: style.fontSize, color: style.color }
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
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 700 })
  const portraitWidth = await page.locator('.advent__portrait').evaluate(el => el.getBoundingClientRect().width)
  const choices = page.getByRole('radio')
  await expect(choices).toHaveCount(3)
  await choices.first().focus()
  await page.keyboard.press('Space')
  await expect(choices.first()).toBeChecked()
  await expect(page.locator('.advent__options mat-radio-button').first()).toHaveCSS('border-color', 'rgb(181, 34, 53)')
  const selectedContrast = await page.locator('.advent__options mat-radio-button').first().evaluate(card => {
    const label = card.querySelector('label')!
    const channel = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    const lum = (color: string) => { const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel); return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2] }
    const a = lum(getComputedStyle(label).color), b = lum(getComputedStyle(card).backgroundColor)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
  expect(selectedContrast).toBeGreaterThanOrEqual(4.5)
  await page.getByRole('button', { name: 'Confirmer ma réponse' }).click()
  await expect(page.getByRole('status')).toContainText('Ta réponse est enregistrée')
  await expect(page.locator('.advent__recorded-title')).toBeVisible()
  await expect(page.locator('.advent__recorded-title')).toHaveCSS('font-family', /Fredoka/)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.fonts.check('700 16px Fredoka'))).toBe(true)
  await expect(page.locator('.advent__portrait img')).toBeVisible()
  await expect(page.locator('.advent__portrait img')).toHaveAttribute('src', /^data:image\/png;base64,/)
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.locator('.advent__recorded-title')).toBeVisible()
  }
  await page.setViewportSize({ width: 320, height: 700 })
  expect(await page.locator('.advent__portrait').evaluate(el => el.getBoundingClientRect().width)).toBe(portraitWidth)
  const replay = page.locator('.advent__test-actions').getByRole('button', { name: 'Effacer ma réponse et rejouer' })
  await expect(replay).toBeVisible()
  await expect(replay.locator('mat-icon')).toHaveText('delete_outline')
  await expect(page.getByRole('status')).not.toContainText(/bonne réponse|mauvaise réponse|points/i)
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--hatcast-avent-red').trim())).toBe('')
  expect(reservedAttempt).toBeTruthy()
  expect(confirmed).toEqual({ choice: 0, attemptId: reservedAttempt })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.goto('/accueil')
  expect(await page.locator('body').evaluate(el => {
    const style = getComputedStyle(el)
    return { font: style.fontFamily, color: style.color, background: style.backgroundColor, advent: style.getPropertyValue('--hatcast-avent-red').trim() }
  })).toEqual(homeStyles)
  expect(await page.locator('h1').first().evaluate(el => {
    const style = getComputedStyle(el)
    return { font: style.fontFamily, size: style.fontSize, color: style.color }
  })).toEqual(homeHeadingStyles)
})

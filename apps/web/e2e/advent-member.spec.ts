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
  await page.getByRole('button', { name: 'Voir le classement' }).click()
  await expect(page.getByRole('heading', { name: 'Classement des lutins' })).toBeFocused()
  await expect(page.locator('.advent__ranking')).toContainText('Ton score actuel : 0 points')
  await expect(page.locator('.advent__ranking')).not.toContainText('Mode test')
  for (const width of [320, 375, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 700 })
    const overflow = await page.locator('main.advent').evaluate(root => ({ client: root.clientWidth, scroll: root.scrollWidth, offenders: [...root.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > root.getBoundingClientRect().right + 1).map(el => ({ tag: el.tagName, className: String(el.className), right: Math.round(el.getBoundingClientRect().right) })).slice(0, 20) }))
    expect(overflow.scroll, JSON.stringify({ viewport: width, ...overflow })).toBeLessThanOrEqual(overflow.client)
  }
  expect(requests.every(path => !path.startsWith('/v1/advent-test/'))).toBe(true)
})

test('verified operator controls use the same Advent URL and member API', async ({ page }) => {
  const date = '2026-12-01'
  const paths: string[] = []
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    paths.push(path)
    if (path === '/v1/auth/me') return route.fulfill({ json: { user: { id: 'operator', slug: 'operator', displayName: 'Opérateur fictif', email: 'operator@example.test', avatarUrl: null }, platformAdmin: false } })
    if (path === '/v1/troupes') return route.fulfill({ json: [] })
    if (path === '/v1/me/preferences') return route.fulfill({ json: { memberDisplayName: 'Opérateur fictif', preferredRoleKeys: [] } })
    if (path === '/v1/advent/session') return route.fulfill({ json: { testControls: true, sessionId: 'fixture-session' } })
    if (path === '/v1/advent/clock') return route.fulfill({ json: { date } })
    if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
    if (path === '/v1/advent/doors/1' || path === '/v1/advent/doors/2') return route.fulfill({ json: { day: Number(path.split('/').pop()), name: 'Lutin fictif', portrait: '', genericElf: true, statements: ['Une', 'Deux', 'Trois'] } })
    if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
    return route.fulfill({ json: {} })
  })
  await page.goto('/avent')
  await expect(page).toHaveURL(/\/avent$/)
  await expect(page.getByText('Mode test')).toBeVisible()
  await page.getByRole('button', { name: 'Avancer au jour suivant' }).click()
  await expect(page.getByRole('status', { name: 'Jour simulé : 2 décembre' })).toBeVisible()
  expect(paths).not.toContain('/v1/advent/clock/next-day')
  expect(paths.every(path => !path.startsWith('/v1/advent-test/'))).toBe(true)
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
      if (path === '/v1/advent/results/latest-unseen') return route.fulfill({ json: { result: null } })
      if (path.match(/\/doors\/\d+$/)) return route.fulfill({ json: { day: Number(path.split('/').pop()), name: 'Fictif', portrait: '', genericElf: true, statements: ['A', 'B', 'C'] } })
      if (path.endsWith('/answer')) return route.fulfill({ json: { status: 'available' } })
      return route.fulfill({ json: {} })
    })
    await page.goto('/avent')
    await expect(page.getByRole('button', { name: 'Ouvrir le cadeau du jour 1' })).toBeVisible()
  }
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

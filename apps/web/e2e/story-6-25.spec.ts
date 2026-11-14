import { expect, test, type Page } from '@playwright/test'
import { resetE1CutoverFixture } from './helpers/e2e-api'
import { openEventTab, prepareE2ePage } from './helpers/e1.ui'
import { assertNoHorizontalOverflow } from './helpers/e1-layout'

// Real API, isolated e2e profile and H2 fixtures: no mocked composition response.
test('mobile organizer sees both previous shows and member sees no warning', async ({ page, request, browser }) => {
  const fx = await resetE1CutoverFixture(request)
  await prepareE2ePage(page)
  await page.goto('/agenda')
  const mutate = async (method: 'post' | 'put', path: string, data?: object, actor: Page = page) => {
    const response = await actor.request[method](path, { data })
    expect(response.ok(), `${method} ${path}: ${response.status()} ${await response.text()}`).toBeTruthy()
    return response.json()
  }
  const create = async (title: string, startsAt: string, category?: string) => {
    const event = await mutate('post', `/v1/seasons/${fx.seasonId}/events`, {
      title, startsAt, roleSlots: { player: 1 }, ...(category ? { category } : {}),
    }) as { id: string; slug: string }
    await mutate('post', `/v1/seasons/${fx.seasonId}/events/${event.id}/actions/open-availability`)
    return event
  }
  const category = await create('Cabaret précédent', '2037-01-01T19:00:00Z')
  const longTitle = 'Voyage précédent avec une très longue soirée de spectacle et de rencontres improvisées au bord de la mer'
  const travel = await create(longTitle, '2037-02-01T19:00:00Z', 'deplacements')
  const current = await create('Spectacle courant', '2037-03-01T19:00:00Z')
  const memberContext = await browser.newContext({ storageState: 'e2e/.auth/member.json', ignoreHTTPSErrors: true, baseURL: 'https://localhost:4200', viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true })
  const member = await memberContext.newPage()
  await prepareE2ePage(member)
  await member.goto('/agenda')
  for (const event of [category, travel, current]) {
    await mutate('put', `/v1/seasons/${fx.seasonId}/events/${event.id}/availability/me`, { status: 'available', roleKeys: ['player'] }, member)
  }
  for (const event of [category, travel, current]) {
    await mutate('put', `/v1/seasons/${fx.seasonId}/events/${event.id}/composition/slots/player/0`, { participantId: fx.memberSeasonParticipantId })
    if (event !== current) await mutate('post', `/v1/seasons/${fx.seasonId}/events/${event.id}/composition/validate`)
  }
  await openEventTab(page, fx, current.slug, 'equipe')
  const warning = page.getByRole('button', { name: /Joue deux fois de suite/ })
  await expect(warning).toBeVisible()
  await expect(warning).toContainText('Joue deux fois de suite')
  await warning.tap()
  const detail = page.locator('.mat-mdc-tooltip').filter({ hasText: longTitle })
  await expect(detail).toBeVisible()
  await expect(detail).toContainText(longTitle)
  await expect(detail).toContainText('Cabaret précédent')
  await expect(detail).toContainText('01/02')
  await expect(detail).toContainText('01/01')
  const bounds = await detail.locator('.mat-mdc-tooltip-surface').evaluate(el => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
  })
  expect(bounds.left).toBeGreaterThanOrEqual(0)
  expect(bounds.right).toBeLessThanOrEqual(393)
  expect(bounds.top).toBeGreaterThanOrEqual(0)
  expect(bounds.bottom).toBeLessThanOrEqual(851)
  expect(bounds.scrollHeight).toBeLessThanOrEqual(bounds.clientHeight)
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth)
  await warning.tap()
  await warning.focus()
  await expect(warning).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(detail).toBeVisible()
  await expect(detail).toContainText(longTitle)
  await assertNoHorizontalOverflow(page)
  await mutate('post', `/v1/seasons/${fx.seasonId}/events/${current.id}/composition/validate`)
  await openEventTab(member, fx, current.slug, 'equipe')
  await expect(member.getByText('Joue deux fois de suite')).toHaveCount(0)
  await memberContext.close()
})

import { expect, test } from '@playwright/test'

/**
 * Recette 3.25 — accès invité scope ADR-0021 (T1 / profil e2e).
 * Matrice complète : _bmad-output/test-artifacts/test-design-story-3-25.md
 */

import {
  E2E_GUEST_CARNET_ONLY_TOKEN,
  E2E_GUEST_LAETITIA_TOKEN,
  E2E_GUEST_MULTI_TOKEN,
  E2E_GUEST_PIOTRIX_TOKEN,
  E2E_GUEST_RUBEN_TOKEN,
  E2E_MEMBER_ID_TOKEN,
} from './fixtures/story-3-25.constants'
import { resetStory325Fixture, type Story325Fixture } from './helpers/e2e-api'
import { saisonWorkspacePath } from './helpers/e1-routes'
import {
  clickBreadcrumbSeasonLink,
  clickSeasonCard,
  expectAgendaCardAbsent,
  expectAgendaCardVisible,
  expectSeasonWorkspaceAgendaEvents,
  expectSeasonViewTabs,
  gotoAgenda,
  gotoSeasonWorkspace,
  gotoTroupeHub,
  openGuestEventTab,
  signInGuest,
  switchSeasonView,
} from './helpers/story-3-25.ui'

test.describe.configure({ mode: 'serial', retries: 0 })

test.describe('Recette 3.25 — guest scoped access (E2E)', () => {
  let fx: Story325Fixture

  test.beforeAll(async ({ request }) => {
    fx = await resetStory325Fixture(request)
  })

  test('3.25-E2E-01 — carnet-only linked account sees empty participation agenda', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_CARNET_ONLY_TOKEN, baseURL!)
    await gotoAgenda(page)
    await expect(page.getByRole('heading', { name: 'Aucune saison pour l’instant' })).toBeVisible()
  })

  test('3.25-E2E-02 — Laetitia SEASON guest agenda lists published season events only', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_LAETITIA_TOKEN, baseURL!)
    await gotoAgenda(page)
    for (const title of fx.laetitiaPublishedEventTitles) {
      await expectAgendaCardVisible(page, title)
    }
    await expectAgendaCardAbsent(page, fx.laetitiaDraftEventTitle)
  })

  test('3.25-E2E-03 — Laetitia partial workspace shows Agenda tab only', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_LAETITIA_TOKEN, baseURL!)
    await gotoSeasonWorkspace(page, fx, fx.laetitiaSeasonSlug)
    await expectSeasonViewTabs(page, { agenda: true, history: false, stats: false })
  })

  test('3.25-E2E-04 — Laetitia season agenda lists in-scope published events', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_LAETITIA_TOKEN, baseURL!)
    await gotoSeasonWorkspace(page, fx, fx.laetitiaSeasonSlug, 'agenda', { reload: true })
    await expectSeasonWorkspaceAgendaEvents(
      page,
      fx.laetitiaSeasonId,
      fx.laetitiaPublishedEventTitles.length,
    )
    for (const title of fx.laetitiaPublishedEventTitles) {
      await expectAgendaCardVisible(page, title)
    }
    await expectAgendaCardAbsent(page, fx.laetitiaDraftEventTitle)
  })

  test('3.25-E2E-05 — Ruben EVENT guest personal agenda shows single future invited event', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await gotoAgenda(page)
    await expectAgendaCardVisible(page, fx.rubenInvitedFutureTitle)
    await expectAgendaCardAbsent(page, fx.rubenSiblingFutureTitle)
    await expectAgendaCardAbsent(page, fx.rubenUnpublishedInvitedTitle)
  })

  test('3.25-E2E-06 — Ruben EVENT workspace exposes Agenda and Historique without Stats', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await gotoSeasonWorkspace(page, fx, fx.rubenSeasonSlug)
    await expectSeasonViewTabs(page, { agenda: true, history: true, stats: false })
  })

  test('3.25-E2E-07 — Ruben history tab shows invited past event only', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await gotoSeasonWorkspace(page, fx, fx.rubenSeasonSlug, 'history')
    await switchSeasonView(page, 'Historique')
    await expectAgendaCardVisible(page, fx.rubenInvitedPastTitle)
    await expectAgendaCardAbsent(page, fx.rubenSiblingPastTitle)
  })

  test('3.25-E2E-08 — Ruben breadcrumb season link opens workspace (no /agenda redirect)', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await openGuestEventTab(page, fx, fx.rubenSeasonSlug, fx.rubenInvitedFutureSlug, 'infos')
    await clickBreadcrumbSeasonLink(page, fx, fx.rubenSeasonSlug)
    await expect(page).toHaveURL(
      new RegExp(`/saison/${fx.troupeSlug}/${fx.rubenSeasonSlug}`),
    )
    await expect(page.locator('app-season-header')).toBeVisible()
  })

  test('3.25-E2E-09 — Ruben opens invited season from troupe hub card', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await gotoTroupeHub(page, fx)
    await clickSeasonCard(page, 'Guest 325 Ruben')
    await expect(page).toHaveURL(
      new RegExp(`/saison/${fx.troupeSlug}/${fx.rubenSeasonSlug}`),
    )
    await expect(page.locator('app-season-header')).toBeVisible()
  })

  test('3.25-E2E-10 — Ruben home shortcut Ma saison opens last visited guest season', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await gotoSeasonWorkspace(page, fx, fx.rubenSeasonSlug)
    await page.goto('/accueil')
    await expect(page.locator('app-member-home-todo')).toBeVisible({ timeout: 30_000 })
    const seasonShortcut = page.getByRole('link', { name: /Ma saison : Guest 325 Ruben/i })
    await expect(seasonShortcut).toBeVisible({ timeout: 30_000 })
    await seasonShortcut.click()
    await expect(page).toHaveURL(
      new RegExp(`/saison/${fx.troupeSlug}/${fx.rubenSeasonSlug}`),
    )
  })

  test('3.25-E2E-11 — Ruben writes availability on invited event', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await openGuestEventTab(page, fx, fx.rubenSeasonSlug, fx.rubenInvitedFutureSlug, 'dispos')
    const available = page.locator('.availability-form__status--available').first()
    await available.click()
    await expect(page.locator('.availability-form__status--available.mat-button-toggle-checked')).toBeVisible()
  })

  test('3.25-E2E-12 — Ruben équipe tab empty state without load error', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await openGuestEventTab(page, fx, fx.rubenSeasonSlug, 'guest-325-ruben-brouillon-invite', 'equipe')
    await expect(page.getByText('Aucun tirage pour le moment')).toBeVisible()
    await expect(page.getByText('Impossible de charger la composition.')).toHaveCount(0)
  })

  test('3.25-E2E-13 — Ruben deep link to non-invited sibling event is denied', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await page.goto(
      `/saison/${fx.troupeSlug}/${fx.rubenSeasonSlug}/event/guest-325-ruben-futur-sibling?tab=dispos`,
    )
    await expect(page).not.toHaveURL(/guest-325-ruben-futur-sibling/, { timeout: 30_000 })
    await expect(page.getByLabel('Choix de disponibilité')).toHaveCount(0)
  })

  test('3.25-E2E-14 — Piotrix sees invited season A only in hub and workspace', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_PIOTRIX_TOKEN, baseURL!)
    await gotoTroupeHub(page, fx)
    await expect(page.locator('app-season-card', { hasText: 'Guest 325 Piotrix A' })).toBeVisible()
    await expect(page.locator('app-season-card', { hasText: 'Guest 325 Piotrix B' })).toHaveCount(0)
    await gotoSeasonWorkspace(page, fx, fx.piotrixSeasonASlug)
    await expectAgendaCardVisible(page, fx.piotrixInvitedEventTitle)
    await expectAgendaCardAbsent(page, 'Piotrix sibling futur')
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.piotrixSeasonBSlug))
    await expect(page).not.toHaveURL(new RegExp(`${fx.piotrixSeasonBSlug}/`), { timeout: 30_000 })
    await expect(page.getByText('Piotrix saison B spectacle')).toHaveCount(0)
  })

  test('3.25-E2E-15 — Multi-scope guest agenda aggregates season and event invitations', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_MULTI_TOKEN, baseURL!)
    await gotoAgenda(page)
    for (const title of fx.multiAgendaEventTitles) {
      await expectAgendaCardVisible(page, title)
    }
    const agendaResponse = await page.request.get('/v1/me/agenda?scope=upcoming')
    expect(agendaResponse.ok()).toBeTruthy()
    const payload = (await agendaResponse.json()) as { content: unknown[] }
    expect(payload.content.length).toBe(fx.multiAgendaEventTitles.length)
  })

  test('3.25-E2E-16 — Laetitia troupe absent from Découvrir when already in Mes troupes', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_LAETITIA_TOKEN, baseURL!)
    await page.goto('/troupes#decouvrir')
    await expect(page.locator('app-troupes-list')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Les Improbots').first()).toBeVisible()
    const discoverCards = page.locator('#decouvrir app-troupe-card')
    await expect(discoverCards.filter({ hasText: 'Les Improbots' })).toHaveCount(0)
  })

  test('3.25-E2E-17 — Angie member regression keeps full season workspace tabs', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_MEMBER_ID_TOKEN, baseURL!)
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.memberSeasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
    await expectSeasonViewTabs(page, { agenda: true, history: true, stats: true })
  })

  test('3.25-E2E-18 — Ruben reads validated composition without organizer actions', async ({
    page,
    baseURL,
  }) => {
    await signInGuest(page, E2E_GUEST_RUBEN_TOKEN, baseURL!)
    await openGuestEventTab(page, fx, fx.rubenSeasonSlug, fx.rubenInvitedFutureSlug, 'equipe')
    await expect(page.locator('app-event-equipe-tab').getByText('Ruben Guest').first()).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('button', { name: 'Tirer au sort' })).toHaveCount(0)
    await expect(page.getByText('Impossible de charger la composition.')).toHaveCount(0)
  })
})

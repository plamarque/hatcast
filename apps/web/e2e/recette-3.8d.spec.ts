import { expect, test } from '@playwright/test'

/**
 * Recette 3.8d — typeahead carnet (T1 only).
 * Requires API profile `e2e` + POST /v1/e2e/fixtures/story-3-8d/reset (Les Improbots seed).
 * Not runnable on staging as-is (Demo / La Malice only — see recette-manuelle-story-3-8d.md §10).
 */

import { resetStory38dFixture } from './helpers/e2e-api'
import {
  eventParticipantsPath,
  excludeMemberFromEvent,
  expectEventMemberAbsent,
  expectEventMemberInMembersSection,
  expectEventMemberInExternesSection,
  expectEventMemberVisible,
  expectNoTypeaheadOptions,
  expectSeasonMemberAbsent,
  expectSeasonMemberVisible,
  openAddParticipantDialog,
  removeMemberFromSeason,
  seasonParticipantsPath,
  selectTypeaheadByName,
  submitAddParticipantDialog,
} from './helpers/story-3-8d.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Recette 3.8d — typeahead carnet (E2E)', () => {
  test('3.8d-E2E-03 — Angie exclue du typeahead saison (D)', async ({ page, request }) => {
    const fx = await resetStory38dFixture(request)
    await page.goto(seasonParticipantsPath(fx.seasonSlug))
    await expectSeasonMemberVisible(page, fx.angieDisplayName)

    const dialog = await openAddParticipantDialog(page)
    await dialog.getByRole('combobox', { name: 'Nom affiché' }).fill('Ang')
    await expectNoTypeaheadOptions(dialog)
    await dialog.getByRole('button', { name: 'Annuler' }).click()
  })

  test('3.8d-E2E-02 — membre ré-ajouté via typeahead, nom lisible (C)', async ({ page, request }) => {
    const fx = await resetStory38dFixture(request)
    await page.goto(seasonParticipantsPath(fx.seasonSlug))
    await expectSeasonMemberVisible(page, fx.angieDisplayName)

    await removeMemberFromSeason(page, fx.angieDisplayName)
    await expectSeasonMemberAbsent(page, fx.angieDisplayName)

    const dialog = await openAddParticipantDialog(page)
    await selectTypeaheadByName(dialog, 'Ang', fx.angieDisplayName)
    await expect(dialog.getByText('Externe saison')).toHaveCount(0)
    await submitAddParticipantDialog(page, dialog)
    await expectSeasonMemberVisible(page, fx.angieDisplayName)
  })

  test('3.8d-E2E-01 — externe name-only Ruben via typeahead (A)', async ({ page, request }) => {
    const fx = await resetStory38dFixture(request)
    await page.goto(seasonParticipantsPath(fx.seasonSlug))
    await expectSeasonMemberAbsent(page, fx.rubenDisplayName)

    const dialog = await openAddParticipantDialog(page)
    await expect(dialog.getByText('membres et externes du carnet')).toBeVisible()
    await selectTypeaheadByName(dialog, 'Rub', fx.rubenDisplayName)
    await expect(dialog.getByText('Externe saison — disponibilités sur toute la saison')).toBeVisible()
    await submitAddParticipantDialog(page, dialog)
    await expectSeasonMemberVisible(page, fx.rubenDisplayName)
  })

  test('3.8d-E2E-04 — externe spectacle scope + checkbox off (F)', async ({ page, request }) => {
    const fx = await resetStory38dFixture(request)
    await page.goto(eventParticipantsPath(fx.seasonSlug, fx.eventSlug))
    await expectEventMemberAbsent(page, fx.rubenDisplayName)

    const dialog = await openAddParticipantDialog(page)
    await expect(dialog.getByText('participants de la saison')).toBeVisible()
    await selectTypeaheadByName(dialog, 'Rub', fx.rubenDisplayName)
    await expect(dialog.getByText('Externe spectacle — ce spectacle seulement')).toBeVisible()
    const seasonOptIn = dialog.getByRole('checkbox', { name: 'Ajouter aussi à la saison' })
    await expect(seasonOptIn).toBeVisible()
    await expect(seasonOptIn).not.toBeChecked()
    await submitAddParticipantDialog(page, dialog, 'Participant ajouté au spectacle.')

    await page.goto(seasonParticipantsPath(fx.seasonSlug))
    await expectSeasonMemberAbsent(page, fx.rubenDisplayName)
    await page.goto(eventParticipantsPath(fx.seasonSlug, fx.eventSlug))
    await expectEventMemberInExternesSection(page, fx.rubenDisplayName)
  })

  test('3.8d-E2E-05 — membre exclu ré-intégré en section Membres (H Angie)', async ({
    page,
    request,
  }) => {
    const fx = await resetStory38dFixture(request)
    await excludeMemberFromEvent(page, fx.seasonSlug, fx.eventSlug, fx.angieDisplayName)
    await expectEventMemberAbsent(page, fx.angieDisplayName)

    const dialog = await openAddParticipantDialog(page)
    await selectTypeaheadByName(dialog, 'Ang', fx.angieDisplayName)
    await expect(dialog.getByText('Externe spectacle')).toHaveCount(0)
    await submitAddParticipantDialog(page, dialog, 'Participant ajouté au spectacle.')

    await expectEventMemberInMembersSection(page, fx.angieDisplayName)
    await expectEventMemberVisible(page, fx.angieDisplayName)
  })
})

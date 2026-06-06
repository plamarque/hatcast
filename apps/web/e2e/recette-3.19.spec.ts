import { expect, test } from '@playwright/test'

import {
  getCompositionSlotForParticipant,
  listSeasonOrganizerUserIds,
  resetStory319Fixture,
} from './helpers/e2e-api'
import {
  addTroupeMemberByEmail,
  eventParticipantsPath,
  excludeMemberFromEvent,
  expectEventMemberAbsent,
  expectSeasonMemberAbsent,
  expectSeasonMemberVisible,
  expectTroupeMemberActive,
  promoteToSeasonOrganizer,
  readdExternalByName,
  readdSeasonMemberByEmail,
  removeExternalFromSeason,
  removeMemberFromSeason,
  removeMemberFromTroupe,
  seasonParticipantsPath,
  troupeMembresPath,
} from './helpers/story-3-19.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Recette 3.19 — retrait roster saison (E2E)', () => {
  test('S1–S6 + S9 — parcours principal', async ({ page, request }) => {
    const fx = await resetStory319Fixture(request)
    const member = fx.targetMemberDisplayName
    const compositionBefore = await getCompositionSlotForParticipant(
      page,
      fx.seasonAId,
      fx.historyEventSlug,
      fx.targetSeasonParticipantId,
    )
    expect(compositionBefore.participantId).toBe(fx.targetSeasonParticipantId)

    // S1 — exclusion événement (masqué sur E, présent roster saison)
    await excludeMemberFromEvent(page, fx.seasonASlug, fx.eventSlugForExclusion, member)
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberVisible(page, member)

    // S2 — retrait saison membre (adhésion troupe conservée)
    await removeMemberFromSeason(page, member)
    await expectTroupeMemberActive(page, fx.troupeSlug, member)

    // S3 — garde de synchronisation
    await page.reload()
    await expectSeasonMemberAbsent(page, member)
    await page.goto('/troupes')
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberAbsent(page, member)

    // S4 — portée saison-locale
    await page.goto(seasonParticipantsPath(fx.seasonBSlug))
    await expectSeasonMemberVisible(page, member)

    // S5 — ré-inclusion via Ajouter + exclusion événement conservée
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await readdSeasonMemberByEmail(page, fx.targetMemberEmail)
    await expectSeasonMemberVisible(page, member)
    await page.goto(eventParticipantsPath(fx.seasonASlug, fx.eventSlugForExclusion))
    await expectEventMemberAbsent(page, member)

    // S9 — conservation historique (même season_participant_id en composition)
    const compositionAfter = await getCompositionSlotForParticipant(
      page,
      fx.seasonAId,
      fx.historyEventSlug,
      fx.targetSeasonParticipantId,
    )
    expect(compositionAfter.participantId).toBe(fx.targetSeasonParticipantId)
    expect(compositionAfter.slotCount).toBe(compositionBefore.slotCount)

    // S6 — cascade troupe + réactivation
    await removeMemberFromTroupe(page, fx.troupeSlug, member)
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberAbsent(page, member)
    await page.goto(seasonParticipantsPath(fx.seasonBSlug))
    await expectSeasonMemberAbsent(page, member)

    await page.goto(troupeMembresPath(fx.troupeSlug))
    await addTroupeMemberByEmail(page, fx.targetMemberEmail)
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberVisible(page, member)
    await page.goto(seasonParticipantsPath(fx.seasonBSlug))
    await expectSeasonMemberVisible(page, member)
  })

  test('S7 — rétrogradation organisateur·ice de saison', async ({ page, request }) => {
    const fx = await resetStory319Fixture(request)
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberVisible(page, fx.targetMemberDisplayName)

    await promoteToSeasonOrganizer(page, fx.targetMemberDisplayName)
    const organizersBefore = await listSeasonOrganizerUserIds(page, fx.seasonAId)
    expect(organizersBefore).toContain(fx.targetMemberUserId)

    await removeMemberFromSeason(page, fx.targetMemberDisplayName)

    const organizersAfter = await listSeasonOrganizerUserIds(page, fx.seasonAId)
    expect(organizersAfter).not.toContain(fx.targetMemberUserId)
  })

  test('S8 — retrait participant externe name-only', async ({ page, request }) => {
    const fx = await resetStory319Fixture(request)
    await page.goto(seasonParticipantsPath(fx.seasonASlug))
    await expectSeasonMemberVisible(page, fx.externalParticipantName)

    await removeExternalFromSeason(page, fx.externalParticipantName)
    await page.reload()
    await expectSeasonMemberAbsent(page, fx.externalParticipantName)

    await readdExternalByName(page, fx.externalParticipantName)
    await expectSeasonMemberVisible(page, fx.externalParticipantName)
    await page.reload()
    await expectSeasonMemberVisible(page, fx.externalParticipantName)
  })
})

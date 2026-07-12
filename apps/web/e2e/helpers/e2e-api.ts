import type { APIRequestContext, Page } from '@playwright/test'

import { E2E_API_KEY } from '../fixtures/e1-cutover.constants'

const apiBase = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://127.0.0.1:8080'

export type E1CutoverFixture = {
  troupeSlug: string
  seasonSlug: string
  seasonId: string
  memberDisplayName: string
  memberEmail: string
  memberUserSlug: string
  memberUserId: string
  memberSeasonParticipantId: string
  eventDrawSlug: string
  eventDrawTitle: string
  /** Staging: first title from `/v1/me/agenda?scope=upcoming` (may be empty post-migration). */
  agendaUpcomingEventTitle?: string
  /** Staging: most recent past event in the migrated season (Historique). */
  seasonHistoryLatestTitle?: string
  seasonHistoryLatestSlug?: string
  eventActiviteSlug: string
  eventActiviteTitle: string
  eventPendingSlug: string
  eventPendingTitle: string
}

export async function resetE1CutoverFixture(request: APIRequestContext): Promise<E1CutoverFixture> {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/e1-cutover/reset`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
    },
  })
  if (!response.ok()) {
    throw new Error(`E1 fixture reset failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<E1CutoverFixture>
}

export type Story319Fixture = {
  troupeSlug: string
  seasonASlug: string
  seasonBSlug: string
  seasonAId: string
  targetMemberDisplayName: string
  targetMemberEmail: string
  targetMemberUserId: string
  targetSeasonParticipantId: string
  externalParticipantName: string
  eventSlugForExclusion: string
  historyEventSlug: string
}

export type Story38dFixture = {
  troupeSlug: string
  seasonSlug: string
  seasonId: string
  eventSlug: string
  eventId: string
  angieDisplayName: string
  angieSeasonParticipantId: string
  rubenDisplayName: string
  rubenMembershipId: string
  laetitiaDisplayName: string
  laetitiaEmail: string
  laetitiaMembershipId: string
}

export type Story325Fixture = {
  troupeSlug: string
  memberSeasonSlug: string
  laetitiaSeasonSlug: string
  laetitiaSeasonId: string
  laetitiaPublishedEventTitles: string[]
  laetitiaDraftEventTitle: string
  rubenSeasonSlug: string
  rubenSeasonId: string
  rubenInvitedFutureSlug: string
  rubenInvitedFutureTitle: string
  rubenSiblingFutureTitle: string
  rubenInvitedPastTitle: string
  rubenSiblingPastTitle: string
  rubenUnpublishedInvitedTitle: string
  piotrixSeasonASlug: string
  piotrixSeasonBSlug: string
  piotrixInvitedEventSlug: string
  piotrixInvitedEventTitle: string
  multiAgendaEventTitles: string[]
}

export async function resetStory325Fixture(request: APIRequestContext): Promise<Story325Fixture> {
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await request.post(`${apiBase}/v1/e2e/fixtures/story-3-25/reset`, {
      headers: {
        'X-Hatcast-E2E-Key': E2E_API_KEY,
      },
    })
    if (response.ok()) {
      return response.json() as Promise<Story325Fixture>
    }
    const body = await response.text()
    if (response.status() === 409 && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000))
      continue
    }
    throw new Error(`Story 3.25 fixture reset failed (${response.status()}): ${body}`)
  }
  throw new Error('Story 3.25 fixture reset failed after retries')
}

export async function resetStory319Fixture(request: APIRequestContext): Promise<Story319Fixture> {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/story-3-19/reset`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
    },
  })
  if (!response.ok()) {
    throw new Error(`Fixture reset failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<Story319Fixture>
}

export async function resetStory38dFixture(request: APIRequestContext): Promise<Story38dFixture> {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/story-3-8d/reset`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
    },
  })
  if (!response.ok()) {
    throw new Error(`Story 3.8d fixture reset failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<Story38dFixture>
}

export type AgendaParticipationCellFixture = {
  troupeSlug: string
  seasonSlug: string
  seasonId: string
  memberSeasonParticipantId: string
  eventUnknownDispoSlug: string
  eventUnknownDispoTitle: string
  eventPendingSlug: string
  eventPendingTitle: string
  eventHistorySlug: string
  eventHistoryTitle: string
}

export async function resetAgendaParticipationCellFixture(
  request: APIRequestContext,
): Promise<AgendaParticipationCellFixture> {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/agenda-participation-cell/reset`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
    },
  })
  if (!response.ok()) {
    throw new Error(
      `Agenda participation cell fixture reset failed (${response.status()}): ${await response.text()}`,
    )
  }
  return response.json() as Promise<AgendaParticipationCellFixture>
}

export async function signInWithE2eToken(
  request: APIRequestContext,
  idToken: string,
  baseURL: string,
) {
  const response = await request.post(`${baseURL}/v1/auth/google`, {
    data: { idToken, rememberMe: true },
  })
  if (!response.ok()) {
    throw new Error(`E2E sign-in failed (${response.status()}): ${await response.text()}`)
  }
}

export async function listSeasonOrganizerUserIds(
  page: Page,
  seasonId: string,
): Promise<string[]> {
  const response = await page.request.get(`/v1/seasons/${seasonId}/organizers`)
  if (!response.ok()) {
    throw new Error(`List organizers failed (${response.status()}): ${await response.text()}`)
  }
  const data = (await response.json()) as Array<{ userId: string }>
  return data.map((o) => o.userId)
}

export async function getCompositionSlotForParticipant(
  page: Page,
  seasonId: string,
  eventSlug: string,
  targetSeasonParticipantId: string,
): Promise<{ participantId: string | null; slotCount: number }> {
  const eventResponse = await page.request.get(
    `/v1/seasons/${seasonId}/events/by-slug/${encodeURIComponent(eventSlug)}`,
  )
  if (!eventResponse.ok()) {
    throw new Error(`Event lookup failed (${eventResponse.status()}): ${await eventResponse.text()}`)
  }
  const event = (await eventResponse.json()) as { id: string }
  const compositionResponse = await page.request.get(
    `/v1/seasons/${seasonId}/events/${event.id}/composition`,
  )
  if (!compositionResponse.ok()) {
    throw new Error(
      `Composition fetch failed (${compositionResponse.status()}): ${await compositionResponse.text()}`,
    )
  }
  const composition = (await compositionResponse.json()) as {
    slots: Array<{ participantId: string | null }>
  }
  const slot = composition.slots.find((s) => s.participantId === targetSeasonParticipantId)
  return { participantId: slot?.participantId ?? null, slotCount: composition.slots.length }
}

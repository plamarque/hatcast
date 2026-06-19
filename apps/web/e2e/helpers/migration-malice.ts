import type { APIRequestContext } from '@playwright/test'

import { MIGRATION_MALICE_GOLDEN } from '../fixtures/migration-malice.constants'

type TroupeListItem = { id: string; slug: string }
type SeasonRef = { id: string; slug: string; title: string }
type SeasonEvent = {
  id: string
  slug: string
  title: string
  startsAt: string
  archived: boolean
  category?: string | null
  templateType?: string | null
  availabilityOpenedAt?: string | null
}
type PagedEvents = {
  content: SeasonEvent[]
  totalElements: number
  totalPages: number
}

export type MigrationMaliceFixture = {
  troupeSlug: string
  seasonSlug: string
  seasonId: string
  troupeId: string
  memberUserSlug: string
  totalEvents: number
  deplacementEventSlug: string
  deplacementEventTitle: string
  archivedEventSlug: string
  archivedEventTitle: string
  validatedCompositionEventSlug: string
  matchCamboSlug: string
}

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined
}

async function apiGet<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path)
  if (!response.ok()) {
    throw new Error(`GET ${path} → ${response.status()}: ${await response.text()}`)
  }
  return response.json() as Promise<T>
}

async function listSeasonEvents(request: APIRequestContext, seasonId: string): Promise<SeasonEvent[]> {
  const all: SeasonEvent[] = []
  for (let page = 0; page < 20; page++) {
    const paged = await apiGet<PagedEvents>(
      request,
      `/v1/seasons/${seasonId}/events?page=${page}&size=100&scope=all`,
    )
    all.push(...paged.content)
    if (page + 1 >= paged.totalPages) {
      break
    }
  }
  return all
}

function isDeplacement(event: SeasonEvent): boolean {
  return (
    event.category === 'deplacements' ||
    event.templateType === 'deplacement'
  )
}

let cachedFixture: MigrationMaliceFixture | null = null

/** Resolve Malice migration anchors via staging API (PLAYWRIGHT_STAGING_E2E=1). */
export async function discoverMigrationMaliceContext(
  request: APIRequestContext,
  memberUserSlug: string,
): Promise<MigrationMaliceFixture> {
  if (cachedFixture) {
    return cachedFixture
  }

  const troupeSlug = MIGRATION_MALICE_GOLDEN.troupeSlug
  const seasonSlug = env('HATCAST_E2E_SEASON_SLUG')
  if (!seasonSlug) {
    throw new Error('Missing HATCAST_E2E_SEASON_SLUG for migration E2E')
  }

  const troupes = await apiGet<TroupeListItem[]>(request, '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === troupeSlug)
  if (!troupe) {
    throw new Error(`Troupe "${troupeSlug}" not visible for migration E2E session`)
  }

  const season = await apiGet<SeasonRef>(
    request,
    `/v1/troupes/${troupe.id}/seasons/by-slug/${encodeURIComponent(seasonSlug)}`,
  )
  const events = await listSeasonEvents(request, season.id)
  if (events.length < MIGRATION_MALICE_GOLDEN.minSeasonEvents) {
    throw new Error(
      `Migration E2E: expected >= ${MIGRATION_MALICE_GOLDEN.minSeasonEvents} events, got ${events.length}`,
    )
  }

  const deplacement = events.find((e) => !e.archived && isDeplacement(e))
  const archived = events.find((e) => e.archived)
  const validatedComposition = events.find((e) => e.slug === env('HATCAST_E2E_EVENT_ACTIVITE_SLUG'))
    ?? events.find((e) => !e.archived && e.availabilityOpenedAt)
    ?? events.find((e) => e.archived)

  if (!deplacement) {
    throw new Error('Migration E2E: no deplacement event found in season')
  }
  if (!archived) {
    throw new Error('Migration E2E: no archived event found in season')
  }
  if (!validatedComposition) {
    throw new Error('Migration E2E: no activité anchor event found in season')
  }

  cachedFixture = {
    troupeSlug,
    seasonSlug,
    seasonId: season.id,
    troupeId: troupe.id,
    memberUserSlug,
    totalEvents: events.length,
    deplacementEventSlug: deplacement.slug,
    deplacementEventTitle: deplacement.title,
    archivedEventSlug: archived.slug,
    archivedEventTitle: archived.title,
    validatedCompositionEventSlug: validatedComposition.slug,
    matchCamboSlug: MIGRATION_MALICE_GOLDEN.matchCamboSlug,
  }
  return cachedFixture
}

export function requiredMigrationMemberSlug(): string {
  const slug = env('HATCAST_E2E_MEMBER_SLUG')
  if (!slug) {
    throw new Error('Missing HATCAST_E2E_MEMBER_SLUG for migration E2E')
  }
  return slug
}

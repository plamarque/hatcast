import type { SeasonResponse } from '../seasons/season-api.service'
import type { TroupeListItem } from '../troupes/troupe-api.service'

function dateValue(value: string | null | undefined): number {
  const parsed = value ? Date.parse(value) : NaN
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY
}

function newestFirst(a: string | null | undefined, b: string | null | undefined): number {
  const left = dateValue(a)
  const right = dateValue(b)
  return left === right ? 0 : left > right ? -1 : 1
}

export function orderedMemberTroupes(troupes: TroupeListItem[]): TroupeListItem[] {
  return troupes.filter((troupe) => troupe.membership.status === 'ACTIVE').sort((a, b) =>
    newestFirst(a.membership.createdAt, b.membership.createdAt) ||
    a.name.localeCompare(b.name, 'fr') || a.id.localeCompare(b.id),
  )
}

export function canOpenSeason(season: SeasonResponse): boolean {
  return !season.archived && season.guestSeasonWorkspaceMode !== 'NONE'
}

export function canOpenSeasonStatistics(season: SeasonResponse): boolean {
  return canOpenSeason(season) && (season.guestSeasonWorkspaceMode ?? 'FULL') === 'FULL'
}

export function orderedActiveSeasons(seasons: SeasonResponse[]): SeasonResponse[] {
  return seasons.filter(canOpenSeason).sort((a, b) =>
    newestFirst(a.startDate, b.startDate) ||
    a.title.localeCompare(b.title, 'fr') || a.id.localeCompare(b.id),
  )
}

export function selectMemberSeason(seasons: SeasonResponse[], rememberedSlug: string | null): SeasonResponse | null {
  const eligible = orderedActiveSeasons(seasons)
  return eligible.find((season) => season.slug === rememberedSlug) ?? eligible[0] ?? null
}

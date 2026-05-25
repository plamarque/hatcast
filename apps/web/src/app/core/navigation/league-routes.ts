/** Canonical URL prefix for league workspace routes (product vocabulary: Ligue). */
export const LEAGUE_ROUTE_PREFIX = 'ligue'

export function leagueWorkspacePath(slug: string): string[] {
  return ['/', LEAGUE_ROUTE_PREFIX, slug]
}

export function leagueEventPath(slug: string, eventId: string): string[] {
  return ['/', LEAGUE_ROUTE_PREFIX, slug, 'event', eventId]
}

export function leagueAdminMembresPath(slug: string): string[] {
  return ['/', LEAGUE_ROUTE_PREFIX, slug, 'admin', 'membres']
}

export function leagueAdminParticipantsPath(slug: string): string[] {
  return ['/', LEAGUE_ROUTE_PREFIX, slug, 'admin', 'participants']
}

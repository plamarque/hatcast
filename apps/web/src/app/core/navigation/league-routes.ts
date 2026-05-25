/**
 * Legacy URL prefix (`/ligue/*`); app routes redirect to canonical `/saison/*` (ADR 0013).
 * Prefer `saisonWorkspacePath` / `saisonEventPath` from `troupe-routes.ts` for new navigations.
 */
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

/** Canonical URL prefix for troupe hub routes (ADR 0013). */
export const TROUPE_HUB_ROUTE_PREFIX = 'troupes'

export function troupesListPath(): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX]
}

export function troupeHubPath(slug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, slug]
}

/** Preferred season workspace path for new chrome links (canonical `/saison/`). */
export function saisonWorkspacePath(slug: string): string[] {
  return ['/saison', slug]
}

/** Canonical saison admin paths for scope admin bar (Story 17.2). */
export function saisonAdminParticipantsPath(slug: string): string[] {
  return ['/saison', slug, 'admin', 'participants']
}

export function saisonAdminMembresPath(slug: string): string[] {
  return ['/saison', slug, 'admin', 'membres']
}

export function saisonEventPath(slug: string, eventId: string): string[] {
  return ['/saison', slug, 'event', eventId]
}

/** Troupe admin membres under canonical hub prefix (ADR 0013). */
export function troupeAdminMembresPath(troupeSlug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, troupeSlug, 'admin', 'membres']
}

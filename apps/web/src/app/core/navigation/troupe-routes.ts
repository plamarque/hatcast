/** Canonical URL prefix for troupe hub routes (ADR 0013). */
export const TROUPE_HUB_ROUTE_PREFIX = 'troupes'

export function troupesListPath(): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX]
}

export function troupeHubPath(slug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, slug]
}

/** Season workspace — troupe slug is globally unique (ADR 0013 + disambiguation). */
export function saisonWorkspacePath(troupeSlug: string, seasonSlug: string): string[] {
  return ['/saison', troupeSlug.trim(), seasonSlug.trim()]
}

/** Troupe admin audit journal under canonical hub prefix. */
export function troupeAdminAuditPath(troupeSlug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, troupeSlug, 'admin', 'audit']
}

export function saisonAdminAuditPath(troupeSlug: string, seasonSlug: string): string[] {
  return ['/saison', troupeSlug, seasonSlug, 'admin', 'audit']
}

/** Canonical saison admin paths for scope admin bar (Story 17.2). */
export function saisonAdminParticipantsPath(troupeSlug: string, seasonSlug: string): string[] {
  return ['/saison', troupeSlug, seasonSlug, 'admin', 'participants']
}

export function saisonAdminMembresPath(troupeSlug: string, seasonSlug: string): string[] {
  return ['/saison', troupeSlug, seasonSlug, 'admin', 'membres']
}

export function saisonEventPath(
  troupeSlug: string,
  seasonSlug: string,
  eventSlug: string,
): string[] {
  return ['/saison', troupeSlug, seasonSlug, 'event', eventSlug]
}

export function saisonEventParticipantsAdminPath(
  troupeSlug: string,
  seasonSlug: string,
  eventSlug: string,
): string[] {
  return ['/saison', troupeSlug, seasonSlug, 'event', eventSlug, 'admin', 'participants']
}

/** Troupe admin membres under canonical hub prefix (ADR 0013). */
export function troupeAdminMembresPath(troupeSlug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, troupeSlug, 'admin', 'membres']
}

/** Troupe settings page — categories tab (Story 17.40). */
export function troupeAdminSettingsPath(troupeSlug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, troupeSlug, 'admin', 'parametres']
}

/** @deprecated Prefer {@link saisonWorkspacePath} with troupe slug. Legacy `/saison/:seasonSlug` only. */
export function legacySaisonWorkspacePath(seasonSlug: string): string[] {
  return ['/saison', seasonSlug.trim()]
}

export function parseSaisonMemberEntryPath(
  path: string,
): { troupeSlug: string; seasonSlug: string } | null {
  const scoped = parseCanonicalSaisonScopedPath(path)
  if (!scoped || scoped.suffixSegments.length > 0) {
    return null
  }
  return { troupeSlug: scoped.troupeSlug, seasonSlug: scoped.seasonSlug }
}

/** Canonical `/saison/:troupeSlug/:seasonSlug/...` (not legacy deep links). */
export function parseCanonicalSaisonScopedPath(pathname: string): {
  troupeSlug: string
  seasonSlug: string
  suffixSegments: string[]
} | null {
  const segments = pathname.trim().split('/').filter(Boolean)
  if (segments.length < 3 || segments[0] !== 'saison') {
    return null
  }
  if (segments.length === 4 && (segments[2] === 'event' || segments[2] === 'admin')) {
    return null
  }
  const troupeSlug = segments[1]?.trim()
  const seasonSlug = segments[2]?.trim()
  if (!troupeSlug || !seasonSlug) {
    return null
  }
  return { troupeSlug, seasonSlug, suffixSegments: segments.slice(3) }
}

/** Suffix after legacy `/saison/:seasonSlug` (e.g. `event/foo` or `admin/participants`). */
export function legacySaisonSuffixFromPathname(pathname: string): string {
  const segments = pathname.trim().split('/').filter(Boolean)
  if (segments.length <= 2 || segments[0] !== 'saison') {
    return ''
  }
  if (segments[2] === 'event' || segments[2] === 'admin') {
    return segments.slice(2).join('/')
  }
  return ''
}

export function canonicalSaisonCommands(
  troupeSlug: string,
  seasonSlug: string,
  suffix = '',
): string[] {
  const base = ['/saison', troupeSlug.trim(), seasonSlug.trim()]
  const trimmedSuffix = suffix.trim()
  if (!trimmedSuffix) {
    return base
  }
  return [...base, ...trimmedSuffix.split('/').filter(Boolean)]
}

export function saisonMemberEntryPath(troupeSlug: string, seasonSlug: string): string {
  return `/saison/${troupeSlug.trim()}/${seasonSlug.trim()}`
}

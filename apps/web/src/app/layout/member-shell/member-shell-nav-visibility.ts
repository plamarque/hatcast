/** Normalized path (no query, hash, or trailing slash). */
export function pathFromUrl(url: string): string {
  const withoutHash = url.split('#')[0] ?? url
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash
  if (!withoutQuery || withoutQuery === '') {
    return '/'
  }
  return withoutQuery.endsWith('/') && withoutQuery.length > 1
    ? withoutQuery.slice(0, -1)
    : withoutQuery
}

/** True on member stats / clin d'œil (`/membre/:userSlug`). */
export function isMemberStatsPath(path: string): boolean {
  return /^\/membre\/[^/]+$/.test(path)
}

/** True on Mon compte shell and child tab routes (`/compte`, `/compte/preferences`, …). */
export function isAccountPath(path: string): boolean {
  return path === '/compte' || path.startsWith('/compte/')
}

const AUTH_PATHS_WITHOUT_NAV = new Set([
  '/connexion',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
])

/** Paths that show the global member nav (Accueil · Mon agenda · Ma troupe · Mes stats), including admin screens. */
const MEMBER_NAV_PATH_PATTERNS: RegExp[] = [
  /^\/accueil$/,
  /^\/agenda$/,
  /^\/compte(\/.*)?$/,
  /^\/troupes$/,
  /^\/membre\/[^/]+$/,
  /^\/troupes\/[^/]+$/,
  /^\/troupes\/[^/]+\/admin\/membres$/,
  /^\/troupes\/[^/]+\/admin\/parametres$/,
  /^\/troupes\/[^/]+\/admin\/audit$/,
  /^\/troupe\/admin\/membres$/,
  // Legacy `/saison/:seasonSlug` (single segment after saison)
  /^\/saison\/[^/]+$/,
  /^\/saison\/[^/]+\/admin\/membres$/,
  /^\/saison\/[^/]+\/admin\/participants$/,
  /^\/saison\/[^/]+\/admin\/audit$/,
  /^\/saison\/[^/]+\/event\/[^/]+$/,
  /^\/saison\/[^/]+\/event\/[^/]+\/admin\/participants$/,
  // Canonical `/saison/:troupeSlug/:seasonSlug`
  /^\/saison\/[^/]+\/[^/]+$/,
  /^\/saison\/[^/]+\/[^/]+\/admin\/membres$/,
  /^\/saison\/[^/]+\/[^/]+\/admin\/participants$/,
  /^\/saison\/[^/]+\/[^/]+\/admin\/audit$/,
  /^\/saison\/[^/]+\/[^/]+\/event\/[^/]+$/,
  /^\/saison\/[^/]+\/[^/]+\/event\/[^/]+\/admin\/participants$/,
]

/** Member routes that show the global nav (Accueil · Agenda · Stats). */
export function shouldShowMemberNav(url: string): boolean {
  const path = pathFromUrl(url)

  if (!path || path === '/' || AUTH_PATHS_WITHOUT_NAV.has(path)) {
    return false
  }

  return MEMBER_NAV_PATH_PATTERNS.some((pattern) => pattern.test(path))
}

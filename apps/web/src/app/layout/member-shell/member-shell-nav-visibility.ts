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

const AUTH_PATHS_WITHOUT_NAV = new Set([
  '/connexion',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
])

/** Paths that show the global member nav (Accueil · Agenda · Stats), including admin screens. */
const MEMBER_NAV_PATH_PATTERNS: RegExp[] = [
  /^\/accueil$/,
  /^\/agenda$/,
  /^\/compte$/,
  /^\/troupes$/,
  /^\/membre\/[^/]+$/,
  /^\/troupes\/[^/]+$/,
  /^\/troupes\/[^/]+\/admin\/membres$/,
  /^\/troupe\/admin\/membres$/,
  /^\/saison\/[^/]+$/,
  /^\/saison\/[^/]+\/admin\/membres$/,
  /^\/saison\/[^/]+\/admin\/participants$/,
  /^\/saison\/[^/]+\/event\/[^/]+$/,
  /^\/saison\/[^/]+\/event\/[^/]+\/admin\/participants$/,
]

/** Member routes that show the global nav (Accueil · Agenda · Stats). */
export function shouldShowMemberNav(url: string): boolean {
  const path = pathFromUrl(url)

  if (!path || path === '/' || AUTH_PATHS_WITHOUT_NAV.has(path)) {
    return false
  }

  return MEMBER_NAV_PATH_PATTERNS.some((pattern) => pattern.test(path))
}

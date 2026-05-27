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

function isMemberAdminPath(path: string): boolean {
  return /\/admin(\/|$)/.test(path)
}

/** Member routes that show the global nav (Accueil · Agenda · Stats). */
export function shouldShowMemberNav(url: string): boolean {
  const path = pathFromUrl(url)

  if (!path || path === '/' || AUTH_PATHS_WITHOUT_NAV.has(path) || isMemberAdminPath(path)) {
    return false
  }

  if (path === '/accueil' || path === '/agenda' || path === '/compte' || path === '/troupes') {
    return true
  }

  if (isMemberStatsPath(path)) {
    return true
  }

  if (/^\/troupes\/[^/]+$/.test(path)) {
    return true
  }

  if (/^\/saison\/[^/]+$/.test(path)) {
    return true
  }

  if (/^\/saison\/[^/]+\/event\/[^/]+$/.test(path)) {
    return true
  }

  return false
}

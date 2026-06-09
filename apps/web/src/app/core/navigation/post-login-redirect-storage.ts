const POST_LOGIN_REDIRECT_KEY = 'hatcast.postLoginRedirect'

export function isValidInternalRedirectPath(path: string): boolean {
  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) return false
  if (trimmed.startsWith('//')) return false
  if (/^(https?:|javascript:)/i.test(trimmed)) return false

  const pathname = trimmed.split(/[?#]/)[0] ?? trimmed
  const segments = pathname.split('/').slice(1)
  if (segments.some((segment) => segment.length === 0)) return false

  if (
    pathname === '/connexion' ||
    pathname.startsWith('/connexion/') ||
    pathname.startsWith('/connexion?') ||
    pathname.startsWith('/connexion#')
  ) {
    return false
  }

  if (segments.length === 1) {
    return ['agenda', 'compte', 'seasons', 'troupes'].includes(segments[0])
  }

  if (segments[0] === 'compte') {
    return (
      segments.length === 2 &&
      ['preferences', 'notifications', 'securite', 'a-propos'].includes(segments[1])
    )
  }

  if (segments[0] === 'troupes') {
    return (
      segments.length === 2 ||
      (segments.length === 4 &&
        segments[2] === 'admin' &&
        (segments[3] === 'membres' || segments[3] === 'parametres'))
    )
  }

  if (segments[0] === 'troupe') {
    return (
      (segments.length === 3 &&
        segments[1] === 'admin' &&
        (segments[2] === 'membres' || segments[2] === 'parametres')) ||
      (segments.length === 4 &&
        segments[2] === 'admin' &&
        (segments[3] === 'membres' || segments[3] === 'parametres'))
    )
  }

  if (segments[0] === 'saison') {
    return isValidSeasonScopedPath(segments)
  }

  return false
}

function isValidSeasonScopedPath(segments: string[]): boolean {
  if (segments.length === 2) {
    return !!segments[1]?.trim()
  }
  if (segments.length === 3) {
    if (segments[2] === 'event' || segments[2] === 'admin') {
      return false
    }
    return !!segments[1]?.trim() && !!segments[2]?.trim()
  }
  if (segments.length === 4 && segments[2] === 'admin') {
    return (
      segments[3] === 'membres' ||
      segments[3] === 'participants' ||
      segments[3] === 'audit'
    )
  }
  if (segments.length === 4 && segments[2] === 'event') {
    return !!segments[3]?.trim()
  }
  if (segments.length === 5 && segments[3] === 'admin') {
    return (
      segments[4] === 'membres' ||
      segments[4] === 'participants' ||
      segments[4] === 'audit'
    )
  }
  if (segments.length === 5 && segments[3] === 'event') {
    return !!segments[4]?.trim()
  }
  if (segments.length === 6 && segments[2] === 'event' && segments[4] === 'admin') {
    return segments[5] === 'participants' && !!segments[3]?.trim()
  }
  if (segments.length === 7 && segments[3] === 'event' && segments[5] === 'admin') {
    return segments[6] === 'participants' && !!segments[4]?.trim()
  }
  return false
}

export function getPendingPostLoginRedirect(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const path = localStorage.getItem(POST_LOGIN_REDIRECT_KEY)?.trim()
    return path || null
  } catch {
    return null
  }
}

/**
 * Stores path + search + hash only (no origin).
 * When called from login with `returnUrl`, it overwrites any stale stored value.
 */
export function rememberPendingPostLoginRedirect(path: string): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = path.trim()
  if (!trimmed || !isValidInternalRedirectPath(trimmed)) return
  try {
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, trimmed)
  } catch {
    // Quota exceeded or SecurityError — ignore silently
  }
}

export function clearPendingPostLoginRedirect(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
  } catch {
    // SecurityError in restricted contexts — ignore silently
  }
}

const LAST_MEMBER_ENTRY_PATH_KEY = 'lastMemberEntryPath'

/** Normalized member entry paths allowed for restore (pathname only). */
export function isPersistableMemberEntryPath(path: string): boolean {
  const normalized = path.trim()
  if (!normalized.startsWith('/') || normalized.includes('//')) {
    return false
  }
  if (/^https?:/i.test(normalized)) {
    return false
  }

  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 1) {
    const [only] = segments
    return only === 'accueil' || only === 'agenda'
  }
  if (segments.length === 2) {
    const [prefix, slug] = segments
    if (!slug) {
      return false
    }
    if (prefix === 'saison' || prefix === 'membre') {
      return true
    }
  }
  return false
}

export function seasonSlugFromMemberEntryPath(path: string): string | null {
  const segments = path.trim().split('/').filter(Boolean)
  if (segments.length === 2 && segments[0] === 'saison') {
    return segments[1] || null
  }
  return null
}

export function memberStatsSlugFromMemberEntryPath(path: string): string | null {
  const segments = path.trim().split('/').filter(Boolean)
  if (segments.length === 2 && segments[0] === 'membre') {
    return segments[1] || null
  }
  return null
}

export function saisonMemberEntryPath(slug: string): string {
  return `/saison/${slug.trim()}`
}

export function getLastMemberEntryPath(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const path = localStorage.getItem(LAST_MEMBER_ENTRY_PATH_KEY)?.trim()
    if (!path || !isPersistableMemberEntryPath(path)) {
      return null
    }
    return path
  } catch {
    return null
  }
}

export function rememberLastMemberEntryPath(path: string): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = path.trim()
  if (!trimmed || !isPersistableMemberEntryPath(trimmed)) {
    return
  }
  try {
    localStorage.setItem(LAST_MEMBER_ENTRY_PATH_KEY, trimmed)
  } catch {
    // Quota exceeded or SecurityError — ignore silently
  }
}

export function clearLastMemberEntryPath(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(LAST_MEMBER_ENTRY_PATH_KEY)
  } catch {
    // SecurityError in restricted contexts — ignore silently
  }
}

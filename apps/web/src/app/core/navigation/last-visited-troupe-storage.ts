const LAST_TROUPE_KEY = 'lastVisitedTroupeSlug'

export function getLastVisitedTroupeSlug(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const slug = localStorage.getItem(LAST_TROUPE_KEY)?.trim()
    return slug || null
  } catch {
    return null
  }
}

export function rememberLastVisitedTroupeSlug(slug: string): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = slug.trim()
  if (!trimmed) return
  try {
    localStorage.setItem(LAST_TROUPE_KEY, trimmed)
  } catch {
    // Quota exceeded or SecurityError — ignore silently
  }
}

export function clearLastVisitedTroupeSlug(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(LAST_TROUPE_KEY)
  } catch {
    // SecurityError in restricted contexts — ignore silently
  }
}

/** V1-compatible keys (shared browser with legacy). */
const LAST_SEASON_KEY = 'lastVisitedSeason'
/**
 * V1 wrote a timestamp alongside the slug. We clear it for V1 compatibility
 * but do not write it in V2 (no expiry logic in this story).
 */
const LAST_SEASON_TIMESTAMP_KEY = 'lastVisitedSeasonTimestamp'

export function getLastVisitedSeasonSlug(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const slug = localStorage.getItem(LAST_SEASON_KEY)?.trim()
    return slug || null
  } catch {
    return null
  }
}

export function rememberLastVisitedSeasonSlug(slug: string): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = slug.trim()
  if (!trimmed) return
  try {
    localStorage.setItem(LAST_SEASON_KEY, trimmed)
  } catch {
    // Quota exceeded or SecurityError — ignore silently
  }
}

export function clearLastVisitedSeasonSlug(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(LAST_SEASON_KEY)
    localStorage.removeItem(LAST_SEASON_TIMESTAMP_KEY)
  } catch {
    // SecurityError in restricted contexts — ignore silently
  }
}

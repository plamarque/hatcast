/** V1-compatible keys (shared browser with legacy). */
const LAST_SEASON_KEY = 'lastVisitedSeason'
/**
 * V1 wrote a timestamp alongside the slug. We clear it for V1 compatibility
 * but do not write it in V2 (no expiry logic in this story).
 */
const LAST_SEASON_TIMESTAMP_KEY = 'lastVisitedSeasonTimestamp'

/** Per-troupe last visited season slugs (Story 17.23). */
const LAST_SEASON_BY_TROUPE_KEY = 'lastVisitedSeasonByTroupe'

export function getLastVisitedSeasonSlug(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const slug = localStorage.getItem(LAST_SEASON_KEY)?.trim()
    return slug || null
  } catch {
    return null
  }
}

export function getLastVisitedSeasonSlugForTroupe(troupeId: string): string | null {
  const trimmedId = troupeId.trim()
  if (!trimmedId) return null
  const map = readLastVisitedSeasonByTroupe()
  const slug = map[trimmedId]?.trim()
  return slug || null
}

export function rememberLastVisitedSeasonSlug(slug: string, troupeId?: string): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = slug.trim()
  if (!trimmed) return
  try {
    localStorage.setItem(LAST_SEASON_KEY, trimmed)
    const trimmedTroupeId = troupeId?.trim()
    if (trimmedTroupeId) {
      const map = readLastVisitedSeasonByTroupe()
      map[trimmedTroupeId] = trimmed
      localStorage.setItem(LAST_SEASON_BY_TROUPE_KEY, JSON.stringify(map))
    }
  } catch {
    // Quota exceeded or SecurityError — ignore silently
  }
}

export function clearLastVisitedSeasonSlug(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(LAST_SEASON_KEY)
    localStorage.removeItem(LAST_SEASON_TIMESTAMP_KEY)
    localStorage.removeItem(LAST_SEASON_BY_TROUPE_KEY)
  } catch {
    // SecurityError in restricted contexts — ignore silently
  }
}

function readLastVisitedSeasonByTroupe(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LAST_SEASON_BY_TROUPE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key === 'string' && typeof value === 'string' && value.trim()) {
        result[key] = value.trim()
      }
    }
    return result
  } catch {
    return {}
  }
}

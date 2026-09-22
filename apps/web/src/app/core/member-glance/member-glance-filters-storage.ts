export const MEMBER_GLANCE_FILTERS_STORAGE_KEY = 'hatcast.member-glance.filters'

export interface StoredMemberGlanceFilters {
  troupeIds: string[]
  seasonIds: string[]
}

export {
  parseAgendaFilterUuid,
} from '../agenda/user-agenda-filters-storage'

export function readStoredMemberGlanceFilters(): StoredMemberGlanceFilters | null {
  try {
    const raw = sessionStorage.getItem(MEMBER_GLANCE_FILTERS_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<StoredMemberGlanceFilters>
    return {
      troupeIds: Array.isArray(parsed.troupeIds) ? parsed.troupeIds.filter((id): id is string => typeof id === 'string') : [],
      seasonIds: Array.isArray(parsed.seasonIds) ? parsed.seasonIds.filter((id): id is string => typeof id === 'string') : [],
    }
  } catch {
    return null
  }
}

export function writeStoredMemberGlanceFilters(filters: StoredMemberGlanceFilters): void {
  try {
    sessionStorage.setItem(MEMBER_GLANCE_FILTERS_STORAGE_KEY, JSON.stringify(filters))
  } catch {
    // best-effort
  }
}

export function clearStoredMemberGlanceFilters(): void {
  sessionStorage.removeItem(MEMBER_GLANCE_FILTERS_STORAGE_KEY)
}

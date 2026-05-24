export const USER_AGENDA_FILTERS_STORAGE_KEY = 'hatcast.agenda.filters'

export interface StoredUserAgendaFilters {
  troupeId: string | null
  leagueId: string | null
}

export function readStoredUserAgendaFilters(): StoredUserAgendaFilters | null {
  try {
    const raw = sessionStorage.getItem(USER_AGENDA_FILTERS_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<StoredUserAgendaFilters>
    return {
      troupeId: typeof parsed.troupeId === 'string' ? parsed.troupeId : null,
      leagueId: typeof parsed.leagueId === 'string' ? parsed.leagueId : null,
    }
  } catch {
    return null
  }
}

export function writeStoredUserAgendaFilters(filters: StoredUserAgendaFilters): void {
  try {
    sessionStorage.setItem(USER_AGENDA_FILTERS_STORAGE_KEY, JSON.stringify(filters))
  } catch {
    // Quota dépassé ou mode privé — la persistance est best-effort.
  }
}

export function clearStoredUserAgendaFilters(): void {
  sessionStorage.removeItem(USER_AGENDA_FILTERS_STORAGE_KEY)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseAgendaFilterUuid(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  return UUID_RE.test(trimmed) ? trimmed : null
}

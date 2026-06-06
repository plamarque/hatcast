import type { TroupeMemberAdmin } from '../../core/troupes/troupe-api.service'

const MAX_SUGGESTIONS = 8

/** Client-side troupe member suggestions for participant add typeahead (Lot A). */
export function filterTroupeMemberSuggestions(
  members: TroupeMemberAdmin[],
  query: string,
  excludedUserIds: Set<string>,
  excludedDisplayNames: Set<string> = new Set(),
): TroupeMemberAdmin[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }

  return members
    .filter(
      (m) =>
        m.status === 'ACTIVE' &&
        !excludedUserIds.has(m.userId) &&
        !excludedDisplayNames.has(m.displayName.trim().toLowerCase()) &&
        (m.displayName.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false)),
    )
    .slice(0, MAX_SUGGESTIONS)
}

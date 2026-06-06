import type { MemberGender } from '../../core/account/member-gender'
import type {
  ParticipantKind,
  SeasonParticipantAdmin,
} from '../../core/participants/participant-api.service'
import type {
  TroupeBaselineRole,
  TroupeMemberAdmin,
} from '../../core/troupes/troupe-api.service'

const MAX_SUGGESTIONS = 8

const CARNET_ROLES: ReadonlySet<TroupeBaselineRole> = new Set([
  'MEMBER',
  'TROUPE_ADMIN',
  'EXTERNE',
])

export type ParticipantAddSuggestionSource = 'carnet' | 'season'

/** Unified row for participant add typeahead (Lot A + Lot A-ext / ADR-0021). */
export interface ParticipantAddSuggestion {
  key: string
  source: ParticipantAddSuggestionSource
  displayName: string
  email: string | null
  userId: string | null
  avatarUrl?: string | null
  gender?: MemberGender | null
  baselineRole?: TroupeBaselineRole
  troupeMembershipId?: string | null
  kind?: ParticipantKind
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

function carnetSuggestionKey(membershipId: string): string {
  return `m:${membershipId}`
}

function seasonSuggestionKey(participantId: string): string {
  return `s:${participantId}`
}

/** Resolve a stable autocomplete option key to its suggestion row (for displayWith). */
export function findParticipantAddSuggestionByKey(
  key: string,
  carnetMembers: TroupeMemberAdmin[],
  seasonParticipants: SeasonParticipantAdmin[],
): ParticipantAddSuggestion | undefined {
  if (key.startsWith('m:')) {
    const membershipId = key.slice(2)
    const member = carnetMembers.find((row) => row.id === membershipId)
    return member ? carnetToSuggestion(member) : undefined
  }
  if (key.startsWith('s:')) {
    const participantId = key.slice(2)
    const participant = seasonParticipants.find((row) => row.id === participantId)
    return participant ? seasonToSuggestion(participant) : undefined
  }
  return undefined
}

/** Season participant id when selection should re-include an excluded roster row (event add). */
export function seasonParticipantIdForEventInclude(
  selection: ParticipantAddSuggestion,
  seasonParticipants: SeasonParticipantAdmin[],
): string | null {
  if (isGuestScopeSuggestion(selection)) {
    return null
  }
  if (selection.source === 'season' && selection.key.startsWith('s:')) {
    return selection.key.slice(2)
  }
  if (selection.source === 'carnet' && selection.troupeMembershipId) {
    const row = seasonParticipants.find(
      (p) => p.status === 'ACTIVE' && p.troupeMembershipId === selection.troupeMembershipId,
    )
    return row?.id ?? null
  }
  return null
}

function matchesQuery(
  displayName: string,
  email: string | null | undefined,
  query: string,
): boolean {
  const q = query.toLowerCase()
  return (
    displayName.toLowerCase().includes(q) || (email?.toLowerCase().includes(q) ?? false)
  )
}

function isExcluded(
  suggestion: Pick<ParticipantAddSuggestion, 'userId' | 'displayName' | 'troupeMembershipId'>,
  excludedUserIds: Set<string>,
  excludedDisplayNames: Set<string>,
  excludedTroupeMembershipIds: Set<string>,
): boolean {
  if (
    suggestion.troupeMembershipId != null &&
    excludedTroupeMembershipIds.has(suggestion.troupeMembershipId)
  ) {
    return true
  }
  if (suggestion.userId != null && excludedUserIds.has(suggestion.userId)) {
    return true
  }
  if (excludedDisplayNames.has(normalizeName(suggestion.displayName))) {
    return true
  }
  return false
}

function dedupeKey(
  suggestion: Pick<
    ParticipantAddSuggestion,
    'troupeMembershipId' | 'userId' | 'displayName'
  >,
): string {
  if (suggestion.troupeMembershipId) {
    return `tm:${suggestion.troupeMembershipId}`
  }
  if (suggestion.userId) {
    return `u:${suggestion.userId}`
  }
  return `n:${normalizeName(suggestion.displayName)}`
}

function carnetToSuggestion(member: TroupeMemberAdmin): ParticipantAddSuggestion {
  return {
    key: carnetSuggestionKey(member.id),
    source: 'carnet',
    displayName: member.displayName,
    email: member.email,
    userId: member.userId,
    avatarUrl: member.avatarUrl,
    gender: member.gender,
    baselineRole: member.baselineRole,
    troupeMembershipId: member.id,
  }
}

/** True when selection implies guest/externe scope UI (not troupe MEMBER/ADMIN). */
export function isGuestScopeSuggestion(
  suggestion: Pick<ParticipantAddSuggestion, 'baselineRole' | 'kind'> | null,
): boolean {
  if (!suggestion) {
    return false
  }
  if (suggestion.baselineRole === 'MEMBER' || suggestion.baselineRole === 'TROUPE_ADMIN') {
    return false
  }
  if (suggestion.kind === 'MEMBER') {
    return false
  }
  return true
}

function seasonToSuggestion(participant: SeasonParticipantAdmin): ParticipantAddSuggestion {
  return {
    key: seasonSuggestionKey(participant.id),
    source: 'season',
    displayName: participant.displayName,
    email: participant.email,
    userId: participant.userId,
    avatarUrl: participant.avatarUrl,
    gender: participant.gender ?? participant.participantGender,
    troupeMembershipId: participant.troupeMembershipId,
    kind: participant.kind,
    baselineRole:
      participant.kind === 'MEMBER'
        ? 'MEMBER'
        : participant.kind === 'EXTERNE'
          ? 'EXTERNE'
          : undefined,
  }
}

/** @deprecated Use buildParticipantAddSuggestions — kept for import stability during migration. */
export function filterTroupeMemberSuggestions(
  members: TroupeMemberAdmin[],
  query: string,
  excludedUserIds: Set<string>,
  excludedDisplayNames: Set<string> = new Set(),
): TroupeMemberAdmin[] {
  return buildParticipantAddSuggestions({
    carnetMembers: members,
    seasonParticipants: [],
    query,
    excludedUserIds,
    excludedDisplayNames,
  })
    .filter((s) => s.source === 'carnet')
    .map((s) => members.find((m) => m.id === s.troupeMembershipId)!)
    .filter(Boolean)
}

/** Client-side carnet + season roster suggestions for participant add typeahead. */
export function buildParticipantAddSuggestions(input: {
  carnetMembers: TroupeMemberAdmin[]
  seasonParticipants: SeasonParticipantAdmin[]
  query: string
  excludedUserIds: Set<string>
  excludedDisplayNames?: Set<string>
  excludedTroupeMembershipIds?: Set<string>
  includeSeasonRoster?: boolean
}): ParticipantAddSuggestion[] {
  const q = input.query.trim()
  if (!q) {
    return []
  }

  const excludedDisplayNames = input.excludedDisplayNames ?? new Set()
  const excludedTroupeMembershipIds = input.excludedTroupeMembershipIds ?? new Set()
  const includeSeason = input.includeSeasonRoster !== false

  const carnetSuggestions: ParticipantAddSuggestion[] = []
  for (const member of input.carnetMembers) {
    if (member.status !== 'ACTIVE' || !CARNET_ROLES.has(member.baselineRole)) {
      continue
    }
    const suggestion = carnetToSuggestion(member)
    if (!matchesQuery(suggestion.displayName, suggestion.email, q)) {
      continue
    }
    if (
      isExcluded(
        suggestion,
        input.excludedUserIds,
        excludedDisplayNames,
        excludedTroupeMembershipIds,
      )
    ) {
      continue
    }
    carnetSuggestions.push(suggestion)
  }

  const seen = new Set(carnetSuggestions.map(dedupeKey))
  const merged = [...carnetSuggestions]

  if (includeSeason) {
    for (const participant of input.seasonParticipants) {
      if (participant.status !== 'ACTIVE') {
        continue
      }
      const suggestion = seasonToSuggestion(participant)
      if (!matchesQuery(suggestion.displayName, suggestion.email, q)) {
        continue
      }
      const dk = dedupeKey(suggestion)
      if (seen.has(dk)) {
        continue
      }
      if (
        isExcluded(
          suggestion,
          input.excludedUserIds,
          excludedDisplayNames,
          excludedTroupeMembershipIds,
        )
      ) {
        continue
      }
      seen.add(dk)
      merged.push(suggestion)
    }
  }

  return merged.slice(0, MAX_SUGGESTIONS)
}

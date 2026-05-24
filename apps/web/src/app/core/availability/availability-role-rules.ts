import {
  normalizeRoleSlots,
  ROLE_KEYS,
  rolesRequiredForEvent,
  type RoleKey,
  type RoleSlots,
} from '../events/event-types'

const PLAY_ROLE_KEYS = new Set<RoleKey>(['player'])
const VOLUNTEER: RoleKey = 'volunteer'

export function candidateRolesForEvent(roleSlots: RoleSlots): RoleKey[] {
  return rolesRequiredForEvent(normalizeRoleSlots(roleSlots))
}

export function mandatoryVolunteerCoverage(roleSlots: RoleSlots): boolean {
  return (normalizeRoleSlots(roleSlots)[VOLUNTEER] ?? 0) > 0
}

export function normalizeCandidateRoleKeys(
  roleSlots: RoleSlots,
  requestedKeys: readonly string[] | null | undefined,
  applyVolunteerRule = true,
): RoleKey[] {
  const required = new Set(candidateRolesForEvent(roleSlots))
  const selected: RoleKey[] = []
  for (const raw of requestedKeys ?? []) {
    if (!isRoleKey(raw) || !required.has(raw) || selected.includes(raw)) {
      continue
    }
    selected.push(raw)
  }
  if (
    applyVolunteerRule &&
    mandatoryVolunteerCoverage(roleSlots) &&
    selected.some((role) => PLAY_ROLE_KEYS.has(role)) &&
    required.has(VOLUNTEER) &&
    !selected.includes(VOLUNTEER)
  ) {
    selected.push(VOLUNTEER)
  }
  return selected
}

export function preferredRoleIntersection(
  roleSlots: RoleSlots,
  preferredRoleKeys: readonly string[] | null | undefined,
): RoleKey[] {
  return normalizeCandidateRoleKeys(roleSlots, preferredRoleKeys, true)
}

function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value)
}

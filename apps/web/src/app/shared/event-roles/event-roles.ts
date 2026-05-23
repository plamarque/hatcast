/**
 * Shared event role metadata — aligned with `RoleKeys.ALL` (backend) and V1 storage.js.
 */
export {
  ROLE_KEYS,
  ROLE_DISPLAY_ORDER,
  ROLE_EMOJIS,
  type RoleKey,
} from '../../core/events/event-types'

import { ROLE_DISPLAY_ORDER, ROLE_EMOJIS, type RoleKey } from '../../core/events/event-types'

export const ROLE_LABELS_SINGULAR: Record<RoleKey, string> = {
  player: 'Comédien·ne',
  volunteer: 'Bénévole',
  mc: 'MC',
  dj: 'DJ',
  referee: 'Arbitre',
  assistant_referee: 'Assistant.e',
  lighting: 'Lumière',
  coach: 'Coach',
  stage_manager: 'Régisseur.euse',
}

export function roleLabelSingular(roleKey: RoleKey): string {
  return ROLE_LABELS_SINGULAR[roleKey] ?? roleKey
}

export function roleEmoji(roleKey: RoleKey): string {
  return ROLE_EMOJIS[roleKey] ?? '❓'
}

/** V1 parity — volunteer cannot be disabled in preferred roles config. */
export function canDisablePreferredRole(roleKey: RoleKey): boolean {
  return roleKey !== 'volunteer'
}

export function orderedRoleKeys(): RoleKey[] {
  return [...ROLE_DISPLAY_ORDER]
}

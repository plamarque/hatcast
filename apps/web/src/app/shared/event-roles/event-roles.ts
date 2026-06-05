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
import { effectiveMemberGender, type MemberGender } from '../../core/account/member-gender'

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

export const ROLE_LABELS_BY_GENDER: Record<MemberGender, Record<RoleKey, string>> = {
  male: {
    player: 'Comédien',
    volunteer: 'Bénévole',
    mc: 'MC',
    dj: 'DJ',
    referee: 'Arbitre',
    assistant_referee: 'Assistant',
    lighting: 'Lumière',
    coach: 'Coach',
    stage_manager: 'Régisseur',
  },
  female: {
    player: 'Comédienne',
    volunteer: 'Bénévole',
    mc: 'MC',
    dj: 'DJ',
    referee: 'Arbitre',
    assistant_referee: 'Assistante',
    lighting: 'Lumière',
    coach: 'Coach',
    stage_manager: 'Régisseuse',
  },
  non_specified: ROLE_LABELS_SINGULAR,
}

export const ROLE_LABELS_PLURAL_BY_GENDER: Record<MemberGender, Record<RoleKey, string>> = {
  male: {
    player: 'Comédiens',
    volunteer: 'Bénévoles',
    mc: 'MC',
    dj: 'DJ',
    referee: 'Arbitres',
    assistant_referee: 'Assistants',
    lighting: 'Lumières',
    coach: 'Coachs',
    stage_manager: 'Régisseurs',
  },
  female: {
    player: 'Comédiennes',
    volunteer: 'Bénévoles',
    mc: 'MC',
    dj: 'DJ',
    referee: 'Arbitres',
    assistant_referee: 'Assistantes',
    lighting: 'Lumières',
    coach: 'Coachs',
    stage_manager: 'Régisseuses',
  },
  non_specified: {
    player: 'Comédiens·nes',
    volunteer: 'Bénévoles',
    mc: 'MC',
    dj: 'DJ',
    referee: 'Arbitres',
    assistant_referee: 'Assistant.es',
    lighting: 'Lumières',
    coach: 'Coachs',
    stage_manager: 'Régisseur.euses',
  },
}

export function getRoleLabel(
  roleKey: RoleKey,
  gender?: MemberGender | unknown,
  plural = false,
): string {
  const resolved = effectiveMemberGender(gender)
  const tables = plural ? ROLE_LABELS_PLURAL_BY_GENDER : ROLE_LABELS_BY_GENDER
  return tables[resolved][roleKey] ?? ROLE_LABELS_SINGULAR[roleKey] ?? roleKey
}

export function roleLabelSingular(roleKey: RoleKey): string {
  return getRoleLabel(roleKey, 'non_specified')
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

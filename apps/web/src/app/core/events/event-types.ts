/** V1 parity — [legacy/src/services/storage.js] */

export const ROLE_KEYS = [
  'player',
  'volunteer',
  'mc',
  'dj',
  'referee',
  'assistant_referee',
  'lighting',
  'coach',
  'stage_manager',
] as const

export type RoleKey = (typeof ROLE_KEYS)[number]

export type EventTypeId =
  | 'cabaret'
  | 'longform'
  | 'freeform'
  | 'match'
  | 'catch'
  | 'deplacement'
  | 'survey'
  | 'custom'

export const EVENT_TYPE_IDS: EventTypeId[] = [
  'cabaret',
  'longform',
  'freeform',
  'match',
  'catch',
  'deplacement',
  'survey',
  'custom',
]

export const TEMPLATE_DISPLAY_ORDER: EventTypeId[] = [
  'cabaret',
  'longform',
  'freeform',
  'match',
  'catch',
  'deplacement',
  'survey',
  'custom',
]

export const EVENT_TYPE_LABELS: Record<EventTypeId, string> = {
  cabaret: 'Cabaret',
  longform: 'Long Form',
  freeform: 'Free Form',
  match: 'Match',
  catch: 'Catch',
  deplacement: 'Déplacement',
  survey: 'Simple sondage',
  custom: 'Autre',
}

export const EVENT_TYPE_ICONS: Record<EventTypeId, string> = {
  match: '⚔️',
  catch: '🥊',
  cabaret: '🎪',
  longform: '⏱️',
  freeform: '🦋',
  deplacement: '🚌',
  survey: '📊',
  custom: '❓',
}

export const ROLE_LABELS: Record<RoleKey, string> = {
  player: 'Comédien·nes',
  volunteer: 'Bénévoles',
  mc: 'MC',
  dj: 'DJ',
  referee: 'Arbitre',
  assistant_referee: 'Assistant.es',
  lighting: 'Lumière',
  coach: 'Coach',
  stage_manager: 'Régisseur.euses',
}

export const ROLE_EMOJIS: Record<RoleKey, string> = {
  player: '🎭',
  volunteer: '🤝',
  mc: '🎤',
  dj: '🎧',
  referee: '🙅',
  assistant_referee: '💁',
  lighting: '🔦',
  coach: '🧢',
  stage_manager: '🎬',
}

export const ROLE_DISPLAY_ORDER: RoleKey[] = [
  'player',
  'dj',
  'mc',
  'volunteer',
  'referee',
  'assistant_referee',
  'lighting',
  'coach',
  'stage_manager',
]

/** V1 `ROLE_PRIORITY_ORDER` — draw order (Dispos « Tous », composition draw). */
export const ROLE_PRIORITY_ORDER: RoleKey[] = [
  'referee',
  'dj',
  'mc',
  'player',
  'assistant_referee',
  'coach',
  'stage_manager',
  'lighting',
  'volunteer',
]

export const DEFAULT_CREATE_EVENT_TYPE: EventTypeId = 'cabaret'

export const ROLE_TEMPLATES: Record<EventTypeId, Record<RoleKey, number>> = {
  match: {
    player: 5,
    mc: 1,
    dj: 0,
    volunteer: 5,
    referee: 1,
    assistant_referee: 2,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  catch: {
    player: 9,
    mc: 1,
    dj: 1,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  cabaret: {
    player: 5,
    mc: 1,
    dj: 1,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  longform: {
    player: 4,
    mc: 1,
    dj: 1,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  freeform: {
    player: 5,
    mc: 1,
    dj: 1,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  deplacement: {
    player: 5,
    mc: 0,
    dj: 0,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  survey: {
    player: 0,
    mc: 0,
    dj: 0,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
  custom: {
    player: 0,
    mc: 0,
    dj: 0,
    volunteer: 0,
    referee: 0,
    assistant_referee: 0,
    lighting: 0,
    coach: 0,
    stage_manager: 0,
  },
}

export type RoleSlots = Record<string, number>

export function emptyRoleSlots(): RoleSlots {
  return Object.fromEntries(ROLE_KEYS.map((k) => [k, 0]))
}

export const ROLE_COUNT_MAX = 100

export function normalizeRoleSlots(raw: RoleSlots | null | undefined): RoleSlots {
  const base = emptyRoleSlots()
  if (!raw) return base
  for (const key of ROLE_KEYS) {
    const v = raw[key]
    if (typeof v === 'number' && Number.isFinite(v)) {
      base[key] = clampRoleCount(v)
    }
  }
  return base
}

export function clampRoleCount(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(ROLE_COUNT_MAX, Math.max(0, Math.round(n)))
}

export function applyTemplate(typeId: EventTypeId): RoleSlots {
  return normalizeRoleSlots(ROLE_TEMPLATES[typeId])
}

export function roleSlotsEqual(a: RoleSlots, b: RoleSlots): boolean {
  return ROLE_KEYS.every((k) => (a[k] ?? 0) === (b[k] ?? 0))
}

export function detectTemplateFromRoles(slots: RoleSlots): EventTypeId {
  for (const typeId of EVENT_TYPE_IDS) {
    if (roleSlotsEqual(slots, ROLE_TEMPLATES[typeId])) {
      return typeId
    }
  }
  return 'custom'
}

export function rolesWithSlots(roleSlots: RoleSlots): RoleKey[] {
  return ROLE_PRIORITY_ORDER.filter((k) => (roleSlots[k] ?? 0) > 0)
}

export function rolesRequiredForEvent(roleSlots: RoleSlots): RoleKey[] {
  return rolesWithSlots(roleSlots)
}

export function totalSlots(roleSlots: RoleSlots): number {
  return Object.values(roleSlots).reduce((a, b) => a + b, 0)
}

export function isDeplacementType(typeId: string): boolean {
  return typeId === 'deplacement'
}

/** ADR 0013 — equity tag `deplacements` or legacy template (story 3.6 / 17.10). */
export function isDeplacementEvent(
  templateType: string,
  equityTag?: string | null,
): boolean {
  return equityTag === 'deplacements' || templateType === 'deplacement'
}

export function jeuSubColumn(
  templateType: string,
): 'match' | 'cabaret' | 'longform' | 'autre' | null {
  if (templateType === 'deplacement') return null
  if (templateType === 'match') return 'match'
  if (templateType === 'cabaret') return 'cabaret'
  if (templateType === 'longform') return 'longform'
  if (['freeform', 'catch', 'custom', 'survey'].includes(templateType)) return 'autre'
  return 'autre'
}

export function getEventTypeIcon(typeId: string): string {
  if (typeId in EVENT_TYPE_ICONS) {
    return EVENT_TYPE_ICONS[typeId as EventTypeId]
  }
  return EVENT_TYPE_ICONS.custom
}

export function getEventTypeLabel(typeId: string): string {
  if (typeId in EVENT_TYPE_LABELS) {
    return EVENT_TYPE_LABELS[typeId as EventTypeId]
  }
  return EVENT_TYPE_LABELS.custom
}

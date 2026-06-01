import {
  availabilityBadgeLabel,
  type AvailabilityStatus,
} from '../availability/availability-status'
import type { RoleKey } from '../events/event-types'
import { ROLE_DISPLAY_ORDER } from '../events/event-types'
import { roleEmoji, roleLabelSingular } from '../../shared/event-roles/event-roles'

export type AuditPillTone =
  | 'available'
  | 'unavailable'
  | 'unknown'
  | 'confirmed'
  | 'pending'
  | 'declined'
  | 'lifecycle-success'
  | 'lifecycle-warning'
  | 'lifecycle-info'
  | 'lifecycle-neutral'
  | 'role'

/** Slot participation — aligned with composition-participation-dialog. */
const PARTICIPATION_STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmé 👍',
  pending: 'À confirmer ⏳',
  declined: 'Décliné 👎',
}

const LIFECYCLE_LABELS: Record<string, string> = {
  preparing: 'Préparation',
  draftComposition: 'Préparation',
  awaitingConfirmations: 'Préparation',
  gapsToFill: 'Préparation',
  complete: 'Confirmé',
  collecting: 'Collecte',
  confirmed: 'Confirmé',
}

export function auditParticipationStatusLabel(status: string): string {
  return PARTICIPATION_STATUS_LABELS[status] ?? status
}

export function auditAvailabilityPillTone(status: string): AuditPillTone {
  switch (status) {
    case 'available':
      return 'available'
    case 'unavailable':
      return 'unavailable'
    default:
      return 'unknown'
  }
}

export function auditParticipationPillTone(status: string): AuditPillTone {
  switch (status) {
    case 'confirmed':
      return 'confirmed'
    case 'pending':
      return 'pending'
    case 'declined':
      return 'declined'
    default:
      return 'unknown'
  }
}

export function auditLifecyclePillTone(raw: string): AuditPillTone {
  switch (raw) {
    case 'complete':
    case 'confirmed':
      return 'lifecycle-success'
    case 'gapsToFill':
      return 'lifecycle-warning'
    case 'awaitingConfirmations':
    case 'collecting':
    case 'draftComposition':
    case 'preparing':
      return 'lifecycle-info'
    default:
      return 'lifecycle-neutral'
  }
}

export function auditLifecycleLabel(value: unknown): string {
  if (typeof value !== 'string') return '—'
  return LIFECYCLE_LABELS[value] ?? value
}

export function auditAvailabilityStatusLabel(status: string): string {
  if (status === 'available' || status === 'unavailable' || status === 'unknown') {
    return availabilityBadgeLabel(status as AvailabilityStatus)
  }
  return status
}

export function auditRoleDisplay(roleKey: string): string {
  const key = roleKey as RoleKey
  return `${roleEmoji(key)} ${roleLabelSingular(key)}`
}

/** Preferred roles on an availability row — emoji + French label, stable order. */
export function auditRoleKeysList(roleKeys: string[]): string {
  const set = new Set(roleKeys)
  const ordered = ROLE_DISPLAY_ORDER.filter((key) => set.has(key))
  const extras = roleKeys.filter((key) => !ROLE_DISPLAY_ORDER.includes(key as RoleKey))
  return [...ordered, ...extras].map((key) => auditRoleDisplay(key)).join(', ')
}

export function auditTransition(before: string, after: string): string {
  return `${before} → ${after}`
}

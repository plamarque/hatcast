import type { CompositionResponse, CompositionSlot } from './composition-api.service'
import { ROLE_DISPLAY_ORDER } from '../events/event-types'

export type CompositionLifecycle =
  | 'preparing'
  | 'draftComposition'
  | 'awaitingConfirmations'
  | 'gapsToFill'
  | 'complete'

export interface CompositionLifecycleView {
  compositionLifecycle: CompositionLifecycle
  teamStatusBadge: TeamStatusBadge
}

export type TeamStatusBadgeKey = 'draft' | 'collecting' | 'preparing' | 'confirmed'

export interface TeamStatusBadge {
  key: TeamStatusBadgeKey
  label: string
  tone: TeamStatusBadgeKey
  shortLabel: string
}

export function teamStatusBadgeModifier(tone: TeamStatusBadgeKey): string {
  return `--${tone}`
}

export function teamStatusBadgeShortLabel(badge: TeamStatusBadge | undefined): string {
  return badge?.shortLabel ?? 'Collecte'
}

export function teamStatusBadgeAriaLabel(badge: TeamStatusBadge | undefined): string {
  return badge?.label ?? 'Collecte des dispos'
}

function teamStatusBadgeFromLifecycle(lifecycle: CompositionLifecycle): TeamStatusBadge {
  const key: TeamStatusBadgeKey =
    lifecycle === 'complete'
      ? 'confirmed'
      : lifecycle === 'preparing'
        ? 'collecting'
        : 'preparing'
  return {
    key,
    label:
      key === 'collecting'
        ? 'Collecte des dispos'
        : key === 'confirmed'
          ? 'Équipe confirmée'
          : 'Équipe en préparation',
    tone: key,
    shortLabel:
      key === 'collecting' ? 'Collecte' : key === 'confirmed' ? 'Confirmé' : 'Préparation',
  }
}

function requiredPositions(roleSlots: Record<string, number>): Array<{ roleKey: string; slotIndex: number }> {
  const keys: Array<{ roleKey: string; slotIndex: number }> = []
  for (const roleKey of ROLE_DISPLAY_ORDER) {
    const count = roleSlots[roleKey] ?? 0
    for (let slotIndex = 0; slotIndex < count; slotIndex++) {
      keys.push({ roleKey, slotIndex })
    }
  }
  return keys
}

function slotAt(
  slots: CompositionSlot[],
  roleKey: string,
  slotIndex: number,
): CompositionSlot | null {
  return slots.find((s) => s.roleKey === roleKey && s.slotIndex === slotIndex) ?? null
}

function isEffectivelyFilled(slot: CompositionSlot): boolean {
  return slot.participantId != null && slot.participationStatus !== 'declined'
}

/** Mirrors server `CompositionLifecycleService.computeRawLifecycle` (waived slots omitted — rare). */
export function computeRawCompositionLifecycle(
  composition: CompositionResponse | null,
  roleSlots: Record<string, number>,
): CompositionLifecycle {
  const slots = composition?.slots ?? []
  const assignedCount = slots.filter((s) => s.participantId != null).length
  if (!composition) {
    return 'preparing'
  }
  if (assignedCount === 0) {
    return composition.validatedAt != null ? 'gapsToFill' : 'preparing'
  }
  if (!composition.validatedAt) {
    return 'draftComposition'
  }
  const required = requiredPositions(roleSlots)
  const byPosition = new Map(slots.map((s) => [`${s.roleKey}:${s.slotIndex}`, s] as const))
  const hasEmptyRequired = required.some(({ roleKey, slotIndex }) => {
    const row = byPosition.get(`${roleKey}:${slotIndex}`)
    return row == null || !isEffectivelyFilled(row)
  })
  if (hasEmptyRequired) {
    return 'gapsToFill'
  }
  const allComplete = required.every(({ roleKey, slotIndex }) => {
    const row = byPosition.get(`${roleKey}:${slotIndex}`)
    return row != null && isEffectivelyFilled(row) && row.participationStatus === 'confirmed'
  })
  if (allComplete) {
    return 'complete'
  }
  return 'awaitingConfirmations'
}

/** Display lifecycle for event DTO sync (hides draft from members). */
export function computeCompositionLifecycleView(
  composition: CompositionResponse | null,
  roleSlots: Record<string, number>,
  viewerCanSeeDraft: boolean,
): CompositionLifecycleView {
  const raw = computeRawCompositionLifecycle(composition, roleSlots)
  const compositionLifecycle: CompositionLifecycle =
    raw === 'draftComposition' && !viewerCanSeeDraft ? 'preparing' : raw
  return {
    compositionLifecycle,
    teamStatusBadge: teamStatusBadgeFromLifecycle(compositionLifecycle),
  }
}

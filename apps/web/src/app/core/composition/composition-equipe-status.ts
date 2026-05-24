import type { CompositionResponse } from './composition-api.service'
import { ROLE_DISPLAY_ORDER } from '../events/event-types'

export type CompositionEquipeStatusType =
  | 'none'
  | 'complete'
  | 'slots_to_complete'
  | 'has_declined'
  | 'pending_confirmation'
  | 'draft'

export type CompositionEquipeStatusTone = 'neutral' | 'success' | 'warning' | 'info'

export interface CompositionEquipeStatus {
  type: CompositionEquipeStatusType
  label: string
  hint: string
  tone: CompositionEquipeStatusTone
}

export interface CompositionEquipeStatusInput {
  composition: CompositionResponse | null
  canManageComposition: boolean
  roleSlots: Record<string, number>
}

interface SlotView {
  participantId: string | null | undefined
  participationStatus: 'pending' | 'confirmed' | 'declined'
}

function requiredSlotKeys(roleSlots: Record<string, number>): Array<{ roleKey: string; slotIndex: number }> {
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
  slots: CompositionResponse['slots'],
  roleKey: string,
  slotIndex: number,
): SlotView | null {
  const slot = slots.find((s) => s.roleKey === roleKey && s.slotIndex === slotIndex)
  if (!slot) {
    return null
  }
  return {
    participantId: slot.participantId,
    participationStatus: slot.participationStatus,
  }
}

/** Six-state Équipe badge — first match wins (composition-status-messages.md). */
export function resolveCompositionEquipeStatus(
  input: CompositionEquipeStatusInput,
): CompositionEquipeStatus | null {
  const { composition, canManageComposition, roleSlots } = input
  const required = requiredSlotKeys(roleSlots)
  if (required.length === 0) {
    return null
  }

  const slots = composition?.slots ?? []
  const hasSelection = slots.some((s) => s.participantId != null)
  const isValidated = composition?.validatedAt != null

  const filledRequired = required.filter((req) => {
    const slot = slotAt(slots, req.roleKey, req.slotIndex)
    return slot?.participantId != null
  })
  const hasEmptySlots = filledRequired.length < required.length
  const hasDeclinedInSlots = required.some((req) => {
    const slot = slotAt(slots, req.roleKey, req.slotIndex)
    return slot?.participantId != null && slot.participationStatus === 'declined'
  })
  const allFilledConfirmed =
    isValidated &&
    !hasEmptySlots &&
    !hasDeclinedInSlots &&
    required.every((req) => {
      const slot = slotAt(slots, req.roleKey, req.slotIndex)
      return slot?.participantId != null && slot.participationStatus === 'confirmed'
    })

  if (!hasSelection) {
    return {
      type: 'none',
      label: 'À composer',
      hint:
        '🫵 À composer : Cliquez dans les emplacements pour sélectionner un participant ou ✨ Tirez au sort pour faire une sélection automatique.',
      tone: 'neutral',
    }
  }

  if (isValidated && allFilledConfirmed) {
    return {
      type: 'complete',
      label: 'Équipe complète',
      hint:
        '🎉 Équipe complète : 📢 Annoncez la compo définitive ou 🔓 Déverrouillez pour faire des changements.',
      tone: 'success',
    }
  }

  if (isValidated && hasEmptySlots) {
    return {
      type: 'slots_to_complete',
      label: 'À compléter',
      hint:
        '⚠️ À compléter : La composition a été validée mais certains emplacements sont vides. Finalisez la compo en cliquant dans un emplacement vide ou sur le bouton 🔧 Compléter pour un choix aléatoire.',
      tone: 'warning',
    }
  }

  if (isValidated && hasDeclinedInSlots) {
    return {
      type: 'has_declined',
      label: 'À vérifier',
      hint:
        '⚠️ À vérifier : La composition de l\'équipe contient des personnes désistées, vérifiez que tout le monde est toujours disponible.',
      tone: 'warning',
    }
  }

  if (isValidated) {
    return {
      type: 'pending_confirmation',
      label: 'Confirmations en cours',
      hint:
        '⏳ Confirmations : 📢 Annoncez la compo, puis récoltez les confirmations des participants. ⚠️ La compo actuelle est visible de tous. 🔒 Déverrouillez pour la masquer.',
      tone: 'info',
    }
  }

  return {
    type: 'draft',
    label: 'En préparation',
    hint: canManageComposition
      ? '🧠 En préparation : ⚠️ Seuls les administrateurs peuvent voir la compo actuelle. Partagez la aux responsables si vous le désirez et lorsque vous serez prêt cliquez sur ✅ Valider pour la rendre visible à tout le monde.'
      : 'Une composition est en cours de préparation par les sélectionneurs.',
    tone: 'info',
  }
}

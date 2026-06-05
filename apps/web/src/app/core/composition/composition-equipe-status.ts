import type { CompositionResponse } from './composition-api.service'
import { quotedEquipeActionLabel } from './composition-equipe-actions'
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
  tone: CompositionEquipeStatusTone
  /** Organizer guideline for Équipe tab (above slots); null for members. */
  managerGuideline: string | null
}

export interface CompositionEquipeStatusInput {
  composition: CompositionResponse | null
  canManageComposition: boolean
  roleSlots: Record<string, number>
  /** When true, draft guideline omits validate CTA (shown in actions lead instead). */
  suppressValidateCtaInGuideline?: boolean
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

function withGuideline(
  status: Omit<CompositionEquipeStatus, 'managerGuideline'>,
  guideline: string,
  canManageComposition: boolean,
): CompositionEquipeStatus {
  return {
    ...status,
    managerGuideline: canManageComposition ? guideline : null,
  }
}

/** Six-state Équipe badge — first match wins (composition-status-messages.md). */
export function resolveCompositionEquipeStatus(
  input: CompositionEquipeStatusInput,
): CompositionEquipeStatus | null {
  const { composition, canManageComposition, roleSlots, suppressValidateCtaInGuideline } = input
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
  /** Legacy rows: declined status with assignee still present (pre-6.7). Post-decline frees slot → `À compléter`. */
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
    return withGuideline(
      {
        type: 'none',
        label: 'À composer',
        tone: 'neutral',
      },
      `À composer : Cliquez dans un emplacement pour choisir un participant, ou utilisez ${quotedEquipeActionLabel('draw')} pour une proposition automatique.`,
      canManageComposition,
    )
  }

  if (isValidated && allFilledConfirmed) {
    return withGuideline(
      {
        type: 'complete',
        label: 'Équipe complète',
        tone: 'success',
      },
      `Équipe complète : Utilisez ${quotedEquipeActionLabel('announce')} pour la diffusion, ou ${quotedEquipeActionLabel('unlock')} pour modifier la composition.`,
      canManageComposition,
    )
  }

  if (isValidated && hasEmptySlots) {
    return withGuideline(
      {
        type: 'slots_to_complete',
        label: 'À compléter',
        tone: 'warning',
      },
      `À compléter : La composition est validée mais certains emplacements sont vides. Cliquez dans un emplacement vide ou utilisez ${quotedEquipeActionLabel('fill')} pour un tirage sur les créneaux restants.`,
      canManageComposition,
    )
  }

  if (isValidated && hasDeclinedInSlots) {
    return withGuideline(
      {
        type: 'has_declined',
        label: 'À vérifier',
        tone: 'warning',
      },
      'À vérifier : Des participants ont décliné. Vérifiez les disponibilités et ajustez la composition si besoin.',
      canManageComposition,
    )
  }

  if (isValidated) {
    return withGuideline(
      {
        type: 'pending_confirmation',
        label: 'Confirmations en cours',
        tone: 'info',
      },
      `Confirmations en cours : Utilisez ${quotedEquipeActionLabel('announce')} pour informer les participants et recueillir leurs confirmations. La composition est visible par tous. ${quotedEquipeActionLabel('unlock')} permet de revenir en édition.`,
      canManageComposition,
    )
  }

  const draftGuideline = suppressValidateCtaInGuideline
    ? `En préparation : Seuls les organisateur·ices et administrateur·ices voient cette composition. Partagez-la aux responsables si vous le désirez.`
    : `En préparation : Seuls les organisateur·ices et administrateur·ices voient cette composition. Partagez-la via ${quotedEquipeActionLabel('share')} si besoin, puis ${quotedEquipeActionLabel('validate')} pour la rendre visible à tous.`

  return withGuideline(
    {
      type: 'draft',
      label: 'En préparation',
      tone: 'info',
    },
    draftGuideline,
    canManageComposition,
  )
}

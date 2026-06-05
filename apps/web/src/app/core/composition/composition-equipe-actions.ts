import type { CompositionResponse } from './composition-api.service'

export type EquipeActionId = 'validate' | 'fill' | 'announce' | 'draw' | 'unlock' | 'share'

export type EquipePrimaryAction = 'validate' | 'fill' | 'announce' | 'draw'

/** Visible toolbar / overflow labels — keep in sync with event-equipe-tab.html. */
export const EQUIPE_ACTION_LABELS: Record<EquipeActionId, string> = {
  validate: 'Valider',
  draw: 'Tirer au sort',
  announce: 'Annoncer la compo',
  fill: 'Compléter',
  unlock: 'Déverrouiller',
  share: 'Partager',
}

/** Quoted action name for guidelines (matches UI button text). */
export function quotedEquipeActionLabel(id: EquipeActionId): string {
  return `« ${EQUIPE_ACTION_LABELS[id]} »`
}

export interface CanValidateCompositionInput {
  canManageComposition: boolean
  composition: CompositionResponse | null | undefined
  compositionInteractionBlocked?: boolean
}

/** Validate CTA eligibility — shared by event-detail chrome and équipe tab toolbar. */
export function canValidateComposition(input: CanValidateCompositionInput): boolean {
  const {
    canManageComposition,
    composition,
    compositionInteractionBlocked = false,
  } = input
  if (!canManageComposition || !composition || composition.validatedAt != null) {
    return false
  }
  if (compositionInteractionBlocked) {
    return false
  }
  return (composition.slots ?? []).some((slot) => slot.participantId != null)
}

/** Visibility flags for Équipe toolbar actions (mirrors event-equipe-tab computeds). */
export interface EquipeActionFlags {
  canValidate: boolean
  canFillGaps: boolean
  canAnnounceComposition: boolean
  canDraw: boolean
  canUnlock: boolean
  canShareDraw: boolean
  hasAssignedSlot: boolean
}

export interface EquipeToolbarLayout {
  primary: EquipePrimaryAction | null
  grid: EquipeActionId[]
  overflow: EquipeActionId[]
}

const GRID_ORDER: EquipeActionId[] = ['validate', 'draw', 'announce', 'fill', 'unlock']

function isActionVisible(id: EquipeActionId, flags: EquipeActionFlags): boolean {
  switch (id) {
    case 'validate':
      return flags.canValidate
    case 'fill':
      return flags.canFillGaps
    case 'announce':
      return flags.canAnnounceComposition
    case 'draw':
      return flags.canDraw
    case 'unlock':
      return flags.canUnlock
    case 'share':
      return flags.canShareDraw
  }
}

/** Single forward CTA — first match wins (state matrix in story 6.12). */
export function resolveEquipePrimaryAction(flags: EquipeActionFlags): EquipePrimaryAction | null {
  if (flags.canValidate) {
    return 'validate'
  }
  if (flags.canFillGaps) {
    return 'fill'
  }
  if (flags.canAnnounceComposition) {
    return 'announce'
  }
  if (flags.canDraw && !flags.hasAssignedSlot) {
    return 'draw'
  }
  if (flags.canDraw) {
    return 'draw'
  }
  return null
}

function visibleNonShareActions(flags: EquipeActionFlags): EquipeActionId[] {
  return GRID_ORDER.filter((id) => id !== 'share' && isActionVisible(id, flags))
}

/** Partager lives in overflow during draft validate, or when ≥2 other toolbar actions are visible. */
export function shouldPutShareInOverflow(flags: EquipeActionFlags): boolean {
  if (!flags.canShareDraw) {
    return false
  }
  if (flags.canValidate) {
    return true
  }
  return visibleNonShareActions(flags).length >= 2
}

/** Splits visible actions into 2-column grid cells and overflow menu items. */
export function resolveEquipeToolbarLayout(flags: EquipeActionFlags): EquipeToolbarLayout {
  const primary = resolveEquipePrimaryAction(flags)
  const shareInOverflow = shouldPutShareInOverflow(flags)

  const grid: EquipeActionId[] = []
  for (const id of GRID_ORDER) {
    if (!isActionVisible(id, flags)) {
      continue
    }
    if (id === 'share') {
      if (!shareInOverflow) {
        grid.push(id)
      }
      continue
    }
    grid.push(id)
  }

  const overflow: EquipeActionId[] = []
  if (shareInOverflow && flags.canShareDraw) {
    overflow.push('share')
  }

  return { primary, grid, overflow }
}

export function isEquipePrimaryAction(
  actionId: EquipeActionId,
  primary: EquipePrimaryAction | null,
): boolean {
  if (primary == null) {
    return false
  }
  return actionId === primary
}

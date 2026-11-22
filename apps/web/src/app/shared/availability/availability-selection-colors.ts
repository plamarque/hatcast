import { participationSlotRowModifier, type ParticipationSlotStatus } from '../../core/participation/participation-status'

/** Visible assignment only; unknown status uses the generic selected state. */
export function selectionBackground(status: ParticipationSlotStatus | 'selected' | null | undefined): string {
  const modifier = status === 'selected' ? '--selected' : participationSlotRowModifier(status) ?? '--selected'
  return `var(--hatcast-participation-${modifier.slice(2)}-gradient-strong)`
}

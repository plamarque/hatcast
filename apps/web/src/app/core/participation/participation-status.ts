import {
  availabilityBadgeModifier,
  type AvailabilityStatus,
} from '../availability/availability-status'

/** Chart / glance block status (member profile season chart). */
export type ParticipationChartStatus =
  | 'available'
  | 'selected'
  | 'pending'
  | 'declined'
  | 'unavailable'
  | 'neutral'

const PARTICIPATION_CHART_STATUSES = new Set<ParticipationChartStatus>([
  'available',
  'selected',
  'pending',
  'declined',
  'unavailable',
  'neutral',
])

/** Normalizes API chart status; maps legacy `available` + roleKey to `selected`. */
export function resolveParticipationChartStatus(
  status: string,
  roleKey?: string | null,
): ParticipationChartStatus {
  if (status === 'available' && roleKey) {
    return 'selected'
  }
  if (PARTICIPATION_CHART_STATUSES.has(status as ParticipationChartStatus)) {
    return status as ParticipationChartStatus
  }
  return 'neutral'
}

/** Slot participation on a locked composition row. */
export type ParticipationSlotStatus = 'confirmed' | 'pending' | 'declined'

export type ParticipationBadgeStatus =
  | AvailabilityStatus
  | 'in-team'
  | 'selected'
  | 'declined'

/**
 * BEM modifier suffix for chart blocks and stat surfaces.
 * Pair with base class + `--` prefix, e.g. `member-profile__chart-block` + modifier.
 */
export function participationChartModifier(status: ParticipationChartStatus): string {
  switch (status) {
    case 'available':
      return '--available'
    case 'selected':
      return '--selected'
    case 'pending':
      return '--pending'
    case 'declined':
      return '--declined'
    case 'unavailable':
      return '--unavailable'
    default:
      return '--neutral'
  }
}

/** Badge modifier for agenda cards and compact status pills. */
export function participationBadgeModifier(status: ParticipationBadgeStatus): string {
  switch (status) {
    case 'in-team':
    case 'selected':
      return '--selected'
    case 'declined':
      return '--declined'
    default:
      return availabilityBadgeModifier(status)
  }
}

/** Row modifier for équipe tab slot lines. */
export function participationSlotRowModifier(
  status: ParticipationSlotStatus | null | undefined,
): string | null {
  switch (status) {
    case 'confirmed':
      return '--selected'
    case 'pending':
      return '--pending'
    case 'declined':
      return '--declined'
    default:
      return null
  }
}

/** CSS custom property prefix for a participation semantic state. */
export function participationTokenPrefix(
  status: Exclude<ParticipationChartStatus, 'neutral'>,
): string {
  switch (status) {
    case 'available':
      return '--hatcast-participation-available'
    case 'selected':
      return '--hatcast-participation-selected'
    case 'pending':
      return '--hatcast-participation-pending'
    case 'declined':
      return '--hatcast-participation-declined'
    case 'unavailable':
      return '--hatcast-participation-unavailable'
  }
}

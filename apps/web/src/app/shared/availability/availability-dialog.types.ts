import type { AvailabilityStatus } from '../../core/availability/availability-status'
import type { RoleSlots } from '../../core/events/event-types'

export interface AvailabilityDialogData {
  seasonId: string
  eventId: string
  eventTitle: string
  eventStartsAt: string
  subjectDisplayName: string
  initialStatus: AvailabilityStatus
  troupeId: string
  roleSlots: RoleSlots
  initialRoleKeys?: string[] | null
}

export interface AvailabilityDialogResult {
  status: AvailabilityStatus
  roleKeys: string[]
}

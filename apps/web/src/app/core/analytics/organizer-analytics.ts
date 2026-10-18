import type { MySeasonPermissions } from '../permissions/organizer-api.service'

/**
 * Event-local analytics classification. This is deliberately not an
 * authorization model and must never be persisted as a global People role.
 */
export type ActorScope =
  | 'member'
  | 'event_organizer'
  | 'season_organizer'
  | 'troupe_admin'
  | 'platform_admin'

/**
 * Most-specific operational scope wins: platform admin, troupe admin, season
 * organizer, then organizer of this event. Absent or unloaded permissions are
 * represented safely as member rather than triggering another request.
 */
export function resolveActorScope(
  permissions: MySeasonPermissions | null | undefined,
  eventId: string,
  options: { platformAdmin?: boolean } = {},
): ActorScope {
  if (options.platformAdmin) return 'platform_admin'
  if (permissions?.isTroupeAdmin) return 'troupe_admin'
  if (permissions?.isSeasonOrganizer) return 'season_organizer'
  if (permissions?.eventOrganizerFor.includes(eventId)) return 'event_organizer'
  return 'member'
}

export type BoundedOutcome = 'succeeded' | 'failed' | 'refused'
export type SlotOperation = 'assign' | 'unassign' | 'remove_slot' | 'restore_slot'
export type RecipientCountBucket = '0' | '1' | '2_5' | '6_20' | '21_plus'
export type AnnouncementChannel = 'copy' | 'whatsapp'

export function recipientCountBucket(count: number): RecipientCountBucket {
  if (count <= 0) return '0'
  if (count === 1) return '1'
  if (count <= 5) return '2_5'
  if (count <= 20) return '6_20'
  return '21_plus'
}

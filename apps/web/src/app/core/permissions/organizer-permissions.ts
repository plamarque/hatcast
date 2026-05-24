import type { MySeasonPermissions } from '../permissions/organizer-api.service'

export function canManageComposition(
  permissions: MySeasonPermissions | null | undefined,
  eventId: string,
): boolean {
  if (!permissions) return false
  return (
    permissions.isTroupeAdmin ||
    permissions.isSeasonOrganizer ||
    permissions.eventOrganizerFor.includes(eventId)
  )
}

import type { MySeasonPermissions } from '../permissions/organizer-api.service'

export interface OrganizerPermissionOptions {
  platformAdmin?: boolean
}

export function canManageEvents(
  permissions: MySeasonPermissions | null | undefined,
  options: OrganizerPermissionOptions = {},
): boolean {
  if (options.platformAdmin) {
    return true
  }
  return permissions?.canManageEvents === true
}

export function canManageComposition(
  permissions: MySeasonPermissions | null | undefined,
  eventId: string,
  options: OrganizerPermissionOptions = {},
): boolean {
  if (options.platformAdmin) {
    return true
  }
  if (!permissions) {
    return false
  }
  return (
    permissions.isTroupeAdmin ||
    permissions.isSeasonOrganizer ||
    permissions.eventOrganizerFor.includes(eventId)
  )
}

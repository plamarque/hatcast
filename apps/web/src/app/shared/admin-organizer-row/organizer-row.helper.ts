import type { OrganizerResponse } from '../../core/permissions/organizer-api.service'

export type OrganizerScope = 'saison' | 'spectacle'

export const PARTICIPANT_ROLE_LABEL = 'Participant·e'

export const ORGANIZER_ROLE_LABEL = 'Organisateur·ice'

export const PROMOTE_TOOLTIP =
  'Liez un compte HatCast pour promouvoir organisateur·ice'

export const PARTICIPATION_ROLE_UPDATE_FAILED =
  'Impossible de mettre à jour le rôle — rechargez la page.'

export const ORGANIZER_LIST_RELOAD_FAILED =
  'Impossible de rafraîchir les organisateur·ices — rechargez la page.'

export function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase()
  return trimmed ? trimmed : null
}

export function findRowOrganizer(
  userId: string | null | undefined,
  email: string | null | undefined,
  organizers: OrganizerResponse[],
): OrganizerResponse | undefined {
  if (userId) {
    const byUserId = organizers.find((o) => o.userId === userId)
    if (byUserId) {
      return byUserId
    }
  }
  const normalizedEmail = normalizeEmail(email)
  if (normalizedEmail) {
    return organizers.find((o) => normalizeEmail(o.email) === normalizedEmail)
  }
  return undefined
}

export function isRowOrganizer(
  userId: string | null | undefined,
  email: string | null | undefined,
  organizers: OrganizerResponse[],
): boolean {
  return findRowOrganizer(userId, email, organizers) !== undefined
}

/** Organizer APIs promote by email; userId alone is not enough. */
export function canAssignOrganizerRole(email: string | null | undefined): boolean {
  return normalizeEmail(email) !== null
}

export function participationRoleChipLabel(
  isOrganizer: boolean,
  menuEnabled: boolean,
): string {
  const label = isOrganizer ? ORGANIZER_ROLE_LABEL : PARTICIPANT_ROLE_LABEL
  return menuEnabled ? `${label} ▾` : label
}

export function organizerRoleMenuLabel(scope: OrganizerScope): string {
  return scope === 'spectacle'
    ? `${ORGANIZER_ROLE_LABEL} du spectacle`
    : `${ORGANIZER_ROLE_LABEL} de saison`
}

export function organizerChipTooltip(scope: OrganizerScope): string {
  return `${ORGANIZER_ROLE_LABEL} (${scope})`
}

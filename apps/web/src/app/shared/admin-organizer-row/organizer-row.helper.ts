import { effectiveMemberGender, type MemberGender } from '../../core/account/member-gender'
import type { OrganizerResponse } from '../../core/permissions/organizer-api.service'

export type OrganizerScope = 'saison' | 'spectacle'

export const PARTICIPANT_ROLE_LABEL = 'Participant·e'

export const ORGANIZER_ROLE_LABEL = 'Organisateur·ice'

const PARTICIPANT_ROLE_BY_GENDER: Record<MemberGender, string> = {
  male: 'Participant',
  female: 'Participante',
  non_specified: PARTICIPANT_ROLE_LABEL,
}

const ORGANIZER_ROLE_BY_GENDER: Record<MemberGender, string> = {
  male: 'Organisateur',
  female: 'Organisatrice',
  non_specified: ORGANIZER_ROLE_LABEL,
}

export function participantRoleLabel(gender?: MemberGender | null): string {
  return PARTICIPANT_ROLE_BY_GENDER[effectiveMemberGender(gender)]
}

export function organizerRoleLabel(gender?: MemberGender | null): string {
  return ORGANIZER_ROLE_BY_GENDER[effectiveMemberGender(gender)]
}

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
  gender?: MemberGender | null,
): string {
  const label = isOrganizer ? organizerRoleLabel(gender) : participantRoleLabel(gender)
  return menuEnabled ? `${label} ▾` : label
}

export function organizerRoleMenuLabel(
  scope: OrganizerScope,
  gender?: MemberGender | null,
): string {
  const base = organizerRoleLabel(gender)
  return scope === 'spectacle' ? `${base} du spectacle` : `${base} de saison`
}

export function organizerChipTooltip(scope: OrganizerScope): string {
  return `${ORGANIZER_ROLE_LABEL} (${scope})`
}

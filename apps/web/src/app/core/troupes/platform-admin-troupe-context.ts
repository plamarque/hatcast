import type { TroupeAdminSummary, TroupeListItem } from './troupe-api.service'

/** Placeholder membership for platform-admin troupe context (no real adhésion). */
const PLATFORM_ADMIN_MEMBERSHIP_ID = '00000000-0000-4000-8000-000000000001'
const GUEST_INVITATION_MEMBERSHIP_ID = '00000000-0000-4000-8000-000000000002'

export function troupeListItemFromAdminSummary(summary: TroupeAdminSummary): TroupeListItem {
  return troupeListItemFromScopedSummary(summary, {
    membershipId: PLATFORM_ADMIN_MEMBERSHIP_ID,
    displayName: 'Administration plateforme',
    baselineRole: 'MEMBER',
  })
}

/** Contexte troupe minimal pour un invité scope invitation (EXTERNE hors liste troupes). */
export function troupeListItemFromGuestInvitation(summary: TroupeAdminSummary): TroupeListItem {
  return troupeListItemFromScopedSummary(summary, {
    membershipId: GUEST_INVITATION_MEMBERSHIP_ID,
    displayName: 'Invitation',
    baselineRole: 'EXTERNE',
  })
}

function troupeListItemFromScopedSummary(
  summary: TroupeAdminSummary,
  membership: {
    membershipId: string
    displayName: string
    baselineRole: TroupeListItem['membership']['baselineRole']
  },
): TroupeListItem {
  const timestamp = new Date(0).toISOString()
  return {
    id: summary.id,
    name: summary.name,
    slug: summary.slug,
    isDemo: summary.isDemo,
    joinPolicy: summary.joinPolicy,
    activeMemberCount: 0,
    upcomingEventCount: 0,
    membership: {
      id: membership.membershipId,
      displayName: membership.displayName,
      status: 'ACTIVE',
      baselineRole: membership.baselineRole,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

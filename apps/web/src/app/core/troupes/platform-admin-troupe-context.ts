import type { TroupeAdminSummary, TroupeListItem } from './troupe-api.service'

/** Placeholder membership for platform-admin troupe context (no real adhésion). */
const PLATFORM_ADMIN_MEMBERSHIP_ID = '00000000-0000-4000-8000-000000000001'

export function troupeListItemFromAdminSummary(summary: TroupeAdminSummary): TroupeListItem {
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
      id: PLATFORM_ADMIN_MEMBERSHIP_ID,
      displayName: 'Administration plateforme',
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

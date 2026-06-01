package com.hatcast.api.event

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.organizer.OrganizerAccessService
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * JPQL fragment for paginated event lists: published events OR drafts visible to the viewer
 * (troupe admin, season organizer, or event organizer — same scope as [OrganizerAccessService.canManageComposition]).
 *
 * Requires bind parameters `:viewerUserId` and `:applyDraftVisibility` (`false` skips filtering — platform admin).
 */
const val EVENT_LIST_VISIBILITY_JPQL =
    "(:applyDraftVisibility = false OR e.availabilityOpenedAt IS NOT NULL OR EXISTS (" +
        "SELECT 1 FROM TroupeMembershipEntity tm WHERE tm.troupe.id = e.season.troupe.id " +
        "AND tm.user.id = :viewerUserId AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE " +
        "AND tm.baselineRole = com.hatcast.api.troupe.TroupeBaselineRole.TROUPE_ADMIN) OR EXISTS (" +
        "SELECT 1 FROM SeasonOrganizerEntity so WHERE so.season.id = e.season.id AND so.user.id = :viewerUserId) OR EXISTS (" +
        "SELECT 1 FROM EventOrganizerEntity eo WHERE eo.event.id = e.id AND eo.user.id = :viewerUserId))"

@Component
class EventDraftVisibility(
    private val organizerAccess: OrganizerAccessService,
    private val platformAdminService: PlatformAdminService,
) {
    companion object {
        const val DRAFT_AVAILABILITY_CLOSED_MESSAGE =
            "Ce spectacle est en brouillon. La collecte des disponibilités est momentanément fermée."
    }

    /** When false, list queries skip [EVENT_LIST_VISIBILITY_JPQL] (platform admin sees all rows). */
    fun applyDraftVisibilityFilter(principal: SessionUserPrincipal): Boolean =
        !platformAdminService.isPlatformAdmin(principal)

    fun canViewDraftEvent(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = organizerAccess.canManageComposition(eventId, seasonId, principal)

    fun isDraft(event: EventEntity): Boolean = !event.isAvailabilityOpen()
}

fun EventEntity.isAvailabilityOpen(): Boolean = availabilityOpenedAt != null

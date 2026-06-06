package com.hatcast.api.participant

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipService
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Component
class GuestInvitationAccessService(
    private val platformAdminService: PlatformAdminService,
    private val membershipService: TroupeMembershipService,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun isActiveTroupeMember(
        userId: UUID,
        troupeId: UUID,
    ): Boolean = membershipService.isActiveMember(userId, troupeId)

    @Transactional(readOnly = true)
    fun hasAnyGuestInvitation(userId: UUID): Boolean {
        if (seasonParticipantRepository.existsActiveGuestInvitationForUser(userId)) {
            return true
        }
        return eventParticipantRepository.existsActiveGuestEventInvitationForUser(userId)
    }

    @Transactional(readOnly = true)
    fun resolveGuestSeasonWorkspaceMode(
        userId: UUID,
        seasonId: UUID,
    ): GuestSeasonWorkspaceMode {
        val season =
            seasonRepository.findById(seasonId).orElse(null) ?: return GuestSeasonWorkspaceMode.NONE
        if (isActiveTroupeMember(userId, season.troupe.id)) {
            return GuestSeasonWorkspaceMode.FULL
        }
        val seasonRows =
            seasonParticipantRepository.findActiveForSeasonLinkedToUser(
                seasonId,
                ParticipantStatus.ACTIVE,
                userId,
            )
        if (seasonRows.any { it.invitationScope == InvitationScope.SEASON }) {
            return GuestSeasonWorkspaceMode.AGENDA_ONLY
        }
        if (eventParticipantRepository.existsActiveForSeasonLinkedToUser(seasonId, userId)) {
            return GuestSeasonWorkspaceMode.EVENTS_ONLY
        }
        return GuestSeasonWorkspaceMode.NONE
    }

    @Transactional(readOnly = true)
    fun canAccessEvent(
        userId: UUID,
        seasonId: UUID,
        eventId: UUID,
    ): Boolean {
        val season =
            seasonRepository.findById(seasonId).orElse(null) ?: return false
        if (isActiveTroupeMember(userId, season.troupe.id)) {
            return true
        }
        return canAccessEventAsGuest(userId, seasonId, eventId)
    }

    @Transactional(readOnly = true)
    fun hasGuestInvitationInTroupe(
        userId: UUID,
        troupeId: UUID,
    ): Boolean = seasonRepository.findInvitedForUserInTroupe(troupeId, userId).isNotEmpty()

    @Transactional(readOnly = true)
    fun requireMemberOrInvitedGuestForEventOrNotFound(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        try {
            requireMemberOrInvitedGuest(seasonId, eventId, principal)
        } catch (ex: ResponseStatusException) {
            if (ex.statusCode == HttpStatus.FORBIDDEN && isGuestEventAccessDenied(seasonId, eventId, principal)) {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
            }
            throw ex
        }
    }

    @Transactional(readOnly = true)
    fun requireMemberOrInvitedGuest(
        seasonId: UUID,
        eventId: UUID?,
        principal: SessionUserPrincipal,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        val season = loadSeason(seasonId)
        val userId = principal.userId
        if (isActiveTroupeMember(userId, season.troupe.id)) {
            membershipService.requireActiveMemberMembership(userId, season.troupe.id)
            return
        }
        if (eventId != null) {
            if (!canAccessEventAsGuest(userId, seasonId, eventId)) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cet événement.")
            }
            return
        }
        if (resolveGuestSeasonWorkspaceMode(userId, seasonId) == GuestSeasonWorkspaceMode.NONE) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette saison.")
        }
    }

    @Transactional(readOnly = true)
    fun resolveSeasonReadAccess(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): GuestSeasonWorkspaceMode {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return GuestSeasonWorkspaceMode.FULL
        }
        val season = loadSeason(seasonId)
        val userId = principal.userId
        if (isActiveTroupeMember(userId, season.troupe.id)) {
            membershipService.requireActiveMemberMembership(userId, season.troupe.id)
            return GuestSeasonWorkspaceMode.FULL
        }
        resolveGuestSeasonWorkspaceMode(userId, seasonId).takeIf { it != GuestSeasonWorkspaceMode.NONE }
            ?.let { return it }
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette saison.")
    }

    @Transactional(readOnly = true)
    fun requireSeasonWorkspaceAccess(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): GuestSeasonWorkspaceMode {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return GuestSeasonWorkspaceMode.FULL
        }
        val season = loadSeason(seasonId)
        val userId = principal.userId
        if (isActiveTroupeMember(userId, season.troupe.id)) {
            membershipService.requireActiveMemberMembership(userId, season.troupe.id)
            return GuestSeasonWorkspaceMode.FULL
        }
        return when (resolveGuestSeasonWorkspaceMode(userId, seasonId)) {
            GuestSeasonWorkspaceMode.AGENDA_ONLY -> GuestSeasonWorkspaceMode.AGENDA_ONLY
            GuestSeasonWorkspaceMode.EVENTS_ONLY -> GuestSeasonWorkspaceMode.EVENTS_ONLY
            GuestSeasonWorkspaceMode.FULL -> GuestSeasonWorkspaceMode.FULL
            GuestSeasonWorkspaceMode.NONE ->
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette saison.")
        }
    }

    @Transactional(readOnly = true)
    fun requireMemberOnlyPastAccess(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        val season = loadSeason(seasonId)
        membershipService.requireActiveMemberMembership(principal.userId, season.troupe.id)
    }

    private fun canAccessEventAsGuest(
        userId: UUID,
        seasonId: UUID,
        eventId: UUID,
    ): Boolean {
        val seasonRows =
            seasonParticipantRepository.findActiveForSeasonLinkedToUser(
                seasonId,
                ParticipantStatus.ACTIVE,
                userId,
            )
        for (row in seasonRows) {
            when (row.invitationScope) {
                InvitationScope.SEASON -> {
                    if (
                        !eventParticipantExclusionRepository.existsByIdEventIdAndIdSeasonParticipantId(
                            eventId,
                            row.id,
                        )
                    ) {
                        return true
                    }
                }
                null -> Unit
                InvitationScope.EVENT -> {
                    val membershipId = row.troupeMembership?.id
                    if (membershipId != null) {
                        val linked =
                            eventParticipantRepository
                                .findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
                                    eventId,
                                    ParticipantStatus.ACTIVE,
                                    membershipId,
                                )
                        if (linked.isNotEmpty()) {
                            return true
                        }
                    }
                }
            }
        }
        return eventParticipantRepository
            .findActiveForEventLinkedToUser(eventId, ParticipantStatus.ACTIVE, userId)
            .isNotEmpty() || matchesEventParticipantByAccountEmail(userId, eventId)
    }

    private fun matchesEventParticipantByAccountEmail(
        userId: UUID,
        eventId: UUID,
    ): Boolean {
        val email =
            userRepository.findById(userId).orElse(null)?.email?.trim()?.lowercase()
                ?: return false
        return eventParticipantRepository
            .findActiveForEventWithAssociations(eventId, ParticipantStatus.ACTIVE)
            .any { row ->
                row.user?.id == userId ||
                    row.normalizedEmail?.equals(email, ignoreCase = true) == true ||
                    row.seasonParticipant?.user?.id == userId ||
                    row.seasonParticipant?.troupeMembership?.user?.id == userId
            }
    }

    private fun isGuestEventAccessDenied(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return false
        }
        val season = seasonRepository.findById(seasonId).orElse(null) ?: return false
        if (isActiveTroupeMember(principal.userId, season.troupe.id)) {
            return false
        }
        return !canAccessEventAsGuest(principal.userId, seasonId, eventId)
    }

    private fun loadSeason(seasonId: UUID): SeasonEntity =
        seasonRepository
            .findById(seasonId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
}

package com.hatcast.api.event

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.dto.EventAvailabilitySummaryResponse
import com.hatcast.api.composition.CompositionService
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.event.dto.EventPageResponseDto
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.OrganizerAccessService
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.organizer.dto.OrganizerResponseDto
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.GuestSeasonWorkspaceMode
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeCategoryService
import com.hatcast.api.troupe.dto.TroupeCategoryDto
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class EventPageService(
    private val eventService: EventService,
    private val seasonRepository: SeasonRepository,
    private val guestInvitationAccess: GuestInvitationAccessService,
    private val organizerAccessService: OrganizerAccessService,
    private val seasonParticipantService: SeasonParticipantService,
    private val troupeCategoryService: TroupeCategoryService,
    private val availabilityService: AvailabilityService,
    private val compositionService: CompositionService,
    private val eventOrganizerRepository: EventOrganizerRepository,
) {
    @Transactional(readOnly = true)
    fun loadPageById(
        seasonId: UUID,
        eventId: UUID,
        tab: EventPageTab,
        includeChances: Boolean,
        principal: SessionUserPrincipal,
    ): EventPageResponseDto =
        loadPage(
            seasonId = seasonId,
            event = eventService.getById(seasonId, eventId, principal),
            eventId = eventId,
            tab = tab,
            includeChances = includeChances,
            principal = principal,
        )

    @Transactional(readOnly = true)
    fun loadPageBySlug(
        seasonId: UUID,
        slug: String,
        tab: EventPageTab,
        includeChances: Boolean,
        principal: SessionUserPrincipal,
    ): EventPageResponseDto {
        val event = eventService.getBySlug(seasonId, slug, principal)
        return loadPage(
            seasonId = seasonId,
            event = event,
            eventId = event.id,
            tab = tab,
            includeChances = includeChances,
            principal = principal,
        )
    }

    private fun loadPage(
        seasonId: UUID,
        event: EventResponseDto,
        eventId: UUID,
        tab: EventPageTab,
        includeChances: Boolean,
        principal: SessionUserPrincipal,
    ): EventPageResponseDto {
        val workspaceMode = guestInvitationAccess.resolveSeasonReadAccess(seasonId, principal)
        val permissions =
            if (workspaceMode == GuestSeasonWorkspaceMode.FULL) {
                organizerAccessService.mySeasonPermissions(seasonId, principal)
            } else {
                MySeasonPermissionsDto.guestWorkspaceReadOnly()
            }
        val participantSelectors =
            if (workspaceMode == GuestSeasonWorkspaceMode.FULL) {
                seasonParticipantService.listSelectors(seasonId, principal)
            } else {
                seasonParticipantService.listGuestSelectors(seasonId, principal)
            }

        val organizers =
            when (tab) {
                EventPageTab.INFOS -> listOrganizersForDisplay(eventId)
                else -> null
            }

        val categories =
            when (tab) {
                EventPageTab.INFOS ->
                    if (workspaceMode == GuestSeasonWorkspaceMode.FULL) {
                        listCategoriesForSeason(seasonId, principal)
                    } else {
                        troupeCategoryService.listForGuestWorkspace(seasonId, principal)
                    }
                else -> null
            }

        val availabilitySummary =
            when (tab) {
                EventPageTab.DISPOS ->
                    loadAvailabilitySummaryIfReadable(seasonId, eventId, principal, includeChances)
                else -> null
            }

        val composition =
            when (tab) {
                EventPageTab.EQUIPE -> compositionService.getComposition(seasonId, eventId, principal)
                else -> null
            }

        return EventPageResponseDto(
            event = event,
            permissions = permissions,
            participantSelectors = participantSelectors,
            organizers = organizers,
            categories = categories,
            availabilitySummary = availabilitySummary,
            composition = composition,
            hasUnknownAvailability =
                resolveHasUnknownAvailability(
                    seasonId = seasonId,
                    eventId = eventId,
                    event = event,
                    permissions = permissions,
                    principal = principal,
                    availabilitySummary = availabilitySummary,
                ),
        )
    }

    private fun listOrganizersForDisplay(eventId: UUID): List<OrganizerResponseDto> =
        eventOrganizerRepository
            .findByEvent_IdOrderByGrantedAtAsc(eventId)
            .map(OrganizerResponseDto::from)

    private fun listCategoriesForSeason(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): List<TroupeCategoryDto> {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        return troupeCategoryService.listForTroupe(season.troupe.id, principal)
    }

    private fun loadAvailabilitySummaryIfReadable(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
        includeChances: Boolean,
    ): EventAvailabilitySummaryResponse? =
        try {
            availabilityService.getSummary(seasonId, eventId, principal, includeChances)
        } catch (ex: ResponseStatusException) {
            if (ex.statusCode == HttpStatus.FORBIDDEN) {
                null
            } else {
                throw ex
            }
        }

    private fun resolveHasUnknownAvailability(
        seasonId: UUID,
        eventId: UUID,
        event: EventResponseDto,
        permissions: MySeasonPermissionsDto,
        principal: SessionUserPrincipal,
        availabilitySummary: EventAvailabilitySummaryResponse?,
    ): Boolean {
        if (!canSeeRelanceAvailabilityHint(event, permissions)) {
            return false
        }
        if (availabilitySummary != null) {
            return availabilitySummary.participants.any { it.status == AvailabilityStatusMapper.UNKNOWN }
        }
        return loadHasUnknownAvailabilityIfReadable(seasonId, eventId, principal)
    }

    private fun canSeeRelanceAvailabilityHint(
        event: EventResponseDto,
        permissions: MySeasonPermissionsDto,
    ): Boolean {
        if (event.archived || event.availabilityOpenedAt == null) {
            return false
        }
        return permissions.isTroupeAdmin ||
            permissions.isSeasonOrganizer ||
            event.id in permissions.eventOrganizerFor
    }

    private fun loadHasUnknownAvailabilityIfReadable(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean =
        try {
            availabilityService.hasUnknownAvailability(seasonId, eventId, principal)
        } catch (ex: ResponseStatusException) {
            if (ex.statusCode == HttpStatus.FORBIDDEN) {
                false
            } else {
                throw ex
            }
        }
}

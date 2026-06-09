package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventListScope
import com.hatcast.api.event.EventService
import com.hatcast.api.organizer.OrganizerAccessService
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.dto.SeasonWorkspaceResponseDto
import com.hatcast.api.troupe.TroupeCategoryService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class SeasonWorkspaceService(
    private val seasonRepository: SeasonRepository,
    private val organizerAccessService: OrganizerAccessService,
    private val seasonParticipantService: SeasonParticipantService,
    private val troupeCategoryService: TroupeCategoryService,
    private val eventService: EventService,
) {
    @Transactional(readOnly = true)
    fun loadWorkspace(
        seasonId: UUID,
        view: SeasonWorkspaceView,
        eventPage: Int,
        eventSize: Int,
        principal: SessionUserPrincipal,
    ): SeasonWorkspaceResponseDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        val troupeId = season.troupe.id

        val permissions = organizerAccessService.mySeasonPermissions(seasonId, principal)
        val participantSelectors = seasonParticipantService.listSelectors(seasonId, principal)
        val categories = troupeCategoryService.listForTroupe(troupeId, principal)

        val upcomingEvents =
            when (view) {
                SeasonWorkspaceView.AGENDA ->
                    eventService.listForSeason(
                        seasonId,
                        eventPage,
                        eventSize,
                        EventListScope.UPCOMING,
                        principal,
                        participantId = null,
                    )
            }

        return SeasonWorkspaceResponseDto(
            permissions = permissions,
            participantSelectors = participantSelectors,
            categories = categories,
            upcomingEvents = upcomingEvents,
        )
    }
}

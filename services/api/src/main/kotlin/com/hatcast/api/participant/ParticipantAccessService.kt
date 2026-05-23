package com.hatcast.api.participant

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class ParticipantAccessService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val eventOrganizerRepository: EventOrganizerRepository,
    private val troupeAccess: TroupeAccessService,
) {
    fun canManageSeasonParticipants(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal)

    fun canManageEventParticipants(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean =
        isTroupeAdminForSeason(seasonId, principal) ||
            eventOrganizerRepository.existsByEvent_IdAndUser_Id(eventId, principal.userId)

    fun canViewParticipantEmail(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = canManageSeasonParticipants(seasonId, principal)

    fun canViewEventParticipantEmail(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = canManageEventParticipants(eventId, seasonId, principal)

    fun requireCanManageSeasonParticipants(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!canManageSeasonParticipants(seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour gérer les participants de saison.")
        }
    }

    fun requireCanManageEventParticipants(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!canManageEventParticipants(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour gérer les participants du spectacle.")
        }
    }

    fun loadSeasonForMember(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): SeasonEntity {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        return season
    }

    fun loadEventInSeason(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        troupeAccess.requireActiveMember(principal, event.season.troupe.id)
    }

    private fun isTroupeAdminForSeason(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        return troupeAccess.isTroupeAdmin(principal, season.troupe.id)
    }
}

package com.hatcast.api.audit

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

enum class AuditReadRole {
    PLATFORM_OR_TROUPE_ADMIN,
    SEASON_ORGANIZER,
    EVENT_ORGANIZER,
    PARTICIPANT_ONLY,
    NONE,
}

data class AuditReadAuthorization(
    val role: AuditReadRole,
    val troupeId: UUID,
    val seasonId: UUID?,
    val allowedEventIds: Set<UUID>?,
)

@Service
class AuditEventAccessService(
    private val troupeAccess: TroupeAccessService,
    private val platformAdminService: PlatformAdminService,
    private val organizerAccess: OrganizerAccessRules,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val eventOrganizerRepository: EventOrganizerRepository,
) {
    fun canViewAuditTroupe(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean =
        platformAdminService.isPlatformAdmin(principal) ||
            troupeAccess.isTroupeAdmin(principal, troupeId)

    fun canViewAuditSeason(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        val season = loadSeason(seasonId)
        if (canViewAuditTroupe(season.troupe.id, principal)) {
            return true
        }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        return organizerAccess.isSeasonOrganizer(seasonId, principal)
    }

    fun canViewAuditEvent(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        if (canViewAuditSeason(seasonId, principal)) {
            return true
        }
        val season = loadSeason(seasonId)
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        return organizerAccess.isEventOrganizer(eventId, principal)
    }

    fun authorizeRead(
        principal: SessionUserPrincipal,
        troupeId: UUID?,
        seasonId: UUID?,
        eventId: UUID?,
    ): AuditReadAuthorization {
        if (troupeId == null && seasonId == null && eventId == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Scope requis")
        }
        val resolvedTroupeId =
            troupeId
                ?: seasonId?.let { loadSeason(it).troupe.id }
                ?: eventId?.let { loadEvent(it).season.troupe.id }
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Scope invalide")
        val resolvedSeasonId =
            seasonId
                ?: eventId?.let { loadEvent(it).season.id }
        val resolvedEventId = eventId

        if (resolvedSeasonId != null) {
            validateScopeConsistency(resolvedTroupeId, resolvedSeasonId, resolvedEventId)
        }

        if (canViewAuditTroupe(resolvedTroupeId, principal)) {
            troupeAccess.requireActiveMember(principal, resolvedTroupeId)
            return AuditReadAuthorization(
                role = AuditReadRole.PLATFORM_OR_TROUPE_ADMIN,
                troupeId = resolvedTroupeId,
                seasonId = resolvedSeasonId,
                allowedEventIds = resolvedEventId?.let { setOf(it) },
            )
        }

        if (resolvedSeasonId != null && organizerAccess.isSeasonOrganizer(resolvedSeasonId, principal)) {
            troupeAccess.requireActiveMember(principal, resolvedTroupeId)
            return AuditReadAuthorization(
                role = AuditReadRole.SEASON_ORGANIZER,
                troupeId = resolvedTroupeId,
                seasonId = resolvedSeasonId,
                allowedEventIds = resolvedEventId?.let { setOf(it) },
            )
        }

        if (resolvedEventId != null &&
            organizerAccess.isEventOrganizer(resolvedEventId, principal)
        ) {
            troupeAccess.requireActiveMember(principal, resolvedTroupeId)
            return AuditReadAuthorization(
                role = AuditReadRole.EVENT_ORGANIZER,
                troupeId = resolvedTroupeId,
                seasonId = resolvedSeasonId,
                allowedEventIds = setOf(resolvedEventId),
            )
        }

        if (resolvedEventId != null && resolvedSeasonId != null) {
            troupeAccess.requireActiveMember(principal, resolvedTroupeId)
            return AuditReadAuthorization(
                role = AuditReadRole.PARTICIPANT_ONLY,
                troupeId = resolvedTroupeId,
                seasonId = resolvedSeasonId,
                allowedEventIds = setOf(resolvedEventId),
            )
        }

        throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
    }

    fun eventOrganizerEventIds(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Set<UUID> =
        eventOrganizerRepository
            .findByEvent_Season_IdAndUser_Id(seasonId, principal.userId)
            .map { it.event.id }
            .toSet()

    private fun validateScopeConsistency(
        troupeId: UUID,
        seasonId: UUID,
        eventId: UUID?,
    ) {
        val season = loadSeason(seasonId)
        if (season.troupe.id != troupeId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison hors troupe")
        }
        if (eventId != null) {
            val event = loadEvent(eventId)
            if (event.season.id != seasonId) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Spectacle hors saison")
            }
        }
    }

    private fun loadSeason(seasonId: UUID) =
        seasonRepository
            .findById(seasonId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }

    private fun loadEvent(eventId: UUID) =
        eventRepository
            .findById(eventId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
}

package com.hatcast.api.organizer

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.organizer.dto.OrganizerAssignmentRequest
import com.hatcast.api.organizer.dto.OrganizerResponseDto
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

interface OrganizerAccessRules {
    fun canManageSeasonOrganizers(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun canManageEventOrganizers(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun isSeasonOrganizer(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun isEventOrganizer(
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun canManageComposition(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun canEditEvent(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun canEditEvents(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean

    fun canCasterEditManually(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean
}

@Service
class OrganizerAccessService(
    private val seasonOrganizerRepository: SeasonOrganizerRepository,
    private val eventOrganizerRepository: EventOrganizerRepository,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val troupeAccess: TroupeAccessService,
) : OrganizerAccessRules {
    companion object {
        fun forTests(
            seedTroupeId: UUID,
            seasonOrganizers: Map<UUID, Set<UUID>>,
            eventOrganizers: Map<UUID, Set<UUID>>,
            troupeAdminSeasonIds: Set<UUID> = emptySet(),
        ): OrganizerAccessRules =
            InMemoryOrganizerAccessRules(
                seedTroupeId = seedTroupeId,
                seasonOrganizers = seasonOrganizers,
                eventOrganizers = eventOrganizers,
                troupeAdminSeasonIds = troupeAdminSeasonIds,
            )
    }

    @Transactional(readOnly = true)
    fun listSeasonOrganizers(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): List<OrganizerResponseDto> {
        val season = loadSeason(seasonId)
        requireCanManageSeasonOrganizers(season, principal)
        return seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId).map(OrganizerResponseDto::from)
    }

    @Transactional
    fun grantSeasonOrganizer(
        seasonId: UUID,
        body: OrganizerAssignmentRequest,
        principal: SessionUserPrincipal,
    ): OrganizerResponseDto {
        val season = loadSeason(seasonId)
        requireCanManageSeasonOrganizers(season, principal)
        val user = resolveUserByEmail(body.email)
        val existing = seasonOrganizerRepository.findBySeason_IdAndUser_Id(seasonId, user.id)
        if (existing != null) {
            return OrganizerResponseDto.from(existing)
        }
        val saved =
            seasonOrganizerRepository.save(
                SeasonOrganizerEntity(
                    season = season,
                    user = user,
                    grantedAt = Instant.now(),
                    grantedBy = currentUserOrNull(principal),
                ),
            )
        return OrganizerResponseDto.from(saved)
    }

    @Transactional
    fun revokeSeasonOrganizer(
        seasonId: UUID,
        organizerUserId: UUID,
        principal: SessionUserPrincipal,
    ) {
        val season = loadSeason(seasonId)
        requireCanManageSeasonOrganizers(season, principal)
        val existing = seasonOrganizerRepository.findBySeason_IdAndUser_Id(seasonId, organizerUserId) ?: return
        seasonOrganizerRepository.delete(existing)
    }

    @Transactional(readOnly = true)
    fun listEventOrganizers(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): List<OrganizerResponseDto> {
        loadEventInSeason(seasonId, eventId, principal)
        requireCanManageEventOrganizers(eventId, seasonId, principal)
        return eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId).map(OrganizerResponseDto::from)
    }

    @Transactional
    fun grantEventOrganizer(
        seasonId: UUID,
        eventId: UUID,
        body: OrganizerAssignmentRequest,
        principal: SessionUserPrincipal,
    ): OrganizerResponseDto {
        val event = loadEventInSeason(seasonId, eventId, principal)
        requireCanManageEventOrganizers(eventId, seasonId, principal)
        val user = resolveUserByEmail(body.email)
        val existing = eventOrganizerRepository.findByEvent_IdAndUser_Id(eventId, user.id)
        if (existing != null) {
            return OrganizerResponseDto.from(existing)
        }
        val saved =
            eventOrganizerRepository.save(
                EventOrganizerEntity(
                    event = event,
                    user = user,
                    grantedAt = Instant.now(),
                    grantedBy = currentUserOrNull(principal),
                ),
            )
        return OrganizerResponseDto.from(saved)
    }

    @Transactional
    fun revokeEventOrganizer(
        seasonId: UUID,
        eventId: UUID,
        organizerUserId: UUID,
        principal: SessionUserPrincipal,
    ) {
        loadEventInSeason(seasonId, eventId, principal)
        requireCanManageEventOrganizers(eventId, seasonId, principal)
        val existing = eventOrganizerRepository.findByEvent_IdAndUser_Id(eventId, organizerUserId) ?: return
        eventOrganizerRepository.delete(existing)
    }

    @Transactional(readOnly = true)
    fun mySeasonPermissions(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): MySeasonPermissionsDto {
        val season = loadSeason(seasonId)
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val troupeAdmin = isTroupeAdminForSeason(season, principal)
        return MySeasonPermissionsDto(
            canManageSeasonOrganizers = troupeAdmin,
            canManageEventOrganizers = troupeAdmin,
            canManageMembers = troupeAdmin,
            canManageSeasons = troupeAdmin,
            canManageEvents = troupeAdmin,
            canManageSeasonParticipants = troupeAdmin,
            canManageEventParticipants = troupeAdmin,
            isTroupeAdmin = troupeAdmin,
            isSeasonOrganizer = isSeasonOrganizer(seasonId, principal),
            eventOrganizerFor =
                eventOrganizerRepository
                    .findByEvent_Season_IdAndUser_Id(seasonId, principal.userId)
                    .map { it.event.id },
            eventParticipantAdminFor =
                if (troupeAdmin) {
                    emptyList()
                } else {
                    eventOrganizerRepository
                        .findByEvent_Season_IdAndUser_Id(seasonId, principal.userId)
                        .map { it.event.id }
                },
        )
    }

    override fun canManageSeasonOrganizers(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal)

    override fun canManageEventOrganizers(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal)

    override fun isSeasonOrganizer(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = seasonOrganizerRepository.existsBySeason_IdAndUser_Id(seasonId, principal.userId)

    override fun isEventOrganizer(
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = eventOrganizerRepository.existsByEvent_IdAndUser_Id(eventId, principal.userId)

    override fun canManageComposition(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean =
        isTroupeAdminForSeason(seasonId, principal) ||
            isEventOrganizer(eventId, principal) ||
            isSeasonOrganizer(seasonId, principal)

    override fun canEditEvent(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal) || isEventOrganizer(eventId, principal)

    override fun canEditEvents(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal)

    override fun canCasterEditManually(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = isTroupeAdminForSeason(seasonId, principal) || isEventOrganizer(eventId, principal)

    private fun requireCanManageSeasonOrganizers(
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ) {
        if (!canManageSeasonOrganizers(season.id, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour gérer les organisateurs de saison.")
        }
    }

    private fun requireCanManageEventOrganizers(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!canManageEventOrganizers(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour gérer les organisateurs du spectacle.")
        }
    }

    private fun isTroupeAdminForSeason(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        val season = loadSeason(seasonId)
        return isTroupeAdminForSeason(season, principal)
    }

    private fun isTroupeAdminForSeason(
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Boolean {
        return troupeAccess.isTroupeAdmin(principal, season.troupe.id)
    }

    private fun loadSeason(seasonId: UUID): SeasonEntity =
        seasonRepository
            .findById(seasonId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }

    private fun loadEventInSeason(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventEntity {
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        troupeAccess.requireActiveMember(principal, event.season.troupe.id)
        return event
    }

    private fun resolveUserByEmail(rawEmail: String): UserEntity {
        val email = rawEmail.trim().lowercase()
        if (email.isEmpty() || !email.contains("@")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalide.")
        }
        return userRepository.findFirstByEmailIgnoreCase(email)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable pour cet email.")
    }

    private fun currentUserOrNull(principal: SessionUserPrincipal): UserEntity? =
        userRepository.findById(principal.userId).orElse(null)
}

private class InMemoryOrganizerAccessRules(
    private val seedTroupeId: UUID,
    private val seasonOrganizers: Map<UUID, Set<UUID>>,
    private val eventOrganizers: Map<UUID, Set<UUID>>,
    private val troupeAdminSeasonIds: Set<UUID>,
) : OrganizerAccessRules {
    override fun canManageSeasonOrganizers(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = seasonId in troupeAdminSeasonIds

    override fun canManageEventOrganizers(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = seasonId in troupeAdminSeasonIds

    override fun isSeasonOrganizer(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = seasonOrganizers[seasonId]?.contains(principal.userId) == true

    override fun isEventOrganizer(
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = eventOrganizers[eventId]?.contains(principal.userId) == true

    override fun canManageComposition(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean =
        canManageSeasonOrganizers(seasonId, principal) ||
            isEventOrganizer(eventId, principal) ||
            isSeasonOrganizer(seasonId, principal)

    override fun canEditEvent(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = canManageSeasonOrganizers(seasonId, principal) || isEventOrganizer(eventId, principal)

    override fun canEditEvents(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = canManageSeasonOrganizers(seasonId, principal)

    override fun canCasterEditManually(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean = canManageSeasonOrganizers(seasonId, principal) || isEventOrganizer(eventId, principal)
}

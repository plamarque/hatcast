package com.hatcast.api.organizer

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.organizer.dto.OrganizerAssignmentRequest
import com.hatcast.api.organizer.dto.OrganizerResponseDto
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.context.ApplicationEventPublisher
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

    fun canManageComposition(
        eventId: UUID,
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Boolean = canManageComposition(eventId, season.id, principal)

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
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val auditRecorder: AuditEventRecorder,
    private val eventPublisher: ApplicationEventPublisher,
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
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_ORGANIZER_GRANTED,
                actorUserId = principal.userId,
                subjectUserId = user.id,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                before = AuditSnapshots.organizerGranted(false),
                after = AuditSnapshots.organizerGranted(true),
            ),
        )
        eventPublisher.publishEvent(
            OrganizerScopeGrantedEvent(
                userId = user.id,
                scopeKind = OrganizerScopeKind.SEASON,
                scopeId = seasonId,
                scopeName = season.title,
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
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_ORGANIZER_REVOKED,
                actorUserId = principal.userId,
                subjectUserId = organizerUserId,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                before = AuditSnapshots.organizerGranted(true),
                after = AuditSnapshots.organizerGranted(false),
            ),
        )
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
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_ORGANIZER_GRANTED,
                actorUserId = principal.userId,
                subjectUserId = user.id,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = AuditSnapshots.organizerGranted(false),
                after = AuditSnapshots.organizerGranted(true),
            ),
        )
        eventPublisher.publishEvent(
            OrganizerScopeGrantedEvent(
                userId = user.id,
                scopeKind = OrganizerScopeKind.EVENT,
                scopeId = eventId,
                scopeName = event.title,
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
        if (eventOrganizerRepository.countByEvent_Id(eventId) <= 1) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Impossible de retirer le dernier organisateur du spectacle. Nommez d'abord un remplaçant.",
            )
        }
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_ORGANIZER_REVOKED,
                actorUserId = principal.userId,
                subjectUserId = organizerUserId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = AuditSnapshots.organizerGranted(true),
                after = AuditSnapshots.organizerGranted(false),
            ),
        )
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
        val seasonOrganizer = isSeasonOrganizer(seasonId, principal)
        val eventOrganizerFor =
            eventOrganizerRepository
                .findByEvent_Season_IdAndUser_Id(seasonId, principal.userId)
                .map { it.event.id }
        return MySeasonPermissionsDto(
            canManageSeasonOrganizers = troupeAdmin,
            canManageEventOrganizers = troupeAdmin,
            canManageMembers = troupeAdmin,
            canManageSeasons = troupeAdmin,
            canManageEvents = troupeAdmin,
            canManageSeasonParticipants = troupeAdmin,
            canManageEventParticipants = troupeAdmin,
            isTroupeAdmin = troupeAdmin,
            isSeasonOrganizer = seasonOrganizer,
            eventOrganizerFor = eventOrganizerFor,
            eventParticipantAdminFor =
                if (troupeAdmin) {
                    emptyList()
                } else {
                    eventOrganizerFor
                },
            canViewAuditTroupe = troupeAdmin,
            canViewAuditSeason = troupeAdmin || seasonOrganizer,
            canViewAuditEvent = troupeAdmin || seasonOrganizer || eventOrganizerFor.isNotEmpty(),
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
    ): Boolean {
        val season = loadSeason(seasonId)
        return canManageComposition(eventId, season, principal)
    }

    override fun canManageComposition(
        eventId: UUID,
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Boolean =
        seasonOrganizerRepository.canManageCompositionForUser(
            troupeId = season.troupe.id,
            seasonId = season.id,
            eventId = eventId,
            userId = principal.userId,
        )

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

    @Transactional
    fun seedEventOrganizersFromSeason(
        event: EventEntity,
        grantedByUserId: UUID?,
    ) {
        val grantedBy = grantedByUserId?.let { userRepository.findById(it).orElse(null) }
        val season = event.season
        val seasonId = season.id
        val troupeId = season.troupe.id
        var seasonOrganizers = seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)
        if (seasonOrganizers.isEmpty()) {
            val now = Instant.now()
            seasonOrganizers =
                troupeMembershipRepository.findActiveTroupeAdminsByTroupeId(troupeId).mapNotNull { membership ->
                    val user = membership.user ?: return@mapNotNull null
                    bootstrapSeasonOrganizer(season, user, grantedBy, grantedByUserId, now)
                }
        }
        if (seasonOrganizers.isEmpty()) {
            throw IllegalStateException(
                "Cannot seed event organizers: no season organizers and no active troupe admins for seasonId=$seasonId",
            )
        }
        val now = Instant.now()
        for (seasonOrganizer in seasonOrganizers) {
            if (eventOrganizerRepository.existsByEvent_IdAndUser_Id(event.id, seasonOrganizer.user.id)) {
                continue
            }
            eventOrganizerRepository.save(
                EventOrganizerEntity(
                    event = event,
                    user = seasonOrganizer.user,
                    grantedAt = now,
                    grantedBy = grantedBy,
                ),
            )
        }
        if (eventOrganizerRepository.countByEvent_Id(event.id) < 1) {
            throw IllegalStateException("Cannot seed event organizers: eventId=${event.id} has zero organizers")
        }
    }

    private fun bootstrapSeasonOrganizer(
        season: SeasonEntity,
        user: UserEntity,
        grantedBy: UserEntity?,
        actorUserId: UUID?,
        grantedAt: Instant,
    ): SeasonOrganizerEntity {
        val existing = seasonOrganizerRepository.findBySeason_IdAndUser_Id(season.id, user.id)
        if (existing != null) {
            return existing
        }
        val saved =
            seasonOrganizerRepository.save(
                SeasonOrganizerEntity(
                    season = season,
                    user = user,
                    grantedAt = grantedAt,
                    grantedBy = grantedBy,
                ),
            )
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_ORGANIZER_GRANTED,
                actorUserId = actorUserId,
                subjectUserId = user.id,
                troupeId = season.troupe.id,
                seasonId = season.id,
                before = AuditSnapshots.organizerGranted(false),
                after = AuditSnapshots.organizerGranted(true),
            ),
        )
        return saved
    }

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

    override fun canManageComposition(
        eventId: UUID,
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Boolean = canManageComposition(eventId, season.id, principal)

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

package com.hatcast.api.share

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.CompositionNotificationPort
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.share.dto.ShareNotifyRequestDto
import com.hatcast.api.share.dto.ShareNotifyResponseDto
import com.hatcast.api.share.dto.ShareRecipientChannelsDto
import com.hatcast.api.share.dto.ShareRecipientDto
import com.hatcast.api.share.dto.ShareRecipientsResponseDto
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

enum class ShareRecipientIntent {
    DRAW,
    COMPOSITION,
    EVENT,
    ;

    companion object {
        fun parse(raw: String): ShareRecipientIntent? =
            when (raw.lowercase()) {
                "draw" -> DRAW
                "composition" -> COMPOSITION
                "event" -> EVENT
                else -> null
            }
    }
}

@Service
class ShareRecipientsService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val notificationPort: CompositionNotificationPort,
) {
    @Transactional(readOnly = true)
    fun getRecipients(
        seasonId: UUID,
        eventId: UUID,
        intentRaw: String,
        principal: SessionUserPrincipal,
    ): ShareRecipientsResponseDto {
        val intent = parseIntent(intentRaw)
        requireCanManage(seasonId, eventId, principal)
        loadAuthorizedEvent(seasonId, eventId, principal)
        validateIntentLifecycle(eventId, intent)
        val participantIds = resolveParticipantIds(seasonId, eventId, intent)
        validateAssigneePreconditions(intent, participantIds)
        return buildResponse(eventId, participantIds)
    }

    @Transactional
    fun notifyRecipients(
        seasonId: UUID,
        eventId: UUID,
        body: ShareNotifyRequestDto,
        principal: SessionUserPrincipal,
    ): ShareNotifyResponseDto {
        val intent = parseIntent(body.intent)
        requireCanManage(seasonId, eventId, principal)
        loadAuthorizedEvent(seasonId, eventId, principal)
        validateIntentLifecycle(eventId, intent)
        val participantIds = resolveParticipantIds(seasonId, eventId, intent)
        validateAssigneePreconditions(intent, participantIds)
        val preview = body.messageText.trim().take(500)
        if (preview.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Message vide")
        }
        notificationPort.requestManualAnnouncement(
            eventId = eventId,
            seasonId = seasonId,
            intent = intent.name.lowercase(),
            messagePreview = preview,
            actorUserId = principal.userId,
        )
        return ShareNotifyResponseDto()
    }

    private fun parseIntent(raw: String): ShareRecipientIntent =
        ShareRecipientIntent.parse(raw)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent inconnu")

    private fun requireCanManage(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
    }

    private fun validateIntentLifecycle(
        eventId: UUID,
        intent: ShareRecipientIntent,
    ) {
        when (intent) {
            ShareRecipientIntent.EVENT -> return
            ShareRecipientIntent.DRAW -> {
                val validatedAt = compositionRepository.findById(eventId).map { it.validatedAt }.orElse(null)
                if (validatedAt != null) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Le tirage n'est disponible qu'avant validation",
                    )
                }
            }
            ShareRecipientIntent.COMPOSITION -> {
                val validatedAt = compositionRepository.findById(eventId).map { it.validatedAt }.orElse(null)
                if (validatedAt == null) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La composition n'est pas validée",
                    )
                }
            }
        }
    }

    private fun validateAssigneePreconditions(
        intent: ShareRecipientIntent,
        participantIds: Set<UUID>,
    ) {
        if (intent == ShareRecipientIntent.EVENT) {
            return
        }
        if (participantIds.isEmpty()) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Aucun assigné pour cet intent",
            )
        }
    }

    private fun resolveParticipantIds(
        seasonId: UUID,
        eventId: UUID,
        intent: ShareRecipientIntent,
    ): Set<UUID> =
        when (intent) {
            ShareRecipientIntent.EVENT -> resolveSeasonParticipantIds(seasonId)
            ShareRecipientIntent.DRAW,
            ShareRecipientIntent.COMPOSITION,
            -> resolveAssigneeParticipantIds(eventId)
        }

    private fun resolveAssigneeParticipantIds(eventId: UUID): Set<UUID> =
        slotRepository
            .findByEventId(eventId)
            .filter { it.hasAssignee() }
            .mapNotNull { it.assignedParticipantId() }
            .toSet()

    private fun resolveSeasonParticipantIds(seasonId: UUID): Set<UUID> {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        seasonParticipantService.ensureMembershipParticipants(season)
        return seasonParticipantRepository
            .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
            .filter { row ->
                row.troupeMembership == null ||
                    row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
            }.map { it.id }
            .toSet()
    }

    private fun buildResponse(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): ShareRecipientsResponseDto {
        if (participantIds.isEmpty()) {
            return ShareRecipientsResponseDto(
                total = 0,
                notifiableCount = 0,
                manualCount = 0,
                recipients = emptyList(),
            )
        }
        val rows = loadParticipantRows(eventId, participantIds)
        val recipients =
            rows
                .sortedByFrenchDisplayName { it.displayName }
                .map { row ->
                    val hasEmail = !row.email.isNullOrBlank()
                    ShareRecipientDto(
                        participantId = row.participantId,
                        displayName = row.displayName,
                        emailObfuscated = EmailObfuscation.obfuscate(row.email),
                        channels =
                            ShareRecipientChannelsDto(
                                email = hasEmail,
                                push = false,
                            ),
                    )
                }
        val notifiableCount = recipients.count { it.channels.email }
        val manualCount = recipients.size - notifiableCount
        return ShareRecipientsResponseDto(
            total = recipients.size,
            notifiableCount = notifiableCount,
            manualCount = manualCount,
            recipients = recipients,
        )
    }

    private data class ParticipantRow(
        val participantId: UUID,
        val displayName: String,
        val email: String?,
    )

    private fun loadParticipantRows(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): List<ParticipantRow> {
        val seasonRows =
            seasonParticipantRepository
                .findAllById(participantIds)
                .map {
                    ParticipantRow(
                        participantId = it.id,
                        displayName = it.displayName,
                        email = it.normalizedEmail,
                    )
                }
        val foundIds = seasonRows.map { it.participantId }.toSet()
        val eventRows =
            eventParticipantRepository
                .findAllById(participantIds - foundIds)
                .filter { it.event.id == eventId }
                .map {
                    ParticipantRow(
                        participantId = it.id,
                        displayName = it.displayName,
                        email = it.normalizedEmail,
                    )
                }
        return seasonRows + eventRows
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
    }
}

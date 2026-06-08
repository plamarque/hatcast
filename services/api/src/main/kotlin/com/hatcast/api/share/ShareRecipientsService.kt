package com.hatcast.api.share

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.CompositionNotificationPort
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.isAvailabilityOpen
import com.hatcast.api.notification.ManualAvailabilityNudgeProperties
import com.hatcast.api.notification.NotificationCategory
import com.hatcast.api.notification.NotificationChannel
import com.hatcast.api.notification.NotificationDeliveryLogRepository
import com.hatcast.api.notification.NotificationDeliveryStatus
import com.hatcast.api.notification.NotificationIntent
import com.hatcast.api.notification.NotificationRecipientResolver
import com.hatcast.api.notification.PushNotificationEligibilityPort
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.share.dto.ShareNotifyRequestDto
import com.hatcast.api.share.dto.ShareNotifyResponseDto
import com.hatcast.api.share.dto.ShareRecipientChannelStatusDto
import com.hatcast.api.share.dto.ShareRecipientChannelsDto
import com.hatcast.api.share.dto.ShareRecipientDto
import com.hatcast.api.share.dto.ShareRecipientsResponseDto
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

enum class ShareRecipientIntent {
    DRAW,
    COMPOSITION,
    EVENT,
    AVAILABILITY_NUDGE,
    ;

    companion object {
        fun parse(raw: String): ShareRecipientIntent? =
            when (raw.lowercase()) {
                "draw" -> DRAW
                "composition" -> COMPOSITION
                "event" -> EVENT
                "availability_nudge" -> AVAILABILITY_NUDGE
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
    private val recipientResolver: NotificationRecipientResolver,
    private val manualShareNotifyRepository: EventManualShareNotifyRepository,
    private val pushEligibilityPort: PushNotificationEligibilityPort,
    private val manualNudgeProperties: ManualAvailabilityNudgeProperties,
    private val deliveryLogRepository: NotificationDeliveryLogRepository,
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
        return buildResponse(eventId, participantIds, intent)
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
        val previewResponse = buildResponse(eventId, participantIds, intent)
        notificationPort.requestManualAnnouncement(
            eventId = eventId,
            seasonId = seasonId,
            intent = intentApiValue(intent),
            messagePreview = preview,
            actorUserId = principal.userId,
        )
        recordManualNotify(eventId, intent, principal.userId)
        val notifiedCount =
            when (intent) {
                ShareRecipientIntent.AVAILABILITY_NUDGE,
                ShareRecipientIntent.EVENT,
                -> previewResponse.notifiableCount
                ShareRecipientIntent.DRAW,
                ShareRecipientIntent.COMPOSITION,
                -> 0
            }
        return ShareNotifyResponseDto(
            accepted = true,
            notifiedCount = notifiedCount,
            manualCount = previewResponse.manualCount,
            intent = intentApiValue(intent),
        )
    }

    private fun parseIntent(raw: String): ShareRecipientIntent =
        ShareRecipientIntent.parse(raw)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent inconnu")

    private fun intentApiValue(intent: ShareRecipientIntent): String =
        when (intent) {
            ShareRecipientIntent.DRAW -> "draw"
            ShareRecipientIntent.COMPOSITION -> "composition"
            ShareRecipientIntent.EVENT -> "event"
            ShareRecipientIntent.AVAILABILITY_NUDGE -> "availability_nudge"
        }

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
            ShareRecipientIntent.AVAILABILITY_NUDGE -> {
                val event =
                    eventRepository
                        .findById(eventId)
                        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
                if (!event.isAvailabilityOpen()) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Les disponibilités ne sont pas ouvertes",
                    )
                }
                if (event.archived) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Événement archivé",
                    )
                }
            }
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
            val message =
                when (intent) {
                    ShareRecipientIntent.AVAILABILITY_NUDGE -> "Aucun participant sans réponse"
                    else -> "Aucun assigné pour cet intent"
                }
            throw ResponseStatusException(HttpStatus.CONFLICT, message)
        }
    }

    private fun resolveParticipantIds(
        seasonId: UUID,
        eventId: UUID,
        intent: ShareRecipientIntent,
    ): Set<UUID> =
        when (intent) {
            ShareRecipientIntent.EVENT -> resolveSeasonParticipantIds(seasonId)
            ShareRecipientIntent.AVAILABILITY_NUDGE ->
                recipientResolver.resolveUnknownAvailabilityParticipantIds(seasonId, eventId)
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
        intent: ShareRecipientIntent,
    ): ShareRecipientsResponseDto {
        val guardDays = manualNudgeProperties.manualAvailabilityNudgeGuardDays
        val lastManualNotifyAt =
            manualShareNotifyRepository
                .findById(EventManualShareNotifyId(eventId, intentApiValue(intent)))
                .orElse(null)
                ?.lastSentAt
        if (participantIds.isEmpty()) {
            return ShareRecipientsResponseDto(
                total = 0,
                notifiableCount = 0,
                manualCount = 0,
                recipients = emptyList(),
                lastManualNotifyAt = lastManualNotifyAt,
                guardDays = guardDays,
            )
        }
        val rows = loadParticipantRows(eventId, participantIds)
        val availabilityPushIntent =
            intent == ShareRecipientIntent.EVENT || intent == ShareRecipientIntent.AVAILABILITY_NUDGE
        val pushCategory = NotificationCategory.AVAILABILITY_REQUEST
        val logIntents = resolveDeliveryLogIntents(intent)
        val channelDelivery = loadChannelDeliveryState(eventId, rows, logIntents)
        val recipients =
            rows
                .sortedByFrenchDisplayName { it.displayName }
                .map { row ->
                    val hasEmail = !row.email.isNullOrBlank()
                    val hasPush =
                        availabilityPushIntent &&
                            row.userId != null &&
                            pushEligibilityPort.isPushAllowedForCategory(row.userId, pushCategory)
                    ShareRecipientDto(
                        participantId = row.participantId,
                        displayName = row.displayName,
                        emailObfuscated = EmailObfuscation.obfuscate(row.email),
                        channels =
                            ShareRecipientChannelsDto(
                                email =
                                    channelStatusFor(
                                        row.userId,
                                        NotificationChannel.EMAIL,
                                        hasEmail,
                                        channelDelivery,
                                    ),
                                push =
                                    channelStatusFor(
                                        row.userId,
                                        NotificationChannel.PUSH,
                                        hasPush,
                                        channelDelivery,
                                    ),
                            ),
                    )
                }
        val notifiableCount =
            recipients.count { recipient ->
                recipient.channels.email.eligible || recipient.channels.push.eligible
            }
        val manualCount = recipients.size - notifiableCount
        return ShareRecipientsResponseDto(
            total = recipients.size,
            notifiableCount = notifiableCount,
            manualCount = manualCount,
            recipients = recipients,
            lastManualNotifyAt = lastManualNotifyAt,
            guardDays = guardDays,
        )
    }

    private fun resolveDeliveryLogIntents(intent: ShareRecipientIntent): Set<NotificationIntent> =
        when (intent) {
            ShareRecipientIntent.AVAILABILITY_NUDGE ->
                setOf(
                    NotificationIntent.AVAILABILITY_OPENED,
                    NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                    NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE,
                )
            ShareRecipientIntent.EVENT ->
                setOf(
                    NotificationIntent.AVAILABILITY_OPENED,
                    NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE,
                )
            ShareRecipientIntent.DRAW,
            ShareRecipientIntent.COMPOSITION,
            -> emptySet()
        }

    private data class NotifiedChannelKey(
        val userId: UUID,
        val channel: NotificationChannel,
    )

    private data class ChannelDeliveryState(
        val notified: Boolean,
        val lastNotifiedAt: Instant?,
    )

    private fun loadChannelDeliveryState(
        eventId: UUID,
        rows: List<ParticipantRow>,
        logIntents: Set<NotificationIntent>,
    ): Map<NotifiedChannelKey, ChannelDeliveryState> {
        if (logIntents.isEmpty()) {
            return emptyMap()
        }
        val userIds = rows.mapNotNull { it.userId }.toSet()
        if (userIds.isEmpty()) {
            return emptyMap()
        }
        val statuses =
            setOf(
                NotificationDeliveryStatus.SENT,
                NotificationDeliveryStatus.PARTIAL,
            )
        val latestByKey = mutableMapOf<NotifiedChannelKey, Instant>()
        deliveryLogRepository
            .findByEventIdAndUserIdInAndIntentInAndStatusIn(
                eventId = eventId,
                userIds = userIds,
                intents = logIntents,
                statuses = statuses,
            ).forEach { log ->
                val userId = log.userId ?: return@forEach
                val key = NotifiedChannelKey(userId, log.channel)
                val createdAt = log.createdAt
                val previous = latestByKey[key]
                if (previous == null || createdAt.isAfter(previous)) {
                    latestByKey[key] = createdAt
                }
            }
        return latestByKey.mapValues { (_, at) ->
            ChannelDeliveryState(notified = true, lastNotifiedAt = at)
        }
    }

    private fun channelStatusFor(
        userId: UUID?,
        channel: NotificationChannel,
        eligible: Boolean,
        channelDelivery: Map<NotifiedChannelKey, ChannelDeliveryState>,
    ): ShareRecipientChannelStatusDto {
        if (userId == null) {
            return ShareRecipientChannelStatusDto(
                eligible = eligible,
                notified = false,
                lastNotifiedAt = null,
            )
        }
        val state = channelDelivery[NotifiedChannelKey(userId, channel)]
        return ShareRecipientChannelStatusDto(
            eligible = eligible,
            notified = state?.notified == true,
            lastNotifiedAt = state?.lastNotifiedAt,
        )
    }

    private fun recordManualNotify(
        eventId: UUID,
        intent: ShareRecipientIntent,
        actorUserId: UUID,
    ) {
        val now = Instant.now()
        val intentValue = intentApiValue(intent)
        val key = EventManualShareNotifyId(eventId, intentValue)
        val existing = manualShareNotifyRepository.findById(key).orElse(null)
        if (existing != null) {
            existing.lastSentAt = now
            existing.lastActorUserId = actorUserId
            manualShareNotifyRepository.save(existing)
        } else {
            manualShareNotifyRepository.save(
                EventManualShareNotifyEntity(
                    id = key,
                    lastSentAt = now,
                    lastActorUserId = actorUserId,
                ),
            )
        }
    }

    private data class ParticipantRow(
        val participantId: UUID,
        val displayName: String,
        val email: String?,
        val userId: UUID?,
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
                        userId = it.user?.id,
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
                        userId = it.user?.id,
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

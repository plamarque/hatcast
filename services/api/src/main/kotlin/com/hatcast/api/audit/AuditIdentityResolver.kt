package com.hatcast.api.audit

import com.hatcast.api.audit.dto.AuditIdentityDto
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import com.hatcast.api.avatar.AvatarService
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuditIdentityResolver(
    private val userRepository: UserRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    fun resolveIdentities(entities: List<AuditEventEntity>): AuditIdentityContext {
        val userIds = mutableSetOf<UUID>()
        val seasonParticipantIds = mutableSetOf<UUID>()
        val eventParticipantIds = mutableSetOf<UUID>()
        entities.forEach { entity ->
            entity.actorUserId?.let { userIds.add(it) }
            entity.subjectUserId?.let { userIds.add(it) }
            entity.subjectSeasonParticipantId?.let { seasonParticipantIds.add(it) }
            entity.subjectEventParticipantId?.let { eventParticipantIds.add(it) }
            collectDrawParticipantIds(entity, seasonParticipantIds)
        }
        val users =
            if (userIds.isEmpty()) {
                emptyMap()
            } else {
                userRepository.findAllById(userIds).associateBy { it.id }
            }
        val seasonParticipants =
            if (seasonParticipantIds.isEmpty()) {
                emptyMap()
            } else {
                seasonParticipantRepository.findAllById(seasonParticipantIds).associateBy { it.id }
            }
        val eventParticipants =
            if (eventParticipantIds.isEmpty()) {
                emptyMap()
            } else {
                eventParticipantRepository.findAllById(eventParticipantIds).associateBy { it.id }
            }
        return AuditIdentityContext(users, seasonParticipants, eventParticipants)
    }

    fun actorDto(
        entity: AuditEventEntity,
        context: AuditIdentityContext,
    ): AuditIdentityDto? {
        if (entity.actorUserId == null) {
            return null
        }
        val user = context.users[entity.actorUserId]
        val metadataActorName = metadataActorDisplayName(entity)
        val displayName =
            user?.displayName?.takeIf { it.isNotBlank() }
                ?: metadataActorName
                ?: obfuscatedEmail(user?.email)
                ?: "Utilisateur anonymisé"
        return AuditIdentityDto(
            userId = entity.actorUserId,
            displayName = displayName,
            email = obfuscatedEmail(user?.email),
            avatarUrl = avatarForUser(user),
            gender = genderForUser(user),
        )
    }

    fun subjectDto(
        entity: AuditEventEntity,
        context: AuditIdentityContext,
    ): AuditIdentityDto? {
        val metadataName = entity.metadataJson?.get("displayName") as? String
        entity.subjectSeasonParticipantId?.let { id ->
            val participant = context.seasonParticipants[id]
            return AuditIdentityDto(
                seasonParticipantId = id,
                userId = participant?.user?.id,
                displayName =
                    participant?.displayName?.takeIf { it.isNotBlank() }
                        ?: metadataName
                        ?: "Sujet supprimé",
                email = obfuscatedEmail(participant?.normalizedEmail),
                avatarUrl = avatarForUser(participant?.user),
                gender = genderForUser(participant?.user),
            )
        }
        entity.subjectEventParticipantId?.let { id ->
            val participant = context.eventParticipants[id]
            return AuditIdentityDto(
                eventParticipantId = id,
                userId = participant?.user?.id,
                displayName =
                    participant?.displayName?.takeIf { it.isNotBlank() }
                        ?: metadataName
                        ?: "Sujet supprimé",
                email = obfuscatedEmail(participant?.normalizedEmail),
                avatarUrl = avatarForUser(participant?.user),
                gender = genderForUser(participant?.user),
            )
        }
        entity.subjectUserId?.let { id ->
            val user = context.users[id]
            return AuditIdentityDto(
                userId = id,
                displayName =
                    user?.displayName?.takeIf { it.isNotBlank() }
                        ?: metadataName
                        ?: obfuscatedEmail(user?.email)
                        ?: "Utilisateur anonymisé",
                email = obfuscatedEmail(user?.email),
                avatarUrl = avatarForUser(user),
                gender = genderForUser(user),
            )
        }
        return metadataName?.let {
            AuditIdentityDto(displayName = it)
        }
    }

    fun drawParticipantLabels(
        entity: AuditEventEntity,
        context: AuditIdentityContext,
    ): Map<String, String>? {
        if (entity.actionType != AuditActionType.COMPOSITION_DRAW_COMPLETED) {
            return null
        }
        val ids = linkedSetOf<UUID>()
        collectDrawParticipantIds(entity, ids)
        if (ids.isEmpty()) {
            return null
        }
        return ids.associate { id ->
            val label =
                context.seasonParticipants[id]?.displayName?.takeIf { it.isNotBlank() }
                    ?: "Sujet supprimé"
            id.toString() to label
        }
    }
}

private fun metadataActorDisplayName(entity: AuditEventEntity): String? {
    val metadata = entity.metadataJson ?: return null
    return (metadata["actorDisplayName"] as? String)?.takeIf { it.isNotBlank() }
        ?: (metadata["displayName"] as? String)?.takeIf { it.isNotBlank() }
}

private fun obfuscatedEmail(email: String?): String? = AuditEmailObfuscator.obfuscate(email)

private fun collectDrawParticipantIds(
    entity: AuditEventEntity,
    seasonParticipantIds: MutableSet<UUID>,
) {
    if (entity.actionType != AuditActionType.COMPOSITION_DRAW_COMPLETED) {
        return
    }
    fun collectFromMap(map: Map<String, Any?>?) {
        val raw = map?.get("assignmentsByRole") ?: return
        if (raw !is Map<*, *>) return
        raw.values.forEach { slots ->
            if (slots !is List<*>) return@forEach
            slots.forEach { slot ->
                if (slot !is Map<*, *>) return@forEach
                val participantId = slot["participantId"]?.toString() ?: return@forEach
                runCatching { UUID.fromString(participantId) }.getOrNull()?.let(seasonParticipantIds::add)
            }
        }
    }
    collectFromMap(entity.beforeJson)
    collectFromMap(entity.afterJson)
}

private fun avatarForUser(user: UserEntity?): String? =
    user?.let { AvatarService.publicAvatarUrl(it.id, it.avatarUpdatedAt) }

private fun genderForUser(user: UserEntity?): String =
    MemberGender.effective(user?.gender).wireValue

data class AuditIdentityContext(
    val users: Map<UUID, com.hatcast.api.user.UserEntity>,
    val seasonParticipants: Map<UUID, com.hatcast.api.participant.SeasonParticipantEntity>,
    val eventParticipants: Map<UUID, com.hatcast.api.participant.EventParticipantEntity>,
)

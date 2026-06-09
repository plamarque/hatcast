package com.hatcast.api.user

import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ParticipantAvatarResolver(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val userRepository: UserRepository,
) {
    fun resolveByParticipantIds(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): Map<UUID, String?> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        val userIdByParticipantId = linkedMapOf<UUID, UUID>()
        val seasonRows = seasonParticipantRepository.findAllById(participantIds)
        for (row in seasonRows) {
            row.user?.id?.let { userIdByParticipantId[row.id] = it }
        }
        val unresolved = participantIds - userIdByParticipantId.keys
        if (unresolved.isNotEmpty()) {
            eventParticipantRepository
                .findAllById(unresolved)
                .filter { it.event.id == eventId }
                .forEach { row ->
                    row.user?.id?.let { userIdByParticipantId[row.id] = it }
                }
        }
        val userIds = userIdByParticipantId.values.toSet()
        val userById =
            if (userIds.isEmpty()) {
                emptyMap()
            } else {
                userRepository.findAllById(userIds).associateBy { it.id }
            }
        return participantIds.associateWith { participantId ->
            val userId = userIdByParticipantId[participantId] ?: return@associateWith null
            val user = userById[userId] ?: return@associateWith null
            ParticipantRowPresentation.publicAvatarUrlIfStored(user)
        }
    }
}

package com.hatcast.api.user

import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ParticipantGenderResolver(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    fun resolveByParticipantIds(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): Map<UUID, String> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        val genderByParticipantId = linkedMapOf<UUID, String>()
        val seasonRows = seasonParticipantRepository.findAllById(participantIds)
        for (row in seasonRows) {
            genderByParticipantId[row.id] = ParticipantRowPresentation.effectiveGenderWire(row)
        }
        val unresolved = participantIds - genderByParticipantId.keys
        if (unresolved.isNotEmpty()) {
            eventParticipantRepository
                .findAllById(unresolved)
                .filter { it.event.id == eventId }
                .forEach { row ->
                    genderByParticipantId[row.id] = ParticipantRowPresentation.effectiveGenderWire(row)
                }
        }
        return participantIds.associateWith { participantId ->
            genderByParticipantId[participantId] ?: MemberGender.NON_SPECIFIED.wireValue
        }
    }

    fun effectiveGenderWire(seasonParticipant: SeasonParticipantEntity): String =
        ParticipantRowPresentation.effectiveGenderWire(seasonParticipant)

    fun effectiveGenderWire(eventParticipant: EventParticipantEntity): String =
        ParticipantRowPresentation.effectiveGenderWire(eventParticipant)
}

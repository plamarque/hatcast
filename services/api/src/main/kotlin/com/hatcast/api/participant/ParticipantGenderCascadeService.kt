package com.hatcast.api.participant

import com.hatcast.api.user.MemberGender
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class ParticipantGenderCascadeService(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    @Transactional
    fun syncLinkedParticipantGender(
        userId: UUID,
        accountGender: MemberGender,
    ) {
        val now = Instant.now()
        val storedGender =
            when (accountGender) {
                MemberGender.MALE, MemberGender.FEMALE -> accountGender
                MemberGender.NON_SPECIFIED -> null
            }
        val seasonToSave =
            seasonParticipantRepository.findAllByUser_Id(userId).mapNotNull { row ->
                if (row.gender == storedGender) {
                    null
                } else {
                    row.gender = storedGender
                    row.updatedAt = now
                    row
                }
            }
        val eventToSave =
            eventParticipantRepository.findAllByUser_Id(userId).mapNotNull { row ->
                if (row.gender == storedGender) {
                    null
                } else {
                    row.gender = storedGender
                    row.updatedAt = now
                    row
                }
            }
        if (seasonToSave.isNotEmpty()) {
            seasonParticipantRepository.saveAll(seasonToSave)
        }
        if (eventToSave.isNotEmpty()) {
            eventParticipantRepository.saveAll(eventToSave)
        }
    }
}

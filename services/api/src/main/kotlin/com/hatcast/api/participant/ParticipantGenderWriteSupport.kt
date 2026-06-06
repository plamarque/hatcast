package com.hatcast.api.participant

import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

object ParticipantGenderWriteSupport {
    fun applyGenderFromRequest(
        entity: SeasonParticipantEntity,
        linkedUser: UserEntity?,
        genderRaw: String?,
    ) {
        if (genderRaw == null) {
            return
        }
        applyGender(entity, linkedUser, parseGender(genderRaw))
    }

    fun applyGenderFromRequest(
        entity: EventParticipantEntity,
        linkedUser: UserEntity?,
        genderRaw: String?,
    ) {
        if (genderRaw == null) {
            return
        }
        applyGender(entity, linkedUser, parseGender(genderRaw))
    }

    private fun parseGender(raw: String): MemberGender =
        MemberGender.fromWireOrNull(raw)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Genre invalide.")

    private fun applyGender(
        entity: SeasonParticipantEntity,
        linkedUser: UserEntity?,
        parsed: MemberGender,
    ) {
        if (!ParticipantRowPresentation.canOrganizerSetGender(linkedUser)) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le genre est géré par le compte membre.",
            )
        }
        entity.gender =
            when (parsed) {
                MemberGender.MALE, MemberGender.FEMALE -> parsed
                MemberGender.NON_SPECIFIED -> null
            }
    }

    private fun applyGender(
        entity: EventParticipantEntity,
        linkedUser: UserEntity?,
        parsed: MemberGender,
    ) {
        if (!ParticipantRowPresentation.canOrganizerSetGender(linkedUser)) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le genre est géré par le compte membre.",
            )
        }
        entity.gender =
            when (parsed) {
                MemberGender.MALE, MemberGender.FEMALE -> parsed
                MemberGender.NON_SPECIFIED -> null
            }
    }
}

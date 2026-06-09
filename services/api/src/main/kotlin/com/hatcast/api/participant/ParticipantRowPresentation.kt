package com.hatcast.api.participant

import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity

object ParticipantRowPresentation {
    fun linkedUser(entity: SeasonParticipantEntity): UserEntity? =
        entity.user ?: entity.troupeMembership?.user

    fun linkedUser(entity: EventParticipantEntity): UserEntity? =
        entity.user
            ?: entity.seasonParticipant?.user
            ?: entity.seasonParticipant?.troupeMembership?.user

    fun canOrganizerSetGender(linkedUser: UserEntity?): Boolean {
        val accountGender = linkedUser?.gender
        return accountGender != MemberGender.MALE && accountGender != MemberGender.FEMALE
    }

    fun effectiveGender(participant: SeasonParticipantEntity): MemberGender {
        val linked = linkedUser(participant)
        val accountGender = linked?.gender
        if (accountGender == MemberGender.MALE || accountGender == MemberGender.FEMALE) {
            return accountGender
        }
        val rowGender = participant.gender
        if (rowGender == MemberGender.MALE || rowGender == MemberGender.FEMALE) {
            return rowGender
        }
        return MemberGender.NON_SPECIFIED
    }

    fun effectiveGender(participant: EventParticipantEntity): MemberGender {
        val linked = linkedUser(participant)
        val accountGender = linked?.gender
        if (accountGender == MemberGender.MALE || accountGender == MemberGender.FEMALE) {
            return accountGender
        }
        val rowGender = participant.gender
        if (rowGender == MemberGender.MALE || rowGender == MemberGender.FEMALE) {
            return rowGender
        }
        return MemberGender.NON_SPECIFIED
    }

    fun effectiveGenderWire(participant: SeasonParticipantEntity): String =
        effectiveGender(participant).wireValue

    fun effectiveGenderWire(participant: EventParticipantEntity): String =
        effectiveGender(participant).wireValue

    /** Stored organizer value for edit form seeding; null when unset on row. */
    fun storedParticipantGenderWire(participant: SeasonParticipantEntity): String? =
        participant.gender?.wireValue

    fun storedParticipantGenderWire(participant: EventParticipantEntity): String? =
        participant.gender?.wireValue

    fun genderManagedOnAccount(participant: SeasonParticipantEntity): Boolean =
        !canOrganizerSetGender(linkedUser(participant))

    fun genderManagedOnAccount(participant: EventParticipantEntity): Boolean =
        !canOrganizerSetGender(linkedUser(participant))

    @Deprecated("Use effectiveGenderWire(row)", ReplaceWith("effectiveGenderWire(participant)"))
    fun genderWire(user: UserEntity?): String = MemberGender.effective(user?.gender).wireValue

    fun avatarUrl(
        avatarService: AvatarService,
        user: UserEntity?,
    ): String? = publicAvatarUrlIfStored(user)

    /** Hot-path safe: no storage read; omits URL when metadata exists without a stored object key. */
    fun publicAvatarUrlIfStored(user: UserEntity?): String? {
        if (user == null || user.avatarUpdatedAt == null || user.avatarUrl.isNullOrBlank()) {
            return null
        }
        return AvatarService.publicAvatarUrl(user.id, user.avatarUpdatedAt)
    }
}

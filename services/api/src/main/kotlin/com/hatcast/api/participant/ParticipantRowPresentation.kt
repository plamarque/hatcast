package com.hatcast.api.participant

import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity

object ParticipantRowPresentation {
    fun linkedUser(entity: SeasonParticipantEntity): UserEntity? =
        entity.user ?: entity.troupeMembership?.user

    fun linkedUser(entity: EventParticipantEntity): UserEntity? = entity.user

    fun genderWire(user: UserEntity?): String = MemberGender.effective(user?.gender).wireValue

    fun avatarUrl(
        avatarService: AvatarService,
        user: UserEntity?,
    ): String? {
        if (user == null || user.avatarUpdatedAt == null) {
            return null
        }
        if (avatarService.readAvatarContent(user) == null) {
            return null
        }
        return AvatarService.publicAvatarUrl(user.id, user.avatarUpdatedAt)
    }
}

package com.hatcast.api.user

import com.hatcast.api.troupe.MemberDisplayNameResolver
import com.hatcast.api.troupe.PreferredRoleKeys
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.dto.PatchUserMemberPreferencesRequest
import com.hatcast.api.user.dto.UserMemberPreferencesResponseDto
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class UserMemberPreferencesService(
    private val userRepository: UserRepository,
    private val membershipRepository: TroupeMembershipRepository,
) {
    @Transactional(readOnly = true)
    fun getPreferences(userId: UUID): UserMemberPreferencesResponseDto {
        val user = requireUser(userId)
        return toResponse(user)
    }

    @Transactional
    fun patchPreferences(
        userId: UUID,
        body: PatchUserMemberPreferencesRequest,
    ): UserMemberPreferencesResponseDto {
        if (body.memberDisplayName == null && body.preferredRoleKeys == null && body.gender == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune préférence à mettre à jour.")
        }
        val user = requireUser(userId)
        val now = Instant.now()
        var syncMemberships = false

        body.memberDisplayName?.let { raw ->
            val normalized =
                raw.trim().takeIf { it.isNotEmpty() }
                    ?: throw ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le nom affiché ne peut pas être vide.",
                    )
            user.memberDisplayName = normalized
            syncMemberships = true
        }

        body.preferredRoleKeys?.let { raw ->
            user.preferredRoleKeys = PreferredRoleKeys.normalize(raw)
            syncMemberships = true
        }

        body.gender?.let { raw ->
            val parsed =
                MemberGender.fromWireOrNull(raw)
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Genre invalide.")
            user.gender = parsed
        }

        user.updatedAt = now
        userRepository.save(user)
        if (syncMemberships) {
            syncActiveMemberships(user, now)
        }
        return toResponse(user)
    }

    @Transactional
    fun updatePreferredRoles(
        userId: UUID,
        preferredRoleKeys: List<String>,
    ): UserMemberPreferencesResponseDto =
        patchPreferences(
            userId,
            PatchUserMemberPreferencesRequest(preferredRoleKeys = preferredRoleKeys),
        )

    @Transactional
    fun updateMemberDisplayName(
        userId: UUID,
        memberDisplayName: String,
    ): UserMemberPreferencesResponseDto =
        patchPreferences(
            userId,
            PatchUserMemberPreferencesRequest(memberDisplayName = memberDisplayName),
        )

    private fun requireUser(userId: UUID): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable.")
        }

    private fun toResponse(user: UserEntity): UserMemberPreferencesResponseDto =
        UserMemberPreferencesResponseDto(
            memberDisplayName = resolvedMemberDisplayName(user),
            preferredRoleKeys = PreferredRoleKeys.effectiveKeys(user.preferredRoleKeys),
            gender = MemberGender.effective(user.gender).wireValue,
        )

    fun resolvedMemberDisplayName(user: UserEntity): String =
        user.memberDisplayName?.trim()?.takeIf { it.isNotEmpty() }
            ?: MemberDisplayNameResolver.resolve(user)

    private fun syncActiveMemberships(
        user: UserEntity,
        now: Instant,
    ) {
        val displayName = resolvedMemberDisplayName(user)
        val roleKeys = user.preferredRoleKeys
        val memberships = membershipRepository.findActiveByUserId(user.id)
        memberships.forEach { membership ->
            membership.displayName = displayName
            membership.preferredRoleKeys = roleKeys
            membership.updatedAt = now
        }
        membershipRepository.saveAll(memberships)
    }
}

package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.MembershipSummaryDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeMembershipService(
    private val membershipRepository: TroupeMembershipRepository,
    private val troupeRepository: TroupeRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun listActiveTroupesForUser(userId: UUID): List<TroupeListItemDto> =
        membershipRepository.findActiveByUserId(userId).map { membership ->
            TroupeListItemDto(
                id = membership.troupe.id,
                name = membership.troupe.name,
                slug = membership.troupe.slug,
                membership = MembershipSummaryDto.from(membership),
            )
        }

    @Transactional(readOnly = true)
    fun getActiveMembershipForUser(
        userId: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity? {
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, userId) ?: return null
        return membership.takeIf { it.status == TroupeMembershipStatus.ACTIVE }
    }

    @Transactional(readOnly = true)
    fun isActiveMember(
        userId: UUID,
        troupeId: UUID,
    ): Boolean =
        membershipRepository.existsByTroupe_IdAndUser_IdAndStatus(
            troupeId,
            userId,
            TroupeMembershipStatus.ACTIVE,
        )

    @Transactional
    fun ensureActiveMembership(
        userId: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity {
        val troupe =
            troupeRepository
                .findByIdForMembershipJoin(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val user =
            userRepository
                .findById(userId)
                .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu") }
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, userId)
        val now = Instant.now()
        if (existing != null) {
            if (existing.status != TroupeMembershipStatus.ACTIVE) {
                existing.status = TroupeMembershipStatus.ACTIVE
                existing.updatedAt = now
            }
            return membershipRepository.save(existing)
        }
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = MemberDisplayNameResolver.resolve(user),
                createdAt = now,
                updatedAt = now,
            )
        return try {
            membershipRepository.saveAndFlush(membership)
        } catch (ex: DataIntegrityViolationException) {
            membershipRepository.findByTroupe_IdAndUser_Id(troupeId, userId)
                ?: throw ex
        }
    }

    @Transactional(readOnly = true)
    fun requireActiveMembership(
        userId: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity {
        val membership = getActiveMembershipForUser(userId, troupeId)
        if (membership == null) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette troupe.")
        }
        return membership
    }

    fun resolveDefaultDisplayName(user: UserEntity): String = MemberDisplayNameResolver.resolve(user)
}

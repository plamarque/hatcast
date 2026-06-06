package com.hatcast.api.troupe

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeExterneCarnetService(
    private val membershipRepository: TroupeMembershipRepository,
    private val troupeRepository: TroupeRepository,
    private val userRepository: UserRepository,
    private val auditRecorder: AuditEventRecorder,
) {
    @Transactional
    fun upsertActiveExterne(
        troupeId: UUID,
        displayName: String,
        email: String?,
        actorUserId: UUID?,
    ): TroupeMembershipEntity {
        val normalizedDisplayName =
            displayName.trim().takeIf { it.isNotEmpty() }
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom affiché ne peut pas être vide.")
        val normalizedEmail = TroupeExterneEmailSupport.validateOptional(email)
        val linkedUser = normalizedEmail?.let { userRepository.findFirstByEmailIgnoreCase(it) }
        val troupe =
            troupeRepository.findByIdForMembershipJoin(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val now = Instant.now()
        val existing =
            findExterneForUpsert(
                troupeId = troupeId,
                linkedUserId = linkedUser?.id,
                normalizedEmail = normalizedEmail,
                displayName = normalizedDisplayName,
            )
        if (existing != null) {
            if (linkedUser != null) {
                ensureNoActiveNonExterneMembershipForUser(
                    troupeId = troupeId,
                    userId = linkedUser.id,
                    excludeMembershipId = existing.id,
                )
            }
            val wasInactive = existing.status == TroupeMembershipStatus.INACTIVE
            val beforeSnapshot = if (wasInactive) AuditSnapshots.membership(existing) else null
            existing.status = TroupeMembershipStatus.ACTIVE
            existing.displayName = normalizedDisplayName
            existing.normalizedEmail = normalizedEmail
            existing.user = linkedUser
            existing.updatedAt = now
            val saved = membershipRepository.save(existing)
            if (actorUserId != null && wasInactive) {
                auditRecorder.record(
                    AuditRecordRequest(
                        actionType = AuditActionType.TROUPE_MEMBER_ADDED,
                        actorUserId = actorUserId,
                        subjectUserId = saved.user?.id,
                        troupeId = troupeId,
                        before = beforeSnapshot,
                        after = AuditSnapshots.membership(saved),
                        metadata = mapOf("baselineRole" to TroupeBaselineRole.EXTERNE.name),
                    ),
                )
            }
            return saved
        }
        if (linkedUser != null) {
            ensureNoActiveNonExterneMembershipForUser(troupeId, linkedUser.id)
        }
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = linkedUser,
                normalizedEmail = normalizedEmail,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.EXTERNE,
                displayName = normalizedDisplayName,
                createdAt = now,
                updatedAt = now,
            )
        val saved = membershipRepository.saveAndFlush(membership)
        if (actorUserId != null) {
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.TROUPE_MEMBER_ADDED,
                    actorUserId = actorUserId,
                    subjectUserId = saved.user?.id,
                    troupeId = troupeId,
                    after = AuditSnapshots.membership(saved),
                    metadata = mapOf("baselineRole" to TroupeBaselineRole.EXTERNE.name),
                ),
            )
        }
        return saved
    }

    private fun findExterneForUpsert(
        troupeId: UUID,
        linkedUserId: UUID?,
        normalizedEmail: String?,
        displayName: String,
    ): TroupeMembershipEntity? {
        if (linkedUserId != null) {
            membershipRepository
                .findByTroupe_IdAndUser_Id(troupeId, linkedUserId)
                ?.takeIf { it.baselineRole == TroupeBaselineRole.EXTERNE }
                ?.let { return it }
        }
        if (normalizedEmail != null) {
            membershipRepository
                .findFirstByTroupe_IdAndBaselineRoleAndNormalizedEmailIgnoreCase(
                    troupeId,
                    TroupeBaselineRole.EXTERNE,
                    normalizedEmail,
                )
                ?.let { return it }
        }
        return membershipRepository.findFirstByTroupe_IdAndBaselineRoleAndDisplayNameIgnoreCase(
            troupeId,
            TroupeBaselineRole.EXTERNE,
            displayName,
        )
    }

    private fun ensureNoActiveNonExterneMembershipForUser(
        troupeId: UUID,
        userId: UUID,
        excludeMembershipId: UUID? = null,
    ) {
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, userId) ?: return
        if (excludeMembershipId != null && existing.id == excludeMembershipId) {
            return
        }
        if (existing.status == TroupeMembershipStatus.ACTIVE &&
            existing.baselineRole != TroupeBaselineRole.EXTERNE
        ) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cet utilisateur a déjà une adhésion active dans cette troupe.",
            )
        }
    }
}

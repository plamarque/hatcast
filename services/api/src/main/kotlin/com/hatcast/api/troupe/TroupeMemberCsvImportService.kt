package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.MemberCsvRowDto
import com.hatcast.api.troupe.dto.MemberImportRowResultDto
import com.hatcast.api.user.UserAccountService
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeMemberCsvImportService(
    private val membershipRepository: TroupeMembershipRepository,
    private val troupeRepository: TroupeRepository,
    private val userAccountService: UserAccountService,
) {
    fun importRow(
        troupeId: UUID,
        row: MemberCsvRowDto,
    ): MemberImportRowResultDto {
        if (!row.valid) {
            return MemberImportRowResultDto(
                rowNumber = row.rowNumber,
                outcome = MemberImportRowOutcome.ERROR,
                email = row.email,
                code = row.errorCode ?: MemberImportErrorCode.PARSE_ERROR,
                message = row.errorMessage ?: "Ligne invalide.",
            )
        }
        val email = row.email ?: return rowError(row.rowNumber, null, MemberImportErrorCode.INVALID_EMAIL, "Email manquant.")
        val user =
            try {
                userAccountService.findUserForMemberImport(email)
            } catch (_: IllegalArgumentException) {
                return rowError(row.rowNumber, email, MemberImportErrorCode.INVALID_EMAIL, "Email invalide.")
            }
        if (user == null) {
            return rowError(
                row.rowNumber,
                email,
                MemberImportErrorCode.USER_NOT_FOUND,
                "Importez d'abord cet utilisateur via le CSV utilisateurs.",
            )
        }
        val troupe =
            troupeRepository.findByIdForMembershipJoin(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val targetStatus = row.status ?: TroupeMembershipStatus.ACTIVE
        val targetRole = row.baselineRole ?: TroupeBaselineRole.MEMBER
        val targetDisplayName = normalizeDisplayName(row.displayName)
        val now = Instant.now()
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id)
        if (existing != null) {
            val resolvedDisplayName = targetDisplayName ?: existing.displayName
            if (
                existing.status == targetStatus &&
                existing.baselineRole == targetRole &&
                existing.displayName == resolvedDisplayName
            ) {
                return MemberImportRowResultDto(
                    rowNumber = row.rowNumber,
                    outcome = MemberImportRowOutcome.SKIPPED,
                    email = email,
                    code = null,
                    message = "Aucune modification nécessaire.",
                )
            }
            try {
                ensureLastAdminRemains(existing, targetStatus, targetRole)
            } catch (ex: ResponseStatusException) {
                if (ex.statusCode == HttpStatus.CONFLICT) {
                    return rowError(
                        row.rowNumber,
                        email,
                        MemberImportErrorCode.LAST_ADMIN_VIOLATION,
                        ex.reason ?: "Impossible de retirer le dernier administrateur actif.",
                    )
                }
                throw ex
            }
            existing.status = targetStatus
            existing.baselineRole = targetRole
            if (targetDisplayName != null) {
                existing.displayName = targetDisplayName
            }
            existing.updatedAt = now
            membershipRepository.save(existing)
            return rowSuccess(row.rowNumber, email)
        }
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = targetStatus,
                baselineRole = targetRole,
                displayName = targetDisplayName ?: MemberDisplayNameResolver.resolve(user),
                createdAt = now,
                updatedAt = now,
            )
        return try {
            membershipRepository.saveAndFlush(membership)
            rowSuccess(row.rowNumber, email)
        } catch (ex: DataIntegrityViolationException) {
            if (membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id) == null) throw ex
            importRow(troupeId, row)
        }
    }

    private fun normalizeDisplayName(value: String?): String? = value?.trim()?.takeIf { it.isNotEmpty() }

    private fun ensureLastAdminRemains(
        membership: TroupeMembershipEntity,
        targetStatus: TroupeMembershipStatus?,
        targetRole: TroupeBaselineRole?,
    ) {
        val isCurrentlyActiveAdmin =
            membership.status == TroupeMembershipStatus.ACTIVE &&
                membership.baselineRole == TroupeBaselineRole.TROUPE_ADMIN
        val remainsActiveAdmin =
            targetStatus == TroupeMembershipStatus.ACTIVE &&
                targetRole == TroupeBaselineRole.TROUPE_ADMIN
        if (isCurrentlyActiveAdmin && !remainsActiveAdmin) {
            val adminCount =
                membershipRepository.countByTroupe_IdAndStatusAndBaselineRole(
                    membership.troupe.id,
                    TroupeMembershipStatus.ACTIVE,
                    TroupeBaselineRole.TROUPE_ADMIN,
                )
            if (adminCount <= 1) {
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossible de retirer le dernier administrateur actif de la troupe.",
                )
            }
        }
    }

    private fun rowSuccess(
        rowNumber: Int,
        email: String,
    ) = MemberImportRowResultDto(
        rowNumber = rowNumber,
        outcome = MemberImportRowOutcome.SUCCESS,
        email = email,
        code = null,
        message = null,
    )

    private fun rowError(
        rowNumber: Int,
        email: String?,
        code: MemberImportErrorCode,
        message: String,
    ) = MemberImportRowResultDto(
        rowNumber = rowNumber,
        outcome = MemberImportRowOutcome.ERROR,
        email = email,
        code = code,
        message = message,
    )
}

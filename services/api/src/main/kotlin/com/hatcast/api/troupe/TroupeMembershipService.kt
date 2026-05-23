package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.AddTroupeMemberRequest
import com.hatcast.api.troupe.dto.MemberImportResultDto
import com.hatcast.api.troupe.dto.MemberImportSummaryDto
import com.hatcast.api.troupe.dto.MembershipSummaryDto
import com.hatcast.api.troupe.dto.PagedTroupeMembersResponse
import com.hatcast.api.troupe.dto.TroupeMemberAdminDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import com.hatcast.api.troupe.dto.UpdateMyMembershipRequest
import com.hatcast.api.troupe.dto.UpdateTroupeMemberRequest
import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
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
    private val userAccountService: UserAccountService,
    private val csvImportService: TroupeMemberCsvImportService,
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

    @Transactional(readOnly = true)
    fun isTroupeAdmin(
        userId: UUID,
        troupeId: UUID,
    ): Boolean =
        getActiveMembershipForUser(userId, troupeId)?.baselineRole == TroupeBaselineRole.TROUPE_ADMIN

    @Transactional(readOnly = true)
    fun requireTroupeAdmin(
        userId: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity {
        val membership = requireActiveMembership(userId, troupeId)
        if (membership.baselineRole != TroupeBaselineRole.TROUPE_ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès réservé aux administrateurs de troupe.")
        }
        return membership
    }

    @Transactional(readOnly = true)
    fun listMembersForAdmin(
        troupeId: UUID,
        page: Int,
        size: Int,
        principal: SessionUserPrincipal,
    ): PagedTroupeMembersResponse {
        requireTroupeAdmin(principal.userId, troupeId)
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val p =
            membershipRepository.findByTroupe_Id(
                troupeId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "displayName")),
            )
        return PagedTroupeMembersResponse(
            content = p.content.map(TroupeMemberAdminDto::from),
            page = p.number,
            size = p.size,
            totalElements = p.totalElements,
            totalPages = p.totalPages,
        )
    }

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
                baselineRole = TroupeBaselineRole.MEMBER,
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

    @Transactional
    fun addMemberByEmail(
        troupeId: UUID,
        body: AddTroupeMemberRequest,
        principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto {
        requireTroupeAdmin(principal.userId, troupeId)
        val troupe =
            troupeRepository
                .findByIdForMembershipJoin(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val user = resolveUserByEmail(body.email)
        val now = Instant.now()
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id)
        if (existing != null) {
            val targetStatus =
                if (existing.status != TroupeMembershipStatus.ACTIVE) {
                    TroupeMembershipStatus.ACTIVE
                } else {
                    existing.status
                }
            val targetRole =
                when {
                    existing.status != TroupeMembershipStatus.ACTIVE ->
                        body.baselineRole ?: TroupeBaselineRole.MEMBER
                    body.baselineRole != null -> body.baselineRole
                    else -> existing.baselineRole
                }
            ensureLastAdminRemains(existing, targetStatus, targetRole)
            existing.status = targetStatus
            existing.baselineRole = targetRole
            val displayName = normalizeDisplayName(body.displayName)
            if (displayName != null) existing.displayName = displayName
            existing.updatedAt = now
            return TroupeMemberAdminDto.from(membershipRepository.save(existing))
        }
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = body.baselineRole ?: TroupeBaselineRole.MEMBER,
                displayName = normalizeDisplayName(body.displayName) ?: resolveDefaultDisplayName(user),
                createdAt = now,
                updatedAt = now,
            )
        return try {
            TroupeMemberAdminDto.from(membershipRepository.saveAndFlush(membership))
        } catch (ex: DataIntegrityViolationException) {
            val concurrent = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id) ?: throw ex
            TroupeMemberAdminDto.from(concurrent)
        }
    }

    @Transactional
    fun updateMyMembership(
        userId: UUID,
        troupeId: UUID,
        body: UpdateMyMembershipRequest,
    ): MembershipSummaryDto {
        val membership = requireActiveMembership(userId, troupeId)
        membership.displayName =
            normalizeDisplayName(body.displayName)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom affiché ne peut pas être vide.")
        membership.updatedAt = Instant.now()
        return MembershipSummaryDto.from(membershipRepository.save(membership))
    }

    @Transactional
    fun updateMember(
        troupeId: UUID,
        membershipId: UUID,
        body: UpdateTroupeMemberRequest,
        principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto {
        requireTroupeAdmin(principal.userId, troupeId)
        val membership =
            membershipRepository.findByIdAndTroupe_Id(membershipId, troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Adhésion introuvable.")
        val targetStatus = if (body.status.isPresent) body.status.get() else membership.status
        val targetRole = if (body.baselineRole.isPresent) body.baselineRole.get() else membership.baselineRole
        if (targetStatus == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le statut ne peut pas être effacé.")
        }
        if (targetRole == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le rôle ne peut pas être effacé.")
        }
        ensureLastAdminRemains(membership, targetStatus, targetRole)
        if (body.displayName.isPresent) {
            val raw = body.displayName.get()
            membership.displayName =
                normalizeDisplayName(raw)
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom affiché ne peut pas être vide.")
        }
        membership.status = targetStatus
        membership.baselineRole = targetRole
        membership.updatedAt = Instant.now()
        return TroupeMemberAdminDto.from(membershipRepository.save(membership))
    }

    @Transactional(readOnly = true)
    fun exportActiveMembersCsv(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): String {
        requireTroupeAdmin(principal.userId, troupeId)
        val memberships = sequence {
            var page = 0
            while (true) {
                val batch =
                    membershipRepository.findByTroupe_IdAndStatusOrderByDisplayNameAsc(
                        troupeId,
                        TroupeMembershipStatus.ACTIVE,
                        PageRequest.of(page, EXPORT_BATCH_SIZE, Sort.by(Sort.Direction.ASC, "displayName")),
                    )
                if (batch.isEmpty) break
                batch.forEach { yield(it) }
                if (!batch.hasNext()) break
                page++
            }
        }
        return TroupeMemberCsvCodec.formatExport(memberships)
    }

    @Transactional
    fun importMembersCsv(
        troupeId: UUID,
        csvContent: String,
        principal: SessionUserPrincipal,
    ): MemberImportResultDto {
        requireTroupeAdmin(principal.userId, troupeId)
        troupeRepository.findByIdForMembershipJoin(troupeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val parsed = TroupeMemberCsvCodec.parse(csvContent)
        parsed.fileError?.let { error ->
            val message =
                when (error) {
                    MemberCsvFileError.EMPTY_FILE -> "Le fichier CSV est vide."
                    MemberCsvFileError.MISSING_EMAIL_COLUMN -> "La colonne email est obligatoire dans l'en-tête."
                    MemberCsvFileError.TOO_MANY_ROWS ->
                        "Le fichier dépasse la limite de ${TroupeMemberCsvCodec.MAX_IMPORT_ROWS} lignes."
                }
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, message)
        }
        val rowResults = parsed.rows.map { row -> csvImportService.importRow(troupeId, row) }
        return MemberImportResultDto(
            summary =
                MemberImportSummaryDto(
                    success = rowResults.count { it.outcome == MemberImportRowOutcome.SUCCESS },
                    skipped = rowResults.count { it.outcome == MemberImportRowOutcome.SKIPPED },
                    error = rowResults.count { it.outcome == MemberImportRowOutcome.ERROR },
                ),
            rows = rowResults,
        )
    }

    @Transactional
    fun deactivateMember(
        troupeId: UUID,
        membershipId: UUID,
        principal: SessionUserPrincipal,
    ) {
        requireTroupeAdmin(principal.userId, troupeId)
        val membership =
            membershipRepository.findByIdAndTroupe_Id(membershipId, troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Adhésion introuvable.")
        ensureLastAdminRemains(membership, TroupeMembershipStatus.INACTIVE, membership.baselineRole)
        if (membership.status != TroupeMembershipStatus.INACTIVE) {
            membership.status = TroupeMembershipStatus.INACTIVE
            membership.updatedAt = Instant.now()
            membershipRepository.save(membership)
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

    private fun resolveUserByEmail(rawEmail: String): UserEntity {
        val email = rawEmail.trim().lowercase()
        if (email.isEmpty() || !email.contains("@")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalide.")
        }
        return userAccountService.ensureUserByEmail(email)
    }

    private fun normalizeDisplayName(value: String?): String? = value?.trim()?.takeIf { it.isNotEmpty() }

    companion object {
        private const val EXPORT_BATCH_SIZE = 100
    }

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
}

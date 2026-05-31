package com.hatcast.api.troupe

import com.hatcast.api.auth.PlatformAdminService
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
import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
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
    private val troupeListStatsRepository: TroupeListStatsRepository,
    private val troupeRepository: TroupeRepository,
    private val userRepository: UserRepository,
    private val userAccountService: UserAccountService,
    private val csvImportService: TroupeMemberCsvImportService,
    private val platformAdminService: PlatformAdminService,
    private val seasonRepository: SeasonRepository,
    private val membershipSync: SeasonParticipantMembershipSync,
) {
    @Transactional(readOnly = true)
    fun listActiveTroupesForUser(userId: UUID): List<TroupeListItemDto> {
        val memberships = membershipRepository.findActiveByUserId(userId)
        if (memberships.isEmpty()) {
            return emptyList()
        }
        val troupeIds = memberships.map { it.troupe.id }
        val memberCounts =
            membershipRepository
                .countActiveMembersByTroupeIds(troupeIds)
                .associate { it.troupeId to it.memberCount }
        val fromInclusive = AgendaTimeBoundary.startOfTodayInclusive()
        val upcomingCounts =
            troupeListStatsRepository
                .countUpcomingEventsByTroupeIdsForUser(userId, troupeIds, fromInclusive)
                .associate { it.troupeId to it.eventCount }
        return memberships.map { membership ->
            val troupeId = membership.troupe.id
            TroupeListItemDto.from(
                troupe = membership.troupe,
                membership = membership,
                activeMemberCount = memberCounts[troupeId] ?: 0L,
                upcomingEventCount = upcomingCounts[troupeId] ?: 0L,
            )
        }
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
        requireCanManageTroupeMembers(principal, troupeId)
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "displayName"))
        val p = fetchMembershipPageWithUsers(troupeId, pageable)
        return PagedTroupeMembersResponse(
            content = p.content.map(TroupeMemberAdminDto::from),
            page = p.number,
            size = p.size,
            totalElements = p.totalElements,
            totalPages = p.totalPages,
        )
    }

    @Transactional
    fun selfJoin(
        userId: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity {
        val troupe = requireOpenJoinPolicy(troupeId)
        val membership = ensureActiveMembership(userId, troupeId)
        if (troupe.isDemo) {
            seasonRepository.findByTroupe_IdAndIsActiveTrue(troupeId)?.let { season ->
                membershipSync.ensureForMembership(season, membership)
            }
        }
        return membership
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
        requireCanManageTroupeMembers(principal, troupeId)
        val troupe =
            troupeRepository
                .findByIdForMembershipJoin(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val user = resolveUserByEmail(body.email)
        val now = Instant.now()
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id)
        if (existing != null) {
            val previousStatus = existing.status
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
            val saved = membershipRepository.save(existing)
            syncSeasonParticipantsAfterStatusChange(saved, previousStatus, targetStatus)
            return TroupeMemberAdminDto.from(saved)
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
        requireCanManageTroupeMembers(principal, troupeId)
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
        val previousStatus = membership.status
        membership.status = targetStatus
        membership.baselineRole = targetRole
        membership.updatedAt = Instant.now()
        val saved = membershipRepository.save(membership)
        syncSeasonParticipantsAfterStatusChange(saved, previousStatus, targetStatus)
        return TroupeMemberAdminDto.from(saved)
    }

    @Transactional(readOnly = true)
    fun exportActiveMembersCsv(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): String {
        requireCanManageTroupeMembers(principal, troupeId)
        val sort = Sort.by(Sort.Direction.ASC, "displayName")
        val memberships =
            sequence {
                var page = 0
                while (true) {
                    val idBatch =
                        membershipRepository.findIdsByTroupe_IdAndStatus(
                            troupeId,
                            TroupeMembershipStatus.ACTIVE,
                            PageRequest.of(page, EXPORT_BATCH_SIZE, sort),
                        )
                    if (idBatch.isEmpty) break
                    val fetched =
                        membershipRepository.findByTroupe_IdAndStatusAndIdInWithUser(
                            troupeId,
                            TroupeMembershipStatus.ACTIVE,
                            idBatch.content,
                        )
                    val byId = fetched.associateBy { it.id }
                    idBatch.content.forEach { id -> byId[id]?.let { yield(it) } }
                    if (!idBatch.hasNext()) break
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
        requireCanManageTroupeMembers(principal, troupeId)
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
        requireCanManageTroupeMembers(principal, troupeId)
        val membership =
            membershipRepository.findByIdAndTroupe_Id(membershipId, troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Adhésion introuvable.")
        ensureLastAdminRemains(membership, TroupeMembershipStatus.INACTIVE, membership.baselineRole)
        if (membership.status != TroupeMembershipStatus.INACTIVE) {
            membership.status = TroupeMembershipStatus.INACTIVE
            membership.updatedAt = Instant.now()
            val saved = membershipRepository.save(membership)
            membershipSync.removeForMembershipAcrossTroupe(saved)
        }
    }

    private fun syncSeasonParticipantsAfterStatusChange(
        membership: TroupeMembershipEntity,
        previousStatus: TroupeMembershipStatus,
        targetStatus: TroupeMembershipStatus,
    ) {
        if (previousStatus == targetStatus) {
            return
        }
        when (targetStatus) {
            TroupeMembershipStatus.INACTIVE -> membershipSync.removeForMembershipAcrossTroupe(membership)
            TroupeMembershipStatus.ACTIVE -> membershipSync.ensureForMembershipAcrossTroupe(membership)
            else -> Unit
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

    private fun requireOpenJoinPolicy(troupeId: UUID): TroupeEntity {
        val troupe =
            troupeRepository.findById(troupeId).orElse(null)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        if (troupe.joinPolicy != TroupeJoinPolicy.OPEN) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Adhésion directe non autorisée pour cette troupe.",
            )
        }
        return troupe
    }

    private fun requireCanManageTroupeMembers(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        requireTroupeAdmin(principal.userId, troupeId)
    }

    companion object {
        private const val EXPORT_BATCH_SIZE = 100
    }

    private fun fetchMembershipPageWithUsers(
        troupeId: UUID,
        pageable: Pageable,
    ): Page<TroupeMembershipEntity> {
        val idPage = membershipRepository.findIdsByTroupe_Id(troupeId, pageable)
        if (idPage.isEmpty) {
            return PageImpl(emptyList(), pageable, idPage.totalElements)
        }
        val fetched = membershipRepository.findByIdInWithUser(idPage.content)
        val byId = fetched.associateBy { it.id }
        val ordered = idPage.content.mapNotNull { byId[it] }
        return PageImpl(ordered, pageable, idPage.totalElements)
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

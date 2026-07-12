package com.hatcast.api.troupe

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.participant.InvitationScope
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipationMode
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.dto.ConvertToExterneRequest
import com.hatcast.api.troupe.dto.MemberConversionContextDto
import com.hatcast.api.troupe.dto.MemberConversionSeasonOptionDto
import com.hatcast.api.troupe.dto.TroupeMemberAdminDto
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeMembershipLifecycleService(
    private val membershipRepository: TroupeMembershipRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val membershipSync: SeasonParticipantMembershipSync,
    private val auditRecorder: AuditEventRecorder,
    private val avatarService: com.hatcast.api.avatar.AvatarService,
    private val troupeAccessService: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun getConversionContext(
        troupeId: UUID,
        membershipId: UUID,
        principal: SessionUserPrincipal,
    ): MemberConversionContextDto {
        troupeAccessService.requireCanManageTroupe(principal, troupeId)
        val membership = loadMembership(troupeId, membershipId)
        val activeSeasons =
            seasonParticipantRepository
                .findByTroupeMembership_Id(membership.id)
                .filter { row ->
                    row.status == ParticipantStatus.ACTIVE &&
                        isActiveSeason(row.season)
                }
                .map { row ->
                    MemberConversionSeasonOptionDto(
                        seasonId = row.season.id,
                        seasonTitle = row.season.title,
                        seasonSlug = row.season.slug,
                    )
                }
                .distinctBy { it.seasonId }
                .sortedBy { it.seasonTitle.lowercase() }
        return MemberConversionContextDto(
            membershipId = membership.id,
            baselineRole = membership.baselineRole,
            activeSeasons = activeSeasons,
        )
    }

    @Transactional
    fun convertToExterne(
        troupeId: UUID,
        membershipId: UUID,
        body: ConvertToExterneRequest,
        principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto {
        troupeAccessService.requireCanManageTroupe(principal, troupeId)
        val membership = loadMembership(troupeId, membershipId)
        if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce contact est déjà externe.")
        }
        if (membership.baselineRole == TroupeBaselineRole.TROUPE_ADMIN) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Rétrogradez d'abord l'administrateur·ice avant de le·la passer en externe.",
            )
        }
        if (membership.status != TroupeMembershipStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Seuls les membres actifs peuvent être convertis.")
        }
        val guestSeasonIds = body.seasonsToGuestSeason.toSet()
        val removeSeasonIds = body.seasonsToRemove.toSet()
        if (guestSeasonIds.intersect(removeSeasonIds).isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Les saisons invitées et retirées doivent être disjointes.")
        }
        val activeRosterRows =
            seasonParticipantRepository
                .findByTroupeMembership_Id(membership.id)
                .filter { it.status == ParticipantStatus.ACTIVE && isActiveSeason(it.season) }
        val activeSeasonIds = activeRosterRows.map { it.season.id }.toSet()
        val accounted = guestSeasonIds + removeSeasonIds
        if (accounted != activeSeasonIds) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Choisissez pour chaque saison active : externe saison ou retrait du roster.",
            )
        }
        validateSeasonIdsInTroupe(troupeId, accounted)
        val beforeSnapshot = AuditSnapshots.membership(membership)
        membership.baselineRole = TroupeBaselineRole.EXTERNE
        membership.updatedAt = Instant.now()
        val saved = membershipRepository.save(membership)
        val now = Instant.now()
        for (row in activeRosterRows) {
            when (row.season.id) {
                in guestSeasonIds -> applyGuestSeason(row, now)
                in removeSeasonIds -> applyRemoved(row, now)
            }
        }
        seasonParticipantRepository.saveAll(activeRosterRows)
        recordConversionAudit(
            principal = principal,
            troupeId = troupeId,
            membership = saved,
            beforeSnapshot = beforeSnapshot,
            conversion = "MEMBER_TO_EXTERNE",
        )
        return TroupeMemberAdminDto.from(saved, avatarService)
    }

    @Transactional
    fun convertToMember(
        troupeId: UUID,
        membershipId: UUID,
        principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto {
        troupeAccessService.requireCanManageTroupe(principal, troupeId)
        val membership = loadMembership(troupeId, membershipId)
        if (membership.baselineRole != TroupeBaselineRole.EXTERNE) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Seuls les externes peuvent être réintégrés comme membre.",
            )
        }
        if (membership.status != TroupeMembershipStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Réactivez l'externe avant réintégration.")
        }
        val beforeSnapshot = AuditSnapshots.membership(membership)
        membership.baselineRole = TroupeBaselineRole.MEMBER
        membership.updatedAt = Instant.now()
        val saved = membershipRepository.save(membership)
        membershipSync.ensureForMembershipAcrossTroupe(saved)
        val now = Instant.now()
        val linkedRows = seasonParticipantRepository.findByTroupeMembership_Id(saved.id)
        for (row in linkedRows) {
            if (row.status != ParticipantStatus.ACTIVE) {
                continue
            }
            if (row.removalSource == SeasonParticipantRemovalSource.SEASON_ADMIN) {
                continue
            }
            if (!isActiveSeason(row.season)) {
                continue
            }
            row.participationMode = SeasonParticipationMode.MEMBER_SYNC
            row.invitationScope = null
            row.updatedAt = now
        }
        seasonParticipantRepository.saveAll(linkedRows)
        recordConversionAudit(
            principal = principal,
            troupeId = troupeId,
            membership = saved,
            beforeSnapshot = beforeSnapshot,
            conversion = "EXTERNE_TO_MEMBER",
        )
        return TroupeMemberAdminDto.from(saved, avatarService)
    }

    private fun loadMembership(
        troupeId: UUID,
        membershipId: UUID,
    ): TroupeMembershipEntity =
        membershipRepository.findByIdAndTroupe_Id(membershipId, troupeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Adhésion introuvable.")

    private fun isActiveSeason(season: SeasonEntity): Boolean = season.isActive && !season.archived

    private fun validateSeasonIdsInTroupe(
        troupeId: UUID,
        seasonIds: Set<UUID>,
    ) {
        for (seasonId in seasonIds) {
            val season =
                seasonRepository.findById(seasonId).orElse(null)
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison inconnue.")
            if (season.troupe.id != troupeId) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison hors troupe.")
            }
            if (!isActiveSeason(season)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Seules les saisons actives sont modifiables.")
            }
        }
    }

    private fun applyGuestSeason(
        row: SeasonParticipantEntity,
        now: Instant,
    ) {
        row.participationMode = SeasonParticipationMode.GUEST_SEASON
        row.invitationScope = InvitationScope.SEASON
        row.updatedAt = now
    }

    private fun applyRemoved(
        row: SeasonParticipantEntity,
        now: Instant,
    ) {
        row.status = ParticipantStatus.REMOVED
        row.removedAt = now
        row.removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN
        row.updatedAt = now
    }

    private fun recordConversionAudit(
        principal: SessionUserPrincipal,
        troupeId: UUID,
        membership: TroupeMembershipEntity,
        beforeSnapshot: Map<String, Any?>,
        conversion: String,
    ) {
        val afterSnapshot = AuditSnapshots.membership(membership)
        val (beforeDiff, afterDiff) = AuditSnapshots.mapDiff(beforeSnapshot, afterSnapshot)
        if (beforeDiff != null && afterDiff != null) {
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.TROUPE_MEMBER_UPDATED,
                    actorUserId = principal.userId,
                    subjectUserId = membership.user?.id,
                    troupeId = troupeId,
                    before = beforeDiff + mapOf("conversion" to null),
                    after = afterDiff + mapOf("conversion" to conversion),
                ),
            )
        }
    }
}

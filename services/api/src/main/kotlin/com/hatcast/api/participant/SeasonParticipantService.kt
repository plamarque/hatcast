package com.hatcast.api.participant

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.dto.ParticipantCreateRequest
import com.hatcast.api.participant.dto.ParticipantSelectorDto
import com.hatcast.api.participant.dto.ParticipantUpdateRequest
import com.hatcast.api.participant.dto.SeasonParticipantAdminDto
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserRepository
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class SeasonParticipantService(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonRepository: SeasonRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val userRepository: UserRepository,
    private val participantAccess: ParticipantAccessService,
    private val participantLink: ParticipantLinkService,
    private val membershipSync: SeasonParticipantMembershipSync,
    private val auditRecorder: AuditEventRecorder,
    private val avatarService: AvatarService,
) {
    @Transactional
    fun listAdmin(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): List<SeasonParticipantAdminDto> {
        participantAccess.requireCanManageSeasonParticipants(seasonId, principal)
        val season = participantAccess.loadSeasonForMember(seasonId, principal)
        ensureMembershipParticipants(season)
        val includeEmail = participantAccess.canViewParticipantEmail(seasonId, principal)
        return seasonParticipantRepository
            .findActiveForSeasonWithAssociations(seasonId, ParticipantStatus.ACTIVE)
            .sortedByFrenchDisplayName { it.displayName }
            .map { row ->
                val user = ParticipantRowPresentation.linkedUser(row)
                SeasonParticipantAdminDto.from(
                    row,
                    includeEmail,
                    ParticipantRowPresentation.avatarUrl(avatarService, user),
                    ParticipantRowPresentation.genderWire(user),
                )
            }
    }

    @Transactional
    fun listSelectors(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): List<ParticipantSelectorDto> {
        val season = participantAccess.loadSeasonForMember(seasonId, principal)
        ensureMembershipParticipants(season)
        return seasonParticipantRepository
            .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
            .sortedByFrenchDisplayName { it.displayName }
            .filter { row ->
                row.troupeMembership == null ||
                    row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
            }.map { row ->
                val avatarUrl = selectorAvatarUrl(row.user ?: row.troupeMembership?.user)
                ParticipantSelectorDto.from(
                    row,
                    avatarUrl,
                    selectorGender(row),
                )
            }
    }

    @Transactional
    fun create(
        seasonId: UUID,
        body: ParticipantCreateRequest,
        principal: SessionUserPrincipal,
    ): SeasonParticipantAdminDto {
        participantAccess.requireCanManageSeasonParticipants(seasonId, principal)
        val season = participantAccess.loadSeasonForMember(seasonId, principal)
        val displayName = body.displayName.trim()
        if (displayName.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'affichage requis.")
        }
        val normalizedEmail = participantLink.normalizeEmail(body.email)
        val linkedUser = participantLink.resolveUserId(normalizedEmail)?.let { userRepository.findById(it).orElse(null) }

        // Re-inclusion via « Ajouter » : si la personne avait été retirée du roster
        // (reconnue par utilisateur lié, sinon email, sinon nom), on réactive la MÊME
        // ligne plutôt que d'en créer une seconde — l'historique (dispos/compositions)
        // rattaché à `season_participant_id` réapparaît alors tel quel.
        val reactivatable = findReactivatableRemoved(seasonId, linkedUser, normalizedEmail, displayName)
        if (reactivatable != null) {
            return reactivateRemoved(season, reactivatable, displayName, normalizedEmail, linkedUser, principal.userId)
        }

        if (
            seasonParticipantRepository.existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCase(
                seasonId,
                ParticipantStatus.ACTIVE,
                displayName,
            )
        ) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Un participant avec ce nom existe déjà dans la saison.")
        }
        val now = Instant.now()
        val saved =
            seasonParticipantRepository.save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = displayName,
                    normalizedEmail = normalizedEmail,
                    user = linkedUser,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        refreshParticipantCount(season)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_ADDED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = saved.id,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                after = AuditSnapshots.seasonParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return SeasonParticipantAdminDto.from(saved, includeEmail = true)
    }

    private fun findReactivatableRemoved(
        seasonId: UUID,
        linkedUser: UserEntity?,
        normalizedEmail: String?,
        displayName: String,
    ): SeasonParticipantEntity? {
        if (linkedUser != null) {
            val byUser =
                seasonParticipantRepository
                    .findBySeason_IdAndStatusAndUser_Id(seasonId, ParticipantStatus.REMOVED, linkedUser.id)
            // Prefer the membership-linked row so it re-syncs as a synced member.
            (byUser.firstOrNull { it.troupeMembership != null } ?: byUser.firstOrNull())?.let { return it }
        }
        if (normalizedEmail != null) {
            return seasonParticipantRepository
                .findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIgnoreCase(
                    seasonId,
                    ParticipantStatus.REMOVED,
                    normalizedEmail,
                ).firstOrNull()
        }
        return seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
                seasonId,
                ParticipantStatus.REMOVED,
                displayName,
            ).firstOrNull()
    }

    private fun reactivateRemoved(
        season: SeasonEntity,
        existing: SeasonParticipantEntity,
        requestedDisplayName: String,
        requestedEmail: String?,
        linkedUser: UserEntity?,
        actorUserId: UUID,
    ): SeasonParticipantAdminDto {
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val membership = existing.troupeMembership
        if (membership != null) {
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
            // Synced members keep the troupe membership as the source of truth for name/email.
            existing.displayName = membership.displayName
            existing.user = membership.user
            existing.normalizedEmail =
                membership.user?.email?.let { participantLink.normalizeEmail(it) }
                    ?: membership.normalizedEmail
        } else {
            if (
                seasonParticipantRepository
                    .existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCaseAndIdNot(
                        season.id,
                        ParticipantStatus.ACTIVE,
                        requestedDisplayName,
                        existing.id,
                    )
            ) {
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un participant avec ce nom existe déjà dans la saison.",
                )
            }
            // Explicit row comes back under its new name/email link.
            existing.displayName = requestedDisplayName
            existing.normalizedEmail = requestedEmail
            existing.user = linkedUser
        }
        val now = Instant.now()
        existing.status = ParticipantStatus.ACTIVE
        existing.removedAt = null
        existing.removalSource = null
        existing.updatedAt = now
        val saved = seasonParticipantRepository.save(existing)
        refreshParticipantCount(season)
        MembershipParticipantSyncCache.invalidate(season.id)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_REACTIVATED,
                actorUserId = actorUserId,
                subjectSeasonParticipantId = saved.id,
                troupeId = season.troupe.id,
                seasonId = season.id,
                before = beforeSnapshot,
                after = AuditSnapshots.seasonParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return SeasonParticipantAdminDto.from(saved, includeEmail = true)
    }

    @Transactional
    fun update(
        seasonId: UUID,
        participantId: UUID,
        body: ParticipantUpdateRequest,
        principal: SessionUserPrincipal,
    ): SeasonParticipantAdminDto {
        participantAccess.requireCanManageSeasonParticipants(seasonId, principal)
        participantAccess.loadSeasonForMember(seasonId, principal)
        val existing =
            seasonParticipantRepository.findByIdAndSeason_Id(participantId, seasonId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        if (existing.status != ParticipantStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        }
        if (existing.troupeMembership != null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Les participants synchronisés depuis les membres ne peuvent pas être modifiés ici.")
        }
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val displayName = body.displayName.trim()
        if (displayName.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'affichage requis.")
        }
        if (
            seasonParticipantRepository.existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCaseAndIdNot(
                seasonId,
                ParticipantStatus.ACTIVE,
                displayName,
                participantId,
            )
        ) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Un participant avec ce nom existe déjà dans la saison.")
        }
        val normalizedEmail = participantLink.normalizeEmail(body.email)
        existing.displayName = displayName
        existing.normalizedEmail = normalizedEmail
        existing.user = participantLink.resolveUserId(normalizedEmail)?.let { userRepository.findById(it).orElse(null) }
        existing.updatedAt = Instant.now()
        val saved = seasonParticipantRepository.save(existing)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_UPDATED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = saved.id,
                troupeId = existing.season.troupe.id,
                seasonId = seasonId,
                before = beforeSnapshot,
                after = AuditSnapshots.seasonParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return SeasonParticipantAdminDto.from(saved, includeEmail = true)
    }

    @Transactional
    fun remove(
        seasonId: UUID,
        participantId: UUID,
        principal: SessionUserPrincipal,
    ) {
        participantAccess.requireCanManageSeasonParticipants(seasonId, principal)
        val season = participantAccess.loadSeasonForMember(seasonId, principal)
        val existing =
            seasonParticipantRepository.findByIdAndSeason_Id(participantId, seasonId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        if (existing.status != ParticipantStatus.ACTIVE) {
            return
        }
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val now = Instant.now()
        existing.status = ParticipantStatus.REMOVED
        existing.removedAt = now
        existing.updatedAt = now
        if (existing.troupeMembership != null) {
            existing.removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN
        }
        seasonParticipantRepository.save(existing)
        refreshParticipantCount(season)
        MembershipParticipantSyncCache.invalidate(season.id)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_REMOVED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = existing.id,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                before = beforeSnapshot,
                after = AuditSnapshots.seasonParticipant(existing),
                metadata = AuditSnapshots.participantMetadata(existing.displayName),
            ),
        )
    }

    @Transactional
    fun reinclude(
        seasonId: UUID,
        participantId: UUID,
        principal: SessionUserPrincipal,
    ) {
        participantAccess.requireCanManageSeasonParticipants(seasonId, principal)
        val season = participantAccess.loadSeasonForMember(seasonId, principal)
        val existing =
            seasonParticipantRepository.findByIdAndSeason_Id(participantId, seasonId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        if (existing.status == ParticipantStatus.ACTIVE) {
            return
        }
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val membership = existing.troupeMembership
        if (membership != null) {
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
        } else if (
            seasonParticipantRepository
                .existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCaseAndIdNot(
                    seasonId,
                    ParticipantStatus.ACTIVE,
                    existing.displayName,
                    participantId,
                )
        ) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Un participant avec ce nom existe déjà dans la saison.",
            )
        }
        val now = Instant.now()
        if (membership != null) {
            existing.displayName = membership.displayName
            existing.user = membership.user
            existing.normalizedEmail =
                membership.user?.email?.let { participantLink.normalizeEmail(it) }
                    ?: membership.normalizedEmail
        }
        existing.status = ParticipantStatus.ACTIVE
        existing.removedAt = null
        existing.removalSource = null
        existing.updatedAt = now
        val saved = seasonParticipantRepository.save(existing)
        refreshParticipantCount(season)
        MembershipParticipantSyncCache.invalidate(season.id)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_REACTIVATED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = saved.id,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                before = beforeSnapshot,
                after = AuditSnapshots.seasonParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
    }

    @Transactional
    fun ensureSeasonParticipantForMembership(
        season: SeasonEntity,
        membership: TroupeMembershipEntity,
    ) {
        membershipSync.ensureForMembership(season, membership)
    }

    @Transactional
    fun ensureMembershipParticipants(season: SeasonEntity) {
        if (!MembershipSyncScope.markSynced(season.id)) {
            return
        }
        if (MembershipParticipantSyncCache.isInSync(season.id)) {
            return
        }
        val troupeId = season.troupe.id
        val activeMemberships =
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                troupeId,
                listOf(TroupeMembershipStatus.ACTIVE),
            )
        val membershipIds = activeMemberships.map { it.id }
        val existingByMembershipId =
            if (membershipIds.isEmpty()) {
                emptyMap()
            } else {
                seasonParticipantRepository
                    .findBySeason_IdAndTroupeMembership_IdIn(season.id, membershipIds)
                    .mapNotNull { row -> row.troupeMembership?.id?.let { id -> id to row } }
                    .toMap()
            }
        val now = Instant.now()
        val toSave = mutableListOf<SeasonParticipantEntity>()
        for (membership in activeMemberships) {
            if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
                continue
            }
            val normalizedEmail =
                membership.user?.email?.let { participantLink.normalizeEmail(it) }
                    ?: membership.normalizedEmail
            val existing = existingByMembershipId[membership.id]
            if (existing != null) {
                if (existing.removalSource == SeasonParticipantRemovalSource.SEASON_ADMIN) {
                    continue
                }
                if (
                    existing.displayName == membership.displayName &&
                        existing.user?.id == membership.user?.id &&
                        existing.normalizedEmail == normalizedEmail &&
                        existing.status == ParticipantStatus.ACTIVE &&
                        existing.removedAt == null
                ) {
                    continue
                }
                existing.displayName = membership.displayName
                existing.user = membership.user
                existing.normalizedEmail = normalizedEmail
                existing.status = ParticipantStatus.ACTIVE
                existing.removedAt = null
                existing.removalSource = null
                existing.updatedAt = now
                toSave.add(existing)
            } else {
                toSave.add(
                    SeasonParticipantEntity(
                        season = season,
                        displayName = membership.displayName,
                        normalizedEmail = normalizedEmail,
                        user = membership.user,
                        troupeMembership = membership,
                        status = ParticipantStatus.ACTIVE,
                        createdAt = now,
                        updatedAt = now,
                    ),
                )
            }
        }
        val staleParticipants =
            seasonParticipantRepository.findActiveLinkedToInactiveMembershipsForSeason(season.id)
        for (participant in staleParticipants) {
            if (participant.status != ParticipantStatus.ACTIVE) {
                continue
            }
            participant.status = ParticipantStatus.REMOVED
            participant.removedAt = now
            participant.removalSource = SeasonParticipantRemovalSource.MEMBERSHIP_INACTIVE
            participant.updatedAt = now
            toSave.add(participant)
        }
        if (toSave.isNotEmpty()) {
            seasonParticipantRepository.saveAll(toSave)
            refreshParticipantCount(season)
            MembershipParticipantSyncCache.invalidate(season.id)
        } else if (
            activeMemberships.isNotEmpty() &&
                existingByMembershipId.keys.containsAll(membershipIds) &&
                staleParticipants.isEmpty()
        ) {
            MembershipParticipantSyncCache.markInSync(season.id)
        }
    }

    private fun refreshParticipantCount(season: SeasonEntity) {
        val count =
            seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE).toInt()
        season.participantCount = count
        season.updatedAt = Instant.now()
        seasonRepository.save(season)
    }

    private fun selectorGender(row: SeasonParticipantEntity): String =
        ParticipantRowPresentation.genderWire(ParticipantRowPresentation.linkedUser(row))

    private fun selectorAvatarUrl(user: UserEntity?): String? =
        ParticipantRowPresentation.avatarUrl(avatarService, user)
}

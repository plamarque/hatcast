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
import com.hatcast.api.troupe.TroupeExterneCarnetService
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
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
    private val troupeExterneCarnetService: TroupeExterneCarnetService,
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
                ParticipantSelectorDto.from(row, avatarUrl)
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
        val memberMembership = resolveActiveMemberMembership(season, body, linkedUser)

        if (memberMembership != null) {
            return createOrReactivateMemberParticipant(
                season = season,
                displayName = displayName,
                normalizedEmail = normalizedEmail,
                linkedUser = linkedUser,
                membership = memberMembership,
                actorUserId = principal.userId,
                genderRaw = body.gender,
            )
        }

        val carnet =
            troupeExterneCarnetService.upsertActiveExterne(
                troupeId = season.troupe.id,
                displayName = displayName,
                email = body.email,
                actorUserId = principal.userId,
            )
        val carnetEmail =
            carnet.user?.email?.let { participantLink.normalizeEmail(it) } ?: carnet.normalizedEmail

        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembership_Id(
                seasonId,
                ParticipantStatus.ACTIVE,
                carnet.id,
            )
            ?.let {
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un participant avec ce nom existe déjà dans la saison.",
                )
            }

        val reactivatable =
            findReactivatableRemoved(
                seasonId = seasonId,
                linkedUser = carnet.user ?: linkedUser,
                normalizedEmail = carnetEmail,
                displayName = carnet.displayName,
                troupeMembershipId = carnet.id,
            )
        if (reactivatable != null) {
            return reactivateRemovedExterne(
                season = season,
                existing = reactivatable,
                carnet = carnet,
                actorUserId = principal.userId,
                genderRaw = body.gender,
            )
        }

        val now = Instant.now()
        val saved =
            seasonParticipantRepository.save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = carnet.displayName,
                    normalizedEmail = carnetEmail,
                    user = carnet.user,
                    troupeMembership = carnet,
                    invitationScope = InvitationScope.SEASON,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ).also {
                    ParticipantGenderWriteSupport.applyGenderFromRequest(it, carnet.user, body.gender)
                },
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

    private fun resolveActiveMemberMembership(
        season: SeasonEntity,
        body: ParticipantCreateRequest,
        linkedUser: UserEntity?,
    ): TroupeMembershipEntity? {
        body.troupeMembershipId?.let { membershipId ->
            val membership =
                troupeMembershipRepository.findByIdAndTroupe_Id(membershipId, season.troupe.id)
                    ?: return@let null
            if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
                return@let null
            }
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
            return membership
        }
        if (linkedUser != null) {
            val membership =
                troupeMembershipRepository.findByTroupe_IdAndUser_Id(season.troupe.id, linkedUser.id)
                    ?: return null
            if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
                return null
            }
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
            return membership
        }
        return null
    }

    private fun createOrReactivateMemberParticipant(
        season: SeasonEntity,
        displayName: String,
        normalizedEmail: String?,
        linkedUser: UserEntity?,
        membership: TroupeMembershipEntity,
        actorUserId: UUID,
        genderRaw: String?,
    ): SeasonParticipantAdminDto {
        val reactivatable =
            findReactivatableRemoved(
                seasonId = season.id,
                linkedUser = linkedUser,
                normalizedEmail = normalizedEmail,
                displayName = displayName,
                troupeMembershipId = membership.id,
            )
        if (reactivatable != null) {
            return reactivateRemoved(
                season,
                reactivatable,
                displayName,
                normalizedEmail,
                linkedUser,
                actorUserId,
                genderRaw,
            )
        }
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembership_Id(
                season.id,
                ParticipantStatus.ACTIVE,
                membership.id,
            )
            ?.let {
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un participant avec ce nom existe déjà dans la saison.",
                )
            }
        if (
            seasonParticipantRepository.existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCase(
                season.id,
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
                ).also {
                    ParticipantGenderWriteSupport.applyGenderFromRequest(it, linkedUser, genderRaw)
                },
            )
        refreshParticipantCount(season)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_ADDED,
                actorUserId = actorUserId,
                subjectSeasonParticipantId = saved.id,
                troupeId = season.troupe.id,
                seasonId = season.id,
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
        troupeMembershipId: UUID? = null,
    ): SeasonParticipantEntity? {
        if (troupeMembershipId != null) {
            seasonParticipantRepository
                .findBySeason_IdAndStatusAndTroupeMembership_Id(
                    seasonId,
                    ParticipantStatus.REMOVED,
                    troupeMembershipId,
                )
                ?.let { return it }
        }
        if (linkedUser != null) {
            val byUser =
                seasonParticipantRepository
                    .findBySeason_IdAndStatusAndUser_Id(seasonId, ParticipantStatus.REMOVED, linkedUser.id)
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

    private fun reactivateRemovedExterne(
        season: SeasonEntity,
        existing: SeasonParticipantEntity,
        carnet: TroupeMembershipEntity,
        actorUserId: UUID,
        genderRaw: String?,
    ): SeasonParticipantAdminDto {
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val carnetEmail =
            carnet.user?.email?.let { participantLink.normalizeEmail(it) } ?: carnet.normalizedEmail
        existing.displayName = carnet.displayName
        existing.normalizedEmail = carnetEmail
        existing.user = carnet.user
        existing.troupeMembership = carnet
        existing.invitationScope = InvitationScope.SEASON
        ParticipantGenderWriteSupport.applyGenderFromRequest(existing, carnet.user, genderRaw)
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
    fun upsertEventScopedSeasonRow(
        season: SeasonEntity,
        carnet: TroupeMembershipEntity,
        actorUserId: UUID,
    ): SeasonParticipantEntity {
        val carnetEmail =
            carnet.user?.email?.let { participantLink.normalizeEmail(it) } ?: carnet.normalizedEmail
        val removed =
            seasonParticipantRepository.findBySeason_IdAndStatusAndTroupeMembership_Id(
                season.id,
                ParticipantStatus.REMOVED,
                carnet.id,
            )
        val now = Instant.now()
        if (removed != null) {
            removed.displayName = carnet.displayName
            removed.normalizedEmail = carnetEmail
            removed.user = carnet.user
            removed.troupeMembership = carnet
            removed.invitationScope = InvitationScope.EVENT
            removed.status = ParticipantStatus.ACTIVE
            removed.removedAt = null
            removed.removalSource = null
            removed.updatedAt = now
            val saved = seasonParticipantRepository.save(removed)
            refreshParticipantCount(season)
            MembershipParticipantSyncCache.invalidate(season.id)
            return saved
        }
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembership_Id(
                season.id,
                ParticipantStatus.ACTIVE,
                carnet.id,
            )
            ?.let { return it }
        val saved =
            seasonParticipantRepository.save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = carnet.displayName,
                    normalizedEmail = carnetEmail,
                    user = carnet.user,
                    troupeMembership = carnet,
                    invitationScope = InvitationScope.EVENT,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        refreshParticipantCount(season)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SEASON_PARTICIPANT_ADDED,
                actorUserId = actorUserId,
                subjectSeasonParticipantId = saved.id,
                troupeId = season.troupe.id,
                seasonId = season.id,
                after = AuditSnapshots.seasonParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return saved
    }

    private fun reactivateRemoved(
        season: SeasonEntity,
        existing: SeasonParticipantEntity,
        requestedDisplayName: String,
        requestedEmail: String?,
        linkedUser: UserEntity?,
        actorUserId: UUID,
        genderRaw: String? = null,
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
        ParticipantGenderWriteSupport.applyGenderFromRequest(existing, existing.user, genderRaw)
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
        val membership = existing.troupeMembership
        if (membership != null && membership.baselineRole != TroupeBaselineRole.EXTERNE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Les participants synchronisés depuis les membres ne peuvent pas être modifiés ici.")
        }
        val beforeSnapshot = AuditSnapshots.seasonParticipant(existing)
        val displayName = body.displayName.trim()
        if (displayName.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'affichage requis.")
        }
        if (membership?.baselineRole == TroupeBaselineRole.EXTERNE) {
            val normalizedEmail = participantLink.normalizeEmail(body.email)
            if (
                displayName != existing.displayName ||
                    normalizedEmail != existing.normalizedEmail
            ) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Modifiez le carnet externe pour le nom ou l'email.",
                )
            }
            ParticipantGenderWriteSupport.applyGenderFromRequest(existing, existing.user, body.gender)
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
        ParticipantGenderWriteSupport.applyGenderFromRequest(existing, existing.user, body.gender)
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
        if (
            seasonParticipantRepository.existsBySeason_IdAndStatusAndDisplayNameIgnoreCaseAndIdNot(
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
        if (membership != null) {
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
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
        if (membership != null) {
            val currentMembership =
                troupeMembershipRepository.findByIdAndTroupe_Id(membership.id, season.troupe.id)
            if (
                currentMembership != null &&
                    currentMembership.status != TroupeMembershipStatus.ACTIVE
            ) {
                saved.status = ParticipantStatus.REMOVED
                saved.removedAt = now
                saved.removalSource = SeasonParticipantRemovalSource.MEMBERSHIP_INACTIVE
                saved.updatedAt = now
                seasonParticipantRepository.save(saved)
                refreshParticipantCount(season)
                MembershipParticipantSyncCache.invalidate(season.id)
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "L'adhésion à la troupe a été désactivée entre-temps.",
                )
            }
        }
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

    private fun selectorAvatarUrl(user: UserEntity?): String? =
        ParticipantRowPresentation.avatarUrl(avatarService, user)
}

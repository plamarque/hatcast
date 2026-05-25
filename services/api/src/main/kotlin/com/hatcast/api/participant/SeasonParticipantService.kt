package com.hatcast.api.participant

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.dto.ParticipantCreateRequest
import com.hatcast.api.participant.dto.ParticipantSelectorDto
import com.hatcast.api.participant.dto.ParticipantUpdateRequest
import com.hatcast.api.participant.dto.SeasonParticipantAdminDto
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
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
            .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
            .map { SeasonParticipantAdminDto.from(it, includeEmail) }
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
            .filter { row ->
                row.troupeMembership == null ||
                    row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
            }.map { row ->
                val avatarUrl =
                    row.user?.let { user ->
                        AvatarService.publicAvatarUrl(user.id, user.avatarUpdatedAt)
                    }
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
        if (
            seasonParticipantRepository.existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCase(
                seasonId,
                ParticipantStatus.ACTIVE,
                displayName,
            )
        ) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Un participant avec ce nom existe déjà dans la saison.")
        }
        val normalizedEmail = participantLink.normalizeEmail(body.email)
        val linkedUser = participantLink.resolveUserId(normalizedEmail)?.let { userRepository.findById(it).orElse(null) }
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
        if (existing.troupeMembership != null) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Retirez ce membre depuis l'écran Membres.",
            )
        }
        val now = Instant.now()
        existing.status = ParticipantStatus.REMOVED
        existing.removedAt = now
        existing.updatedAt = now
        seasonParticipantRepository.save(existing)
        refreshParticipantCount(season)
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
        val allMemberships =
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                troupeId,
                listOf(TroupeMembershipStatus.ACTIVE, TroupeMembershipStatus.INACTIVE),
            )
        val membershipIds = allMemberships.map { it.id }
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
        for (membership in allMemberships) {
            val normalizedEmail = participantLink.normalizeEmail(membership.user.email)
            val existing = existingByMembershipId[membership.id]
            if (existing != null) {
                if (
                    existing.displayName == membership.displayName &&
                        existing.user?.id == membership.user.id &&
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
        if (toSave.isNotEmpty()) {
            seasonParticipantRepository.saveAll(toSave)
            refreshParticipantCount(season)
            MembershipParticipantSyncCache.invalidate(season.id)
        } else if (
            allMemberships.isNotEmpty() &&
                existingByMembershipId.keys.containsAll(membershipIds)
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
}

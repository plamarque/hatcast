package com.hatcast.api.season

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.season.dto.CreateSeasonRequest
import com.hatcast.api.season.dto.PagedSeasonsResponse
import com.hatcast.api.season.dto.PlatformAdminSeasonResolutionDto
import com.hatcast.api.season.dto.SeasonResponseDto
import com.hatcast.api.season.dto.UpdateSeasonRequest
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.troupe.dto.TroupeAdminSummaryDto
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class SeasonService(
    private val seasonRepository: SeasonRepository,
    private val troupeRepository: TroupeRepository,
    private val troupeAccess: TroupeAccessService,
    private val seasonAccess: SeasonAccessService,
    private val platformAdminService: PlatformAdminService,
    private val guestInvitationAccess: GuestInvitationAccessService,
) {
    private val log = LoggerFactory.getLogger(SeasonService::class.java)
    @Transactional(readOnly = true)
    fun listForTroupe(
        troupeId: UUID,
        page: Int,
        size: Int,
        principal: SessionUserPrincipal,
    ): PagedSeasonsResponse {
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val isMember =
            platformAdminService.isPlatformAdmin(principal) ||
                guestInvitationAccess.isActiveTroupeMember(principal.userId, troupeId)
        if (isMember) {
            if (!platformAdminService.isPlatformAdmin(principal)) {
                troupeAccess.requireActiveMember(principal, troupeId)
            }
            val pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            val p = seasonRepository.findAllByTroupeId(troupeId, pr)
            return PagedSeasonsResponse(
                content = p.content.map { SeasonResponseDto.from(it) },
                page = p.number,
                size = p.size,
                totalElements = p.totalElements,
                totalPages = p.totalPages,
            )
        }
        val invited = seasonRepository.findInvitedForUserInTroupe(troupeId, principal.userId)
        if (invited.isEmpty()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette troupe.")
        }
        val content =
            invited.map { season ->
                val workspaceMode = guestInvitationAccess.resolveSeasonReadAccess(season.id, principal)
                SeasonResponseDto.from(season, guestSeasonWorkspaceMode = workspaceMode)
            }
        return PagedSeasonsResponse(
            content = content,
            page = 0,
            size = content.size,
            totalElements = content.size.toLong(),
            totalPages = if (content.isEmpty()) 0 else 1,
        )
    }

    @Transactional
    fun create(
        troupeId: UUID,
        body: CreateSeasonRequest,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        validateDateRange(body.startDate, body.endDate)
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val titleTrim = body.title.trim()
        val base = SeasonSlugGenerator.slugify(titleTrim)
        if (base.isEmpty()) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le titre ne permet pas de générer un identifiant URL.",
            )
        }
        val uniqueSlug =
            SeasonSlugGenerator.allocateUniqueSlug(troupeId, base, seasonRepository, null)
        val now = Instant.now()
        val entity =
            SeasonEntity(
                troupe = troupe,
                slug = uniqueSlug,
                title = titleTrim,
                description = body.description?.trim()?.takeIf { it.isNotEmpty() },
                startDate = body.startDate,
                endDate = body.endDate,
                archived = false,
                isActive = false,
                eventCount = 0,
                participantCount = 0,
                createdAt = now,
                updatedAt = now,
            )
        return SeasonResponseDto.from(seasonRepository.save(entity))
    }

    @Transactional(readOnly = true)
    fun getById(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        val workspaceMode = guestInvitationAccess.resolveSeasonReadAccess(seasonId, principal)
        return SeasonResponseDto.from(s, guestSeasonWorkspaceMode = workspaceMode)
    }

    @Transactional(readOnly = true)
    fun getByTroupeIdAndSlug(
        troupeId: UUID,
        slug: String,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        val s =
            seasonRepository.findByTroupe_IdAndSlug(troupeId, slug)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue")
        val workspaceMode = guestInvitationAccess.resolveSeasonReadAccess(s.id, principal)
        return SeasonResponseDto.from(s, guestSeasonWorkspaceMode = workspaceMode)
    }

    /**
     * Résolution directe par slugs pour les invités sans adhésion troupe dans [listMyTroupes]
     * (carnet EXTERNE exclu de la liste — ADR-0021).
     */
    @Transactional(readOnly = true)
    fun resolveByTroupeSlugAndSeasonSlug(
        troupeSlug: String,
        seasonSlug: String,
        principal: SessionUserPrincipal,
    ): PlatformAdminSeasonResolutionDto {
        val normalizedTroupeSlug = troupeSlug.trim()
        val normalizedSeasonSlug = seasonSlug.trim()
        if (normalizedTroupeSlug.isEmpty() || normalizedSeasonSlug.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug troupe ou saison invalide.")
        }
        val troupe =
            troupeRepository.findBySlug(normalizedTroupeSlug)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        val season =
            seasonRepository.findByTroupe_IdAndSlug(troupe.id, normalizedSeasonSlug)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue")
        val workspaceMode = guestInvitationAccess.resolveSeasonReadAccess(season.id, principal)
        return PlatformAdminSeasonResolutionDto(
            troupe = TroupeAdminSummaryDto.from(troupe),
            season = SeasonResponseDto.from(season, guestSeasonWorkspaceMode = workspaceMode),
        )
    }

    @Transactional(readOnly = true)
    fun resolveBySlugForPlatformAdmin(
        slug: String,
        principal: SessionUserPrincipal,
    ): List<PlatformAdminSeasonResolutionDto> {
        if (!platformAdminService.isPlatformAdmin(principal)) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Accès réservé aux administrateurs de la plateforme.",
            )
        }
        val normalized = slug.trim()
        if (normalized.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug de saison invalide.")
        }
        val seasons = seasonRepository.findAllBySlug(normalized)
        if (seasons.isEmpty()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue")
        }
        return seasons.map { season ->
            PlatformAdminSeasonResolutionDto(
                troupe = TroupeAdminSummaryDto.from(season.troupe),
                season = SeasonResponseDto.from(season),
            )
        }
    }

    @Transactional
    fun update(
        seasonId: UUID,
        body: UpdateSeasonRequest,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(principal, s.troupe.id)
        if (body.title.isPresent) {
            val rawTitle = body.title.get()
            if (rawTitle == null) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le titre ne peut pas être effacé.",
                )
            }
            val newTitle = rawTitle.trim()
            if (newTitle.isEmpty()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre ne peut pas être vide.")
            }
            if (newTitle.length > 255) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "title trop long (max 255).")
            }
            if (newTitle != s.title) {
                s.title = newTitle
                val base = SeasonSlugGenerator.slugify(newTitle)
                if (base.isEmpty()) {
                    throw ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Le titre ne permet pas de générer un identifiant URL.",
                    )
                }
                s.slug =
                    SeasonSlugGenerator.allocateUniqueSlug(
                        s.troupe.id,
                        base,
                        seasonRepository,
                        s.id,
                    )
            }
        }
        if (body.description.isPresent) {
            val raw = body.description.get()
            if (raw == null) {
                s.description = null
            } else {
                if (raw.length > 4000) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "description trop longue (max 4000).")
                }
                s.description = raw.trim().takeIf { it.isNotEmpty() }
            }
        }
        if (body.startDate.isPresent || body.endDate.isPresent) {
            val start = if (body.startDate.isPresent) body.startDate.get() else s.startDate
            val end = if (body.endDate.isPresent) body.endDate.get() else s.endDate
            validateDateRange(start, end)
            if (body.startDate.isPresent) s.startDate = body.startDate.get()
            if (body.endDate.isPresent) s.endDate = body.endDate.get()
        }
        s.updatedAt = Instant.now()
        return SeasonResponseDto.from(seasonRepository.save(s))
    }

    @Transactional
    fun archive(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(principal, s.troupe.id)
        s.archived = true
        s.isActive = false
        s.updatedAt = Instant.now()
        return SeasonResponseDto.from(seasonRepository.save(s))
    }

    @Transactional
    fun activate(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(principal, s.troupe.id)
        if (s.archived) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Impossible d'activer une saison archivée. Désarchivez-la d'abord.",
            )
        }
        val now = Instant.now()
        seasonRepository.deactivateAllActiveInTroupe(s.troupe.id, now)
        s.isActive = true
        s.updatedAt = now
        return SeasonResponseDto.from(seasonRepository.save(s))
    }

    @Transactional
    fun delete(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        seasonAccess.requireCanDeleteSeason(principal, s.troupe.id)
        val actorUserId = principal.userId
        val deletedSeasonId = s.id
        val troupeId = s.troupe.id
        val title = s.title
        val eventCount = s.eventCount
        val participantCount = s.participantCount
        TransactionSynchronizationManager.registerSynchronization(
            object : TransactionSynchronization {
                override fun afterCommit() {
                    log.info(
                        "Season deleted: userId={}, seasonId={}, troupeId={}, title={}, eventCount={}, participantCount={}, timestamp={}",
                        actorUserId,
                        deletedSeasonId,
                        troupeId,
                        title,
                        eventCount,
                        participantCount,
                        Instant.now(),
                    )
                }
            },
        )
        seasonRepository.delete(s)
    }

    private fun validateDateRange(
        start: java.time.LocalDate?,
        end: java.time.LocalDate?,
    ) {
        if (start != null && end != null && end.isBefore(start)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "endDate avant startDate")
        }
    }
}

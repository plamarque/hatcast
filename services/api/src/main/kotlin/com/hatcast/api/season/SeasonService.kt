package com.hatcast.api.season

import com.hatcast.api.season.dto.CreateSeasonRequest
import com.hatcast.api.season.dto.PagedSeasonsResponse
import com.hatcast.api.season.dto.SeasonResponseDto
import com.hatcast.api.season.dto.UpdateSeasonRequest
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class SeasonService(
    private val seasonRepository: SeasonRepository,
    private val troupeRepository: TroupeRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun listForTroupe(
        troupeId: UUID,
        page: Int,
        size: Int,
    ): PagedSeasonsResponse {
        troupeAccess.requireCanManageTroupe(troupeId)
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
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

    @Transactional
    fun create(
        troupeId: UUID,
        body: CreateSeasonRequest,
    ): SeasonResponseDto {
        troupeAccess.requireCanManageTroupe(troupeId)
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
    fun getById(seasonId: UUID): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(s.troupe.id)
        return SeasonResponseDto.from(s)
    }

    @Transactional
    fun update(
        seasonId: UUID,
        body: UpdateSeasonRequest,
    ): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(s.troupe.id)
        val newTitle = body.title?.trim()?.takeIf { it.isNotEmpty() }
        if (newTitle != null && newTitle != s.title) {
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
        if (body.description != null) {
            s.description = body.description.trim().takeIf { it.isNotEmpty() }
        }
        if (body.startDate != null || body.endDate != null) {
            val start = body.startDate ?: s.startDate
            val end = body.endDate ?: s.endDate
            validateDateRange(start, end)
            if (body.startDate != null) s.startDate = body.startDate
            if (body.endDate != null) s.endDate = body.endDate
        }
        s.updatedAt = Instant.now()
        return SeasonResponseDto.from(seasonRepository.save(s))
    }

    @Transactional
    fun archive(seasonId: UUID): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(s.troupe.id)
        s.archived = true
        s.isActive = false
        s.updatedAt = Instant.now()
        return SeasonResponseDto.from(seasonRepository.save(s))
    }

    @Transactional
    fun activate(seasonId: UUID): SeasonResponseDto {
        val s =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(s.troupe.id)
        val now = Instant.now()
        seasonRepository.deactivateAllActiveInTroupe(s.troupe.id, now)
        s.archived = false
        s.isActive = true
        s.updatedAt = now
        return SeasonResponseDto.from(seasonRepository.save(s))
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

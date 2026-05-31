package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.CategorySlugNormalizer
import com.hatcast.api.troupe.dto.TroupeCategoryDto
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class TroupeCategoryService(
    private val troupeRepository: TroupeRepository,
    private val troupeCategoryRepository: TroupeCategoryRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun listForTroupe(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): List<TroupeCategoryDto> {
        requireTroupeExists(troupeId)
        troupeAccess.requireActiveMember(principal, troupeId)
        return troupeCategoryRepository
            .findByTroupe_IdOrderByLabelAsc(troupeId)
            .map { TroupeCategoryDto.from(it) }
    }

    /**
     * Normalise [rawInput], crée l'entrée glossaire si absente (label conservé si déjà présent).
     * @return slug canonique
     */
    @Transactional
    fun ensureTag(
        troupeId: UUID,
        rawInput: String,
    ): String {
        val slug = CategorySlugNormalizer.normalizeSlug(rawInput)
        if (troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, slug)) {
            return slug
        }
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val entity =
            TroupeCategoryEntity(
                troupe = troupe,
                slug = slug,
                label = CategorySlugNormalizer.labelForAutoCreate(rawInput),
            )
        return try {
            troupeCategoryRepository.saveAndFlush(entity)
            slug
        } catch (ex: DataIntegrityViolationException) {
            troupeCategoryRepository.findByTroupe_IdAndSlug(troupeId, slug)?.let { return slug }
            throw ex
        }
    }

    private fun requireTroupeExists(troupeId: UUID) {
        if (!troupeRepository.existsById(troupeId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        }
    }
}

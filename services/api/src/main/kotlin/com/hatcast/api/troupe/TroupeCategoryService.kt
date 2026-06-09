package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.CategorySlugNormalizer
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.troupe.dto.CategoryDeletePreviewDto
import com.hatcast.api.troupe.dto.CategoryDeleteResultDto
import com.hatcast.api.troupe.dto.CreateTroupeCategoryRequest
import com.hatcast.api.troupe.dto.TroupeCategoryDto
import com.hatcast.api.troupe.dto.UpdateTroupeCategoryLabelRequest
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
    private val eventRepository: EventRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional
    fun listForTroupe(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): List<TroupeCategoryDto> {
        requireTroupeExists(troupeId)
        troupeAccess.requireActiveMember(principal, troupeId)
        ensureDeplacementsSeed(troupeId)
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val glossary =
            troupeCategoryRepository
                .findByTroupe_IdOrderByLabelAsc(troupeId)
                .filter { it.slug !in HIDDEN_SLUGS }
                .map { TroupeCategoryDto.from(it) }
        return listOf(defaultCategoryDto(troupe)) + glossary
    }

    @Transactional
    fun createCategory(
        troupeId: UUID,
        request: CreateTroupeCategoryRequest,
        principal: SessionUserPrincipal,
    ): TroupeCategoryDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        val label = validateLabel(request.label.trim())
        val slug =
            if (request.slug != null) {
                CategorySlugNormalizer.normalizeSlug(request.slug)
            } else {
                CategorySlugNormalizer.normalizeSlug(label)
            }
        rejectReservedCategorySlug(slug)
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val entity =
            TroupeCategoryEntity(
                troupe = troupe,
                slug = slug,
                label = label,
            )
        return try {
            TroupeCategoryDto.from(troupeCategoryRepository.saveAndFlush(entity))
        } catch (ex: DataIntegrityViolationException) {
            troupeCategoryRepository.findByTroupe_IdAndSlug(troupeId, slug)?.let {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Cette catégorie existe déjà.")
            }
            throw ex
        }
    }

    @Transactional
    fun updateLabel(
        troupeId: UUID,
        slug: String,
        request: UpdateTroupeCategoryLabelRequest,
        principal: SessionUserPrincipal,
    ): TroupeCategoryDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        val label = validateLabel(request.label.trim())
        if (isDefaultCategorySlug(slug)) {
            val troupe =
                troupeRepository
                    .findById(troupeId)
                    .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
            troupe.defaultCategoryLabel = label
            troupeRepository.save(troupe)
            return defaultCategoryDto(troupe)
        }
        val entity = requireCategoryEntity(troupeId, slug)
        entity.label = label
        return TroupeCategoryDto.from(troupeCategoryRepository.save(entity))
    }

    @Transactional(readOnly = true)
    fun deletePreview(
        troupeId: UUID,
        slug: String,
        principal: SessionUserPrincipal,
    ): CategoryDeletePreviewDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        rejectDefaultCategoryMutation(slug)
        requireCategoryEntity(troupeId, slug)
        val count = eventRepository.countByTroupeIdAndCategory(troupeId, slug)
        return CategoryDeletePreviewDto(eventCount = count)
    }

    @Transactional
    fun deleteCategory(
        troupeId: UUID,
        slug: String,
        principal: SessionUserPrincipal,
    ): CategoryDeleteResultDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        rejectDefaultCategoryMutation(slug)
        val entity = requireCategoryEntity(troupeId, slug)
        val count = eventRepository.countByTroupeIdAndCategory(troupeId, slug)
        eventRepository.clearCategoryForTroupe(troupeId, slug)
        troupeCategoryRepository.delete(entity)
        return CategoryDeleteResultDto(affectedEventCount = count)
    }

    /**
     * Normalise [raw], vérifie l'existence dans le glossaire troupe.
     * @return slug canonique
     */
    @Transactional
    fun requireExistingCategory(
        troupeId: UUID,
        raw: String,
    ): String {
        ensureDeplacementsSeed(troupeId)
        val slug = CategorySlugNormalizer.normalizeSlug(raw)
        if (!troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, slug)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Catégorie inconnue.")
        }
        return slug
    }

    private fun ensureDeplacementsSeed(troupeId: UUID) {
        if (troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, DEPLACEMENTS_SLUG)) {
            return
        }
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val entity =
            TroupeCategoryEntity(
                troupe = troupe,
                slug = DEPLACEMENTS_SLUG,
                label = DEPLACEMENTS_LABEL,
            )
        try {
            troupeCategoryRepository.saveAndFlush(entity)
        } catch (_: DataIntegrityViolationException) {
            // Idempotent race: another request inserted deplacements concurrently.
        }
    }

    private fun requireCategoryEntity(
        troupeId: UUID,
        slug: String,
    ): TroupeCategoryEntity {
        val normalized = CategorySlugNormalizer.normalizeSlug(slug)
        return troupeCategoryRepository.findByTroupe_IdAndSlug(troupeId, normalized)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Catégorie introuvable.")
    }

    private fun requireTroupeExists(troupeId: UUID) {
        if (!troupeRepository.existsById(troupeId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        }
    }

    private fun defaultCategoryDto(troupe: TroupeEntity): TroupeCategoryDto =
        TroupeCategoryDto(
            slug = DEFAULT_CATEGORY_SLUG,
            label = troupe.defaultCategoryLabel,
        )

    private fun isDefaultCategorySlug(slug: String): Boolean =
        slug.trim().lowercase() == DEFAULT_CATEGORY_SLUG

    private fun rejectDefaultCategoryMutation(slug: String) {
        if (isDefaultCategorySlug(slug)) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La catégorie par défaut ne peut pas être supprimée.",
            )
        }
    }

    private fun rejectReservedCategorySlug(slug: String) {
        if (slug in HIDDEN_SLUGS) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cet identifiant est réservé.",
            )
        }
    }

    private fun validateLabel(label: String): String {
        if (label.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le libellé ne peut pas être vide.")
        }
        if (label.length > MAX_CATEGORY_LABEL_LENGTH) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le libellé ne peut pas dépasser $MAX_CATEGORY_LABEL_LENGTH caractères.",
            )
        }
        return label
    }

    companion object {
        const val DEPLACEMENTS_SLUG = "deplacements"
        const val DEPLACEMENTS_LABEL = "Déplacements"
        const val DEFAULT_CATEGORY_SLUG = SpectacleCategory.PRINCIPAL
        private const val MAX_CATEGORY_LABEL_LENGTH = 128
        private val HIDDEN_SLUGS = setOf(DEFAULT_CATEGORY_SLUG, "main")
    }
}

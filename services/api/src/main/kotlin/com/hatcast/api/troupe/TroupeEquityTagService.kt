package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EquityTagNormalizer
import com.hatcast.api.troupe.dto.TroupeEquityTagDto
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class TroupeEquityTagService(
    private val troupeRepository: TroupeRepository,
    private val troupeEquityTagRepository: TroupeEquityTagRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun listForTroupe(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): List<TroupeEquityTagDto> {
        requireTroupeExists(troupeId)
        troupeAccess.requireActiveMember(principal, troupeId)
        return troupeEquityTagRepository
            .findByTroupe_IdOrderByLabelAsc(troupeId)
            .map { TroupeEquityTagDto.from(it) }
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
        val slug = EquityTagNormalizer.normalizeSlug(rawInput)
        if (troupeEquityTagRepository.existsByTroupe_IdAndSlug(troupeId, slug)) {
            return slug
        }
        val troupe =
            troupeRepository
                .findById(troupeId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue") }
        val entity =
            TroupeEquityTagEntity(
                troupe = troupe,
                slug = slug,
                label = EquityTagNormalizer.labelForAutoCreate(rawInput),
            )
        return try {
            troupeEquityTagRepository.saveAndFlush(entity)
            slug
        } catch (ex: DataIntegrityViolationException) {
            troupeEquityTagRepository.findByTroupe_IdAndSlug(troupeId, slug)?.let { return slug }
            throw ex
        }
    }

    private fun requireTroupeExists(troupeId: UUID) {
        if (!troupeRepository.existsById(troupeId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        }
    }
}

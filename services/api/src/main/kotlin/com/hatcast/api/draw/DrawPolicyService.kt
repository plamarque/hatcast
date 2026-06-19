package com.hatcast.api.draw

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.draw.dto.DrawPolicyDto
import com.hatcast.api.draw.dto.UpsertDrawPolicyRequest
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class DrawPolicyService(
    private val drawPolicyRepository: DrawPolicyRepository,
    private val drawPolicyValidator: DrawPolicyValidator,
    private val seasonRepository: SeasonRepository,
    private val troupeRepository: TroupeRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun getTroupePolicy(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): DrawPolicyDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        val entity =
            drawPolicyRepository.findByTroupeIdAndScope(troupeId, DrawPolicyScope.TROUPE)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Politique de tirage introuvable")
        return DrawPolicyDto.from(entity)
    }

    @Transactional
    fun upsertTroupePolicy(
        troupeId: UUID,
        request: UpsertDrawPolicyRequest,
        principal: SessionUserPrincipal,
    ): DrawPolicyDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        validateRequest(troupeId, request)
        val now = Instant.now()
        val existing = drawPolicyRepository.findByTroupeIdAndScope(troupeId, DrawPolicyScope.TROUPE)
        val entity =
            existing
                ?: DrawPolicyEntity(
                    troupeId = troupeId,
                    seasonId = null,
                    scope = DrawPolicyScope.TROUPE,
                    troupeScopeKey = troupeId,
                    seasonScopeKey = null,
                    defaultRule = request.defaultRule,
                    categoryRules = request.categoryRules,
                    updatedAt = now,
                )
        entity.defaultRule = request.defaultRule
        entity.categoryRules = request.categoryRules
        entity.updatedAt = now
        return DrawPolicyDto.from(drawPolicyRepository.save(entity))
    }

    @Transactional(readOnly = true)
    fun getSeasonPolicy(
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): DrawPolicyDto {
        val season = requireSeason(seasonId)
        troupeAccess.requireTroupeAdmin(principal, season.troupe.id)
        val entity =
            drawPolicyRepository.findBySeasonIdAndScope(seasonId, DrawPolicyScope.SEASON)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Politique de tirage introuvable")
        return DrawPolicyDto.from(entity)
    }

    @Transactional
    fun upsertSeasonPolicy(
        seasonId: UUID,
        request: UpsertDrawPolicyRequest,
        principal: SessionUserPrincipal,
    ): DrawPolicyDto {
        val season = requireSeason(seasonId)
        val troupeId = season.troupe.id
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        validateRequest(troupeId, request)
        val now = Instant.now()
        val existing = drawPolicyRepository.findBySeasonIdAndScope(seasonId, DrawPolicyScope.SEASON)
        val entity =
            existing
                ?: DrawPolicyEntity(
                    troupeId = troupeId,
                    seasonId = seasonId,
                    scope = DrawPolicyScope.SEASON,
                    troupeScopeKey = null,
                    seasonScopeKey = seasonId,
                    defaultRule = request.defaultRule,
                    categoryRules = request.categoryRules,
                    updatedAt = now,
                )
        entity.defaultRule = request.defaultRule
        entity.categoryRules = request.categoryRules
        entity.updatedAt = now
        return DrawPolicyDto.from(drawPolicyRepository.save(entity))
    }

    private fun validateRequest(
        troupeId: UUID,
        request: UpsertDrawPolicyRequest,
    ) {
        try {
            drawPolicyValidator.validatePolicyPayload(
                troupeId,
                request.defaultRule,
                request.categoryRules,
            )
        } catch (ex: DrawPolicyValidationException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, ex.message)
        }
    }

    private fun requireTroupeExists(troupeId: UUID) {
        if (!troupeRepository.existsById(troupeId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe introuvable")
        }
    }

    private fun requireSeason(seasonId: UUID) =
        seasonRepository
            .findById(seasonId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
}

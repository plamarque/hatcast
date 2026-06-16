package com.hatcast.api.draw

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.draw.dto.CreateDrawFormulaRequest
import com.hatcast.api.draw.dto.DrawFormulaDto
import com.hatcast.api.draw.dto.UpdateDrawFormulaRequest
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class DrawFormulaService(
    private val drawFormulaRepository: DrawFormulaRepository,
    private val drawFormulaSeedService: DrawFormulaSeedService,
    private val drawFormulaValidator: DrawFormulaValidator,
    private val policyReferenceService: DrawFormulaPolicyReferenceService,
    private val troupeRepository: TroupeRepository,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional
    fun list(
        troupeId: UUID,
        principal: SessionUserPrincipal,
    ): List<DrawFormulaDto> {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        return drawFormulaRepository
            .findByTroupeIdOrderByNameAsc(troupeId)
            .map { DrawFormulaDto.from(it) }
    }

    @Transactional
    fun get(
        troupeId: UUID,
        formulaId: UUID,
        principal: SessionUserPrincipal,
    ): DrawFormulaDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        return DrawFormulaDto.from(requireFormulaEntity(troupeId, formulaId))
    }

    @Transactional
    fun create(
        troupeId: UUID,
        request: CreateDrawFormulaRequest,
        principal: SessionUserPrincipal,
    ): DrawFormulaDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        val name = validateName(request.name.trim())
        val status = request.status ?: DrawFormulaStatus.DRAFT
        if (status == DrawFormulaStatus.ARCHIVED) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le statut ARCHIVED n'est pas autorisé à la création",
            )
        }
        val factorConfig = request.factorConfig ?: emptyList()
        validateFactorConfigForStatus(factorConfig, status)
        val now = Instant.now()
        val entity =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    troupeId = troupeId,
                    name = name,
                    description = request.description?.trim()?.takeIf { it.isNotEmpty() },
                    status = status,
                    factorConfig = factorConfig,
                    version = 1,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        return DrawFormulaDto.from(entity)
    }

    @Transactional
    fun update(
        troupeId: UUID,
        formulaId: UUID,
        request: UpdateDrawFormulaRequest,
        principal: SessionUserPrincipal,
    ): DrawFormulaDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        val entity = requireFormulaEntity(troupeId, formulaId)
        rejectSystemMutation(entity)
        val nextStatus = request.status ?: entity.status
        if (nextStatus == DrawFormulaStatus.ARCHIVED && entity.status != DrawFormulaStatus.ARCHIVED) {
            rejectIfPolicyReferenced(troupeId, formulaId)
        }
        val nextFactorConfig = request.factorConfig ?: entity.factorConfig
        validateFactorConfigForStatus(nextFactorConfig, nextStatus)
        request.name?.trim()?.let { entity.name = validateName(it) }
        if (request.description != null) {
            entity.description = request.description.trim().takeIf { it.isNotEmpty() }
        }
        entity.status = nextStatus
        entity.factorConfig = nextFactorConfig
        entity.version += 1
        entity.updatedAt = Instant.now()
        return DrawFormulaDto.from(drawFormulaRepository.save(entity))
    }

    @Transactional
    fun archive(
        troupeId: UUID,
        formulaId: UUID,
        principal: SessionUserPrincipal,
    ): DrawFormulaDto {
        requireTroupeExists(troupeId)
        troupeAccess.requireTroupeAdmin(principal, troupeId)
        val entity = requireFormulaEntity(troupeId, formulaId)
        rejectSystemMutation(entity)
        if (entity.status == DrawFormulaStatus.ARCHIVED) {
            return DrawFormulaDto.from(entity)
        }
        rejectIfPolicyReferenced(troupeId, formulaId)
        entity.status = DrawFormulaStatus.ARCHIVED
        entity.version += 1
        entity.updatedAt = Instant.now()
        return DrawFormulaDto.from(drawFormulaRepository.save(entity))
    }

    private fun rejectIfPolicyReferenced(
        troupeId: UUID,
        formulaId: UUID,
    ) {
        if (policyReferenceService.isFormulaReferenced(troupeId, formulaId)) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Formule utilisée par une politique de tirage",
            )
        }
    }

    private fun requireFormulaEntity(
        troupeId: UUID,
        formulaId: UUID,
    ): DrawFormulaEntity =
        drawFormulaRepository.findByIdAndTroupeId(formulaId, troupeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Formule de tirage introuvable")

    private fun requireTroupeExists(troupeId: UUID) {
        if (!troupeRepository.existsById(troupeId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        }
    }

    private fun rejectSystemMutation(entity: DrawFormulaEntity) {
        if (entity.isSystem) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Les formules système ne peuvent pas être modifiées",
            )
        }
    }

    private fun validateName(name: String): String {
        if (name.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom ne peut pas être vide")
        }
        if (name.length > MAX_NAME_LENGTH) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le nom ne peut pas dépasser $MAX_NAME_LENGTH caractères",
            )
        }
        return name
    }

    private fun validateFactorConfigForStatus(
        factorConfig: DrawFactorConfig,
        status: DrawFormulaStatus,
    ) {
        try {
            when (status) {
                DrawFormulaStatus.PUBLISHED -> drawFormulaValidator.validateForPublish(factorConfig)
                DrawFormulaStatus.DRAFT, DrawFormulaStatus.ARCHIVED ->
                    drawFormulaValidator.validateForSave(factorConfig)
            }
        } catch (ex: DrawFormulaValidationException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, ex.message)
        }
    }

    companion object {
        private const val MAX_NAME_LENGTH = 255
    }
}

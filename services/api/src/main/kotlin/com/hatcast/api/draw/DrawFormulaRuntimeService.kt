package com.hatcast.api.draw

import com.hatcast.api.availability.draw.DrawWeightPipeline
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class DrawFormulaRuntimeService(
    private val drawFormulaRepository: DrawFormulaRepository,
    private val drawFormulaSeedService: DrawFormulaSeedService,
    private val drawFormulaPipelineAssembler: DrawFormulaPipelineAssembler,
) {
    @Transactional(readOnly = true)
    fun assemblePipelineForFormula(
        troupeId: UUID,
        formulaId: UUID,
    ): DrawWeightPipeline {
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        val entity =
            drawFormulaRepository.findByIdAndTroupeId(formulaId, troupeId)
                ?: throw DrawFormulaNotAvailableException("Formule introuvable : $formulaId")
        if (entity.status != DrawFormulaStatus.PUBLISHED) {
            throw DrawFormulaNotAvailableException(
                "Formule $formulaId indisponible (statut ${entity.status})",
            )
        }
        return drawFormulaPipelineAssembler.assemble(entity.factorConfig)
    }

    @Transactional(readOnly = true)
    fun loadFormulaName(
        troupeId: UUID,
        formulaId: UUID,
    ): String? =
        drawFormulaRepository.findByIdAndTroupeId(formulaId, troupeId)?.name

    @Transactional(readOnly = true)
    fun isPublishedFormula(
        troupeId: UUID,
        formulaId: UUID,
    ): Boolean {
        if (formulaId == DrawFormulaIds.systemV1(troupeId)) {
            return true
        }
        return drawFormulaRepository.findByIdAndTroupeId(formulaId, troupeId)?.status ==
            DrawFormulaStatus.PUBLISHED
    }

    @Transactional(readOnly = true)
    fun resolvePublishedFormulaOrNull(
        troupeId: UUID,
        formulaId: UUID,
    ): UUID? = if (isPublishedFormula(troupeId, formulaId)) formulaId else null
}

class DrawFormulaNotAvailableException(
    message: String,
) : IllegalStateException(message)

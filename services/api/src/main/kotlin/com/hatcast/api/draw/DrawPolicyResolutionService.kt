package com.hatcast.api.draw

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class DrawPolicyResolutionService(
    private val drawFormulaRepository: DrawFormulaRepository,
    private val drawFormulaSeedService: DrawFormulaSeedService,
) {
    @Transactional
    fun resolveImplicitDefault(troupeId: UUID): ResolvedDrawRule {
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        val systemV1Id = DrawFormulaIds.systemV1(troupeId)
        val publishedNonSystemIds =
            drawFormulaRepository
                .findByTroupeIdAndStatusOrderByNameAsc(troupeId, DrawFormulaStatus.PUBLISHED)
                .filter { !it.isSystem }
                .map { it.id }
        val allowedFormulaIds = publishedNonSystemIds + systemV1Id
        val selectorVisible = allowedFormulaIds.size >= 2
        val effectiveFormulaId = if (!selectorVisible) systemV1Id else null
        return ResolvedDrawRule(
            policySource = DrawPolicySource.IMPLICIT,
            resolvedMode = DrawRuleMode.CHOICE,
            allowedFormulaIds = allowedFormulaIds,
            categoryRules = emptyList(),
            selectorVisible = selectorVisible,
            effectiveFormulaId = effectiveFormulaId,
        )
    }
}

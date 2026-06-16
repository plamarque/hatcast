package com.hatcast.api.draw

import org.springframework.stereotype.Service
import java.util.UUID

@Service
class DrawFormulaPolicyReferenceService(
    private val drawPolicyRepository: DrawPolicyRepository,
) {
    fun isFormulaReferenced(
        troupeId: UUID,
        formulaId: UUID,
    ): Boolean {
        val formulaRef = formulaId.toString()
        return drawPolicyRepository.findByTroupeId(troupeId).any { policy ->
            referencesFormula(policy.defaultRule, formulaRef) ||
                policy.categoryRules.any { rule -> referencesFormula(rule, formulaRef) }
        }
    }

    private fun referencesFormula(
        rule: DrawDefaultRule,
        formulaRef: String,
    ): Boolean = referencesFormulaMode(rule.mode, rule.allowedFormulaIds, rule.mandatoryFormulaId, formulaRef)

    private fun referencesFormula(
        rule: DrawCategoryRule,
        formulaRef: String,
    ): Boolean = referencesFormulaMode(rule.mode, rule.allowedFormulaIds, rule.mandatoryFormulaId, formulaRef)

    private fun referencesFormulaMode(
        mode: DrawRuleMode,
        allowedFormulaIds: List<String>?,
        mandatoryFormulaId: String?,
        formulaRef: String,
    ): Boolean =
        when (mode) {
            DrawRuleMode.CHOICE -> allowedFormulaIds.orEmpty().contains(formulaRef)
            DrawRuleMode.MANDATORY -> mandatoryFormulaId == formulaRef
        }
}

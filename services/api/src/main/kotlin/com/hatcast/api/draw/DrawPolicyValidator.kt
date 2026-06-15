package com.hatcast.api.draw

import com.hatcast.api.troupe.TroupeCategoryRepository
import org.springframework.stereotype.Component
import java.util.UUID

class DrawPolicyValidationException(
    message: String,
) : IllegalArgumentException(message)

@Component
class DrawPolicyValidator(
    private val troupeCategoryRepository: TroupeCategoryRepository,
    private val drawFormulaRepository: DrawFormulaRepository,
) {
    fun validateCategoryRules(
        troupeId: UUID,
        categoryRules: List<DrawCategoryRule>,
    ) {
        val seenCategories = mutableSetOf<String?>()
        categoryRules.forEach { rule ->
            val categoryKey = rule.category
            if (!seenCategories.add(categoryKey)) {
                throw DrawPolicyValidationException("Duplicate category in category_rules: $categoryKey")
            }
            if (categoryKey != null) {
                val known =
                    troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, categoryKey)
                if (!known) {
                    throw DrawPolicyValidationException("Unknown category slug for troupe: $categoryKey")
                }
            }
            validateFormulaReferences(troupeId, rule)
        }
    }

    private fun validateFormulaReferences(
        troupeId: UUID,
        rule: DrawCategoryRule,
    ) {
        when (rule.mode) {
            DrawRuleMode.CHOICE ->
                rule.allowedFormulaIds.orEmpty().forEach { formulaRef ->
                    requireFormulaInTroupeCatalogue(troupeId, formulaRef)
                }
            DrawRuleMode.MANDATORY -> {
                val mandatoryId = rule.mandatoryFormulaId
                require(!mandatoryId.isNullOrBlank()) {
                    "mandatoryFormulaId is required for MANDATORY mode"
                }
                requireFormulaInTroupeCatalogue(troupeId, mandatoryId)
            }
        }
    }

    fun validateDefaultRule(
        troupeId: UUID,
        defaultRule: DrawDefaultRule,
    ) {
        when (defaultRule.mode) {
            DrawRuleMode.CHOICE ->
                defaultRule.allowedFormulaIds.orEmpty().forEach { formulaRef ->
                    requireFormulaInTroupeCatalogue(troupeId, formulaRef)
                }
            DrawRuleMode.MANDATORY -> {
                val mandatoryId = defaultRule.mandatoryFormulaId
                require(!mandatoryId.isNullOrBlank()) {
                    "mandatoryFormulaId is required for MANDATORY mode"
                }
                requireFormulaInTroupeCatalogue(troupeId, mandatoryId)
            }
        }
    }

    private fun requireFormulaInTroupeCatalogue(
        troupeId: UUID,
        formulaRef: String,
    ) {
        val formulaId =
            runCatching { UUID.fromString(formulaRef) }
                .getOrElse { throw DrawPolicyValidationException("Invalid formula id: $formulaRef") }
        if (!drawFormulaRepository.existsByIdAndTroupeId(formulaId, troupeId)) {
            throw DrawPolicyValidationException(
                "Formula $formulaRef is not in troupe $troupeId catalogue",
            )
        }
    }
}

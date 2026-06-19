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
    fun validatePolicyPayload(
        troupeId: UUID,
        defaultRule: DrawDefaultRule,
        categoryRules: List<DrawCategoryRule>,
    ) {
        validateDefaultRule(troupeId, defaultRule)
        validateCategoryRules(troupeId, categoryRules)
    }

    fun validateCategoryRules(
        troupeId: UUID,
        categoryRules: List<DrawCategoryRule>,
    ) {
        val seenCategories = mutableSetOf<String?>()
        categoryRules.forEach { rule ->
            val categoryKey = rule.category
            if (!seenCategories.add(categoryKey)) {
                throw DrawPolicyValidationException(
                    "Catégorie en double dans categoryRules : $categoryKey",
                )
            }
            if (categoryKey != null) {
                val known =
                    troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, categoryKey)
                if (!known) {
                    throw DrawPolicyValidationException(
                        "Slug de catégorie inconnu pour la troupe : $categoryKey",
                    )
                }
            }
            validateRuleFormulas(troupeId, rule.mode, rule.allowedFormulaIds, rule.mandatoryFormulaId)
        }
    }

    fun validateDefaultRule(
        troupeId: UUID,
        defaultRule: DrawDefaultRule,
    ) {
        validateRuleFormulas(
            troupeId,
            defaultRule.mode,
            defaultRule.allowedFormulaIds,
            defaultRule.mandatoryFormulaId,
        )
    }

    fun validateChoiceRule(allowedFormulaIds: List<String>?) {
        val ids = allowedFormulaIds.orEmpty()
        if (ids.isEmpty()) {
            throw DrawPolicyValidationException(
                "allowedFormulaIds ne peut pas être vide pour le mode CHOICE",
            )
        }
        if (ids.size != ids.toSet().size) {
            throw DrawPolicyValidationException(
                "Identifiant de formule en double dans allowedFormulaIds",
            )
        }
    }

    fun validateFormulaReference(
        troupeId: UUID,
        formulaRef: String,
    ) {
        val formulaId =
            runCatching { UUID.fromString(formulaRef) }
                .getOrElse {
                    throw DrawPolicyValidationException("Identifiant de formule invalide : $formulaRef")
                }
        if (formulaId == DrawFormulaIds.systemV1(troupeId)) {
            return
        }
        val entity =
            drawFormulaRepository.findByIdAndTroupeId(formulaId, troupeId)
                ?: throw DrawPolicyValidationException(
                    "La formule $formulaRef n'appartient pas au catalogue de la troupe",
                )
        when (entity.status) {
            DrawFormulaStatus.PUBLISHED -> Unit
            DrawFormulaStatus.DRAFT ->
                throw DrawPolicyValidationException(
                    "La formule $formulaRef est en brouillon et ne peut pas être référencée",
                )
            DrawFormulaStatus.ARCHIVED ->
                throw DrawPolicyValidationException(
                    "La formule $formulaRef est archivée et ne peut pas être référencée",
                )
        }
    }

    private fun validateRuleFormulas(
        troupeId: UUID,
        mode: DrawRuleMode,
        allowedFormulaIds: List<String>?,
        mandatoryFormulaId: String?,
    ) {
        when (mode) {
            DrawRuleMode.CHOICE -> {
                validateChoiceRule(allowedFormulaIds)
                allowedFormulaIds.orEmpty().forEach { validateFormulaReference(troupeId, it) }
            }
            DrawRuleMode.MANDATORY -> {
                val mandatoryId = mandatoryFormulaId
                if (mandatoryId.isNullOrBlank()) {
                    throw DrawPolicyValidationException(
                        "mandatoryFormulaId est requis pour le mode MANDATORY",
                    )
                }
                validateFormulaReference(troupeId, mandatoryId)
            }
        }
    }
}

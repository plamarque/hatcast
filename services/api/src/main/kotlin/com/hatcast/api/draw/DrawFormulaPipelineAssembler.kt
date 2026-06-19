package com.hatcast.api.draw

import com.hatcast.api.availability.draw.CategoryCompartmentFactor
import com.hatcast.api.availability.draw.DrawWeightFactor
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.ImmediateReplayFactor
import com.hatcast.api.availability.draw.PastParticipationFactor
import com.hatcast.api.availability.draw.RoleRequestFactor
import org.springframework.stereotype.Component

class DrawFormulaValidationException(
    message: String,
) : IllegalArgumentException(message)

@Component
class DrawFormulaValidator {
    fun validateForSave(factorConfig: DrawFactorConfig) {
        validateUniqueFactorIds(factorConfig)
        validateKnownFactorIds(factorConfig, allowReservedDisabled = true)
        validateEquityTagRequired(factorConfig)
        validateFactorParams(factorConfig)
        validateReservedFactorsDisabledOnSave(factorConfig)
    }

    fun validateForPublish(factorConfig: DrawFactorConfig) {
        validateForSave(factorConfig)
        validateNonEmptyEnabledPipeline(factorConfig)
        validateImplementedFactorsOnly(factorConfig)
    }

    /** @deprecated Use [validateForSave] or [validateForPublish]. */
    fun validateFactorConfig(factorConfig: DrawFactorConfig) {
        validateForPublish(factorConfig)
    }

    private fun validateUniqueFactorIds(factorConfig: DrawFactorConfig) {
        if (factorConfig.map { it.factorId }.toSet().size != factorConfig.size) {
            throw DrawFormulaValidationException("Identifiant de facteur en double dans factorConfig")
        }
    }

    private fun validateKnownFactorIds(
        factorConfig: DrawFactorConfig,
        allowReservedDisabled: Boolean,
    ) {
        factorConfig.forEach { entry ->
            val factorId = entry.factorId
            when {
                factorId in IMPLEMENTED_FACTOR_IDS -> Unit
                factorId in RESERVED_FACTOR_IDS -> {
                    if (!allowReservedDisabled || entry.enabled) {
                        throw DrawFormulaValidationException("Facteur réservé non implémenté : $factorId")
                    }
                }
                else -> throw DrawFormulaValidationException("Facteur inconnu : $factorId")
            }
        }
    }

    private fun validateEquityTagRequired(factorConfig: DrawFactorConfig) {
        if (!factorConfig.any { it.factorId == CategoryCompartmentFactor.FACTOR_ID && it.enabled }) {
            throw DrawFormulaValidationException("equity_tag doit être présent et activé")
        }
    }

    private fun validateFactorParams(factorConfig: DrawFactorConfig) {
        factorConfig
            .filter { it.enabled && it.factorId in IMPLEMENTED_FACTOR_IDS }
            .forEach { entry ->
                DrawFactorParamCatalog.validateEnabledFactorParams(entry.factorId, entry.params)
            }
    }

    private fun validateReservedFactorsDisabledOnSave(factorConfig: DrawFactorConfig) {
        factorConfig
            .filter { it.factorId in RESERVED_FACTOR_IDS && it.enabled }
            .forEach { entry ->
                throw DrawFormulaValidationException(
                    "Facteur réservé non implémenté : ${entry.factorId}",
                )
            }
    }

    private fun validateNonEmptyEnabledPipeline(factorConfig: DrawFactorConfig) {
        if (factorConfig.isEmpty()) {
            throw DrawFormulaValidationException(
                "factorConfig ne peut pas être vide pour une formule publiée",
            )
        }
        if (!factorConfig.any { it.enabled }) {
            throw DrawFormulaValidationException(
                "Au moins un facteur doit être activé pour publier la formule",
            )
        }
    }

    private fun validateImplementedFactorsOnly(factorConfig: DrawFactorConfig) {
        factorConfig
            .filter { it.enabled && it.factorId !in IMPLEMENTED_FACTOR_IDS }
            .forEach { entry ->
                throw DrawFormulaValidationException(
                    "Facteur activé non implémenté : ${entry.factorId}",
                )
            }
    }

    companion object {
        val IMPLEMENTED_FACTOR_IDS: Set<String> =
            setOf(
                CategoryCompartmentFactor.FACTOR_ID,
                PastParticipationFactor.FACTOR_ID,
                ImmediateReplayFactor.FACTOR_ID,
                RoleRequestFactor.FACTOR_ID,
            )

        val RESERVED_FACTOR_IDS: Set<String> =
            setOf(
                "gender_parity",
                "volunteer_bonus",
                "class_mix",
                "prestige",
            )
    }
}

@Component
class DrawFormulaPipelineAssembler(
    private val drawFormulaValidator: DrawFormulaValidator,
) {
    fun assemble(factorConfig: DrawFactorConfig): DrawWeightPipeline {
        drawFormulaValidator.validateForPublish(factorConfig)
        val factors = mutableListOf<DrawWeightFactor>()
        for (entry in factorConfig) {
            if (!entry.enabled) {
                continue
            }
            when (entry.factorId) {
                CategoryCompartmentFactor.FACTOR_ID -> factors.add(CategoryCompartmentFactor)
                PastParticipationFactor.FACTOR_ID ->
                    factors.add(DrawFactorParamCatalog.parsePastParticipationFactor(entry.params))
                ImmediateReplayFactor.FACTOR_ID ->
                    factors.add(DrawFactorParamCatalog.parseImmediateReplayFactor(entry.params))
                RoleRequestFactor.FACTOR_ID ->
                    factors.add(DrawFactorParamCatalog.parseRoleRequestFactor(entry.params))
            }
        }
        return DrawWeightPipeline.of(factors)
    }
}

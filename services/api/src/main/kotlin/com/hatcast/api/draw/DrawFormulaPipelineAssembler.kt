package com.hatcast.api.draw

import com.hatcast.api.availability.draw.CategoryCompartmentFactor
import com.hatcast.api.availability.draw.DrawWeightFactor
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.ImmediateReplayFactor
import com.hatcast.api.availability.draw.ImmediateReplayMode
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
        validateImmediateReplayParams(factorConfig)
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

    private fun validateImmediateReplayParams(factorConfig: DrawFactorConfig) {
        factorConfig
            .filter { it.factorId == ImmediateReplayFactor.FACTOR_ID && it.enabled }
            .forEach { entry ->
                val mode = entry.params?.get("mode")?.toString()
                if (mode != null && mode !in IMMEDIATE_REPLAY_MODES) {
                    throw DrawFormulaValidationException(
                        "immediate_replay.params.mode doit être OFF, EXCLUDE ou MALUS",
                    )
                }
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

        private val IMMEDIATE_REPLAY_MODES = setOf("OFF", "EXCLUDE", "MALUS")
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
                PastParticipationFactor.FACTOR_ID -> factors.add(PastParticipationFactor)
                ImmediateReplayFactor.FACTOR_ID ->
                    factors.add(ImmediateReplayFactor(resolveImmediateReplayMode(entry.params)))
                RoleRequestFactor.FACTOR_ID -> factors.add(RoleRequestFactor)
            }
        }
        return DrawWeightPipeline.of(factors)
    }

    private fun resolveImmediateReplayMode(params: Map<String, Any>?): ImmediateReplayMode {
        val raw = params?.get("mode")?.toString()
        return when (raw) {
            null, "EXCLUDE" -> ImmediateReplayMode.EXCLUDE
            "MALUS" -> ImmediateReplayMode.MALUS
            "OFF" -> ImmediateReplayMode.OFF
            else -> throw DrawFormulaValidationException(
                "immediate_replay.params.mode doit être OFF, EXCLUDE ou MALUS",
            )
        }
    }
}

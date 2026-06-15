package com.hatcast.api.draw

import com.hatcast.api.availability.draw.CategoryCompartmentFactor
import com.hatcast.api.availability.draw.DrawWeightFactor
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.ImmediateReplayFactor
import com.hatcast.api.availability.draw.ImmediateReplayMode
import com.hatcast.api.availability.draw.PastParticipationFactor
import com.hatcast.api.availability.draw.RoleRequestFactor
import org.springframework.stereotype.Component

@Component
class DrawFormulaValidator {
    private val knownFactorIds =
        setOf(
            CategoryCompartmentFactor.FACTOR_ID,
            PastParticipationFactor.FACTOR_ID,
            ImmediateReplayFactor.FACTOR_ID,
            RoleRequestFactor.FACTOR_ID,
        )

    fun validateFactorConfig(factorConfig: DrawFactorConfig) {
        require(factorConfig.map { it.factorId }.toSet().size == factorConfig.size) {
            "Duplicate factorId in factor_config"
        }
        factorConfig.forEach { entry ->
            require(entry.factorId in knownFactorIds) {
                "Unknown factorId: ${entry.factorId}"
            }
        }
        require(
            factorConfig.any {
                it.factorId == CategoryCompartmentFactor.FACTOR_ID && it.enabled
            },
        ) {
            "equity_tag must be present and enabled"
        }
        factorConfig
            .filter { it.factorId == ImmediateReplayFactor.FACTOR_ID && it.enabled }
            .forEach { entry ->
                val mode = entry.params?.get("mode")?.toString()
                if (mode != null) {
                    require(mode in IMMEDIATE_REPLAY_MODES) {
                        "immediate_replay.params.mode must be OFF, EXCLUDE, or MALUS"
                    }
                }
            }
    }

    companion object {
        private val IMMEDIATE_REPLAY_MODES = setOf("OFF", "EXCLUDE", "MALUS")
    }
}

@Component
class DrawFormulaPipelineAssembler(
    private val drawFormulaValidator: DrawFormulaValidator,
) {
    fun assemble(factorConfig: DrawFactorConfig): DrawWeightPipeline {
        drawFormulaValidator.validateFactorConfig(factorConfig)
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
            else -> throw IllegalArgumentException("immediate_replay.params.mode must be OFF, EXCLUDE, or MALUS")
        }
    }
}

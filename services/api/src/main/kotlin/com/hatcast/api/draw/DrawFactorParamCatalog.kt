package com.hatcast.api.draw

import com.hatcast.api.availability.draw.CategoryCompartmentFactor
import com.hatcast.api.availability.draw.ImmediateReplayFactor
import com.hatcast.api.availability.draw.ImmediateReplayMode
import com.hatcast.api.availability.draw.PastParticipationFactor
import com.hatcast.api.availability.draw.RoleRequestFactor

/** Metadata for admin UI mirror (19.19c) — not persisted in factorConfig. */
enum class FactorDirection {
    MALUS,
    BONUS,
    NEUTRAL,
}

/**
 * Single source for draw factor param keys, ranges, defaults, and parsing (story 19.19b).
 * Used by [DrawFormulaValidator] and [DrawFormulaPipelineAssembler].
 */
object DrawFactorParamCatalog {
    val FACTOR_DIRECTIONS: Map<String, FactorDirection> =
        mapOf(
            CategoryCompartmentFactor.FACTOR_ID to FactorDirection.NEUTRAL,
            PastParticipationFactor.FACTOR_ID to FactorDirection.MALUS,
            ImmediateReplayFactor.FACTOR_ID to FactorDirection.MALUS,
            RoleRequestFactor.FACTOR_ID to FactorDirection.BONUS,
        )

    private val IMMEDIATE_REPLAY_MODES = setOf("EXCLUDE", "MALUS")

    private val PAST_PARTICIPATION_KEYS = setOf("strength")
    private val IMMEDIATE_REPLAY_KEYS = setOf("mode", "malusMultiplier")
    private val ROLE_REQUEST_KEYS = setOf("bonusPerUnfulfilled", "maxBonusMultiplier")

    fun validateEnabledFactorParams(
        factorId: String,
        params: Map<String, Any>?,
    ) {
        when (factorId) {
            PastParticipationFactor.FACTOR_ID -> validatePastParticipationParams(params)
            ImmediateReplayFactor.FACTOR_ID -> validateImmediateReplayParams(params)
            RoleRequestFactor.FACTOR_ID -> validateRoleRequestParams(params)
            CategoryCompartmentFactor.FACTOR_ID -> validateNoParams(factorId, params)
        }
    }

    fun parsePastParticipationFactor(params: Map<String, Any>?): PastParticipationFactor {
        val strength =
            parseOptionalDouble(
                params,
                "strength",
                PastParticipationFactor.DEFAULT_STRENGTH,
                0.0,
                2.0,
            )
        return PastParticipationFactor(strength)
    }

    fun parseRoleRequestFactor(params: Map<String, Any>?): RoleRequestFactor {
        val bonusPerUnfulfilled =
            parseOptionalDouble(
                params,
                "bonusPerUnfulfilled",
                RoleRequestFactor.DEFAULT_BONUS_PER_UNFULFILLED,
                0.0,
                5.0,
            )
        val maxBonusMultiplier =
            parseOptionalDouble(
                params,
                "maxBonusMultiplier",
                RoleRequestFactor.DEFAULT_MAX_BONUS_MULTIPLIER,
                1.0,
                20.0,
            )
        return RoleRequestFactor(bonusPerUnfulfilled, maxBonusMultiplier)
    }

    fun parseImmediateReplayFactor(params: Map<String, Any>?): ImmediateReplayFactor {
        val mode = resolveImmediateReplayMode(params)
        val malusMultiplier =
            parseOptionalDouble(
                params,
                "malusMultiplier",
                ImmediateReplayFactor.MALUS_MULTIPLIER,
                0.0,
                1.0,
            )
        return ImmediateReplayFactor(mode, malusMultiplier)
    }

    fun resolveImmediateReplayMode(params: Map<String, Any>?): ImmediateReplayMode {
        val raw = params?.get("mode")?.toString()
        return when (raw) {
            null, "EXCLUDE" -> ImmediateReplayMode.EXCLUDE
            "MALUS" -> ImmediateReplayMode.MALUS
            "OFF" ->
                throw DrawFormulaValidationException(
                    "immediate_replay.params.mode doit être EXCLUDE ou MALUS",
                )
            else ->
                throw DrawFormulaValidationException(
                    "immediate_replay.params.mode doit être EXCLUDE ou MALUS",
                )
        }
    }

    private fun validateNoParams(
        factorId: String,
        params: Map<String, Any>?,
    ) {
        if (params.isNullOrEmpty()) {
            return
        }
        params.keys.forEach { key ->
            throw DrawFormulaValidationException("Paramètre inconnu pour $factorId : $key")
        }
    }

    private fun validatePastParticipationParams(params: Map<String, Any>?) {
        if (params.isNullOrEmpty()) {
            return
        }
        rejectUnknownKeys(PastParticipationFactor.FACTOR_ID, params.keys, PAST_PARTICIPATION_KEYS)
        if (params.containsKey("strength")) {
            requireDoubleInRange(
                "strength",
                params["strength"],
                0.0,
                2.0,
            )
        }
    }

    private fun validateImmediateReplayParams(params: Map<String, Any>?) {
        if (params.isNullOrEmpty()) {
            return
        }
        rejectUnknownKeys(ImmediateReplayFactor.FACTOR_ID, params.keys, IMMEDIATE_REPLAY_KEYS)
        val modeRaw = params["mode"]?.toString()
        if (modeRaw != null && modeRaw !in IMMEDIATE_REPLAY_MODES) {
            throw DrawFormulaValidationException(
                "immediate_replay.params.mode doit être EXCLUDE ou MALUS",
            )
        }
        val effectiveMode = modeRaw ?: "EXCLUDE"
        if (params.containsKey("malusMultiplier")) {
            if (effectiveMode != "MALUS") {
                throw DrawFormulaValidationException(
                    "malusMultiplier n'est autorisé que si mode=MALUS",
                )
            }
            requireDoubleInRange(
                "malusMultiplier",
                params["malusMultiplier"],
                0.0,
                1.0,
            )
        }
    }

    private fun validateRoleRequestParams(params: Map<String, Any>?) {
        if (params.isNullOrEmpty()) {
            return
        }
        rejectUnknownKeys(RoleRequestFactor.FACTOR_ID, params.keys, ROLE_REQUEST_KEYS)
        if (params.containsKey("bonusPerUnfulfilled")) {
            requireDoubleInRange(
                "bonusPerUnfulfilled",
                params["bonusPerUnfulfilled"],
                0.0,
                5.0,
            )
        }
        if (params.containsKey("maxBonusMultiplier")) {
            requireDoubleInRange(
                "maxBonusMultiplier",
                params["maxBonusMultiplier"],
                1.0,
                20.0,
            )
        }
    }

    private fun rejectUnknownKeys(
        factorId: String,
        actualKeys: Set<String>,
        allowedKeys: Set<String>,
    ) {
        actualKeys
            .filter { it !in allowedKeys }
            .forEach { _ ->
                throw DrawFormulaValidationException("Paramètre inconnu pour $factorId")
            }
    }

    private fun parseOptionalDouble(
        params: Map<String, Any>?,
        key: String,
        defaultValue: Double,
        min: Double,
        max: Double,
    ): Double {
        if (params == null || !params.containsKey(key)) {
            return defaultValue
        }
        return requireDoubleInRange(key, params[key], min, max)
    }

    private fun requireDoubleInRange(
        key: String,
        raw: Any?,
        min: Double,
        max: Double,
    ): Double {
        val value = parseNumeric(raw, key)
        if (!value.isFinite()) {
            throw DrawFormulaValidationException("$key doit être un nombre")
        }
        if (value < min || value > max) {
            throw DrawFormulaValidationException("$key doit être entre $min et $max")
        }
        return value
    }

    private fun parseNumeric(
        raw: Any?,
        key: String,
    ): Double =
        when (raw) {
            null -> throw DrawFormulaValidationException("$key doit être un nombre")
            is Number -> raw.toDouble()
            is String ->
                raw.toDoubleOrNull()
                    ?: throw DrawFormulaValidationException("$key doit être un nombre")
            else -> throw DrawFormulaValidationException("$key doit être un nombre")
        }
}

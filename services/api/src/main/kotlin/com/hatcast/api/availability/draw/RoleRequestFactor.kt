package com.hatcast.api.availability.draw

import com.hatcast.api.role.RoleLabels
import kotlin.math.min

/**
 * Bonus for repeated unfulfilled role aspirations (story 19.10). Off by default in [DrawWeightPipelines.DEFAULT].
 */
class RoleRequestFactor(
    private val bonusPerUnfulfilled: Double = DEFAULT_BONUS_PER_UNFULFILLED,
    private val maxBonusMultiplier: Double = DEFAULT_MAX_BONUS_MULTIPLIER,
) : LabeledDrawWeightFactor {
    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double =
        bonusMultiplier(context.unfulfilledRoleRequestCount)

    fun bonusMultiplier(unfulfilledCount: Int): Double {
        if (unfulfilledCount <= 0) {
            return 1.0
        }
        return min(1.0 + unfulfilledCount * bonusPerUnfulfilled, maxBonusMultiplier)
    }

    override fun adjustmentLabel(context: DrawWeightContext): String {
        val n = context.unfulfilledRoleRequestCount
        val roleLabel = RoleLabels.label(context.roleKey, context.participantGender)
        return "A demandé $roleLabel $n fois sans être tiré·e — bonus aspiration"
    }

    companion object {
        const val FACTOR_ID = "role_request"
        const val DEFAULT_BONUS_PER_UNFULFILLED = 1.0
        const val DEFAULT_MAX_BONUS_MULTIPLIER = 10.0

        /** Legacy names kept for Wave A golden tests. */
        const val BONUS_PER_UNFULFILLED = DEFAULT_BONUS_PER_UNFULFILLED
        const val MAX_BONUS_MULTIPLIER = DEFAULT_MAX_BONUS_MULTIPLIER

        val DEFAULT: RoleRequestFactor = RoleRequestFactor()
    }
}

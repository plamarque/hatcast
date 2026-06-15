package com.hatcast.api.availability.draw

import com.hatcast.api.role.RoleLabels
import kotlin.math.min

/**
 * Bonus for repeated unfulfilled role aspirations (story 19.10). Off by default in [DrawWeightPipelines.DEFAULT].
 */
object RoleRequestFactor : LabeledDrawWeightFactor {
    const val FACTOR_ID = "role_request"
    const val BONUS_PER_UNFULFILLED = 1.0
    const val MAX_BONUS_MULTIPLIER = 10.0

    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double =
        bonusMultiplier(context.unfulfilledRoleRequestCount)

    fun bonusMultiplier(unfulfilledCount: Int): Double {
        if (unfulfilledCount <= 0) {
            return 1.0
        }
        return min(1.0 + unfulfilledCount * BONUS_PER_UNFULFILLED, MAX_BONUS_MULTIPLIER)
    }

    override fun adjustmentLabel(context: DrawWeightContext): String {
        val n = context.unfulfilledRoleRequestCount
        val roleLabel = RoleLabels.label(context.roleKey, context.participantGender)
        return "A demandé $roleLabel $n fois sans être tiré·e — bonus aspiration"
    }
}

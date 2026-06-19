package com.hatcast.api.availability.draw

import com.hatcast.api.event.EventService
import com.hatcast.api.role.RoleLabels
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Penalizes or excludes candidates who held the same role on the immediate validated predecessor
 * in the same category compartment (story 19.9). Off by default in [DrawWeightPipelines.DEFAULT].
 */
class ImmediateReplayFactor(
    val mode: ImmediateReplayMode,
    private val malusMultiplier: Double = MALUS_MULTIPLIER,
) : LabeledDrawWeightFactor {
    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double {
        if (!context.playedSameRoleOnImmediatePredecessor) {
            return 1.0
        }
        return when (mode) {
            ImmediateReplayMode.OFF -> 1.0
            ImmediateReplayMode.EXCLUDE -> 0.0
            ImmediateReplayMode.MALUS -> malusMultiplier
        }
    }

    override fun adjustmentLabel(context: DrawWeightContext): String {
        val roleLabel = RoleLabels.label(context.roleKey, context.participantGender)
        val title = context.immediatePredecessorTitle ?: "spectacle précédent"
        val date =
            context.immediatePredecessorStartsAt?.let(::formatPredecessorDate)
                ?: "date inconnue"
        return "Déjà $roleLabel au spectacle « $title » ($date)"
    }

    companion object {
        const val FACTOR_ID = "immediate_replay"
        const val MALUS_MULTIPLIER = 0.25

        private val ZONE: ZoneId = EventService.AGENDA_ZONE
        private val DATE_FORMAT: DateTimeFormatter =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH)

        private fun formatPredecessorDate(startsAt: Instant): String =
            DATE_FORMAT.format(startsAt.atZone(ZONE))
    }
}

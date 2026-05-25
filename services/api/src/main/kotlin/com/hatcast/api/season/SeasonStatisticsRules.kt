package com.hatcast.api.season

import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.RoleTemplates
import java.util.UUID

/** Mutable counts for in-memory aggregation (maps to [StatCountsDto] in API). */
data class StatCountBucket(
    var selections: Int = 0,
    var dispos: Int = 0,
    var declines: Int = 0,
)

/** V1 parity — [legacy/src/components/CastsView.vue] column and sel/dispo rules (story 3.6, 17.10). */
object SeasonStatisticsRules {
    val COLUMN_KEYS: List<String> =
        listOf(
            "jeuMatch",
            "jeuCab",
            "jeuLong",
            "jeuAutre",
            "totalJeu",
            "mc",
            "dj",
            "referee",
            "assistantReferee",
            "coach",
            "totalDecorum",
            "stageManager",
            "lighting",
            "volunteer",
            "totalBenevole",
        )

    private val DECORUM_ROLES = listOf("mc", "dj", "referee", "assistant_referee", "coach")
    private val BENEVOLE_ROLES = listOf("stage_manager", "lighting", "volunteer")
    private val JEU_AUTRE_TYPES = setOf("freeform", "catch", "custom", "survey", "deplacement")

    fun eventMatchesColumn(
        event: EventEntity,
        columnKey: String,
    ): Boolean {
        val t = event.templateType
        return when (columnKey) {
            "jeuMatch" -> t == "match"
            "jeuCab" -> t == "cabaret"
            "jeuLong" -> t == "longform"
            "jeuAutre" -> t in JEU_AUTRE_TYPES
            "totalJeu" -> t == "match" || t == "cabaret" || t == "longform" || t in JEU_AUTRE_TYPES
            "mc", "dj", "referee", "assistantReferee", "coach", "totalDecorum" -> true
            "stageManager", "lighting", "volunteer", "totalBenevole" -> true
            else -> false
        }
    }

    fun rolesForColumn(columnKey: String): List<String> =
        when (columnKey) {
            "jeuMatch", "jeuCab", "jeuLong", "jeuAutre", "totalJeu" -> listOf("player")
            "mc" -> listOf("mc")
            "dj" -> listOf("dj")
            "referee" -> listOf("referee")
            "assistantReferee" -> listOf("assistant_referee")
            "coach" -> listOf("coach")
            "totalDecorum" -> DECORUM_ROLES
            "stageManager" -> listOf("stage_manager")
            "lighting" -> listOf("lighting")
            "volunteer" -> listOf("volunteer")
            "totalBenevole" -> BENEVOLE_ROLES
            else -> emptyList()
        }

    fun selectionColumnForRole(
        event: EventEntity,
        roleKey: String,
    ): String? =
        when (roleKey) {
            "mc" -> "mc"
            "dj" -> "dj"
            "referee" -> "referee"
            "assistant_referee" -> "assistantReferee"
            "coach" -> "coach"
            "player" ->
                when (event.templateType) {
                    "match" -> "jeuMatch"
                    "cabaret" -> "jeuCab"
                    "longform" -> "jeuLong"
                    else -> "jeuAutre"
                }
            "stage_manager" -> "stageManager"
            "lighting" -> "lighting"
            "volunteer" -> "volunteer"
            else -> null
        }

    fun incrementSelectionTotals(
        totals: MutableMap<String, Int>,
        event: EventEntity,
        roleKey: String,
    ) {
        val col = selectionColumnForRole(event, roleKey) ?: return
        totals[col] = (totals[col] ?: 0) + 1
        when (col) {
            "jeuMatch", "jeuCab", "jeuLong", "jeuAutre" -> totals["totalJeu"] = (totals["totalJeu"] ?: 0) + 1
            "mc", "dj", "referee", "assistantReferee", "coach" ->
                totals["totalDecorum"] = (totals["totalDecorum"] ?: 0) + 1
            "stageManager", "lighting", "volunteer" ->
                totals["totalBenevole"] = (totals["totalBenevole"] ?: 0) + 1
        }
    }

    fun eventHasRoleSlot(
        event: EventEntity,
        roleKey: String,
    ): Boolean = (RoleTemplates.normalize(event.roleSlots)[roleKey] ?: 0) > 0

    fun isAvailableForColumn(
        availableRoleKeys: List<String>,
        event: EventEntity,
        columnKey: String,
    ): Boolean {
        if (availableRoleKeys.isEmpty()) {
            return false
        }
        val roles = rolesForColumn(columnKey)
        return roles.any { role ->
            eventHasRoleSlot(event, role) && availableRoleKeys.contains(role)
        }
    }

    fun effectiveDispos(
        dispos: Int,
        declines: Int,
    ): Int = maxOf(0, dispos - declines)

    fun statPercent(
        selections: Int,
        dispos: Int,
        declines: Int,
    ): Int? {
        val effective = effectiveDispos(dispos, declines)
        if (effective <= 0 && selections <= 0) {
            return null
        }
        val denominator = maxOf(effective, selections)
        if (denominator <= 0) {
            return null
        }
        return minOf(100, kotlin.math.round((selections.toDouble() / denominator) * 100).toInt())
    }

    fun statTooltip(
        selections: Int,
        dispos: Int,
        declines: Int,
    ): String =
        when {
            dispos == 0 -> "Aucune dispo dans cette catégorie"
            declines == 0 ->
                "$selections sélection${if (selections != 1) "s" else ""} sur $dispos dispo${if (dispos != 1) "s" else ""}"
            else ->
                "$selections sélection${if (selections != 1) "s" else ""} sur $dispos dispos (dont $declines désistement${if (declines != 1) "s" else ""})"
        }

    /**
     * V1 `calculatePlayerMonthStats` — one participation/dispo/decline bucket per validated event in the month.
     */
    fun accumulateMonthEventSummary(
        bucket: StatCountBucket,
        validated: Boolean,
        participantId: UUID,
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        event: EventEntity,
        availableRoleKeys: List<String>,
    ) {
        if (!validated) {
            return
        }
        val playerDeclines =
            declines.filter {
                it.seasonParticipantId == participantId || it.eventParticipantId == participantId
            }
        val hasDeclinedRecord = playerDeclines.isNotEmpty()
        val hasDeclinedSlot =
            slots.any {
                it.assignedParticipantId() == participantId &&
                    it.participationStatus == SlotParticipationStatus.DECLINED
            }
        if (hasDeclinedRecord || hasDeclinedSlot) {
            bucket.declines++
        }

        val declinedRoles = playerDeclines.map { it.roleKey }.toSet()
        val hasSelection =
            slots.any { slot ->
                slot.assignedParticipantId() == participantId &&
                    slot.participationStatus != SlotParticipationStatus.DECLINED &&
                    !declinedRoles.contains(slot.roleKey)
            }
        if (hasSelection) {
            bucket.selections++
        }

        if (availableRoleKeys.any { role -> eventHasRoleSlot(event, role) }) {
            bucket.dispos++
        }
    }

    fun formatStatExportValue(
        selections: Int,
        dispos: Int,
        declines: Int,
    ): String {
        if (selections == 0 && dispos == 0) {
            return ""
        }
        val pct = statPercent(selections, dispos, declines)
        return if (dispos > 0) {
            if (pct != null) "$selections/$dispos ($pct%)" else "$selections/$dispos"
        } else {
            if (selections > 0) selections.toString() else ""
        }
    }
}

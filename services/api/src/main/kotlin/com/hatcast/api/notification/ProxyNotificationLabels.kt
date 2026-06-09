package com.hatcast.api.notification

import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.role.RoleLabels

object ProxyNotificationLabels {
    fun availabilityStatusLabel(apiStatus: String): String =
        when (apiStatus) {
            AvailabilityStatusMapper.UNKNOWN -> "Non renseigné"
            AvailabilityStatusMapper.AVAILABLE -> "Dispo"
            AvailabilityStatusMapper.UNAVAILABLE -> "Pas dispo"
            else -> apiStatus
        }

    fun availabilityStatusLabel(stored: StoredAvailabilityStatus?): String =
        availabilityStatusLabel(
            stored?.let { AvailabilityStatusMapper.toApi(it) } ?: AvailabilityStatusMapper.UNKNOWN,
        )

    fun participationStatusLabel(status: SlotParticipationStatus): String =
        participationDecisionLabel(status, beforeStatus = null)

    fun participationDecisionLabel(
        status: SlotParticipationStatus,
        beforeStatus: SlotParticipationStatus?,
    ): String =
        when (status) {
            SlotParticipationStatus.CONFIRMED -> "Confirmé"
            SlotParticipationStatus.PENDING -> "À confirmer"
            SlotParticipationStatus.DECLINED ->
                when (beforeStatus) {
                    SlotParticipationStatus.PENDING -> "Refusé"
                    SlotParticipationStatus.CONFIRMED -> "Désisté"
                    else -> "Retrait"
                }
        }

    fun participationProxyVerb(decisionLabel: String): String =
        when (decisionLabel) {
            participationDecisionLabel(SlotParticipationStatus.CONFIRMED, null) -> "a confirmé ta participation"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, SlotParticipationStatus.PENDING) ->
                "a refusé ta participation"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, SlotParticipationStatus.CONFIRMED) ->
                "a enregistré ton désistement"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, null) -> "a enregistré ton retrait"
            else -> "a remis à confirmer ta participation"
        }

    fun participationProxyUsesShowConfirmDeepLink(decisionLabel: String): Boolean =
        decisionLabel == participationDecisionLabel(SlotParticipationStatus.PENDING, null)

    fun participationProxyNotificationTitle(decisionLabel: String): String =
        when (decisionLabel) {
            participationDecisionLabel(SlotParticipationStatus.CONFIRMED, null) -> "👍 Participation confirmée"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, SlotParticipationStatus.PENDING) ->
                "👎 Déclinaison enregistrée"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, SlotParticipationStatus.CONFIRMED) ->
                "👎 Désistement enregistré"
            participationDecisionLabel(SlotParticipationStatus.DECLINED, null) -> "👎 Retrait enregistré"
            else -> "⏳ Participation à confirmer"
        }

    fun shouldDeferProxyAvailabilityNotification(change: ProxyAvailabilityChange): Boolean =
        change.afterLabel == availabilityStatusLabel(AvailabilityStatusMapper.AVAILABLE) &&
            change.roleKeysSummary.isNullOrBlank() &&
            change.commentSnippet.isNullOrBlank()

    fun roleKeysSummary(roleKeys: List<String>): String? {
        if (roleKeys.isEmpty()) {
            return null
        }
        return roleKeys.joinToString(", ") { RoleLabels.label(it) }
    }

    fun buildAvailabilityChangeFromAudit(
        before: Map<String, Any?>?,
        after: Map<String, Any?>?,
    ): ProxyAvailabilityChange {
        val beforeSnap = auditAvailabilitySnapshot(before)
        val afterSnap = auditAvailabilitySnapshot(after)
        return buildAvailabilityChangeFromSnapshots(beforeSnap, afterSnap)
    }

    fun buildAvailabilityChange(
        before: EventAvailabilityEntity?,
        after: EventAvailabilityEntity?,
    ): ProxyAvailabilityChange {
        val beforeSnap = availabilitySnapshot(before)
        val afterSnap = availabilitySnapshot(after)
        return buildAvailabilityChangeFromSnapshots(beforeSnap, afterSnap)
    }

    private fun buildAvailabilityChangeFromSnapshots(
        beforeSnap: AvailabilitySnapshot,
        afterSnap: AvailabilitySnapshot,
    ): ProxyAvailabilityChange {
        val roleKeysSummary =
            if (beforeSnap.roleKeys != afterSnap.roleKeys) {
                roleKeysSummary(afterSnap.roleKeys).takeIf { afterSnap.status == AvailabilityStatusMapper.AVAILABLE }
            } else {
                null
            }
        val commentSnippet =
            if (beforeSnap.comment != afterSnap.comment) {
                afterSnap.comment?.take(120)
            } else {
                null
            }
        return ProxyAvailabilityChange(
            beforeLabel = availabilityStatusLabel(beforeSnap.status),
            afterLabel = availabilityStatusLabel(afterSnap.status),
            roleKeysSummary = roleKeysSummary,
            commentSnippet = commentSnippet,
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun auditAvailabilitySnapshot(snapshot: Map<String, Any?>?): AvailabilitySnapshot =
        if (snapshot == null) {
            AvailabilitySnapshot(
                status = AvailabilityStatusMapper.UNKNOWN,
                roleKeys = emptyList(),
                comment = null,
            )
        } else {
            AvailabilitySnapshot(
                status = snapshot["status"] as? String ?: AvailabilityStatusMapper.UNKNOWN,
                roleKeys = snapshot["roleKeys"] as? List<String> ?: emptyList(),
                comment = snapshot["comment"] as? String,
            )
        }

    private data class AvailabilitySnapshot(
        val status: String,
        val roleKeys: List<String>,
        val comment: String?,
    )

    private fun availabilitySnapshot(row: EventAvailabilityEntity?): AvailabilitySnapshot =
        if (row == null) {
            AvailabilitySnapshot(
                status = AvailabilityStatusMapper.UNKNOWN,
                roleKeys = emptyList(),
                comment = null,
            )
        } else {
            AvailabilitySnapshot(
                status = AvailabilityStatusMapper.toApi(row.status),
                roleKeys =
                    if (row.status == StoredAvailabilityStatus.AVAILABLE) {
                        row.roleKeys
                    } else {
                        emptyList()
                    },
                comment = row.comment?.takeIf { it.isNotBlank() },
            )
        }
}

package com.hatcast.api.audit

import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus

object AuditSnapshots {
    fun availability(row: EventAvailabilityEntity?): Map<String, Any?>? {
        if (row == null) return null
        return mapOf(
            "status" to AvailabilityStatusMapper.toApi(row.status),
            "roleKeys" to if (row.status == StoredAvailabilityStatus.AVAILABLE) row.roleKeys else emptyList<String>(),
            "comment" to row.comment?.takeIf { it.isNotBlank() },
        )
    }

    fun event(entity: EventEntity): Map<String, Any?> =
        mapOf(
            "title" to entity.title,
            "slug" to entity.slug,
            "startsAt" to entity.startsAt.toString(),
            "location" to entity.location,
            "description" to entity.description,
            "templateType" to entity.templateType,
            "roleSlots" to entity.roleSlots,
            "category" to entity.category,
            "archived" to entity.archived,
        )

    fun mapDiff(
        before: Map<String, Any?>,
        after: Map<String, Any?>,
    ): Pair<Map<String, Any?>?, Map<String, Any?>?> {
        val changedKeys =
            before.keys.union(after.keys).filter { key ->
                before[key] != after[key]
            }
        if (changedKeys.isEmpty()) return null to null
        val beforeDiff = changedKeys.associateWith { before[it] }
        val afterDiff = changedKeys.associateWith { after[it] }
        return beforeDiff to afterDiff
    }

    fun eventDiff(
        before: EventEntity,
        after: EventEntity,
    ): Pair<Map<String, Any?>?, Map<String, Any?>?> {
        val beforeFull = event(before)
        val afterFull = event(after)
        val changedKeys =
            beforeFull.keys.filter { key ->
                beforeFull[key] != afterFull[key]
            }
        if (changedKeys.isEmpty()) return null to null
        val beforeDiff = changedKeys.associateWith { beforeFull[it] }
        val afterDiff = changedKeys.associateWith { afterFull[it] }
        return beforeDiff to afterDiff
    }

    fun seasonParticipant(entity: SeasonParticipantEntity): Map<String, Any?> =
        mapOf(
            "status" to entity.status.name.lowercase(),
            "displayName" to entity.displayName,
            "normalizedEmail" to entity.normalizedEmail,
            "userId" to entity.user?.id?.toString(),
        )

    fun eventParticipant(entity: EventParticipantEntity): Map<String, Any?> =
        mapOf(
            "status" to entity.status.name.lowercase(),
            "displayName" to entity.displayName,
            "normalizedEmail" to entity.normalizedEmail,
            "userId" to entity.user?.id?.toString(),
        )

    fun membership(entity: TroupeMembershipEntity): Map<String, Any?> =
        mapOf(
            "status" to entity.status.name.lowercase(),
            "baselineRole" to entity.baselineRole.name.lowercase(),
            "displayName" to entity.displayName,
        )

    fun compositionLifecycle(composition: EventCompositionEntity?): Map<String, Any?> =
        mapOf(
            "publishedAt" to composition?.publishedAt?.toString(),
            "validatedAt" to composition?.validatedAt?.toString(),
        )

    fun slotAssignment(slot: EventCompositionSlotEntity?): Map<String, Any?> =
        mapOf(
            "roleKey" to slot?.roleKey,
            "slotIndex" to slot?.slotIndex,
            "seasonParticipantId" to slot?.seasonParticipantId?.toString(),
            "eventParticipantId" to slot?.eventParticipantId?.toString(),
            "participantId" to slot?.assignedParticipantId()?.toString(),
            "participationStatus" to slot?.participationStatus?.name?.lowercase(),
        )

    fun drawAssignments(slots: List<EventCompositionSlotEntity>): Map<String, Any?> {
        val byRole =
            slots
                .filter { it.hasAssignee() }
                .groupBy { it.roleKey }
                .mapValues { (_, roleSlots) ->
                    roleSlots
                        .sortedBy { it.slotIndex }
                        .map { slot ->
                            mapOf(
                                "slotIndex" to slot.slotIndex,
                                "participantId" to slot.assignedParticipantId()?.toString(),
                            )
                        }
                }
        return mapOf("assignmentsByRole" to byRole)
    }

    fun participationStatus(status: SlotParticipationStatus): Map<String, Any?> =
        mapOf("participationStatus" to status.name.lowercase())

    fun organizerGranted(granted: Boolean): Map<String, Any?> = mapOf("granted" to granted)

    fun participantMetadata(
        displayName: String,
        extra: Map<String, Any?> = emptyMap(),
    ): Map<String, Any?> = extra + ("displayName" to displayName)

    fun isActiveParticipant(status: ParticipantStatus): Boolean = status == ParticipantStatus.ACTIVE

    fun isActiveMembership(status: TroupeMembershipStatus): Boolean = status == TroupeMembershipStatus.ACTIVE
}

package com.hatcast.api.composition

import com.hatcast.api.composition.dto.MultiRoleOnEventWarningDto
import org.springframework.stereotype.Service

@Service
class MultiRoleOnEventWarningService {
    /**
     * Non-blocking hint when the same participant holds more than one role on one event.
     */
    fun warningsBySlotKey(
        slots: List<EventCompositionSlotEntity>,
    ): Map<Pair<String, Int>, MultiRoleOnEventWarningDto> {
        val slotsByParticipant =
            slots
                .filter { it.hasAssignee() }
                .groupBy { it.assignedParticipantId()!! }
                .filter { (_, group) -> group.map { it.roleKey }.distinct().size > 1 }

        if (slotsByParticipant.isEmpty()) {
            return emptyMap()
        }

        val result = mutableMapOf<Pair<String, Int>, MultiRoleOnEventWarningDto>()
        for ((_, participantSlots) in slotsByParticipant) {
            val roleKeys = participantSlots.map { it.roleKey }.distinct().sorted()
            for (slot in participantSlots) {
                val otherRoleKeys = roleKeys.filter { it != slot.roleKey }
                if (otherRoleKeys.isNotEmpty()) {
                    result[slot.roleKey to slot.slotIndex] =
                        MultiRoleOnEventWarningDto(otherRoleKeys = otherRoleKeys)
                }
            }
        }
        return result
    }
}

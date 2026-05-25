package com.hatcast.api.composition

import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.event.RoleTemplates
import java.util.UUID

/**
 * Authoritative rules for gap-fill mutations on a validated composition (story 6.9).
 */
object CompositionGapFillRules {
    fun hasEmptyRequiredSlot(
        roleSlots: Map<String, Int>,
        slots: List<EventCompositionSlotEntity>,
    ): Boolean {
        val normalized = RoleTemplates.normalize(roleSlots)
        val requiredRoles = AvailabilityRoleRules.rolesRequiredForEvent(normalized)
        val slotsByRole = slots.groupBy { it.roleKey }
        for (roleKey in requiredRoles) {
            val requiredCount = normalized[roleKey] ?: 0
            if (requiredCount <= 0) continue
            val roleSlots = slotsByRole[roleKey].orEmpty().associateBy { it.slotIndex }
            for (index in 0 until requiredCount) {
                if (roleSlots[index]?.hasAssignee() != true) {
                    return true
                }
            }
        }
        return false
    }

    fun hasEmptySlotForRole(
        roleKey: String,
        roleSlots: Map<String, Int>,
        slots: List<EventCompositionSlotEntity>,
    ): Boolean {
        val normalized = RoleTemplates.normalize(roleSlots)
        val requiredCount = normalized[roleKey] ?: return false
        if (requiredCount <= 0) return false
        val roleSlotsByIndex = slots.filter { it.roleKey == roleKey }.associateBy { it.slotIndex }
        for (index in 0 until requiredCount) {
            if (roleSlotsByIndex[index]?.hasAssignee() != true) {
                return true
            }
        }
        return false
    }

    fun firstEmptySlotIndexForRole(
        roleKey: String,
        roleSlots: Map<String, Int>,
        slots: List<EventCompositionSlotEntity>,
    ): Int? {
        val normalized = RoleTemplates.normalize(roleSlots)
        val requiredCount = normalized[roleKey] ?: return null
        if (requiredCount <= 0) return null
        val roleSlotsByIndex = slots.filter { it.roleKey == roleKey }.associateBy { it.slotIndex }
        for (index in 0 until requiredCount) {
            if (roleSlotsByIndex[index]?.hasAssignee() != true) {
                return index
            }
        }
        return null
    }

    fun isTargetSlotEmpty(
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        slotRepository: EventCompositionSlotRepository,
    ): Boolean {
        val slot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        return slot?.hasAssignee() != true
    }
}

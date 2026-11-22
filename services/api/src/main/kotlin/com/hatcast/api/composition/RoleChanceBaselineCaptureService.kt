package com.hatcast.api.composition

import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

/** Only new compositions can establish reliable first-selection provenance. */
@Service
class RoleChanceBaselineCaptureService(
    private val events: ChanceBaselineEventRepository,
    private val baselines: RoleChanceBaselineRepository,
    private val entries: RoleChanceBaselineEntryRepository,
    private val reconstructions: RoleChanceReconstructionRepository,
) {
    data class Prepared(val roles: Map<String, List<Pair<UUID, Int>>>, val at: Instant)

    /** A successful draw starts a new reference for all available volunteers of its role. */
    fun replaceAfterDraw(eventId: UUID, roleKey: String, prepared: Prepared) {
        val values = requireNotNull(prepared.roles[roleKey])
        supersede(eventId, roleKey, prepared.at)
        val previous = entries.findByIdEventIdAndIdRoleKey(eventId, roleKey).associateBy { it.id.participantId }
        baselines.saveAndFlush(RoleChanceBaselineEntity(RoleChanceBaselineId(eventId, roleKey), prepared.at))
        val next = values.toMap()
        entries.deleteAll(previous.filterKeys { it !in next }.values)
        for ((participantId, percent) in values) {
            val entry = previous[participantId]
            if (entry != null) entry.chancePercent = percent
            else entries.save(RoleChanceBaselineEntryEntity(RoleChanceBaselineEntryId(eventId, roleKey, participantId), percent))
        }
    }

    private fun supersede(eventId: UUID, roleKey: String, at: Instant) {
        reconstructions.findById(RoleChanceBaselineId(eventId, roleKey)).ifPresent {
            if (it.supersededAt == null) {
                it.supersededAt = at
                reconstructions.save(it)
            }
        }
    }

    fun persist(eventId: UUID, prepared: Prepared?, roles: Set<String>, newComposition: Boolean) {
        if (newComposition && !events.existsById(eventId)) events.save(ChanceBaselineEventEntity(eventId))
        if (!newComposition && !events.existsById(eventId)) return
        for (roleKey in roles) {
            val id = RoleChanceBaselineId(eventId, roleKey)
            if (baselines.existsById(id)) continue
            val values = prepared?.roles?.get(roleKey)
            // A permanent unavailable marker prevents a later operation from being
            // misrepresented as the first selection when capture was impossible.
            baselines.saveAndFlush(RoleChanceBaselineEntity(id, prepared?.at?.takeIf { values != null }))
            if (values != null) supersede(eventId, roleKey, prepared!!.at)
            if (values != null) entries.saveAll(values.map { (participantId, percent) -> RoleChanceBaselineEntryEntity(RoleChanceBaselineEntryId(eventId, roleKey, participantId), percent) })
        }
    }
}

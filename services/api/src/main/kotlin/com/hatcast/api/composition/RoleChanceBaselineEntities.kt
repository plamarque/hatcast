package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "event_chance_baseline_events")
class ChanceBaselineEventEntity(@Id @Column(name = "event_id") val eventId: UUID)
interface ChanceBaselineEventRepository : JpaRepository<ChanceBaselineEventEntity, UUID>

@Embeddable
data class RoleChanceBaselineId(@Column(name = "event_id") val eventId: UUID, @Column(name = "role_key") val roleKey: String) : Serializable
@Entity
@Table(name = "event_role_chance_baselines")
class RoleChanceBaselineEntity(@EmbeddedId val id: RoleChanceBaselineId, @Column(name = "captured_at") val capturedAt: Instant?)
interface RoleChanceBaselineRepository : JpaRepository<RoleChanceBaselineEntity, RoleChanceBaselineId> {
    fun findByIdEventId(eventId: UUID): List<RoleChanceBaselineEntity>
}

@Embeddable
data class RoleChanceBaselineEntryId(@Column(name = "event_id") val eventId: UUID, @Column(name = "role_key") val roleKey: String, @Column(name = "participant_id") val participantId: UUID) : Serializable
@Entity
@Table(name = "event_role_chance_baseline_entries")
class RoleChanceBaselineEntryEntity(@EmbeddedId val id: RoleChanceBaselineEntryId, @Column(name = "chance_percent") var chancePercent: Int)
interface RoleChanceBaselineEntryRepository : JpaRepository<RoleChanceBaselineEntryEntity, RoleChanceBaselineEntryId> {
    fun findByIdEventId(eventId: UUID): List<RoleChanceBaselineEntryEntity>
    fun findByIdEventIdAndIdRoleKey(eventId: UUID, roleKey: String): List<RoleChanceBaselineEntryEntity>
}

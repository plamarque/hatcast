package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

@Entity
@Table(name = "event_role_chance_reconstructions")
class RoleChanceReconstructionEntity(
    @EmbeddedId val id: RoleChanceBaselineId,
    @Column(name = "estimated_at") val estimatedAt: Instant,
    @Column(name = "evidence") val evidence: String,
    @Column(name = "assumptions") val assumptions: String,
    @Column(name = "superseded_at") var supersededAt: Instant? = null,
)

interface RoleChanceReconstructionRepository : JpaRepository<RoleChanceReconstructionEntity, RoleChanceBaselineId> {
    fun findByIdEventId(eventId: java.util.UUID): List<RoleChanceReconstructionEntity>
}

@Entity
@Table(name = "event_role_chance_reconstruction_entries")
class RoleChanceReconstructionEntryEntity(
    @EmbeddedId val id: RoleChanceBaselineEntryId,
    @Column(name = "chance_percent") val chancePercent: Int,
)

interface RoleChanceReconstructionEntryRepository : JpaRepository<RoleChanceReconstructionEntryEntity, RoleChanceBaselineEntryId> {
    fun findByIdEventId(eventId: java.util.UUID): List<RoleChanceReconstructionEntryEntity>
}

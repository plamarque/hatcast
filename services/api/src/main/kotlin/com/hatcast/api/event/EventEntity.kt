package com.hatcast.api.event

import com.hatcast.api.season.SeasonEntity
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "events")
class EventEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    val season: SeasonEntity,
    @Column(nullable = false, length = 255)
    var title: String,
    @Column(nullable = false, length = 128)
    var slug: String,
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    @Column(length = 512)
    var location: String? = null,
    @Column(name = "starts_at", nullable = false)
    var startsAt: Instant,
    @Column(nullable = false)
    var archived: Boolean = false,
    @Column(name = "template_type", nullable = false, length = 32)
    var templateType: String = EventTypes.DEFAULT_LEGACY,
    @Convert(converter = RoleSlotsJsonConverter::class)
    @Column(name = "role_slots", nullable = false, length = 4096)
    var roleSlots: Map<String, Int> = RoleTemplates.emptySlots(),
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
    /** Catégorie spectacle ; NULL = principal. */
    @Column(name = "category", length = 64)
    var category: String? = null,
    /** NULL = brouillon (dispos fermées) ; non-null = collecte ouverte (Story 3.21). */
    @Column(name = "availability_opened_at")
    var availabilityOpenedAt: Instant? = null,
)

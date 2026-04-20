package com.hatcast.api.season

import com.hatcast.api.troupe.TroupeEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "seasons")
class SeasonEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "troupe_id", nullable = false)
    val troupe: TroupeEntity,
    @Column(nullable = false, length = 128)
    var slug: String,
    @Column(nullable = false, length = 255)
    var title: String,
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    @Column(name = "start_date")
    var startDate: LocalDate? = null,
    @Column(name = "end_date")
    var endDate: LocalDate? = null,
    @Column(nullable = false)
    var archived: Boolean = false,
    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = false,
    @Column(name = "event_count", nullable = false)
    var eventCount: Int = 0,
    @Column(name = "participant_count", nullable = false)
    var participantCount: Int = 0,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)

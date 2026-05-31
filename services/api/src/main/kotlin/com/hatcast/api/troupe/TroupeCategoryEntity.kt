package com.hatcast.api.troupe

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "troupe_categories",
    uniqueConstraints = [
        UniqueConstraint(name = "troupe_categories_troupe_slug", columnNames = ["troupe_id", "slug"]),
    ],
)
class TroupeCategoryEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "troupe_id", nullable = false)
    val troupe: TroupeEntity,
    @Column(nullable = false, length = 64)
    val slug: String,
    @Column(nullable = false, length = 128)
    val label: String,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)

package com.hatcast.api.troupe

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "troupes")
class TroupeEntity(
    @Id
    val id: UUID,
    @Column(nullable = false, length = 255)
    var name: String,
    @Column(nullable = false, unique = true, length = 128)
    var slug: String,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Enumerated(EnumType.STRING)
    @Column(name = "join_policy", nullable = false, length = 16)
    var joinPolicy: TroupeJoinPolicy = TroupeJoinPolicy.OPEN,
    @Column(name = "is_demo", nullable = false)
    var isDemo: Boolean = false,
)

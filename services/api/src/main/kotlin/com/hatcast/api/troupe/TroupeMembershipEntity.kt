package com.hatcast.api.troupe

import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "troupe_memberships")
class TroupeMembershipEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "troupe_id", nullable = false)
    val troupe: TroupeEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    var user: UserEntity? = null,
    @Column(name = "normalized_email", length = 320)
    var normalizedEmail: String? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    var status: TroupeMembershipStatus,
    @Enumerated(EnumType.STRING)
    @Column(name = "baseline_role", nullable = false, length = 32)
    var baselineRole: TroupeBaselineRole = TroupeBaselineRole.MEMBER,
    @Column(name = "display_name", nullable = false, length = 255)
    var displayName: String,
    @Convert(converter = PreferredRoleKeysJsonConverter::class)
    @Column(name = "preferred_role_keys", nullable = false, length = 1024)
    var preferredRoleKeys: List<String> = emptyList(),
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)

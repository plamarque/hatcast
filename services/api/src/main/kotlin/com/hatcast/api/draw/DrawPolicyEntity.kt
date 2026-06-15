package com.hatcast.api.draw

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "draw_policies")
class DrawPolicyEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "troupe_id", nullable = false)
    val troupeId: UUID,
    @Column(name = "season_id")
    val seasonId: UUID? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    val scope: DrawPolicyScope,
    /** Set to [troupeId] when [scope] is TROUPE; enforces at-most-one troupe policy. */
    @Column(name = "troupe_scope_key")
    val troupeScopeKey: UUID? = null,
    /** Set to [seasonId] when [scope] is SEASON; enforces at-most-one season policy. */
    @Column(name = "season_scope_key")
    val seasonScopeKey: UUID? = null,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "default_rule", nullable = false, columnDefinition = "jsonb")
    var defaultRule: DrawDefaultRule,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category_rules", nullable = false, columnDefinition = "jsonb")
    var categoryRules: List<DrawCategoryRule> = emptyList(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)

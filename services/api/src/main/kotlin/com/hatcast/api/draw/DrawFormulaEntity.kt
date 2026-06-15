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
@Table(name = "draw_formulas")
class DrawFormulaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "troupe_id", nullable = false)
    val troupeId: UUID,
    @Column(nullable = false, length = 255)
    var name: String,
    @Column
    var description: String? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    var status: DrawFormulaStatus,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "factor_config", nullable = false, columnDefinition = "jsonb")
    var factorConfig: DrawFactorConfig,
    @Column(nullable = false)
    var version: Int = 1,
    @Column(name = "is_system", nullable = false)
    val isSystem: Boolean = false,
    /** Set to [troupeId] when [isSystem] is true; enforces at-most-one system formula per troupe. */
    @Column(name = "system_troupe_key")
    val systemTroupeKey: UUID? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)

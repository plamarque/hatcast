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
    @Column(name = "description")
    var description: String? = null,
    @Column(name = "logo_storage_key", length = 512)
    var logoStorageKey: String? = null,
    @Column(name = "logo_updated_at")
    var logoUpdatedAt: Instant? = null,
    /**
     * When true, troupe appears in `GET /v1/public/troupes` (FR32 freemium default listed).
     * Admin opt-out UI deferred — column + default only in Story 4.1.
     */
    @Column(name = "listed_in_directory", nullable = false)
    var listedInDirectory: Boolean = true,
    /** Libellé affiché pour les spectacles sans `category` (compartiment principal). */
    @Column(name = "default_category_label", nullable = false, length = 128)
    var defaultCategoryLabel: String = DEFAULT_CATEGORY_LABEL,
) {
    companion object {
        const val DEFAULT_CATEGORY_LABEL = "Spectacles ordinaires"
    }
}

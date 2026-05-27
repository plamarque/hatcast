package com.hatcast.api.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
class UserEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    /** Sujet Google OIDC (slice GIS / ADR-0008). Null si compte créé uniquement via Identity Platform email/password. */
    @Column(name = "google_sub", nullable = true, unique = true, length = 255)
    var googleSub: String? = null,
    /** UID Identity Platform / Firebase Auth (`verifyIdToken`). */
    @Column(name = "idp_uid", nullable = true, unique = true, length = 128)
    var idpUid: String? = null,
    @Column(length = 320)
    var email: String? = null,
    @Column(name = "display_name", length = 255)
    var displayName: String? = null,
    /** Identifiant URL global (`/membre/:userSlug`). Story 16.1. */
    @Column(length = 128, nullable = true)
    var slug: String? = null,
    /** Clé de stockage interne (LocalAvatarStorage / GCS), pas une URL publique. */
    @Column(name = "avatar_url", length = 2048)
    var avatarUrl: String? = null,
    @Column(name = "avatar_updated_at", nullable = true)
    var avatarUpdatedAt: Instant? = null,
    /** Null pour les comptes importés (migration) jusqu'à la première connexion V2. */
    @Column(name = "activated_at", nullable = true)
    var activatedAt: Instant? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
) {
    @PrePersist
    fun assignSlugIfMissing() {
        if (slug.isNullOrBlank()) {
            slug = "user-${id.toString().replace("-", "").take(12)}"
        }
    }
}

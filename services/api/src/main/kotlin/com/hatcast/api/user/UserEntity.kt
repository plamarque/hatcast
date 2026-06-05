package com.hatcast.api.user

import com.hatcast.api.notification.NotificationCategory
import com.hatcast.api.notification.NotificationPreference
import com.hatcast.api.troupe.PreferredRoleKeysJsonConverter
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
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
    /** Pseudo membre partagé entre troupes (story 17.33). Null → résolution via displayName/email. */
    @Column(name = "member_display_name", length = 255)
    var memberDisplayName: String? = null,
    /** Genre optionnel (story 2.12). Null → `non_specified` en lecture. */
    @Column(name = "gender", length = 32)
    var gender: MemberGender? = null,
    @Convert(converter = PreferredRoleKeysJsonConverter::class)
    @Column(name = "preferred_role_keys", nullable = false, length = 1024)
    var preferredRoleKeys: List<String> = emptyList(),
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
    /** Global browser push opt-in (story 8.1). Per-device subscriptions in user_push_subscriptions. */
    @Column(name = "push_notifications_enabled", nullable = false)
    var pushNotificationsEnabled: Boolean = false,
    /** Account-level opt-out category preferences (story 8.2). Missing categories default to enabled. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_preferences", nullable = false, columnDefinition = "jsonb")
    var notificationPreferences: Map<NotificationCategory, NotificationPreference> = emptyMap(),
    /** Self-service account deletion (story 1.7). Null = active account. */
    @Column(name = "deleted_at", nullable = true)
    var deletedAt: Instant? = null,
) {
    @PrePersist
    fun assignSlugIfMissing() {
        if (slug.isNullOrBlank()) {
            slug = "user-${id.toString().replace("-", "").take(12)}"
        }
    }
}

package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "season_participants")
class SeasonParticipantEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    val season: SeasonEntity,
    @Column(name = "display_name", nullable = false, length = 255)
    var displayName: String,
    @Column(name = "normalized_email", length = 320)
    var normalizedEmail: String? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: UserEntity? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "troupe_membership_id")
    var troupeMembership: TroupeMembershipEntity? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    var status: ParticipantStatus = ParticipantStatus.ACTIVE,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
    @Column(name = "removed_at")
    var removedAt: Instant? = null,
    @Enumerated(EnumType.STRING)
    @Column(name = "removal_source", length = 32)
    var removalSource: SeasonParticipantRemovalSource? = null,
    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    var gender: MemberGender? = null,
) {
    fun kind(): ParticipantKind =
        when {
            troupeMembership != null -> ParticipantKind.MEMBER
            user != null -> ParticipantKind.LINKED
            normalizedEmail.isNullOrBlank() -> ParticipantKind.NAME_ONLY
            else -> ParticipantKind.MANAGED
        }
}

@Entity
@Table(name = "event_participants")
class EventParticipantEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    val event: com.hatcast.api.event.EventEntity,
    @Column(name = "display_name", nullable = false, length = 255)
    var displayName: String,
    @Column(name = "normalized_email", length = 320)
    var normalizedEmail: String? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: UserEntity? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_participant_id")
    var seasonParticipant: SeasonParticipantEntity? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    var status: ParticipantStatus = ParticipantStatus.ACTIVE,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
    @Column(name = "removed_at")
    var removedAt: Instant? = null,
    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    var gender: MemberGender? = null,
) {
    fun kind(): ParticipantKind =
        when {
            user != null -> ParticipantKind.LINKED
            normalizedEmail.isNullOrBlank() -> ParticipantKind.NAME_ONLY
            else -> ParticipantKind.MANAGED
        }
}

@Embeddable
data class EventParticipantExclusionId(
    @Column(name = "event_id")
    val eventId: UUID,
    @Column(name = "season_participant_id")
    val seasonParticipantId: UUID,
) : Serializable

@Entity
@Table(name = "event_participant_exclusions")
class EventParticipantExclusionEntity(
    @EmbeddedId
    val id: EventParticipantExclusionId,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false, insertable = false, updatable = false)
    val event: com.hatcast.api.event.EventEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_participant_id", nullable = false, insertable = false, updatable = false)
    val seasonParticipant: SeasonParticipantEntity,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)

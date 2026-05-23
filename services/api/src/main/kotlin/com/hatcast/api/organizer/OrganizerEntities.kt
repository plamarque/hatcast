package com.hatcast.api.organizer

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.MapsId
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Embeddable
data class SeasonOrganizerId(
    @Column(name = "season_id")
    var seasonId: UUID? = null,
    @Column(name = "user_id")
    var userId: UUID? = null,
) : Serializable

@Entity
@Table(name = "season_organizers")
class SeasonOrganizerEntity(
    @EmbeddedId
    var id: SeasonOrganizerId = SeasonOrganizerId(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("seasonId")
    @JoinColumn(name = "season_id", nullable = false)
    var season: SeasonEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    var user: UserEntity,
    @Column(name = "granted_at", nullable = false)
    var grantedAt: Instant = Instant.now(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by_user_id")
    var grantedBy: UserEntity? = null,
) {
    constructor(
        season: SeasonEntity,
        user: UserEntity,
        grantedAt: Instant,
        grantedBy: UserEntity?,
    ) : this(
        id = SeasonOrganizerId(season.id, user.id),
        season = season,
        user = user,
        grantedAt = grantedAt,
        grantedBy = grantedBy,
    )
}

@Embeddable
data class EventOrganizerId(
    @Column(name = "event_id")
    var eventId: UUID? = null,
    @Column(name = "user_id")
    var userId: UUID? = null,
) : Serializable

@Entity
@Table(name = "event_organizers")
class EventOrganizerEntity(
    @EmbeddedId
    var id: EventOrganizerId = EventOrganizerId(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("eventId")
    @JoinColumn(name = "event_id", nullable = false)
    var event: EventEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    var user: UserEntity,
    @Column(name = "granted_at", nullable = false)
    var grantedAt: Instant = Instant.now(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by_user_id")
    var grantedBy: UserEntity? = null,
) {
    constructor(
        event: EventEntity,
        user: UserEntity,
        grantedAt: Instant,
        grantedBy: UserEntity?,
    ) : this(
        id = EventOrganizerId(event.id, user.id),
        event = event,
        user = user,
        grantedAt = grantedAt,
        grantedBy = grantedBy,
    )
}

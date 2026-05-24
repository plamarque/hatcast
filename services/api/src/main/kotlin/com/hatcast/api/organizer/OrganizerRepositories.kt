package com.hatcast.api.organizer

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SeasonOrganizerRepository : JpaRepository<SeasonOrganizerEntity, SeasonOrganizerId> {
    fun findBySeason_IdOrderByGrantedAtAsc(seasonId: UUID): List<SeasonOrganizerEntity>

    fun findBySeason_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): SeasonOrganizerEntity?

    fun existsBySeason_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): Boolean
}

interface EventOrganizerRepository : JpaRepository<EventOrganizerEntity, EventOrganizerId> {
    fun findByEvent_IdOrderByGrantedAtAsc(eventId: UUID): List<EventOrganizerEntity>

    fun findByEvent_Season_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): List<EventOrganizerEntity>

    fun findByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): EventOrganizerEntity?

    fun existsByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): Boolean

    fun findByEvent_IdInAndUser_Id(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): List<EventOrganizerEntity>
}

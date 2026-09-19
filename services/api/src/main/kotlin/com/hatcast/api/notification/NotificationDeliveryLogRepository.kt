package com.hatcast.api.notification

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface NotificationDeliveryLogRepository : JpaRepository<NotificationDeliveryLogEntity, UUID> {
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM NotificationDeliveryLogEntity l WHERE l.eventId = :eventId")
    fun deleteByEventId(@Param("eventId") eventId: UUID): Int

    @Query(
        """
        SELECT l FROM NotificationDeliveryLogEntity l
        WHERE l.eventId = :eventId
          AND l.userId IN :userIds
          AND l.intent IN :intents
          AND l.status IN :statuses
        """,
    )
    fun findByEventIdAndUserIdInAndIntentInAndStatusIn(
        @Param("eventId") eventId: UUID,
        @Param("userIds") userIds: Collection<UUID>,
        @Param("intents") intents: Collection<NotificationIntent>,
        @Param("statuses") statuses: Collection<NotificationDeliveryStatus>,
    ): List<NotificationDeliveryLogEntity>
}

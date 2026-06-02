package com.hatcast.api.notification

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface UserPushSubscriptionRepository : JpaRepository<UserPushSubscriptionEntity, UUID> {
    fun findByUserId(userId: UUID): List<UserPushSubscriptionEntity>

    fun findByEndpoint(endpoint: String): UserPushSubscriptionEntity?

    fun findByUserIdAndEndpoint(
        userId: UUID,
        endpoint: String,
    ): UserPushSubscriptionEntity?

    fun countByUserId(userId: UUID): Long

    fun existsByUserId(userId: UUID): Boolean

    @Modifying
    @Query("DELETE FROM UserPushSubscriptionEntity s WHERE s.user.id = :userId")
    fun deleteAllByUserId(
        @Param("userId") userId: UUID,
    ): Int

    @Modifying
    @Query("DELETE FROM UserPushSubscriptionEntity s WHERE s.user.id = :userId AND s.endpoint = :endpoint")
    fun deleteByUserIdAndEndpoint(
        @Param("userId") userId: UUID,
        @Param("endpoint") endpoint: String,
    ): Int
}

package com.hatcast.api.notification

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NotificationDeliveryLogRepository : JpaRepository<NotificationDeliveryLogEntity, UUID>

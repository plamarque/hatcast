package com.hatcast.api.share

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventManualAvailabilityNudgeRepository : JpaRepository<EventManualAvailabilityNudgeEntity, UUID>

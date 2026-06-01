package com.hatcast.api.audit

import com.hatcast.api.audit.dto.PagedAuditEventsResponse
import com.hatcast.api.auth.SessionUserPrincipal
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/v1/audit")
class AuditEventController(
    private val auditEventService: AuditEventService,
) {
    @GetMapping("/events")
    fun listEvents(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
        @RequestParam(required = false) troupeId: UUID?,
        @RequestParam(required = false) seasonId: UUID?,
        @RequestParam(required = false) eventId: UUID?,
        @RequestParam(required = false) actionType: AuditActionType?,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(required = false) participantSeasonParticipantId: UUID?,
        @RequestParam(required = false) participantEventParticipantId: UUID?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "25") size: Int,
    ): PagedAuditEventsResponse =
        auditEventService.listEvents(
            principal = principal,
            troupeId = troupeId,
            seasonId = seasonId,
            eventId = eventId,
            actionType = actionType,
            from = from,
            to = to,
            participantSeasonParticipantId = participantSeasonParticipantId,
            participantEventParticipantId = participantEventParticipantId,
            page = page,
            size = size,
        )
}

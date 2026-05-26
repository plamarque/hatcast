package com.hatcast.api.share

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.share.dto.ShareNotifyRequestDto
import com.hatcast.api.share.dto.ShareNotifyResponseDto
import com.hatcast.api.share.dto.ShareRecipientsResponseDto
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons/{seasonId}/events/{eventId}")
class ShareRecipientsController(
    private val shareRecipientsService: ShareRecipientsService,
) {
    @GetMapping("/share-recipients")
    fun getShareRecipients(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @RequestParam intent: String,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): ShareRecipientsResponseDto =
        shareRecipientsService.getRecipients(seasonId, eventId, intent, principal)

    @PostMapping("/share-recipients/notify")
    fun notifyShareRecipients(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: ShareNotifyRequestDto,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): ShareNotifyResponseDto =
        shareRecipientsService.notifyRecipients(seasonId, eventId, body, principal)
}

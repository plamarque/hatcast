package com.hatcast.api.inbox

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.inbox.dto.MeInboxResponse
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/me/inbox")
class MeInboxController(
  private val meInboxService: MeInboxService,
) {
  @GetMapping
  fun getInbox(
    @AuthenticationPrincipal principal: SessionUserPrincipal,
  ): MeInboxResponse = meInboxService.getInbox(principal)
}

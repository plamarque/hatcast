package com.hatcast.api.agenda

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.agenda.dto.UserAgendaResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/v1/me/agenda")
class UserAgendaController(
  private val userAgendaService: UserAgendaService,
) {
  @GetMapping
  fun list(
    @AuthenticationPrincipal principal: SessionUserPrincipal,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "50") size: Int,
    @RequestParam(defaultValue = "upcoming") scope: String,
    @RequestParam(required = false) troupeId: UUID?,
    @RequestParam(required = false) seasonId: UUID?,
  ): UserAgendaResponse {
    val parsedScope =
      when (scope.lowercase()) {
        "upcoming" -> UserAgendaScope.UPCOMING
        else ->
          throw ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "scope doit être upcoming",
          )
      }
    return userAgendaService.list(
      principal = principal,
      page = page,
      size = size,
      scope = parsedScope,
      troupeId = troupeId,
      seasonId = seasonId,
    )
  }
}

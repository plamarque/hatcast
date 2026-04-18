package com.hatcast.api.auth

import com.hatcast.api.auth.dto.AuthSessionResponse
import com.hatcast.api.auth.dto.GoogleSignInRequest
import com.hatcast.api.auth.dto.UserSummaryDto
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/v1/auth")
class AuthController(
    private val googleIdTokenService: GoogleIdTokenService,
    private val userRepository: UserRepository,
    private val securityContextRepository: SecurityContextRepository,
) {
    @PostMapping("/google")
    fun signInWithGoogle(
        @Valid @RequestBody body: GoogleSignInRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<AuthSessionResponse> {
        val jwt = googleIdTokenService.validateAndParse(body.idToken)
        val sub =
            jwt.subject
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val email = jwt.getClaimAsString("email")
        val name = jwt.getClaimAsString("name")

        val existing = userRepository.findByGoogleSub(sub)
        val user =
            if (existing != null) {
                existing.email = email
                existing.displayName = name ?: existing.displayName
                existing.updatedAt = Instant.now()
                userRepository.save(existing)
            } else {
                userRepository.save(
                    UserEntity(
                        googleSub = sub,
                        email = email,
                        displayName = name,
                    ),
                )
            }

        val principal =
            SessionUserPrincipal(
                userId = user.id,
                googleSub = user.googleSub,
                email = user.email,
            )
        val authentication =
            UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.authorities,
            )
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
        securityContextRepository.saveContext(context, request, response)

        return ResponseEntity.ok(
            AuthSessionResponse(
                UserSummaryDto(
                    id = user.id,
                    email = user.email,
                    displayName = user.displayName,
                ),
            ),
        )
    }

    @GetMapping("/me")
    fun me(): ResponseEntity<AuthSessionResponse> {
        val auth = SecurityContextHolder.getContext().authentication
        val principal = auth?.principal
        if (principal !is SessionUserPrincipal) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }
        val user =
            userRepository.findById(principal.userId).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        return ResponseEntity.ok(
            AuthSessionResponse(
                UserSummaryDto(
                    id = user.id,
                    email = user.email,
                    displayName = user.displayName,
                ),
            ),
        )
    }

    @PostMapping("/logout")
    fun logout(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<Void> {
        SecurityContextLogoutHandler().logout(request, response, null)
        return ResponseEntity.noContent().build()
    }
}

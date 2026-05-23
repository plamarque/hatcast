package com.hatcast.api.auth

import com.hatcast.api.auth.dto.AuthSessionResponse
import com.hatcast.api.auth.dto.GoogleSignInRequest
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.avatar.GooglePictureSessionKeys
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.beans.factory.ObjectProvider
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
import org.springframework.web.server.ResponseStatusException
import org.springframework.core.env.Environment
import org.springframework.security.oauth2.jwt.JwtException
import com.google.firebase.FirebaseApp
import java.time.Instant

@RestController
@RequestMapping("/v1/auth")
class AuthController(
    private val googleIdTokenService: GoogleIdTokenService,
    private val userRepository: UserRepository,
    private val authUserLinkService: AuthUserLinkService,
    private val securityContextRepository: SecurityContextRepository,
    private val idpIdTokenVerifier: ObjectProvider<IdpIdTokenVerifier>,
    private val environment: Environment,
    private val authSessionPolicy: AuthSessionPolicy,
    private val avatarService: AvatarService,
    private val platformAdminService: PlatformAdminService,
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
        val picture = jwt.getClaimAsString("picture")

        val user = authUserLinkService.resolveGoogleSignInUser(sub, email, name)

        val principal =
            SessionUserPrincipal(
                userId = user.id,
                googleSub = user.googleSub,
                idpUid = user.idpUid,
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
        authSessionPolicy.applyToSession(request.session, body.rememberMe)

        if (!picture.isNullOrBlank()) {
            request.session.setAttribute(GooglePictureSessionKeys.PICTURE_URL, picture)
        }

        val userSummary = avatarService.toUserSummary(user)
        val googlePictureForPrompt =
            if (userSummary.avatarUrl == null && !picture.isNullOrBlank()) picture else null

        return ResponseEntity.ok(
            toAuthSessionResponse(
                user = userSummary,
                principal = principal,
                googlePictureUrl = googlePictureForPrompt,
            ),
        )
    }

    /**
     * Établit une session applicative après connexion / inscription côté client Identity Platform (email+mot de passe ou autre),
     * via un ID token vérifié par le serveur (ADR-0010).
     */
    @PostMapping("/idp")
    fun signInWithIdentityPlatformToken(
        @Valid @RequestBody body: GoogleSignInRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<AuthSessionResponse> {
        val verifier =
            idpIdTokenVerifier.ifAvailable
                ?: throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)

        if (!environment.activeProfiles.contains("test") && FirebaseApp.getApps().isEmpty()) {
            throw ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Identity Platform: configurez GOOGLE_APPLICATION_CREDENTIALS (JSON compte de service, même projet GCP que les tokens).",
            )
        }

        val payload =
            try {
                verifier.verify(body.idToken)
            } catch (ex: Exception) {
                throw JwtException("Invalid Identity Platform ID token", ex)
            }

        val user =
            authUserLinkService.resolveIdpSignInUser(
                idpUid = payload.uid,
                email = payload.email,
                displayName = payload.displayName,
            )

        val principal =
            SessionUserPrincipal(
                userId = user.id,
                googleSub = user.googleSub,
                idpUid = user.idpUid,
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
        authSessionPolicy.applyToSession(request.session, body.rememberMe)

        return ResponseEntity.ok(
            toAuthSessionResponse(
                user = avatarService.toUserSummary(user),
                principal = principal,
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
        val user = userRepository.findById(principal.userId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        return ResponseEntity.ok(
            toAuthSessionResponse(
                user = avatarService.toUserSummary(user),
                principal = principal,
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

    private fun toAuthSessionResponse(
        user: com.hatcast.api.auth.dto.UserSummaryDto,
        principal: SessionUserPrincipal,
        googlePictureUrl: String? = null,
    ): AuthSessionResponse =
        AuthSessionResponse(
            user = user,
            googlePictureUrl = googlePictureUrl,
            platformAdmin = platformAdminService.isPlatformAdmin(principal),
        )
}

package com.hatcast.api.avatar

import com.fasterxml.jackson.annotation.JsonProperty
import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.dto.AuthSessionResponse
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/v1/auth/me/avatar")
class ProfileAvatarController(
    private val avatarService: AvatarService,
    private val platformAdminService: PlatformAdminService,
) {
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadAvatar(
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): AuthSessionResponse {
        val user =
            avatarService.uploadAvatar(
                principal.userId,
                file.bytes,
                file.contentType,
            )
        return avatarSessionResponse(user, principal)
    }

    @PostMapping("/google", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun importGoogleAvatar(
        @RequestBody(required = false) body: GoogleAvatarImportRequest?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
        session: HttpSession,
    ): AuthSessionResponse {
        val pictureUrl =
            body?.pictureUrl?.takeIf { it.isNotBlank() }
                ?: session.getAttribute(GooglePictureSessionKeys.PICTURE_URL) as? String
                ?: throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucune photo Google disponible.",
                )
        val user = avatarService.importGoogleAvatar(principal.userId, pictureUrl)
        return avatarSessionResponse(user, principal)
    }

    @DeleteMapping
    fun deleteAvatar(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): AuthSessionResponse {
        val user = avatarService.deleteAvatar(principal.userId)
        return avatarSessionResponse(user, principal)
    }

    private fun avatarSessionResponse(
        user: com.hatcast.api.auth.dto.UserSummaryDto,
        principal: SessionUserPrincipal,
    ): AuthSessionResponse =
        AuthSessionResponse(
            user = user,
            platformAdmin = platformAdminService.isPlatformAdmin(principal),
        )
}

@RestController
@RequestMapping("/v1/users")
class UserAvatarContentController(
    private val avatarService: AvatarService,
    private val userRepository: UserRepository,
    private val membershipRepository: com.hatcast.api.troupe.TroupeMembershipRepository,
) {
    @GetMapping("/{userId}/avatar")
    fun getAvatar(
        @PathVariable userId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): ResponseEntity<ByteArray> {
        if (!avatarService.canViewAvatar(
                principal.userId,
                userId,
            ) { viewerId, targetId ->
                membershipRepository.existsSharedActiveTroupe(viewerId, targetId)
            }
        ) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val user =
            userRepository.findById(userId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND)
            }
        val content =
            avatarService.readAvatarContent(user)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        return ResponseEntity
            .ok()
            .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
            .contentType(content.second)
            .body(content.first)
    }
}

data class GoogleAvatarImportRequest(
    @field:JsonProperty("pictureUrl") val pictureUrl: String? = null,
)

object GooglePictureSessionKeys {
    const val PICTURE_URL = "hatcast.googlePictureUrl"
}

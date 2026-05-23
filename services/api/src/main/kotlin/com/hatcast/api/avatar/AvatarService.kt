package com.hatcast.api.avatar

import com.hatcast.api.auth.dto.UserSummaryDto
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.net.URI
import java.time.Instant
import java.util.UUID

@Service
class AvatarService(
    private val userRepository: UserRepository,
    private val avatarStorage: AvatarStorage,
    private val avatarProperties: AvatarProperties,
    private val googlePictureFetcher: GooglePictureFetcher,
) {
    companion object {
        private val ALLOWED_CONTENT_TYPES =
            mapOf(
                "image/jpeg" to "jpg",
                "image/png" to "png",
                "image/webp" to "webp",
                "image/avif" to "avif",
            )

        fun publicAvatarUrl(
            userId: UUID,
            avatarUpdatedAt: Instant?,
        ): String? {
            if (avatarUpdatedAt == null) return null
            return "/v1/users/$userId/avatar?v=${avatarUpdatedAt.toEpochMilli()}"
        }

        fun normalizeGooglePictureUrl(url: String): String =
            url.replace(Regex("=s\\d+-c"), "=s96")

        fun validateGooglePictureHost(url: String) {
            val host =
                runCatching { URI.create(url).host?.lowercase() }
                    .getOrNull()
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "URL Google invalide.")
            if (!host.endsWith(".googleusercontent.com")) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "URL Google invalide.")
            }
        }
    }

    fun toUserSummary(user: UserEntity): UserSummaryDto =
        UserSummaryDto(
            id = user.id,
            email = user.email,
            displayName = user.displayName,
            avatarUrl = publicAvatarUrl(user.id, user.avatarUpdatedAt),
            hasGoogleAccount = user.googleSub != null,
        )

    @Transactional
    fun uploadAvatar(
        userId: UUID,
        bytes: ByteArray,
        contentType: String?,
    ): UserSummaryDto {
        validateUpload(bytes, contentType)
        val ext =
            ALLOWED_CONTENT_TYPES[contentType?.lowercase()]
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        val user = loadUser(userId)
        deleteStoredAvatar(user)
        val key = "avatars/$userId/${UUID.randomUUID()}.$ext"
        avatarStorage.store(key, bytes)
        user.avatarUrl = key
        user.avatarUpdatedAt = Instant.now()
        user.updatedAt = Instant.now()
        return toUserSummary(userRepository.save(user))
    }

    @Transactional
    fun importGoogleAvatar(
        userId: UUID,
        pictureUrl: String,
    ): UserSummaryDto {
        val user = loadUser(userId)
        if (user.googleSub == null) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Compte Google requis.")
        }
        validateGooglePictureHost(pictureUrl)
        val normalized = normalizeGooglePictureUrl(pictureUrl)
        val bytes =
            try {
                googlePictureFetcher.fetch(normalized)
            } catch (_: Exception) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible de récupérer la photo Google.",
                )
            }
        return uploadAvatar(userId, bytes, detectContentType(bytes))
    }

    @Transactional
    fun deleteAvatar(userId: UUID): UserSummaryDto {
        val user = loadUser(userId)
        deleteStoredAvatar(user)
        user.avatarUrl = null
        user.avatarUpdatedAt = null
        user.updatedAt = Instant.now()
        return toUserSummary(userRepository.save(user))
    }

    fun readAvatarContent(user: UserEntity): Pair<ByteArray, MediaType>? {
        val key = user.avatarUrl ?: return null
        val bytes = avatarStorage.read(key) ?: return null
        val mediaType = contentTypeFromKey(key)
        return bytes to mediaType
    }

    fun canViewAvatar(
        viewerId: UUID,
        targetUserId: UUID,
        shareActiveTroupe: (UUID, UUID) -> Boolean,
    ): Boolean {
        if (viewerId == targetUserId) return true
        return shareActiveTroupe(viewerId, targetUserId)
    }

    private fun validateUpload(
        bytes: ByteArray,
        contentType: String?,
    ) {
        if (bytes.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        }
        if (bytes.size > avatarProperties.maxBytes) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier trop volumineux (2 Mo max.)")
        }
        val declared =
            contentType?.lowercase()
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        if (!ALLOWED_CONTENT_TYPES.containsKey(declared)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        }
        val detected =
            detectContentTypeFromBytes(bytes)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        if (detected != declared) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        }
    }

    private fun deleteStoredAvatar(user: UserEntity) {
        val key = user.avatarUrl ?: return
        avatarStorage.delete(key)
    }

    private fun loadUser(userId: UUID): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }

    private fun detectContentType(bytes: ByteArray): String =
        detectContentTypeFromBytes(bytes)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")

    private fun detectContentTypeFromBytes(bytes: ByteArray): String? {
        if (bytes.size >= 3 && bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte()) {
            return "image/jpeg"
        }
        if (bytes.size >= 8 &&
            bytes[0] == 0x89.toByte() &&
            bytes[1] == 0x50.toByte() &&
            bytes[2] == 0x4E.toByte() &&
            bytes[3] == 0x47.toByte()
        ) {
            return "image/png"
        }
        if (bytes.size >= 12 &&
            bytes[0] == 0x52.toByte() &&
            bytes[1] == 0x49.toByte() &&
            bytes[2] == 0x46.toByte() &&
            bytes[3] == 0x46.toByte() &&
            bytes[8] == 0x57.toByte() &&
            bytes[9] == 0x45.toByte() &&
            bytes[10] == 0x42.toByte() &&
            bytes[11] == 0x50.toByte()
        ) {
            return "image/webp"
        }
        if (isAvif(bytes)) {
            return "image/avif"
        }
        return null
    }

    private fun isAvif(bytes: ByteArray): Boolean {
        if (bytes.size < 12) return false
        if (bytes[4] != 0x66.toByte() || bytes[5] != 0x74.toByte() ||
            bytes[6] != 0x79.toByte() || bytes[7] != 0x70.toByte()
        ) {
            return false
        }
        val majorBrand = String(bytes, 8, 4, Charsets.US_ASCII)
        return majorBrand == "avif" || majorBrand == "avis"
    }

    private fun contentTypeFromKey(key: String): MediaType {
        val ext = key.substringAfterLast('.', "")
        val type =
            when (ext.lowercase()) {
                "png" -> "image/png"
                "webp" -> "image/webp"
                "avif" -> "image/avif"
                else -> "image/jpeg"
            }
        return MediaType.parseMediaType(type)
    }
}

package com.hatcast.api.troupe

import com.hatcast.api.avatar.AvatarProperties
import com.hatcast.api.avatar.AvatarStorage
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeLogoService(
    private val troupeRepository: TroupeRepository,
    private val avatarStorage: AvatarStorage,
    private val avatarProperties: AvatarProperties,
) {
    companion object {
        private val ALLOWED_CONTENT_TYPES =
            mapOf(
                "image/jpeg" to "jpg",
                "image/png" to "png",
                "image/webp" to "webp",
                "image/avif" to "avif",
            )

        fun publicLogoUrl(
            troupeId: UUID,
            logoStorageKey: String?,
            logoUpdatedAt: Instant?,
        ): String? {
            if (logoStorageKey == null || logoUpdatedAt == null) return null
            return "/v1/public/troupes/$troupeId/logo?v=${logoUpdatedAt.toEpochMilli()}"
        }

        /** Authenticated read URL for troupe members (any troupe with a logo, including hidden from directory). */
        fun memberLogoUrl(
            troupeId: UUID,
            logoStorageKey: String?,
            logoUpdatedAt: Instant?,
        ): String? {
            if (logoStorageKey == null || logoUpdatedAt == null) return null
            return "/v1/troupes/$troupeId/logo?v=${logoUpdatedAt.toEpochMilli()}"
        }
    }

    @Transactional
    fun uploadLogo(
        troupeId: UUID,
        bytes: ByteArray,
        contentType: String?,
    ): TroupeEntity {
        validateUpload(bytes, contentType)
        val ext =
            ALLOWED_CONTENT_TYPES[contentType?.lowercase()]
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Format non pris en charge.")
        val troupe = loadTroupe(troupeId)
        deleteStoredLogo(troupe)
        val key = "troupe-logos/$troupeId/${UUID.randomUUID()}.$ext"
        avatarStorage.store(key, bytes)
        val now = Instant.now()
        troupe.logoStorageKey = key
        troupe.logoUpdatedAt = now
        return troupeRepository.save(troupe)
    }

    @Transactional
    fun deleteLogo(troupeId: UUID): TroupeEntity {
        val troupe = loadTroupe(troupeId)
        deleteStoredLogo(troupe)
        troupe.logoStorageKey = null
        troupe.logoUpdatedAt = null
        return troupeRepository.save(troupe)
    }

    @Transactional(readOnly = true)
    fun readPublicLogo(troupeId: UUID): Pair<ByteArray, MediaType>? {
        val troupe = troupeRepository.findByIdAndListedInDirectoryTrueAndIsDemoFalse(troupeId) ?: return null
        return readStoredLogo(troupe)
    }

    @Transactional(readOnly = true)
    fun readTroupeLogo(troupeId: UUID): Pair<ByteArray, MediaType>? {
        val troupe = troupeRepository.findById(troupeId).orElse(null) ?: return null
        return readStoredLogo(troupe)
    }

    private fun readStoredLogo(troupe: TroupeEntity): Pair<ByteArray, MediaType>? {
        val key = troupe.logoStorageKey ?: return null
        val bytes = avatarStorage.read(key) ?: return null
        return bytes to contentTypeFromKey(key)
    }

    private fun loadTroupe(troupeId: UUID): TroupeEntity =
        troupeRepository.findById(troupeId).orElse(null)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")

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

    private fun deleteStoredLogo(troupe: TroupeEntity) {
        val key = troupe.logoStorageKey ?: return
        avatarStorage.delete(key)
    }

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

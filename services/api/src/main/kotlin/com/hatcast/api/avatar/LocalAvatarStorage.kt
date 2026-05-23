package com.hatcast.api.avatar

import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import kotlin.io.path.createDirectories
import kotlin.io.path.exists
import kotlin.io.path.outputStream

@Component
class LocalAvatarStorage(
    private val properties: AvatarProperties,
) : AvatarStorage {
    private fun resolve(key: String): Path = Path.of(properties.localBasePath, key)

    override fun store(
        key: String,
        bytes: ByteArray,
    ) {
        val path = resolve(key)
        path.parent?.createDirectories()
        Files.write(path, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)
    }

    override fun read(key: String): ByteArray? {
        val path = resolve(key)
        if (!path.exists()) return null
        return Files.readAllBytes(path)
    }

    override fun delete(key: String) {
        val path = resolve(key)
        if (path.exists()) {
            Files.deleteIfExists(path)
        }
    }
}

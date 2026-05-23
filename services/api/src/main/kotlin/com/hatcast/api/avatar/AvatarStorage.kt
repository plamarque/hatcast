package com.hatcast.api.avatar

interface AvatarStorage {
    fun store(
        key: String,
        bytes: ByteArray,
    )

    fun read(key: String): ByteArray?

    fun delete(key: String)
}

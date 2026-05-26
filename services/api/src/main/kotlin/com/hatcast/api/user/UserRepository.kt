package com.hatcast.api.user

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<UserEntity, UUID> {
    fun findByGoogleSub(googleSub: String): UserEntity?

    fun findByIdpUid(idpUid: String): UserEntity?

    fun findFirstByEmailIgnoreCase(email: String): UserEntity?

    fun findBySlug(slug: String): UserEntity?

    fun existsBySlug(slug: String): Boolean
}

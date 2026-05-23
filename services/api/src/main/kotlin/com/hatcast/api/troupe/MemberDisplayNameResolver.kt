package com.hatcast.api.troupe

import com.hatcast.api.user.UserEntity

object MemberDisplayNameResolver {
    fun resolve(user: UserEntity): String {
        user.displayName?.trim()?.takeIf { it.isNotEmpty() }?.let { return it }
        val email = user.email?.trim()?.takeIf { it.isNotEmpty() }
        if (email != null) {
            val local = email.substringBefore('@').trim()
            if (local.isNotEmpty()) {
                return local
            }
        }
        return "Membre ${user.id.toString().take(8)}"
    }
}

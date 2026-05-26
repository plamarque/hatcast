package com.hatcast.api.share

object EmailObfuscation {
    fun obfuscate(email: String?): String? {
        if (email.isNullOrBlank()) return null
        val parts = email.split("@")
        if (parts.size != 2 || parts[0].isBlank() || parts[1].isBlank()) return null
        val local = parts[0]
        val domain = parts[1]
        val obfuscatedLocal =
            when {
                local.length <= 3 -> local.firstOrNull()?.toString().orEmpty() + "••"
                else -> local.take(3) + "••"
            }
        val domainParts = domain.split(".")
        val obfuscatedDomain =
            if (domainParts.size >= 2) {
                val main = domainParts[0]
                val extension = domainParts.drop(1).joinToString(".")
                val maskedMain =
                    if (main.length <= 2) {
                        "••"
                    } else {
                        main.take(2) + "••"
                    }
                "$maskedMain.$extension"
            } else {
                domain
            }
        return "$obfuscatedLocal@$obfuscatedDomain"
    }
}

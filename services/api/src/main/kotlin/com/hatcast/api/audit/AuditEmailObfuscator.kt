package com.hatcast.api.audit

/** Partially masks emails in audit API responses (display hint only — prefer userId for identity). */
object AuditEmailObfuscator {
    fun obfuscate(email: String?): String? {
        if (email.isNullOrBlank()) return null
        val at = email.indexOf('@')
        if (at <= 0) return null
        val local = email.substring(0, at)
        val domain = email.substring(at + 1)
        if (local.isEmpty() || domain.isEmpty()) return null
        val maskedLocal =
            when {
                local.length == 1 -> "*"
                local.length == 2 -> "${local.first()}*"
                else -> "${local.take(2)}***${local.last()}"
            }
        val maskedDomain =
            when {
                domain.length <= 2 -> "***"
                else -> {
                    val dot = domain.indexOf('.')
                    if (dot <= 1) "${domain.first()}***"
                    else "${domain.first()}***${domain.substring(dot)}"
                }
            }
        return "$maskedLocal@$maskedDomain"
    }
}

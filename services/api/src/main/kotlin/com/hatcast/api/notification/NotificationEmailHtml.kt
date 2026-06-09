package com.hatcast.api.notification

object NotificationEmailHtml {
    fun escape(text: String): String =
        text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")

    fun greeting(pseudo: String): String {
        val name = pseudo.trim()
        return if (name.isEmpty()) {
            "<p>Bonjour,</p>"
        } else {
            "<p>Bonjour ${escape(name)},</p>"
        }
    }

    fun paragraph(text: String): String = "<p>${escape(text)}</p>"

    fun paragraphHtml(innerHtml: String): String = "<p>$innerHtml</p>"

    fun bold(text: String): String = "<strong>${escape(text)}</strong>"

    fun ctaLabel(relativeUrl: String): String =
        when {
            relativeUrl.contains("showConfirm=true") -> "Confirmer ma participation"
            relativeUrl.contains("tab=dispos") -> "Indiquer mes disponibilités"
            relativeUrl.contains("tab=equipe") -> "Voir la composition"
            relativeUrl.contains("tab=infos") -> "Voir les infos du spectacle"
            relativeUrl.contains("/compte/notifications") -> "Gérer mes notifications"
            else -> "Ouvrir dans HatCast"
        }

    fun ctaBlock(absoluteUrl: String, relativeUrl: String): String {
        val label = ctaLabel(relativeUrl)
        return """<p><a href="${escape(absoluteUrl)}">$label</a></p>"""
    }

    fun standardPreferencesFooter(
        publicWebOrigin: String,
        categoryLabel: String,
    ): String {
        val prefsUrl = joinOrigin(publicWebOrigin, "/compte/notifications")
        return """
            <hr />
            <p style="font-size: smaller; color: #666;">
              Pour ne plus recevoir ce type d'email (${escape(categoryLabel)}),
              <a href="${escape(prefsUrl)}">changez vos préférences de notification</a>.
            </p>
            """.trimIndent()
    }

    fun organizerScopeGrantedFooter(publicWebOrigin: String): String {
        val prefsUrl = joinOrigin(publicWebOrigin, "/compte/notifications")
        return """
            <hr />
            <p style="font-size: smaller; color: #666;">
              Cet email confirme un changement de rôle sur ton compte.
              Pour configurer tes alertes organisateur :
              <a href="${escape(prefsUrl)}">Mon compte → Notifications</a>.
            </p>
            """.trimIndent()
    }

    fun joinOrigin(origin: String, path: String): String {
        val base = origin.trimEnd('/')
        val suffix = path.trimStart('/')
        return if (suffix.isEmpty()) base else "$base/$suffix"
    }

    fun wrap(
        greetingHtml: String,
        bodyParagraphs: List<String>,
        ctaHtml: String,
        footerHtml: String,
    ): String = (listOf(greetingHtml) + bodyParagraphs + listOf(ctaHtml, footerHtml)).joinToString("\n")
}

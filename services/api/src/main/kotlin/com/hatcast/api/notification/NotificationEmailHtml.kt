package com.hatcast.api.notification

object NotificationEmailHtml {
    enum class EmailVariant { ACTION, GOOD_NEWS, ORGA_ALERT, TRANSACTIONAL }

    data class EventEmailContext(
        val eventTitle: String,
        val eventDate: String,
        val troupeName: String,
        val seasonTitle: String,
        val roleBadge: String? = null,
        val horizonBadge: String? = null,
    )

    private const val FONT = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
    private const val COLOR_PRIMARY = "#6750A4"
    private const val COLOR_ON_SURFACE = "#1D1B20"
    private const val COLOR_SURFACE = "#FFFBFE"
    private const val COLOR_SURFACE_PAGE = "#F5F3F7"
    private const val COLOR_ON_SURFACE_VARIANT = "#49454F"
    private const val COLOR_OUTLINE = "#E7E0EC"
    private const val COLOR_SUCCESS_CONTAINER = "#E8F5E0"
    private const val COLOR_ORGA_CHIP = "#F3EDF7"
    private const val COLOR_PRIMARY_CONTAINER = "#EADDFF"
    private const val COLOR_EVENT_BG = "#EEE8F7"
    private const val COLOR_EVENT_BORDER = "#DDD4F1"

    fun escape(text: String): String =
        text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")

    fun greeting(pseudo: String): String {
        val name = pseudo.trim()
        return if (name.isEmpty()) {
            styledPara("Bonjour,")
        } else {
            styledPara("Bonjour ${escape(name)},")
        }
    }

    fun paragraph(text: String): String = styledPara(escape(text))

    fun paragraphHtml(innerHtml: String): String = styledPara(innerHtml)

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

    fun ctaBlock(absoluteUrl: String, relativeUrl: String, outline: Boolean = false): String {
        val label = escape(ctaLabel(relativeUrl))
        val buttonStyle =
            if (outline) {
                "display:inline-block;min-height:48px;padding:12px 28px;font-size:15px;font-weight:600;" +
                    "line-height:1.25;text-decoration:none;color:$COLOR_PRIMARY;background:transparent;" +
                    "border:2px solid $COLOR_PRIMARY;border-radius:24px;font-family:$FONT;"
            } else {
                "display:inline-block;min-height:48px;padding:12px 28px;font-size:15px;font-weight:600;" +
                    "line-height:1.25;text-decoration:none;color:#FFFFFF;" +
                    "background:linear-gradient(135deg,#A974F0 0%,$COLOR_PRIMARY 100%);" +
                    "border-radius:24px;box-shadow:0 2px 8px rgba(103,80,164,0.28);font-family:$FONT;"
            }
        return """<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 8px;"><tr><td align="center" style="padding:0;"><a href="${escape(absoluteUrl)}" style="$buttonStyle">$label</a></td></tr></table>"""
    }

    fun standardPreferencesFooter(
        publicWebOrigin: String,
        categoryLabel: String,
    ): String = standardPreferencesFooter(publicWebOrigin, categoryLabel, troupeName = null)

    fun standardPreferencesFooter(
        publicWebOrigin: String,
        categoryLabel: String,
        troupeName: String?,
    ): String {
        val prefsUrl = joinOrigin(publicWebOrigin, "/compte/notifications")
        val troupe = troupeName?.trim()?.takeIf { it.isNotEmpty() }
        val content = buildString {
            append(
                """<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#79747E;font-family:$FONT;">""" +
                    """Pour ne plus recevoir ce type d'email (${escape(categoryLabel)}), """ +
                    """<a href="${escape(prefsUrl)}" style="color:$COLOR_PRIMARY;text-decoration:underline;">changez vos préférences de notification</a>.</p>""",
            )
            if (troupe != null) {
                append(
                    """<p style="margin:0;font-size:12px;line-height:1.5;color:#79747E;font-family:$FONT;">Envoyé par HatCast pour ${escape(troupe)}</p>""",
                )
            }
        }
        return footerBlock(content)
    }

    fun organizerScopeGrantedFooter(publicWebOrigin: String): String {
        val prefsUrl = joinOrigin(publicWebOrigin, "/compte/notifications")
        val content =
            """<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#79747E;font-family:$FONT;">""" +
                """Cet email confirme un changement de rôle sur ton compte. """ +
                """Pour configurer tes alertes organisateur : """ +
                """<a href="${escape(prefsUrl)}" style="color:$COLOR_PRIMARY;text-decoration:underline;">Mon compte → Notifications</a>.</p>""" +
                """<p style="margin:0;font-size:14px;line-height:1.5;color:$COLOR_ON_SURFACE_VARIANT;font-family:$FONT;">— L'équipe HatCast</p>"""
        return footerBlock(content)
    }

    fun joinOrigin(origin: String, path: String): String {
        val base = origin.trimEnd('/')
        val suffix = path.trimStart('/')
        return if (suffix.isEmpty()) base else "$base/$suffix"
    }

    fun detailsCardBlock(sectionTitle: String, innerHtml: String): String =
        """<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">""" +
            """<tr><td style="padding:14px 16px;background:$COLOR_SURFACE;border:1px solid $COLOR_OUTLINE;border-radius:10px;">""" +
            """<p style="margin:0 0 10px;font-size:13px;font-weight:700;color:$COLOR_ON_SURFACE_VARIANT;text-transform:uppercase;letter-spacing:0.05em;font-family:$FONT;">${escape(sectionTitle)}</p>""" +
            innerHtml +
            """</td></tr></table>"""

    /**
     * Wraps content in the HatCast email shell (table-based, 600 px max, accent bar, brand header).
     *
     * @param headline H1 visible in the email body (distinct from SMTP subject).
     * @param variant Rendering variant (ACTION / GOOD_NEWS / ORGA_ALERT / TRANSACTIONAL).
     * @param publicWebOrigin Absolute origin used for logo URL and links.
     * @param eventContext Optional event context block (title, date, troupe, badges).
     * @param detailsCardHtml Optional pre-built details card (proxy, deltas, regression reason).
     */
    fun wrap(
        headline: String,
        variant: EmailVariant,
        publicWebOrigin: String,
        greetingHtml: String,
        bodyParagraphs: List<String>,
        ctaHtml: String,
        footerHtml: String,
        eventContext: EventEmailContext? = null,
        detailsCardHtml: String? = null,
    ): String {
        val logoUrl = escape(joinOrigin(publicWebOrigin, "/icons/logo-hatcast-email.png"))

        val brandBlock =
            """<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">""" +
                """<tr>""" +
                """<td style="vertical-align:middle;padding-right:10px;">""" +
                """<img src="$logoUrl" alt="HatCast" width="36" height="36" style="display:block;border-radius:50%;"/>""" +
                """</td>""" +
                """<td style="vertical-align:middle;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:$COLOR_ON_SURFACE;font-family:$FONT;">HatCast</td>""" +
                """</tr></table>"""

        val variantLeadBlock =
            when (variant) {
                EmailVariant.GOOD_NEWS ->
                    """<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">""" +
                        """<tr><td align="center">""" +
                        """<div style="width:48px;height:48px;margin:0 auto;background:$COLOR_SUCCESS_CONTAINER;border-radius:50%;text-align:center;line-height:48px;font-size:24px;font-family:$FONT;">✓</div>""" +
                        """</td></tr></table>"""
                EmailVariant.ORGA_ALERT ->
                    """<div style="margin-bottom:16px;">""" +
                        """<span style="display:inline-block;padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:$COLOR_PRIMARY;background:$COLOR_ORGA_CHIP;border-radius:999px;font-family:$FONT;">Alerte organisateur</span>""" +
                        """</div>"""
                else -> ""
            }

        val eventContextBlock =
            if (eventContext != null) {
                val badges =
                    buildString {
                        eventContext.roleBadge?.let { badge ->
                            append(
                                """<span style="display:inline-block;margin-top:8px;padding:2px 8px;font-size:11px;font-weight:600;color:$COLOR_PRIMARY;background:$COLOR_PRIMARY_CONTAINER;border-radius:999px;font-family:$FONT;">${escape(badge)}</span>""",
                            )
                        }
                        eventContext.horizonBadge?.let { badge ->
                            append(
                                """<span style="display:inline-block;margin-top:8px;margin-left:6px;padding:2px 8px;font-size:11px;font-weight:700;color:#7D5260;background:#FFD8E4;border-radius:999px;font-family:$FONT;">${escape(badge)}</span>""",
                            )
                        }
                    }
                val badgesHtml = if (badges.isNotEmpty()) """<div>$badges</div>""" else ""
                """<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">""" +
                    """<tr><td style="background:$COLOR_EVENT_BG;border:1px solid $COLOR_EVENT_BORDER;border-radius:10px;padding:14px 16px;">""" +
                    """<table cellpadding="0" cellspacing="0" border="0"><tr>""" +
                    """<td style="vertical-align:top;padding-right:12px;font-size:20px;line-height:1;padding-top:2px;">📅</td>""" +
                    """<td style="vertical-align:top;">""" +
                    """<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:$COLOR_ON_SURFACE;font-family:$FONT;">${escape(eventContext.eventTitle)}</p>""" +
                    """<p style="margin:0;font-size:13px;color:$COLOR_ON_SURFACE_VARIANT;line-height:1.45;font-family:$FONT;">${escape(eventContext.eventDate)}</p>""" +
                    """<p style="margin:0;font-size:13px;color:$COLOR_ON_SURFACE_VARIANT;line-height:1.45;font-family:$FONT;">${escape(eventContext.troupeName)} · ${escape(eventContext.seasonTitle)}</p>""" +
                    badgesHtml +
                    """</td></tr></table>""" +
                    """</td></tr></table>"""
            } else {
                ""
            }

        val headlineHtml =
            """<h1 style="margin:0 0 18px;font-size:22px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:$COLOR_ON_SURFACE;font-family:$FONT;">${escape(headline)}</h1>"""

        val bodyHtml = (listOf(greetingHtml) + bodyParagraphs).joinToString("\n")

        val detailsBlock = detailsCardHtml ?: ""

        return """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:$COLOR_SURFACE_PAGE;font-family:$FONT;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:$COLOR_SURFACE_PAGE;">
<tr><td style="padding:24px 16px;" align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:$COLOR_SURFACE;border-radius:12px;overflow:hidden;">
<tr><td height="4" style="background:linear-gradient(90deg,#A974F0 0%,#6750A4 55%,#4F378B 100%);font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
<tr><td style="padding:28px 24px 24px;">
$brandBlock
$variantLeadBlock
$eventContextBlock
$headlineHtml
$bodyHtml
$detailsBlock
$ctaHtml
$footerHtml
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""
    }

    private fun styledPara(innerHtml: String): String =
        """<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:$COLOR_ON_SURFACE;font-family:$FONT;">$innerHtml</p>"""

    private fun footerBlock(innerHtml: String): String =
        """<div style="margin-top:28px;padding-top:18px;border-top:1px solid $COLOR_OUTLINE;">$innerHtml</div>"""
}

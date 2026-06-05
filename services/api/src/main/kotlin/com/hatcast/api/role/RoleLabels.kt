package com.hatcast.api.role

import com.hatcast.api.user.MemberGender

object RoleLabels {
    private val SINGULAR_INCLUSIVE: Map<String, String> =
        mapOf(
            "player" to "Comédien·ne",
            "volunteer" to "Bénévole",
            "mc" to "MC",
            "dj" to "DJ",
            "referee" to "Arbitre",
            "assistant_referee" to "Assistant.e",
            "lighting" to "Lumière",
            "coach" to "Coach",
            "stage_manager" to "Régisseur.euse",
        )

    private val SINGULAR_BY_GENDER: Map<MemberGender, Map<String, String>> =
        mapOf(
            MemberGender.MALE to
                mapOf(
                    "player" to "Comédien",
                    "volunteer" to "Bénévole",
                    "mc" to "MC",
                    "dj" to "DJ",
                    "referee" to "Arbitre",
                    "assistant_referee" to "Assistant",
                    "lighting" to "Lumière",
                    "coach" to "Coach",
                    "stage_manager" to "Régisseur",
                ),
            MemberGender.FEMALE to
                mapOf(
                    "player" to "Comédienne",
                    "volunteer" to "Bénévole",
                    "mc" to "MC",
                    "dj" to "DJ",
                    "referee" to "Arbitre",
                    "assistant_referee" to "Assistante",
                    "lighting" to "Lumière",
                    "coach" to "Coach",
                    "stage_manager" to "Régisseuse",
                ),
            MemberGender.NON_SPECIFIED to SINGULAR_INCLUSIVE,
        )

    private val PLURAL_BY_GENDER: Map<MemberGender, Map<String, String>> =
        mapOf(
            MemberGender.MALE to
                mapOf(
                    "player" to "Comédiens",
                    "volunteer" to "Bénévoles",
                    "mc" to "MC",
                    "dj" to "DJ",
                    "referee" to "Arbitres",
                    "assistant_referee" to "Assistants",
                    "lighting" to "Lumières",
                    "coach" to "Coachs",
                    "stage_manager" to "Régisseurs",
                ),
            MemberGender.FEMALE to
                mapOf(
                    "player" to "Comédiennes",
                    "volunteer" to "Bénévoles",
                    "mc" to "MC",
                    "dj" to "DJ",
                    "referee" to "Arbitres",
                    "assistant_referee" to "Assistantes",
                    "lighting" to "Lumières",
                    "coach" to "Coachs",
                    "stage_manager" to "Régisseuses",
                ),
            MemberGender.NON_SPECIFIED to
                mapOf(
                    "player" to "Comédiens·nes",
                    "volunteer" to "Bénévoles",
                    "mc" to "MC",
                    "dj" to "DJ",
                    "referee" to "Arbitres",
                    "assistant_referee" to "Assistant.es",
                    "lighting" to "Lumières",
                    "coach" to "Coachs",
                    "stage_manager" to "Régisseur.euses",
                ),
        )

    fun label(
        roleKey: String,
        gender: MemberGender = MemberGender.NON_SPECIFIED,
        plural: Boolean = false,
    ): String {
        val tables = if (plural) PLURAL_BY_GENDER else SINGULAR_BY_GENDER
        return tables[gender]?.get(roleKey)
            ?: tables[MemberGender.NON_SPECIFIED]?.get(roleKey)
            ?: SINGULAR_INCLUSIVE[roleKey]
            ?: roleKey
    }
}

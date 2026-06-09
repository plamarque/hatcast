package com.hatcast.api.event

enum class EventPageTab {
    INFOS,
    DISPOS,
    EQUIPE,
    ;

    companion object {
        fun parse(raw: String): EventPageTab? =
            when (raw.trim().lowercase()) {
                "infos", "info" -> INFOS
                "dispos" -> DISPOS
                "equipe", "team", "compo" -> EQUIPE
                else -> null
            }
    }
}

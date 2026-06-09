package com.hatcast.api.season

enum class SeasonWorkspaceView {
    AGENDA,
    ;

    companion object {
        fun parse(raw: String): SeasonWorkspaceView? =
            when (raw.trim().lowercase()) {
                "agenda" -> AGENDA
                else -> null
            }
    }
}

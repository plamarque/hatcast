package com.hatcast.api.event

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

/** Event type and role slot validation — V1 parity ([legacy/src/services/storage.js]). */
object EventTypes {
    const val DEFAULT_CREATE = "cabaret"
    const val DEFAULT_LEGACY = "custom"

    val ALLOWED: Set<String> =
        setOf(
            "cabaret",
            "longform",
            "freeform",
            "match",
            "catch",
            "deplacement",
            "survey",
            "custom",
        )

    fun requireValid(templateType: String) {
        if (templateType !in ALLOWED) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "templateType invalide : $templateType",
            )
        }
    }
}

object RoleKeys {
    val ALL: List<String> =
        listOf(
            "player",
            "volunteer",
            "mc",
            "dj",
            "referee",
            "assistant_referee",
            "lighting",
            "coach",
            "stage_manager",
        )

    const val MIN_COUNT = 0
    /**
     * Sanity cap for persisted slot counts (abuse / typo guard only).
     * Not a business rule: V1 [`EventModal.vue`] used `max="20"` on HTML inputs only;
     * Firestore had no server limit (e.g. « Tous à l'Apérock » with 32 players).
     */
    const val MAX_COUNT = 100
}

object RoleTemplates {
    private val presets: Map<String, Map<String, Int>> =
        mapOf(
            "match" to
                mapOf(
                    "player" to 5,
                    "mc" to 1,
                    "referee" to 1,
                    "assistant_referee" to 2,
                    "volunteer" to 5,
                ),
            "catch" to
                mapOf(
                    "player" to 9,
                    "mc" to 1,
                    "dj" to 1,
                ),
            "cabaret" to
                mapOf(
                    "player" to 5,
                    "mc" to 1,
                    "dj" to 1,
                ),
            "longform" to
                mapOf(
                    "player" to 4,
                    "mc" to 1,
                    "dj" to 1,
                ),
            "freeform" to
                mapOf(
                    "player" to 5,
                    "mc" to 1,
                    "dj" to 1,
                ),
            "deplacement" to mapOf("player" to 5),
            "survey" to emptyMap(),
            "custom" to emptyMap(),
        )

    fun emptySlots(): Map<String, Int> = RoleKeys.ALL.associateWith { 0 }

    fun slotsFor(templateType: String): Map<String, Int> {
        EventTypes.requireValid(templateType)
        val base = emptySlots().toMutableMap()
        presets[templateType]?.forEach { (k, v) -> base[k] = v }
        return base
    }

    /** Normalise une map partielle en map complète (clés manquantes → 0). */
    fun normalize(raw: Map<String, Int>?): Map<String, Int> {
        if (raw == null) return emptySlots()
        validate(raw)
        val base = emptySlots().toMutableMap()
        raw.forEach { (k, v) -> base[k] = v }
        return base
    }

    fun validate(raw: Map<String, Int>) {
        for ((key, count) in raw) {
            if (key !in RoleKeys.ALL) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Clé de rôle inconnue : $key",
                )
            }
            if (count !in RoleKeys.MIN_COUNT..RoleKeys.MAX_COUNT) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nombre de slots invalide pour $key : $count (0–${RoleKeys.MAX_COUNT} attendu)",
                )
            }
        }
    }

    fun rolesWithSlots(slots: Map<String, Int>): List<String> =
        RoleKeys.ALL.filter { (slots[it] ?: 0) > 0 }

    fun isDeplacement(templateType: String): Boolean = templateType == "deplacement"
}

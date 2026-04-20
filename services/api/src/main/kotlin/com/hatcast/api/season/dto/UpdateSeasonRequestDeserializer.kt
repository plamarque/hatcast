package com.hatcast.api.season.dto

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.JsonNode
import org.openapitools.jackson.nullable.JsonNullable
import java.time.LocalDate
import java.time.format.DateTimeParseException

/**
 * Distingue les trois cas pour un PATCH partiel : clé absente ([JsonNullable.undefined]),
 * `null` JSON explicite ([JsonNullable.of] null), valeur présente.
 */
class UpdateSeasonRequestDeserializer : JsonDeserializer<UpdateSeasonRequest>() {
    override fun deserialize(
        p: JsonParser,
        ctxt: DeserializationContext,
    ): UpdateSeasonRequest {
        val node: JsonNode = p.codec.readTree(p)
        if (!node.isObject) {
            throw JsonMappingException.from(p, "Corps JSON attendu : objet")
        }
        return UpdateSeasonRequest(
            title = stringField(p, node, "title"),
            description = stringField(p, node, "description"),
            startDate = dateField(p, node, "startDate"),
            endDate = dateField(p, node, "endDate"),
        )
    }

    private fun stringField(
        p: JsonParser,
        node: JsonNode,
        name: String,
    ): JsonNullable<String> {
        if (!node.has(name)) return JsonNullable.undefined()
        val v = node.get(name)
        if (v.isNull) return JsonNullable.of(null)
        if (!v.isTextual) {
            throw JsonMappingException.from(p, "Champ « $name » : chaîne attendue")
        }
        return JsonNullable.of(v.asText())
    }

    private fun dateField(
        p: JsonParser,
        node: JsonNode,
        name: String,
    ): JsonNullable<LocalDate> {
        if (!node.has(name)) return JsonNullable.undefined()
        val v = node.get(name)
        if (v.isNull) return JsonNullable.of(null)
        if (!v.isTextual) {
            throw JsonMappingException.from(p, "Champ « $name » : date (chaîne ISO) attendue")
        }
        return try {
            JsonNullable.of(LocalDate.parse(v.asText()))
        } catch (_: DateTimeParseException) {
            throw JsonMappingException.from(p, "Champ « $name » : date invalide")
        }
    }
}

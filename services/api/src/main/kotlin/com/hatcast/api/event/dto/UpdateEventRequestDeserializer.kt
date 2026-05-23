package com.hatcast.api.event.dto

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.JsonNode
import org.openapitools.jackson.nullable.JsonNullable
import java.time.Instant
import java.time.format.DateTimeParseException

/**
 * Distingue les trois cas pour un PATCH partiel : clé absente ([JsonNullable.undefined]),
 * `null` JSON explicite ([JsonNullable.of] null), valeur présente.
 */
class UpdateEventRequestDeserializer : JsonDeserializer<UpdateEventRequest>() {
    override fun deserialize(
        p: JsonParser,
        ctxt: DeserializationContext,
    ): UpdateEventRequest {
        val node: JsonNode = p.codec.readTree(p)
        if (!node.isObject) {
            throw JsonMappingException.from(p, "Corps JSON attendu : objet")
        }
        return UpdateEventRequest(
            title = stringField(p, node, "title"),
            startsAt = instantField(p, node, "startsAt"),
            description = stringField(p, node, "description"),
            location = stringField(p, node, "location"),
            templateType = stringField(p, node, "templateType"),
            roleSlots = roleSlotsField(p, node, "roleSlots"),
        )
    }

    private fun roleSlotsField(
        p: JsonParser,
        node: JsonNode,
        name: String,
    ): JsonNullable<Map<String, Int>> {
        if (!node.has(name)) return JsonNullable.undefined()
        val v = node.get(name)
        if (v.isNull) return JsonNullable.of(null)
        if (!v.isObject) {
            throw JsonMappingException.from(p, "Champ « $name » : objet attendu")
        }
        val map = mutableMapOf<String, Int>()
        v.fields().forEachRemaining { (key, value) ->
            if (!value.isNumber) {
                throw JsonMappingException.from(p, "Champ « $name.$key » : entier attendu")
            }
            map[key] = value.asInt()
        }
        return JsonNullable.of(map)
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

    private fun instantField(
        p: JsonParser,
        node: JsonNode,
        name: String,
    ): JsonNullable<Instant> {
        if (!node.has(name)) return JsonNullable.undefined()
        val v = node.get(name)
        if (v.isNull) return JsonNullable.of(null)
        if (!v.isTextual) {
            throw JsonMappingException.from(p, "Champ « $name » : instant ISO-8601 attendu")
        }
        return try {
            JsonNullable.of(Instant.parse(v.asText()))
        } catch (_: DateTimeParseException) {
            throw JsonMappingException.from(p, "Champ « $name » : instant invalide")
        }
    }
}

package com.hatcast.api.troupe.dto

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.JsonNode
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.openapitools.jackson.nullable.JsonNullable

class UpdateTroupeMemberRequestDeserializer : JsonDeserializer<UpdateTroupeMemberRequest>() {
    override fun deserialize(
        p: JsonParser,
        ctxt: DeserializationContext,
    ): UpdateTroupeMemberRequest {
        val node: JsonNode = p.codec.readTree(p)
        if (!node.isObject) {
            throw JsonMappingException.from(p, "Corps JSON attendu : objet")
        }
        return UpdateTroupeMemberRequest(
            displayName = stringField(p, node, "displayName"),
            status = enumField<TroupeMembershipStatus>(p, node, "status"),
            baselineRole = enumField<TroupeBaselineRole>(p, node, "baselineRole"),
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

    private inline fun <reified E : Enum<E>> enumField(
        p: JsonParser,
        node: JsonNode,
        name: String,
    ): JsonNullable<E> {
        if (!node.has(name)) return JsonNullable.undefined()
        val v = node.get(name)
        if (v.isNull) return JsonNullable.of(null)
        if (!v.isTextual) {
            throw JsonMappingException.from(p, "Champ « $name » : valeur texte attendue")
        }
        return try {
            JsonNullable.of(enumValueOf<E>(v.asText()))
        } catch (_: IllegalArgumentException) {
            throw JsonMappingException.from(p, "Champ « $name » : valeur invalide")
        }
    }
}

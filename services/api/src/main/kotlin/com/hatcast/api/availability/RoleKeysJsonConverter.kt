package com.hatcast.api.availability

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.slf4j.LoggerFactory

@Converter
class RoleKeysJsonConverter : AttributeConverter<List<String>, String> {
    private val log = LoggerFactory.getLogger(RoleKeysJsonConverter::class.java)
    private val mapper = jacksonObjectMapper()
    private val typeRef = object : TypeReference<List<String>>() {}

    override fun convertToDatabaseColumn(attribute: List<String>?): String =
        mapper.writeValueAsString(attribute ?: emptyList<String>())

    override fun convertToEntityAttribute(dbData: String?): List<String> {
        if (dbData.isNullOrBlank()) return emptyList()
        return try {
            mapper.readValue(dbData, typeRef)
        } catch (ex: Exception) {
            log.warn(
                "event_availability.role_keys JSON invalide, fallback liste vide: {} ({})",
                dbData,
                ex.message ?: ex.javaClass.simpleName,
            )
            emptyList()
        }
    }
}

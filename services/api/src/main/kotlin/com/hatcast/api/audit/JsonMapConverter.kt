package com.hatcast.api.audit

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.slf4j.LoggerFactory

@Converter
class JsonMapConverter : AttributeConverter<Map<String, Any?>?, String?> {
    private val log = LoggerFactory.getLogger(JsonMapConverter::class.java)
    private val mapper = jacksonObjectMapper()
    private val typeRef = object : TypeReference<Map<String, Any?>>() {}

    override fun convertToDatabaseColumn(attribute: Map<String, Any?>?): String? {
        if (attribute == null) return null
        return mapper.writeValueAsString(attribute)
    }

    override fun convertToEntityAttribute(dbData: String?): Map<String, Any?>? {
        if (dbData.isNullOrBlank()) return null
        return try {
            mapper.readValue(dbData, typeRef)
        } catch (ex: Exception) {
            log.warn(
                "audit_events JSON invalide, fallback null: {} ({})",
                dbData,
                ex.message ?: ex.javaClass.simpleName,
            )
            null
        }
    }
}

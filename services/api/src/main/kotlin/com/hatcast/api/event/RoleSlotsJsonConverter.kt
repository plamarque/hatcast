package com.hatcast.api.event

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.slf4j.LoggerFactory

@Converter
class RoleSlotsJsonConverter : AttributeConverter<Map<String, Int>, String> {
    private val log = LoggerFactory.getLogger(RoleSlotsJsonConverter::class.java)
    private val mapper = jacksonObjectMapper()
    private val typeRef = object : TypeReference<Map<String, Int>>() {}

    override fun convertToDatabaseColumn(attribute: Map<String, Int>?): String =
        mapper.writeValueAsString(attribute ?: RoleTemplates.emptySlots())

    override fun convertToEntityAttribute(dbData: String?): Map<String, Int> {
        if (dbData.isNullOrBlank()) return RoleTemplates.emptySlots()
        return try {
            RoleTemplates.normalize(mapper.readValue(dbData, typeRef))
        } catch (ex: Exception) {
            log.warn("role_slots JSON invalide, fallback slots vides: {}", dbData, ex)
            RoleTemplates.emptySlots()
        }
    }
}

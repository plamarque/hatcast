package com.hatcast.api.event.dto

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.openapitools.jackson.nullable.JsonNullableModule
import java.time.Instant

class UpdateEventRequestDeserializerTest {
    private val mapper =
        ObjectMapper().apply {
            registerModule(kotlinModule())
            registerModule(JsonNullableModule())
        }

    @Test
    fun `empty object yields all undefined`() {
        val r = mapper.readValue("{}", UpdateEventRequest::class.java)
        assertFalse(r.title.isPresent)
        assertFalse(r.startsAt.isPresent)
        assertFalse(r.description.isPresent)
        assertFalse(r.location.isPresent)
        assertFalse(r.templateType.isPresent)
        assertFalse(r.roleSlots.isPresent)
    }

    @Test
    fun `explicit null for optional string yields present with null`() {
        val r =
            mapper.readValue(
                """{"description":null,"location":null}""",
                UpdateEventRequest::class.java,
            )
        assertTrue(r.description.isPresent)
        assertTrue(r.location.isPresent)
        assertEquals(null, r.description.get())
        assertEquals(null, r.location.get())
    }

    @Test
    fun `parses startsAt to Instant`() {
        val r =
            mapper.readValue(
                """{"startsAt":"2030-06-15T18:00:00Z"}""",
                UpdateEventRequest::class.java,
            )
        assertTrue(r.startsAt.isPresent)
        assertEquals(Instant.parse("2030-06-15T18:00:00Z"), r.startsAt.get())
    }

    @Test
    fun `parses roleSlots object`() {
        val r =
            mapper.readValue(
                """{"roleSlots":{"player":5,"mc":1}}""",
                UpdateEventRequest::class.java,
            )
        assertTrue(r.roleSlots.isPresent)
        assertEquals(5, r.roleSlots.get()!!["player"])
        assertEquals(1, r.roleSlots.get()!!["mc"])
    }

    @Test
    fun `explicit null roleSlots yields present with null`() {
        val r = mapper.readValue("""{"roleSlots":null}""", UpdateEventRequest::class.java)
        assertTrue(r.roleSlots.isPresent)
        assertEquals(null, r.roleSlots.get())
    }

    @ParameterizedTest
    @ValueSource(
        strings = [
            """{"description":1}""",
            """{"startsAt":true}""",
            """{"location":[]}""",
        ],
    )
    fun `wrong json types fail`(json: String) {
        org.junit.jupiter.api.assertThrows<com.fasterxml.jackson.databind.JsonMappingException> {
            mapper.readValue(json, UpdateEventRequest::class.java)
        }
    }

    @Test
    fun `invalid instant string fails`() {
        org.junit.jupiter.api.assertThrows<com.fasterxml.jackson.databind.JsonMappingException> {
            mapper.readValue("""{"startsAt":"not-an-instant"}""", UpdateEventRequest::class.java)
        }
    }
}

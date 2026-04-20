package com.hatcast.api.season.dto

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.junit.jupiter.params.provider.ValueSource
import org.openapitools.jackson.nullable.JsonNullableModule
import java.time.LocalDate
import java.util.stream.Stream

class UpdateSeasonRequestDeserializerTest {
    private val mapper =
        ObjectMapper().apply {
            registerModule(kotlinModule())
            registerModule(JsonNullableModule())
        }

    @Test
    fun `empty object yields all undefined`() {
        val r = mapper.readValue("{}", UpdateSeasonRequest::class.java)
        assertFalse(r.title.isPresent)
        assertFalse(r.description.isPresent)
        assertFalse(r.startDate.isPresent)
        assertFalse(r.endDate.isPresent)
    }

    @ParameterizedTest
    @MethodSource("singleFieldCases")
    fun `single field present sets only that field`(
        json: String,
        title: Boolean,
        desc: Boolean,
        start: Boolean,
        end: Boolean,
    ) {
        val r = mapper.readValue(json, UpdateSeasonRequest::class.java)
        assertEquals(title, r.title.isPresent)
        assertEquals(desc, r.description.isPresent)
        assertEquals(start, r.startDate.isPresent)
        assertEquals(end, r.endDate.isPresent)
    }

    companion object {
        @JvmStatic
        fun singleFieldCases(): Stream<Arguments> =
            Stream.of(
                Arguments.of("""{"title":"Nouveau"}""", true, false, false, false),
                Arguments.of("""{"description":"d"}""", false, true, false, false),
                Arguments.of("""{"startDate":"2026-03-15"}""", false, false, true, false),
                Arguments.of("""{"endDate":"2027-01-20"}""", false, false, false, true),
            )
    }

    @Test
    fun `explicit null for optional string yields present with null`() {
        val r = mapper.readValue("""{"description":null}""", UpdateSeasonRequest::class.java)
        assertTrue(r.description.isPresent)
        assertEquals(null, r.description.get())
    }

    @Test
    fun `explicit null for optional date yields present with null`() {
        val r =
            mapper.readValue(
                """{"startDate":null,"endDate":null}""",
                UpdateSeasonRequest::class.java,
            )
        assertTrue(r.startDate.isPresent)
        assertTrue(r.endDate.isPresent)
        assertEquals(null, r.startDate.get())
        assertEquals(null, r.endDate.get())
    }

    @Test
    fun `title null is present with null`() {
        val r = mapper.readValue("""{"title":null}""", UpdateSeasonRequest::class.java)
        assertTrue(r.title.isPresent)
        assertEquals(null, r.title.get())
    }

    @Test
    fun `parses date fields to LocalDate`() {
        val r =
            mapper.readValue(
                """{"startDate":"2026-01-01","endDate":"2026-12-31"}""",
                UpdateSeasonRequest::class.java,
            )
        assertEquals(LocalDate.of(2026, 1, 1), r.startDate.get())
        assertEquals(LocalDate.of(2026, 12, 31), r.endDate.get())
    }

    @ParameterizedTest
    @ValueSource(
        strings = [
            """{"description":1}""",
            """{"title":true}""",
            """{"startDate":[]}""",
        ],
    )
    fun `wrong json types fail`(json: String) {
        org.junit.jupiter.api.assertThrows<com.fasterxml.jackson.databind.JsonMappingException> {
            mapper.readValue(json, UpdateSeasonRequest::class.java)
        }
    }

    @Test
    fun `invalid date string fails`() {
        org.junit.jupiter.api.assertThrows<com.fasterxml.jackson.databind.JsonMappingException> {
            mapper.readValue("""{"startDate":"not-a-date"}""", UpdateSeasonRequest::class.java)
        }
    }

    @Test
    fun `non object root fails`() {
        org.junit.jupiter.api.assertThrows<com.fasterxml.jackson.databind.JsonMappingException> {
            mapper.readValue("""[]""", UpdateSeasonRequest::class.java)
        }
    }

    @Test
    fun `unknown keys ignored by deserializer`() {
        val r =
            mapper.readValue(
                """{"description":"x","extra":true}""",
                UpdateSeasonRequest::class.java,
            )
        assertTrue(r.description.isPresent)
        assertEquals("x", r.description.get())
    }
}

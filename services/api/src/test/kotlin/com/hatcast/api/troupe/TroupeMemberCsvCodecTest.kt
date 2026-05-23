package com.hatcast.api.troupe

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class TroupeMemberCsvCodecTest {
    @Test
    fun `format export includes header and quoted fields`() {
        val user =
            com.hatcast.api.user.UserEntity(
                email = "patrice@example.com",
                displayName = "Patrice",
            )
        val membership =
            TroupeMembershipEntity(
                troupe = TroupeEntity(id = UUID.randomUUID(), name = "La Malice", slug = "la-malice"),
                user = user,
                displayName = "Patrice, le directeur",
                baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                status = TroupeMembershipStatus.ACTIVE,
            )

        val csv = TroupeMemberCsvCodec.formatExport(sequenceOf(membership))

        assertTrue(csv.startsWith("email,displayName,baselineRole,status"))
        assertTrue(csv.contains("\"Patrice, le directeur\""))
        assertTrue(csv.contains("patrice@example.com"))
        assertTrue(csv.contains("TROUPE_ADMIN"))
        assertTrue(csv.contains("active"))
    }

    @Test
    fun `parse rejects file without email column`() {
        val result = TroupeMemberCsvCodec.parse("name,role\nAlice,MEMBER\n")

        assertEquals(MemberCsvFileError.MISSING_EMAIL_COLUMN, result.fileError)
        assertTrue(result.rows.isEmpty())
    }

    @Test
    fun `parse valid rows and invalid email`() {
        val csv =
            """
            email,displayName,baselineRole,status
            valid@example.com,Valid,MEMBER,active
            not-an-email,,,
            """.trimIndent()

        val result = TroupeMemberCsvCodec.parse(csv)

        assertNull(result.fileError)
        assertEquals(2, result.rows.size)
        assertTrue(result.rows[0].valid)
        assertEquals("valid@example.com", result.rows[0].email)
        assertEquals(TroupeBaselineRole.MEMBER, result.rows[0].baselineRole)
        assertEquals(TroupeMembershipStatus.ACTIVE, result.rows[0].status)
        assertEquals(false, result.rows[1].valid)
        assertEquals(MemberImportErrorCode.INVALID_EMAIL, result.rows[1].errorCode)
    }

    @Test
    fun `parse strips utf-8 bom before header`() {
        val csv =
            """
            \uFEFFemail,displayName
            bom@example.com,BOM User
            """.trimIndent().replace("\\uFEFF", "\uFEFF")

        val result = TroupeMemberCsvCodec.parse(csv)

        assertNull(result.fileError)
        assertEquals(1, result.rows.size)
        assertEquals("bom@example.com", result.rows[0].email)
    }

    @Test
    fun `parse handles quoted commas`() {
        val csv =
            """
            email,displayName
            "comma@example.com","Nom, avec virgule"
            """.trimIndent()

        val result = TroupeMemberCsvCodec.parse(csv)

        assertEquals(1, result.rows.size)
        assertEquals("comma@example.com", result.rows[0].email)
        assertEquals("Nom, avec virgule", result.rows[0].displayName)
    }
}

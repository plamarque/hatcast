package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ParticipantRowPresentationTest {
    private val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
    private val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")

    private fun seasonParticipant(
        user: UserEntity? = null,
        rowGender: MemberGender? = null,
    ): SeasonParticipantEntity =
        SeasonParticipantEntity(
            season = season,
            displayName = "Test",
            user = user,
            gender = rowGender,
        )

    @Test
    fun `effective gender prefers linked account M or F`() {
        val user =
            UserEntity(
                email = "a@example.com",
                gender = MemberGender.MALE,
            )
        val row = seasonParticipant(user = user, rowGender = MemberGender.FEMALE)
        assertEquals(MemberGender.MALE, ParticipantRowPresentation.effectiveGender(row))
    }

    @Test
    fun `effective gender uses row when account unset`() {
        val row = seasonParticipant(user = null, rowGender = MemberGender.FEMALE)
        assertEquals(MemberGender.FEMALE, ParticipantRowPresentation.effectiveGender(row))
        assertEquals("female", ParticipantRowPresentation.effectiveGenderWire(row))
    }

    @Test
    fun `canOrganizerSetGender false when account has M or F`() {
        val user =
            UserEntity(
                email = "b@example.com",
                gender = MemberGender.FEMALE,
            )
        assertFalse(ParticipantRowPresentation.canOrganizerSetGender(user))
    }

    @Test
    fun `stored participant gender wire null when unset`() {
        val row = seasonParticipant()
        assertNull(ParticipantRowPresentation.storedParticipantGenderWire(row))
    }

    @Test
    fun `genderManagedOnAccount when linked account has gender`() {
        val user =
            UserEntity(
                email = "c@example.com",
                gender = MemberGender.MALE,
            )
        val row = seasonParticipant(user = user)
        assertTrue(ParticipantRowPresentation.genderManagedOnAccount(row))
    }
}

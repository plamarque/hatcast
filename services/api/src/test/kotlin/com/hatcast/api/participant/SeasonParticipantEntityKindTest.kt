package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class SeasonParticipantEntityKindTest {
    @Test
    fun `kind returns EXTERNE for externe-linked season participant`() {
        val troupe = TroupeEntity(id = java.util.UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = java.util.UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val externeMembership =
            TroupeMembershipEntity(
                troupe = troupe,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.EXTERNE,
                displayName = "Laetitia",
            )
        val participant =
            SeasonParticipantEntity(
                season = season,
                displayName = "Laetitia",
                troupeMembership = externeMembership,
                invitationScope = InvitationScope.SEASON,
            )

        assertEquals(ParticipantKind.EXTERNE, participant.kind())
    }

    @Test
    fun `kind returns MEMBER for troupe member membership`() {
        val troupe = TroupeEntity(id = java.util.UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = java.util.UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val memberMembership =
            TroupeMembershipEntity(
                troupe = troupe,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.MEMBER,
                displayName = "Member",
            )
        val participant =
            SeasonParticipantEntity(
                season = season,
                displayName = "Member",
                troupeMembership = memberMembership,
            )

        assertEquals(ParticipantKind.MEMBER, participant.kind())
    }
}

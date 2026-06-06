package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class SeasonParticipantMembershipSyncTest {
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val seasonRepository = mock<SeasonRepository>()
    private val participantLink = mock<ParticipantLinkService>()
    private val sync =
        SeasonParticipantMembershipSync(seasonParticipantRepository, seasonRepository, participantLink)

    @Test
    fun `ensureForMembership skips externe carnet rows`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val externe =
            TroupeMembershipEntity(
                troupe = troupe,
                user = null,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.EXTERNE,
                displayName = "DJ local",
            )

        sync.ensureForMembership(season, externe)

        verify(seasonParticipantRepository, never()).save(any())
    }

    @Test
    fun `ensureForMembershipAcrossTroupe skips externe carnet rows`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val externe =
            TroupeMembershipEntity(
                troupe = troupe,
                user = null,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.EXTERNE,
                displayName = "DJ local",
            )
        whenever(seasonRepository.findAllByTroupeIdList(troupe.id)).thenReturn(listOf(season))

        sync.ensureForMembershipAcrossTroupe(externe)

        verify(seasonParticipantRepository, never()).save(any())
    }
}

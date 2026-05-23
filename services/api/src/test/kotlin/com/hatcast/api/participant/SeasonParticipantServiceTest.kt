package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import java.util.UUID

class SeasonParticipantServiceTest {
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val seasonRepository = mock<SeasonRepository>()
    private val troupeMembershipRepository = mock<TroupeMembershipRepository>()
    private val userRepository = mock<UserRepository>()
    private val participantAccess = mock<ParticipantAccessService>()
    private val participantLink = ParticipantLinkService(userRepository, seasonParticipantRepository, mock())

    private val service =
        SeasonParticipantService(
            seasonParticipantRepository,
            seasonRepository,
            troupeMembershipRepository,
            userRepository,
            participantAccess,
            participantLink,
        )

    @Test
    fun `ensureMembershipParticipants is idempotent for existing membership rows`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val user = UserEntity(id = UUID.randomUUID(), email = "member@example.com", displayName = "Member")
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = "Member",
            )
        val existing =
            SeasonParticipantEntity(
                season = season,
                displayName = "Member",
                user = user,
                troupeMembership = membership,
            )

        whenever(
            troupeMembershipRepository.findByTroupe_IdAndStatusOrderByDisplayNameAsc(
                troupe.id,
                TroupeMembershipStatus.ACTIVE,
                Pageable.unpaged(),
            ),
        ).thenReturn(PageImpl(listOf(membership)))
        whenever(
            troupeMembershipRepository.findByTroupe_IdAndStatusOrderByDisplayNameAsc(
                troupe.id,
                TroupeMembershipStatus.INACTIVE,
                Pageable.unpaged(),
            ),
        ).thenReturn(PageImpl(emptyList()))
        whenever(seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(season.id, membership.id))
            .thenReturn(existing)
        whenever(seasonParticipantRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE))
            .thenReturn(1)
        whenever(seasonRepository.save(any())).thenAnswer { it.getArgument(0) }

        service.ensureMembershipParticipants(season)
        service.ensureMembershipParticipants(season)

        verify(seasonParticipantRepository, times(2)).save(existing)
    }
}

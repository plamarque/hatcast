package com.hatcast.api.troupe

import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.dto.AddTroupeMemberRequest
import com.hatcast.api.troupe.dto.UpdateTroupeMemberRequest
import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.openapitools.jackson.nullable.JsonNullable
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional
import java.util.UUID

class TroupeMembershipServiceTest {
    private val membershipRepository = mock<TroupeMembershipRepository>()
    private val troupeListStatsRepository = mock<TroupeListStatsRepository>()
    private val troupeRepository = mock<TroupeRepository>()
    private val userRepository = mock<UserRepository>()
    private val userAccountService = mock<UserAccountService>()
    private val csvImportService = mock<TroupeMemberCsvImportService>()
    private val service =
        TroupeMembershipService(
            membershipRepository,
            troupeListStatsRepository,
            troupeRepository,
            userRepository,
            userAccountService,
            csvImportService,
        )

    private val troupeId = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val troupe = TroupeEntity(id = troupeId, name = "La Malice", slug = "la-malice")

    @Test
    fun `direct membership creation defaults to MEMBER`() {
        val user = user("member@example.com")
        whenever(troupeRepository.findByIdForMembershipJoin(troupeId)).thenReturn(troupe)
        whenever(userRepository.findById(user.id)).thenReturn(Optional.of(user))
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, user.id)).thenReturn(null)
        whenever(membershipRepository.saveAndFlush(any())).thenAnswer { it.getArgument(0) }

        val saved = service.ensureActiveMembership(user.id, troupeId)

        assertEquals(TroupeBaselineRole.MEMBER, saved.baselineRole)
        assertEquals(TroupeMembershipStatus.ACTIVE, saved.status)
    }

    @Test
    fun `admin add trims email and creates member role by default`() {
        val principal = TestAuthSupport.testPrincipal()
        val target = user("target@example.com")
        val adminMembership = membership(principal.userId, TroupeBaselineRole.TROUPE_ADMIN)
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, principal.userId)).thenReturn(adminMembership)
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, target.id)).thenReturn(null)
        whenever(troupeRepository.findByIdForMembershipJoin(troupeId)).thenReturn(troupe)
        whenever(userAccountService.ensureUserByEmail("target@example.com")).thenReturn(target)
        whenever(membershipRepository.saveAndFlush(any())).thenAnswer { it.getArgument(0) }

        val saved =
            service.addMemberByEmail(
                troupeId,
                AddTroupeMemberRequest(email = " TARGET@example.com "),
                principal,
            )

        assertEquals(TroupeBaselineRole.MEMBER, saved.baselineRole)
        verify(userAccountService).ensureUserByEmail("target@example.com")
    }

    @Test
    fun `demoting last active admin is rejected`() {
        val principal = TestAuthSupport.testPrincipal()
        val adminMembership = membership(principal.userId, TroupeBaselineRole.TROUPE_ADMIN)
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, principal.userId)).thenReturn(adminMembership)
        whenever(membershipRepository.findByIdAndTroupe_Id(adminMembership.id, troupeId)).thenReturn(adminMembership)
        whenever(
            membershipRepository.countByTroupe_IdAndStatusAndBaselineRole(
                troupeId,
                TroupeMembershipStatus.ACTIVE,
                TroupeBaselineRole.TROUPE_ADMIN,
            ),
        ).thenReturn(1)

        val ex =
            assertThrows<ResponseStatusException> {
                service.updateMember(
                    troupeId,
                    adminMembership.id,
                    UpdateTroupeMemberRequest(baselineRole = JsonNullable.of(TroupeBaselineRole.MEMBER)),
                    principal,
                )
            }

        assertEquals(HttpStatus.CONFLICT, ex.statusCode)
    }

    @Test
    fun `listActiveTroupesForUser includes batched member and upcoming event counts`() {
        val userId = UUID.randomUUID()
        val membership = membership(userId, TroupeBaselineRole.MEMBER)
        whenever(membershipRepository.findActiveByUserId(userId)).thenReturn(listOf(membership))
        whenever(membershipRepository.countActiveMembersByTroupeIds(listOf(troupeId))).thenReturn(
            listOf(TestTroupeMemberCountRow(troupeId, 4L)),
        )
        whenever(
            troupeListStatsRepository.countUpcomingEventsByTroupeIdsForUser(
                eq(userId),
                eq(listOf(troupeId)),
                any(),
            ),
        ).thenReturn(listOf(TestTroupeUpcomingEventCountRow(troupeId, 2L)))

        val items = service.listActiveTroupesForUser(userId)

        assertEquals(1, items.size)
        assertEquals(4L, items[0].activeMemberCount)
        assertEquals(2L, items[0].upcomingEventCount)
    }

    @Test
    fun `listActiveTroupesForUser returns empty when no memberships`() {
        val userId = UUID.randomUUID()
        whenever(membershipRepository.findActiveByUserId(userId)).thenReturn(emptyList())

        assertTrue(service.listActiveTroupesForUser(userId).isEmpty())
    }

    @Test
    fun `demoting last active admin via add is rejected`() {
        val principal = TestAuthSupport.testPrincipal()
        val target = user("target@example.com")
        val adminMembership = membership(target.id, TroupeBaselineRole.TROUPE_ADMIN)
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, principal.userId)).thenReturn(
            membership(principal.userId, TroupeBaselineRole.TROUPE_ADMIN),
        )
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(troupeId, target.id)).thenReturn(adminMembership)
        whenever(troupeRepository.findByIdForMembershipJoin(troupeId)).thenReturn(troupe)
        whenever(userAccountService.ensureUserByEmail("target@example.com")).thenReturn(target)
        whenever(
            membershipRepository.countByTroupe_IdAndStatusAndBaselineRole(
                troupeId,
                TroupeMembershipStatus.ACTIVE,
                TroupeBaselineRole.TROUPE_ADMIN,
            ),
        ).thenReturn(1)

        val ex =
            assertThrows<ResponseStatusException> {
                service.addMemberByEmail(
                    troupeId,
                    AddTroupeMemberRequest(email = "target@example.com", baselineRole = TroupeBaselineRole.MEMBER),
                    principal,
                )
            }

        assertEquals(HttpStatus.CONFLICT, ex.statusCode)
    }

    private fun membership(
        userId: UUID,
        role: TroupeBaselineRole,
    ): TroupeMembershipEntity =
        TroupeMembershipEntity(
            troupe = troupe,
            user = UserEntity(id = userId, email = "$userId@example.com", displayName = "Member"),
            status = TroupeMembershipStatus.ACTIVE,
            baselineRole = role,
            displayName = "Member",
        )

    private fun user(email: String): UserEntity = UserEntity(email = email, displayName = "Target")

    private data class TestTroupeMemberCountRow(
        override val troupeId: UUID,
        override val memberCount: Long,
    ) : TroupeMemberCountRow

    private data class TestTroupeUpcomingEventCountRow(
        override val troupeId: UUID,
        override val eventCount: Long,
    ) : TroupeUpcomingEventCountRow
}

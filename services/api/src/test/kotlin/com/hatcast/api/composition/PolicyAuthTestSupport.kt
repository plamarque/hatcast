package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.Cookie
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/** Shared auth helpers for draw-policy integration tests (story 19.18). */
object PolicyAuthTestSupport {
    fun adminCookie(
        mockMvc: MockMvc,
        googleIdTokenService: GoogleIdTokenService,
        troupeId: UUID,
        troupeRepository: TroupeRepository,
        membershipRepository: TroupeMembershipRepository,
        userRepository: UserRepository,
        googleSub: String,
        displayName: String = "Policy Admin",
    ): Cookie {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = displayName,
            )
        val user =
            userRepository.findByGoogleSub(googleSub)
                ?: userRepository.findFirstByEmailIgnoreCase("$googleSub@example.com")
                ?: error("Missing user for $googleSub")
        ensureMembership(troupeId, troupeRepository, membershipRepository, userRepository, user.id, TroupeBaselineRole.TROUPE_ADMIN)
        return cookie
    }

    fun memberCookie(
        mockMvc: MockMvc,
        googleIdTokenService: GoogleIdTokenService,
        troupeId: UUID,
        troupeRepository: TroupeRepository,
        membershipRepository: TroupeMembershipRepository,
        userRepository: UserRepository,
        googleSub: String,
        displayName: String = "Policy Member",
    ): Cookie {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = displayName,
            )
        val user =
            userRepository.findByGoogleSub(googleSub)
                ?: userRepository.findFirstByEmailIgnoreCase("$googleSub@example.com")
                ?: error("Missing user for $googleSub")
        ensureMembership(troupeId, troupeRepository, membershipRepository, userRepository, user.id, TroupeBaselineRole.MEMBER)
        return cookie
    }

    fun seasonOrganizerCookie(
        mockMvc: MockMvc,
        googleIdTokenService: GoogleIdTokenService,
        adminCookie: Cookie,
        troupeId: UUID,
        seasonId: UUID,
        troupeRepository: TroupeRepository,
        membershipRepository: TroupeMembershipRepository,
        userRepository: UserRepository,
        googleSub: String,
        displayName: String = "Season Organizer",
    ): Cookie {
        val cookie =
            memberCookie(
                mockMvc,
                googleIdTokenService,
                troupeId,
                troupeRepository,
                membershipRepository,
                userRepository,
                googleSub,
                displayName,
            )
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$googleSub@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        return cookie
    }

    fun ensureMembership(
        troupeId: UUID,
        troupeRepository: TroupeRepository,
        membershipRepository: TroupeMembershipRepository,
        userRepository: UserRepository,
        userId: UUID,
        role: TroupeBaselineRole,
    ) {
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(troupeId, userId)
        if (existing != null) {
            existing.baselineRole = role
            membershipRepository.save(existing)
        } else {
            val troupe = troupeRepository.findById(troupeId).orElseThrow()
            val user = userRepository.findById(userId).orElseThrow()
            membershipRepository.save(
                com.hatcast.api.troupe.TroupeMembershipEntity(
                    troupe = troupe,
                    user = user,
                    status = TroupeMembershipStatus.ACTIVE,
                    baselineRole = role,
                    displayName = user.displayName ?: role.name,
                ),
            )
        }
    }
}

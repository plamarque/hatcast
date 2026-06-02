package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.avatar.AvatarStorage
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.awt.Color
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.time.Instant
import java.util.UUID
import javax.imageio.ImageIO

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeLogoIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var avatarStorage: AvatarStorage

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    @Test
    fun `admin uploads logo and anonymous visitor reads public logo`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "troupe-logo-admin-sub",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        promoteSeedMemberToAdmin("troupe-logo-admin-sub")
        val png = tinyPngBytes()

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/logo")
                    .file(MockMultipartFile("file", "logo.png", "image/png", png))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.logoUrl").isNotEmpty)

        mockMvc
            .perform(get("/v1/public/troupes/$seedTroupeId/logo"))
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "max-age=3600, public"))
    }

    @Test
    fun `public logo returns 404 for hidden demo or missing logo troupes`() {
        val hiddenId = UUID.randomUUID()
        val demoId = UUID.randomUUID()
        val png = tinyPngBytes()
        avatarStorage.store("troupe-logos/$hiddenId/logo.png", png)
        avatarStorage.store("troupe-logos/$demoId/logo.png", png)
        troupeRepository.saveAll(
            listOf(
                TroupeEntity(
                    id = hiddenId,
                    name = "Hidden Logo",
                    slug = "hidden-logo-${hiddenId.toString().take(8)}",
                    listedInDirectory = false,
                    isDemo = false,
                    logoStorageKey = "troupe-logos/$hiddenId/logo.png",
                    logoUpdatedAt = Instant.now(),
                ),
                TroupeEntity(
                    id = demoId,
                    name = "Demo Logo",
                    slug = "demo-logo-${demoId.toString().take(8)}",
                    listedInDirectory = true,
                    isDemo = true,
                    logoStorageKey = "troupe-logos/$demoId/logo.png",
                    logoUpdatedAt = Instant.now(),
                ),
            ),
        )

        mockMvc.perform(get("/v1/public/troupes/$hiddenId/logo")).andExpect(status().isNotFound)
        mockMvc.perform(get("/v1/public/troupes/$demoId/logo")).andExpect(status().isNotFound)
        mockMvc.perform(get("/v1/public/troupes/${UUID.randomUUID()}/logo")).andExpect(status().isNotFound)
    }

    @Test
    fun `admin deletes logo and DTO clears logoUrl`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "troupe-logo-delete-sub",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        promoteSeedMemberToAdmin("troupe-logo-delete-sub")

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/logo")
                    .file(MockMultipartFile("file", "logo.png", "image/png", tinyPngBytes()))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(delete("/v1/troupes/$seedTroupeId/logo").cookie(cookie).with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.logoUrl").doesNotExist())

        mockMvc.perform(get("/v1/public/troupes/$seedTroupeId/logo")).andExpect(status().isNotFound)
    }

    @Test
    fun `active member reads logo for hidden troupe via authenticated endpoint`() {
        val hiddenId = UUID.randomUUID()
        val png = tinyPngBytes()
        avatarStorage.store("troupe-logos/$hiddenId/logo.png", png)
        troupeRepository.save(
            TroupeEntity(
                id = hiddenId,
                name = "Hidden Member Logo",
                slug = "hidden-member-logo-${hiddenId.toString().take(8)}",
                listedInDirectory = false,
                isDemo = false,
                logoStorageKey = "troupe-logos/$hiddenId/logo.png",
                logoUpdatedAt = Instant.now(),
            ),
        )
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "troupe-logo-hidden-member-sub",
            )
        membershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupeRepository.findById(hiddenId).orElseThrow(),
                user =
                    userRepository.findByGoogleSub("troupe-logo-hidden-member-sub")
                        ?: error("Missing test user"),
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.MEMBER,
                displayName = "Membre",
                createdAt = Instant.now(),
                updatedAt = Instant.now(),
            ),
        )

        mockMvc
            .perform(get("/v1/troupes/$hiddenId/logo").cookie(cookie))
            .andExpect(status().isOk)
        mockMvc.perform(get("/v1/public/troupes/$hiddenId/logo")).andExpect(status().isNotFound)
    }

    @Test
    fun `logo upload rejects unsupported content type`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "troupe-logo-bad-mime-sub",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        promoteSeedMemberToAdmin("troupe-logo-bad-mime-sub")

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/logo")
                    .file(MockMultipartFile("file", "logo.txt", "text/plain", "hello".toByteArray()))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    private fun tinyPngBytes(): ByteArray {
        val image = BufferedImage(8, 8, BufferedImage.TYPE_INT_RGB)
        val graphics = image.createGraphics()
        graphics.color = Color.BLUE
        graphics.fillRect(0, 0, 8, 8)
        graphics.dispose()
        val out = ByteArrayOutputStream()
        ImageIO.write(image, "png", out)
        return out.toByteArray()
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }
}

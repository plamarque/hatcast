package com.hatcast.api.avatar

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.awt.Color
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfileAvatarIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var googlePictureFetcher: GooglePictureFetcher

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

    /** En-tête ISO BMFF minimal (ftyp + marque avif) pour valider la détection magic bytes. */
    private fun tinyAvifBytes(): ByteArray =
        byteArrayOf(
            0x00, 0x00, 0x00, 0x14,
            0x66, 0x74, 0x79, 0x70,
            0x61, 0x76, 0x69, 0x66,
            0x00, 0x00, 0x00, 0x00,
            0x61, 0x76, 0x69, 0x66,
        )

    @Test
    fun `upload avif avatar persists avatarUrl`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-avif-sub",
            )

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.avif", "image/avif", tinyAvifBytes()))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.avatarUrl").isNotEmpty)
    }

    @Test
    fun `upload avatar persists avatarUrl and serves bytes`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-upload-sub",
            )
        val png = tinyPngBytes()

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.png", "image/png", png))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.avatarUrl").isNotEmpty)

        val user = userRepository.findAll().first { it.googleSub == "avatar-upload-sub" }
        mockMvc
            .perform(get("/v1/users/${user.id}/avatar").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "private, max-age=3600"))
    }

    @Test
    fun `oversize upload returns 400`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-oversize-sub",
            )
        val tooLarge = ByteArray(2_097_153) { 0xFF.toByte() }

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "big.png", "image/png", tooLarge))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("Fichier trop volumineux (2 Mo max.)"))
    }

    @Test
    fun `bad mime returns 400`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-bad-mime-sub",
            )

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "doc.txt", "text/plain", "hello".toByteArray()))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("Format non pris en charge."))
    }

    @Test
    fun `delete avatar clears avatarUrl`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-delete-sub",
            )
        val png = tinyPngBytes()

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.png", "image/png", png))
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                delete("/v1/auth/me/avatar")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.avatarUrl").doesNotExist())
    }

    @Test
    fun `google import stores avatar from session picture`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-google-sub",
            )
        whenever(googlePictureFetcher.fetch(any())).thenReturn(tinyPngBytes())

        mockMvc
            .perform(
                post("/v1/auth/me/avatar/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(
                post("/v1/auth/me/avatar/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"pictureUrl":"https://lh3.googleusercontent.com/a/test-user=s96-c"}""",
                    )
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.avatarUrl").isNotEmpty)
    }

    @Test
    fun `avatar mutation without session returns 401`() {
        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.png", "image/png", tinyPngBytes()))
                    .with(csrf()),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `avatar upload requires csrf`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-csrf-sub",
            )

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.png", "image/png", tinyPngBytes()))
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `get avatar for user without shared troupe returns 403`() {
        val ownerCookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-forbidden-owner-sub",
            )
        val otherCookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "avatar-forbidden-other-sub",
            )
        val png = tinyPngBytes()

        mockMvc
            .perform(
                multipart("/v1/auth/me/avatar")
                    .file(MockMultipartFile("file", "avatar.png", "image/png", png))
                    .cookie(ownerCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        val owner = userRepository.findAll().first { it.googleSub == "avatar-forbidden-owner-sub" }

        mockMvc
            .perform(get("/v1/users/${owner.id}/avatar").cookie(otherCookie))
            .andExpect(status().isForbidden)
    }
}

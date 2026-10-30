package com.hatcast.api.advent

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest(properties = ["hatcast.advent-test.enabled=true", "hatcast.advent-test.troupe-id=a0000001-0000-4000-8000-000000000001"])
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdventTestIntegrationTest {
    @Autowired private lateinit var mvc: MockMvc
    @MockBean private lateinit var google: GoogleIdTokenService
    @MockBean private lateinit var idp: IdpIdTokenVerifier
    @Test fun `direct requests cannot disclose content outside offline profile`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-test-integration")
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Camille"))))
    }
    @Test fun `anonymous requests are not cached`() {
        mvc.perform(get("/v1/advent-test/doors/1"))
            .andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
    }
}

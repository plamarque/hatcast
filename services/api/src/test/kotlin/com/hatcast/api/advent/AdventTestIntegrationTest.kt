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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.http.MediaType
import java.util.UUID
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest(properties = ["hatcast.advent-test.enabled=true", "hatcast.advent-test.troupe-id=a0000001-0000-4000-8000-000000000001"])
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdventTestIntegrationTest {
    @Autowired private lateinit var mvc: MockMvc
    @MockBean private lateinit var google: GoogleIdTokenService
    @MockBean private lateinit var idp: IdpIdTokenVerifier
    @Test fun `removed test API cannot disclose content to authenticated users`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-test-integration")
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Camille"))))
    }
    @Test fun `anonymous requests are not cached`() {
        mvc.perform(get("/v1/advent-test/doors/1"))
            .andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
    }
    @Test fun `removed test API rejects anonymous and authenticated requests without cache`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-result-security")
        for (path in listOf("/v1/advent-test/session", "/v1/advent-test/doors/1/answer", "/v1/advent-test/results/latest-unseen", "/v1/advent-test/doors/1/result", "/v1/advent-test/clock", "/v1/advent-test/ranking")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get(path).cookie(cookie)).andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        }
        for (path in listOf("/v1/advent-test/session/reset", "/v1/advent-test/doors/1/answer", "/v1/advent-test/doors/1/answer/reserve", "/v1/advent-test/doors/1/answer/reconcile")) {
            mvc.perform(post(path).cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        }
        mvc.perform(post("/v1/advent-test/clock/previous-day").cookie(cookie).with(csrf()))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/clock/next-day").cookie(cookie).with(csrf()))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/result/acknowledge").cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"answerId":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
    }

}

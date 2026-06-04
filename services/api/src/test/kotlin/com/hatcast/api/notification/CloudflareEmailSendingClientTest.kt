package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.header
import org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestClient

class CloudflareEmailSendingClientTest {
    @Test
    fun `parseFromHeader extracts address and display name`() {
        val named = CloudflareEmailSendingClient.parseFromHeader("HatCast <noreply@hatcast.app>")
        assertEquals("noreply@hatcast.app", named.address)
        assertEquals("HatCast", named.displayName)

        val plain = CloudflareEmailSendingClient.parseFromHeader("noreply@hatcast.app")
        assertEquals("noreply@hatcast.app", plain.address)
        assertEquals(null, plain.displayName)

        assertEquals("noreply@hatcast.app", CloudflareEmailSendingClient.parseFromAddress("HatCast <noreply@hatcast.app>"))
    }

    @Test
    fun `isAvailable false when credentials missing`() {
        val client =
            CloudflareEmailSendingClient(
                CloudflareEmailSendingProperties(),
                RestClient.builder(),
            )
        assertFalse(client.isAvailable())
    }

    @Test
    fun `send posts to Cloudflare API when configured`() {
        val properties =
            CloudflareEmailSendingProperties(
                accountId = "acc-test",
                apiToken = "secret-token",
            )
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        server
            .expect(requestTo("https://api.cloudflare.com/client/v4/accounts/acc-test/email/sending/send"))
            .andExpect(method(org.springframework.http.HttpMethod.POST))
            .andExpect(header("Authorization", "Bearer secret-token"))
            .andExpect(jsonPath("$.from.address").value("noreply@hatcast.app"))
            .andExpect(jsonPath("$.from.name").value("HatCast"))
            .andExpect(jsonPath("$.to").value("user@example.com"))
            .andExpect(jsonPath("$.subject").value("Sujet test"))
            .andRespond(
                withSuccess(
                    """{"success":true,"errors":[],"result":{"delivered":["user@example.com"]}}""",
                    MediaType.APPLICATION_JSON,
                ),
            )

        val client = CloudflareEmailSendingClient(properties, builder)
        val outcome =
            client.send(
                to = "user@example.com",
                fromHeader = "HatCast <noreply@hatcast.app>",
                subject = "Sujet test",
                htmlBody = "<p>Hello</p>",
            )

        assertTrue(outcome.sent)
        server.verify()
    }

    @Test
    fun `send returns failure when API reports success false`() {
        val properties = CloudflareEmailSendingProperties(accountId = "acc", apiToken = "tok")
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        server
            .expect(requestTo(org.hamcrest.Matchers.containsString("/email/sending/send")))
            .andRespond(
                withSuccess(
                    """{"success":false,"errors":[{"code":1000,"message":"bad"}]}""",
                    MediaType.APPLICATION_JSON,
                ),
            )

        val client = CloudflareEmailSendingClient(properties, builder)
        val outcome = client.send("a@b.com", "noreply@hatcast.app", "s", "<p>x</p>")

        assertFalse(outcome.sent)
        assertEquals("1000: bad", outcome.errorMessage)
    }
}

package com.hatcast.api.notification

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientResponseException

@Component
class CloudflareEmailSendingClient(
    private val properties: CloudflareEmailSendingProperties,
    restClientBuilder: RestClient.Builder,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val restClient: RestClient? =
        if (properties.isConfigured()) {
            restClientBuilder.build()
        } else {
            null
        }

    fun isAvailable(): Boolean = restClient != null

    fun send(
        to: String,
        fromHeader: String,
        subject: String,
        htmlBody: String,
    ): CloudflareSendOutcome {
        val client =
            restClient
                ?: return CloudflareSendOutcome.failure("cloudflare_email_not_configured")

        val from = parseFromHeader(fromHeader)
        val request =
            CloudflareSendRequest(
                to = to,
                from = CloudflareFromAddress(address = from.address, name = from.displayName),
                subject = subject,
                html = htmlBody,
                text = htmlBody.replace(Regex("<[^>]+>"), "").trim(),
            )

        return try {
            val response =
                client
                    .post()
                    .uri(sendUrl())
                    .header("Authorization", "Bearer ${properties.apiToken}")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(CloudflareSendApiResponse::class.java)

            if (response?.success == true) {
                CloudflareSendOutcome.success()
            } else {
                val detail = response?.errors?.joinToString { "${it.code}: ${it.message}" } ?: "unknown"
                log.warn("cloudflare_email_send_failed detail={}", detail)
                CloudflareSendOutcome.failure(detail)
            }
        } catch (ex: RestClientResponseException) {
            val detail = "${ex.statusCode.value()} ${ex.responseBodyAsString.take(500)}"
            log.warn("cloudflare_email_send_http_error detail={}", detail)
            CloudflareSendOutcome.failure(detail)
        } catch (ex: Exception) {
            val detail = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown")
            log.warn("cloudflare_email_send_error detail={}", detail)
            CloudflareSendOutcome.failure(detail)
        }
    }

    private fun sendUrl(): String =
        "https://api.cloudflare.com/client/v4/accounts/${properties.accountId}/email/sending/send"

    companion object {
        /** Parses `HatCast <noreply@hatcast.app>` or plain `noreply@hatcast.app`. */
        fun parseFromHeader(fromHeader: String): ParsedFromHeader {
            val trimmed = fromHeader.trim()
            val match = Regex("^(.+?)\\s*<([^>]+)>\\s*$").find(trimmed)
            if (match != null) {
                val displayName = match.groupValues[1].trim().trim('"').takeIf { it.isNotEmpty() }
                return ParsedFromHeader(address = match.groupValues[2].trim(), displayName = displayName)
            }
            return ParsedFromHeader(address = trimmed)
        }

        fun parseFromAddress(fromHeader: String): String = parseFromHeader(fromHeader).address
    }
}

data class ParsedFromHeader(
    val address: String,
    val displayName: String? = null,
)

data class CloudflareSendOutcome(
    val sent: Boolean,
    val errorMessage: String? = null,
) {
    companion object {
        fun success() = CloudflareSendOutcome(sent = true)

        fun failure(message: String) = CloudflareSendOutcome(sent = false, errorMessage = message)
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
private data class CloudflareFromAddress(
    val address: String,
    val name: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class CloudflareSendRequest(
    val to: String,
    val from: CloudflareFromAddress,
    val subject: String,
    val html: String,
    val text: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class CloudflareSendApiResponse(
    val success: Boolean = false,
    val errors: List<CloudflareApiError>? = null,
    val result: CloudflareSendResult? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class CloudflareApiError(
    val code: Int? = null,
    val message: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
private data class CloudflareSendResult(
    val delivered: List<String>? = null,
    val queued: List<String>? = null,
    @JsonProperty("permanent_bounces")
    val permanentBounces: List<String>? = null,
)

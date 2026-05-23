package com.hatcast.api.avatar

import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@Component
class GooglePictureFetcher(
    private val avatarProperties: AvatarProperties,
) {
    private val httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build()

    fun fetch(url: String): ByteArray {
        val request =
            HttpRequest
                .newBuilder(URI.create(url))
                .GET()
                .build()
        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray())
        if (response.statusCode() !in 200..299) {
            throw IllegalStateException("Impossible de récupérer la photo Google.")
        }
        val body = response.body()
        if (body.size > avatarProperties.maxBytes) {
            throw IllegalStateException("Fichier trop volumineux (2 Mo max.)")
        }
        return body
    }
}

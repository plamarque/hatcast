package com.hatcast.api.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.session.web.http.CookieSerializer

@Configuration
class HatcastSessionCookieConfiguration(
    @Value("\${server.servlet.session.cookie.name:HATCAST_SESSION}") private val cookieName: String,
    @Value("\${server.servlet.session.cookie.secure:false}") private val secure: Boolean,
    @Value("\${server.servlet.session.cookie.same-site:lax}") private val sameSite: String,
    @Value("\${hatcast.auth.remember-me-seconds:2592000}") private val rememberMeSeconds: Int,
) {
    @Bean
    fun cookieSerializer(): CookieSerializer =
        HatcastSessionCookieSerializer(
            cookieName = cookieName,
            useSecureCookie = secure,
            sameSite = sameSite,
            rememberMeSeconds = rememberMeSeconds,
        )
}

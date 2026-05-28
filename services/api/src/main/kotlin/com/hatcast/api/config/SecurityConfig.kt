package com.hatcast.api.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    @Value("\${hatcast.cors.allowed-origins}") private val allowedOrigins: String,
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        // SPA (fetch + cookie lisible) : même valeur cookie → en-tête X-XSRF-TOKEN.
        // XorCsrfTokenRequestAttributeHandler (défaut SS6) attend un format incompatible avec ce pattern.
        val requestHandler = CsrfTokenRequestAttributeHandler()
        requestHandler.setCsrfRequestAttributeName("_csrf")

        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { csrf ->
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                csrf.csrfTokenRequestHandler(requestHandler)
                csrf.ignoringRequestMatchers(
                    AntPathRequestMatcher("/v1/auth/google", HttpMethod.POST.name()),
                    AntPathRequestMatcher("/v1/auth/idp", HttpMethod.POST.name()),
                    AntPathRequestMatcher("/v1/auth/logout", HttpMethod.POST.name()),
                )
            }.authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/google").permitAll()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/idp").permitAll()
                    .requestMatchers(HttpMethod.GET, "/v1/auth/me").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/agenda").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/inbox").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/members/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/logout").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/me/avatar").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/me/avatar/google").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/v1/auth/me/avatar").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/users/*/avatar").authenticated()
                    .requestMatchers(
                        "/v1/troupes",
                        "/v1/troupes/**",
                        "/v1/seasons/**",
                        "/v1/admin/**",
                    ).authenticated()
                    .anyRequest().denyAll()
            }.exceptionHandling { ex ->
                ex.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins =
            allowedOrigins.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}

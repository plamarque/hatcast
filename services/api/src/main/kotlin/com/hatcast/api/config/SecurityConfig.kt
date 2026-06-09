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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.csrf.CsrfFilter
import org.springframework.security.web.csrf.CsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.beans.factory.ObjectProvider
import com.hatcast.api.e2e.E2eApiKeyAuthenticationFilter
import com.hatcast.api.e2e.E2eApiKeyRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    @Value("\${hatcast.cors.allowed-origins}") private val allowedOrigins: String,
    @Value("\${hatcast.e2e.api-enabled:false}") private val e2eApiEnabled: Boolean,
    private val csrfCookiePublishingFilter: CsrfCookiePublishingFilter,
    private val migrationApiKeyAuthenticationFilter: MigrationApiKeyAuthenticationFilter,
    private val migrationApiKeyRequestMatcher: MigrationApiKeyRequestMatcher,
    private val e2eApiKeyAuthenticationFilter: ObjectProvider<E2eApiKeyAuthenticationFilter>,
    private val e2eApiKeyRequestMatcher: ObjectProvider<E2eApiKeyRequestMatcher>,
    private val csrfTokenRepository: CsrfTokenRepository,
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        // SPA (fetch + cookie lisible) : même valeur cookie → en-tête X-XSRF-TOKEN.
        // XorCsrfTokenRequestAttributeHandler (défaut SS6) attend un format incompatible avec ce pattern.
        val requestHandler = CsrfTokenRequestAttributeHandler()
        requestHandler.setCsrfRequestAttributeName("_csrf")

        http
            .cors { it.configurationSource(corsConfigurationSource()) }
        if (e2eApiEnabled) {
            http.csrf { it.disable() }
        } else {
            http.csrf { csrf ->
                csrf.csrfTokenRepository(csrfTokenRepository)
                csrf.csrfTokenRequestHandler(requestHandler)
                csrf.ignoringRequestMatchers(
                    AntPathRequestMatcher("/v1/auth/google", HttpMethod.POST.name()),
                    AntPathRequestMatcher("/v1/auth/idp", HttpMethod.POST.name()),
                    AntPathRequestMatcher("/v1/auth/logout", HttpMethod.POST.name()),
                    migrationApiKeyRequestMatcher,
                )
            }
            http.addFilterAfter(csrfCookiePublishingFilter, CsrfFilter::class.java)
        }
        http
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/actuator/metrics", "/actuator/metrics/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/google").permitAll()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/idp").permitAll()
                    .requestMatchers(HttpMethod.GET, "/v1/auth/me").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/agenda").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/inbox").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/preferences").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/v1/me/preferences").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/notification-preferences").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/v1/me/notification-preferences").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/me/push").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/v1/me/push/subscription").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/v1/me/push/subscription").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/v1/me/push").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/config/public").permitAll()
                    .requestMatchers(HttpMethod.GET, "/v1/members/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/logout").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/v1/auth/me").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/me/avatar").authenticated()
                    .requestMatchers(HttpMethod.POST, "/v1/auth/me/avatar/google").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/v1/auth/me/avatar").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/users/*/avatar").authenticated()
                    .requestMatchers(HttpMethod.GET, "/v1/public/troupes").permitAll()
                    .requestMatchers(HttpMethod.GET, "/v1/public/troupes/*/logo").permitAll()
                if (e2eApiEnabled) {
                    auth.requestMatchers("/v1/e2e/**").permitAll()
                }
                auth
                    .requestMatchers(
                        "/v1/troupes",
                        "/v1/troupes/**",
                        "/v1/seasons/**",
                        "/v1/admin/**",
                        "/v1/audit/**",
                    ).authenticated()
                    .anyRequest().denyAll()
            }.exceptionHandling { ex ->
                ex.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            }
            .addFilterBefore(migrationApiKeyAuthenticationFilter, CsrfFilter::class.java)
        e2eApiKeyAuthenticationFilter.ifAvailable { filter ->
            http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter::class.java)
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

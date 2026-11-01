package com.hatcast.api.e2e

import com.hatcast.api.advent.AdventMemberClock
import java.time.Instant
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import javax.sql.DataSource

/** Read-only guard for browser smoke tests; never authorize fixtures on a persistent database. */
@RestController
@Profile("e2e")
@RequestMapping("/v1/e2e/fixtures/advent-preview-guard")
class E2eAdventIsolationGuard(private val dataSource: DataSource, private val clock: AdventMemberClock) {
    @PostMapping("/open")
    fun open() {
        guard()
        clock.setFixtureInstant(Instant.parse("2026-11-30T23:00:00Z"))
    }

    @GetMapping
    fun guard(): Map<String, String> {
        val url = dataSource.connection.use { it.metaData.url }
        if (!url.startsWith("jdbc:h2:mem:hatcast_e2e")) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return mapOf("environment" to "advent-e2e-memory")
    }
}

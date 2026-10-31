package com.hatcast.api.advent

import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.Paths
import java.time.Instant
import javax.sql.DataSource

/** Only a proven isolated local or named development runtime may use the configured offset. */
@Component
class AdventMemberClock(private val environment: Environment, private val dataSource: DataSource, private val offlineRoot: AdventOfflineRoot) {
    fun instant(): Instant {
        val actual = Instant.now()
        val profiles = environment.activeProfiles.toSet()
        val service = environment.getProperty("K_SERVICE")
        // Explicit production never applies an offset, even if one was accidentally configured.
        if ("prod" in profiles || (profiles == setOf("cloud") && service == "hatcast-v2")) return actual
        val configured = environment.getProperty("hatcast.advent.clock-offset-seconds")?.trim().orEmpty()
        if (configured.isEmpty()) return actual
        val offset = configured.toLongOrNull() ?: throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
        val offline = "offline" in profiles && profiles.all { it == "offline" || it == "dev" } && isOfflineDatabase()
        val development = profiles == setOf("cloud") && service == "hatcast-v2-dev" &&
            environment.getProperty("GOOGLE_CLOUD_PROJECT") == "impro-selector" && isDevelopmentDatabase()
        if (!offline && !development) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
        return try { actual.plusSeconds(offset) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE) }
    }

    fun isolatedControlsAllowed(): Boolean {
        val profiles = environment.activeProfiles.toSet()
        val local = "offline" in profiles && profiles.all { it == "offline" || it == "dev" } &&
            environment.getProperty("hatcast.advent-test.enabled") == "true" && isOfflineDatabase()
        val cloud = profiles == setOf("cloud") && environment.getProperty("K_SERVICE") == "hatcast-v2-dev" &&
            environment.getProperty("GOOGLE_CLOUD_PROJECT") == "impro-selector" && isDevelopmentDatabase()
        return local || cloud
    }

    private fun isDevelopmentDatabase(): Boolean = try {
        val url = dataSource.connection.use { it.metaData.url }
        val uri = java.net.URI(url.removePrefix("jdbc:"))
        url.startsWith("jdbc:postgresql://") && uri.host in setOf("ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech", "ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech")
    } catch (_: Exception) { false }

    fun isOfflineDatabase(): Boolean = try {
        val url = dataSource.connection.use { it.metaData.url }
        val prefix = "jdbc:h2:file:"
        if (!url.startsWith(prefix)) false else {
            val actual = Paths.get(url.removePrefix(prefix).substringBefore(';')).toAbsolutePath().normalize()
            val root = offlineRoot.worktreeRoot()
            val local = root.resolve(".local")
            val dir = local.resolve("hatcast-offline")
            val file = dir.resolve("hatcast.mv.db")
            actual == dir.resolve("hatcast").toAbsolutePath().normalize() &&
                !Files.isSymbolicLink(local) && !Files.isSymbolicLink(dir) && !Files.isSymbolicLink(file) &&
                Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)
        }
    } catch (_: Exception) { false }
}

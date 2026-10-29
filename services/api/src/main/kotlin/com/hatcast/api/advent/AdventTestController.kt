package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.Paths
import java.util.UUID
import javax.sql.DataSource

/** Fictional, read-only preview: the actual database and profiles must both be isolated. */
@RestController
@RequestMapping("/v1/advent-test")
class AdventTestController(
    private val environment: Environment,
    private val dataSource: DataSource,
    private val memberships: TroupeMembershipService,
    private val offlineRoot: AdventOfflineRoot,
) {
    @GetMapping("/doors/{day}")
    fun door(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal): FictionalQuiz {
        val profiles = environment.activeProfiles.toSet()
        if ("offline" !in profiles || !profiles.all { it == "offline" || it == "dev" } ||
            environment.getProperty("hatcast.advent-test.enabled") != "true" || !isOfflineDatabase()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        val troupeId = try {
            UUID.fromString(environment.getProperty("hatcast.advent-test.troupe-id") ?: "")
        } catch (_: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        memberships.requireActiveMemberMembership(principal.userId, troupeId)
        val (name, statements) = when (day) {
            1 -> "Camille Flocon" to listOf(
                "Camille a joué une scène sur la Lune.",
                "Camille possède un parapluie qui chante.",
                "Camille a appris à jongler avec des étoiles.",
            )
            12 -> "Sacha Givre" to listOf(
                "Sacha a dressé un nuage pour la scène.",
                "Sacha a inventé une danse pour les flocons.",
                "Sacha connaît le langage des sapins.",
            )
            else -> throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        return FictionalQuiz(day, name, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAABv0lEQVR4nO3aQVEEMBQE0XWIFVzgEAMIwAIn7suSpOdPuqoF/HnHVB5fn992oAd+wSUJLXRXQgvdldBCdyW00F0JLXRXQgvdldBCdyW00F0JLXRXQgvdldBC//b+9vFM+J2DoZ8kHsEdCv0CcTh3HPQ/iWO5s6AXKqdZB0EvV46yToHepJxjHQG9VTnEmoc+oJxgLfQd0MeUcWuhL4A+rMxaC90OjSiD1kILLbTQQgsttNBCCy200EILLbTQQg+2psYKfQH0eWtwqdB3QJ+0ZmcKfQ30GWt8YwT0bmt8XRD0Pmt8Vxz0Dmt8USj0Wmt8SzT0Em78/jHQL3PjN4+E/hM3fud46I6EFroroYXuSmihuxJa6K6EFroroe+AXv7SH/vw5N+7amhQmbI+DY0TU9xHoXFZ0PoQNA6Kc5+Axh0TrLdD44Ih1nuhcbsc643QuFqU9S5o3CvNegs0LhVovR4aN8q0XgyN68RaCz0QGndJtl4GjYuEWws9Chq3yLcWeg40rjDCWugh0Pj+KdZCC50XBo0vH2QttNCRCd0LjW+eZS200KkJLXRXQgvdldBCdyW00F0JLXRXQgvd1WtcP9Y997/UBtyaAAAAAElFTkSuQmCC", statements)
    }

    private fun isOfflineDatabase(): Boolean = try {
        val actual = dataSource.connection.use { it.metaData.url }
        val prefix = "jdbc:h2:file:"
        if (!actual.startsWith(prefix)) false else {
            val actualPath = Paths.get(actual.removePrefix(prefix).substringBefore(';')).toAbsolutePath().normalize()
            val expected = offlineRoot.worktreeRoot().resolve(".local/hatcast-offline/hatcast")
                .toAbsolutePath().normalize()
            val worktreeRoot = expected.parent.parent.parent
            val localDir = worktreeRoot.resolve(".local")
            val offlineDir = localDir.resolve("hatcast-offline")
            val databaseFile = offlineDir.resolve("hatcast.mv.db")
            actualPath == expected &&
                !Files.isSymbolicLink(localDir) && !Files.isSymbolicLink(offlineDir) &&
                !Files.isSymbolicLink(databaseFile) &&
                Files.isRegularFile(databaseFile, LinkOption.NOFOLLOW_LINKS)
        }
    } catch (_: Exception) { false }
}

data class FictionalQuiz(val day: Int, val name: String, val portrait: String, val statements: List<String>)

/** Resolve the worktree from the API process directory; never configured by the request. */
@Component
class AdventOfflineRoot {
    fun worktreeRoot() = Paths.get(System.getProperty("user.dir"), "../..").toAbsolutePath().normalize()
}

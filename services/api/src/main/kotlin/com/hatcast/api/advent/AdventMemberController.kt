package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import jakarta.servlet.http.HttpServletRequest
import java.nio.file.Files
import java.nio.file.LinkOption
import java.time.LocalDate
import java.util.Base64
import java.util.UUID

/** The member game exposes no simulated clock, reset or replay controls. */
@RestController
@RequestMapping("/v1/advent")
class AdventMemberController(
    private val environment: Environment,
    private val memberships: TroupeMembershipService,
    private val game: AdventMemberGame,
    private val clock: AdventMemberClock,
    private val offlineRoot: AdventOfflineRoot,
) {
    private fun authorize(principal: SessionUserPrincipal): UUID {
        val troupe = try { UUID.fromString(environment.getProperty("hatcast.advent.troupe-id", "")) }
            catch (_: IllegalArgumentException) { throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE) }
        memberships.requireActiveMemberMembership(principal.userId, troupe)
        return troupe
    }
    private fun exclusions(): Set<UUID> = try {
        environment.getProperty("hatcast.advent.excluded-user-ids", "").split(',').map { UUID.fromString(it.trim()) }.toSet()
    } catch (_: IllegalArgumentException) { throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE) }

    private fun canControl(principal: SessionUserPrincipal, request: HttpServletRequest): Boolean {
        if (!clock.isolatedControlsAllowed()) return false
        val operators = try { exclusions() } catch (_: ResponseStatusException) { return false }
        if (operators.size != 2 || principal.userId !in operators) return false
        if (request.getSession(false)?.getAttribute("hatcast.auth.verified-email") != true) return false
        val profiles = environment.activeProfiles.toSet()
        val emails = if (profiles == setOf("cloud")) setOf("patrice.lamarque@gmail.com", "brousseau.ant@gmail.com") else
            environment.getProperty("hatcast.advent-test.allowed-emails", "").split(',').map { it.trim().lowercase() }.filter { it.isNotEmpty() }.toSet()
        return emails.size == 2 && principal.email?.trim()?.lowercase() in emails
    }

    private fun requireControl(principal: SessionUserPrincipal, request: HttpServletRequest): UUID {
        authorize(principal)
        if (!canControl(principal, request)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return try { UUID.fromString(request.getHeader("X-Advent-Test-Session")) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.CONFLICT) }
    }

    private fun sessionFor(principal: SessionUserPrincipal, request: HttpServletRequest): UUID =
        try { UUID.fromString(request.getHeader("X-Advent-Test-Session")) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.CONFLICT) }

    private fun simulated(principal: SessionUserPrincipal, request: HttpServletRequest): LocalDate? {
        val value = request.getHeader("X-Advent-Simulated-Date") ?: return null
        if (!canControl(principal, request)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val date = try { LocalDate.parse(value) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.BAD_REQUEST) }
        if (date.isBefore(LocalDate.of(2026, 12, 1)) || date.isAfter(LocalDate.of(2027, 1, 15))) throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        return date
    }

    @GetMapping("/session")
    fun session(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, Any> {
        authorize(principal)
        val capability = canControl(principal, request)
        simulated(principal, request)
        return mapOf("testControls" to capability, "sessionId" to game.session())
    }

    @PostMapping("/session/reset")
    fun reset(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        val session = requireControl(principal, request)
        simulated(principal, request)
        game.reset(session)
    }

    @PostMapping("/doors/{day}/answer/replay")
    fun replay(@PathVariable day: Int, @RequestBody body: ReplayAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val session = requireControl(principal, request)
        return game.replay(principal.userId, day, body.replayToken ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), session, simulated(principal, request))
    }

    @GetMapping("/clock")
    fun date(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, String> {
        authorize(principal)
        return mapOf("date" to game.today(sessionFor(principal, request), simulated(principal, request)).toString())
    }

    @GetMapping("/doors/{day}")
    fun door(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): FictionalQuiz {
        authorize(principal)
        val quiz = game.quiz(day, sessionFor(principal, request), simulated(principal, request)) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val (image, generic) = image(quiz.portraitRef)
        return FictionalQuiz(day, quiz.name, image, quiz.statements, generic)
    }

    @GetMapping("/doors/{day}/answer")
    fun state(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.state(principal.userId, day, canControl(principal, request), sessionFor(principal, request), simulated(principal, request))
    }

    @PostMapping("/doors/{day}/answer")
    fun confirm(@PathVariable day: Int, @RequestBody body: MemberAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.confirm(principal.userId, day, body.choice ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), canControl(principal, request), sessionFor(principal, request), simulated(principal, request))
    }

    @PostMapping("/doors/{day}/answer/reconcile")
    fun reconcile(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.reconcile(principal.userId, day, canControl(principal, request), sessionFor(principal, request), simulated(principal, request))
    }

    @PostMapping("/doors/{day}/answer/reserve")
    fun reserve(@PathVariable day: Int, @RequestBody body: AnswerAttempt, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.reserve(principal.userId, day, body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.generation ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), canControl(principal, request), sessionFor(principal, request), simulated(principal, request))
    }

    @GetMapping("/results/latest-unseen")
    fun latest(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, AdventResult?> {
        authorize(principal)
        return mapOf("result" to game.latestUnseen(principal.userId, sessionFor(principal, request), simulated(principal, request)))
    }

    @GetMapping("/doors/{day}/result")
    fun result(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventResult {
        authorize(principal)
        return game.result(principal.userId, day, sessionFor(principal, request), simulated(principal, request)) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @PostMapping("/doors/{day}/result/acknowledge")
    fun acknowledge(@PathVariable day: Int, @RequestBody body: AcknowledgeResult, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        authorize(principal)
        game.acknowledge(principal.userId, day, body.answerId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), sessionFor(principal, request), simulated(principal, request))
    }

    @GetMapping("/ranking")
    fun ranking(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventRankingResponse {
        val troupe = authorize(principal)
        return game.ranking(principal.userId, troupe, exclusions(), canControl(principal, request), sessionFor(principal, request), simulated(principal, request))
    }

    private fun image(ref: String?): Pair<String, Boolean> {
        val profiles = environment.activeProfiles.toSet()
        val bytes: ByteArray? = if (ref == null) null else if ("offline" in profiles) {
            val local = offlineRoot.worktreeRoot().resolve(".local")
            val directory = local.resolve("hatcast-avent-test")
            val path = directory.resolve(ref)
            if (!Files.isSymbolicLink(local) && !Files.isSymbolicLink(directory) && !Files.isSymbolicLink(path) &&
                Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS) && Files.size(path) <= 5_000_000) Files.readAllBytes(path) else null
        } else {
            val bucket = environment.getProperty("hatcast.advent.private-portrait-bucket", "").trim()
            if (!bucket.matches(Regex("[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]"))) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
            try {
                val blob = com.google.cloud.storage.StorageOptions.getDefaultInstance().service.get(bucket, ref)
                if (blob != null && blob.size <= 5_000_000) blob.getContent() else null
            } catch (_: Exception) { null }
        }
        if (ref != null && bytes == null && "offline" !in profiles) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
        val content = bytes ?: javaClass.getResourceAsStream("/advent/lutin-generique-net.png")!!.use { it.readBytes() }
        return ("data:image/png;base64," + Base64.getEncoder().encodeToString(content)) to (bytes == null)
    }
}
data class MemberAnswer(val choice: Int?, val attemptId: UUID?)

package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import com.hatcast.api.notification.UserPushSubscriptionService
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import jakarta.validation.Valid
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
    private val portraitStorage: AdventMemberPortraitStorage,
    private val pushSubscriptions: UserPushSubscriptionService,
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

    /** Preview identity is separate from permission to operate the isolated test controls. */
    private fun canPreview(principal: SessionUserPrincipal, request: HttpServletRequest): Boolean {
        val operators = try { exclusions() } catch (_: ResponseStatusException) { return false }
        if (operators.size != 2 || principal.userId !in operators) return false
        if (request.getSession(false)?.getAttribute("hatcast.auth.verified-email") != true) return false
        val emails = setOf("patrice.lamarque@gmail.com", "brousseau.ant@gmail.com")
        return principal.email?.trim()?.lowercase() in emails
    }

    private fun activeMode(principal: SessionUserPrincipal, request: HttpServletRequest): Boolean {
        val requested = request.getHeader("X-Advent-Test-Mode") == "true"
        if (requested && !canControl(principal, request)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return requested
    }

    private fun preview(principal: SessionUserPrincipal, request: HttpServletRequest): Boolean {
        val requested = request.getHeader("X-Advent-Preview") == "true"
        if (requested && (!canPreview(principal, request) || activeMode(principal, request) || request.getHeader("X-Advent-Simulated-Date") != null))
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return requested
    }

    private fun requireControl(principal: SessionUserPrincipal, request: HttpServletRequest): UUID {
        authorize(principal)
        if (!activeMode(principal, request)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return try { UUID.fromString(request.getHeader("X-Advent-Test-Session")) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.CONFLICT) }
    }

    private fun sessionFor(principal: SessionUserPrincipal, request: HttpServletRequest): UUID {
        activeMode(principal, request)
        return try { UUID.fromString(request.getHeader("X-Advent-Test-Session")) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.CONFLICT) }
    }

    private fun simulated(principal: SessionUserPrincipal, request: HttpServletRequest): LocalDate? {
        val value = request.getHeader("X-Advent-Simulated-Date") ?: return null
        if (!activeMode(principal, request)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val date = try { LocalDate.parse(value) } catch (_: Exception) { throw ResponseStatusException(HttpStatus.BAD_REQUEST) }
        if (date.isBefore(LocalDate.of(2026, 12, 1)) || date.isAfter(LocalDate.of(2027, 1, 15))) throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        return date
    }

    private fun requireReminderContext(principal: SessionUserPrincipal, request: HttpServletRequest): UUID {
        authorize(principal)
        if (request.getHeader("X-Advent-User") != principal.userId.toString()) throw ResponseStatusException(HttpStatus.CONFLICT)
        if (activeMode(principal, request) || request.getHeader("X-Advent-Simulated-Date") != null) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return sessionFor(principal, request)
    }

    @GetMapping("/entry")
    fun entry(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventMemberGame.EntryState {
        authorize(principal)
        return game.entry(principal.userId, null, simulated(principal, request))
    }

    @GetMapping("/reminder-preference")
    fun reminderPreference(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventReminderPreference {
        return AdventReminderPreference(game.reminderPreference(principal.userId, requireReminderContext(principal, request)))
    }

    @PutMapping("/reminder-preference")
    fun setReminderPreference(@RequestBody body: AdventReminderPreferenceRequest, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventReminderPreference {
        return AdventReminderPreference(game.setReminderPreference(principal.userId, requireReminderContext(principal, request), body.enabled, body.endpoint))
    }

    @PutMapping("/reminder-device")
    fun registerReminderDevice(@Valid @RequestBody body: RegisterPushSubscriptionRequest, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        game.reminderPreference(principal.userId, requireReminderContext(principal, request))
        pushSubscriptions.registerAdventDevice(principal.userId, body, request.getHeader("User-Agent"))
    }

    @PostMapping("/reminder-device/status")
    fun reminderDeviceStatus(@RequestBody body: AdventReminderDevice, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, Boolean> {
        return mapOf("owned" to game.reminderDeviceOwned(principal.userId, requireReminderContext(principal, request), body.endpoint))
    }

    @GetMapping("/discovery")
    fun discovery(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventMemberGame.DiscoveryState {
        authorize(principal)
        return game.discovery(principal.userId, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @PostMapping("/discovery")
    fun discover(@RequestBody body: DiscoveryAttempt, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventCalendarResponse {
        authorize(principal)
        return game.discover(principal.userId, body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request)) ?: throw ResponseStatusException(HttpStatus.CONFLICT)
    }

    @PostMapping("/entry/dismiss")
    fun dismiss(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        authorize(principal)
        game.dismiss(principal.userId, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @GetMapping("/session")
    fun session(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, Any> {
        authorize(principal)
        val capability = canControl(principal, request)
        simulated(principal, request)
        return mapOf("testControls" to capability, "productionPreview" to canPreview(principal, request), "sessionId" to game.session())
    }

    @GetMapping("/entry/replay")
    fun prepareOpeningReplay(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventMemberGame.OpeningReplayPreparation {
        val session = requireControl(principal, request)
        if (request.getHeader("X-Advent-User") != principal.userId.toString()) throw ResponseStatusException(HttpStatus.CONFLICT)
        return game.prepareOpeningReplay(session)
    }

    @PostMapping("/entry/replay")
    fun replayOpening(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest, @RequestBody body: OpeningReplayRequest) {
        val session = requireControl(principal, request)
        if (request.getHeader("X-Advent-User") != principal.userId.toString()) throw ResponseStatusException(HttpStatus.CONFLICT)
        game.replayOpening(principal.userId, session, body.date ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST))
    }

    @PostMapping("/session/reset")
    fun reset(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        val session = requireControl(principal, request)
        simulated(principal, request)
        game.reset(session)
    }

    @PostMapping("/doors/{day}/answer/replay")
    fun replay(@PathVariable day: Int, @RequestBody body: ReplayAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        val isPreview = preview(principal, request)
        if (isPreview && body.close) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val session = if (isPreview) sessionFor(principal, request) else requireControl(principal, request)
        return game.replay(principal.userId, day, body.replayToken ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), session, simulated(principal, request), body.close, isPreview)
    }

    @GetMapping("/clock")
    fun date(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventMemberGame.ClockProjection {
        authorize(principal)
        return game.clockProjection(sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @GetMapping("/doors/{day}")
    fun door(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): FictionalQuiz {
        authorize(principal)
        val quiz = game.quiz(day, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request)) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val (image, generic) = image(quiz.portraitRef)
        return FictionalQuiz(day, quiz.name, image, quiz.statements, generic)
    }

    @GetMapping("/doors/{day}/answer")
    fun state(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.state(principal.userId, day, activeMode(principal, request), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @PostMapping("/doors/{day}/answer")
    fun confirm(@PathVariable day: Int, @RequestBody body: MemberAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.confirm(principal.userId, day, body.choice ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), activeMode(principal, request), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @PostMapping("/doors/{day}/answer/reconcile")
    fun reconcile(@PathVariable day: Int, @RequestBody(required = false) body: LateAccess?, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.reconcile(principal.userId, day, activeMode(principal, request), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request), lateAccess = body?.late == true)
    }

    @PostMapping("/doors/{day}/answer/reserve")
    fun reserve(@PathVariable day: Int, @RequestBody body: AnswerAttempt, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        authorize(principal)
        return game.reserve(principal.userId, day, body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.generation ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), activeMode(principal, request), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @GetMapping("/results/latest-unseen")
    fun latest(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, AdventResult?> {
        authorize(principal)
        return mapOf("result" to game.latestUnseen(principal.userId, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request)))
    }

    @GetMapping("/doors/{day}/result")
    fun result(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventResult {
        authorize(principal)
        return game.result(principal.userId, day, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request)) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @PostMapping("/doors/{day}/result/acknowledge")
    fun acknowledge(@PathVariable day: Int, @RequestBody body: AcknowledgeResult, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        authorize(principal)
        game.acknowledge(principal.userId, day, body.answerId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @GetMapping("/calendar")
    fun calendar(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventCalendarResponse {
        authorize(principal)
        return game.calendar(principal.userId, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    @GetMapping("/doors/{day}/history")
    fun history(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventHistoryResponse {
        authorize(principal)
        val read = game.history(principal.userId, day, sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
        if (read.priorityResult != null) return AdventHistoryResponse(priorityResult = read.priorityResult)
        val history = read.history ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val quiz = history.quiz
        val (portrait, generic) = image(quiz.portraitRef)
        return AdventHistoryResponse(FictionalQuiz(day, quiz.name, portrait, quiz.statements, generic), history.falseChoice, history.result)
    }

    @GetMapping("/ranking")
    fun ranking(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventRankingResponse {
        val troupe = authorize(principal)
        return game.ranking(principal.userId, troupe, exclusions(), activeMode(principal, request), sessionFor(principal, request), simulated(principal, request), preview = preview(principal, request))
    }

    private fun image(ref: String?): Pair<String, Boolean> {
        val objectName = ref?.let(::adventPortraitObject)
        val profiles = environment.activeProfiles.toSet()
        val bytes: ByteArray? = if (ref == null) null else if ("offline" in profiles) {
            val local = offlineRoot.worktreeRoot().resolve(".local")
            val directory = local.resolve("hatcast-avent-test")
            val path = directory.resolve(ref)
            if (!Files.isSymbolicLink(local) && !Files.isSymbolicLink(directory) && !Files.isSymbolicLink(path) &&
                Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS) && Files.size(path) <= 5_000_000) Files.readAllBytes(path) else null
        } else {
            val bucket = environment.getProperty("hatcast.advent.private-portrait-bucket", "impro-selector-avent-content-private").trim()
            if (!bucket.matches(Regex("[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]"))) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
            try {
                portraitStorage.read(bucket, objectName!!)
            } catch (_: Exception) { null }
        }
        if (ref != null && bytes == null && "offline" !in profiles) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
        val content = bytes ?: javaClass.getResourceAsStream("/advent/lutin-generique-net.png")!!.use { it.readBytes() }
        return ("data:image/png;base64," + Base64.getEncoder().encodeToString(content)) to (bytes == null)
    }
}
data class MemberAnswer(val choice: Int?, val attemptId: UUID?)

data class AdventReminderPreference(val enabled: Boolean)
data class AdventReminderPreferenceRequest(val enabled: Boolean, val endpoint: String? = null)
data class AdventReminderDevice(val endpoint: String)

data class AdventHistoryResponse(val quiz: FictionalQuiz? = null, val falseChoice: Int? = null, val result: AdventResult? = null, val priorityResult: AdventResult? = null)

data class LateAccess(val late: Boolean = false)

data class DiscoveryAttempt(val attemptId: UUID?)

// Database references remain filenames; never allow a path into the catalogue.
internal fun adventPortraitObject(ref: String): String {
    if (ref.length > 255 || !ref.matches(Regex("[A-Za-z0-9_-]+\\.png"))) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
    return "portraits/$ref"
}

@org.springframework.stereotype.Component
class AdventMemberPortraitStorage {
    fun read(bucket: String, objectName: String): ByteArray? {
        val blob = com.google.cloud.storage.StorageOptions.getDefaultInstance().service.get(bucket, objectName)
        return if (blob != null && blob.size <= 5_000_000) blob.getContent() else null
    }
}

data class OpeningReplayRequest(val date: LocalDate? = null)

package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import jakarta.servlet.http.HttpServletRequest
import com.hatcast.api.troupe.TroupeMembershipService
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import java.time.Instant
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.Paths
import java.util.UUID
import java.util.Base64
import javax.sql.DataSource

/** Fictional, read-only preview: the actual database and profiles must both be isolated. */
@RestController
@RequestMapping("/v1/advent-test")
class AdventTestController(
    private val environment: Environment,
    private val dataSource: DataSource,
    private val memberships: TroupeMembershipService,
    private val offlineRoot: AdventOfflineRoot,
    private val cloudImages: AdventPreviewImages,
    private val answers: AdventTestAnswers,
) {
    @GetMapping("/doors/{day}")
    fun door(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest? = null): FictionalQuiz {
        val cloudPreview = authorize(principal, request)
        val fixture = fixture(day)
        val statements = fictionalStatements[day - 1]
        val (image, isGeneric) = previewImage(fixture.file, cloudPreview)
        return FictionalQuiz(day, fixture.name, image, statements, isGeneric)
    }

    @GetMapping("/session")
    fun session(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, UUID> {
        authorize(principal, request)
        return mapOf("sessionId" to answers.session())
    }

    @PostMapping("/session/reset")
    @Transactional
    fun reset(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        val cloud = authorize(principal, request)
        val operator = if (cloud) "patrice.lamarque@gmail.com" else environment.getProperty("hatcast.advent-test.operator-email", "").trim().lowercase()
        if (operator.isEmpty() || principal.email?.trim()?.lowercase() != operator) throw ResponseStatusException(HttpStatus.FORBIDDEN)
        answers.reset(sessionHeader(request))
    }

    private fun sessionHeader(request: HttpServletRequest): UUID = try {
        UUID.fromString(request.getHeader("X-Advent-Test-Session") ?: "")
    } catch (_: IllegalArgumentException) { throw ResponseStatusException(HttpStatus.BAD_REQUEST) }

    @GetMapping("/doors/{day}/answer")
    @Transactional
    fun state(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val received = request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.state(principal.userId, day, received)
    }

    @PostMapping("/doors/{day}/answer")
    @Transactional
    fun confirm(@PathVariable day: Int, @RequestBody body: ConfirmAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val received = request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.confirmReserved(principal.userId, day, body.choice ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), received)
    }

    @PostMapping("/doors/{day}/answer/reserve")
    @Transactional
    fun reserve(@PathVariable day: Int, @RequestBody body: AnswerAttempt, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val received = request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.reserve(principal.userId, day, body.attemptId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), body.generation ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), received)
    }

    @PostMapping("/doors/{day}/answer/reconcile")
    @Transactional
    fun reconcile(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val received = request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.reconcile(principal.userId, day, received)
    }

    @PostMapping("/doors/{day}/answer/replay")
    @Transactional
    fun replay(@PathVariable day: Int, @RequestBody body: ReplayAnswer, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AnswerState {
        val received = request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.replay(principal.userId, day, body.replayToken ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), received)
    }

    @GetMapping("/results/latest-unseen")
    @Transactional
    fun latestUnseen(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, AdventResult?> {
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return mapOf("result" to answers.latestUnseen(principal.userId, request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()))
    }

    @GetMapping("/doors/{day}/result")
    @Transactional
    fun result(@PathVariable day: Int, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): AdventResult {
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return answers.result(principal.userId, day, request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @PostMapping("/doors/{day}/result/acknowledge")
    @Transactional
    fun acknowledge(@PathVariable day: Int, @RequestBody body: AcknowledgeResult, @AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest) {
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        answers.acknowledge(principal.userId, day, body.answerId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST), request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now())
    }

    @GetMapping("/clock")
    @Transactional
    fun clock(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, String> {
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return mapOf("date" to answers.clockDate(request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()).toString())
    }

    @PostMapping("/clock/next-day")
    @Transactional
    fun advanceDay(@AuthenticationPrincipal principal: SessionUserPrincipal, request: HttpServletRequest): Map<String, String> {
        authorize(principal, request)
        answers.requireSession(sessionHeader(request))
        return mapOf("date" to answers.advanceDay(request.getAttribute("hatcast.advent.received-at") as? Instant ?: Instant.now()).toString())
    }

    private fun authorize(principal: SessionUserPrincipal, request: HttpServletRequest?): Boolean {
        val profiles = environment.activeProfiles.toSet()
        val cloudPreview = profiles == setOf("cloud") &&
            environment.getProperty("K_SERVICE") == "hatcast-v2-dev" &&
            environment.getProperty("GOOGLE_CLOUD_PROJECT") == "impro-selector" && isDevelopmentDatabase()
        val offlinePreview = "offline" in profiles && profiles.all { it == "offline" || it == "dev" } &&
            environment.getProperty("hatcast.advent-test.enabled") == "true" && isOfflineDatabase()
        if (!cloudPreview && !offlinePreview) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val troupeId = if (cloudPreview) UUID.fromString("8712db65-f7f8-4ffe-8ecd-f0d36be3e123") else try {
            UUID.fromString(environment.getProperty("hatcast.advent-test.troupe-id") ?: "")
        } catch (_: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        memberships.requireActiveMemberMembership(principal.userId, troupeId)
        val allowedEmails = if (cloudPreview) setOf("patrice.lamarque@gmail.com", "brousseau.ant@gmail.com") else
            environment.getProperty("hatcast.advent-test.allowed-emails", "")
                .split(',').map { it.trim().lowercase() }.filter { it.isNotEmpty() }.toSet()
        val email = principal.email?.trim()?.lowercase()
        if (email == null || email !in allowedEmails || (request?.getSession(false)?.getAttribute("hatcast.auth.verified-email") != true))
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return cloudPreview
    }

    private fun fixture(day: Int): TestFixture = when (day) {
            1 -> TestFixture("Toinou", "toinou-net.png")
            2 -> TestFixture("Patrice", "patrice-net.png")
            3 -> TestFixture("Will", "will-net.png")
            4 -> TestFixture("Camille", "camille-net.png")
            5 -> TestFixture("Angie", "angie-net.png")
            in 6..24 -> TestFixture("Lutin de Noël", null)
            else -> throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    // The only personalized files are fixed, locally supplied fixtures. Never serve a path from a request.
    private fun previewImage(file: String?, cloudPreview: Boolean): Pair<String, Boolean> {
        if (cloudPreview && file != null) {
            val image = cloudImages.read(file)
            if (image != null) return ("data:image/png;base64," + Base64.getEncoder().encodeToString(image)) to false
        }
        val root = offlineRoot.worktreeRoot().resolve(".local/hatcast-avent-test")
        val localDir = root.parent
        val path = file?.let { root.resolve(it) }
        val hasLocalImage = path != null && !Files.isSymbolicLink(localDir) && !Files.isSymbolicLink(root) &&
            !Files.isSymbolicLink(path) && Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS) &&
            Files.size(path) <= 5_000_000
        val bytes = if (hasLocalImage) {
            Files.readAllBytes(path!!)
        } else {
            javaClass.getResourceAsStream("/advent/lutin-generique-net.png")!!.use { it.readBytes() }
        }
        return ("data:image/png;base64," + Base64.getEncoder().encodeToString(bytes)) to !hasLocalImage
    }

    // Fictional anecdotes only: no answer, correctness, score or real quiz data.
    private val fictionalStatements = listOf(
        listOf("A improvisé une scène dans un phare.", "A appris à jongler avec des chaussettes.", "A donné un prénom à son parapluie."),
        listOf("A joué un roi dans une cuisine.", "A participé à une course de canards en plastique.", "A oublié son texte au milieu d’un rêve."),
        listOf("A inventé une chanson pour un cactus.", "A traversé une scène à reculons.", "A préparé une soupe pour un dragon."),
        listOf("A dansé avec un chapeau géant.", "A raconté une histoire à un arbre.", "A joué une sirène sans savoir nager."),
        listOf("A trouvé une étoile dans sa poche.", "A perdu un gant pendant une répétition.", "A fabriqué une couronne en papier."),
        listOf("A appris une réplique en chantant.", "A nommé son vélo Biscotte.", "A construit une cabane avec des coussins."),
        listOf("A joué un nuage pendant un spectacle.", "A décoré un gâteau avec des étoiles.", "A fait une révérence à un chat."),
        listOf("A inventé une danse pour les flocons.", "A porté deux chaussettes dépareillées.", "A rencontré un pingouin au marché."),
        listOf("A caché une blague dans un livre.", "A fait du théâtre dans un jardin.", "A appris à siffler sous la pluie."),
        listOf("A offert une couronne à une plante.", "A créé un personnage de détective.", "A visité une bibliothèque en pyjama."),
        listOf("A joué un pirate qui craint l’eau.", "A collectionné des boutons dorés.", "A improvisé avec une cuillère en bois."),
        listOf("A dessiné un plan au trésor.", "A organisé un concours de grimaces.", "A donné un spectacle pour des peluches."),
        listOf("A fabriqué une étoile en carton.", "A chanté devant une fenêtre ouverte.", "A découvert un jardin secret."),
        listOf("A prêté sa voix à une chaussette.", "A cuisiné une tarte en forme de lune.", "A joué un facteur venu de Mars."),
        listOf("A appris une danse dans un ascenseur.", "A peint un soleil sur une enveloppe.", "A caché un biscuit pour le Père Noël."),
        listOf("A improvisé une histoire de valise.", "A promené un escargot imaginaire.", "A construit une ville en boîtes."),
        listOf("A créé une chorale de canards.", "A porté une écharpe de trois mètres.", "A joué une reine allergique aux couronnes."),
        listOf("A inventé un sport avec des coussins.", "A fait rire une statue.", "A chanté une berceuse à une plante."),
        listOf("A écrit une lettre à un bonhomme de neige.", "A trouvé une plume dans une chaussure.", "A joué un cuisinier sur la Lune."),
        listOf("A fait un vœu devant une ampoule.", "A inventé un nom pour chaque nuage.", "A appris une scène en marchant."),
        listOf("A construit un château de livres.", "A joué un renard végétarien.", "A donné un concert avec des casseroles."),
        listOf("A caché un trésor dans une théière.", "A fait un chapeau avec une serviette.", "A inventé une fête pour les lutins."),
        listOf("A dessiné un flocon les yeux fermés.", "A joué une étoile filante timide.", "A partagé un chocolat avec un ours imaginaire."),
        listOf("A répété une pièce avec des moufles.", "A emballé un cadeau sans ruban.", "A raconté une histoire à la lune."),
    )

    private data class TestFixture(val name: String, val file: String?)

    private fun isDevelopmentDatabase(): Boolean = try {
        val url = dataSource.connection.use { it.metaData.url }
        val uri = java.net.URI(url.removePrefix("jdbc:"))
        url.startsWith("jdbc:postgresql://") && uri.host in setOf(
            "ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech",
            "ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech",
        )
    } catch (_: Exception) { false }

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

data class FictionalQuiz(val day: Int, val name: String, val portrait: String, val statements: List<String>, val genericElf: Boolean)

/** Images remain in private development storage and are never exposed as public assets. */
@Component
class AdventPreviewImages {
    fun read(file: String): ByteArray? = try {
        val blob = com.google.cloud.storage.StorageOptions.getDefaultInstance().service
            .get("impro-selector-avent-preview-private", file)
        if (blob != null && blob.size <= 5_000_000) blob.getContent() else null
    } catch (_: Exception) { null }
}

/** Resolve the worktree from the API process directory; never configured by the request. */
@Component
class AdventOfflineRoot {
    fun worktreeRoot() = Paths.get(System.getProperty("user.dir"), "../..").toAbsolutePath().normalize()
}

data class AcknowledgeResult(val answerId: UUID?)

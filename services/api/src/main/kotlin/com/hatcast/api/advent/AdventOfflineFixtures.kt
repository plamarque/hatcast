package com.hatcast.api.advent

import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.core.env.Environment
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.Paths
import javax.sql.DataSource

/** Fictional acceptance data, only for the worktree's isolated offline H2 database. */
@Component
class AdventOfflineFixtures(
    private val environment: Environment,
    private val dataSource: DataSource,
    private val root: AdventOfflineRoot,
    private val jdbc: JdbcTemplate,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun prepare() {
        val profiles = environment.activeProfiles.toSet()
        if ("offline" !in profiles || profiles.any { it != "offline" && it != "dev" }) return
        if (!isWorktreeDatabase()) return
        // Do not pair newly invented content with any historical answer.
        jdbc.update("""INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice)
            SELECT 1, ?, ?, ?, ?, 0
            WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 1)
              AND NOT EXISTS (SELECT 1 FROM advent_test_answers WHERE quiz_day = 1)
              AND NOT EXISTS (SELECT 1 FROM advent_member_answers WHERE quiz_day = 1)""",
            "Lutin fictif 1", "A inventé une histoire pour la fête.", "A décoré un sapin imaginaire.", "A voyagé sur une étoile en papier.")
        for ((index, quiz) in fictionalQuizzes.withIndex()) {
            val day = index + 2
            // Never pair a new fictional quiz with a preexisting answer for that day.
            val (name, portrait) = when (day) {
                2 -> "Antoine" to "toinou-net.png"
                3 -> "Camille" to "camille-net.png"
                9 -> "Will" to "will-net.png"
                10 -> "Angie" to "angie-net.png"
                else -> "Lutin fictif $day" to null
            }
            jdbc.update("""INSERT INTO advent_quizzes (quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation)
                SELECT ?, ?, ?, ?, ?, ?, ?, NULL
                WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = ?)
                  AND NOT EXISTS (SELECT 1 FROM advent_test_answers WHERE quiz_day = ?)
                  AND NOT EXISTS (SELECT 1 FROM advent_member_answers WHERE quiz_day = ?)""".trimIndent(),
                day, name, portrait, quiz.statements[0], quiz.statements[1], quiz.statements[2],
                quiz.falseChoice, day, day, day)
        }
    }

    private data class FictionalQuiz(val statements: List<String>, val falseChoice: Int)

    // Fictional placeholders for local acceptance; not validated contributions.
    private val fictionalQuizzes = listOf(
        FictionalQuiz(listOf("A gagné un concours de mots croisés.", "A organisé une lecture à voix haute.", "A fabriqué une guirlande pour un décor."), 0),
        FictionalQuiz(listOf("A joué un personnage de jardinier.", "A participé à une équipe de water-polo.", "A dessiné des invitations à la main."), 1),
        FictionalQuiz(listOf("A fait un voyage en train jusqu’en Norvège.", "A participé à un spectacle de rue.", "A imaginé une réplique en marchant."), 0),
        FictionalQuiz(listOf("A fait ses premiers pas sur scène dans une bibliothèque.", "A déjà appris une scène en cuisinant.", "A joué du violoncelle pendant dix ans."), 2),
        FictionalQuiz(listOf("A porté un costume cousu par sa grand-mère.", "A pris des cours de claquettes.", "A improvisé un spectacle dans un jardin."), 1),
        FictionalQuiz(listOf("A participé à une course de voile.", "A joué une scène sous un parapluie.", "A inventé une danse pour une fête."), 0),
        FictionalQuiz(listOf("A appris le breton à l’école.", "A joué un détective sur scène.", "A peint une affiche de spectacle."), 0),
        FictionalQuiz(listOf("A traversé les Alpes à vélo.", "A chanté en duo lors d’une soirée.", "A réalisé un chapeau en papier."), 0),
        FictionalQuiz(listOf("A appris à piloter un planeur.", "A fabriqué une couronne pour un costume.", "A improvisé une scène dans une cuisine."), 0),
        FictionalQuiz(listOf("A dessiné un plan de scène.", "A participé à un atelier de conte.", "A appris le japonais en autodidacte."), 2),
        FictionalQuiz(listOf("A fabriqué un masque de théâtre.", "A écrit une chanson pour un anniversaire.", "A remporté un concours de pâtisserie."), 2),
        FictionalQuiz(listOf("A appris un poème pour une fête familiale.", "A imaginé un personnage de boulanger.", "A tenu une librairie pendant un été."), 2),
        FictionalQuiz(listOf("A composé une carte de vœux illustrée.", "A joué de la batterie dans un groupe.", "A construit un accessoire de scène."), 1),
        FictionalQuiz(listOf("A élevé des chèvres dans son enfance.", "A créé une affiche avec des collages.", "A raconté une histoire autour d’un feu."), 0),
        FictionalQuiz(listOf("A organisé une soirée jeux de société.", "A inventé un refrain pour une répétition.", "A remporté un tournoi d’échecs régional."), 2),
        FictionalQuiz(listOf("A tenu un carnet de répliques.", "A collectionné des timbres pendant l’enfance.", "A aidé à installer des projecteurs."), 1),
        FictionalQuiz(listOf("A joué une scène en portant des bottes trop grandes.", "A suivi des cours de photographie argentique.", "A inventé un jeu de mots pour un spectacle."), 1),
        FictionalQuiz(listOf("A enregistré une histoire pour un proche.", "A appris une chorégraphie en groupe.", "A tenu un stand de fleurs au marché."), 2),
        FictionalQuiz(listOf("A écrit une petite histoire de fantômes.", "A décoré un gâteau pour une fête.", "A suivi une formation de guide de montagne."), 2),
        FictionalQuiz(listOf("A fait un numéro de mime en plein air.", "A organisé un tournoi de ping-pong.", "A joué un rôle avec un accent inventé."), 1),
        FictionalQuiz(listOf("A participé à une chorale de quartier.", "A construit un décor avec des cartons.", "A animé une émission de radio locale."), 0),
        FictionalQuiz(listOf("A chanté dans un train avec des amis.", "A fabriqué une marionnette en chaussette.", "A appris à jouer de la harpe."), 2),
        FictionalQuiz(listOf("A joué un personnage de facteur.", "A animé un atelier de poterie.", "A prêté sa voix à une marionnette."), 1),
    )

    private fun isWorktreeDatabase(): Boolean = try {
        val actual = dataSource.connection.use { it.metaData.url }
        val prefix = "jdbc:h2:file:"
        if (!actual.startsWith(prefix)) false else {
            val actualPath = Paths.get(actual.removePrefix(prefix).substringBefore(';')).toAbsolutePath().normalize()
            val worktree = root.worktreeRoot().toAbsolutePath().normalize()
            val local = worktree.resolve(".local")
            val offline = local.resolve("hatcast-offline")
            val file = offline.resolve("hatcast.mv.db")
            actualPath == offline.resolve("hatcast") && !Files.isSymbolicLink(local) &&
                !Files.isSymbolicLink(offline) && !Files.isSymbolicLink(file) &&
                Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)
        }
    } catch (_: Exception) { false }
}

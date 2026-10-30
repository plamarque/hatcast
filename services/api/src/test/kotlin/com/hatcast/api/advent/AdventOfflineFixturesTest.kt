package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.mock.env.MockEnvironment
import java.nio.file.Files
import java.nio.file.Path

class AdventOfflineFixturesTest {
    @TempDir lateinit var temp: Path

    private fun database(): Pair<DriverManagerDataSource, JdbcTemplate> {
        val dir = Files.createDirectories(temp.resolve(".local/hatcast-offline"))
        val ds = DriverManagerDataSource("jdbc:h2:file:${dir.resolve("hatcast")};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE", "sa", "")
        val jdbc = JdbcTemplate(ds)
        jdbc.execute("CREATE TABLE advent_quizzes (quiz_day INTEGER PRIMARY KEY, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)")
        jdbc.execute("CREATE TABLE advent_test_answers (quiz_day INTEGER, marker VARCHAR(20))")
        return ds to jdbc
    }
    private fun fixtures(profile: Array<String>, ds: DriverManagerDataSource, jdbc: JdbcTemplate): AdventOfflineFixtures {
        val root = mock<AdventOfflineRoot>()
        whenever(root.worktreeRoot()).thenReturn(temp)
        return AdventOfflineFixtures(MockEnvironment().apply { setActiveProfiles(*profile) }, ds, root, jdbc)
    }

    @Test fun `fresh isolated calendar has 24 unique playable days and is repeatable`() {
        val (ds, jdbc) = database()
        // Day 1 stands in for separately supplied private content; this is fictional.
        jdbc.update("INSERT INTO advent_quizzes VALUES (1, 'Jour fictif', NULL, 'A', 'B', 'C', 0, NULL)")
        val seed = fixtures(arrayOf("dev", "offline"), ds, jdbc)
        seed.prepare(); seed.prepare()
        assertEquals(24, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes", Int::class.java))
        assertEquals(24, jdbc.queryForObject("SELECT COUNT(DISTINCT quiz_day) FROM advent_quizzes", Int::class.java))
        assertEquals(24, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes WHERE TRIM(statement_0) <> '' AND TRIM(statement_1) <> '' AND TRIM(statement_2) <> '' AND false_choice BETWEEN 0 AND 2", Int::class.java))
        val expectedKeys = listOf(0, 1, 0, 2, 1, 0, 0, 0, 0, 2, 2, 2, 1, 0, 2, 1, 1, 2, 2, 1, 0, 2, 1)
        val expectedFalseStatements = listOf(
            "A gagné un concours de mots croisés.",
            "A participé à une équipe de water-polo.",
            "A fait un voyage en train jusqu’en Norvège.",
            "A joué du violoncelle pendant dix ans.",
            "A pris des cours de claquettes.",
            "A participé à une course de voile.",
            "A appris le breton à l’école.",
            "A traversé les Alpes à vélo.",
            "A appris à piloter un planeur.",
            "A appris le japonais en autodidacte.",
            "A remporté un concours de pâtisserie.",
            "A tenu une librairie pendant un été.",
            "A joué de la batterie dans un groupe.",
            "A élevé des chèvres dans son enfance.",
            "A remporté un tournoi d’échecs régional.",
            "A collectionné des timbres pendant l’enfance.",
            "A suivi des cours de photographie argentique.",
            "A tenu un stand de fleurs au marché.",
            "A suivi une formation de guide de montagne.",
            "A organisé un tournoi de ping-pong.",
            "A participé à une chorale de quartier.",
            "A appris à jouer de la harpe.",
            "A animé un atelier de poterie.",
        )
        val quizzes = jdbc.queryForList("SELECT quiz_day, statement_0, statement_1, statement_2, false_choice FROM advent_quizzes WHERE quiz_day BETWEEN 2 AND 24 ORDER BY quiz_day")
        assertEquals(23, quizzes.map { listOf(it["statement_0"], it["statement_1"], it["statement_2"]) }.toSet().size)
        assertEquals(setOf(0, 1, 2), quizzes.map { (it["false_choice"] as Number).toInt() }.toSet())
        quizzes.forEachIndexed { index, quiz ->
            val key = (quiz["false_choice"] as Number).toInt()
            assertEquals(expectedKeys[index], key)
            assertEquals(expectedFalseStatements[index], quiz["statement_$key"])
        }
    }

    @Test fun `existing quizzes and answers are preserved and missing answered day is not invented`() {
        val (ds, jdbc) = database()
        jdbc.update("INSERT INTO advent_quizzes VALUES (3, 'Fictif existant', NULL, 'A', 'B', 'C', 1, 'note')")
        jdbc.update("INSERT INTO advent_test_answers VALUES (3, 'saved'), (7, 'saved')")
        val beforeQuiz = jdbc.queryForList("SELECT * FROM advent_quizzes")
        val beforeAnswers = jdbc.queryForList("SELECT * FROM advent_test_answers ORDER BY quiz_day")
        val seed = fixtures(arrayOf("offline"), ds, jdbc)
        seed.prepare(); seed.prepare()
        assertEquals(beforeQuiz, jdbc.queryForList("SELECT * FROM advent_quizzes WHERE quiz_day = 3"))
        assertEquals(beforeAnswers, jdbc.queryForList("SELECT * FROM advent_test_answers ORDER BY quiz_day"))
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes WHERE quiz_day = 7", Int::class.java))
        assertEquals(22, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes", Int::class.java))
    }

    @Test fun `dev cloud prod and unverified database do not load offline fixtures`() {
        val (ds, jdbc) = database()
        for (profiles in listOf(arrayOf("dev"), arrayOf("cloud"), arrayOf("offline", "prod"), arrayOf("dev", "offline", "cloud"))) fixtures(profiles, ds, jdbc).prepare()
        val unverifiedRoot = mock<AdventOfflineRoot>()
        whenever(unverifiedRoot.worktreeRoot()).thenReturn(temp.resolve("other"))
        AdventOfflineFixtures(MockEnvironment().apply { setActiveProfiles("offline") }, ds, unverifiedRoot, jdbc).prepare()
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes", Int::class.java))
    }
}

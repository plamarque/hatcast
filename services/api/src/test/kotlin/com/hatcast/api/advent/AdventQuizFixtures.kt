package com.hatcast.api.advent

import org.springframework.jdbc.core.JdbcTemplate

/** Fictional data, confined to tests. */
fun seedAdventQuizzes(jdbc: JdbcTemplate) {
    val keys = listOf(0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2)
    for (day in 1..24) {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = ?", day)
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", day, if (day == 4) "Camille" else "Lutin", if (day == 4) "camille-net.png" else null, "fiction A", "fiction B", "fiction C", keys[day - 1], if (day == 1) "Explication fictive" else null)
    }
}

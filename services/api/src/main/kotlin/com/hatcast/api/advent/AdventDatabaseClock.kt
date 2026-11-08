package com.hatcast.api.advent

import org.springframework.jdbc.core.ConnectionCallback
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.time.ZoneOffset

/** Database-side wall clock: CURRENT_TIMESTAMP is transaction-scoped on both supported engines. */
@Component
class AdventDatabaseClock(jdbc: JdbcTemplate) {
    val expression: String = jdbc.execute(ConnectionCallback { connection ->
        when (connection.metaData.databaseProductName) {
            "PostgreSQL" -> "clock_timestamp()"
            "H2" -> {
                connection.createStatement().use { it.execute("CREATE ALIAS IF NOT EXISTS ADVENT_WALL_TIME FOR 'com.hatcast.api.advent.AdventDatabaseClock.wallTime'") }
                "ADVENT_WALL_TIME()"
            }
            else -> error("Unsupported Advent database")
        }
    })!!

    companion object {
        @JvmStatic fun wallTime(): OffsetDateTime = OffsetDateTime.now(ZoneOffset.UTC)
    }
}

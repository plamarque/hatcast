package com.hatcast.api.draw

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.flywaydb.core.Flyway
import org.flywaydb.core.api.MigrationVersion
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.sql.DriverManager
import java.util.UUID

class DrawFormulaMigrationTest {
    @Test
    fun `V65 and V66 create draw tables and seed one system formula per troupe idempotently`() {
        val databaseName = "v65_draw_formulas_${UUID.randomUUID().toString().replace("-", "")}"
        val url =
            "jdbc:h2:mem:$databaseName;" +
                "MODE=PostgreSQL;" +
                "DATABASE_TO_LOWER=TRUE;" +
                "DEFAULT_NULL_ORDERING=HIGH;" +
                "DB_CLOSE_DELAY=-1;" +
                "INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE"

        flyway(url, target = MigrationVersion.fromVersion("63")).migrate()

        val troupeA = UUID.fromString("22222222-2222-4222-8222-222222222221")
        val troupeB = UUID.fromString("22222222-2222-4222-8222-222222222222")

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection.createStatement().use { statement ->
                statement.executeUpdate(
                    """
                    INSERT INTO troupes (id, name, slug, created_at)
                    VALUES
                      (CAST('$troupeA' AS uuid), 'Troupe A', 'troupe-a-draw', TIMESTAMP '2026-01-01 00:00:00'),
                      (CAST('$troupeB' AS uuid), 'Troupe B', 'troupe-b-draw', TIMESTAMP '2026-01-01 00:00:00')
                    """.trimIndent(),
                )
            }
        }

        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    """
                    SELECT COUNT(*) AS cnt
                    FROM information_schema.tables
                    WHERE LOWER(table_name) IN ('draw_formulas', 'draw_policies')
                    """.trimIndent(),
                ).use { statement ->
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals(2, rows.getInt("cnt"))
                    }
                }

            connection
                .prepareStatement(
                    """
                    SELECT troupe_id, is_system, status, factor_config
                    FROM draw_formulas
                    WHERE is_system = TRUE
                    ORDER BY troupe_id
                    """.trimIndent(),
                ).use { statement ->
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals(troupeA, rows.getObject("troupe_id", UUID::class.java))
                        assertEquals("PUBLISHED", rows.getString("status"))
                        assertTrue(rows.getBoolean("is_system"))
                        val factorConfig = rows.getString("factor_config")
                        assertTrue(factorConfig.contains("equity_tag"))
                        assertTrue(factorConfig.contains("past_participation"))
                        rows.next()
                        assertEquals(troupeB, rows.getObject("troupe_id", UUID::class.java))
                    }
                }

            connection
                .prepareStatement(
                    """
                    SELECT COUNT(*) AS cnt
                    FROM draw_formulas
                    WHERE is_system = TRUE
                      AND troupe_id IN (CAST(? AS uuid), CAST(? AS uuid))
                    """.trimIndent(),
                ).use { statement ->
                    statement.setString(1, troupeA.toString())
                    statement.setString(2, troupeB.toString())
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals(2, rows.getInt("cnt"))
                    }
                }
        }

        // Re-run full migration: seed must stay idempotent (no duplicate system rows).
        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    """
                    SELECT COUNT(*) AS cnt
                    FROM draw_formulas
                    WHERE is_system = TRUE
                      AND troupe_id IN (CAST(? AS uuid), CAST(? AS uuid))
                    """.trimIndent(),
                ).use { statement ->
                    statement.setString(1, troupeA.toString())
                    statement.setString(2, troupeB.toString())
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals(2, rows.getInt("cnt"))
                    }
                }
            connection
                .prepareStatement(
                    """
                    SELECT id FROM draw_formulas
                    WHERE troupe_id = CAST(? AS uuid) AND is_system = TRUE
                    """.trimIndent(),
                ).use { statement ->
                    statement.setString(1, troupeA.toString())
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals(DrawFormulaIds.systemV1(troupeA), rows.getObject("id", UUID::class.java))
                    }
                }
        }
    }

    @Test
    fun `draw policy uniqueness indexes exist after V65`() {
        val databaseName = "v65_draw_policies_idx_${UUID.randomUUID().toString().replace("-", "")}"
        val url =
            "jdbc:h2:mem:$databaseName;" +
                "MODE=PostgreSQL;" +
                "DATABASE_TO_LOWER=TRUE;" +
                "DEFAULT_NULL_ORDERING=HIGH;" +
                "DB_CLOSE_DELAY=-1;" +
                "INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE"

        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    """
                    SELECT index_name
                    FROM information_schema.indexes
                    WHERE LOWER(table_name) = 'draw_policies'
                    """.trimIndent(),
                ).use { statement ->
                    statement.executeQuery().use { rows ->
                        val names = mutableListOf<String>()
                        while (rows.next()) {
                            names.add(rows.getString("index_name").lowercase())
                        }
                        assertTrue(names.any { it.contains("troupe_scope") || it.contains("troupe_scope_key") })
                        assertTrue(names.any { it.contains("season_scope") || it.contains("season_scope_key") })
                    }
                }
        }
    }

    @Test
    fun `draw formulas system troupe unique index exists after V65`() {
        val databaseName = "v65_draw_formulas_sys_${UUID.randomUUID().toString().replace("-", "")}"
        val url =
            "jdbc:h2:mem:$databaseName;" +
                "MODE=PostgreSQL;" +
                "DATABASE_TO_LOWER=TRUE;" +
                "DEFAULT_NULL_ORDERING=HIGH;" +
                "DB_CLOSE_DELAY=-1;" +
                "INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE"

        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    """
                    SELECT index_name
                    FROM information_schema.indexes
                    WHERE LOWER(table_name) = 'draw_formulas'
                    """.trimIndent(),
                ).use { statement ->
                    statement.executeQuery().use { rows ->
                        val names = mutableListOf<String>()
                        while (rows.next()) {
                            names.add(rows.getString("index_name").lowercase())
                        }
                        assertTrue(names.any { it.contains("system_troupe") })
                    }
                }
        }
    }

    @Test
    fun `V66 system factor_config deserializes as JSON array on H2`() {
        val databaseName = "v66_draw_factor_json_${UUID.randomUUID().toString().replace("-", "")}"
        val url =
            "jdbc:h2:mem:$databaseName;" +
                "MODE=PostgreSQL;" +
                "DATABASE_TO_LOWER=TRUE;" +
                "DEFAULT_NULL_ORDERING=HIGH;" +
                "DB_CLOSE_DELAY=-1;" +
                "INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE"

        val troupeId = UUID.fromString("22222222-2222-4222-8222-222222222221")
        flyway(url, target = MigrationVersion.fromVersion("63")).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection.createStatement().use { statement ->
                statement.executeUpdate(
                    """
                    INSERT INTO troupes (id, name, slug, created_at)
                    VALUES (CAST('$troupeId' AS uuid), 'Troupe A', 'troupe-a-draw', TIMESTAMP '2026-01-01 00:00:00')
                    """.trimIndent(),
                )
            }
        }

        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    """
                    SELECT factor_config
                    FROM draw_formulas
                    WHERE troupe_id = CAST(? AS uuid) AND is_system = TRUE
                    """.trimIndent(),
                ).use { statement ->
                    statement.setString(1, troupeId.toString())
                    statement.executeQuery().use { rows ->
                        rows.next()
                        val rawObject = rows.getObject("factor_config")
                        val factorConfig = rows.getString("factor_config")
                        assertTrue(
                            rawObject != null,
                            "factor_config raw object was null; string=$factorConfig",
                        )
                        val jsonText =
                            when (rawObject) {
                                is String -> rawObject
                                else -> factorConfig
                            }
                        assertTrue(jsonText.trimStart().startsWith("["), "expected JSON array, got: $jsonText")
                        val parsed =
                            ObjectMapper().readValue<List<Map<String, Any>>>(jsonText)
                        assertEquals("equity_tag", parsed[0]["factorId"])
                    }
                }
        }
    }

    private fun flyway(
        url: String,
        target: MigrationVersion? = null,
    ): Flyway {
        val configuration =
            Flyway
                .configure()
                .dataSource(url, "sa", "")
                .locations("classpath:db/migration")
                .placeholders(
                    mapOf(
                        "drop_event_availability_pk" to "DROP PRIMARY KEY",
                        "notification_preferences_json_type" to "JSON",
                        "notification_preferences_json_default" to "JSON '{}'",
                        "draw_factor_config_json_type" to "JSON",
                        "draw_policy_rule_json_type" to "JSON",
                        "draw_policy_rules_json_type" to "JSON",
                        "draw_policy_rules_json_default" to "JSON '[]'",
                        "draw_policies_season_idx_sql" to
                            "CREATE INDEX IF NOT EXISTS draw_policies_season_idx ON draw_policies (season_id)",
                    ),
                )
        if (target != null) {
            configuration.target(target)
        }
        return configuration.load()
    }
}

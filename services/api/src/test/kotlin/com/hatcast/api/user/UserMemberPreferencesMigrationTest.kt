package com.hatcast.api.user

import org.flywaydb.core.Flyway
import org.flywaydb.core.api.MigrationVersion
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.sql.DriverManager
import java.util.UUID

class UserMemberPreferencesMigrationTest {
    @Test
    fun `V40 consolidates latest active membership preferences to account and active memberships`() {
        val databaseName = "v40_user_member_preferences_${UUID.randomUUID().toString().replace("-", "")}"
        val url =
            "jdbc:h2:mem:$databaseName;" +
                "MODE=PostgreSQL;" +
                "DATABASE_TO_LOWER=TRUE;" +
                "DEFAULT_NULL_ORDERING=HIGH;" +
                "DB_CLOSE_DELAY=-1;" +
                "INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE"

        flyway(url, target = MigrationVersion.fromVersion("39")).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection.createStatement().use { statement ->
                statement.executeUpdate(
                    """
                    INSERT INTO users (id, google_sub, idp_uid, email, display_name, slug, created_at, updated_at)
                    VALUES (
                      CAST('11111111-1111-4111-8111-111111111111' AS uuid),
                      'sub-v40',
                      NULL,
                      'v40@example.com',
                      'Account Name',
                      'account-name',
                      TIMESTAMP '2026-01-01 00:00:00',
                      TIMESTAMP '2026-01-01 00:00:00'
                    )
                    """.trimIndent(),
                )
                statement.executeUpdate(
                    """
                    INSERT INTO troupes (id, name, slug, created_at)
                    VALUES
                      (CAST('22222222-2222-4222-8222-222222222221' AS uuid), 'Troupe A', 'troupe-a-v40', TIMESTAMP '2026-01-01 00:00:00'),
                      (CAST('22222222-2222-4222-8222-222222222222' AS uuid), 'Troupe B', 'troupe-b-v40', TIMESTAMP '2026-01-01 00:00:00'),
                      (CAST('22222222-2222-4222-8222-222222222223' AS uuid), 'Troupe C', 'troupe-c-v40', TIMESTAMP '2026-01-01 00:00:00')
                    """.trimIndent(),
                )
                statement.executeUpdate(
                    """
                    INSERT INTO troupe_memberships (
                      id, troupe_id, user_id, status, display_name, baseline_role, preferred_role_keys, created_at, updated_at
                    )
                    VALUES
                      (
                        CAST('33333333-3333-4333-8333-333333333331' AS uuid),
                        CAST('22222222-2222-4222-8222-222222222221' AS uuid),
                        CAST('11111111-1111-4111-8111-111111111111' AS uuid),
                        'ACTIVE',
                        'Old Active',
                        'MEMBER',
                        '["player"]',
                        TIMESTAMP '2026-01-01 00:00:00',
                        TIMESTAMP '2026-01-02 00:00:00'
                      ),
                      (
                        CAST('33333333-3333-4333-8333-333333333332' AS uuid),
                        CAST('22222222-2222-4222-8222-222222222222' AS uuid),
                        CAST('11111111-1111-4111-8111-111111111111' AS uuid),
                        'ACTIVE',
                        'Latest Active',
                        'MEMBER',
                        '["mc","volunteer"]',
                        TIMESTAMP '2026-01-01 00:00:00',
                        TIMESTAMP '2026-01-03 00:00:00'
                      ),
                      (
                        CAST('33333333-3333-4333-8333-333333333333' AS uuid),
                        CAST('22222222-2222-4222-8222-222222222223' AS uuid),
                        CAST('11111111-1111-4111-8111-111111111111' AS uuid),
                        'INACTIVE',
                        'Inactive Newer',
                        'MEMBER',
                        '["dj"]',
                        TIMESTAMP '2026-01-01 00:00:00',
                        TIMESTAMP '2026-01-04 00:00:00'
                      )
                    """.trimIndent(),
                )
            }
        }

        flyway(url).migrate()

        DriverManager.getConnection(url, "sa", "").use { connection ->
            connection
                .prepareStatement(
                    "SELECT member_display_name, preferred_role_keys FROM users WHERE id = CAST(? AS uuid)",
                ).use { statement ->
                    statement.setString(1, "11111111-1111-4111-8111-111111111111")
                    statement.executeQuery().use { rows ->
                        rows.next()
                        assertEquals("Latest Active", rows.getString("member_display_name"))
                        assertEquals("""["mc","volunteer"]""", rows.getString("preferred_role_keys"))
                    }
                }

            connection
                .prepareStatement(
                    """
                    SELECT display_name, preferred_role_keys
                    FROM troupe_memberships
                    WHERE user_id = CAST(? AS uuid)
                      AND status = 'ACTIVE'
                    ORDER BY id
                    """.trimIndent(),
                ).use { statement ->
                    statement.setString(1, "11111111-1111-4111-8111-111111111111")
                    statement.executeQuery().use { rows ->
                        repeat(2) {
                            rows.next()
                            assertEquals("Latest Active", rows.getString("display_name"))
                            assertEquals("""["mc","volunteer"]""", rows.getString("preferred_role_keys"))
                        }
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
                    ),
                )
        if (target != null) {
            configuration.target(target)
        }
        return configuration.load()
    }
}

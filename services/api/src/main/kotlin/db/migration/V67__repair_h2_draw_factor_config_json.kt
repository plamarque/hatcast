package db.migration

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

/**
 * V66 (pre-6770a2da) inserted factor_config on H2 as a JSON **string** token
 * (`"[{...}]"`) instead of a JSON array (`[{...}]`). Hibernate then fails to
 * deserialize `DrawFactorConfig` (List) — breaks Dispos `includeChances=true`.
 *
 * Idempotent: only rows whose VARCHAR form starts with `"` are updated.
 * No-op on PostgreSQL (V66 always used CAST(? AS jsonb)).
 */
@Suppress("ClassName")
class V67__repair_h2_draw_factor_config_json : BaseJavaMigration() {
    private val objectMapper = ObjectMapper()

    override fun migrate(context: Context) {
        val connection = context.connection
        val postgres = connection.metaData.databaseProductName.equals("PostgreSQL", ignoreCase = true)
        if (postgres) {
            return
        }

        connection
            .prepareStatement(
                """
                SELECT id, CAST(factor_config AS VARCHAR) AS fc
                FROM draw_formulas
                WHERE SUBSTRING(CAST(factor_config AS VARCHAR), 1, 1) = '"'
                """.trimIndent(),
            ).use { select ->
                select.executeQuery().use { rows ->
                    while (rows.next()) {
                        val id = rows.getObject("id")
                        val wrapped = rows.getString("fc")
                        val arrayJson = unwrapJsonString(wrapped)
                        val escaped = arrayJson.replace("'", "''")
                        connection
                            .prepareStatement(
                                """
                                UPDATE draw_formulas
                                SET factor_config = JSON '$escaped'
                                WHERE id = ?
                                """.trimIndent(),
                            ).use { update ->
                                update.setObject(1, id)
                                update.executeUpdate()
                            }
                    }
                }
            }
    }

    /** Unwrap one or more JSON string layers until a JSON array/object literal is obtained. */
    private fun unwrapJsonString(raw: String): String {
        var current = raw.trim()
        while (current.startsWith("\"") && current.endsWith("\"")) {
            current = objectMapper.readValue<String>(current)
        }
        return current
    }

    override fun getDescription(): String = "Repair H2 draw_formulas.factor_config JSON string encoding"
}

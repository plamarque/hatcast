package db.migration

import com.hatcast.api.draw.DrawFormulaIds
import com.hatcast.api.draw.DrawFormulaSeedConstants
import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

/**
 * Idempotent backfill: one system V1 formula per existing troupe (story 19.16 AC 2).
 * UUID contract: [DrawFormulaIds.systemV1].
 */
@Suppress("ClassName")
class V66__draw_formulas_system_seed : BaseJavaMigration() {
    override fun migrate(context: Context) {
        val now = Timestamp.from(Instant.now())
        val connection = context.connection
        val postgres = connection.metaData.databaseProductName.equals("PostgreSQL", ignoreCase = true)
        val factorConfigColumn =
            if (postgres) {
                "CAST(? AS jsonb)"
            } else {
                // H2: CAST('…' AS JSON) stores a JSON string token; JSON '…' stores an array/object.
                val escaped =
                    DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG_JSON.replace("'", "''")
                "JSON '$escaped'"
            }
        connection.prepareStatement("SELECT id FROM troupes").use { select ->
            select.executeQuery().use { rows ->
                while (rows.next()) {
                    val troupeId = rows.getObject("id", UUID::class.java)
                    val formulaId = DrawFormulaIds.systemV1(troupeId)
                    connection
                        .prepareStatement(
                            """
                            INSERT INTO draw_formulas (
                              id, troupe_id, name, description, status, factor_config,
                              version, is_system, system_troupe_key, created_at, updated_at
                            )
                            SELECT ?, ?, ?, NULL, 'PUBLISHED', $factorConfigColumn, 1, TRUE, ?, ?, ?
                            WHERE NOT EXISTS (
                              SELECT 1 FROM draw_formulas WHERE id = ?
                            )
                            """.trimIndent(),
                        ).use { insert ->
                            insert.setObject(1, formulaId)
                            insert.setObject(2, troupeId)
                            insert.setString(3, DrawFormulaSeedConstants.SYSTEM_V1_NAME)
                            var paramIndex = 4
                            if (postgres) {
                                insert.setString(paramIndex, DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG_JSON)
                                paramIndex++
                            }
                            insert.setObject(paramIndex++, troupeId)
                            insert.setTimestamp(paramIndex++, now)
                            insert.setTimestamp(paramIndex++, now)
                            insert.setObject(paramIndex, formulaId)
                            insert.executeUpdate()
                        }
                }
            }
        }
    }

    override fun getDescription(): String = "Seed system V1 draw formula per troupe (idempotent)"
}

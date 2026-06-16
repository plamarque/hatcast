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
        val factorConfigExpr = jsonBindExpression(connection.metaData.databaseProductName)
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
                            SELECT ?, ?, ?, NULL, 'PUBLISHED', $factorConfigExpr, 1, TRUE, ?, ?, ?
                            WHERE NOT EXISTS (
                              SELECT 1 FROM draw_formulas WHERE id = ?
                            )
                            """.trimIndent(),
                        ).use { insert ->
                            insert.setObject(1, formulaId)
                            insert.setObject(2, troupeId)
                            insert.setString(3, DrawFormulaSeedConstants.SYSTEM_V1_NAME)
                            insert.setString(4, DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG_JSON)
                            insert.setObject(5, troupeId)
                            insert.setTimestamp(6, now)
                            insert.setTimestamp(7, now)
                            insert.setObject(8, formulaId)
                            insert.executeUpdate()
                        }
                }
            }
        }
    }

    private fun jsonBindExpression(databaseProductName: String): String =
        if (databaseProductName.equals("PostgreSQL", ignoreCase = true)) {
            "CAST(? AS jsonb)"
        } else {
            "?"
        }

    override fun getDescription(): String = "Seed system V1 draw formula per troupe (idempotent)"
}

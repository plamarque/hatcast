package com.hatcast.api.draw

import com.hatcast.api.availability.draw.CategoryCompartmentFactor
import com.hatcast.api.availability.draw.ImmediateReplayFactor
import com.hatcast.api.availability.draw.PastParticipationFactor
import com.hatcast.api.availability.draw.RoleRequestFactor
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test

@Tag("19.19b")
@Tag("REF-P")
class DrawFormulaValidatorTest {
    private val validator = DrawFormulaValidator()

    private fun baseConfig(vararg entries: DrawFactorConfigEntry): DrawFactorConfig =
        listOf(
            DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
            DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
            *entries,
        )

    @Test
    fun `REF-P01 unknown param key rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = PastParticipationFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("foo" to 1.0),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("Paramètre inconnu pour past_participation"))
    }

    @Test
    fun `bonusPerUnfulfilled out of range rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = RoleRequestFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("bonusPerUnfulfilled" to 6.0),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("bonusPerUnfulfilled doit être entre 0.0 et 5.0"))
    }

    @Test
    fun `REF-P02 maxBonusMultiplier out of range rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = RoleRequestFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("maxBonusMultiplier" to 25.0),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("maxBonusMultiplier doit être entre 1.0 et 20.0"))
    }

    @Test
    fun `malusMultiplier out of range with MALUS rejected`() {
        val config =
            baseConfig(
                DrawFactorConfigEntry(
                    factorId = ImmediateReplayFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("mode" to "MALUS", "malusMultiplier" to 1.5),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("malusMultiplier doit être entre 0.0 et 1.0"))
    }

    @Test
    fun `equity_tag unknown param key rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(
                    factorId = CategoryCompartmentFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("weight" to 1.0),
                ),
                DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("Paramètre inconnu pour equity_tag"))
    }

    @Test
    fun `REF-P03 malusMultiplier with EXCLUDE rejected`() {
        val config =
            baseConfig(
                DrawFactorConfigEntry(
                    factorId = ImmediateReplayFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("mode" to "EXCLUDE", "malusMultiplier" to 0.5),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("malusMultiplier n'est autorisé que si mode=MALUS"))
    }

    @Test
    fun `REF-P03 malusMultiplier without mode rejected`() {
        val config =
            baseConfig(
                DrawFactorConfigEntry(
                    factorId = ImmediateReplayFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("malusMultiplier" to 0.5),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("malusMultiplier n'est autorisé que si mode=MALUS"))
    }

    @Test
    fun `non-finite numeric param rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = PastParticipationFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("strength" to "NaN"),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("strength doit être un nombre"))
    }

    @Test
    fun `REF-P04 missing params accepted`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(factorId = RoleRequestFactor.FACTOR_ID, enabled = true),
            )
        assertDoesNotThrow { validator.validateForSave(config) }
    }

    @Test
    fun `REF-P05 strength out of range rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = PastParticipationFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("strength" to 3.0),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("strength doit être entre 0.0 et 2.0"))
    }

    @Test
    fun `REF-P06 OFF mode rejected`() {
        val config =
            baseConfig(
                DrawFactorConfigEntry(
                    factorId = ImmediateReplayFactor.FACTOR_ID,
                    enabled = true,
                    params = mapOf("mode" to "OFF"),
                ),
            )
        val ex =
            assertThrows(DrawFormulaValidationException::class.java) {
                validator.validateForSave(config)
            }
        assertTrue(ex.message!!.contains("mode"))
    }

    @Test
    fun `disabled factor params are not validated`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = CategoryCompartmentFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(factorId = PastParticipationFactor.FACTOR_ID, enabled = true),
                DrawFactorConfigEntry(
                    factorId = RoleRequestFactor.FACTOR_ID,
                    enabled = false,
                    params = mapOf("maxBonusMultiplier" to 99.0),
                ),
            )
        assertDoesNotThrow { validator.validateForSave(config) }
    }
}

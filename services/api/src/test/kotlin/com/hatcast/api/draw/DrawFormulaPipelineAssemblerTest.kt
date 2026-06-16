package com.hatcast.api.draw

import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.availability.draw.LabeledDrawWeightFactor
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class DrawFormulaPipelineAssemblerTest {
    private val assembler = DrawFormulaPipelineAssembler(DrawFormulaValidator())

    @Test
    fun `REF-F01 factorConfig assembles pipeline equivalent to DEFAULT`() {
        val pipeline = assembler.assemble(DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG)
        assertEquals(
            DrawWeightPipelines.DEFAULT.factors.map { (it as LabeledDrawWeightFactor).factorId },
            pipeline.factors.map { (it as LabeledDrawWeightFactor).factorId },
        )
    }

    @Test
    fun `duplicate factorId is rejected at parse time`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "past_participation", enabled = true),
            )
        assertThrows(DrawFormulaValidationException::class.java) {
            assembler.assemble(config)
        }
    }

    @Test
    fun `REF-V04b reserved factor disabled on draft save is allowed`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "past_participation", enabled = true),
                DrawFactorConfigEntry(factorId = "gender_parity", enabled = false),
            )
        DrawFormulaValidator().validateForSave(config)
    }

    @Test
    fun `reserved factor enabled on save is rejected`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "gender_parity", enabled = true),
            )
        val validator = DrawFormulaValidator()
        assertThrows(DrawFormulaValidationException::class.java) {
            validator.validateForSave(config)
        }
    }

    @Test
    fun `equity_tag disabled only is rejected on publish`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = false),
                DrawFactorConfigEntry(factorId = "past_participation", enabled = true),
            )
        assertThrows(DrawFormulaValidationException::class.java) {
            assembler.assemble(config)
        }
    }

    @Test
    fun `unknown factorId is rejected at parse time`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "unknown_factor", enabled = true),
            )
        assertThrows(DrawFormulaValidationException::class.java) {
            assembler.assemble(config)
        }
    }

    @Test
    fun `immediate_replay without params defaults to EXCLUDE mode`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "past_participation", enabled = true),
                DrawFactorConfigEntry(factorId = "immediate_replay", enabled = true),
            )
        val pipeline = assembler.assemble(config)
        assertEquals(
            DrawWeightPipelines
                .withImmediateReplay(
                    com.hatcast.api.availability.draw.ImmediateReplayMode.EXCLUDE,
                ).factors
                .map { (it as LabeledDrawWeightFactor).factorId },
            pipeline.factors.map { (it as LabeledDrawWeightFactor).factorId },
        )
    }

    @Test
    fun `disabled factors are skipped in pipeline assembly`() {
        val config =
            listOf(
                DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
                DrawFactorConfigEntry(factorId = "past_participation", enabled = false),
            )
        val pipeline = assembler.assemble(config)
        assertEquals(listOf("equity_tag"), pipeline.factors.map { (it as LabeledDrawWeightFactor).factorId })
    }
}

package com.hatcast.api.availability

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource

/**
 * Golden runner for Wave D formula pipelines (REF-F01..REF-F08).
 *
 * Fixtures: [draw/golden/formulas/pipelines.json]
 * Design: [_bmad-output/test-artifacts/19-17-formula-api-test-design.md]
 *
 * Enable when story 19.17 wires factorConfig → DrawWeightPipeline assembly.
 */
@Disabled("Wave D — enable in story 19.17 (DrawFormula pipeline golden)")
@Tag("19.17")
@Tag("REF-F")
class DrawFormulaPipelineGoldenTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun formulaPipelineGolden(fixtureId: String) {
        throw UnsupportedOperationException(
            "[$fixtureId] Implement loader for draw/golden/formulas/pipelines.json in 19.17",
        )
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            listOf(
                "REF-F01",
                "REF-F02",
                "REF-F03",
                "REF-F04",
                "REF-F05",
                "REF-F06",
                "REF-F07",
                "REF-F08",
            )
    }
}

package com.hatcast.api.availability

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Integration tests for draw formula API validation (REF-V01..REF-V04).
 *
 * Fixtures: [draw/golden/policies/validation.json] (function: formulaSave | formulaPublish)
 * Suggested endpoints: GET/POST/PATCH /v1/troupes/{id}/draw-formulas
 * Design: [_bmad-output/test-artifacts/19-17-formula-api-test-design.md]
 */
@Disabled("Wave D — enable in story 19.17 (formula API validation)")
@Tag("19.17")
@Tag("REF-V")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DrawFormulaValidationIntegrationTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun formulaValidation(fixtureId: String) {
        throw UnsupportedOperationException(
            "[$fixtureId] Implement MockMvc tests from draw/golden/policies/validation.json in 19.17",
        )
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            listOf(
                "REF-V01",
                "REF-V02",
                "REF-V02b",
                "REF-V03",
                "REF-V03b",
                "REF-V04",
                "REF-V04b",
            )
    }
}

package com.hatcast.api.composition

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Integration tests for draw policy API validation + runtime fallbacks (REF-V05..REF-V15).
 *
 * Fixtures: [draw/golden/policies/validation.json] (function: policySave | compositionDraw | drawRuntime)
 * Suggested endpoints: PUT draw-policy, GET effective, POST composition/draw
 * Design: [_bmad-output/test-artifacts/19-18-policy-api-test-design.md]
 */
@Disabled("Wave D — enable in story 19.18 (policy API validation)")
@Tag("19.18")
@Tag("REF-V")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DrawPolicyValidationIntegrationTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun policyValidation(fixtureId: String) {
        throw UnsupportedOperationException(
            "[$fixtureId] Implement MockMvc tests from draw/golden/policies/validation.json in 19.18",
        )
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            listOf(
                "REF-V05",
                "REF-V06",
                "REF-V07",
                "REF-V08",
                "REF-V09",
                "REF-V10",
                "REF-V11",
                "REF-V12",
                "REF-V13",
                "REF-V14",
                "REF-V15",
            )
    }
}

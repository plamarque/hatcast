package com.hatcast.api.composition

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource

/**
 * Golden runner for draw policy resolution scenarios (REF-R01..REF-R12).
 *
 * Fixtures: [draw/golden/policies/resolution.json]
 * Design: [_bmad-output/test-artifacts/19-18-policy-api-test-design.md]
 *
 * Enable when story 19.18 implements DrawPolicy resolution service.
 */
@Disabled("Wave D — enable in story 19.18 (policy resolution golden)")
@Tag("19.18")
@Tag("REF-R")
class DrawPolicyResolutionGoldenTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun policyResolutionGolden(fixtureId: String) {
        throw UnsupportedOperationException(
            "[$fixtureId] Implement loader for draw/golden/policies/resolution.json in 19.18",
        )
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            listOf(
                "REF-R01",
                "REF-R02",
                "REF-R03",
                "REF-R04",
                "REF-R05",
                "REF-R06",
                "REF-R07",
                "REF-R08",
                "REF-R09",
                "REF-R10",
                "REF-R11",
                "REF-R12",
            )
    }
}

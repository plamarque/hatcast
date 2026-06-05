package com.hatcast.api.e2e

import com.hatcast.api.e2e.dto.E1CutoverFixtureResponse
import com.hatcast.api.e2e.dto.Story319FixtureResponse
import org.springframework.context.annotation.Profile
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** Fixture setup for Playwright E2E — profile `e2e` only; gated by [E2eApiKeyService]. */
@RestController
@RequestMapping("/v1/e2e/fixtures")
@Profile("e2e")
class E2eFixtureController(
    private val fixtureService: E2eFixtureService,
    private val e1CutoverFixtureService: E1CutoverFixtureService,
) {
    /** Resets Story 3.19 recette data (seasons A/B, Max, externe, sans exclusion événement pré-appliquée). */
    @PostMapping("/story-3-19/reset")
    fun resetStory319(): Story319FixtureResponse = fixtureService.resetStory319()

    /** Resets E1 cutover gate data (MVP pilot, Angie member, draw event cleared, audit seed). */
    @PostMapping("/e1-cutover/reset")
    fun resetE1Cutover(): E1CutoverFixtureResponse = e1CutoverFixtureService.resetE1Cutover()
}

package com.hatcast.api.e2e

import com.hatcast.api.e2e.dto.E1CutoverFixtureResponse
import com.hatcast.api.e2e.dto.Story319FixtureResponse
import com.hatcast.api.e2e.dto.Story38dFixtureResponse
import com.hatcast.api.e2e.dto.Story325FixtureResponse
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
    private val story325FixtureService: E2eStory325FixtureService,
) {
    /** Resets Story 3.19 recette data (seasons A/B, Max, externe, sans exclusion événement pré-appliquée). */
    @PostMapping("/story-3-19/reset")
    fun resetStory319(): Story319FixtureResponse = fixtureService.resetStory319()

    /** Resets Story 3.8d recette data (carnet externes, Angie roster, match-vs-bruxelles). */
    @PostMapping("/story-3-8d/reset")
    fun resetStory38d(): Story38dFixtureResponse = fixtureService.resetStory38d()

    /** Resets E1 cutover gate data (MVP pilot, Angie member, draw event cleared, audit seed). */
    @PostMapping("/e1-cutover/reset")
    fun resetE1Cutover(): E1CutoverFixtureResponse = e1CutoverFixtureService.resetE1Cutover()

    /** Resets Story 3.25 guest scoped access recette (Laetitia, Ruben, Piotrix, multi-troupe). */
    @PostMapping("/story-3-25/reset")
    fun resetStory325(): Story325FixtureResponse = story325FixtureService.resetStory325()
}

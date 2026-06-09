package com.hatcast.api.composition

/** Optional hint when lifecycle regresses — story 8.4b TEAM_REGRESSED `reasonSummary`. */
data class CompositionLifecycleTransitionContext(
    val reasonSummary: String? = null,
)

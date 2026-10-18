---
name: hatcast-posthog-smoke-analysis
description: >-
  Establish or refresh HatCast's data-informed critical user journeys for its
  staging smoke contract from PostHog events, funnels, and purposeful session
  replays. Use only when the user explicitly asks to analyse or refresh smoke
  scenarios with PostHog; it does not run a release or deploy anything.
disable-model-invocation: true
---

# HatCast PostHog smoke analysis

Use this skill to refresh the evidence behind HatCast's critical-user-journey
contract. It is deliberately separate from the release lifecycle: a normal
release consumes the approved contract and does not re-run this analysis.

## Scope and cadence

Run only on an explicit request, such as “analyse les parcours PostHog”,
“rafraîchis le contrat de smoke”, or before a substantial product/role change.
Use a 90-day window by default, but state the selected period. Do not prescribe
a calendar cadence: refresh when the product, population, instrumentation, or
available evidence has materially changed.

The default output is a read-only proposal in chat. Do not create insights,
dashboards, event definitions, annotations, or repository files unless the
user explicitly asks for that persistence.

## Evidence collection

1. Inspect event definitions and their last-seen status before treating an
   event as usable. Check the source code for semantic capture where needed.
2. Obtain aggregate usage: unique persons and event counts, then inspect page
   paths and funnels for the journeys that matter. Also group pageviews by the
   captured screen width and height when those properties exist. Use that
   distribution to select a small representative responsive profile; treat the
   dimensions as a device/screen signal, not as proof of the browser's exact
   CSS viewport. Exclude development/internal traffic if a reliable filter
   exists; otherwise disclose that limitation.
3. Review only a small, purposeful sample of session replays for each leading
   candidate—for example to distinguish a true task from accidental navigation.
   Do not copy personal details, user messages, emails, raw replay text, or
   secrets into the report or any AI prompt.
4. PostHog AI may help formulate a query, but validate its claims against an
   insight, SQL result, event definition, or replay. Never treat generated text
   alone as a ranking.

For the current HatCast V2 baseline, inspect at least `$pageview`,
`availability_first_submission`, `composition_validated`,
`composition_all_confirmations_received`, and `notification_link_opened` when
they exist. Their absence, staleness, or low volume is evidence of an
instrumentation boundary, not proof that the related product flow is unused.

## Decision rule and deliverable

Propose five permanent paths at most, plus any explicitly requested product
slice. Rank candidates using:

1. user reach and repeat use;
2. task completion, drop-off, and observable errors;
3. business consequence if the journey fails;
4. confidence and limitations of the instrumentation.

Keep a low-volume, high-consequence organizer or safety journey in the contract
when it is central to the product. Do not allow raw pageview volume to remove
it.

For every proposed path, report: role, entry point, actions, persisted success
assertion, available PostHog evidence, suitable staging fixture, responsive
profile, and confidence level. Recommend no more than three named profiles:
one prevalent mobile width, one narrower mobile guard, and one wide desktop
profile when the data warrants it. Separately list gaps: events that need
semantic instrumentation, missing role/internal-traffic filters, and flows that
require fixture-based smoke rather than analytics proof.

When the user approves the proposal, update the release skill's
`references/staging-smoke-contract.md` or a user-designated contract artifact;
otherwise leave the repository unchanged.

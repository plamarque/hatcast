---
title: 'Replace an unused generic Advent reservation in development'
type: 'feature'
created: '2026-11-09'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'abb76bdd8b6278bdb7d964220edd2c5319f015f3'
context:
  - 'docs/v2/technical/AVENT_CATALOGUE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A legacy generic reservation and quiz prevent the approved Sandrine contribution from being synchronized on day 17 in development.

**Approach:** Add a narrowly scoped, explicitly confirmed operator procedure to replace an unused generic development reservation and its quiz atomically, then use it for the authorized day.

## Boundaries & Constraints

**Always:** Verify the development target, source generation and portrait, privacy, permissions, prior content, and absence of day-specific game state; lock both game controls and relevant tables while rechecking. Preserve all answers, game state and other days. Refuse stale, ambiguous or nongeneric identities. Verify after application without exposing private content.

**Never:** Change production, staging or local, delete data, overwrite a real or edited quiz silently, bypass existing operator checks, deploy, or alter source catalogue.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Unused generic | Generic legacy identity and explicitly reviewed quiz | Atomically replace reservation and quiz for the selected day. |
| Activity or changed target | Any game data or changed plan | Refuse and rollback without mutation. |
| Wrong target or identity | Production, staging, or real identity | Refuse before mutation. |

</frozen-after-approval>

## Code Map

- `scripts/v2/advent-catalogue-sync.mjs` and `advent-catalogue-cloud-content.mjs`: existing identity, binding, permissions, source generation, interactive review and guards.
- `scripts/v2/advent-catalogue-reservations.mjs`: transaction and runtime game locks; preserve ordinary character/quiz protections.
- `scripts/v2/advent-catalogue-delete.mjs`: list of day-specific game tables; do not use its deletion path.
- `docs/v2/technical/AVENT_CATALOGUE.md`: document new targeted operator procedure.

## Tasks & Acceptance

- [x] Add a development-only operator flow with atomic replacement and safeguards, and document it.
- [x] Test generic matching, activity, concurrency, rollback and wrong-target refusal using synthetic data.
- [x] Execute the authorized operation for day 17 and compare both reservation and quiz independently afterwards.

Given an unused and reviewed generic reservation and quiz, when the operator confirms the selected development day, then both are updated atomically without changing game state. Given any conflicting identity, activity, stale review or non-development target, when the operation runs, then it refuses without writes.

## Implementation Notes

The operator replaced the user-confirmed fictional day 17 in development. Independent character and quiz comparisons returned unchanged; no game state was deleted.

## Spec Change Log

## Review Triage Log

- Medium: reminder activity was omitted; included in the transactional checks.
- Medium: source protections ended before post-write verification; retained through verification and checked the revision increment.
- Medium: disposable PostgreSQL coverage and V85 were missing; added integration coverage and verified it.
- Low: retry guidance after uncertain commit was incomplete; documented an independent comparison before retry.
- False: legacy schemas failing after V85 was selected is not a new break in supported write paths, which already require V85 for content revision updates.
- Resolved: the user reviewed the existing private quiz and confirmed it was fictional and replaceable.

## Verification

Run relevant Node tests and verify the selected target via the operator.

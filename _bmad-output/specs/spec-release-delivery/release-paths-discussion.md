---
type: architecture-discussion
status: criteria-adopted-policy-incomplete
updated: 2026-10-27
scope: Two-path selection after story closure, before explicit release go
---

# Release path decision — coaching proposal

Patrice adopted two paths (Targeted and Complete), their semantic eligibility boundary and shared control principles. This remains a discussion companion, not the final architecture spine or activated runtime policy; common staging controls and critical/noncritical outcome principles are adopted; exact executable selectors, residual outcome handling and evidence mechanisms remain unresolved. Current behavioral details are consolidated in risk-policy.md, verification-contract.md and release-paths-discussion.fr.md. The accepted orchestration remains: requested story closure and integration into v2; assess the complete unreleased delta; propose release with a path or wait; start A only after explicit release go. Waiting preserves the entire pending delta for reassessment after the next development. Release all or nothing.

## Why two paths are the current recommendation

The maintenance-history study found real bounded corrections (unavailable-name display, mobile chart layout, cancel result handling, stale-unlock UI recovery), while sessions, notification audiences, destructive composition changes, dependency/build changes and global chunk/cache recovery have directly broader effects. Multi-troupe statistics is the ambiguous middle example: known domain, but changed membership visibility, aggregate scope and compatibility. That is evidence for a bounded-versus-complete distinction, not for a reliably separable third Standard path.

Source: [research report](../../planning-artifacts/research/technical-post-opening-v2-release-paths-2026-10-23/research.md), source-backed nature examples and full release matrix. The history does not prove reduced testing safe; it does not quantify path frequency under future smaller batching or savings. No historical build/test durations are used.

## Candidate selection proposal

**Targeted** is eligible only if every condition below is demonstrated for the complete candidate-to-served-production delta. **Complete** is the fallback if any condition is false or unknown. These are semantic conditions; file extensions, line counts, bug/feature labels, urgency and a previously green story are not selectors.

| Condition for Targeted | Evidence expected in the recommendation |
| --- | --- |
| Bounded behavior, including cumulative interactions | Describe each pending change, affected screens/actions, and how changes interact. Multiple bounded changes do not automatically remain bounded together. |
| Existing contracts and business rules retained | No changed shared API/DTO meaning, authorization, tenant visibility, session/auth, schema/migration or persistence/lifecycle semantics. Existing UI saves may still be exercised; fixing a cancel result is not a new server mutation rule. |
| Callers and neighbors known | Name consumers, shared components and state transitions; verify affected roles, mobile/desktop and positive/negative paths. A shared component is not automatically excluded if all affected callers are understood and covered. |
| No cross-cutting operational or external change | No global routing/theme/PWA/cache behavior, changed dependencies/build/CI/infra, notification audience/dispatch or other external effect. A fix confined to local display/interaction may qualify regardless of bug/feature label. |
| Current regression coverage exists or is added and run | Identify the regression assertion, affected component/caller/API tests and Playwright selections by identity; no relevant mapping means Complete, not an unrecorded skip. |
| Staging can demonstrate the delivered behavior | Safe fixture and persisted observation where relevant; a missing fixture/blocked check cannot be interpreted as success. |
| Credible detection and recovery | Identify the failure signal, read-only production check and prepared recovery target. Unknown data/external-effect reversal means Complete. |
| No known failure bypassed | Preserve failed, retry, skipped and blocked outcomes. Choosing Targeted cannot turn a known required failure into an omission. Q-3 owns acceptance rules. |

Complete is necessary for a changed auth/permissions/session or cross-troupe access boundary; schema/data lifecycle/destructive mutation; notifications/external side effects; shared contract/business rules; dependency/build/infra; global routing/PWA/cache/theme; unknown callers/interactions or inadequate tests/fixtures. Complete does not itself resolve failed tests or missing fixtures: the affected gate can still be blocked.

## Adopted verification scope — executable mapping pending

| Concern | Targeted | Complete |
| --- | --- | --- |
| Before release go | Assessment/proposal only; story checks and existing integration CI are separate | Same |
| Candidate and notes | Final code/version/approved notes; complete pending delta and candidate identity | Same |
| Blocking CI | Bug/change regression, components/callers/neighbors and pertinent API tests; justified Playwright selection | Complete CI T1; complete API when governing scope requires it |
| Build and staging | Required build and tests succeed before one real staging deploy | Same mechanism |
| Cloud T2 | Expected version/API health/PWA loading plus changed-path and neighbor assertions | Full governing E1 contract with explicit fixture/skip dispositions |
| Human staging smoke | C1 always, C2–C5 when affected, changed-path and relevant neighbor checks with persisted results where applicable | Full C1–C5 plus delta and risk-specific device/compatibility checks |
| Production | Existing authority gates, distinct production build, read-only verification and prepared recovery | Same |
| Local E2E | On demand; recommended when declining release; not a substitute for required CI proof | Same |
| Optional deferred tests | Declared staging-compatible scenarios start after blocking verification while awaiting go prod, continue during/after delivery, with diagnosis and human decision on failure | Full required verification remains before delivery |
| Production after delivery | Confirm served release identity and reachability only; no functional journeys or data writes | Same |

Production is not a functional-test target. Declared deferred tests may start automatically after blocking verification while awaiting go prod and continue during/after delivery without waiting for completion to launch MEP. They must run on actual staging against the selected candidate, using safe fixtures and staging-compatible assertions; this is not an automatic substitution of T1/H2 tests with cloud tests. Declare blocking/deferred/omitted coverage and residual risk before release go. A staging revision change makes attribution invalid unless identity is established.

A deferred failure triggers diagnosis, not automatic rollback: distinguish product defect, outdated/incorrect test, fixture/environment problem and inconclusive result. Present evidence, likely impact and a recommendation to Patrice, who decides on repair, justified test adjustment, further investigation or rollback. Never assume a failed test is wrong, weaken assertions to hide a defect, or call an unexplained failure a pass.

Both use A's candidate identity, evidence reuse, single staging cycle and build/test efficiency. Complete retains A's complete-coverage contract. Targeted overrides only explicitly adopted blocking scopes and acknowledges outside-scope regression exposure. A path proposal cannot be executed with reduced coverage until Q-2 and Q-3 have the necessary decisions; absent an adopted reduced policy, use Complete or wait.

## Study examples applied to the cumulative rule

| Pending delta | Proposed outcome |
| --- | --- |
| Only unavailable-name rendering correction; callers and test map demonstrated | Targeted candidate |
| Only mobile chart layout repair; representative responsive and navigation checks demonstrated | Targeted candidate |
| Cancel-dialog result or stale-unlock UI repair without other pending changes; caller/state transition checks demonstrated | Targeted candidate, not automatically eligible |
| Rendering correction plus a pending session change | Complete for the entire delta |
| Several UI corrections with undocumented shared interactions | Complete until the missing impact map is resolved |
| Multi-troupe statistics changes visibility/scope and DTO compatibility | Complete; no third Standard lane used to mask uncertainty |

## Current decision boundary

Two paths and semantic eligibility are adopted. Both require technical staging health and human C1; Targeted requires C2–C5 when affected, Complete systematically. Both require actual changed/neighbor verification and explicitly allocate automated versus human checks. Diagnosed non-product failures and missing checks outside the changed/neighbor critical perimeter may be nonblocking with disclosed coverage; missing critical verification remains blocking. If change-related verification fails then passes on rerun without an identified cause, present both results, analysis and remaining risk to Patrice and ask whether to proceed; no automatic validation or abandonment, and no clean-pass relabeling.

Go release authorizes the disclosed preparation/verification scope; new gaps need Patrice decision. Go prod is distinct, after results and his staging acceptance, and reuses valid checks without an automatic full campaign. Later v2 merges neither interrupt nor alter the selected candidate. After a mechanical failure, establish actual completed effects/served version and resume that candidate from the last safe point; code correction requires reassessment.

Q-1–Q-5 in SPEC.md identify remaining executable mapping, evidence, outcome and orchestration mechanics. When authorized release candidates compete for shared staging before the first reaches production, ask Patrice which to pursue before replacing the current candidate. No automatic priority or abandonment applies; deferred-only preemption after delivery remains separate. Standard is not adopted. No runtime activation is authorized.

## Superseding deferred staging runs

A newer authorized staging candidate takes priority over older deferred verification. Cancel the previous candidate's queued/running deferred tests when preparing to replace staging; do not wait for suite completion or require a reservation through the end of regression. Stop owned test/fixture operations before the target switches so old execution cannot mutate the new candidate's fixtures. Any short handoff guard exists only to terminate the previous execution safely, not to finish its suite.

Retain candidate identity, completed assertions and reports, cancellation reason and superseding candidate. The interrupted suite is cancelled/incomplete, never a pass. Already observed failures remain recorded for diagnosis and Patrice decision; cancellation neither erases them nor automatically triggers rollback. Reject late or mixed-target results as evidence. The new candidate receives its own full-delta assessment and required gates; it does not inherit a complete pass from the cancelled suite. No automatic replay of old tests against the new version is implied.

This supersedes the unadopted recommendation to reserve shared staging until all deferred tests finish. Exact cancellation propagation, owned-fixture cleanup and result-attribution mechanisms remain design details under Q-4/Q-5; no runtime change is activated.

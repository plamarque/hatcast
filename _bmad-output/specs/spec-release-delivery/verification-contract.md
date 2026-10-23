# Verification contract

## Common evidence — CAP-1, CAP-8

Architecture must choose representation and storage; these are semantic requirements, not a prescribed JSON schema.

| Evidence | Required meaning |
|---|---|
| Baseline and candidate | Actually served production revision/tag, full delivered delta, candidate SHA, version and RC; separate staging/prod image identity and configuration target |
| Verification scope | Contract/workflow identity, selected suites/projects/scenarios, assertions and proof environment; selection rationale where coverage is reduced |
| Relevant inputs | Code, dependencies, verification contract and configuration identifiers sufficient to detect invalid reuse; no secret values |
| Outcome | First-attempt/retry outcomes, skipped assertions, pass/failed/blocked/waived disposition, reason and applicable authority |
| Human smoke | Candidate/revision, role and safe fixture, actions, persisted observations, responsive/device scope when relevant, mutation and cleanup |
| Timing | Evidence creation and validity, gate execution and waits; no invented expiry interval |
| Promotion | Candidate served in staging, matching required evidence, approved notes, configuration prerequisites and separate explicit production authorization |
| Delivery/recovery | Tag, GitHub Release, image, deploy and verification results separately; partial effects and prepared recovery target remain visible |

A pass covers only executed assertions. Existing declared skips are not silently promoted to covered assertions. A waiver is an explicit disposition with valid authority, not a test success. Q-1 and Q-3 must be resolved for an affected gate before its automated reuse/acceptance policy is activated.

## Contract A: equivalent-coverage deduplication — CAP-2, CAP-3

The final candidate includes code, version, changelogs and approved notes during validation. Coverage equivalence preserves required scenarios, assertions and environments; it does not preserve repeated sampling against flakes.

| Proof retained on final candidate | Permitted optimization | Forbidden substitution |
|---|---|---|
| One complete local E2E execution | Reuse this current matching proof at promotion; rerun if absent, invalid or expired | CI-only proof presented as local coverage |
| Complete CI T1 regression | Avoid a second complete staging cycle solely to add release metadata | A targeted selection called complete regression |
| Build and deployed cloud T2 | Build may overlap tests; deploy waits for both successes | H2/mock auth or ng serve presented as packaging/cloud proof |
| C1–C5 plus changed-path human smoke | Attach persisted outcomes to the candidate once while still valid | Green E1 or modal visibility presented as complete human smoke |
| Production verification | Verify actual served revision/version, page and API read-only | Treat tag creation or a deploy job result alone as verified delivery |

No requirement is added here to run every autonomous workflow serially. Required evidence must be distinguished from merely present parallel jobs, and complete API coverage remains required when the governing scope requires it.

Reuse must reject another SHA/checkout, changed dependencies or verification contract, changed relevant configuration, stale evidence, insufficient scope and a replaced staging revision. If the candidate changes, repeat affected verification; do not relabel old evidence. Retaining a local and a CI execution preserves environment diversity while removing the later identical local rerun.

Accepted tradeoffs: no verification of the discarded intermediate candidate; fewer repeated observations of intermittent defects; less late local resampling. These are not reductions of scenario/environment coverage. BUG-038 remains visible, not dismissed as deduplication noise.

## Execution efficiency — CAP-4

- Build/test overlap never permits deploy before both required successes.
- Cache identity must cover relevant inputs. Cold/warm execution must preserve browser/version, scenarios/assertions and artifact identity; invalidate incompatible entries.
- Cache gains are unmeasured. Speculative builds can waste compute when tests fail; cache maintenance is an accepted operational cost.
- Separate production build remains; staging success does not imply identical production digest.

## Promotion and recovery — CAP-8

Notes approval, human-smoke disposition and production authorization are distinct. Operator/CI success does not create missing authority. Verify staging still serves the identified candidate at the relevant promotion boundary; stale or ambiguous targets are not valid proof.

The release reports irreversible/external effects separately. Recovery after partial branch/tag pushes, Release creation or image/deploy failure must preserve tags and evidence rather than silently restart against a newer candidate. Q-5 owns the mechanism.

Prepare a known reversion target and verify revision/version, page, auth/API behavior after recovery. Traffic reversion alone does not reverse incompatible migrations, already sent notifications or JavaScript retained by a PWA. No mutating production journey is authorized as smoke.

## Verification cases for downstream design

| Case | Required outcome |
|---|---|
| Same code label, different candidate SHA or relevant inputs | Reject reuse; identify missing current proof |
| Complete T1 but missing local proof under A | Require local verification |
| Build green/tests red, or tests green/build red | No deployment |
| Staging changed during/after verification | Reject attribution to the old target unless identity is established by the chosen mechanism |
| Missing fixture, skipped persistence assertion, retry-only success | Preserve exact outcome and enforce adopted disposition; no unconditional full-coverage claim |
| Metadata changed after validation | Invalidate affected artifact evidence; version/notes must be part of the validated final candidate |
| New unrelated work arrives on v2 while a hotfix is prepared | Candidate remains isolated; no automatic inclusion |
| Production deploy succeeds and PostHog job fails | Report delivery success and observability failure separately |
| Cached preparation differs from cold inputs/results | Invalidate cache; no claim of equivalent execution |

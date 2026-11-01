---
title: 'V2 maintenance releases: does blast-radius selection justify multiple paths?'
type: technical
topic: Post-opening V2 release paths
decision: Whether one, two or three release paths justify their complexity in evolutionary maintenance
source: Immutable Git deltas and imported GitHub release and Actions records
status: complete
preset: standard
validation: normal
claims_verified: 0
claims_unverified: 4
created: 2026-10-23
updated: 2026-10-23
---

# Release paths in V2 evolutionary maintenance

## Decision and findings
**Keep optimized A as the current architecture; this sample does not justify building three paths.** A optimizes the existing complete release process. B would select less blocking test coverage according to the nature and reach of each change.

Actual maintenance work contains plausible bounded corrections as well as broad changes. That supports a potential targeted-versus-complete distinction. The extra Standard category is less well established: its strongest candidate, multi-troupe statistics in v2.6.0, remains disputed. [5] [21] [22]

**Scope:** classify the nature of versioned changes. Historical build, test and release durations are excluded because the mechanics were evolving. No numerical speedup or proof of risk-free test reduction is inferred. Reduced-coverage policies remain unactivated; the clarified target assesses the cumulative delta after story closure and starts A only after explicit release go.

**Confidence:** medium overall. Key code predicates were independently checked for source fidelity, but all records come from the project publisher. Exact adoption, complete incident reporting and prospective classification agreement remain unknown.

## One, two or three paths?
| Design | Historical support | Recommendation |
| --- | --- | --- |
| A only: complete CI reference, one staging cycle, full cloud/human checks, local on demand | Handles every observed bundle with direct deduplication opportunity | Current architecture; evaluate actual 2–3-release gain |
| Two: complete plus a bounded-correction exception | Real bounded-change examples, potentially small complete deltas: unavailable names, mobile chart, cancel dialog, stale-unlock UI | Preserve as a future hypothesis if A remains burdensome; whole pending delta and caller validation still required |
| Three: Fast, Standard, Full | No actual Fast bundle; one uncertain Standard candidate | Do not build now; middle-path utility and reproducible classification are unproven |

These bounded corrections are real historical changes, but a release containing only one is counterfactual. Under Patrice’s all-or-nothing rule, such a path is relevant only when the entire pending delta is bounded; extracting a correction from a broader pending set is excluded. Earlier release decisions could produce smaller future batches; no time estimate or demonstrated safe omission follows. [6] [9] [21] [22]

## Nature of changes within a cumulative candidate
Whole-release classification answers which path the historical bundle could take. Change-level inspection identifies potentially bounded work. The actual lane always follows the whole cumulative candidate; a small latest change cannot lower the risk of broader pending work.

| Real maintenance example | Plausible B path if it is the entire pending delta | Boundary to verify |
| --- | --- | --- |
| Unavailable respondents missing from expanded list, commit 9bdceadb | Fast / targeted | Rendering predicate on already loaded summary; unchanged API/data. Check the shared poll's callers and verify that no unintended chance-preview request is sent. A focused spec was added. [21] |
| Mobile season chart months stacked vertically, commit aa89f644 | Fast / targeted | Local template wrappers reuse existing chart layout; no global token, auth, dependency or data change. Mobile scrolling, event links and desktop layout remain neighbors to check; unit and E1 geometry assertions were added. [22] |
| Cancel in the format dialog sends an unintended result, within v2.6.1 | Fast / targeted, provisional | Dialog-return handling would need to be the only pending behavior change; verify cancel/escape/backdrop and positive save callers. This does not make the full v2.6.1 bundle Fast. [6] |
| Unlock conflict leaves stale team UI, within v2.7.0 | Fast / targeted, provisional | Existing read/unlock APIs; state refresh and parent output wiring, navigation/destruction and repeated clicks need checks. This does not make the full v2.7.0 bundle Fast. [9] |
| Multi-troupe/season statistics, v2.6.0 | Standard candidate, uncertain | Known read domain, but membership visibility, aggregates and rolling DTO/client compatibility cross boundaries. Different reviewers may reasonably require Full until mapping is demonstrated. [5] |
| Sessions, notification audience/dispatch, destructive composition edits, SDK/build change, global chunk/cache recovery | Full | Direct high-risk/shared effects in actual delivered changes. [3] [4] [6] [7] [8] [9] |

The first four are selected examples, not an exhaustive partition of all maintenance changes; no frequency or eligibility percentage is inferred. The historical record establishes that these changes occurred and what they changed. A targeted label remains conditional on the whole accumulated candidate being eligible, dependency review and verification; it is not retrospective proof of safe test omission.

This evidence supports a meaningful **bounded correction versus broad change** distinction. It provides weaker evidence for a third, independently useful **Standard** operating category: the strongest candidate is precisely the one with disputed scope confidence.

## Proposed decision at the end of development

Patrice’s clarified target is to assess each story after requested closure integrates it into v2 and recommend whether to release, with the explicit choice to deliver the whole accumulated delta or wait. Choosing to wait assumes accumulation; the next recommendation evaluates all still-unreleased changes plus the new development. Reduced coverage remains a deferred hypothesis, not an activated policy or proof of safe test omission.

Separate two questions: **should this change be released now or held?** (user benefit, urgency, readiness and release cost) and **what verification does the actual candidate require?** (changed boundaries, uncertainty and applicable policy). Holding is a valid recommendation, not a test-coverage level. A small blast radius does not by itself make immediate release worthwhile; an urgent change can still require complete verification.

The post-closure handoff states the change and user value, release-now versus hold recommendation with reasons, pending delivered delta, proposed verification and evidence gaps. Only explicit release go starts optimized A with the selected verification scope. Refusal starts no release preparation or release-specific gates; local E2E remains recommended and available on demand. Story checks and existing integration-triggered CI are distinct. Before merge it is provisional; after integration/candidate preparation the recommendation must be checked against the actual candidate and the production revision really served. If v2 already contains unreleased work, delivering from v2 includes that whole delta. No isolated release candidate, selective cherry-pick or production-based correction branch is wanted. If the pending delta changes, reassess the cumulative impact instead of carrying forward the previous unit-level label.

The current Epic 21 review controller already records batch versus release-now intent bound to a PR head SHA; it does not classify blast radius, bind proof to the eventual release candidate, or authorize production. Reuse this intent boundary if the proposal is later adopted; do not create a competing approval. Source snapshot: imports/cadence-controller-sources.md. [23]

This proposal may change future release batching and therefore which paths would be used. The historical absence of Fast bundles cannot refute a future targeted path when the entire pending delta qualifies; it does not authorize selecting a subset. Current A alone still uses complete verification; the end-of-development recommendation can propose release now or hold without activating any reduced-coverage path. A separate production agreement remains required.

## Corpus: user opening, not first technical production
The July 12 commit enabling the blocking V1→V2 handoff in production configuration establishes migration intent, not when users arrived. Patrice recalls most users arriving in September. Recorded organizer feedback dated September 16–17 corroborates use by mid-September; it establishes neither the first user nor majority adoption. September 1 is therefore an analytical window boundary, not an asserted opening date. [1] [2]

| Cohort | Included releases | Purpose |
| --- | --- | --- |
| September–October maintenance window | v2.4.6, v2.5.0, v2.6.0, v2.6.1, v2.6.2, v2.6.3, v2.7.0 | Seven consecutive stable publications in the owner-informed opening window |
| Excluding opening transition | v2.5.0 through v2.7.0 | Six; removes v2.4.6's accumulated summer-to-opening delta |
| October sensitivity | v2.6.1, v2.6.2, v2.6.3, v2.7.0 | Four; minimizes ambiguity about pre-opening construction |

June–August releases are excluded from the empirical denominator. GitHub publication records and versioned code establish the cohort and its delivered deltas; publication is not a fresh observation of actual Cloud Run traffic. RCs are attempts within a release episode, not extra independently shipped releases. Publication dates, commit dates, deployment dates and usage dates remain distinct. [19]

## Method and classification matrix
Fast was tested as a bounded correction with understood callers, excluding auth/permissions, shared contracts, dependency/infra changes, external effects and global PWA/cache behavior. Standard covered changes within a known domain, with integration and neighboring behavior to verify; high or unresolved shared impact meant Full. These are screening hypotheses, not adopted selectors. Changed file names, semver and changelog length did not decide the class.

| Release | Candidate-time delivered behavior | Classification judgment |
| --- | --- | --- |
| v2.4.6 | Session invalidation, remembered-session/cookie lifetime; formula UI and event-tab work also delivered | Full: auth boundary. Opening-transition sensitivity only. [3] |
| v2.5.0 | Availability rules across callers; reminder audiences, preferences, actual email/push dispatch; staging traffic routing | Full: external effects and shared recipient/permission rules. [4] |
| v2.6.0 | Multi-troupe/season statistics, aggregate scopes and rates, DTO/filter compatibility, membership visibility checks | Full conservatively; Standard plausible if scope/privacy/compatibility test mapping is demonstrated. The read-only resolver alone is not evidence of global navigation risk. [5] |
| v2.6.1 | Cancel-dialog fix bundled with composition requirement/reconciliation semantics, statistics/reminder recipients and CORS configuration | Full: the actual release exceeds the cancel repair. [6] |
| v2.6.2 | Free/preserved slot deletion and assignment behavior, audit ordering, removal notifications and membership synchronization | Full: destructive domain mutation and external effects. [7] |
| v2.6.3 | Comment visibility bundled with PostHog SDK dependency upgrade, build release identity and lifecycle/promotion CI instrumentation | Full under dependency/build/CI exclusions. Guarded PWA analytics hooks alone would not establish a PWA lifecycle redesign. [8] |
| v2.7.0 | Router/chunk recovery, nginx missing-asset/cache handling and installed-client reload behavior; home/navigation changes also delivered | Full: actual global serving/recovery behavior. [9] |

No migration-path changes were found in net deltas or interval Git histories for these seven ranges. Data risk still exists through application mutations, membership sync and recipient selection. Details and exact tag-specific test selections are preserved in the frozen digest; existing test files are not evidence those tests passed or cover all transitive dependencies. [3] [4] [5] [6] [7] [8] [9]

The v2.6.0 disagreement is useful: different reviewers can reasonably classify the same domain change differently when the affected-boundary test map is incomplete. A Standard path would need an operational decision rule for that ambiguity. The sample does not demonstrate a reliably distinguishable middle category.


At the release-bundle level, the conclusion survives narrowing the cohort: excluding transitional v2.4.6 leaves five clear Full plus the same borderline case; October alone has four clear Full bundles. This reduces the chance that pre-opening construction work drives the recommendation. It does not establish the optimal path count for future releases. [4] [5] [6] [7] [8] [9] [19]

## What the later record adds
The incident digest separates product defects, test-fixture failures, staging identity failures, retries and post-deployment observability failures. They are not pooled into a defect rate. [20]

- The recorded stale-staging-traffic incident shows why candidate identity must be checked even when a deploy job is green. This directly supports A's evidence/revision work, independently of B. [2] [20]
- The 2.6.3 API fixture failure record includes failures already present before that release delta; it does not establish 37 production regressions. Passing-on-retry composition tests are separate instability. A candidate must expose both outcomes; a selected lane cannot erase known failures. [20]
- Later-discovered defects cannot be reliably attributed to the immediately preceding version merely from the report date. No defect-free rate, escape rate or safe targeted-test counterfactual can be calculated from this registry. These incidents do not determine the nature-based path labels. [20]

## Recommendations and open questions
The original empirical recommendation is to avoid speculative three-path machinery: this sample does not validate three operational categories. Patrice’s later workflow clarification adds a post-closure cumulative-delta assessment and release/path-or-wait recommendation to the desired architecture. A executes only on release go; exact path rules and reduced coverage still require explicit adoption. The A pilot can inform actual delivery effort without assuming historical build/test timing was comparable.

If reopened, test a complete-versus-bounded-cumulative-delta distinction first. Add Standard only when actual candidates repeatedly need it and independent reviewers can agree on its boundaries at a tolerable cost. This is a recommendation with medium confidence, not authorization to activate either exception. The desired post-closure release recommendation can operate with full verification until reduced-path rules are adopted; it does not itself authorize release.

Still unknown: exact opening date/majority adoption; completeness of incident reporting; runtime of targeted suites; net time after A overlap and human work; classification agreement and maintenance cost; whether future batches will be smaller. New authorized release measurements and a prospective shadow assessment would answer the latter questions. No PostHog query, production mutation, CI rerun, runtime test execution or release-policy activation occurred.

## Methodology note
One researcher classified complete tag-to-tag deltas using candidate-time code, tests and configuration before reading later incidents. The frozen result is in `digests/exante-r1.md`, backed by `imports/exante-sources.md`. A second researcher assembled opening/incident chronology independently. A verifier checked selected classification predicates. Patrice then clarified that historical build/release/test mechanics were still changing; duration comparisons were excluded from the study. Historical CI/incident material acquired earlier is retained only as context, not as evidence of path suitability or savings. This limits hindsight bias; it cannot remove it entirely because the study is retrospective and the proposed policy was formulated later.

The classification matrix applies to complete delivered bundles. The bounded-change examples are a selected, non-exhaustive set, not a count of independently shipped targeted releases.

## Source appendix
All sources retrieved 2026-10-23. Publisher for all rows is the HatCast repository owner/GitHub primary project record; there is no independent operational publisher. Confidence denotes source fidelity, not proof that a hypothetical lane is safe. Detailed snapshots live in `imports/`; classifications and verification in `digests/`.

| Ref | Claim/finding supported | Publisher/source | Publication date | Accessed | Confidence |
| --- | --- | --- | --- | --- | --- |
| [1] | Blocking V1 cutover configured, not adoption | [HatCast commit bb07b521](https://github.com/plamarque/hatcast/commit/bb07b52104067e4955ef16751a0f595018abd779) | 2026-07-12 | 2026-10-23 | Medium; configuration only |
| [2] | Recorded mid-September use and staging traffic incident | [Historical issue registry](https://github.com/plamarque/hatcast/blob/aaf7dbb4/ISSUES.md) | 2026-09-17 | 2026-10-23 | Medium; historical testimony |
| [3] | v2.4.6 full delivered delta | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.4.5...v2.4.6) | 2026-09-15–16 | 2026-10-23 | Medium; primary code |
| [4] | v2.5.0 full delivered delta | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.4.6...v2.5.0) | 2026-09-19 | 2026-10-23 | Medium; primary code |
| [5] | v2.6.0 scope/privacy classification uncertainty | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.5.0...v2.6.0) | 2026-09-29 | 2026-10-23 | Medium; interpretation uncertain |
| [6] | v2.6.1 bundle versus isolated cancel repair | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.6.0...v2.6.1) | 2026-10-13–14 | 2026-10-23 | Medium; primary code |
| [7] | v2.6.2 destructive and external-effect scope | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.6.1...v2.6.2) | 2026-10-16 | 2026-10-23 | Medium; primary code |
| [8] | v2.6.3 SDK/build/lifecycle scope | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.6.2...v2.6.3) | 2026-10-18 | 2026-10-23 | Medium; primary code |
| [9] | v2.7.0 PWA/recovery scope and isolated unlock repair | [Git comparison](https://github.com/plamarque/hatcast/compare/v2.6.3...v2.7.0) | 2026-10-23 | 2026-10-23 | Medium; primary code |
| [19] | Stable publication corpus and dates | [GitHub Releases collection](https://api.github.com/repos/plamarque/hatcast/releases?per_page=30) | 2026-06–10 | 2026-10-23 | Medium; publication is not adoption |
| [21] | Bounded unavailable-name rendering correction | [Commit 9bdceadb](https://github.com/plamarque/hatcast/commit/9bdceadb09ecffcc11c079dfee14bd1bbeaefa30) | 2026-09-28 | 2026-10-23 | Medium; primary code |
| [22] | Bounded mobile chart template correction | [Commit aa89f644](https://github.com/plamarque/hatcast/commit/aa89f644c44e613f431f703366805cd5de79c196) | 2026-09-29 | 2026-10-23 | Medium; primary code |
| [23] | Existing PR cadence intent, exact-head attestation and absence of production action in controller | [Review decision controller](https://github.com/plamarque/hatcast/blob/6a5b8a8a972da9558e8cf587eaa22f7ef2b080d9/scripts/v2/github_review_decision_controller.py) | At baseline 2026-10-23 | 2026-10-23 | Medium; code inspection |
| [20] | Later incident, fixture and retry records | [Issue registry at research baseline](https://github.com/plamarque/hatcast/blob/6a5b8a8a972da9558e8cf587eaa22f7ef2b080d9/ISSUES.md) | Through 2026-10-23 | 2026-10-23 | Medium; incomplete historical testimony |

## Staleness map
Historical snapshots do not expire as records of these versions. Their relevance to future path selection does: recompute the nature-of-change corpus and classification comparison after the A pilot, before reopening B, or if release batching/test architecture changes. The mechanical relevance windows in `staleness.json` give an earliest relevance review of 2026-11-23; reassess sooner after the A pilot or a changed release pattern. These windows do not set a proof-expiry or release-acceptance policy.


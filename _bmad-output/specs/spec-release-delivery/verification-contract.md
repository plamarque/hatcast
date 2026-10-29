# Candidate verification contract

Evidence semantics and observable acceptance cases are fixed here. The validated architecture spine defines the target candidate-linked record and Actions evidence. A subsequent accepted decision places one record per release on one shared dedicated Git branch, separate from v2 and staging-v2; the branch name, record format, retention/expiry and enforcement mechanisms remain open.

## Release boundary

Story closure/integration and assessment do not start release work. After explicit release go, final code, version and approved notes form the candidate validated by the selected path. Refusal leaves all pending changes for reassessment and local E2E available/recommended on demand. Story checks and integration-triggered CI remain separate.

Two explicit authorizations apply: go release starts candidate preparation and the disclosed verification path; after results and Patrice's staging acceptance, go prod authorizes production promotion. Reuse still-valid verification; the second authorization does not itself trigger another full campaign. Notes approval remains distinct. Technical orchestration remains Q-5.

A merge onto v2 must not interrupt an in-progress release. Continue on the selected candidate; later merges remain pending for the next release assessment. All-or-nothing applies to the cumulative delta selected for that candidate. A branch-tip change alone neither replaces staging nor cancels deferred checks; cancellation concerns an actual newer authorized staging deployment. The target freezes final commit, version and RC after release go and notes approval; publication and concurrency enforcement remain Q-5.

## Evidence meaning — CAP-1, CAP-8

For each required control, the release proposal distinguishes what automated assertions actually demonstrate from remaining human staging verification. Green CI does not replace human acceptance or prove persisted business outcomes that were not asserted. Implementation of the two paths need not wait for complete automation; required verification still follows adopted criticality/outcome rules. Existing staging availability persistence skips and composition display-only branches require this distinction.

| Evidence | Required meaning |
| --- | --- |
| Baseline/candidate | Actually served production, full pending delta, candidate SHA/version/RC, distinct staging/prod image and environment identities |
| Scope | Verification contract/workflow, selected assertions/projects, environment/path rationale; blocking/deferred/omitted coverage |
| Relevant inputs | Code, dependencies, configuration and test/fixture identifiers sufficient to detect invalid reuse; no secrets |
| Outcomes | First attempts, retries, skips, failed/blocked/waived results, reasons/authority; cancelled runs retain completed observations |
| Human observations | Candidate/revision, safe role/fixture, actions, persisted expected/actual result, relevant responsive/device scope and mutation/cleanup |
| Validity/timing | Creation, validity and invalidation inputs; gate execution and waits separately, no invented expiry |
| Delivery/recovery | Git refs, Release, build/image, deploy and observability separately; recovery target and partial effects visible |

Pass means executed assertions only. Skips, warnings, missing fixtures, retry-only success and cancellation cannot establish full clean coverage. Waiver is a disposition, not a pass. Q-1/Q-3 determine effective proof authority/validity and acceptance.

A failure attributable to flakiness, fixture or environment does not systematically fail the release. It remains blocking when it prevents verification of the critical path linked to the cumulative release changes, including affected neighbors. Outside that path, continuation is possible with the diagnosed cause, missing coverage and residual risk explicit; retain the failure without calling it a pass. Product defects and unexplained failures cannot simply be classified as flaky. If change-related verification fails then passes on rerun without an identified cause, present both results, analysis and residual risk and ask Patrice whether he accepts proceeding. Neither automatic validation nor automatic abandonment applies; explicit acceptance is not a clean pass. Exact retry mechanics remain Q-3.

Skipped or unexecuted verification linked to cumulative release changes or affected neighbors must be obtained before delivery. Outside that perimeter, such tests may be nonblocking with justification and missing coverage visible in the release proposal. Skipped or unexecuted never means passed.

### Reuse procedure — adopted principle

The release proposal discloses the selected path, blocking checks, deferred checks and any accepted verification gaps. Patrice's explicit go release applies to that disclosed scope. Submit any newly discovered verification gap outside the announced scope to Patrice before proceeding. Production promotion still requires the distinct go prod.

Automated results remain in GitHub Actions; do not copy reports into the repository. Retrieve the selected path's required checks for the exact candidate, reuse valid successes, run missing/incomplete checks and diagnose failures before necessary reruns. A rerun may need its group/setup and dependent verification, not only the failed case. Record original failures and subsequent outcomes.

If code or relevant conditions change, reassess affected verification rather than carrying old green results forward automatically. H2 does not replace staging; replacing staging removes attribution to its old target. The target record retains human observations and decisions on the shared dedicated branch; its format, report/query details, atomic updates and retention/validity remain Q-1/Q-3 implementation questions. The branch alone is not a lock or gate. No report repository is required.

## A: complete-coverage baseline — CAP-2, CAP-3, CAP-4

Both paths require staging identity/version, API health, PWA loading and C1 (sign in, home, open a current event). Targeted requires C2 (availability), C3 (organizer composition), C4 (member state/confirmation) and C5 (notification destination) when affected by the cumulative delta or its neighbors; Complete requires C1–C5 systematically. Both require changed/neighbor business scenarios, including persisted results where relevant. Technical health/C1 alone is insufficient. Existing outcome and safe-fixture dispositions apply; exact automated selectors remain Q-2.

| Retained on final candidate | Permitted optimization | Invalid substitution |
| --- | --- | --- |
| Full CI T1 | Reuse matching valid proof; remove mandatory local release reruns | Missing/stale/other-candidate/targeted CI called complete |
| Actual staging build/T2 | Build/test overlap; deploy after required successes | H2/mock-auth/ng serve called packaging/cloud proof |
| C1–C5 plus delta human smoke | Reuse attributable persisted results while valid | Green job or modal visibility called full human verification |
| Read-only prod observations | Confirm served version/revision and reachability | Tag or deploy job alone called verified delivery |

B changes only adopted blocking scope (risk-policy.md). Required API/compatibility/device checks remain required by governing scope. Independent workflows are not necessarily deployment gates merely because they exist, and need not all run serially.

CI is the T1 reference, local E2E on demand. local-ci-parity.md is historical discovery, not execution proof. Losing mandatory workstation/runner diversity and repeated sampling is accepted; CI workers/retries differ and their disposition remains Q-3.

Reuse requires the exact candidate and compatible scope, dependencies, test contract, relevant configuration and fixtures. Required detail must remain accessible and relevant conditions unchanged; staging additionally requires attributable served revision and occupancy continuity throughout verification. Validity is condition-based, without an arbitrary uniform expiry; if it cannot be established, obtain new proof. Relevant changes invalidate affected results; do not relabel evidence or rely on ancestry. Metadata changes can invalidate artifact proof.

Future release evidence uses the GitHub Actions default 90-day retention, subject to verification of the actual repository setting and individual artifact overrides. The durable record preserves candidate, checks, outcomes, gaps, human observations and decisions with Actions links, without copying full reports. If required selected-path proof is missing or inaccessible, fall back to Complete; its required proof must still be obtained under the adopted outcome rules. Missing evidence is never a pass. Retention controls availability, not automatic validity.

The controller reliably correlates each run it launches to its request, retrieves its identity and URL automatically, verifies candidate, workflow, attempt, executed selection and relevant inputs, and records outcomes. It may find existing runs for the exact candidate, but must not guess among ambiguous matches. The correlation mechanism and access must be verified. Human observations and decisions are recorded in the release record; supporting links are included when available.

For record updates the controller reads the shared branch state and pushes a commit based on that state without force. A concurrent advance rejects the update; reread before retrying, and submit conflicting decisions for renewed human resolution. This protects record updates only: staging exclusion and deployment enforcement remain Q-5.

Compatible caches preserve browser/version, scenarios/assertions and artifact inputs. Build and tests may overlap, never speculative deploy before required success. Cache gains are unmeasured. Production keeps its environment-specific separate build.

## Deferred staging checks and preemption

Declared deferred staging-compatible checks may start automatically after blocking verification is complete, while awaiting go prod, then continue during and after MEP on the same staging candidate with safe fixtures. Their completion is not required to start promotion. A failure discovered before MEP is presented for decision under adopted criticality rules; afterwards diagnosis and Patrice decision apply without automatic rollback. These checks are distinct from T1/H2 and production observations; Q-2/Q-4 specify assertions and the technical launch mechanism.

A newer authorized staging candidate cancels old queued/running deferred checks without waiting for suite completion. Stop old owned test/fixture operations before target replacement. Cleanup is confined to owned processes/data and must not affect the new run. Retain superseding candidate, completed observations, known failures and remaining incomplete coverage. Reject late/mixed-target proof. No complete pass is inherited, and no old run silently resumes against the new version.

An attributable failure needs expected/actual result, reproduction, version identity and likely impact; distinguish product/test/fixture/environment/inconclusive. Patrice decides the response after diagnosis/recommendation; no automatic rollback or unjustified weakening of tests.

Production is not a functional-test target. After deploy/recovery, confirm identity/reachability read-only, without business journeys or data writes.

## Promotion and recovery

If a second release needs shared staging while the first remains in progress before production, ask Patrice which release to pursue before replacing the current candidate. No automatic priority or abandonment is adopted. This is separate from automatic preemption of deferred-only checks after delivery and does not change the no-interruption rule for v2 merges.

After a build, publication or deployment failure, establish what actually completed and which version is really served before resuming the same selected candidate from the last safe point. Reuse still-valid verification without including later v2 merges. If code correction is needed, reassess the candidate and affected verification. Exact safe-resume mechanisms remain Q-5; this rule grants no new production mutation authority.

Verify current staging still serves the candidate and required evidence is valid at promotion. Preserve immutable refs and distinguish partial branch/tag push, Release publication, image build, deploy and observability outcomes. Retries cannot silently select newer v2 work; Q-5 fixes the safe mechanism.

Prepare a known recovery target and limits: traffic reversion does not reverse incompatible data changes, sent notifications or old PWA JavaScript. No tag rewriting, automatic rollback or new production mutation authority.

## Acceptance cases

| Case | Required result |
| --- | --- |
| Different candidate/inputs or inadequate scope | Reject reuse and identify missing current proof |
| Full valid CI, no local release proof | No mandatory local rerun; retain other required checks |
| Local green, required CI absent | Require current selected CI; no substitution |
| Build or required tests red | No staging deployment |
| Final version/notes changed after validation | Invalidate affected results and validate final artifacts |
| Waiting followed by another story | Reassess all cumulative changes/interactions |
| Latest fix bounded, other pending work broad | Complete for whole candidate or wait; no extraction |
| New staging candidate during deferred checks | Cancel old run, retain partial/failed observations, fence old mutations, reject late proof |
| Missing fixture, retry-only success or skipped assertion | Preserve exact outcome and enforce adopted disposition |
| Deferred failure | Diagnose and let Patrice decide; no automatic rollback |
| Deploy successful, PostHog job failed | Distinguish delivery and observability |
| Cache/input mismatch | Invalidate; no equivalence claim |

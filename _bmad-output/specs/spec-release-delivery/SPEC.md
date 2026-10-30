---
id: SPEC-release-delivery
status: planning-contract
retired_capabilities: [CAP-7]
companions:
  - ARCHITECTURE-SPINE.md
  - verification-contract.md
  - risk-policy.md
  - brownfield.md
  - architecture-diagrams.md
  - local-ci-parity.md
  - release-paths-discussion.md
  - release-paths-discussion.fr.md
  - ../../../AGENTS.md
  - ../../../ARCH.md
  - ../../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md
  - ../../../docs/v2/technical/RELEASE_CHAIN_AUDIT_2026-10-23.md
  - ../../../.agents/skills/hatcast-v2-release/SKILL.md
  - ../../../.agents/skills/hatcast-v2-release/references/staging-smoke-contract.md
sources: []
---

> **Canonical target contract.** This spec and its companions consolidate accepted requirements and the validated target architecture in ARCHITECTURE-SPINE.md (AD-1–AD-7). Unresolved implementation choices are not invented or activated. Existing scripts and release authorities still apply. The root product specification is unchanged.

# HatCast V2 release delivery

## Why

The operator needs faster evolutionary-maintenance releases without treating every change as equally broad. The target removes repeated release work, evaluates the complete pending delta after story integration, and proposes an explainable Targeted or Complete path. Waiting deliberately accumulates changes for the next assessment.

## Capabilities

- **CAP-1**
  - **intent:** The operator can identify a delivery candidate and the evidence that actually covers it.
  - **success:** Served production baseline, entire pending delta, candidate SHA/version/RC, separate staging/prod image identities, scope, relevant inputs and outcomes are inspectable; stale, insufficient or other-candidate evidence is rejected.
- **CAP-2**
  - **intent:** The final candidate can receive validation without another staging cycle solely for release metadata.
  - **success:** Code, version and approved notes are present during the selected blocking verification and human staging checks; evidence identifies that final candidate.
- **CAP-3**
  - **intent:** The operator can reuse valid candidate verification rather than repeat it at promotion.
  - **success:** CI is the release T1 reference; local E2E is on demand. Reuse requires matching scope, candidate and relevant inputs with defined validity; missing required CI proof is not silently replaced by local success.
- **CAP-4**
  - **intent:** Required verification and artifact preparation can complete efficiently.
  - **success:** Build and tests may overlap, but staging deployment waits for required successes; compatible caches preserve test/browser scope and artifact inputs.
- **CAP-5**
  - **intent:** The operator can inspect a justified impact assessment of all unreleased changes.
  - **success:** Cumulative interactions, callers, roles, data, contracts and external/operational effects are assessed. Targeted requires every adopted eligibility condition to be demonstrated; false or unknown conditions select Complete.
- **CAP-6**
  - **intent:** The operator can select Targeted or Complete with explicit verification scope and residual risk.
  - **success:** Blocking, deferred and deliberately omitted coverage are distinguished; selection cannot hide required failures. Optional deferred tests may start automatically on staging after blocking checks while awaiting go prod, continue during/after MEP, are cancellable by a newer staging candidate, and never imply automatic rollback.
- **CAP-8**
  - **intent:** The operator can promote or recover a candidate with identifiable outcomes and explicit authority.
  - **success:** Current staging identity and evidence are checked; Git/tag/Release/build/deploy/observability outcomes remain distinct. Read-only production observations confirm served identity/reachability; a recovery target and its limits are identified.
- **CAP-9**
  - **intent:** The operator can distinguish actual delivery gains from reduced coverage and incidental delays.
  - **success:** Gate execution, runner/human waits, retries/skips, cancellations, incidents and recovery are recorded separately. Historical build/test durations do not establish B gains; future measurements do not sum parallel work or promise unmeasured savings.
- **CAP-10**
  - **intent:** After requested story closure integrates into v2, the operator receives a release/path-or-wait recommendation.
  - **success:** The proposal covers all pending changes since actually served production. Explicit release go alone starts release work; refusal retains the whole pending delta and leaves local E2E recommended on demand.

CAP-7 is retired: isolated correction delivery is excluded. Its ID is not reused.

## Constraints

- **All or nothing:** deliver the complete evaluated v2 delta or wait. Later merges do not interrupt or alter an in-progress release: they remain pending for the next candidate. No selective release cherry-pick, isolated production-based correction candidate or associated reintegration route.
- **A and B:** A is the optimized delivery mechanism, started only after release go. Its Complete baseline retains full CI T1, actual staging T2, C1–C5 plus delta and read-only production delivery observations. B selects declared verification scope; two categories and their semantic boundary are adopted, while exact operational rules remain open.
- **Targeted eligibility:** bounded cumulative behavior, unchanged sensitive contracts/rules, known and covered callers/interactions, credible tests/safe staging/detection/recovery, and no cross-cutting or external change. Otherwise use Complete. Bug/feature labels, urgency and line count do not establish low impact.
- Both paths require staging version/API health/PWA loading and human C1. Targeted requires C2–C5 when affected; Complete requires C1–C5. Both require changed/neighbor business verification. State what automation demonstrates and what remains human; total automation is not a prerequisite.
- Diagnosed flaky/fixture/environment failures and skipped/unexecuted checks outside the changed/neighbor critical perimeter may be nonblocking with disclosed missing coverage. Critical verification must be obtained before delivery. Keep outcomes visible; unknown failure is not presumed flaky. Go release covers the disclosed path, blocking/deferred checks and accepted gaps; new gaps require Patrice decision.
- H2/mock-auth T1 cannot replace actual staging. Green jobs, skipped assertions or visible modals are not proof of persisted business results. Required API and risk-specific checks remain required by scope.
- Production serves users, not functional test journeys. Optional deferred tests run only on staging with compatible assertions and safe fixtures; they may start automatically after blocking checks while awaiting go prod and continue during/after MEP without delaying its launch. Failure requires product/test/fixture/environment diagnosis and Patrice decision, not automatic rollback or unjustified test weakening.
- A newer authorized staging candidate cancels old deferred runs without waiting for suite completion. Stop owned operations before switching target; retain partial results and known failures, mark remaining coverage cancelled/incomplete, reject late/mixed-target proof and validate the new candidate independently.
- Candidate, proof scope, verification contract and relevant inputs must agree. Relevant changes invalidate affected evidence; ancestry alone is insufficient.
- Evidence validity is based on attributable conditions, not an arbitrary uniform expiry: required detail must remain accessible and relevant inputs unchanged. Staging proof additionally requires attribution and continuity of the served revision and occupancy throughout verification; when validity cannot be established, obtain new proof.
- Use the GitHub Actions default 90-day retention for future release evidence, subject to verification of the actual setting and artifact overrides. If required selected-path evidence is missing or inaccessible, fall back to Complete and obtain its required proof under the adopted outcome rules; missing evidence never counts as a pass. Retention determines availability, not proof validity.
- The controller automatically correlates launched Actions runs to requests and records verified identities and links; existing runs are matched without guessing. Record updates use non-forced Git updates based on the previously read branch state; concurrent advances are rejected and conflicting decisions require renewed human resolution. This alone does not enforce staging exclusion or deployment gates.
- After build/publication/deploy failure, establish actual completed effects and served version, then resume the same candidate from the last safe point with valid proof reuse. Code correction requires candidate/affected-verification reassessment.
- Final metadata is validated with the candidate. Staging and production retain separate builds/images; successful staging does not establish an identical production digest.
- Story approval and notes approval remain distinct from release authorization. Go release starts preparation and the disclosed verification path; after results and Patrice's staging acceptance, distinct go prod authorizes production promotion, reusing still-valid checks without automatically repeating a full campaign. Reuse Epic 21 concepts without turning story evidence into release/prod approval. Existing integration CI and story checks remain separate from release work.
- No implementation, policy activation, push/tag/deployment or destructive operation is authorized by this spec. Preserve secrets, safe fixtures and unrelated process/worktree boundaries.

## Non-goals

- A third Standard path or isolated hotfix delivery.
- A staging reservation through deferred-suite completion, mandatory complete H2 regression after delivery, automatic rollback, or functional tests on production.
- Single-digest promotion/configuration redesign, removal of staging, blanket workflow skipping or blind sharding.
- Product/business-rule changes, rewritten release tags, routine PostHog analysis or changes to Epic 21 integration approval.

## Success signal

After integration, the operator receives a cumulative release/path-or-wait proposal; refusing performs no release work. An authorized final candidate is validated in one staging cycle with valid required CI evidence and no mandatory duplicate local release E2E. New staging candidates preempt deferred checks without false success or waiting for suite completion; failures remain diagnosable and human-decided.

## Open Questions

Behavior adopted above and in companions is not reopened by these implementation questions.

- **Q-1 — evidence mechanics:** Use one shared dedicated Git branch for candidate-linked records, one file per release; automated reports remain in Actions with the intended default 90-day retention. Verify actual repository settings and artifact overrides; implement exact-candidate lookup, adopted condition-based validity, report availability and effective external enforcement. The branch name, record format, permissions and atomic update mechanism remain open; a branch alone is not a lock or gate. No report repository is required.
- **Q-2 — executable selection:** Map adopted common controls, impact-based C2–C5 and changed/neighbor scenarios to test IDs, actual assertions and safe fixtures; distinguish automated versus human coverage and declared deferred/omitted scope.
- **Q-3 — outcome implementation:** Apply adopted critical/noncritical and disclosure rules to actual retry/skip/fixture statuses, including existing gaps; for unexplained failure followed by retry success on change-related verification, present both results, analysis and residual risk and ask Patrice whether to proceed; no automatic validation or abandonment. No retry quota or blanket exception is adopted.
- **Q-4 — deferred execution:** Implement separate candidate-bound Actions runs and the adopted early staging start and preemption policy: exact scenarios, launch/cancellation, owned-fixture cleanup, late-result rejection and diagnostic handoff.
- **Q-5 — candidate/recovery:** When release candidates compete for staging before the first reaches production, ask Patrice which to pursue before replacing the current candidate; no automatic priority or abandonment. Implement the final commit/version/RC freeze and design go release/go prod orchestration, concurrency, metadata/ref publication and same-candidate recovery from actual partial effects.

# Brownfield boundaries and measurement

## Existing boundaries to preserve

The adopted audit retains the detailed current architecture, three diagrams, run/job evidence and limitations. Its combined proposed after-diagram includes optional local/CI reduction. Contract A in this package uses the later explicit equivalent-coverage clarification: one complete local proof AND complete CI T1 remain required. Audit options are not blanket requirements or activated exceptions.

| Owning surface | Existing responsibility / relevance |
|---|---|
| `scripts/deploy_staging.sh` / `scripts/v2/promote-to-staging.sh` | Current local preflight, development merge and staging push |
| `scripts/release_version.sh` / `scripts/v2/release-staging.sh` | Version, notes/changelog, RC and artifact sync; currently another staging push |
| `scripts/deploy_prod.sh` / `scripts/v2/promote-tag-to-prod.sh` | RC/tag lineage and prod publication; current local E2E does not select the RC checkout |
| `.github/workflows/e2e-smoke.yml` / `apps/web/playwright.config.ts` | Named smoke runs complete selected-project suite by default; H2, mocked auth, ng serve |
| `.github/workflows/deploy-v2-cloud-run.yml` / `Dockerfile` | Staging T1 dependency, environment-specific images, deploy, E1 and separate post-prod observability |
| `.github/workflows/e1-preprod-gate.yml` | Real staging/Neon; fixture-dependent skips; mutable target identity |
| Release skill and staging-smoke contract | Notes/RC/prod authority and C1–C5 persisted human outcomes |
| Epic 21 and story controllers | Story-level readiness, targeted evidence, smoke and integration; reusable concepts do not confer release approval |

The governance changes must remain coherent across scripts, workflows, runbook, release skill and smoke contract. Existing product specification/domain behavior is not expanded. Implementation follows the repository's dedicated story worktree/tracking lifecycle; this package does not create story keys or regenerate a tracker.

## Known evidence limits

- T1's H2/mock-auth/disabled-CSRF environment differs from deployed T2.
- T2 logs show 34 passed / 2 skipped in examined jobs. E1-MEM-031/032 omit staging persistence writes; E1-ORG-001–002 can return after visibility. Missing Malice can skip all Playwright with a warning. Human persisted C2/C3 remain distinct proof.
- CI retries can yield success without a clean first attempt (BUG-038). LIMIT-011/012 record repetition/provenance limits; existing issue descriptions remain authoritative.
- Autonomous API/build workflows are not mechanically required by the staging deploy's dependency graph merely because they exist.
- GitHub protections/IAM effectiveness and exact local/human durations were not verified. A repository preflight must not claim global enforcement without checking external controls.
- Tags/ancestry alone do not attest CI/T2/human outcomes. Cloud Run revision drift must be handled explicitly.
- Production is rebuilt using production frontend configuration and channel metadata. Same SHA is not an identical digest.
- Migration golden gate is manual and V1 Firebase workflows are outside the ordinary automatic V2 chain.
- PostHog lifecycle reporting can fail after a successful deployment. Distinguish delivery, observability and ordinary read-only prod verification; do not add routine PostHog analysis.

## Expected gains and accepted costs — CAP-9

| Change | Evidence-backed expectation | Limit / cost |
|---|---|---|
| Avoid metadata-only staging cycle | Approximately 13–15 active minutes for a cycle in the audit; two actual 23 October runs total 13:47 and 22:18 | Second includes 8:01 Chromium preparation, not recurring test cost; discard intermediate-state validation and repeated flaky sampling |
| Reuse same-candidate complete local proof | One local execution avoided | Local duration unmeasured; later resampling and configuration drift controlled by Q-1 |
| Overlap build/tests | About three minutes may overlap in sampled staging jobs | Wasted build if tests fail; not additive to every other gain |
| Cache preparation | Potentially lower preparation time/variance | No measured gain promised; identity, maintenance and cold/warm correctness costs |
| Fast lane | Exploratory 10–15 minutes candidate-ready to verified prod | Reduced blocking coverage; unknown human waiting must be measured/reported separately |
| Standard lane | Exploratory 15–25 minutes with the same measurement boundary | Outside-domain coverage reduced; dependency mapping risk |

Do not turn these values into a delivery SLO without measurement and adoption. Decision-to-prod also includes correction/preparation, notes and human waits; CI runs alone do not establish it. Parallel v2 workflows save compute if deduplicated, not necessarily elapsed delivery time.

Record decision, candidate-ready, each gate execution and wait, runner availability, local preparation, staging available, human approvals, production traffic and final verification. Report elapsed critical path and runner consumption separately; track first-attempt/retry/skip counts, escaped defects, deployment failures and rollbacks. Short pilots cannot establish statistical absence of regressions.

## Deliberately separate options

Single-digest promotion requires a configuration/channel/PWA decision outside this scope. General local-to-CI substitution is outside contract A. Blanket path-based skipping of dev sync workflows and blind worker/shard increases are not authorized optimizations; fixtures and serial/shared-state tests make gains uncertain.

Rollback limits include incompatible schema/data changes, notifications already sent and PWA clients holding older JavaScript. A claimed low blast radius needs credible detectability and recovery, not merely a previous Cloud Run revision.

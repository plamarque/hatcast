# Existing boundaries and evidence limits

The specification describes a target, not current runtime. Scripts/workflows are unchanged and no release is authorized. Scheduling, implementation order and pilot rollout remain in PLAN.md.

## Owning surfaces

| Surface | Existing responsibility relevant to this change |
| --- | --- |
| scripts/deploy_staging.sh; scripts/v2/promote-to-staging.sh | Local preflight and v2-to-staging promotion |
| scripts/release_version.sh; scripts/v2/release-staging.sh | Version/notes/RC publication and dev artifact sync |
| scripts/deploy_prod.sh; scripts/v2/promote-tag-to-prod.sh | RC/tag lineage and prod publication; local E2E does not explicitly select RC checkout |
| .github/workflows/e2e-smoke.yml; apps/web/playwright.config.ts | T1 H2/mock-auth/ng serve and shared local/CI selection |
| .github/workflows/deploy-v2-cloud-run.yml; Dockerfile | Environment-specific build/deploy, staging T1/T2, separate post-prod observability |
| .github/workflows/e1-preprod-gate.yml | Actual staging URL/Neon, fixture-dependent E1 and separate concurrency |
| Release skill and staging-smoke contract | Existing authorities, safe fixtures and persisted human C1–C5 |
| Epic 21/controllers | Story readiness/evidence/smoke and exact-PR-head review intent, not release/prod approval |

Reuse Epic 21 concepts after scope assessment, without treating story approval or batch/release-now intent as release proof. Integration CI is separate from release work. No product/domain change, secret exposure or unrelated worktree/process cleanup.

## Evidence behind the decisions

- local-ci-parity.md records inspection at 6a5b8a8a: identical selected 110 cases/18 projects in default local/CI discovery, including four declared migration skips. Discovery is not execution; this does not prove identical conditions or future parity.
- The [maintenance study](../../planning-artifacts/research/technical-post-opening-v2-release-paths-2026-10-23/research.md) informs nature-of-change classification, not operational policy or numerical speedup. Bounded changes inside broad bundles and an ambiguous middle case do not justify a third path. Opening/adoption timing remains uncertain.
- Audit diagrams, timings and options are historical input, not activation authority. The consolidated contract supersedes former local-AND-CI, three-path and isolated-hotfix proposals.
- Historical build/test/release durations cannot establish B gains because mechanics and suites evolved. Measure actual future execution, waits, preparation, deploy and delivery observations separately; do not sum parallel work or promise unmeasured gains. Short pilots cannot establish absence of regressions.

## Runtime proof limits

- H2/mock-auth/disabled-CSRF T1 differs from packaged cloud T2.
- E1-MEM-031/032 omit staging persistence; organizer draw may stop at visibility. Green E1 does not establish all persisted human C2/C3 results.
- Missing Malice can skip Playwright with warning. Retry success differs from a clean first attempt (BUG-038); issue descriptions remain authoritative.
- API/build workflows are not necessarily staging dependencies. Ancestry/tags do not attest CI/cloud/human outcomes.
- Staging is mutable; separate existing deploy/test concurrency is not a release-wide proof contract. The target preempts deferred runs on a new candidate, without completion-long reservation.
- Prod configuration/channel metadata are rebuilt separately; same SHA is not an identical image digest.
- Migration golden T3 is manual; V1 Firebase operations are outside ordinary V2 release.
- PostHog lifecycle may fail after successful deploy. Distinguish observability; no routine ad hoc analysis.
- Effective GitHub protections/IAM, proof persistence/expiry and current cloud traffic are not established by this spec. Repository checks alone cannot claim global enforcement.
- Recovery may not undo data changes, notifications or old PWA clients.

## Normative documentation correction

BUG-DOC-002 records the former conflict between ARCH.md and the V2 runbook/workflows/audit. With Patrice's approval, ARCH.md has been corrected locally to describe the existing V2 deployment topology; the issue records that correction. This is not a fresh cloud inspection. The validated architecture spine remains a target, not a description of implemented release controls.

## Exclusions

No Standard path, extracted correction/reintegration, mandatory release-local proof, mandatory post-prod H2 suite, production business testing, reservation through deferred completion, automatic rollback/global suspension, single-digest redesign, blind sharding, blanket dev-workflow skipping or delivery SLO is implied.

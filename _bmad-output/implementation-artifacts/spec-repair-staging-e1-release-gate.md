---
title: 'Repair staging E1 release gate after production refresh'
type: 'bugfix'
created: '2026-11-17'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'f3d6638d9a72374ba22013340fb49ff76e1e02af'
context: ['ISSUES.md', 'docs/v2/technical/DEPLOYMENT_WORKFLOW.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Restore trustworthy staging release checks by identifying and fixing the causes of the E1 failures and the misleading staging health result. Preserve the real business assertions and distinguish an application defect from a test or environment defect.

## Boundaries & Constraints

**Always:** Keep release, privacy and E1 gates enabled. Test the exact configured season and verify the destination and selected event. Keep the reminder organizer a non-admin season organizer who is not an active participant; create or update only its dedicated staging fixture records. Keep mail health checks when notification email is enabled, and do not expose credentials. Confirm all changes with targeted tests and staging evidence.

**Never:** Skip failing tests, change production configuration or data, send real notifications, repurpose real accounts, or report an unverified release as ready. Production promotion remains separately authorized.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hub season | The app defaults to a different active season than the E1 fixture | Select the fixture season through the UI and assert its title, navigation and chart event | Missing or inaccessible season fails explicitly |
| Reminder organizer | No season participant exists | Create a removed participant linked to the dedicated account with `SEASON_ADMIN` removal source | Conflicting unrelated identity or duplicate rows fail without destructive reset |
| Reminder organizer | A participant already exists | Preserve its identity and mark it removed with `SEASON_ADMIN`; future membership sync keeps it removed | Other accounts and seasons remain unchanged |
| Mail health | Email notifications disabled and stale SMTP configured | Health does not fail solely on the unused SMTP service | Other health indicators remain active |
| Mail health | Email notifications enabled | Preserve existing mail health behavior | SMTP failure remains observable |

</frozen-after-approval>

## Code Map

- `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` and `apps/web/e2e/helpers/troupe-hub.ui.ts`: four failures expected 2025–2026 while the app selected 2026–2027. Select the configured season using the existing mobile switcher; preserve exact destination checks.
- `scripts/v2/e1-staging-reminder-fixture.mjs` and its tests: the bootstrap currently updates only an existing organizer participant. `SeasonParticipantMembershipSync.ensureForMembership` creates a new active row if absent but respects `SEASON_ADMIN`; make the fixture robust for absent and existing rows inside its staging transaction.
- `.github/workflows/deploy-v2-cloud-run.yml` and cloud health configuration: cloud health currently checks stale SMTP even when `HATCAST_NOTIFICATION_EMAIL_ENABLED=false`; Spring logs show SMTP authentication failure. Scope any configuration adjustment to staging, retaining production configuration and enabled-mail behavior; document the resulting health semantics.
- `apps/web/e2e/helpers/dispos-poll.ui.ts`: E1-MEM-034 was flaky once but passed on retry; investigate evidence and change it only if a concrete defect is reproduced.

## Tasks & Acceptance

**Execution:**
- [x] Add deterministic configured-season selection to the E1 hub tests and verify it in a meaningful multi-season scenario.
- [x] Make staging reminder bootstrap establish a durable removed participant whether the row exists or not; test both cases and preserve transaction guards.
- [x] Correct cloud mail-health behavior for disabled notifications, with configuration tests for enabled and disabled cases; update operational documentation and issue registry.
- [ ] Run targeted tests and prepare the change for review. After local implementation and review, the release operator will handle the previously authorized staging promotion and exact-revision E1 verification.
- [x] Investigate the retried chance-detail test separately and preserve it unless evidence justifies a targeted correction.

**Acceptance Criteria:**
- Given two active seasons and a fixture season different from the default, when the mobile E1 hub tests run, then they explicitly select the fixture season and assert correct navigation and event.
- Given a dedicated organizer with no participant row or an existing active row, when staging bootstrap runs and membership sync occurs, then the organizer is absent from the event availability summary and has only the intended season role.
- Given notification email is disabled, when unused SMTP credentials fail, then cloud health is not marked down solely by that unused dependency; given email is enabled, the SMTP health check remains enabled.
- Given the staging release gate runs, when all required tests complete successfully against the intended revision, then report results, skips and remaining manual smoke separately; otherwise report exact failures without claiming readiness.

## Implementation Notes

- Run 43962761217 attempt 2: 27 passed, five failed, one flaky, two skipped and one not run. The reminder organizer successfully authenticated and had correct permissions; its participant boundary failed.
- Production-to-staging refresh replaced the dedicated account; it was restored from the pre-refresh backup. The fixture later created an active participant through ordinary membership synchronization.
- Staging health currently returns 503 due to invalid legacy Gmail SMTP credentials. Staging email notification sending is configured disabled; the endpoint's failure does not by itself prove the application is unavailable.
- Local verification: 13 Node tests, PostgreSQL 16 participant identity scenarios, Kotlin membership synchronization/lifecycle suites and a mobile two-season browser journey passed. The PostgreSQL and Kotlin checks run separately; full staging bootstrap and E1 remain pending. The chance-detail timeout was not reproduced and its test remains unchanged.

## Spec Change Log

## Review Triage Log

- Medium, patched: duplicate season titles can hide a wrong season; the helper now resolves the configured ID and fails on ambiguous titles before selecting.
- False: participant counts are recalculated by the existing season update in the same bootstrap transaction; the code preserves this behavior.
- Medium, patched: new membership-linked rows must explicitly use `MEMBER_SYNC`; insertion and PostgreSQL assertions now do so.
- Maybe-false: concurrent membership synchronization around an absent participant could race with the fixture; the bootstrap locks the season row and unique membership constraint fails closed, but coordinated concurrent PostgreSQL execution would be needed to assess the caller's outcome. Deferred without relaxing the gate.
- Medium, patched: non-default local API settings could target a different reset endpoint; configuration now fails before any reset.
- Medium, evidence limitation: the PostgreSQL fixture test exercises the changed SQL, while application sync is covered separately; the complete staging E1 gate must prove the full chain and remains pending.
- Medium, patched: the mail-health and PostgreSQL regression tests were not in a recurring CI path; the E2E workflow now runs both.
- Medium, patched: the multi-season browser test is now also run by the E2E workflow.

## Verification

- Execute focused fixture, cloud configuration and multi-season Playwright checks, then the applicable full staging CI and E1 checks. Record exact revisions and distinguish local results from staging results.

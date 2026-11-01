---
title: 'Advent daily reminders'
type: 'feature'
created: '2026-11-01'
status: 'in-progress'
route: 'dispatch'
baseline_commit: 5b47725c685a8896fa814e3af722d2d584c5657b
review_loop_iteration: 0
context: ['_bmad-output/implementation-artifacts/25-7-invite-members-to-the-daily-quiz.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Eligible Advent players cannot opt into a daily reminder without conflating the shared Advent choice with device-specific push permission.

**Approach:** Add an Advent-only shared preference, device-aware opt-in and a best-effort daily push, preserving discovery, reveal and isolation contracts. The existing story and its storyboard are the acceptance authority.

## Boundaries & Constraints

**Always:** Check real Paris date, quiz availability, active membership, response and notification conditions at execution; deduplicate atomically per quiz and recipient. Preserve accessible Advent styling, priority revelation and cross-device preference. Isolate test data and simulated dates.

**Never:** Disclose content or results in a push, send before real opening, retry missed jobs, create a fictitious event, alter unrelated notification preferences or delete a subscription on Advent opt-out. Do not push, deploy or integrate without the lifecycle's explicit decisions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Scheduled job | Dec 1–24, after 10:00 Paris, published quiz and eligible unanswered member | At most one invitation attempt per quiz and member | No recovery or delivery guarantee |
| Ineligible | Missing quiz, inactive membership, response or disabled preference | No invitation | Recheck at execution |
| Device activation | Existing valid local subscription or permission granted | Register device if needed, then persist Advent preference | No false activation on failure |
| Different device | Shared preference enabled but device unavailable or refused | Preserve shared preference; explain local state and offer activation | Do not repeat permission requests automatically |
| Opt out | Shared preference enabled | Disable Advent preference only | Preserve subscriptions and other settings |
| Preview | Simulated date or isolated test operation | No notification and no mutation of others' invitations | Real time remains authoritative |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — membership, session and simulated-date authorization; preserve the existing journey.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` and `AdventTestAnswers.kt` — shared game lock, answer and validated catalogue; coordinate eligibility with answers.
- `services/api/src/main/kotlin/com/hatcast/api/notification/` — scheduler and push delivery; existing reminder marks require events and cannot be reused unchanged. Reserve a dedicated unique quiz/member mark atomically and commit before sending.
- `services/api/src/main/resources/db/migration/` — add compatible schema for preference and invitation marks; verify actual migration conventions.
- `apps/web/src/app/pages/advent-test/advent-test.html` and `.ts` — waiting and result surfaces, existing session headers, identity fencing and reveal flow.
- `apps/web/src/app/core/push/push-notifications.service.ts` and `UserPushSubscriptionService.kt` — existing enable and status paths mutate global push state or subscriptions; add a device-safe path and verify endpoint ownership.
- `ARCH.md`, `SPEC.md`, `DOMAIN.md` — document changed behavior and data where applicable.

## Tasks & Acceptance

**Execution:**
- [ ] `services/api/src/main/resources/db/migration/` and `services/api/src/main/kotlin/com/hatcast/api/advent/` — implement shared preference with authorized, date-protected access and durable deduplication.
- [ ] `services/api/src/main/kotlin/com/hatcast/api/notification/` — implement real-clock scheduled eligibility and push attempt, with no fictitious event or preview effect.
- [ ] `apps/web/src/app/core/push/` and `apps/web/src/app/pages/advent-test/` — implement device-aware activation and accessible checkbox on waiting and all results, preserving account and reveal boundaries.
- [ ] `services/api/src/test/`, `apps/web/src/app/`, and `apps/web/e2e/` — test matrix including concurrent reservation, real Paris boundaries, account/device errors and reveal priority.
- [ ] `ARCH.md`, `SPEC.md`, `DOMAIN.md` and story — update relevant contracts and record verification, including Material 3 and visual isolation checks.

**Acceptance Criteria:**
- Given an eligible member opens the push, when the Advent journey loads, then first discovery and any priority reveal still precede the daily quiz.
- Given mobile widths 320–430 px, tablet or enlarged text, when the checkbox is used, then controls remain accessible, readable and isolated from HatCast styling.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- Run focused API and Angular tests, build, and isolated Playwright evidence through the documented controller when readiness permits.
- Check keyboard, touch targets, responsive layout, reduced motion and visual isolation against the story and frontend checklist.

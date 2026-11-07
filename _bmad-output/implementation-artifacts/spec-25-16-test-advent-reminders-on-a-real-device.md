---
title: 'Test Advent reminders on a real device'
type: 'feature'
created: '2026-11-02'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: 'feat/25-16-test-advent-reminders-on-a-real-device'
baseline_commit: '6ad64db2681c11f433e9b89e5dc43938b797f074'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Enable an authorized operator in isolated development to send the normal Advent push immediately to their own current device using the simulated date, then inspect its appearance and opening on a real phone.

## Boundaries & Constraints

Always verify identity, membership, isolated development, test session and device ownership server-side. The action bypasses normal quiz, answer, preference and time eligibility, but cannot bypass push permission or registration. Send only to the current device; preserve HatCast subscriptions, preferences and notifications. The test must neither reserve a real daily attempt nor change shared time. Normal and test notifications share content, icon and delivery; the simulated day supplies the test destination. Preserve discovery, reveal priority and access controls. Use a generic Advent message and an Advent-specific icon, retaining existing HatCast icons for other notifications.

Never send automatically or to another account or device; never enable test mode in staging or production, deploy, or send a real notification without authorization. Record real-device evidence separately from automated results.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Authorized test | Dev test mode, own registered device, simulated day 1–24 | Explicit action attempts exactly one immediate push with that day's destination |
| Invalid target | Foreign device, unauthorized identity, inactive member or environment | Refuse without sending or modifying shared state |
| Missing permission | No valid local subscription | Explain how to enable it; no false success |
| Open notification | Day accessible | Open that day's elf subject to discovery and reveal priority |
| Unavailable day | Quiz absent or inaccessible | Open calendar and explain |
| Other dates | Simulated date outside December 1–24 | Do not silently target another day |
| Scheduled reminder | Normal eligibility | Preserve 10 h scheduling and daily deduplication; use same notification presentation |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — existing authorized test-mode and session checks; normal reminder context currently rejects test mode.
- `services/api/src/main/kotlin/com/hatcast/api/notification/AdventReminderJob.kt` and `WebPushNotificationSender.kt` — scheduled reservation, payload and sender; existing Advent sender targets every device, so introduce narrowly scoped single-device delivery without calling the job.
- `services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt` — existing device registration can transfer ownership; protect other accounts and retain HatCast subscriptions.
- `apps/web/src/app/pages/advent-test/` — test toolbar, simulated date, API headers, discovery, priority and calendar navigation. Test state is tab-local and checkbox is a preview, not an enrollment.
- `apps/web/src/custom-sw.js` — existing HatCast icon and same-origin click handling; add isolated Advent presentation. Test state must be securely re-established when a notification opens a new window.
- `_bmad-output/planning-artifacts/hatcast-avent/proposition-recette-push-reelle.md`, Advent DESIGN, EXPERIENCE and architecture AD-7 — accepted behavior and visual/privacy contracts.

## Tasks & Acceptance

**Execution:**
- [ ] `services/api/src/main/kotlin/com/hatcast/api/` — implement authenticated development-only registration and targeted test dispatch, share normal payload while preserving scheduling and isolation.
- [ ] `apps/web/src/app/pages/advent-test/` — add accessible test-bar action, handle permission/registration and delivery outcomes, route notification to the day without violating discovery or reveal priority.
- [ ] `apps/web/src/custom-sw.js` and Advent assets — apply Advent icon and safe same-origin navigation without altering HatCast pushes.
- [ ] API, Angular and service-worker tests — cover target isolation, guards, delivery, simulated date, navigation, priority and HatCast regression.
- [ ] `SPEC.md`, `ARCH.md` and Advent contracts as applicable — document changed behavior and boundaries; prepare reproducible real-device guide.

**Acceptance Criteria:**
- Given an authorized tester in isolated development, when the test action is activated for a simulated quiz day, then only the current owned device receives an immediate delivery attempt using the normal reminder presentation and day destination.
- Given any rejected identity, target or environment, when a test is requested, then no push is sent and no other account's devices or preferences are changed.
- Given an Advent push is opened, when its quiz cannot be reached, then the calendar and an explanation are offered without exposing restricted content.
- Given any HatCast push or scheduled Advent reminder, when delivered, then existing HatCast settings and daily reminder safeguards remain intact.

## Implementation Notes

Implementation and automated checks completed; real-device reception and opening remain pending. The workflow CI changes have not yet run on GitHub. PostgreSQL ownership concurrency was exercised against a disposable database with a simulated push provider.

## Spec Change Log

## Review Triage Log

- Medium, patched: a pending destination was lost on calendar failure or priority reveal; it is retained until opening or confirmed unavailability, with targeted tests.
- Medium, patched: PostgreSQL ownership concurrency coverage was absent from the Advent CI selection; the suite and its required report were added.
- Medium, patched: service-worker presentation tests were absent from CI; the Advent regression workflow now runs them.

## Verification

Run targeted API, Angular and service-worker tests; build Angular. Inspect mobile UI and record untested real-device, delivery, contrast and deployment limitations. A push-provider acceptance does not prove reception or automatic 10 h scheduling.

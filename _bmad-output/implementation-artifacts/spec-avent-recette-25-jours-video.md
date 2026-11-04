---
title: 'Advent 26-day filmed acceptance journey'
type: 'chore'
created: '2026-11-04'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The complete Advent experience needs an observable day-by-day acceptance journey with persistent user state and a video.

**Approach:** Run a Playwright journey against an isolated local application and API with fictional content, a normal member account, and the system clock read by the application and browser. Record the journey and report every verified behavior and limitation.

## Boundaries & Constraints

**Always:** Cover December 1–26 in chronological order, using an isolated disposable database and fictional accounts and quizzes. Advance the system clock by one day at a time and restore the actual time and prior automatic-time setting after the run, including on failure. Exercise correct and incorrect answers, same-day return, ranking, calendar, past played and unplayed days, and future gifts. Check delayed disclosure, result content and score against the expected rules. Capture a reviewable video and document failures with evidence. Preserve existing databases and unrelated user work. Distinguish configured notification preference from actual push delivery; never claim delivery without observing it.

**Never:** Use Advent test mode or an API clock override for the principal journey, use production data, send notifications to real members, reset shared data, or replace application/API responses with a fictional business implementation. The user explicitly authorizes changing the Mac system clock during this test; an isolated machine is an alternative. Do not claim all navigation paths were verified merely because the main journey passes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Daily quiz | Day 1–24 with fictional quiz | Opening, answer confirmation and delayed result respect the documented rules | Report actual divergence and retain video |
| Return before reveal | Answer recorded on same day | Pending screen, no correctness or points disclosed | Stop or report failure with evidence |
| Future gift | Calendar before its day | Future door remains inaccessible, including API enforcement | Report failure with date and door |
| Missed and played days | Revisit via calendar | Past history and late discovery follow documented rules | Report discrepancies |
| Day 25 | Advance to Christmas | Review screen and information follow implemented approved contract | Report missing or divergent behavior |
| Day 26 | Return after Christmas | Entry, review, calendar and ranking follow the documented post-Christmas behavior | Report missing or divergent behavior |
| Notifications | Preference enabled in isolated context | Verify feasible local preference behavior; document any unverified push scheduling or delivery | Do not infer actual delivery |

</frozen-after-approval>

## Code Map

- `apps/web/e2e/advent-member.spec.ts` — existing UI selectors and mocked component coverage; use as reference, not as end-to-end proof.
- `apps/web/playwright.config.ts` and `apps/web/e2e/` — Playwright configuration and authentication fixtures; select an isolated API profile and retain recording.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` and Advent clock/answer services — server authorization and persistence; use the ordinary member path without simulated-date headers.
- `services/api/src/main/kotlin/com/hatcast/api/notification/AdventReminderJob.kt` — scheduled push uses real clock; simulation alone does not establish delivery.
- `DEVELOPMENT.md` and `docs/v2/technical/AVENT_CATALOGUE.md` — local database and fictional catalogue setup; avoid modifying an existing persistent H2 database.
- `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md`, `DESIGN.md`, Advent architecture and `SPEC.md` — expected behavior and privacy constraints.

## Tasks & Acceptance

**Execution:**
- [ ] Inspect applicable contracts, local fixtures, and isolation controls; prepare a disposable application and fictional catalogue.
- [ ] Implement and run a Playwright journey with chronological system-clock changes, persistent answers, navigation assertions and recorded video.
- [ ] Provide the video and a concise dated evidence report, including failures and notification limitations.

**Acceptance Criteria:**
- Given an isolated normal member account with fictional content, when the 26-day scenario runs, then each exercised screen and transition is checked against the contract and the recording is preserved even on failure.
- Given a locked future day, when accessed from the calendar and directly through the API, then its content remains unavailable.
- Given recorded and missed days, when revisited later, then the appropriate result or late-play behavior and score are verified.
- Given notifications enabled, when local push delivery cannot be observed, then the report explicitly separates preference checks from delivery evidence.

## Implementation Notes

## Spec Change Log

## Review Triage Log

---
title: 'Open an Advent quiz by URL'
type: 'feature'
created: '2026-11-05'
status: 'done'
baseline_commit: 'b9b61145e80df267a3921326a6649b46b2f12c77'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An organizer cannot open a particular Advent quiz by a reusable link after updating its content.

**Approach:** Support `/avent?jour=N` for days 1–24, including alongside `preview=1`, using the existing authorized calendar journey.

## Boundaries & Constraints

**Always:** Preserve authentication, initial discovery, priority unseen results, account isolation, server authorization, preview and test-mode rules, personal answer states, and ordinary prelaunch silence. Resume the requested day after prerequisite steps if it is still authorized. Preserve notification links and other query parameters. Use fictional data for tests.

**Never:** Grant access based on URL parameters, change clocks or modes, reset answers, synchronize content, deploy, alter the global design system, or introduce a sharing interface. Day 25 keeps its existing journey.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|----------|---------------|-------------------|
| Eligible day | `jour=6`, authorized calendar | Open day 6 using the same state and rules as the calendar |
| Prerequisite | Signed out, undiscovered, or priority result | Complete authentication, discovery or each priority reveal first; then recheck access and resume |
| Preview | `preview=1&jour=6` | Preserve server-authorized private preview; denial grants nothing |
| Unavailable | Locked, missing or forbidden day | Follow existing permitted calendar behavior without disclosing protected content |
| Invalid | Missing, repeated, noninteger or outside 1–24 | Normal Advent journey without blocking error |
| Session | Reload or account switch | Re-evaluate authorization and avoid applying stale asynchronous results to another identity |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts` — `start`, `discoverCalendar`, `enterAt`, `continueAfterResult`, `openCalendar`, `openCalendarDay`; reuse the server-projected calendar and its existing state handling, not an arbitrary direct `selectDay` call. Guard identity and projection epoch.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — existing session, clock, discovery, preview, priority result, calendar and account-change fixtures.
- `apps/web/src/app/core/navigation/` and `core/member-shell/` — existing post-login redirect preserves paths and query parameters.
- `apps/web/e2e/advent-member.spec.ts` — mocked browser journeys; distinguish these from server authorization tests.
- `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md`, `DESIGN.md`, architecture AD-7 and `docs/v2/technical/FRONTEND_UI.md` — Advent behavior, visual isolation and Material checklist.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/pages/advent-test/advent-test.ts` — parse a single strict day parameter and consume the intent only after discovery and all priority reveals; load authorized calendar and route through existing day handling, including identity changes and unavailable states.
- [x] `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — verify eligible, past, played, locked, missing, malformed, duplicate, preview, discovery, repeated priority reveal, account switch and reload scenarios.
- [x] `apps/web/e2e/advent-member.spec.ts` and existing login navigation tests — verify the browser journey reaches the selected destination and query survives login, using fictional fixtures.
- [x] Relevant functional/UX contract — document the direct link and its security boundaries without changing unrelated product rules.
- [x] Check mobile, keyboard, focus and Advent visual isolation for any touched UI and document checklist exceptions.

**Acceptance Criteria:**
- Given an eligible authorized account, when a direct day link is opened or reloaded, then the corresponding case opens after all required prerequisites.
- Given a forbidden or unavailable day, when a link is opened, then no protected content is revealed and the permitted journey remains usable.
- Given a user or session change during a request, when it completes, then no stale response opens content for the new identity.

## Implementation Notes

- Direct links use the authorized calendar and preserve first discovery and unseen reveal priority. Validation recorded with local ordinary and test accounts; no deployed-environment proof.

## Spec Change Log

## Review Triage Log

- Medium: same-component day changes were not observed; fixed and tested.
- Medium: a transient day-loading failure lost the target; fixed and tested.
- Medium: history-priority interruption lacked a resume test; added.
- Verification limits: real login browser journey and deployed runtime were not separately exercised; local seed API authentication, mocked browser and human video review were performed.

## Verification

- `npm test -- --watch=false --include='**/advent-test.spec.ts'` in `apps/web` — targeted suite passes with a nonempty selection.
- Run relevant post-login tests and targeted Playwright journey; report mocked versus real API evidence separately. Verify applicable visual and accessibility checks.

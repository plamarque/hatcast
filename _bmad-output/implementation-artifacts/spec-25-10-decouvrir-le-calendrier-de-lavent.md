---
title: 'Discover the Advent calendar'
type: 'feature'
created: '2026-11-01'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '6a28ed87179bc37894bcdd4f2192b7427a490e95'
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A member enters the Advent journey without an introductory invitation or a durable record of having discovered it.

**Approach:** Present a welcoming illustrated first visit and open the personal calendar through an explicit action. Persist discovery per member across devices; retain existing entry and reveal behavior on subsequent visits.

## Boundaries & Constraints

**Always:** Use the approved story 25.10 and Advent DESIGN, EXPERIENCE, architecture AD-7 and Material 3 behavior. Retain the Advent top bar; evoke the reference's smiling elf, gift, snowy village, lights and warm panel, without numbered miniature doors. Render the slightly tilted copy and CTA as real accessible, adaptable text and controls. The exact CTA is « Découvrir mon calendrier de l’Avent ». Support mobile, tablet, desktop, zoom, keyboard, focus, contrast and reduced motion. Scope visuals to Advent; preserve identity outside it. Protect membership, server time, test modes, private content and reveal boundaries. Preserve the independent ongoing 25.8 work and coordinate its snowy-button treatment without modifying that worktree. Reconcile functional, UX and architecture contracts without rewriting completed story history.

**Never:** Record discovery merely by displaying or closing the welcome, store it only on a device, reveal protected answers or pending scores, transfer game data, or push or deploy. Do not treat unfinished 25.8 assets as a stable shared component.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| First entry | Eligible member, discovery absent | Show welcome before daily journey; explicit CTA records discovery and opens personal calendar. |
| Interrupted or failed | Close before CTA; save fails or response is uncertain | Do not claim discovery before successful persistence; offer recoverable feedback and safe idempotent retry/reconciliation. Another device reflects the persisted state. |
| Later entry | Discovery recorded | Skip welcome; preserve most recent unseen reveal priority and existing daily, absence and seasonal paths. |
| Existing player | Discovery absent but older answers or unseen result exist | Show welcome and open the calendar on CTA; do not mark a reveal seen merely by fetching it. Subsequent visits retain reveal priority. Do not expose unrevealed information. |
| Access and concurrency | Ineligible account, account/mode change, concurrent devices | Enforce existing server authorization and mode rules; avoid stale or cross-account state; repeated discovery actions are safe. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` and `AdventMemberGame.kt`: reuse authorization, mode validation, locked server time and entry projection; calendar and ranking currently return priority results, requiring deliberate handling of first discovery without a premature seen acknowledgment.
- `services/api/src/main/resources/db/migration/`: add member-scoped durable state, separate from per-day `advent_member_dismissals`; preserve game data and define isolated test/reset behavior explicitly.
- `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` and Advent API client: `start`, `enterAt`, `openCalendar`, `showResult` already handle session, priority, focus and stale responses. Add welcome and persistence while retaining these guards.
- `apps/web/src/app/shared/advent/` and `apps/web/public/advent/`: isolate visual assets and styles. Story 25.8 has an uncommitted selector-based snowy style in `advent-illustrated.scss`, not a shared component; coordinate integration and acknowledge any divergence.
- `services/api/src/test/kotlin/com/hatcast/api/advent/`, `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts`: extend existing authorization, journey and responsive coverage with fictional data and an actual backend journey.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`, Advent UX and architecture contracts: reconcile first-visit precedence and durable state with existing subsequent-visit guarantees.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/resources/db/migration/` and `services/api/src/main/kotlin/com/hatcast/api/advent/` — implement minimal authorized, idempotent member discovery persistence and first-calendar behavior, preserving privacy and existing test isolation.
- [x] `apps/web/src/app/pages/advent-test/` and `apps/web/src/app/shared/advent/` — implement the illustrated, accessible welcome, CTA, loading/error and account/mode transitions; coordinate the snowy button with 25.8.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md` and Advent DESIGN, EXPERIENCE and architecture — reconcile affected contracts and preserve completed story history.
- [x] API, Angular and browser tests — cover the matrix, including authorization, interruption, persistence across devices, retries, existing players, reveal priority, privacy, responsive and visual isolation.
- [x] Demonstrate the real first-entry → welcome → calendar → today's gift and a later entry with a reveal; compare the screen with the reference and report visual differences.

**Acceptance Criteria:**
- Given an eligible member, when the first welcome CTA succeeds, then the personal calendar opens and discovery persists across devices; later visits apply existing reveal and daily priorities.
- Given interruption, failed persistence or repeated requests, when the member returns or retries, then discovery is not falsely recorded and the action remains safe.
- Given a first visit with a pre-existing reveal, when the welcome is completed, then the calendar opens without marking the result seen; the reveal remains prioritized on a subsequent visit.
- Given 320–430 px, tablet, desktop, enlarged text, keyboard or reduced motion, when using the welcome, then content and controls remain readable, reachable and focused visibly; Advent styling does not affect HatCast.
- Given protected content or an unauthorized account, when accessing entry or discovery endpoints, then existing authorization, no-store and reveal restrictions remain effective.
- Given the Material 3 checklist, when reviewing the story, then applicable requirements are met or explicit waivers recorded.

## Implementation Notes

Discovery is member-scoped; server-issued action UUIDs make lost responses retryable for 24 real hours, with expired attempts purged. Initial calendar projection leaves a pre-existing reveal unseen. Welcome illustrations are local copies of ongoing story 25.8 assets and require reconciliation on integration.

## Spec Change Log

## Review Triage Log

- false — The elf asset was omitted from the text-only review diff, but `apps/web/public/advent/welcome-elf-v1.webp` is present as an untracked story file; it must be included at integration.
- false — The village asset was omitted from the text-only review diff, but `apps/web/public/advent/welcome-village-v1.webp` is present as an untracked story file; it must be included at integration.
- high — A stale session trapped the welcome in a retry loop; a reload action now handles the conflict and HTTP coverage verifies renewal.
- medium — Closing the welcome bypassed daily dismissal; the normal dismissal path is restored without recording discovery.
- medium — Two outstanding welcomes could send the second member device straight to a reveal; separately issued attempts now allow both initial calendar actions and are covered by a real two-context journey.
- medium — An old attempt could bypass reveal priority indefinitely; attempts now expire after 24 real hours and expired rows are purged, with boundary tests.
- medium — Concurrent first actions lacked coverage; the API and real two-context tests now exercise issued attempts.
- medium — The client retry test ignored the attempt identifier; it now checks the identifier is reused.
- medium — Forbidden simulated mode and stale-session behavior lacked HTTP coverage; focused security tests now cover both.
- medium — Image loading was not verified; the browser test now decodes both welcome illustrations.
- medium — A failed priority-result transition could hide recovery feedback; the welcome is retained until the result loads and the error remains visible.
- medium — The authenticated discovery HTTP contract lacked a positive integration test; the controller is now exercised through the authorized HTTP flow.

## Verification

Focused checks: 104 Angular tests, targeted API security and concurrency tests, six Playwright member scenarios and a real offline H2 journey passed. A fresh browser context authenticated independently, then showed the next-day simulated reveal. The final migration was applied to fresh H2; two independent sessions opened the calendar after a deliberately lost response and retry. A 320 px/200% screenshot was inspected; foreground and focus contrasts were calculated, while every rendered state was not exhaustively measured.

- Run focused backend, Angular and browser tests for the affected journeys and report actual selected tests.
- Exercise an authenticated local full-stack journey with fictional data, interruption, another device/session and a later reveal; verify responsive layouts, zoom, keyboard, reduced motion and HatCast isolation. Record any evidence limitations and reference differences.

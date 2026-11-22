---
title: 'Story 25.28: Advent bonus quizzes'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: feat/25-28-quiz-bonus-avent
baseline_commit: ddd1dc2874c920b1f5cdfbfeba417fb07f1e6ad9
context:
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-11-18-avent-bonus-quiz.md
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Extra private Advent contributions are not playable; the existing game supports only one quiz per day.

**Approach:** Support at most one surprise bonus quiz on selected days. After a recorded daily answer, invite the member to play the bonus, then use the normal acknowledgment. Operators choose assignments during deployment preparation. Céline on 7 December is an example, not authorization to synchronize content.

## Boundaries & Constraints

**Always:** Preserve current content, responses and scoring. Apply Paris time and access controls. A timely answer to either quiz earns 10 points if correct, 0 otherwise, plus 1 participation point. Every non-overlapping three consecutive correct answers earns 2 points; wrong answers reset the streak. The daily quiz precedes the bonus. Unanswered or late quizzes do not affect the streak. Results and pending points remain private until revelation, with the existing isolated test ranking exception. Resume across devices and retries without duplicate responses. Keep one calendar gift per day, colored according to the daily quiz. Apply Advent DESIGN, EXPERIENCE, AD-7 and Material 3 with isolated tokens, accessible controls and reduced motion.

**Never:** Publish private quiz material to Git, logs or public assets; synchronize or deploy a real target without explicit target-specific authorization; change existing normal quiz or game state when assigning a bonus; alter HatCast's global theme.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Normal day | No bonus | Existing journey and scores remain unchanged. |
| Bonus day | Daily answer recorded | Surprise with a short invitation and a large sparkling gift that opens the bonus quiz; then the normal acknowledgment. |
| Resume | Bonus unanswered before midnight | Return to bonus across devices; timely answer scores normally. |
| Late | Daily unanswered after its day | Play daily then surprise and bonus for pleasure, each late result immediate and worth zero. |
| Late skipped bonus | Daily played on time; bonus unanswered | Reveal daily result first, then offer bonus; its late result is immediate and worth zero. |
| Reveal | Both answered on time | Starting next Paris midnight, show daily then bonus result, each with its own character, anecdotes and points. |
| Calendar | One or both answers | One gift, with daily quiz color; offer independent access to both quiz/result states without leaking pending answers. |
| Midnight/concurrency | Retry, interrupted submission, concurrent devices | One durable answer per quiz; confirmations waiting for lock at midnight close, uncertain state can be recovered. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/resources/db/migration/V75__advent_quizzes.sql`, `V76__advent_member_answers.sql`, `V77__advent_shared_controls.sql` — day-based keys and replay state; extend compatibly without losing historical data.
- `services/api/src/main/kotlin/` — locate `AdventMemberGame.kt`, `AdventTestAnswers.kt`, `AdventMemberController.kt`, `AdventQuizEditor.kt` and `AdventOfflineFixtures.kt`; preserve locks, auth, reveal rules and replay/test isolation. `AdventRankingCalculator` currently orders only by day: make normal then bonus explicit.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `advent-calendar.scss`, `advent-result.scss`, `advent-waiting.scss` — day flow, acknowledgment, calendar and results; extend current isolated Advent presentation.
- `scripts/v2/advent-catalogue-validation.mjs`, `advent-catalogue-sync.mjs`, `advent-catalogue-local-sync.mjs` — private reserve and target-scoped promotion; maintain identity, generation and conflict protections.
- `docs/v2/technical/AVENT_CATALOGUE.md`, Advent PRD, epic, architecture, DESIGN/EXPERIENCE and normative `SPEC.md`, `DOMAIN.md`, `ARCH.md` as applicable — reconcile changed product and runtime contracts.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/resources/db/migration/` — design compatible two-quiz identity, uniqueness and migration, with a non-destructive rollback plan.
- [x] `services/api/src/main/kotlin/` — implement server-authoritative bonus availability, submission, ordered scoring, independent reveal/seen state, editing, preview, test/reset and target-safe ranking.
- [x] `scripts/v2/advent-catalogue*.mjs` — add private bonus assignment and explicit-target compare/promotion with existing protections; test unchanged ordinary days.
- [x] `apps/web/src/app/pages/advent-test/` — implement surprise screen, bonus continuation, ordered reveal and calendar access with durable state recovery and visual isolation.
- [x] `_bmad-output/planning-artifacts/` and normative docs — reconcile score, reveal, UX and architecture contracts without exposing contribution content.
- [x] Relevant backend, frontend, catalogue and E2E tests — exercise the matrix, access control, privacy, race conditions, late play and existing-game regression.

**Acceptance Criteria:**
- Given any selected day, when the normal quiz and optional bonus are played, then the matrix and approved proposal hold across reloads and devices.
- Given timely correct/wrong combinations including the third correct response, when scores and final tie-breaks are calculated, then each quiz is ordered daily then bonus and no pending score can be inferred in production.
- Given existing answers and content, when the migration and private synchronization run against an explicitly authorized isolated target, then they are preserved and at most one bonus is assigned per day.
- Given a member with assistive technology or reduced motion, when using the surprise, quiz and results, then controls are accessible, targets at least 44×44 px and the experience is usable on mobile and desktop; visual isolation from HatCast is verified.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

The theoretical maximum with N bonus days is `11 × (24 + N) + 2 × floor((24 + N) / 3)`. Patrice revised the surprise on 18 November: use a large sparkling gift as the directly clickable control, with minimal copy and a short invitation; late play explicitly earns no points. Preserve keyboard access, visible focus and reduced motion. The previous illustration and separate Jouer button are superseded. No specific real day is assigned as part of this story without separate authorization.

## Verification

- Run targeted Advent backend tests, including PostgreSQL, security, ranking, reveal, editor and offline suites, then appropriate broader Advent checks.
- Run affected frontend unit tests and targeted Playwright member/answer journeys; exercise calendar, reveal, no-bonus regression, mobile, accessibility, reduced motion and visual isolation.
- Run catalogue validation and sync tests, including generation conflicts and target identity; review migration preservation and midnight boundary behavior.
- Start the documented offline full stack from this worktree for human visual review; verify front and API before sharing its reachable URL.

Human acceptance: Patrice approved the recorded 7–9 December journey, including both results and calendar access, on 19 November 2026.

Closure checks: 243 frontend unit tests, 19 Advent browser scenarios, 91 catalogue tests and 5 isolated PostgreSQL tests passed. The broader Advent backend suite passed; the separate PostgreSQL execution had no skips. No deployment or real target synchronization was performed.

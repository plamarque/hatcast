# Sprint change proposal: Advent bonus quizzes

Status: Approved by Patrice for implementation — 18 November 2026

## Trigger and scope

Story 25.27 created a private reserve of additional contributions. Patrice proposes making selected contributions playable as surprise bonus quizzes alongside the existing daily quizzes. The first example is Céline on 7 December; this is an example, not an authorization to publish or synchronize data. At most one bonus is assigned to a day, with assignments chosen when preparing deployment. Epic 25 remains the appropriate home; no new epic or rollback is indicated.

## Confirmed product decisions

- A member answers the daily quiz first. If a bonus exists, a festive variation of the acknowledgment announces the surprise and offers **Jouer**. The bonus uses the normal quiz experience, followed by the normal acknowledgment. Its visual design still needs to be produced and reviewed.
- An unanswered bonus can be resumed before Paris midnight, including after an interruption or on another device. From the next day it remains playable once for pleasure, without points or effect on the streak. The same applies if the daily quiz is first played late; the daily quiz precedes the surprise and bonus.
- Both quizzes use the existing scoring per timely answer: 10 for a correct answer, 0 for an incorrect one, 1 for participation and 2 for each non-overlapping group of three consecutive correct answers. The bonus follows the daily quiz in the streak; an incorrect bonus resets it. A missed or late answer does not affect the streak.
- From the following Paris midnight, reveal the answered daily quiz and then the answered bonus, each with its own character, anecdotes and points. If the daily quiz was answered but the bonus was left unplayed, reveal the daily result first on return, then offer the bonus; a late bonus receives its result immediately.
- Keep one calendar gift per day. Its color follows the daily quiz; both quizzes and their respective results are accessible from that day. Existing privacy and reveal restrictions remain in force.

## Impact and proposed changes

### PRD and epic 25

- **Current FR-5:** one participation point per day and a fixed maximum of 280. **Proposed:** one participation point per timely quiz answer; calculate the maximum from the number of assigned bonuses. With N assigned bonuses, the theoretical maximum is `11 × (24 + N) + 2 × floor((24 + N) / 3)` if all answers are correct and timely.
- **Current FR-6/FR-7:** one acknowledgment and one latest unseen reveal. **Proposed:** the bonus surprise follows the recorded daily answer; preserve priority of the most recent revealable day and reveal its answered quizzes in daily-then-bonus order. Persist per-quiz seen state and recover cleanly after interruption. Older unseen days remain accessible through the calendar.
- **Current FR-9/FR-10:** one countdown and one quiz/result per gift. **Proposed:** allow resuming an unplayed bonus from the day and independently viewing each authorized result, while the gift's color follows the daily quiz. Apply late-play rules to each quiz.
- **Current FR-11 and catalogue procedure:** the additional reserve is not playable and selection is limited to the 24 normal entries. **Proposed:** explicitly assign zero or one private reserve contribution per day and safely promote those assignments to each explicitly authorized target, preserving normal quizzes, portraits, content and game state. No specific day or cloud synchronization is authorized by this proposal alone.
- Add a new story within epic 25 after allocating its identifier through the project's tracker workflow. Keep completed stories as historical records; update current requirements, epic coverage and relevant normative SPEC/DOMAIN/ARCH text rather than rewriting history.

### Architecture and implementation

The existing `advent_quizzes.quiz_day` and `advent_member_answers` primary key `(user_id, quiz_day)` encode one quiz and one answer per day (migrations V75 and V76). Supporting two independently answered quizzes therefore requires a compatible identity and persistence change, not only a UI variant. The design must preserve existing content, answers, scores and seen states; enforce at most one bonus per day and one answer per member per quiz; serialize retries and concurrent devices; and define a non-destructive migration and rollback approach. Select the concrete schema during delivery.

Update Advent architecture AD-1, AD-3 and AD-4 and the API contracts for authorized content, independently recorded responses, reveal ordering, streak calculation, ranking and test-mode parity. Enforce daily-before-bonus server-side. Preserve the Paris midnight locking boundary, private/no-store content handling and the production rule that pending correctness and points cannot be inferred from responses or rankings. Account for the current test-mode exception and preview privileges without exposing bonus content prematurely. Review final-ranking tie-break inputs, reset/replay, editing and reminder behavior for consistency; no new notification is required by this proposal.

### UX and operations

Update Advent EXPERIENCE and DESIGN for the surprise, continuation, per-quiz results and one-gift calendar. Use existing Advent art direction, isolated styles and accessible keyboard, screen-reader, motion and mobile behavior; validate a real rendered view with Patrice. The copy is provisional: « Surprise ! Un quiz bonus pour gagner des points en plus ! » / **Jouer**. Update the private catalogue and deployment procedure, including generation and identity checks, explicit target selection and verification. Preserve all real contributions outside the public repository and logs.

## Proposed story acceptance criteria

1. A day with no bonus behaves exactly as before; a day with one assigned bonus follows the confirmed daily → surprise → bonus → acknowledgment flow. No second bonus can be assigned to the same day.
2. A timely bonus can be resumed after interruption and on another device, is answerable once, and obeys the same scoring and midnight rules as the daily quiz. Retried and concurrent submissions do not duplicate responses or points.
3. Late daily and bonus play, including a previously skipped bonus, follows the confirmed order and yields immediate zero-point results without changing ranking or streak. If the daily quiz was answered on time but the bonus skipped, reveal the daily result before offering the late bonus.
4. Timely results remain private until their reveal; on return the most recent eligible day is prioritized and its answered results are shown daily then bonus. Seen state survives interruption and devices. Calendar access allows independent review without replaying celebrations.
5. The calendar has one gift per day; its color and accessible state reflect the daily quiz. A member can reach both quiz/result states without leaking an unanswered or unrevealed result.
6. Ranking, final tie-breaks and score explanations incorporate timely bonus answers and streaks consistently. Test good/wrong combinations, crossing a three-answer threshold, a skipped bonus, late play, and absence of pending-result leaks.
7. Operators can prepare selected bonus assignments from the private reserve and verify the explicit target without overwriting existing content or game data; migration and synchronization preserve existing data. Development, staging and production remain separate targets.
8. Respect Advent DESIGN, EXPERIENCE and AD-7 plus the Material 3 checklist. Verify mobile and desktop rendering, accessible labels, keyboard and reduced motion, and absence of effects outside Advent. Cover API authorization, two devices, retries, Paris midnight and 24/25 December; verify isolated test and preview paths.

## Assessment and handoff

Recommended path: direct adjustment within epic 25, with one new story and coordinated contract updates. Effort: medium to high; risk: high for existing answers, ranking and disclosure. No duration estimate is established. Rollback of completed stories would not address the need and risks losing validated work; an MVP reduction is unnecessary on current evidence. No dependency or resequencing of unrelated epics has been established; recheck the tracker before allocating the story.

On approval, prepare the tracked story and implement through `bmad-build`, including UX review and a safe migration plan. Deployment, production promotion and assignment/synchronization of actual private content require their own explicit authorization. This draft does not authorize those operations.

## Checklist and open implementation decisions

Trigger, affected epic, PRD/UX/architecture, persistence, operational and test impacts have been identified. Schema shape, precise visual composition, safe migration mechanics, exact operator interface and story identifier remain delivery design decisions; do not infer an unapproved new product rule from them. Verify whether an edited bonus uses the existing pre-day editor contract when designing the story. Review full integration and existing normative documents before implementation. Patrice approved this proposal in conversation; tracker changes remain pending.

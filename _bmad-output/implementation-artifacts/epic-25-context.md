# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give La Malice members a festive way to discover one another through 24 daily quizzes, delayed reveals and a friendly ranking. Patrice and Toinou prepare and test the experience in isolated development before production opening; partial demonstrations identify unfinished functionality and protect production data and surprises.

## Stories

- Story 25.1: Open an Advent door in isolated development
- Story 25.2: Answer the quiz after opening a door
- Story 25.2a: Restart an isolated test session
- Story 25.3: Discover and recover the quiz result
- Story 25.4: See the friendly ranking
- Story 25.5: Browse the calendar and past content
- Story 25.6: Enter the Advent experience from HatCast
- Story 25.7: Invite members to the daily quiz
- Story 25.9: Measure actual participation

## Requirements & Constraints

- Each quiz presents a portrait and three statements, one false. A member may play their own quiz. Production answers are final and unique per member and quiz; no catch-up answers are allowed. Confirmations still waiting for the lock at the following Paris midnight close, even if received earlier; reveal waits for a transaction already in progress.
- Award 10 points for a correct choice or zero otherwise, plus one participation point for each recorded answer. Add two points for each non-overlapping group of three consecutive correct answers: a wrong answer resets the streak, while a missed day does not. The theoretical maximum is 280 points. Keep results and derived points hidden until the following Paris midnight.
- Before reveal, acknowledge only that the answer was saved and invite the member to return tomorrow. Resolve uncertain submissions against saved state before allowing retry. Once revealed, show the choice, false statement, correctness, response and participation points, earned bonus and optional anecdote. Prioritize the most recent revealable unseen result on return, without calendar access on that priority screen; older unseen results remain accessible through their cases.
- The revealed-only ranking includes all classable members from zero; ties receive the lowest rank in their group. Patrice and Toinou are excluded from the list and see their personal score without rank. The final ranking and calendar remain accessible through 15 January; member access ends on 16 January and answers remain retained.
- A case published on its day is playable until midnight; one published later is read-only after reveal. Missing content does not trigger automatic opening or notification. Content is supplied through releases; no content administration or automated prize tie-breaker is required.
- Production access is limited to active members of the configured troupe during the allowed dates; no production test mode exists. Test mode requires isolated development, active troupe membership and the dedicated tester allowlist. Use fictional test statements and obtain consent for real names or portraits. Test data, notifications and analytics must not affect production.
- In isolated test mode, a tester can erase and replay their own answer, including a past case, without changing other answers or rewinding the shared clock. A separate targeted reset restarts the isolated calendar session and its clock; it must not affect production or unrelated data.

## Technical Decisions

- The API governs eligibility, time, disclosure and mutations; PostgreSQL owns shared state. Verify membership, authorized date and mode on every read and mutation, including portraits; platform administrators are not exempt. Sensitive reads are private and `no-store`.
- Never place future content, correct answers, pending correctness, scores or revealing derivatives in public assets, bundles, URLs, caches, notifications, analytics or premature API responses. Protect direct portrait access and verify client, service-worker and shared-cache behavior across accounts.
- Use consistent server-side Europe/Paris civil time. Enforce one answer per member and quiz in the database; serialize per-member mutations needed for streak scoring and retain stable data for faithful results. Ranking and totals include only revealable points, using a single reference time.
- Serialize reveal and ranking reads with confirmations using the shared clock lock, sampling authoritative time after acquiring it and reading committed answers before release. This can delay a read beyond midnight when a transaction is stalled.
- Share dismissal and reveal-seen state across devices. Mark a result seen only after display and client acknowledgment; acknowledgments are idempotent. Interrupted delivery or simultaneous devices can cause repeated display, so exactly-once display is not promised.
- The isolated test clock is shared, server-side and forward-only. Confirming a future case advances it to that day with normal scoring and next-day reveal. Only a targeted isolated session reset can move it backward. Verify actual production time boundaries separately.
- Reuse existing reminders for a 10:00 Paris attempt on days 1–24; check availability, eligibility, unanswered state and preferences at execution. Late or missed delivery is acceptable. Measure distinct real players and real answers as global totals, excluding tests and sensitive content; the database is authoritative.

## UX & Interaction Patterns

- Apply the approved independent Advent visual identity, scoped tokens, typography and components. Angular Material 3 supplies accessible behavior; do not alter HatCast's design system, base styles or global tokens. Verify visual and computed-style isolation, including overlays, alongside responsive and accessibility checks.
- Use a festive French tutoiement tone. The discovery door and quiz show a portrait and three single-choice statements; selection can change until explicit confirmation. Do not truncate content to avoid scrolling. Reduced motion gives equivalent immediate access.
- Make the experience mobile-first and accessible: keyboard and visible focus, meaningful portrait alternatives, single-choice semantics, appropriate announcements, contrast and text enlargement. Aim for 48 × 48 px touch targets, with a 44 × 44 px minimum.
- Use distinct calendar and ranking surfaces. The calendar contains 24 quiz cases and a 25 December case in a four-column ordered grid; expose states without relying on color alone or revealing future content. Preserve priority reveal, neutral pending state and read-only past content.
- The 25 December journey follows any priority reveal and provides a Christmas message and personal revealed score; no quiz occurs that day. Test mode is visibly identified, and test commands are available only to authorized testers in the permitted environment.

## Cross-Story Dependencies

- Reveal and ranking depend on durable answer and scoring state; the calendar later provides access to older results and past unplayed content. Entry and notification journeys honor priority reveal. The production entry must not expose an incomplete or unprotected experience.
- Partial human demonstrations must identify unfinished functionality and verify isolation and protections for whatever is exposed. Real production date boundaries require separate tests from simulated time.

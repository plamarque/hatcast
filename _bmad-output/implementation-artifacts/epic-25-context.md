# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give La Malice members a festive way to discover one another through 24 daily quizzes, delayed reveals and a friendly ranking. Patrice and Toinou prepare and test the experience in isolated development before the production opening; partial demonstrations must identify unfinished parts and protect production data and surprises.

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

- Each quiz presents a portrait and three statements, one false. A member may play their own quiz. A confirmed answer is immutable and unique per member and quiz; no catch-up answers are allowed. Pending confirmations close at the following Paris midnight, including those received earlier; reveal is available immediately.
- Score 10 points for a correct choice or zero otherwise, plus one participation point for every recorded answer. Add two points for each non-overlapping group of three consecutive correct answers: a wrong answer resets the streak, while a missed day does not. The theoretical maximum is 280 points. Keep results and derived points hidden until the following Paris midnight.
- Before reveal, acknowledge only that an answer was saved and invite the member to return tomorrow. Resolve uncertain submissions against saved state before allowing retry. After reveal, show the recorded choice, false statement, correctness, response and participation points, earned bonus and optional anecdote. Prioritize the most recent revealable unseen result on return, with no calendar action on that priority screen; older unseen results remain accessible through their cases.
- The revealed-only ranking includes all classable members from zero. Tied members receive the lowest rank in their group. Patrice and Toinou are excluded from the list and see their personal score without rank. The final ranking and calendar remain accessible through 15 January; member access ends on 16 January and answers remain retained.
- A case published on its day is playable until midnight; a case published later is read-only after reveal. Missing content does not trigger automatic opening or notification. Content is supplied through releases; no content administration or automated prize tie-breaker is required.
- Production access is limited to active members of the configured troupe during the allowed dates; no production test mode exists. Test mode requires isolated development, active troupe membership and the dedicated tester allowlist. Use fictional test statements, and obtain consent for real names or portraits. Test data, notifications and analytics must not affect production.

## Technical Decisions

- Angular presents the experience; the API governs eligibility, time, disclosure and mutations; PostgreSQL owns shared state. Verify membership, authorized date and mode on every read and mutation, including portraits; platform administrators are not exempt. Sensitive reads are private and `no-store`.
- Never place future content, correct answers, pending correctness, scores or revealing derivatives in public assets, bundles, URLs, caches, notifications, analytics, or premature API responses. Protect direct portrait access and check client, service-worker and shared-cache behavior across accounts.
- Use consistent server-side Europe/Paris civil time. The database enforces one answer per member and quiz; serialize per-member mutations needed for streak scoring, and preserve sufficient stable data for later faithful results. Ranking and totals include only revealable points, using a single reference time.
- Share dismissal and reveal-seen state across devices. Mark a result seen only after its screen is displayed and the client acknowledges it; acknowledgments are idempotent. Interrupted delivery or simultaneous devices can cause a repeated display, so no distributed exactly-once display is promised.
- Isolated test mode uses a shared server-side simulated clock that only advances. Confirming a future case advances it to that day, with normal scoring and revelation on the next simulated day. Only a targeted isolated reset can return it backward. Verify real production time boundaries independently.
- Reuse the existing reminder mechanism for a 10:00 Paris attempt on days 1–24; check quiz availability, eligibility, unanswered state and preferences at execution. Late or missed delivery is acceptable, with no dedicated recovery or fictitious event. Record distinct real players and real answers as global totals; exclude tests and sensitive content, with the database authoritative.

## UX & Interaction Patterns

- Use HatCast Angular Material 3, typography and design tokens with a festive, French tutoiement tone. The door and quiz show a portrait and three single-choice statements; selection can change until explicit confirmation. Never truncate content to avoid scrolling.
- Provide an accessible, mobile-first experience: keyboard and visible focus, meaningful portrait alternatives, single-choice semantics, appropriate announcements, contrast, text enlargement and small-screen checks. Aim for 48 × 48 px touch targets; document any allowed 40 px exception. Reduced motion provides equivalent immediate access without necessary animation.
- Use distinct calendar and ranking surfaces. The calendar contains 24 quiz cases and a 25 December case in a four-column ordered grid; expose states without relying on color alone or revealing future content. Preserve priority reveal, neutral pending state and read-only past content.
- The 25 December journey follows any priority reveal and provides a Christmas message and personal revealed score; no quiz occurs that day. Graphical treatment of missed cases and the 25 December presentation remain to be refined.


**Reveal serialization contract (25.3/25.4):** Future result and ranking reads must acquire the same singleton clock row lock as confirmation, then sample authoritative time after acquiring it and read committed answers before releasing it. This serializes a reveal with in-flight confirmations so its scoring snapshot cannot subsequently change. A stalled transaction can delay the read beyond midnight; immediate wall-clock availability is therefore not guaranteed. Story 25.3 must implement and test this contract, including rollback and concurrent reads, on PostgreSQL.

## Cross-Story Dependencies

- Planned sequence: 25.1 → 25.2 → 25.2a → 25.3 → 25.4 → 25.5 → 25.6 → 25.7; 25.9 follows recorded answers. Protect and isolate each partial human test and explicitly label unfinished functionality.
- Reveal and ranking rely on durable answer and scoring state; the calendar later verifies access to older results and past unplayed content. Entry and notification journeys must honor priority reveal. Production entry must not expose an incomplete or unprotected experience.

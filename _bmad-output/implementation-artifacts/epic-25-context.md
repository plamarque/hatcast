# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give active La Malice members a festive way to discover each other through 24 daily portrait quizzes, personal results and a friendly ranking. Organizers prepare the event safely, preserve the surprise before opening and verify production content through a narrowly authorized preview.

## Stories

- Story 25.1: Open an Advent door in isolated development
- Story 25.2: Answer the quiz after opening a door
- Story 25.2a: Restart an isolated test session
- Story 25.3: Discover and recover the quiz result
- Story 25.3a: Prepare and play validated quizzes
- Story 25.3b: Manage and synchronize the private Advent catalogue
- Story 25.4: See the friendly ranking
- Story 25.5: Browse the calendar and past content
- Story 25.6: Enter the Advent experience from HatCast
- Story 25.7: Invite members to the daily quiz
- Story 25.8: Refine the Advent art direction
- Story 25.9: Measure actual participation
- Story 25.10: Discover the Advent calendar
- Story 25.11: Generate a fictional ranking for tests
- Story 25.12: Return to the sleeping elf after playing
- Story 25.13: Run Advent regression tests in CI
- Story 25.14: Give Advent CTA snow realistic volume
- Story 25.15: Preserve the Advent surprise and preview production content
- Story 25.16: Test Advent reminders on a real device
- Story 25.17: Give the Advent result screens expressive scenes

## Requirements & Constraints

- Before 1 December 2026 at midnight Paris time, ordinary member navigation must reveal no Advent cue, including gift, automatic welcome or Advent-specific error during network and server failures. From 1 December through 15 January inclusive, the gift offers access; normal future-content and reveal restrictions continue after opening.
- An approved change introduces a distinct production preview through the direct URL for Patrice and Toinou only, authenticated and verified server-side as active members. They may inspect future portraits and quiz content, submit their own final answer and immediately see its personal result and explanation. Their production state may persist, and they may explicitly reset and replay only their own selected answer; URL knowledge grants no privilege. Existing planning documents describing all future production content as inaccessible require reconciliation with this approved exception.
- Other members cannot read future content, portraits, pending correctness or another person's result. Sensitive responses and assets must not leak via caches, logs, notifications, analytics, public resources or cross-account sessions. Protect consented personal data and do not put private contributions or answers in the public repository.
- A normal answer is unique and final outside the authorized personal preview replay. Ordinarily the next Paris midnight reveals correctness, false statement, earned points and optional explanation; an explicit past unplayed quiz may be answered once for immediate zero-point feedback. The most recent unseen revealable result takes priority on return. A missing or late-published quiz remains supported.
- Correct answers earn 10 points, normal participation 1, and each non-overlapping run of three correct answers a 2-point bonus; incorrect answers reset a run and missed days do not. Rankings include classable members at zero and assign tied members the lowest position in their group. Patrice and Toinou are excluded from rankings; their preview answers must not change other members' scores or ranks.
- Production answers by the two excluded accounts may count in future participation totals; isolated development tests do not. Never transmit anecdotes, choices, correctness or unrevealed scores to analytics. Database answers remain authoritative for participation totals.
- From 25 December through 15 January members may consult final ranking and calendar; retain answers and results after access ends. Invitations follow ordinary preferences and eligibility, target 10:00 Paris on 1–24 December, and tolerate missed or late delivery without a dedicated recovery mechanism.

## Technical Decisions

- The API enforces identity, active troupe membership, date and mode for reads and mutations, including direct portrait access; platform administration alone does not bypass membership. Production preview is separate from isolated development test mode and must not advance shared time or alter other members' state.
- Production rejects shared reset, isolated test replay and simulated-date controls for every user, including preview users, and ignores development clock offsets; the separate preview permits only explicit replay of the organizer’s own selected answer. Development data, notifications and analytics remain isolated from production. Each authorized test tab uses its own server-validated simulated date; real date boundaries are tested separately.
- Persist unique final answers and relevant discovery, dismissal and seen state across devices. Serialize confirmation, reveal and ranking with authoritative server time sampled after the shared lock; a confirmation waiting at midnight is closed, while a reveal waits for an in-flight transaction. Preserve idempotent recovery and personal result privacy.
- Prepare validated content privately and synchronize selected quiz content and portraits only, never game answers or state, between verified targets. Development and production databases are distinct. Exceptional changes to published contributions may cause inconsistency; no additional versioning or snapshots are required solely for that risk. Production writes and deployment require separate authorization.
- Sensitive responses are private and no-store; service worker, client storage and intermediaries must not serve stale or cross-account content. Verify direct APIs and portraits, manipulated headers, session changes, caches, retries and concurrent requests.
- Validate 30 November 23:59:59 and 1 December 00:00 Paris using a controlled server clock in isolation, both preview identities and unauthorized accounts, and production-equivalent denial of test controls. Automated checks must actually run and block relevant change and release paths; separately verify the deployed revision and configuration after authorized deployment.

- Keep Advent-specific tests, fixtures, CI selections and utilities identifiable and removable when the temporary feature is retired. Maintain shared HatCast tests independently and preserve necessary coverage while Advent is accessible. Evidence must identify the candidate revision and actual executed, skipped and failed tests; an empty selection is not a successful coverage claim.

## UX & Interaction Patterns

- Use the approved independent Advent visual identity, scoped styles, tokens, typography and components without changing HatCast's design system. Keep French, festive language, Material behaviors, visible focus, keyboard operation, meaningful portrait alternatives, accessible states, responsive layouts and reduced-motion equivalents.
- First discovery presents the welcome before the personal calendar; the action opening it persists discovery across devices. Later journeys respect priority revelation and ordinary daily entry. The gift's brief animation respects reduced motion and daily dismissal or recorded answers prevent repeated automatic opening.
- The calendar contains 24 numbered quiz cases and a Christmas case, distinguishes relevant states without relying on color alone, and permits accessible navigation. The approved preview adds a direct-URL journey to future gifts, immediate personal results and the persisted final-answer state without exposing these to ordinary members.
- A played current-day quiz can return to the sleeping elf and countdown until its result; the server remains authoritative for revelation. Revisited revealed results do not replay celebration. Correct and incorrect results use distinct expressive generic elves and preserve the personal portrait, readable result data and permitted navigation. Validate small screens, enlarged text, touch targets and isolation from unrelated HatCast screens.

## Cross-Story Dependencies

- Discovery, answering, content preparation, ranking and temporal privacy support calendar, entry, invitations and participation measurement. Preview must preserve these boundaries and not trigger premature notifications or alter others' results.
- The private catalogue supplies verified content to distinct target databases. Its operator workflow, identity reservations and test-only deletion safeguards remain separate from member play; production deletion is forbidden.

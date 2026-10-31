# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give La Malice members a seasonal activity to discover one another through 24 daily portrait quizzes, delayed results and a friendly ranking. Organizers prepare and test the experience before opening, with development isolated from production. The experience must be ready before December with time for testing.

## Stories

- Story 25.1: Open an Advent door in isolated development
- Story 25.2: Answer the quiz after opening a door
- Story 25.2a: Restart an isolated test session
- Story 25.3: Discover and recover the quiz result
- Story 25.3a: Prepare and play validated quizzes
- Story 25.4: See the friendly ranking
- Story 25.5: Browse the calendar and past content
- Story 25.6: Enter the Advent experience from HatCast
- Story 25.7: Invite members to the daily quiz
- Story 25.9: Measure actual participation

## Requirements & Constraints

- Members identify the false statement among three and confirm once on its Paris civil day. No production catch-up; each participant may answer their own quiz. Server time governs access and deadlines, not the browser.
- A correct answer earns 10 points, an incorrect one 0; every answer adds 1 participation point. Each non-overlapping group of three consecutive correct answers adds 2; an incorrect answer breaks the streak, a missed day does not. Only revealed points count in visible totals or ranking.
- Before the following Paris midnight, an answer yields a neutral acknowledgment, with no correctness, false statement, pending points or derived hint. Once revealable, the result includes choice, false statement, correctness, daily points and optional additional content. Unseen revealable results take priority on return; acknowledgment follows actual display, is persistent and idempotent, and may be repeated after interruption or concurrent device use.
- Quizzes may be missing at launch or added later. A quiz appearing during its day is playable until midnight; after its day it is read-only once revealable. Future production quizzes remain locked. From 25 December to 15 January members may consult final ranking and past content; no new quiz on the 25th. Answers and results are retained after member access ends.
- Ranking includes all eligible classable members even at zero. Ties receive the lowest position in their group. Patrice and Toinou see their own score but are excluded from ranking. Invitations use normal preferences and existing scheduling; late or missed invitations are acceptable. Aggregate real participation excludes development and sensitive content.
- Protect consented personal content and private portraits; no real anecdotes, answer keys or private assets in Git, public bundles, logs, analytics, URLs, shared caches or premature API responses. Sensitive requests and errors are private and no-store. Service worker and client caches must not expose stale or cross-account data.

## Technical Decisions

- Server-side authorization checks active membership in the configured troupe, permitted mode and date for each Advent read and mutation; platform administration alone is not an exemption. Protect future content, private portrait access, correctness and pending scores from inference as well as direct exposure.
- Persist one final production answer per member and quiz. Serialize the relevant confirmation and scoring mutations; a confirmation still waiting for its lock at midnight is closed. Reveal and ranking reads acquire the shared clock-row lock, sample server time after acquiring it, and read committed answers before releasing it; an in-flight transaction can delay the read past midnight. Recover uncertain confirmation without duplicating the answer. Shared dismissal and seen state remain durable across devices.
- Validated quiz content is prepared directly in a database by queries; portraits remain in a private bucket. Only quiz content and relevant portrait references are promoted from development to production, never answers or test state. The transfer procedure and safe identification of targets must be determined and verified; a JSON bucket catalogue is not the adopted source.
- Development and production use separate databases; production never enables test mode. Development test content is unrestricted, subject to protection of personal data. Authorized test users may replay their own answers, move the shared simulated clock one Paris day in either direction and use a targeted reset. Reset must preserve quiz content and unrelated data, isolate production data and effects, serialize with in-flight work and reject unsafe or ambiguous environments. Verify real production boundaries separately from simulated time.
- Patrice does not change contributions during play and accepts inconsistency risk if an exceptional change occurs. No version system, snapshot, stale-content rejection or edit lock is mandated solely for that risk. Do not infer that the accepted risk weakens uniqueness, authorization or result secrecy.
- Use the existing reminder infrastructure and server-side eligibility checks. Measure distinct real participants and recorded real answers without sensitive details; the database is authoritative if telemetry is missing.

## UX & Interaction Patterns

- Advent has its own approved visual identity, scoped tokens, typography and components; preserve the surrounding HatCast design system. Existing artistic references are not additional functional requirements. Apply accessible Material behavior and preserve the approved discovery, question, neutral confirmation, result, calendar and ranking journeys.
- Support keyboard and visible focus, announcements and focus restoration, meaningful portrait alternatives, single-choice semantics, responsive and enlarged text, adequate contrast, touch targets and reduced-motion equivalents. Do not truncate content or depend on color alone for state. Verify visual and computed-style isolation from HatCast.
- Test mode is visibly identified. The priority reveal offers no calendar navigation until it has been displayed; return paths and absence states follow the established UX. Earlier unseen results remain available through their calendar cases without a separate marker.

## Cross-Story Dependencies

- Stories 25.1, 25.2, 25.2a and 25.3 are completed historical deliveries. Database-backed content is the approved 25.3a follow-up, before the later ranking, calendar, entry, notification and participation work relying on the relevant content and environment boundary.
- The unfinished private catalogue worktree is evidence of the superseded JSON direction, not an approved solution; preserve it and its Git backup. Production writes and deployment require their own authorization and evidence. Partial demonstrations must identify unfinished functionality and demonstrate isolation before exposing content.

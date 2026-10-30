---
id: SPEC-hatcast-avent
companions:
  - ../../planning-artifacts/prds/prd-hatcast-2026-10-28/prd.md
  - ../../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md
sources: []
---

> **Canonical contract.** This SPEC and its companions form the contract to build, test and validate. UX documents govern their illustrative mockup; architecture decisions AD-1–AD-7 and the decisions in the updated PRD govern the implementation.

# La Malice Advent calendar 2026

## Why

Give La Malice members a surprise Christmas activity within HatCast: discover one another through anecdotes, enjoy a friendly game and encourage conversation and cohesion. The experience must be ready and verified before 1 December 2026, with time for testing.

## Capabilities

- **CAP-1**
  - **intent:** Eligible members discover and access the daily experience without losing their place across devices.
  - **success:** Access windows, automatic opening, daily dismissal, missing content and the priority of the most recent revealable unseen result follow FR-1, FR-2, FR-7 and FR-12 across devices.
- **CAP-2**
  - **intent:** A member answers each available daily portrait quiz once and discovers a durable result after the reveal.
  - **success:** One of three statements is confirmed on the quiz day; confirmations still waiting for the lock close at midnight, including retries and concurrent requests; result reads wait for an already-running transaction. The next midnight reveals the choice, false statement, correctness and points under FR-4–FR-7 and AD-3; before then no response, score or derived information reveals correctness or pending points.
- **CAP-3**
  - **intent:** Members explore the calendar and revisit played or discover missed content when permitted.
  - **success:** The calendar has 24 quizzes and a 25 December presentation. Past unplayed content is read-only after reveal, future cases stay locked, and available results and missing content follow FR-9–FR-11 without catch-up answers.
- **CAP-4**
  - **intent:** Members compare revealed progress in a friendly ranking and see their personal score.
  - **success:** All classable members appear from zero; ties receive the lowest rank of their group (1, 3, 3, 4). Patrice and Toinou see personal scores without ranking. Only revealed points count; the final ranking is available from 25 December through 15 January inclusive (FR-5, FR-8–FR-9, AD-4).
- **CAP-5**
  - **intent:** Eligible members are invited to play the available daily quiz through usual HatCast notifications.
  - **success:** Existing Spring reminders target 10:00 Europe/Paris on 1–24 December, checking availability and eligibility at actual execution; late or missed delivery is acceptable and no special recovery is added (FR-3, AD-5).
- **CAP-6**
  - **intent:** Organizers publish consented content and safely test the experience before opening.
  - **success:** Content is added by release, the false statement is stable after play, and configured active troupe members on the dedicated tester allowlist test in isolated development using a forward-only shared simulated clock, future-case access and targeted reset (FR-11, FR-13, AD-2).
- **CAP-7**
  - **intent:** Organizers assess participation without exposing quiz content or mixing test and real play.
  - **success:** Two global totals distinguish distinct real players and recorded real answers; test data, anecdotes, choices and pending correctness and scores are excluded, with the database authoritative if telemetry is missed (AD-6).

## Constraints

- AD-7 binds visual isolation; AD-1–AD-6 are binding: API-enforced active membership, secrecy of future and pending content including derived scores and caches, isolated tests, durable shared state, ranking and retention, reminders and analytics.
- Server-side Europe/Paris civil time governs 24 daily quizzes from 1–24 December. At the following midnight results are revealable; on 25 December the last result and final ranking are available, without another quiz. Member access ends at 00:00 on 16 January 2027.
- A correct answer earns 10 points, an incorrect one 0; each recorded answer earns 1 participation point. Each non-overlapping group of three consecutive correct answers earns 2; an incorrect answer breaks the sequence, a missed day does not. Only revealed points appear in scores and rankings; maximum 280.
- Development tests use fictional statements and may use consenting members’ names and portraits. A tester can erase and replay their own answer on a selected case, including past cases, without rewinding the shared clock or changing other members’ answers. A shared server clock only advances; answering a future case advances it to that day, using normal scoring and next-day reveal. A targeted reset clears the test game and clock to go backward; production has no test mode. Verify actual December and January boundaries separately.
- A result is marked seen only after its reveal screen is displayed and acknowledged by the client; simultaneous devices or a lost acknowledgment can cause repeat display (AD-3). Earlier unseen revealed results remain in their calendar cases without markers or automatic chaining.
- Invitations reuse existing Spring scheduling and HatCast reminders without Advent-specific infrastructure, recovery or delivery guarantees.
- Adopted DESIGN and EXPERIENCE govern the approved independent Advent visual identity, accessibility and interaction; Material 3 behaviors remain available within the isolated Advent theme. HatCast pages retain their own design system. The supplied boards are artistic references, not functional contracts or static UI; UX documents prevail for behavior.
- Portraits and anecdotes require the presented person's agreement; a person declining presentation can still participate.

## Non-goals

- A generic animation platform for other troupes or occasions, or an administration interface for content.
- Catch-up answers, automated prize tie-breaking, speed bonuses, multiple answers or access to future quizzes in production.
- Advent-specific notification infrastructure or delivery guarantees.

## Success signal

Eligible members can complete daily quizzes, recover their revealed results across devices, browse past content and consult a correctly scored final ranking through 15 January. Patrice and Toinou gather informal feedback; participation is measured as defined in AD-6 without a numerical target.

## Open Questions

- How many prizes will be awarded, and how will any prize ties be resolved? Automated tie-breaking is outside this scope.
- What special message, personal recap content and optional animation should the 25 December experience contain? How should the missed cases and the 25 case be represented graphically? The approved Santa and decorative box remain part of the UX contract.
- What exact targeted test reset procedure and isolation safeguards will be used, and how will retained data be accessed later if needed?

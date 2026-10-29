---
id: SPEC-hatcast-avent
companions:
  - ../../planning-artifacts/prds/prd-hatcast-2026-10-28/prd.md
  - ../../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md
sources: []
---

> **Canonical contract.** This SPEC and its companions form the contract to build, test and validate. The UX documents govern their illustrative linked mockup; the architecture retains decisions AD-1 to AD-6. Where a companion describes an item as open that the architecture has since decided, the architecture decision applies.

# La Malice Advent calendar 2026

## Why

Give La Malice members a surprise Christmas activity within HatCast: discover one another through anecdotes, enjoy a friendly game and encourage conversation and cohesion. The experience must be ready and verified before 1 December 2026, with time for testing.

## Capabilities

- **CAP-1**
  - **intent:** Eligible members discover and access the event and the available daily quiz without losing their place across devices.
  - **success:** The access and automatic-opening windows, daily dismissal, missing-content behavior and recovery of unseen results follow FR-1, FR-2, FR-7 and FR-12 on every device.
- **CAP-2**
  - **intent:** A member answers each available portrait quiz once and receives an understandable, durable result.
  - **success:** One confirmed choice among three is final; server confirmation time determines correctness points and the streak bonus under FR-4 to FR-7, including midnight, retries and concurrent submissions.
- **CAP-3**
  - **intent:** Members explore the 25-day calendar, catch up and revisit or discover content permitted at that time.
  - **success:** Calendar states, missing content, catch-up through 25 December and read-only discovery through 15 January follow FR-9 to FR-11, without exposing future content.
- **CAP-4**
  - **intent:** Members compare their progress in a friendly ranking and see their personal score.
  - **success:** All classable members appear from zero, ties use competition ranks, and Patrice and Toinou see personal scores without appearing in the ranking; the final ranking is available during the stated consultation window (FR-8–FR-9, AD-4).
- **CAP-5**
  - **intent:** Eligible members are invited to play the day's available quiz through their usual HatCast notifications.
  - **success:** The existing reminder mechanism targets 09:00 Europe/Paris on 1–25 December, with eligibility and no late-publication catch-up as specified in FR-3 and AD-5.
- **CAP-6**
  - **intent:** Organizers prepare consented content and safely test the experience before its real opening.
  - **success:** Content can be added by release, answers remain stable after play, and configured troupe members can test available future cases in isolated development with a targeted reset, as specified in FR-11, FR-13 and AD-2, including its approved November simulation.
- **CAP-7**
  - **intent:** Organizers can assess participation without exposing quiz content or mixing test and real play.
  - **success:** Two global totals distinguish real players with at least one recorded answer from real recorded answers; development tests and anecdotes, statements and choices are excluded, with the database authoritative if telemetry is missed (AD-6).

## Constraints

- The adopted architecture decisions **AD-1–AD-6** are binding, including API-enforced active membership, protection of future content, isolated test mode, durable shared state, score and retention rules, reminders and analytics.
- Dates and confirmation deadlines use server-side Europe/Paris civil time. Production play runs 1–25 December 2026; the final ranking and calendar are available 26 December through 15 January 2027 inclusive, and member access ends on 16 January.
- Development-only November testing uses 25 quizzes with fictitious statements and, with consent, optionally real member names and portraits, and maps 1–25 November to the corresponding December days for daily state, journeys, scoring and streak; free future-case access, targeted reset and isolation remain available as specified in AD-2. Final-ranking consultation is testable in development from 25 November; earlier access is considered only if needed. Verify real December and January boundaries separately.
- Invitations reuse existing Spring scheduling and HatCast reminders, without Advent-specific infrastructure, recovery or additional delivery guarantees. A quiz unavailable at 09:00 receives no catch-up invitation when published later.
- The adopted DESIGN and EXPERIENCE documents and HatCast Material 3 conventions govern accessibility, interaction and appearance. The mockup is illustrative; the UX documents prevail.
- Portraits and anecdotes require the presented person's agreement; a person declining presentation can still participate.

## Non-goals

- A generic animation platform for other troupes or occasions, or an administration interface for content.
- Automated prize drawing, speed bonuses, multiple answers or access to future quizzes in production.
- Advent-specific notification infrastructure or delivery guarantees.

## Success signal

Eligible members can complete the daily and catch-up journeys, recover saved results across devices, and consult a correctly scored final ranking during the specified window. Patrice and Toinou gather informal feedback on enjoyment and cohesion; participation is measured as defined in AD-6 without a numerical target.

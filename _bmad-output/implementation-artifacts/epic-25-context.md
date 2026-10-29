# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let eligible La Malice members discover each other through 24 daily quizzes, delayed reveals and a friendly ranking, while enabling safe isolated development demonstrations before the production opening.

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

- Only active members of the configured troupe can access the experience; platform administrators are not exempt. Require consent from people presented. Content is supplied by release without an administration interface.
- Server-side Europe/Paris civil time controls access and deadlines. Quizzes run December 1–24, each playable only on its day; the following midnight makes its result revealable. There is no catch-up answer or quiz on December 25. Member access ends January 16, 2027; retain results afterward.
- A correct answer earns 10 points, an incorrect one zero, and every answer earns one participation point. Each non-overlapping group of three consecutive correct answers earns two bonus points; a wrong answer resets the sequence, while a missed day leaves it intact. Only revealed points contribute to visible totals and rankings.
- Rankings include classable members from zero; ties receive the lowest position of their group. Exclude Patrice and Toinou from the list while displaying their personal scores separately. Retain and recover unseen revealable results across devices; present the most recent first and acknowledge only after display.
- Tests use fictional statements and may use consenting real names or portraits. Development test mode is visibly identified, isolated from production data, notifications and analytics, and unavailable in production. A shared server clock advances only; answering a future case advances it to that day, with normal scoring and next-day revelation. Targeted reset is required to move backward. Verify real date boundaries separately.
- Never expose an incomplete or unprotected production experience. Demonstrations explicitly identify unfinished capabilities and require verified isolation and protections for exposed material.

## Technical Decisions

- Angular presents the journey; the API owns authorization, environment, timing, disclosure and mutations; persistent server data owns answers and shared journey state. All reads and writes enforce configured troupe membership and permitted mode and dates.
- Keep future content, revealing portraits, correct answers and pending correctness or scores out of public assets, bundles, URLs, caches, notifications and analytics. Protect direct portrait requests and return sensitive responses with no-store; prevent service-worker and cross-account cache leaks.
- Guarantee one durable immutable answer per member and quiz under retries and concurrency. The API receipt time governs the midnight deadline, with serialized member scoring and consistent server reference time. Seen and dismissal states are persistent and shared across devices.
- Use the existing Spring scheduler and reminder mechanisms for invitations, checking content and eligibility at execution. A late or missed attempt is acceptable; no additional delivery infrastructure or recovery guarantee is introduced.
- Measure distinct real players and real recorded answers only. Exclude tests and sensitive quiz data; persisted answers remain authoritative.

## UX & Interaction Patterns

- Apply HatCast Angular Material 3, theme tokens, mobile-first responsive layout and French encouraging copy. Use a full-page decorated door with equivalent immediate access under reduced motion.
- Display portrait and three single-choice statements with explicit confirmation. After submission show a neutral acknowledgment until the next-day reveal; no score or other clue may expose the pending result.
- Show the most recent unseen reveal before the day's journey, with no calendar action on that priority screen. Calendar and ranking are separate surfaces; the calendar uses a four-column ordered grid for 24 quizzes and December 25, with states distinguishable without color alone.
- Support keyboard, visible focus, announcements, meaningful portrait alternatives, accessible single-choice semantics and no focus trap. Target 48 px touch targets; document any 40 px exception. Preserve content and actions under zoom and text enlargement.

## Cross-Story Dependencies

- Build in order 25.1, 25.2, 25.2a, 25.3, 25.4, 25.5, 25.6 and 25.7; 25.9 follows persisted answers. Isolation and applicable protections precede human testing. Partial demonstrations identify unavailable features.
- Scoring, revelation, ranking, calendar and shared state form one domain; verify boundary dates, concurrency, retries, cross-account and cross-device behavior as the relevant capabilities are introduced.

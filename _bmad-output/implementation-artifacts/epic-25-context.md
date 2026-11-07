# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give active La Malice members a festive way to discover one another through 24 daily portrait quizzes, delayed results and a friendly ranking. Organizers prepare the event safely, preserve the surprise before opening and validate the journey through isolated testing and an authorized production preview.

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
- Story 25.10: Découvrir le calendrier de l’Avent
- Story 25.11: Générer un classement fictif pour les tests
- Story 25.12: Retrouver le lutin endormi après avoir joué
- Story 25.13: Run Advent regression tests in CI
- Story 25.14: Give Advent CTA snow realistic volume
- Story 25.15: Preserve the Advent surprise and preview production content
- Story 25.16: Test Advent reminders on a real device
- Story 25.17: Dynamiser les écrans de résultat de l’Avent
- Story 25.18: Open the private Advent preview from the account menu
- Story 25.19: Open future Advent gifts in development test mode
- Story 25.20: Record the complete Advent member journey
- Story 25.21: Célébrer le bilan de Noël
- Story 25.22: Discover full Advent stories
- Story 25.23: Ouvrir un quiz Avent par son URL
- Story 25.24: Célébrer le podium final

## Requirements & Constraints

- Ordinary member navigation must preserve the surprise before 1 December 2026 at midnight Paris, including on errors. The gift allows access from 1 December through 15 January, with server-enforced member, date and reveal restrictions.
- Future production content and personal results are available early only to the two explicitly authorized, verified active members. Their preview and personal replay do not grant shared test controls or place excluded accounts in the ranking. Other members must not see future portraits, pending correctness, another person's result or clues through caching, logs, notifications or analytics.
- Normal answers are unique and final, and are revealed at the next Paris midnight. A previously unplayed quiz can be answered once late for immediate zero-point feedback without affecting streak or ranking. Show an eligible unseen result before the next destination. Missing or late content remains supported.
- Award 10 points for a correct answer, one for normal participation and two per non-overlapping group of three correct answers; an incorrect answer resets the run while a missed day does not. Final ranking remains accessible from 25 December through 15 January; retain the underlying results thereafter.
- Existing documents specify tied players sharing the lowest rank and a personal Christmas score. The newly approved Story 25.24 changes the final ranking and Christmas presentation: reconcile normative and UX documents as part of implementation, without weakening prior reveal or privacy rules.
- Protect private contributions and answers; do not put them in the public repository. Test data and controls remain isolated from production. Production writes and deployment require separate authorization.

## Technical Decisions

- Enforce identity, active membership, authorization, date and mode on the server for all sensitive reads and mutations, including portraits. Production preview and isolated development test mode remain distinct; URLs and client-side controls do not confer privileges.
- Server time and shared locking determine admission, confirmation, reveal and ranking at date boundaries. Preserve unique answers, idempotent recovery and private persistent discovery/seen state across devices. Recalculate derived ranking only from authorized, eligible answers.
- Sensitive content and responses are private and no-store. Prevent stale or cross-account exposure through caches and client storage. Validate direct API access, manipulated headers, session changes, retries and concurrency.
- Content synchronization transfers validated quizzes and portraits between verified, distinct environments without moving game answers or state. Preserve the separate private catalogue workflow and target safeguards.
- Keep Advent tests and fixtures identifiable, execute meaningful selections and distinguish automated verification from human, device and deployment evidence.

## UX & Interaction Patterns

- Use the approved independent Advent identity with scoped styles, tokens and typography, leaving HatCast's global design system unchanged. Preserve Material behavior, visible focus, keyboard use, reduced motion, responsive presentation, touch targets and readable enlarged text.
- First discovery precedes the calendar; subsequent navigation respects priority revelation and server-authorized content. Direct day links resume their destination only when permitted and do not bypass discovery, identity or revelation.
- The calendar contains 24 quiz gifts and a Christmas case; state indicators remain legible without color alone. A current recorded answer returns to a neutral waiting scene until reveal. Result scenes use generic elves and accessible text, and retain authorized personal portraits and content.
- The approved Christmas direction highlights the final podium and uses a single brief sentence identifying a decisive tiebreak criterion. When nobody is eligible for the podium, the Christmas wishes stand alone. Retain access to the final ranking, calendar and HatCast; do not assert participation at zero.
- Explicit isolated test mode can project fictional ranking data without mutating real answers; leaving the screen, changing session or mode discards the projection. Ordinary ranking remains bounded by authorized reveal time.

## Cross-Story Dependencies

- Content, answering, ranking and temporal privacy underpin the calendar, entry, invitations and participation measurement. The Christmas podium builds on the final ranking and preserves the priority reveal of the 24th.
- Preview, replay and test journeys preserve isolation, exclusions and other members' data. The private catalogue and deployment remain separate from member play.

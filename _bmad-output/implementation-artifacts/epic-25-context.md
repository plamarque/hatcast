# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Help La Malice members discover each other through 24 daily Advent quizzes, delayed personal reveals and a friendly ranking. Authorized organizers prepare and verify the experience privately while preserving the surprise and isolating testing from production.

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
- Story 25.25: Lire les anecdotes complètes avant de choisir
- Story 25.26: Modifier un quiz Avent avant son jour

## Requirements & Constraints

- Eligible active members see one daily quiz with three ordered choices and can confirm one answer. Reveal correctness, the false choice and points only at the next midnight in Paris. Optional full stories can be read with their choices before answering; the explanation and answer remain protected until reveal.
- A correct answer earns 10 points, a timely answer earns one participation point, and each non-overlapping group of three consecutive correct answers earns two bonus points. Incorrect answers reset a streak; missed days do not. A late answer earns no points and does not affect the streak or ranking.
- Ordinary future content is inaccessible before its day. The calendar distinguishes available, played, pending, missing and locked cases accessibly; December 25 is a celebration and final ranking, not another quiz. Unseen eligible results take priority on return.
- Patrice and Antoine have a separately authorized private preview; their personal test answers are excluded from ranking. Test controls and shared resets require verified isolation and must never become production controls.
- Production and development data remain separate. Future content, unrevealed answers and other members’ private responses must not leak through API responses, errors, caches, assets or derived scores. Never put actual private contributions, answers or portraits in the public repository or logs.
- New editing permits the two authorized content managers to adjust text and false-choice designation for an existing quiz only before its day starts in Paris; the database is the reference for served content after deployment. Prior catalogue-as-canonical wording and acceptance of exceptional edits during play describe earlier decisions and must be reconciled with this newer story during implementation.

## Technical Decisions

- Enforce membership, identity, dates and disclosure at the server, using Paris time and independent checks of real versus simulated time. Preserve transaction safety around answers, reveals, reset and concurrent changes.
- Quiz content is separated from game state. Synchronization and operator actions verify their explicit target and identity, protect private data and preserve answers and game state. Existing content conflicts require safe resolution rather than silent overwrite.
- Private portraits are served through authorized paths. No public bundle or direct link should bypass the timing and identity rules. Each environment has its own database.
- Reminder attempts use the existing scheduling and notification mechanisms; they must not reveal content or imply delivery guarantees.

## UX & Interaction Patterns

- Use the isolated Advent visual identity and tokens without changing HatCast’s global design system. Apply Material controls and the project’s mobile-first accessibility requirements, including keyboard focus, understandable labels, touch targets, enlarged text, reduced motion and non-color state cues.
- Quiz choices and optional narratives remain legible without truncation. Confirmation is neutral until reveal; recover interrupted journeys and preserve the priority of eligible results. Calendar and ranking remain navigable when allowed.
- Test and preview affordances are visible only to their authorized users and must not misrepresent the active mode or affect other members. Verify actual Advent states and style isolation on small screens and desktop.

## Cross-Story Dependencies

- Quiz preparation and synchronization support the member journey; test reset preserves content and applies only to isolated game state.
- Preview, direct links, test modes, reminders and calendar projections all depend on the same access and reveal boundaries. Story 25.26 must preserve these while adapting catalogue operations to prevent overwriting edits made in an environment’s database.
- Later story 25.25 supersedes the original restriction that full narratives appear only after reveal; historical completed stories remain historical evidence rather than current behavior.

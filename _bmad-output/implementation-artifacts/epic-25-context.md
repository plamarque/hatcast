# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give eligible La Malice members a seasonal way to discover one another through 24 daily portrait quizzes, delayed revelations and a friendly ranking, with an isolated environment for preparation and testing before the event.

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
- Story 25.9: Measure actual participation

## Requirements & Constraints

- Active members of the configured troupe may play each day's quiz, including their own, by confirming which of three statements is false. A production answer is unique and final; a past unplayed quiz permits one explicitly requested late answer with immediate feedback and zero points. Server-side Paris civil time governs availability, deadlines and revelation.
- A correct answer earns 10 points, an incorrect answer zero, and every recorded answer one participation point. Each non-overlapping group of three consecutive correct answers earns two bonus points; a wrong answer breaks the streak and a missed day does not. Production ranking and scores expose only revealed points.
- Before the next Paris midnight, an answer gives a neutral acknowledgment without disclosing its correctness, false statement, points or derived clue. After revelation, the result includes the member's choice, false statement, correctness, daily points and optional content. The most recent unseen revealable result takes priority on return and is marked seen only after actual display and acknowledgment; older results remain available in the calendar.
- Quizzes can be absent or published late. Content available during its day is playable until midnight; past unplayed content can be answered once for no points after revelation. Future production content stays locked. From 25 December through 15 January eligible members can consult the final ranking and calendar even without playing; no quiz takes place on the 25th. Retain answers and results after member access ends.
- Rank all classable members including zero scores, with tied members sharing the lowest position of their group. Patrice and Toinou see their own scores but do not appear in the ranking. Invitations respect existing preferences and eligibility; late or missed delivery is acceptable. Measure real participation without sensitive quiz content.
- Protect consented personal information, portraits, unreleased statements and answers from premature access or inference. Do not place private contributions or answers in public Git, bundles, logs, URLs, notifications, analytics or shared caches. Sensitive responses are private and no-store; service workers and clients must not serve stale or cross-account content.

## Technical Decisions

- Authorize every Advent read and mutation by active membership, configured troupe, date and mode; platform administration alone does not bypass membership. Protect private portraits and their access paths using the same rules as their content.
- Persist one final production answer per member and quiz. Serialize confirmation and scoring; confirmation still waiting for its lock at midnight is closed. Reveal and ranking reads take the shared clock-row lock, sample server time after acquiring it and read committed answers before release. Handle uncertain confirmations without duplication and preserve seen and dismissal state across devices.
- Prepare validated quiz content privately and maintain its portrait references; development and production databases are separate. Only selected quiz content and portraits may be synchronized, never answers or game state. Target identity, permissions, conflicts and private handling require verification; production writes require separate authorization.
- Test controls and replay are restricted to verified isolated development and must never affect production data, notifications or analytics. Preserve content and unrelated data on targeted reset, and verify real production boundaries separately from simulated time. Planning documents describe differing test-clock scopes; resolve against the current adopted contract before relying on either description.
- Exceptional changes to contributions during play may cause inconsistencies; that risk is accepted. Do not introduce versioning, snapshots, stale-content rejection or edit locks solely for it. Preserve authorization, uniqueness and result secrecy.
- Use existing reminder infrastructure. Database answers remain authoritative when measuring real participation if telemetry is missing.

## UX & Interaction Patterns

- Advent has its own approved visual identity, scoped styles, tokens, typography and components; preserve HatCast's appearance. Apply accessible Material behavior and the established discovery, question, neutral confirmation, revelation, calendar and ranking journeys.
- Make states understandable without color alone. Support keyboard use, visible focus, announcements, meaningful portrait alternatives, single-choice semantics, responsive layout, enlarged text, contrast, touch targets and reduced-motion equivalents. Do not truncate content. Verify visual isolation from HatCast.
- The priority revelation offers no calendar navigation until displayed. In the calendar, past played cases show revealed results without repeating celebration; past unplayed cases offer the gift and a zero-point answer with immediate feedback. The 25 December presentation includes a festive message, personal score and decorative Santa and box, with access to final ranking and calendar.
- Test mode is visibly identified. Production pending results and scores remain secret; the approved test ranking may expose current scores in isolated development.

## Cross-Story Dependencies

- The existing discovery, answering, isolated reset, revelation, quiz content and ranking deliveries establish the foundations for calendar, entry, invitation and participation work. The private catalogue story is a separate operator workflow; preserve its dedicated worktree and contributions.
- Calendar and ranking share date, membership, content confidentiality and revealed-score boundaries. Entry follows priority revelation before daily or seasonal destinations; invitations and participation measurement depend on the same production/test separation.

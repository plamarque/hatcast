# Epic 25 Context: Discover La Malice through an Advent calendar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give eligible La Malice members a seasonal way to discover each other through 24 daily portrait quizzes, delayed revelations and a friendly ranking; allow organizers to prepare and test the experience safely before production opening.

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

## Requirements & Constraints

- Active members of the configured troupe may play each day's available quiz, including their own, by confirming which of three statements is false. A normal answer is final and unique; a past unplayed quiz permits one explicit late answer with immediate feedback and zero points. Server-side Paris civil time governs availability, deadlines and revelation.
- A correct answer earns 10 points, an incorrect answer zero, and each normal recorded answer one participation point. Each non-overlapping group of three consecutive correct answers earns two bonus points; a wrong answer breaks the streak and a missed day does not. Production ranking and scores expose only revealed points.
- Before the next Paris midnight an answer receives neutral acknowledgment without disclosing correctness, false statement, points or derived clues. After revelation the result includes the member's choice, false statement, correctness, daily points and optional content. The most recent unseen revealable result takes priority on return and is marked seen only after actual display and explicit acknowledgment; older results remain available in the calendar.
- A quiz may be absent or published late. Content published during its day is playable until midnight; past unplayed content can be answered once for no points after revelation. Future production content stays locked. From 25 December through 15 January eligible members can consult the final ranking and calendar even without playing; no quiz takes place on the 25th. Retain answers and results after member access ends.
- Rank all classable members including zero scores, assigning tied members the lowest position of their group. Patrice and Toinou see their own scores but do not appear in the ranking. Invitations respect existing preferences and eligibility; late or missed delivery is acceptable. Measure real participation without sensitive quiz content.
- Protect consented personal information, portraits, unreleased statements and answers from premature access or inference. Keep private contributions and answers out of public Git, bundles, logs, URLs, notifications, analytics and shared caches. Sensitive responses are private and no-store; clients and service workers must not serve stale or cross-account content.

## Technical Decisions

- Authorize every Advent read and mutation by active membership, configured troupe, date and mode; platform administration alone does not bypass membership. Protect private portraits and their access paths under the same rules as their content. All time decisions use coherent server time.
- Persist one final production answer per member and quiz, as well as daily dismissal and seen state. Serialize confirmation and scoring; normal confirmation still waiting for its lock at midnight is closed. Reveal and ranking reads acquire the same clock-row lock, sample server time after acquiring it and read committed answers before release. A stalled transaction may delay the read.
- Prepare validated quiz content privately; development and production use separate databases. Transfer only selected quiz content and portraits, never answers or game state. Verify target identity, permissions and conflicts; production writes require separate authorization.
- Test controls and replay are restricted to verified isolated development and must not affect production data, notifications or analytics. Eligible testers start in ordinary member mode and explicitly enable test mode; each operator tab has its own server-validated simulated date. Preserve content and unrelated data on targeted reset; verify real production boundaries separately.
- Exceptional changes to contributions during play may cause inconsistencies; that risk is accepted. Do not introduce versioning, snapshots, stale-content rejection or edit locks solely for it. Preserve authorization, uniqueness and result secrecy.
- Use existing reminder infrastructure. Database answers remain authoritative when measuring real participation if telemetry is missing or duplicated.

## UX & Interaction Patterns

- Advent has its own approved visual identity, scoped styles, tokens, typography and components; preserve HatCast's appearance. Apply accessible Material behavior and the established discovery, question, neutral confirmation, revelation, calendar and ranking journeys.
- Make states understandable without color alone. Support keyboard use, visible focus, announcements, meaningful portrait alternatives, single-choice semantics, responsive layout, enlarged text, contrast, touch targets and reduced-motion equivalents. Do not truncate content. Verify visual isolation from HatCast. For the 25.8 visual work, Patrice prioritizes large readable text and generous touch targets; screen-reader testing and a numerical contrast threshold are not mandatory acceptance gates.
- The priority revelation offers no calendar navigation until displayed. Persist its acknowledgment only after display; simultaneous devices may both show it before acknowledgment. In the calendar, past played cases show revealed results without repeating celebration; past unplayed cases offer a single zero-point answer with immediate feedback. Christmas presents a festive message and personal score with final ranking and calendar.
- The gift entry is available during the production window. Automatic daily opening follows any priority reveal and respects a member's shared daily dismissal or recorded answer; an absence of available content does not itself consume the opening. Test mode is visibly identified and production pending results and scores remain secret.

## Cross-Story Dependencies

- Discovery, answering, isolated reset, revelation, quiz content and ranking establish foundations for calendar, entry, invitation and participation work. The private catalogue is a separate operator workflow; preserve its dedicated worktree and contributions.
- Calendar and ranking share date, membership, content confidentiality and revealed-score boundaries. Entry follows priority revelation before daily or seasonal destinations; invitations and participation measurement depend on production/test separation.

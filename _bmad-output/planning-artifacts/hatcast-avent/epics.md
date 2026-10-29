---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
status: ready-for-planning
inputDocuments:
  - _bmad-output/specs/spec-hatcast-avent/SPEC.md
  - _bmad-output/planning-artifacts/prds/prd-hatcast-2026-10-28/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md
  - docs/v2/technical/FRONTEND_UI.md
---

# HatCast Advent 2026 — Epic Breakdown

## Overview

Draft requirements inventory for the La Malice Advent calendar. The approved spec and its companions remain the source contract. The UX-linked mockup is illustrative and subordinate to the UX documents. Epic design and stories are pending.

## Requirements Inventory

### Functional Requirements

- **FR-1:** Hide production access before 1 December; show the animated Santa entry near account from 1 December through 15 January inclusive; remove it on 16 January.
- **FR-2:** Automatically open the available unanswered daily quiz on the first eligible visit; persist dismissal for that day across devices. An unavailable quiz does not consume the opening, and an existing answer prevents it.
- **FR-3:** Target a 09:00 Paris invitation on 1–25 December for members with no answer when the quiz is available and normal notification preferences allow it; open the quiz and do not catch up a later publication.
- **FR-4:** Prioritize the available unanswered quiz; allow a single selection and explicit confirmation, including for the member portrayed; a recorded answer is final.
- **FR-5:** Award 3 points for a correct answer on its day, 1 late, 0 if incorrect; award one streak point for a daily answer when the previous case was answered on its day regardless of correctness. No bonus on day 1 or late; a missing quiz breaks the streak. Confirmation time governs; theoretical maximum 99.
- **FR-6:** Show correctness, earned points and relevant streak information; reveal the right answer on error, provide the appropriate next-day, Christmas, ranking or catch-up return path.
- **FR-7:** Allow retry if not recorded; recover an unseen saved result first on return the same day, otherwise prioritize the normal journey while retaining access to the old result.
- **FR-8:** List all classable members from zero, highlight the current member, use competition ranks (1, 1, 3), exclude Patrice and Toinou while showing each their personal score without rank. The prize draw is external.
- **FR-9:** Open ranking after today's answer; from 26 December through 15 January inclusive offer final ranking and calendar to all members without automatic opening or answering.
- **FR-10:** Show all 25 cases and their played, past, today and locked future states; allow eligible catch-up, review played choices and points, and read-only discovery of available unplayed content after closure. Missing cases show the specified message.
- **FR-11:** Permit starting with incomplete content and adding it through releases; make new content available according to its day and the game deadline; do not change the correct answer after any member has answered.
- **FR-12:** On a day without a quiz, suppress auto-opening and invitations; the entry displays the absence message and ranking access, with the Christmas variation on 25 December.
- **FR-13:** Offer visibly marked isolated development testing for active members of the configured troupe, including available future cases, 3 points for a correct future answer and targeted reset; configure troupe per environment and never enable test mode in production.

### NonFunctional Requirements

- **NFR-1 — Confidentiality:** Restrict the event to active members of the configured troupe; protect unreleased portraits, statements and answers and collect consent from people presented.
- **NFR-2 — Integrity and recovery:** Ensure one durable answer per member and case under retries, interruption and concurrency; scores and rankings derive from recorded answers across devices.
- **NFR-3 — Accessibility and usability:** Apply HatCast Material 3, accessible interaction, mobile-first responsive layout and an equivalent reduced-motion experience; UX requirements below detail verification.
- **NFR-4 — Temporal correctness:** Evaluate dates and confirmation deadlines using server-side Europe/Paris civil time.
- **NFR-5 — Isolation:** Development tests and reset must not affect production data, notifications or analytics.
- **NFR-6 — Delivery and retention:** Prepare and verify before 1 December with testing margin; preserve answers and results after the consultation window.

### Additional Requirements

- **AD-1:** API enforces active membership and date/mode restrictions for every read and mutation; platform admin is not exempt. Future content and revealing portraits must not reach bundles or public caches; withhold the correct answer until authorized.
- **AD-2:** Configure troupe per environment; development-only test mode and targeted reset; verify isolation of database, notifications and analytics before demonstration.
- **AD-2 — November simulation:** In isolated development, 25 quizzes with fictitious assertions and optionally consented real member names and portraits, and November 1–25 map to December 1–25 for daily state, journeys, score and streak; preserve free future-case access, safe targeted reset and isolation. Verify real December boundaries separately.
- **AD-3:** API owns availability, time and scoring; database enforces one immutable response under concurrency. Persist selection, correct statement, points, dismissal and unseen-result state; emitting an HTTP response alone does not mark a result seen.
- **AD-4:** Derive scores from responses, include zero-score eligible members and exclude designated accounts; retain results after 15 January. No special post-closure membership-change mechanism is specified.
- **AD-5:** Reuse existing Spring scheduling and reminder mechanisms without Advent-specific infrastructure, recovery or additional guarantees; do not create a fictitious show.
- **AD-6:** Measure two global totals: distinct real participants with at least one recorded response and recorded real responses. Exclude development tests and quiz content or choices; the database is authoritative if telemetry is missed; no daily breakdown required.
- Content is delivered by release without an administration interface. Define a safe development-only reset procedure and production safeguards; verify operational effects on portraits, caches, releases and retained data. Later access to retained data is deferred, with no new interface specified.

### UX Design Requirements

- **UX-DR1:** Use HatCast Angular Material 3 components, typography and `--mat-sys-*` tokens; translate the festive visual direction into the theme and verify contrast, without ad hoc component colors.
- **UX-DR2:** Provide a full-page decorated discovery door, short opening and soft light, with immediate equivalent access under reduced motion.
- **UX-DR3:** Place portrait, three single-choice statements and explicit confirmation on the quiz; selection can change until confirmation. Aim for no scrolling on usual phones but never truncate content or sacrifice accessibility.
- **UX-DR4:** Replace quiz with result on the same surface; show response points, bonus when earned and total; celebrate only correct answers briefly and omit motion when requested. Revisited results show choice, correct answer and points without replaying celebration.
- **UX-DR5:** Provide separate HatCast-style Calendar and Ranking tabs, with the daily quiz priority, catch-up return to Calendar and personal ranking summary defined in EXPERIENCE.md.
- **UX-DR6:** Render 25 numbered doors in a four-column, left-to-right grid; distinguish played, past, today, future locked and missing-content cases without color alone; expose number and state accessibly without revealing future content.
- **UX-DR7:** Show the Santa icon near account with a discreet movement once at HatCast opening, less than five seconds, and no movement under reduced-motion preference.
- **UX-DR8:** Use French, tutoiement and encouraging festive tone; preserve the specified missing-content, bonus and Christmas messages and result variations.
- **UX-DR9:** Support keyboard operation, visible focus, appropriate focus entry/restoration and announcements for door, result and errors without a keyboard trap; use meaningful portrait alternatives and single-choice semantics.
- **UX-DR10:** Target 48 × 48 px touch targets; document any allowed 40 px exception. Verify small widths, zoom, text enlargement, contrast and no loss of content or action on mobile, tablet and desktop.
- **UX-DR11:** Show clear test-mode indication and preserve the development-only test journey and targeted reset behavior.

### FR Coverage Map

- FR-1 → Advent epic: entry and availability.
- FR-2 → Advent epic: daily automatic opening and shared dismissal.
- FR-3 → Advent epic: daily invitation using existing reminders.
- FR-4 → Advent epic: quiz selection and confirmation.
- FR-5 → Advent epic: answer and streak scoring.
- FR-6 → Advent epic: result and next action.
- FR-7 → Advent epic: retry and unseen-result recovery.
- FR-8 → Advent epic: ranking, ties and exclusions.
- FR-9 → Advent epic: ranking and final consultation.
- FR-10 → Advent epic: calendar, catch-up and review.
- FR-11 → Advent epic: content availability and release publication.
- FR-12 → Advent epic: missing daily content.
- FR-13 → Advent epic: isolated development testing.

## Epic List

### Approved epic: La Malice Advent calendar

Members of La Malice discover each other through a daily festive quiz, catch up and review their results, then consult the final friendly ranking; organizers prepare and test the experience safely before opening.

**FRs covered:** FR-1–FR-13. **Architecture:** AD-1–AD-6. **UX:** UX-DR1–UX-DR11.

Progressive human checkpoints follow the journey: door, quiz, result, ranking, calendar, Santa icon, then notifications. Show each partial experience to Patrice and Toinou as soon as it is safe and testable; explicitly identify unfinished parts. The first usable test requires development isolation and the protections relevant to what is exposed.

The experience and its security, scoring, ranking and state share one domain and are already designed together. One epic avoids artificial boundaries and repeated work on the same components; independently reviewable stories will be ordered inside it. The production entry must not expose an incomplete or unprotected experience. Epic number remains to be confirmed against the current tracker when stories are created.


## Epic 25: Discover La Malice through an Advent calendar

Members discover each other through daily quizzes and a friendly ranking; Patrice and Toinou can validate successive parts of the journey in isolated development before the production opening.

### Story 25.1: Open an Advent door in isolated development

As Patrice or Toinou,
I want to open an Advent door with test content on the development server,
So that we can assess the first moment of discovery together before the rest of the journey is implemented.

**Acceptance Criteria:**

1. **Given** the isolated development environment is configured for a troupe and test mode, **when** an active member of that troupe accesses the partial Advent experience before December, **then** a visible “Mode test” indicator and a numbered discovery door are displayed; the unfinished quiz and later steps are clearly identified as unavailable, without pretending a response was recorded.
2. **Given** 25 test quizzes with fictitious assertions are configured only in development, optionally using actual members’ names and portraits with their consent, **when** the date is 1–25 November 2026, **then** the displayed simulated day corresponds to the same day in December; an available future test case can also be opened freely. Only the content authorized for the selected case may be returned to the client.
3. **Given** an eligible member activates the door, **when** it opens, **then** the short festive opening reveals its available portrait and case identity; no correct answer or other future case content is disclosed. With reduced motion enabled, the same content is immediately accessible without motion.
4. **Given** a non-member, inactive member, or platform administrator outside the configured troupe, **when** they request the experience or content, **then** the API refuses access. Production has no test mode or fictitious test assertions, and future production content is not sent in public bundles or caches (AD-1, AD-2).
5. **Given** the development test environment, **when** it is prepared for a human demonstration, **then** its data, notifications and analytics are verified isolated from production; the test cannot send production invitations or count as real participation.
6. **Given** keyboard, screen-reader or touch use, **when** the door is operated, **then** its number and state are accessible, focus and announcements follow the UX contract, and controls remain usable at small widths and enlarged text. Target 48 × 48 px and document any permitted 40 px exception; use HatCast Material 3 components and tokens.

**References:** FR-1, FR-10, FR-13; AD-1, AD-2; UX-DR1, UX-DR2, UX-DR6, UX-DR9–UX-DR11. Approved by Patrice. This partial development checkpoint does not enable the production member entry or implement answering.

### Story 25.2: Answer the quiz after opening a door

As an active member testing the calendar,
I want to select and confirm one of three statements about the person revealed,
So that I can try the central quiz interaction on a real device.

**Acceptance Criteria:**

1. **Given** an available test case opened in isolated development, **when** its door opens, **then** the portrait and three fictitious statements are displayed as a single-choice quiz. Names and portraits may be those of real consenting members; statements remain fictitious.
2. **Given** the quiz is displayed, **when** the member selects an answer, **then** they can change it until explicit confirmation; confirmation is unavailable without a selection and the controls expose single-choice semantics.
3. **Given** a confirmed answer, **when** the API accepts it, **then** exactly one immutable answer is persisted for that member and case, with the choice, correct statement and points including any applicable streak bonus; server-side simulated time determines the result in development under AD-2 and AD-3. The interface clearly acknowledges the recorded answer without displaying the unfinished result screen as if it existed.
4. **Given** a retry, interruption or concurrent submission, **when** a response has already been recorded, **then** no second answer or score is created and the recorded outcome remains retrievable for the later result journey. If recording fails, the interface does not claim success and the member can retry while the case is playable.
5. **Given** a future case opened freely in test mode, **when** a correct answer is confirmed, **then** it earns 3 points as specified by FR-13; test mode remains isolated and unavailable in production. Actual December date boundaries are verified separately.
6. **Given** mobile, enlarged text, keyboard or assistive technology, **when** the member reads and answers, **then** portrait alternative text, visible focus, announcements, contrast and target sizes meet the UX contract; content and confirmation remain available without truncation, using scrolling when necessary and HatCast Material 3 tokens.

**References:** FR-4, FR-5, FR-7, FR-13; AD-1–AD-3; UX-DR1, UX-DR3, UX-DR9–UX-DR11. Approved by Patrice. Result presentation, calendar and ranking remain separate later checkpoints.

### Story 25.2a: Restart an isolated test session

As an organizer testing with Toinou,
I want to safely reset Advent test data in development,
So that we can repeat the complete journey and evaluate changes.

**Acceptance Criteria:**

1. **Given** isolated development and its configured troupe, **when** an authorized operator follows the documented targeted reset procedure, **then** Advent test responses, scores and related per-member journey state for the intended scope are cleared so the journey can be replayed, while test content and unrelated data are preserved.
2. **Given** production or an environment whose isolation cannot be established, **when** the reset is attempted, **then** it is refused by effective safeguards; the procedure does not touch production data, notifications or analytics.
3. **Given** a reset test session, **when** a member plays again, **then** the result is computed from the new test responses and November simulation, and previous test responses do not affect the ranking or streak.
4. **Given** the reset procedure, **when** it is prepared for use, **then** its target, prerequisites, effects and verification are documented and demonstrated against isolated development data. No general administration interface is added.

**References:** FR-13; AD-2, AD-3, AD-4; UX-DR11. Approved by Patrice. This capability follows story 25.2 and precedes the first human checkpoint that needs replaying recorded answers.


### Story 25.3: Discover and recover the quiz result

As a member who has confirmed a quiz answer,
I want to see and recover my result,
So that I understand what I earned and can enjoy the reveal even after an interruption.

**Acceptance Criteria:**

1. **Given** a recorded answer, **when** the result is displayed, **then** it replaces the quiz on the same surface and shows whether the answer was correct and the recorded points; on error it reveals the correct statement with an encouraging message.
2. **Given** a same-day answer with a streak bonus, **when** the result is displayed, **then** response points, the +1 regularity bonus and their total are understandable, including without animation. Without a bonus, invite the member to return tomorrow without emphasizing a missed point; on 25 December show “Joyeux Noël !” instead. A late answer shows earned points without mention of the bonus.
3. **Given** a correct answer, **when** the result first appears, **then** short confetti and point animations celebrate it; an incorrect answer does not trigger confetti. Reduced motion removes animations while preserving all information. Reviewing a result does not replay celebration.
4. **Given** the answer was saved but the result was not seen, **when** the member returns on the same simulated or real day, **then** the recorded result is shown first across devices; issuing an HTTP response does not itself mark it seen. On a later day the normal daily journey takes priority and the saved result remains retrievable for the later calendar journey.
5. **Given** a recorded answer whose confirmation crossed midnight or the end of play, **when** the member sees the outcome, **then** the displayed result uses the server's recorded decision; after closure an unrecorded answer is rejected with a game-ended message and access to available navigation as it is delivered.
6. **Given** the first partial test, **when** the result offers onward navigation, **then** unfinished ranking or calendar actions are clearly identified as unavailable until their stories are delivered; on completion they follow FR-6 and the UX contract.
7. **Given** keyboard, screen-reader, mobile or reduced-motion use, **when** quiz changes to result or an error occurs, **then** focus and announcements follow the UX contract, information is not conveyed by animation or color alone, and no text or action is truncated.

**References:** FR-5–FR-7; AD-2, AD-3; UX-DR4, UX-DR8–UX-DR10. Approved by Patrice. Ranking and calendar are later checkpoints; all test data stays isolated.

### Story 25.4: See the friendly ranking

As a member participating in the Advent calendar,
I want to see the ranking and my own score,
So that I can share the fun with other members after answering.

**Acceptance Criteria:**

1. **Given** an eligible member, **when** they open the ranking from a result or an available entry, **then** all classable active members appear by name from the start, including those with zero points; the member's rank and score are highlighted both in a personal summary and in the list.
2. **Given** recorded responses, **when** the ranking is computed, **then** scores derive from recorded response and streak points and ties share competition ranks (for example 1, 1, 3), including ties at zero. Only total scores are shown in the ranking.
3. **Given** Patrice or Toinou is connected, **when** the ranking is displayed, **then** their personal score is shown without a rank and neither designated account appears in the ranking. The external prize draw is not automated.
4. **Given** the game has closed at the end of 25 December Paris time, **when** an eligible member consults the ranking through 15 January inclusive, **then** it is presented as final; no new answer can alter it. Answers and results remain retained afterward, while member access ends on 16 January. No special post-closure membership-change mechanism is added.
5. **Given** development test mode, **when** the ranking is inspected during the simulated November period, **then** it reflects only isolated test answers and the simulated game state; actual December and January boundaries are separately verified.
6. **Given** a member using keyboard, assistive technology, a narrow screen or enlarged text, **when** they consult the ranking, **then** names, scores and position are understandable, focus is visible and content is not truncated; styling follows HatCast Material 3 and UX requirements.
7. **Given** the calendar has not yet been implemented, **when** navigation is shown in the partial test, **then** its unfinished action is clearly identified as unavailable; it becomes the separate calendar tab in the next story.

**References:** FR-6, FR-8, FR-9; AD-1, AD-3, AD-4; UX-DR1, UX-DR5, UX-DR9, UX-DR10. Approved by Patrice. Final-ranking consultation is testable in isolated development from 25 November; earlier access is a separate story only if needed. Actual December and January boundaries are verified separately.

### Story 25.5: Browse and catch up through the calendar

As a member,
I want to browse the 25 doors, catch up and revisit my answers,
So that I can enjoy the calendar at my own pace and discover its contents after the game.

**Acceptance Criteria:**

1. **Given** an eligible member opens Calendar, **when** the calendar is displayed, **then** 25 numbered doors appear in a four-column, left-to-right grid, distinguishably indicating played, past unplayed, today and future locked cases; each exposes its number and state accessibly without revealing future content or relying on color alone.
2. **Given** an available past unplayed case before the game closes, **when** the member opens and answers it, **then** the standard immutable response and late scoring rules apply; the result returns the member to Calendar and Ranking remains accessible in its own tab.
3. **Given** a played case, **when** it is opened, **then** the member sees their recorded choice, correct statement, response points and any streak bonus without being able to answer again or replaying celebration.
4. **Given** a past case with no content, **when** its door is opened, **then** it shows “Il n’y a rien ici. Reviens plus tard !”. Content added by release becomes available immediately according to FR-11; a correct answer must not change after a member has answered.
5. **Given** 26 December through 15 January inclusive, **when** a member opens an unplayed case, **then** available content reveals the portrait and correct statement without answering or awarding points; missing content shows the absence message. Ranking and Calendar remain available to members who never played.
6. **Given** a future case in production, **when** the member attempts to access it, **then** it stays locked and the API does not disclose its content; in isolated test mode available future cases can be opened freely. A correct future test response earns 3 points.
7. **Given** small screens, zoom, enlarged text, keyboard, screen reader or reduced motion, **when** the member uses the grid and doors, **then** scrolling or accessible adaptation is allowed without truncation; focus, announcements, touch targets and motion follow the UX contract and Material 3 conventions.

**References:** FR-5, FR-6, FR-9–FR-11, FR-13; AD-1–AD-4; UX-DR1, UX-DR2, UX-DR4–UX-DR6, UX-DR9–UX-DR11. Approved by Patrice.

### Story 25.6: Enter the Advent experience from HatCast

As an eligible member,
I want to discover and reopen the Advent experience from HatCast,
So that the daily quiz is easy to find without disturbing me repeatedly.

**Acceptance Criteria:**

1. **Given** production and an active member of the configured troupe, **when** the date is 1 December 2026 through 15 January 2027 inclusive in Paris, **then** a Santa icon appears near My Account and opens the appropriate experience; before that interval and from 16 January it is absent and the API enforces the same access window.
2. **Given** 1–25 December and an available unanswered quiz for today, **when** the member first opens HatCast on an eligible visit, **then** the discovery door opens automatically before ranking or other cases. Closing it or the quiz suppresses automatic reopening for that member that day across devices; an answer recorded on any device also suppresses reopening.
3. **Given** no quiz is available today, **when** the member visits, **then** no automatic opening occurs and the visit does not consume it. If content appears later that day, the next eligible visit may open it unless the experience was already closed that day; manual entry presents the absence message and ranking access, with the specified Christmas greeting on 25 December.
4. **Given** today's answer exists, **when** the member enters via the icon, **then** Ranking opens unless an unseen saved result from today has priority. From 26 December through 15 January the icon opens the final ranking for everyone with Calendar available, and no automatic opening or answering occurs.
5. **Given** the icon or automatic surface, **when** the member uses keyboard or assistive technology, **then** focus enters the opened surface and returns appropriately without a trap; announcements and accessible labels follow the UX contract. The icon moves discreetly once on HatCast opening for less than five seconds, and does not animate when reduced motion is requested.
6. **Given** isolated development test mode, **when** the experience is accessed before December, **then** the icon and delivered journey are available under the approved November simulation and visibly marked as test; production never exposes this test access.

**References:** FR-1, FR-2, FR-7, FR-9, FR-12, FR-13; AD-1–AD-3; UX-DR1, UX-DR5, UX-DR7–UX-DR11. Approved by Patrice.

### Story 25.7: Invite members to the daily quiz

As an eligible member who has not yet answered,
I want to receive the usual HatCast invitation to the day's quiz,
So that I can join the daily discovery when my notification preferences permit it.

**Acceptance Criteria:**

1. **Given** 1–25 December and the existing Spring reminder mechanism runs at its intended 09:00 Europe/Paris time, **when** the day's quiz is available, **then** active members of the configured troupe who have not answered are eligible according to their usual notification preferences; the invitation opens the quiz.
2. **Given** the quiz is unavailable at 09:00, or the member has already answered or disabled the applicable usual notifications, **when** the reminder is processed, **then** no invitation is sent for that condition. A quiz published after 09:00 does not receive a catch-up invitation.
3. **Given** the invitation integration, **when** it is implemented, **then** it reuses existing Spring scheduling and HatCast reminder delivery, does not create a fictitious show, and adds no Advent-specific infrastructure, recovery mechanism or delivery guarantee. Existing operational limits apply.
4. **Given** development testing, **when** invitation eligibility is exercised against the simulated day, **then** it uses isolated test data and cannot send production notifications; production and test boundaries are verified before demonstration.
5. **Given** game dates and timezone boundaries, **when** eligibility is checked, **then** server-side Europe/Paris civil time and recorded answers govern the decision, including separate checks of the real December boundaries.

**References:** FR-3, FR-12, FR-13; AD-1, AD-2, AD-5. Approved by Patrice.

### Story 25.9: Measure actual participation

As an organizer,
I want to know how many people played and how many answers were recorded,
So that I can assess participation without exposing the anecdotes.

**Acceptance Criteria:**

1. **Given** real recorded answers, **when** participation is measured, **then** two global totals distinguish unique people with at least one recorded real answer and the total number of recorded real answers; no daily breakdown is required.
2. **Given** development test activity, **when** analytics is emitted or queried, **then** it is excluded from the real totals and no anecdote, statement or selected answer is sent to PostHog.
3. **Given** lost or duplicated telemetry, **when** totals must be verified, **then** recorded database answers are authoritative and can establish both totals; no participation target is imposed.

**References:** AD-6, AD-2; PRD success signal. Approved by Patrice. This is not authorization to analyze existing PostHog data.

## Final validation

- **Coverage:** FR-1–FR-13, AD-1–AD-6 and UX-DR1–UX-DR11 are addressed across stories 25.1–25.7, 25.2a and 25.9. The PRD, UX and architecture remain binding for details beyond this summary.
- **Delivery order:** 25.1 → 25.2 → 25.2a → 25.3 → 25.4 → 25.5 → 25.6 → 25.7; 25.9 follows the recorded-answer capability and remains within the epic. 25.2a was renumbered from 25.8 and moved after 25.2 to make the approved early reset dependency explicit.
- **Checks:** A single user-value epic avoids cross-epic dependency. Each partial checkpoint identifies unavailable later steps; entities are introduced when needed. No starter template is specified. Security and isolation apply from the first exposed checkpoint.
- **Final-ranking test:** Make final-ranking consultation testable in isolated development from 25 November; an earlier-access story is only needed if requested. Verify actual December and January boundaries separately.
- **Status:** Workflow completed; sprint planning will check implementation readiness and tracking.

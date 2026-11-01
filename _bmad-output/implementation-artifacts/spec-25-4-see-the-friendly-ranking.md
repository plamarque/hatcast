---
title: 'See the friendly ranking'
type: 'feature'
created: '2026-10-31'
status: 'in-review'
baseline_commit: 'd7dd7ae4ef473ede33887fb7f0f2f85380598361'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Advent preview cannot show members their revealed scores or the friendly ranking.

**Approach:** Add a protected, consistent ranking and accessible Advent screen, using revealable answers in production and current recorded scores in isolated test mode. Implement the production-needed ranking calculation once and exercise it in isolated development using the test clock and test data, while preserving the boundaries of the later production entry and calendar stories.

## Boundaries & Constraints

**Always:** Include all eligible classable active members by name even at zero; highlight the connected member's score and rank under the applicable production or test rule. Exclude Patrice and Toinou by reliable identity, not display name; each sees their own score under the applicable rule without a rank. In production calculate totals and ranks from revealable answers at one server reference instant after acquiring the shared clock lock and read committed answers before release; return no pending correctness, points, subtotals, progression or derived clues. In isolated test mode show the current ranking from all answers recorded in that database, including unrevealed answers, without reconstructing the ranking at the simulated date. This intentionally permits the test ranking to hint at pending points. Ties receive the lowest position of their group (1, 3, 3, 4; all N tied rank N). Score 10 for correct, 0 for incorrect, plus 1 participation per answer and 2 per non-overlapping group of three consecutive correct answers; incorrect resets the streak, missed days do not. Explain these rules accessibly. Apply authorization, no-store and environment isolation on every request; retain priority reveals and session fencing. At Paris midnight on 25 December the 24th is revealable and ranking is final; member access continues through 15 January and ends 16 January, with results retained. Verify real date boundaries separately from simulated time.

**Never:** Expose real content, answer keys or pending results in public assets, logs or tests; deploy, mutate production or imply a production member journey already exists. Do not add a ranking history or snapshots solely for test mode. Do not implement the complete calendar, the Santa icon or automatic HatCast entry, notifications, or a membership-change mechanism. A direct member journey and its protected production-capable API are explicitly in scope as authorized by Patrice. Preserve the Advent-specific visual isolation and HatCast design system.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Ranking | Active members with and without revealed answers | All classable members appear, including zero; scores use the applicable production or test rule and lowest tie ranks are consistent. |
| Excluded account | Patrice or Toinou connected | Personal revealed score, no rank; neither appears in the list. |
| Pending and midnight | Correct or incorrect answer before and after Paris midnight, including an in-flight confirmation | Production exposes no derived clue before reveal; test ranking includes all recorded answers regardless of simulated date. Transactional reads remain consistent and rollback cannot produce a phantom score. |
| Streak | Correct, missed, incorrect and third/sixth consecutive correct answers | Score and bonus follow the stated rules; missed days do not break the streak. |
| Boundaries and isolation | 25 December, 15/16 January, simulated and actual dates; unauthorized or cross-account access | Final and access boundaries hold, unauthorized requests reveal nothing, and production test controls stay denied. |


## Approved member journey and development clock extension

Patrice explicitly authorized implementing the same Advent journey for ordinary members without the test bar, and an Advent-only server clock offset for local and verified isolated development. The member route and API must be production-capable, not a test facade. In production the effective clock always uses actual server time even when an offset is configured. Apply any offset only after proving the local offline or named development service, project and isolated database boundary; refuse unsafe or ambiguous configuration. Offset applies uniformly to all member Advent access, quiz availability, confirmation, reveal and ranking decisions, never other HatCast features or existing stored dates. Do not deploy or mutate remote data.

A member sees the same Advent visual journey without test controls. Active configured-troupe membership and the server-controlled Paris date govern access. The quiz accepts one durable answer only on its day; no replay, reset, future cases, test session or time control is available to a member. Preserve priority unseen reveal, acknowledge only after display, recovery and cross-device behavior. Ranking uses only revealable answers under one server time sampled after obtaining the shared member transaction lock; never disclose pending correctness, score or clues. Include all classable members, exclude configured stable identities of Patrice and Antoine, and preserve personal score without rank. Use one shared game in each environment: test operators and ordinary members see the same quizzes, answers and ranking population. In isolated development only, an explicit authorized test reset may reset that shared development game; never reset or migrate data silently and never affect production. Preserve existing quiz content and private portrait protections.

The isolated local demo uses fictional or authorized private development quiz content and one shared development game, never production data. An authorized operator configures the offset; ordinary users have no control over it. Member and operator flows share the same presentation and game; only server-authorized test operators obtain the extra controls and test-only disclosure semantics. The Santa icon, automatic entry, complete calendar, notifications and production deployment remain later work.


## Patrice correction: one shared Advent journey

There is exactly one member-facing entry URL and one Advent journey for all members. Remove route-selected modes and do not require selecting another URL or game. On verified isolated development only, the backend determines a test-control capability for the two verified accounts of Patrice and Antoine; only they receive and can invoke the extra time, personal replay and targeted reset controls. The member journey, quizzes, recorded answers, population and ranking source are shared; ordinary members never receive or can invoke these privileged operations. Do not grant test capability to others or on production. Hide the test strip for everyone else. The previous two-route and two-game design is superseded.

Within isolated development, advancing or rewinding the date is a transient simulation local to that operator browser, not a persistent or shared game clock. It must not change the date observed by other accounts or browser sessions. The server validates the simulated date only for a verified authorized operator in an isolated environment; ordinary members and production always use their configured effective server time. Keep the approved operator-only ranking exception: authorized testers may see all recorded test scores; ordinary members see only points revealable at the shared reference time. Production uses only actual time and revealed scores. Preserve prior user data and both existing offline datasets during transition; do not merge, overwrite or delete existing answers automatically. Provide a safe, reversible plan and use fictional fixtures as needed; no cloud writes or deployment. Protect private portrait and no-store, lock and concurrency invariants.

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — existing scoring, reveal and shared clock-row transaction lock; reuse scoring and serialize ranking reads with confirmation and clock changes.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt`, `AdventNoStoreFilter.kt` and `config/SecurityConfig.kt` — existing isolated test authorization, session and no-store protections. The production member route is not yet delivered.
- `troupe_memberships` — configured troupe, active membership and display names; determine exclusion by stable account identity and include eligible members without answers.
- `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` and `shared/advent/_foundation.scss` — existing preview, priority reveal and isolated visual foundation; provide the ranking CTA after answer submission without implying 25.5 is complete.
- `services/api/src/test/kotlin/com/hatcast/api/advent/`, `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and `apps/web/e2e/` — existing H2, PostgreSQL, UI and browser fixtures; use fictional data only.

## Tasks & Acceptance

**Shared journey correction (explicit user direction):**
- [ ] `apps/web/src/app/app.routes.ts` and `pages/advent-test/` — expose one shared Advent URL and the same journey; show additional controls only when a verified server capability permits them; ensure the old URL does not lead to a separate game.
- [ ] `services/api/src/main/kotlin/com/hatcast/api/advent/` and `config/SecurityConfig.kt` — expose a common game and server-authorized privileged test controls on that same state and clock; production and ordinary members cannot invoke privileged actions; keep revealed-score secrecy for members and authorized operator exception.
- [ ] `services/api/src/main/resources/db/migration/` and local fixture operations — reconcile state safely without silently merging or erasing existing answers, quizzes, or development data; no remote or production data mutation.
- [ ] Advent API, Angular and Playwright tests — verify both fictional operator identities and ordinary member on the same URL and shared game, per-browser simulation isolation, replay/reset authorization, denied direct API abuse, 24/25 and 15/16 boundaries, secrecy, offset guards, concurrency and visual isolation.
- [ ] `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` and Advent architecture/UX — remove the two-game/two-route model and document the actual shared journey, browser-local operator simulation and strictly isolated capabilities.

**Execution:**
- [ ] `services/api/src/main/kotlin/com/hatcast/api/advent/` — implement ranking from active member population, stable exclusions and correct tie ranks; production includes only revealable answers and test mode includes every recorded answer regardless of simulated date. Preserve transactional consistency, test isolation and no-store; do not persist a test-only ranking history.
- [ ] `apps/web/src/app/pages/advent-test/` — implement personal score, ranking and accessible scoring legend through the CTA after answer submission; show current test scores and preserve priority reveal, errors and session handling.
- [ ] `services/api/src/test/kotlin/com/hatcast/api/advent/` — exercise the matrix, access and cross-account isolation, actual and simulated date boundaries, PostgreSQL concurrent confirmation/read and rollback.
- [ ] `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and relevant `apps/web/e2e/` — verify ranking states, production pending-score protection, test-mode current scores, keyboard, small screens, enlarged text and scoped visual isolation.
- [ ] `SPEC.md`, `DOMAIN.md`, `ARCH.md` and relevant development documentation — reconcile actual delivered behavior and clearly distinguish preview from production availability.

- [ ] `services/api/src/main/resources/db/migration/` and `services/api/src/main/kotlin/com/hatcast/api/advent/` — implement durable shared member game state separate from legacy test tables, shared quiz/scoring and locked member operations, with actual-time production and a safely gated dev-only Advent offset.
- [ ] `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt` and `AdventNoStoreFilter.kt` — authenticate member endpoints, enforce membership/date server-side, no-store including errors and deny all test controls to ordinary members.
- [ ] `apps/web/src/app/` — add direct member route sharing the Advent presentation through a member API contract; omit test controls and retain accessible priority reveal, answer, confirmation and ranking.
- [ ] `services/api/src/test/kotlin/com/hatcast/api/advent/` and `apps/web/` tests — prove member production rules, clock offset gating, no disclosure, concurrency, boundaries, test/member isolation and shared visual/accessibility.
- [ ] `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` and Advent architecture — document the delivered member and clock boundaries.

**Acceptance Criteria:**
- Given an authorized isolated test session, when a member submits an answer and opens ranking with the CTA, then all eligible classable members and the member's current test score are displayed with correct ranks and accessible scoring rules.
- Given an answer not yet revealable, when production ranking is inspected, then it contains no correctness, points or derived clue about that answer; isolated test ranking includes the recorded score regardless of simulated date.
- Given the 24th's answer, when Paris midnight begins on 25 December, then the final ranking includes it; access remains through 15 January and ends on 16 January while data remains retained.
- Given Advent and existing HatCast surfaces, when the interface is inspected with keyboard, assistive technology, enlarged text and mobile widths, then it remains readable and accessible without altering HatCast styling.

- Given a member on an isolated local or verified dev server with an authorized Advent offset, when opening the member journey, then the shared interface follows the offset date without showing or permitting test controls.
- Given any production or unverified environment with an offset configured, when evaluating Advent time, then production uses the real clock and no test or offset controls can be activated.
- Given an ordinary member, when answering on the current Paris day, then the answer is unique and recoverable; future or past answers, replay and premature result or score disclosure are denied.
- Given concurrent confirmation and ranking or reveal, when a member read takes the shared lock, then it samples its reference time after locking and sees only committed revealable answers.

## Implementation Notes

The member journey extension was authorized by Patrice after the initial approval. The isolated test ranking includes recorded answers regardless of simulated date and uses explicitly configured stable user IDs for exclusions. At the previous checkpoint the production-capable member API and answer storage were not implemented; the later shared-journey extension supersedes that status. No production deployment or live environment verification has occurred.

## Spec Change Log

- Patrice corrected the earlier design: one shared entry and shared game for all members; only Patrice and Antoine have additional test controls in isolated development. The two-route/two-game direction is superseded. Patrice subsequently clarified that date movement is a non-persistent browser-local simulation and does not change the date for anyone else. Preserve real data, safety, and ordinary member score secrecy.

- Review found the final ranking inaccessible after 24 December, a portrait download under the global lock, and missing HTTP authorization coverage. Preserve the existing Advent visual journey, reveal priority, isolated clocks and no-store while fixing these cases.

- Patrice authorized a production-capable member journey with a server-side Advent clock offset confined to local and verified isolated development, while retaining the separate administrator test mode.

- Patrice clarified that ranking is opened by a CTA after submitting an answer; do not introduce additional navigation paths.

## Review Triage Log

- **High — fixed:** Shared-game reset did not fence ordinary-member delayed requests. Every member now receives a game generation and stale requests are rejected.
- **Medium — fixed:** Retrying the same reservation caused a duplicate-key failure; matching retries are idempotent and cross-account/day collisions remain rejected.
- **Medium — fixed:** A conflicted old offline quiz could prevent the latest independent reveal; conflict handling now preserves independent eligible results while ranking fails closed on ambiguous scores.
- **Medium — fixed:** The date control stopped at 25 December even though ranking remains available until 15 January.
- **False:** An out-of-season development server without the operator-configured base offset cannot open the game; the approved recipe configures that offset, and the controls are only intended for the supported Advent access window.
- **Medium — fixed:** HTTP tests now compare authorized operator and ordinary-member ranking results for a pending answer.
- **Medium — fixed:** The operator previously sent a simulated date immediately, freezing the date across midnight without a click. The simulated header is now sent only after explicit interaction.
- **Medium — fixed:** Failed navigation could leave stale content associated with a changed simulated date. The transition now shows an error and retries the intended date without bypassing priority reveal.
- **Medium — fixed:** HTTP tests now reserve and confirm a quiz available only through an authorized simulated-date header.

- **High — fixed:** Both blind and edge reviews found no member UI access to final ranking from 25 December to 15 January; add a final-ranking CTA while retaining unseen-result priority.
- **Medium — fixed:** The controller retained the shared member lock during private portrait download; remove its outer transaction so the quiz read completes before network I/O.
- **Low — rejected:** Pre-extension notes in this spec described the earlier state; the later extension and verification entries supersede them. This is a documentation-only finding about the spec itself.
- **Medium — operational boundary:** Two existing but incorrect exclusion UUIDs cannot be automatically identified from UUID existence alone. Runtime rejects missing, malformed or nonexistent IDs; operators must independently verify the two identities against the target database before configuration. Real dev and production identities have not been verified.
- **Medium — fixed:** HTTP authorization for member POSTs and cross-account mutations lacked regression coverage; extend security tests for anonymous, nonmember and authorized accounts.
- **Medium — fixed:** Verification review independently identified the same missing POST authorization coverage; the extended HTTP tests exercise the endpoint boundary.

## Verification

Shared journey and local simulation: 57 Angular tests, 12 Playwright scenarios, focused H2 game/security/portrait tests, disposable PostgreSQL migration/concurrency tests and the production frontend build passed. A fresh isolated H2 three-account browser run confirmed one shared URL and game, privileged controls for the two fictitious operators, no controls for the ordinary member, and an operator simulation that left the other two dates unchanged. A final Tailscale check confirmed all three fictitious accounts, common URL and per-tab date behavior. Dev cloud identity/configuration and production deployment remain unverified; BUG-054 remains recorded for the global PWA install banner at 320 px and 200% text.


Member extension: targeted H2 security/clock/game tests passed; disposable PostgreSQL concurrency passed; 46 Angular tests and production build passed; Playwright mocked member and existing test flows passed, with separate recorded BUG-054 for global PWA banner overflow. Real local H2 and Tailscale Playwright confirmed member answer uniqueness, neutral confirmation, no-store, pending-score privacy, test-control denial, and revealed fictional scores; development cloud isolation and its configuration have not been verified live, nor has a production deployment occurred.


2026-10-31: focused ranking calculator, H2 integration and security tests passed; 45 Angular tests passed; PostgreSQL 16 concurrency and rollback test passed; production Angular build passed with Sass and CSS budget warnings. Playwright verified keyboard, focus, 320–1280 px at 200% and style isolation using mocked API. A separate real offline H2/API browser run passed with fictional users, no-store, pending result denial, stale session and exclusions. The actual production route and clock transaction remain unverified and real excluded account IDs are not configured. Screen-reader inspection is not exhaustive.


Run focused Advent API and security tests on H2 and disposable PostgreSQL, including concurrency and rollback; run Angular tests and production build, browser and accessibility checks at mobile and desktop sizes, and verify Advent style isolation. Report any unverified production boundary or accessibility limitation.

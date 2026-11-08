---
title: 'Edit Advent quiz content before its day'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '734be68260f37eabd294bf5760d9c8aa02558bf8'
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Updating an existing Advent quiz requires operator intervention and does not give the content managers a simple editing interface.

**Approach:** Give Patrice and Antoine a private form to edit existing quizzes until the start of their day, saving directly to the current environment database without a redeployment.

## Boundaries & Constraints

**Always:** Authorize verified active members Patrice and Antoine on every private read and write. The actual server time in Europe/Paris freezes all edits at the beginning of the quiz day, independent of simulated clocks. Preserve the three ordered statements, associated optional narratives, false choice and optional result explanation. Save atomically; detect concurrent edits; preserve unsaved input on errors. The database is the reference for content served in each environment. Adapt synchronization to prevent silent overwrites from stale catalogue content. Maintain privacy, no-store, CSRF, existing game behavior and Advent visual isolation.

**Never:** Create or delete quizzes; change day, person or portrait; edit after the day starts; change game state, scores or answers; write real content, deploy or synchronize production as implementation work. No editing of elves or bulk editor.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Authorized future quiz | Existing day, valid content | Private form loads and saves all editable fields atomically to this environment |
| Denied or missing | Other account, unverified/inactive member, missing day | No content disclosure or write |
| Midnight | Before, at or after Paris day start; stale page or simulated time | Save allowed strictly before real start only; refusal preserves draft |
| Concurrent change | Content changed after form read | Refuse stale save; retain draft and allow reload |
| Operator sync | Catalogue and existing database disagree | No silent replacement; explicit safe reconciliation preserves intentional edits |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`, `AdventMemberGame.kt`, `AdventMemberClock.kt`, `AdventTestAnswers.kt`: active membership and verified preview checks, real clock and game locks; add separate server-side edit capability and private projections, preserve normal projections and answer snapshots.
- `services/api/src/main/resources/db/migration/V75__advent_quizzes.sql`, `V84__advent_long_stories.sql`: ordered editable fields. Use concurrency protection and transactional locking, checking real time after locks.
- `services/api/src/test/kotlin/com/hatcast/api/advent/AdventMemberSecurityTest.kt` and game/integration tests: exercise HTTP security, no-store, time and transactions with fictional fixtures.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `.scss`, `.spec.ts`: private calendar, session and CSRF helpers; use separate sibling controls, private editor data, draft-safe conflict handling, real server capability, not simulated client time.
- `scripts/v2/advent-catalogue-cloud-content.mjs`, `advent-catalogue-reservations.mjs`, `advent-catalogue-operator.mjs`, local H2 sync: protect every applicable update path from stale source overwrites; retain explicit target protections.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`, Advent architecture and `docs/v2/technical/AVENT_CATALOGUE.md`: reconcile older catalogue-canonical wording and freeze rules. Adapt the `hatcast-avent-lutin` contribution workflow.

## Tasks & Acceptance

**Execution:**
- [x] API: implement explicit edit capability, validated private reads and atomic version-checked writes using real Paris time; retain authentication and game locks.
- [x] Web: implement accessible private entry and form, errors, conflict and expiry with preserved draft.
- [x] Sync and documentation: protect cloud, local and legacy operator routes and update reference and reconciliation procedures, including contribution skill.
- [x] Test the matrix, denied access, CSRF/no-store, field associations, concurrent updates, exact time boundary, synchronization divergence and accessibility with fictional data.

**Acceptance Criteria:**
- Given an authorized editor and an existing future quiz, when valid changes are saved, then only its content changes in the selected environment and is served without deployment.
- Given a denied user or an expired or stale write, when the API is called directly, then no unauthorized content or mutation occurs.
- Given an old catalogue conflicts with edited database content, when synchronization is attempted, then it cannot silently overwrite that content.

## Implementation Notes

- Editor and synchronization use versioned content; real Paris time is checked after locking and before update. Private day projection refreshes at the next boundary.

## Spec Change Log

## Review Triage Log

- low: Early preview or isolated test answers can predate a future quiz edit; their stored answer key can then differ from current text. These are excluded preview/test paths; the user explicitly chose the real-day freeze without handling earlier answers. Preserve this limitation.
- false: DOMAIN's exceptional in-play edit warning remains applicable to separate operator synchronization; the UI alone is frozen at the day boundary.
- false: The global `hatcast-avent-lutin` skill is outside Git and was updated separately; repository documentation also describes reconciliation.
- medium: Temporary editable-days request failure hid the controls until another reload; bounded retry and cleanup added.
- low: Optional whitespace-only fields were rejected without identifying the field; the UI now treats whitespace-only optional content as empty.
- low: No explicit preview-answer-then-edit result test exists; this deliberately accepted exceptional preview/test inconsistency is outside the chosen freeze rule.
- medium: A clock check before UPDATE could cross midnight; the SQL write now checks a database wall clock in its predicate.
- medium: PostgreSQL concurrency test was not selected or required by CI; the workflow now selects and validates it.

## Verification

- 15 targeted H2/API security tests and 234 Angular tests passed; Angular build passed. 61 synchronization tests passed; H2 failure fixed and targeted test rerun passed. Fictional Playwright editor and style-isolation checks passed. Isolated PostgreSQL 16 concurrency and midnight lock test: one selected test passed, zero skipped. No cloud data accessed.

Run targeted API Gradle tests, Angular tests and build, synchronization tests and relevant browser checks with nonzero test selection. Verify 320px, 200% text, keyboard, reduced motion and HatCast style isolation; record Material checklist and any limitations.

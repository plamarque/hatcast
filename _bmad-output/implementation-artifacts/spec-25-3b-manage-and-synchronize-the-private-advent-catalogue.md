---
title: 'Manage and synchronize the private Advent catalogue'
type: 'feature'
created: '2026-10-31'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '8ab615ec7df971fd9896e5e3b071e22a6ac8d817'
feature_branch: 'feat/25-3b-manage-and-synchronize-the-private-advent-catalogue'
context:
  - 'docs/v2/technical/AVENT_CATALOGUE.md'
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Preparing an Advent character, its illustration and its quiz is currently coupled; moving content into individual environments is manual and cannot safely reset a selected test contribution and its game data.

**Approach:** Keep the private catalogue canonical and provide a documented workstation workflow to prepare and synchronize character reservations, portraits and quizzes independently to a verified target. The existing game reads its environment's database and private portraits; a reserved character without a complete quiz remains unavailable to members.

## Boundaries & Constraints

**Always:** Each character is assigned one fixed calendar day; adding its quiz later or synchronizing another environment never silently changes its day or reassigns existing characters. Accept a character and portrait without quiz; accept later independent quiz updates without requiring a new portrait. Keep future content and personal data private. Use only explicitly validated real contributions; distinguish fictional placeholders. Select local, development, staging or production explicitly; verify target identity, isolation and permissions, failing closed on ambiguity. Compare and apply selected content without leaking it, using retryable operations and existing credentials. Keep one private shared bucket for canonical catalogue and generated images and separate environment databases; do not introduce new cloud identities or APIs. Preserve other days, global sessions and unrelated data.

**Test deletion:** On explicitly selected verified local, development or staging targets, provide targeted deletion of selected contribution days and their associated answers, attempts, generations, replays and other day-specific game state, regardless of whether test content matches the catalogue. Prevent in-flight operations from recreating orphaned state; preserve other days and global state. Scores and streaks must remain coherent after deletion. A target deletion does not delete the canonical contribution, release its fixed day, or delete the shared portrait. Actual deletion requires a separate explicit operator action; implementation and disposable tests do not authorize deleting real environment data.

**Production:** Allow explicit, verified content preparation and synchronization after separate authorization, but forbid this tool from deleting production contributions or game state, even if requested through a test path. Existing production answers and game state are preserved. Do not perform production writes or any deployment as part of implementation without separate explicit authorization. Retain Patrice's accepted risk for exceptional edits during play; do not introduce snapshots or versioning for that risk.

## I/O & Edge-Case Matrix

| Scenario | Expected behavior |
|---|---|
| Character without quiz | Reserve its fixed day and synchronize its private portrait to the chosen target; do not expose an incomplete quiz or future identity to members. |
| Quiz updated independently | Synchronize the selected quiz while retaining its day and portrait; no replacement image required. |
| Conflict in fixed ordering | Refuse silent reassignment; preserve canonical entries and report an actionable conflict without revealing content. |
| Delete in a test target | Explicitly selected days and their linked game state are removed transactionally even when contents differ; other days, shared portraits and source remain. |
| Delete in production or ambiguous target | Refuse before mutation; production has no test deletion path. |
| Failure or concurrent play | Prevent stale attempts or orphaned answers, rollback database changes on failure and provide safe retry without deleting shared assets. |

</frozen-after-approval>

## Code Map

- `scripts/v2/advent-catalogue-validation.mjs`, `advent-catalogue-{operator,sync,local-sync,database,local-apply}.mjs`, `AdventLocalH2.java` — existing validation and synchronization assume complete quizzes; introduce independent character and quiz operations, verified target deletion and equivalent H2/PostgreSQL behavior.
- `services/api/src/main/resources/db/migration/V75__advent_quizzes.sql` and subsequent migrations — quizzes require complete statements; use an additive migration for fixed-day character reservations without changing existing quiz meaning or exposing incomplete quizzes.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt`, `AdventTestAnswers.kt` — member lock, legacy test clock lock and day-specific attempts, answers, generations and replays; handle concurrency and derived scores/streaks safely. Preserve global discovery and unrelated days.
- `AdventMemberController.kt` and private bucket configuration — enforce existing membership, reveal and no-store boundaries; target deletion must never delete shared bucket assets.
- `scripts/v2/advent-catalogue-neon-verification.mjs`, `advent-catalogue-cloudrun-binding.mjs` — verify effective environment before any operation; production deletion denied regardless of caller arguments.
- `docs/v2/technical/AVENT_CATALOGUE.md`, `SPEC.md`, `DOMAIN.md`, `ARCH.md` and Advent architecture — reconcile contracts and operation guide with actual behavior, keeping current runtime separate from undeployed changes.
- `scripts/v2/story-branch.sh`, `story-status-sync.py` — recover the existing tracker conflict through the supported controller; do not manually rewrite tracker or discard the existing worktree.

## Tasks & Acceptance

- [x] Design and implement private fixed-day character reservation and optional quiz while preserving existing catalogue data, existing quizzes and privacy.
- [x] Implement independent selected character/portrait and quiz synchronization for verified local, development, staging and production targets, without fake quiz contents.
- [x] Implement explicitly invoked selected-day deletion plus linked game state only in verified local, development and staging, preserving shared portraits, source catalogue, other days and global state; categorically reject production.
- [x] Exercise insertion, separate updates, fixed ordering, replay, retained days, test-only deletion, stale attempts, derived scoring, rollback, privacy and production refusal with fictional data and disposable H2/PostgreSQL targets.
- [x] Update the operator guide and normative documents and reconcile with current `v2`, preserving the in-progress work and using the tracker controller.
- [x] Verify the actual configured cloud operator and runtime when a separately authorized deployment permits it; do not call a mock configuration check proof of live access.

## Implementation Notes

2026-11-01: With explicit authorization, the standalone operator synchronized one selected existing quiz in development. Independent before/after digests confirmed the quiz, member answer, legacy test answers and character reservation were unchanged. A fresh private comparison found the reservation linked and quiz identical; catalogue temporary holds were released. This proves the separate unchanged-quiz path, not a changed real quiz. No reset, deletion or staging or production data write occurred.

2026-11-01: With explicit authorization, the standalone operator synchronized one selected existing character in development, linking its reservation to the private catalogue. Before/after digests confirmed the quiz and member answer were unchanged. A fresh private comparison confirmed the reservation was linked; the catalogue and portrait temporary holds were released. No reset, deletion or staging or production data write occurred.

2026-11-01: The authorized development revision `hatcast-v2-dev-00254-rat` serves the 25.3b API in an image based on the prior development web image. Flyway V82 succeeded; the root returned HTTP 200. Seven previously referenced development portraits matched in both private buckets. The source, target database and Cloud Run binding checks succeeded after correcting BUG-070. This manually built development image is not a GitHub Actions release. Subsequent verification of the selected character, quiz and member portrait is recorded separately. No staging or production deployment or data write was performed.

2026-11-01: The story branch was reconciled onto v2 commit 3abee4cac7f1b3e0333cecc3f7f30d12b8e265f3. The supported tracker controller added the story and set it in-progress; the integration checkout and its unrelated uncommitted changes were preserved. Implementation and review fixes were verified on fictional and disposable data. Live Cloud Run access and deployment remain unverified and separately authorized.

The following observations are historical; the 2026-11-01 user decisions above supersede earlier statements that all test game state is always preserved or that replacements require no prior activity.

The workstation operator compares selected validated contributions against a verified target; local and cloud replacements require explicit day-specific confirmation, unchanged prior content and absence of game activity. H2 remains exclusive throughout review and transaction, while its local portrait directory requires cooperation from other processes. Production begins with a read-only comparison and requires a second interactive authorization bound to the in-memory plan before applying; this is operator intent, not an independent approval service. No production database write or deployment was performed.

The implemented cloud design uses the shared private content bucket for the catalogue and portraits, with simple database references resolved as `portraits/<filename>` by the updated runtime. The deploy workflow explicitly supplies the shared bucket and portrait-layout marker for each target. The synchronizer protects the source catalogue and selected shared portrait objects once, without copying them or acquiring duplicate holds. It validates the named operator, bucket privacy and effective operator permissions, Neon identity and active Cloud Run binding. Its runtime-access configuration check reads the existing unconditional project Editor binding; it neither creates nor changes that role. The binding is broader than portrait access and does not prove absence of deny policies or principal access boundaries. No Policy Troubleshooter or service-account impersonation is required. Cloud checks are tested with doubles; a successful configuration check alone is not proof of effective runtime access.

Private image migration, 2026-10-31: the actual inventory found ten images already identical in the shared bucket and eight absent images, which were copied additively without overwrite. The old preview bucket and its objects were preserved. This shared-bucket preparation does not mean the currently deployed service already reads the shared bucket or the `portraits/` prefix. Deployment and runtime access verification remain separate authorized steps.

Real development acceptance before the shared-bucket change, 2026-10-31: selected contributions for days 2–4 were synchronized using a temporary adapter; a fresh comparison found them identical, the user confirmed display, and answers were preserved. That historical demonstration does not validate the updated standalone operator, shared-bucket runtime or an undeployed revision. Complete integration, review and real acceptance before marking done.

Patrice noted a future need for two visual uses per character: a full-body elf illustration and a separately framed face for quiz/result circles, potentially elsewhere. Today the same image is enlarged/cropped in CSS. Preserve existing full-body assets during the single-bucket migration; do not assume a separate face asset exists or change member behavior in this catalogue story. A later visual/UX decision can choose a derived crop or a new illustration and define the separate reference, fallback, privacy and synchronization contract.

## Spec Change Log

- 2026-11-01: Patrice expanded scope to independent characters and quizzes, fixed character-to-day assignments, all target environments, and explicitly selected deletion of test contributions and their linked game state; production deletion remains forbidden. Historical review records below describe the previous contract.

## Review Triage Log

- **Medium — patch:** On current v2, an added direct controller construction needs the new portrait storage dependency. The correction is prepared for the v2 reconciliation; the old story checkout does not contain this test.
- **Medium — patch:** Offline deletion removed the reservation and allowed the next offline seed to recreate a fictitious quiz. A targeted deletion marker persists across restart and is cleared when the day is prepared again; restart is tested.
- **False:** An existing fictional reservation blocks assignment without first deleting test data. Explicit targeted deletion is the requested operation for differing test contributions; it removes the selected test reservation and its associated game state, preserving the canonical assignment and shared portrait.
- **Medium — patch:** A legacy local reservation may use a simple portrait name while new synchronization uses a content-addressed filename. The operator compares verified portrait bytes for either operation; matching legacy portraits are covered by H2 tests.
- **Medium — patch:** Production comparison required write rights before review, blocking a read-only operator. Read rights suffice for comparison; write permissions are checked only after the two confirmations.
- **Medium — patch:** The production confirmation test covered acceptance only. A disposable database test now rejects an incorrect second confirmation and verifies unchanged content.

- **Medium — patch:** Catalogue CI omitted the PostgreSQL integration and local H2 integration tests; both exercise refusal when game activity exists. Run both in CI and include H2 Java and migration paths in the workflow trigger.
- **Medium — patch:** Offline sync requires private existing directories and H2 database; the normal offline startup does not set these permissions or create the portrait directory. Document the prerequisites explicitly.
- **Medium — verification gap:** An unconditional project Editor binding is a configuration check, not proof of effective runtime bucket access and may reject a narrower valid grant. Preserve the existing approach but require separate real runtime access proof; no such proof exists for the undeployed shared layout.
- **Low — patch:** Indexed PNG palettes larger than their bit depth permits were accepted. Reject the invalid palette and cover it with a synthetic regression test.

- **False:** Production support requires a second explicit authorization; the ban applies to operations during this story, not implementing a separately authorized future production path. No production write was performed.
- **Medium — patch:** Operator documentation incorrectly says no cloud migration despite the verified eight additive portrait copies.
- **Medium — patch:** Operator dependencies on Google authentication and storage are only transitive; a clean install can fail.
- **Low — patch:** The unused alternate GCS store path assumes root objects although the adopted layout uses `portraits/`; remove or align it to prevent misuse.
- **False:** Noninteractive production is rejected, and dedicated `runOperator` tests exercise the separate interactive production authorization; the spec does not require production code to be permanently disabled.
- **Medium — patch:** A successful hold with a lost response may be left behind before ownership is recorded; recover only an owned, matching generation and retain safe ambiguous-state handling.
- **High — patch:** Development binding omits independent checks that other environments use different databases, risking accidental production data mutation if deployment configuration drifts.
- **Medium — patch:** Existing tests exercise only the portrait-name helper and offline controller; cover the actual cloud controller loading and returned bytes.
- **Medium — patch:** Catalogue tests are not selected by existing standard CI commands; register them.

## Design Notes

A reservation is separate from a playable quiz; members still receive the existing unavailable state until a complete authorized quiz exists. Deleting one test target must not delete the image from the shared bucket. Preserve locking and session behavior while recalculating derived test scoring where required. Implement only the safeguards needed for the existing privacy, environment isolation and concurrent game behavior.

## Verification

2026-11-01 closure evidence: an authenticated member revisited an existing result in development revision `hatcast-v2-dev-00254-rat`; its private portrait loaded as a 1024-pixel PNG, and Cloud Run logs recorded successful Advent API responses for that revision. The character and quiz synchronization paths had separately been exercised on the verified development target with the existing answer preserved. No changed real quiz, reset or production write was needed for this evidence.

2026-11-01 after reconciliation: 47 catalogue Node tests, 14 disposable H2 tests, disposable PostgreSQL catalogue integration, the full Advent Gradle suite and tracker-controller tests passed. The seven PostgreSQL-dependent Advent tests initially skipped were then run against a separate disposable PostgreSQL instance: seven passed, none skipped. `git diff --check` passed. No live cloud acceptance or deployment was performed.

Run focused tests with fictional catalogue data and disposable PostgreSQL, including independent content, concurrent changes, failed storage operations, rollback, target mismatch, scoped deletion, production denial and preservation of unrelated game state. Validate local target behavior separately and check that outputs and Git diff contain no private content. Do not execute against production or assume documented identities prove current permissions.

Verification on 2026-10-31: cloud binding, IAM checks and holds were tested with doubles; these checks do not establish the active service's effective access or show that the shared-bucket runtime was deployed. The pre-existing Editor role was not expanded or removed. The current matrix audit and live acceptance remain separate from the automated checks.

Verification rerun on 2026-10-31 in the story worktree:

- `node --test scripts/v2/advent-catalogue-*.test.mjs` — 46 passed.
- `NODE_PATH=/Users/patrice/GitHub/hatcast/node_modules bash scripts/v2/advent-catalogue-database.test.sh` — disposable PostgreSQL V70–V78 passed, including transaction and race checks.
- `ADVENT_H2_JAR=/Users/patrice/.gradle/caches/modules-2/files-2.1/com.h2database/h2/2.3.232/4fcc05d966ccdb2812ae8b9a718f69226c0cf4e2/h2-2.3.232.jar node --test scripts/v2/advent-catalogue-local-h2.integration.mjs` — nine passed.
- From `services/api`: `./gradlew test --tests '*AdventPortraitObjectTest' --tests '*AdventOfflinePortraitTest'` — passed.

Verification update (single private bucket): 44 catalogue Node tests, nine disposable H2 integration tests, disposable PostgreSQL V70–V78 integration, and AdventCloudPortraitTest, AdventOfflinePortraitTest and AdventPortraitObjectTest passed. Review fixes cover lost hold responses, cross-environment database separation, controller cloud image loading, CI registration and direct dependencies. All eight previously missing preview elf images were copied additively to the shared bucket and verified; ten were already identical. Actual Cloud Run still points to the previous bucket and the shared-bucket image lookup has not been deployed. The standalone cloud operator refuses the old runtime layout until deployment; no production write or deployment occurred.

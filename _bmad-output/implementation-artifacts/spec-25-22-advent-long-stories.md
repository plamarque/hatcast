---
title: 'Optional long Advent stories after reveal'
type: 'feature'
created: '2026-11-05'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 41f193d6a5f9487c919ef957fcec4046ad34c41c
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Some contributors tell stories too long for mobile answer choices. The current catalogue and runtime store one optional reveal explanation, not distinct full stories. One currently published quiz was accidentally truncated during preparation.

**Approach:** Support optional full stories associated with the three concise choices, available only with an authorized result after reveal; keep existing results and explanations unchanged when no stories exist. Use the approved private draft for local human validation. Extend the existing HatCast Advent elf skill to prepare complete contributions, including quiz text, private catalogue updates and explicitly targeted database synchronization.

## Boundaries & Constraints

**Always:** Preserve choice order and false index, scoring, current result and explanation, private membership and no-store protections, Paris reveal timing, authorized preview and test behavior. Real stories, answers, and portraits remain outside Git, logs, public assets and bundles. Existing catalogue entries and databases remain compatible. Source and target identity, generations, permissions, and game data protections remain enforced by the operator tools. Changes to the Advent UI stay within its isolated visual identity.

**Never:** Send full stories in the playable quiz, its errors, metadata or other pre-reveal projections. Do not fabricate stories for other contributors, reset or delete game data, modify the private cloud catalogue or any cloud database, push, or deploy as part of this implementation. Existing local data must not be overwritten without an isolated and verified test target.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Existing quiz | No stories; explanation present or absent | Existing quiz and result remain unchanged | No empty stories section |
| New quiz | Concise choices and optional multiline stories | Authorized revealed result presents each supplied story under its corresponding choice | Invalid catalogue data refuses synchronization without partial writes |
| Before reveal | Normal play or waiting | No full story in API responses, HTML, client state, cache or logs | Authorization and no-store preserved |
| Authorized result | Normal reveal, past result, authorized preview or test | Full stories returned only under the existing applicable result authorization | Existing unavailable and error behavior preserved |
| Old source | Catalogue lacks the new field | Existing contributions validate and synchronization does not silently delete previously stored stories | Detect ambiguous removal and stop or require an explicit reviewed operation |
| Narrow display | 320–430 CSS px and enlarged text | Stories preserve paragraphs, scroll naturally, and open with accessible controls | No horizontal overflow, clipping or lost focus |

</frozen-after-approval>

## Code Map

- `services/api/src/main/resources/db/migration/` — additive migration for optional structured story data; support PostgreSQL and H2, preserve prior rows.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` and `AdventMemberGame.kt` — extend stored quiz and result projections; reveal-only output and existing explanation.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` and `AdventTestController.kt` — audit all door, result, history, preview, and test projections for release timing and privacy.
- `scripts/v2/advent-catalogue-validation.mjs`, comparison, reservations, cloud content, local apply, and `AdventLocalH2.java` — validate and synchronize the optional field transactionally, preserving old sources and conflict checks; update synthetic integration fixtures.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, and `advent-result.scss` — add accessible, collapsed, optional story panels to the current result; preserve existing result, historical paths and explanation; do not alter global HatCast styles.
- `docs/v2/technical/AVENT_CATALOGUE.md`, `SPEC.md`, and Advent UX contracts — document the backwards-compatible field, reveal contract and operator process without real content.
- `/Users/patrice/.codex/skills/hatcast-avent-lutin/SKILL.md` has been extended for contribution preparation, guarded publication and explicitly authorized synchronization while preserving its portrait workflow. Verify its instructions against the implemented schema.

## Tasks & Acceptance

**Execution:**
- [x] Register the story through the repository's planned tracking and worktree lifecycle; keep unrelated work and existing completed stories intact.
- [x] Implement the additive data representation and migration; validate optional story cardinality, ordering, multiline Unicode and backward compatibility.
- [x] Extend private catalogue compare and guarded cloud/local synchronization; maintain exact source text and avoid accidental deletion when older catalogue data omits stories.
- [x] Return stories only in authorized revealed result projections, including priority, past, late, test and preview paths where applicable; retain every existing security boundary.
- [x] Implement optional accessible story panels after the existing result card and explanation; preserve normal result when absent.
- [x] Update normative documentation and extend the existing elf skill to cover complete contribution preparation, catalogue publication and database synchronization; check that each prepared story retains all paragraphs and matches the approved source.
- [x] Prepare the approved content only in a verified isolated local test target; provide a working full-stack link for human review when feasible. Do not write the canonical catalogue.
- [x] Verify synthetic cloud/local sync, migration, API privacy and reveal, frontend behavior and mobile visuals; check M3 and Advent isolation.

**Acceptance Criteria:**
- Given a quiz with full stories, when an ordinary member requests playable content or a pending result before the permitted instant, then no story is present in any response; after authorization and reveal, the exact ordered stories are available.
- Given a quiz without stories, when a member views its result, then the current result, score, explanation and navigation remain unchanged and no empty story panel appears.
- Given a result with stories, when a member opens each panel by touch or keyboard, then the corresponding complete paragraphs are readable at narrow widths and enlarged text; all controls and focus remain usable.
- Given a previous catalogue or database, when new code reads or synchronizes it, then existing data and stories are preserved or an explicit conflict prevents an ambiguous operation; game data is never deleted.
- Given a long submitted contribution, when the extended elf skill is used, then it proposes concise choices, preserves complete approved narratives, verifies every paragraph, and can update the private catalogue and explicitly authorized target databases using the documented guards.
- Given the local preview, when Patrice exercises the quiz and simulated reveal, then the approved short choices and all three complete narratives can be reviewed without changing the private cloud catalogue.

**Material 3 and Advent:** Use accessible Material controls where applicable, Advent-scoped tokens, readable text and touch targets of at least 44 px; verify 320, 375, 390 and 430 px, 200% text, keyboard/focus, reduced motion and no style leakage outside Advent. Follow FRONTEND_UI.md, DESIGN.md, EXPERIENCE.md, AD-7 and `_bmad-output/test-artifacts/test-design-advent-visual-isolation.md`.

## Implementation Notes

- The previously approved standalone mockup is private and not integrated with the application.
- The integration checkout currently has a local-only preview specification commit ahead of `origin/v2`; the normal story controller starts from the remote baseline and must not discard it or push it without authorization.
- The existing installed skill was updated and validated outside the repository; confirm it matches the final implementation.

- API, catalogue operators, additive migration and optional result panels are implemented. Synthetic H2, PostgreSQL, API, Angular and visual isolation checks passed. The private isolated authenticated browser journey verified pre-reveal no-store privacy and exact revealed narratives. Phone acceptance remains a separate human review.

## Spec Change Log

## Review Triage Log

- Medium: H2 fixture omitted migration V83; corrected the migration range.
- Medium: synchronization plans did not identify explicit story deletion; added per-choice addition, modification and removal summaries without content.
- Medium: automated HTTP secrecy coverage needed strengthening; added targeted result and reveal coverage; authenticated private journey also verified pre-reveal no-store responses.
- Medium: priority result story ordering lacked dedicated coverage; added result assertions.
- Medium: historical and late results lacked dedicated story coverage; added assertions.
- Medium: test-mode result and latest-unseen lacked story coverage; added ordered multiline assertions.
- Medium: local independent quiz updates lacked explicit story removal coverage; added H2 integration test.
- Low: validation edge cases lacked coverage for all-null stories and reserved entries; added tests.
- False: enlarged-text story overflow was claimed unverified; the synthetic mobile browser check and inspected 320px screenshot cover the open panel at 200%.
- Medium: edge-case reviewer independently identified the H2 migration omission; same corrected root cause as the first finding.
- Medium: verification-gap reviewer independently identified the test-mode result gap; same corrected root cause as the sixth finding.

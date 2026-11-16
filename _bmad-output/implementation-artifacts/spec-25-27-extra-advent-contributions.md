---
title: 'Capture extra Advent contributions'
type: 'feature'
created: '2026-11-15'
status: 'done'
route: 'dispatch'
baseline_commit: 'fabe2693f86b9d7d4d8a314a0df080beb181222d'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The private catalogue accepts exactly 24 playable day entries and cannot preserve additional contributions for future decisions.

**Approach:** Keep the 24-day schedule intact and capture additional contributions in a separate validated collection in the same private catalogue. Capture Céline after the tooling is verified.

## Boundaries & Constraints

**Always:** Preserve the existing 24 days, ordering, identities, content, portraits and privacy. Validate the whole catalogue and globally unique contributor identities. Keep the full approved narratives, selected false answer and explanation. Preserve generation-match protection and verify published bytes and portraits. Support optional desired dates without treating them as playable assignments.

**Never:** Change the game, ranking, API, UI, database contents or game state; infer future display; expose private content in Git, logs or client bundles; overwrite concurrently changed catalogue or portrait objects.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Existing catalogue | Version 1, 24 days, no extras | Existing selection produces identical rows | Reject invalid existing content |
| Extra capture | Several complete extras with stable distinct identities and optional intended dates | Preserve all fields and Unicode narratives | Reject malformed entries and duplicate identities without revealing content |
| Selection | Day 26 or an extra identifier | No extra is selected for synchronization | Reject selection |
| Concurrent update | Catalogue generation changes after read | No overwrite | Stop and reread before retry |
| Portrait | Missing or conflicting extra portrait | No catalogue publication | Stop and report privately |

</frozen-after-approval>

## Code Map

- `scripts/v2/advent-catalogue-validation.mjs` validates the 24 entries and projects only selected playable days; extend full validation without extending projection.
- `scripts/v2/advent-catalogue-gcs-source.mjs` reads an exact generation, validates and enforces a 2 MB limit; preserve generation checks and consider extra payload size.
- `scripts/v2/advent-catalogue-validation.test.mjs` and `scripts/v2/advent-catalogue-gcs-source.test.mjs` contain synthetic catalogue fixtures.
- `docs/v2/technical/AVENT_CATALOGUE.md` documents private source, operator safeguards, portrait creation and publication.
- Private local Céline draft and portrait under the integration checkout `.local/avent-contributions/celine-26/` are inputs; do not copy into Git.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/advent-catalogue-validation.mjs` — add optional distinct extra-contribution collection and full validation, with globally unique stable identities and optional valid date, while preserving day-only selection.
- [x] `scripts/v2/advent-catalogue-validation.test.mjs` and relevant GCS source tests — cover old catalogues, multiple extras, duplicates, malformed fields, long Unicode stories and rejection of day 26; verify selection results stay identical.
- [x] `docs/v2/technical/AVENT_CATALOGUE.md` — describe schema, safe capture, immutable portrait handling, whole-document preservation, generation-match and reread; clarify extra entries cannot be synchronized or played.
- [x] Private catalogue operation — verify bucket identity/access and current generation; compare the complete existing document, add only validated Céline with exact approved portrait and texts, validate all entries and required portraits, publish with generation precondition and verify bytes. Do not alter databases.

**Acceptance Criteria:**
- Given an existing catalogue, when validated and selecting days 1–24, then prior projected data remains identical and all extras are validated without projection.
- Given valid extras, when one or several are captured, then their names, portraits, choices, false choice, explanation, optional date and complete stories round-trip without loss.
- Given duplicate identities, invalid extras or day 26 selection, when validation runs, then it refuses without logging private values.
- Given a concurrent catalogue change or conflicting portrait, when publishing, then the operation refuses without overwriting it.
- Given Céline's approved contribution, when publication succeeds, then a private reread confirms exact content and portrait while the 24 entries and databases are unchanged.

## Implementation Notes

- Added optional `extra_contributions` validation and document-only validation. Existing day selection stays limited to 1–24.
- Published Céline and the approved portrait to the private catalogue with generation preconditions and verified reread. The 24 entries remained unchanged; no database operation was performed.
- Catalogue test suite: 81 tests passed. Publication was performed with a private one-off script and independently reread. A reusable capture command now validates inputs, enforces size and generation checks, protects portraits and verifies published bytes; synthetic tests cover its conflict and reread paths. The reusable command itself has not been run against the real bucket.

## Spec Change Log

## Review Triage Log

- Medium, fixed: duplicate identity with an application-resource entry was not checked; identity uniqueness now includes explicit IDs on all existing entries and has a regression test.
- False: nullable reveal is part of the existing catalogue contract; the real contribution has its approved explanation.
- Medium, fixed: reusable capture checks serialized size before writing; an oversized catalogue is rejected in tests.
- False: the procedure creates a missing portrait only with an immutable create precondition and verifies it before publishing; a missing or conflicting portrait at publication still stops it.
- Medium, fixed: reusable capture tests cover stale catalogue, concurrent portrait creation, conflicting portrait, catalogue write race and a valid but different byte reread. The earlier one-off publication was independently reread.
- Low, fixed: extra contribution names consisting of empty or whitespace values now have regression tests.
- High, fixed: protect all referenced portrait generations while publishing; test a refused hold.
- Medium, fixed: display the exact addition on the private terminal and reread both approved input files after confirmation.
- High, fixed: strict UTF-8 parsing rejects duplicate keys and lossy numeric representations before any rewrite; tests exercise all cases.
- Low, verified: stricter identity validation could reject malformed historic placeholders. The current private catalogue was read-only validated successfully; malformed documents fail closed.
- Medium, fixed: byte-reread test now uses a valid JSON document with altered content, so parsing alone cannot make the test pass.

## Verification

**Commands:**
- `node --test scripts/v2/advent-catalogue-validation.test.mjs scripts/v2/advent-catalogue-gcs-source.test.mjs` — all synthetic tests pass.
- Run relevant additional catalogue operator tests; compare private catalogue before and after, object generations and bytes without logging content.

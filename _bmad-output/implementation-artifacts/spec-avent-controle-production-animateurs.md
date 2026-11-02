---
title: 'Repeatable Advent production preview for hosts'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '1f2c2cca6d26af04c5bd4817cc1b0e15f524f4b6'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The two hosts must verify the actual production quiz, elf and result message before publication and after content corrections, but the current private preview makes their own submitted answers final and prevents replay.

**Approach:** Extend the separately authorized production preview to browse available days, play each quiz, immediately inspect the personal answer and explanation, and explicitly clear only the host's own answer to replay. Do not alter the real game or other members' progression.

## Boundaries & Constraints

**Always:** Restrict this capability to the two verified excluded hosts who are active members of the configured troupe; enforce authorization and ownership on the server for every read and mutation. Preserve the surprise for all other members. Use real production quiz and portrait data. Keep host identities out of the ranking and do not alter other members' answers, ranks, scores, notifications or sessions. Preserve the existing Advent visual and accessibility contracts. Make personal deletion explicit and confirmed.

**Never:** Provide a shared reset, other-member deletion, shared-clock mutation or development-only operator command in production. Never expose future content, answer correctness or pending points to unauthorized users. Do not deploy or change production data as part of implementation and verification. Do not introduce content snapshots, edit locks or stale-content/version controls for the accepted exceptional-edit risk.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Authorized preview | A verified active host selects any available day | Show its actual portrait and quiz; answer once and show personal result and explanation immediately | Report missing content or failed request |
| Personal replay | A host has a recorded preview answer | Confirm deletion of that host's answer for the selected day, then allow replay | Do not affect any other account or day |
| Other member or unverified session | User attempts future preview, simulated navigation or deletion | Deny on the server without leaking content | Fail closed |
| Normal member journey | A member accesses the real game | Preserve real dates, secrecy, answer rules and ranking | No preview capability |
| Content edited | Host revisits actual current content | Read the current database quiz and portrait | Existing exceptional-edit inconsistency remains accepted |
| Ranking | Host answers or replays | Neither host appears in the ranking; other members' ranking is unchanged | Fail closed if exclusions cannot be verified |
| Development controls | Preview runs in production | Shared reset, other-member mutations and test-session reset are unavailable and server-denied | No changes to isolated development test behavior |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — existing `canPreview`, `preview`, `requireControl` and personal replay authorization; keep production preview separate from isolated test mode.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — current preview reads, answer/result lifecycle, ranking and replay; scope any production deletion to the authorized caller and selected quiz under existing transactional rules.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberClock.kt` — keep ordinary shared time unchanged and retain development-only simulation boundaries.
- `apps/web/src/app/pages/advent-test/` — production preview, calendar, test toolbar and new contextual menu; expose only authorized personal replay in preview, retain actual member and development paths.
- `SPEC.md`, `_bmad-output/planning-artifacts/prds/prd-hatcast-2026-10-28/prd.md`, Advent `EXPERIENCE.md` and `ARCHITECTURE-SPINE.md` — reconcile the accepted new exception and remove conflicting production prohibitions without changing unrelated rules.
- Advent API, PostgreSQL and browser tests and `scripts/v2/run-advent-full-stack-smoke.sh` — validate identity, personal isolation, future content secrecy, caches and actual current content in an isolated environment.

## Tasks & Acceptance

**Execution:**
- [x] Define and implement the separate server-authorized personal preview replay, including rejection of all global and other-member mutations.
- [x] Adapt the preview navigation and menu to browse days, inspect actual content and immediately display the personal answer; preserve the isolated development menu.
- [x] Update the normative functional, UX and architecture contracts to reflect the authorized production exception.
- [x] Cover API authorization, privacy, ownership, cross-account/ranking isolation, repeated replay, browser navigation and result display, with PostgreSQL-backed checks and a real isolated full-stack demonstration.

**Acceptance Criteria:**
- Given an authorized host, when they inspect an available production quiz and answer it, then they see the actual portrait, answer and explanatory message immediately.
- Given that host's recorded answer, when they confirm personal replay, then only their answer to the selected day is cleared and they can answer again.
- Given any ordinary member or unauthorized session, when they try preview access or replay directly, then the server denies it and exposes no future content.
- Given either host previews or replays, when rankings and other members' state are read, then neither host appears in the ranking and other members' state is unchanged.
- Given production preview, when test actions are inspected or called directly, then global reset and other-member modifications are unavailable and server-denied.

## Implementation Notes

- Existing uncommitted changes include the user's current Advent test menu and accepted decisions. Preserve them and implement in this checkout as requested.
- Targeted game and HTTP security tests passed; the PostgreSQL isolation suites executed eight tests and the updated content reread passed on disposable PostgreSQL. Final Angular unit suites passed 177 tests and browser suites passed 14 tests.
- The isolated production-build full-stack smoke passed with two synthetic preview identities, personal replay, account isolation, active service worker and ordinary member boundary checks. No production data or deployment was touched.
- A PostgreSQL test confirms that after a database edit, replay reads the updated quiz, portrait reference and explanation. This does not establish remote production configuration or object delivery.
- After review, replay fetches current content again after personal deletion. If the read fails, the interface explicitly reports that the answer was erased and offers a retry; keyboard focus moves to the dated confirmation and returns on cancellation. Browser and isolated full-stack checks passed again after these corrections.

## Review Triage Log

- Medium, fixed: replay reused the previously displayed quiz and portrait after an edit; the existing authorized endpoint is read again after deletion, without version checks or edit locks.
- Medium, fixed: the personal deletion confirmation did not receive focus or identify its day; the heading now includes the selected day and receives focus, with focus restored on cancellation.
- Medium, fixed: a failed content read after deletion could leave an unannounced error; a specific visible message and retry are covered by a rendered-interface test.
- Verification-gap review found no additional gaps. The user explicitly declined further investigation of the separate previously accepted reveal-concurrency risk.

# Sprint Change Proposal — Participant gender (Lot B phase 1)

**Date:** 2026-06-06  
**Author:** Correct Course (BMad) — investigation [`lot-b-phase1-participant-gender-mixite-investigation.md`](../implementation-artifacts/investigations/lot-b-phase1-participant-gender-mixite-investigation.md)  
**Approver:** Patrice (product) — **approved 2026-06-06**  
**Trigger:** Mixité (**6.21**) stays hidden when name-only or account-without-M/F participants fill `player` slots; shipped gender model is `users.gender` only — insufficient for organizer operational context.  
**Change scope:** **Moderate** (normative docs + backlog story **2-12d**; implementation via `bmad-dev-story`)

---

## 1. Issue Summary

| Need | Detail |
|------|--------|
| **Gap** | Unlinked / unrecognized roster rows always resolve to `non_specified` → mixité pill hidden (`u > 0`) |
| **Stakeholder intent** | Organizer who adds a guest is responsible for gender at **participant** level; dual layer with account gender |
| **Evidence** | `ParticipantGenderResolver.kt` user-only; `V14` no participant gender column; integration test expects `non_specified` for name-only |

**Product rules (locked 2026-06-06):**

| Situation | Effective gender | Who writes |
|-----------|------------------|------------|
| Manual add, not recognized | `participant.gender` | Organizer (add) |
| Recognized user, account M/F | `users.gender` | Member (Mon compte); org read-only |
| Recognized user, no account M/F | `participant.gender` if org set | Organizer (add/edit) |
| User changes M ↔ F | Cascade sync all linked participant rows | Member PATCH → API cascade |
| User → **Non spéc.** (**Option B**) | Clear participant rows → `non_specified`; org may re-set on roster | Member + optional org re-edit |

**Precedence (normative):**

```
if linked user.gender in { male, female } → user.gender
else if participant.gender in { male, female } → participant.gender
else → non_specified
```

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 2** | New story **2.12d** — participant gender admin + cascade |
| **Epic 3** | Add/edit participant dialogs; extends **3.8** / **3.8c** (gender on add when allowed) |
| **Epic 6** | **6.21** mixité reads **effective** gender — no formula change |
| **Epic 16** | **16.3** aggregate uses same effective gender |
| **Epic 2.12e** (optional phase 2) | Unchanged — admin edit **member** user gender |
| **PRD** | No new FR — extends existing gender/mixité capability within FR9/FR21 parity |
| **DOMAIN.md** | Dual-layer gender + precedence + cascade |
| **member-gender.md** | Counts use effective gender; privacy Wave C note |
| **Architecture** | Nullable `gender` on `season_participants` + `event_participants`; `effectiveGender()` helper; cascade in `UserMemberPreferencesService` |
| **UX** | Reuse frozen Mon compte toggle on add/edit participant (conditional visibility) |
| **ADR 0020** | New — participant-level gender decision |
| **PLAN.md** | Optional note — Lot B phase 1 scheduled post Lot A |

**Not chosen:**

- User-only extension — cannot represent name-only guests  
- Sticky participant gender when user selects Non spéc. (Option A) — **refuted**; Option B confirmed  
- Mandatory gender or blocking validate on mixité  

---

## 3. Recommended Approach

**Option 1: Direct Adjustment** — add story **2-12d** within Epic 2; normative doc updates; Flyway + resolver in implementation story.

| Attribute | Value |
|-----------|-------|
| Effort | **Medium** (migration, ~4 API touch points, 2 dialogs, cascade, tests) |
| Risk | **Medium** (precedence drift if resolver not centralized) |
| Timeline | After Lot A (**3.8c**) review/merge recommended |
| Rollback | N/A — additive nullable column |
| MVP | Unchanged — enhancement to shipped 2.12 / 6.21 |

**Sequencing:**

```
3.8c (Lot A typeahead) → 2-12d (Lot B phase 1) → 2-12e optional (member admin gender)
```

---

## 4. Detailed Change Proposals

### 4.1 DOMAIN.md

**Section:** Glossary + § Parité de genre

**OLD (glossary excerpt):**

> **Gender-aware role label:** … based on linked `users.gender`.  
> **Team gender parity:** … where linked user gender is `female` or `male`.

**NEW:** Add **Participant gender (organizer-set)** glossary entry; role labels and parity use **effective gender** per precedence; add cascade rule on Mon compte PATCH.

**Rationale:** Normative source for dual-layer model.

---

### 4.2 member-gender.md

**Section:** Counts + Privacy

**OLD:**

```
f = slots where linked user.gender = female
m = slots where linked user.gender = male
u = slots where gender is non_specified, null user, or unlinked participant without gender
```

**NEW:** Counts use **effective gender** (precedence above). Privacy Wave C: organizer may set participant gender for operational UI when account has no M/F.

---

### 4.3 ADR 0020

New ADR documenting decision, precedence, cascade, Option B.

---

### 4.4 epics.md — Story 2.12d

**ADD** after 2.12c (full story in epics.md).

---

### 4.5 sprint-status.yaml

**ADD:** `2-12d-genre-participant-admin-roster: backlog`

---

### 4.6 member-gender-surfaces.md

Update gender source table + architecture diagram (`participant.gender` persistence).

---

### 4.7 plan-participant-roster-ux-enhancements.md

Mark domain decision **approved**; reference SCP 2026-06-06.

---

## 5. Implementation Handoff

| Scope | **Moderate** |
|-------|----------------|
| **Route to** | `bmad-create-story` → `bmad-dev-story` |
| **Deliverables** | Story file `2-12d-genre-participant-admin-roster.md`; migration; `EffectiveParticipantGender` / extended resolver; cascade hook; add/edit dialog UX |
| **Success criteria** | Precedence integration tests; mixité visible when org sets gender on name-only slot; Option B cascade test (user → Non spéc. clears rows) |
| **Depends** | **2.12** (done), **6.21** (done), **3.8** (done); **3.8c** (Lot A) for add-dialog typeahead coupling |

---

## Checklist Summary

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done — investigation + stakeholder session |
| 2 Epic impact | [x] Done — Epic 2 story add; Epic 3/6/16 read-path |
| 3 Artifact conflicts | [x] Done — DOMAIN/member-gender/ADR/epics |
| 4 Path forward | [x] Done — Option 1 Direct Adjustment |
| 5 Proposal components | [x] Done |
| 6 Final review | [x] Done — Patrice approved 2026-06-06 |

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-06 | Patrice approved SCP; artifacts applied; handoff → `bmad-create-story` 2-12d |

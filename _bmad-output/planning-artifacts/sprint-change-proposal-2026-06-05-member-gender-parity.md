# Sprint Change Proposal — Member gender profile & team parity (V1 parity)

**Date:** 2026-06-05  
**Author:** Correct Course (BMad) — `/bmad-help` + PO validation (G-011)  
**Approver:** Patrice (product)  
**Trigger:** V1 allowed members to declare an **optional gender** on their profile (`male` / `female` / `non-specified`). V2 shipped **without** this field. Stakeholders want to restore it for: (1) **role labels** (e.g. Comédienne vs Comédien), (2) **distinct fallback avatars**, (3) **internal parity metrics** and optional **organizer hints** at composition time, (4) later **optional draw weighting** (Epic **19.11**).  
**Change scope:** **Moderate** (planning + backlog; multi-wave delivery across Epics **2**, **5**, **6**, **16**; prerequisite for **19.11**)

---

## 1. Issue Summary

| Gap | Evidence |
|-----|----------|
| **No gender in V2 data model** | `UserEntity` has no gender column; no gender in Angular or Kotlin APIs |
| **V1 parity regression** | `legacy/src/services/storage.js` — `getRoleLabel(role, userGender)`; `PlayerModal.vue` edit gender; `playerAvatars.js` emoji by gender |
| **Inclusive labels stuck on middot** | V2 `event-roles.ts` uses `Comédien·ne`, `Régisseur.euse` for everyone |
| **Downstream already planned** | Epic **19.11** depends on **« 2.x profil genre »** — story does not exist |

**PO intent (2026-06-05):**

| Need | Detail |
|------|--------|
| **Profile** | Optional declaration: boy / girl (product copy: **Homme / Femme / Non précisé**) |
| **Default** | **Non précisé** when unset — inclusive middot labels remain (V1 rule) |
| **Scope** | **Account-level** (`users` table), not troupe-scoped — same as avatar / member display name |
| **Labels** | Adapt role labels wherever a **participant** is shown with a role (dispos, équipe, confirmations, stats cells) |
| **Avatars** | When no custom/Google photo: distinct letter fallback by gender tone (V2: purple / orange / grey — replaces V1 emoji) |
| **Parity — internal** | Compute F/M counts on **player** (`player`) slots in a composition draft or validated team |
| **Parity — exposed** | Optional season-level statistic (proportion women/men among **player** selections) |
| **Parity — hint** | Non-blocking inline hint for organizers during composition (e.g. imbalance on `player` role) |
| **Parity — draw** | **Later**, optional factor in draw formula (**19.11**) — not in Wave A–C |
| **Privacy** | Gender is **optional** and **not required** for any workflow; never block assign/draw |

**Normative enum (for DOMAIN/SPEC in story 2.12):**

```
MemberGender = male | female | non_specified

defaultMemberGender = non_specified

roleLabel(roleKey, gender) =
  if gender = male   → masculine label table (V1 ROLE_LABELS_BY_GENDER.male)
  if gender = female → feminine label table
  else → inclusive middot label table (V1 non-specified)

paritySlotCounts(compositionSlots, roleKey = player) =
  count slots where roleKey = player AND participant.gender = female → f
  count slots where roleKey = player AND participant.gender = male   → m
  participants with non_specified or empty slot → excluded from f/m ratio;
  optional display: "X genre non renseigné"

parityRatio(f, m) =
  if f + m = 0 → null
  else → { female: f, male: m, femaleShare: f / (f + m) }
```

**V1 value mapping (migration):**

| V1 (`players.gender`) | V2 |
|------------------------|-----|
| `male` | `male` |
| `female` | `female` |
| `non-specified`, `unknown`, null | `non_specified` |

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 2** | New stories **2.12**, **2.12b**, **2.12c** — profile field, labels, avatars |
| **Epic 5** | Dispos cells / summaries use gender-aware labels when participant gender known (**2.12b**) |
| **Epic 6** | New story **6.21** — composition parity hint (organizer, non-blocking) |
| **Epic 16** | New story **16.3** — optional season parity stats (expose aggregate) |
| **Epic 19** | **19.11** unblocked after **2.12** + **19.6**; update dependency from « 2.x » → **2.12** |
| **API / DB** | Migration `users.gender VARCHAR` or enum; expose on member/profile DTOs; `PATCH /v1/me/profile` or extend existing preferences/profile endpoint |
| **Front** | Mon compte → Mon profil (**17.36**); shared `getRoleLabel(role, gender)` port from V1 |
| **PRD / SPEC / DOMAIN** | **Required before Wave A dev** — `bmad-spec` amends SPEC + DOMAIN (optional gender, parity semantics) |
| **UX** | **`bmad-ux`** — profile control copy, parity hint on Équipe tab |
| **MIG** | Backfill gender from V1 Firestore `players` → linked `users` (best effort; default `non_specified`) — task inside **2.12** or follow-up **MIG-7** |
| **PLAN.md** | Rows **2.12–2.12c**, **6.21**, **16.3** under post-MEP / iso-V1 polish track |

**Not chosen:**

- Troupe-scoped gender (rejected — account-level matches avatar + user expectation « mon profil »)
- Mandatory gender (rejected)
- Blocking composition on imbalance (rejected — hint only in **6.21**; draw factor optional in **19.11**)
- Epic 21 dedicated epic (rejected — fits Epic **2** foundation + Epic **6**/**16** consumers)

---

## 3. Recommended Approach

**Hybrid — direct adjustment** across existing epics in **four waves**. No rollback. No MVP scope reduction.

| Wave | Stories | Priority | Outcome |
|------|---------|----------|---------|
| **A — Foundation** | **2.12** | **P1** iso-V1 | DB + API + Mon compte UI + V1 migration backfill |
| **B — Display** | **2.12b**, **2.12c** | **P1** | Gender-aware labels everywhere; avatar emoji fallback |
| **C — Parity info** | **6.21**, **16.3** | **P2** | Organizer hint + optional season stats |
| **D — Draw** | **19.11** (existing) | **P2** | Optional weight factor after **19.6** |

**Sequencing:**

1. **`bmad-spec`** — SPEC + DOMAIN amendments (gate Wave A)
2. **`bmad-ux`** — profile field + parity hint wireframes (gate Wave A/B)
3. **`bmad-create-story` for 2.12** — when prioritized (after **6.20** or in parallel if capacity)
4. **`bmad-dev-story`** per wave
5. **`bmad-create-story` for 2.12b/c, 6.21, 16.3** after Wave A merges

**Effort:** Medium (Wave A–B ~1–2 sprints); Wave C small; Wave D already scoped in Epic 19.  
**Risk:** Low–medium (label drift Kotlin/TS — port V1 tables once, shared test vectors).  
**Timeline:** Does not block **6.20** in progress; **19.11** remains after **19.6**.

---

## 4. Detailed change proposals

### 4.1 Story 2.12 — Optional member gender (profile, API, Mon compte)

**User story:**  
As a **member**,  
I want to **optionally declare my gender** on my account profile,  
so that the app can **personalize labels and avatars** while others can keep **non précisé** for inclusive defaults.

**Acceptance Criteria**

1. **Given** a signed-in user, **when** they open **Mon compte → Mon profil**, **then** they see a **Genre** control with **Homme**, **Femme**, **Non précisé** (default).
2. **Given** they save a choice, **when** the API persists, **then** `users.gender` is `male` | `female` | `non_specified` and returned on profile/member reads.
3. **Given** gender unset or `non_specified`, **when** any UI needs a role label, **then** inclusive middot forms are used (current V2 behaviour).
4. **Given** V1 import, **when** migration/backfill runs, **then** linked users receive mapped gender per table above.
5. **Given** another member views my profile, **when** gender is set, **then** gender is **not** exposed on public member glance unless PO explicitly adds later (default: **self-edit only** in API; other members see labels derived from gender on participation views only).
6. **Couverture:** FR9/FR10 extension; V1 parity. **Priorité:** P1. **Depends:** **17.36** (done). **Blocks:** **2.12b**, **19.11**.

**Suggested API**

- `GET /v1/me` or profile DTO: `gender?: 'male' | 'female' | 'non_specified'`
- `PATCH /v1/me/profile` body `{ gender }` (or extend existing account update)
- Member list / composition participant DTO: include `gender` for linked users (for label rendering server-side optional)

---

### 4.2 Story 2.12b — Gender-aware role labels (web + API DTOs)

**User story:**  
As a **member or organizer**,  
I want **role labels to match declared gender** (e.g. Comédienne),  
so that I do not rely on middot notation when gender is known.

**Acceptance Criteria**

1. **Given** V1 label tables ported to `apps/web/src/app/shared/event-roles/`, **when** `getRoleLabel(role, gender)` is called, **then** output matches V1 `storage.js` for all `RoleKeys.ALL`.
2. **Given** participant gender on dispos, équipe, confirmation modals, availability cells, **when** rendered, **then** labels use participant gender.
3. **Given** `non_specified` or missing gender, **when** rendered, **then** inclusive labels unchanged.
4. **Couverture:** V1 parity. **Priorité:** P1. **Depends:** **2.12**.

---

### 4.3 Story 2.12c — Gender-based avatar fallback

**User story:**  
As a **member**,  
I want a **distinct default avatar** when I have no photo,  
so that I am visually recognizable (V1 parity).

**Acceptance Criteria**

1. **Given** no custom avatar and no Google photo, **when** avatar renders, **then** letter fallback uses gender tone (male → purple, female → orange, non_specified → grey — `member-gender.md`).
2. **Given** custom or Google avatar, **when** displayed, **then** photo is shown — gender tone not applied to the image.
3. **Couverture:** FR10. **Priorité:** P1. **Depends:** **2.12**, **2.6** (done).

---

### 4.4 Story 6.21 — Composition parity hint (organizer, non-blocking)

**User story:**  
As an **organizer** composing a team,  
I want a **compact parity summary** for the **player** role on the current draft,  
so I can **see gender balance** without blocking my choices.

**Acceptance Criteria**

1. **Given** a composition draft with `player` slots filled, **when** the Équipe tab renders, **then** an inline info strip shows counts/ratio F/M among **filled player slots** with known gender (e.g. « Joueurs : 2 F · 4 H »).
2. **Given** only `non_specified` genders on player slots, **when** displayed, **then** hint shows « parité non calculable » or omits ratio (PO copy in UX spec).
3. **Given** the hint, **when** slots change, **then** counts update on same refresh path as slots.
4. **Given** the hint UI, **when** rendered, **then** informational tone (not warning); no modal; M3 checklist.
5. **Couverture:** FR21 UX. **Priorité:** P2. **Depends:** **2.12**, **6.5** (done). **UX:** new `ux-design-composition-gender-parity-hint.md` (via `bmad-ux`).

---

### 4.5 Story 16.3 — Season parity statistics (optional expose)

**User story:**  
As a **member or organizer**,  
I want to see **gender balance statistics** for **player** participations across a season,  
so I can understand troupe parity over time.

**Acceptance Criteria**

1. **Given** validated compositions in a season, **when** stats are requested, **then** API returns aggregate F/M counts and `femaleShare` on **player** role only, excluding `non_specified` from ratio denominator.
2. **Given** the Statistiques or member profile surface (PO chooses one in UX), **when** displayed, **then** statistic is labeled clearly and does not identify individuals.
3. **Couverture:** extends FR60 / season stats. **Priorité:** P2. **Depends:** **2.12**, **3.6** stats infra (done).

---

### 4.6 Epic 19.11 dependency update

**OLD:** `Depends : 19.6, **2.x** profil genre`  
**NEW:** `Depends : 19.6, **2.12** (member gender profile)`

---

## 5. Artifact updates (this change)

| File | Change |
|------|--------|
| `growth-backlog.md` | G-011 → **Promu** this SCP |
| `epics.md` | Stories **2.12**, **2.12b**, **2.12c**, **6.21**, **16.3**; **19.11** depends **2.12** |
| `sprint-status.yaml` | Backlog rows for new stories |
| `PLAN.md` | § post-MEP polish rows **2.12–2.12c**, **6.21**, **16.3** |
| This SCP | Record decision |

**Spec (done 2026-06-05):** [`_bmad-output/specs/spec-member-gender-parity/`](../specs/spec-member-gender-parity/SPEC.md) + amendments [SPEC.md](../../SPEC.md), [DOMAIN.md](../../DOMAIN.md).

**UX (done 2026-06-05):** [ux-design-member-gender-parity.md](ux-design-member-gender-parity.md) + spines [DESIGN](ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md) / [EXPERIENCE](ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md).

**Out of scope for SCP apply:** Kotlin/Angular code.

---

## 6. Open questions (non-blocking)

| ID | Question | Assumption | Revisit |
|----|----------|------------|---------|
| **OQ-G-011-01** | Expose gender on admin member list? | **No** — labels only; admins see derived role labels | Story 2.12 |
| **OQ-G-011-02** | Parity hint only for category `match`? | **All events** with `player` slots; PO may narrow in UX | `bmad-ux` |
| **OQ-G-011-03** | Season stats: Statistiques ligue vs `/membre` only? | **Statistiques ligue** stretch goal; MVP hint in **6.21** | Story 16.3 |
| **OQ-G-011-04** | API snake_case `non_specified` vs V1 `non-specified`? | **`non_specified`** in JSON (V2 convention) | OpenAPI in 2.12 |

---

## 7. Handoff

| Role | Action |
|------|--------|
| **PO** | Approve SCP; confirm OQ-G-011-02/03 |
| **Tech writer / `bmad-spec`** | Amend SPEC + DOMAIN before **2.12** dev |
| **`bmad-ux`** | Profile control + parity hint spec |
| **Dev** | **`bmad-create-story` for 2.12** when prioritized (after spec + UX) |
| **Dev (19.11)** | Wait for **2.12** + **19.6** |

**Success criteria (Wave A–B):**

- Member sets Femme → dispos/équipe show « Comédienne » for `player` role.
- Member leaves Non précisé → « Comédien·ne » unchanged.
- Avatar without photo shows gender-distinct letter tone (orange / purple / grey).
- No workflow blocked when gender unset.

---

## 8. Approval

- [x] PO approves SCP (Patrice — 2026-06-05)
- [x] Artifact updates applied (`epics.md`, `sprint-status.yaml`, `PLAN.md`, `growth-backlog.md`)

---

## 9. Amendment log

| Date | Change |
|------|--------|
| 2026-06-05 | Initial SCP (G-011 → Epics 2 / 6 / 16; prerequisite 19.11) |

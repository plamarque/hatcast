# Sprint Change Proposal — Epic 19 Draw weight engine

**Date:** 2026-06-04  
**Author:** Correct Course (BMad) — `/bmad-help` + PO validation  
**Approver:** Patrice (product)  
**Trigger:** Draw algorithm is business-critical; V2 ships basic V1 parity via **6.4** / **6.14** but lacks normative documentation, golden tests, and an extensible factor model for future fairness rules.  
**Amended 2026-06-04 (b):** Product vision extends to **admin-configurable draw formulas** and **troupe/season policies** (mandatory vs organizer choice), with admin UI + organizer draw UX.  
**Amended 2026-06-04 (c):** Policies include **per-spectacle-category rules** (`category` from **17.7**); effective rule resolved **per event**; operator **chooses at draw time** when ≥2 formulas allowed; example: **match** → gender-parity formula.  
**Change scope:** **Moderate** (planning + backlog; implementation via Epic 19 stories)

---

## 1. Issue Summary

The **weighted random draw** drives composition fairness (**FR20**, **FR24**) and must stay **explainable** (% displayed = same formula as server draw). Epic **6** delivered the MVP draw (`AvailabilityChanceCalculator`, `CompositionDrawService`, snapshot **6.14**), but:

| Gap | Evidence |
|-----|----------|
| Thin automated coverage | ~10 Kotlin unit tests; no systematic **V1 JS ↔ V2 Kotlin** golden suite |
| No standalone normative doc | Formula lives in story **6.4** dev notes + one DOMAIN line |
| Monolithic weight code | Single `weightForParticipant`; future factors not pluggable |
| No formula / policy product model | Troupe admins cannot define reusable draw recipes or impose/allow organizer choice per season |
| Planned extension scattered | **17.9** (category partition) isolated from draw architecture |

**V1 production scope today:** only **past participation malus** per role (`malus = 1/(1+n)`, `weight = malus × requiredCount`). Gender, volunteer prefs, etc. affect UI/eligibility elsewhere — **not** the draw formula. Epic 19 must **lock V1 parity first**, then add factors incrementally.

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 6** | **Unchanged** — **6.4**, **6.14** remain *done* (product delivery). Epic 19 = hardening + evolution. |
| **Epic 17** | **17.9** marked **done** in sprint (compartment via `SpectacleCategory` / `category`) — **19.8** = extract to factor pipeline + golden regression, not greenfield |
| **Epic 5** | Dispos **Tous %** must keep using same calculator pipeline after refactors (**19.5–19.6**). |
| **PRD / SPEC** | Wave A: no new FRs. Wave C factors + **Wave D formulas/policies** require **SPEC/DOMAIN** amendment (**19.15**) before dev. |
| **Architecture** | New **ADR 0019** (draw weight engine) — story **19.1**. |
| **Tests / CI** | Golden fixtures under `services/api/src/test/resources/draw/` (+ optional replay harness alignment). |
| **PLAN.md** | New § Epic 19; **17.9** row → implementation **19.8**. |

---

## 3. Recommended Approach

**Add Epic 19 — Moteur de tirage pondéré** in four waves:

| Wave | Goal | Stories | Priority |
|------|------|---------|----------|
| **A — V1 lock** | Document + golden tests + orchestration fixtures | **19.1–19.4** | **P1** post-MEP / parallel polish |
| **B — Extensible core** | Factor pipeline; migrate existing malus | **19.5–19.7** | **P1** before any new factor |
| **C — Optional factors** | One story = one toggleable factor | **19.8–19.14** | **P2+** product-gated |
| **D — Formulas & policies** | Admin formulas, troupe/season policy, UI, snapshot | **19.15–19.22** | **P2+** growth (after Wave B) |

**Wave D product model (summary):**

- **`DrawFormula`** — troupe-scoped **catalog** (multiple named recipes: factors + parameters).
- **`DrawPolicy`** — scope `troupe` | `season`; **`defaultRule`** + **`categoryRules[]`** (each maps `category` slug | null → `MANDATORY` | `CHOICE` + formula id(s)). **Season overrides troupe.** Uses **`event.category`** (**17.7** / **17.8**).
- **Event-level resolution** — no per-event policy row in MVP; at draw time server resolves rule from event category → effective rule.
- **Organizer draw** — selector **only** when resolved rule is `CHOICE` with **≥2** formulas; `MANDATORY` or single-formula choice auto-applies.
- **Example:** season policy: category `match` → mandatory « Gender parity — match » formula; default rule → choice among published formulas.
- **Snapshot 19.22** — formula id, policy mode, **event category**, whether organizer chose.

**Not chosen:**

- Free-form formula scripting / expression language in MVP Wave D — factors are catalogued plugins only.

- Re-open **6.4** — duplicate delivery risk.
- Implement all future factors in one story — violates incremental refactor goal.
- Change draw formula without ADR + golden regression — rejected (NFR-Q1).

**Relationship to existing assets:**

- V1 reference: `legacy/src/services/chancesService.js`, `scripts/replay/chancesLogic.js`
- V2 runtime: `AvailabilityChanceCalculator.kt`, `CompositionDrawService.kt`
- Story **6.4** dev notes remain historical; **19.1** becomes normative going forward.

---

## 4. Story mapping (17.9 → 19.8)

| Old | New | Notes |
|-----|-----|-------|
| **17.9** Tirage/chances par tag | **19.8** `EquityTagHistoryFactor` | **17.9 shipped** (category compartment in `CompositionSelectionHistoryService`); **19.8** = factor extraction + golden tests |
| **17.9** (Epic 17 row) | **Deferred implementation** | Keep requirement trace; dev via **`bmad-create-story` for 19.8** only |

---

## 5. Epic 19 story list (summary)

| Story | Title | Wave | Depends |
|-------|-------|------|---------|
| **19.1** | Spec normative V1 + ADR 0019 | A | 6.4, 6.14 |
| **19.2** | Golden tests JS ↔ Kotlin (weights, %, draw w/ `Random`) | A | 19.1 |
| **19.3** | Fixture catalog — orchestration (multi-role, redraw, exclusion) | A | 19.2 |
| **19.4** | Doc orga/membre — lire les cotes | A | 19.1 |
| **19.5** | Pipeline `DrawWeightFactor` (config, no new factors) | B | 19.3 |
| **19.6** | `PastParticipationFactor` (= V1 malus) | B | 19.5 |
| **19.7** | Breakdown explicabilité par facteur (API optional UI) | B | 19.6 |
| **19.8** | Historique partitionné par `equity_tag` (ex-17.9) | C | 19.6, 17.7 |
| **19.9** | Malus rejouer immédiatement (→ interdiction) | C | 19.6 |
| **19.10** | Malus nombre de demandes de rôle | C | 19.6 |
| **19.11** | Parité de genre | C | 19.6 |
| **19.12** | Mix équipe (éviter mêmes co-équipiers) | C | 19.6 |
| **19.13** | Classes de spectacle (5★, 4★, 3★, …) | C | 19.6 |
| **19.14** | Bonus/malus bénévole | C | 19.6 |
| **19.15** | SPEC + ADR — formulas & policies model | D | 19.1, 19.5 |
| **19.16** | Persistence + system V1 default formula | D | 19.15, 19.6 |
| **19.17** | API CRUD draw formulas (troupe admin) | D | 19.16 |
| **19.18** | API draw policies (troupe / season) | D | 19.17, 3.5 |
| **19.19** | UI admin — formula editor | D | 19.17, 17.2 |
| **19.20** | UI admin — policy editor | D | 19.18, 19.19 |
| **19.21** | UI orga — formula choice on draw | D | 19.18, 6.4 |
| **19.22** | Snapshot formula at draw time | D | 19.21, 6.14 |

**Wave C–D** stories are **backlog** until PO prioritizes; each requires SPEC/DOMAIN delta before dev (**19.15** gates Wave D).

---

## 5b. Open questions (stakeholder discovery — not blocking Wave A)

| ID | Question | Current draft assumption | Revisit when |
|----|----------|------------------------|--------------|
| **OQ-19-01** | Policy key: **`category`** (17.7 glossaire) vs **`template_type`** vs both? | **`event.category`** only — matches use case via category slug (e.g. `match`) | Stakeholder workshop |
| **OQ-19-02** | Per-**event** policy override (persisted) vs category-only resolution? | Category + default rule only; **no** per-event policy row in MVP | If orgas need one-off exceptions |
| **OQ-19-03** | Match → gender parity: **mandatory** formula vs **choice** among match-oriented formulas? | Example documented both ways; PO decides per troupe in policy UI | La Malice / pilot troupes |
| **OQ-19-04** | Dispos **Tous %** before draw: live formula preview vs operational V1 until draw? | Same effective formula as draw once policy exists (**19.21** AC4) — may waver | UX review with orgas |
| **OQ-19-05** | Who edits season policy: troupe admin only vs season organizers (**3.5**)? | Season admin scope TBD in **19.15** | Governance chat |

**PO note (2026-06-04):** Epic 19 is a **first draft**; Wave **A–B** (V1 lock + pipeline) proceed regardless. Wave **D** shape may change after stakeholder conversations — amend via **`correct-course`**, not by re-opening **6.4**.

---

## 6. Artifact updates (this change)

| File | Change |
|------|--------|
| `epics.md` | Epic 19 list + detailed stories; **17.9** banner → **19.8**; dependencies + FR trace |
| `sprint-status.yaml` | `epic-19` + **19.1–19.22** → `backlog` |
| `PLAN.md` | § Epic 19 + wave table row; **17.9** → impl **19.8** |
| This SCP | Record decision |

**Out of scope for SCP apply:** code, ADR file, test files (created by stories **19.1+**).

---

## 7. Handoff

| Role | Action |
|------|--------|
| **PO** | Confirm Wave A priority vs MEP remainder; gate Wave C factors individually; approve SPEC delta **19.15** before Wave D |
| **Architect** | Review ADR 0019 draft in **19.1** |
| **Dev** | Next: **`bmad-create-story` for 19.1** (fresh context) |
| **QA / TEA** | Optional **`bmad-testarch-test-design`** before **19.2** |

**Success criteria:**

- Wave A: `./gradlew test` includes golden suite; ADR 0019 + doc orga published; zero intentional formula drift vs V1.
- Wave B: all existing draw/summary tests green; only `PastParticipationFactor` enabled by default (= V1).
- Wave C: each factor off by default until enabled in a **DrawFormula** (**19.16+**).
- Wave D: troupe admin can publish formulas; season/troupe policy imposes or allows choice; draw snapshot records formula used.

---

## 8. Approval

- [x] PO requested Epic 19 proposal (2026-06-04)
- [x] PO amended Wave D — category rules, event resolution, draw-time choice (2026-06-04 c)
- [x] Apply artifact updates (`epics.md`, `sprint-status.yaml`, `PLAN.md`)

---

## 9. Amendment log

| Date | Change |
|------|--------|
| 2026-06-04 | Initial Epic 19 (Waves A–C) |
| 2026-06-04 (b) | Wave **D** — configurable formulas, policies, admin UI, orga choice, snapshot **19.22** (PO) |
| 2026-06-04 (c) | **Category-scoped policy rules** ; event-level resolution ; draw-time operator choice when ≥2 formulas (PO) |

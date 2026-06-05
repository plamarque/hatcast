# Sprint Change Proposal — Epic 20 Spectacle prestige (stars)

**Date:** 2026-06-05  
**Author:** Correct Course (BMad) — `/bmad-help` + PO validation (G-009)  
**Approver:** Patrice (product)  
**Trigger:** Organizers need an optional **1–5 star prestige** label on shows (capture, display, season stats), then a **second draw fairness criterion** based on accumulated prestige points — independent of `pastSelectionCount`, calibrated when integrating the draw factor.  
**Change scope:** **Moderate** (planning + backlog; product delivery via Epic 20; draw integration amends Epic **19.13**)

---

## 1. Issue Summary

Product intent (PO 2026-06-05):

| Need | Detail |
|------|--------|
| **Capture** | Optional prestige (1–5 stars) on **any** show, all categories |
| **Display** | Event sheet (Infos) + agenda |
| **Stats** | Season score = sum of prestige credits per participant |
| **Draw (later)** | Accumulated prestige → **malus coefficient** (2nd equity criterion alongside selection count) |

Epic **19.13** already listed « classes de spectacle (5★…) » as a Wave C **draw factor only**, without capture/display/stats stories or PO rules for role-weighted credits.

**PO decisions (locked):**

| Topic | Decision |
|-------|----------|
| Scope | All shows; **optional** — null prestige → event contributes **0** points |
| Count moment | On **validated composition** (same lifecycle as `pastSelectionCount`) |
| **JEU** (`player`) | **100%** of event stars (`P`) |
| **DECORUM** (MC, DJ, …) | **50%** (`P × 0.5`) |
| **BÉNÉVOLE** | **0** — excluded |
| Draw formula | **Calibrate at 19.13** implementation (research story); not blocking Epic 20 Waves 1–2 |

**Credit rule (normative for DOMAIN/SPEC in 20.1):**

```
prestigeCredit(participant, validatedSlot, event) =
  if event.prestigeStars is null → 0
  else if slot.role in JEU → event.prestigeStars
  else if slot.role in DECORUM → event.prestigeStars × 0.5
  else → 0   // volunteer and other roles

prestigePointsTotal(participant, season) =
  Σ prestigeCredit over validated slots in season scope
```

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 3** | Event model extended (`prestigeStars` optional) — **20.2** |
| **Epic 12 / 17** | Agenda + event detail display — **20.4**, **20.5** |
| **Epic 3.6 / 17.10** | Stats grid may show prestige column — **20.7** |
| **Epic 19** | **19.13** amended: `PrestigeHistoryFactor` uses **20.6** data; depends **19.6** + **20.6**; formula TBD in story |
| **Epic 19 Waves A–B** | **Unchanged** — no prestige dependency on **19.1–19.7** |
| **PRD / SPEC / DOMAIN** | **20.1** adds normative prestige model; no PRD FR until PO promotes (extends FR12 event metadata + stats) |
| **Architecture** | Optional column on `events`; aggregation service or query for stats; factor plugin in draw pipeline (**19.13**) |
| **UX** | Star selector in event form; stars on agenda row + Infos tab (Material 3) |
| **PLAN.md** | New § Epic 20; recap table rows |
| **growth-backlog G-009** | Promoted → this SCP |

**Not chosen:**

- Prestige tied to `category` only — rejected (PO: all shows).
- Full prestige credit for volunteer — rejected.
- Implement draw malus before pipeline **19.6** — rejected (sequencing constraint).

---

## 3. Recommended Approach

**Add Epic 20 — Prestige des spectacles** in three waves; **keep draw integration in Epic 19.13** (Wave C) with explicit dependency on **20.6**.

| Wave | Goal | Stories | Priority |
|------|------|---------|----------|
| **1 — Capture & display** | Model, API, form, fiche, agenda | **20.1–20.5** | **P2** post-MEP (parallel **19.2–19.6** OK) |
| **2 — Season stats** | API aggregate + UI score | **20.6–20.7** | **P2** |
| **3 — Draw (Epic 19)** | Malus from accumulated prestige | **19.13** (amend) | **P2+** after **19.6** and **20.6** |

**Sequencing:**

```text
Epic 19: 19.1 ✓ → 19.2 (review) → … → 19.6 (pipeline + PastParticipation)
Epic 20: 20.1 → 20.2 → 20.3–20.5  ‖ parallel with 19.3–19.6
         20.6 → 20.7
Epic 19: 19.13  strictly after 19.6 AND 20.6
```

---

## 4. Detailed change proposals

### 4.1 Story 19.13 (amend)

**OLD title:** Facteur classes de spectacle (5★, 4★, 3★, …)

**NEW title:** Facteur historique prestige (`PrestigeHistoryFactor`)

**OLD depends:** 19.6, modèle événement/métadonnées

**NEW depends:** **19.6**, **20.6** (and **19.5** via 19.6)

**NEW AC highlights:**

- Uses `prestigePointsTotal` from **20.6** (same season / compartment rules as selection history if **19.8** active).
- Applies **malus multiplier** as 2nd factor alongside `PastParticipationFactor`; exact formula documented + golden tests in this story (PO: calibrate here).
- Factor **off** by default until enabled in a **DrawFormula** (**19.16+**).
- No duplicate persistence of stars — reads event `prestigeStars` + validated slots only.

### 4.2 New Epic 20 stories (summary)

| Story | Title | Wave | Depends |
|-------|-------|------|---------|
| **20.1** | SPEC + DOMAIN — modèle prestige | 1 | — |
| **20.2** | API — `prestigeStars` on event (1–5 \| null) | 1 | 20.1 |
| **20.3** | UI orga — sélecteur étoiles (formulaire spectacle) | 1 | 20.2, 17.13 |
| **20.4** | UI — étoiles fiche événement (Infos) | 1 | 20.2 |
| **20.5** | UI — étoiles agenda / listes saison | 1 | 20.2, 3.3 |
| **20.6** | API — `prestigePointsTotal` participant/saison | 2 | 20.1, 20.2, 3.6 |
| **20.7** | UI — score prestige stats saison | 2 | 20.6, 17.10 |

---

## 5. Artifact updates (this change)

| File | Change |
|------|--------|
| `epics.md` | Epic 20 list + detailed stories **20.1–20.7**; amend **19.13**; dependency note |
| `sprint-status.yaml` | `epic-20` + **20.1–20.7** → `backlog` |
| `PLAN.md` | § Epic 20 + recap rows |
| `growth-backlog.md` | G-009 → **Promu Epic 20** |
| This SCP | Record decision |

**Out of scope for SCP apply:** code, migrations, SPEC.md/DOMAIN.md body (created by **20.1**).

---

## 6. Open questions (non-blocking Waves 1–2)

| ID | Question | Assumption | Revisit |
|----|----------|------------|---------|
| **OQ-20-01** | Show stars on **draft** events in orga-only surfaces? | Editable in form; hidden from member agenda until published (**3.21**) | UX in **20.3** |
| **OQ-20-02** | Prestige stats column placement (new column vs overlay) | Extend stats API + grid per **17.10** filter model | **20.7** + UX |
| **OQ-20-03** | Draw malus curve (linear / steps / cap) | Research + golden fixtures in **19.13** | **19.13** dev |

---

## 7. Handoff

| Role | Action |
|------|--------|
| **PO** | Gate Epic 20 Wave 1 vs MEP remainder; confirm stats visibility (members vs orgas only) |
| **Architect** | Review event column + aggregation query in **20.2** / **20.6** |
| **Dev** | Next Epic 20: **`bmad-create-story` for 20.1** (fresh context) after **19.2** review closes |
| **Dev (draw)** | **`bmad-create-story` for 19.13** only after **19.6** + **20.6** done |

**Success criteria:**

- Wave 1: orga can set optional stars; visible on Infos + agenda; null = no stars shown.
- Wave 2: stats API returns correct totals (player 100%, decorum 50%, volunteer 0%) on seed fixtures.
- **19.13:** factor off by default; when on, golden tests prove malus increases with accumulated prestige.

---

## 8. Approval

- [x] PO validated prestige rules (2026-06-05)
- [x] Apply artifact updates (`epics.md`, `sprint-status.yaml`, `PLAN.md`, `growth-backlog.md`)

---

## 9. Amendment log

| Date | Change |
|------|--------|
| 2026-06-05 | Initial Epic 20 + **19.13** amend (G-009 → SCP) |

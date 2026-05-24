# Sprint Change Proposal — 2026-05-24 — League Views, Travel Leagues & Member Stats

**Type:** Product correction — DOMAIN / PRD / UX / PLAN / stories  
**Trigger:** Stakeholder review (Patrice, 2026-05-24) after ADR 0011  
**Status:** **Approved** (implemented in normative docs same day)  
**ADR:** [docs/adr/0012-league-views-travel-leagues-member-stats.md](../../docs/adr/0012-league-views-travel-leagues-member-stats.md)

---

## 1. Issue Summary

### Problem statement

Three related product gaps were identified while planning Epic 12+ and Story 3.6:

**A — Combined Historique screen (V1 carry-over)**  
V1 **Historique** merges (1) a participation **statistics grid** and (2) **month/event drill-down** in one dense view. Stakeholder intent: **separate** league **Historique** (past events chronology) from **Statistiques** (V1 stats grid + export), with **two CSV exports**.

**B — `deplacement` as spectacle type**  
Treating away shows as `templateType = deplacement` complicates stats (DEPLACEMENT bucket) and draw exceptions. Déplacements are a **separate programme** → model as a **travel league** per troupe; filters on agenda/stats let members include or exclude travel leagues.

**C — Personal « clin d'œil » only in popover**  
V1 `PlayerModal` (*Ma saison en un clin d'œil*) is modal-only. V2 member hub (ADR 0011) needs a **dedicated route** (`/membre/:userSlug`) with troupe/league filters and **transparency** (browse other members). V1-style **Statistiques** grid remains; filters apply when aggregating across leagues.

### Evidence

| Topic | V1 | Prior V2 plan | Decision |
|-------|-----|---------------|----------|
| Historique | Stats + months in `CastsView` | Story 3.6 = same combined view | Split Agenda / Historique / Statistiques |
| Déplacement | `deplacement` event type | Same + DOMAIN DEPLAC. rules | Travel **league**; legacy type until migration |
| Clin d'œil | `PlayerModal` popover | Story 2.7 popover | Route + filters (FR58–59) |

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact | Action |
|------|--------|--------|
| **3** | Story 3.6 → **Statistiques**; add **3.6b** Historique chronology | Update story files; shell 3.3 view switcher |
| **12** | FR55 filters on agenda | Align RES-001 with cross-scope surfaces |
| **13** | Travel league creation (FR56) | Add **13.6** (indicative) |
| **16** (new) | Personal season glance route | **16.1** evolves 2.7 |
| **5–6** | Draw per league | Remove déplacement type exception when travel leagues adopted |

### Story impact

| Story | Change |
|-------|--------|
| **3.6** | Renamed scope: **Statistiques** only (file name unchanged) |
| **3.6b** | **New:** Historique chronology + history export |
| **2.7** | Defer popover; route canonical in **16.1** |
| **3.3** | View switcher: Agenda \| Historique \| Statistiques |

### Artifact updates (done)

- [x] `prd.md` — FR53–FR60
- [x] `DOMAIN.md` — glossary, stats section, travel league
- [x] `PLAN.md` — Wave 0, Correct Course link
- [x] `epics.md` — UX-DR8/9/19/20, stories 3.6/3.6b, FR map
- [x] `ux-design-hatcast-v2.md` — split screens + personal glance
- [x] ADR 0012

---

## 3. Recommended Approach

**Direct adjustment** within existing epics — no MVP scope cut.

| Phase | Deliverable |
|-------|-------------|
| **Now** | Normative docs (this proposal + ADR 0012) |
| **Wave 0** | 3.6 Statistiques + 3.6b Historique in parallel with 2.9 |
| **Wave 1** | 12.x agenda filters (FR55) |
| **Wave 2** | 13.6 travel league template + admin copy |
| **Wave 2+** | 16.1 `/membre/:userSlug` |

**Risk:** Low for view split (mostly UI). Medium for travel leagues (migration, draw code). **Timeline:** +1 story (3.6b) in Wave 0; 16.1 can trail Wave 1.

---

## 4. Detailed Change Proposals

### PRD — FR53–FR60

See `prd.md` § League workspace views / Travel leagues / Personal season glance.

### DOMAIN

- Glossary: league workspace views, travel league, personal season glance.
- Stats: Historique ≠ Statistiques; DEPLAC. from travel league or legacy type.

### UX

- `ux-design-hatcast-v2.md`: `#screen-league--historique-chronology`, `#screen-league--statistiques-participation`, `#screen-personal-season-glance`.

### Story 3.6 (Statistiques) — title AC

**OLD:** Open **Historique** → stats grid.  
**NEW:** Open **Statistiques** → stats grid; export stats CSV only.

### Story 3.6b (Historique) — new

Past events month list; export history CSV; no JEU/DECORUM columns.

---

## 5. Implementation Handoff

**Scope:** **Moderate** — backlog + 1 new story; no rollback of shipped code.

| Owner | Task |
|-------|------|
| **Dev** | Implement 3.6 as Statistiques tab; 3.6b Historique tab; separate export endpoints or `?export=stats|history` |
| **Dev** | Season-home shell: 5 workspace tabs |
| **Dev** | Epic 13: document travel league in create-league UI |
| **Dev** | Epic 16.1: route + API aggregation with troupe/league query params |
| **PM** | Track legacy `deplacement` migration as post-MVP ops |

**Success criteria**

- [ ] League workspace shows three distinct views with correct content per view.
- [ ] Two exports download different CSV shapes.
- [ ] User agenda filters hide when single troupe/league (RES-001).
- [ ] `/membre/:slug` shows V1-equivalent glance with filters (16.1).

---

## Approval

**Stakeholder:** Patrice — decisions communicated 2026-05-24 (chat).  
**Normative merge:** same day via bmad-edit-prd + Correct Course.

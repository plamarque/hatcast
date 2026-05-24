# V2 Delivery Plan — League journey & resequenced epics

**Status:** Approved for planning (2026-05-24)  
**Authority:** [PLAN.md](../../PLAN.md) V2 track; normative behaviour [DOMAIN.md](../../DOMAIN.md), [SPEC.md](../../SPEC.md), [PRD](prd.md), [ADR 0011](../../docs/adr/0011-league-model-and-user-agenda.md)  
**UX:** [ux-design-journey-league-agenda.md](ux-design-journey-league-agenda.md)

---

## Executive summary

Delivery is reorganized into **four waves** after current in-flight work (Epic 5.1–5.3, 6.1–6.3 done). **New epics 12–14** implement the League journey; **Epic 3** stories already done remain valid with **follow-up migrations** in Epic 13. **Epics 5–6** resume after Wave 2 (member can reach events via agenda).

**Terminology:** Product = **Ligue**; code/API = `season` until rename slice.

---

## Current baseline (2026-05-24)

| Epic | Status | Notes |
|------|--------|-------|
| 1 | in-progress | 1.1–1.5 done |
| 2 | in-progress | 2.1–2.8, 2.4–2.7 done |
| 3 | in-progress | 3.1–3.5, 3.7–3.8 done; **3.6 Statistiques** + **3.6b Historique** ready-for-dev |
| 5 | in-progress | 5.1–5.3 done |
| 6 | in-progress | 6.1–6.3 done |

**Debt before Wave 1:** AC10 Story 2.7 (`/compte` preferred roles); optional 2.11 admin polish.

---

## Wave 0 — Hotfix entry (no domain change)

**Goal:** V1 parity; zero stub home.

| Story | Title | FR / UX |
|-------|-------|---------|
| **2.9** | Post-login + dernière ligue visitée | FR49 (partial), UX-DR13 |

**DoD:** No `/accueil`; `lastVisitedLeague` slug; fallback `/seasons` → later `/agenda`.

**Parallel:** Stories **3.6** (Statistiques), **3.6b** (Historique chronologie), AC10 fix. See [ADR 0012](../../docs/adr/0012-league-views-travel-leagues-member-stats.md).

---

## Wave 1 — Epic 12: Parcours membre & agenda utilisateur

**Goal:** Member hub = `/agenda`; navigation graph on events.

| Story | Title | FR / UX | Depends |
|-------|-------|---------|---------|
| **12.1** | API agenda utilisateur `GET /v1/me/agenda` | FR48 | 3.8 participants, events |
| **12.2** | Écran Mon agenda (`/agenda`) | FR48, UX-DR14 | 12.1 |
| **12.3** | Filtres troupe + ligue sur agenda | FR48, FR8 | 12.2 |
| **12.4** | Bandeau contexte événement (ligue + troupe + liens) | FR51, UX-DR15 | 6.2 event detail |
| **12.5** | Post-login → `/agenda` (finalize 2.9) | FR49, UX-DR13 | 12.2 |
| **12.6** | Route alias `/ligue/:slug` | UX-DR13 | 3.3 season-home |

**DoD Wave 1:** Member signs in → agenda; inter-troupe = two rows; event → ligue/troupe links.

---

## Wave 1b — Epic 16: Personal season glance (post-agenda)

| Story | Title | FR / UX | Depends |
|-------|-------|---------|---------|
| **16.1** | Route `/membre/:userSlug` + filtres | FR58–FR59, FR55, UX-DR8 | 12.3, 3.6 formulas |

**DoD:** Clin d'œil accessible depuis espace membre ; transparence V1 ; filtres masqués si un seul contexte.

---

## Wave 2 — Epic 13: Modèle League (domaine)

**Goal:** Multiple active leagues; roster modes; remove single-active constraint.

| Story | Title | FR / UX | Depends |
|-------|-------|---------|---------|
| **13.1** | Migration: multi-active leagues | FR11, ADR 0011 | 3.1 |
| **13.2** | API: activation sans désactivation des autres | FR11 | 13.1 |
| **13.3** | Création ligue — roster tous membres vs manuel | FR50, UX-DR17 | 13.2, 3.8 |
| **13.4** | UI création ligue + liste multi-active | UX-DR18 | 13.3 |
| **13.5** | Retest Epic 3 admin flows (activate/archive) | FR11, FR13 | 13.2 |
| **13.6** | Ligues déplacements (création + copy admin) | FR56, UX-DR20 | 13.3 |

**DoD Wave 2:** Troupe can run Ligue Loisir + Ligue Spectacle + optional Ligue Déplacements concurrently.

---

## Wave 3 — Epic 14: Hub troupe & découverte

**Goal:** Troupe as admin/identity layer; `/seasons` demoted.

| Story | Title | FR / UX | Depends |
|-------|-------|---------|---------|
| **14.1** | Page hub troupe `/troupe/:slug` | FR52, UX-DR16 | 2.4 |
| **14.2** | Liste ligues actives/archivées sur hub | FR52, UX-DR18 | 13.4, 14.1 |
| **14.3** | Pseudo troupe sur hub | FR9 | 14.1, 2.5 |
| **14.4** | Redirection `/seasons` → hub ou agenda | UX-DR13 | 14.1, 12.5 |
| **14.5** | Lien annuaire depuis hub | FR32, FR52 | 14.1; Epic 4 partial |

**DoD Wave 3:** Admin manages troupe from hub; member rarely sees flat seasons list.

---

## Wave 4 — Resume MVP core (Epics 5–6)

Continue backlog **after Wave 1 minimum** (agenda reachability):

| Epic | Stories | Gate |
|------|---------|------|
| 5 | 5.4–5.5 | Wave 1 done |
| 6 | 6.4–6.10 | Wave 1 done |
| 3 | 3.6 | Parallel Wave 0–1 |
| 1 | 1.6–1.7 | Anytime |
| 4 | 4.1–4.2 | Wave 3.5 for join flow |
| 8–10 | backlog | Post-MVP composition loop |

---

## Epic 16 — Personal season glance (Wave 1b)

| Story | Title | FR / UX |
|-------|-------|---------|
| **16.1** | Route `/membre/:userSlug` | FR58–FR59, FR55, UX-DR8 |

**Depends:** 12.3, 3.6 (stats formulas reference)

---

## Epic 15 (post-MVP) — Rencontres liées

| Story | Title | Notes |
|-------|-------|-------|
| 15.1 | Entité Encounter + lien events | Optional pairing BIM/Malice |
| 15.2 | UI admin « même rencontre » | Does not merge agenda rows |

---

## Epic renumbering map

| Old concept | New home |
|-------------|----------|
| Story 2.9 (post-login) | **2.9** Wave 0 → finalized in **12.5** |
| Story 2.10 (chrome troupe) | **12.3** + **14.1** |
| `/seasons` member hub | **12.2** `/agenda` + **14.4** redirect |
| Single active season | **13.1–13.2** removes constraint |
| Epic 11 (analytics FR47) | **Unchanged** — separate from journey epics |

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Epic 5/6 built on `/saison/:slug` | Route aliases; agenda deep-links same URLs |
| 3.1 tests assume single-active | 13.5 dedicated regression |
| Scope creep on Encounter | Epic 15 post-MVP; FR48 without merge |
| Label churn Saison/Ligue | UI only first; API stable |

---

## Suggested sprint order (2 stories max per session — retro rule)

1. **2.9** + AC10 fix  
2. **3.6** + **3.6b** (Statistiques + Historique chronologie)  
3. **12.1** + **12.2**  
4. **12.3** + **12.4**  
5. **12.5** + **12.6**  
6. **16.1** (clin d'œil route)  
7. **13.1** + **13.2**  
8. **13.3** + **13.4**  
9. **13.5** + **13.6**  
10. **14.1** + **14.2**  
11. **14.3**–**14.5** → **5.4**, **6.4**, …

---

*Generated from Correct Course + PM/UX session 2026-05-24.*

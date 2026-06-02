# Sprint Change Proposal — Epic 14 superseded by Epic 17

**Date:** 2026-06-01  
**Author:** Correct Course (BMad) — mini CC  
**Approver:** Patrice (product) — requested via `/bmad-correct-course`  
**Trigger:** Wave iso-V1 (PLAN § 2026-06-01) — Epic **14** backlog obsolete after Epic **17** delivery  
**Change scope:** **Minor** (documentation + backlog; no code)

---

## 1. Issue Summary

**Epic 14 — Hub troupe & découverte** (stories **14.1–14.5**) was planned before [ADR 0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) and the Epic **17** wave. The intended capabilities are **implemented or in review** under Epic **17** (and related epics), with routes **`/troupes`** + **`/troupes/:slug`** instead of legacy **`/troupe/:slug`**.

Keeping Epic **14** in backlog creates duplicate scheduling, stale FR/UX-DR mappings, and confusion for iso-V1 planning.

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 14** | Mark **superseded** — do not create or dev **14.x** stories |
| **Epic 17** | Remains source of truth for hub/navigation (incl. **17-28**, **17-29** in review) |
| **Epic 4** | **14.5** annuaire link → **17.3** (Mes troupes / Découvrir) + Epic **4** for full public directory |
| **PLAN.md** | Already notes partial overlap — align wording to **superseded** |
| **sprint-status.yaml** | Comment on `epic-14` + stories **14.x** — not scheduled |
| **SPEC / PRD** | No change — FR52 still covered via Epic **17** |

---

## 3. Story mapping (14.x → delivered / Epic 17)

| Story | Intent | Superseded by |
|-------|--------|----------------|
| **14.1** | Page hub troupe | **17.4** hub `/troupes/:slug` ; polish **17-29** (review) |
| **14.2** | Ligues actives / archivées | **17.4** (saisons sur hub, toggle archivées) |
| **14.3** | Pseudo sur hub | **17.4** + **2.5** (préférences troupe) |
| **14.4** | Redirection `/seasons` | **17.5** |
| **14.5** | Lien annuaire | **17.3** (`/troupes` — Découvrir) ; annuaire public complet = Epic **4** |

---

## 4. Recommended Approach

**Direct adjustment:** mark Epic **14** **superseded** in `epics.md`; update FR/UX-DR index rows; add sprint-status comments. **Do not** delete story text (historical trace).

**Not chosen:**

- Re-number Epic 14 stories into Epic 17 — already done under 17.x IDs.
- Implement remaining 14.x — duplicate work.

---

## 5. Artifact updates (this change)

| File | Change |
|------|--------|
| `epics.md` | Epic 14 banner **SUPERSEDED** + mapping table (list + detail sections) |
| `PLAN.md` | Epic 14 row → superseded reference + SCP link |
| `sprint-status.yaml` | Comments on epic-14 / 14.x — do not schedule |
| This SCP | Record decision |

---

## 6. Handoff

| Role | Action |
|------|--------|
| **PO** | Confirm no remaining 14.x intent outside Epic 17 / 4 |
| **Dev** | No implementation — reference **17.x** only |
| **PM** | Remove Epic 14 from iso-V1 active backlog |

**Success criteria:** No new `bmad-create-story` for **14.x**; FR52 traceable to Epic **17** in `epics.md`.

---

## 7. Approval

- [x] PO requested mini CC (2026-06-01)
- [x] Apply artifact updates

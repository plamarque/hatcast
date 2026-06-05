# Sprint Change Proposal — Consecutive-show assignment warning (composition)

**Date:** 2026-06-05  
**Author:** Correct Course (BMad) — `/bmad-help` + PO validation (G-010)  
**Approver:** Patrice (product)  
**Trigger:** Stakeholders want a **non-blocking informational warning** when an organizer assigns a participant to a slot if that person **already played the same role** on the **chronologically previous show** in the **same equity compartment** (category).  
**Change scope:** **Moderate** (planning + backlog; delivery via Epic **6.20**; shared predecessor-event semantics with Epic **19.9** draw factor, but **no draw penalty** in this story)

---

## 1. Issue Summary

Product intent (PO 2026-06-05):

| Need | Detail |
|------|--------|
| **When** | Immediately after slot assignment (manual pick **or** auto-draw result) |
| **What** | Inline warning on the slot row — no modal |
| **Why** | Help organizers spot back-to-back same-role assignments; decision stays with the organizer |
| **Scope roles** | **All roles** (player, MC, DJ, volunteer, …) — match on `(participantId, roleKey)` |
| **Blocking** | **No** — informational only |

**PO decisions (locked 2026-06-05):**

| Topic | Decision |
|-------|----------|
| **Previous show** | The event **immediately before** the current one in the season **by event date** (`startsAt`, then `createdAt`, then `id` tie-break — same ordering as selection-history queries) |
| **Compartment** | Same **category slug** as current event (`SpectacleCategory.slug`) — e.g. two `deplacements` in a row → warning; `deplacements` then `principal` (apéro) → **no** warning |
| **History source** | Only shows whose composition was **validated** (`event_compositions.validated_at IS NOT NULL`); exclude archived events; exclude `DECLINED` slots |
| **Draft composition** | Warning **still shown** while composition is draft — goal is to inform **before** validation |
| **UI placement** | Discreet inline hint next to / below / on the slot — yellow-toned, icon + short text; **no modal** |
| **Copy content** | Must name the **previous show title** and **date** |
| **Draw vs manual** | **Same behaviour** after assignment |

**Normative rule (for DOMAIN/SPEC in story 6.20):**

```
immediatePredecessorEvent(currentEvent) =
  max by (startsAt, createdAt, id) among season events E where
    E.id ≠ currentEvent.id
    AND SpectacleCategory.slug(E) = SpectacleCategory.slug(currentEvent)
    AND composition(E).validatedAt IS NOT NULL
    AND E.archived = false
    AND E is strictly before currentEvent in chronological order

consecutiveRoleWarning(slotAssignment) =
  let prev = immediatePredecessorEvent(currentEvent)
  if prev is null → no warning
  else if ∃ validated slot S on prev with
       S.participantId = slotAssignment.participantId
       AND S.roleKey = slotAssignment.roleKey
       AND S.participationStatus ≠ DECLINED
  → warning { previousEventTitle, previousEventDate }
  else → no warning
```

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 6** | New story **6.20** — API metadata + Équipe tab UI |
| **Epic 19.9** | **Related, not duplicate** — 19.9 = optional **draw factor** (malus/exclusion); **6.20** = **UX warning only**. Share predecessor-event + compartment definition; implement query helper once, reuse in 19.9 later |
| **API** | Extend composition slot DTO (or assignment response) with optional `consecutiveShowWarning`; candidate list may expose same flag in picker |
| **Front** | `event-equipe-tab` slot rows + post-draw refresh; optional hint in `composition-slot-picker-dialog` |
| **PRD / SPEC / DOMAIN** | **6.20** adds normative consecutive-warning model (extends organizer composition UX; no new FR until PO promotes) |
| **UX** | New spec [ux-design-composition-consecutive-show-warning.md](ux-design-composition-consecutive-show-warning.md) |
| **PLAN.md** | Row **6.20** post-MEP polish |
| **growth-backlog G-010** | Promoted → this SCP |

**Not chosen:**

- Modal or blocking confirm — rejected (informational only)
- Cross-compartment warning — rejected
- Counting draft/unvalidated prior assignments — rejected
- Draw-only scope — rejected (manual + draw)

---

## 3. Recommended Approach

**Direct adjustment** — single story **6.20** within Epic 6 (API + UI + tests). **P2** post-MEP polish; can ship independently of Epic 19 pipeline.

| Step | Story / skill | Outcome |
|------|---------------|---------|
| 1 | **6.20** spec tasks (DOMAIN/SPEC snippets) | Locked rule |
| 2 | **`bmad-create-story`** → `6-20-avertissement-rejeu-spectacle-precedent` | Story file |
| 3 | **`bmad-dev-story`** | Implementation |
| 4 | **`bmad-code-review`** | Merge gate |

**Sequencing:** No dependency on **19.6** or draw pipeline. Optional refactor: extract `ImmediatePredecessorEventResolver` for **19.9** later.

---

## 4. Detailed change proposals

### 4.1 New Story 6.20

**Title:** Consecutive-show assignment warning (same role, same compartment)

**User story:**  
As an **organizer** composing a team,  
I want a **visible but non-blocking warning** on a slot when the assigned person **already held the same role** on the **previous validated show** in the same category,  
so I can **decide consciously** whether to keep them.

**Acceptance Criteria**

1. **Given** the current event’s compartment and chronological position, **when** the system resolves `immediatePredecessorEvent`, **then** it is the latest prior season event in the **same category slug** with a **validated composition** (not archived).
2. **Given** no such predecessor exists, **when** any slot is assigned, **then** no consecutive-show warning is shown.
3. **Given** a predecessor event P and an assignment of participant X to role R on the current event, **when** X held role R on P (validated slot, not declined), **then** the slot displays an inline warning naming **P’s title** and **P’s date** (French locale formatting).
4. **Given** the same assignment conditions but P is in a **different compartment**, **when** assigning, **then** **no** warning (e.g. déplacement then apéro/principal).
5. **Given** a **draft** composition, **when** a triggering assignment exists, **then** the warning is still visible to organizers.
6. **Given** assignment via **manual pick** or **auto-draw**, **when** slots are persisted, **then** warnings appear consistently after the same API refresh path.
7. **Given** the warning is shown, **when** the organizer clears or replaces the slot, **then** the warning disappears or updates accordingly.
8. **Given** the warning UI, **when** rendered, **then** it uses Material 3 semantic **warning** tokens (no hex); no modal; meets FRONTEND_UI checklist.
9. **Couverture :** FR21 (manual assignment UX); complements **19.9** (draw policy) without implementing 19.9. **Priorité :** P2. **Depends :** **6.5** (done), **17.7** category model (done).

**Suggested API surface**

- `CompositionSlot.consecutiveShowWarning?: { previousEventId, previousEventTitle, previousEventStartsAt }`
- Populated server-side on GET composition and on assign/draw responses

**Suggested UI copy (FR, tunable in story)**

> Déjà en **{roleLabel}** au spectacle **« {title} »** ({date}).

Icon: `warning_amber` or `flag` — compact row under slot name.

---

## 5. Artifact updates (this change)

| File | Change |
|------|--------|
| `epics.md` | Story **6.20** under Epic 6 |
| `sprint-status.yaml` | `6-20-avertissement-rejeu-spectacle-precedent` → `backlog` |
| `PLAN.md` | Row **6.20** |
| `growth-backlog.md` | G-010 → **Promu Epic 6.20** |
| `ux-design-composition-consecutive-show-warning.md` | UX wireframe + tokens |
| This SCP | Record decision |

**Out of scope for SCP apply:** Kotlin/Angular code, SPEC.md/DOMAIN.md body (updated inside **6.20** dev tasks).

---

## 6. Open questions (non-blocking)

| ID | Question | Assumption | Revisit |
|----|----------|------------|---------|
| **OQ-6-20-01** | Show warning in **slot picker** list before confirm? | **V1 story:** warning **on slot row after** assignment; picker optional stretch | Story file |
| **OQ-6-20-02** | Tooltip with full date+time vs date-only | **Date** in troupe locale (Paris), same as agenda | Story UX |
| **OQ-6-20-03** | Member (non-orga) sees warning? | **Organizers only** (same as draft composition visibility) | PO confirm in story |

---

## 7. Handoff

| Role | Action |
|------|--------|
| **PO** | Confirm OQ-6-20-03 (orga-only assumed) |
| **Dev** | **`bmad-create-story` for 6.20** (fresh context) when prioritized |
| **Dev (19.9)** | Reuse predecessor resolver when implementing draw factor — do not duplicate SQL |

**Success criteria:**

- Organizer assigns same person same role back-to-back in same compartment → yellow inline warning with prior show name + date.
- Different compartment between shows → no warning.
- Replacing assignment removes/updates warning.
- No regression on composition assign/draw flows.

---

## 8. Approval

- [x] PO validated rules (2026-06-05)
- [x] Apply artifact updates (`epics.md`, `sprint-status.yaml`, `PLAN.md`, `growth-backlog.md`, UX spec)

---

## 9. Amendment log

| Date | Change |
|------|--------|
| 2026-06-05 | Initial SCP (G-010 → Epic 6.20) |

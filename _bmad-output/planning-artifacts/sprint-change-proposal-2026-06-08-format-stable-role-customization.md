# Sprint Change Proposal — Stable event format during role customization

**Date:** 2026-06-08  
**Author:** Correct Course (BMad)  
**Approver:** Patrice (product) — **approved 2026-06-08**  
**Trigger:** PO report — customizing role counts on a spectacle silently changes `templateType` to `custom` (« Autre »)  
**Change scope:** **Minor** — one front-end behaviour fix + tests + story/doc amendments; no API or migration

---

## 1. Issue Summary

### Problem statement

When an organizer opens **Format et besoins** (`EventTypeRolesDialog`) on the event **Infos** tab and **customizes role slot counts** (e.g. Match with 4 players instead of 5, or Match without coach), the UI **automatically rewrites `templateType` to `custom`** (« Autre ») on save. The spectacle then loses its intended format identity (icon, stats column routing, semantic label).

### Expected behaviour (PO / DOMAIN)

- **`templateType` (Format)** = spectacle format identity (match, cabaret, longform, …). Used for **default slot initialization**, agenda icon, and statistics routing (`jeuSubColumn`).
- **`roleSlots`** = **per-event effective needs**. May deviate from the format preset without changing the format.
- Format changes **only** when the organizer explicitly selects a different format in the dropdown (with confirmation if current slots differ from the new preset).

### Discovery context

- Reported during live use of Infos tab role customization (Epic 17, story **17.14**).
- Root cause: `onRoleCountChange` calls `detectTemplateFromRoles`, which returns `custom` whenever the full slot map does not **exactly** match a global preset.

### Evidence

```typescript
// apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts:138-141
protected onRoleCountChange(role: RoleKey, raw: string): void {
  const n = clampRoleCount(Number(raw))
  this.roleSlots = { ...this.roleSlots, [role]: n }
  this.selectedTemplateType = detectTemplateFromRoles(this.roleSlots) // ← forces custom
}
```

```typescript
// apps/web/src/app/core/events/event-types.ts:250-257
export function detectTemplateFromRoles(slots: RoleSlots): EventTypeId {
  for (const typeId of EVENT_TYPE_IDS) {
    if (roleSlotsEqual(slots, ROLE_TEMPLATES[typeId])) return typeId
  }
  return 'custom'
}
```

**DOMAIN.md** already states the intended separation:

> **Format (`templateType`):** … Drives **default** role slots and statistics column routing.

**Conflict with shipped stories:** Story **17.14** AC3 and story **3.22** AC5 / **DW-103** explicitly **accepted** auto-inference to `custom` on slot edit. This SCP **reverses that acceptance** as a product misunderstanding, not a new feature.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **Epic 3** (events / types) | Story **3.4** intent (FR14) is **clarified**, not expanded. No API change. |
| **Epic 17** (event UX) | Story **17.14** AC3 must be **amended**. New story **17.37** for the fix. |
| **Epic 6** (composition) | **No change** — already consumes `roleSlots` for slot rows. |
| **Epic 17.10** (stats) | **Benefit** — customized Match stays in JEU MATCH column via `templateType`. |
| **Epic 8** (notifications) | **No change** — `EVENT_DETAILS_CHANGED` on format change becomes **less noisy** (role-only edits no longer masquerade as format change). |
| **Future epics** | No new epic; no reordering. |

### Story impact

| Story | Status | Action |
|-------|--------|--------|
| **3.4** | done | Add Dev Notes clarification: format and slots are independent after init. |
| **3.22** | done | Close **DW-103** as resolved by 17.37. |
| **17.14** | done | Amend AC3 — remove `detectTemplateFromRoles` on role count change. |
| **17.37** (new) | backlog | Implement fix + regression tests. |

### Artifact conflicts

| Artifact | Conflict? | Action |
|----------|-----------|--------|
| **PRD (FR14)** | No — FR14 supports per-event role configuration | Optional one-line clarification in FR14 footnote: format stable when customizing slots. |
| **DOMAIN.md** | No — already correct | Optional: add one sentence under Format: « Slot overrides do not change format. » |
| **Architecture** | No | N/A |
| **UX (17.14 journey)** | Minor | No wireframe change; behaviour matches user mental model. |
| **OpenAPI / API** | No | `templateType` and `roleSlots` already independent fields. |
| **deferred-work-archive (DW-103)** | Yes | Mark resolved when 17.37 done. |

### Technical impact

| Layer | Change |
|-------|--------|
| **Front** | Remove `detectTemplateFromRoles` call from `onRoleCountChange`; keep helper for invalid/missing API `templateType` fallback in `ngOnInit` only. |
| **API** | None |
| **DB / migration** | None — existing rows with `template_type = custom` and match-like slots are **not** auto-corrected (cosmetic only). |
| **Tests** | Add dialog + Infos tab specs; existing `detectTemplateFromRoles` unit tests remain (helper still valid). |
| **CI** | `npm run test -w @hatcast/web` |

### Regression surface (verified)

| Consumer | Field used | After fix |
|----------|------------|-----------|
| Agenda icon | `templateType` | ✅ Unchanged on role customize |
| Stats JEU sub-columns | `templateType` via `jeuSubColumn` | ✅ Match stays « match » |
| Composition slots | `roleSlots` | ✅ Uses actual counts |
| Availability / dispos | `roleSlots` | ✅ Uses actual counts |
| Draw / chances | `roleSlots` + category | ✅ Unchanged |
| Notification format change | `templateType` delta | ✅ Fewer false positives |

---

## 3. Recommended Approach

**Selected: Option 1 — Direct Adjustment**

| Option | Viable? | Rationale |
|--------|---------|-----------|
| **1. Direct adjustment** | ✅ **Recommended** | ~1 line + tests; aligns code with DOMAIN; no rollback needed. |
| **2. Rollback 17.14** | ❌ | Dialog extraction was correct; only one method call is wrong. |
| **3. MVP review** | ❌ | MVP scope unchanged; this is a bugfix / requirement clarification. |

**Effort:** Low (≤ 0.5 day)  
**Risk:** Low — narrow front-end change with explicit test coverage  
**Timeline:** Can ship immediately after story creation; no epic resequencing.

---

## 4. Detailed Change Proposals

### 4.1 New story — 17.37

**File:** `_bmad-output/implementation-artifacts/17-37-format-stable-role-customization.md`

**Story:**

As an **organizer**,  
I want **role slot customization to keep the selected spectacle format**,  
so that **a Match with 4 players or without coach remains a Match** (icon, stats, semantics).

**Acceptance Criteria:**

1. **Given** a spectacle with `templateType = match`, **when** the organizer changes role counts in `EventTypeRolesDialog` without changing the format dropdown, **then** save persists `templateType = match` and the updated `roleSlots`.
2. **Given** the format dropdown, **when** the organizer selects a different format and confirms overwrite, **then** `templateType` and preset slots update (unchanged behaviour).
3. **Given** dialog open, **when** initialized from API, **then** `templateType` from API is authoritative; `detectTemplateFromRoles` is used **only** if API value is not a known `EventTypeId`.
4. **Given** tests, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** new specs pass and 17.14 / event-infos-tab regressions stay green.
5. **UI : N/A** beyond existing M3 dialog (no visual change).

**Tasks:**

- [ ] Remove `detectTemplateFromRoles` from `onRoleCountChange` in `event-type-roles-dialog.ts`
- [ ] Add `event-type-roles-dialog.spec.ts` case: customize player count on match → `templateType` stays `match`
- [ ] Extend `event-infos-tab.spec.ts`: PATCH body keeps `templateType` on role-only edit
- [ ] Close **DW-103** in `deferred-work-archive.md` (reference 17.37)

---

### 4.2 Amend story 17.14 — AC3

**Story:** 17.14 — Infos tab — event type and roles (modales)

**Section:** Acceptance Criteria #3

**OLD:**

> **Given** the type/roles dialog, **when** the user changes template type, role counts, confirms template overwrite, or saves, **then** behaviour matches today's `EventFormDialog` logic (template picker, « Changement de type » confirm, summary vs grid, **`detectTemplateFromRoles`**, counts 0–20).

**NEW:**

> **Given** the type/roles dialog, **when** the user changes **role counts only**, **then** `templateType` **remains unchanged** (format is not inferred from slots).  
> **Given** the type/roles dialog, **when** the user changes **template type** via the format dropdown, confirms template overwrite, or saves, **then** behaviour matches prior dialog logic (template picker, « Changement de format » confirm, summary vs grid, counts 0–`ROLE_COUNT_MAX`). `detectTemplateFromRoles` is used **only** as fallback when API `templateType` is missing or invalid — **not** on role count edits.

**Rationale:** Corrects implementation drift vs DOMAIN and PO intent.

---

### 4.3 Amend story 3.4 — Dev Notes (optional, non-blocking)

**Section:** Dev Notes

**ADD:**

> **Format vs slots:** `templateType` is the spectacle format identity. `roleSlots` may diverge from the format preset after per-event customization without changing `templateType`. Presets apply on explicit format change (with confirmation) or event creation defaults.

---

### 4.4 Close deferred work DW-103

**File:** `_bmad-output/implementation-artifacts/deferred-work-archive.md`

**Section:** Template match (fermé story 3.22)

**OLD:**

> **DW-103** — Matchs historiques `coach: 0` → `detectTemplateFromRoles` = `custom` si édition — **accepté**, pas de backfill massif (AC4–5 story 3.22).

**NEW:**

> **DW-103** — **Résolu** par SCP 2026-06-08 + story **17.37** : personnalisation des slots ne modifie plus `templateType`. Matchs historiques `coach: 0` restent valides en lecture ; pas de backfill massif.

---

### 4.5 DOMAIN.md (optional clarification)

**Section:** Format definition (~line 17)

**ADD after existing Format bullet:**

> Per-event `roleSlots` may override format defaults; overrides **do not** change `templateType`.

---

### 4.6 sprint-status.yaml

**ADD:**

```yaml
17-37-format-stable-role-customization: backlog
```

(under `development_status`, epic-17 block, after 17-36)

---

## 5. Implementation Handoff

### Scope classification: **Minor**

Direct implementation by Developer agent — no PM/Architect replan.

### Handoff plan

| Role | Responsibility |
|------|----------------|
| **PO (Patrice)** | Approve this SCP |
| **Developer (`bmad-create-story` → `bmad-dev-story`)** | Create story file 17.37, implement fix, run tests |
| **Reviewer (`bmad-code-review`)** | Verify AC + regression matrix §2 |
| **Tech writer (optional)** | DOMAIN one-liner if approved |

### Success criteria

1. Match spectacle: customize 5→4 players → still shows ⚔️ Match in Infos and agenda.
2. Stats: same spectacle counts in JEU MATCH, not « autre ».
3. Explicit format change via dropdown still works with confirmation.
4. All web unit tests green.
5. DW-103 marked resolved.

### Suggested sequence

1. Approve SCP  
2. `bmad-create-story` → **17.37**  
3. `bmad-dev-story` → implement  
4. `bmad-code-review`  
5. Update `sprint-status.yaml` → `17-37` in-progress → done  

---

## 6. Checklist Summary

| Section | Status |
|---------|--------|
| 1. Trigger & context | [x] Done — stories 17.14 / 3.4 / DW-103 |
| 2. Epic impact | [x] Done — Epic 17 + minor 3.4 note |
| 3. Artifact conflicts | [x] Done — no PRD/MVP conflict |
| 4. Path forward | [x] Done — Direct adjustment |
| 5. Proposal components | [x] Done |
| 6. Final review | [x] Approved by Patrice 2026-06-08 |

---

*End of Sprint Change Proposal*

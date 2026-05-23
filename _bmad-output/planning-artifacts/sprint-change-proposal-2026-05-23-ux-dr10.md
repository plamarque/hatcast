# Sprint Change Proposal — 2026-05-23 — UX-DR10 Admin Membres Route

**Type:** Direct adjustment (UI migration follow-up)  
**Trigger:** Approved UX spec replaces modal-based admin UI from Stories 2.2 / 2.3  
**Status:** Approved — 2026-05-23  
**Approved by:** Patrice  
**Approval mode:** Batch (trigger supplied by stakeholder)

---

## 1. Issue Summary

Stories **2.2** and **2.3** are **done** with a working backend (member CRUD, baseline roles, CSV export/import) and a **dialog-based** Angular UI:

| Current implementation | Location |
|------------------------|----------|
| `TroupeMembersDialog` — wide modal, inline add form, embedded CSV blocks, verbose rows, `mat-select` status, timestamps visible | `apps/web/src/app/pages/season-home/troupe-members-dialog.ts` |
| `SeasonOrganizersDialog` — separate modal | `apps/web/src/app/pages/season-home/season-organizers-dialog.ts` |
| Settings menu — **two entries** (Membres + Organisateur·ices) | `season-header.html` |

On **2026-05-23**, stakeholder sign-off locked **[ux-design-specification.md](./ux-design-specification.md)** (UX-DR10) which **replaces** this modal pattern with a **single admin route**:

- Route: `/saison/:slug/admin/membres`
- Settings menu: **one** item **Membres** → route with tabs
- Tabs: **Membres** (troupe membership) | **Organisateur·ices** (season delegation)
- Toolbar: search, **Ajouter** (modal), **Exporter**, **Importer ▾**
- Compact list, **slide toggle** for active state, **inactive hidden by default**
- No dates in list; auto-save on role/toggle; **Nommer orga saison** shortcut
- CSV import results in **MatDialog** (not inline)

**Problem type:** Failed approach requiring different solution (UI pattern), not a requirements misunderstanding — FR7 and FR42 remain valid; only the **presentation layer** diverges from the now-approved UX-DR10 spec.

**Evidence:**

- Readiness report 2026-05-23 flagged thin epic AC vs UX; spec was finalized and approved same day.
- `epics.md` UX-DR10 line already references the route and spec; code still opens dialogs from `season-home.ts`.
- No route `/saison/:slug/admin/membres` exists in the web app.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact | Action |
|------|--------|--------|
| **Epic 2** | Stories 2.2 / 2.3 **backend + API contracts remain valid**. UI portion is **non-compliant** with approved UX-DR10. | Add follow-up story; do **not** rollback 2.2 / 2.3. |
| **Epic 3** | Story **3.5** (review) — organizer CRUD currently in `SeasonOrganizersDialog`; must move to **Organisateur·ices** tab on shared route. Retest 3.5 after UI migration. | Coordinate regression test with follow-up story. |
| **Epics 5–6** | None immediate — admin surfaces unchanged at API level. | N/A |

Epic 2 can still complete as planned; one **additional UI story** is required before claiming full UX-DR10 compliance for member admin.

### Story impact

| Story | Status | Impact |
|-------|--------|--------|
| **2.2** | done | Backend, permissions, member API **keep**. Angular dialog UI **superseded** by spec. Add completion note + defer UI compliance to follow-up. |
| **2.3** | done | CSV API **keep**. Export/import wired in dialog **move** to toolbar on new route. |
| **3.5** | review | Organizer dialog **merge** into route tab; product retest already deferred — include in follow-up QA. |
| **New: 2.8** (proposed) | backlog | **Admin Membres route UI (UX-DR10)** — sole owner of frontend migration. |

### Artifact conflicts

| Artifact | Conflict? | Update needed |
|----------|-----------|---------------|
| **PRD** (FR7, FR42) | No | None — capabilities unchanged |
| **epics.md** | Partial | UX-DR10 already updated; add Story **2.8** (or equivalent) for UI migration |
| **ux-design-specification.md** | No — **authoritative** | None (approved) |
| **ux-design-hatcast-v2.md** | No | Already mirrors spec § Admin Membres |
| **architecture.md** | Minor | Optional note: admin people UI = routed page, not season-home dialogs |
| **Story files 2.2 / 2.3** | Yes | Add “UI superseded” notes; point to follow-up story |
| **sprint-status.yaml** | Yes | Add `2-8-admin-membres-route-ui-ux-dr10` entry |

### Technical impact

**Backend:** No schema or API changes expected. Reuse:

- `GET/POST/PATCH/DELETE /v1/troupes/{troupeId}/members`
- `GET/POST .../members/export`, `POST .../members/import`
- Season organizer endpoints from Story 3.5
- `MySeasonPermissionsDto` flags (`canManageMembers`, `canManageSeasonOrganizers`)

**Frontend (moderate effort):**

1. New route + page component(s) under `apps/web/src/app/pages/` (e.g. `admin-membres/`)
2. Route guard from permission flags
3. Tab bar (Membres | Organisateur·ices) with query `?onglet=`
4. Extract/reuse logic from dialogs into tab components + small add/import modals
5. Replace settings menu dual entries with single **Membres** → `router.navigate`
6. Remove or deprecate `TroupeMembersDialog`, `SeasonOrganizersDialog` after migration
7. Migrate / replace component tests

**Risk:** Low for API; medium for UI (large dialog files ~300+ lines each, permission matrix, auto-save UX).

---

## 3. Recommended Approach

**Selected: Option 1 — Direct adjustment** (add follow-up story within Epic 2)

| Option | Viable? | Rationale |
|--------|---------|-----------|
| **1. Direct adjustment** | ✓ **Recommended** | Backend done; UI-only migration. ~1 sprint slice. |
| **2. Rollback 2.2 / 2.3** | ✗ | Wastes working API, tests, and authorization refactor. |
| **3. MVP scope reduction** | ✗ | No FR removed; UX is approval of existing FR7/FR42 presentation. |

**Effort:** Medium (frontend-focused, ~3–5 dev days for route, tabs, toolbar, modals, tests, 3.5 retest)  
**Risk:** Medium (regression on permissions gating and CSV flows)  
**Timeline:** Insert **before** Epic 2 stories 2.4+ if admin UX is a gate for migration cutover; can parallel 2.4 if troupe switcher is independent.

---

## 4. Detailed Change Proposals

### 4.1 New story — Epic 2, Story 2.8 (proposed)

**File:** `_bmad-output/implementation-artifacts/2-8-admin-membres-route-ui-ux-dr10.md`  
**Title:** Admin Membres route UI (UX-DR10 spec compliance)

**User story:**

As a **troupe administrator or season organizer**,  
I want **one admin route** for troupe members and season organizers,  
so that **migration and day-to-day admin** match the approved compact UX without separate modals.

**Acceptance criteria (summary — derive full AC from [ux-design-specification.md](./ux-design-specification.md) acceptance hints):**

1. Route `/saison/:slug/admin/membres` with guard; unauthorized → snack + redirect to agenda.
2. Settings ⚙ menu: **single** item **Membres** (remove separate Organisateur·ices entry).
3. Tabs **Membres** | **Organisateur·ices**; hide tab bar if only one permitted; deep link `?onglet=membres|organisateurs`.
4. Toolbar per spec (search, Ajouter, Exporter, Importer ▾ on Membres tab only).
5. Membres tab: compact rows, slide toggle, inactive hidden by default, inline name edit, auto-save, last-admin guard, **Nommer orga saison** shortcut.
6. Organisateur·ices tab: compact list, add modal with autocomplete, Retirer + confirm.
7. CSV import results in MatDialog; export immediate download + snack.
8. Collapsible **Aide migration V1** below Membres list.
9. Remove dialog entry points from `season-home`; delete or thin-wrap legacy dialog components.
10. Tests: route guard, tab visibility, toolbar actions, migrated flows from dialog specs.

**Dependencies:** Stories 2.2, 2.3, 3.5 (API).  
**Out of scope:** New API endpoints; Story 3.8 Participants screen.

---

### 4.2 epics.md — Add Story 2.8

**Section:** Epic 2, after Story 2.3

**NEW:**

```markdown
#### Story 2.8 : Route admin Membres (UX-DR10)

En tant qu’administrateur de troupe ou organisateur·ice de saison autorisé·e,
je veux gérer membres de troupe et organisateur·ices de saison depuis une route admin unique,
afin de suivre l’expérience approuvée (liste compacte, recherche, CSV en barre d’outils) sans modales séparées.

**Acceptance Criteria**

- **Given** des droits `canManageMembers` et/ou `canManageSeasonOrganizers`, **when** l’utilisateur ouvre `/saison/:slug/admin/membres`, **then** l’écran conforme à [ux-design-specification.md](./ux-design-specification.md) s’affiche (onglets, toolbar, liste compacte, modales d’ajout uniquement).
- **Given** aucun droit admin people, **when** la route est accédée, **then** redirection agenda + message (NFR-S2).
- **Given** Story 2.2 / 2.3 API existantes, **when** l’UI est utilisée, **then** aucune régression sur CRUD membres ni import/export CSV.
- **Couverture :** FR7, FR42 (UI) ; UX-DR10 ; NFR-S2.

**Dépendances :** Stories 2.2, 2.3, 3.5 (organisateurs).
```

**Also update** UX-DR10 traceability table row to include **2.8**.

---

### 4.3 Story 2.2 — Completion note (append)

**Section:** Dev Agent Record → Completion Notes List

**ADD:**

```markdown
- **Correct Course 2026-05-23 (UX-DR10):** Member admin UI shipped as `TroupeMembersDialog` (modal). Approved [ux-design-specification.md](../planning-artifacts/ux-design-specification.md) supersedes dialog pattern with route `/saison/:slug/admin/membres`. Backend/API/permissions from this story remain authoritative; UI migration tracked as **Story 2.8**.
```

**Section:** Acceptance Criteria — AC1 footnote

**ADD after AC1:**

```markdown
   - **UI note (2026-05-23):** List timestamps in dialog UI superseded by UX-DR10 (dates hidden on route screen). Functional list/paging requirement unchanged.
```

---

### 4.4 Story 2.3 — Completion note (append)

**Section:** Dev Agent Record → Completion Notes List

**ADD:**

```markdown
- **Correct Course 2026-05-23 (UX-DR10):** CSV export/import UI embedded in `TroupeMembersDialog`. Target: toolbar **Exporter** + **Importer ▾** on Membres route tab; import results in dedicated MatDialog per spec. API unchanged; UI migration = **Story 2.8**.
```

---

### 4.5 Story 3.5 — Retest note (append when file updated)

Add to review/deferred section:

```markdown
- **UX-DR10 follow-up:** Season organizer UI moves from `SeasonOrganizersDialog` to Organisateur·ices tab on `/saison/:slug/admin/membres`. Retest organizer add/remove after Story 2.8.
```

---

### 4.6 sprint-status.yaml

**ADD under epic-2:**

```yaml
  2-8-admin-membres-route-ui-ux-dr10: backlog
```

**Optional:** Set `2-8` → `ready-for-dev` after `bmad-create-story` fills implementation file.

---

### 4.7 Code migration map (implementation handoff)

| Current | Target |
|---------|--------|
| `season-header.html` — Membres + Organisateur·ices menu items | Single **Membres** → `routerLink` to admin route |
| `season-home.ts` — `openMembersAdmin()`, `openSeasonOrganizers()` | Remove; navigation via route |
| `troupe-members-dialog.ts` | Logic → Membres tab + add-member modal + import-results dialog; then delete |
| `season-organizers-dialog.ts` | Logic → Organisateur·ices tab + add-organizer modal; then delete |
| Inline CSV sections in dialog | Toolbar Exporter / Importer ▾ |
| `mat-select` status | `mat-slide-toggle` Actif |
| Visible `createdAt` / `updatedAt` | Hidden |

---

## 5. Implementation Handoff

### Scope classification

**Moderate** — Backlog addition (Story 2.8) + frontend refactor; PO/DEV coordination; no PM/architect replan.

### Handoff

| Role | Responsibility |
|------|----------------|
| **PO / Patrice** | Approve this proposal; prioritize 2.8 vs 2.4 |
| **UX** | Spec already approved — no further design pass unless gaps found in implementation |
| **Developer (Amelia)** | Run `/bmad-create-story 2-8` then `/bmad-dev-story`; implement route UI per spec |
| **QA / Review** | Regression: member CRUD, CSV, organizer tab, permission guards, 3.5 matrix |

### Success criteria

- [ ] One settings entry **Membres** → route with correct tabs
- [ ] All [ux-design-specification.md](./ux-design-specification.md) acceptance hints satisfied
- [ ] Dialog components removed from production navigation
- [ ] Existing API integration tests still green; web tests cover new route
- [ ] Story 3.5 organizer flows retested on new tab

### Suggested sequence

1. Approve this Sprint Change Proposal  
2. Apply artifact updates (epics, story notes, sprint-status)  
3. `/bmad-create-story` for **2-8-admin-membres-route-ui-ux-dr10**  
4. Implement route + migrate tests  
5. Mark 2.8 done; close UX-DR10 UI gap for Epic 2 admin people

---

## Checklist (Correct Course)

### Section 1 — Trigger

- [x] **1.1** Triggering stories: 2.2, 2.3 (UI); spec UX-DR10 approved 2026-05-23  
- [x] **1.2** Problem: dialog UI ≠ approved route-based UX  
- [x] **1.3** Evidence: dialog files, readiness report, missing route

### Section 2 — Epic impact

- [x] **2.1** Epic 2 completable with follow-up story  
- [x] **2.2** Add Story 2.8; no epic scope change  
- [x] **2.3** Epic 3 Story 3.5 UI coupling noted  
- [x] **2.4** No epics obsolete  
- [x] **2.5** Optional: prioritize 2.8 before migration/demo if admin UX is showcase-critical

### Section 3 — Artifacts

- [x] **3.1** PRD — no change  
- [x] **3.2** Architecture — optional UI note only  
- [x] **3.3** UX — spec is source of truth; implementation catches up  
- [x] **3.4** Tests/docs — dialog tests → route tests

### Section 4 — Path forward

- [x] **4.1** Direct adjustment — **viable**  
- [x] **4.2** Rollback — **not viable**  
- [x] **4.3** MVP review — **not needed**  
- [x] **4.4** Selected: **Option 1**

### Section 5–6 — Proposal & handoff

- [x] **5.1–5.5** Documented above  
- [x] **6.3** User approval — **approved 2026-05-23**  
- [x] **6.4** sprint-status.yaml updated (`2-8-admin-membres-route-ui-ux-dr10: backlog`)  
- [x] **6.5** Handoff — Developer agent via `/bmad-create-story 2-8`

---

**Prepared by:** Correct Course workflow (BMad)  
**Stakeholder:** Patrice  
**Date:** 2026-05-23

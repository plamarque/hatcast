# Sprint Change Proposal — Spectacle category glossary UX & admin governance

**Date:** 2026-06-08  
**Author:** Correct Course (BMad)  
**Approver:** Patrice (product) — **pending**  
**Trigger:** UX review of Infos tab **Catégorie** section (chip affordance + autocomplete dialog) after ship **17.8**  
**Change scope:** **Moderate** — amend normative UX/API docs; add stories **17.38–17.39**; no rollback of **17.7** data model

---

## 1. Issue Summary

### Problem statement

The shipped **Catégorie** UX (Stories **17.7** / **17.8**, Screen 6b amended 2026-06-08) uses:

1. A **flat chip** that does not read as clickable for organizers.
2. A **free-text autocomplete dialog** (`EventCategoryDialog`) that treats categories like tags — any organizer can type unknown values and auto-create glossary entries on event PATCH.

Product review (2026-06-08) concludes this model is wrong for HatCast:

- Troupes will have **dozens, not thousands**, of categories.
- Categories must be **visible and selectable** (not discovered by typing).
- **Controlled vocabulary** is required to avoid typo duplicates (`Aperock` / `Apérock` / `aperocks`).
- **Category lifecycle** (create / rename / delete) belongs to **troupe admins**, not implicit creation during event edit.
- **Organizers** assign an existing category to a spectacle; admins curate the list.
- **Deletion** must show **impact count** (spectacles affected → reassigned to **Spectacle ordinaire**) so admins understand consequences.

### Triggering stories

| Story | Status | Role |
|-------|--------|------|
| **17.7** | done | API `category`, `troupe_categories`, auto-create on event save |
| **17.8** | done | Infos tab chip + `EventCategoryDialog` autocomplete |

### Evidence

- Screenshots: chip « Spectacle ordinaire » without edit affordance; modal with autocomplete field « Catégorie (optionnelle) ».
- Code: [`event-category-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-category-dialog.ts) — `MatAutocomplete`, free submit creates slug via API.
- Spec: [Screen 6b](ux-design-journey-league-agenda.md) — « autocomplete against troupe glossary; type unknown → create category ».
- ADR 0013 §3 — « unknown typed value may create a new troupe category ».

### Issue type

**Failed approach requiring different solution** — not a bug in 17.8 implementation; implementation matches spec. Product governance model changed after hands-on use.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **17** (navigation & categories) | **Extend** — two new stories; amend Screen 6b; **17.7** / **17.8** AC superseded for UX/governance only |
| **19** (draw engine Wave D) | **Low** — still consumes `event.category` slugs from glossary **17.7**; admin CRUD improves data quality for **19.18–19.21** policy UI |
| **3** (events) | **Low** — PATCH semantics unchanged (`category: null \| slug`); reject unknown slugs instead of auto-create |
| **6** (composition) | **None** — `SpectacleCategory` compartment logic unchanged |
| **MIG-4** | **None** — `deplacements` backfill unaffected |

Epic **17** can still complete; this adds polish stories before optional epic retrospective.

### Story impact

| Story | Action |
|-------|--------|
| **17.7** | Amend AC — remove orga auto-create on event PATCH; add admin CRUD endpoints; seed / virtual built-in `deplacements` |
| **17.8** | Amend AC — replace autocomplete with selection list; chip affordance; admin « Gérer les catégories » entry point on Infos |
| **17.10** | **No change** — stats filter already uses glossary + principal |
| **17.8** implementation files | Refactor `EventCategoryDialog`; extend `event-infos-tab` |
| **New 17.38** | API — admin category CRUD, impact preview, PATCH validation |
| **New 17.39** | UI — selection dialog (S1 + S2) ; lien navigate vers paramètres |
| **New 17.40** | UI — page Paramètres troupe + onglet Catégories (CRUD admin + S4) |

### Artifact conflicts

| Artifact | Conflict | Update needed |
|----------|----------|---------------|
| [ux-design-journey-league-agenda.md](ux-design-journey-league-agenda.md) § Screen 6b | Autocomplete + free create | **Replace** dialog spec with radio/selection list + admin link |
| [docs/adr/0013](.../0013-troupe-navigation-equity-tags-event-slugs.md) §3 | « unknown typed value may create » | **Amend** — admin-managed glossary; built-in `deplacements` |
| [DOMAIN.md](../../DOMAIN.md) | Category optional label | **Amend** — admin CRUD, delete cascade to principal |
| [epics.md](epics.md) § 17.7, 17.8 | Autocomplete AC | **Amend** + add 17.38, 17.39 |
| [PLAN.md](../../PLAN.md) Epic 17 table | Missing new stories | Add rows |
| Story files 17-7, 17-8 | Historical AC | Banner → SCP; optional AC addendum |
| OpenAPI | GET only | Add POST/PATCH/DELETE + `GET …/impact` or count in DELETE preview |
| **PRD** | No direct FR conflict | **N/A** — category UX not FR-level in MVP PRD |

### Technical impact

**Keep (no rollback):**

- DB `events.category`, table `troupe_categories`
- `SpectacleCategory` (`principal` / `deplacements` / custom slug)
- `GET /v1/troupes/{id}/categories`
- Infos tab placement (not event form dialog)

**Change:**

| Layer | Change |
|-------|--------|
| **API** | `EventService` — on PATCH/POST `category`, **validate slug exists** in troupe glossary (or reserved `deplacements`); **remove** `ensureTag` on event save for organizers |
| **API** | `TroupeCategoryService` — admin `create`, `update` (label), `delete` with cascade: `UPDATE events SET category = NULL WHERE troupe AND category = :slug`; return `{ affectedEventCount }` |
| **API** | `GET categories` — merge **built-in** `deplacements` (label « Déplacements ») when not explicitly removed; never expose `principal` as DB row |
| **API** | Optional `GET …/categories/{slug}/delete-preview` → `{ eventCount }` for confirmation dialog |
| **Web** | Replace autocomplete with `mat-radio-group` or `mat-selection-list` showing all options |
| **Web** | Chip → `mat-stroked-button` or chip with `expand_more` / chevron when editable |
| **Web** | Admin section: « Gérer les catégories » on Infos tab (discoverability over troupe settings) |

**Built-in `deplacements` (clarification for PO decision #5):**

- **Spectacle ordinaire** = `category: null` — always shown in picker, never a DB row.
- **Déplacements** = slug `deplacements` — **always listed** for selection until admin deletes it from the troupe glossary.
- Implementation: API merges a virtual built-in entry when no explicit « removed » flag; on first troupe use, optionally seed row (idempotent) — **or** treat `deplacements` like other slugs once admin creates it. **Recommended:** seed `deplacements` on troupe creation / first `GET categories`; admin delete removes row + cascades events to null; re-add via admin create with slug `deplacements`.

**Permissions:**

| Action | Troupe admin | Season/event organizer (non-admin) |
|--------|--------------|-------------------------------------|
| Select category on spectacle | ✓ | ✓ (`canManageEvents`) |
| Create / edit / delete troupe category | ✓ | ✗ |
| View category list | ✓ (member) | ✓ (member) |

Users who are **both** admin and organizer see selection + management affordances.

---

## 3. Recommended Approach

### Selected option: **Direct adjustment (Option 1)**

| Option | Viable? | Rationale |
|--------|---------|-----------|
| **1 — Direct adjustment** | **Yes ✓** | Data model fits; replace UI + add admin API; ~2 stories |
| **2 — Rollback 17.7/17.8** | **No** | Would lose working partition for stats/draw; wasteful |
| **3 — MVP / PRD review** | **No** | Scope stays within Epic 17; no MVP cut |

**Effort:** Medium (2 stories, ~3–5 dev days)  
**Risk:** Low–medium (delete cascade must be transactional; legacy `template_type=deplacement` read rule unchanged)  
**Timeline:** After current in-flight work (e.g. Epic 8 notifications); does not block Epic 19 backlog

---

## 4. Detailed Change Proposals

### 4.1 UX — Screen 6b (replace)

**File:** `ux-design-journey-league-agenda.md` § Screen 6b

**OLD (dialog row):**

| **Dialog** | Title **Catégorie**; field **Catégorie (optionnelle)**; autocomplete against troupe glossary; type unknown → create category |

**NEW:**

| Field | Behaviour |
|-------|-----------|
| **Section (Infos tab)** | Unchanged: label **Catégorie**, inline help, always visible |
| **Default display** | Chip/button **Spectacle ordinaire** when `category` null |
| **Affordance** | Editable chip uses stroked button or chip + trailing icon (`expand_more` / `edit`); `aria-label` « Changer la catégorie »; min 48dp touch target |
| **Selection dialog** | Title **Catégorie**; **`mat-radio-group`** (or selection list) with **all** options visible without typing: **Spectacle ordinaire** (`null`), **Déplacements** (if in troupe glossary), each custom troupe category; **no** free-text field; **no** autocomplete |
| **Dialog actions** | **Annuler** / **Enregistrer**; pre-select current value |
| **Admin link** | When `canManageTroupe`: text button **« Gérer les catégories »** below list (Infos section **or** dialog footer) → opens admin management UI (**17.39**) |
| **Clear custom** | Selecting **Spectacle ordinaire** in dialog **or** `×` on chip → PATCH `category: null` |
| **Rule** | Organizers **pick only** from list; unknown slugs rejected by API |

**Rationale:** Visible finite set; no typo duplicates; discoverable admin path on Infos tab (PO decision #3).

---

### 4.2 ADR 0013 §3 (amend)

**OLD:**

> UI | Section **Catégorie** always on Infos tab; optional autocomplete via dialog; creatable per troupe glossary  
> Troupe category glossary (Phase 2+): … unknown typed value may create a new troupe category.

**NEW:**

> UI | Section **Catégorie** on Infos tab; **selection dialog** (list, not autocomplete); organizers assign from glossary; **troupe admins** create/edit/delete categories via management UI (entry from Infos section for discoverability).  
> Built-in category **Déplacements** (`deplacements` slug) listed by default; admin may delete (events → **Spectacle ordinaire**).  
> **Spectacle ordinaire** = `category` null — shown in picker, not stored.  
> Delete category: confirm with **event count**; cascade sets `category = null` on affected events.

---

### 4.3 DOMAIN.md (amend)

Add under category definition:

- Troupe admins manage the category glossary (create, rename label, delete).
- Deleting a category reassigns affected spectacles to **Spectacle ordinaire** (`category` null).
- Organizers select from the glossary; they cannot create categories by typing on an event.

---

### 4.4 Epic 17.7 — amended AC (excerpt)

**Remove / replace:**

- ~~Given tag inconnu à la saisie, when politique produit activée, then création entrée glossaire troupe~~

**Add:**

- **Given** PATCH/POST with `category` slug, **when** slug not in troupe glossary (and not valid reserved handling), **then** 400 French error — no auto-create.
- **Given** troupe admin, **when** POST/PATCH/DELETE on `/v1/troupes/{id}/categories`, **then** CRUD with `requireCanManageTroupe`.
- **Given** DELETE category, **when** confirmed, **then** all events with that `category` in troupe seasons → `category = null`; response includes `affectedEventCount`.
- **Given** GET categories, **when** member, **then** list includes built-in **Déplacements** unless admin removed it; never includes `principal` as row.

---

### 4.5 Epic 17.8 — amended AC (excerpt)

**Replace:**

- ~~modale autocomplete~~ → **modale liste de sélection** (radio/list).
- ~~saisie libre → création glossaire~~ → **organizer picks existing only**.

**Add:**

- Chip/button clearly indicates editability (icon + focus ring).
- Admin sees **« Gérer les catégories »** on Infos Catégorie section.
- **Non-goal (unchanged):** category field not in `EventFormDialog`.

---

### 4.6 New Story 17.38 — API admin category glossary

**Summary:** Admin CRUD for troupe categories; stop auto-create on event save; delete cascade + impact count.

**Acceptance criteria (high level):**

1. `POST /v1/troupes/{troupeId}/categories` — body `{ slug?, label }` — admin only; slug normalized; reject reserved `principal`.
2. `PATCH /v1/troupes/{troupeId}/categories/{slug}` — update `label` only (slug immutable) — admin only.
3. `DELETE /v1/troupes/{troupeId}/categories/{slug}` — admin only; sets `events.category = null` for matching events in troupe; returns `{ affectedEventCount }`.
4. `GET /v1/troupes/{troupeId}/categories/{slug}/delete-preview` (or query on DELETE) — returns `{ eventCount }` before confirm.
5. Event PATCH/POST: `category` must reference existing glossary slug; 400 if unknown.
6. Seed or virtual **Déplacements** on list until deleted.
7. OpenAPI + integration tests; migration optional (backfill `deplacements` row per troupe if missing).

**Depends:** 17.7 (done)  
**Blocks:** 17.39

---

### 4.7 New Story 17.39 — UI category selection & admin management

**Summary:** Replace autocomplete dialog; admin manage categories from Infos tab.

**Acceptance criteria (high level):**

1. **M3-1…M3-5:** radio/selection list dialog; stroked affordance on chip; French copy; 48dp targets.
2. Dialog lists **Spectacle ordinaire**, **Déplacements** (if present), all custom categories — no search/autocomplete required (optional filter only if >10 items — not MVP).
3. Save PATCH with selected slug or null.
4. Admin: **« Gérer les catégories »** opens sheet/dialog — list categories, add (slug+label form), edit label, delete with **confirmation showing event count** from preview API.
5. Organizer without admin: selection dialog only; no manage link.
6. Tests: `event-category-dialog.spec.ts`, `event-infos-tab.spec.ts` updated; new admin component specs.

**Depends:** 17.38 (API) — can stub API for parallel UI spike  
**UX ref:** Screen 6b (this SCP)

---

## 5. Implementation Handoff

### Scope classification: **Moderate**

Backlog update + 2 stories + doc amendments; PO validates UX copy; Dev implements API then UI (or API contract first).

### Sequencing

```
17.38 (API) → 17.39 (UI)
     ↓
Doc updates (ADR, DOMAIN, Screen 6b, epics, PLAN, sprint-status)
```

### Handoff

| Role | Responsibility |
|------|----------------|
| **PO (Patrice)** | Approve SCP; validate French copy for delete confirmation |
| **Dev** | `bmad-create-story` for 17.38 & 17.39 → `bmad-dev-story` |
| **Dev** | Remove `ensureTag` from event save path; add validation |
| **Dev** | Refactor `EventCategoryDialog` → selection list; new admin component |

### Success criteria

- [ ] Organizer opens Catégorie → sees full list without typing; selects Déplacements or custom; saves.
- [ ] Organizer cannot create category by typing on event.
- [ ] Admin adds « Apérock », assigns to event, edits label, deletes with count warning; affected events show Spectacle ordinaire.
- [ ] Stats/draw compartments unchanged for same slug values.
- [ ] Screen 6b + ADR 0013 + DOMAIN aligned with shipped behaviour.

### Explicit non-goals

- Troupe **settings** page as primary admin home (discoverability stays Infos — PO #3).
- Multi-category per event.
- Category hierarchy / nested tags.
- Re-open Epic 19.8 or 17.10.

---

## 6. Checklist summary (Correct Course)

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done — 17.8 UX review |
| 2 Epic impact | [x] Done — Epic 17 extend |
| 3 Artifact conflicts | [x] Done — UX, ADR, DOMAIN, epics |
| 4 Path forward | [x] Done — Option 1 Direct adjustment |
| 5 Proposal components | [x] Done — this document |
| 6 User approval | [ ] **Pending** |
| 6.4 sprint-status.yaml | [ ] After approval |

---

## 7. Product decisions recorded (2026-06-08)

| # | Decision |
|---|----------|
| 1 | **Spectacle ordinaire** = `null`; **Déplacements** always visible in picker until admin deletes; custom troupe categories also listed |
| 2 | **Admins** manage glossary; **organizers** assign only; dual role → both |
| 3 | **Option B — discoverability:** lien **« Gérer les catégories »** sur Infos **et** dans modale S2 → **navigation** vers `/troupes/:slug/admin/parametres?tab=categories` ; CRUD admin sur **page Paramètres troupe** (shell onglets extensible), pas modales empilées ; entrée aussi via gear hub **Paramètres troupe** |
| 4 | **Delete impact count** mandatory in confirmation (justify effort + admin awareness) |
| 5 | Built-in handling: API ensures **Déplacements** appears without orga typing; admin may remove (cascade to ordinaire) — see §2 Technical impact |

---

*End of Sprint Change Proposal — awaiting approver sign-off.*

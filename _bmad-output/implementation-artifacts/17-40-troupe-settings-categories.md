# Story 17.40: Troupe settings — Categories tab (admin CRUD)

---
baseline_commit: 55a129f4aaf73b595f436ff1c9c2b842ababa866
---

Status: done

**UX spec:** [_bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md](../planning-artifacts/ux-design-category-glossary-17-39.md) — **S3** (page Paramètres · onglet Catégories) + **S4** (dialog suppression)  
**SCP:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md](../planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md)  
**Depends on:** **17.38** (category glossary API — done) · **17.39** (Infos link already navigates here — done/review)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **troupe admin**,
I want a **Paramètres troupe page with a Categories tab** to create, rename, and delete glossary categories with impact preview,
so that **the controlled vocabulary is curated in one place** and the **« Gérer les catégories »** link from event Infos (17.39) resolves to a working admin surface.

## Acceptance Criteria

1. **Given** `canManageTroupe` (troupe admin or platform admin), **when** navigating to `/troupes/{troupeSlug}/admin/parametres?tab=categories`, **then** the page loads with breadcrumb (troupe context + leaf **Paramètres**), title **Paramètres troupe**, intro copy, and the **Catégories** content (list + add). **Given** deep link `?tab=categories` from [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts), **then** the Categories content is active. [Source: UX S3 ; 17.39 AC4 ; ADR 0013 §3]
2. **Given** the Categories tab loaded, **when** `GET /v1/troupes/{troupeId}/categories` succeeds, **then** rows show the **default category** (`slug: principal`, label from `troupes.default_category_label`) **first**, then glossary entries sorted by `label ASC` (API order); the default row shows badge **Catégorie par défaut**, is **editable** (label only), and has **no delete** action; other rows show **label** + edit + delete icon buttons (≥ 48 dp). [Source: UX S3 amendé revue 2026-06-09 ; 17.38 AC5]
3. **Given** admin taps **+ Ajouter une catégorie**, **when** the create form opens (`MatDialog` mini-form), **then** field **Libellé** (required) only — slug derived server-side from label (`CategorySlugNormalizer`) ; **Enregistrer** calls `POST /categories` with `{ label }`; success closes form, refreshes list, snackbar « Catégorie créée ». *(Dérogation revue 2026-06-09 : champ slug UI retiré — friction inutile pour ~15 catégories typiques.)* [Source: UX S3 ; 17.38 AC1]
4. **Given** admin taps edit on a row, **when** the edit form opens, **then** only **label** is editable (slug immutable / hidden); **Enregistrer** calls `PATCH /categories/{slug}`; snackbar « Catégorie enregistrée ». [Source: UX S3 ; 17.38 AC2]
5. **Given** admin taps delete on `{label}` / `{slug}`, **when** the confirmation dialog opens, **then** it first loads `GET …/categories/{slug}/delete-preview` (spinner while loading); **then** shows title `Supprimer « {label} » ?`, impact copy *« {n} spectacle(s) utilisent cette catégorie. Ils seront basculés en Spectacles ordinaires. »* (or *« Aucun spectacle n'utilise cette catégorie. »* when `eventCount === 0`), warning *« Cette action est irréversible. »*, **Annuler** / destructive **Supprimer** (`mat-flat-button color="warn"`). **Given** confirm, **when** `DELETE` succeeds, **then** snackbar « Catégorie supprimée », list refreshes. [Source: UX S4 ; 17.38 AC3–4]
6. **Given** API errors (400 reserved slug, 409 duplicate, 403, network), **when** create/edit/delete fails, **then** French snackbar with actionable message; form stays open on create/edit failure. [Source: 17.38 ; repo norms]
7. **Given** troupe hub gear menu (`canManageTroupe`), **when** admin opens the menu, **then** entry **Paramètres** navigates to `/troupes/{slug}/admin/parametres?tab=categories` (same destination as Infos link). *(Dérogation revue 2026-06-09 : label court « Paramètres » au lieu de « Paramètres troupe ».)* [Source: UX S3 entry table ; ux-design-scope-admin-menu-epic17.md Screen 3]
8. **Given** user **without** `canManageTroupe`, **when** opening `/admin/parametres`, **then** redirect to troupe hub (or troupes list if unresolved) with snackbar explaining lack of permission — no CRUD UI. [Source: 17.38 AC7 ; admin-membres gating pattern]
9. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** pass; specs cover route registration, breadcrumb, list CRUD flows (mock API), delete dialog impact copy, hub menu entry, and non-admin redirect. [Source: repo norms ; 17.11]

**Product coverage:** Epic 17 category governance — closes 17.39 deferred navigation (link no longer 404). **In scope (revue 2026-06-09) :** migration `default_category_label`, API `principal` dto + PATCH label par défaut. **Out of scope:** organizer category selection on Infos (**17.39**); future tabs **Formules** / **Rôles** (Epic 19+).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the settings page, **when** rendering controls, **then** use `mat-tab-group` (shell, single visible tab MVP), `mat-icon-button` (edit/delete), `mat-flat-button` / `mat-stroked-button` (add/save), `mat-form-field` + `matInput` (forms), `MatDialog` (create/edit mini-dialog and/or delete confirm), `mat-progress-bar` or `mat-spinner` (loading glossary / delete preview) — no custom clickable divs for the same roles. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** SCSS for the new page, **when** colors/backgrounds applied, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` — no hard-coded hex on feature surfaces. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** list actions shown, **then** icon buttons ≥ 48×48 dp; French `aria-label` on edit (`Modifier {label}`), delete (`Supprimer {label}`), add (`Ajouter une catégorie`). [Source: NFR-A1 ; UX S3]

**M3-4. Navigation membre** — **Given** admin destination under `/troupes/:slug/admin/parametres`, **when** page loads, **then** member shell nav remains visible (extend [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts)); breadcrumb follows **17.11** admin back-office pattern (`app-context-breadcrumb` layout `troupe`, **no** scope gear in header row). [Source: 17.11 ; ux-design-scope-admin-menu-epic17.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + API extension `default_category_label` / dto `principal` (revue 2026-06-09)
- [x] **Route & navigation** (AC: 1, 7, 8, 9)
  - [x] Register `{ path: 'troupes/:slug/admin/parametres', component: TroupeSettings }` in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) **before** `troupes/:slug` (same ordering as `admin/membres`)
  - [x] Extend [`post-login-redirect-storage.ts`](../../apps/web/src/app/core/navigation/post-login-redirect-storage.ts) + spec for `/troupes/:slug/admin/parametres`
  - [x] Extend [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) + spec
  - [x] Reuse existing [`troupeAdminSettingsPath()`](../../apps/web/src/app/core/navigation/troupe-routes.ts) — already used by 17.39
- [x] **`TroupeApiService` client methods** (AC: 2–6)
  - [x] `createCategory(troupeId, { label, slug? })` → POST
  - [x] `updateCategoryLabel(troupeId, slug, { label })` → PATCH
  - [x] `previewDeleteCategory(troupeId, slug)` → GET delete-preview → `{ eventCount }`
  - [x] `deleteCategory(troupeId, slug)` → DELETE → `{ affectedEventCount }`
  - [x] Follow existing `fetch` + `csrfHeaders()` pattern from `listCategories`
- [x] **`TroupeSettings` page shell** (AC: 1, M3-1, M3-4)
  - [x] New folder `apps/web/src/app/pages/troupe-settings/`
  - [x] Resolve troupe by `:slug` (mirror [`admin-membres.ts`](../../apps/web/src/app/pages/admin-membres/admin-membres.ts) hub-admin path)
  - [x] `app-context-breadcrumb` + mobile H1 **Paramètres**
  - [x] Page title **Paramètres troupe**; `mat-tab-group` with **single** tab **Catégories** (hide Formules/Rôles per UX OQ-1)
  - [x] Read `queryParams.tab` — MVP: only `categories` meaningful; default to categories when absent
  - [x] Intro: *« Les catégories séparent les stats et les tirages par compartiment. »*
- [x] **`TroupeCategoriesTab` component** (AC: 2–4, 6)
  - [x] List rows: label + edit + delete
  - [x] **+ Ajouter une catégorie** → create form (dialog recommended for parity with edit)
  - [x] Create form : libellé seul (slug auto API — dérogation AC3)
  - [x] Default category `principal` listée en tête, éditable, sans delete
- [x] **`TroupeCategoryDeleteDialog`** (AC: 5)
  - [x] Load preview on open; handle preview failure (snackbar, close dialog)
  - [x] Destructive confirm pattern — may extend [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) **or** dedicated dialog if spinner/async preview needed
- [x] **Hub gear entry** (AC: 7)
  - [x] Add `{ label: 'Paramètres', icon: 'settings', routerLink: troupeAdminSettingsPath(slug), queryParams: { tab: 'categories' } }` to [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) `troupeAdminItems` (after Membres or per UX order)
- [x] **Tests** (AC: 9)
  - [x] `troupe-settings.spec.ts`, `troupe-categories-tab.spec.ts`, `troupe-category-delete-dialog.spec.ts`
  - [x] Update `app.routes.spec.ts`, `troupe-hub.spec.ts`, `member-shell-nav-visibility.spec.ts`, `post-login-redirect-storage.spec.ts`
- [x] **Docs (minimal)**
  - [x] Dev Agent Record only — optional UX amend note in `ux-design-scope-admin-menu-epic17.md` Screen 3 (activate Paramètres entry) if not already reflected

### Review Findings

- [x] [Review][Decision] AC2 vs catégorie `principal` listée — **1A** : AC2 amendé ; default category éditable en tête de liste.
- [x] [Review][Decision] AC3 vs formulaire create sans slug — **2B** : dérogation volontaire ; slug auto API ; AC3 amendé.
- [x] [Review][Decision] Changements backend hors scope story — **3A** : inclus dans 17.40 ; scope + file list mis à jour.
- [x] [Review][Patch] Hub menu label « Paramètres » — **waiver volontaire** (PO).
- [x] [Review][Patch] Fuite mémoire — subscription `queryParamMap` [troupe-settings.ts:84] — fixed.
- [x] [Review][Patch] Label whitespace-only [troupe-category-form-dialog.ts] — fixed (`trimmedRequired`).
- [x] [Review][Patch] Accord sujet-verbe delete impact count=1 [troupe-category-delete-dialog.ts:80] — fixed.
- [x] [Review][Patch] `createCategory` slugs réservés [TroupeCategoryService.kt] — fixed (`rejectReservedCategorySlug`).
- [x] [Review][Patch] Label >128 → 400 [TroupeCategoryService.kt] — fixed (`validateLabel`).
- [x] [Review][Patch] Messages erreur sans « identifiant » [category-api-messages.ts] — fixed.
- [x] [Review][Patch] `firstValueFrom` remplace `toPromise()` [troupe-categories-tab.ts] — fixed.
- [x] [Review][Defer] `AvailabilityService.kt` modifié (draw odds operational) — sans lien avec 17.40 — deferred, pre-existing bundled change
- [x] [Review][Defer] Tests composition (`CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest`) — sans lien avec 17.40 — deferred, pre-existing bundled change
- [x] [Review][Defer] Race concurrent delete : `affectedEventCount` peut diverger du preview [TroupeCategoryService.kt:135] — deferred, pre-existing

---

## Dev Notes

### Product and UX rules

- **Spectacle ordinaire** = `events.category IS NULL` — compartiment principal ; libellé affiché via dto `principal` (`troupes.default_category_label`), éditable sur l'onglet Catégories (revue 2026-06-09).
- **Déplacements** = slug `deplacements` — appears in list like any row; **admin may delete** (PO decision); cascade sets affected events to null (17.38).
- **Slug immutability** after create — edit form must not expose slug field on PATCH path.
- **Reserved slugs** `principal`, `main` — API returns 400; surface French error in snackbar.
- **Two entry points** (both required): event Infos **Gérer les catégories** (17.39) + hub gear **Paramètres troupe** (this story).
- **Shell extensibility:** keep `mat-tab-group` + `?tab=` query param so Epic 19 Formules / future Rôles tabs can land without new top-level routes (UX OQ-4).

### Explicit non-goals

- Do **not** change backend API or OpenAPI (**17.38** done).
- Do **not** re-implement event Infos category chips (**17.39**).
- Do **not** add Formules / Rôles tab content (Epic 19+ / FR14+).
- Do **not** show slug in read-only list rows (UX OQ-2).
- Do **not** add scope admin gear on the settings destination page (17.11 / 17.2).
- Do **not** auto-create categories from this UI on event save — POST glossary only.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Route order | `admin/parametres` route **must** precede `troupes/:slug` in `app.routes.ts` |
| Path helper | Use `troupeAdminSettingsPath(slug)` + `{ queryParams: { tab: 'categories' } }` |
| Permissions | Gate on `troupe.membership.baselineRole === 'TROUPE_ADMIN'` or `platformAdmin` — same as [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) `canManageTroupe` |
| Breadcrumb | Copy [`admin-membres.html`](../../apps/web/src/app/pages/admin-membres/admin-membres.html) — `layout="troupe"`, `leafTitle="Paramètres"` |
| Slug client preview | [`slugifyTitle`](../../apps/web/src/app/core/navigation/url-slug.ts) mirrors API normalizer — preview only; server validates |
| Delete flow | **Always** call delete-preview before showing confirm copy (UX S4) |
| List refresh | After create/edit/delete, re-fetch glossary; Infos tab elsewhere will pick up on next navigation |
| Error copy | Map HTTP status: 409 → duplicate slug; 400 → validation; 403 → permission; 404 → category removed |
| Constants | Reuse [`DEFAULT_CATEGORY_DISPLAY_LABEL`](../../apps/web/src/app/pages/event-detail/event-category.constants.ts) only in delete impact copy (« Spectacles ordinaires ») |

### API contract (consumer reference — 17.38)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/v1/troupes/{id}/categories` | — | `TroupeCategory[]` |
| POST | `/v1/troupes/{id}/categories` | `{ label, slug? }` | `201` + category |
| PATCH | `/v1/troupes/{id}/categories/{slug}` | `{ label }` | category |
| GET | `/v1/troupes/{id}/categories/{slug}/delete-preview` | — | `{ eventCount }` |
| DELETE | `/v1/troupes/{id}/categories/{slug}` | — | `{ affectedEventCount }` |

OpenAPI: [`services/api/openapi/categories.yaml`](../../services/api/openapi/categories.yaml)

### Suggested file structure

```
apps/web/src/app/pages/troupe-settings/
  troupe-settings.ts          # shell: breadcrumb, tabs, permission gate
  troupe-settings.html
  troupe-settings.scss
  troupe-settings.spec.ts
  troupe-categories-tab.ts    # list + add button + hosts dialogs
  troupe-categories-tab.html
  troupe-categories-tab.scss
  troupe-categories-tab.spec.ts
  troupe-category-form-dialog.ts   # create + edit label
  troupe-category-form-dialog.spec.ts
  troupe-category-delete-dialog.ts # S4 async preview
  troupe-category-delete-dialog.spec.ts
```

### Previous story intelligence

**17.38 (API — done):**
- `listCategories` already in `TroupeApiService`; CRUD methods intentionally deferred to 17.39/17.40.
- Delete cascade affects **non-archived** events only; preview count matches DELETE result.
- `ensureDeplacementsSeed` on GET list — first load may include auto-seeded **Déplacements** row.

**17.39 (Infos selection — done/review):**
- [`navigateToCategorySettings()`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) already navigates to `troupeAdminSettingsPath` + `?tab=categories` — **route must exist after this story** (was deferred review finding).
- Chips inline on Infos; admin CRUD explicitly out of scope for 17.39.
- Use **Spectacles ordinaires** (plural) in user-facing copy for consistency.

### Git intelligence

Recent related commits:
- `255d67c1` — category selection hardening (17.39)
- `4d2b1ccd` — inline chip selection replacing dialog
- Category glossary API merged with 17.38

Follow patterns from troupe admin pages (`admin-membres`, `admin-audit`) and dialog forms (`troupe-edit-dialog`, `season-form-dialog`).

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

**Minimum spec scenarios:**
- Route `/troupes/test/admin/parametres` resolves to `TroupeSettings`
- Non-admin redirected / no CRUD
- List renders glossary rows from mocked API
- Create POST payload includes label + slug
- Edit PATCH sends label only
- Delete dialog shows count from preview mock; DELETE on confirm
- Hub menu contains **Paramètres troupe** link with query param
- Breadcrumb leaf **Paramètres** when troupe resolved

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 17.38 | done | API CRUD + delete preview — consumer only |
| 17.39 | review/done | Infos link target; completes deferred navigation |
| 17.11 | done | Admin breadcrumb pattern |
| 17.4 | done | Troupe hub gear host |

### Project context reference

- Angular **21.2** + Material **21.2** — `apps/web/`
- UI rules: [docs/v2/technical/FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- Domain: Spectacle ordinaire = null category; glossary slugs partition stats/draw
- [project-context.md](../../project-context.md) — reuse admin dialogs, `ContextBreadcrumb`, `ScopeAdminMenu`

### References

- [UX S3/S4 — ux-design-category-glossary-17-39.md](../planning-artifacts/ux-design-category-glossary-17-39.md)
- [Admin menu Screen 3 — ux-design-scope-admin-menu-epic17.md](../planning-artifacts/ux-design-scope-admin-menu-epic17.md)
- [17-38-category-glossary-api.md](./17-38-category-glossary-api.md)
- [17-39-ui-category-selection.md](./17-39-ui-category-selection.md)
- [17-11-breadcrumb-pages-admin-back-office.md](./17-11-breadcrumb-pages-admin-back-office.md)
- [ADR 0013 §3 — docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)

## Dev Agent Record

### Agent Model Used

(create-story workflow ; dev: Claude claude-4.6-sonnet-medium-thinking)

### Completion Notes List

- Implemented `/troupes/:slug/admin/parametres?tab=categories` — shell `TroupeSettings` + `TroupeCategoriesTab` with CRUD dialogs wired to 17.38 API.
- Hub gear **Paramètres** entry added (after Membres) ; 17.39 Infos link now resolves (no 404).
- Backend : colonne `default_category_label`, dto `principal` en tête de liste, PATCH label par défaut, guards slug réservé + longueur label.
- Code review 2026-06-09 : 7 patches appliqués ; 3 décisions PO (1A/2B/3A) ; hub label « Paramètres » conservé volontairement.
- Non-admin gated: snackbar + redirect to troupe hub.
- **M3 checklist:** M3-1–M3-4 validated (Material tabs/buttons/dialogs/forms/spinner ; `--mat-sys-*` tokens ; 48dp mobile actions ; breadcrumb + member nav). M3-5 walked — no waivers.
- **Tests:** 12 new specs under `troupe-settings/` ; updates to routes, hub menu, nav visibility, post-login redirect. `npm run build -w @hatcast/web` OK. Full `npm run test -w @hatcast/web` still has pre-existing failures unrelated to this story (legacy `/saison/:slug` route specs, etc.) ; all 12 story specs pass together.

### File List

- apps/web/src/app/app.routes.ts
- apps/web/src/app/app.routes.spec.ts
- apps/web/src/app/core/navigation/post-login-redirect-storage.ts
- apps/web/src/app/core/navigation/post-login-redirect-storage.spec.ts
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts
- apps/web/src/app/layout/member-shell/member-shell-nav-visibility.spec.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts
- apps/web/src/app/pages/troupe-settings/category-api-messages.ts
- apps/web/src/app/pages/troupe-settings/troupe-settings.ts
- apps/web/src/app/pages/troupe-settings/troupe-settings.html
- apps/web/src/app/pages/troupe-settings/troupe-settings.scss
- apps/web/src/app/pages/troupe-settings/troupe-settings.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-categories-tab.ts
- apps/web/src/app/pages/troupe-settings/troupe-categories-tab.html
- apps/web/src/app/pages/troupe-settings/troupe-categories-tab.scss
- apps/web/src/app/pages/troupe-settings/troupe-categories-tab.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-category-form-dialog.ts
- apps/web/src/app/pages/troupe-settings/troupe-category-form-dialog.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-category-delete-dialog.ts
- apps/web/src/app/pages/troupe-settings/troupe-category-delete-dialog.spec.ts
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt
- services/api/src/main/resources/db/migration/V63__troupe_default_category_label.sql
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCategoryIntegrationTest.kt

### Change Log

- 2026-06-09: Story 17.40 created — troupe settings Categories tab (SCP 2026-06-08 ; UX S3/S4).
- 2026-06-09: Implementation complete — Paramètres troupe page, categories CRUD UI, hub menu entry, tests.
- 2026-06-09: Code review — patches P2–P8 ; AC2/AC3/scope amendés (1A/2B/3A).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX S3/S4)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `npm run build` mentionnés

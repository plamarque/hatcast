---
feature_branch: feat/19-19c-ui-admin-editeur-formules
baseline_commit: 9ed06c453f5aa3824647f548a7a070568b361969
---

# Story 19.19c : UI admin — formula editor (coefficients)

Status: done

**UX baseline :** [`ux-design-draw-formulas-19-19.md`](../planning-artifacts/ux-design-draw-formulas-19-19.md) **approved-v2** (2026-06-17, post-recette UI) · mockup [`draw-formulas-19-19-mockup.html`](../previews/draw-formulas-19-19-mockup.html) = source de vérité visuelle · implémentation courante sur branche `feat/19-19c-ui-admin-editeur-formules`.

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe admin**,  
I want an **admin UI** to compose draw formulas with **factor toggles and tunable coefficients** (malus/bonus intensity),  
so that I can **configure draw recipes without code** — completing **Wave D Demo 1** and unblocking **19.18** (policy runtime).

**Trigger:** [Sprint Change Proposal 2026-06-16](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-16-draw-formula-factor-params.md) — Wave D S4c. Supersedes cancelled monolithic **19.19**. Normative catalogue: **19.19a** (done). Runtime + REF-P validation: **19.19b** (done, merged at baseline `9ed06c45`). **UX wireframes (19.19c):** [`ux-design-draw-formulas-19-19.md`](../planning-artifacts/ux-design-draw-formulas-19-19.md) · mockup [`draw-formulas-19-19-mockup.html`](../previews/draw-formulas-19-19-mockup.html) · canvas `draw-formulas-19-19-preview.canvas.tsx`.

## Acceptance Criteria

### AC1 — Route, tab shell, admin gating (F1)

1. **Given** a user with **`TROUPE_ADMIN`** (or platform admin) on troupe **T**, **when** navigating to `/troupes/:slug/admin/parametres?tab=formulas`, **then** the **Formules de tirage** pill tab is active on the existing **Paramètres troupe** page (**17.40** shell) and shows the formula catalogue list (**UX F1**).
2. **Given** the same page without `?tab=`, **when** loaded, **then** default tab remains **Catégories** (unchanged **17.40** behaviour).
3. **Given** a member without troupe admin, **when** accessing the route, **then** redirect to troupe hub + snackbar **Accès non autorisé** (same pattern as [`troupe-settings.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.ts)).
4. **Given** the list loads, **when** API `GET /v1/troupes/{troupeId}/draw-formulas` returns, **then** rows show name, enabled-factor summary (FR labels of **enabled malus/bonus criteria only**, « · » separated — **omit** `equity_tag`), status chip (**Brouillon** / **Publiée** / **Archivée**), **Système** badge for `isSystem`, edit/archive actions per UX rules.
5. **Given** system V1 formula (`isSystem: true`), **when** displayed, **then** no edit/archive actions ; row read-only.

[Source: epics **19.19c** AC1 ; UX **F1** ; API **19.17**]

### AC2 — Editor dialog with coefficient fields (F2)

6. **Given** **+ Nouvelle formule** or edit on a non-system formula, **when** `TroupeDrawFormulaEditorDialog` opens, **then** fields: **Nom** (required), **Description** (optional, max 2000), bloc **Composition de la formule** (UX **F2-C** + **F2-V**) : donut + liste compacte des 3 critères malus/bonus avec toggle **leading**, badge **Malus** / **Bonus** (read-only, tooltip **Type du critère (fixe)**), slider **Intensité**, chevron détails.
7. **Given** `equity_tag` (F2-O), **when** editor renders or saves, **then** **no UI row or copy** for compartiment ; payload always includes `{ "factorId": "equity_tag", "enabled": true }` assembled client-side (REF-V02).
8. **Given** an **enabled** malus/bonus criterion, **when** the row is shown, **then** compact **Intensité** slider visible ; **effect-summary** encart (UX **F2-E**) in **collapsible** details panel, with **20 % base** examples and **±X pt** deltas:

   | factorId | UI controls (compact) | Details (repliable) |
   |----------|----------------------|---------------------|
   | `past_participation` | Toggle + **Intensité** slider `strength` `0.0–2.0` step `0.1` (default `1.0`) | F2-E : multiplicateurs + exemple 20 % / pt |
   | `immediate_replay` | Toggle + **Intensité** slider (F2-R) `0.0–1.0` step `0.05` ; default **1.0** (= EXCLUDE) | F2-E : exclude / no penalty / malus + pt |
   | `role_request` | Toggle + **Intensité** slider `bonusPerUnfulfilled` `0.0–5.0` step `0.1` | F2-E + **Plafond du bonus total** slider `maxBonusMultiplier` `1.0–20.0` step `0.5` |

   **No** separate « Bonus et malus » section title. **No** cryptic static hints. **No** select for replay — mapping F2-R client-side only.

9. **Given** reserved factors (`gender_parity`, `volunteer_bonus`, `class_mix`, `prestige`), **when** editor renders, **then** section **Bientôt** — disabled rows, no toggles, **excluded** from save payload.
10. **Given** save payload assembly, **when** building `factorConfig`, **then** send **4 implemented factors** in stable order: `equity_tag` → `past_participation` → `immediate_replay` → `role_request` ; include `params` only for enabled factors with non-default or required values (omit keys at defaults per **REF-P04**) ; for **immediate_replay** apply **F2-R** mapping (`display >= 1.0` → `{ mode: "EXCLUDE" }` only ; else `{ mode: "MALUS", malusMultiplier: 1 − display }`).
11. **Given** **Enregistrer** / **Publier**, **when** API returns **400** (REF-V* or REF-P*), **then** show French error inline under the relevant factor/param or dialog footer ; do not close dialog.
12. **Given** successful save, **when** dialog closes, **then** snackbar **Formule enregistrée** (draft) or **Formule publiée** (published) ; list refreshes.
13. **Given** F2 editor, **when** toggles/sliders change, **then** **Composition de la formule** (F2-V) shows donut segments for **enabled criteria with score > 0 only** ; legend always **3 rows** (off → « off », no %) ; intensity **0 → 0 %** ; single influential criterion → **100 %** ; center « 3 critères » + « {n} actif(s) » ; **`equity_tag` excluded** ; **no disclaimer** under chart ; distinct colors per `factorId` (`PROFILE_CHART_COLORS`).

[Source: epics **19.19c** AC2–3 ; SCP §5.3 ; spec § Factor catalogue + `effect` helpers ; **19.19b** REF-P* ; UX **F2-V**]

### AC3 — Archive flow (F3)

14. **Given** archive on a non-system, non-archived formula, **when** confirmed, **then** `DELETE /v1/troupes/{troupeId}/draw-formulas/{id}` ; success → snackbar + list refresh.
15. **Given** API **409** (policy reference), **when** archive attempted, **then** dialog/snackbar: **Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.** (UX **F3**).

[Source: epics **19.19c** AC4 ; API **19.17** AC5]

### AC4 — Shared catalogue constant & client API

14. **Given** [`draw-factor-catalog.ts`](../../apps/web/src/app/core/draw/draw-factor-catalog.ts) created, **when** imported by editor, **then** exports match normative TypeScript shape from [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) § Handoff to **19.19c** (`DrawFactorCatalogEntry`, `DrawFactorParamSpec`, `DrawFactorDirection`) — keys, ranges, defaults, French `effect`, `direction`, `reserved` flags **mirror** [`DrawFactorParamCatalog.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFactorParamCatalog.kt) + spec table.
15. **Given** [`draw-formula-api.service.ts`](../../apps/web/src/app/core/draw/draw-formula-api.service.ts), **when** used by tab/dialog, **then** wraps **19.17** endpoints (`list`, `get`, `create`, `patch`, `archive`) with typed DTOs ; propagates API error body for inline display.

[Source: **19.19a** handoff ; **19.17** OpenAPI]

### AC5 — Tests & Demo 1 gate

16. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` runs, **then** new/updated specs pass — at minimum: tab list load, editor open/save payload shape, archive 409 handling (mirror [`troupe-categories-tab.spec.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-categories-tab.spec.ts) patterns).
17. **Given** manual recette on `./scripts/start-dev.sh --offline`, **when** admin creates formula with `past_participation.strength = 1.5` and publishes, **then** `GET` API returns persisted `params` ; invalid coefficient (e.g. `strength = 3`) shows API French error in UI.
18. **Couverture :** UX-DR11, Wave D **Demo 1 gate**. **Priorité :** P2. **Depends :** **19.19b** (done), **19.17** (done), **17.40** (done). **Blocks :** **19.18**, **19.20**. **No** runtime draw wiring (**19.18**). **No** preview % (**OQ-P3** waivable).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** UI in scope, **when** controls render, **then** use `mat-tab-group` (pill mixin already on page), `mat-slide-toggle` (**leading** on criterion rows), `mat-slider`, `mat-form-field` + `matInput`, `mat-stroked-button` / `mat-flat-button`, `mat-icon-button`, `MatDialog`, `mat-chip` for status/direction badges — **no** `mat-select` in formula editor (F2-R) ; no custom clickable divs for the same roles. [Source: FRONTEND_UI.md ; UX-DR11 ; UX **approved-v2**]

**M3-2. Tokens & thème** — **Given** SCSS for new components, **when** colours applied, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` — reuse [`troupe-settings.scss`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.scss) spacing/max-width patterns. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport ≤ **480px**, **when** list and dialog shown, **then** icon buttons ≥ **48×48 dp** ; `aria-label` FR on edit/archive (`Modifier {name}`, `Archiver {name}`) ; dialog `max-width: min(480px, 100vw - 2rem)` with internal scroll. [Source: NFR-A1 ; UX test hooks]

**M3-4. Navigation membre** — **Given** admin settings under troupe hub, **when** story adds tab only, **then** no new global nav chrome ; breadcrumb unchanged (**17.40**). [Source: ux-hub-a-faire.md — N/A beyond existing admin route]

**M3-5. Revue** — **Given** implementation done, **when** validating story, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) walked ; waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

**Scope:** `apps/web/` only. **No** `services/api/` changes unless blocking bug found (fix in separate commit with story note). **No** normative doc edits unless UI diverges from spec (unlikely).

### 0. Branch, baseline & prerequisites (mandatory)

- [x] Confirm branch `feat/19-19c-ui-admin-editeur-formules` ; baseline `9ed06c453f5aa3824647f548a7a070568b361969` (**19.19b** merged).
- [x] Read UX spec **approved-v2** + **mockup HTML** before coding (ignore stale canvas if diverges).
- [x] Verify offline seed exposes draw formulas API (Improbots admin `@seed.improbots.test`).

### 1. Core draw module (AC4)

- [x] **NEW** `apps/web/src/app/core/draw/draw-factor-catalog.ts` — full catalogue: 4 implemented + 4 reserved entries ; FR labels/hints from UX spec § Copy facteurs + spec `effect` column ; export helpers: `implementedFactors()`, `reservedFactors()`, `directionLabel()`.
- [x] **NEW** `apps/web/src/app/core/draw/draw-formula-api.service.ts` — types `DrawFormula`, `DrawFactorConfigEntry`, `DrawFormulaStatus` ; methods matching **19.17** REST ; map `HttpErrorResponse` to `{ status, message }` for UI.
- [x] **NEW** `apps/web/src/app/core/draw/draw-formula-api.service.spec.ts` — minimal HTTP mock tests (list + 400 body parse).

### 2. Paramètres troupe — second tab (AC1)

- [x] **UPDATE** [`troupe-settings.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.ts) — add `FORMULAS_TAB = 'formulas'` ; fix `selectedTabIndex` / `onTabChange` / query param handling (currently hardcoded to categories only).
- [x] **UPDATE** [`troupe-settings.html`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.html) — second `mat-tab` **Formules de tirage** ; intro copy per UX F1 ; optional link **Comprendre les cotes** → `docs/v2/product/draw-chances-explained.md` (external or in-app route if exists).
- [x] **NEW** `troupe-draw-formulas-tab.ts/html/scss` — list F1 : loading, error, rows, CTA, `data-testid` hooks from UX § Test hooks.
- [x] **UPDATE** [`troupe-settings.spec.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.spec.ts) — tab switch + deep link `?tab=formulas`.

### 3. Editor dialog F2 (AC2)

- [x] **NEW** `troupe-draw-formula-editor-dialog.ts/html/scss` — reactive form ; bloc **F2-C** (composition compacte) ; toggle leading ; **F2-R** ; **F2-E** repliable ; plafond aspirations en détails.
- [x] **NEW** `draw-formula-effect-summary.ts` + **`replay-intensity-map.ts`** (F2-R load/save + F2-E copy avec 20 % base / pt) — pure functions ; unit-tested.
- [x] **NEW** `troupe-draw-formula-profile-chart.ts` — F2-V ; donut sans off ni score 0 ; légende 3 lignes ; `computeProfileSegments()` sans plancher.
- [x] Implement client-side range hints (min/max from catalogue) — **server is authority** ; optional disable submit on obvious out-of-range, but API 400 must still be handled.
- [x] Payload builder: stable factor order ; replay display → `EXCLUDE` if `>= 1.0` else `MALUS` + `malusMultiplier = 1 − display` (REF-P03).
- [x] **NEW** `troupe-draw-formula-editor-dialog.spec.ts` — default payload, tuned params, 400 error mapping.

### 4. Archive dialog F3 (AC3)

- [x] **NEW** `troupe-draw-formula-archive-dialog.ts` (or reuse shared confirm pattern from [`troupe-category-delete-dialog.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-category-delete-dialog.ts)) — 409 body handling.

### 5. Integration & regression (AC5)

- [ ] **UPDATE** [`app.routes.spec.ts`](../../apps/web/src/app/app.routes.spec.ts) if route metadata changes — N/A (aucun changement de route).
- [x] Run `npm run test -w @hatcast/web -- --watch=false` green.
- [x] Run `npm run build -w @hatcast/web` — no bundle regressions beyond expected new lazy chunks.
- [x] Manual recette checklist (AC5.17): create draft → publish → edit coefficients → archive ; system row read-only.

### Review Findings

- [x] [Review][Patch] Édition formule publiée : « Enregistrer » envoie `status: DRAFT` et rétrograde silencieusement une formule `PUBLISHED` [`troupe-draw-formula-editor-dialog.ts:225-236`]
- [x] [Review][Patch] Erreurs API 400 masquées si panneau détails replié — `fieldError()` rendu seulement dans `@if (isFactorExpanded(...))` ; viole AC2.11 / F4 [`troupe-draw-formula-editor-dialog.html:152-160`]
- [x] [Review][Patch] Message d’erreur générique « Impossible d’enregistrer la formule. » pour `list()` et `archive()` (réseau/parse) [`draw-formula-api.service.ts:82-87`]
- [x] [Review][Patch] `immediate_replay` activé à défaut (EXCLUDE) envoie `{ mode: 'EXCLUDE' }` au lieu d’omettre `params` (REF-P04 / AC2.10) [`draw-formula-payload.ts:132-140`]
- [x] [Review][Patch] Aucun `troupe-draw-formulas-tab.spec.ts` — AC5.16 exige chargement liste F1 (pattern `troupe-categories-tab.spec.ts`)
- [x] [Review][Patch] Aucun test archivage 409 (AC3.15 / AC5.16) pour `TroupeDrawFormulaArchiveDialog`
- [x] [Review][Patch] Aucun test ligne système read-only (AC1.5) ni snackbar + refresh après save (AC2.12)
- [x] [Review][Patch] Aucun test onglet par défaut Catégories sans `?tab=` (AC1.2) [`troupe-settings.spec.ts`]
- [x] [Review][Patch] Heuristique `mapApiErrorToField` : `includes('strength')` peut mapper une erreur sur le mauvais critère [`draw-formula-payload.ts:290-312`]
- [x] [Review][Patch] Pas de `mat-error` pour `maxLength(255/2000)` sur nom/description [`troupe-draw-formula-editor-dialog.html`]
- [x] [Review][Patch] Dialog éditeur sans `disableClose` pendant `saving()` — fermeture backdrop/Echap possible en cours d’enregistrement
- [x] [Review][Patch] Tâche §5 `app.routes.spec.ts` cochée mais aucune modification dans le diff — corriger tâche ou ajouter test
- [x] [Review][Patch] Code story entièrement non commité sur la branche feature — committer avant merge
- [x] [Review][Defer] Verrouillage optimiste `version` non envoyé au PATCH — API n’exige pas version client ; risque écrasement concurrent accepté MVP [`draw-formula-payload.ts:37-42`] — deferred, hors scope 19.19c
- [x] [Review][Defer] `troupeId` input change sans reload — composant parent stable en pratique [`troupe-draw-formulas-tab.ts:51-53`] — deferred, edge théorique
- [x] [Review][Defer] Race `reload()` concurrent sans séquence — deferred, pas de déclencheur UI parallèle
- [x] [Review][Defer] État vide liste sans copy dédiée quand `formulas=[]` — deferred, CTA « Nouvelle formule » suffit MVP
- [x] [Review][Defer] Pas de bouton retry sur erreur chargement F1 — deferred, hors AC
- [x] [Review][Defer] Badges direction sans tokens error/tertiary distincts — deferred, écart M3 mineur

---

## Dev Notes

### Product and UX rules (v2 baseline 2026-06-17, post-recette)

- **Demo 1 gate:** First admin-visible Wave D deliverable — troupe admin can persist tuned coefficients; production draw still uses `DrawWeightPipelines.DEFAULT` until **19.18**.
- **Copy tone:** « Formule » = named recipe ; **never** « pipeline », « multiplicateur », « poids », « mode » on this surface (UX spec).
- **F2-C:** Single **Composition de la formule** block (donut + compact list) — no « Bonus et malus » section title.
- **Toggle leading:** `mat-slide-toggle` before criterion name (M3 settings pattern is trailing ; v2 UX choice for scan ON/OFF first).
- **Direction badges:** Read-only Malus/Bonus chips ; not sent to API.
- **`equity_tag` (F2-O):** Silent in UI ; always `{ enabled: true }` in payload ; omitted from F1 summary.
- **Preview %:** **Out of scope** (**OQ-P3**).
- **Controls:** Compact row label **Intensité** ; advanced cap in collapsible details only.
- **F2-E:** Collapsible effect-summary ; **20 %** illustrative base + **±X pt** ; `BASE_CHANCE_EXAMPLE_PCT = 20`.
- **F2-R:** Replay single intensity slider ; display `1−malusMultiplier` ; `1.0` = EXCLUDE ; `0` = no penalty.
- **F2-V:** Title **Composition de la formule** ; donut excludes OFF and zero-score ; no disclaimer ; `PROFILE_CHART_COLORS` distinct per factor.
- **Explain only decisions:** No static blocks for non-configurable behaviour.

### Current frontend state (READ BEFORE EDITING)

| File | Today | This story changes |
|------|-------|-------------------|
| [`troupe-settings.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.ts) | Single **Catégories** tab ; query param ignored | Second tab + proper tab index routing |
| [`troupe-settings.html`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.html) | Categories only | Formulas tab + intro |
| `apps/web/src/app/core/draw/*` | **Does not exist** | New catalogue + API service |
| Draw formula UI | **None** | Full F1/F2/F3 |

**Reuse patterns from 17.40:**

- List + dialog CRUD: [`troupe-categories-tab.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-categories-tab.ts)
- Form dialog structure: [`troupe-category-form-dialog.ts`](../../apps/web/src/app/pages/troupe-settings/troupe-category-form-dialog.ts)
- Pill tabs SCSS: [`troupe-settings.scss`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.scss) + [`_hatcast-pill-tab-bar.scss`](../../apps/web/src/styles/_hatcast-pill-tab-bar.scss)
- Admin gating: existing `canManageTroupe` redirect in `troupe-settings.ts`

### API contract (19.17 + 19.19b — no changes expected)

| Method | Path | UI use |
|--------|------|--------|
| `GET` | `/v1/troupes/{troupeId}/draw-formulas` | F1 list |
| `GET` | `/v1/troupes/{troupeId}/draw-formulas/{id}` | F2 edit preload |
| `POST` | `/v1/troupes/{troupeId}/draw-formulas` | F2 create |
| `PATCH` | `/v1/troupes/{troupeId}/draw-formulas/{id}` | F2 update / publish |
| `DELETE` | `/v1/troupes/{troupeId}/draw-formulas/{id}` | F3 archive |

**Sample `factorConfig` payload (published, tuned):**

```json
[
  { "factorId": "equity_tag", "enabled": true },
  { "factorId": "past_participation", "enabled": true, "params": { "strength": 1.5 } },
  { "factorId": "immediate_replay", "enabled": true, "params": { "mode": "MALUS", "malusMultiplier": 0.5 } },
  { "factorId": "role_request", "enabled": true, "params": { "bonusPerUnfulfilled": 1.0, "maxBonusMultiplier": 10.0 } }
]
```

**French 400 messages to surface (partial match OK):**

| Ref | Example substring |
|-----|-------------------|
| REF-P02/P05 | `strength doit être entre 0.0 et 2.0` |
| REF-P03 | `malusMultiplier n'est autorisé que si mode=MALUS` |
| REF-P01 | `Paramètre inconnu pour past_participation` |
| REF-V03 | publish empty pipeline messages from **19.17** |

Parse strategy: prefer API response body `message` or `detail` field ; fallback generic **Impossible d'enregistrer la formule.**

### Architecture compliance

- **Authority:** [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) § Factor catalogue ; [`ux-design-draw-formulas-19-19.md`](../planning-artifacts/ux-design-draw-formulas-19-19.md) ; [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).
- **No API / DB changes.**
- **No draw runtime wiring** — `CompositionDrawService` unchanged until **19.18**.
- **Angular 21 standalone components** — match existing `troupe-settings` imports style.

### File structure requirements

| Action | Path |
|--------|------|
| **NEW** | `apps/web/src/app/core/draw/draw-factor-catalog.ts` |
| **NEW** | `apps/web/src/app/core/draw/draw-formula-api.service.ts` (+ `.spec.ts`) |
| **NEW** | `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.*` |
| **NEW** | `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.*` (+ `.spec.ts`) |
| **NEW** | `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-archive-dialog.*` (optional) |
| **UPDATE** | `troupe-settings.ts`, `troupe-settings.html`, `troupe-settings.spec.ts` |
| **DO NOT EDIT** | `services/api/**` (unless blocking bug) ; golden JSON ; production draw path |

### Testing requirements

- Unit tests: dialog payload assembly, API error mapping, tab routing — **no E2E required** for MVP (Playwright can follow **19.20**).
- `data-testid` attributes per UX § Test hooks (`draw-formulas-tab`, `draw-formula-editor-dialog`, etc.).
- Gate: `npm run test -w @hatcast/web -- --watch=false`.

### Explicit non-goals

- `POST …/preview` % simulator (**OQ-19-03**)
- Politiques UI (**19.20**) ; orga formula picker (**19.21**)
- Enabling reserved factors **19.11–19.14**
- Snapshot metadata (**19.22**)
- UX mockup HTML maintained for v1 baseline — canvas optional / may lag.
- Hub gear menu entry to Formulas tab (**OQ-F3** — deep link only)

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **19.19b** | done | Runtime reads `params` ; REF-P validation on save/publish — **required** |
| **19.19a** | done | Normative catalogue table + TS export shape |
| **19.17** | done | REST CRUD — UI consumes as-is |
| **17.40** | done | Paramètres troupe shell + categories tab pattern |
| **17.2** | done | Admin chrome (recommended) |
| **19.18** | backlog | **Blocked by this story** — policy runtime |
| **19.20** | backlog | Policies UI — depends on **19.19c** |
| **19-19-ui-admin-editeur-formules** | cancelled | **Do not implement** monolithic story |

---

## Previous story intelligence

### From **19.19b** (runtime — done)

- `DrawFactorParamCatalog.kt` is Kotlin authority — TS catalogue must stay in sync (keys, ranges, defaults, directions).
- REF-P01 message format: `Paramètre inconnu pour $factorId : $key`.
- `OFF` mode **rejected** — UI must only offer `EXCLUDE` / `MALUS`.
- Replay F2-R: omit `malusMultiplier` when display intensity `>= 1.0` (send `mode=EXCLUDE` only).
- Disabled factor params skipped by validator — UI may omit `params` when factor toggled OFF.
- Golden REF-F01..F08 unchanged at defaults — UI defaults must match catalogue defaults.

### From **19.19a** (spec — done)

- Locked OQ-P1: `(1/(1+n))^strength` ; OQ-P2: per-param replay/role_request ; OQ-P3: no live preview.
- TypeScript export shape documented in spec § Handoff to **19.19c**.
- French `effect` helper strings in spec table — use in param hints.

### From **19.17** (API — done)

- System formula seeded per troupe ; always listed ; `isSystem` guards edit/delete.
- Archive = soft `ARCHIVED` ; 409 when policy references formula.
- Publish requires ≥1 enabled implemented factor ; `equity_tag` always enabled.

### From UX **ux-design-draw-formulas-19-19.md** (approved-v2)

- Implement **F1 / F2-C / F2-O / F2-E / F2-R / F2-V / F3 / F4** per § Décisions v2.
- Mockup HTML = visual source of truth for layout and copy.
- Helpers: `replayDisplayFromParams` / `replayParamsFromDisplay` ; `computeProfileSegments()` (no INACTIVE_FLOOR) ; effect-summary per F2-E v2.

### Handoff Amelia (code review / merge)

**Scope review :** valider que l’implémentation sur `feat/19-19c-ui-admin-editeur-formules` respecte **approved-v2** (pas v1) :

| Point v2 | Fichiers clés |
|----------|----------------|
| Bloc composition unique | `troupe-draw-formula-editor-dialog.html` § `.editor-dialog__composition` |
| Toggle leading + Intensité compacte | idem + SCSS `.editor-dialog__compact-leading` |
| F2-E repliable + 20 % / pt | `draw-formula-effect-summary.ts` + détails dans dialog |
| Donut sans off / sans score 0 | `draw-formula-payload.ts` `computeProfileSegments` ; `troupe-draw-formula-profile-chart.ts` |
| Pas de disclaimer | `troupe-draw-formula-profile-chart.html` |
| Tests | `draw-formula-payload.spec.ts` (zero intensity → 100 % on sole influencer) |

**Non bloquant doc :** canvas `.canvas.tsx` peut rester en retard sur v2.

---

## Git intelligence summary

Recent Epic 19 commits on baseline `9ed06c45`:

| Commit | Relevance |
|--------|-----------|
| `9ed06c45` merge **19.19b** | **Baseline** — param runtime + REF-P/F golden |
| `3c43dd81` REF-P01 harmonization | Error substring patterns for UI mapping |
| `e8a5c902` factor params runtime | `DrawFactorParamCatalog.kt` — mirror in TS |
| `fe5f2756` UX draft assets | Wireframes/mockup — amend per SCP coefficients |
| `81d2b5f8` merge **19.17** | Draw formula REST API |

**Pattern:** Wave D sequence **19.19a → 19.19b → 19.19c (this)** → **19.18** policy runtime.

---

## Latest tech information

- **Angular 21.2 + Material 21.2** — use existing project versions ; `MatDialog` + standalone components (no NgModule).
- **Signals + `input()`** — match `troupe-categories-tab` / `troupe-settings` patterns.
- **HTTP client** — follow [`TroupeApiService`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) error handling conventions.
- **No new npm dependencies** expected.

---

## Project context reference

- [project-context.md](../../project-context.md) — story branch `feat/19-19c-ui-admin-editeur-formules` until merge after review.
- [AGENTS.md](../../AGENTS.md) — read FRONTEND_UI.md before UI work ; no SPEC change unless product behaviour newly exposed (coefficient tuning — already documented in **19.19a** SPEC bullet).
- Commit format: `feat(web): …` per [COMMIT_MESSAGE_GUIDELINES.md](../../docs/shared/technical/COMMIT_MESSAGE_GUIDELINES.md).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story agent)

### Completion Notes List

- Implemented Wave D Demo 1 admin UI: F1 catalogue tab, F2 coefficient editor (F2-O/E/R/V), F3 archive, F4 inline API errors.
- Core module `apps/web/src/app/core/draw/*`: TS catalogue mirroring Kotlin defaults/ranges; REST client; payload builder with stable factor order and replay intensity mapping.
- Paramètres troupe: second pill tab `?tab=formulas`, admin gating unchanged, deep-link tab index fixed.
- Material 3: mat-slider/mat-slide-toggle/mat-chip/mat-dialog; tokens `--mat-sys-*`; icon buttons ≥48dp mobile; French aria-labels.
- Tests: 17 story-scoped unit tests green; `npm run build -w @hatcast/web` OK (lazy chunk `troupe-settings` ~90 kB).
- M3 waivers: F2-V sticky scroll (optional MVP — not implemented); toggle leading (waived vs M3 list trailing — PO v2); M3-4 N/A (no new global nav).
- UX v2 post-recette retrofitted in spec **approved-v2** + mockup (composition compacte, intensité 0 → 0 %, F2-E 20 %/pt, no disclaimer).
- Manual recette AC5.17: ready on `./scripts/start-dev.sh --offline` — admin `@seed.improbots.test` → `/troupes/improbots/admin/parametres?tab=formulas`.

### File List

- apps/web/src/app/core/draw/draw-factor-catalog.ts
- apps/web/src/app/core/draw/draw-formula-api.service.ts
- apps/web/src/app/core/draw/draw-formula-api.service.spec.ts
- apps/web/src/app/core/draw/draw-formula-effect-summary.ts
- apps/web/src/app/core/draw/draw-formula-payload.ts
- apps/web/src/app/core/draw/draw-formula-payload.spec.ts
- apps/web/src/app/core/draw/replay-intensity-map.ts
- apps/web/src/app/core/draw/replay-intensity-map.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-settings.ts
- apps/web/src/app/pages/troupe-settings/troupe-settings.html
- apps/web/src/app/pages/troupe-settings/troupe-settings.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html
- apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.scss
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.html
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.scss
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.html
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.scss
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-archive-dialog.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formula-archive-dialog.spec.ts
- apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts

### Change Log

- 2026-06-16 : Story created — Wave D S4c admin UI coefficients per SCP 2026-06-16, UX spec, and **19.19b** handoff.
- 2026-06-17 : UX **approved-v1** — F2-O silent equity ; F2-E effect summaries ; F2-R replay intensity slider ; F2-V 3-criteria donut ; story AC/tasks aligned.
- 2026-06-17 : UX **approved-v2** — F2-C composition compacte ; F2-V sans disclaimer/plancher ; F2-E repliable + 20 %/pt ; toggle leading ; story AC + handoff Amelia alignés.
- 2026-06-18 : Story done — E2E recette 19-19c, golden REF-F12–F13, merge vers v2.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / UX / **19.19b**)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d'AC (incl. M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` gate documenté
- [x] API-only scope explicit ; non-goals listed
- [x] TS catalogue ↔ Kotlin sync requirement documented

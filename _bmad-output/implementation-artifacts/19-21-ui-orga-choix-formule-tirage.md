---
feature_branch: feat/19-21-ui-orga-choix-formule-tirage
baseline_commit: 1d32980f9680cdc01f1fb308795d0e0d0aac2037
---

# Story 19.21 : UI orga — formule de tirage invisible par défaut (overflow seulement)

Status: done

**UX baseline (normatif) :** [_ux-design-orga-formula-choice-19-21.md](../planning-artifacts/ux-design-orga-formula-choice-19-21.md) **approved** (PO 2026-06-19) · mockup [_draw-formula-chip-19-21-mockup.html](../previews/draw-formula-chip-19-21-mockup.html) v2 overflow-only

<!-- PO UX amend 2026-06-19 (Patrice) : pas de bandeau, pas de modale, pas de chip — formule dans menu ⋮ seulement si choix réel (≥2). v2 amend : chip encore trop visible. -->

## Story

As an **organizer** with `canManageComposition`,  
I want the **correct draw formula applied silently** and the option to change it **only when needed**, hidden in the **existing overflow menu**,  
so that tirages stay visually identical for 99% of sessions — **Wave D Demo 2** (S6).

**PO principle (v2):** No chip, no label, no bandeau. If the formula is imposed or unique → **zero UI**. If ≥2 formulas allowed → change only via **`more_vert`** overflow (same affordance as Partager).

## Acceptance Criteria

### AC1 — No visible formula chrome by default

1. **Given** organizer opens **Équipe**, **when** tab loads, **then** fetch `GET …/draw-policy/effective` in background ; init `selectedFormulaId` from `effectiveFormulaId` — **no** bandeau, **no** chip, **no** extra hint line for formula.
2. **Given** `selectorVisible === false` (MANDATORY, CHOICE with 1 formula, or implicit single effective), **when** toolbar renders, **then** **no** formula UI whatsoever — orga cannot see which formula runs (server applies it).
3. **Given** member without `canManageComposition`, **when** Équipe loads, **then** unchanged UX.
4. **Given** effective GET fails, **when** tab loads, **then** no formula UI ; draw uses server defaults.

[Source: epics **19.21** — **amended PO v2**]

### AC2 — Tirage sans interruption

5. **Given** any rule including CHOICE ≥2, **when** **Tirer au sort**, **then** **no** dialog ; immediate `POST …/composition/draw` with `{ mode, formulaId: selectedFormulaId }` when required.
6. **Given** draw succeeds, **then** animation **6.4** unchanged (`prefers-reduced-motion` intact).

[Source: **19.18** runtime ; PO amend]

### AC3 — Changement dans menu overflow uniquement (CHOICE ≥2)

7. **Given** `selectorVisible === true` (≥2 allowed formulas), **when** actions toolbar visible, **then** show formula choices **only** inside existing [`equipeOverflowMenu`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) (`mat-menu` on `more_vert`) — section label **« Formule de tirage »** (`mat-menu-item` disabled as subheader **or** `span` in menu template) + one `mat-menu-item` per allowed formula with **check** icon on current selection.
8. **Given** overflow menu, **when** only formula entries needed (no share/unlock in overflow), **then** still show **`more_vert`** icon button for formula alone — same `event-equipe-tab__action-overflow` styling.
9. **Given** formula `mat-menu-item` tap, **when** selected, **then** update `selectedFormulaId`, close menu, refresh pool preview / operational `%` — **no** snackbar.
10. **Given** `more_vert` button, **when** `selectorVisible`, **then** optional `matTooltip` : « Autres actions » (default) — **do not** put formula name on toolbar surface (waivable: tooltip on long-press only).

[Source: PO amend v2 ; reuse overflow pattern **6.12**]

### AC4 — Operational `%` coherence (FR19)

11. **Given** `selectedFormulaId` `F`, **when** pool-preview / chance-breakdown / slot-picker chances, **then** `formulaId=F`.
12. **Given** successful draw, **then** **19.18** + **6.14** server path — no front recompute.

[Source: **REF-R12** ; OQ-19-04]

### AC5 — Coverage

13. **Couverture :** FR19, FR20, UX-DR6, Wave D **Demo 2**. **Depends :** **19.18**, **6.4**, **17.8**. **Blocks :** **19.22**. **No** **19.20**. **No** API unless defect.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1.** Overflow `mat-icon-button` + `mat-menu` / `mat-menu-item` only — **no** `mat-chip`, **no** `MatDialog` draw gate. [FRONTEND_UI.md]

**M3-2.** Menu uses standard M3 menu surface ; check icon `check` or `done` on selected row. [FRONTEND_UI.md]

**M3-3.** `more_vert` ≥ **48×48 dp** ; menu items ≥ **48dp** ; `aria-label` « Autres actions » on icon ; menu items = formula names. [NFR-A1]

**M3-4.** N/A global nav.

**M3-5.** Checklist M3 ; UX normative : [ux-design-orga-formula-choice-19-21.md](../planning-artifacts/ux-design-orga-formula-choice-19-21.md) ; mockup v2 overflow.

---

## Tasks / Subtasks

### 0. Branch

- [x] `feat/19-21-ui-orga-choix-formule-tirage` ; baseline `1d32980f`.

### 1. API client

- [x] **NEW** `draw-policy-api.service.ts` + spec.

### 2. State

- [x] `event-equipe-tab.ts` — `effectivePolicy`, `selectedFormulaId`, load when `canManageComposition()`.

### 3. Overflow menu entries (not chip)

- [x] **UPDATE** `event-equipe-tab.html` — formula block inside `#equipeOverflowMenu` when `selectorVisible`.
- [x] **UPDATE** `event-equipe-tab.ts` — show overflow button when `equipeToolbar().overflow.length > 0 **OR** selectorVisible`.
- [x] `data-testid="composition-draw-formula-menu"` on menu section ; `composition-draw-formula-option-{id}` per item.
- [x] **DO NOT** add `composition-draw-formula-chip`.

### 4. Wire draw + explainability

- [x] `composition-api.service.ts` — `formulaId` on draw, pool-preview, breakdown.
- [x] `draw()` — never dialog ; POST with `selectedFormulaId`.

### 5. Tests

- [x] `selectorVisible false` → no overflow for formula, no chip in DOM.
- [x] `selectorVisible true` → menu items ; draw without dialog ; POST `formulaId`.
- [x] Menu change → pool-preview URL includes new `formulaId`.
- [x] `npm run test -w @hatcast/web -- --watch=false`.

### Review Findings

- [x] [Review][Patch] `activeDrawFormulaId` sans repli sur `effectiveFormulaId` — corrigé via computed fallback [`event-equipe-tab.ts`]
- [x] [Review][Patch] Pas de garde `requiresFormulaIdOnDraw` avant `draw()` / `fillGaps()` — corrigé via `drawFormulaReady` dans `canDraw` / `canFillGaps`
- [x] [Review][Patch] `selectedFormulaId` non réinitialisé au changement event/saison — corrigé via `loadedDrawPolicyKey` + reset dans effect
- [x] [Review][Patch] Requête policy en vol non invalidée quand `canManageComposition` repasse à false — corrigé via `drawPolicyRequestId += 1`
- [x] [Review][Patch] Garde stale-response policy incomplète — `seasonId` ajouté au check
- [x] [Review][Patch] `drawFormulaSelectorVisible` ne vérifie pas `allowedFormulas.length >= 2` — corrigé
- [x] [Review][Patch] Menu formule inaccessible si `showActionsToolbar()` false — `drawFormulaSelectorVisible()` ajouté à `showActionsToolbar`
- [x] [Review][Patch] Changement formule ne rafraîchit que pool preview — reload slot picker candidats si ouvert ; breakdown modal bloque le menu (hors flux simultané)
- [x] [Review][Patch] `loadEffectiveDrawPolicy` écrase choix session — preserve si encore dans `allowedFormulaIds`
- [x] [Review][Patch] Test composant GET policy échoue (AC1.4) — ajouté
- [x] [Review][Patch] Test `selectorVisible: false` + `effectiveFormulaId` (AC4) — ajouté
- [x] [Review][Patch] Tests menu overflow DOM (AC3.7) — ajouté
- [x] [Review][Patch] Test `fillGaps()` + `formulaId` (AC4) — ajouté
- [x] [Review][Patch] Test pas de snackbar au changement formule (AC3.9) — ajouté
- [x] [Review][Defer] Cible 48×48 dp non codée explicitement sur le bouton ⋮ — défaut Material + pattern existant repo [`event-equipe-tab.scss:189-192`] — deferred, pre-existing
- [x] [Review][Defer] Couverture E2E Playwright menu formule / tirage `formulaId` — artefact séparé `19-21-e2e-formula-choice.md`, hors scope unit tests story — deferred, pre-existing

---

## Dev Notes

### UX rules (PO v2 — 2026-06-19)

| Cas | UI |
|-----|-----|
| Formule imposée / unique | **Rien** |
| ≥2 formules (CHOICE) | **⋮ menu** seulement |
| Tirer au sort | **Toujours direct** |
| Chip / bandeau / hint formule | **Interdit** |

**Wireframe (fermé):**

```
[Tirer au sort] [Valider]  [⋮]   ← rien d'autre

Tap ⋮ →
  Partager          (si overflow existant)
  ─────────
  FORMULE DE TIRAGE
  ✓ Équité saison
    Parité match
```

### Overflow button visibility

Today overflow shows only if `equipeToolbar().overflow.length > 0`. Extend:

```typescript
showEquipeOverflow = computed(() =>
  equipeToolbar().overflow.length > 0 || drawFormulaSelectorVisible()
)
```

### File structure

| Action | Item |
|--------|------|
| CREATE | `draw-policy-api.service.ts` |
| UPDATE | `event-equipe-tab.ts/html` — menu only |
| UPDATE | `composition-api.service.ts` |
| **NO** | chip component, picker dialog, bandeau |

### Mockup

[`draw-formula-chip-19-21-mockup.html`](../previews/draw-formula-chip-19-21-mockup.html) — v2 overflow-only (filename legacy).

### Change Log

- 2026-06-19 : Story created (`bmad-create-story`).
- 2026-06-19 : PO amend v1 — no bandeau/modale ; chip in toolbar.
- 2026-06-19 : **PO amend v2 (Patrice)** — chip too visible → **overflow menu only** ; hide all UI when `selectorVisible === false`.
- 2026-06-19 : **Docs normatives** figées — SPEC, draw-formulas-policies-spec, ADR 0019, epics 19.21, ux-design-orga-formula-choice-19-21.md.
- 2026-06-19 : **Implementation** — overflow-only formula choice ; draw-policy client ; formulaId wired on draw/explainability.
- 2026-06-19 : **Code review** — patches appliqués (policy guards, fallback formulaId, toolbar AC3.8, tests AC) ; status `done`.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.21)

### Completion Notes List

- Added `DrawPolicyApiService` — GET `/draw-policy/effective` for organizer Équipe tab.
- `EventEquipeTab` loads policy when `canManageComposition`; init `selectedFormulaId` from `effectiveFormulaId`.
- Zero formula UI when `selectorVisible === false` (MANDATORY, CHOICE×1, implicit).
- CHOICE ≥2: overflow `⋮` only — section « Formule de tirage » + check on selection ; no chip/bandeau.
- Draw / fill / pool-preview / breakdown / candidates pass `formulaId` for operational % coherence (FR19).
- Unit tests: 67 passing in `event-equipe-tab.spec.ts` + `draw-policy-api.service.spec.ts`.

### Review Findings

- [ ] [Review][Patch] `activeDrawFormulaId` sans fallback `effectiveFormulaId` — tirage / explainability envoient `null` avant fin du GET ou si `selectedFormulaId` désynchronisé [`event-equipe-tab.ts:197`]
- [ ] [Review][Patch] Pas de garde `requiresFormulaIdOnDraw` ni attente policy au tirage / fillGaps — POST draw possible sans `formulaId` requis [`event-equipe-tab.ts:1005`]
- [ ] [Review][Patch] `selectedFormulaId` non réinitialisé au début de `loadEffectiveDrawPolicy` — risque d’envoyer l’id formule de l’événement précédent [`event-equipe-tab.ts:1512`]
- [ ] [Review][Patch] `drawPolicyRequestId` non invalidé quand `canManageComposition` → false — réponse HTTP stale peut réappliquer la policy [`event-equipe-tab.ts:490`]
- [ ] [Review][Patch] Garde stale policy sans vérif `seasonId()` — policy d’une autre saison applicable au mauvais event [`event-equipe-tab.ts:1514`]
- [ ] [Review][Patch] `drawFormulaSelectorVisible` sans garde `allowedFormulas.length >= 2` — menu overflow vide si API incohérente [`event-equipe-tab.ts:183`]
- [ ] [Review][Patch] Menu formule inaccessible si `showActionsToolbar()` false malgré `selectorVisible` (AC3.8) [`event-equipe-tab.html:323`]
- [ ] [Review][Patch] `selectDrawFormula` ne rafraîchit pas breakdown / picker candidats ouverts — seul pool preview (AC3.9 / AC4) [`event-equipe-tab.ts:913`]
- [ ] [Review][Patch] `loadEffectiveDrawPolicy` écrase le choix menu utilisateur à chaque reload — ne pas reset si id encore dans `allowedFormulaIds` [`event-equipe-tab.ts:1524`]
- [ ] [Review][Patch] Test composant : échec GET `draw-policy/effective` → pas d’UI formule, draw sans `formulaId` (AC1.4) [`event-equipe-tab.spec.ts`]
- [ ] [Review][Patch] Test composant : `selectorVisible: false` + `effectiveFormulaId` défini → APIs reçoivent le formulaId silencieux (AC4) [`event-equipe-tab.spec.ts`]
- [ ] [Review][Patch] Test composant : DOM menu (libellé section, check, `composition-draw-formula-option-{id}`) (AC3.7) [`event-equipe-tab.spec.ts`]
- [ ] [Review][Patch] Test composant : `fillGaps` passe `activeDrawFormulaId()` (AC4) [`event-equipe-tab.spec.ts`]
- [ ] [Review][Patch] Test composant : `selectDrawFormula` n’appelle pas `snack.open` (AC3.9) [`event-equipe-tab.spec.ts`]
- [x] [Review][Defer] M3-3 : pas de `min-width/min-height: 48px` explicite sur `.event-equipe-tab__action-overflow` — deferred, pattern Material implicite préexistant [`event-equipe-tab.scss:189`]
- [x] [Review][Defer] Couverture E2E Playwright menu formule / tirage `formulaId` — deferred, artifact `19-21-e2e-formula-choice.md` hors scope unit tests story

### File List

- `apps/web/src/app/core/draw/draw-policy-api.service.ts` (new)
- `apps/web/src/app/core/draw/draw-policy-api.service.spec.ts` (new)
- `apps/web/src/app/core/composition/composition-api.service.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `apps/web/src/app/shared/composition/chance-breakdown.service.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

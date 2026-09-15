---
title: 'Formulas tab list — copy, default badge, composition chart'
type: 'feature'
created: '2026-09-15'
status: 'done'
baseline_commit: 'c6ac0d55113d67b2229b011680237b4f6c2735c5'
review_loop_iteration: 0
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Formules de tirage list is text-heavy and jargon-heavy: an obsolete help link, a seed name “V1 standard (système)”, a “Système” badge, and “Appliquée à le reste…” that does not explain the default formula. The system card is a wide empty outline instead of showing composition.

**Approach:** Tighten list copy, alias the system formula as **Formule standard** with badge **Par défaut**, replace fallback copy with a concrete sentence, and show the existing composition donut on each list row (compact, same segments/colors as the editor).

## Boundaries & Constraints

**Always:**
- Surface = onglet Formules only (`TroupeDrawFormulasTab`). French UI. Material 3 tokens.
- System formula **display** name on this tab: `Formule standard`. Badge: `Par défaut`. Do not persist a name change.
- Remove intro paragraph and **Comprendre les cotes**. Keep policy-load warning and + Catégorie assignment UI for published custom formulas.
- System fallback line (no “Appliquée à”, no “le reste”): `Spectacles et catégories sans formule dédiée`.
- Drop the text factor-summary line; the compact chart legend carries criteria.
- Compact chart = same `TroupeDrawFormulaProfileChart` (same `computeProfileSegments` / colors). On the list: hide the “Composition de la formule” heading; **empty donut hole** (no “3 critères” / “N actifs”); legend lists **only criteria that contribute to the donut** (enabled with percent > 0). Editor chart unchanged (heading + all 3 legend rows + center counts stay).
- French UI label for `immediate_replay`: **Ne pas rejouer immédiatement** (catalog, list legend, editor criterion name). Chart short label **Ne pas rejouer** (replaces **Rejouer**). Do not change `factorId` or API params.
- Update unit tests and E2E copy assertions that pin the old strings.

**Ask First:** Renaming persisted `SYSTEM_V1_NAME` / seeds; changing organizer overflow labels; changing category-assignment persistence.

**Never:**
- New Politiques tab, API/policy model changes, editor criteria UX rewrite, restoring `/help/draw-chances-explained.md` on this tab, Tailwind as layout/color surface.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| System row | `isSystem` formula | Name **Formule standard**, badge **Par défaut**, compact chart, fallback sentence, no edit/archive, no + Catégorie | N/A |
| Published custom | published non-system | Stored name, status badge, compact chart, **Appliquée à** chips + **+ Catégorie** | Policy PUT errors unchanged |
| Draft / archived | non-published custom | Compact chart; no Appliquée à editor | N/A |
| Chart empty | all malus/bonus off or intensity 0 | Empty donut, **no legend rows** (do not list “off”) | N/A |
| Policy load fail | GET policy error | Existing warning; assignment controls disabled; charts still render from formula payload | No extra copy |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html` -- intro, help `<a>`, `formula.name`, badge **Système**, `factorSummary`, apply/fallback slots. Put compact chart in each `<li>`.
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts` -- `FORMULAS_INTRO_COPY`, `SYSTEM_FALLBACK_COPY` (`le reste…`), `helpPath` / `DRAW_CHANCES_HELP_PATH`, `factorSummary()`. Add `displayName()` and `editorStateFromFactorConfig(formula.factorConfig)`.
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.scss` -- system row is an empty outlined card (`__row--system`); layout chart beside/below title without a vacant action column.
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.{ts,html,scss}` -- heading L2; hole “3 critères” + `centerLine()` L11–13; legend loops **all** `segments()`. Compact: hide `h3`, hide hole copy, iterate `chartSegments()` (already filters enabled + percent > 0). Do not fork a second chart.
- `apps/web/src/app/core/draw/draw-factor-catalog.ts` -- `immediate_replay` `label` L104 **Rejouer immédiatement**.
- `apps/web/src/app/core/draw/draw-formula-payload.ts` -- summary L195; chart short label L249–250 **Rejouer**.
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.html` -- keep full chart (heading on). Pass no compact flag.
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts` -- asserts **Système**, `FORMULAS_INTRO_COPY`, `SYSTEM_FALLBACK_COPY` (~L298–323).
- `apps/web/e2e/helpers/story-19-19c.ui.ts` -- `expectSystemFormulaReadOnly` exact **Système** (L47).
- `apps/web/e2e/recette-19-20.spec.ts` -- 19-20-E2E-01 pins intro + `le reste…` (L26–39).
- Read-only: `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedConstants.kt` (`SYSTEM_V1_NAME`); `apps/web/src/app/shared/composition/chance-breakdown.constants.ts` (keep constant; other callers).

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/core/draw/draw-factor-catalog.ts` and `draw-formula-payload.ts` -- rename French `immediate_replay` labels -- malus meaning is “do not replay immediately”
- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.{ts,html,scss}` -- compact: no heading, no center counts, legend = active slices only; editor default unchanged -- one component, two densities
- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.{html,ts,scss}` -- copy + badge + chart wiring + drop intro/link/summary -- list is the user-visible surface
- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts` -- cover matrix copy/chart presence -- I/O matrix
- [x] `apps/web/e2e/helpers/story-19-19c.ui.ts` and `apps/web/e2e/recette-19-20.spec.ts` -- pin new strings so 19.20 recette still gates assignment UX

**Acceptance Criteria:**
- Given the Formules tab loaded, when the list renders, then there is no intro paragraph and no **Comprendre les cotes** link.
- Given a system formula, when listed, then the title is **Formule standard**, the badge is **Par défaut**, and the fallback sentence is **Spectacles et catégories sans formule dédiée** with no **Appliquée à** prefix.
- Given `immediate_replay` is on, when the list or editor shows its name, then the copy is **Ne pas rejouer immédiatement** (donut short **Ne pas rejouer**), never **Rejouer immédiatement**.
- Given any formula row, when listed, then a compact donut is visible (`data-testid="draw-formula-profile-chart"`), the hole has no criterion counts, the legend shows only contributing criteria (no “off” rows), and the old one-line factor summary is absent.
- Given the formula editor dialog, when opened, then the chart still shows the heading, center counts, and the full 3-line legend including off.
- Given viewport ≤ 480px, when a row with + Catégorie / edit / archive is shown, then those controls stay ≥ 48dp; chart is not a control.
- M3-1/M3-2: keep existing `mat-chip` / `mat-button` / `mat-icon-button` / `mat-menu`; tokens only. M3-4 N/A (admin settings, no member chrome). M3-5: FRONTEND_UI checklist in handoff.

## Design Notes

List chart is scan-sized: name + percents of **what actually pulls**. Inactive criteria and “3 critères / N actifs” add no decision. `immediate_replay` is a malus against consecutive play — UI must say **not** to replay immediately. Do not rename the API seed; only alias `isSystem` on this tab.

## Verification

**Commands:**
- `npm run test -w @hatcast/web -- --watch=false src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts` -- expected: pass with new copy/chart assertions
- `npm run test -w @hatcast/web -- --watch=false src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.spec.ts` -- expected: editor still mounts chart with heading

**Manual checks (if no CLI):**
- Formules tab: system card shows **Formule standard** + **Par défaut** + donut, not an empty outlined banner; custom published row still assigns categories.

## Suggested Review Order

**List copy and assignment**

- Alias the system formula on this tab only; seed name stays in the API.
  [`troupe-draw-formulas-tab.ts:163`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts#L163)

- Bind display name, default badge, compact chart, and fallback sentence.
  [`troupe-draw-formulas-tab.html:26`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html#L26)

- Fallback copy without “Appliquée à le reste”.
  [`troupe-draw-formulas-tab.ts:36`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts#L36)

**Compact composition chart**

- One component: compact hides heading and hole counts; legend is contributing slices only.
  [`troupe-draw-formula-profile-chart.ts:18`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formula-profile-chart.ts#L18)

- Compact list binding plus editor default (no compact flag).
  [`troupe-draw-formulas-tab.html:60`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html#L60)

**Criterion label**

- Malus copy: catalog and editor row say not to replay immediately.
  [`draw-factor-catalog.ts:104`](../../apps/web/src/app/core/draw/draw-factor-catalog.ts#L104)

- Donut short label stays compact.
  [`draw-formula-payload.ts:250`](../../apps/web/src/app/core/draw/draw-formula-payload.ts#L250)

**Tests**

- Pin alias, compact chart, empty legend, and editor heading.
  [`troupe-draw-formulas-tab.spec.ts:304`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts#L304)

- Scope the editor donut assertion so list charts do not steal it.
  [`story-19-19c.ui.ts:53`](../../apps/web/e2e/helpers/story-19-19c.ui.ts#L53)


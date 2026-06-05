# Story 6.18 : Aide contextuelle statut composition + espacement chrome détail événement

Status: done

baseline_commit: 88f82056201e63260911f82719f73930e6fff7df

## Story

En tant qu’**organisateur·ice ou administrateur·ice** sur le détail événement,  
je veux **comprendre le statut de composition et les actions à mener via une aide discrète à côté du badge**, visible **quel que soit l’onglet actif**,  
afin de **libérer de l’espace dans l’onglet Équipe** tout en gardant un **chrome propre et bien espacé** au-dessus des onglets.

## Acceptance Criteria

1. **Given** `canManageComposition === true` and `managerGuideline != null`, **when** the event detail loads, **then** `.event-detail__status` shows the composition badge **and** a **`help_outline` icon button** on the same row (spec [C2](ux-design-composition-status-help.md#design-decisions)) — badge **not** clickable ([C1](ux-design-composition-status-help.md)).
2. **Given** the help trigger, **when** the organizer taps/clicks it, **then** a **reveal panel** toggles inline below the badge row with the full `managerGuideline` copy for the current state — **not** a `MatTooltip` ([C3](ux-design-composition-status-help.md)).
3. **Given** the panel is open, **when** the organizer taps the trigger again **or** the composition status `type`/`label` changes, **then** the panel closes (or updates + closes on type change per spec § Transitions).
4. **Given** `canManageComposition === false`, **when** any tab is viewed, **then** only the badge shows — **no** help trigger, **no** panel ([C8](ux-design-composition-status-help.md)).
5. **Given** all six organizer states (`none`, `draft`, `pending_confirmation`, `complete`, `slots_to_complete`, `has_declined`), **when** the help panel is opened, **then** copy matches [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) / `resolveCompositionEquipeStatus` ([C5](ux-design-composition-status-help.md)).
6. **Given** the **Équipe** tab, **when** rendered for an organizer, **then** the inline `managerGuideline` paragraph (`.event-equipe-tab__slots-guideline`) and redundant manual hint (`.event-equipe-tab__manual-hint` at « À composer ») are **removed** ([C6](ux-design-composition-status-help.md)) — toolbar hints (`.event-equipe-tab__actions-lead`, `.event-equipe-tab__action-hint`) **unchanged** ([C7](ux-design-composition-status-help.md)).
7. **Given** draft with `suppressValidateCtaInGuideline`, **when** the help panel opens, **then** guideline omits the Valider sentence (existing resolver behaviour) while `.event-equipe-tab__actions-lead` still shows validate copy on Équipe.
8. **Given** `showDraftBanner`, **when** the composition draft banner renders, **then** it stays **above** the badge+help row ([C9](ux-design-composition-status-help.md)) with spacing consistent with the status block rhythm (see AC #9).
9. **Given** event detail chrome on mobile (≤ 480 px) and desktop, **when** the status zone is displayed (badge only or badge + open panel), **then** vertical spacing is **balanced** — in particular **more air between the status block and the tab header** than today (PO 2026-06-05: badge was too close to tabs) — without adding wasteful empty bands:
   - Consolidate spacing in **one place** (prefer `.event-detail__status` + `.event-detail__tabs-shell` + header component internal `gap`; avoid stacked duplicate `margin-top` / `padding-top` on nested wrappers).
   - **Target rhythm (implementation guide):** ~`0.75rem` between draft/event banners and status row when banners present; ~`0.75rem–1rem` between the **bottom** of the status block (closed: badge row; open: help panel) and the tab header — replace current `.event-detail__tabs-shell { margin-top: 0.25rem }` which is too tight.
   - Inner gaps: badge row ↔ help panel `0.5rem`; banner ↔ status `0.5rem–0.75rem`.
   - **Regression guard:** no double padding from `.composition-equipe-status--badge-only { padding-top: 0.5rem }` **and** `.event-detail__status { margin-top: 0.5rem }` — pick one outer, one inner max.
10. **Given** a11y/E2E hooks, **when** controls are inspected, **then** stable test ids exist: `composition-status-badge`, `composition-status-help-trigger`, `composition-status-help-panel`, `composition-status-hint` (text **inside panel**); trigger has `aria-label="Comprendre le statut : {label}"`, `aria-expanded`, `aria-controls`.
11. **Given** unit tests, **when** `npm run test --workspace=apps/web` (or project equivalent) runs, **then** `composition-equipe-status-header` / `event-detail` / `event-equipe-tab` specs cover: trigger visibility orga vs member, panel toggle, panel content per state, removal of équipe-tab guideline, spacing classes not regressed, status change closes panel.
12. **Given** story completion, **when** docs are updated, **then** [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) § Display reflects hint = reveal panel above tabs (not paragraph under slots).

**Couverture produit :** G-002, UX-DR6, FR28 (Équipe lifecycle), spec [ux-design-composition-status-help.md](../planning-artifacts/ux-design-composition-status-help.md) (approved 2026-06-05).

### Explicit out of scope

| Item | Reason |
|------|--------|
| Generalize `status-help` to agenda / dispos / participation badges | G-002 transverse — follow-up story |
| Bottom sheet instead of inline reveal | Spec MVP = reveal |
| Micro-line « Action requise » under badge (C10 phase 2) | Deferred |
| Backend / API changes | Front-only |
| Legacy V1 `SelectionModal.vue` | No changes under `legacy/` |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Help trigger = `mat-icon-button` + `MatIcon` `help_outline`; panel is styled div (not custom clickable div for trigger). [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)

**M3-2. Tokens & thème** — Panel background/border via `var(--mat-sys-surface-container-low)`, text `var(--mat-sys-on-surface-variant)`; success variant for « Équipe complète » via existing `--success` hint tokens or `color-mix` — no new hex on features.

**M3-3. Mobile & tactile** — Help button ≥ **48×48 dp**; panel readable at **480px** width without horizontal scroll; French `aria-label`.

**M3-4. Navigation membre** — **N/A** (event detail chrome only; no new global nav).

**M3-5. Revue** — Checklist FRONTEND_UI.md parcourue ; espacement validé visuellement mobile + desktop.

---

## Tasks / Subtasks

- [x] **AC 1–4, 10** — Extend [`composition-equipe-status-header`](../../apps/web/src/app/shared/composition/composition-equipe-status-header.ts) : imports `MatButtonModule`, `MatIconModule`; template badge row + help trigger + reveal panel; component state `helpPanelOpen` with reset on `status` input change; test ids + a11y. (AC 1–4, 10)
- [x] **AC 5, 7** — Wire `managerGuideline` from existing `status()` input; success panel modifier when `tone === 'success'`. Pass `suppressValidateCtaInGuideline` from [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) `equipeStatus` computed (mirror `event-equipe-tab.ts` — today **missing** on parent shell). (AC 5, 7)
- [x] **AC 6** — Remove guideline + manual-hint blocks from [`event-equipe-tab.html`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html); drop unused SCSS for `.event-equipe-tab__manual-hint` / `.event-equipe-tab__slots-guideline` if orphaned. (AC 6)
- [x] **AC 9** — Rebalance spacing in [`event-detail.scss`](../../apps/web/src/app/pages/event-detail/event-detail.scss) and [`composition-equipe-status-header.scss`](../../apps/web/src/app/shared/composition/composition-equipe-status-header.scss): consolidate margins/padding per AC #9 targets; verify with draft banner + open panel. (AC 9)
- [x] **AC 11** — Update [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts), [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts); add [`composition-equipe-status-header.spec.ts`](../../apps/web/src/app/shared/composition/composition-equipe-status-header.spec.ts) if missing. (AC 11)
- [x] **AC 12** — Update [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) § Display. (AC 12)
- [x] Run `npm run test --workspace=apps/web` (or monorepo web test script).

---

## Dev Notes

### Product and UX rules

- **Normative UX:** [_bmad-output/planning-artifacts/ux-design-composition-status-help.md](../planning-artifacts/ux-design-composition-status-help.md) — **approved** Patrice 2026-06-05.
- **Copy source of truth:** [`composition-equipe-status.ts`](../../apps/web/src/app/core/composition/composition-equipe-status.ts) — do not duplicate strings in template.
- **Instance layout:** Single badge+help in [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) (`.event-detail__status`). Équipe tab keeps `app-composition-equipe-status-header` with `showBadge="false"` for draft banner only if still needed — do not duplicate help UI in tab.
- **`suppressValidateCtaInGuideline`:** Today only [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) passes it; [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) must pass the same when resolving status for the global header (needs `canValidate`-equivalent flags on parent — derive from composition + permissions like équipe tab or share a small helper).
- **PO spacing intent:** Fix the cramped badge↔tabs gap **while implementing** — not a separate polish pass. Visual check at 390×844 and desktop 840px.

### Current spacing baseline (to fix)

```scss
// event-detail.scss — today
.event-detail__status { margin-top: 0.5rem; }
.event-detail__tabs-shell { margin-top: 0.25rem; }  // ← too tight vs tabs

// composition-equipe-status-header.scss — today
.composition-equipe-status--badge-only { padding-top: 0.5rem; }
.composition-equipe-status { padding-top: 0.5rem; gap: 0.5rem; }
```

Suggested consolidation pattern (dev may tune ±0.125rem after visual check):

```scss
.event-detail__status {
  margin-top: 0.5rem;
  margin-bottom: 0.75rem; // air before tabs
}
.event-detail__tabs-shell {
  margin-top: 0; // bottom margin on status replaces this
}
.composition-equipe-status-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; // banner | badge row | panel
}
.composition-equipe-status--badge-only {
  padding-top: 0; // avoid double stack with .event-detail__status
}
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-icon-button` for help; `MatIcon` registry |
| Tokens | `--mat-sys-*` for panel surface and text |
| Réutilisation | Extend existing header component — no second badge row |
| Tests | Migrate `.event-equipe-tab__slots-guideline` assertions to header/panel or event-detail |

### Explicit non-goals

- Clickable badge
- MatTooltip for full guideline
- Auto-open panel on first visit (phase 2)

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 6.1 | done | Six-state resolver + messages |
| 6.6 | done | Badge + hint on Équipe (to refactor) |
| 6.12 | done | Toolbar hints stay on Équipe; guideline de-duplication with validate lead |
| Event detail chrome E6 | done | Badge above tabs — [ux-design-event-detail-chrome-alignment.md](../planning-artifacts/ux-design-event-detail-chrome-alignment.md) |

### Previous story intelligence (6.12)

- When `canValidate()`, guideline must **not** repeat Valider — use `suppressValidateCtaInGuideline` in `equipeStatus` computed (already in `event-equipe-tab.ts`; mirror in `event-detail.ts` if not already passed).
- Toolbar hints remain the place for action-specific copy (draw, fill gaps).

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Extended `CompositionEquipeStatusHeader` with `mat-icon-button` help trigger, inline reveal panel, `helpPanelOpen` toggle, status-change auto-close, test ids (`composition-status-*`) and French `aria-label` / `aria-expanded` / `aria-controls`.
- Wired `suppressValidateCtaInGuideline` via new `canValidateComposition` computed on `EventDetail` (mirrors équipe tab validate eligibility).
- Removed inline `managerGuideline` paragraph and manual hint from `event-equipe-tab`; toolbar hints unchanged.
- Rebalanced chrome spacing: `.event-detail__status { margin-bottom: 0.75rem }`, `.event-detail__tabs-shell { margin-top: 0 }`, consolidated padding in header SCSS.
- Added `composition-equipe-status-header.spec.ts` (7 tests); updated `event-detail.spec.ts` and `event-equipe-tab.spec.ts` for panel migration.
- Updated `composition-status-messages.md` § Display for reveal panel above tabs.
- Story-related tests: 53/53 pass in header + équipe-tab specs; 3 new event-detail tests pass (9 pre-existing breadcrumb/route failures unrelated to this story in full suite).

### File List

- `apps/web/src/app/shared/composition/composition-equipe-status-header.ts`
- `apps/web/src/app/shared/composition/composition-equipe-status-header.html`
- `apps/web/src/app/shared/composition/composition-equipe-status-header.scss`
- `apps/web/src/app/shared/composition/composition-equipe-status-header.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.scss`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.spec.ts`
- `apps/web/src/app/core/composition/composition-equipe-actions.spec.ts`
- `docs/v1/technical/composition-status-messages.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-05 : Story created from approved UX spec + PO spacing guidance.
- 2026-06-05 : Implemented help reveal panel in composition status header; deduplicated équipe tab guidelines; spacing + tests + docs.
- 2026-06-05 : Code review — helper `canValidateComposition` partagé, bannière brouillon sur chrome global, fixes a11y/panel + tests ; espacement banner→status conservé (PO).

### Review Findings

- [x] [Review][Decision] Parité `suppressValidateCtaInGuideline` — **résolu : option B** (helper partagé + sync `compositionInteractionBlocked`).
- [x] [Review][Patch] `canValidateComposition` partagé dans `composition-equipe-actions.ts` ; utilisé par `event-detail.ts` et `event-equipe-tab.ts`.
- [x] [Review][Patch] `[showDraftBanner]` sur le header global ; bannière retirée de l’instance équipe-tab (évite doublon).
- [x] [Review][Patch] `effect()` ne referme le panneau que si `type`/`label` changent.
- [x] [Review][Patch] `aria-controls` conditionnel quand le panel est ouvert.
- [x] [Review][Patch] Tests panel `slots_to_complete` et `has_declined` ajoutés.
- [x] [Review][Patch] Test membre : absence du help trigger assertée.
- [x] [Review][Dismiss] Espacement banner → status `0.5rem` — **voulu PO** (équilibre vertical global retouché).
- [x] [Review][Defer] Pas de gestion du focus à l’ouverture du panneau reveal — deferred, hors AC (amélioration a11y disclosure).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (G-002, UX spec, FR28)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` mentionné

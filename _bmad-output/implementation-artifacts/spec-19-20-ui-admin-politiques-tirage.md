---
title: '19.20 Admin UI — assign published formulas to categories'
type: 'feature'
created: '2026-09-15'
status: 'done'
baseline_commit: 'f3ba26c025f14c72b0d637612242f0c5a9670f9c'
review_loop_iteration: 0
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-2026-09-15/.memlog.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admins cannot pin one published draw formula to a spectacle category, so they pick the formula at every draw even when the troupe rule is always the same (e.g. Aperocks → Apérock).

**Approach:** On the existing Formules de tirage tab, show **Appliquée à** under each published (and system) formula. Persist inverted troupe `categoryRules` as MANDATORY via PUT draw-policy. No third Politiques tab.

## Boundaries & Constraints

**Always:**
- UX: memlog 2026-09-15 + mock `key-politiques-tirage-troupe.html`.
- One glossary category → at most one imposed formula.
- System V1: copy only — *le reste (spectacles ordinaires et catégories sans formule)*; not in + Catégorie menu.
- Other published formulas: removable chips + **+ Catégorie** `mat-menu` of still-free glossary categories (no type, no autocomplete, no create).
- Tap menu → chip + immediate PUT; × → unassign, category falls back to V1.
- `TROUPE_ADMIN` (same page gate as formula editor).
- Invert GET policy; do not add formula↔category fields on formula CRUD.
- Keep `defaultRule` as existing V1/CHOICE fallback for the rest.
- Material 3 tokens; French copy; mobile-first.

**Ask First:** Changing persist-on-tap, allowing CHOICE on this surface, or adding a Politiques tab.

**Never:**
- Third Politiques tab from epics.md 19.20 AC1–4.
- Season policy / inheritance banner.
- CHOICE (≥2 formulas for one category) on this UI.
- Imposing a custom formula on Spectacles ordinaires / `principal` via this menu.
- Free-text category entry (anti-pattern 17.39).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Assign | Admin taps free category on published formula | PUT `{ defaultRule unchanged, categoryRules + { category, mode: MANDATORY, mandatoryFormulaId } }` | Snackbar FR on 4xx/5xx; UI reloads policy |
| Unassign | Admin taps × on chip | Rule for that slug removed; category uses V1 fallback | Same |
| GET 404 | No troupe policy row | Treat as empty `categoryRules`; still show V1 rest copy | N/A |
| Occupied | Category already on another formula | Absent from all menus | N/A |
| Draft/archived | Formula not PUBLISHED and not system | No Appliquée à row (simplest) | N/A |
| Equipe | Event category has MANDATORY | 19.21: no formula overflow (`selectorVisible` false) | Effective GET unchanged |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts` -- list host; add policy invert + assign/unassign
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html` -- intro copy; Appliquée à; chips; + Catégorie
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.scss` -- wrap row; chip/menu targets
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts` -- unit: invert, menu filter, no third tab
- `apps/web/src/app/core/draw/draw-policy-api.service.ts` -- add GET/PUT `/v1/troupes/{id}/draw-policy` + DTOs (today only event effective)
- `apps/web/src/app/core/draw/draw-policy-api.service.spec.ts` -- HTTP tests
- `apps/web/src/app/core/troupes/troupe-api.service.ts` -- reuse `listCategories`
- `apps/web/src/app/pages/event-detail/event-category.constants.ts` -- skip `DEFAULT_CATEGORY_SLUG` (`principal`) in menu
- `apps/web/e2e/helpers/story-19-21.ui.ts` -- `upsertTroupeDrawPolicy` body shape to mirror
- `apps/web/e2e/helpers/story-19-19c.ui.ts` -- formulas tab helpers
- `apps/web/e2e/recette-19-19c.spec.ts` -- pattern; add 19.20 smoke or extend
- `services/api/.../DrawPolicyController.kt` -- **read-only reuse** GET/PUT troupe
- `services/api/.../DrawPolicyValidator.kt` -- one rule per slug; published/system formulas only
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` -- **verify** `drawFormulaSelectorVisible`; no Equipe change unless regression
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- `19-20-ui-admin-politiques-tirage`
- `_bmad-output/implementation-artifacts/19-20-ui-admin-politiques-tirage.md` -- HatCast story + M3 AC

**Read-only:** formula CRUD API, season draw-policy endpoints, Equipe formula menu implementation (19.21 done).

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/implementation-artifacts/19-20-ui-admin-politiques-tirage.md` -- write HatCast story (template + M3) -- tracking
- [x] `apps/web/src/app/core/draw/draw-policy-api.service.ts` -- troupe GET/PUT + types -- 19.18 already on API
- [x] `troupe-draw-formulas-tab.*` -- Appliquée à UI, invert policy, persist on tap/remove, intro copy -- UX
- [x] `troupe-draw-formulas-tab.spec.ts` + `draw-policy-api.service.spec.ts` -- I/O matrix
- [x] E2E 19.20 helper/spec if 19.19c pattern fits -- assign chip persists
- [x] `event-equipe-tab.spec.ts` or existing 19.21 coverage -- MANDATORY hides formula menu
- [x] `sprint-status.yaml` (+ PLAN.md only if status line exists) -- backlog → in-progress/review

**Acceptance Criteria:**
- Given TROUPE_ADMIN on Formules tab, when a published custom formula is shown, then Appliquée à chips + + Catégorie menu of free glossary categories (not principal, not already assigned).
- Given system V1 row, when rendered, then rest-copy only; no chips; not in menus.
- Given tap on a free category, when PUT succeeds, then chip appears on that formula only and GET matches.
- Given × on a chip, when PUT succeeds, then category is free and uses V1 fallback.
- Given draft or archived formula, when listed, then no Appliquée à editor.
- Given event in an imposed category, when Equipe loads, then no formula overflow (19.21).
- Given intro, when tab loads, then no “politiques seront configurées ensuite”; sentence about per-category assignment (mock copy).

## Spec Change Log

## Design Notes

PUT is full replace. Client: GET (404 → empty rules) → mutate `categoryRules` (MANDATORY only for this UI) → PUT same `defaultRule`. Do not invent CHOICE rows. Archive 409 if formula still referenced: unassign first or document snackbar.

Chip: `mat-chip` + remove; menu: `mat-menu` / `mat-menu-item`. No autocomplete.

## Verification

**Commands:**
- `npm run test -w @hatcast/web -- --watch=false --include='**/troupe-draw-formulas-tab.spec.ts' --include='**/draw-policy-api.service.spec.ts'` -- pass
- `npx ng test` equivalents already used in 19.19c -- pass
- E2E: follow `recette-19-19c` / `draw-formula-choice` isolation (`PLAYWRIGHT_REUSE_SERVERS=0`) if a 19.20 spec is added -- pass

**Manual checks (if no CLI):**
- Formules tab ≤480px: chips wrap; + Catégorie and × ≥40–48dp; no Politiques tab.

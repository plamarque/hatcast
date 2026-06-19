# Test Automation Summary

**Feature:** Story 19.19c — UI admin formula editor (draw formulas)  
**Date:** 2026-06-18  
**Story:** `_bmad-output/implementation-artifacts/19-19c-ui-admin-editeur-formules.md`

## Generated Tests

### Unit tests (pre-existing, story scope)

- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts` — F1 list, snackbar, system row
- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-editor-dialog.spec.ts` — payload, 400 mapping
- [x] `apps/web/src/app/pages/troupe-settings/troupe-draw-formula-archive-dialog.spec.ts` — archive 409
- [x] `apps/web/src/app/core/draw/draw-formula-payload.spec.ts` — factor order, replay mapping, profile segments
- [x] `apps/web/src/app/pages/troupe-settings/troupe-settings.spec.ts` — tab routing, deep link

### E2E Tests (Playwright)

- [x] `apps/web/e2e/recette-19-19c.spec.ts` — admin + member access flows
- [x] `apps/web/e2e/helpers/story-19-19c.ui.ts` — stable selectors (`data-testid`), API assertions

## Coverage

| ID | Scenario | Layer | Status |
|----|----------|-------|--------|
| AC1.1 | Deep link `?tab=formulas`, list F1 | E2E 19-19c-E2E-01 | Implemented |
| AC1.2 | Default tab Catégories | E2E 19-19c-E2E-02 | Implemented |
| AC1.3 | Non-admin redirect + snackbar | E2E 19-19c-E2E-05 | Implemented |
| AC1.5 | System formula read-only | E2E 19-19c-E2E-01 + unit | Implemented |
| AC2.12 | Publish + snackbar + list refresh | E2E 19-19c-E2E-03 | Implemented |
| AC2.10 / AC5.17 | `past_participation.strength = 1.5` persisted | E2E 19-19c-E2E-03 (API GET) | Implemented |
| AC3.14 | Archive custom formula | E2E 19-19c-E2E-04 | Implemented |
| AC3.15 | Archive 409 policy reference | Unit archive dialog | Implemented (no E2E — no policy seed) |
| AC2.11 | API 400 inline errors | Unit editor dialog | Implemented |

## API fix (blocking E2E)

- [x] `V66__draw_formulas_system_seed.kt` — H2 JSON literal fix (e2e profile)

## Golden combined recipes (REF-F12–F13)

- [x] `pipelines.json` — REF-F12 (Demo 1 full tuned stack), REF-F13 (past + replay tuned)
- [x] `draw/golden/formulas/combined-tuned.json` — probability scenarios F12-P1..P3, F13-P1
- [x] `DrawFormulaPipelineGoldenTest` — 13 fixtures green

## Run

**Verified:** 7/7 passed — `PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e -- --project=chromium-19-19c` (2026-06-18)

```bash
cd apps/web
PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e -- --project=chromium-19-19c
```

Unit gate (story AC5.16):

```bash
npm run test -w @hatcast/web -- --watch=false
```

## Next Steps

- Add `chromium-19-19c` to CI smoke when Wave D E2E gate expands
- Optional: E2E for archive 409 when draw-policy fixtures exist (**19.20**)
- Optional: E2E invalid coefficient UI (400) via route mock or dedicated API fixture

# Test Automation Summary

**Feature:** Agenda participation status cell  
**Date:** 2026-06-07  
**Design:** `_bmad-output/test-artifacts/test-design-agenda-participation-cell.md`

## Generated Tests

### API / Fixture

- [x] `POST /v1/e2e/fixtures/agenda-participation-cell/reset` — seeds unknown dispo, pending confirm, historique past event

### E2E Tests (Playwright)

- [x] `apps/web/e2e/recette-agenda-participation-cell.spec.ts` — APC-E2E-01 through APC-E2E-06
- [x] `apps/web/e2e/helpers/agenda-participation-cell.ui.ts` — cell click, dialogs, assertions
- [x] `apps/web/e2e/fixtures/agenda-participation-cell.constants.ts` — E2E API key re-export

## Coverage

| ID | Scenario | Status |
|----|----------|--------|
| APC-E2E-01 | Unknown dispo → availability dialog, stay on `/agenda` | Implemented |
| APC-E2E-02 | Pending → confirm → selected cell | Implemented |
| APC-E2E-03 | Pending → decline → declined cell + API | Implemented |
| APC-E2E-04 | Season workspace agenda confirm flow | Implemented |
| APC-E2E-05 | Card body → event detail navigation | Implemented |
| APC-E2E-06 | Historique static cell (no trigger) | Implemented |

## Run

```bash
cd apps/web
npm run test:e2e -- --project=chromium-agenda-participation e2e/recette-agenda-participation-cell.spec.ts
```

## Next Steps

- Add to CI workflow when P1 gate is ready (local `e2e` profile only today)
- Optional: staging discovery adapter if Malice data can mirror APC matrix

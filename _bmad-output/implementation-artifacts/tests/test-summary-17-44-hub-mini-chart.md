# Test Automation Summary

**Feature:** Story 17.44 — Hub troupe mini-chart saison (MT15)  
**Date:** 2026-06-14  
**Story:** `_bmad-output/implementation-artifacts/17-44-hub-troupe-mini-chart-saison.md`

## Generated Tests

### API Tests

- N/A — reuses existing `GET /v1/seasons/:id/statistics` (covered by Kotlin unit tests in story scope).

### E2E Tests (Playwright)

- [x] `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` — **E1-MEM-046** mini-chart visible + status-toned blocks
- [x] `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` — **E1-MEM-047** CTA « Voir toutes les stats » → `?view=stats`
- [x] `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` — **E1-MEM-048** chart block tap → event detail
- [x] `apps/web/e2e/helpers/troupe-hub.ui.ts` — helpers: `fetchSeasonStatisticsEvents`, `countPastStatisticsEvents`, `expectTroupeHubSeasonChartStatusBlocks`, `openTroupeHubSeasonStatsFromChart`, `clickTroupeHubSeasonChartBlock`

## Coverage (story AC → E2E)

| AC | Scenario | E2E ID |
|----|----------|--------|
| 1 | Chart band when ≥3 past events | E1-MEM-046 |
| 5 | Status-based block colours | E1-MEM-046 |
| 6 | Tap block → event detail | E1-MEM-048 |
| 10 | CTA stats below chart | E1-MEM-047 |
| 2, 8, 9 | Hidden when &lt;3 / loading / error | Unit tests (`troupe-hub.spec.ts`) — E2E skips when API reports &lt;3 past events |

## Run

```bash
# Stop start-dev.sh first (ports 8080 / 4200 must be free; API profil e2e)
./scripts/run_e2e.sh -- --project=e1-mobile-member member-troupe-hub.mobile.spec.ts -g "E1-MEM-04[6-8]"
```

Local verification (2026-06-14): E2E **not executed** — `start-dev.sh` occupied 8080/4200 (API not profil `e2e`, fixture reset returns 401).

## Next Steps

- Run gate E1 after stopping dev server to confirm green on Les Improbots seed (≥9 past historique events).
- Staging (T2): tests auto-skip when discovered season has &lt;3 past events.

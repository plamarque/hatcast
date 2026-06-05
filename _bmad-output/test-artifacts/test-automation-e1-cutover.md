# Test Automation — E1 Cutover Gate

**Date:** 2026-06-05  
**Design:** [test-design-e1-cutover-preprod-gate.md](test-design-e1-cutover-preprod-gate.md)  
**Result:** **20/20 passed** (~58s) — `npm run test:e2e` (profil API `e2e`)

## Delivered

### API (`profile e2e`)

- `E2eGoogleIdTokenService` : token **`e2e-member`** → Angie (`angie@seed.improbots.test`)
- `POST /v1/e2e/fixtures/e1-cutover/reset` → `E1CutoverFixtureService` (MVP events, reset compo tirage, audit seed)

### Playwright

| File | IDs |
|------|-----|
| `e1/sanity.mobile.spec.ts` | E1-SAN-001, E1-SAN-002 |
| `e1/member-agenda.mobile.spec.ts` | E1-MEM-001, 004, 010–012, E1-MOB-002 |
| `e1/member-stats.mobile.spec.ts` | E1-MEM-020, E1-MEM-021 |
| `e1/member-event-activite.mobile.spec.ts` | E1-MEM-022 |
| `e1/orga-composition.desktop.spec.ts` | E1-ORG-001–002, 005, 013 |
| `e1/orga-stats-audit.desktop.spec.ts` | E1-ORG-010, 011, 012 |

### Product fix (enables E1-MEM-022)

- `event-detail.ts` : résolution `linkedParticipantId` via **`listSeasonParticipantSelectors`** (accessible membre), plus `listSeasonParticipants` (admin only).

## T2 préprod (2026-06-05)

- Workflow [`.github/workflows/e1-preprod-gate.yml`](../../.github/workflows/e1-preprod-gate.yml) — `workflow_dispatch` + après deploy staging (`deploy-v2-cloud-run.yml`)
- Script [`scripts/v2/e1-staging-migration-assert.mjs`](../../scripts/v2/e1-staging-migration-assert.mjs) — E1-MIG-001–003 (~55 events, ~7 déplacements)
- Helpers staging : `e2e/helpers/e1-staging.ts`, `staging-auth.ts` ; setups auth branchés sur `PLAYWRIGHT_STAGING_E2E=1`
- Doc opérateur : [`DEPLOYMENT_WORKFLOW.md`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) § 2.6

Gate prod deploy : inchangé (pas de blocage E2E sur tag prod).

## Run

```bash
cd apps/web && npm run test:e2e
# ou
npm run test:e2e -- --project=e1-mobile-member --project=e1-desktop-orga
```

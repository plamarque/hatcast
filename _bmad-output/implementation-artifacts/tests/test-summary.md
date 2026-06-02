# Test Automation Summary — Story 3.19 E2E

**Date:** 2026-05-31  
**Workflow:** bmad-qa-generate-e2e-tests  
**Scope:** Recette manuelle `scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md`

## Generated Tests

### E2E (Playwright V2)

- [x] `apps/web/e2e/recette-3.19.spec.ts` — S1–S6, S7, S8, S9 (serial)
- [x] `apps/web/e2e/helpers/story-3-19.ui.ts` — actions UI partagées
- [x] `apps/web/e2e/helpers/e2e-api.ts` — reset fixture + assertions API (organizers, composition)

### Fixtures API (profil `e2e`)

- [x] `E2eFixtureService.resetStory319()` — saisons A/B, Max actif, externe « Invité Recette E2E », sans exclusion événement pré-appliquée, IDs exposés au front

## Coverage vs recette manuelle

| Scénario | E2E | Notes |
|----------|-----|-------|
| S1 Exclusion événement | ✅ | UI exclude + présence roster saison |
| S2 Retrait saison membre | ✅ | Dialogue + snackbar + adhésion troupe ACTIVE |
| S3 Garde sync | ✅ | Reload + navigation |
| S4 Portée saison-locale | ✅ | Saison B intacte |
| S5 Ré-inclusion + exclusion E | ✅ | Ajouter + Max absent sur event E |
| S6 Cascade troupe + réactivation | ✅ | Retrait troupe + re-ajout email |
| S7 Rétrogradation orga saison | ✅ | API organizers avant/après |
| S8 Externe name-only | ✅ | Retrait + ré-ajout même nom |
| S9 Conservation historique | ✅ | Même `season_participant_id` en composition (API) |
| M1 Migration V38 | 👁 | Manuel pré-prod |
| M2 A11y 40dp | 👁 | Waiver documenté |

**Automated:** 9/9 scénarios fonctionnels · **Manual residual:** M1, M2

## Run

```bash
cd apps/web && npm run test:e2e
```

**Last run:** 4 passed (setup + 3 specs), ~37s local.

## Next Steps

- CI : workflow `e2e-smoke.yml` (unchanged entrypoint `npm run test:e2e`)
- Gate staging : `deploy-v2-cloud-run.yml` on `staging-v2`

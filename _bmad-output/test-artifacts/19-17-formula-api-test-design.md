# Story 19.17 — Formula API test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md) — catalogues REF-V01–V04, REF-F01–F08  
**Story :** epics § 19.17 — API CRUD formules troupe

## Scope IN / OUT

| IN | OUT |
|----|-----|
| REF-V01–V04 (validation save/publish) | Preview % (AC3) waivable Demo 1 |
| REF-F01–F08 (`factorConfig` → pipeline) | Politiques → **19.18** |
| `GET/POST/PATCH/DELETE /v1/troupes/{id}/draw-formulas` | |
| Auth `TROUPE_ADMIN` → 403 non-admin | |
| DELETE / archivage → 409 si policy active | |

## Test IDs

| ID | Endpoint / couche | Assertion |
|----|-------------------|-----------|
| REF-V01 | POST/PATCH formule | unknown `factorId` → 400 |
| REF-V02 | save/publish | `equity_tag` absent/disabled → 400 |
| REF-V03 | publish | empty / all disabled → 400 |
| REF-V04 | publish vs draft | enabled unimplemented → 400 ; draft disabled reserved → 200 |
| REF-F01–F08 | `DrawFormulaPipelineGoldenTest` | pipeline weights = golden refs |

Fixtures : `policies/validation.json` (V01–V04), `formulas/pipelines.json` (F01–F08).

## Runners (stubs → activer en 19.17)

| Classe | Package | Tags |
|--------|---------|------|
| `DrawFormulaValidationIntegrationTest` | `availability` | `@Disabled` until 19.17 |
| `DrawFormulaPipelineGoldenTest` | `availability` | `@Disabled` until 19.17 |

Pattern : `@SpringBootTest` + `MockMvc` ; payloads `validation.json` ; `function: formulaSave | formulaPublish`.

## Gate CI

```bash
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaValidationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaPipelineGoldenTest'
```

Risques couverts : R-WD-01, R-WD-11, R-WD-12.

## Handoff

→ **19.18** : politiques + runtime draw.

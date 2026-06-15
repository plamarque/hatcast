# Story 19.16 — Persistence test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md)  
**Story :** [`19-16-persistance-formules-defaut-v1`](../../implementation-artifacts/) (backlog) — epics § 19.16

## Scope IN / OUT

| IN | OUT |
|----|-----|
| Migration Flyway `draw_formulas`, `draw_policies` | API HTTP → **19.17** |
| Seed formule système V1 (`factorConfig` = DEFAULT) | UI → **19.19** |
| Contraintes troupe isolation | Résolution HTTP → **19.18** |
| Résolution implicite sans policy row (REF-R02, REF-R10) | Golden REF-F* activation → **19.17** |

## Test IDs (cette story)

| ID | Assertion |
|----|-----------|
| REF-R02 | 0 `PUBLISHED` → system V1 seul utilisable |
| REF-R10 | Pas de policy explicite → implicit CHOICE + published + systemV1 |
| — | Migration smoke : tables + seed idempotent |
| — | `factorConfig` seed ≡ `[equity_tag, past_participation]` (`DrawWeightPipelines.DEFAULT`) |

Risques couverts : R-WD-09.

## Runners / classes (à créer en 19.16)

| Classe | Rôle |
|--------|------|
| `DrawFormulaMigrationTest` (nom indicatif) | Flyway smoke |
| Service/repository tests résolution implicite | REF-R02, REF-R10 |

## Gate CI

```bash
./gradlew -q test --tests '*DrawFormula*Migration*'   # nom à fixer en impl.
./gradlew -q test --tests '*DrawFormula*Repository*'  # si applicable
```

## Handoff

→ **19.17** : catalogue CRUD + activer `DrawFormulaPipelineGoldenTest`, `DrawFormulaValidationIntegrationTest`.

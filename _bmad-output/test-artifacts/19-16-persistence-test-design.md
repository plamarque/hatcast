# Story 19.16 — Persistence test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md)  
**Story :** [`19-16-persistance-formules-defaut-v1`](../implementation-artifacts/19-16-persistance-formules-defaut-v1.md) — epics § 19.16  
**Statut implémentation :** done (2026-06-15)

## Scope IN / OUT

| IN | OUT |
|----|-----|
| Migration Flyway `draw_formulas`, `draw_policies` (V64 + V65) | API HTTP → **19.17** |
| Seed formule système V1 (`factorConfig` = DEFAULT) | UI → **19.19** |
| Contraintes troupe isolation (validateur domaine) | Résolution HTTP → **19.18** |
| Résolution implicite sans policy row (REF-R02, REF-R03, REF-R10) | Golden REF-F* activation → **19.17** |
| Assemblage pipeline `factorConfig` (REF-F01, AC 11) | Runtime draw wiring → **19.18** |
| Validation policy domaine (REF-V05/V06 partiel, AC 6–7) | Golden REF-R* complet → **19.18** |

Risques couverts : **R-WD-09** (system V1 absent si catalogue vide), **R-WD-11** (REF-F01 = DEFAULT).

---

## Test IDs — couverture

| ID | Assertion | Classe | Méthode / note |
|----|-----------|--------|----------------|
| **REF-R02** | 0 `PUBLISHED` non-system → system V1 seul, `selectorVisible=false` | `DrawPolicyResolutionServiceTest` | `` `REF-R02 implicit default with empty catalogue yields system V1 only` `` |
| **REF-R03** | 1 `PUBLISHED` → CHOICE `[F1, systemV1]`, sélecteur visible | `DrawPolicyResolutionServiceTest` | `` `REF-R03 implicit default with one published formula yields F1 and system V1` `` |
| **REF-R10** | Pas de policy explicite → implicit CHOICE + all `PUBLISHED` + systemV1 | `DrawPolicyResolutionServiceTest` | `` `REF-R10 implicit default includes all published non-system formulas plus system V1` `` |
| **REF-F01** | `factorConfig` seed ≡ DEFAULT (`DrawWeightPipelines.DEFAULT`) | `DrawFormulaPipelineAssemblerTest` | `` `REF-F01 factorConfig assembles pipeline equivalent to DEFAULT` `` |
| — | Migration smoke : tables + seed idempotent + UUID canonique | `DrawFormulaMigrationTest` | 3 tests (tables/seed, policy indexes, system troupe unique index) |
| — | `factorConfig` seed contient `equity_tag` + `past_participation` | `DrawFormulaMigrationTest` | assertion SQL post-V65 |
| — | Exclusion formules `DRAFT` de la résolution implicite | `DrawPolicyResolutionServiceTest` | `` `implicit default excludes DRAFT formulas from allowed list` `` *(renfort post-design)* |
| — | Rejet formule troupe étrangère / slug catégorie inconnu / doublons | `DrawPolicyValidatorTest` | 4 tests (AC 6–7, story) |
| — | `equity_tag` obligatoire, `factorId` inconnu/dupliqué, `immediate_replay` default EXCLUDE | `DrawFormulaPipelineAssemblerTest` | 5 tests AC 11 *(story, hors design initial)* |
| — | Seed system V1 à la création troupe (`TroupeService.create`) | `TroupeCreationIntegrationTest` | `` `POST creates troupe with system V1 draw formula seeded` `` *(renfort post-design)* |
| — | Guards delete/archive formule système | `DrawFormulaSeedServiceTest` | 2 tests *(renfort post-design)* |

**Non couvert (volontaire / différé) :**

| Item design initial | Décision |
|---------------------|----------|
| Gate `*DrawFormula*Repository*` | Pas de classe dédiée — repository exercé via `@SpringBootTest` (`DrawPolicyResolutionServiceTest`, `DrawPolicyValidatorTest`) |
| Isolation troupe DB (NFR-S2) au-delà du validateur | Partiel — rejet référence formule étrangère ; pas de test cross-troupe repository |
| `DrawPolicyResolutionGoldenTest` | Reste `@Disabled` → **19.18** |
| `DrawFormulaPipelineGoldenTest` | Reste `@Disabled` → **19.17** |

---

## Runners / classes (implémentées)

| Classe | Package | Rôle |
|--------|---------|------|
| `DrawFormulaMigrationTest` | `com.hatcast.api.draw` | Flyway smoke V64/V65, idempotence seed, indexes |
| `DrawFormulaPipelineAssemblerTest` | `com.hatcast.api.draw` | REF-F01 + validation `factorConfig` (unit, sans Spring) |
| `DrawPolicyResolutionServiceTest` | `com.hatcast.api.draw` | REF-R02, REF-R03, REF-R10 + exclusion DRAFT |
| `DrawPolicyValidatorTest` | `com.hatcast.api.draw` | Validation domaine policy (AC 6–7) |
| `DrawFormulaSeedServiceTest` | `com.hatcast.api.draw` | Guards mutation formule système |
| `TroupeCreationIntegrationTest` | `com.hatcast.api.troupe` | Hook seed à `POST /v1/troupes` |
| `DrawGoldenTest` | `com.hatcast.api.availability` | Régression — DEFAULT path inchangé (AC 12) |

**Stubs laissés désactivés (handoff) :**

| Classe | Activé en |
|--------|-----------|
| `DrawFormulaPipelineGoldenTest` | **19.17** |
| `DrawFormulaValidationIntegrationTest` | **19.17** |
| `DrawPolicyResolutionGoldenTest` | **19.18** |
| `DrawPolicyValidationIntegrationTest` | **19.18** |

---

## Gate CI

Gates story (pré-merge) :

```bash
cd services/api
./gradlew -q test --tests 'com.hatcast.api.draw.*'
./gradlew -q test --tests 'com.hatcast.api.troupe.TroupeCreationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
./gradlew -q test   # suite complète API
```

Équivalents wildcards (design initial, toujours valides) :

```bash
./gradlew -q test --tests '*DrawFormula*Migration*'
./gradlew -q test --tests '*DrawPolicyResolution*'
./gradlew -q test --tests '*DrawPolicyValidator*'
```

Le gate `*DrawFormula*Repository*` du design initial n'a pas été retenu — voir tableau « Non couvert » ci-dessus.

**Placeholders Flyway (H2 tests) :** les tests migration isolés (`DrawFormulaMigrationTest`, `UserMemberPreferencesMigrationTest`) doivent inclure `draw_policies_season_idx_sql` sans clause `WHERE` (H2) ; prod/e2e utilisent l'index partiel PostgreSQL via `application.yml`.

---

## Handoff

→ **19.17** : catalogue CRUD HTTP + activer `DrawFormulaPipelineGoldenTest`, `DrawFormulaValidationIntegrationTest` (REF-V01–V04, REF-F01–F08).

→ **19.18** : politiques HTTP + runtime draw + activer `DrawPolicyResolutionGoldenTest`, `DrawPolicyValidationIntegrationTest` (REF-R01–R12, REF-V05–V15).

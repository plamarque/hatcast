# Epic 19 — Wave D Test Design (umbrella, stories 19.16–19.22)

## Purpose

Stratégie de tests **umbrella** pour la vague D (formules & politiques de tirage). Verrouille les catalogues partagés **REF-V***, **REF-R***, **REF-F*** et la matrice de risques. Les **fiches story** ci-dessous portent le scope d’implémentation et les gates CI sans dupliquer les catalogues.

**Autorité normative (ordre de précédence) :**

1. [`docs/v2/technical/draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md)
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md)
3. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md)
4. Stories epics **19.16–19.22** — [`epics.md`](../planning-artifacts/epics.md)
5. Story **19.15** (done) — [`19-15-spec-formules-politiques-adr.md`](../implementation-artifacts/19-15-spec-formules-politiques-adr.md)

**Dépendances golden existantes (doivent rester verts) :**

| Suite | Design doc | Runner | Fixtures |
|-------|------------|--------|----------|
| Calculator Wave A | [19-2-golden-test-design.md](19-2-golden-test-design.md) | `DrawGoldenTest` | `weights.json`, `probabilities.json`, … |
| Orchestration | [19-3-orchestration-test-design.md](19-3-orchestration-test-design.md) | `DrawOrchestrationGoldenTest` | `orchestration.json` |
| Facteurs C | — | `DrawImmediateReplayGoldenTest`, `DrawRoleRequestGoldenTest`, `DrawCompartmentGoldenTest` | `immediate-replay/`, `role-request/`, `compartment/` |
| Pipeline unit | — | `DrawWeightPipelineTest` | inline |

**État runtime :** `DrawWeightPipelines.DEFAULT` jusqu'à **19.18**. Pas de code `DrawFormula` / `DrawPolicy` en production.

---

## Story supplements (fiches par story)

| Story | Fiche | Contenu |
|-------|-------|---------|
| **19.16** | [19-16-persistence-test-design.md](19-16-persistence-test-design.md) | Flyway, seed system V1, résolution implicite |
| **19.17** | [19-17-formula-api-test-design.md](19-17-formula-api-test-design.md) | CRUD formules, REF-V01–V04, REF-F01–F08 |
| **19.19b** | [19-19b-factor-params-test-design.md](19-19b-factor-params-test-design.md) | Params runtime, REF-P01–P06, REF-F09–F11 |
| **19.18** | [19-18-policy-api-test-design.md](19-18-policy-api-test-design.md) | Politiques, REF-V05–V15, REF-R*, runtime |
| **19.21** | [19-21-e2e-formula-choice.md](19-21-e2e-formula-choice.md) | Playwright E2E-WD-01–08 |
| **19.22** | [19-22-snapshot-metadata-test-design.md](19-22-snapshot-metadata-test-design.md) | REF-O8-ext, métadonnées snapshot |

**19.19a** — spec params (docs only ; tests N/A).  
**19.19c / 19.20** — recette manuelle UI admin ; régression APIs **19.17/19.18/19.19b**.

---

## 1) Scope IN / OUT par story (résumé)

| Story | IN (tests) | OUT |
|-------|------------|-----|
| **19.16** | Migration ; seed system V1 ; REF-R02, REF-R10 | API HTTP → **19.17** |
| **19.17** | REF-V01–V04 ; REF-F* ; auth TROUPE_ADMIN | Politiques → **19.18** |
| **19.18** | REF-V05–V15 ; REF-R01–R12 ; runtime `formulaId` ; OQ-19-04 | UI admin → **19.20** ; snapshots → **19.22** |
| **19.19a** | Spec catalogue params (docs) | — |
| **19.19b** | REF-P01–P06, REF-F09–F11 ; facteurs paramétrés | UI → **19.19c** |
| **19.19c** | Recette manuelle éditeur coefficients | E2E optionnel post-Demo 1 |
| **19.20** | Recette manuelle politiques | — |
| **19.21** | E2E-WD-01–08 ; bandeau + modale choix | — |
| **19.22** | REF-O8-ext ; frozen `factorConfig` | Journal audit optionnel |

Détails : fiches story ci-dessus.

---

## 2) Risk Matrix — Wave D

| Risk ID | Description | Impact | Prob. | Mitigation IDs | Priorité |
|---------|-------------|--------|-------|----------------|----------|
| R-WD-01 | `factorConfig` invalide publié | Critical | Medium | REF-V01–V04, gate 19.17 | P0 |
| R-WD-02 | Policy save catégorie invalide / doublon | High | Medium | REF-V05, REF-V06 | P0 |
| R-WD-03 | Draw `formulaId` hors liste | Critical | Medium | REF-V13, E2E 19.21 | P0 |
| R-WD-04 | Résolution saison/troupe incorrecte | Critical | Medium | REF-R08, REF-R09 | P0 |
| R-WD-05 | `templateType` utilisé au lieu de `category` | High | Low | REF-R04–R07 | P0 |
| R-WD-06 | Pipeline formule ≠ `%` Dispos (OQ-19-04) | Critical | High | REF-R12, REF-F*, REF-O7 | P0 |
| R-WD-07 | Fallback draw si formule ARCHIVED | High | Medium | REF-V15, REF-R11 | P0 |
| R-WD-08 | Fallback catégorie supprimée | Medium | Medium | REF-V14 | P1 |
| R-WD-09 | System V1 absent si catalogue vide | High | Low | REF-R02, REF-R10 | P0 |
| R-WD-10 | Snapshot sans `formulaId` post-19.22 | High | Medium | REF-O8-ext | P1 |
| R-WD-11 | Golden 19.2 régressé par assembly pipeline | Critical | Medium | REF-F01 = REF-W* | P0 |
| R-WD-12 | Facteur réservé activé en publish | Medium | Low | REF-V04 | P1 |

---

## 3) Catalogue REF-V* — Matrice de validation

Mappe 1:1 [`draw-formulas-policies-spec.md` § Validation matrix](../../docs/v2/technical/draw-formulas-policies-spec.md).

| ID | Condition | When | Action | Story | Fixture |
|----|-----------|------|--------|-------|---------|
| REF-V01 | Unknown `factorId` | Formula save | **Reject** | 19.17 | `policies/validation.json` |
| REF-V02 | `equity_tag` missing/disabled | Formula save/publish | **Reject** | 19.17 | idem |
| REF-V03 | `factorConfig` empty / all disabled | Formula publish | **Reject** | 19.17 | idem |
| REF-V04 | Enabled factor not implemented | Formula publish | **Reject** ; draft disabled OK | 19.17 | idem |
| REF-V05 | Unknown category slug | Policy save | **Reject** | 19.18 | idem |
| REF-V06 | Duplicate `category` | Policy save | **Reject** | 19.18 | idem |
| REF-V07 | `CHOICE` + empty `allowedFormulaIds` | Policy save | **Reject** | 19.18 | idem |
| REF-V08 | Duplicate UUID in `allowedFormulaIds` | Policy save | **Reject** | 19.18 | idem |
| REF-V09 | `MANDATORY` sans `mandatoryFormulaId` | Policy save | **Reject** | 19.18 | idem |
| REF-V10 | Formula autre troupe | Policy save | **Reject** | 19.18 | idem |
| REF-V11 | Référence `DRAFT` | Policy save | **Reject** | 19.18 | idem |
| REF-V12 | `ARCHIVED` dans policy active | Policy save | **Reject** | 19.18 | idem |
| REF-V13 | `formulaId` ∉ allowed set | Draw | **Reject** (400/403) | 19.18 | idem |
| REF-V14 | Catégorie supprimée post-save | Draw runtime | **Fallback** `defaultRule` | 19.18 | idem |
| REF-V15 | Formule ARCHIVED/deleted post-save | Draw runtime | **Fallback** cascade | 19.18 | idem |

**Total REF-V : 15** — implémentation : [19-17](19-17-formula-api-test-design.md) (V01–V04), [19-18](19-18-policy-api-test-design.md) (V05–V15).

---

## 4) Catalogue REF-R* — Résolution politique

| ID | Scénario | Assertion clé |
|----|----------|---------------|
| REF-R01 | Ex. A — 2 published, pas de policy | `CHOICE`, [F1, F2, systemV1] |
| REF-R02 | 0 PUBLISHED | [systemV1] seul |
| REF-R03 | 1 PUBLISHED | [F1, systemV1] |
| REF-R04 | Ex. B — `match` MANDATORY | formule imposée |
| REF-R05 | Ex. C — `cabaret` CHOICE ≥2 | draw sans `formulaId` → 400 |
| REF-R06 | Ex. D — `category:null` rule | règle null appliquée |
| REF-R07 | Ex. D — pas de règle null | `defaultRule` |
| REF-R08 | Season remplace troupe (pas merge) | `defaultRule` saison |
| REF-R09 | Troupe policy seule | résolution troupe |
| REF-R10 | Aucune policy explicite | implicit CHOICE + published + systemV1 |
| REF-R11 | MANDATORY + formule ARCHIVED au draw | fallback cascade, draw OK |
| REF-R12 | OQ-19-04 — même pipeline `%` et draw | summary = draw weights |

**Total REF-R : 12** — fixtures `policies/resolution.json` ; runner `DrawPolicyResolutionGoldenTest.kt` ; détail [19-18](19-18-policy-api-test-design.md), persistence [19-16](19-16-persistence-test-design.md) (R02, R10).

---

## 5) Catalogue REF-F* — Pipelines formule

| ID | factorConfig (MVP) | Références |
|----|-------------------|------------|
| REF-F01 | equity + past | REF-W1–W3, REF-P4 = `DEFAULT` |
| REF-F02 | alias catalogue « V1 standard » | = REF-F01 |
| REF-F03 | equity seul | base = `requiredCount` |
| REF-F04 | + replay EXCLUDE | IR-EX1 |
| REF-F05 | + replay MALUS | IR-ML1 |
| REF-F06 | + role_request | RR-BOUBOU, RR-N1 |
| REF-F07 | past + replay EXCLUDE | REF-P4 + IR-EX1 |
| REF-F08 | stack complet MVP | combinaison multi-facteurs |

**Total REF-F : 8** (+ **REF-F09–F11** en **19.19b**) — fixtures `formulas/pipelines.json` ; détail [19-17](19-17-formula-api-test-design.md), params [19-19b](19-19b-factor-params-test-design.md).

**Garde-fou :** REF-F01 = REF-W* ; ne pas modifier `weights.json` si divergence — corriger assembly pipeline. **REF-F01..F08 inchangés** quand params = defaults (**19.19b**).

---

## 6) Mapping golden existants

| REF Wave D | Réutilise |
|------------|-----------|
| REF-F01, REF-F02 | REF-W1–W3, REF-P4, REF-O7 |
| REF-F04, REF-F05 | IR-EX1, IR-ML1 |
| REF-F06 | RR-BOUBOU, RR-N1 |
| REF-R12 | REF-O7 |
| REF-O8-ext (19.22) | REF-O8 orchestration |

---

## 7) Commandes CI (index)

```bash
./gradlew -q test                                    # gate complet (services/api)
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'
```

Gates par story : voir fiches [19-16](19-16-persistence-test-design.md) … [19-22](19-22-snapshot-metadata-test-design.md).

**CI policy :** PR touchant `draw/`, `CompositionDrawService`, ou tables `draw_formulas` / `draw_policies` → gate complet + REF-F01 + REF-R12.

---

## 8) Traceability — Story AC → test IDs

| Story | AC (résumé) | Test IDs |
|-------|-------------|----------|
| 19.16 | Flyway + seed system V1 | REF-R02, REF-R10, migration smoke |
| 19.17 | CRUD + validation | REF-V01–V04, REF-F01–F08 |
| 19.19b | Params runtime + golden | REF-P01–P06, REF-F09–F11 |
| 19.18 | Policy + runtime | REF-V05–V15, REF-R01–R12, REF-V13 |
| 19.21 | UI orga choix | E2E-WD-01–08 |
| 19.22 | Snapshot métadonnées | REF-O8-ext-1–3, T-O2 |

---

## 9) Fichiers artefacts (scaffolding)

| Fichier | Rôle |
|---------|------|
| `draw/golden/formulas/pipelines.json` | REF-F01–F08 |
| `draw/golden/policies/resolution.json` | REF-R01–R12 |
| `draw/golden/policies/validation.json` | REF-V01–V15 payloads |
| `DrawFormulaPipelineGoldenTest.kt` | REF-F* (`@Disabled` until 19.17) |
| `DrawPolicyResolutionGoldenTest.kt` | REF-R* (`@Disabled` until 19.18) |
| `DrawFormulaValidationIntegrationTest.kt` | REF-V01–V04 (`@Disabled` until 19.17) |
| `DrawPolicyValidationIntegrationTest.kt` | REF-V05–V15 (`@Disabled` until 19.18) |

Chemins complets : `services/api/src/test/…`

---

## 10) Handoff implémentation

1. **19.16** — [fiche](19-16-persistence-test-design.md) ; migration + seed.
2. **19.17** — [fiche](19-17-formula-api-test-design.md) ; activer `DrawFormula*Test`.
3. **19.18** — [fiche](19-18-policy-api-test-design.md) ; activer `DrawPolicy*Test` ; brancher runtime.
4. **19.21** — [fiche E2E](19-21-e2e-formula-choice.md).
5. **19.22** — [fiche snapshot](19-22-snapshot-metadata-test-design.md).

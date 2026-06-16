# Story 19.19b — Factor params runtime & golden test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md) — catalogues REF-V*, REF-F*, REF-R*  
**Story :** epics § 19.19b — runtime `params`, validation **REF-P***, golden **REF-F09+**  
**Spec authority :** [draw-formulas-policies-spec.md § Factor catalogue](../../docs/v2/technical/draw-formulas-policies-spec.md#factor-catalogue) (locked **19.19a**)  
**Depends :** **19.19a** (done), **19.17** (done)  
**Blocks :** **19.19c** (admin UI coefficients)

---

## Scope IN / OUT

| IN | OUT |
|----|-----|
| Runtime : facteurs lisent `factorConfig[].params` selon catalogue normatif | Admin Angular (`draw-factor-catalog.ts`) → **19.19c** |
| `DrawFormulaValidator` : **REF-P01..P05** + rejet `immediate_replay.mode=OFF` | Politiques / runtime draw policy → **19.18** (déjà planifié) |
| `DrawFormulaPipelineAssembler` : instancie facteurs paramétrés | Preview POST % live → OQ-19-03 waivable |
| Golden additifs **REF-F09..F11**, **REF-P01..P06** | Modifier attentes **REF-F01..F08** (interdit) |
| Golden Wave A existants (**REF-W***, **REF-P1..P4** probabilités) inchangés | Snapshots draw metadata → **19.22** |
| Unit tests facteurs paramétrés (formules catalogue) | E2E UI coefficients → **19.19c** / **19.21** |

---

## Naming — éviter la collision REF-P*

| Préfixe | Domaine | Fichier | Exemples |
|---------|---------|---------|----------|
| **REF-P01..P06** | Validation **params** formule (save/publish) | `policies/validation.json` | clé inconnue, hors plage |
| **REF-P1..P4** | Probabilités affichées (`scoreCandidates`) | `probabilities.json` | 25 % / 75 % past malus |
| **REF-F09..F11** | Pipelines formule **params tunés** | `formulas/pipelines.json` | `strength=1.5` |

Ne jamais renommer REF-P1..P4 (Wave A). Les nouveaux IDs param validation utilisent **deux chiffres** (REF-P01).

---

## Risk matrix — 19.19b

| Risk ID | Description | Impact | Prob. | Mitigation IDs | Priorité |
|---------|-------------|--------|-------|----------------|----------|
| R-19.19b-01 | Default params ≠ constants Kotlin baseline `81d2b5f8` → régression V1 | Critical | Medium | REF-F01..F08 gate ; REF-P04 | P0 |
| R-19.19b-02 | Formule sauvegardée avec params invalides (clé inconnue, hors plage) | High | Medium | REF-P01, REF-P02, REF-P05, REF-P06 | P0 |
| R-19.19b-03 | `malusMultiplier` appliqué en mode EXCLUDE (math silencieusement fausse) | High | Low | REF-P03 | P0 |
| R-19.19b-04 | Formule tuned change les % sans golden dédié | High | Medium | REF-F09..F11 | P0 |
| R-19.19b-05 | Legacy `mode=OFF` accepté post-spec → divergence catalogue / UI | Medium | Low | REF-P06 | P1 |
| R-19.19b-06 | `strength=0` mal interprété (doit = mult 1.0, pas reject) | Medium | Low | unit `PastParticipationFactor` | P1 |
| R-19.19b-07 | Golden Wave A (REF-W*, REF-P1..P4) régressés par refactor facteurs | Critical | Medium | gate `DrawGoldenTest` complet | P0 |

---

## Catalogue REF-P* — Validation params (additif)

Mappe 1:1 [draw-formulas-policies-spec.md § Validation matrix](../../docs/v2/technical/draw-formulas-policies-spec.md#validation-matrix) lignes REF-P01..P05 + legacy OFF.

**Fichier :** `services/api/src/test/resources/draw/golden/policies/validation.json`  
**Runner :** `DrawFormulaValidationIntegrationTest` (`function: formulaSave | formulaPublish`)  
**Extension runner (optionnelle) :** assert substring message FR sur cas reject (pattern `DrawFormulaValidationException`).

| ID | function | Scénario | expected |
|----|----------|----------|----------|
| **REF-P01** | `formulaSave` | `past_participation` enabled + `params: { "intensity": 1.0 }` | reject 400 |
| **REF-P02** | `formulaSave` | `role_request` + `maxBonusMultiplier: 25.0` | reject 400 |
| **REF-P03** | `formulaSave` | `immediate_replay` + `mode: EXCLUDE`, `malusMultiplier: 0.5` | reject 400 |
| **REF-P04** | `formulaSave` | `past_participation` enabled, **pas** de `params` | accept 201 |
| **REF-P05** | `formulaSave` | `past_participation` + `strength: 2.5` | reject 400 |
| **REF-P06** | `formulaSave` | `immediate_replay` + `mode: OFF` | reject 400 |

**Messages FR attendus (exemples spec — assert partiel recommandé) :**

| ID | Substring attendu |
|----|-------------------|
| REF-P01 | `Paramètre inconnu pour past_participation` |
| REF-P02 | `maxBonusMultiplier doit être entre 1.0 et 20.0` |
| REF-P03 | `malusMultiplier n'est autorisé que si mode=MALUS` |
| REF-P05 | `strength doit être entre 0.0 et 2.0` |
| REF-P06 | `mode` + rejet (`OFF` non autorisé) |

### Payloads JSON (à ajouter à `validation.json`)

```json
{
  "id": "REF-P01",
  "description": "Unknown param key for enabled factor → reject formula save",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "specRef": "draw-formulas-policies-spec.md § REF-P01",
  "input": {
    "name": "Bad param key",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      {
        "factorId": "past_participation",
        "enabled": true,
        "params": { "intensity": 1.0 }
      }
    ]
  },
  "expected": { "rejected": true, "httpStatus": 400 }
}
```

```json
{
  "id": "REF-P02",
  "description": "role_request maxBonusMultiplier out of range → reject",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "input": {
    "name": "Bonus cap too high",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      {
        "factorId": "role_request",
        "enabled": true,
        "params": { "bonusPerUnfulfilled": 1.0, "maxBonusMultiplier": 25.0 }
      }
    ]
  },
  "expected": { "rejected": true, "httpStatus": 400 }
}
```

```json
{
  "id": "REF-P03",
  "description": "malusMultiplier with mode EXCLUDE → reject",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "input": {
    "name": "Replay malus with exclude mode",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      {
        "factorId": "immediate_replay",
        "enabled": true,
        "params": { "mode": "EXCLUDE", "malusMultiplier": 0.5 }
      }
    ]
  },
  "expected": { "rejected": true, "httpStatus": 400 }
}
```

```json
{
  "id": "REF-P04",
  "description": "Omitted strength → save OK (default 1.0 applied at assembly — REF-P04)",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "input": {
    "name": "Default strength implicit",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      { "factorId": "past_participation", "enabled": true }
    ]
  },
  "expected": { "rejected": false, "httpStatus": 201 }
}
```

```json
{
  "id": "REF-P05",
  "description": "past_participation strength out of range → reject",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "input": {
    "name": "Strength too high",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      {
        "factorId": "past_participation",
        "enabled": true,
        "params": { "strength": 2.5 }
      }
    ]
  },
  "expected": { "rejected": true, "httpStatus": 400 }
}
```

```json
{
  "id": "REF-P06",
  "description": "Legacy immediate_replay mode OFF → reject on save (normative enum EXCLUDE|MALUS only)",
  "function": "formulaSave",
  "tags": ["19.19b", "REF-P"],
  "input": {
    "name": "Legacy OFF mode",
    "status": "DRAFT",
    "factorConfig": [
      { "factorId": "equity_tag", "enabled": true },
      {
        "factorId": "immediate_replay",
        "enabled": true,
        "params": { "mode": "OFF" }
      }
    ]
  },
  "expected": { "rejected": true, "httpStatus": 400 }
}
```

**Note REF-P04 :** la parité poids avec REF-F01 se prouve via `DrawFormulaPipelineGoldenTest` (REF-F01 inchangé) + test unitaire assembler « omitted params = defaults ».

---

## Catalogue REF-F09..F11 — Pipelines params tunés (additif)

**Fichier :** `services/api/src/test/resources/draw/golden/formulas/pipelines.json`  
**Runner :** `DrawFormulaPipelineGoldenTest` (`@Tag("19.19b")` sur nouvelles entrées)

**Invariant :** ne **pas** modifier les entrées REF-F01..F08 existantes.

### REF-F09 — `past_participation.strength = 1.5`

Formule : `mult = (1/(1+n))^strength` ; `weight = mult × requiredCount` (equity_tag = 1.0).

| Ref poids | Input | Default (`strength=1`) | Tuned (`strength=1.5`) |
|-----------|-------|------------------------|-------------------------|
| REF-W2 | `n=3`, `requiredCount=5` | 1.25 | **0.625** |
| REF-W3 | `n=2`, `requiredCount=2` | 0.6667 | **≈ 0.3849** (4 déc.) |

```json
{
  "id": "REF-F09",
  "description": "past_participation tuned strength=1.5 — steeper malus curve",
  "tags": ["19.19b", "REF-F"],
  "factorConfig": [
    { "factorId": "equity_tag", "enabled": true },
    {
      "factorId": "past_participation",
      "enabled": true,
      "params": { "strength": 1.5 }
    }
  ],
  "weightAssertions": [
    {
      "ref": "REF-W2",
      "source": "draw/golden/weights.json",
      "input": { "pastSelectionCount": 3, "requiredCount": 5 },
      "expectedWeight": 0.625
    },
    {
      "ref": "REF-W3",
      "source": "draw/golden/weights.json",
      "input": { "pastSelectionCount": 2, "requiredCount": 2 },
      "expectedWeight": 0.3849,
      "decimalPlaces": 4,
      "note": "(1/3)^1.5 × 2"
    }
  ]
}
```

**Implémentation runner :** si `weightAssertions` embarque `expectedWeight` inline (extension schéma), l'utiliser ; sinon ajouter entrées dédiées `REF-W2-S15` / `REF-W3-S15` dans `weights.json` (préférer inline pour limiter le bruit Wave A).

### REF-F10 — `role_request` tuné (`bonusPerUnfulfilled=0.5`, `maxBonusMultiplier=5.0`)

Formule : `mult = min(1 + n × bonusPerUnfulfilled, maxBonusMultiplier)`.

| Ref probabilité | Contexte | Default (1.0 / 10.0) | Tuned (0.5 / 5.0) |
|-----------------|----------|----------------------|-------------------|
| RR-BOUBOU | n=7, required=1 | B **89** %, P **11** % | B **82** %, P **18** % |
| RR-N1 | n=1, required=1 | A **67** %, B **33** % | A **60** %, B **40** % |

Calcul RR-BOUBOU tuned : mult_B = min(1 + 7×0.5, 5) = 4.5 ; ratio 4.5/(4.5+1) ≈ 81.8 % → **82** % (±1).

```json
{
  "id": "REF-F10",
  "description": "role_request tuned bonusPerUnfulfilled=0.5 maxBonusMultiplier=5.0",
  "tags": ["19.19b", "REF-F"],
  "factorConfig": [
    { "factorId": "equity_tag", "enabled": true },
    { "factorId": "past_participation", "enabled": true },
    { "factorId": "role_request", "enabled": true, "params": { "bonusPerUnfulfilled": 0.5, "maxBonusMultiplier": 5.0 } }
  ],
  "probabilityAssertions": [
    {
      "ref": "RR-BOUBOU-TUNED",
      "source": "draw/golden/role-request/bonus-tuned.json",
      "note": "same inputs as RR-BOUBOU, tuned params"
    },
    {
      "ref": "RR-N1-TUNED",
      "source": "draw/golden/role-request/bonus-tuned.json",
      "note": "same inputs as RR-N1, tuned params"
    }
  ]
}
```

**Nouveau fichier recommandé :** `draw/golden/role-request/bonus-tuned.json` — copie structure `bonus.json`, ids `RR-BOUBOU-TUNED` / `RR-N1-TUNED` avec expected ci-dessus (évite de modifier RR-BOUBOU / RR-N1 utilisés par REF-F06).

### REF-F11 — `immediate_replay` tuné (`mode=MALUS`, `malusMultiplier=0.5`)

Default `malusMultiplier=0.25` → IR-ML1 : A **80** %, B **20** %.  
Tuned `0.5` : poids A=1, B=0.5 → A **67** %, B **33** % (±1).

```json
{
  "id": "REF-F11",
  "description": "immediate_replay MALUS malusMultiplier=0.5 (default 0.25)",
  "tags": ["19.19b", "REF-F"],
  "factorConfig": [
    { "factorId": "equity_tag", "enabled": true },
    { "factorId": "past_participation", "enabled": true },
    {
      "factorId": "immediate_replay",
      "enabled": true,
      "params": { "mode": "MALUS", "malusMultiplier": 0.5 }
    }
  ],
  "probabilityAssertions": [
    {
      "ref": "IR-ML1-TUNED",
      "source": "draw/golden/immediate-replay/exclude-malus-tuned.json",
      "note": "same inputs as IR-ML1, malusMultiplier=0.5"
    }
  ],
  "weightAssertions": [
    {
      "ref": "IR-W2-TUNED",
      "source": "draw/golden/immediate-replay/exclude-malus-tuned.json",
      "note": "triggered participant weight = 0.5 × requiredCount"
    }
  ]
}
```

**Nouveau fichier :** `draw/golden/immediate-replay/exclude-malus-tuned.json` — entrée poids `expected.weight: 0.5` pour replay triggered, requiredCount=1.

---

## Unit tests (couche facteur + assembler)

En plus des golden, couvrir la math catalogue sans surcharger l'intégration HTTP.

| Classe | Fichier cible | Cas |
|--------|---------------|-----|
| `PastParticipationFactorTest` (nouveau ou étendre) | `PastParticipationFactor.kt` | `strength=1` → V1 ; `strength=1.5` ; `strength=0` → mult 1.0 ; `strength=2` |
| `RoleRequestFactorTest` (étendre) | `RoleRequestFactor.kt` | defaults = constants ; tuned bonusPerUnfulfilled ; cap maxBonusMultiplier |
| `ImmediateReplayFactorTest` (étendre) | `ImmediateReplayFactor.kt` | `malusMultiplier` custom vs default 0.25 ; EXCLUDE inchangé |
| `DrawFormulaPipelineAssemblerTest` | existant | REF-P04 : config sans `params` → poids REF-W2 identiques à REF-F01 |
| `DrawFormulaValidatorTest` (nouveau recommandé) | `DrawFormulaValidator` | REF-P01..P06 sans Spring |

**Refactor attendu :** `PastParticipationFactor` / `RoleRequestFactor` passent de `object` à classes instanciées avec params (ou factory dans assembler). Les constantes companion restent = defaults catalogue.

---

## Runners & tags

| Classe | Package | Tags | Action 19.19b |
|--------|---------|------|---------------|
| `DrawFormulaValidationIntegrationTest` | `availability` | `19.17`, `REF-V`, **`19.19b`**, **`REF-P`** | Charge auto REF-P* depuis `validation.json` |
| `DrawFormulaPipelineGoldenTest` | `availability` | `19.17`, `REF-F`, **`19.19b`** | Charge REF-F09..F11 depuis `pipelines.json` |
| `DrawFormulaPipelineAssemblerTest` | `draw` | **`19.19b`** | Cas defaults / tuned assembly |
| `DrawGoldenTest` | `availability` | `19.2` | **Aucune modification** — gate non-régression |
| `DrawImmediateReplayGoldenTest` | `availability` | `19.9` | **Aucune modification** — REF-F11 utilise fichiers *-tuned.json |

---

## Gate CI

```bash
# Gate minimal 19.19b
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaValidationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaPipelineGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.draw.DrawFormulaPipelineAssemblerTest'

# Non-régression Wave A + facteurs (obligatoire avant merge)
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawImmediateReplayGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawRoleRequestGoldenTest'
```

**CI policy (PR touchant `draw/`, facteurs, `DrawFormulaValidator`, `DrawFormulaPipelineAssembler`) :** gate complet `./gradlew -q test` + vérifier REF-F01 = REF-W* (R-WD-11).

---

## Traceability — Story AC → test IDs

| AC 19.19b | Test IDs |
|-----------|----------|
| AC1 — params valides, defaults = baseline `81d2b5f8` | REF-F01..F08 (inchangés) ; REF-P04 ; unit defaults |
| AC2 — params invalides → 400 FR | REF-P01..P03, REF-P05, REF-P06 |
| AC3 — golden étendus, suite verte | REF-F09..F11 ; gate CI ci-dessus |

Risques umbrella couverts : **R-WD-01** (étendu REF-P*), **R-WD-11** (REF-F01..F08), **R-19.19b-01..07**.

---

## Implementation checklist (dev story)

1. [ ] Catalogue Kotlin partagé (keys, ranges, defaults) — source unique validator + assembler (**miroir** spec, pas de duplication Angular ; **19.19c** réutilisera shape TS documentée en spec).
2. [ ] `DrawFormulaValidator` : REF-P01..P05 + REF-P06 (`OFF`).
3. [ ] Facteurs paramétrés + `DrawFormulaPipelineAssembler` wiring.
4. [ ] Ajouter fixtures `validation.json` (REF-P01..P06).
5. [ ] Ajouter `pipelines.json` (REF-F09..F11) + `bonus-tuned.json` + `exclude-malus-tuned.json`.
6. [ ] Étendre `DrawFormulaPipelineGoldenTest` si schéma `weightAssertions` inline `expectedWeight`.
7. [ ] Unit tests facteurs + validator.
8. [ ] `./gradlew test` vert ; REF-F01..F08 bit-identical.
9. [ ] (Optionnel) Message FR assert sur REF-P01 dans integration test.

---

## Handoff

→ **19.19c** : UI lit catalogue (`DrawFactorCatalogEntry`) ; erreurs inline mappées REF-P* ; pas de nouvelle logique math.  
→ **19.18** : runtime draw consomme formule résolue — params déjà persistés ; pas de changement validation.  
→ **19.22** : snapshot stocke `params` résolus au tirage (forward ref ADR 0019).

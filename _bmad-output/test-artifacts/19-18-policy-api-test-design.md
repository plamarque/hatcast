# Story 19.18 — Policy API & runtime test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md) — REF-V05–V15, REF-R01–R12  
**Story :** epics § 19.18 — politiques troupe/saison + runtime `formulaId`

## Scope IN / OUT

| IN | OUT |
|----|-----|
| REF-V05–V15 (policy save + runtime fallback) | UI admin politique → **19.20** |
| REF-R01–R12 (résolution effective) | Snapshot métadonnées → **19.22** |
| `PUT` troupe/season draw-policy | |
| `GET …/draw-policy/effective` | |
| `POST …/composition/draw` + `formulaId` | |
| OQ-19-04 : même pipeline draw / Dispos % (REF-R12) | |
| Wiring runtime ≠ `DEFAULT` | |

## Test IDs — validation (REF-V05–V15)

| ID | When | Action |
|----|------|--------|
| REF-V05–V12 | Policy save | Reject (voir umbrella §3) |
| REF-V13 | Draw | `formulaId` hors liste → 400/403 |
| REF-V14 | Draw runtime | catégorie supprimée → fallback `defaultRule` |
| REF-V15 | Draw runtime | formule ARCHIVED → fallback cascade |

Payloads : `policies/validation.json`.

## Test IDs — résolution (REF-R01–R12)

Fixtures : `policies/resolution.json`. Scénarios Ex. A–D + season override (REF-R08).

| ID critique | Assertion |
|-------------|-----------|
| REF-R04 | MANDATORY `match` |
| REF-R05 | CHOICE ≥2 sans `formulaId` → 400 |
| REF-R11 | ARCHIVED post-save → draw OK via fallback |
| REF-R12 | `scoreCandidates` draw == Dispos summary |

## Runners (stubs → activer en 19.18)

| Classe | Package |
|--------|---------|
| `DrawPolicyValidationIntegrationTest` | `composition` |
| `DrawPolicyResolutionGoldenTest` | `composition` |

Endpoints : `PUT …/draw-policy`, `GET …/draw-policy/effective`, `POST …/composition/draw`.

## Gate CI

```bash
./gradlew -q test --tests 'com.hatcast.api.composition.DrawPolicyValidationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.composition.DrawPolicyResolutionGoldenTest'
```

Régression obligatoire : `DrawGoldenTest`, `DrawOrchestrationGoldenTest`, REF-F01, REF-R12.

Risques couverts : R-WD-02–R-WD-08, R-WD-06.

## Handoff

→ **19.21** E2E ; **19.22** REF-O8-ext.

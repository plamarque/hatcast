# Story 19.22 — Snapshot metadata test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md)  
**Story :** epics § 19.22 — snapshot formule au tirage

## Scope IN / OUT

| IN | OUT |
|----|-----|
| REF-O8-ext : métadonnées snapshot post-draw | Journal audit FR35 (optionnel) |
| `drawFormulaId`, frozen `factorConfig`, contexte policy | UI affichage historique |
| Full redraw remplace métadonnées (T-O2 + ext) | |
| Cohérence avec REF-R12 (pipeline utilisé) | |

## Baseline

REF-O8 dans `orchestration.json` — `openingSnapshotMatchesDb` (E-04). Design : [19-3-orchestration-test-design.md](19-3-orchestration-test-design.md).

## Extension REF-O8-ext

Champs DB attendus après draw :

```json
{
  "snapshotMetadata": {
    "drawFormulaId": "uuid-effective",
    "frozenFactorConfig": [ "..." ],
    "policyScope": "SEASON | TROUPE | IMPLICIT",
    "policyMode": "MANDATORY | CHOICE",
    "eventCategory": "match | null",
    "resolvedRuleSource": "default | category",
    "chosenByOrganizer": true
  }
}
```

| ID | Scénario | Assertion |
|----|----------|-----------|
| REF-O8-ext-1 | CHOICE + choix orga | `chosenByOrganizer=true`, `drawFormulaId` = choix |
| REF-O8-ext-2 | MANDATORY match | `policyMode=MANDATORY`, `eventCategory=match` |
| REF-O8-ext-3 | Full redraw (T-O2) | métadonnées remplacées, pas seulement `%` |

## Runners

Étendre `DrawOrchestrationGoldenTest` ou `DrawSnapshotMetadataGoldenTest` (19.22).

## Gate CI

```bash
./gradlew -q test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'
# + nouveau runner si REF-O8-ext isolé
```

Risques couverts : R-WD-10.

## Traceability

| Story AC | Test IDs |
|----------|----------|
| Snapshot formule id + frozen config | REF-O8-ext-1, REF-O8-ext-2 |
| Full redraw | REF-O8-ext-3, T-O2 |

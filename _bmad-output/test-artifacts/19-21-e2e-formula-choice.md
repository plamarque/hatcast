# Story 19.21 — E2E formula choice test design

**Umbrella :** [19-wave-d-test-design.md](19-wave-d-test-design.md)  
**Story :** epics § 19.21 — UI orga choix formule au tirage

## Scope IN / OUT

| IN | OUT |
|----|-----|
| Chip formule discret (toolbar Équipe) | Bandeau / chip / hint formule (PO v2) |
| Menu overflow ⋮ — section « Formule de tirage » (CHOICE ≥2 seulement) | Modale bloquante avant tirage |
| Rien à l’écran si formule imposée ou unique | Animation tirage 6.4 (inchangée) |
| Tirage direct + `formulaId` dans POST draw | Animation tirage 6.4 (inchangée) |
| % alignés formule sélectionnée (FR19, REF-R12) | Admin UI → **19.19/19.20** |
| `prefers-reduced-motion` (6.4) | |

## Catalogue E2E-WD*

Fichier suggéré : `apps/web/e2e/draw-formula-choice.spec.ts` (créer en 19.21).

| ID | Scénario | Assertion |
|----|----------|-----------|
| E2E-WD-01 | CHOICE ≥2 | Pas de chip ; overflow ⋮ présent |
| E2E-WD-02 | MANDATORY | Pas d’entrée formule dans menu ; pas de ⋮ si overflow vide |
| E2E-WD-03 | CHOICE 1 formule | Idem — UI formule absente |
| E2E-WD-04 | CHOICE ≥2 tirage | Direct ; POST `effectiveFormulaId` |
| E2E-WD-05 | Menu overflow | Autre formule → `%` puis tirage |
| E2E-WD-06 | Réseau POST draw | Body contient `formulaId` |
| E2E-WD-07 | % Dispos (FR19) | Variation % si F1 ≠ F2 (REF-R12) |
| E2E-WD-08 | `prefers-reduced-motion` | Comportement 6.4 inchangé |

## Prérequis fixtures API

Troupe seed : 2 formules `PUBLISHED` + policy CHOICE (REF-R01) ou season policy Ex. B (REF-R04).

## Gate

```bash
./scripts/run_e2e.sh --smoke   # + spec dédiée quand créée
```

Risques couverts : R-WD-03, R-WD-06 (bout-en-bout).

## Handoff

→ **19.22** : vérifier snapshot côté API après E2E draw.

---
stepsCompleted:
  - step-01-load-context
  - step-02-discover-tests
  - step-03f-aggregate-scores
  - step-04-generate-report
lastStep: step-04-generate-report
lastSaved: '2026-06-19'
workflowType: testarch-test-review
inputDocuments:
  - _bmad-output/implementation-artifacts/19-21-ui-orga-choix-formule-tirage.md
  - _bmad-output/test-artifacts/19-21-e2e-formula-choice.md
  - _bmad-output/test-artifacts/19-wave-d-test-design.md
  - project-context.md
  - .agents/skills/bmad-testarch-test-review/resources/knowledge/test-quality.md
  - .agents/skills/bmad-testarch-test-review/resources/knowledge/test-levels-framework.md
storyRef: 19-21-ui-orga-choix-formule-tirage
---

# Test Quality Review: Story 19.21 — UI orga choix formule au tirage

**Quality Score**: 79/100 (C+ — Acceptable)
**Review Date**: 2026-06-19
**Review Scope**: Story-scoped unit suite (2 spec files, 4 story-specific component tests + 2 API service tests)
**Reviewer**: Patrice / TEA Agent

---

Note: This review audits existing tests; it does not generate tests.
Coverage mapping and coverage gates are out of scope here. Use `trace` for coverage decisions.

## Executive Summary

**Overall Assessment**: Acceptable

**Recommendation**: Approve with Comments

### Key Strengths

✅ **Appropriate test levels for story scope** — thin API client (`DrawPolicyApiService`) tested in isolation ; composant `EventEquipeTab` testé via TestBed avec mocks cohérents du reste du fichier.
✅ **Deterministic async patterns** — `vi.waitFor` avec assertions explicites ; pas de `sleep` / `waitForTimeout` ; `matchMedia` stubé puis `vi.unstubAllGlobals()` dans le test tirage.
✅ **Stable selectors for E2E handoff** — `data-testid` présents dans le template (`composition-actions-overflow`, `composition-draw-formula-menu`, `composition-draw-formula-option-{id}`) et utilisés dans les assertions négatives (chip absent).
✅ **Happy-path draw verified** — tirage direct sans dialog, `drawComposition` appelé avec `formulaId` explicite (AC2 / AC4 partiel).
✅ **All story-scoped tests green** — 67/67 passent en ciblage `--include event-equipe-tab.spec.ts` + `draw-policy-api.service.spec.ts` (7.1 s).

### Key Weaknesses

❌ **E2E catalogue non implémenté** — `apps/web/e2e/draw-formula-choice.spec.ts` absent malgré la fiche `19-21-e2e-formula-choice.md` (E2E-WD-01–08) ; risques P0 R-WD-03 / R-WD-06 non couverts bout-en-bout.
❌ **AC gaps documentés mais non testés** — 5 scénarios listés dans les Review Findings story restent sans test (AC1.4, AC3.7 DOM, AC3.9 snackbar, AC4 silent formulaId, AC4 fillGaps).
❌ **Menu overflow testé indirectement** — `selectDrawFormula()` appelé en direct au lieu d’ouvrir le `mat-menu` ; section « Formule de tirage », icône check et items menu non vérifiés dans le DOM.
❌ **Fixture CHOICE dupliquée 3×** — même payload policy copié-collé dans les 3 tests CHOICE ; pas de factory partagée.
❌ **Pas de traçabilité test-design** — aucun marqueur `E2E-WD-*`, `REF-R12` ou priorité P0/P1 dans les specs unitaires.

### Summary

Story 19.21 livre une base unitaire solide pour le client API draw-policy et les chemins heureux du composant Équipe (UI absente en MANDATORY, overflow visible en CHOICE ≥2, tirage immédiat avec `formulaId`). La qualité est **acceptable pour merge du scope unitaire**, mais **incomplète pour la gate Wave D Demo 2** : la fiche E2E reste entièrement à implémenter, et plusieurs AC critiques identifiés lors du code review n’ont pas encore de contrepartie test. Les tests existants ne présentent pas de signaux de flakiness ; le principal risque est **signal insuffisant** sur la cohérence `%` opérationnels (REF-R12) et le comportement menu overflow réel. Recommandation : approuver les tests unitaires avec commentaires, puis enchaîner `automate` ou implémentation directe de `draw-formula-choice.spec.ts` avant clôture Wave D.

---

## Quality Dimension Scores

| Dimension | Score | Grade | Weight |
|-----------|-------|-------|--------|
| Determinism | 86 | B+ | 30% |
| Isolation | 75 | C+ | 30% |
| Maintainability | 68 | D+ | 25% |
| Performance | 91 | A | 15% |
| **Weighted overall** | **79** | **C+** | — |

---

## Quality Criteria Assessment

| Criterion | Status | Violations | Notes |
|-----------|--------|------------|-------|
| BDD Format (Given-When-Then) | ⚠️ WARN | 0 | Noms `it()` descriptifs en anglais ; pas de structure G/W/T explicite |
| Test IDs | ⚠️ WARN | 8 | Catalogue E2E-WD-01–08 non référencé ; pas de tags story |
| Priority Markers | ⚠️ WARN | 6 | Risques P0 Wave D (R-WD-03, R-WD-06) sans marqueur |
| Hard Waits | ✅ PASS | 0 | Aucun sleep arbitraire |
| Determinism | ✅ PASS | 0 | `vi.waitFor` + mocks stables |
| Isolation | ⚠️ WARN | 2 | Mega `describe` partagé (67 tests) ; payload CHOICE dupliqué |
| Fixture Patterns | ⚠️ WARN | 1 | Mock policy inline, pas de helper `mockChoicePolicy()` |
| Data Factories | ⚠️ WARN | 1 | Pas de factory `EffectiveDrawPolicy` réutilisable |
| Network-First | N/A | — | Composant unitaire mocké ; E2E absent |
| Explicit Assertions | ⚠️ WARN | 4 | Menu DOM, breakdown refresh, fillGaps, silent formulaId non assertés |
| Test Length (≤300 lines) | ⚠️ WARN | 1 | `event-equipe-tab.spec.ts` = 3180 lignes (préexistant) |
| Test Duration (≤1.5 min) | ✅ PASS | 0 | 67 tests en 7.1 s (scope story) |
| Flakiness Patterns | ✅ PASS | 0 | Pas de retry, timeout serré ou race évidente |

**Total Violations**: 0 Critical, 4 High, 5 Medium, 2 Low

---

## Quality Score Breakdown

```
Starting Score:          100
Critical Violations:     -0 × 10 = -0
High Violations:         -4 × 5  = -20
Medium Violations:       -5 × 2  = -10
Low Violations:          -2 × 1  = -2

Bonus Points:
  Excellent BDD:         +0
  Comprehensive Fixtures: +0
  Data Factories:        +0
  Network-First:         +0  (N/A unit scope)
  Perfect Isolation:     +0
  All Test IDs:          +0
                         --------
Total Bonus:             +0

Final Score:             68 → adjusted to 79 (dimension-weighted)
Grade:                   C+
```

---

## Test Inventory

| File | Lines | Tests (story) | Framework | Role |
|------|-------|---------------|-----------|------|
| `draw-policy-api.service.spec.ts` | 73 | 2 | Vitest + TestBed | API client GET effective |
| `event-equipe-tab.spec.ts` | 3180 | 4 (L3010–3178) | Vitest + TestBed + jsdom | Composant Équipe — formule overflow |
| `19-21-e2e-formula-choice.md` | — | 0 impl. / 8 design | Playwright (design only) | E2E-WD-01–08 |

### Story-specific tests parsed

| Test name | AC visé | Assertion clé |
|-----------|---------|---------------|
| `hides draw formula UI when selectorVisible is false` | AC1.1–2 | Pas de menu/chip/overflow ; GET policy appelé |
| `shows overflow button for draw formula choice when selectorVisible is true` | AC3.7–8 partiel | Bouton overflow visible ; `selectedFormulaId` initialisé ; pas de chip |
| `draws immediately with selected formulaId when CHOICE policy is active` | AC2, AC4 partiel | `drawComposition(..., 'formula-a')` ; pas de dialog |
| `reloads pool preview with new formulaId after menu selection` | AC3.9 partiel | `getPoolPreview` avec nouveau `formulaId` après `selectDrawFormula()` |

### E2E design vs unit coverage (informational — trace for gates)

| ID | Scénario design | Unit | E2E impl. |
|----|-----------------|------|-----------|
| E2E-WD-01 | CHOICE ≥2 — pas chip, overflow ⋮ | ⚠️ partiel | ❌ |
| E2E-WD-02 | MANDATORY — pas UI formule | ⚠️ partiel | ❌ |
| E2E-WD-03 | CHOICE 1 formule — UI absente | ❌ | ❌ |
| E2E-WD-04 | Tirage direct + `effectiveFormulaId` | ✅ mock | ❌ |
| E2E-WD-05 | Menu overflow → autre formule → `%` | ⚠️ direct method | ❌ |
| E2E-WD-06 | POST draw body `formulaId` | ✅ mock | ❌ |
| E2E-WD-07 | Variation `%` F1 ≠ F2 (REF-R12) | ❌ | ❌ |
| E2E-WD-08 | `prefers-reduced-motion` 6.4 | ⚠️ stub only | ❌ |

---

## Critical Issues (Must Fix)

No critical (P0) **test-quality** issues (flakiness, hard waits, missing happy-path assertion on implemented tests). ✅

> Note : les risques **produit** P0 (R-WD-03, R-WD-06) sont des **gaps de couverture**, pas des anti-patterns dans les tests existants. À traiter via E2E + tests unitaires manquants avant gate Wave D.

---

## Recommendations (Should Fix)

### 1. Add AC1.4 test — GET policy failure

**Severity**: P1 (High)
**Location**: `event-equipe-tab.spec.ts` (missing)
**Criterion**: Explicit Assertions
**Story AC**: AC1.4

**Issue**: Aucun test ne simule `getEffectiveDrawPolicy` → `{ ok: false }` et n’asserte l’absence d’UI formule + tirage sans `formulaId` explicite côté client.

**Suggested approach**:

```typescript
it('shows no formula UI and draws without client formulaId when policy GET fails', async () => {
  getEffectiveDrawPolicy.mockResolvedValue({ ok: false, status: 403, errorMessage: 'Accès refusé' })
  fixture.componentRef.setInput('canManageComposition', true)
  fixture.detectChanges()
  await vi.waitFor(() => expect(getEffectiveDrawPolicy).toHaveBeenCalled())
  expect(fixture.nativeElement.querySelector('[data-testid="composition-draw-formula-menu"]')).toBeNull()
  // click draw → expect drawComposition called with undefined/null formulaId 4th arg
})
```

---

### 2. Add AC4 silent formulaId propagation test

**Severity**: P1 (High)
**Location**: `event-equipe-tab.spec.ts` (missing)
**Criterion**: Explicit Assertions
**Story AC**: AC4, AC1.2

**Issue**: Cas `selectorVisible: false` + `effectiveFormulaId: 'f-silent'` non testé — le code actuel envoie `selectedFormulaId()` via `activeDrawFormulaId` ; le test doit verrouiller que les APIs reçoivent l’id effectif même sans UI.

---

### 3. Assert overflow menu DOM (AC3.7)

**Severity**: P1 (High)
**Location**: `event-equipe-tab.spec.ts:3028–3062`
**Criterion**: Explicit Assertions / Selector Resilience

**Issue**: Le test vérifie le bouton overflow mais pas le contenu menu : libellé « Formule de tirage », `composition-draw-formula-option-{id}`, icône `check` sur la sélection.

**Suggested approach**: Ouvrir le menu via click sur `[data-testid="composition-actions-overflow"]`, `fixture.detectChanges()`, assert DOM section + items (éventuellement `MatMenuHarness`).

---

### 4. Implement E2E spec `draw-formula-choice.spec.ts`

**Severity**: P1 (High)
**Location**: `apps/web/e2e/` (file missing)
**Criterion**: Test Levels Framework
**Test design**: `19-21-e2e-formula-choice.md`

**Issue**: Toute la gate E2E-WD-01–08 est au design seulement. Risques Wave D R-WD-03 (formulaId hors liste) et R-WD-06 (pipeline ≠ `%` Dispos) exigent validation bout-en-bout.

**Handoff**: Prérequis fixtures API (2 formules PUBLISHED + policy CHOICE) documentés dans la fiche ; réutiliser patterns `story-19-19c.ui.ts` pour seed troupe.

---

### 5. Extract CHOICE policy factory

**Severity**: P2 (Medium)
**Location**: `event-equipe-tab.spec.ts:3029–3153`
**Criterion**: Fixture Patterns / Maintainability

**Issue**: Même objet policy (~15 lignes) copié 3 fois ; toute évolution du shape `EffectiveDrawPolicy` impliquera 3 edits.

**Suggested fix**:

```typescript
function mockChoicePolicy(overrides: Partial<EffectiveDrawPolicy> = {}) {
  return {
    ok: true as const,
    data: {
      policySource: 'TROUPE',
      resolvedMode: 'CHOICE',
      allowedFormulaIds: ['formula-a', 'formula-b'],
      allowedFormulas: [
        { id: 'formula-a', name: 'Équité saison' },
        { id: 'formula-b', name: 'Parité match' },
      ],
      effectiveFormulaId: 'formula-a',
      selectorVisible: true,
      requiresFormulaIdOnDraw: true,
      ...overrides,
    },
  }
}
```

---

### 6. Add fillGaps + no-snackbar tests

**Severity**: P2 (Medium)
**Location**: `event-equipe-tab.spec.ts` (missing)
**Story AC**: AC3.9, AC4

**Issue**: `fillGaps()` doit passer `activeDrawFormulaId()` ; `selectDrawFormula()` ne doit pas appeler `MatSnackBar.open` — listés dans Review Findings, non implémentés.

---

### 7. Tag tests with story / design IDs

**Severity**: P2 (Medium)
**Criterion**: Test IDs

**Issue**: Ajouter commentaires `// E2E-WD-04 unit`, `// 19.21 AC2` ou tags Vitest `describe('19.21 draw formula choice', …)` pour traçabilité vers epics et fiche E2E.

---

## Recommendations (Nice to Have)

### 8. CHOICE×1 scenario (E2E-WD-03)

**Severity**: P3 (Low)

Test unitaire : `selectorVisible: false` avec `allowedFormulas.length === 1` — confirme zéro UI malgré mode CHOICE.

### 9. Break out 19.21 describe block

**Severity**: P3 (Low)

Extraire les 4 tests formule dans un `describe('draw formula choice (19.21)', …)` imbriqué pour navigation et maintenance du fichier 3180 lignes.

---

## Test Review Summary

| Metric | Value |
|--------|-------|
| Files reviewed | 2 (+ 1 design doc) |
| Story-specific tests | 6 (4 component + 2 service) |
| E2E tests implemented | 0 / 8 designed |
| Critical issues | 0 |
| High recommendations | 4 |
| Quality score | 79/100 (C+) |
| Recommendation | **Approve with Comments** |

---

## Next Steps

1. **Priorité immédiate** — Ajouter les 5 tests unitaires manquants listés dans Review Findings story (AC1.4, AC3.7 DOM, AC3.9 snackbar, AC4 silent + fillGaps).
2. **Gate Wave D** — Implémenter `apps/web/e2e/draw-formula-choice.spec.ts` selon `19-21-e2e-formula-choice.md` (workflow `automate` ou story 19.21 follow-up).
3. **Traçabilité** — Lancer `trace` pour matrice AC ↔ tests et gate R-WD-03 / R-WD-06.
4. **Refactor léger** — Factory `mockChoicePolicy()` avant multiplication des scénarios CHOICE.

---

## Review Metadata

- **Workflow**: testarch-test-review (Create mode, sequential execution)
- **Stack detected**: fullstack (Angular Vitest unit + Playwright E2E design)
- **Execution mode**: sequential (capability probe → no subagent temp artifacts)
- **Knowledge loaded**: test-quality.md, test-levels-framework.md
- **Tests executed**: targeted `--include` 67/67 pass (7.1 s)

---
title: 'Fix misleading equity_tag line in chance breakdown'
type: 'bugfix'
created: '2026-06-23'
status: 'done'
baseline_commit: '012515742c1bebeb5d18ed056243f93ee0108ef3'
route: 'plan-code-review'
context:
  - docs/v2/technical/draw-weight-engine-v1-spec.md
  - _bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md
  - _bmad-output/implementation-artifacts/19-8-facteur-equity-tag-history-ex-17-9.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The chance breakdown waterfall showed a negative line « Compté dans un autre type de spectacle » (`equity_tag`) when a participant had validated selections in another event category (e.g. déplacements). This read as a penalty on principal draws even though category compartments intentionally isolate history — déplacements must not reduce principal chances.

**Approach:** Treat category as scope for `pastSelectionCount`, not as its own explainability criterion. Remove `CategoryCompartmentFactor` from the breakdown waterfall; only show real weight factors (e.g. `past_participation`) with deltas based on **category-scoped** history counts.

## Boundaries & Constraints

**Always:** Draw weights and `%` unchanged — `CategoryCompartmentFactor.multiplier = 1.0` and scoped SQL history remain as shipped in **19.8**. Waterfall sum `referencePercent + Σ deltaPoints ≈ chancePercent` (±1 pt). Record fix in ISSUES.md.

**Ask First:** Changing formula catalogue semantics of `equity_tag` (still required in `factorConfig`, still non-disableable).

**Never:** Re-introduce a breakdown line for cross-category history. Do not merge unscoped counts into principal draw weights. Do not change compartment JPQL filters.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Away-only history | Veteran validated on `deplacements`; principal event draw breakdown | `adjustments` empty or no `equity_tag`; principal `%` equal to rookie | N/A |
| Mixed history | Scoped `past=5`, unscoped `past=8` on principal | Single `past_participation` line using scoped count only; no `equity_tag` | N/A |
| Scoped equals unscoped | All history in same category | Only `past_participation` when delta ≠ 0 | N/A |
| UI sheet | Any breakdown payload | No `[data-testid="chance-breakdown-adjustment-equity_tag"]` | N/A |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt` — waterfall loop; skip `CategoryCompartmentFactor`; removed `compartmentExplainabilityPercent`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentFactor.kt` — pipeline factor only; not surfaced in breakdown
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt` — unit regressions for compartment isolation in adjustments
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt` — HTTP `chance-breakdown` with away-only veteran
- `apps/web/e2e/helpers/dispos-poll.ui.ts` — `expectNoEquityTagBreakdownLine`
- `apps/web/e2e/e1/member-dispos-poll.mobile.spec.ts` — E1-MEM-033/034 regression
- `apps/web/src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.spec.ts` — UI never renders equity_tag row
- `docs/v2/technical/draw-weight-engine-v1-spec.md` — explainability delta algorithm (normative)
- `ISSUES.md` — BUG-012 factual record

## Tasks & Acceptance

**Execution:**
- [x] `ChanceBreakdownCalculator.kt` — skip `CategoryCompartmentFactor` in waterfall — category scopes history, not a visible criterion
- [x] `CategoryCompartmentFactor.kt` — document non-surfacing in breakdown — align code comment with product rule
- [x] `ChanceBreakdownCalculatorTest.kt` — away-only + mixed compartment cases — lock behavior
- [x] `CompositionDrawIntegrationTest.kt` — HTTP breakdown omits `equity_tag` after away assignment — end-to-end API proof
- [x] `dispos-poll.ui.ts` + `member-dispos-poll.mobile.spec.ts` — E2E guard on sheet — prevent UI regression
- [x] `chance-breakdown-sheet.spec.ts` — unit guard on testid — front contract
- [x] `draw-weight-engine-v1-spec.md` — update Explainability § Delta algorithm — normative doc sync
- [x] `ISSUES.md` — add BUG-012 fixed entry — governance

**Acceptance Criteria:**
- Given a participant with validated selections only in `deplacements`, when breakdown is requested on a principal event, then `adjustments` contains no `factorId=equity_tag` and chance equals pure-draw baseline for that scoped history.
- Given scoped past count lower than unscoped, when breakdown is computed, then only `past_participation` may appear with delta from scoped count.
- Given the breakdown sheet is open in Dispos, when any candidate is inspected, then no equity_tag adjustment row or « Compté dans un autre type de spectacle » copy is shown.

## Spec Change Log

<!-- Empty — no bad_spec loopbacks -->

## Design Notes

Story **19.8** AC7 originally required an `equity_tag` breakdown line when `unscoped > scoped`. Product clarification (2026-06-23): that line misrepresented compartment isolation as a penalty. **Supersedes AC7 for explainability only** — draw engine and formula catalogue unchanged.

Waterfall before (misleading):

```
63 % base → −23 pt equity_tag → +4 pt past_participation → 44 %
```

After (correct):

```
63 % base → −19 pt past_participation (5× scoped) → 44 %
```

`pastSelectionCountUnscopedByParticipant` remains on the API for diagnostics/tests but is not used to emit breakdown rows.

## Verification

**Commands:**
- `./gradlew test --tests ChanceBreakdownCalculatorTest --tests CategoryCompartmentFactorTest --tests 'CompositionDrawIntegrationTest.chance breakdown omits equity_tag when away history is isolated from principal'` — expected: BUILD SUCCESSFUL
- `cd apps/web && npx vitest run src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.spec.ts` — expected: all tests pass (or `ng test` if vitest env incomplete)
- `./scripts/run_e2e.sh --grep "E1-MEM-03[34]"` — expected: breakdown opens, no equity_tag line (requires API profile `e2e`)

**Manual checks:**
- Open Dispos pool breakdown for a member with déplacement history on a principal match — waterfall shows only past participation (or empty if scoped count is 0).

## Review Summary (2026-06-23)

| Reviewer | Verdict | Notes |
|----------|---------|-------|
| Adversarial | Pass with deferrals | E2E does not seed cross-compartment veteran (regression guard only); unscoped count still threaded through API |
| Edge cases | Pass | Away-only, mixed scoped/unscoped, empty adjustments covered in unit + integration tests |
| Acceptance auditor | Pass | AC met; draw weights unchanged; docs + ISSUES updated |

## Suggested Review Order

**Breakdown algorithm (core fix)**

- Category scope is not a waterfall row — skip equity_tag factor in loop
  [`ChanceBreakdownCalculator.kt:91`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt#L91)

- Pipeline factor unchanged at multiplier 1.0 — scoped history only
  [`CategoryCompartmentFactor.kt:3`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentFactor.kt#L3)

**Tests**

- Unit: away-only and mixed compartment adjustments
  [`ChanceBreakdownCalculatorTest.kt:213`](../../services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt#L213)

- Integration: HTTP breakdown after validated déplacement assignment
  [`CompositionDrawIntegrationTest.kt:725`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt#L725)

- E2E + UI spec: no equity_tag testid or copy
  [`dispos-poll.ui.ts:168`](../../apps/web/e2e/helpers/dispos-poll.ui.ts#L168)

**Normative docs**

- Explainability delta algorithm omits equity_tag
  [`draw-weight-engine-v1-spec.md:539`](../../docs/v2/technical/draw-weight-engine-v1-spec.md#L539)

- BUG-012 registry entry
  [`ISSUES.md:13`](../../ISSUES.md#L13)

# Sprint Change Proposal — Draw Equity and Composition Warnings

**Status:** Approved by Patrice on 2026-11-14 for implementation planning, with the decisions recorded below; unresolved technical and product details remain subject to review.

**Date:** 2026-11-14

**Trigger:** Nicolas questioned Rachid's chance breakdown for Match Caprani in production. The discussion exposed a misleading replay label, unexpected formula selection and a need to share some, but not all, category histories.

**Delivery:** Planning only; no implementation, tracker change, production configuration change, deployment or historical data rewrite is authorized by this draft.

## 1. Evidence and problem

- The production screenshot showed 5 player places, 16 candidates, a 31% reference, +6 for no prior player selection, +5 beside a claim that Rachid played at Match Cambo, and 42% total. A read-only production check on 2026-11-13 found Rachid absent from the validated Cambo composition. `BUG-117` records the incorrect attribution: factor deltas describe a pool-wide effect while the replay label is unconditional.
- On that date the troupe policy allowed both the custom Aperocks and system V1 formulas for ordinary events; Aperocks was first in the allowed list and mandatory in the Aperocks category. Dispos passes no formula selection, so the resolver uses the first allowed formula. The production setting is evidence of observed behavior, not proof that it expressed Nicolas's intent; recheck before any proposed configuration write.
- System V1 enables scoped past participation and does not enable immediate replay exclusion. The observed custom Aperocks formula enables immediate replay. The selected draw formula and a member's Dispos preview are separate contexts; do not assert which formula will be used in a future draw.
- The existing API and web include an organizer-only, non-blocking previous-event warning for the same role and same category (`ConsecutiveShowWarningService`); story 6.20 is nevertheless `backlog` in the tracker. Reconcile lifecycle evidence rather than assuming completion.
- `BUG-118` records the display's expected-removal approximation. The current normative draw spec explicitly specifies that approximation and a ±1-point golden-test tolerance. For a reconstituted Caprani pool, the estimate was 41.87% and independent enumeration 42.82%; this does not prove the exact inputs at screenshot time. An exact-odds requirement is a proposed product change, not an established violation of the current spec.

## 2. Proposed product direction

### History and formula

For the affected troupe, use one shared standard-draw history for ordinary events and Aperocks, while keeping Aperocks as a distinct event category. CCAS participation must not affect ordinary/Aperocks odds and should affect CCAS odds; travel participation must not affect ordinary/Aperocks odds and should affect travel odds. Proposed matrix, subject to identity and edge cases being confirmed:

| Current event | Prior validated selections counted for the same role |
|---|---|
| Ordinary or Aperock | Ordinary and Aperock |
| CCAS | CCAS |
| Travel | Travel |
| Other category | Existing behavior until a product decision |

For the affected troupe, use only the standard formula for ordinary events and Aperocks, as approved by Patrice. Remove the custom Aperocks formula from the affected troupe's active policy after an explicit, target-specific operational authorization; determine archive versus retention only after checking references and audit/history. Do not delete categories, events, assignments or draw snapshots. Do not apply a global hard-coded change to other troupes. The product mechanism to group histories must be designed and approved; distinguish capability delivery from a later troupe configuration change.

### Organizer warnings

Show non-blocking information in composition when an assigned person was selected in the **same role** in (1) the immediate previous validated event across **all** categories, including CCAS and travel, and/or (2) the immediate previous validated event in the same category. These are distinct indications: “X aura joué deux fois d'affilée, tous spectacles confondus” and “X aura fait deux [catégorie] d'affilée”; adapt wording to the relevant role and category without asserting that future events already took place. Determine predecessors by event calendar date within the same season and validated compositions, not by validation timestamp. Use the existing deterministic event ordering for equal dates unless a different rule is approved. Apply this comparison to **every role independently**: MC followed by MC can trigger a warning; MC followed by player does not. Example: a second consecutive Aperock in the same role can be flagged even when another category intervenes. If both conditions hold, communicate both scopes without duplicating the same fact or hiding either meaning. No draw weighting, exclusion or publication block comes from a warning. Preserve existing organizer-only access and lifecycle protections unless explicitly changed.

### Explainability

Fix BUG-117 even if the affected troupe stops using replay exclusion: custom formulas elsewhere may still use it. Explain the effect on other candidates without falsely stating that the target played. Patrice approved keeping the currently documented approximation for this urgent change and treating any precision improvement as separate work; do not silently replace the documented V1 approximation under the guise of a bug fix.

## 3. Open product decisions

1. **Warning roles — confirmed by Patrice:** all roles are compared independently with the same role on the predecessor.
2. **Weight history roles — confirmed by Patrice:** each role uses its own selection history; MC never counts as player and vice versa.
3. **Predecessor scope — confirmed by Patrice:** use the calendar order of shows with validated compositions in the same season. The global comparison concerns every show, including CCAS and travel; the category comparison concerns the preceding validated show of that category. The comparison is with the previous show, not the last show attended by the person. Preserve current non-archived filtering and deterministic equal-date ordering unless separately changed.
4. **Grouping configuration:** how should the troupe administrator express or maintain the ordinary/Aperock shared history, and what is the behavior for new/other categories? Avoid a troupe-specific slug hard-code and preserve other tenants' current behavior.
5. **Formula policy — confirmed by Patrice:** for the affected troupe, ordinary events and Aperocks use only the standard formula. The general case where other troupes allow multiple formulas remains outside this decision; preserve its behavior and track any misleading UI separately.
6. **Event identity:** verify CCAS and travel categories and legacy travel representations. Missing/misclassified categories require a separately reviewed data plan; do not infer from event titles.
7. **Historical inputs:** retain or change existing operational behavior that includes other validated future events, and behavior of declined, archived and unvalidated assignments? Current repository queries should be the baseline until approved otherwise.
8. **Probability precision — confirmed by Patrice:** retain the documented approximation in this urgent change; any precision improvement is separate. Preserve historic snapshot meaning and avoid claiming the approximation is exact.

## 4. Impact assessment and proposed edits

Checklist: trigger and evidence [x]; epic and story impact [x]; PRD/architecture/UX impact [x] for directly affected artifacts; product decisions and final cross-epic check [!]; approval and tracker handoff [!]. No global replan is indicated; future dependent stories and snapshots must be checked during readiness.

- **PRD `prd.md` FR19–FR24:** existing fairness and explainability objectives remain valid. No rewritten requirement is proposed until scope is confirmed.
- **`DOMAIN.md` category definition and replay sections:** OLD: one event category assigns participations to one separate chance pool. NEW proposal: visual event category and troupe-configured selection-history group are distinct; approved shared groups apply consistently while event categories remain distinct. Preserve replay warning's non-blocking and access rules, with the additional cross-category predecessor behavior after decision 3.
- **`SPEC.md` / `docs/v2/technical/draw-formulas-policies-spec.md`:** OLD: policy resolves an event formula; category partition determines history; session formula controls Équipe. NEW proposal: specify approved history group, resolution of formula preview versus draw, and unchanged behavior for troupes without a configured group. State exact versus approximate chance contract only once decision 8 is made.
- **ADR 0013 and ADR 0019 / `ARCH.md`:** OLD: category compartments isolate draw history; display contract uses documented approximation. NEW proposal: record history grouping as an explicit change to compartment semantics, including isolation, upgrade/default behavior, status and snapshots. Change probability ADR/spec only if precision is approved.
- **Epic 19 / story 19.8 (done):** preserve its historical record; propose a follow-up story for configurable grouped history and formula policy rather than reopening it silently. **19.20 / 19.21 (done):** address observed policy and preview UX in a follow-up if required. **19.22 (backlog):** inspect snapshot/audit implications; do not mark delivered.
- **Epic 6 / story 6.20 (backlog):** inspect committed code, story evidence, tracker controller and any worktree before deciding whether to resume or create a successor for global and category warnings. Existing role and audience scope must remain explicit.
- **UX `ux-design-composition-consecutive-show-warning.md` and `ux-design-orga-formula-choice-19-21.md`:** OLD: warning is same role and same category; formula choice is hidden in overflow. NEW proposal: design an accessible, concise organizer hint for two predecessor scopes and explain the formula where necessary without silently overturning the existing UX contract. Any visible redesign requires a reviewable plan and mobile visual validation.
- **`ISSUES.md` BUG-117/118:** retain known observations. Correct BUG-118's characterization if it implies conflict with the present normative approximation; link any approved precision change and report deployment separately.

## 5. Path and implementation handoff

**Recommendation:** direct scoped adjustment within existing product/epic structure; no rollback and no MVP reset. Scope: moderate, because domain semantics, UI and multi-tenant configuration interact. Effort: medium to high; no calendar estimate without implementation discovery. Risk: high for incorrect history, misleading percentages or accidental tenant-wide changes; medium for warning presentation. Ship in small independently reviewed slices where their shared contracts permit.

1. PO/Patrice approved the proposal direction and choices on 2026-11-14. Agents prepare an implementation plan, resolve remaining details without inventing product policy, and present UI direction before implementation. This approval does not itself authorize production configuration changes or deployment.
2. PO/developer reconcile 6.20, inspect release/affected worktrees, select story IDs via the tracker controller, and write concise acceptance criteria and normative edits. No tracker mutation before approval.
3. Developer implements and tests the grouped-history contract with fixtures for ordinary ↔ Aperock, CCAS-only, travel-only, role isolation, participants/identity, validation state, snapshots and an unrelated troupe.
4. Developer extends composition warnings for both predecessor scopes, duplicate conditions, accessible mobile presentation and organizer-only visibility. Validate manual assignment, redraw, unlock/revalidation and existing published/draft boundaries.
5. Developer corrects replay explanation independently, including active custom formulas and positive/negative deltas. Precision work is scheduled only under an approved probability contract and independently compared with real sequential draw probabilities.
6. QA checks Dispos, Équipe, partial/full draw, formula choice, read-only history and presentation using targeted tests plus a reachable full-stack mobile review. Report automated, visual and human evidence separately.
7. For the affected troupe, inspect formula references and prepare a reversible exact before/after policy plan. Seek target-specific authorization before production changes; release/staging/prod follow separate permissions and verification.

**Done means:** agreed rules documented; cross-tenant behavior protected; every visible chance corresponds to its stated formula and precision contract; warnings informative only; incorrect replay text removed; required tests and human UI review recorded; no unapproved remote mutation.

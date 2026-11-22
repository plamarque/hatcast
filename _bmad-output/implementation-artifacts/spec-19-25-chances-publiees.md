---
title: 'Recorded selection chances after composition publication'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'dispatch'
baseline_commit: c580faf1295b144695db94661d9e164a4500080b
review_loop_iteration: 0
context: ['{project-root}/docs/v2/technical/FRONTEND_UI.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Live chance simulations can be confused with recorded chances after a selection is published.

**Approach:** Before the composition is visible, retain existing live chance and detail behavior. Once published and visible, Dispos shows the dated capture made before the first selection or the latest successful draw of each role, for candidates included in that pool. The selected person's actual step chance remains separate in their selection sheet; current estimates remain available to organizers for filling vacancies.

## Boundaries & Constraints

**Always:** Apply per role in Équipe and all Dispos views, including Tous. Treat manual and draw selection identically, preserve composition visibility and all access gates, keep all candidates and calculation pools, preserve each role capture after removal or manual replacement; replace it with a capture of the actual pool after any successful draw of that role. Explain incomplete capture and leave retained assignees outside that pool without an invented value. Show recorded data only when present, never infer missing historical values. Preserve draw preview and animation before selection.

**Never:** Expose hidden assignments, indicate selection method, alter historical records, draw calculations or permissions, or replace a missing recorded percentage with a live simulation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Unpublished | Selected or candidate | Existing live odds and details, subject to existing permissions | Do not leak hidden assignment |
| Published and visible | Any candidate | Display only the common dated photograph for that role | Missing or unreliable photographs remain unavailable |
| Selected candidate | Visible published assignment | Selection sheet shows the separate actual recorded step chance | No live estimate or mixed ranking |
| Removed or manually replaced | Role previously captured | Preserve its capture | Existing permissions apply |
| Partial or complete draw | At least one candidate is selected | Capture the actual role pool, including for a pre-existing composition; explain incomplete coverage and leave retained assignees outside that pool without a captured value | If no selection occurs, preserve the prior capture |
| Published but invisible | Viewer cannot see assignment | No assignment-dependent signal | Existing permissions apply |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt` and `dto/AvailabilityDtos.kt` — role summary currently calculates live chances without assignment state; use actual slots with `CompositionVisibilityRules` and publication gate; preserve pool calculations.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`, `CompositionVisibilityRules.kt`, and composition DTOs — publication and visibility are distinct; assigned slots contain recorded evidence, while validation controls member visibility. Never expose hidden assignment evidence.
- `CompositionSlotAssignmentService.kt`, `CompositionDrawService.kt` — capture a distinct first-selection photograph without changing draw calculation.
- `apps/web/src/app/shared/availability/availability-poll*`, `availability-tous-panel*`, and shared pool components — show the common role photograph and date, retaining separate selection details.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.{ts,html}` — slot chance trigger and slot rendering; preserve candidate preview and draw animation.
- Existing integration and component tests cover visibility, role candidates, manual and draw evidence, and explainability; extend them for publication, visibility, missing snapshots, role independence, removal, and accessibility.

## Tasks & Acceptance

**Execution:**
- [x] API availability summary and OpenAPI — provide dated role photographs only when published and visible; keep hidden compositions indistinguishable.
- [x] Équipe and Dispos components — display recorded date/percent and allow a selection sheet without current estimates or calculation details for published visible assignments, preserving other candidates.
- [x] Tests — exercise role, publish, visibility, manual/draw, missing data, removal, pool and accessibility cases.
- [x] Relevant normative documentation — reflect approved observable behavior without altering selection rules.
- [x] Run targeted API/web tests and meaningful E2E; assess Material 3 checklist and prepare mobile/desktop human smoke.

**Acceptance Criteria:** Given a published visible composition, Dispos shows the dated role-pool capture from the first selection or latest successful draw, or marks missing evidence unavailable; the actual selection chance remains separate and vacancy simulations remain organizer-only.

## Implementation Notes

## Spec Change Log

- 2026-11-20 : Patrice précise que tout nouveau tirage effectif, même partiel, capture son pool réel ; les affectations conservées hors pool ne reçoivent aucune valeur inventée et la couverture incomplète est signalée. La publication seule ne capture rien.

- 2026-11-20 : Patrice autorise une nouvelle photographie du pool éligible à chaque tirage complet effectif du rôle, y compris pour les compositions préexistantes ; les tirages partiels ou sans sélection conservent la référence antérieure.

- 2026-11-20 : manual photographs use exactly the selected slot picker pool and displayed percentages; unlike automatic draws, manual assignment retains candidates already assigned to another role and marks them with the existing warning.

- 2026-11-20 : for an automatic multi-role draw, each role photograph uses its actual pool immediately before its first selection, after exclusions from previously drawn roles. Failed first captures and pre-existing compositions remain unavailable; no later capture is presented as the original.

- 2026-11-20 : Patrice choisit une photographie homogène par rôle avant sa première sélection ; Dispos visible ne mélange plus les chances effectives ou actuelles avec cette référence. Les anciennes compositions sans preuve restent indisponibles ; avant visibilité les estimations restent inchangées.

- 2026-11-20 : Dispos mobile candidate badges gain 48 dp height and at most three per row; visible assignments use participation-status colors without changing vote controls or revealing hidden assignments.

- 2026-11-20 : position calculated from the exact role percentages displayed in Dispos, including visible published assignments; omit the position if any displayed percentage is missing.

- 2026-11-20 : Patrice autorise la position théorique du pourcentage enregistré parmi les chances actuelles, sans exposer le pourcentage actuel de la personne ni les détails du calcul.

- 2026-11-20 : approved selection-sheet mockup replaces the no-trigger choice; current estimates and calculation details remain excluded for visible published assignments.

## Review Triage Log

## Verification

**Commands:** Run targeted backend and Angular suites, project-required checks and relevant E2E; report any gap. Verify mobile and desktop in the prescribed offline worktree stack.

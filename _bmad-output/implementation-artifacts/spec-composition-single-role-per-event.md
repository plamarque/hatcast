---
title: 'Composition — draw cross-role fix + multi-role manual warning'
type: 'bugfix'
created: '2026-06-05'
status: 'done'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/6-20-avertissement-rejeu-spectacle-precedent.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Auto-draw can assign the same participant to two roles on one event when they were already placed on a role that comes **later** in draw priority order (e.g. pre-assigned as player, then drawn as DJ). Manual multi-role stacking remains allowed for organizers.

**Approach:** Seed `crossRoleExcluded` from all pre-existing assignees at draw start; on full role redraw, remove that role's assignees from the exclusion set before re-picking. Add a non-blocking inline hint (6.20 style) when a participant holds multiple roles on the same event.

## Boundaries & Constraints

**Always:** Manual assign may stack roles (FR21). Auto-draw must never produce two roles for one participant on one event. Multi-role hint is organizer-only, non-blocking.

**Never:** Block manual cross-role assign; do not change consecutive-show warning (6.20).

</frozen-after-approval>

## Code Map

- `CompositionDrawService.kt` — cross-role exclusion seed + full-redraw un-exclude
- `MultiRoleOnEventWarningService.kt` — same-event multi-role hint
- `CompositionService.kt` — attach `multiRoleOnEventWarning` on slots
- `event-equipe-tab.html` — inline hint UI

## Tasks & Acceptance

**Execution:**
- [x] Draw exclusion fix + tests
- [x] Multi-role warning API + UI + tests
- [x] Normative docs (DOMAIN.md, SPEC.md, draw-weight-engine-v1-spec.md, OpenAPI)

**Acceptance Criteria:**
- Given Patrice manually on player, when full draw runs on dj+player event, then Patrice stays player only.
- Given Patrice on player and DJ via manual assign, when organizer views Équipe, then both slots show multi-role hint.

## Spec Change Log

- 2026-06-05: Docs updated — DOMAIN.md, SPEC.md, draw-weight-engine-v1-spec.md, composition OpenAPI, draw-v1-v2-gaps investigation note.

## Verification

**Commands:**
- `./gradlew :services:api:test --tests 'com.hatcast.api.composition.CompositionDrawIntegrationTest' --tests 'com.hatcast.api.composition.MultiRoleOnEventWarningServiceTest'`
- `npx vitest run apps/web/src/app/core/composition/multi-role-on-event-warning.spec.ts`

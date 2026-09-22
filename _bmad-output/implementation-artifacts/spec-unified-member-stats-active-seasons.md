---
title: 'Unify member statistics across active seasons'
type: 'feature'
created: '2026-09-22'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: '030426fd24e7fb56ce0d687ae39b34fd87018e98'
context:
  - 'project-context.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/specs/spec-member-stats-active-seasons/SPEC.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Mes Stats chooses one season although a player can participate in
several current seasons. The existing "Toutes les saisons" choice silently
falls back to one season, so it neither represents nor controls the displayed
scope.

**Approach:** Present a unified, server-aggregated view of every eligible
current season by default. Let the player refine that scope with dependent
multi-select troupe and season pickers, and preserve the chart chronology
across seasons.

## Boundaries & Constraints

**Always:** Include a season by default only when the player participates
actively, `isActive` is true, and today's Europe/Paris local date is inclusively
between its start and end dates. "Toutes" means all eligible current seasons.
Both troupe and season filters support multiple choices; `[]` is "Toutes".
Changing troupe choices rescopes seasons, removes incompatible choices, and
falls back to all eligible seasons if none remain. Aggregate raw event data
server-side before calculating percentages. Keep distinct overlapping events as
separate chart blocks, show years when months span years, and center the chart
on the current month.

**Ask First:** Changing the eligibility date rule, including inactive or
expired seasons in "Toutes", or changing production season data.

**Never:** Client-aggregate card statistics; select a primary season as the
default; expose a selected season outside the target member's participation or
selected troupe scope; change Agenda's existing single-select behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default scope | Two active, in-date participating seasons | API aggregates both; UI shows no active chips | N/A |
| All | Empty troupe and season selections | Same eligible active scope as default | N/A |
| Dependent filters | Chosen season belongs to deselected troupe | UI removes it; empty season selection means all eligible seasons in new troupe scope | N/A |
| Current date | Active participant but season outside date range | Excluded from default/all scope | N/A |
| Overlap | Events from two selected seasons in same month | Both blocks render in chronological order | N/A |
| Invalid scope | Query IDs outside participation catalog | API rejects the request without leaking data | 400 |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceController.kt` -- replace scalar request scope with repeated troupe/season IDs.
- `services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt` -- resolve and authorize a collection of eligible seasons; remove primary-season fallback.
- `services/api/src/main/kotlin/com/hatcast/api/memberglance/dto/MemberSeasonGlanceDtos.kt` -- expose an unambiguous resolved multi-season scope.
- `services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileStatsProvider.kt` and `SeasonGlanceStatsProvider.kt` -- calculate raw totals, roles, and chart from all selected seasons before percentages.
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt` -- participation catalog and troupe/season intersection source.
- `apps/web/src/app/pages/member-season-glance/` -- replace scalar filter state, query/storage and single picker flow with local multi-scope behavior.
- `apps/web/src/app/shared/filters/` -- reuse Material picker shell but add a glance-only multi-select path; do not change Agenda semantics.
- `apps/web/src/app/shared/member-profile/member-profile-panel.*` -- render year-aware chart labels and center its horizontal scroll on the current month.

## Tasks & Acceptance

**Execution:**
- [ ] Backend scope and DTO -- accept repeated IDs, resolve default eligibility, validate selected collections, and authorize every included troupe.
- [ ] Backend aggregation -- compute weighted card ratios, merged roles and chronological month blocks across selected seasons.
- [ ] Frontend API/storage -- represent selected troupe/season IDs as arrays; omit arrays for "Toutes" and reconcile dependent seasons.
- [ ] Frontend picker -- provide Material checkbox pickers for troupes and seasons with a working "Toutes" reset.
- [ ] Chart -- add year labels and current-month initial focus without merging simultaneous blocks.
- [ ] Tests and local fixture -- cover API scope, weighted aggregation, dependent reconciliation, picker behavior, current-month chart focus and mobile smoke data.

**Acceptance Criteria:**
- Given two eligible current seasons, when Mes Stats loads without filters, then cards, roles and chart include both seasons.
- Given a selected troupe set changes, when a chosen season is no longer in it, then it is removed and an empty season set means all eligible seasons in the new scope.
- Given multiple selected seasons span years or overlap, when the chart renders, then years distinguish identical month names and all event blocks remain visible in chronological order.
- Given the chart includes the current month, when it first renders on mobile, then that month is brought into view.

## Spec Change Log

## Design Notes

The shared Agenda selectors remain single-select. Mes Stats gets a dedicated
multi-select path so its new semantics cannot regress Agenda.

## Verification

**Commands:**
- `cd services/api && ./gradlew test --tests '*MemberSeasonGlance*' --tests '*SeasonGlanceStatsProviderTest*'` -- expected: scope and aggregation regressions pass.
- `npm run test -w @hatcast/web -- --no-watch --include=src/app/pages/member-season-glance/member-season-glance.spec.ts --include=src/app/shared/member-profile/member-profile-panel.spec.ts` -- expected: multi-scope and chart behavior pass.
- `git diff --check` -- expected: no whitespace errors.

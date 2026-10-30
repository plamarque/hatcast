---
title: 'Fix multi-troupe context in member stats'
type: 'bugfix'
created: '2026-09-29'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: 'fc9e06eab315e7ff2a5b644c4ad07a32a47e8a2f'
context:
  - 'AGENTS.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A member who belongs to several troupes can open global **Mes
Stats** with a persisted scope from another troupe. If that stale troupe has
no eligible current season, the API answers “Aucune saison pour cette troupe”,
and the application returns the member to Accueil even though the current
La Malice season is available.

**Approach:** Make an unscoped global Mes Stats entry independent of an
unrelated persisted filter by explicitly following the current/last-visited
troupe and season, while retaining explicit troupe/season links from season
statistics. Add a regression proving a multi-troupe member reaches that valid
scope instead of the erroneous empty-season error.

## Boundaries & Constraints

**Always:** Preserve explicit `troupeId` + `seasonId` deep links and their
server-side authorization. Keep the existing API validation and M3 UI; do not
change season records, eligibility dates, access control, or aggregation
calculation. A stale saved scope must never turn an unscoped self-profile entry
into a 404 redirect. **Decision (2026-09-29):** global Mes Stats explicitly
uses the current/last-visited troupe and season when that context resolves;
only when it cannot resolve may it use the established unscoped default.

**Never:** Select a troupe by incidental repository or API ordering; weaken
authorization; alter another member's explicitly scoped profile; modify
`sprint-status.yaml`; deploy, merge, or mutate staging data.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Global entry after another troupe | Global Mes Stats resolves La Malice / Malice 2025-2026; session storage holds a different troupe with no eligible season | The entry sends the resolved La Malice troupe and season and remains on the page | No “Aucune saison pour cette troupe” snackbar or redirect |
| Explicit season link | `/membre/:slug?troupeId=A&seasonId=S` from a season statistic | The exact requested season stays selected | Existing 400/403 responses remain |
| Mono-troupe | No query and no stale cross-troupe scope | Current Mes Stats behavior remains valid | Existing no-participation guidance remains |
| Valid stored filter chosen in Mes Stats | Stored scope differs from the resolved current context | Global entry uses the resolved current scope; explicit route scope remains authoritative | Invalid explicit filters remain 400 |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/core/navigation/member-stats-shortcut.service.ts` -- global
  navigation currently creates only `/membre/:userSlug`, with no scope; extend
  it using a side-effect-free resolution of the existing current/last-visited
  season context; do not make member navigation switch `TroupeContextService`.
- `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts` -- current
  successful slug resolution selects the troupe as a side effect; preserve that
  behavior for existing route consumers while exposing a read-only resolution
  path for the navigation shortcut.
- `apps/web/src/app/shared/member-nav/member-nav.{ts,html}` -- keep the Mes
  Stats controls inert until the async scope decision completes, then bind the
  resolved IDs on both rail and bottom-nav links.
- `apps/web/src/app/pages/member-season-glance/member-season-glance.ts` --
  `bootstrapFiltersFromRoute`, `loadGlance`, and reconciliation currently
  replay `hatcast.member-glance.filters` for an unscoped route and redirect on
  the resulting 404; react to query-param-only navigation and preserve an
  explicit route scope even when filter controls are hidden.
- `apps/web/src/app/core/member-glance/member-glance-filters-storage.ts` --
  session-only persisted filter contract; preserve it only under the selected
  policy.
- `apps/web/src/app/core/member-profile/member-profile.service.ts` and
  `apps/web/src/app/pages/season-home/season-statistics.ts` -- established
  explicit-context path to retain.
- `services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt`
  -- 404 is produced only for a nonempty troupe scope with no resolved season;
  no first-troupe fallback exists.
- `apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts`
  and `apps/web/src/app/core/navigation/member-stats-shortcut.service.spec.ts`
  -- simulate the old stale-scope 404 branch, query-only navigation, explicit
  scope persistence, and safe resolution fallbacks.
- `apps/web/src/app/shared/member-nav/member-nav.spec.ts` and
  `apps/web/src/app/core/troupes/troupe-season-resolver.service.spec.ts` --
  assert both rendered scoped hrefs and that shortcut resolution cannot mutate
  the selected troupe.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/src/app/core/navigation/member-stats-shortcut.service.ts` and
  `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts` --
  establish one unambiguous, side-effect-free scope policy for global Mes
  Stats, retaining existing selecting behavior for route consumers.
- [ ] `apps/web/src/app/shared/member-nav/member-nav.{ts,html}` -- prevent a
  click from emitting an unscoped Mes Stats URL while resolution is pending;
  bind the resolved scope on both navigation variants.
- [ ] `apps/web/src/app/pages/member-season-glance/member-season-glance.ts` --
  react to a query-only scope change and retain explicit route scope without
  changing explicit season links.
- [ ] `apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts`
  -- reproduce the stale multi-troupe 404 branch, then assert a successful,
  stable self-profile entry and query-only update.
- [ ] `apps/web/src/app/core/navigation/member-stats-shortcut.service.spec.ts`,
  `apps/web/src/app/core/troupes/troupe-season-resolver.service.spec.ts`, and
  `apps/web/src/app/shared/member-nav/member-nav.spec.ts` -- cover the entry
  URL/context contract, no-context wait state, resolver side-effect boundary,
  and both scoped anchors.

**Acceptance Criteria:**
- Given a member has La Malice and another troupe, when a previous Mes Stats
  visit persists the other troupe and the member opens global Mes Stats from
  La Malice / Malice 2025-2026, then the entry sends the La Malice and season
  IDs, displays that scope, and does not redirect to Accueil.
- Given a member opens Mes Stats from an explicit season statistic link, when
  the route includes the troupe and season IDs, then that explicit scope is
  sent to the existing API unchanged and survives a query-only navigation.
- Given a member has a single eligible context, when opening global Mes Stats,
  then the existing valid statistics/no-participation behavior remains.
- Given global Mes Stats is resolving its current/last-visited season, when the
  member tries to activate its rail or bottom-nav control, then no unscoped
  member-stats request is navigated until a resolved scope or a safe fallback
  is available.
- Given the shortcut resolves a season whose troupe differs from the active
  troupe, when it prepares its link, then the active troupe is unchanged.

## Implementation Notes

## Spec Change Log

- Review iteration 1: reviewers found that the original tasks omitted
  query-only route updates, rendered-anchor assertions, the resolver's troupe
  selection side effect, and the pending-resolution interaction. The Code Map,
  tasks, and acceptance criteria now require a read-only resolver path, an
  inert pending control, explicit-scope retention, and end-to-end anchor tests.
  This avoids silently changing active troupe context or opening an unscoped
  profile while preserving the approved current/last-visited scope policy.

## Review Triage Log

- medium — `member-season-glance.ts` observed only path changes, so a
  query-only navigation could retain the old request scope; verified from its
  `paramMap` subscription and no `queryParamMap` subscription. Routed to
  bad_spec because the original tasks omitted this route lifecycle.
- false — resolving the global `lastVisitedSeason` rather than a separately
  named selected troupe is permitted by the approved “current/last-visited”
  policy; the finding does not disprove that contract.
- medium — `resolveSeasonSlug` selects a troupe during shortcut refresh;
  verified in `TroupeSeasonResolverService`. Routed to bad_spec because the
  original plan did not require a read-only resolver path.
- medium — the explicit-scope test did not prove scope retention after a
  response with hidden filters; verified from the clear branch in
  `loadGlance`. Routed to bad_spec because the original test task did not
  cover the response lifecycle.
- medium — the stale-filter test did not model the former 404 and redirect,
  so it could pass without demonstrating the reported regression. Routed to
  bad_spec because the planned regression fixture was underspecified.
- low — shortcut tests omitted ambiguous/not-found/error fallback coverage;
  retained with the resolver-boundary test task because fallback is user-visible.
- medium — navigation tests did not assert either rendered scoped href; the
  verification-gap review established that deleting either binding would leave
  current tests green. Routed to bad_spec because rendered-link verification
  was omitted.
- false — `MemberNav` refreshes its shortcut on navigation completion, so a
  changed stored season is refreshed rather than permanently retaining a prior
  link; the cited stale-link outcome is not established.
- medium — a user may activate Mes Stats after the user slug resolves but
  before season resolution completes, producing an unscoped entry. Routed to
  bad_spec because the pending interaction contract was absent.

## Design Notes

The exact snackbar in the report is emitted only by the personal-glance API,
not by the Accueil shortcut shown in the screenshot. That shortcut is the
season workspace route and carries both slugs. The failure is therefore a
separate global-Mes-Stats entry state, revealed after its redirect back to
Accueil. Reuse `TroupeSeasonResolverService` / the last-visited-season
shortcut's resolved IDs rather than independently picking the first troupe.

## Verification

**Commands:**
- `npm run test -w @hatcast/web -- --no-watch --include=src/app/pages/member-season-glance/member-season-glance.spec.ts --include=src/app/core/navigation/member-stats-shortcut.service.spec.ts` -- expected: multi-troupe stale-scope and explicit-link tests pass.
- `npm run build -w @hatcast/web` -- expected: Angular production build succeeds.
- `git diff --check` -- expected: no whitespace errors.

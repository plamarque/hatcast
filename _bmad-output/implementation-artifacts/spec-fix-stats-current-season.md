---
title: 'Fix current season defaults for member statistics'
type: 'bugfix'
created: '2026-09-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'c4a0775985ebe91432effe2275cb2b08cfe5a71d'
context:
  - 'project-context.md'
  - 'AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The production “Mes Stats” page can load the prior season when a
member participates in multiple active seasons. Separately, an isolated
worktree cannot validate its BMad runtime after the tracked manifest upgrade to
6.12 because its pinned bootstrap contract still declares 6.11.

**Approach:** Make the server select the newest active season when no explicit
season filter is supplied, reflect the server-resolved scope visibly in the
existing filter, protect both behaviors with regression tests, and align the
bootstrap contract with the tracked BMad 6.12 manifest.

## Boundaries & Constraints

**Always:** Preserve explicit `seasonId` validation and single-season
aggregation; active seasons remain preferred over inactive ones. When the API
resolves an unset season, the filter must visibly show that returned troupe and
season, and synchronize its existing URL/storage state without overwriting an
explicit user selection. Match all BMad module pins to the tracked manifest,
and retain the worktree bootstrap's clean-worktree and network-confirmation
gates.

**Ask First:** Changing which season wins after equal active/start-date and
update-date values; changing season data, production configuration, or the
worktree lifecycle beyond its version contract.

**Never:** Merge statistics across seasons, bypass access checks, alter
`sprint-status.yaml`, change a production season, or edit ignored runtime files
as tracked source.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Default current season | No `seasonId`; two active candidate seasons with distinct start dates | The API resolves the newest active season and returns its statistics | N/A |
| Visible resolved scope | No explicit filter; API returns a resolved troupe and season | The filter chips, picker state, URL, and stored selection name that returned scope | N/A |
| Explicit scope | Valid explicit `seasonId` | The API retains the requested eligible season, regardless of default ordering | Existing 404/400 rules remain |
| Active priority | One active and one newer inactive candidate | The active season remains selected | N/A |
| Fresh worktree | Manifest and bootstrap contract describe the same pinned versions | Runtime verification succeeds after provisioned ignored skills are present | Existing network and clean-tree errors remain |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt` -- `resolveSeason` uses `selectPrimarySeason` when filters are unset; its `maxWith` comparator currently reverses date recency.
- `services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceServiceTest.kt` -- existing default-selection coverage proves active-over-inactive priority; extend it with two active seasons.
- `apps/web/src/app/pages/member-season-glance/member-season-glance.ts` -- sends no default season filter, then retains null filter signals instead of hydrating them from `resolvedSeasonId` and `troupeId`; reuse its existing reconciliation, persistence, and query-param synchronization.
- `apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts` -- current coverage only asserts filter-trigger visibility; add default-server-scope rendering and synchronization coverage.
- `apps/web/src/app/shared/filters/filter-builders.ts` -- existing dimension/chip labels render the resolved current troupe and season; reuse without styling changes.
- `scripts/v2/bmad-runtime.env` -- installer and module-version contract, currently stale against the tracked manifest.
- `_bmad/_config/manifest.yaml` -- tracked source of the approved BMad 6.12 and module versions; read-only evidence.
- `scripts/v2/story-worktree-bootstrap.sh` and `scripts/v2/story-worktree-runtime.test.sh` -- consume and exercise the pin contract without changing their safety behavior.
- `ISSUES.md` -- factual registry entry for the reported production behavior.
- `_bmad-output/implementation-artifacts/16-1-route-membre-saison-clin-oeil-filtres.md` -- original scope: one resolved season, never a cross-season merged chart.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/bmad-runtime.env` -- update BMad and module pins to the versions recorded by `_bmad/_config/manifest.yaml` -- make fresh-worktree verification reproducible after the upgrade.
- [x] `services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt` -- correct newest-season ordering for the existing `maxWith` selection -- load the current season when no filter is specified.
- [x] `services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceServiceTest.kt` -- add the two-active-season default-selection regression -- prevent recurrence while preserving active-over-inactive behavior.
- [x] `apps/web/src/app/pages/member-season-glance/member-season-glance.ts` -- hydrate unset filter signals from the successful API response's resolved troupe and season, before existing reconciliation -- make the actual stats scope visible and shareable.
- [x] `apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts` -- cover an initially unfiltered response that resolves a season -- verify the named filter state is rendered and synchronized without a second API load.
- [x] `ISSUES.md` -- record the observed production defect, cause, affected API, and verified correction -- retain an auditable factual record.

**Acceptance Criteria:**
- Given a member with two active eligible seasons dated 2025-09-01 and
  2026-09-01, when `GET /v1/members/{userSlug}/season-glance` omits
  `seasonId`, then `resolvedSeasonId` is the 2026 season and all aggregates
  remain scoped to it.
- Given no explicit troupe or season filter and a successful response with a
  resolved troupe and season, when the page renders, then its existing filter
  identifies that exact troupe and season rather than “Toutes les…”; URL and
  stored filters use the same IDs without causing another data request.
- Given a troupe or season chosen in URL, storage, or the picker, when a
  response is loaded, then that explicit valid choice is retained rather than
  replaced by the server default.
- Given an explicit eligible `seasonId`, when the glance API is requested, then
  it returns that season and existing authorization/validation responses are
  unchanged.
- Given an active and an inactive eligible season, when no season filter is
  supplied, then the active season remains preferred.
- Given a fresh worktree from this revision, when the BMad bootstrap verifies
  its runtime, then it accepts the tracked 6.12 and module pins without
  changing tracked `_bmad` files.

## Spec Change Log

## Design Notes

`maxWith` retains the greatest comparator result. `thenByDescending` therefore
makes a later date compare as smaller and selects the older season. Preserve the
active-first comparison, then use ascending date comparators so the greatest
candidate is the most recent.

## Verification

**Commands:**
- `cd services/api && ./gradlew test --tests '*MemberSeasonGlanceServiceTest*'` -- expected: the focused service suite passes, including two-active-season coverage.
- `npm run test -w @hatcast/web -- --no-watch --include=src/app/pages/member-season-glance/member-season-glance.spec.ts` -- expected: the focused page suite passes, including visible resolved-scope coverage.
- `bash scripts/v2/story-worktree-runtime.test.sh` -- expected: worktree runtime contract tests pass.
- `git diff --check` -- expected: no whitespace errors.

## Suggested Review Order

**Season selection and visible scope**

- Choose the most recent active season without merging statistics.
  [`MemberSeasonGlanceService.kt:166`](../../services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt#L166)

- Surface the API-resolved scope through existing filter state and synchronization.
  [`member-season-glance.ts:308`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.ts#L308)

**Regression coverage**

- Prove two active seasons resolve to the current one.
  [`MemberSeasonGlanceServiceTest.kt:149`](../../services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceServiceTest.kt#L149)

- Prove the initially server-resolved scope is visibly named once.
  [`member-season-glance.spec.ts:165`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts#L165)

**Runtime contract and traceability**

- Keep isolated worktree provisioning aligned with the tracked BMad manifest.
  [`bmad-runtime.env:2`](../../scripts/v2/bmad-runtime.env#L2)

- Keep the production-path installer fixture on the same pinned version.
  [`mock-npx.sh:6`](../../scripts/v2/test-fixtures/mock-npx.sh#L6)

- Record the production symptom and locally verified correction.
  [`ISSUES.md:13`](../../ISSUES.md#L13)

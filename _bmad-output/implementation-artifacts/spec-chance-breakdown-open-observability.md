---
title: 'Chance breakdown opening observability'
type: 'feature'
created: '2026-10-18'
status: 'done'
route: 'bmad-build'
review_loop_iteration: 0
baseline_commit: '7b62bad64e1dcaad45175eefc9ae92f3af7f8dbb'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/implementation-artifacts/19-7-breakdown-explicabilite-par-facteur-optionnel-mvp-pipeline.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-11-4-observabilite-parcours-organisateur-posthog.md'
---

<frozen-after-approval reason="human-provided contract — do not modify unless human renegotiates">

## Intent

**Problem:** Product operators cannot filter Session Replay by the Dispos or Équipe surface that successfully opened a chance-breakdown sheet without collecting participant or draw information.

**Approach:** Add two typed, privacy-bounded ProductAnalyticsService captures. The shared ChanceBreakdownService captures one opening only after `getChanceBreakdown` succeeds and the responsive Material overlay is opened. The sheet captures explicit help activation while preserving the opening entry point.

## Boundaries & Constraints

**Always:** Use `ProductAnalyticsService` and rebuild the existing safe event context. Retain only `event_id`, `season_id`, `troupe_id`, `is_demo_troupe`, and contextual `actor_scope` when loaded. `chance_breakdown_opened` includes exactly `entry_point` and `presentation` (`bottom_sheet` or `dialog`) beyond that safe context. `chance_breakdown_help_opened` includes `entry_point` beyond safe context and no `presentation`.

**Closed entry points:** `dispos_poll`, `equipe_slot_picker`, `equipe_pool_preview`, `equipe_draw_step`, and `equipe_slot_chance`.

**Never:** Call PostHog from a component. Emit on API failure, unavailable chance, rejected overlay acquisition, or failed/unopened overlay. Send participant, viewer, user, role, formula, chance, rank, count, factor, text, tooltip, URL, user-agent, fingerprint, screen/replay-content, or People-property data. Create a HatCast dashboard or any PostHog object.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected event | Error handling |
|---|---|---|---|
| Successful mobile opening | API returns breakdown; bottom sheet is opened | one `chance_breakdown_opened` with `presentation=bottom_sheet` and literal caller entry point | capture cannot block the overlay |
| Successful desktop opening | API returns breakdown; dialog is opened | one `chance_breakdown_opened` with `presentation=dialog` and literal caller entry point | capture cannot block the overlay |
| API failure or absent data | failed/empty `getChanceBreakdown` result | none | retain existing snackbar |
| Overlay already open | gate refuses acquisition | none | retain existing snackbar/refusal behavior |
| Candidate has no chance / explainability unavailable | caller guard stops before service | none | retain existing UI behavior |
| Explicit document help | user activates `Comprendre le tirage en général` | one `chance_breakdown_help_opened` with the opening entry point, no presentation | help retains its existing overlay behavior |
| Analytics disabled | no PostHog key | no request | all chance-breakdown UX remains unchanged |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/core/analytics/fr47-event-names.ts` — typed names and closed entry-point/presentation values.
- `apps/web/src/app/core/analytics/product-analytics.service.ts` — runtime allow-lists, safe-context projection, disabled no-op behavior.
- `apps/web/src/app/shared/composition/chance-breakdown.service.ts` — sole successful fetch-and-open boundary; receives a bounded event context and entry point.
- `apps/web/src/app/shared/composition/chance-breakdown-sheet/` — carries only the bounded opening context to explicit help activation.
- `apps/web/src/app/shared/availability/availability-poll.ts` — literal `dispos_poll` caller with loaded availability context.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` and `composition-slot-picker-dialog.ts` — literal Équipe callers and existing loaded contextual actor scope.

## Tasks & Acceptance

- [x] Add typed event names, closed entry-point/presentation unions, facade methods, and runtime property projection tests.
- [x] Thread only bounded opening context through ChanceBreakdownService and sheet data; capture after Material open, before awaiting close.
- [x] Map each of the five caller boundaries to its literal entry point without forwarding candidate identity or formula id into analytics.
- [x] Capture help only from the explicit document control; assert the retained opening entry point and lack of presentation.
- [x] Add focused test coverage for mobile/dialog success, API failure, gate refusal, disabled facade behavior, caller payload allow-lists, and help activation.

## Acceptance Criteria

1. Given a successful chance-breakdown API response and a Material overlay opened, when the responsive presentation is determined, then exactly one `chance_breakdown_opened` event is emitted with only safe event context, a closed literal entry point, and `bottom_sheet` or `dialog`.
2. Given a failed/empty response, unavailable candidate, unavailable explainability, or overlay gate refusal, when the opening cannot proceed, then no chance-breakdown opening event is emitted.
3. Given any of the five named caller boundaries, when it opens a breakdown, then its event has its contract literal and no candidate identity, role, formula, chance, rank, or draw payload.
4. Given the sheet is open, when the user activates `Comprendre le tirage en général`, then exactly one `chance_breakdown_help_opened` carries the same safe context and opening entry point, with no presentation.
5. Given PostHog is not configured, when callers attempt either action, then ProductAnalyticsService remains a no-op and existing UI behavior remains intact.
6. **M3-1 through M3-5:** Existing Material bottom sheet/dialog, French controls, tokens, responsive thresholds, focus, and dismiss affordance are retained. This instrumentation adds no control or visual styling; Material checklist reviewed with no waiver.

## Explicit Non-goals

- Analytics dashboard, insight, event definition, cohort, replay content access, or any other PostHog object.
- A People-property change or raw PostHog component call.
- Change to chance calculation, overlay gates, responsive breakpoint, dialog/sheet styling, or documentation/help content.

## Validation Plan

- Targeted Angular specs for analytics, ChanceBreakdownService, sheet help, Dispos, picker, and Équipe caller boundaries — 157 passed.
- `npm run build -w @hatcast/web` — passed.
- `git diff --check` and formal local review of the final diff — passed, no finding.

## Dev Agent Record

### Completion Notes List

- 2026-10-18 — implementation was transferred into the canonical `feat/11-7-observabilite-des-panneaux-de-chances-posthog` unit. Its BMad runtime is pinned at 6.12.0 and runtime readiness is `ready`.
- 2026-10-18 — targeted Angular validation passed: 6 files / 157 tests. Production web build passed. Formal local review found no privacy, success-boundary, Material 3, or caller-mapping finding; `git diff --check` passed.
- 2026-10-18 — reconciled the historical runbook wording that put session replay out of scope: this delivery does not enable, alter, or inspect replay capture/content; it only supplies bounded event filters for authorized operators.

### File List

- `_bmad-output/implementation-artifacts/spec-chance-breakdown-open-observability.md`
- `ARCH.md`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `apps/web/src/app/core/analytics/fr47-event-names.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.spec.ts`
- `apps/web/src/app/shared/composition/chance-breakdown.service.ts`
- `apps/web/src/app/shared/composition/chance-breakdown.service.spec.ts`
- `apps/web/src/app/shared/composition/chance-breakdown-sheet/`
- `apps/web/src/app/shared/composition/composition-slot-picker-dialog.ts`
- `apps/web/src/app/shared/composition/composition-slot-picker-dialog.spec.ts`
- `apps/web/src/app/shared/availability/availability-poll.ts`
- `apps/web/src/app/shared/availability/availability-poll.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`

### Change Log

- 2026-10-18 — Build specification created.
- 2026-10-18 — Validation completed in canonical story worktree.
- 2026-10-18 — Tracker closed manually with PO authorization because BUG-BMAD-001 prevents the BMad planner from addressing the ASCII branch key.

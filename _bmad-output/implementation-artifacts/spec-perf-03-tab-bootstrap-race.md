---
title: 'PERF-03 tab bootstrap race hardening'
type: 'bugfix'
created: '2026-08-25'
status: 'done'
review_loop_iteration: 0
baseline_commit: '00e73c5a2d89f21857000f8912c7e3bb6796b5e6'
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Event detail preserves PERF-03's tab-scoped loading, but a rapid tab change can start multiple BFF tab bootstraps. Responses for a tab that is no longer active are discarded, yet their requests still consume the latency and API budget that lazy loading is meant to avoid.

**Approach:** Make tab bootstrap ownership follow the latest selected tab, so obsolete requests neither update state nor cause a second useful bootstrap. Preserve the existing single payload per active tab and prove the rapid-switch behavior with focused front-end tests.

## Boundaries & Constraints

**Always:** Preserve zero composition and availability-summary payload on Infos; preserve composition loading only for Équipe and availability summary only for Dispos; retain existing BFF contracts, Material UI, canonical query synchronization, and error/403 behavior.

**Ask First:** Change the original PERF-03/PERF-10 story status or sprint tracking; broaden the work into resolver, shell, BFF, or SQL latency optimization; claim the historical wall-clock gate is passed without a fresh reproducible profile.

**Never:** Reintroduce eager composition or availability-summary fetches; add a new API endpoint or alter server payload shape; alter visible tab design or unrelated deferred work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Initial tab | Event opens on Infos, Dispos, or Équipe | Exactly one BFF request for the selected tab; no cross-tab payload fetch | Existing 403/404 handling remains unchanged |
| Rapid switch | A tab bootstrap is pending and the user selects another tab | Only the current tab may populate state; obsolete work must not trigger a useful second bootstrap | A failed current-tab bootstrap remains retryable by existing behavior |
| Revisit | A tab was successfully loaded | Revisit uses its valid cached payload without a refetch | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/event-detail/event-detail.ts` — `ensureTabBootstrapLoaded`, `loadTabBootstrap`, `tabBootstrapInFlight`, and `loadRequestId` govern lazy BFF requests and response application.
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts` — BFF mock and PERF-03 tests cover initial tab selection, tab/query switching, and revisits; add the asynchronous rapid-switch regression case here.
- `apps/web/src/app/core/events/event-api.service.ts` — existing `getEventPage` client contract; read-only unless the current contract proves insufficient.
- `services/api/src/main/kotlin/com/hatcast/api/event/EventPageService.kt` and `services/api/src/test/kotlin/com/hatcast/api/event/EventPageIntegrationTest.kt` — existing server-side tab-payload scoping evidence; read-only for this front-end race fix.
- `_bmad-output/implementation-artifacts/perf-03-event-detail-tab-gated-load.md` — historical ACs and deferred findings; do not silently change its review status.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/pages/event-detail/event-detail.ts` — serialize or invalidate obsolete tab bootstraps so the newest active tab is the only candidate to apply BFF state, while preserving cache reuse and retry semantics.
- [x] `apps/web/src/app/pages/event-detail/event-detail.spec.ts` — model delayed BFF responses and assert a rapid tab switch does not apply stale payload or retain an obsolete in-flight bootstrap.

**Acceptance Criteria:**
- Given a delayed bootstrap for a tab that is no longer selected, when another tab becomes active, then no stale response updates the event-detail state and the active tab receives only its scoped BFF payload.
- Given a tab successfully loaded after a rapid switch, when the user revisits it, then it is not refetched.
- Given the initial Infos tab, when the page becomes interactive, then no composition or availability-summary payload is requested.

## Spec Change Log

## Design Notes

The fix must distinguish a request that is merely in flight from the tab currently entitled to consume it. A tab-level loaded cache stays valid only after that tab's response is accepted for the same event load generation.

## Verification

**Commands:**
- `npm run test -w @hatcast/web -- --watch=false --include='src/app/pages/event-detail/event-detail.spec.ts'` -- passed: 51 tests.
- `npm run build -w @hatcast/web` -- passed: production build completes (existing Sass and stylesheet-budget warnings remain).

**Manual checks (if the local dev stack is available):**
- Open an event on Infos, switch rapidly between Dispos and Équipe, and inspect network traffic: no cross-tab composition or summary payload should be consumed; record any profiler result separately from the historical PERF-03 wall-clock gate.

## Suggested Review Order

**Bootstrap ownership**

- Serialize tab bootstrap ownership and safely hand off to the latest selected tab.
  [`event-detail.ts:808`](../../apps/web/src/app/pages/event-detail/event-detail.ts#L808)

- Preserve the in-flight request identity across event-load resets.
  [`event-detail.ts:828`](../../apps/web/src/app/pages/event-detail/event-detail.ts#L828)

**Regression proof**

- Exercise delayed Dispos, rapid Équipe selection, and stale-response rejection.
  [`event-detail.spec.ts:1633`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts#L1633)

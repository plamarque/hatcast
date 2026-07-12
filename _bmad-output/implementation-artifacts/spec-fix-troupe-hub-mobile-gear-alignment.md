---
title: 'Fix troupe hub mobile admin gear alignment'
type: 'bugfix'
created: '2026-07-12'
status: 'done'
route: 'one-shot'
baseline_commit: 'd7a85a3b141ecc72b32ea7f2114f122d1cd5d015'
---

# Fix troupe hub mobile admin gear alignment

## Intent

**Problem:** On `/troupes/:slug` at mobile widths (≤839px), the troupe admin trigger used `mat-stroked-button`, showing a circular outline with a misaligned settings icon. Season and event admin gears use `mat-icon-button` without a border in the same fixed shell slot.

**Approach:** In `app-scope-admin-menu`, switch the stroked variant to `mat-icon-button` on compact viewports via `BreakpointObserver`, reuse `MEMBER_SHELL_MOBILE_MEDIA_QUERY`, and update the E2E helper to accept icon-only mobile triggers.

## Suggested Review Order

**Responsive trigger switch**

- Compact viewport renders icon button instead of stroked outline
  [`scope-admin-menu.ts:44`](../../apps/web/src/app/shared/scope-admin-menu/scope-admin-menu.ts#L44)

- Template branches on `useStrokedTrigger()` for desktop vs mobile DOM
  [`scope-admin-menu.html:2`](../../apps/web/src/app/shared/scope-admin-menu/scope-admin-menu.html#L2)

**Regression coverage**

- Unit test mocks `isMatched` and asserts icon-only compact trigger
  [`scope-admin-menu.spec.ts:89`](../../apps/web/src/app/shared/scope-admin-menu/scope-admin-menu.spec.ts#L89)

- E2E helper accepts icon trigger when label is absent on mobile
  [`troupe-hub.ui.ts:51`](../../apps/web/e2e/helpers/troupe-hub.ui.ts#L51)

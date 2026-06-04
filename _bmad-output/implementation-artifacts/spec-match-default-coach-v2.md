---
title: 'Match default template — 1 coach (V2)'
type: 'feature'
created: '2026-06-04'
status: 'done'
route: 'one-shot'
---

# Match default template — 1 coach (V2)

## Intent

**Problem:** New Match events in V2 defaulted to zero coach slots, so the Coach role was absent from availability and composition until an admin manually raised the count.

**Approach:** Set `ROLE_TEMPLATES.match.coach` to `1` in the V2 front template source (`event-types.ts`) and align unit tests. Legacy V1 and API/seed presets intentionally unchanged in this one-shot.

## Suggested Review Order

**Default role template**

- Single source of V2 preset slots when admin picks Match before customization.
  [`event-types.ts:131`](../../apps/web/src/app/core/events/event-types.ts#L131)

**Tests**

- Asserts `applyTemplate('match')` exposes coach slot by default.
  [`event-types.spec.ts:13`](../../apps/web/src/app/core/events/event-types.spec.ts#L13)

- Match required roles list includes coach in draw order.
  [`event-types.spec.ts:38`](../../apps/web/src/app/core/events/event-types.spec.ts#L38)

- Preferred-role intersection keeps coach when event requires it.
  [`availability-role-rules.spec.ts:32`](../../apps/web/src/app/core/availability/availability-role-rules.spec.ts#L32)

---
title: 'Remove troupe and season badges from Mon agenda cards'
type: 'refactor'
created: '2026-06-01'
status: 'done'
route: 'one-shot'
---

# Remove troupe and season badges from Mon agenda cards

## Intent

**Problem:** Each event row on `/agenda` repeated troupe and season chip badges. For most members with a single troupe and season, that added noise without new information.

**Approach:** Drop troupe/season badges from agenda event cards; keep composition status when present. Navigation to troupes and seasons stays available via breadcrumb and quick access. Server-side troupe/season filters remain for multi-participation members.

## Suggested Review Order

- Card template no longer renders troupe/season links; composition badge only when set.
  [`user-agenda.html:119`](../../apps/web/src/app/pages/user-agenda/user-agenda.html#L119)

- Unused route helpers removed after badge deletion.
  [`user-agenda.ts:25`](../../apps/web/src/app/pages/user-agenda/user-agenda.ts#L25)

- Spec asserts badges absent and titles still distinguish duplicate events.
  [`user-agenda.spec.ts:111`](../../apps/web/src/app/pages/user-agenda/user-agenda.spec.ts#L111)

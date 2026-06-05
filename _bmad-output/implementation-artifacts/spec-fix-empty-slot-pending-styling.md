---
title: 'Fix empty composition slot pending styling'
type: 'bugfix'
created: '2026-06-05'
status: 'done'
route: 'one-shot'
---

# Fix empty composition slot pending styling

## Intent

**Problem:** After a draw on a draft composition, cleared slots keep the orange pending gradient because the API leaves `participationStatus: 'pending'` even when `participantId` is null.

**Approach:** Gate `--pending` and `--confirmed` row CSS classes on `participantId` so empty slots always render with neutral styling.

## Suggested Review Order

- Gating participation styling on assignee presence fixes the visual bug
  [`event-equipe-tab.html:69`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html#L69)

- Partial clear keeps other pending slots orange while cleared slot goes neutral
  [`event-equipe-tab.spec.ts:338`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts#L338)

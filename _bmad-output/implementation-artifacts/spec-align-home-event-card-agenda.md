---
title: 'Align home next-event card with agenda'
type: 'refactor'
created: '2026-05-31'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** The "Prochain spectacle" card on member home used a text dispo chip badge and showed the event location, diverging from the agenda event card pattern (large participation status square, no address).

**Approach:** Restructure the home card like `user-agenda` (`agenda-card__clickable` + `agenda-card__status` with `app-agenda-participation-status`), remove location and inline dispo badge helpers.

## Suggested Review Order

1. [member-home-todo.html](../../apps/web/src/app/pages/member-home-todo/member-home-todo.html) — card structure vs user-agenda pattern
2. [member-home-todo.ts](../../apps/web/src/app/pages/member-home-todo/member-home-todo.ts) — component import cleanup
3. [member-home-todo.spec.ts](../../apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts) — navigation and status column tests
4. [MeInboxService.kt](../../services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt) — `participantFocus` on `nextEvent`

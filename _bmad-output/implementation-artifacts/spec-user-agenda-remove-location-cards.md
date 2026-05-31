---
title: 'Remove venue from Mon Agenda cards'
type: 'bugfix'
created: '2026-05-31'
status: 'done'
route: 'one-shot'
---

# Remove venue from Mon Agenda cards

## Intent

**Problem:** Show cards on Mon Agenda display venue/location lines, cluttering dense multi-troupe lists.

**Approach:** Remove the location line from user-agenda event cards only; venue remains available on event detail. Assert absence via DOM in unit tests.

## Suggested Review Order

- Retrait du bloc lieu sur la carte spectacle Mon agenda.
  [`user-agenda.html:119`](../../apps/web/src/app/pages/user-agenda/user-agenda.html#L119)

- Assertion DOM `.agenda-card__loc` absente malgré données API.
  [`user-agenda.spec.ts:197`](../../apps/web/src/app/pages/user-agenda/user-agenda.spec.ts#L197)

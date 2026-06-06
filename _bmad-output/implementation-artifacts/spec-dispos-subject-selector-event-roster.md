---
title: 'Dispos subject selector uses event roster'
type: 'bugfix'
created: '2026-06-06'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** On the event Dispos tab, the participant dropdown for proxy availability was populated from the season-wide `/participants/selectors` API. Event-only roster rows (name-only guests added per spectacle) appear in the availability summary and Tous view but were missing from the dropdown — the only practical way for organizers to set their availability.

**Approach:** Derive subject-selector options from the already-loaded availability summary, which uses the same event-scoped eligible roster as Tous (season participants minus exclusions, plus event-only participants).

## Suggested Review Order

1. [apps/web/src/app/shared/availability/availability-subject-options.ts](apps/web/src/app/shared/availability/availability-subject-options.ts) — mapping helper; confirm `kind` heuristic (`LINKED` vs `NAME_ONLY`) is sufficient for avatars.
2. [apps/web/src/app/shared/availability/event-dispos-tab.ts](apps/web/src/app/shared/availability/event-dispos-tab.ts) — removed season selectors fetch; `subjectSelectorOptions` computed from summary.
3. [apps/web/src/app/shared/availability/event-dispos-tab.spec.ts](apps/web/src/app/shared/availability/event-dispos-tab.spec.ts) — regression: name-only summary row appears in selector options.

## Non-regression notes

- **5.5 / FR17:** Corrects implementation gap; name-only and event-only rows must appear in org dropdown.
- **5.7:** Summary GET stays read-only; membership sync still runs on **event-detail** load via `listSeasonParticipantSelectors` (parent), not duplicated in dispos-tab.
- **UX capture:** [_bmad-output/planning-artifacts/ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md)

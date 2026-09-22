---
id: SPEC-member-stats-active-seasons
companions: []
sources:
  - ../../implementation-artifacts/spec-fix-stats-current-season.md
---

# Unified member statistics across active seasons

## Why

Players who participate in more than one current troupe season need one truthful
statistics view. Choosing one "winning" season hides activity and makes the
scope difficult to understand.

## Capabilities

- **CAP-1 — Current active scope**
  - **intent:** A player can open Mes Stats and see activity from every season
    in which they actively participate and which is active today.
  - **success:** The default response includes every eligible season, not just
    the most recent one.
- **CAP-2 — Unified aggregates**
  - **intent:** A player can understand their combined availabilities,
    selections, withdrawals, and favourite roles across the displayed scope.
  - **success:** Counts and percentages are calculated from the union of
    non-archived events in every selected season without double-counting an
    event.
- **CAP-3 — Unified timeline**
  - **intent:** A player can inspect events from distinct or overlapping
    seasons on one chronological chart.
  - **success:** The chart covers the selected seasons' date interval, keeps
    events from an overlapping month together, labels years where necessary,
    and initially centers the current month.
- **CAP-4 — Honest season filter**
  - **intent:** A player can understand and modify the season scope without a
    non-functional "Toutes les saisons" option.
  - **success:** The player can select any subset of eligible seasons or
    choose "Toutes"; the default and "Toutes" both mean the complete current
    active scope.
- **CAP-5 — Dependent troupe scope**
  - **intent:** A player can select any subset of their troupes or "Toutes"
    while keeping the season choices meaningful.
  - **success:** Changing troupes refreshes the season choices; incompatible
    chosen seasons are removed and an empty selection falls back to "Toutes"
    seasons active in the selected troupe scope.

## Constraints

- A season belongs to the default scope only when `isActive` is true, the
  local current date is inclusively between `startDate` and `endDate`, and the
  player has active participation in it.
- Explicit season choices must be authorized and constrained to the player's
  participation catalog.
- The season picker supports multiple selection; its simple "Toutes" label
  means every eligible current active season.
- The troupe picker supports multiple selection; changing it rescopes season
  choices before statistics are loaded.
- Preserve one event block per event; do not collapse simultaneous events.
- Use the existing Angular Material mobile picker and chart surfaces.

## Non-goals

- Including archived, inactive, or date-expired seasons in the default scope.
- Changing season lifecycle data or production configuration.
- Cross-season de-duplication of distinct events that happen at the same time.

## Success signal

With two eligible current active seasons, Mes Stats totals both seasons and
opens on the current month. A player can see and change the scope without a
selection silently reverting to one season.

# ISSUES

This document is the **factual issue registry** for the project. It tracks bugs, defects, limitations, and anomalous behaviors discovered during development, testing, or usage.

This is **not** a planning document. Fixing an issue may result in a task in PLAN.md or be handled opportunistically during a slice. ISSUES.md is **informational (non-normative)**; SPEC, PLAN, and ARCH remain the normative sources for requirements, delivery, and architecture.

**When adding an issue:** use a unique ID (e.g. BUG-002), and include at least: Status, Severity, Affected area, Observed behavior, Expected behavior, Notes/context. Optional: Cause, Fix, Repro.

---

## Open Issues

### LIMIT-001 — E2E tests depend on live base state; need fixture re-architecture
- **ID**: LIMIT-001
- **Status**: Open
- **Severity**: Medium (tests are runnable but flaky / high maintenance, not blocking delivery)
- **Affected area**: E2E tests (Playwright); fixtures / test data
- **Observed behavior**: State-dependent E2E tests (e.g. composition status flows, event-details tabs, undo/transition scenarios) are unstable and difficult to pass. They rely heavily on the current state of the database (seasons, events, composition status, casts). Results vary with data; many tests end up skipped or failing depending on the base.
- **Expected behavior** (future): A fixture system that allows injecting known data sets (or using a dedicated test DB/emulator with seeded data) so E2E tests can assert transitions and statuses reliably without depending on live content.
- **Notes/context**: This is a **future re-architecture** of how we do E2E tests (fixtures / injectable data), not an immediate functional fix. To be scheduled later (e.g. in PLAN.md) when capacity allows. Specs like `composition-status.spec.js`, `event-details-tabs.spec.js` are the main examples.

---

## Fixed

### BUG-001 — Unlock composition clears all player confirmation statuses
- **ID**: BUG-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: Composition / Storage
- **Observed behavior**: When an administrator clicks "Déverrouiller" (unlock) on a composition, all players who had confirmed (or declined) are reset to "à confirmer" (pending). The information about who had already confirmed is lost.
- **Expected behavior**: Unlocking should only clear the organizer's lock (`confirmed` / `confirmedByAllPlayers`). Individual player statuses (confirmed, declined, pending) should be preserved so that admins do not lose that information and are not forced to ask everyone to confirm again.
- **Cause**: In [src/services/storage.js](src/services/storage.js), `unconfirmCast` reads current data from the subcollection **`selections`** to preserve `playerStatuses`, but the cast data (including `playerStatuses`) is stored in the **`casts`** subcollection. The read therefore typically returns no or wrong data; `preservedPlayerStatuses` is empty and the update overwrites `playerStatuses` with an empty object.
- **Fix**: In `unconfirmCast`, use `getDocument('seasons', seasonId, 'casts', eventId)` instead of `getDocument('seasons', seasonId, 'selections', eventId)` when reading the current cast to preserve `playerStatuses`. The rest of the logic (copying current `playerStatuses` into the update) already intends to preserve them.
- **Notes/context**: Code comments and variable names in `unconfirmCast` explicitly state the intent to preserve player statuses; this is an implementation bug (wrong collection name), not a deliberate design choice. **Fixed:** Read in `unconfirmCast` was switched from `selections` to `casts` so preserved statuses are applied correctly.

---

## Deferred / Accepted Issues

(none)

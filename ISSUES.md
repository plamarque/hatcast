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

### UX-001 — Onglet Équipe : mutations lentes sans retour visuel global
- **ID**: UX-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: V2 `apps/web` — `event-equipe-tab`
- **Observed behavior** (recette MVP pilote, 2026-05-25) : mutations composition sans feedback visible global.
- **Expected behavior**: Retour immédiat pendant appels API et rechargements.
- **Fix**: Story **6.11** — overlay onglet pour mutations courantes ; tirage : panneau « Nous préparons le tirage… », animation visible, slots remplis progressivement ; plus de `loadEvent` redondant.
- **Notes/context**: Recette validée 2026-05-27. Clôture story **6.11**.

### UX-002 — Bouton « Déverrouiller » peu identifiable comme action
- **ID**: UX-002
- **Status**: Fixed
- **Severity**: Low
- **Affected area**: V2 `event-equipe-tab`
- **Observed behavior**: Déverrouiller peu distinct de Valider.
- **Expected behavior**: Bouton secondaire Material (`mat-stroked-button`).
- **Fix**: Story **6.11** — `mat-stroked-button` sur Déverrouiller.
- **Notes/context**: Recette validée 2026-05-27.

### PERF-001 — Actions composition (API + rechargements) anormalement lentes en dev
- **ID**: PERF-001
- **Status**: Fixed (accepted residual)
- **Severity**: Medium
- **Affected area**: V2 API composition + front `event-detail`
- **Observed behavior**: Mutations composition ressenties lentes en recette MVP.
- **Expected behavior**: Réduire allers-retours front ; latence API acceptable pour opérations peu fréquentes.
- **Fix**: Story **6.11** — suppression rechargements redondants (`loadEvent`, GET composition post-tirage) ; fast path API mutations (commit `a92d260`). Résiduel ~1 s sur `POST /composition/draw` en dev : **pas de profiling serveur supplémentaire** (décision produit 2026-05-27, tirage non fréquent).
- **Notes/context**: Perçu acceptable après panneau préparation + animation.

### LIMIT-002 — Admin back-office pages still use legacy header (chevron back, no breadcrumb)
- **ID**: LIMIT-002
- **Status**: Fixed
- **Severity**: Low (UX inconsistency; navigation works)
- **Affected area**: V2 `apps/web` — admin chrome on `/saison/:slug/admin/participants`, `/troupes/:slug/admin/membres` (and legacy aliases)
- **Observed behavior** (recette post–Story 17.2, 2026-05-25): These screens kept a **chevron back** and **no** `app-context-breadcrumb`.
- **Expected behavior**: Breadcrumb (troupe › saison › … › admin leaf) and **no** redundant back chevron; consistent with member-facing deep screens (ADR 0013).
- **Fix**: Story **17.11** — extended `app-context-breadcrumb` with `leafTitle`, `layout="troupe"`, and event admin link support; refactored `AdminParticipants` and `AdminMembres` headers (breadcrumb + account menu, mobile page title). Event-scoped participant admin: route `/saison/:slug/event/:eventSlug/admin/participants` (**17.16**); dialog removed.
- **Notes/context**: Closed 2026-05-25 with Story 17.11.

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

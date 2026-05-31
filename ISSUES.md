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

### LIMIT-002 — API integration suite shares one DB; `TroupeMembershipIntegrationTest` flaky in full run
- **ID**: LIMIT-002
- **Status**: Open
- **Severity**: Low (not blocking; targeted runs are green, only the full-suite run is affected)
- **Affected area**: `services/api` Spring integration tests — `@SpringBootTest` with a shared `test` H2 database; `TroupeMembershipIntegrationTest` (platform-admin / join-policy / active-member-count cases).
- **Observed behavior**: `./gradlew test` (full suite) intermittently fails ~1–3 methods in `TroupeMembershipIntegrationTest` with `expected:<200> but was:<409>`. The same suite passes when run in isolation (`--tests '*TroupeMembershipIntegrationTest*'`). Reproduced on `v2` **without** any participant-service changes (baseline 2026-05-31), so it is pre-existing and independent of Story 3.19.
- **Expected behavior**: Deterministic results regardless of execution order — per-test isolation (transactional rollback / `@DirtiesContext` / unique fixtures) so shared seed-troupe state cannot leak between tests.
- **Notes/context**: Likely cross-test state accumulation on the shared seed troupe / reused `sub-platform-members-admin` identity. Discovered 2026-05-31 while validating the re-add reactivation work. Recommend isolating the suite or resetting state between tests before relying on the full-suite gate in CI.

---

## Fixed

### BUG-003 — Dispos « Tous » hint « estimés » trompeur après tirage multi-rôles
- **ID**: BUG-003
- **Status**: Fixed
- **Severity**: Medium (recette manuelle 2026-05-31)
- **Affected area**: `CompositionDrawService` ; `AvailabilityService` ; UI `availability-tous-panel`
- **Observed behavior**: Après tirage sur événement passé **AAAA**, hint global **« estimés »** alors que la majorité des % étaient capturés ; candidats multi-rôles (Max mc, Sophie dj) sans snapshot **player**.
- **Expected behavior**: Snapshots à l'**ouverture** du tirage par rôle ; hint **« capturés »** si snapshots existent ; avertissement **par rôle** seulement en cas de repli partiel.
- **Cause**: Snapshots pris par itération de slot avec `crossRoleExcluded` cumulatif (ordre dj→mc→player) ; `chanceSource` global `estimated` dès un candidat sans snapshot.
- **Fix**: `captureOpeningDrawSnapshots()` ; `chanceSource=snapshot` si snapshots ; `hasPartialEstimatedChances` + icône/tooltip par rôle.
- **Notes/context**: Story **6.14** ; re-draw nécessaire sur événements déjà tirés pour régénérer les snapshots.

### BUG-002 — Member glance stats ignore decline-only compositions (V1 parity gap)
- **ID**: BUG-002
- **Status**: Fixed
- **Severity**: Medium (post-migration recette: stats « Mes stats » diverge from V1 prod)
- **Affected area**: V2 API `SeasonGlanceStatsProvider` (`services/api/.../memberprofile/`); member profile UI (`apps/web/.../member-profile/`). **Not** MIG-3 load — declines are in `event_composition_declines`.
- **Observed behavior**: After La Malice migration cycle 1 (2026-05-29), member stats on staging show **0 désistements** and fewer **sélections** than V1 prod for the same user (e.g. Patrice: V1 3 declines / 10 selections vs V2 0 / 8). Disponibilités match. Decline rows exist in migrated SQL (`load-ac.sql`).
- **Expected behavior**: V1 parity (`GridBoard.vue` `getPlayerStats`): a player who was selected then declined counts toward **initial selections** and **désistements** even when they appear only in `cast.declined` (no slot in `cast.roles`). V2 should treat `event_composition_declines` without a matching slot the same way.
- **Cause**: `hasInitialSelection()` only considers `event_composition_slots` and excludes declined slots; decline-only migrated records are ignored. `chartBlockForEvent` may show decline-only as unavailable instead of declined.
- **Fix**: `SeasonGlanceStatsProvider` — `hasDeclineOnlyInitialSelection()` for MIG-3 decline-only rows; `hasSlottedInitialSelection()` kept for effective availability (V1 `countEffectiveAvailability`); `chartBlockForEvent` surfaces decline-only as `declined`. Tests: `SeasonGlanceStatsProviderTest`.
- **Notes/context**: Documented in `_bmad-output/implementation-artifacts/migration-recette-malicie-cycle-1-findings.md` (FINDING-001). Discovered during manual migration recette; **does not fail** automated migrate smoke.

### BUG-DOC-001 — V1 export docs/scripts use `--database=default` instead of `(default)`
- **ID**: BUG-DOC-001
- **Status**: Fixed
- **Severity**: Medium (blocked V1 production exports/migration until the correct id is used)
- **Affected area**: Migration tooling — `docs/v2/migration/preprod-reset-and-migrate.md`, `scripts/v1-export-*.js`, `scripts/replay/loadSeasonData.js`, ADR-0014
- **Observed behavior**: Running V1 export/inspection against production with `--database=default` fails with gRPC `5 NOT_FOUND`. `firebase-admin` `getFirestore(app, 'default')` looks for a database literally named `default`, which does not exist.
- **Expected behavior**: Production Firestore default database id is `(default)`. Commands must pass `--database='(default)'` (or scripts should normalize `default` → `(default)`).
- **Cause**: Docs/scripts conflate the human label "default" with the Firestore default database id `(default)` (already noted correctly in ADR-0002/ADR-0014 context).
- **Fix**: Story **MIG-2** — added `normalizeDatabaseId()` in `scripts/replay/loadSeasonData.js`; `getDb` now maps `default`/empty → `(default)`, so both `--database=default` and `--database='(default)'` work. Runbook `preprod-reset-and-migrate.md` updated (matrix + note).
- **Notes/context**: Discovered 2026-05-29 while profiling La Malice for MIG-3 (ADR-0016); fixed same day with MIG-2.

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

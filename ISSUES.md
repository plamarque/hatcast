# ISSUES

This document is the **factual issue registry** for the project. It tracks bugs, defects, limitations, and anomalous behaviors discovered during development, testing, or usage.

This is **not** a planning document. Fixing an issue may result in a task in PLAN.md or be handled opportunistically during a slice. ISSUES.md is **informational (non-normative)**; SPEC, PLAN, and ARCH remain the normative sources for requirements, delivery, and architecture.

**When adding an issue:** use a unique ID (e.g. BUG-002), and include at least: Status, Severity, Affected area, Observed behavior, Expected behavior, Notes/context. Optional: Cause, Fix, Repro.

---

## Open Issues

### UX-001 — Onglet Équipe : mutations lentes sans retour visuel global
- **ID**: UX-001
- **Status**: Open
- **Severity**: Medium (MVP pilote validé fonctionnellement, expérience dégradée)
- **Affected area**: V2 `apps/web` — `event-equipe-tab` (tirage, assignation, validation, confirmation, compléter)
- **Observed behavior** (recette MVP pilote, 2026-05-25, admin seul) : Tirage (B), assignation manuelle (C), confirmations proxy (D), compléter (E) — chaque action reste plusieurs secondes **sans feedback visible** (pas d’overlay / blocage de la grille), puis l’écran se rafraîchit. Spinners limités au bouton concerné (`drawing`, `validating`, `assigning`, `updatingParticipation`) faciles à manquer.
- **Expected behavior**: Retour immédiat (overlay, désactivation de la grille, barre de progression ou skeleton) pendant l’appel API **et** les rechargements en chaîne ; latence perçue sous 1 s en dev local idéalement.
- **Notes/context**: Story **6.11** livrée : overlay plein onglet + `aria-busy`, plus de `loadEvent()` après mutation composition, fin de tirage sans GET redondant. Latence serveur ~1 s/mutation (voir PERF-001). Animation tirage raccourcie (450 ms/étape). Recette humaine en attente pour clôture.

### UX-002 — Bouton « Déverrouiller » peu identifiable comme action
- **ID**: UX-002
- **Status**: Open
- **Severity**: Low
- **Affected area**: V2 `event-equipe-tab` — styles `.event-equipe-tab__unlock`
- **Observed behavior** (scénario C, post-validation) : le bouton **Déverrouiller** (`background: transparent`, bord fin) ne se distingue pas assez d’un lien ou d’un libellé par rapport à **Valider** (bouton plein vert).
- **Expected behavior**: Affordance bouton secondaire cohérente Material (contour + fond léger ou `mat-stroked-button`).
- **Notes/context**: Corrigé en 6.11 (`mat-stroked-button` sur Déverrouiller). À fermer après recette visuelle.

### PERF-001 — Actions composition (API + rechargements) anormalement lentes en dev
- **ID**: PERF-001
- **Status**: Open
- **Severity**: Medium
- **Affected area**: V2 API composition + front `composition-api.service` / `event-detail` reload
- **Observed behavior**: Même symptôme que UX-001 — toutes les mutations composition (draw, assign, validate, participation, gap-fill) ressenties comme lentes en recette MVP (un admin, seed Neon dev).
- **Expected behavior**: Identifier si la lenteur vient du RTT Neon, du coût serveur (candidats, tirage, lifecycle), ou du front (rechargements redondants). Cible : mesurer p95 des endpoints `/composition/*` et réduire les allers-retours après mutation.
- **Notes/context**: Profilage 2026-05-25 : cause = `ensureMembershipParticipants` N+1 + explainability complète + `resolveViewerParticipantIds` chargeant 35 lignes à chaque mutation. Correctifs : bulk/cache/`JOIN FETCH`, fast path mutations sans explainability, requêtes viewer ciblées, `saveAll` slots au tirage. Logs 2026-05-25 : mutations HTTP **~0,95–1,2 s** (assign L91, validate L123, unlock L95) vs **~7–12 s** initial ; `explainMs≈0` sur mutations (L90) ; overlay ~1 s puis animation tirage ~3 s (5×450 ms). Index SQL déjà OK (EXPLAIN sous 1 ms). RTT Neon + travail métier restant ~400 ms/req hors SQL.

### LIMIT-002 — Admin back-office pages still use legacy header (chevron back, no breadcrumb)
- **ID**: LIMIT-002
- **Status**: Open
- **Severity**: Low (UX inconsistency; navigation works)
- **Affected area**: V2 `apps/web` — admin chrome on `/saison/:slug/admin/participants`, event-scoped participant admin (same component), `/troupe/:slug/admin/membres` (and legacy `/troupe/...` alias)
- **Observed behavior** (recette post–Story 17.2, 2026-05-25): These screens keep a **chevron back** to agenda/workspace and **no** `app-context-breadcrumb`, unlike season workspace, event detail, and troupe hub after Epic 17.1–17.2.
- **Expected behavior** (future): Align admin pages with ADR 0013 chrome — breadcrumb (troupe › saison › … › admin leaf) and **no** redundant back chevron; consistent with member-facing deep screens.
- **Notes/context**: **Out of scope** for Stories 17.1 and 17.2 (scope admin **menu** entry only). Captured at 17.2 closure per PO. **Scheduled:** Epic 17 **Story 17.11** (`17-11-breadcrumb-pages-admin-back-office.md`, `ready-for-dev`). Suggested order: after **17.5**. See `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md` § Follow-up and `sprint-change-proposal-2026-05-25-epic17-admin-chrome-stories.md`.

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

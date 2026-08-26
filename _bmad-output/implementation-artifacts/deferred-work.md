# Deferred Work

### DW-129: Versions `posthog-js` divergentes entre legacy (^1.391.2) et web (^1.379.2) — aligner à terme, hors scope critique cutover M4.

origin: migrated from legacy ledger ("Deferred from: code review of 11-3-v1-v2-cutover-funnel-posthog (2026-06-19)"), 2026-08-26
location: n/a
reason: Versions `posthog-js` divergentes entre legacy (^1.391.2) et web (^1.379.2) — aligner à terme, hors scope critique cutover M4.
status: open

### DW-130: Tests V1 sans mock PostHog initialisé — couverture partielle AC15 acceptable MVP ; renforcer si régression funnel.

origin: migrated from legacy ledger ("Deferred from: code review of 11-3-v1-v2-cutover-funnel-posthog (2026-06-19)"), 2026-08-26
location: n/a
reason: Tests V1 sans mock PostHog initialisé — couverture partielle AC15 acceptable MVP ; renforcer si régression funnel.
status: open

### DW-131: `ObjectProvider<DrawWeightPipeline>` court-circuite la résolution — pattern test voulu (story 19.18 task 6), conservé pour `@Primary` test beans.

origin: migrated from legacy ledger ("Deferred from: code review of 19-18-api-politiques-tirage-troupe-saison (2026-06-19)"), 2026-08-26
location: n/a
reason: `ObjectProvider<DrawWeightPipeline>` court-circuite la résolution — pattern test voulu (story 19.18 task 6), conservé pour `@Primary` test beans.
status: open

### DW-132: Course concurrente sur upsert politique — fenêtre TOCTOU rare ; index unique V65 ; retry non implémenté MVP.

origin: migrated from legacy ledger ("Deferred from: code review of 19-18-api-politiques-tirage-troupe-saison (2026-06-19)"), 2026-08-26
location: n/a
reason: Course concurrente sur upsert politique — fenêtre TOCTOU rare ; index unique V65 ; retry non implémenté MVP.
status: open

### DW-133: GET politique 404 ambigu (troupe vs politique absente) — fuite d’information mineure ; pattern cohérent 19.17.

origin: migrated from legacy ledger ("Deferred from: code review of 19-18-api-politiques-tirage-troupe-saison (2026-06-19)"), 2026-08-26
location: n/a
reason: GET politique 404 ambigu (troupe vs politique absente) — fuite d’information mineure ; pattern cohérent 19.17.
status: open

### DW-134: Pas de verrou optimiste / ETag sur PUT politique — last-write-wins MVP ; UI admin 19.20 pourra ajouter precondition.

origin: migrated from legacy ledger ("Deferred from: code review of 19-18-api-politiques-tirage-troupe-saison (2026-06-19)"), 2026-08-26
location: n/a
reason: Pas de verrou optimiste / ETag sur PUT politique — last-write-wins MVP ; UI admin 19.20 pourra ajouter precondition.
status: open

### DW-135: TOCTOU between policy reference check and archive save — MVP race window accepted at current scale.

origin: migrated from legacy ledger ("Deferred from: code review of 19-17-api-crud-formules-tirage (2026-06-16)"), 2026-08-26
location: n/a
reason: TOCTOU between policy reference check and archive save — MVP race window accepted at current scale.
status: open

### DW-136: O(n) in-memory policy scan on every archive — Dev Notes explicitly defer DB JSON query at MVP scale.

origin: migrated from legacy ledger ("Deferred from: code review of 19-17-api-crud-formules-tirage (2026-06-16)"), 2026-08-26
location: n/a
reason: O(n) in-memory policy scan on every archive — Dev Notes explicitly defer DB JSON query at MVP scale.
status: open

### DW-137: Version bump on no-op PATCH — minor versioning noise, low impact.

origin: migrated from legacy ledger ("Deferred from: code review of 19-17-api-crud-formules-tirage (2026-06-16)"), 2026-08-26
location: n/a
reason: Version bump on no-op PATCH — minor versioning noise, low impact.
status: open

### DW-138: Avatar URL without storage read (metadata-only hot path) — intentional PERF-15 trade-off per dev notes; hot path skips `readAvatarContent`.

origin: migrated from legacy ledger ("Deferred from: code review of perf-15-composition-summary-api-hot-path (2026-06-10)"), 2026-08-26
location: n/a
reason: Avatar URL without storage read (metadata-only hot path) — intentional PERF-15 trade-off per dev notes; hot path skips `readAvatarContent`.
status: open

### DW-139: Neon gate command not in DEVELOPMENT.md — KDoc on `NeonCompositionSummaryPerformanceIntegrationTest` sufficient for manual CI gate.

origin: migrated from legacy ledger ("Deferred from: code review of perf-15-composition-summary-api-hot-path (2026-06-10)"), 2026-08-26
location: n/a
reason: Neon gate command not in DEVELOPMENT.md — KDoc on `NeonCompositionSummaryPerformanceIntegrationTest` sufficient for manual CI gate.
status: open

### DW-140: JOIN FETCH cartesian risk on large rosters — JDBC budget passes on Improbots seed; monitor via PERF-16 headers.

origin: migrated from legacy ledger ("Deferred from: code review of perf-15-composition-summary-api-hot-path (2026-06-10)"), 2026-08-26
location: n/a
reason: JOIN FETCH cartesian risk on large rosters — JDBC budget passes on Improbots seed; monitor via PERF-16 headers.
status: open

### DW-141: `loginEmail` and default seed credentials written in JSON report — pre-existing in perf script; local-only artifact.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: `loginEmail` and default seed credentials written in JSON report — pre-existing in perf script; local-only artifact.
status: open

### DW-142: `attachApiListeners` pending-map leak / query-string endpoint merge — pre-existing before PERF-14 refactor.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: `attachApiListeners` pending-map leak / query-string endpoint merge — pre-existing before PERF-14 refactor.
status: open

### DW-143: `networkidle` timeout swallowed in `waitForReady` — pre-existing; acceptable for dev gate script.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: `networkidle` timeout swallowed in `waitForReady` — pre-existing; acceptable for dev gate script.
status: open

### DW-144: `isMain` path compare fragile on Windows — pre-existing pattern; team dev on macOS.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: `isMain` path compare fragile on Windows — pre-existing pattern; team dev on macOS.
status: open

### DW-145: No Playwright E2E for `--in-app` flux — manual validation documented in story; out of PERF-14 scope.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: No Playwright E2E for `--in-app` flux — manual validation documented in story; out of PERF-14 scope.
status: open

### DW-146: UI selector coupling (French tab labels, CSS classes) — acceptable for internal perf gate script.

origin: migrated from legacy ledger ("Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)"), 2026-08-26
location: n/a
reason: UI selector coupling (French tab labels, CSS classes) — acceptable for internal perf gate script.
status: open

### DW-147: AC3 FR19/FR24 orgas sans test PERF-13 dédié — couverture via `composition-explainability.spec.ts` et tests event-detail préexistants.

origin: migrated from legacy ledger ("Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)"), 2026-08-26
location: n/a
reason: AC3 FR19/FR24 orgas sans test PERF-13 dédié — couverture via `composition-explainability.spec.ts` et tests event-detail préexistants.
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt:232-346 covers the formerly missing FR19/FR24 cases

### DW-148: AC1 sans test PERF-13 composition Dispos — gate `ensureCompositionLoaded()` couvert par PERF-03 / story 5.9.

origin: migrated from legacy ledger ("Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)"), 2026-08-26
location: n/a
reason: AC1 sans test PERF-13 composition Dispos — gate `ensureCompositionLoaded()` couvert par PERF-03 / story 5.9.
status: open

### DW-149: `ensureChancesLoaded` échec API / rejet promesse — pre-existing ; snack sur `!ok` mais pas de `catch` sur reject (`availability-poll.ts`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)"), 2026-08-26
location: n/a
reason: `ensureChancesLoaded` échec API / rejet promesse — pre-existing ; snack sur `!ok` mais pas de `catch` sur reject (`availability-poll.ts`).
status: open

### DW-150: Course bootstrap vs `load()` in-flight — pre-existing ; bootstrap peut être écrasé si fetch déjà lancé (`event-dispos-tab.ts`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)"), 2026-08-26
location: n/a
reason: Course bootstrap vs `load()` in-flight — pre-existing ; bootstrap peut être écrasé si fetch déjà lancé (`event-dispos-tab.ts`).
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/shared/availability/event-dispos-tab.ts:87-113,184-210 guards bootstrap/load generations

### DW-151: `bootstrapSummary` stale au changement d'événement — pre-existing ; pas de validation eventId (`event-dispos-tab.ts`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)"), 2026-08-26
location: n/a
reason: `bootstrapSummary` stale au changement d'événement — pre-existing ; pas de validation eventId (`event-dispos-tab.ts`).
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/shared/availability/event-dispos-tab.ts:87-113,192-200 rejects stale event bootstrap state

### DW-152: AC4 seuil ≤ 300 ms non mesuré — waiver PERF-14 documenté dans la story ; proxy test DOM seulement.

origin: migrated from legacy ledger ("Deferred from: code review of perf-12-accueil-progressive-render (2026-06-10)"), 2026-08-26
location: n/a
reason: AC4 seuil ≤ 300 ms non mesuré — waiver PERF-14 documenté dans la story ; proxy test DOM seulement.
status: open

### DW-153: `peekFreshCache` avec `boundUserId === null` — comportement préexistant PERF-02 (`isCacheForBoundUser` retourne true).

origin: migrated from legacy ledger ("Deferred from: code review of perf-12-accueil-progressive-render (2026-06-10)"), 2026-08-26
location: n/a
reason: `peekFreshCache` avec `boundUserId === null` — comportement préexistant PERF-02 (`isCacheForBoundUser` retourne true).
status: open

### DW-154: Promesses async sans annulation post-`ngOnDestroy` — pattern courant Angular hors scope PERF-12.

origin: migrated from legacy ledger ("Deferred from: code review of perf-12-accueil-progressive-render (2026-06-10)"), 2026-08-26
location: n/a
reason: Promesses async sans annulation post-`ngOnDestroy` — pattern courant Angular hors scope PERF-12.
status: open

### DW-155: AC4 profilage wall recette — validation manuelle `profile-web-performance.mjs` recommandée en recette (Completion Notes).

origin: migrated from legacy ledger ("Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)"), 2026-08-26
location: n/a
reason: AC4 profilage wall recette — validation manuelle `profile-web-performance.mjs` recommandée en recette (Completion Notes).
status: open

### DW-156: syncInitialFilterUrl bloque premier loadAgenda — waterfall résiduel hors scope minimal PERF-11.

origin: migrated from legacy ledger ("Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)"), 2026-08-26
location: n/a
reason: syncInitialFilterUrl bloque premier loadAgenda — waterfall résiduel hors scope minimal PERF-11.
status: open

### DW-157: troupeContext.load fire-and-forget pour edit dispos — trade-off accepté story (filtres API, pas troupe catalog).

origin: migrated from legacy ledger ("Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)"), 2026-08-26
location: n/a
reason: troupeContext.load fire-and-forget pour edit dispos — trade-off accepté story (filtres API, pas troupe catalog).
status: open

### DW-158: Gate perf H2 ≠ prod Neon — même pattern que PERF-06.

origin: migrated from legacy ledger ("Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)"), 2026-08-26
location: n/a
reason: Gate perf H2 ≠ prod Neon — même pattern que PERF-06.
status: open

### DW-159: 4 requêtes participation mono-troupe inchangées — EXISTS early exit seulement sans participation.

origin: migrated from legacy ledger ("Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)"), 2026-08-26
location: n/a
reason: 4 requêtes participation mono-troupe inchangées — EXISTS early exit seulement sans participation.
status: open

### DW-160: Breakdown accessible sur événement archivé via fallback `CompositionExplainabilityAccess` (pas de garde `archived`) — trou pré-existant, rendu visible par l'union Dispos+Équipe sur `resolveShowExplainability`.

origin: migrated from legacy ledger ("Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)"), 2026-08-26
location: n/a
reason: Breakdown accessible sur événement archivé via fallback `CompositionExplainabilityAccess` (pas de garde `archived`) — trou pré-existant, rendu visible par l'union Dispos+Équipe sur `resolveShowExplainability`.
status: open

### DW-161: AC-4 : pas de test « composition publiée non validée → slots Équipe visibles membre » — incertitude runtime reconnue dans l'AC ; hors scope non-goals 5.9.

origin: migrated from legacy ledger ("Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)"), 2026-08-26
location: n/a
reason: AC-4 : pas de test « composition publiée non validée → slots Équipe visibles membre » — incertitude runtime reconnue dans l'AC ; hors scope non-goals 5.9.
status: open

### DW-162: M3-3 : pas de test E2E/composant « tap % → breakdown sheet » sans composition préchargée — dette test UI.

origin: migrated from legacy ledger ("Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)"), 2026-08-26
location: n/a
reason: M3-3 : pas de test E2E/composant « tap % → breakdown sheet » sans composition préchargée — dette test UI.
status: open

### DW-163: OpenAPI `availability.yaml` : pas de doc du 403 explainability vs membership — amélioration doc.

origin: migrated from legacy ledger ("Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)"), 2026-08-26
location: n/a
reason: OpenAPI `availability.yaml` : pas de doc du 403 explainability vs membership — amélioration doc.
status: open

### DW-164: Chemins `EVENT_ORGANIZER` / `SEASON_ORGANIZER` pour `canManageComposition` non couverts par tests — pré-existant.

origin: migrated from legacy ledger ("Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)"), 2026-08-26
location: n/a
reason: Chemins `EVENT_ORGANIZER` / `SEASON_ORGANIZER` pour `canManageComposition` non couverts par tests — pré-existant.
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/OrganizerAccessServiceTest.kt:19-54 covers organizer access paths

### DW-165: Pas de budget `angular.json` sur chunks lazy (hors scope initial bundle PERF-08).

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de budget `angular.json` sur chunks lazy (hors scope initial bundle PERF-08).
status: open

### DW-166: Pas de handler erreur chargement chunk / PWA stale chunk — risque amplifié par lazy routes, story perf séparée.

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de handler erreur chargement chunk / PWA stale chunk — risque amplifié par lazy routes, story perf séparée.
status: open

### DW-167: Waterfall lazy parent+enfant sur `/compte` — tradeoff accepté pour réduire le bundle initial.

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Waterfall lazy parent+enfant sur `/compte` — tradeoff accepté pour réduire le bundle initial.
status: open

### DW-168: Délai spinner sur redirects legacy (`SaisonLegacyRedirect`, onglets compte) — tradeoff perf vs UX immédiate.

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Délai spinner sur redirects legacy (`SaisonLegacyRedirect`, onglets compte) — tradeoff perf vs UX immédiate.
status: open

### DW-169: Pas de wildcard `` sous `MemberShell` — pré-existant, outlet vide sur URL invalide.

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de wildcard `` sous `MemberShell` — pré-existant, outlet vide sur URL invalide.
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/app.routes.ts:55-105 now defines the member-shell wildcard route

### DW-170: Stratégie preload post-login absente — follow-up perf (PERF plan vague 3+).

origin: migrated from legacy ledger ("Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)"), 2026-08-26
location: n/a
reason: Stratégie preload post-login absente — follow-up perf (PERF plan vague 3+).
status: open

### DW-171: Tests intégration 403/404 non couverts — gap pattern similaire à d'autres endpoints BFF.

origin: migrated from legacy ledger ("Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Tests intégration 403/404 non couverts — gap pattern similaire à d'autres endpoints BFF.
status: open

### DW-172: Schémas OpenAPI dupliqués (`SeasonWorkspaceParticipantSelector` vs DTO canonique) — qualité contrat, pas de régression runtime.

origin: migrated from legacy ledger ("Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Schémas OpenAPI dupliqués (`SeasonWorkspaceParticipantSelector` vs DTO canonique) — qualité contrat, pas de régression runtime.
status: open

### DW-173: Aucun test automatisé du budget ≤3 appels AC2 — assertion manuelle dans dev notes.

origin: migrated from legacy ledger ("Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Aucun test automatisé du budget ≤3 appels AC2 — assertion manuelle dans dev notes.
status: open

### DW-174: Bascule history→agenda bypass le BFF — follow-up documenté dans dev notes.

origin: migrated from legacy ledger ("Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Bascule history→agenda bypass le BFF — follow-up documenté dans dev notes.
status: open

### DW-175: Fix `enableExplainabilityForChances` hors scope PERF-07 — autre story (19.7).

origin: migrated from legacy ledger ("Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Fix `enableExplainabilityForChances` hors scope PERF-07 — autre story (19.7).
status: open

### DW-176: AC1 non couvert par les tests ajoutés — bindings `[viewerGender]` vérifiés en revue code sur les 3 templates ; pas d'assertion DOM dans le diff PERF-05.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: AC1 non couvert par les tests ajoutés — bindings `[viewerGender]` vérifiés en revue code sur les 3 templates ; pas d'assertion DOM dans le diff PERF-05.
status: open

### DW-177: Race timing parent lent / enfant précoce non testée — atténuée par `await loadViewerGender()` dans `ngOnInit` avant rendu liste ; motivation story non simulée en test.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: Race timing parent lent / enfant précoce non testée — atténuée par `await loadViewerGender()` dans `ngOnInit` avant rendu liste ; motivation story non simulée en test.
status: open

### DW-178: Effet `cacheRevision` non testé sur `user-agenda` / `member-home-todo` — reload genre après invalidation cache ; couverture PERF-01, hors patch minimal PERF-05.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: Effet `cacheRevision` non testé sur `user-agenda` / `member-home-todo` — reload genre après invalidation cache ; couverture PERF-01, hors patch minimal PERF-05.
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/pages/user-agenda/user-agenda.ts:103-115 and member-home-todo.ts:68-80 react to cacheRevision

### DW-179: Chemins échec `getPreferences` (preload KO → refetch enfant) non testés — au-delà des AC story.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: Chemins échec `getPreferences` (preload KO → refetch enfant) non testés — au-delà des AC story.
status: open

### DW-180: Chaîne intégration `season-home` → `season-agenda` non testée — test isolé `SeasonAgenda` couvre le contrat input `viewerGender`.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: Chaîne intégration `season-home` → `season-agenda` non testée — test isolé `SeasonAgenda` couvre le contrat input `viewerGender`.
status: open

### DW-181: `sprint-status.yaml` : changements collatéraux (`5-8`, `perf-04`) dans le même diff — hors périmètre PERF-05.

origin: migrated from legacy ledger ("Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)"), 2026-08-26
location: n/a
reason: `sprint-status.yaml` : changements collatéraux (`5-8`, `perf-04`) dans le même diff — hors périmètre PERF-05.
status: open

### DW-182: Gate S2 non profilé — AC3 non prouvé ; valider manuellement via `node scripts/v2/profile-web-performance.mjs` (serveur dev `--with-push`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-04-session-context-cache (2026-06-09)"), 2026-08-26
location: n/a
reason: Gate S2 non profilé — AC3 non prouvé ; valider manuellement via `node scripts/v2/profile-web-performance.mjs` (serveur dev `--with-push`).
status: open

### DW-183: `ContextSwitcherDataService` non réinitialisé sur invalidation troupes/session — `initialized` court-circuite `ensureReady` ; état switcher potentiellement stale après switch user ; architectural, hors scope PERF-04.

origin: migrated from legacy ledger ("Deferred from: code review of perf-04-session-context-cache (2026-06-09)"), 2026-08-26
location: n/a
reason: `ContextSwitcherDataService` non réinitialisé sur invalidation troupes/session — `initialized` court-circuite `ensureReady` ; état switcher potentiellement stale après switch user ; architectural, hors scope PERF-04.
status: open

### DW-184: Gate AC4 profilage Event Infos ≤ 1,2 s non exécutée — validation manuelle post-merge via `node scripts/v2/profile-web-performance.mjs`.

origin: migrated from legacy ledger ("Deferred from: code review of perf-03-event-detail-tab-gated-load (2026-06-09)"), 2026-08-26
location: n/a
reason: Gate AC4 profilage Event Infos ≤ 1,2 s non exécutée — validation manuelle post-merge via `node scripts/v2/profile-web-performance.mjs`.
status: open

### DW-185: `reloadEvent` silent ne réinitialise pas composition — comportement préexistant ; cache composition peut diverger après reload silencieux sur onglet Équipe (`event-detail.ts:648-657`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-03-event-detail-tab-gated-load (2026-06-09)"), 2026-08-26
location: n/a
reason: `reloadEvent` silent ne réinitialise pas composition — comportement préexistant ; cache composition peut diverger après reload silencieux sur onglet Équipe (`event-detail.ts:648-657`).
status: open

### DW-186: Duplication copy guidelines entre `resolveCompositionEquipeStatusFromEvent` et `resolveCompositionEquipeStatus` — dette maintenance, hors scope perf.

origin: migrated from legacy ledger ("Deferred from: code review of perf-03-event-detail-tab-gated-load (2026-06-09)"), 2026-08-26
location: n/a
reason: Duplication copy guidelines entre `resolveCompositionEquipeStatusFromEvent` et `resolveCompositionEquipeStatus` — dette maintenance, hors scope perf.
status: open

### DW-187: GET en échec non mis en cache — retry à chaque appel ; pattern d’erreur préexistant, impact marginal avec dedup parent (`me-preferences-api.service.ts`).

origin: migrated from legacy ledger ("Deferred from: code review of perf-01-deduplicate-me-preferences (2026-06-09)"), 2026-08-26
location: n/a
reason: GET en échec non mis en cache — retry à chaque appel ; pattern d’erreur préexistant, impact marginal avec dedup parent (`me-preferences-api.service.ts`).
status: open

### DW-188: Pas de sync multi-onglets — cache mémoire process ; limitation navigateur hors scope PERF-01.

origin: migrated from legacy ledger ("Deferred from: code review of perf-01-deduplicate-me-preferences (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de sync multi-onglets — cache mémoire process ; limitation navigateur hors scope PERF-01.
status: open

### DW-189: Échec silencieux `loadViewerGender` — signal reste `undefined`, pas de retry ; pattern préexistant sur les trois pages parentes.

origin: migrated from legacy ledger ("Deferred from: code review of perf-01-deduplicate-me-preferences (2026-06-09)"), 2026-08-26
location: n/a
reason: Échec silencieux `loadViewerGender` — signal reste `undefined`, pas de retry ; pattern préexistant sur les trois pages parentes.
status: open

### DW-190: Dispatch proxy par égalité de `decisionLabel` (fragile si labels changent) — pattern préexistant étendu, pas introduit par 6.24.

origin: migrated from legacy ledger ("Deferred from: code review of 6-24-participation-copy-declinaison-desistement-retrait (2026-06-09)"), 2026-08-26
location: n/a
reason: Dispatch proxy par égalité de `decisionLabel` (fragile si labels changent) — pattern préexistant étendu, pas introduit par 6.24.
status: open

### DW-191: Clé enum `DECLINE_RESTORED` non renommée — explicit non-goal story (identifiants techniques inchangés).

origin: migrated from legacy ledger ("Deferred from: code review of 6-24-participation-copy-declinaison-desistement-retrait (2026-06-09)"), 2026-08-26
location: n/a
reason: Clé enum `DECLINE_RESTORED` non renommée — explicit non-goal story (identifiants techniques inchangés).
status: open

### DW-192: Paramètre optionnel `statusBeforeDecline` sans garde — risque latent faible, call sites actuels corrects.

origin: migrated from legacy ledger ("Deferred from: code review of 6-24-participation-copy-declinaison-desistement-retrait (2026-06-09)"), 2026-08-26
location: n/a
reason: Paramètre optionnel `statusBeforeDecline` sans garde — risque latent faible, call sites actuels corrects.
status: open

### DW-193: Cibles tactiles &lt; 48 dp sur segments pool et trigger % grille — waiver PO documenté `FRONTEND_UI.md` ; follow-up post-release 19.7.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)"), 2026-08-26
location: n/a
reason: Cibles tactiles &lt; 48 dp sur segments pool et trigger % grille — waiver PO documenté `FRONTEND_UI.md` ; follow-up post-release 19.7.
status: open

### DW-194: Boutons imbriqués dans `composition-slot-picker-dialog` — waiver PO documenté ; dette a11y connue, pattern Dispos corrigé.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)"), 2026-08-26
location: n/a
reason: Boutons imbriqués dans `composition-slot-picker-dialog` — waiver PO documenté ; dette a11y connue, pattern Dispos corrigé.
status: open

### DW-195: `indexOf` O(n²) dans boucle facteurs `ChanceBreakdownCalculator` — un seul facteur en prod aujourd’hui.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)"), 2026-08-26
location: n/a
reason: `indexOf` O(n²) dans boucle facteurs `ChanceBreakdownCalculator` — un seul facteur en prod aujourd’hui.
status: open

### DW-196: Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)"), 2026-08-26
location: n/a
reason: Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs.
status: open

### DW-197: Seuil vert pool `chancePoolTier` à 75 % vs spec UX « ≥ ~70 % » — écart visuel mineur, recette PO OK.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)"), 2026-08-26
location: n/a
reason: Seuil vert pool `chancePoolTier` à 75 % vs spec UX « ≥ ~70 % » — écart visuel mineur, recette PO OK.
status: open

### DW-198: `requiredCount <= 0` sans garde dans `baseWeight` — pré-existant (`legacyBaseWeight` identique).

origin: migrated from legacy ledger ("Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)"), 2026-08-26
location: n/a
reason: `requiredCount <= 0` sans garde dans `baseWeight` — pré-existant (`legacyBaseWeight` identique).
status: open

### DW-199: `FACTOR_ID` non asserté en test — couverture prévue story 19.7 (breakdown).

origin: migrated from legacy ledger ("Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)"), 2026-08-26
location: n/a
reason: `FACTOR_ID` non asserté en test — couverture prévue story 19.7 (breakdown).
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt:41,205,268 asserts FACTOR_ID

### DW-200: Pas de log WARNING sur multiplicateur invalide dans `sanitizeMultiplier` — hors scope V1.

origin: migrated from legacy ledger ("Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)"), 2026-08-26
location: n/a
reason: Pas de log WARNING sur multiplicateur invalide dans `sanitizeMultiplier` — hors scope V1.
status: open

### DW-201: Clamp `pastSelectionCount` négatif silencieux dans `PastParticipationFactor` — option défensive acceptée par spec 19.6.

origin: migrated from legacy ledger ("Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)"), 2026-08-26
location: n/a
reason: Clamp `pastSelectionCount` négatif silencieux dans `PastParticipationFactor` — option défensive acceptée par spec 19.6.
status: open

### DW-202: Test V1 via base manuelle dans `PastParticipationFactorTest` — chemin intégré couvert par `AvailabilityChanceCalculatorDrawTest`.

origin: migrated from legacy ledger ("Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)"), 2026-08-26
location: n/a
reason: Test V1 via base manuelle dans `PastParticipationFactorTest` — chemin intégré couvert par `AvailabilityChanceCalculatorDrawTest`.
status: open

### DW-203: Garde-fous multiplicateurs pipeline (NaN, négatif, infini) — traiter avec premier facteur réel (19.6).

origin: migrated from legacy ledger ("Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)"), 2026-08-26
location: n/a
reason: Garde-fous multiplicateurs pipeline (NaN, négatif, infini) — traiter avec premier facteur réel (19.6).
status: done 2026-08-26
resolution: already resolved: services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt:18-22 rejects NaN infinite and negative multipliers

### DW-204: `pastSelectionCount` négatif non validé — contrat appelant V1 inchangé.

origin: migrated from legacy ledger ("Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)"), 2026-08-26
location: n/a
reason: `pastSelectionCount` négatif non validé — contrat appelant V1 inchangé.
status: open

### DW-205: `DrawWeightContext` sans `eventId` — extension Wave B/C (19.6+).

origin: migrated from legacy ledger ("Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)"), 2026-08-26
location: n/a
reason: `DrawWeightContext` sans `eventId` — extension Wave B/C (19.6+).
status: open

### DW-206: Spec normative sans section pipeline — comportement identique ; doc story + ADR suffisent pour 19.5.

origin: migrated from legacy ledger ("Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)"), 2026-08-26
location: n/a
reason: Spec normative sans section pipeline — comportement identique ; doc story + ADR suffisent pour 19.5.
status: done 2026-08-26
resolution: already resolved: docs/v2/technical/draw-weight-engine-v1-spec.md:89-92,143-199,254-355 documents the pipeline normatively

### DW-207: Double calcul poids (`toWeightedCandidates` + `scoreCandidates`) dans `CompositionDrawService` — pré-existant, hors 19.5.

origin: migrated from legacy ledger ("Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)"), 2026-08-26
location: n/a
reason: Double calcul poids (`toWeightedCandidates` + `scoreCandidates`) dans `CompositionDrawService` — pré-existant, hors 19.5.
status: open

### DW-208: Pagination saisons limitée à 50 (`SEASONS_PAGE_SIZE`) — pattern hérité de 17.4 ; troupes avec >50 saisons rares.

origin: migrated from legacy ledger ("Deferred from: code review of 17-42-hub-troupe-dashboard-collectif (2026-06-12)"), 2026-08-26
location: n/a
reason: Pagination saisons limitée à 50 (`SEASONS_PAGE_SIZE`) — pattern hérité de 17.4 ; troupes avec >50 saisons rares.
status: open

### DW-209: Tests races async / bottom sheet mobile — couverture happy-path suffisante pour MVP ; scénarios switch rapide à renforcer ultérieurement.

origin: migrated from legacy ledger ("Deferred from: code review of 17-42-hub-troupe-dashboard-collectif (2026-06-12)"), 2026-08-26
location: n/a
reason: Tests races async / bottom sheet mobile — couverture happy-path suffisante pour MVP ; scénarios switch rapide à renforcer ultérieurement.
status: open

### DW-210: Backlog confort (coût vs bénéfice)

origin: migrated from legacy ledger ("Matrice rapide"), 2026-08-26
location: n/a
reason: Backlog confort (coût vs bénéfice)
status: open

### DW-211: Suite web : baseline actuel et stabilisation

origin: migrated from legacy ledger ("Matrice rapide"), 2026-08-26
location: n/a
reason: Suite web : baseline actuel et stabilisation
status: open

### DW-212: `computeOpeningChancePercent` réimplémente le filtrage du pool au lieu d'appeler `CompositionParticipantPool.buildRolePool` — acceptable tant que les fixtures restent simples ; réévaluer si le pool runtime gagne des filtres (genre, exclusions).

origin: migrated from legacy ledger ("Deferred from: code review of 19-3-fixtures-orchestration-draw-complet (2026-06-07)"), 2026-08-26
location: n/a
reason: `computeOpeningChancePercent` réimplémente le filtrage du pool au lieu d'appeler `CompositionParticipantPool.buildRolePool` — acceptable tant que les fixtures restent simples ; réévaluer si le pool runtime gagne des filtres (genre, exclusions).
status: open

### DW-213: `CompositionDrawIntegrationTest` conserve ses propres helpers au lieu de `DrawTestSupport` — story 19.3 marquait l'extraction optionnelle ; consolidation possible en follow-up.

origin: migrated from legacy ledger ("Deferred from: code review of 19-3-fixtures-orchestration-draw-complet (2026-06-07)"), 2026-08-26
location: n/a
reason: `CompositionDrawIntegrationTest` conserve ses propres helpers au lieu de `DrawTestSupport` — story 19.3 marquait l'extraction optionnelle ; consolidation possible en follow-up.
status: open

### DW-214: Onglet Équipe : pas de libellé `chanceSource` côté API composition — snapshot appliqué silencieusement sur `chancePercent` ; gap 6.14 vs doc UX.

origin: migrated from legacy ledger ("Deferred from: code review of 19-4-doc-orga-membre-comprendre-les-cotes (2026-06-07)"), 2026-08-26
location: n/a
reason: Onglet Équipe : pas de libellé `chanceSource` côté API composition — snapshot appliqué silencieusement sur `chancePercent` ; gap 6.14 vs doc UX.
status: open

### DW-215: Gate `./gradlew test` non prouvé dans le diff doc-only — infra Gradle locale signalée en Dev Agent Record.

origin: migrated from legacy ledger ("Deferred from: code review of 19-4-doc-orga-membre-comprendre-les-cotes (2026-06-07)"), 2026-08-26
location: n/a
reason: Gate `./gradlew test` non prouvé dans le diff doc-only — infra Gradle locale signalée en Dev Agent Record.
status: open

### DW-216: Titres de sections vs checklist story — cosmetique (« Pourquoi l’historique compte » vs « Participations passées »).

origin: migrated from legacy ledger ("Deferred from: code review of 19-4-doc-orga-membre-comprendre-les-cotes (2026-06-07)"), 2026-08-26
location: n/a
reason: Titres de sections vs checklist story — cosmetique (« Pourquoi l’historique compte » vs « Participations passées »).
status: open

### DW-217: Cas limites doc utilisateur MVP : historiques inégaux multi-places, snapshots partiels, assignation manuelle sans tirage.

origin: migrated from legacy ledger ("Deferred from: code review of 19-4-doc-orga-membre-comprendre-les-cotes (2026-06-07)"), 2026-08-26
location: n/a
reason: Cas limites doc utilisateur MVP : historiques inégaux multi-places, snapshots partiels, assignation manuelle sans tirage.
status: open

### DW-218: `indexOf` dans boucle facteurs O(n²) — un seul facteur en prod ; refactor quand le pipeline grossit.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07)"), 2026-08-26
location: n/a
reason: `indexOf` dans boucle facteurs O(n²) — un seul facteur en prod ; refactor quand le pipeline grossit.
status: open

### DW-219: Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs Wave B+.

origin: migrated from legacy ledger ("Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07)"), 2026-08-26
location: n/a
reason: Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs Wave B+.
status: open

### DW-220: Cadence avancée malgré opt-out total push+email — accepté (PO : B) : marque = run traité, aligné 8.5 ; pas de pré-filtre prefs avant claim.

origin: migrated from legacy ledger ("Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)"), 2026-08-26
location: n/a
reason: Cadence avancée malgré opt-out total push+email — accepté (PO : B) : marque = run traité, aligné 8.5 ; pas de pré-filtre prefs avant claim.
status: open

### DW-221: Marque consommée si dispatch échoue après claim — même pattern que `AssigneePresenceReminderJob` (story 8.5).

origin: migrated from legacy ledger ("Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)"), 2026-08-26
location: n/a
reason: Marque consommée si dispatch échoue après claim — même pattern que `AssigneePresenceReminderJob` (story 8.5).
status: open

### DW-222: Course recipient répond entre claim et `afterCommit` dispatch — fenêtre étroite, pas de re-resolve au dispatch.

origin: migrated from legacy ledger ("Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)"), 2026-08-26
location: n/a
reason: Course recipient répond entre claim et `afterCommit` dispatch — fenêtre étroite, pas de re-resolve au dispatch.
status: open

### DW-223: Suite Gradle non entièrement verte (793/796) — échecs hors périmètre 8.7.

origin: migrated from legacy ledger ("Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)"), 2026-08-26
location: n/a
reason: Suite Gradle non entièrement verte (793/796) — échecs hors périmètre 8.7.
status: open

### DW-224: `@Scheduled` Cloud Run scale-to-zero — documenté dans Dev Notes story 8.7, même limitation que 8.5.

origin: migrated from legacy ledger ("Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)"), 2026-08-26
location: n/a
reason: `@Scheduled` Cloud Run scale-to-zero — documenté dans Dev Notes story 8.7, même limitation que 8.5.
status: open

### DW-225: PATCH push debouncé après désactivation globale appareil — fenêtre debounce 300 ms ; guard optionnel MVP.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: PATCH push debouncé après désactivation globale appareil — fenêtre debounce 300 ms ; guard optionnel MVP.
status: open

### DW-226: `uiState` enabled pendant `disable()` async — pas de signal busy partagé ; pattern 8.1.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: `uiState` enabled pendant `disable()` async — pas de signal busy partagé ; pattern 8.1.
status: open

### DW-227: Test count 5 lignes explicite absent — filtrage D6 couvert indirectement.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: Test count 5 lignes explicite absent — filtrage D6 couvert indirectement.
status: open

### DW-228: Libellés canal mobile `0.7rem` vs token `body-medium` — polish M3.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: Libellés canal mobile `0.7rem` vs token `body-medium` — polish M3.
status: open

### DW-229: `display: contents` sur wrappers channel desktop — trade-off grille accepté.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: `display: contents` sur wrappers channel desktop — trade-off grille accepté.
status: open

### DW-230: Fallback copy clé API inconnue — story 8.8.

origin: migrated from legacy ledger ("Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)"), 2026-08-26
location: n/a
reason: Fallback copy clé API inconnue — story 8.8.
status: open

### DW-231: Requête 404 `/version.local.txt` en prod — trade-off accepté AC3 (local-first puis fallback).

origin: migrated from legacy ledger ("Deferred from: code review of 10-3b-about-build-metadata (2026-06-14)"), 2026-08-26
location: n/a
reason: Requête 404 `/version.local.txt` en prod — trade-off accepté AC3 (local-first puis fallback).
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/core/app/app-version.service.ts:4-5,90 implements local-first fallback

### DW-232: Couplage libellés canal sur 4 artefacts (release shell, patch Docker, parser TS, doc) — contrat implicite MVP.

origin: migrated from legacy ledger ("Deferred from: code review of 10-3b-about-build-metadata (2026-06-14)"), 2026-08-26
location: n/a
reason: Couplage libellés canal sur 4 artefacts (release shell, patch Docker, parser TS, doc) — contrat implicite MVP.
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/core/app/app-version.service.spec.ts:114-220 covers the build-channel contract

### DW-233: Pas de tests `patch-version-txt-channel.mjs` — script CI simple ; couverture parser Angular suffisante pour l’UI.

origin: migrated from legacy ledger ("Deferred from: code review of 10-3b-about-build-metadata (2026-06-14)"), 2026-08-26
location: n/a
reason: Pas de tests `patch-version-txt-channel.mjs` — script CI simple ; couverture parser Angular suffisante pour l’UI.
status: open

### DW-234: `version.local.txt` stale sans redémarrage `start-dev.sh` — workflow dev documenté DEPLOYMENT_WORKFLOW.md.

origin: migrated from legacy ledger ("Deferred from: code review of 10-3b-about-build-metadata (2026-06-14)"), 2026-08-26
location: n/a
reason: `version.local.txt` stale sans redémarrage `start-dev.sh` — workflow dev documenté DEPLOYMENT_WORKFLOW.md.
status: done 2026-08-26
resolution: already resolved: docs/v2/technical/DEPLOYMENT_WORKFLOW.md:330,368-374 documents the restart requirement

### DW-235: `isActiveEngagedMember` N+1 — `NotificationRecipientResolver.kt` reconstruit le roster complet pour chaque destinataire archive ; correct, optimisation non requise MVP.

origin: migrated from legacy ledger ("Deferred from: code review of 8-8-notifications-membre-event-details-et-archivage (2026-06-08)"), 2026-08-26
location: n/a
reason: `isActiveEngagedMember` N+1 — `NotificationRecipientResolver.kt` reconstruit le roster complet pour chaque destinataire archive ; correct, optimisation non requise MVP.
status: open

### DW-236: URLs 2 segments

origin: migrated from legacy ledger ("Deferred from: code review of 8-8-notifications-membre-event-details-et-archivage (2026-06-08)"), 2026-08-26
location: n/a
reason: URLs 2 segments
status: open

### DW-237: `ShareRecipientsService` ignore logs guest

origin: migrated from legacy ledger ("Deferred from: code review of 8-8-notifications-membre-event-details-et-archivage (2026-06-08)"), 2026-08-26
location: n/a
reason: `ShareRecipientsService` ignore logs guest
status: open

### DW-238: `AvailabilityPendingReminderJob` `userId ?: continue`

origin: migrated from legacy ledger ("Deferred from: code review of 8-8-notifications-membre-event-details-et-archivage (2026-06-08)"), 2026-08-26
location: n/a
reason: `AvailabilityPendingReminderJob` `userId ?: continue`
status: open

### DW-239: AC4 re-dispatch test

origin: migrated from legacy ledger ("Deferred from: code review of 8-9-notification-equipe-confirmee-member (2026-06-08)"), 2026-08-26
location: n/a
reason: AC4 re-dispatch test
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/TeamCompleteMemberNotificationIntegrationTest.kt:84-333 covers re-dispatch

### DW-240: Push opt-out unit test

origin: migrated from legacy ledger ("Deferred from: code review of 8-9-notification-equipe-confirmee-member (2026-06-08)"), 2026-08-26
location: n/a
reason: Push opt-out unit test
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/NotificationDispatcherTest.kt:393-417 covers push opt-out

### DW-241: `./gradlew test` 3 échecs non liés

origin: migrated from legacy ledger ("Deferred from: code review of 8-9-notification-equipe-confirmee-member (2026-06-08)"), 2026-08-26
location: n/a
reason: `./gradlew test` 3 échecs non liés
status: open

### DW-242: `./gradlew test` non vert sur suite complète (838/841)

origin: migrated from legacy ledger ("Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)"), 2026-08-26
location: n/a
reason: `./gradlew test` non vert sur suite complète (838/841)
status: open

### DW-243: Claim reminder mark avant dispatch empêche retry si envoi échoue

origin: migrated from legacy ledger ("Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)"), 2026-08-26
location: n/a
reason: Claim reminder mark avant dispatch empêche retry si envoi échoue
status: open

### DW-244: `TEAM_COMPLETE` peut re-fire si lifecycle repasse COMPLETE après déclin

origin: migrated from legacy ledger ("Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)"), 2026-08-26
location: n/a
reason: `TEAM_COMPLETE` peut re-fire si lifecycle repasse COMPLETE après déclin
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/TeamCompleteMemberNotificationIntegrationTest.kt:268-333 covers decline and repeat confirmation

### DW-245: Scan hebdo `CompositionIncompleteReminderJob` sans pagination

origin: migrated from legacy ledger ("Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)"), 2026-08-26
location: n/a
reason: Scan hebdo `CompositionIncompleteReminderJob` sans pagination
status: open

### DW-246: `minLength(3)` mot de passe global sur login

origin: migrated from legacy ledger ("Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)"), 2026-08-26
location: n/a
reason: `minLength(3)` mot de passe global sur login
status: open

### DW-247: OpenAPI `events.yaml` non mis à jour pour le 400 catégorie inconnue

origin: migrated from legacy ledger ("Deferred from: code review of 17-38-category-glossary-api (2026-06-09)"), 2026-08-26
location: n/a
reason: OpenAPI `events.yaml` non mis à jour pour le 400 catégorie inconnue
status: open

### DW-248: Constantes réservées dupliquées (`RESERVED_SLUGS` vs `HIDDEN_SLUGS`)

origin: migrated from legacy ledger ("Deferred from: code review of 17-38-category-glossary-api (2026-06-09)"), 2026-08-26
location: n/a
reason: Constantes réservées dupliquées (`RESERVED_SLUGS` vs `HIDDEN_SLUGS`)
status: open

### DW-249: `labelForAutoCreate` code mort post-AC6

origin: migrated from legacy ledger ("Deferred from: code review of 17-38-category-glossary-api (2026-06-09)"), 2026-08-26
location: n/a
reason: `labelForAutoCreate` code mort post-AC6
status: open

### DW-250: Fenêtre race preview → delete inter-requêtes

origin: migrated from legacy ledger ("Deferred from: code review of 17-38-category-glossary-api (2026-06-09)"), 2026-08-26
location: n/a
reason: Fenêtre race preview → delete inter-requêtes
status: open

### DW-251: `persistCategory` sans garde post-await identité événement

origin: migrated from legacy ledger ("Deferred from: code review of 17-39-ui-category-selection (2026-06-09)"), 2026-08-26
location: n/a
reason: `persistCategory` sans garde post-await identité événement
status: open

### DW-252: Échec silencieux `loadGlossary` onglet Infos

origin: migrated from legacy ledger ("Deferred from: code review of 17-39-ui-category-selection (2026-06-09)"), 2026-08-26
location: n/a
reason: Échec silencieux `loadGlossary` onglet Infos
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/shared/event/event-infos-tab.ts:493-515 surfaces glossary failures in both non-ok and catch paths

### DW-253: Fallback `categoryLabel` → slug brut si glossaire incomplet

origin: migrated from legacy ledger ("Deferred from: code review of 17-39-ui-category-selection (2026-06-09)"), 2026-08-26
location: n/a
reason: Fallback `categoryLabel` → slug brut si glossaire incomplet
status: open

### DW-254: `saving` partagé orga/format/catégorie sans séquencement

origin: migrated from legacy ledger ("Deferred from: code review of 17-39-ui-category-selection (2026-06-09, v4 chips inline)"), 2026-08-26
location: n/a
reason: `saving` partagé orga/format/catégorie sans séquencement
status: open

### DW-255: Catégorie éditable sur spectacle archivé si `canManageEvents`

origin: migrated from legacy ledger ("Deferred from: code review of 17-39-ui-category-selection (2026-06-09, v4 chips inline)"), 2026-08-26
location: n/a
reason: Catégorie éditable sur spectacle archivé si `canManageEvents`
status: open

### DW-256: Race concurrent delete : `affectedEventCount` peut diverger du preview

origin: migrated from legacy ledger ("Deferred from: code review of 17-40-troupe-settings-categories (2026-06-09)"), 2026-08-26
location: n/a
reason: Race concurrent delete : `affectedEventCount` peut diverger du preview
status: open

### DW-257: Aucun test smoke du profil `dev,offline`

origin: migrated from legacy ledger ("Deferred from: code review profil offline dev V2 (2026-06-09)"), 2026-08-26
location: n/a
reason: Aucun test smoke du profil `dev,offline`
status: open

### DW-258: Verrou H2 si second `bootRun` concurrent

origin: migrated from legacy ledger ("Deferred from: code review profil offline dev V2 (2026-06-09)"), 2026-08-26
location: n/a
reason: Verrou H2 si second `bootRun` concurrent
status: open

### DW-259: Chemin H2 `${user.dir}/../../` hors `services/api`

origin: migrated from legacy ledger ("Deferred from: code review profil offline dev V2 (2026-06-09)"), 2026-08-26
location: n/a
reason: Chemin H2 `${user.dir}/../../` hors `services/api`
status: open

### DW-260: ARCH.md sans mention du mode offline

origin: migrated from legacy ledger ("Deferred from: code review profil offline dev V2 (2026-06-09)"), 2026-08-26
location: n/a
reason: ARCH.md sans mention du mode offline
status: done 2026-08-26
resolution: already resolved: ARCH.md:16 and services/api/README.md:65,127-138 document offline mode

### DW-261: Tooltip WhatsApp via `title` natif

origin: migrated from legacy ledger ("Deferred from: code review of 6-23-modales-partager-annoncer-manuel-compact (2026-06-09)"), 2026-08-26
location: n/a
reason: Tooltip WhatsApp via `title` natif
status: open

### DW-262: `::ng-deep` panel menu

origin: migrated from legacy ledger ("Deferred from: code review of 6-23-modales-partager-annoncer-manuel-compact (2026-06-09)"), 2026-08-26
location: n/a
reason: `::ng-deep` panel menu
status: open

### DW-263: Gate S1 ≤ 800 ms non atteinte

origin: migrated from legacy ledger ("Deferred from: code review of perf-02-inbox-badge-cache (2026-06-09)"), 2026-08-26
location: n/a
reason: Gate S1 ≤ 800 ms non atteinte
status: open

### DW-264: Pas de test intégration « action inbox → retour /accueil → badge à jour »

origin: migrated from legacy ledger ("Deferred from: code review of perf-02-inbox-badge-cache (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de test intégration « action inbox → retour /accueil → badge à jour »
status: open

### DW-265: Pas d'invalidation serveur (push/WebSocket)

origin: migrated from legacy ledger ("Deferred from: code review of perf-02-inbox-badge-cache (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas d'invalidation serveur (push/WebSocket)
status: open

### DW-266: `GET /me/inbox/count` endpoint léger

origin: migrated from legacy ledger ("Deferred from: PERF-06 inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: `GET /me/inbox/count` endpoint léger
status: open

### DW-267: Profilage Neon prod / Improbots volumineux

origin: migrated from legacy ledger ("Deferred from: PERF-06 inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: Profilage Neon prod / Improbots volumineux
status: open

### DW-268: `NotificationRecipientResolver.isActiveEngagedMember` N+1 — item existant deferred-work 8-8 ; hors chemin `MeInboxService`.

origin: migrated from legacy ledger ("Deferred from: PERF-06 inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: `NotificationRecipientResolver.isActiveEngagedMember` N+1 — item existant deferred-work 8-8 ; hors chemin `MeInboxService`.
status: open

### DW-269: Suite `./gradlew test` 5 échecs préexistants

origin: migrated from legacy ledger ("Deferred from: PERF-06 inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: Suite `./gradlew test` 5 échecs préexistants
status: open

### DW-270: Pas de delta chiffré avant/après

origin: migrated from legacy ledger ("Deferred from: code review of perf-06-inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: Pas de delta chiffré avant/après
status: open

### DW-271: Fixture perf minimale sans scénario inbox « riche »

origin: migrated from legacy ledger ("Deferred from: code review of perf-06-inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: Fixture perf minimale sans scénario inbox « riche »
status: open

### DW-272: Risque drift requêtes DISTINCT vs COUNT miroir

origin: migrated from legacy ledger ("Deferred from: code review of perf-06-inbox-api-profiling (2026-06-09)"), 2026-08-26
location: n/a
reason: Risque drift requêtes DISTINCT vs COUNT miroir
status: open

### DW-273: Guard and logout integration test gaps

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)"), 2026-08-26
location: n/a
reason: Guard and logout integration test gaps
status: open

### DW-274: Navigation spec uses stubs not real EventDetail/UserAgenda

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)"), 2026-08-26
location: n/a
reason: Navigation spec uses stubs not real EventDetail/UserAgenda
status: open

### DW-275: Testing helper underused

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)"), 2026-08-26
location: n/a
reason: Testing helper underused
status: open

### DW-276: Remaining shell pages still call ensureHatcastSession

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)"), 2026-08-26
location: n/a
reason: Remaining shell pages still call ensureHatcastSession
status: open

### DW-277: Bootstrap memo stale after auth cache invalidation without sessionUser clear

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)"), 2026-08-26
location: n/a
reason: Bootstrap memo stale after auth cache invalidation without sessionUser clear
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/core/member-shell/member-shell-bootstrap.service.ts:17-21,44-48 invalidates and rememoizes per session user

### DW-278: Boot network/5xx retry UI

origin: migrated from legacy ledger ("Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09) — 3-lite follow-up"), 2026-08-26
location: n/a
reason: Boot network/5xx retry UI
status: open

### DW-279: `includeChances` non passé depuis le front

origin: migrated from legacy ledger ("Deferred from: code review of perf-10-event-detail-page-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: `includeChances` non passé depuis le front
status: open

### DW-280: Fallback `loadComposition` legacy si BFF équipe sans payload

origin: migrated from legacy ledger ("Deferred from: code review of perf-10-event-detail-page-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: Fallback `loadComposition` legacy si BFF équipe sans payload
status: open

### DW-281: `ensureMembershipParticipants` sur GET `/page`

origin: migrated from legacy ledger ("Deferred from: code review of perf-10-event-detail-page-bff (2026-06-09)"), 2026-08-26
location: n/a
reason: `ensureMembershipParticipants` sur GET `/page`
status: open

### DW-282: ThreadLocal JDBC metrics sur threads async/scheduled

origin: migrated from legacy ledger ("Deferred from: code review of perf-16-db-latency-observability (2026-06-10)"), 2026-08-26
location: n/a
reason: ThreadLocal JDBC metrics sur threads async/scheduled
status: open

### DW-283: BeanPostProcessor enveloppe tout bean `DataSource`

origin: migrated from legacy ledger ("Deferred from: code review of perf-16-db-latency-observability (2026-06-10)"), 2026-08-26
location: n/a
reason: BeanPostProcessor enveloppe tout bean `DataSource`
status: open

### DW-284: p95 sur n=10 ≈ max

origin: migrated from legacy ledger ("Deferred from: code review of perf-16-db-latency-observability (2026-06-10)"), 2026-08-26
location: n/a
reason: p95 sur n=10 ≈ max
status: open

### DW-285: `NeonAgendaPerformanceIntegrationTest` MockMvc in-process

origin: migrated from legacy ledger ("Deferred from: code review of perf-16-db-latency-observability (2026-06-10)"), 2026-08-26
location: n/a
reason: `NeonAgendaPerformanceIntegrationTest` MockMvc in-process
status: open

### DW-286: No logout / access-denied slug clear

origin: migrated from legacy ledger ("Deferred from: code review of 17-41-nav-shell-ma-troupe (2026-06-12)"), 2026-08-26
location: n/a
reason: No logout / access-denied slug clear
status: open

### DW-287: `Location.back()` si `navigationId > 1` peut renvoyer hors HatCast

origin: migrated from legacy ledger ("Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)"), 2026-08-26
location: n/a
reason: `Location.back()` si `navigationId > 1` peut renvoyer hors HatCast
status: open

### DW-288: Test gap fallback chevron vers `/troupes/:slug`

origin: migrated from legacy ledger ("Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)"), 2026-08-26
location: n/a
reason: Test gap fallback chevron vers `/troupes/:slug`
status: open

### DW-289: Test gap AC8 Saison absente sur 404/403

origin: migrated from legacy ledger ("Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)"), 2026-08-26
location: n/a
reason: Test gap AC8 Saison absente sur 404/403
status: open

### DW-290: Badge statut absent pendant spinner chargement onglet Équipe

origin: migrated from legacy ledger ("Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)"), 2026-08-26
location: n/a
reason: Badge statut absent pendant spinner chargement onglet Équipe
status: done 2026-08-26
resolution: already resolved: commit baaee374 restored the event-detail team status badge

### DW-291: Test équipe brouillon ne couvre pas AC 7b

origin: migrated from legacy ledger ("Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)"), 2026-08-26
location: n/a
reason: Test équipe brouillon ne couvre pas AC 7b
status: open

### DW-292: E2E helper added but no Playwright spec consumes it

origin: migrated from legacy ledger ("Deferred from: code review of 17-44-hub-troupe-mini-chart-saison (2026-06-14)"), 2026-08-26
location: n/a
reason: E2E helper added but no Playwright spec consumes it
status: done 2026-08-26
resolution: already resolved: apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts:24,102,134 consumes the helper in mini-chart E2E coverage

### DW-293: `slug` required on `StatisticsEvent` OpenAPI

origin: migrated from legacy ledger ("Deferred from: code review of 17-44-hub-troupe-mini-chart-saison (2026-06-14)"), 2026-08-26
location: n/a
reason: `slug` required on `StatisticsEvent` OpenAPI
status: done 2026-08-26
resolution: already resolved: apps/web/src/app/core/seasons/season-statistics-api.service.ts:20-28 includes the required slug

### DW-294: Extra `loadViewsByEventIds` on every stats call

origin: migrated from legacy ledger ("Deferred from: code review of 17-44-hub-troupe-mini-chart-saison (2026-06-14)"), 2026-08-26
location: n/a
reason: Extra `loadViewsByEventIds` on every stats call
status: open

### DW-295: Double requête SQL sur explainability

origin: migrated from legacy ledger ("Deferred from: code review of 19-8-facteur-equity-tag-history-ex-17-9 (2026-06-14)"), 2026-08-26
location: n/a
reason: Double requête SQL sur explainability
status: open

### DW-296: Branche spéciale `when (CategoryCompartmentFactor)` dans breakdown

origin: migrated from legacy ledger ("Deferred from: code review of 19-8-facteur-equity-tag-history-ex-17-9 (2026-06-14)"), 2026-08-26
location: n/a
reason: Branche spéciale `when (CategoryCompartmentFactor)` dans breakdown
status: open

### DW-297: Pas de test d’intégration bout-en-bout `CompositionExplainabilityService` → delta `equity_tag`

origin: migrated from legacy ledger ("Deferred from: code review of 19-8-facteur-equity-tag-history-ex-17-9 (2026-06-14)"), 2026-08-26
location: n/a
reason: Pas de test d’intégration bout-en-bout `CompositionExplainabilityService` → delta `equity_tag`
status: open

### DW-298: Requête role-request relancée par rôle au tirage

origin: migrated from legacy ledger ("Deferred from: code review of 19-10-facteur-nombre-demandes-role (2026-06-14)"), 2026-08-26
location: n/a
reason: Requête role-request relancée par rôle au tirage
status: open

### DW-299: DRY compartiment partiel

origin: migrated from legacy ledger ("Deferred from: code review of 19-10-facteur-nombre-demandes-role (2026-06-14)"), 2026-08-26
location: n/a
reason: DRY compartiment partiel
status: open

### DW-300: Pas de test mock prouvant z SQL en DEFAULT (AC18)

origin: migrated from legacy ledger ("Deferred from: code review of 19-10-facteur-nombre-demandes-role (2026-06-14)"), 2026-08-26
location: n/a
reason: Pas de test mock prouvant z SQL en DEFAULT (AC18)
status: open

### DW-301: `formulaId` pour Simuler / preview % (19.17 AC3)

origin: migrated from legacy ledger ("Deferred from: code review of 19-15-spec-formules-politiques-adr (2026-06-15)"), 2026-08-26
location: n/a
reason: `formulaId` pour Simuler / preview % (19.17 AC3)
status: open

### DW-302: Epics 19.16 AC3 (system V1 seul) vs OQ-19-02 (CHOICE + published + system V1)

origin: migrated from legacy ledger ("Deferred from: code review of 19-15-spec-formules-politiques-adr (2026-06-15)"), 2026-08-26
location: n/a
reason: Epics 19.16 AC3 (system V1 seul) vs OQ-19-02 (CHOICE + published + system V1)
status: open

### DW-303: Epics 19.18 titre « admin saison » vs OQ-19-05 TROUPE_ADMIN only

origin: migrated from legacy ledger ("Deferred from: code review of 19-15-spec-formules-politiques-adr (2026-06-15)"), 2026-08-26
location: n/a
reason: Epics 19.18 titre « admin saison » vs OQ-19-05 TROUPE_ADMIN only
status: open

### DW-304: PLAN.md résumé résolution tronqué (sans chemin implicit CHOICE)

origin: migrated from legacy ledger ("Deferred from: code review of 19-15-spec-formules-politiques-adr (2026-06-15)"), 2026-08-26
location: n/a
reason: PLAN.md résumé résolution tronqué (sans chemin implicit CHOICE)
status: open

### DW-305: V65 prépare un statement JDBC par troupe

origin: migrated from legacy ledger ("Deferred from: code review of 19-16-persistance-formules-defaut-v1 (2026-06-15)"), 2026-08-26
location: n/a
reason: V65 prépare un statement JDBC par troupe
status: open

### DW-306: `draw_policies` sans `created_at`

origin: migrated from legacy ledger ("Deferred from: code review of 19-16-persistance-formules-defaut-v1 (2026-06-15)"), 2026-08-26
location: n/a
reason: `draw_policies` sans `created_at`
status: open

### DW-307: Verrouillage optimiste `version` non envoyé au PATCH

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: Verrouillage optimiste `version` non envoyé au PATCH
status: open

### DW-308: `troupeId` input change sans reload

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: `troupeId` input change sans reload
status: open

### DW-309: Race `reload()` concurrent sans séquence

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: Race `reload()` concurrent sans séquence
status: open

### DW-310: État vide liste sans copy dédiée quand `formulas=[]`

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: État vide liste sans copy dédiée quand `formulas=[]`
status: open

### DW-311: Pas de bouton retry sur erreur chargement F1

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: Pas de bouton retry sur erreur chargement F1
status: open

### DW-312: Badges direction sans tokens error/tertiary distincts

origin: migrated from legacy ledger ("Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)"), 2026-08-26
location: n/a
reason: Badges direction sans tokens error/tertiary distincts
status: open

### DW-313: Golden REF-P uniquement `formulaSave`

origin: migrated from legacy ledger ("Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)"), 2026-08-26
location: n/a
reason: Golden REF-P uniquement `formulaSave`
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaValidatorTest.kt:13-198 covers REF-P01 through REF-P06

### DW-314: Messages FR non assertés en intégration

origin: migrated from legacy ledger ("Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)"), 2026-08-26
location: n/a
reason: Messages FR non assertés en intégration
status: open

### DW-315: Artefact test design absent du dépôt

origin: migrated from legacy ledger ("Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)"), 2026-08-26
location: n/a
reason: Artefact test design absent du dépôt
status: done 2026-08-26
resolution: already resolved: _bmad-output/test-artifacts/19-19b-factor-params-test-design.md exists in the repository

### DW-316: Spec normative 19.19a non mergée sur branche

origin: migrated from legacy ledger ("Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)"), 2026-08-26
location: n/a
reason: Spec normative 19.19a non mergée sur branche
status: open

### DW-317: `@Tag("19.19b")` absent sur `DrawFormulaPipelineGoldenTest`

origin: migrated from legacy ledger ("Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)"), 2026-08-26
location: n/a
reason: `@Tag("19.19b")` absent sur `DrawFormulaPipelineGoldenTest`
status: open

### DW-318: Cible 48×48 dp non codée explicitement sur le bouton ⋮

origin: migrated from legacy ledger ("Deferred from: code review of 19-21-ui-orga-choix-formule-tirage (2026-06-19)"), 2026-08-26
location: n/a
reason: Cible 48×48 dp non codée explicitement sur le bouton ⋮
status: open

### DW-319: Couverture E2E Playwright menu formule / tirage `formulaId`

origin: migrated from legacy ledger ("Deferred from: code review of 19-21-ui-orga-choix-formule-tirage (2026-06-19)"), 2026-08-26
location: n/a
reason: Couverture E2E Playwright menu formule / tirage `formulaId`
status: done 2026-08-26
resolution: already resolved: apps/web/e2e/draw-formula-choice.spec.ts was added by commit 6a311c2b

### DW-320: Dédupe `localStorage` écrite avant `capture()`

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: Dédupe `localStorage` écrite avant `capture()`
status: open

### DW-321: Pas de test intégration logout → reset → re-identify

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: Pas de test intégration logout → reset → re-identify
status: open

### DW-322: Course multi-onglets sur première session

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: Course multi-onglets sur première session
status: open

### DW-323: Props personne obsolètes si email/name effacés côté API

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: Props personne obsolètes si email/name effacés côté API
status: open

### DW-324: `identifyUser` no-op si PostHog pas encore initialisé

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: `identifyUser` no-op si PostHog pas encore initialisé
status: open

### DW-325: Sémantique `v2_migration_first_session` = premier identify navigateur

origin: migrated from legacy ledger ("Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)"), 2026-08-26
location: n/a
reason: Sémantique `v2_migration_first_session` = premier identify navigateur
status: open

### DW-326: No isolated unit tests for `guidesFromEnvironment()` edge cases

origin: migrated from legacy ledger ("Deferred from: code review of 4-4-guides-video-page-connexion (2026-07-11)"), 2026-08-26
location: n/a
reason: No isolated unit tests for `guidesFromEnvironment()` edge cases
status: open

### DW-327: M3-1 minor: section title uses custom class

origin: migrated from legacy ledger ("Deferred from: code review of 4-4-guides-video-page-connexion (2026-07-11)"), 2026-08-26
location: n/a
reason: M3-1 minor: section title uses custom class
status: open

### DW-328: Tests mutate global `environment` object

origin: migrated from legacy ledger ("Deferred from: code review of 4-4-guides-video-page-connexion (2026-07-11)"), 2026-08-26
location: n/a
reason: Tests mutate global `environment` object
status: open

### DW-329: Doc E2E gate stale

origin: migrated from legacy ledger ("Deferred from: code review of 17-45-nav-stats-before-troupe (2026-07-12)"), 2026-08-26
location: n/a
reason: Doc E2E gate stale
status: open

### DW-330: Epic 17.41 AC historique

origin: migrated from legacy ledger ("Deferred from: code review of 17-45-nav-stats-before-troupe (2026-07-12)"), 2026-08-26
location: n/a
reason: Epic 17.41 AC historique
status: open

### DW-331: Cleanup Spring Session 1×/jour

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: Cleanup Spring Session 1×/jour
status: done 2026-08-26
resolution: already resolved: services/api/src/main/resources/application-cloud.yml:18-20 and application-dev.yml:44-46 configure daily cleanup

### DW-332: Fuseau cron session `0 30 3 * * *`

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: Fuseau cron session `0 30 3 * * *`
status: open

### DW-333: Overrides env Hikari / health.db

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: Overrides env Hikari / health.db
status: done 2026-08-26
resolution: already resolved: services/api/src/test/kotlin/com/hatcast/api/config/NeonHikariScaleToZeroConfigTest.kt:20-37 verifies the overrides

### DW-334: Jobs `@Scheduled` notification

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: Jobs `@Scheduled` notification
status: open

### DW-335: PgBouncer + Spring Session JDBC

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: PgBouncer + Spring Session JDBC
status: done 2026-08-26
resolution: already resolved: docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md:269-272 documents PgBouncer and direct Flyway use

### DW-336: Decide whether T3 items remain in the active deferred-work ledger or move to the archive.

origin: migrated from legacy ledger ("Deferred from: code review of ops-12-neon-hikari-scale-to-zero (2026-08-04)"), 2026-08-26
location: n/a
reason: Decide whether T3 items remain in the active deferred-work ledger or move to the archive.
status: done 2026-08-26
resolution: closed by human decision: Move historical T3 reasoning to the archive and reopen only with a current reproducible location.
decision: 2026-08-26 Archive T3 history — Move historical T3 reasoning to the archive and reopen only with a current reproducible location.

### DW-126: A fresh Git clone without its ignored, locally provisioned BMad skills fails the upstream-skills validation before the Loop preflight can pass.
origin: spec-deferred 5e29daf747f0
location: scripts/v2/story-worktree-bootstrap.sh:46
source_spec: `21-1-loop-readiness-contract.md`
severity: medium
reason: The clean-clone check reported missing bmad-build-auto and legacy review-layer skills; the same check passed after the existing local BMad runtime was provisioned.
status: open

### DW-127: Human smoke handoff should prepare approved runtime prerequisites before asking an operator to start a smoke.
origin: operator feedback 2026-08-26
location: scripts/v2/story-human-smoke-handoff.sh; scripts/v2/story-worktree-runtime.sh
source_spec: `spec-21-4-human-smoke-handoff.md`
severity: medium
reason: A freshly bootstrapped feature worktree can have an explicit `DEPENDENCIES=missing` readiness result. The current handoff then refuses only when the operator starts the smoke, although the approved `prepare` operation can link the local environment and install the bounded runtime prerequisites without a separate human decision.
status: open

### DW-128: Create every new HatCast worktree under a shared worktrees directory.
origin: operator feedback 2026-08-26
location: scripts/v2/story-branch.sh; `.bmad-loop/policy.toml`; BMad Loop external-worktree resolution
source_spec: `21-2-worktree-runtime-readiness`
severity: medium
reason: New HatCast worktrees are currently created beside the repository, which scatters delivery units across `/Users/patrice/GitHub`. Define and enforce `/Users/patrice/GitHub/worktrees` as their common parent for both repository scripts and BMad Loop external-worktree runs; preserve the safety, cleanup, and runtime-provisioning contracts.
status: open

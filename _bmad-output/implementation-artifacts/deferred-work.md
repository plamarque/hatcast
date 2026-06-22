# Deferred work (actif)

**Hygiène DOC-1** — MAJ **2026-06-09**. **T0** et **T1** clôturés ; restant ordonné **coût vs bénéfice** — voir [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md) §3–4. Historique : [`deferred-work-archive.md`](deferred-work-archive.md).

**Contexte PLAN :** release train **V2.0.x** OK ; **M4** audience reportée (~août 2026) ; vague **2.1.0** (démo commission) en cours.

**Règle :** nouvelle revue → entrée ici si **T0–T2** ; sinon archive + ligne triage.

---

## Fermé / accepté (ne pas rouvrir)

| ID / story | Clôture | Note |
|------------|---------|------|
| **DW-101/102** | 2026-06-04 | Story **3.22** — coach match API + seeds |
| **DW-103** | accepté | Pas de backfill matchs historiques |
| **DW-104** | 2026-06-08 | Story **1.8** — retry signup + login recovery |
| **DW-105** | 2026-06-07 | Spec **dw-105** — IdP `deleteUser` post-commit (`AFTER_COMMIT`) |
| **DW-106** | 2026-06-07 | Spec **dw-106** — intent `COMPOSITION_SHARED` + `toCategory()` ; dispatch **8.4** reste à câbler |
| **DW-107** | 2026-06-08 | Story **8.5b** — garde `AssigneePresenceReminderJob` |
| **DW-111** | 2026-06-05 | Replay migration × ≥3 (PO) |
| **DW-112** | 2026-06-07 | Deploy `--env-vars-file` YAML |
| **DW-113** | 2026-06-08 | **Obsolète** — hub sans prefs troupe (**17.29**) |
| **DW-114** | 2026-06-07 | Post-save re-check `reinclude` → 409 ; fenêtre commit-edge acceptée |
| **DW-118** | 2026-06-07 | Audit SQL staging + prod : 0 membre `REMOVED` + `removal_source` NULL — pas de migration V61 ; voir [`dw-118-investigation.md`](../investigations/dw-118-investigation.md) |
| **6.17** | 2026-06-04 | Annonces + `lastNotifiedAt` ; **DW-108** partiel |
| **ops-8**, **ops-10** | 2026-06-04/05 | Prod domaine + email |
| **19.1**, **mig-7** | 2026-06-04/06 | ADR tirage + backfill genre V1 |
| **2.12***, **2.21** | 2026-06-05/06 | Genre + carnet externes |
| **3.8c/d**, **3.23–3.25** | 2026-06-06 | Roster UX + invitations scope |
| **6.18**, **6.19**, **6.21**, **6.22** | 2026-06-05/07 | Aide statut, calendrier, mixité, unlock |
| **Équipe SCSS** | 2026-06-06 | Budget `anyComponentStyle` OK (`f418887e`) |

*Clôtures T0/T1 + defers specs → archive § hygiène 2026-06-09.*

---

---

## Deferred from: spec-fix-breakdown-no-equity-tag-line (2026-06-23)

| Item | Rationale |
|------|-----------|
| **E2E fixture cross-compartment** | E1-MEM-033/034 assert absence of `equity_tag` line on any breakdown; optional follow-up: seed veteran with validated déplacement + assert principal breakdown content (Malice / dedicated fixture). |
| **Story 19.8 AC7 wording** | AC7 still describes equity_tag breakdown line; superseded for explainability only — amend story file when next touching epic 19 docs. |
| **`pastSelectionCountUnscoped` cleanup** | Field still passed through API context; no breakdown consumer — consider removing from explainability path if SQL cost matters. |

## Deferred from: code review of 11-3-v1-v2-cutover-funnel-posthog (2026-06-19)

- Versions `posthog-js` divergentes entre legacy (^1.391.2) et web (^1.379.2) — aligner à terme, hors scope critique cutover M4.
- Tests V1 sans mock PostHog initialisé — couverture partielle AC15 acceptable MVP ; renforcer si régression funnel.

---

## Deferred from: code review of 19-18-api-politiques-tirage-troupe-saison (2026-06-19)

- `ObjectProvider<DrawWeightPipeline>` court-circuite la résolution — pattern test voulu (story 19.18 task 6), conservé pour `@Primary` test beans.
- Course concurrente sur upsert politique — fenêtre TOCTOU rare ; index unique V65 ; retry non implémenté MVP.
- GET politique 404 ambigu (troupe vs politique absente) — fuite d’information mineure ; pattern cohérent 19.17.
- Pas de verrou optimiste / ETag sur PUT politique — last-write-wins MVP ; UI admin 19.20 pourra ajouter precondition.

---

## Deferred from: code review of 19-17-api-crud-formules-tirage (2026-06-16)

- TOCTOU between policy reference check and archive save — MVP race window accepted at current scale.
- O(n) in-memory policy scan on every archive — Dev Notes explicitly defer DB JSON query at MVP scale.
- Version bump on no-op PATCH — minor versioning noise, low impact.

---

## Deferred from: code review of perf-15-composition-summary-api-hot-path (2026-06-10)

- Avatar URL without storage read (metadata-only hot path) — intentional PERF-15 trade-off per dev notes; hot path skips `readAvatarContent`.
- Neon gate command not in DEVELOPMENT.md — KDoc on `NeonCompositionSummaryPerformanceIntegrationTest` sufficient for manual CI gate.
- JOIN FETCH cartesian risk on large rosters — JDBC budget passes on Improbots seed; monitor via PERF-16 headers.

---

## Deferred from: code review of perf-14-profiling-script-in-app-nav (2026-06-10)

- `loginEmail` and default seed credentials written in JSON report — pre-existing in perf script; local-only artifact.
- `attachApiListeners` pending-map leak / query-string endpoint merge — pre-existing before PERF-14 refactor.
- `networkidle` timeout swallowed in `waitForReady` — pre-existing; acceptable for dev gate script.
- `isMain` path compare fragile on Windows — pre-existing pattern; team dev on macOS.
- No Playwright E2E for `--in-app` flux — manual validation documented in story; out of PERF-14 scope.
- UI selector coupling (French tab labels, CSS classes) — acceptable for internal perf gate script.

---

## Deferred from: code review of perf-13-dispos-lazy-composition-explainability (2026-06-10)

- AC3 FR19/FR24 orgas sans test PERF-13 dédié — couverture via `composition-explainability.spec.ts` et tests event-detail préexistants.
- AC1 sans test PERF-13 composition Dispos — gate `ensureCompositionLoaded()` couvert par PERF-03 / story 5.9.
- `ensureChancesLoaded` échec API / rejet promesse — pre-existing ; snack sur `!ok` mais pas de `catch` sur reject (`availability-poll.ts`).
- Course bootstrap vs `load()` in-flight — pre-existing ; bootstrap peut être écrasé si fetch déjà lancé (`event-dispos-tab.ts`).
- `bootstrapSummary` stale au changement d'événement — pre-existing ; pas de validation eventId (`event-dispos-tab.ts`).

## Deferred from: code review of perf-12-accueil-progressive-render (2026-06-10)

- AC4 seuil ≤ 300 ms non mesuré — waiver PERF-14 documenté dans la story ; proxy test DOM seulement.
- `peekFreshCache` avec `boundUserId === null` — comportement préexistant PERF-02 (`isCacheForBoundUser` retourne true).
- Promesses async sans annulation post-`ngOnDestroy` — pattern courant Angular hors scope PERF-12.

---

## Deferred from: code review of perf-11-me-agenda-api-hot-path (2026-06-09)

- AC4 profilage wall recette — validation manuelle `profile-web-performance.mjs` recommandée en recette (Completion Notes).
- syncInitialFilterUrl bloque premier loadAgenda — waterfall résiduel hors scope minimal PERF-11.
- troupeContext.load fire-and-forget pour edit dispos — trade-off accepté story (filtres API, pas troupe catalog).
- Gate perf H2 ≠ prod Neon — même pattern que PERF-06.
- 4 requêtes participation mono-troupe inchangées — EXISTS early exit seulement sans participation.

---

## Deferred from: code review of 5-9-dispos-explainability-gate-decouple (2026-06-09)

- Breakdown accessible sur événement archivé via fallback `CompositionExplainabilityAccess` (pas de garde `archived`) — trou pré-existant, rendu visible par l'union Dispos+Équipe sur `resolveShowExplainability`.
- AC-4 : pas de test « composition publiée non validée → slots Équipe visibles membre » — incertitude runtime reconnue dans l'AC ; hors scope non-goals 5.9.
- M3-3 : pas de test E2E/composant « tap % → breakdown sheet » sans composition préchargée — dette test UI.
- OpenAPI `availability.yaml` : pas de doc du 403 explainability vs membership — amélioration doc.
- Chemins `EVENT_ORGANIZER` / `SEASON_ORGANIZER` pour `canManageComposition` non couverts par tests — pré-existant.

---

## Deferred from: code review of perf-08-lazy-routes-angular (2026-06-09)

- Pas de budget `angular.json` sur chunks lazy (hors scope initial bundle PERF-08).
- Pas de handler erreur chargement chunk / PWA stale chunk — risque amplifié par lazy routes, story perf séparée.
- Waterfall lazy parent+enfant sur `/compte` — tradeoff accepté pour réduire le bundle initial.
- Délai spinner sur redirects legacy (`SaisonLegacyRedirect`, onglets compte) — tradeoff perf vs UX immédiate.
- Pas de wildcard `**` sous `MemberShell` — pré-existant, outlet vide sur URL invalide.
- Stratégie preload post-login absente — follow-up perf (PERF plan vague 3+).

---

## Deferred from: code review of perf-07-season-workspace-bootstrap-bff (2026-06-09)

- Tests intégration 403/404 non couverts — gap pattern similaire à d'autres endpoints BFF.
- Schémas OpenAPI dupliqués (`SeasonWorkspaceParticipantSelector` vs DTO canonique) — qualité contrat, pas de régression runtime.
- Aucun test automatisé du budget ≤3 appels AC2 — assertion manuelle dans dev notes.
- Bascule history→agenda bypass le BFF — follow-up documenté dans dev notes.
- Fix `enableExplainabilityForChances` hors scope PERF-07 — autre story (19.7).

---

## Deferred from: code review of perf-05-viewer-gender-props (2026-06-09)

- AC1 non couvert par les tests ajoutés — bindings `[viewerGender]` vérifiés en revue code sur les 3 templates ; pas d'assertion DOM dans le diff PERF-05.
- Race timing parent lent / enfant précoce non testée — atténuée par `await loadViewerGender()` dans `ngOnInit` avant rendu liste ; motivation story non simulée en test.
- Effet `cacheRevision` non testé sur `user-agenda` / `member-home-todo` — reload genre après invalidation cache ; couverture PERF-01, hors patch minimal PERF-05.
- Chemins échec `getPreferences` (preload KO → refetch enfant) non testés — au-delà des AC story.
- Chaîne intégration `season-home` → `season-agenda` non testée — test isolé `SeasonAgenda` couvre le contrat input `viewerGender`.
- `sprint-status.yaml` : changements collatéraux (`5-8`, `perf-04`) dans le même diff — hors périmètre PERF-05.

---

## Deferred from: code review of perf-04-session-context-cache (2026-06-09)

- Gate S2 non profilé — AC3 non prouvé ; valider manuellement via `node scripts/v2/profile-web-performance.mjs` (serveur dev `--with-push`).
- `ContextSwitcherDataService` non réinitialisé sur invalidation troupes/session — `initialized` court-circuite `ensureReady` ; état switcher potentiellement stale après switch user ; architectural, hors scope PERF-04.

---

## Deferred from: code review of perf-03-event-detail-tab-gated-load (2026-06-09)

- Gate AC4 profilage Event Infos ≤ 1,2 s non exécutée — validation manuelle post-merge via `node scripts/v2/profile-web-performance.mjs`.
- `reloadEvent` silent ne réinitialise pas composition — comportement préexistant ; cache composition peut diverger après reload silencieux sur onglet Équipe (`event-detail.ts:648-657`).
- Duplication copy guidelines entre `resolveCompositionEquipeStatusFromEvent` et `resolveCompositionEquipeStatus` — dette maintenance, hors scope perf.

---

## Deferred from: code review of perf-01-deduplicate-me-preferences (2026-06-09)

- GET en échec non mis en cache — retry à chaque appel ; pattern d’erreur préexistant, impact marginal avec dedup parent (`me-preferences-api.service.ts`).
- Pas de sync multi-onglets — cache mémoire process ; limitation navigateur hors scope PERF-01.
- Échec silencieux `loadViewerGender` — signal reste `undefined`, pas de retry ; pattern préexistant sur les trois pages parentes.

---

## Deferred from: code review of 6-24-participation-copy-declinaison-desistement-retrait (2026-06-09)

- Dispatch proxy par égalité de `decisionLabel` (fragile si labels changent) — pattern préexistant étendu, pas introduit par 6.24.
- Clé enum `DECLINE_RESTORED` non renommée — explicit non-goal story (identifiants techniques inchangés).
- Paramètre optionnel `statusBeforeDecline` sans garde — risque latent faible, call sites actuels corrects.

---

## Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07, re-review as-shipped)

- Cibles tactiles &lt; 48 dp sur segments pool et trigger % grille — waiver PO documenté `FRONTEND_UI.md` ; follow-up post-release 19.7.
- Boutons imbriqués dans `composition-slot-picker-dialog` — waiver PO documenté ; dette a11y connue, pattern Dispos corrigé.
- `indexOf` O(n²) dans boucle facteurs `ChanceBreakdownCalculator` — un seul facteur en prod aujourd’hui.
- Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs.
- Seuil vert pool `chancePoolTier` à 75 % vs spec UX « ≥ ~70 % » — écart visuel mineur, recette PO OK.

---

## Deferred from: code review of 19-6-facteur-past-participation-v1 (2026-06-07)

- `requiredCount <= 0` sans garde dans `baseWeight` — pré-existant (`legacyBaseWeight` identique).
- `FACTOR_ID` non asserté en test — couverture prévue story **19.7** (breakdown).
- Pas de log WARNING sur multiplicateur invalide dans `sanitizeMultiplier` — hors scope V1.
- Clamp `pastSelectionCount` négatif silencieux dans `PastParticipationFactor` — option défensive acceptée par spec 19.6.
- Test V1 via base manuelle dans `PastParticipationFactorTest` — chemin intégré couvert par `AvailabilityChanceCalculatorDrawTest`.

---

## Deferred from: code review of 19-5-pipeline-draw-weight-factor (2026-06-07)

- Garde-fous multiplicateurs pipeline (NaN, négatif, infini) — traiter avec premier facteur réel (**19.6**).
- `pastSelectionCount` négatif non validé — contrat appelant V1 inchangé.
- `DrawWeightContext` sans `eventId` — extension Wave B/C (**19.6+**).
- Spec normative sans section pipeline — comportement identique ; doc story + ADR suffisent pour 19.5.
- Double calcul poids (`toWeightedCandidates` + `scoreCandidates`) dans `CompositionDrawService` — pré-existant, hors 19.5.

---

## Deferred from: code review of 17-42-hub-troupe-dashboard-collectif (2026-06-12)

- Pagination saisons limitée à 50 (`SEASONS_PAGE_SIZE`) — pattern hérité de 17.4 ; troupes avec >50 saisons rares.
- Tests races async / bottom sheet mobile — couverture happy-path suffisante pour MVP ; scénarios switch rapide à renforcer ultérieurement.

---

## Matrice rapide

| Tier | Quand agir | IDs (ordre coût/bénéfice) |
|------|------------|---------------------------|
| **T0** | — | *(vide)* |
| **T1** | — | *(vide)* |
| **T2** | Avant **M4** (~août) | **DW-119** → **DW-109** → **DW-110** |
| **T3** | Backlog 2.1.0+ | **DW-117** → **DW-116** → **DW-115** → **DW-122** → **DW-123** → **DW-124** → **DW-125** → **DW-121** → **DW-120** ; **DW-108** accepté |

---

## T2 — Avant M4 (coût vs bénéfice)

| # | ID | Coût | Bénéfice | Notes |
|---|-----|------|----------|-------|
| 1 | **DW-119** | **S** | Modéré | Vérif titres exotiques MIG-2 (`translate` vs `slugify` NFD) — script/doc |
| 2 | **DW-109** | **M** | Élevé si trigger | Rejects ciblés MIG-3 (`comment`, `role_key`) — évite transaction entière KO |
| 3 | **DW-110** | **M** | Modéré | Orphelines re-run MIG-3 sans reset — confiance staging ; prod = apply unique |

### DW-119 — Slugs exotiques

- **Risque :** faible (titres atypiques) ; **impact :** URLs post-import MIG-2.

### DW-109 — Validation MIG-3

- **Fichier :** [`maliceAvailabilityCompositions.js`](../../scripts/v1/maliceAvailabilityCompositions.js).

### DW-110 — Orphelines re-run MIG-3

- Replay gate déjà passé ; priorité **après** DW-109/119.

---

## T3 — Backlog confort (coût vs bénéfice)

| # | ID | Coût | Bénéfice | Notes |
|---|-----|------|----------|-------|
| 1 | **DW-117** | **XS** | Faible | Token `loadGlance()` sans génération — quick fix |
| 2 | **DW-116** | **S** | Modéré | Signal UX event picker à 250 résultats |
| 3 | **DW-115** | **S** | Faible | Race grant organisateur (500 vs 200) — UPSERT |
| 4 | **DW-122** | **S** | Faible | Prebundling cache dev (`ng serve` e2e) — perf dev only |
| 5 | **DW-123** | **M** | Modéré | Budget bundle initial prod (~2,33 MB) — impact **large** |
| 6 | **DW-124** | **M** | Faible | SCSS composants lourds (`member-home-todo`, `member-nav`, …) |
| 7 | **DW-125** | **M** | Faible | Découpage optionnel `event-equipe-tab` |
| 8 | **DW-121** | **L** | Faible | Sass `@import` → `@use` (échéance Dart Sass 3.0 lointaine) |
| 9 | **DW-120** | **L** | Modéré | Suite web globale rouge → **ISSUES.md** / gate CI |
| — | **DW-108** | — | ↓ | **Accepté** post-6.17 — `notifiedCount` ≠ SENT ; rouvrir seulement si PO exige **NFR-R2** strict |

---

## Deferred from: code review of 19-3-fixtures-orchestration-draw-complet (2026-06-07)

- `computeOpeningChancePercent` réimplémente le filtrage du pool au lieu d'appeler `CompositionParticipantPool.buildRolePool` — acceptable tant que les fixtures restent simples ; réévaluer si le pool runtime gagne des filtres (genre, exclusions).
- `CompositionDrawIntegrationTest` conserve ses propres helpers au lieu de `DrawTestSupport` — story 19.3 marquait l'extraction optionnelle ; consolidation possible en follow-up.

---

## Deferred from: code review of 19-4-doc-orga-membre-comprendre-les-cotes (2026-06-07)

- Onglet Équipe : pas de libellé `chanceSource` côté API composition — snapshot appliqué silencieusement sur `chancePercent` ; gap 6.14 vs doc UX.
- Gate `./gradlew test` non prouvé dans le diff doc-only — infra Gradle locale signalée en Dev Agent Record.
- Titres de sections vs checklist story — cosmetique (« Pourquoi l’historique compte » vs « Participations passées »).
- Cas limites doc utilisateur MVP : historiques inégaux multi-places, snapshots partiels, assignation manuelle sans tirage.

---

## Deferred from: code review of 19-7-breakdown-explicabilite-par-facteur (2026-06-07)

- `indexOf` dans boucle facteurs O(n²) — un seul facteur en prod ; refactor quand le pipeline grossit.
- Fallback `javaClass.simpleName` pour facteurs non `LabeledDrawWeightFactor` — registry à prévoir avec futurs facteurs Wave B+.

---

## Deferred from: code review of 8-7-rappels-automatiques-disponibilite-cadence-5-jours (2026-06-07)

- Cadence avancée malgré opt-out total push+email — **accepté (PO : B)** : marque = run traité, aligné 8.5 ; pas de pré-filtre prefs avant claim.
- Marque consommée si dispatch échoue après claim — même pattern que `AssigneePresenceReminderJob` (story 8.5).
- Course recipient répond entre claim et `afterCommit` dispatch — fenêtre étroite, pas de re-resolve au dispatch.
- Suite Gradle non entièrement verte (793/796) — échecs hors périmètre 8.7.
- `@Scheduled` Cloud Run scale-to-zero — documenté dans Dev Notes story 8.7, même limitation que 8.5.

---

## Deferred from: code review of 8-2b-preferences-membre-copy-masquage-d6 (2026-06-08, revue #2 as-shipped)

- PATCH push debouncé après désactivation globale appareil — fenêtre debounce 300 ms ; guard optionnel MVP.
- `uiState` enabled pendant `disable()` async — pas de signal busy partagé ; pattern 8.1.
- Test count 5 lignes explicite absent — filtrage D6 couvert indirectement.
- Libellés canal mobile `0.7rem` vs token `body-medium` — polish M3.
- `display: contents` sur wrappers channel desktop — trade-off grille accepté.
- Fallback copy clé API inconnue — story 8.8.

---

## Deferred from: code review of 10-3b-about-build-metadata (2026-06-14)

- Requête 404 `/version.local.txt` en prod — trade-off accepté AC3 (local-first puis fallback).
- Couplage libellés canal sur 4 artefacts (release shell, patch Docker, parser TS, doc) — contrat implicite MVP.
- Pas de tests `patch-version-txt-channel.mjs` — script CI simple ; couverture parser Angular suffisante pour l’UI.
- `version.local.txt` stale sans redémarrage `start-dev.sh` — workflow dev documenté DEPLOYMENT_WORKFLOW.md.

---

## Liens normatifs

| Sujet | Où tracer |
|-------|-----------|
| Bugs confirmés | [`ISSUES.md`](../../ISSUES.md) (ex. BUG-008 push prefs) |
| Réserve produit historique | PLAN § iso-V1, DW-020–021 (triage mai) |
| Epic 19 formules tirage | `sprint-status.yaml` — **reporté** post-2.1.0 |
| Dispatch brouillon partagé | Story **8.4** (hors DW-106 — mapping prefs déjà fait) |

---

## Deferred from: code review of 8-8-notifications-membre-event-details-et-archivage (2026-06-08)

- **`isActiveEngagedMember` N+1** — `NotificationRecipientResolver.kt` reconstruit le roster complet pour chaque destinataire archive ; correct, optimisation non requise MVP.
- **URLs 2 segments** — `NotificationPayloadBuilder.kt` ; dette connue, listée dans Non-goals story 8.8.
- **`ShareRecipientsService` ignore logs guest** — entrées `user_id = null` exclues de l’agrégat « déjà notifié » ; acceptable hors scope.
- **`AvailabilityPendingReminderJob` `userId ?: continue`** — fix défensif pour `NotificationRecipient` nullable ; support 8.8, non documenté dans story.

---

## Deferred from: code review of 8-9-notification-equipe-confirmee-member (2026-06-08)

- **AC4 re-dispatch test** — pas de test pour le second edge `→ COMPLETE` après régression lifecycle ; chemin produit optionnel (AC4 « may »).
- **Push opt-out unit test** — pas de test dédié `TEAM_COMPLETE_MEMBER` push bloqué ; même chemin dispatcher que les autres intents (email testé).
- **`./gradlew test` 3 échecs non liés** — `AvailabilityControllerIntegrationTest` ×2, `CompositionDrawIntegrationTest` ×1 (`chancePercent` null) ; pré-existants au périmètre draw/dispos.

---

## Deferred from: code review of 8-4-notifications-ops-organisateurs (2026-06-09)

- **`./gradlew test` non vert sur suite complète (838/841)** — 3 échecs `AvailabilityController` / `CompositionDraw` préexistants branche `v2`.
- **Claim reminder mark avant dispatch empêche retry si envoi échoue** — pattern hérité story 8.7 ; `CompositionIncompleteReminderJob.kt`.
- **`TEAM_COMPLETE` peut re-fire si lifecycle repasse COMPLETE après déclin** — edge rare, pas de dedupe sur `CompositionLifecycleAuditRecorder`.
- **Scan hebdo `CompositionIncompleteReminderJob` sans pagination** — perf acceptable court terme.
- **`minLength(3)` mot de passe global sur login** — scope creep recette dev-seed, hors AC 8.4.

---

## Deferred from: code review of 17-38-category-glossary-api (2026-06-09)

- **OpenAPI `events.yaml` non mis à jour pour le 400 catégorie inconnue** — hors scope explicite story (AC8 = `categories.yaml` only) ; gap doc pré-existant.
- **Constantes réservées dupliquées (`RESERVED_SLUGS` vs `HIDDEN_SLUGS`)** — risque de divergence future faible ; partage de constante reporté.
- **`labelForAutoCreate` code mort post-AC6** — nettoyage cosmétique dans `CategorySlugNormalizer.kt`.
- **Fenêtre race preview → delete inter-requêtes** — pas de token de confirmation ; comportement UX standard accepté pour v1.

---

## Deferred from: code review of 17-39-ui-category-selection (2026-06-09)

- **Navigation vers `/admin/parametres` sans route 17.40** — non-goal explicite story ; lien préparé pour 17.40.
- **`persistCategory` sans garde post-await identité événement** — même pattern que Date/Lieu ; pré-existant.
- **Échec silencieux `loadGlossary` onglet Infos** — helper inchangé ; pré-existant.
- **Fallback `categoryLabel` → slug brut si glossaire incomplet** — comportement hérité ; pré-existant.

## Deferred from: code review of 17-39-ui-category-selection (2026-06-09, v4 chips inline)

- **`saving` partagé orga/format/catégorie sans séquencement** — PATCH concurrents possibles ; pattern pré-existant onglet Infos.
- **Catégorie éditable sur spectacle archivé si `canManageEvents`** — même gate que format ; pas introduit par v4.
- **Changement `share-announce-messages.ts` hors scope 17.39** — copy rappel dispo ; à committer séparément ou revert.

---

## Deferred from: code review of 17-40-troupe-settings-categories (2026-06-09)

- **`AvailabilityService.kt` modifié (draw odds operational)** — changement story 19.x bundlé dans le working tree ; sans lien avec Paramètres catégories.
- **Tests composition (`CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest`)** — idem, bundlé sans lien 17.40.
- **Race concurrent delete : `affectedEventCount` peut diverger du preview** — intégrité données OK ; count preview/delete peut être stale sous concurrence ; pattern v1 accepté (cf. 17-38).

---

## Deferred from: code review profil offline dev V2 (2026-06-09)

- **Aucun test smoke du profil `dev,offline`** — pas de test d’intégration Spring (wiring auth, Flyway H2, seeds Improbots) ; outillage dev, non bloquant.
- **Verrou H2 si second `bootRun` concurrent** — `.local/hatcast-offline/*.lock.db` peut bloquer le démarrage ; reset manuel documenté.
- **Chemin H2 `${user.dir}/../../` hors `services/api`** — fonctionne via `start-dev.sh` (cwd garanti) ; `bootRun` manuel depuis un autre répertoire non supporté.
- **ARCH.md sans mention du mode offline** — couvert par `DEVELOPMENT.md` + `services/api/README.md` ; ARCH normatif V2 runtime inchangé (outil dev local).

---

## Deferred from: code review of 6-23-modales-partager-annoncer-manuel-compact (2026-06-09)

- **Tooltip WhatsApp via `title` natif** — préexistant story 6.15 ; `matTooltip` non importé ; M3-1 partiellement satisfait.
- **AC10 suite web complète non verte** — 80 échecs préexistants / 29 fichiers ; tests share-announce 18/18 OK.
- **`::ng-deep` panel menu** — dette technique Angular ; pattern acceptable court terme pour `panelClass`.
- **Menu noms sans max-height** — débordement si audience très large ; **résolu en review 6.23** (`max-height` + `overflow-y` sur panel menu).

---

## Deferred from: code review of perf-02-inbox-badge-cache (2026-06-09)

- **Gate S1 ≤ 800 ms non atteinte** (hub 1203 ms, compte 962 ms) — inbox retiré du chemin critique ; goulots auth/troupes adressés par PERF-04.
- **Pas de test intégration « action inbox → retour /accueil → badge à jour »** — couverture AC2 repose sur tests unitaires + revue code.
- **Pas d'invalidation serveur (push/WebSocket)** — tradeoff TTL 60 s documenté ; endpoint count envisagé PERF-06 (non livré — cache front suffisant MVP).

---

## Deferred from: PERF-06 inbox-api-profiling (2026-06-09)

- **`GET /me/inbox/count` endpoint léger** — option plan perf ; non requis AC ; badge PERF-02 utilise réponse complète avec cache 60 s.
- **Profilage Neon prod / Improbots volumineux** — garde-fou p95 sur H2 fixture minimale ; valider p95 réel sur branche dev avec données représentatives avant release perf.
- **`NotificationRecipientResolver.isActiveEngagedMember` N+1** — item existant deferred-work 8-8 ; hors chemin `MeInboxService`.
- **Suite `./gradlew test` 5 échecs préexistants** — composition/availability draw ; voir deferred-work 8-4/8-9 ; aucun lien PERF-06.

---

## Deferred from: code review of perf-06-inbox-api-profiling (2026-06-09)

- **Pas de delta chiffré avant/après** — plan DoD §5.1 ; baseline RC-8 ~912 ms non reprise dans Completion Notes story.
- **Fixture perf minimale sans scénario inbox « riche »** — membre seed sans pending confirmations ni horizon rempli ; garde-fou AC1 ne stress pas les chemins RC-8 optimisés.
- **Risque drift requêtes DISTINCT vs COUNT miroir** — `findParticipatingSeasonIds*` conservées à côté de `existsParticipatingSeason*` ; correction future doit toucher les deux chemins.

---

## Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09)

- **Guard and logout integration test gaps** — no spec for guard 401/UrlTree or logout → effect → refetch chain.
- **Navigation spec uses stubs not real EventDetail/UserAgenda** — AC2 proven at router level only; e2e or real-component spec deferred.
- **Testing helper underused** — `member-shell-bootstrap.testing.ts` exists but page specs duplicate inline mocks.
- **Remaining shell pages still call ensureHatcastSession** — progressive migration explicit non-goal; season-home, troupe-hub, admin routes still refetch.
- **Bootstrap memo stale after auth cache invalidation without sessionUser clear** — pre-existing `AuthApiService` 401 path; **partially addressed** in PERF-09 review (clear `sessionUser` on 401).

---

## Deferred from: code review of perf-09-member-shell-bootstrap-resolver (2026-06-09) — 3-lite follow-up

- **Boot network/5xx retry UI** — On bootstrap `status 0` or 5xx, show retry screen instead of redirect to `/connexion` (decision 2+3-lite; auth 401 still redirects with post-login URL restore).

---

## Deferred from: code review of perf-10-event-detail-page-bff (2026-06-09)

- **`includeChances` non passé depuis le front** — by design : lazy 5.9 / PERF-13 ; BFF garde `includeChances=false` par défaut comme spécifié.
- **Fallback `loadComposition` legacy si BFF équipe sans payload** — filet de sécurité hérité de PERF-03 ; risque d’appel supplémentaire marginal.
- **`ensureMembershipParticipants` sur GET `/page`** — dette acceptée (D2:2, perf-10 review) ; hérité de `listSelectors`/`getComposition` ; fix roster/perf si priorisé.

## Deferred from: code review of perf-16-db-latency-observability (2026-06-10)

- **ThreadLocal JDBC metrics sur threads async/scheduled** — seul le filtre HTTP appelle `clear()`/`remove()` ; jobs `@Scheduled` futurs pourraient fuiter ou gonfler les compteurs.
- **BeanPostProcessor enveloppe tout bean `DataSource`** — risque théorique de double proxy si plusieurs beans ; pratique Spring Boot = un seul DS.
- **p95 sur n=10 ≈ max** — formule percentile sur 10 échantillons retourne le max ; acceptable pour gate manuel si documenté.
- **`NeonAgendaPerformanceIntegrationTest` MockMvc in-process** — ne mesure pas le RTT réseau Neon/Cloud Run ; gate documenté comme opt-in manual CI avec waiver.

## Deferred from: code review of 17-41-nav-shell-ma-troupe (2026-06-12)

- **No logout / access-denied slug clear** — story explicitly deferred (season slug not cleared on logout either); `clearLastVisitedTroupeSlug` exported but unused in prod paths.
- **Full `npm run test -w @hatcast/web` suite failures** — pre-existing (76+ failures unrelated to this story); targeted includes pass (22/22).

## Deferred from: code review of 17-43-event-detail-contexte-infos (2026-06-12)

- **`Location.back()` si `navigationId > 1` peut renvoyer hors HatCast** — conforme ED3 / pattern story ; pas de garde route membre.
- **Test gap fallback chevron vers `/troupes/:slug`** — allowlist étendue mais `onBack()` non testé sur ce chemin.
- **Test gap AC8 Saison absente sur 404/403** — pas d’assertion intégration dans `event-detail.spec.ts`.
- **Badge statut absent pendant spinner chargement onglet Équipe** — acceptable UX de chargement.
- **Test équipe brouillon ne couvre pas AC 7b** — `event-equipe-tab.spec.ts` n’asserte pas le badge quand `availabilityOpenedAt == null`.

## Deferred from: code review of 17-44-hub-troupe-mini-chart-saison (2026-06-14)

- **E2E helper added but no Playwright spec consumes it** — story marks E2E optional/non-blocking ; `expectTroupeHubSeasonChartVisible` ready for future wiring.
- **`slug` required on `StatisticsEvent` OpenAPI** — monorepo co-deploy with front ; intentional additive breaking field.
- **Extra `loadViewsByEventIds` on every stats call** — acceptable story scope ; monitor if perf issue surfaces on large seasons.

## Deferred from: code review of 19-8-facteur-equity-tag-history-ex-17-9 (2026-06-14)

- **Double requête SQL sur explainability** — `buildRolePoolContext` exécute scoped + unscoped par rôle ; trade-off documenté en Dev Notes 19.8.
- **Branche spéciale `when (CategoryCompartmentFactor)` dans breakdown** — acceptable pour DEFAULT à 2 facteurs ; extensibilité à revoir avec facteurs narratifs futurs.
- **Pas de test d’intégration bout-en-bout `CompositionExplainabilityService` → delta `equity_tag`** — couvert par tests unitaires + intégration draw compartiment.

## Deferred from: code review of 19-10-facteur-nombre-demandes-role (2026-06-14)

- **Requête role-request relancée par rôle au tirage** — acceptable Wave C tant que facteur hors DEFAULT ; optimiser si activé en prod (19.16+).
- **DRY compartiment partiel** — `SpectacleCategoryCompartmentJpql` extrait mais requêtes historiques existantes du slot repo inchangées ; refactor opportuniste.
- **Pas de test mock prouvant z SQL en DEFAULT (AC18)** — chargement conditionnel présent via `includesRoleRequest` ; pattern identique 19.9.

## Deferred from: code review of 19-15-spec-formules-politiques-adr (2026-06-15)

- **Identité UUID stable de la formule system V1** — contrat de seed reporté à story **19.16**.
- **`formulaId` pour Simuler / preview % (19.17 AC3)** — comportement HTTP/UI reporté à **19.17–19.18**.
- **Epics 19.16 AC3 (system V1 seul) vs OQ-19-02 (CHOICE + published + system V1)** — epics à realigner au grooming Wave D.
- **Epics 19.18 titre « admin saison » vs OQ-19-05 TROUPE_ADMIN only** — epics outdated ; spec 19.15 fait foi.
- **PLAN.md résumé résolution tronqué (sans chemin implicit CHOICE)** — hors scope 19.15 ; MAJ PLAN opportuniste.
- **Codes HTTP draw (403 vs 400) pour formulaId hors liste** — OpenAPI **19.18**.
- **Visibilité effective policy pour membres (Équipe tab)** — story **19.21**.
- **Défaut `immediate_replay.params.mode` si absent** — **19.16** param wiring.

## Deferred from: code review of 19-16-persistance-formules-defaut-v1 (2026-06-15)

- **`DrawPolicyValidator` n'exige pas `status=PUBLISHED`** — enforcement runtime et validation API reportés à **19.18**.
- **`troupeScopeKey`/`seasonScopeKey` non imposés à la persistance** — factory/service policy save en **19.18**.
- **V65 prépare un statement JDBC par troupe** — volume troupes MVP acceptable ; optimiser si backfill massif.
- **`draw_policies` sans `created_at`** — hors AC1 explicite ; audit historique si besoin futur.

## Deferred from: code review of 19-19c-ui-admin-editeur-formules (2026-06-17)

- **Verrouillage optimiste `version` non envoyé au PATCH** — API n'exige pas version client ; risque écrasement concurrent accepté MVP.
- **`troupeId` input change sans reload** — composant parent stable en pratique ; edge théorique.
- **Race `reload()` concurrent sans séquence** — pas de déclencheur UI parallèle.
- **État vide liste sans copy dédiée quand `formulas=[]`** — CTA « Nouvelle formule » suffit MVP.
- **Pas de bouton retry sur erreur chargement F1** — hors AC.
- **Badges direction sans tokens error/tertiary distincts** — écart M3 mineur.

## Deferred from: code review of 19-19b-factor-params-runtime-tests (2026-06-16)

- **Golden REF-P uniquement `formulaSave`** — chemin `formulaPublish` non couvert par fixtures HTTP ; `validateForPublish` délègue à `validateForSave` donc comportement OK.
- **Messages FR non assertés en intégration** — `DrawFormulaValidationIntegrationTest` ne vérifie que le status HTTP ; substrings couverts par `DrawFormulaValidatorTest` — couverture unitaire suffisante pour MVP.
- **Artefact test design absent du dépôt** — `19-19b-factor-params-test-design.md` référencé dans la story mais non versionné ; payloads présents dans golden JSON.
- **Spec normative 19.19a non mergée sur branche** — `draw-formulas-policies-spec.md` sans `strength`/`malusMultiplier` ; runtime aligné sur table AC story ; merge doc 19.19a séparé.
- **`@Tag("19.19b")` absent sur `DrawFormulaPipelineGoldenTest`** — fixtures JSON taguées mais pas la classe ; filtrage CI par tags JSON suffisant pour MVP.

## Deferred from: code review of 19-21-ui-orga-choix-formule-tirage (2026-06-19)

- **Cible 48×48 dp non codée explicitement sur le bouton ⋮** — défaut Material + pattern existant repo (`event-equipe-tab.scss:189-192`).
- **Couverture E2E Playwright menu formule / tirage `formulaId`** — artefact séparé `19-21-e2e-formula-choice.md`, hors scope unit tests story.

## Deferred from: code review of 11-2-posthog-identify-person-properties-m4-cutover (2026-06-19)

- **Dédupe `localStorage` écrite avant `capture()`** — P1 at-most-once ; même pattern que `sessionStorage` FR47 all-confirmations.
- **Pas de test intégration logout → reset → re-identify** — hors périmètre AC8 ; code AC4 correct (`resetSession` au logout).
- **Course multi-onglets sur première session** — P1 acceptable pour cutover ~30 users.
- **Props personne obsolètes si email/name effacés côté API** — cas rare ; PostHog ne reçoit pas d’unset explicite.
- **`identifyUser` no-op si PostHog pas encore initialisé** — comportement OPS-9 préexistant.
- **Sémantique `v2_migration_first_session` = premier identify navigateur** — P1 documenté ; choix PO.

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

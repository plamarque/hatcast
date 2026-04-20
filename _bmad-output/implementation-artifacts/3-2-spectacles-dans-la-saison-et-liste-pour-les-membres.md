# Story 3.2 : Spectacles dans la saison et liste pour les membres

Status: in-progress

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant qu’**administrateur ou membre**,  
je veux **gérer les spectacles** (CRUD côté admin) et **voir la liste des événements** de la saison côté membre,  
afin de **planifier et consulter** l’agenda de la troupe.

## Acceptance Criteria

1. **Given** une **saison** existante (identifiant stable côté API, ex. UUID — cf. story 3.1), **when** un **admin** crée ou modifie un **spectacle** avec les champs supportés (au minimum **titre**, **horodatage** de début — et **lieu** / **description** si le produit les prévoit dans [DOMAIN.md](../../DOMAIN.md) / [SPEC.md](../../SPEC.md)), **then** l’événement est **persisté en Postgres** via l’API V2, **listé** pour les membres autorisés, et les chemins **REST + OpenAPI** sont documentés — **FR12**.
2. **Given** un **membre** ayant accès à la saison (même règle d’appartenance que la story 3.1 jusqu’à epic-2), **when** il ouvre la **liste des événements** de cette saison, **then** il voit les spectacles auxquels il a accès, avec **pagination** (ou équivalent) côté **API** et **UI** — **FR13**, **NFR-P1**. Les réponses de liste restent **bornées** et **utilisables** pour une interaction courante — **NFR-P2** (pas de chargement illimité ni réponses disproportionnées pour une troupe type).
3. **Given** une action d’**archivage** (ou équivalent métier « spectacle inactif » aligné [product brief / DOMAIN](../planning-artifacts/product-brief-hatcast-v2.md)), **when** un admin la confirme, **then** l’état est reflété côté serveur et la **liste membre** respecte la règle produit (ex. masqué aux membres, visible admin — à figer explicitement dans le service et les tests).
4. **Given** la route **`/saison/:slug`** (placeholder story 3.1), **when** l’utilisateur ouvre une saison depuis `/seasons`, **then** l’écran affiche une **liste d’événements** exploitable (ordre chronologique par défaut), cohérente avec [ux-design-hatcast-v2.md — Season calendar / event list](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar) pour les **éléments de base** (cartes/lignes cliquables, parcours vers le détail si une route est livrée dans ce périmètre). **Ne pas** livrer toute la **coque agenda** (filtres participants/événements, bascule agenda/historique, groupement mois complet) : c’est **story 3.3** (UX-DR2).

## Contexte produit et découpage (3.2 vs 3.3)

- **3.2** : modèle **spectacle/événement**, **API** CRUD admin + **lecture** paginée pour membres, **UI** liste dans le contexte saison ([`season-home`](../../apps/web/src/app/pages/season-home/season-home.ts)).
- **3.3** : vue **agenda/calendrier** enrichie (en-tête, filtres, bascule agenda/historique, lignes groupées par mois avec statuts composition / pastilles dispo — cf. epics story 3.3).

### Règle produit — vue **Agenda** (liste à venir)

Réf. UX détaillée : [ux-design — Agenda content scope](../planning-artifacts/ux-design-hatcast-v2.md#agenda-content-scope-product-rule) et capture [`season-agenda-v2-upcoming-malice-2026.png`](../planning-artifacts/ux-references/season-agenda-v2-upcoming-malice-2026.png).

Pour l’écran **Agenda** (liste type capture V2 / [ux-design — Season calendar](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar)), n’afficher **que** :

1. les spectacles **non archivés** ;
2. les spectacles dont la **date** n’est **pas** avant **aujourd’hui** (jour civil **inclus** : tout spectacle prévu **le jour courant** reste listé tant qu’il n’est pas archivé).

Les spectacles **strictement passés** (jours antérieurs au jour courant) relèvent de la vue **Historique**, pas de l’Agenda. **Trancher** le fuseau horaire pour « aujourd’hui » (recommandation documentée dans l’UX : utilisateur ou `Europe/Paris`) et refléter la règle dans l’**API** (filtre serveur) pour éviter de charger des pages d’événements hors périmètre.

**Découpage 3.2 vs 3.3 :** la **coque Agenda** (header, filtres, bascule agenda/historique, groupement par mois complet) est **story 3.3** (UX-DR2). En **3.2**, livrer une **liste d’événements** paginée côté saison (ordre chronologique) **sans** imposer tout le chrome 3.3. En revanche, **prévoir l’API** pour que la liste puisse être filtrée (ex. query `scope=all|upcoming` ou endpoint séparé agenda) afin que **3.3** réutilise le même backend sans refonte. Ne pas appliquer le filtre « agenda only » uniquement côté client sur des pages entières de données passées.

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` ; pas de `legacy/` sauf arbitrage documenté.
- [x] **Persistance :** migration Flyway `services/api/src/main/resources/db/migration/` — table `events` (nommage **snake_case**, FK `season_id`, index pour liste paginée / tri par date, champs d’audit si alignés au reste du module saison).
- [x] **API REST :**
  - Résolution saison : endpoint **slug → saison** (voir *Slug vs id* ci-dessus) si non déjà livré.
  - Liste paginée : ex. `GET /v1/seasons/{seasonId}/events` (aligné [architecture — exemple](../planning-artifacts/architecture.md#pattern-examples)) ; query `page`, `size`, tri par défaut documenté (ex. `startsAt` asc) ; option de **scope** pour réutilisation **3.3** (voir *Règle produit — vue Agenda*).
  - CRUD admin : création / mise à jour / archivage (ou `PATCH` + action dédiée — **un** style cohérent avec `SeasonController`).
  - **Sécurité :** enregistrer **chaque** chemin dans [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) ; mutations avec session + **CSRF** comme [`hatcast-csrf.ts`](../../apps/web/src/app/core/http/hatcast-csrf.ts) + [`season-api.service.ts`](../../apps/web/src/app/core/seasons/season-api.service.ts).
  - **Autorisation :** étendre [`TroupeAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) ou service dédié : **admin** = mutations ; **membre** = lecture liste si accès saison (même règle temporaire que 3.1 jusqu’à epic-2 — **documenter** dans le code + test).
- [x] **OpenAPI :** fragment `services/api/openapi/` (ex. `events.yaml`) + lien au bundle principal si présent ; contrats alignés DTO **camelCase**, dates **ISO 8601 UTC**.
- [x] **Angular :** service `EventApiService` (ou équivalent sous `core/events/`) ; page saison : liste Material (table ou cartes), actions admin (création/édition via **MatDialog** comme saisons), **MatPaginator** aligné sur l’API.
- [x] **Tests :** intégration API (création, liste paginée, 403/401, archivage) ; tests unitaires web sur le service ou composant critique ; `./gradlew test` et build Angular OK.

### Review Findings

- [x] [Review][Patch] Chargement session bloqué si session invalide dans la vue saison [`apps/web/src/app/pages/season-home/season-home.ts`]
- [x] [Review][Patch] Type SQL temporel potentiellement ambigu pour `Instant` (`TIMESTAMP` vs timezone explicite) [`services/api/src/main/resources/db/migration/V5__events.sql`]
- [x] [Review][Patch] Pagination non recalée après archivage sur la dernière ligne d’une page [`apps/web/src/app/pages/season-home/season-home.ts`]
- [x] [Review][Patch] Contrat OpenAPI événements incomplet/incohérent avec les fragments existants (security/server/réponses d’erreur) [`services/api/openapi/events.yaml`]
- [x] [Review][Defer] Contrôle d’accès lecture/écriture non différencié (modèle membre/admin provisoire avant epic-2) [`services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`] — deferred, pre-existing
- [x] [Review][Defer] Résolution de saison par `slug` basée sur la première troupe (acceptable tant que seed unique) [`apps/web/src/app/pages/season-home/season-home.ts`] — deferred, pre-existing
- [x] [Review][Patch] Implémentation story 3.2 absente du diff de branche (CRUD événements + listing paginé + vue saison opérationnelle + filtre agenda) [`services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt`] — fixé dans le working tree courant (hors scope strict `main...HEAD`).
- [x] [Review][Patch] Activation d’une saison réactive implicitement une saison archivée (`archived=false` dans `activate`) [`services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt`]
- [x] [Review][Patch] Tests d’intégration saisons non déterministes (assertions absolues sur `totalElements`) [`services/api/src/test/kotlin/com/hatcast/api/season/SeasonControllerIntegrationTest.kt`]
- [x] [Review][Patch] Sémantique PATCH ambiguë: impossible de vider explicitement les champs optionnels (null ignoré) [`services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt`] — résolu : `JsonNullable` + désérialiseur dédié (`UpdateSeasonRequestDeserializer`) : clé absente = inchangé, `null` JSON = effacer ; `title: null` → 400.
- [x] [Review][Defer] Modèle d’accès lecture membre vs gestion admin non séparé (dépend d’epic-2 / matrice permissions) [`services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`] — deferred, pre-existing
- [x] [Review][Defer] Revue **uniquement** sur `git diff HEAD` (2026-04-21) : ce diff ne contient pas `event/*`, `season-home/*` (hors routes/api), désérialiseur/tests unitaires PATCH hors intégration, ni migrations — les AC 3.2 supposent le livrable complet sur la branche ; valider le reste via historique `v2` ou commits avant merge.

## Dev Notes

### Architecture et garde-fous

- Monorepo V2 : [ARCH.md](../../ARCH.md) ; patterns REST/JSON : [architecture.md](../planning-artifacts/architecture.md) (sections *Naming*, *Format*, *Good:* `GET /v1/seasons/{seasonId}/events`).
- Auth session : [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; appels `fetch` avec `credentials: 'include'`.
- UI : [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; libellés **FR** pour l’utilisateur.

### Blocs existants (ne pas réinventer)

| Sujet | Emplacement |
|--------|-------------|
| Saisons, pagination, erreurs API | [`SeasonController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt), [`SeasonService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt), [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml) |
| Accès troupe (seed) | [`TroupeAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) |
| CSRF + client API web | [`hatcast-csrf.ts`](../../apps/web/src/app/core/http/hatcast-csrf.ts), [`season-api.service.ts`](../../apps/web/src/app/core/seasons/season-api.service.ts) |
| Liste saisons, dialogues | [`seasons-list/`](../../apps/web/src/app/pages/seasons-list/) |
| Route saison | [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) — `saison/:slug` → [`season-home`](../../apps/web/src/app/pages/season-home/season-home.ts) |

### Intelligence story précédente (3.1)

- **Fichiers livrés :** migration `V3`/`V4`, entités saison, `SeasonController` sous `/v1/troupes/{id}/seasons` et `/v1/seasons/{id}`, tests d’intégration saison.
- **Règle temporaire :** membre seed / appartenance troupe pour CRUD saison — **réutiliser ou factoriser** pour « peut administrer les spectacles de cette saison » vs « lecture seule ».
- **Navigation :** `/seasons` → carte → `/saison/:slug` ; la page saison doit résoudre **seasonId** à partir du **slug** avant d’appeler les événements.
- **Slug vs id (point critique) :** l’URL publique utilise **`slug`** ; l’API actuelle expose `GET /v1/seasons/{seasonId}` mais **pas** de lecture par slug seul. **À prévoir dans cette story :** soit **`GET /v1/troupes/{troupeId}/seasons/by-slug/{slug}`** (ou équivalent REST), soit documenter un contournement acceptable (ex. parcourir la liste paginée des saisons et matcher le `slug` — acceptable seulement si volume faible et tests explicites). Sans cela, le client Angular **ne peut pas** charger les événements à partir de `:slug` seul.

### Types d’événement et rôles (hors scope)

- **Story 3.4** : types et rôles requis/optionnels — en 3.2, prévoir un modèle **extensible** (ex. colonne optionnelle ou valeur par défaut) sans implémenter toute la config métier 3.4.

### Détail spectacle plein écran / onglets

- SPEC canonical : `/season/:slug/event/:eventId` — le dépôt V2 utilise le préfixe **`/saison/`**. Une **coquille minimale** ou lien « placeholder » vers le détail peut être acceptable si les AC de cette story restent centrées **liste + CRUD** ; le détail riche (onglets Infos/Dispos/Équipe) relève d’**epic-6** / stories dédiées.

### Références

- [Epics — Story 3.2](../planning-artifacts/epics.md)
- [UX V2 — Season calendar / event list](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar)
- [SPEC.md](../../SPEC.md) (contrats URL événement, comportements futurs)
- [DOMAIN.md](../../DOMAIN.md) (notions saison / événement)

## Dev Agent Record

### Agent Model Used

Cursor agent (bmad-dev-story, implémentation 3.2).

### Debug Log References

_(aucun)_

### Completion Notes List

- **API :** migration `V5__events.sql`, entité `EventEntity`, `EventService` avec `scope=all|upcoming` (borne « aujourd’hui » : début de jour **Europe/Paris**), `GET /v1/troupes/{troupeId}/seasons/by-slug/{slug}`, CRUD événements sous `/v1/seasons/{seasonId}/events`, incrément `season.event_count` à la création.
- **Web :** `EventApiService`, `getSeason` / `getSeasonBySlug` dans `SeasonApiService`, page `season-home` (liste cartes, paginator, toggle « Afficher passés et archivés » = `scope=all` vs défaut `upcoming`), dialogues `event-form-dialog`, suppression du placeholder `season-home-placeholder`.
- **Contrats :** [`openapi/events.yaml`](../../services/api/openapi/events.yaml), [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml) (chemin by-slug).
- **Tests :** `EventControllerIntegrationTest` ; `event-api.service.spec.ts` ; `./gradlew test`, `ng build`, `ng test` OK. Complément PATCH saisons : `UpdateSeasonRequestDeserializerTest`, `SeasonServiceUpdateTest`, tests d’intégration enrichis dans `SeasonControllerIntegrationTest`.

### File List

- `services/api/src/main/resources/db/migration/V5__events.sql`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/UpdateSeasonRequestDeserializer.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt`
- `services/api/openapi/events.yaml`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`
- `apps/web/src/app/core/events/event-api.service.ts`
- `apps/web/src/app/core/events/event-api.service.spec.ts`
- `apps/web/src/app/core/seasons/season-api.service.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-home.scss`
- `apps/web/src/app/pages/season-home/event-form-dialog.ts`
- `apps/web/src/app/app.routes.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-04-21 : Implémentation spectacles par saison (API + UI), story passée en **review**.
- 2026-04-21 : PATCH saisons — `null` explicite efface `description` / dates ; `title: null` interdit (400) ; tests d’intégration.

---

### Validation create-story (`checklist.md`) — 2026-04-21

Revue adversariale : écarts corrigés dans le corps du document (slug→saison, découpage API agenda vs 3.3). Synthèse des axes restants pour l’implémentation : tests d’intégration pour `scope`/filtre date ; choix explicite du fuseau horaire ; pas de duplication de la logique « agenda » uniquement en frontend sur gros volumes.

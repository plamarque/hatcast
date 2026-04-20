# Story 3.1 : Gestion des saisons (création, édition, archivage) et liste saisons

Status: done

<!-- Prochaine story prioritaire (chemin valeur agenda + dispos) — epic-3 ouvert dans sprint-status.yaml -->

## Story

En tant qu’administrateur,  
je veux créer, modifier et archiver des saisons, avec une liste de cartes saisons,  
afin d’organiser le travail par saison (y compris une seule saison active par troupe si DOMAIN l’impose).

## Acceptance Criteria

1. **Given** droits admin sur la troupe, **when** l’admin crée ou modifie une saison avec les champs requis (voir [SPEC.md](../../SPEC.md) et [DOMAIN.md](../../DOMAIN.md) pour intitulés / obligatoires), **then** la saison apparaît dans la liste et est persistée en **Postgres** via l’API V2 (pas de `legacy/` sur ce périmètre) — **FR11**. Préciser les chemins d’API dans OpenAPI et les Dev Notes.
2. **Given** une action d’archivage ou d’activation, **when** elle est confirmée, **then** l’état `archived` / actif est reflété, et **au plus une saison active par troupe** : activer une saison désactive les autres (audit ou traçabilité si le produit l’exige) — [DOMAIN.md](../../DOMAIN.md) (règle saison active unique).
3. **Given** la vue liste des saisons sur la route canonique **`/seasons`**, **when** l’utilisateur autorisé ouvre l’écran, **then** la grille de cartes, le CTA **« Nouvelle saison »** et les actions carte / kebab (édition, archivage, etc.) sont conformes à la section *Screen: Seasons list (`/seasons`)* du document [ux-design-hatcast-v2.md — liste des saisons](../planning-artifacts/ux-design-hatcast-v2.md#screen-seasons-list-seasons) (UX-DR1) ; Angular Material + thème / tokens ([FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)).
4. **Given** une troupe avec **beaucoup** de saisons, **when** l’admin consulte la liste, **then** la charge reste raisonnable — **NFR-P1** : pagination (ou équivalent : cursor, page size) côté **API** et **UI**, avec comportement documenté (taille de page, tri par défaut).

## Contexte T0 (produit)

- **Priorité roadmap :** story suivant l’auth (epic-1, 1.1–1.5) ; débloque **3.2** (spectacles), **3.3** (agenda) et **5.x** (dispos).
- **Single tenant effectif :** troupe et saison **seed** possibles ; l’UI/API doivent toutefois supporter CRUD + archivage / activation réels.
- **Rôles / invitations (epic-2) :** hors périmètre — simplification provisoire acceptable (ex. membres de la troupe seed traités comme pouvant administrer) ; consigner la règle appliquée en implémentation et en tests (voir *Règle temporaire* ci-dessous).

## Interface avec la story 3.2

- Exposer un **identifiant de saison** stable (ex. UUID ou clé API) et les métadonnées minimales attendues par la navigation **vers la saison** (liste d’événements, agenda).
- Depuis **`/seasons`**, l’ouverture d’une carte mène vers la **vue saison** (route et stack à figer en cohérence avec [epics — Story 3.2](../planning-artifacts/epics.md) et l’UX *Season calendar*).
- Ne pas anticiper tout le métier 3.2 : fournir seulement les **contrats** (modèle, API, routes) dont 3.2 a besoin.

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` ; ne pas toucher à `legacy/` sauf arbitrage explicite.
- [x] **Sécurité :** aujourd’hui [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) impose `anyRequest().denyAll()` après les routes d’auth — **enregistrer explicitement** chaque verb + chemin des endpoints saisons (authentification requise ; règles **admin** à définir, cf. *Règle temporaire*). CSRF : mutations avec cookie de session — réutiliser le modèle des appels `fetch` avec `credentials: 'include'` côté Angular.
- [x] **Modèle domaine V2 :** troupe (ou agrégat minimal), saison (slug, libellés, plages de dates si requis, état actif / archivé) ; **contrainte transactionnelle** « une saison active par troupe ». Migrations **Flyway** : `services/api/src/main/resources/db/migration/`.
- [x] **API REST + validation :** CRUD saisons, archivage, activation ; réponses d’erreur cohérentes (`ApiExceptionHandler` / problèmes). Session Spring (post-[ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)) inchangée dans son principe.
- [x] **OpenAPI :** nouveau fragment YAML sous [`services/api/openapi/`](../../services/api/openapi/) (même style que [`auth.yaml`](../../services/api/openapi/auth.yaml)) et branchement au contrat principal si présent.
- [x] **Angular :** route **`/seasons`** dans [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) ; page liste cartes ; formulaires création / édition ; dialogues de confirmation archivage / activation ; **pagination** (MatPaginator ou équivalent) alignée sur l’API.
- [x] **Tests :** intégration API — règle « une active par troupe », archivage, **pagination** ; tests web sur chemins critiques ; `./gradlew test` et build web OK.

## Dev Notes

### Architecture & guardrails

- Vue d’ensemble : [ARCH.md](../../ARCH.md) (monorepo, V2 Angular + API + Postgres).
- Persistance Neon / Flyway : [ADR-0009](../../docs/adr/0009-neon-postgres-environments.md) ; [MONOREPO.md](../../docs/shared/technical/MONOREPO.md).
- Auth session serveur (Identity Platform côté client) : [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; slice actuel documenté dans [ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md) (déprécié mais utile pour l’historique des choix).
- **Garde-fou** : toute nouvelle surface `/v1/...` doit être **autorisée** dans `SecurityConfig` — ne pas seulement « implémenter le controller ».

### Blocs existants (ne pas réinventer)

| Sujet | Emplacement |
|--------|-------------|
| Session HTTP / cookie `HATCAST_SESSION` | [`application.yml`](../../services/api/src/main/resources/application.yml), Spring Session JDBC |
| Politique durée de session (remember-me) | [`AuthSessionPolicy.kt`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt) |
| Exemple de controller REST + `/v1` | [`AuthController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt) |
| Erreurs API centralisées | [`ApiExceptionHandler.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/ApiExceptionHandler.kt) |
| Client `fetch` + `credentials: 'include'` | [`auth-api.service.ts`](../../apps/web/src/app/core/auth/auth-api.service.ts) |
| Routing SPA | [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) |
| OpenAPI auth (modèle de fragment) | [`openapi/auth.yaml`](../../services/api/openapi/auth.yaml) |
| UI Material / conventions | [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) |

### Règle temporaire (avant epic-2)

Tant que le modèle complet des rôles n’est pas livré, **documenter** dans le code (et un test) la règle retenue : ex. « utilisateur `GET /v1/auth/me` + appartenance à la troupe seed = peut CRUD saisons de cette troupe ». Cette règle doit être **remplaçable** par une vraie matrice de permissions sans refonte du domaine.

### Fichiers / zones probables

| Zone | Fichiers / dossiers |
|------|---------------------|
| API | `services/api/src/main/kotlin/com/hatcast/api/`, Flyway, extension `SecurityConfig` |
| OpenAPI | `services/api/openapi/` |
| Web | `apps/web/src/app/` — composants saisons, `app.routes.ts` |
| Tests API | `services/api/src/test/kotlin/...` (même arbre que le code) |

### Intelligence story précédente (1.5 — session)

- La session repose sur **cookie HttpOnly** + preuve côté client (voir [`1-5-deconnexion.md`](./1-5-deconnexion.md)) : les appels API métier doivent suivre le même modèle **POST/GET** avec `credentials: 'include'` et respect du **CSRF** si les mutations l’exigent.
- Si l’utilisateur n’a pas de session, `GET /v1/auth/me` échoue — les routes saisons doivent renvoyer **401** cohérent avec le reste de l’API.

### Out of scope

- Invitations, rôles avancés, profil membre : **epic-2** et stories dédiées.
- Liste spectacles / agenda : **3.2 / 3.3** — ne pas implémenter ici hors navigation minimale testable depuis une carte saison si nécessaire.

### Langue des artefacts

- Les livrables BMAD peuvent cibler l’anglais dans `_bmad/bmm/config.yaml` ; cette story reste en **français** pour l’équipe — les commentaires de code / messages utilisateur **FR** suivent [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) et le produit.

### Références

- [Epics — Story 3.1](../planning-artifacts/epics.md)
- [SPEC.md — administration V2 cible](../../SPEC.md)
- [DOMAIN.md — saison / saison active](../../DOMAIN.md)
- [UX V2 — liste saisons / `/seasons`](../planning-artifacts/ux-design-hatcast-v2.md#screen-seasons-list-seasons)

## Dev Agent Record

### Agent Model Used

Cursor agent (implémentation dev-story 3.1).

### Completion Notes List

- **API :** migration `V3__troupes_seasons.sql` (troupe seed La Malice + table `seasons`), migration `V4__seed_season_la_malice_2026_2027.sql` (saison seed **La Malice 2026-2027**, 01/09/2026–31/08/2027, slug `la-malice-2026-2027`, id `b0000001-0000-4000-8000-000000000001`), entités JPA, `SeasonService` avec activation exclusive par troupe, `TroupeAccessService` (seed uniquement, documenté pour epic-2), contrôleurs `/v1/troupes` et `/v1/.../seasons`, `SecurityConfig` étendu, gestionnaires `ResponseStatusException` et `DataIntegrityViolationException`.
- **Web :** `/seasons` (liste cartes, kebab, CTA, paginator 20/page, tri côté API par `createdAt` desc), `/saison/:slug` placeholder 3.2, `SeasonApiService` + `hatcast-csrf.ts`, dialogues Material création/édition et confirmation archivage/activation, lien depuis l’accueil connecté.
- **Contrat :** fragment [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml).
- **Tests :** `SeasonControllerIntegrationTest` (flux, pagination, 403, conflit slug) ; `season-api.service.spec.ts` ; `./gradlew test` et `ng build` / `ng test` OK.

### File List

- `services/api/src/main/resources/db/migration/V3__troupes_seasons.sql`
- `services/api/src/main/resources/db/migration/V4__seed_season_la_malice_2026_2027.sql`
- `services/api/src/main/resources/application.yml`
- `services/api/src/test/resources/application-test.yml`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/ApiExceptionHandler.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonControllerIntegrationTest.kt`
- `apps/web/src/app/core/http/hatcast-csrf.ts`
- `apps/web/src/app/core/seasons/season-api.service.ts`
- `apps/web/src/app/core/seasons/season-api.service.spec.ts`
- `apps/web/src/app/pages/seasons-list/confirm-dialog.ts`
- `apps/web/src/app/pages/seasons-list/season-form-dialog.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.html`
- `apps/web/src/app/pages/seasons-list/seasons-list.scss`
- `apps/web/src/app/pages/season-home-placeholder/season-home-placeholder.ts`
- `apps/web/src/app/pages/season-home-placeholder/season-home-placeholder.html`
- `apps/web/src/app/pages/season-home-placeholder/season-home-placeholder.scss`
- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/pages/home-signed-in/home-signed-in.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (statut story)

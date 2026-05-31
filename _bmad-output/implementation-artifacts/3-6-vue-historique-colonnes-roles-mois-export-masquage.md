# Story 3.6 : Vue ligue « Statistiques » (colonnes rôles / mois, export, masquage)

Status: done

<!-- Renamed from « Historique » per Correct Course 2026-05-24 (ADR 0012). Chronologie passée → Story 3.6b. -->

## Story

En tant que **membre ou organisateur**,  
je veux une vue **Statistiques** avec colonnes par rôle et par mois, expansion des détails et options d'**export** ou **masquage**,  
afin d'**analyser la participation** sur la ligue (taux de sélection vs disponibilité inclus).

## Acceptance Criteria

### Grille et chrome (UX-DR9)

1. **Given** des données disponibles pour la ligue (participants, événements, dispos, compositions), **when** l'utilisateur ouvre la vue **Statistiques** depuis le shell ligue (story **3.3**), **then** la grille **joueurs × familles de rôles × mois** s'affiche avec expand/collapse des détails (JEU, DECORUM, DEPLAC., BÉNÉVOLE — cf. [DOMAIN.md](../../DOMAIN.md) § Statistiques de composition), colonne participant **sticky**, scroll horizontal pour les mois, bouton **Masquer/Détails** sur la toolbar — **UX-DR9**, **FR53–FR54**, **NFR-P1**. **Not** the past-events chronology list (Story **3.6b**). Export CSV via menu admin saison (**17.32**).
2. **Given** un utilisateur autorisé sur la ligue, **when** il consulte Statistiques, **then** l'écran est accessible à **tous les membres** (pas admin-only), sauf restriction explicite future dans SPEC.
3. **Given** les définitions DOMAIN (spectacle local vs déplacement, sous-colonnes JEU MATCH/CAB/LONG/AUTRE, etc.), **when** les stats sont calculées, **then** les comptages de **sélections** suivent `calculatePlayerRoleStats` V1 ([`legacy/src/components/CastsView.vue`](../../legacy/src/components/CastsView.vue)) : événements **non archivés** ; sélections **hors désistements**.

### Règles sel/dispo % (V1 0.48 — référence comportementale)

4. **Given** une cellule de stats annuelle (JEU, DECORUM, DEPLAC., BÉNÉVOLE ou sous-colonne), **when** le joueur a au moins une dispo ou une sélection dans la catégorie, **then** la cellule affiche **`X/Y`** avec **`(Z%)`** en dessous si `Y > 0` (ex. `2/7` et `(29%)`) — aligné [SPEC.md](../../SPEC.md) slice « Composition history statistics » et composant V1 [`StatRatioDisplay.vue`](../../legacy/src/components/StatRatioDisplay.vue).
5. **Given** le calcul du dénominateur, **when** les stats sont affichées ou exportées, **then** :
   - `effectiveDispos = max(0, dispos - declines)` ;
   - `denominator = max(effectiveDispos, selections)` (évite un % > 100 si dispo sous-estimée) ;
   - `percent = min(100, round(selections / denominator * 100))` ; masqué si `denominator === 0`.
6. **Given** une cellule stats, **when** l'utilisateur interagit (tooltip / popover), **then** le libellé suit V1 : « Aucune dispo dans cette catégorie » ; « N sélection(s) sur M dispo(s) » ; ou mention des désistements si `declines > 0`.
7. **Given** le dénominateur « dispo » par catégorie, **when** `calculatePlayerDisposAndDeclines` est appliqué, **then** :
   - **Jeu** : dispo pour rôle `player` sur événements locaux (match/cab/long/autre) ;
   - **Decorum** : dispo pour au moins un parmi mc, dj, referee, assistant_referee, coach ;
   - **Déplacement** : sous-colonnes jeu/décorum sur événements `deplacement` ;
   - **Bénévole** : stage_manager, lighting, volunteer ;
   - **Colonnes mois** (résumé) : même formule sel/dispo % que les stats annuelles.
8. **Given** le périmètre événements, **when** dispos et sélections sont comptées, **then** le scope est **identique** entre numérateur et dénominateur (événements non archivés ; même filtre participants/événements que la grille si filtres actifs).

### Export CSV (V1 0.48)

9. **Given** un organisateur ou admin saison, **when** il choisit **Exporter** dans le menu admin, **then** le CSV **saison complète** est téléchargé (`statistiques-{slug}-{date}.csv`) — format inchangé, **indépendant** des filtres toolbar (**FR54**, **17.32**).
10. **Given** une colonne stats ou mois dans l'export, **when** `selections > 0` ou `dispos > 0`, **then** la valeur est `sel/avail (pct%)` (ex. `2/7 (29%)`) ; **vide** si les deux comptes sont zéro.
11. **Given** une colonne événement dans l'export, **when** la cellule est sérialisée, **then** (priorité V1) :
    - libellé rôle complet si **sélectionné** ;
    - sinon `Dispo (J, DJ, MC, …)` avec abréviations [`ROLE_EXPORT_ABBREVIATIONS`](../../legacy/src/services/storage.js) ;
    - sinon `Décliné (MC, …)` depuis `cast.declined` ;
    - sinon `Non dispo` ;
    - sinon `-` (non renseigné).
12. **Given** un événement passé ou une équipe confirmée où l'UI affiche `-`, **when** l'export CSV est généré, **then** les **dispos brutes** sont exportées quand elles existent (`resolveEventDispoExportValue` V1 — export **indépendant** du masquage UI).

### Abréviations export (reproduction V2)

| Rôle | Abrév. |
|------|--------|
| player | J |
| mc | MC |
| dj | DJ |
| referee | A |
| assistant_referee | AA |
| coach | C |
| volunteer | B |
| lighting | L |
| stage_manager | R |

### Règle « passé » (filtres agenda / historique)

13. **Given** un événement daté `YYYY-MM-DD`, **when** l'API ou l'UI détermine s'il est passé, **then** il est passé seulement **après 23:59:59.999 Europe/Paris** de ce jour civil — cf. [`legacy/src/utils/eventPastParis.js`](../../legacy/src/utils/eventPastParis.js) et story **3.2** (`scope=upcoming`).

## Dépendances

| Prérequis | Rôle |
|-----------|------|
| **Story 3.3** | Shell saison, bascule Agenda / Historique, filtres participants-événements (UX-DR2) |
| **Epic 5** | Disponibilités par rôle (dénominateur dispo) |
| **Epic 6** | Compositions, casts, statuts confirmé/décliné (numérateur sélections, export Décliné) |
| **Story 3.4** (partiel) | Types d'événement (match, cabaret, déplacement…) pour catégories JEU/DEPLAC. |

**Ne pas démarrer** l'implémentation complète tant que les epics 5–6 ne fournissent pas dispos + casts en Postgres ; livrable minimal possible : **coquille UI + contrats API** documentés, stats mockées ou vides.

## Contexte produit et découpage (3.3 vs 3.6)

- **3.3** : chrome saison (onglets, filtres, bascule vue) — Historique est un **onglet** sans implémenter toute la grille.
- **3.6** : contenu de l'onglet Historique — grille dense, stats sel/dispo, export CSV, masquage colonnes.

Réf. UX : [ux-design-season-historique-statistiques.md](../planning-artifacts/ux-design-season-historique-statistiques.md) (**approved** 2026-05-25), [ux-design-hatcast-v2 § Statistiques](../planning-artifacts/ux-design-hatcast-v2.md#screen-league--statistiques-participation), captures `season-history-*.png`.

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` ; **ne pas** modifier `legacy/` (référence V1 0.48 portée sur `v2` via cherry-pick `17213a8`).
- [x] **API (recommandé) :** endpoint(s) agrégés ex. `GET /v1/seasons/{seasonId}/statistics` (+ query filtres participants/événements) retournant sélections, dispos, declines par joueur × catégorie × mois ; option export CSV côté serveur ou payload JSON pour export client.
- [x] **Alternative documentée :** calcul client Angular si volume saison type acceptable — **tests unitaires obligatoires** sur les formules (copier sémantique V1).
- [x] **Angular :** page/composant `season-history` (ou onglet dans shell 3.3) ; `mat-table` avec groupes de colonnes, sticky ; composant ratio `X/Y (%)` ; export CSV client ou téléchargement blob API.
- [x] **Formules :** extraire en util partagé (TS) les règles § AC 4–8 et § export 9–12 ; couvrir cas limites (selections > dispos, declines, denominator = 0).
- [x] **OpenAPI :** fragment `history.yaml` ou extension `seasons.yaml` si endpoint dédié.
- [x] **Tests :** unitaires formules sel/dispo + mapping export ; intégration API si agrégats serveur ; build Angular + `./gradlew test` OK.

## Dev Notes

### Référence V1 0.48 (legacy sur branche `v2`)

| Sujet | Fichier legacy |
|--------|----------------|
| Grille + export + dispos | [`CastsView.vue`](../../legacy/src/components/CastsView.vue) — `calculatePlayerRoleStats`, `calculatePlayerDisposAndDeclines`, `exportToExcel`, `formatStatExportValue`, `getEventCellExportValue` |
| Affichage ratio UI | [`StatRatioDisplay.vue`](../../legacy/src/components/StatRatioDisplay.vue) |
| Abréviations export | [`storage.js`](../../legacy/src/services/storage.js) — `ROLE_EXPORT_ABBREVIATIONS`, `getRoleExportAbbrev` |
| Passé Paris EOD | [`eventPastParis.js`](../../legacy/src/utils/eventPastParis.js) |
| Domaine catégories | [DOMAIN.md](../../DOMAIN.md) § Statistiques de composition |

### Architecture V2

- Monorepo : [ARCH.md](../../ARCH.md) ; REST : [architecture.md](../planning-artifacts/architecture.md).
- Auth : [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md).
- UI Material : [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

### Blocs existants V2

| Sujet | Emplacement |
|--------|-------------|
| Liste événements, scope upcoming/all | [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt), [`season-home`](../../apps/web/src/app/pages/season-home/) |
| Saisons, slug | [`SeasonController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt) |

### Choix d'architecture (à trancher en implémentation)

- **Option A (recommandée) :** agrégats côté **API** (SQL/Postgres) — perf, export cohérent, NFR-P1 sur grosses saisons.
- **Option B :** chargement paginé dispos/casts + calcul **client** — plus proche du modèle Firestore V1, acceptable pour MVP si volume limité.

Documenter le choix dans le PR ; tests de non-régression sur les formules dans les deux cas.

### Intelligence stories précédentes

- **3.2** : filtre `scope=upcoming|all` avec borne **Europe/Paris** — réutiliser pour séparer données agenda vs historique.
- **3.3** (backlog) : fournir le **conteneur** route/onglet ; 3.6 branche la grille dedans.

### Hors scope

- Slice 13 SPEC : emojis dispos dans cellules événements à venir.
- Popover profil membre stats (story **2.6**) — peut réutiliser les mêmes agrégats plus tard.

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

_(aucun)_

### Completion Notes List

- **Option A** retenue : agrégats serveur `GET /v1/seasons/{seasonId}/statistics` (`SeasonStatisticsService` + règles V1 dans `SeasonStatisticsRules`).
- Onglet **Statistiques** dans le switcher (`?view=stats`) ; filtres **Membres** / **Spectacles** ; **Masquer/Détails** sur toolbar ; export CSV via menu admin (`statistiques-{slug}-{date}.csv`, saison complète — **17.32**).
- Grille `app-season-statistics` : colonnes JEU/DECORUM/DEPLAC./BÉNÉVOLE, mois, sticky participant, `app-stat-ratio-display`.
- DEPLAC. : `equity_tag = deplacements` ou `templateType = deplacement`.
- Formules sel/dispo dupliquées en TS (`season-statistics.utils.ts`) pour tests et export client aligné API.
- Tests : `SeasonStatisticsRulesTest`, `season-statistics.utils.spec.ts`, toolbar spec ; `ng test` + `./gradlew test` (rules) OK.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionDeclineRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsRules.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonStatisticsDtos.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsRulesTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt`
- `services/api/openapi/seasons.yaml`
- `apps/web/src/app/core/seasons/season-statistics-api.service.ts`
- `apps/web/src/app/core/events/event-types.ts`
- `apps/web/src/app/pages/season-home/season-statistics.utils.ts`
- `apps/web/src/app/pages/season-home/season-statistics.utils.spec.ts`
- `apps/web/src/app/pages/season-home/season-statistics-export.ts`
- `apps/web/src/app/pages/season-home/stat-ratio-display.ts`
- `apps/web/src/app/pages/season-home/season-statistics.ts`
- `apps/web/src/app/pages/season-home/season-statistics.html`
- `apps/web/src/app/pages/season-home/season-statistics.scss`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-view.types.ts`
- `apps/web/src/app/pages/season-home/season-view-toolbar.ts`
- `apps/web/src/app/pages/season-home/season-view-toolbar.html`
- `apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts`

### Change Log

- 2026-05-23 : Story créée avec règles métier V1 0.48 (sel/dispo %, export CSV) comme référence pour implémentation V2.
- 2026-05-25 : Story 3.6 — API statistics, vue Statistiques, export CSV, onglet shell, tests.
- 2026-05-25 : Code review — monthSummary V1, expansion DEPLAC./BÉNÉVOLE, export aligné, OpenAPI, tests service/rules.
- 2026-05-25 : Post-review — export CSV toutes colonnes spectacle (V1) ; index dispos `user_id` pour `eventCells` et stats.
- 2026-06-01 : Correct Course **17.32** — export toolbar retiré ; CSV Statistiques via menu admin (saison complète, FR54).

---

### Review Findings

- [x] [Review][Patch] Colonnes mois : agrégat `monthSummary` V1 (`accumulateMonthEventSummary`) [SeasonStatisticsService.kt, season-statistics.html]
- [x] [Review][Patch] Expansion DEPLAC. et BÉNÉVOLE (sous-colonnes + toggles) [season-statistics.html, season-statistics.ts]
- [x] [Review][Patch] Mois déplié : colonne résumé mensuelle avant cellules événement [season-statistics.html]
- [x] [Review][Patch] Export CSV aligné sur visibilité colonnes + `monthSummary` [season-statistics-export.ts, season-home.ts]
- [x] [Review][Patch] Bouton global « Détails » étend toutes les bandes [season-statistics.ts `detailsExpanded()`]
- [x] [Review][Patch] OpenAPI schéma `SeasonStatisticsResponse` [services/api/openapi/seasons.yaml]
- [x] [Review][Patch] Test service `SeasonStatisticsServiceTest` (repos mockés ; SpringBootTest bloqué Flyway H2 local)
- [x] [Review][Patch] Tests règles étendus [SeasonStatisticsRulesTest.kt]
- [x] [Review][Defer] Formules sel/dispo dupliquées Kotlin + TS sans test de parité contrat — risque de dérive documenté [SeasonStatisticsRules.kt, season-statistics.utils.ts] — deferred, acceptable si tests formules restent synchronisés manuellement

### Validation create-story — 2026-05-23

Story dérivée de epics 3.6, UX-DR9, SPEC slice 12 (implémenté V1 main 0.48), DOMAIN stats composition. Legacy V1 synchronisé sur `v2` (commit `chore(legacy): Port V1 0.47–0.48 stats and Paris EOD past rule`).

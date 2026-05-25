# Story 3.6b : Vue ligue « Historique » (chronologie événements passés)

Status: done

## Story

En tant que **membre ou organisateur**,  
je veux une vue **Historique** listant les **événements passés** de la ligue, groupés par mois,  
afin de parcourir le programme passé **sans** la grille de statistiques de participation (FR53, ADR 0012).

## Acceptance Criteria

1. **Given** des événements passés non archivés pour la ligue, **when** l'utilisateur ouvre **Historique** depuis le shell ligue (story **3.3**), **then** une liste chronologique groupée par mois s'affiche (cartes alignées sur l'Agenda : date, titre, statut composition, résumé dispo/rôle utilisateur) — **sans** colonnes JEU/DECORUM/DEPLAC./BÉNÉVOLE (UX-DR19).
2. **Given** la règle « passé », **when** la liste est chargée, **then** seuls les événements dont le jour civil est **strictement avant aujourd'hui** apparaissent (même fuseau que UX-DR12 / Agenda) ; événements archivés exclus sauf décision produit contraire documentée.
3. **Given** un clic sur une carte, **when** l'utilisateur interagit, **then** navigation vers le **détail événement** (FR51).
4. **Given** l'action **Exporter**, **when** l'utilisateur télécharge, **then** le CSV reflète la **chronologie visible** (colonnes événement/date/statut/rôle utilisateur selon spec) — **fichier distinct** de l'export Statistiques (story **3.6**, FR54).
5. **Given** un utilisateur autorisé sur la ligue, **when** il consulte Historique, **then** l'écran est accessible à **tous les membres** avec accès ligue (cohérent story 3.6).
6. **Couverture :** FR53–FR54 ; UX-DR19 ; NFR-P1.

## Dependencies

- Story **3.3** (shell ligue + view switcher Agenda | Historique | Statistiques)
- Story **3.6** (Statistiques — surface séparée)

## References

- [ux-design-season-historique-statistiques.md](../planning-artifacts/ux-design-season-historique-statistiques.md) — **approved** wireframes (2026-05-25)
- [ux-design-hatcast-v2.md § Historique chronology](../planning-artifacts/ux-design-hatcast-v2.md#screen-league--historique-chronology)
- [ADR 0012](../../docs/adr/0012-league-views-travel-leagues-member-stats.md)

## Tasks / Subtasks

- [x] **API :** `scope=past` (non archivés, `startsAt` &lt; début jour Paris, tri desc) + query `participantId` pour badge dispo filtré
- [x] **OpenAPI :** `events.yaml` — scope `past`, param `participantId`
- [x] **Angular :** remplacer `season-history-shell` par `season-agenda` `variant="history"` + chargement paginé `past`
- [x] **Toolbar :** filtres Participant / Spectacle + **Exporter** sur vue Historique (`?view=history`)
- [x] **Export CSV client :** `season-history-export.ts` (fichier `historique-{slug}-{date}.csv`, distinct stats)
- [x] **Tests :** intégration API `scope=past` ; unitaires utils/export/agenda/toolbar ; `ng test` OK

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

_(aucun)_

### Completion Notes List

- Liste passée via `GET …/events?scope=past` (borne Europe/Paris, non archivés, tri descendant).
- Filtre participant : `participantId` sur la liste ; défaut = dispo de l’utilisateur connecté.
- Export CSV colonnes Date, Titre, Statut composition, Participant (résumé dispo).
- Placeholder `season-history-shell` supprimé.
- Code review 2026-05-25 : `participantFocus` API (dispo + rôle composition), pill Historique/CSV, tests intégration + unitaires.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`
- `services/api/openapi/events.yaml`
- `apps/web/src/app/core/events/event-api.service.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-agenda.ts`
- `apps/web/src/app/pages/season-home/season-agenda.html`
- `apps/web/src/app/pages/season-home/season-agenda.spec.ts`
- `apps/web/src/app/pages/season-home/season-events.utils.ts`
- `apps/web/src/app/pages/season-home/season-events.utils.spec.ts`
- `apps/web/src/app/pages/season-home/season-history-export.ts`
- `apps/web/src/app/pages/season-home/season-history-export.spec.ts`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventParticipantFocusService.kt`
- `apps/web/src/app/pages/season-home/season-participant-focus.ts`
- `apps/web/src/app/pages/season-home/season-participant-focus.spec.ts`
- `apps/web/src/app/pages/season-home/season-view-toolbar.ts`
- `apps/web/src/app/pages/season-home/season-view-toolbar.html`
- `apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts`
- `apps/web/src/app/pages/season-home/season-history-shell.ts` (deleted)
- `apps/web/src/app/pages/season-home/season-history-shell.html` (deleted)
- `apps/web/src/app/pages/season-home/season-history-shell.scss` (deleted)

### Change Log

- 2026-05-25: Story 3.6b — chronologie Historique, API `scope=past`, export CSV, filtres toolbar.
- 2026-05-25: Code review — `participantFocus`, tests intégration, aria-label Historique.

### Product reserve (PO, 2026-05-25 — validation avec réserve)

- **Pertinence UX Historique vs V1 :** la vue réutilise l’Agenda (cartes + navigation détail) ; les spectacles passés restent **modifiables** depuis la fiche événement (infos, dispos, orga, etc.). En **V1**, Historique servait surtout à **revoir les compositions** (la sienne ou celles des autres), pas à piloter l’événement.
- **Liste ligue :** en `variant="history"`, pas de création ni menu ⋮ Modifier/Archiver ; badge dispo en lecture seule — OK pour la chronologie.
- **Écart principal :** clic carte → détail plein écran encore en mode édition — à trancher produit (lecture seule passé, onglet Composition focal, ou rôle limité).
- **Suite suggérée (hors 3.6b) :** wireframe dédié « consultation passé » ; aligner `event-detail` / permissions quand `startsAt` &lt; aujourd’hui ; pill rôle dans l’équipe (voir finding Decision ci-dessous).

### Review Findings

- [x] [Review][Decision] Résumé **rôle utilisateur** — enrichissement `participantFocus` sur `GET …/events` + pill/CSV (`formatParticipantFocusLabel`, ex. « Comédien·ne · dans l'équipe »).
- [x] [Review][Patch] Test d’intégration `participantId` + `scope=past` [`EventControllerIntegrationTest.kt`]
- [x] [Review][Patch] Test spectacle passé archivé exclu de `scope=past` [`EventControllerIntegrationTest.kt`]
- [x] [Review][Patch] `aria-label` sur cartes Historique [`season-agenda.html`]
- [x] [Review][Defer] Onglet **Statistiques** absent du switcher — story **3.6** / shell **3.3** [`season-view-toolbar.html`:107-108]
- [x] [Review][Defer] Pas de test composant `SeasonHome` pour `loadPastEvents` — pattern agenda existant

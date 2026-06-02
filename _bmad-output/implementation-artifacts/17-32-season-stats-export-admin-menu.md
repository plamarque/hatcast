# Story 17.32 — Exporter statistiques via menu admin saison

**Status:** done  
**Epic:** 17  
**Correct Course:** [sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md](../planning-artifacts/sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md) — approved 2026-06-01

## User story

En tant qu’**organisateur ou administrateur de saison**,  
je veux **Exporter** les statistiques complètes depuis le menu administration,  
afin d’obtenir le CSV de participation sans encombrer la toolbar membre.

## Acceptance Criteria

1. **Given** season organizer or troupe admin access, **when** the season admin menu opens, **then** entry **Exporter** (`download` icon) appears in the flat menu list.
2. **Given** **Exporter** clicked, **when** export succeeds, **then** CSV downloads (`statistiques-{slug}-{date}.csv`) with full-season data (no toolbar filter constraints); format unchanged from `buildStatisticsCsv`.
3. **Given** no statistics data, **when** **Exporter** clicked, **then** snack « Aucune donnée à exporter. »
4. **Given** Historique or Statistiques toolbar, **then** no **Exporter** button.
5. **Given** history export code paths, **then** removed.
6. **Tests:** admin menu and toolbar specs updated.

## Acceptance Criteria — Material 3 (UI)

- **M3-1 — Component:** `Exporter` uses the existing scope admin menu pattern (`mat-menu-item`) with no custom clickable div/button.
- **M3-2 — Icon & label:** `download` icon is decorative (`aria-hidden` via Material icon pattern) and the visible French label **Exporter** carries the action meaning.
- **M3-3 — Responsive/touch:** menu remains in the breadcrumb-row admin gear on mobile and desktop; no additional toolbar control is introduced.
- **M3-4 — Theme:** no new colors, typography, or layout tokens are needed beyond the existing Material menu surface.
- **M3-5 — Consistency:** Historique and Statistiques toolbars keep the unified filter/action layout; only **Détails/Masquer** remains on the Statistiques toolbar.

## Review Findings

- [x] [Review][Patch] Les organisateur·ices saison pur·es peuvent ne pas voir Exporter [`apps/web/src/app/pages/season-home/season-home.ts:1063`] — `hasSeasonAdminMenuAccess()` ne tient compte que des droits `canManage*`, alors que l'API expose les organisateur·ices via `isSeasonOrganizer`; les tests utilisent un état impossible en production (`isSeasonOrganizer: true` avec `canManageSeasonParticipants: true`). Ajouter une permission/export computed alignée sur `isSeasonOrganizer || isTroupeAdmin` et couvrir le cas pur.
- [x] [Review][Patch] Docs UX encore contradictoires avec FR54 [`_bmad-output/planning-artifacts/ux-design-season-historique-statistiques.md:42`] — plusieurs docs de référence gardent `Exporter` en toolbar, export Historique et export filtré; les aligner sur export Statistiques full-season via menu admin et Historique sans export.
- [x] [Review][Patch] Story UI sans AC Material 3 structurés [`_bmad-output/implementation-artifacts/17-32-season-stats-export-admin-menu.md:22`] — remplacer ou compléter `UI — Material 3` par `Acceptance Criteria — Material 3 (UI)` conformément au template et à `FRONTEND_UI.md`.
- [x] [Review][Defer] Autorisation serveur dédiée pour l'export CSV [`services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`] — deferred, pre-existing / follow-up optionnel: l'endpoint statistiques reste lisible par tout membre actif pour la grille; une route export admin-only dédiée durcirait le téléchargement mais le SCP l'a explicitement classée hors périmètre 17.32.

### Review Findings — passe 2 (2026-06-01)

- [x] [Review][Patch] Test AC3 manquant pour export sans données [`apps/web/src/app/pages/season-home/season-home.spec.ts`] — le snack « Aucune donnée à exporter. » est implémenté mais non couvert par test.
- [x] [Review][Patch] Artefacts stories 3.6 / 3.6b encore obsolètes [`_bmad-output/implementation-artifacts/3-6*.md`] — AC et file list mentionnent encore export Historique / toolbar Exporter / `season-history-export.ts` supprimé.
- [x] [Review][Patch] AC Epic 17.27 contradictoire dans epics.md [`_bmad-output/planning-artifacts/epics.md:1669`] — ligne « Exporter et Détails/Masquer hors panneau » contredit FR54 / 17.32 (Exporter uniquement dans le menu admin).

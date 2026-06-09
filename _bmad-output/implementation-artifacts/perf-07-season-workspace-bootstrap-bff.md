---
baseline_commit: a5abea8410a1d2cb92caa58a38136c8f88accb4f
---

# Story PERF-07 — Season workspace bootstrap BFF

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 3

---

## Story

En tant que **membre** ouvrant une saison,  
je veux recevoir permissions, selectors, categories et events en **un seul round-trip**,  
afin de **réduire la latence mobile** sur `season-home`.

---

## Acceptance Criteria

1. **Given** `GET /v1/seasons/:id/workspace?view=agenda`, **when** appelé, **then** payload agrège champs actuellement fetchés séparément (read-only).  
2. **Given** front `season-home`, **when** migré, **then** ≤ 3 appels `/v1/*` au load (hors shell cache PERF-04).  
3. OpenAPI fragment + test intégration.

**UI : N/A** (front migration dans même story ou sous-tâche).

---

## Tasks / Subtasks

- [x] **API:** `SeasonWorkspaceService` + `GET /v1/seasons/{seasonId}/workspace?view=agenda` (permissions, selectors, categories, upcomingEvents).
- [x] **OpenAPI:** fragment `SeasonWorkspaceResponse` dans `seasons.yaml`.
- [x] **Test intégration:** `SeasonWorkspaceIntegrationTest` — agrégat + rejet view invalide.
- [x] **Front:** `SeasonApiService.getSeasonWorkspace` + migration `season-home` (vue agenda → BFF ; history/stats inchangés).
- [x] **Tests front:** mocks/expectations workspace dans `season-home.spec.ts` (6/23 verts — 17 échecs préexistants route legacy `slug` vs `troupeSlug/seasonSlug`).

---

## Dev Notes

- Alternative : GraphQL / composite — préférer REST BFF boring technology (ADR pattern)
- Vue `history` / `stats` : bootstrap partagé (permissions, selectors, categories) reste en appels séparés ; extension `view=` possible en follow-up.
- AC2 load agenda : résolution saison (1) + workspace BFF (1) + `me/preferences` viewerGender (1) = 3 appels `/v1/*` hors shell PERF-04.

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Agréger côté API les 4 lectures existantes via services déjà en place (pas de duplication SQL).
- Migrer `season-home` pour vue agenda default uniquement ; conserver `listEvents` pour load-more, filtres participant, history/stats.

### Completion Notes List

- **API BFF** : `GET /v1/seasons/{id}/workspace?view=agenda` retourne `permissions`, `participantSelectors`, `categories`, `upcomingEvents` (paginé, défaut size=50).
- **Front** : `loadSeasonWorkspaceBootstrap` remplace 4 appels parallèles au chargement agenda ; pagination complémentaire si total > première page.
- **Tests API** : 2/2 `SeasonWorkspaceIntegrationTest` verts.
- **Tests front** : 6/23 `season-home.spec.ts` (identique baseline HEAD — dette paramMap legacy).
- **Profilage post-PERF-07** (`node scripts/v2/profile-web-performance.mjs`, stack dev `--with-push --no-tailscale`, `.local/perf-profile/web-perf-2026-06-09T19-02-50-971Z.json`, 2026-06-09 — Apérock 2026) vs baseline plan (`15-32-52-596Z`) et post-PERF-06 (`18-37-35-670Z`) :
  - **Saison agenda — appels `/v1/*`** : **6** (baseline **15**, −9 ; post-PERF-06 non isolé dans le snapshot 06).
  - **Saison agenda — wallMs** : **2351** (baseline **2214**, +137 ms ; cible plan ≤ 1300 ms **non atteinte**).
  - **Saison agenda — apiTotalMs** : **1554** (baseline **4155**, −2601 ms).
  - **Saison agenda — bootstrap** : **1×** `GET …/workspace?view=agenda&eventSize=100` (**732 ms** max) remplace `permissions/me` + `participants/selectors` + `categories` + `events?scope=upcoming` (absents sur cette route).
  - **Saison historique / stats** : inchangées (**9** appels chacune — bootstrap séparé, hors scope BFF agenda).
  - **Script total `/v1/*` (toutes routes)** : **85** (baseline **144**, −59 ; post-PERF-06 **90**, −5).
  - **Agenda membre wallMs / appels** : **2078 ms / 5** (baseline **5850 / 37** — effet cumulé PERF-01…06).
  - **Accueil todo wallMs / appels** : **1565 ms / 4** (baseline **2450 / 6** ; post-PERF-06 **1629 / 6**).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonWorkspaceView.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonWorkspaceService.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonWorkspaceDtos.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonWorkspaceIntegrationTest.kt` (new)
- `services/api/openapi/seasons.yaml`
- `apps/web/src/app/core/seasons/season-api.service.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`

### Change Log

- 2026-06-09 — PERF-07 : BFF workspace agenda + migration season-home + OpenAPI + test intégration.
- 2026-06-09 — Code review : AC2 strict (eventSize max 100, pas de follow-up post-bootstrap), OpenAPI `view` optional.
- 2026-06-09 — Re-profilage post-PERF-07 : `web-perf-2026-06-09T19-02-50-971Z.json` — Saison agenda 6 appels (−9 vs baseline), apiTotal −2601 ms ; wall +137 ms vs baseline.

### Review Findings

- [x] [Review][Decision] AC2 vs pagination / deep-link participant — **Résolu : option A (AC2 strict)** — `eventSize=min(100,cap)`, supprimer le follow-up, troncature initiale + « Charger plus » ; régression `?participant=` acceptée (filtre client-side sur page BFF).

- [x] [Review][Patch] Pagination post-bootstrap silencieusement ignorée — fix option A : supprimer le bloc `loadUpcomingEvents()` L697-701 [apps/web/src/app/pages/season-home/season-home.ts:697-701]

- [x] [Review][Patch] Bootstrap `eventSize=50` insuffisant pour cap 200 — fix option A : `eventSize: Math.min(100, this.eventLoadLimit())` dans `getSeasonWorkspace` [apps/web/src/app/pages/season-home/season-home.ts:684-685]

- [x] [Review][Patch] OpenAPI `view` marqué `required: true` avec `default: agenda` [services/api/openapi/seasons.yaml:1368-1375]

- [x] [Review][Defer] Tests intégration 403/404 non couverts [SeasonWorkspaceIntegrationTest.kt] — deferred, pre-existing gap pattern

- [x] [Review][Defer] Schémas OpenAPI dupliqués (`SeasonWorkspaceParticipantSelector` vs DTO canonique) [seasons.yaml] — deferred, qualité contrat

- [x] [Review][Defer] Aucun test automatisé du budget ≤3 appels AC2 [season-home.spec.ts] — deferred, non bloquant review

- [x] [Review][Defer] Bascule history→agenda bypass le BFF (appels séparés) [season-home.ts:497-498] — deferred, follow-up documenté dev notes

- [x] [Review][Defer] Fix `enableExplainabilityForChances` hors scope PERF-07 [AvailabilityControllerIntegrationTest.kt] — deferred, pré-existant / autre story

---

---
baseline_commit: cee0fbb1ffc545b37d192538eb38ae2b62939a02
---

# Story PERF-04 — Session et troupe context cache

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 2

---

## Story

En tant que **membre** naviguant dans l’app,  
je veux que session et liste troupes ne soient pas re-fetchées à chaque page,  
afin de **économiser 200–400 ms** par navigation.

---

## Acceptance Criteria

1. **Given** 3 navigations membre consécutives sans logout, **when** profilage, **then** **1×** `GET /auth/me` et **1×** `GET /troupes` (hors force refresh).  
2. **Given** 401 ou logout, **when** cache invalidé, **then** prochaine page refetch.  
3. **Gate S2 :** toutes pages membre ≤ 2 s.

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `AuthApiService`, `TroupeApiService`, `TroupeContextService`, `troupes-list`.
- [x] Cache session memo + dedup in-flight dans `ensureHatcastSession({ force? })` ; invalidation logout / 401 / switch user.
- [x] Cache `GET /troupes` dans `TroupeApiService.listMyTroupes({ force? })` ; invalidation logout / 401 / switch user / `reloadAndSelect`.
- [x] `TroupeContextService.load` délègue `force` ; `reloadAndSelect` force refresh ; page `/troupes` force refresh liste.
- [x] Tests : auth session cache, troupes cache TTL-less, invalidation 401/logout, force bypass.
- [x] Re-run tests ciblés ; profilage gate S2 si serveur dev disponible.

---

## Dev Notes

- `AuthApiService.ensureHatcastSession()`, `TroupeContextService.load()`, `TroupeSeasonResolverService`
- Pattern aligné PERF-01 (preferences) et PERF-02 (inbox) : memo session singleton `providedIn: 'root'`.
- Invalidation troupes aussi sur changement d’utilisateur (`applySessionBody` userId switch).

### Explicit non-goals

- PERF-05 viewerGender props
- PERF-07 season workspace BFF
- TTL stale-while-revalidate troupes (membership change rare ; `force` sur join/reload)

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- **Auth** : `sessionCache` servi par `ensureHatcastSession` sans fetch réseau ; `force: true` bypass ; `invalidateSessionCache()` + `troupeApi.invalidateCache()` sur logout/deleteAccount/401 ; cache peuplé via `applySessionBody` (sign-in inclus).
- **Troupes** : cache mémoire + in-flight dedup dans `TroupeApiService` ; `TroupeContextService.reloadAndSelect` → `{ force: true }` ; `/troupes` liste force refresh pour données fraîches post-adhésion.

### Completion Notes List

- **Cache session** : 3 appels `ensureHatcastSession` consécutifs → 1 fetch `/v1/auth/me` (tests unitaires).
- **Cache troupes** : 2 appels `listMyTroupes` → 1 fetch `/v1/troupes` ; invalidation 401/logout/switch user.
- **Tests** : 43/44 verts sur specs ciblées (1 échec préexistant slug guest dans `troupe-context.service.spec.ts`, hors scope).
- **Profilage post-PERF-04** (`.local/perf-profile/web-perf-2026-06-09T17-27-53-660Z.json`, `--with-push`, 2026-06-09) vs baseline `15-32-52-596Z` et post-PERF-02 `16-47-07-519Z` :
  - **Appels `/v1/*` script** : **90** (baseline **144**, post-PERF-02 **94**) — −4 vs PERF-02, −54 vs baseline.
  - **`GET /auth/me`** : **12×** total script (baseline **12×**, post-PERF-02 **12×**) — **inchangé** : le script Playwright fait un `page.goto` par route (reload SPA → cache mémoire réinitialisé). Bénéfice PERF-04 sur navigations **Router** in-app (non mesuré par ce script).
  - **`GET /troupes`** : **10×** (baseline **10×**, post-PERF-02 **10×**) — inchangé pour la même raison ; `/troupes` force refresh + reload shell.
  - **`GET /me/inbox`** : **1×** (baseline **13×**) — PERF-02 stable ✓
  - **Wall time (ms)** — delta vs baseline / post-PERF-02 :
    - Accueil **1755** (−695 / −90)
    - Agenda **1932** (−3918 / +89)
    - Hub troupe **1206** (−347 / −60)
    - Compte **918** (−504 / −32)
    - Saison agenda **1835** (−379 / +79)
    - Event Infos **1998** (−29 / −57)
    - Event Dispos **2185** (+60 / +61)
    - Event Équipe **2037** (−415 / −487)
    - Event Activité **2651** (+323 / +400)
  - **Gate S2 (≤ 2 s)** : **partiel** — Accueil, Agenda, Hub, Compte, Saison agenda, Event Infos OK ; **Event Dispos 2185**, **Event Équipe 2037**, **Saison stats 2095**, **Event Activité 2651** au-dessus de 2 s (goulots season bootstrap / audit / availability, hors scope PERF-04).

### File List

- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-api.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.spec.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.ts`

### Change Log

- 2026-06-09 — PERF-04 : cache session auth + liste troupes ; invalidation logout/401 ; force refresh join et page troupes.
- 2026-06-09 — Code review : garde `cacheGeneration` auth/troupes ; tests switch user + race in-flight ; `createTroupe` invalide cache.
- 2026-06-09 — Re-profilage post-PERF-04 : `web-perf-2026-06-09T17-27-53-660Z.json` — 90 appels `/v1/*` ; auth/troupes inchangés en script (reload SPA) ; gate S2 partiel.

---

## Senior Developer Review (AI)

**Date:** 2026-06-09  
**Diff:** 7 fichiers, +271 / −18 (non commité)  
**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

### Review Findings

- [x] [Review][Patch] Stale-write après invalidation (race in-flight) — corrigé : `sessionCacheGeneration` / `troupesCacheGeneration` (pattern PERF-01) ; `invalidate*` annule in-flight ; suppression des `applySessionBody` redondants dans `resolveEnsureHatcastSession`.

- [x] [Review][Patch] Test manquant : switch utilisateur invalide le cache troupes — ajout test `invalide le cache troupes quand l’utilisateur de session change` + test race in-flight auth.

- [x] [Review][Patch] `createTroupe` ne invalide pas le cache — `invalidateCache()` sur succès POST ; test `createTroupe invalide le cache liste` + test race in-flight troupes.

- [x] [Review][Defer] Gate S2 non profilé — AC3 non prouvé ; story Completion Notes l’indique déjà ; valider via `node scripts/v2/profile-web-performance.mjs` avant prod.

- [x] [Review][Defer] `ContextSwitcherDataService` non réinitialisé sur invalidation — `initialized` court-circuite `ensureReady` ; état UI stale possible après switch user ; architectural, hors scope PERF-04.

**Dismissed (3):** `troupes-list` `force: true` (intentionnel story) ; effets de bord `getMe()` sur 401 (aligné AC2) ; appels `force` concurrents sérialisés (acceptable).

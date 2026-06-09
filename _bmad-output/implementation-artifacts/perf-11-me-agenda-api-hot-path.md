---
baseline_commit: b308a75830326d46828fa57d6864155c172cae30
---

# Story PERF-11 — Hot path GET /me/agenda

**Status:** in-progress

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4b  
**Baseline:** `GET /me/agenda` **907 ms** max — goulot Agenda (1940 ms wall)

---

## Story

En tant que **membre** ouvrant Mon agenda,  
je veux que `GET /v1/me/agenda` réponde en **≤ 500 ms p95** (NFR-P2),  
afin d’atteindre **≤ 1400 ms** wall sur `/agenda`.

---

## Acceptance Criteria

1. Profiling Spring identifie et corrige le goulot (N+1, joins, filtres participation).
2. Test charge / intégration : p95 ≤ 500 ms sur seed Improbots (~32 events).
3. Front : paralléliser `ensureHatcastSession` + `loadAgenda` (ne pas attendre `troupeContext.load()` si filtres vides).
4. Profilage post-fix : Agenda wall ≤ 1400 ms.

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Scope API:** `UserAgendaService`, `UserAgendaRepository` — lifecycle, participation, focus.
- [x] Profiler goulot : double `findAllById` events (lifecycle + focus) ; 4 requêtes participation même si `filterBarVisible=false` ; catalog filtres inutile sans barre.
- [x] Fix API : batch unique events → `loadViewsByEventIds` ; focus via `SeasonRepository` ; EXISTS noParticipation ; skip catalog IDs si `!filterBarVisible`.
- [x] Test intégration `UserAgendaPerformanceIntegrationTest` — 10 GET séquentiels, p95 ≤ 500 ms (seed troupe H2).
- [x] **Scope front:** `user-agenda.ts` — paralléliser session check + `loadAgenda` + `loadViewerGender` ; `troupeContext.load()` en arrière-plan (non bloquant).
- [x] Specs `user-agenda.spec.ts` — mock `ensureHatcastSession` + `TroupeContextService` ; 24 tests verts.
- [x] Re-run tests agenda API + front ; documenter causes/fix Dev Notes.

---

## Dev Notes

### Causes identifiées (baseline plan 19:46)

| Cause | Impact | Fix |
|-------|--------|-----|
| `loadViewsByEventIdsAcrossSeasons` recharge tous les `EventEntity` puis lifecycle × N events | Majeur | Un seul `findAllById` + `loadViewsByEventIds` par saison |
| `participantFocusByEventIds` second `findAllById` sur les mêmes events | Majeur | `SeasonRepository.findById` depuis `UserAgendaRow.seasonId` |
| `participationContext` : 4× DISTINCT lists même si 1 troupe / 1 saison | Mineur | EXISTS early exit ; skip catalog IDs si `!filterBarVisible` |
| Front waterfall : `ensureReady` → gender → agenda séquentiel | Majeur (wall) | `ensureHatcastSession` + `Promise.all(agenda, gender)` ; troupes en background |

### Non-goals (PERF-11)

- BFF `GET /me/agenda/bootstrap` — option plan, non requis AC.
- Refactor `CompositionLifecycleEnrichmentService` global — scope agenda seulement.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| PERF-09 | done | Shell bootstrap memo ; agenda ne bloque plus sur `ensureReady` |
| PERF-06 | done | Pattern perf test + scoping enrichments |
| 12-2 | done | Contrat `GET /me/agenda` inchangé |

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Éliminer le triple chargement events (liste + lifecycle + focus).
- Réduire participation queries quand filtre bar masquée (cas Improbots seed).
- Front : ne pas attendre troupes pour le chemin critique agenda ; paralléliser gender + API.

### Completion Notes List

- **API** : batch lifecycle ; focus via season ; EXISTS + deferred catalog ; perf test p95 ≤ 500 ms ✓ (H2 seed Improbots, participant saison lié, ≥20 events).
- **Front** : `Promise.all(ensureHatcastSession, loadAgenda, loadViewerGender)` ; `troupeContext.load()` non bloquant ; `loadingSession` false après les trois promesses.
- **Tests** : `UserAgendaIntegrationTest` + `UserAgendaPerformanceIntegrationTest` verts.
- **Profilage post-fix** (`profile-web-performance.mjs`, 2026-06-09, `@seed.improbots.test`, stack dev local) :
  | Métrique | Baseline plan 19:46 | Post-PERF-11 | Δ |
  |----------|---------------------|--------------|---|
  | Agenda wall | **1940 ms** | **1764 ms** | **−176 ms (−9,1 %)** |
  | `GET /me/agenda` max | **907 ms** | **924 ms** | +17 ms (run dev ; H2 test p95 ≤ 500 ms ✓) |
  | `GET /auth/me` max | (inclus wall) | **119 ms** | parallèle avec agenda (D2) |
  - **AC4** : objectif ≤ 1400 ms wall **non atteint** (1764 ms) — écart ~364 ms ; suite PERF-12 ou optimisations API prod à suivre.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaPerformanceIntegrationTest.kt` (new)
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`

### Change Log

- 2026-06-09 — PERF-11 : hot path agenda API (batch lifecycle, focus season lookup, participation scoping) ; front parallèle ; test perf p95 ≤ 500 ms.
- 2026-06-09 — Code review : D2 `Promise.all(session, agenda, gender)` ; perf test seed participant ; profilage wall 1940→1764 ms ; AC4 ouvert.

### Review Findings

- [x] [Review][Decision] AC4 — Profilage wall exécuté — `profile-web-performance.mjs` 2026-06-09 : wall **1764 ms** (baseline 1940 ms, Δ −176 ms) ; AC4 ≤1400 ms non atteint → story **in-progress**
- [x] [Review][Decision] AC3 — Parallélisme session ↔ agenda — **Option 2** : `Promise.all(ensureHatcastSession, loadAgenda, loadViewerGender)` après `syncInitialFilterUrl`
- [x] [Review][Patch] Test perf hot path ~32 events [`UserAgendaPerformanceIntegrationTest.kt`] — `linkSeedSeasonParticipant` + assert `content.length ≥ 20`
- [x] [Review][Patch] Filtres query + filterBarVisible=false [`UserAgendaService.kt:59-68`] — **dismiss** : ignorer côté serveur casse `UserAgendaIntegrationTest` (filtres query valides sans barre) ; client nettoie déjà après réponse
- [x] [Review][Patch] loadingSession false avant gender [`user-agenda.ts`] — corrigé : `loadingSession.set(false)` après `Promise.all` session+agenda+gender
- [x] [Review][Defer] AC4 profilage wall recette — deferred, validation manuelle `profile-web-performance.mjs` recommandée en recette
- [x] [Review][Defer] syncInitialFilterUrl bloque premier loadAgenda [`user-agenda.ts:191`] — deferred, waterfall résiduel hors scope minimal PERF-11
- [x] [Review][Defer] troupeContext.load fire-and-forget pour edit dispos [`user-agenda.ts:195`] — deferred, trade-off accepté story (filtres API, pas troupe catalog)
- [x] [Review][Defer] Gate perf H2 ≠ prod Neon [`UserAgendaPerformanceIntegrationTest.kt`] — deferred, même pattern que PERF-06
- [x] [Review][Defer] 4 requêtes participation mono-troupe inchangées [`UserAgendaService.kt:163-172`] — deferred, EXISTS early exit seulement sans participation

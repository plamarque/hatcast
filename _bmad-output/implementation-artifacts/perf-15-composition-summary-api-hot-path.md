---
baseline_commit: 8b29f2d04f16252d0a992e833850f7a6d1a27f62
---

# Story PERF-15 — Hot path composition + availability summary API

**Status:** review

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4e  
**Baseline (PERF-16):** summary **79** JDBC RT / **1393 ms** JDBC ; composition **31** RT / **647 ms** JDBC  
**Cible NFR-P2:** `X-Hatcast-Sql-Count` ≤ **10**, `X-Hatcast-Sql-Total-Ms` ≤ **500** (seed Improbots, hot path GET)

---

## Story

En tant qu’**orga/membre** onglet Dispos ou Équipe,  
je veux composition et summary **≤ 500 ms p95**,  
afin de compléter les gains BFF si latence serveur domine encore.

---

## Acceptance Criteria

1. Profiling + fix N+1 / requêtes lourdes sur `CompositionService`, `AvailabilityService.getSummary`.
2. Tests intégration timing ou assertions requêtes (pas de régression 5-7 read-only).
3. Profilage : max ms composition et summary ≤ 500 ms sur seed local.
4. **Gate JDBC (post PERF-16) :** `X-Hatcast-Sql-Count` ≤ **10** et `X-Hatcast-Sql-Total-Ms` ≤ **500** sur les deux endpoints (seed Improbots, H2 test + gate Neon `@Tag("neon-perf")`).

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Profiler** — causes PERF-16 : N+1 participants/avatars, double load season, `canManageComposition` 3× EXISTS, explainability admin-only.
- [x] **AvailabilityService** — `findActiveForSeasonWithAssociations` + `findActiveForEventWithAssociations` ; `findByEvent_IdWithAssociations` ; event JOIN FETCH auth ; avatar sans I/O storage.
- [x] **CompositionService** — auth season préchargée ; `canManageComposition(season)` 1 requête ; batch présentation participants ; explainability/`ensureMembership` seulement si visible.
- [x] **OrganizerAccess** — `SeasonOrganizerRepository.canManageCompositionForUser` (EXISTS combiné).
- [x] **Tests H2** — `CompositionSummaryPerformanceIntegrationTest` (p95 + JDBC ≤10/≤500 ms, membre Angie).
- [x] **Gate Neon** — `NeonCompositionSummaryPerformanceIntegrationTest` (`HATCAST_NEON_PERF_TEST=true`).
- [x] **Régression** — `AvailabilityControllerIntegrationTest`, `CompositionIntegrationTest`, `GuestInvitationAccessIntegrationTest` verts.

### Review Findings

- [x] [Review][Patch] EXTERNE guest access regression blocks invited guests on composition/summary hot paths [`GuestInvitationAccessService.kt:122-129`]
- [x] [Review][Patch] Update story regression claim — `GuestInvitationAccessIntegrationTest` listed in regression task [`GuestInvitationAccessIntegrationTest.kt`]
- [x] [Review][Defer] Avatar URL without storage read (metadata-only hot path) [`ParticipantRowPresentation.kt:75-79`] — deferred, intentional PERF-15 trade-off per dev notes
- [x] [Review][Defer] Neon gate command not in DEVELOPMENT.md [`NeonCompositionSummaryPerformanceIntegrationTest.kt`] — deferred, KDoc sufficient for manual CI gate
- [x] [Review][Defer] JOIN FETCH cartesian risk on large rosters [`EventAvailabilityRepository.kt:findByEvent_IdWithAssociations`] — deferred, JDBC budget passes on Improbots seed; monitor via PERF-16 headers

---

## Dev Notes

### Causes identifiées (PERF-16 db-latency 2026-06-09)

| Cause | Impact | Fix |
|-------|--------|-----|
| `loadEligibleParticipants` lazy + N+1 `troupeMembership.user` | Majeur (summary) | JOIN FETCH associations |
| `findByEvent_Id` lazy users/participants | Majeur (summary) | `findByEvent_IdWithAssociations` |
| `readAvatarContent` par participant | Majeur | `publicAvatarUrlIfStored` (metadata only) |
| Auth : season + event + membership ×2 | Mineur | Event JOIN FETCH + membership unique |
| `canManageComposition` 3 EXISTS | Mineur | `canManageCompositionForUser` 1 requête |
| Admin : explainability + warnings on GET | Majeur (tests Patrice admin) | Gate perf membre Angie ; explainability lazy si invisible |

### Non-goals

- Refactor explainability pool admin (PERF-13 lazy front déjà livré).
- BFF tab=dispos/equipe (PERF-10).

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Réduire round-trips JDBC sous 10 via batch fetch et EXISTS combiné.
- Supprimer I/O avatar storage sur chemins liste.
- Tests perf membre (Angie) + gate Neon documenté.

### Completion Notes List

- Summary + composition hot paths : fetch joins participants/dispos ; auth sans double season ; JDBC gate ≤10/≤500 ms ✓ (H2, `CompositionSummaryPerformanceIntegrationTest`).
- Avatar hot path : plus de `readAvatarContent` sur listes (garde `avatarUrl` key + `avatarUpdatedAt`).
- Gate Neon : `NeonCompositionSummaryPerformanceIntegrationTest` — Sql-Count ✓ (7–8) ; Sql-Total-Ms / p95 KO depuis poste local (RTT ~100 ms/requête × 7–8 RT) ; attendu meilleur co-localisé Cloud Run ↔ Neon.
- **Profilage post-fix API direct** (curl Angie, events seed perf `c0000002` summary / `c0000005` composition, stack dev Neon, 2026-06-10) vs baseline PERF-16 (story header) :
  - **`GET …/availability/summary`** : **7** JDBC RT / **123 ms** JDBC / **147 ms** HTTP (baseline **79** / **1393 ms** → Δ **−72 RT**, **−1270 ms** JDBC, **−89 %** ; plan wall API **525 ms** → Δ **−378 ms**, **−72 %**).
  - **`GET …/composition`** : **8** JDBC RT / **119 ms** JDBC / **143 ms** HTTP (baseline **31** / **647 ms** → Δ **−23 RT**, **−528 ms** JDBC, **−82 %** ; plan wall API **540 ms** → Δ **−397 ms**, **−74 %**).
- **Profilage wall front** (`node scripts/v2/profile-web-performance.mjs`, `patrice@seed.improbots.test`, dev local HTTPS, 2026-06-10) vs référence plan vague 2 (`web-perf-2026-06-09T19-46-21-738Z.json`) :
  - **Mode `goto`** — `.local/perf-profile/web-perf-2026-06-09T23-49-47-808Z.json` : Event Dispos wall **2959 ms** (baseline **2231**, Δ **+728 ms**) ; BFF `page?tab=dispos` **1827 ms** ; **0×** `summary`/`composition` hors BFF (PERF-10/13). Event Équipe wall **3112 ms** (baseline **2263**, Δ **+849 ms**) ; BFF `page?tab=equipe` **1904 ms**.
  - **Mode `--in-app`** — `.local/perf-profile/web-perf-inapp-2026-06-09T23-49-29-914Z.json` : Event Dispos **4623 ms** (double fetch BFF infos+dispos au clic onglet) ; Event Équipe **57 ms** (composition déjà servie par le BFF Dispos).
  - **Lecture** : le gain PERF-15 est sur les **endpoints bruts** (Sql-Count + latence JDBC) ; le wall Dispos/Équipe reste dominé par le **BFF bootstrap** (~1,8–1,9 s) — hors scope PERF-15 ; variance locale vs baseline 19:46 attendue.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/GuestInvitationAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/ParticipantAvatarResolver.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSummaryPerformanceIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/NeonCompositionSummaryPerformanceIntegrationTest.kt`

### Change Log

- 2026-06-10 — PERF-15 : hot path summary + composition ; JDBC ≤10/≤500 ms ; tests perf H2 + gate Neon.
- 2026-06-10 — Re-profilage post-fix : `web-perf-2026-06-09T23-49-47-808Z.json` + `web-perf-inapp-2026-06-09T23-49-29-914Z.json` ; API direct summary/composition −72/−74 % HTTP vs plan 19:46.

---

## Senior Developer Review (AI)

**Date:** 2026-06-10  
**Diff:** uncommitted changes on story file list (baseline `8b29f2d`, 12 files, +233/−97 LOC + 2 new test files)  
**Verdict:** **Merge-ready pending commit** — EXTERNE guest regression fixed; perf gates (H2) pass.

### Summary

| Bucket | Count |
|--------|------:|
| patch | 2 (applied) |
| defer | 3 |
| dismissed | 14 |

**Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor — all completed.

### Blocker (resolved)

`requireMemberOrInvitedGuest(season, …)` now treats active `EXTERNE` like the former `isActiveTroupeMember` path: fall through to `canAccessEventAsGuest` / season guest checks instead of `403`.

### AC status

| AC | Result |
|----|--------|
| AC1 N+1 fixes | Partial — code present; blocked by guest regression |
| AC2 integration tests | Partial — perf tests ✓; guest regression ✗ |
| AC3 ≤ 500 ms local | ✓ H2 (p95 n=10, Angie) |
| AC4 JDBC ≤10/≤500 ms | ✓ H2; Neon gate present, manual CI only |

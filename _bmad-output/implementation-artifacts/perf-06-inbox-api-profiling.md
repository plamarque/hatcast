---
baseline_commit: 0e024f512019000ab8419127f3640d24543b4b64
---

# Story PERF-06 — Profiling serveur GET /me/inbox

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 3  
**NFR:** NFR-P2 — inbox p95 ≤ 300 ms

---

## Story

En tant qu’**équipe produit**,  
je veux comprendre et réduire la latence de `GET /me/inbox`,  
afin de respecter **NFR-P2** même sans cache front.

---

## Acceptance Criteria

1. **Given** profil dev avec peu de données, **when** 10 requêtes inbox séquentielles, **then** p95 ≤ 300 ms (log Spring ou test intégration).  
2. **Given** causes N+1 identifiées, **when** fix livré, **then** note dans Dev Notes + deferred-work si item existant.

**UI : N/A** — API only.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` — `MeInboxService`, `UserAgendaRepository`, tests intégration inbox.
- [x] Profiler le chemin `GET /v1/me/inbox` : lifecycle/availability sur 50 events, participation (2× SELECT DISTINCT), focus nextEvent.
- [x] Réduire requêtes : lifecycle + availability scopés ; EXISTS participation ; cache season participants confirm actions ; `SeasonRepository` pour focus (évite `EventEntity` complet).
- [x] Test intégration `MeInboxPerformanceIntegrationTest` — 10 requêtes séquentielles, p95 ≤ 300 ms (warmup + mesures).
- [x] Re-run tests inbox + suite API ; documenter causes/fix dans Dev Notes et deferred-work.

### Review Findings

- [x] [Review][Decision] Duplication `resolveViewerParticipantIds` vs étendre `CompositionLinkedParticipantResolver` — résolu : option A ; cache optionnel `seasonParticipantIdsBySeasonId` sur le resolver partagé.

- [x] [Review][Patch] Corriger libellé « EXISTS participation » dans Completion Notes — table RC-8 et Completion Notes alignées sur `COUNT > 0`.

- [x] [Review][Patch] Ajouter `deferred-work.md` au File List.

- [x] [Review][Patch] `@Tag("perf")` sur `MeInboxPerformanceIntegrationTest`.

- [x] [Review][Defer] Validation p95 Neon/prod non démontrée — AC1 couvert H2/test ; deferred-work PERF-06 reporte validation dev représentative.

- [x] [Review][Defer] Pas de delta chiffré avant/après — plan DoD §5.1 ; baseline RC-8 ~912 ms non reprise dans Completion Notes.

- [x] [Review][Defer] Fixture perf minimale (membre seed sans pending/horizon) — garde-fou AC1 mais ne stress pas les chemins optimisés RC-8 ; deferred-work PERF-06.

- [x] [Review][Defer] `./gradlew test` 5 échecs préexistants — composition/availability ; deferred-work 8-4/8-9 ; hors inbox.

- [x] [Review][Defer] Risque drift requêtes DISTINCT vs COUNT miroir — `findParticipatingSeasonIds*` conservées ; maintenance future, pas régression PERF-06.

---

## Dev Notes

### Causes identifiées (RC-8)

| Cause | Impact | Fix |
|-------|--------|-----|
| `compositionLifecycleEnrichment.loadViewsByEventIdsAcrossSeasons` sur **tous** les events agenda (≤50) alors que seul `nextEvent` consomme le badge | Majeur — compositions + slots + canManage × N | Lifecycle limité à `nextEvent` (1 event) |
| `availabilityService.myStatusByEventIds` sur **tous** les events agenda | Majeur | Availability limitée aux events dans l’horizon dispo (30 j) + `nextEvent` |
| `participationContext` : 2× `SELECT DISTINCT season_id` pour un booléen | Mineur | `existsParticipatingSeasonFromSeason/EventOnly` (COUNT/EXISTS) |
| `CompositionLinkedParticipantResolver` : re-query season participants par event pending | Mineur | Cache `seasonParticipantIdsBySeasonId` dans confirm actions |
| `participantFocusForRow` : `eventRepository.findById` pour charger `season` | Mineur | `seasonRepository.findById(row.seasonId)` |

### Non-goals (PERF-06)

- Endpoint `GET /me/inbox/count` — option plan, non requis AC ; badge front couvert par PERF-02 cache.
- `NotificationRecipientResolver.isActiveEngagedMember` N+1 — déjà documenté deferred-work 8-8 ; hors chemin inbox.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| PERF-02 | done | Cache front inbox ; PERF-06 adresse latence serveur brute |
| 17-21 | done | Contrat `GET /me/inbox` inchangé |

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Scoper les enrichissements coûteux au strict nécessaire pour la réponse inbox (actions dispo/confirm + `nextEvent` uniquement).
- Remplacer les listes de season IDs par des EXISTS pour `noParticipation`.
- Ajouter garde-fou perf intégration NFR-P2 sur fixture minimale (membre seed sans participation événement).

### Completion Notes List

- **Optimisations** : lifecycle 1 event vs ≤50 ; availability horizon 30 j vs page complète ; participation `COUNT > 0` (booléen) ; cache season participants via `CompositionLinkedParticipantResolver` ; season lookup focus.
- **Test perf** : `MeInboxPerformanceIntegrationTest` — warmup + 10 GET séquentiels, p95 ≤ 300 ms ✓ (H2 test profile).
- **Tests fonctionnels** : 10/10 `MeInboxIntegrationTest` + perf test verts.
- **Suite API** : 902 tests, 5 échecs préexistants (`AvailabilityControllerIntegrationTest`, `CompositionDrawIntegrationTest`, `CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest`) — documentés deferred-work 8-4/8-9 ; aucun échec inbox.
- **Profilage post-PERF-06** (`node scripts/v2/profile-web-performance.mjs`, stack dev `--no-tailscale`, `.local/perf-profile/web-perf-2026-06-09T18-37-35-670Z.json`, 2026-06-09 — API redémarrée avec bytecode PERF-06) vs baseline plan (`15-32-52-596Z`) et post-PERF-05 (`17-58-33-804Z`) :
  - **`GET /me/inbox` script** : **1×** total (baseline **13×**, post-PERF-02 stable ✓) ; fetch forcé sur Accueil todo uniquement.
  - **Inbox latence (maxMs, fetch Accueil)** : **590 ms** (baseline **1475 ms**, −885 ms ; post-PERF-05 **888 ms**, −298 ms).
  - **Appels `/v1/*` script** : **90** (baseline **144**, −54 ; post-PERF-05 **90**, inchangé).
  - **Accueil todo wallMs** : **1629** (baseline **2450**, −821 ; post-PERF-05 **1856**, −227).
  - **Hub troupe / Compte wallMs** : **1285** / **862** (baseline **1553** / **1422** ; inbox **0×** shell grâce PERF-02).
  - **Gate NFR-P2 (p95 ≤ 300 ms sur Improbots dev)** : **non atteint** sur fetch réel Accueil (**590 ms**) ; AC1 couvert par test intégration H2 fixture minimale ; validation Neon représentative reportée deferred-work PERF-06.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLinkedParticipantResolver.kt`
- `services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxPerformanceIntegrationTest.kt` (new)
- `_bmad-output/implementation-artifacts/deferred-work.md`

### Change Log

- 2026-06-09 — PERF-06 : scoping lifecycle/availability inbox ; participation COUNT booléen ; test intégration p95 ≤ 300 ms.
- 2026-06-09 — Code review : cache optionnel sur `CompositionLinkedParticipantResolver` ; `@Tag("perf")` ; doc alignment.
- 2026-06-09 — Re-profilage post-PERF-06 : `web-perf-2026-06-09T18-37-35-670Z.json` — inbox Accueil maxMs 590 (−885 vs baseline, −298 vs PERF-05) ; NFR-P2 300 ms non atteint sur Improbots dev.

---

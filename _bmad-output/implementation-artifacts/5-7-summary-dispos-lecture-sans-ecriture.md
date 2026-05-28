# Story 5.7 — Summary dispos : lecture sans écriture sur GET

**Status:** review

**PLAN:** [PLAN.md](../../PLAN.md) § Hygiene H1 backlog **5-7**  
**SCP:** [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](../planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md)  
**Triage:** [deferred-triage-2026-05.md](deferred-triage-2026-05.md) — **DW-079**  
**Growth:** [growth-backlog.md](../planning-artifacts/growth-backlog.md) — **G-003**  
**Predecessor:** [5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md](5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md) (W1 deferred)

---

## Story

En tant que **membre ou organisateur** ouvrant l’onglet Disponibilités,  
je veux que le chargement du **summary** (`GET …/availability/summary`) reste une **lecture pure**,  
afin de **réduire la latence perçue (G-003)** et éviter des écritures roster dans une transaction de lecture.

---

## Acceptance Criteria

1. **Given** un membre autorisé sur un événement, **when** `GET /v1/seasons/{seasonId}/events/{eventId}/availability/summary` est appelé, **then** la méthode **n’appelle pas** `SeasonParticipantService.ensureMembershipParticipants` et la transaction est **read-only**. [Source: DW-079, G-003]

2. **Given** un membre de troupe **sans** ligne `season_participant` pour la saison, **when** seul le summary est chargé (sans `GET …/participants/selectors`), **then** aucune ligne participant n’est créée en base ; le membre n’apparaît pas dans le summary tant que la sync n’a pas eu lieu ailleurs. [Source: 5-3 W1 inversion]

3. **Given** l’onglet Dispos (`event-dispos-tab`), **when** le premier chargement s’exécute, **then** la sync roster reste assurée par l’appel parallèle **`listSeasonParticipantSelectors`** (`ensureMembershipParticipants` côté selectors — inchangé). [Source: `event-dispos-tab.ts` `Promise.all`]

4. **Given** les tests d’intégration availability existants (story 5-3), **when** `./gradlew test` passe, **then** un test dédié prouve l’absence d’écriture roster sur GET summary (compteur `season_participant` stable). [Source: OPS-2 gate]

5. **Given** story **5-7** done, **when** hygiene est mise à jour, **then** référencer **G-003** / **DW-079** en Dev Notes ; ne pas rouvrir le scope prefetch UI / skeleton (H2). [Source: SCP H1 cap]

**Product coverage:** perf hot path Dispos — pas de changement SPEC fonctionnel.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; le front continue d’appeler summary + selectors en parallèle.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` uniquement — `AvailabilityService.getSummary`.
- [x] Retirer `ensureMembershipParticipants` de `getSummary` ; `@Transactional(readOnly = true)`.
- [x] Retirer la dépendance `SeasonParticipantService` si devenue inutile dans `AvailabilityService`.
- [x] Test intégration : GET summary ne crée pas de `season_participant` pour un nouveau membre non synchronisé.
- [x] `./gradlew test` vert (AvailabilityControllerIntegrationTest + suite).
- [x] Mettre à jour PLAN.md backlog **5-7** et `sprint-status.yaml`.

---

## Dev Notes

### Problem statement

- Story **5-3** a volontairement laissé `ensureMembershipParticipants` dans `getSummary` (W1 deferred) car `@Transactional(readOnly = true)` bloquait les écritures.
- Retour terrain **G-003** : latence à l’ouverture de l’onglet Dispos ; l’écriture roster sur chaque GET summary est un candidat perf évident.
- Le front charge déjà **summary** et **selectors** en parallèle — la sync peut rester sur selectors / list admin / composition.

### Technical guardrails

| Topic | Action |
|--------|--------|
| Hot path | `AvailabilityService.getSummary` — read-only only |
| Sync roster | Conserver `ensureMembershipParticipants` sur `listSelectors`, `listAdmin`, composition, roster |
| Régression | Summary doit toujours lister les participants **déjà** synchronisés |
| Non-goals | Prefetch global, skeleton UI, N+1 selectors (G-003 suite / 6.11) |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 5-3 | done | Introduced summary + W1 defer |
| 5-6 | done | `includeChances=true` au premier load Tous — inchangé |
| OPS-2 | done | CI gate tests API |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- `getSummary` est `@Transactional(readOnly = true)` sans `ensureMembershipParticipants` ; sync roster inchangée sur `listSelectors` (appel parallèle front).
- Test `summary GET does not sync membership participants` (@Tag G-003) ; tests 5-3 ajustés avec `syncSeasonParticipants` explicite (équivalent selectors).
- 16 tests `AvailabilityControllerIntegrationTest` verts localement.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt`
- `_bmad-output/implementation-artifacts/5-7-summary-dispos-lecture-sans-ecriture.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `PLAN.md`

### Change Log

- 2026-05-28 : Story créée (hygiene H1 / SCP 2026-05-28).
- 2026-05-28 : Implémentation API read-only summary + test G-003.

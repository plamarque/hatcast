---
baseline_commit: 53cae57d1be3cccbe82f962436eb6fb393476e12
---

# Story PERF-05 — viewerGender props depuis pages listes

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 2  
**Depends:** PERF-01 (cache service minimum)

---

## Story

En tant que **membre**,  
je veux que les listes événements passent le genre viewer aux composants participation,  
afin de **garantir zéro fetch preferences** même sans cache timing edge case.

---

## Acceptance Criteria

1. **Given** agenda / season-agenda / member-home-todo, **when** rendu, **then** `[viewerGender]` passé à chaque `app-agenda-participation-status`.  
2. **Given** tests, **when** `viewerGender` fourni, **then** `getPreferences` jamais appelé dans le composant enfant.

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `user-agenda`, `season-home` → `season-agenda`, `member-home-todo`, `AgendaParticipationStatus`.
- [x] Vérifier `[viewerGender]` sur chaque `app-agenda-participation-status` dans les trois templates listes.
- [x] Précharger `viewerGender` une fois au niveau page parent (`loadViewerGender` + effet `cacheRevision`).
- [x] Tests unitaires enfant : `agenda-participation-status.spec.ts` — pas de fetch si prop fournie.
- [x] Tests intégration page : `season-agenda`, `user-agenda`, `member-home-todo` — au plus 1 appel `getPreferences` (parent), zéro dans l'enfant quand prop passée.
- [x] Suite ciblée PERF-05 verte ; régressions préexistantes hors scope (troupe-context WIP) notées en Completion Notes.

### Review Findings

- [x] [Review][Decision] Niveau de preuve AC2 suffisant pour clôturer ? — Résolu : assertions binding explicites requises (choix 2) ; patches appliqués.
- [x] [Review][Patch] Tests page n'assertent pas `viewerGender` sur les enfants [`user-agenda.spec.ts:114`, `member-home-todo.spec.ts:434`] — `By.directive(AgendaParticipationStatus)` + `viewerGender() === 'female'`.
- [x] [Review][Patch] `season-agenda` : pas d'assertion que l'enfant est monté [`season-agenda.spec.ts:250`] — `querySelector('app-agenda-participation-status')` ajouté.
- [x] [Review][Patch] `season-agenda` : pas de test fallback sans `viewerGender` input [`season-agenda.spec.ts:250`] — test « fetches preferences when viewerGender is not provided » ajouté.
- [x] [Review][Defer] AC1 non couvert par les tests ajoutés (bindings vérifiés en revue code) — deferred, pre-existing
- [x] [Review][Defer] Race timing parent lent / enfant précoce non testée (atténuée par `await loadViewerGender()` avant rendu liste) — deferred, pre-existing
- [x] [Review][Defer] Effet `cacheRevision` non testé sur `user-agenda` / `member-home-todo` — deferred, pre-existing
- [x] [Review][Defer] Chemins échec `getPreferences` (preload KO → refetch enfant) non testés — deferred, pre-existing
- [x] [Review][Defer] Chaîne intégration `season-home` → `season-agenda` non testée (test isolé couvre le contrat input) — deferred, pre-existing
- [x] [Review][Defer] `sprint-status.yaml` : changements collatéraux hors PERF-05 (`5-8`, `perf-04`) — deferred, pre-existing

---

## Dev Notes

### Context

PERF-01 a livré le cache `MePreferencesApiService` **et** l'option B (props parent). PERF-05 formalise le complément : garantir zéro fetch enfant même si le cache n'est pas encore peuplé au moment du mount des cartes (race timing).

### Fichiers clés

| Page | Chargement gender | Binding template |
|------|-------------------|------------------|
| `user-agenda.ts` | `loadViewerGender()` + effet `cacheRevision` | `user-agenda.html` |
| `season-home.ts` → `season-agenda` | idem, passé en input | `season-agenda.html` |
| `member-home-todo.ts` | idem | `member-home-todo.html` |

### Explicit non-goals

- `event-equipe-tab` (fetch local conservé — hors listes)
- Changement API backend

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Vérification code existant (livré avec PERF-01 Option B) : bindings `[viewerGender]` déjà présents sur les 3 listes.
- Renforcement tests page-level pour prouver AC1+AC2 indépendamment du cache service.
- Mock `MePreferencesApiService` ajouté aux specs `user-agenda` et `member-home-todo` pour compter les appels.

### Completion Notes List

- **AC1** : `[viewerGender]="viewerGender()"` confirmé sur `user-agenda.html`, `season-agenda.html`, `member-home-todo.html`.
- **AC2** : `agenda-participation-status.spec.ts` (enfant) + nouveaux tests page :
  - `season-agenda.spec.ts` — `getPreferences` non appelé quand `viewerGender` input = `'female'`
  - `user-agenda.spec.ts` — 2 cartes, `getPreferences` appelé **1×** (parent preload)
  - `member-home-todo.spec.ts` — carte next-event, `getPreferences` appelé **1×**
- **Tests globaux** : `npm run test -w @hatcast/web -- --watch=false` — échecs préexistants (WIP `troupe-context`, `season-card`, `event-detail`) hors scope PERF-05 ; specs PERF-05 passent.
- **Profilage post-fix** (`node scripts/v2/profile-web-performance.mjs`, `--with-push`, `.local/perf-profile/web-perf-2026-06-09T17-58-33-804Z.json`) — pages listes PERF-05 vs baseline plan (`web-perf-2026-06-09T15-32-52-596Z.json`) :
  | Route | wallMs avant | wallMs après | Δ | `GET /me/preferences` |
  |-------|-------------:|-------------:|--:|----------------------:|
  | Accueil todo | 2450 | **1856** | −24 % | 2 → **1** |
  | Agenda membre | 5850 | **1864** | −68 % | 32 → **1** |
  | Saison agenda | 2214 | **1739** | −21 % | 6 → **1** |
  - **AC perf PERF-05** : zéro N+1 preferences sur les listes — **1×** par visite (preload parent), jamais par carte.
  - vs post-PERF-01 (`web-perf-2026-06-09T16-11-05-864Z.json`) : prefs déjà à 1× ; gains wall time additionnels (−20 % accueil, −6 % agenda/saison) portés par PERF-02/04 (inbox cache, session context) dans la même session — hors attribution isolée PERF-05.
  - **Gate S2** (toutes pages membre ≤ 2 s) : **11/12** routes OK ; Event Activité **2285 ms** (+2 % vs baseline) — hors scope listes.

### Debug Log

- Story initialement en `backlog` sans Tasks — structure complétée à l'implémentation.

---

## File List

- `apps/web/src/app/pages/season-home/season-agenda.spec.ts` (modified)
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts` (modified)
- `apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts` (modified)
- `_bmad-output/implementation-artifacts/perf-05-viewer-gender-props.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

---

## Change Log

- 2026-06-09 — PERF-05 : validation props `viewerGender` listes + tests page-level (complément PERF-01).
- 2026-06-09 — Code review : assertions binding `viewerGender()` sur enfants + test fallback `season-agenda`.
- 2026-06-09 — Profilage re-run ; delta noté en Completion Notes (`web-perf-2026-06-09T17-58-33-804Z.json`).

---

## Status

done

---
baseline_commit: 0e6923ad37cdd9365957d3d8f87843059229278f
---

# Story PERF-01 — Dédupliquer GET /me/preferences (N+1 agenda)

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 1  
**Issue:** [ISSUES.md](../../ISSUES.md) PERF-002 (à ouvrir si absent)  
**Growth:** [growth-backlog.md](../planning-artifacts/growth-backlog.md) G-003 (perf dispos — lien indirect genre/labels)  
**Baseline:** `.local/perf-profile/web-perf-2026-06-09T15-32-52-596Z.json` — agenda **5850 ms**, **37** appels `/v1/*`, **32×** `GET /me/preferences`

---

## Story

En tant que **membre** consultant l’agenda ou une liste d’événements avec statut de participation,  
je veux que le genre affiché (libellés inclusifs / adaptés) soit résolu **sans une requête API par carte**,  
afin que **l’ouverture de l’agenda reste fluide** (NFR-P1).

---

## Acceptance Criteria

1. **Given** une page listant N cartes événement avec `app-agenda-participation-status` (agenda membre, agenda saison, accueil todo), **when** la page se charge, **then** **au plus 1** appel `GET /v1/me/preferences` est émis pour cette visite (cache service ou prop parent). [Source: perf plan RC-1 ; NFR-P1]

2. **Given** `MePreferencesApiService.getPreferences()`, **when** plusieurs composants appellent la méthode concurrently avant résolution, **then** une seule requête réseau est partagée (Promise in-flight dedup). [Source: perf plan PERF-01]

3. **Given** un `PATCH /v1/me/preferences` réussi depuis `/compte`, **when** le cache est invalidé, **then** le prochain `getPreferences()` refetch et les listes affichent le genre à jour. [Source: story 2.12b gender]

4. **Given** le script `node scripts/v2/profile-web-performance.mjs` sur dev local (`--with-push` ou équivalent), **when** PERF-01 est livré, **then** la route **Agenda membre** affiche **≤ 1,5 s** wall time et **≤ 7** appels `/v1/*` (vs baseline 5,9 s / 37). [Source: perf plan gate S1]

5. **Given** les tests unitaires existants sur `agenda-participation-status`, `me-preferences-api`, **when** `./npm run test -w @hatcast/web -- --watch=false`, **then** vert + test(s) prouvant le dedup cache / prop `viewerGender`. [Source: NFR-Q1]

**Product coverage:** perf UX — pas de changement fonctionnel SPEC.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement visuel intentionnel ; comportement et perf uniquement. Vérifier qu’aucun skeleton/regression n’apparaît sur les chips participation.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `MePreferencesApiService`, `AgendaParticipationStatus`, pages listes.
- [x] Ajouter cache in-flight + memo session dans `MePreferencesApiService` ; `invalidateCache()` appelé depuis `patchPreferences` (et logout si applicable).
- [x] Option A (minimal) : cache service seul — suffit si AC1–2 passent.
- [x] Option B (recommandée plan) : `user-agenda`, `season-agenda`, `member-home-todo` chargent gender une fois et passent `[viewerGender]` aux enfants — évite même le single fetch par composant mount timing.
- [x] Tests : service dedup concurrent ; spec `agenda-participation-status` sans fetch si `viewerGender` fourni.
- [x] Re-run profilage ; noter delta dans Completion Notes.
- [x] Référencer PERF-002 / plan dans Completion Notes si ISSUES mis à jour.

---

## Dev Notes

### Root cause (evidence)

Chaque instance appelle l’API dans `ngOnInit` :

```typescript
// apps/web/src/app/shared/participation/agenda-participation-status.ts
async ngOnInit(): Promise<void> {
  if (this.viewerGender() != null) return;
  const result = await this.mePreferencesApi.getPreferences();
  // ...
}
```

Templates : `user-agenda.html`, `season-agenda.html`, `member-home-todo.html`.

### Implementation guardrails

| Concern | Action |
|---------|--------|
| Cache | Singleton `providedIn: 'root'` — pas de cache par composant |
| Invalidation | PATCH preferences + sign-out |
| Réutilisation | `MemberDisplayNameService` utilise déjà `MePreferencesApiService` — bénéficie du cache |
| Scope | Ne pas refactoriser `event-equipe-tab` dans cette story (PERF-05 si besoin) |

### Explicit non-goals

- PERF-02 inbox badge
- PERF-03 event-detail tab gating
- Changement API backend

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 2.12b gender labels | done | Genre dans preferences |
| 5-7 summary read-only | done | Piste dispos séparée |
| PERF-05 | backlog | Props parent complément optionnel |

### Measurement

```bash
node scripts/v2/profile-web-performance.mjs
# Comparer agenda wallMs + count GET /me/preferences
```

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Completion Notes List

- **Cache service** : `MePreferencesApiService` — memo session + in-flight dedup ; `invalidateCache()` sur PATCH réussi et `AuthApiService.logout()`.
- **Option B** : `viewerGender` préchargé dans `user-agenda`, `season-home` → `season-agenda`, `member-home-todo` ; les cartes ne déclenchent plus de fetch individuel.
- **Profilage post-fix** (`.local/perf-profile/web-perf-2026-06-09T16-11-05-864Z.json`, `--with-push`) :
  - Agenda membre **1993 ms** (baseline 5850 ms) — goulot restant `me/inbox` (~900 ms) + `me/agenda` (~811 ms), hors scope PERF-01 (voir PERF-02).
  - Appels `/v1/*` : **6** (baseline 37, cible ≤ 7) ✓
  - `GET /me/preferences` : **1×** (baseline 32×) ✓
- **Profilage post-review** (`.local/perf-profile/web-perf-2026-06-09T16-22-25-575Z.json`, `--with-push`, 2026-06-09) — delta vs baseline `.local/perf-profile/web-perf-2026-06-09T15-32-52-596Z.json` :
  - **Agenda membre** : wall **1997 ms** (−3853 ms, −66 %) ; appels `/v1/*` **6** (−31) ; `GET /me/preferences` **1×** (−31). Goulots restants : `me/agenda` ~928 ms, `me/inbox` ~899 ms.
  - **Accueil todo** : wall 2522 ms (+72 ms) ; appels **5** (−1) ; preferences **1×** (−1).
  - **Saison agenda** : wall **1798 ms** (−416 ms) ; appels **10** (−5) ; preferences **1×** (−5).
  - Gate PERF-01 : preferences ≤ 1 ✓ ; appels agenda ≤ 7 ✓ ; wall agenda 1997 ms > 1500 ms (dérogation AC4 — PERF-02).
- **PERF-002** : issue existante dans ISSUES.md — RC-1 adressé par cette story ; latence inbox/agenda reste ouverte.
- **Code review (2026-06-09)** : `cacheGeneration` + `cacheRevision` ; invalidation changement user ; `viewerGender` sur historique saison ; reload parent via `effect` ; tests race + logout.

### File List

- `apps/web/src/app/core/account/me-preferences-api.service.ts`
- `apps/web/src/app/core/account/me-preferences-api.service.spec.ts` (new)
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.html`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-agenda.ts`
- `apps/web/src/app/pages/season-home/season-agenda.html`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.html`
- `apps/web/src/app/shared/participation/agenda-participation-status.spec.ts` (new)

### Review Findings

- [x] [Review][Decision] AC4 wall time gate non atteint — **Résolu :** clôture `done` avec dérogation AC4 wall time (1993 ms > 1500 ms) ; goulot inbox/agenda documenté → PERF-02.
- [x] [Review][Decision] `viewerGender` parent périmé après PATCH `/compte` — **Résolu :** signal `cacheRevision` sur `invalidateCache()` + `effect()` sur les 3 pages parentes recharge `viewerGender`.
- [x] [Review][Patch] Race invalidation / GET en vol réécrit le cache [`me-preferences-api.service.ts`] — `cacheGeneration` empêche la réécriture du cache après invalidation.
- [x] [Review][Patch] Cache préférences non invalidé au changement d’utilisateur sans logout [`auth-api.service.ts:100-105`] — `applySessionBody` invalide si `user.id` change.
- [x] [Review][Patch] Option B incomplète : historique saison sans `viewerGender` [`season-home.html:69`] — `[viewerGender]` ajouté sur la vue `history`.
- [x] [Review][Patch] Invalidation logout non testée [`auth-api.service.spec.ts`] — test `logout invalide le cache des préférences membre` ajouté.

- [x] [Review][Defer] GET en échec non mis en cache — retry à chaque appel ; pattern d’erreur préexistant, impact marginal avec dedup parent. [`me-preferences-api.service.ts:37-39`] — deferred, pre-existing
- [x] [Review][Defer] Pas de sync multi-onglets — cache mémoire process ; limitation navigateur hors scope PERF-01. — deferred, pre-existing
- [x] [Review][Defer] Échec silencieux `loadViewerGender` — signal reste `undefined`, pas de retry ; pattern préexistant sur les trois pages. — deferred, pre-existing

### Change Log

- 2026-06-09 — PERF-01 : dedup/cache `GET /me/preferences` + prop `viewerGender` parent ; gate preferences 1× / 6 appels API agenda.
- 2026-06-09 — Code review : 2 decision-needed, 4 patch, 3 defer, 6 dismissed ; patches appliqués ; story `done` (dérogation AC4 wall time).
- 2026-06-09 — Re-profilage post-review : `web-perf-2026-06-09T16-22-25-575Z.json` — agenda −3853 ms / −31 prefs ; gate preferences et appels validés.

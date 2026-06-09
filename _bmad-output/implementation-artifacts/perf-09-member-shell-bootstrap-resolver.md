---
baseline_commit: 3e26356e65dfeb19fbe4a2c6acc41d05b5f66692
---

# Story PERF-09 — Member shell bootstrap resolver

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4d  
**Complète:** PERF-04 (cache invalidé à chaque `page.goto` du script profilage)

---

## Story

En tant que **membre** naviguant **in-app** (Router),  
je veux session + troupes + préférences résolues **une fois** au shell,  
afin que les pages enfants ne refassent pas auth/troupes/prefs.

---

## Acceptance Criteria

1. `MemberShell` ou `canActivate` guard : `ensureHatcastSession` + `troupeContext.load()` une fois ; pages enfants consomment signaux cache.
2. Navigation agenda → event : **0** nouveaux `auth/me` + `troupes` (test e2e ou spec router).
3. Invalidation logout / switch user inchangée.

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `MemberShellBootstrapService`, guard `canActivate`, routes membre, pages agenda/event/accueil/compte.
- [x] Service bootstrap : `ensureHatcastSession` + `troupeContext.load()` en parallèle, dedup in-flight, memo par `sessionUser.id` ; invalidation via effect logout (sessionUser null) + switch user.
- [x] Guard `memberShellBootstrapGuard` sur route `MemberShell` ; redirect `/connexion` si session absente.
- [x] Pages enfants clés : `UserAgenda`, `EventDetail`, `MemberHomeTodo`, `AccountPlaceholder` consomment `sessionUser` + `ensureReady()` sans re-fetch shell.
- [x] `MemberShell` : persistance chemin membre stats via `sessionUser()` (plus d’appel auth au NavigationEnd).
- [x] Tests : service unit (dedup, 401, invalidate, switch user) ; spec navigation router agenda → event (0× auth/me + troupes supplémentaires).
- [x] Specs pages impactées mises à jour (mock bootstrap + URLs saison canoniques ADR 0013).

---

## Dev Notes

- S’appuie sur PERF-04 (`AuthApiService` / `TroupeApiService` cache) ; PERF-09 centralise le bootstrap au **premier** accès shell Router.
- `TroupeSeasonResolverService` peut encore appeler `context.load()` — cache API, pas de fetch réseau in-app.
- Pages admin / troupes avec `{ force: true }` conservent le refresh explicite (ex. `/troupes`).

### Explicit non-goals

- PERF-14 mode profilage `--in-app`
- Paralléliser agenda API (PERF-11)
- Refactor exhaustif de toutes les pages membre (pattern bootstrap disponible pour migration progressive)

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- **`MemberShellBootstrapService`** : `Promise.all([ensureHatcastSession(), troupeContext.load()])` ; memo `bootstrappedUserId` ; effect invalide memo quand `sessionUser` → null (logout).
- **`memberShellBootstrapGuard`** : `canActivate` sur parent `MemberShell` — une exécution par session shell ; navigations enfants réutilisent le memo.
- **Pages** : remplacer `ensureHatcastSession()` initial par `memberBootstrap.ensureReady()` + lecture `auth.sessionUser()`.

### Completion Notes List

- AC1 : guard + service bootstrap ; 4 pages enfants migrées ; shell stats path sans fetch auth.
- AC2 : `member-shell-bootstrap-navigation.spec.ts` — agenda → event, auth/me et troupes restent à 1×.
- AC3 : invalidation logout (effect sessionUser null) + switch user (userId change) couverts par tests service ; caches PERF-04 inchangés.
- Tests : 155/155 verts sur périmètre ciblé (bootstrap + pages + auth-api).
- **Profilage post-PERF-09** (`node scripts/v2/profile-web-performance.mjs`, dev local HTTPS `https://localhost:4200`, seed `@seed.improbots.test`, `.local/perf-profile/web-perf-2026-06-09T21-37-49-065Z.json`, 2026-06-09) vs référence plan vague 2 (`web-perf-2026-06-09T19-46-21-738Z.json`, post PERF-01…08) :
  - **Limite script** : `page.goto` par route → reload SPA → bénéfice navigation **in-app** (0× auth/me + troupes agenda→event) **non mesuré** ici ; preuve AC2 = spec router. PERF-14 `--in-app` reste le gate navigation réelle.
  - **`GET /v1/auth/me` script total** : **12× → 12×** (inchangé — attendu avec reload).
  - **`GET /v1/troupes` script total** : **10× → 13×** (+3) — bootstrap shell sur accueil/compte (+1 troupes/route vs 19:46) + variance `/troupes` (force refresh page).
  - **Appels `/v1/*` script total** : **86 → 76** (−10) — surtout Event ×3 (BFF tab=page, PERF-10 présent sur branche).
  - **Wall time (ms)** — delta vs 19:46 :
    - Accueil **1644** (+143 ; +1 troupes bootstrap shell)
    - Agenda **1940** (**±0** ; auth/me 1×, troupes 1× inchangés)
    - Compte **1049** (+179 ; +1 troupes bootstrap)
    - Saison agenda **1897** (−105)
    - Event Infos **1772** (−179 ; 6 appels vs 10)
    - Event Dispos **1708** (−523 ; 6 appels vs 10)
    - Event Équipe **1884** (−379 ; 6 appels vs 10)
    - Event Activité **2619** (+168)
  - **Interprétation PERF-09** : pas de régression agenda ; coût marginal +1 troupes sur cold load accueil/compte (bootstrap guard) ; gain navigation router non capturé par ce script.

### File List

- `apps/web/src/app/core/member-shell/member-shell-bootstrap.service.ts`
- `apps/web/src/app/core/member-shell/member-shell-bootstrap.guard.ts`
- `apps/web/src/app/core/member-shell/member-shell-bootstrap.service.spec.ts`
- `apps/web/src/app/core/member-shell/member-shell-bootstrap-navigation.spec.ts`
- `apps/web/src/app/testing/member-shell-bootstrap.testing.ts`
- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/layout/member-shell/member-shell.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`

### Change Log

- 2026-06-09 — Code review 2+3-lite : remove sessionUser bypass, clear sessionUser on 401, bootstrapGeneration race fix, EventDetail null guard.
- 2026-06-09 — Re-profilage post-PERF-09 : `web-perf-2026-06-09T21-37-49-065Z.json` vs réf. 19:46 — agenda ±0 ms ; auth/me 12× inchangé (script goto) ; troupes 13× (+3 bootstrap shell) ; Event wall −179…−523 ms (mix PERF-10 BFF).

### Review Findings

- [x] [Review][Resolved] Troupe load failure redirects to login — Fixed: `runBootstrap()` returns `{ ok: true }` when session OK regardless of `troupeContext.load()`; test `allows shell entry when troupe load fails but session is valid` (`member-shell-bootstrap.service.ts:69-70`, `service.spec.ts:74-82`).

- [x] [Review][Resolved] Session failure bypass when sessionUser signal set — Decision **2+3-lite**: remove bypass (redirect on `!session.ok`; silent reauth already in `ensureHatcastSession`); clear `sessionUser` on 401; follow-up deferred for network/5xx retry UI at boot.

- [x] [Review][Resolved] EventDetail missing sessionUser null guard [`event-detail.ts:322-329`] — Added null check + redirect like other migrated pages.

- [x] [Review][Resolved] invalidate() during in-flight bootstrap race [`member-shell-bootstrap.service.ts`] — `bootstrapGeneration` counter; stale in-flight results return `{ ok: false, status: 401 }` without memoizing.

- [ ] [Review][Defer] Boot network/5xx retry UI (3-lite follow-up) — status `0` / 5xx at bootstrap: retry screen instead of redirect login; not in PERF-09 scope.

- [x] [Review][Defer] Guard and logout integration test gaps [`member-shell-bootstrap.guard.ts`, `member-shell-bootstrap.service.spec.ts`] — deferred, follow-up coverage

- [x] [Review][Defer] Navigation spec uses AgendaStub/EventStub not real pages [`member-shell-bootstrap-navigation.spec.ts:9-13`] — deferred, AC2 proof level acceptable for merge

- [x] [Review][Defer] Testing helper underused [`member-shell-bootstrap.testing.ts`] — deferred, minor maintainability

- [x] [Review][Defer] Remaining shell pages still call ensureHatcastSession directly [`season-home.ts`, `troupe-hub.ts`, etc.] — deferred, explicit non-goal (progressive migration)

- [x] [Review][Defer] Bootstrap memo stale after auth cache invalidation without sessionUser clear [`auth-api.service.ts:102-105`, `member-shell-bootstrap.service.ts:28-29`] — deferred, pre-existing auth pattern amplified by bootstrap memo

- [x] [Review][Defer] Bootstrap memo skips troupe retry after load failure [`member-shell-bootstrap.service.ts:28-29`] — deferred, intentional (pages handle `loadError`)

- [x] [Review][Defer] No guard/navigation test for troupe API failure path — deferred, covered at unit level only

---

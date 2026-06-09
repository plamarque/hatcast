---
baseline_commit: cd1c47ce0adbfe495044915c84364352bb988083
---

# Story PERF-02 — Inbox badge stale-while-revalidate

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 1  
**Baseline:** `GET /me/inbox` ~850 ms à **chaque** navigation (`member-shell.ts`)

---

## Story

En tant que **membre** naviguant entre les pages,  
je veux que le badge inbox se mette à jour **sans bloquer** chaque chargement de page,  
afin de **réduire ~0,8 s** de latence perçue par navigation.

---

## Acceptance Criteria

1. **Given** une navigation membre (agenda → saison → event), **when** moins de 60 s se sont écoulées depuis le dernier fetch inbox réussi, **then** **0** nouvel appel `GET /me/inbox` au mount shell (cache hit).  
2. **Given** arrivée sur `/accueil` ou complétion d’action inbox, **when** refresh forcé, **then** badge à jour.  
3. **Given** script profilage post-livraison, **when** 3 navigations consécutives, **then** **1** seul inbox fetch (hors invalidation).  
4. **Gate S1 partiel :** hub/compte wall ≤ 0,8 s (cache hit 2e navigation).

**UI : N/A**

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `MeInboxApiService`, `MemberInboxBadgeService`, `member-shell.ts`, `member-home-todo.ts`, invalidation auth.
- [x] Cache session 60 s (mémoire + `sessionStorage`) + dedup in-flight dans `MeInboxApiService` ; `getInbox({ force?: boolean })`.
- [x] `MemberInboxBadgeService.refresh({ force })` délègue au cache API.
- [x] `member-shell` : skip refresh sur `/accueil` (todo force) ; plus de refresh redondant au `NavigationEnd` accueil.
- [x] `member-home-todo.loadInbox` : `getInbox({ force: true })` pour liste + badge à jour (AC2).
- [x] `invalidateCache()` sur logout et changement d’utilisateur (`AuthApiService`).
- [x] Tests : cache TTL, force, sessionStorage, shell mount, logout invalidation.
- [x] Re-run profilage ; noter delta dans Completion Notes (serveur dev requis).

### Review Findings

- [x] [Review][Decision→Patch] `member-home-todo` : déléguer à `MemberInboxBadgeService.refresh({ force: true })` — appliqué
- [x] [Review][Patch] Race `force` + non-`force` : chemin forcé attend `inFlight` avant nouveau fetch [`me-inbox-api.service.ts`]
- [x] [Review][Patch] `deleteAccount` appelle `meInboxApi.invalidateCache()` [`auth-api.service.ts:251`]
- [x] [Review][Patch] Cache `sessionStorage` scopé par `userId` + `bindSessionUser()` depuis auth [`me-inbox-api.service.ts`]
- [x] [Review][Patch] Double `writeCache` supprimé (uniquement dans `fetchInbox`) [`me-inbox-api.service.ts`]
- [x] [Review][Defer] Gate S1 ≤ 800 ms non atteinte (hub 1203 ms, compte 962 ms) — documenté, goulots auth/troupes → PERF-04
- [x] [Review][Defer] Pas de test intégration « action inbox → retour /accueil → badge à jour » (AC2 branche complétion)
- [x] [Review][Defer] Pas d'invalidation serveur (push/WebSocket) — tradeoff TTL documenté, PERF-06 envisagé

---

## Dev Notes

- Fichiers : `member-inbox-badge.service.ts`, `member-shell.ts`, `me-inbox-api.service.ts`
- Option future : endpoint `GET /me/inbox/count` (PERF-06)
- `sessionStorage` permet cache hit entre `page.goto` du script profilage (shell remount) dans la même session navigateur.

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Completion Notes List

- **Cache API** : `MeInboxApiService` — TTL 60 s, memo mémoire + `sessionStorage`, dedup in-flight, `force` bypass, `invalidateCache()` logout / switch user.
- **Shell** : refresh badge uniquement hors `/accueil` au mount ; accueil todo force un fetch pour la liste + badge (AC2).
- **Tests** : 36 tests verts sur `me-inbox-api`, `member-inbox-badge`, `member-shell`, `auth-api` (specs inbox).
- **Profilage post-fix** (`.local/perf-profile/web-perf-2026-06-09T16-30-26-208Z.json`, `--with-push`) vs baseline `15-32-52-596Z` :
  - **`GET /me/inbox`** : **1×** total script (baseline **13×**) ✓ AC3
  - Accueil : 1 fetch forcé (todo) ; agenda → event : **0** fetch shell (cache hit) ✓ AC1
  - Hub troupe wall **1203 ms** (baseline 1553) ; Compte **962 ms** (baseline 1422) — inbox éliminé mais gate S1 ≤ 800 ms partiellement atteint (goulots restants auth/troupes → PERF-04)
  - Agenda membre wall **1838 ms** (baseline 5850, post-PERF-01 ~1997 ms) — inbox retiré du chemin critique
- **Profilage post-review** (`.local/perf-profile/web-perf-2026-06-09T16-47-07-519Z.json`, `--with-push`, 2026-06-09) vs baseline `15-32-52-596Z` :
  - **`GET /me/inbox`** : **1×** total (baseline **13×**, −12) ✓ AC3 stable après patches review
  - Appels `/v1/*` script : **94** (baseline **144**, −50)
  - Accueil todo wall **1845 ms** (−605 ms) ; inbox **1×** (baseline 2×)
  - Agenda membre **1843 ms** (−4007 ms) ; inbox **0×** (baseline 1×)
  - Hub troupe **1266 ms** (−287 ms) ; Compte **950 ms** (−472 ms) — inbox **0×** sur les deux (baseline 1× chacun) ; gate S1 ≤ 800 ms toujours non atteint → PERF-04
  - Saison agenda **1756 ms** (−458 ms) ; event tabs inbox **0×** (baseline 1× chacun)

### File List

- `apps/web/src/app/core/inbox/me-inbox-api.service.ts`
- `apps/web/src/app/core/inbox/me-inbox-api.service.spec.ts` (new)
- `apps/web/src/app/core/inbox/member-inbox-badge.service.ts`
- `apps/web/src/app/core/inbox/member-inbox-badge.service.spec.ts`
- `apps/web/src/app/layout/member-shell/member-shell.ts`
- `apps/web/src/app/layout/member-shell/member-shell.spec.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-api.service.spec.ts`

### Change Log

- 2026-06-09 — PERF-02 : cache stale-while-revalidate inbox badge (60 s) ; shell skip accueil ; force refresh accueil todo ; invalidation auth.
- 2026-06-09 — Re-profilage post-review : `web-perf-2026-06-09T16-47-07-519Z.json` — inbox 1×/94 appels ; hub/compte sans fetch inbox ; gate wall ≤ 800 ms reporté PERF-04.

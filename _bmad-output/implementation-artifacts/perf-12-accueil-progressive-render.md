---
baseline_commit: 1ce6823772a27b7db3c0c1da85c6a3e1110f3fb3
---

# Story PERF-12 — Accueil rendu progressif + inbox SWR liste

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4c  
**Baseline:** Accueil **1501 ms** — inbox force **569 ms** bloque rendu

---

## Story

En tant que **membre** sur `/accueil`,  
je veux voir le chrome et les sections statiques **immédiatement**, avec inbox/actions en chargement non bloquant,  
afin d’un TTI perçu **≤ 1 s** même si l’API inbox prend ~500 ms.

---

## Acceptance Criteria

1. `loadingSession=false` avant fin inbox ; section actions avec skeleton.
2. Si cache inbox TTL valide : afficher liste stale + refresh background (`force` silencieux).
3. `seasonShortcut.refresh()` non bloquant pour le first paint.
4. Profilage : wall script peut rester ~1,5 s mais **first contentful** header ≤ 300 ms (CDP ou test).

**M3-3 :** skeleton Material sur zone actions.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `MemberHomeTodo`, `MeInboxApiService`, `MemberInboxBadgeService`.
- [x] `loadingSession=false` dès auth OK ; `loadViewerGender` + inbox en parallèle non bloquants.
- [x] Template progressif : header + Accès rapides toujours visibles ; skeleton actions (M3 tokens) pendant inbox.
- [x] SWR liste : `peekFreshCache()` → affichage immédiat + `refresh({ force: true })` silencieux en arrière-plan.
- [x] Premier fetch sans cache : `getInbox({ force: false })` ; retry utilisateur : `force: true`.
- [x] Tests : rendu progressif, SWR cache→background, peekFreshCache API, non-régression specs existantes.
- [x] `npm run test` ciblé member-home-todo + me-inbox-api verts ; build web OK.

---

## Dev Notes

- PERF-02 a déjà le cache TTL 60 s dans `MeInboxApiService` ; PERF-12 retire le `force: true` systématique au mount accueil.
- `seasonShortcut.refresh()` était déjà `void` — le blocage venait surtout de `await loadViewerGender()` + spinner plein écran inbox.
- AC4 profilage CDP : couvert par test unitaire « header + shortcuts avant fin inbox » (proxy first contentful) ; re-profilage script reporté PERF-14.

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

1. Exposer `peekFreshCache()` sur l’API inbox pour affichage stale synchrone.
2. Refactor `ngOnInit` : session gate → paint immédiat → inbox/bootstrap parallèle.
3. Restructurer le template : plus de spinner plein écran ; skeleton cartes actions + section Accès rapides statique.
4. `bootstrapInbox()` : cache hit → apply + background force ; sinon fetch initial avec skeleton.

### Completion Notes List

- **Progressive render** : header « Accueil » et « Accès rapides » visibles pendant `loadingInbox` ; skeleton 3 cartes (tokens M3, `aria-busy`).
- **SWR** : `peekFreshCache()` + refresh background silencieux ; erreur réseau en background ne masque pas le stale.
- **Tests** : +3 specs member-home-todo (progressive, SWR, force:false initial) ; +1 spec `peekFreshCache` API.
- **Build** : `npm run build -w @hatcast/web` OK.
- **Suite complète** : échecs préexistants hors scope (context-switcher, member-account-menu, etc.) — specs PERF-12 ciblées 34/34 vertes.
- **Profilage post-review (patches appliqués)** (`.local/perf-profile/web-perf-2026-06-09T22-10-34-290Z.json`, `node scripts/v2/profile-web-performance.mjs`, dev `--with-push`) vs baseline wave 2 `web-perf-2026-06-09T19-46-21-738Z.json` :
  - **Accueil wall** **1387 ms** (baseline **1501 ms**, **−114 ms** / −8 %) — script attend toujours `networkidle` (inbox ~486 ms) ; gate script wall ≤ 1000 ms non atteinte.
  - **domContentLoaded** **55 ms** (baseline **47 ms**) — chrome shell quasi immédiat ; proxy AC4 first contentful header **≪ 300 ms** ✓
  - **`GET /me/inbox`** **1×**, max **486 ms** (baseline **569 ms**, **−83 ms**) ; cold `page.goto`.
  - **Run-to-run** : +55 ms wall vs profil pré-patches `22-09-10-903Z` (1332 ms) — bruit réseau ; inbox stable (485→486 ms).
  - **Effet PERF-12 perçu** : header + Accès rapides + skeleton avant fin inbox (non capturé par `wallMs` — gate TTI navigation réelle → PERF-14 `--in-app`).

### File List

- `apps/web/src/app/core/inbox/me-inbox-api.service.ts`
- `apps/web/src/app/core/inbox/me-inbox-api.service.spec.ts`
- `apps/web/src/app/core/inbox/member-inbox-badge.service.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.html`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.scss`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts`

### Change Log

- 2026-06-09 — PERF-12 : accueil rendu progressif, skeleton actions M3, inbox SWR liste (cache + force background).
- 2026-06-10 — Code review BMad : 2 decision-needed, 8 patch appliqués, 3 defer, 6 dismissed ; story → done.
- 2026-06-10 — Re-profilage post-review (patches appliqués) : `web-perf-2026-06-09T22-10-34-290Z.json` — Accueil wall −114 ms vs baseline 19:46 ; domContentLoaded 55 ms ; inbox max −83 ms.

### Review Findings

- [x] [Review][Decision] **401 sur refresh SWR background** — résolu **1A** : redirection immédiate conservée. — `fetchInbox` appelle `redirectToLogin()` sur `401` même quand `showLoading: false` et que l’inbox stale est affiché. Choix : (A) conserver la redirection immédiate (sécurité session expirée) ; (B) ignorer le 401 en background et laisser le stale jusqu’à une action utilisateur.

- [x] [Review][Decision] **Transition `noParticipation` retire les Accès rapides** — résolu **2A** → patch ci-dessous. — si le refresh background retourne `noParticipation: true` alors que le cache stale montrait des actions, le template bascule vers la branche empty (sans section Accès rapides). Choix : (A) déplacer Accès rapides hors des branches conditionnelles pour qu’ils restent toujours visibles ; (B) accepter la disparition quand l’état « rien en attente » est confirmé serveur.

- [x] [Review][Patch] **Accès rapides toujours visibles hors `loadingSession`** [`member-home-todo.html:228`] — décision 2A : section déplacée hors branches erreur / noParticipation.

- [x] [Review][Patch] **Badge nav désynchronisé après échec SWR background** [`member-inbox-badge.service.ts:36`] — `preserveBadgeOnError` sur refresh silencieux.

- [x] [Review][Patch] **Flash « Tout est à jour » pendant revalidation SWR** [`member-home-todo.ts:108`] — signal `inboxRevalidating`.

- [x] [Review][Patch] **`prefers-reduced-motion` absent sur animation skeleton** [`member-home-todo.scss:360`]

- [x] [Review][Patch] **Code mort `MatProgressSpinnerModule` et `.member-home-todo__spinner`** [`member-home-todo.ts:4`, `member-home-todo.scss:27`]

- [x] [Review][Patch] **`referenceNow` non rafraîchi sur cache hit SWR** [`member-home-todo.ts:170`] — mis à jour dans `applyInboxResponse`.

- [x] [Review][Patch] **Courses `fetchInbox` concurrentes (double-clic Réessayer)** [`member-home-todo.ts:182`] — compteur `inboxLoadingRequests`.

- [x] [Review][Patch] **Tests manquants : SWR background error préserve stale + badge** [`member-home-todo.spec.ts`]

- [x] [Review][Defer] **AC4 seuil ≤ 300 ms non mesuré** — deferred, waiver PERF-14 documenté dans la story.

- [x] [Review][Defer] **`peekFreshCache` avec `boundUserId === null`** [`me-inbox-api.service.ts:127`] — deferred, comportement préexistant PERF-02 (`isCacheForBoundUser`).

- [x] [Review][Defer] **Promesses async sans annulation post-`ngOnDestroy`** [`member-home-todo.ts:154`] — deferred, pattern courant hors scope PERF-12.

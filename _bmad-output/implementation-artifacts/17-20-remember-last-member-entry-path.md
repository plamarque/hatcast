# Story 17.20 : Remember last visit — `lastMemberEntryPath` *(optionnel)*

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want to return after sign-in to **the last member screen I used** (hub, agenda, season workspace, or stats),  
so that **remember last visit covers my daily navigation**, not only the last season slug.

## Acceptance Criteria

1. **Given** a signed-in member navigates to a **persistable shell route** (`/accueil`, `/agenda`, or `/membre/:userSlug` matching their own session slug), **when** the route is active (on `NavigationEnd`), **then** the app stores **`lastMemberEntryPath`** in `localStorage` (path only: no origin; include query string only if product requires it — **default: pathname only**, same as `pathFromUrl`). [Source: epics 17.20; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Post-login extension]
2. **Given** navigation to **`/saison/:slug`** season workspace (resolved load, same moment as `rememberLastVisitedSeasonSlug`), **when** `SeasonHome` finishes a successful resolve, **then** persist **`/saison/{slug}`** as `lastMemberEntryPath` **in addition to** `lastVisitedSeason` (slug key unchanged). [Source: epics 17.20; Story **2.9**]
3. **Given** `lastMemberEntryPath` is read at post-login, **when** the stored path is **not** a persistable member entry route, **then** ignore it (do not navigate) and fall through to existing fallback. [Source: epics 17.20 AC revalidation]
4. **Given** stored path `/saison/:slug`, **when** `PostLoginNavigationService.resolveAuthenticatedEntryUrl` runs, **then** revalidate slug via `TroupeSeasonResolverService.resolveSeasonSlug` (same rules as today: `resolved` → navigate; `not-found` / `ambiguous` / `no-membership` / throw → clear **both** stale slug **and** stale `lastMemberEntryPath` if it pointed at that season, then fall through). [Source: epics 17.20; `post-login-navigation.service.ts`]
5. **Given** stored path `/membre/:userSlug`, **when** post-login resolves entry, **then** navigate only if slug matches the authenticated user’s slug from session (`AuthApiService` / session payload); otherwise clear stale path and fall through. [Source: shell Stats tab — current `MemberShell` child; align with [`member-stats-shortcut.service.ts`](../../apps/web/src/app/core/navigation/member-stats-shortcut.service.ts)]
6. **Given** stored path `/accueil` or `/agenda`, **when** post-login resolves entry, **then** navigate to that route (no server revalidation beyond auth gate). [Source: epics 17.20]
7. **Given** post-login without a valid pending deep link, **when** `lastMemberEntryPath` is valid and revalidated, **then** navigate there **before** `lastVisitedSeason` → `/saison/:slug` fallback. [Source: ux-hub § Post-login priority table priority **2**]
8. **Given** no valid `lastMemberEntryPath`, **when** post-login continues, **then** behaviour **unchanged** from Stories **2.9** / **12.5**: `lastVisitedSeason` → resolved season workspace → else `/agenda`. [Source: epics 17.20; FR49]
9. **Given** a **pending post-login deep link** (`hatcast.postLoginRedirect`), **when** sign-in succeeds, **then** deep link still wins **over** `lastMemberEntryPath` (priority **1** unchanged). [Source: epics 17.20 AC3; ux-hub]
10. **Given** navigation to **non-persistable** routes (event detail, admin, `/connexion`, `/troupes`, other users’ `/membre/:slug`, etc.), **when** the user visits them, **then** **do not** overwrite `lastMemberEntryPath` with those URLs. [Source: scope guard]
11. **Given** `MemberShell` / `MemberNav` tab changes, **when** the user switches shell tabs, **then** persistence occurs via the same central mechanism (AC 1) — **no** duplicate write logic in `member-nav` required. [Source: 17.22 optional hook note]
12. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** specs cover: set/get/clear storage, post-login priority (deep link > entry path > season > agenda), season slug invalidation clears path, `/membre` slug mismatch, shell `NavigationEnd` writes, and **no regression** in existing `post-login-navigation.service.spec.ts` scenarios except extended cases. [Source: repo norms; FR49 / UX-DR13]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) phase 2 extension ; **FR49** (post-login routing) ; **UX-DR13**. **Hors scope :** forcer `/accueil` au login ; backend API ; server-side preference sync ; persister event detail ou routes admin ; map `troupeId → lastSeasonSlug` (**17.23** option).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de nouveau chrome ni de contrôle visible ; uniquement persistance `localStorage` et ordre de routage post-login. Section Material 3 omise volontairement. [Source: story-template.md ; AGENTS.md]

---

## Tasks / Subtasks

- [x] **Storage module** (AC: 1–3, 10)
  - [x] Add `apps/web/src/app/core/navigation/last-member-entry-path-storage.ts` (+ `.spec.ts`):
    - Key e.g. `lastMemberEntryPath` (document V1/V2 coexistence if legacy ever used a different key — **new key** for V2).
    - `getLastMemberEntryPath()`, `rememberLastMemberEntryPath(path)`, `clearLastMemberEntryPath()`.
    - Mirror try/catch / silent failure pattern from [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts).
  - [ ] Add `isPersistableMemberEntryPath(path: string): boolean` (pure) — allow `/accueil`, `/agenda`, `/saison/:slug` (2 segments), `/membre/:slug` (2 segments); reject empty segments, `//`, external schemes, `/connexion`, admin segments, `/saison/:slug/event/...`, etc.

- [x] **Post-login resolution** (AC: 4–9, 12)
  - [x] Extend [`post-login-navigation.service.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts):
    - After pending redirect block, attempt `lastMemberEntryPath` with async revalidation for season + membre paths.
    - On season resolve failure, clear entry path when it equals the failed `/saison/{slug}`.
  - [x] Extend [`post-login-navigation.service.spec.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts): entry path `/accueil` beats `lastVisitedSeason`; `/saison/x` valid; stale season clears path; deep link still first; `/membre/wrong` falls through.

- [x] **Write hooks** (AC: 1, 2, 11)
  - [x] [`member-shell.ts`](../../apps/web/src/app/layout/member-shell/member-shell.ts): on `NavigationEnd`, if `shouldShowMemberNav(url)` and path is persistable, `rememberLastMemberEntryPath(pathFromUrl(url))`.
  - [x] [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts): after successful resolve (alongside `rememberLastVisitedSeasonSlug`), `rememberLastMemberEntryPath(saisonWorkspacePath(slug))` or equivalent `/saison/{slug}` string.
  - [x] **Do not** write from event detail, admin, or login routes.

- [x] **Docs trace** (AC: 12)
  - [x] Confirm link in [`epics.md`](../planning-artifacts/epics.md) Story 17.20 → this file.
  - [x] Update [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) « Fichiers story » row **17.20** → this file (`done`).

## Dev Notes

### Product and UX rules

- **Optional P2** — ship when remember-last-visit must include **`/accueil`** and agenda, not only season slug.
- **Post-login never defaults to `/accueil`** — only restore if the user **last** used it (product decision 2026-05-27).
- **Priority order** (target, replaces season-only step 2 in ux-hub table):

| Priorité | Condition | Destination |
|----------|-----------|-------------|
| 1 | Valid `hatcast.postLoginRedirect` | Deep link URL |
| 2 | Valid + revalidated `lastMemberEntryPath` | Stored route |
| 3 | Valid + revalidated `lastVisitedSeason` | `/saison/:slug` |
| 4 | Fallback | `/agenda` |

- **Current shell (2026-05-27 code):** `MemberShell` children are **`/accueil`**, **`/agenda`**, **`/membre/:userSlug`** (nav labels **Accueil · Agenda · Stats**). Season workspace **`/saison/:slug`** is **outside** the shell but remains a persistable entry per epic and **2.9** parity.
- **Pathname-only storage** avoids leaking stale query params; season workspace has no required query on entry.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | Single storage module + one post-login resolver; no ad-hoc `localStorage` in pages |
| Validation | Reuse `TroupeSeasonResolverService` for season paths; do not duplicate membership SQL on client |
| Security | Never persist or restore paths failing `isPersistableMemberEntryPath` / `isValidInternalRedirectPath` patterns |
| Membre slug | Compare to session user slug only — do not restore another member’s stats URL |
| Clear stale | When season slug cleared today, also clear matching `lastMemberEntryPath` |

### Explicit non-goals

| Item | Story |
|------|-------|
| Default post-login → `/accueil` | Never |
| Backend preference API | Out of scope |
| Persist `/saison/.../event/...` | Out of scope |
| Persist `/troupes`, `/compte`, admin | Out of scope |
| `troupeId → lastSeasonSlug` map | **17.23** |
| Change `MemberNav` labels or shell routes | Out of scope |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.19** | done | `/accueil` hub route exists |
| **17.22** | done | Shell + `NavigationEnd` hook point; optional tab-write not required |
| **2.9** | done | `lastVisitedSeason` + `PostLoginNavigationService` baseline |
| **12.5** | done | Post-login tests / FR49 |
| **17.21** | done | Independent — no API change |

### Code references (reuse)

| File | Role |
|------|------|
| [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts) | Pattern for localStorage helpers |
| [`post-login-navigation.service.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts) | Entry URL resolution — **extend** |
| [`post-login-redirect-storage.ts`](../../apps/web/src/app/core/navigation/post-login-redirect-storage.ts) | Deep link priority (unchanged) |
| [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) | Shell route detection |
| [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | `saisonWorkspacePath(slug)` |
| [`2-9-post-login-et-derniere-ligue-visitee-v1-parity.md`](./2-9-post-login-et-derniere-ligue-visitee-v1-parity.md) | Original post-login story |

### Suggested implementation sketch

```typescript
// post-login-navigation.service.ts (conceptual)
async resolveAuthenticatedEntryUrl(): Promise<PostLoginNavigationTarget> {
  const pending = getPendingPostLoginRedirect()
  if (pending && isValidInternalRedirectPath(pending)) return pending
  if (pending) clearPendingPostLoginRedirect()

  const entryPath = getLastMemberEntryPath()
  if (entryPath) {
    const target = await this.resolveMemberEntryPath(entryPath)
    if (target) return target
  }

  // existing lastVisitedSeason block unchanged
}
```

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- `lastMemberEntryPath` (clé V2) : `/accueil`, `/agenda`, `/saison/:slug`, `/membre/:slug` (pathname seul).
- Post-login : deep link > `lastMemberEntryPath` (revalidation saison + slug membre) > `lastVisitedSeason` > `/agenda`.
- Écriture : `MemberShell` (`NavigationEnd`) + `SeasonHome` (resolve OK) ; pas d’écrasement pour `/membre` d’un autre utilisateur.

### File List

- `apps/web/src/app/core/navigation/last-member-entry-path-storage.ts`
- `apps/web/src/app/core/navigation/last-member-entry-path-storage.spec.ts`
- `apps/web/src/app/core/navigation/post-login-navigation.service.ts`
- `apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts`
- `apps/web/src/app/layout/member-shell/member-shell.ts`
- `apps/web/src/app/layout/member-shell/member-shell.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `_bmad-output/planning-artifacts/ux-hub-a-faire.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-27 : Story créée via `/bmad-create-story` (17.20).
- 2026-05-27 : Implémentation `/bmad-dev-story` 17.20.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR49 / UX-DR13)
- [x] Section **Material 3** = **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` mentionné (AC 12)

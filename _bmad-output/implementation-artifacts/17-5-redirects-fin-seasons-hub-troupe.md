# Story 17.5: Redirects and end of `/seasons` as hub

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **connected member**,
I want **legacy URLs and entry points** (`/seasons`, `/ligue/*`) to land on the **troupe-first navigation** (`/troupes`, `/saison/*`) and **no duplicate troupe·season chrome** on event detail,
so that **bookmarks, post-login paths, and the agenda** match ADR 0013 and Epic 17.1–17.4 without regressing deep links.

## Acceptance Criteria

1. **Given** a GET on `/seasons` (with or without query string), **when** the router resolves, **then** the browser URL becomes **`/troupes`** with **`replaceUrl: true`** (preserve harmless query params if present; optional `scope=mine` is **not required** unless product adds filtering — default redirect is plain `/troupes`). [Source: epics 17.5; ADR 0013 §1 migration]
2. **Given** a GET on `/ligue/:slug` or any nested `/ligue/:slug/*` path (`admin/membres`, `admin/participants`, `event/:eventId`), **when** the router resolves, **then** the URL redirects to the **same path under `/saison/:slug`** with **`replaceUrl: true`** and **identical route params** (slug, eventId). [Source: epics 17.5; Story 12.6 alias; ADR 0013 legacy aliases]
3. **Given** `UserAgenda` secondary actions, **when** the user taps **Mes troupes**, **then** navigation targets **`/troupes`** (not `/seasons`). [Source: epics 17.5; 17.3 deferred item]
4. **Given** event detail with `app-context-breadcrumb` active (desktop and mobile rules from 17.1), **when** the spectacle loads, **then** **`app-event-context-strip` is not rendered** — no duplicate troupe·saison line under the header; mobile title/when block in `event-detail__mobile-context` **remains** (season/event titles not in breadcrumb on mobile). [Source: epics 17.5; ADR 0013 §2 remove strip; deferred-work 17.1]
5. **Given** all in-app links and programmatic navigations that still target **`/seasons`** or **`/ligue/...`** for **new** UX (not legacy redirect tests), **when** updated in this story, **then** they use **`troupesListPath()`**, **`troupeHubPath()`**, or **`saisonWorkspacePath()`** / **`saisonAdmin*Path()`** from `troupe-routes.ts` (and event paths under `/saison/:slug/event/:id`). [Source: PLAN.md 17.5; codebase audit]
6. **Given** post-login default season resolution (`PostLoginNavigationService`), **when** last-visited slug resolves, **then** navigation uses **`saisonWorkspacePath(slug)`** (canonical **`/saison/`**), not **`leagueWorkspacePath`**. Pending deep links **`/ligue/...`** still work via route redirects (AC2). [Source: ADR 0013 §1 canonical season workspace]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass; **`app.routes.spec.ts`** asserts redirects (URL after navigation), and **event-detail** specs no longer expect `.event-context-strip`. [Source: repo norms]

## Tasks / Subtasks

- [ ] **Route redirects in `app.routes.ts`** (AC: 1, 2)
  - [ ] Replace `{ path: 'seasons', component: SeasonsList }` with redirect to `/troupes` (function `redirectTo` like existing `/troupe/:troupeSlug/admin/membres` pattern).
  - [ ] Replace each `{ path: 'ligue/...', component: ... }` with **`redirectTo`** to matching `/saison/...` (preserve `:slug`, `:eventId` params).
  - [ ] Keep **`/saison/*`** routes unchanged as canonical targets.
  - [ ] Do **not** remove `seasons-list/` folder in this story — component may stay for a later admin cleanup slice; it simply loses the public `/seasons` route.

- [ ] **Update entry-point links** (AC: 3, 5)
  - [ ] `user-agenda.html`: **Mes troupes** → `routerLink` `/troupes` (or `troupesListPath()` in TS if template uses helper).
  - [ ] `account-placeholder.html`: **Voir les saisons** / **Retour aux saisons** → `/troupes` (copy may stay “saisons” or shift to “troupes” — prefer **Mes troupes** / **Troupes** for consistency).
  - [ ] `home-signed-in.html`: **Saisons** button → `/troupes`.
  - [ ] `admin-membres.html` + `admin-membres.ts`: back link and all `router.navigate(['/seasons'])` → `troupesListPath()` or `troupeHubPath(slug)` when troupe context known.
  - [ ] Optional (recommended): `user-agenda` empty state — enable **Découvrir les troupes** → `/troupes` with `fragment="decouvrir"` (17.3 left button `disabled`).

- [ ] **Canonical navigation helpers usage** (AC: 5, 6)
  - [ ] `post-login-navigation.service.ts`: return `saisonWorkspacePath(slug)` instead of `leagueWorkspacePath(slug)`; update spec.
  - [ ] Grep `leagueWorkspacePath` / `['/ligue'` in `apps/web` — update **user-facing navigations** (`user-agenda.ts` event row click, `seasons-list.ts` card open if still referenced, `admin-participants`, `member-profile-dialog`, `event-detail.ts` error fallbacks) to **`saisonWorkspacePath`** / **`['/saison', slug, 'event', id]`**.
  - [ ] **Keep** `league-routes.ts` and helpers for redirect tests and any remaining legacy href expectations until tests are migrated — or deprecate with comments “legacy prefix; routes redirect to saison”.

- [ ] **Remove `event-context-strip`** (AC: 4)
  - [ ] Remove `<app-event-context-strip>` block and imports from `event-detail.ts` / `event-detail.html`.
  - [ ] Remove `showContextStrip`, `showTroupeAdminLink` signals and related setup in `event-detail.ts` if only used by strip.
  - [ ] Delete `event-context-strip.ts|html|scss` (only used here).
  - [ ] Update `event-detail.spec.ts`: strip assertions → breadcrumb-only; remove admin troupe link tests pointing at `/troupe/.../admin/membres`.
  - [ ] Confirm `app-event-detail-header` + `ContextBreadcrumb` still expose troupe hub link via `troupeHubPath` (17.1) — **no** strip replacement needed.

- [ ] **Tests & build** (AC: 7)
  - [ ] Extend `app.routes.spec.ts`: `/seasons` → `/troupes`; `/ligue/x` → `/saison/x`; nested admin/event paths.
  - [ ] Update `post-login-navigation.service.spec.ts`, `user-agenda.spec.ts` navigation expectations to `/saison/...` where applicable.
  - [ ] Update `admin-membres.spec.ts` redirect expectations away from `/seasons`.
  - [ ] Run web unit tests + build.

## Dev Notes

### Product and UX rules

- **Closes navigation phase 17.1–17.5** per PLAN.md DoD: no member hub at `/seasons`; troupe link on events via breadcrumb → hub; agenda **Mes troupes** → `/troupes`.
- **Vocabulary:** UI **Saison** (not Ligue) on new links; code may keep `league*` names in API/types.
- **`/seasons` redirect** retires the old **mixed** hub (troupe switcher + season grid + admin). **17.4 hub** + **`/troupes`** list replace member flows. Season **edit/delete/archive** kebab actions that lived only on `seasons-list` are **not** re-homed in 17.5 — acceptable gap unless PO requests a follow-up (saison workspace gear / future story).
- **Breadcrumb on `/troupes`:** Already implemented in 17.3 (page header, not `app-context-breadcrumb`) — no extra work unless copy audit requested.

### Explicit non-goals (scope guard)

- Do **not** implement **17.11** admin pages breadcrumb (LIMIT-002).
- Do **not** implement **17.6** event slug routes or UUID→slug redirects.
- Do **not** delete `seasons-list` component tree (only remove public route).
- Do **not** change API paths (`/v1/seasons/...`).
- Do **not** rename `league-routes.ts` file or API field names.
- Do **not** mass-rename UI strings “ligue” → “saison” on agenda filters (separate copy slice; optional).
- Do **not** add server-side HTTP redirects (Angular client routes only).

### Route redirect patterns (Angular)

Existing pattern in `app.routes.ts`:

```typescript
{
  path: 'troupe/:troupeSlug/admin/membres',
  redirectTo: (route) => `/troupes/${route.params['troupeSlug']}/admin/membres`,
},
```

Apply the same for:

| Legacy | Target |
|--------|--------|
| `seasons` | `troupes` |
| `ligue/:slug` | `saison/:slug` |
| `ligue/:slug/admin/membres` | `saison/:slug/admin/membres` |
| `ligue/:slug/admin/participants` | `saison/:slug/admin/participants` |
| `ligue/:slug/event/:eventId` | `saison/:slug/event/:eventId` |

`post-login-redirect-storage.ts` should **continue** accepting `/ligue/...` paths as valid internal redirects (they will normalize via router).

### Files to touch (expected)

| Area | Files |
|------|--------|
| Routes | `apps/web/src/app/app.routes.ts`, `app.routes.spec.ts` |
| Agenda / home / account | `user-agenda.html` (+ optional `.ts` empty CTA), `home-signed-in.html`, `account-placeholder.html` |
| Admin fallback nav | `admin-membres.ts`, `admin-membres.html`, `admin-membres.spec.ts` |
| Post-login | `post-login-navigation.service.ts`, `.spec.ts` |
| Event detail | `event-detail.ts`, `event-detail.html`, `event-detail.spec.ts`; **delete** `event-context-strip.*` |
| Optional nav cleanup | `user-agenda.ts`, `seasons-list.ts`, `admin-participants.ts`, `member-profile-dialog.ts`, `event-detail.ts` (grep `ligue`) |

### Previous story intelligence (17.1–17.4)

- **17.1:** Shipped `app-context-breadcrumb`; deferred strip removal to **17.5** (`deferred-work.md`). Mobile event header shows title under breadcrumb — **keep** `event-detail__mobile-context`.
- **17.2:** Admin gear not in global header — unchanged.
- **17.3:** Explicitly **did not** redirect `/seasons` or change agenda link — **17.5 owns both**. `#decouvrir` anchor on `/troupes` ready for agenda empty CTA.
- **17.4:** Hub at `/troupes/:slug`; `troupeAdminMembresPath` canonical; legacy `/troupe/.../admin/membres` redirect exists. **Do not** break `troupeHubPath` breadcrumb targets.

### Known follow-ups (document only)

- **`seasons-list` unreachable** after redirect — season-level CRUD kebab only on that page today; track if admins need it before deleting component.
- **Story 17.11** after 17.5 for admin Participants/Membres breadcrumb.
- **Agenda filter labels** still say “ligue” — cosmetic; FR48 scope.

### Git intelligence

Recent Epic 17 commits to mirror:

- `f1a1f63` — user agenda styling (touch only if empty-state CTA enabled).
- `b0ac951` — `/troupes` list.
- `d499911` — breadcrumb + `troupe-routes.ts` + initial stub (strip still present).

Patterns: standalone components, Vitest + `TestBed`, `redirectTo` functions in routes.

### Project Structure Notes

- **No backend changes.**
- **No OpenAPI changes.**
- Run: `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.5]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §1 routes, §2 remove strip]
- [Source: `PLAN.md` — Epic 17 table 17.5, DoD 17.1–17.5]
- [Source: `_bmad-output/implementation-artifacts/17-4-hub-troupes-slug.md` — non-goals deferred to 17.5]
- [Source: `_bmad-output/implementation-artifacts/17-3-page-troupes-mes-troupes-decouvrir.md`]
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md` — strip duplication]
- [Source: `_bmad-output/implementation-artifacts/17-11-breadcrumb-pages-admin-back-office.md` — run after 17.5]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

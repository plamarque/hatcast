# Story 17.2: Scope administration menu (gear + dropdown)

Status: done

<!-- Course correction 2026-05-25: scope admin bar → gear menu — SCP + ux-design-scope-admin-menu-epic17.md -->

## Story

As an **organizer or admin**,
I want to access **administration actions for the current scope** (troupe, saison, or spectacle) via a **gear icon** and **dropdown menu** integrated in the **view toolbar**,
so that **administration is not confused with context navigation** (breadcrumb row), **entries removed in Story 17.1 are restored**, and **no extra horizontal band** steals vertical space.

## Acceptance Criteria

1. **Given** `/troupes/:slug` (troupe hub or stub), **when** `TROUPE_ADMIN`, **then** gear menu with **Membres**; inline hero row, not full-width strip.
2. **Given** `/troupes/:slug`, **when** not `TROUPE_ADMIN`, **then** no admin gear.
3. **Given** `/saison/:slug`, **when** season admin rights, **then** gear in **season toolbar** (right of Agenda | Historique) with Participants / Organisateur·ices.
4. **Given** season workspace, **when** no rights, **then** no gear.
5. **Given** event detail, **when** applicable admin rights, **then** unified gear on **Infos** tab (top-right).
6. **Given** event-only participant admin, **then** menu with **Participants du spectacle** (dialog).
7. **Given** breadcrumb + account row, **then** **no ⚙** there.
8. **Given** a11y, **then** scope in `aria-label`, explicit menu labels, focus visible.
9. **Given** tests + build, **then** pass (except known pre-existing `event-dispos-tab` flake).

## Tasks / Subtasks

- [x] Admin route helpers + permission gating
- [x] **`app-scope-admin-menu`** — gear + `mat-menu`
- [x] Season: gear in `SeasonViewToolbar` right cluster
- [x] Event: unified gear on Infos (Modifier/Archiver + admin entries); no ⋮ kebab; not on other tabs
- [x] Troupe stub: gear in hero row
- [x] Remove `scope-admin-bar` strip
- [x] Tests updated; build OK
- [x] UX spec: `ux-design-scope-admin-menu-epic17.md`

## Dev Agent Record

### Completion Notes List

- SCP approved 2026-05-25; UX spec `ux-design-scope-admin-menu-epic17.md`.
- Implemented `app-scope-admin-menu` (saison toolbar, troupe hub, spectacle Infos).
- PO closure 2026-05-25: follow-up admin page headers → **LIMIT-002** (not part of 17.2).

### Follow-up (out of scope)

| ID | Topic |
|----|--------|
| LIMIT-002 | Breadcrumb + retirer chevron sur admin Participants / Membres |

### File List

- `apps/web/src/app/shared/scope-admin-menu/*`
- `apps/web/src/app/pages/season-home/season-view-toolbar.*`
- `apps/web/src/app/pages/season-home/season-home.*`
- `apps/web/src/app/pages/event-detail/event-detail.*`
- `apps/web/src/app/pages/event-detail/event-infos-tab.*`
- `apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.*`
- `apps/web/src/app/core/navigation/troupe-routes.ts` (+ spec)
- `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md`

### Change Log

- 2026-05-25: Story closed (done). LIMIT-002 captured for admin page chrome alignment.
- 2026-05-25: Event Infos — single gear (⋮ + scope admin merged).
- 2026-05-25: Correct Course + menu implementation (replaces bar).

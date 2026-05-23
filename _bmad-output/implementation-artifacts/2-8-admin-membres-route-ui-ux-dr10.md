# Story 2.8: Admin Membres Route UI (UX-DR10)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Correct Course 2026-05-23 — Replaces modal UI from Stories 2.2 / 2.3 per approved ux-design-specification.md -->

## Story

As a **troupe administrator or authorized season organizer**,  
I want **one admin route** for troupe members and season organizers,  
so that **day-to-day admin and V1 migration** follow the approved compact UX (search, toolbar CSV, tabs) instead of separate wide modals.

## Acceptance Criteria

1. **Given** the user has `canManageMembers` and/or `canManageSeasonOrganizers` for the current season, **when** they open `/saison/:slug/admin/membres`, **then** the screen matches [ux-design-specification.md](../planning-artifacts/ux-design-specification.md): header chrome (back → agenda, H1 = active tab label, season + troupe subtitle), permitted tab(s), toolbar, compact list, add-via-modal only — **UX-DR10**, **NFR-S2**.
2. **Given** the user has **no** people-admin permission, **when** they navigate to the route (direct URL or bookmark), **then** they are redirected to `/saison/:slug` with snack *« Accès non autorisé »* (or equivalent French copy used elsewhere) — **NFR-S2**.
3. **Given** query `?onglet=organisateurs`, **when** the user has `canManageSeasonOrganizers`, **then** the **Organisateur·ices** tab is active; default (no query or `?onglet=membres`) opens **Membres** when permitted. If only one tab is permitted, **hide the tab bar** entirely — spec IA locked.
4. **Given** the **Membres** tab, **when** the admin uses the screen, **then**: toolbar has search (client-side, debounce 150ms, displayName OR email, active tab only), **Ajouter** (modal), **Exporter**, **Importer ▾** (menu: utilisateurs | membres); *Afficher les inactifs* toggle above list (default off); compact rows with avatar initial, inline display-name edit (Enter/blur save, Esc cancel), read-only email, role chip+menu auto-save, `mat-slide-toggle` Actif auto-save; inactive rows at 60% opacity when shown; **no** `createdAt`/`updatedAt` in list; **Nommer organisateur·ice de saison** row action when `canManageSeasonOrganizers` and target not already season organizer — **FR7**, **FR42** UI.
5. **Given** the **Organisateur·ices** tab, **when** the manager uses the screen, **then**: same search pattern; **Ajouter** opens modal (email + autocomplete from active troupe members); **Retirer** with confirm dialog; help line under tab; CSV toolbar controls **hidden**; event organizers remain out of scope (help text pointer only) — Story **3.5**.
6. **Given** a role or active toggle change, **when** the API returns **409** (last admin) or network error, **then** optimistic UI reverts and snack shows DOMAIN-aligned French message (*« La troupe doit conserver au moins un administrateur actif. »* / *« Enregistrement impossible »*) — Story **2.2** AC5 behaviour preserved.
7. **Given** CSV import completes, **when** results are shown, **then** a **MatDialog** (*« Résultat de l'import »*) displays summary + scrollable per-row table; **Fermer** refreshes member list if any row succeeded — Story **2.3** UI contract.
8. **Given** export is triggered, **when** download succeeds, **then** browser receives CSV blob and optional snack *« Export téléchargé »* — reuse `TroupeApiService.exportMembersCsv`.
9. **Given** season settings menu (⚙), **when** the user has any people-admin permission, **then** a **single** menu item **Membres** navigates to this route (remove separate **Organisateur·ices** entry and remove `openMembersAdmin` / `openSeasonOrganizers` dialog calls from `season-home.ts`).
10. **Given** this story is complete, **when** tests run, **then** route guard, tab visibility, toolbar actions, auto-save error paths, and migrated flows from dialog specs pass; `npm run test -w @hatcast/web` and `npm run build -w @hatcast/web` succeed; **no backend API changes** unless a blocking bug is found (document in story notes, do not expand scope).

## Tasks / Subtasks

- [x] **Routing and page shell** (AC: 1, 2, 3, 9)
  - [x] Add route `{ path: 'saison/:slug/admin/membres', component: AdminMembresPage }` in `apps/web/src/app/app.routes.ts`.
  - [x] Create `apps/web/src/app/pages/admin-membres/` page component following `EventDetailPlaceholder` session + slug resolution pattern (`SeasonApiService`, `TroupeApiService`, `OrganizerApiService.mySeasonPermissions`).
  - [x] On load: resolve season by slug → `seasonId`, `troupeId`, titles for subtitle; redirect unauthorized users to agenda + snack.
  - [x] Header: back `routerLink` to `/saison/:slug`; H1 = active tab; muted subtitle (season title + troupe name); reuse user menu pattern from season header if practical.
  - [x] Tab bar with `mat-tab-group` or equivalent; sync `?onglet=` query param; hide tab bar when only one tab permitted.

- [x] **Membres tab** (AC: 4, 6, 7, 8)
  - [x] Extract member list/add/update/CSV logic from `troupe-members-dialog.ts` into tab component or shared service — **do not duplicate API client code** (`TroupeApiService` already complete).
  - [x] Load members with `listMembers(troupeId, 0, 100)` for client-side search per spec (increase from dialog's 25 if needed).
  - [x] Implement toolbar layout (desktop one row / mobile two rows per spec).
  - [x] `Afficher les inactifs` slide-toggle or checkbox between toolbar and list.
  - [x] Row UI: compact list (~52px min height), inline name edit, role `mat-chip` + menu, `mat-slide-toggle`, last-admin disabled controls + tooltip.
  - [x] **Nommer orga saison**: call `OrganizerApiService.addSeasonOrganizer` when permitted; refresh organizer ids set for row action visibility.
  - [x] **Ajouter membre** modal (`MatDialog`): email, optional displayName, baseline role (default Membre); focus trap (NFR-A1).
  - [x] **Importer ▾** `mat-menu`: hidden file inputs for users CSV + members CSV; on complete open **ImportResultsDialog** (extract table template from dialog).
  - [x] **Exporter**: trigger download via existing blob helper pattern from dialog.
  - [x] Collapsible **Aide migration V1** accordion below list (default collapsed) — move help copy from dialog inline section.

- [x] **Organisateur·ices tab** (AC: 5)
  - [x] Extract logic from `season-organizers-dialog.ts`: list, add, remove with confirm.
  - [x] Add modal with email field + autocomplete filtered from loaded active troupe members.
  - [x] Help line: *« Peut préparer les tirages et annoncer les compositions. Pas un administrateur de troupe. »*
  - [x] Hide CSV toolbar controls on this tab.

- [x] **Settings menu integration** (AC: 9)
  - [x] Update `season-header.html`: single **Membres** item → `routerLink` `/saison/{{slug}}/admin/membres` (pass slug via input or build link in parent).
  - [x] Remove `membersClick` / `organizersClick` outputs and handlers in `season-header.ts`, `season-home.ts`, `season-home.html`.
  - [x] Keep `canManageSettings` computed as `canManageMembers || canManageSeasonOrganizers` (unchanged semantics).

- [x] **Cleanup legacy dialogs** (AC: 9, 10)
  - [x] Remove dialog imports and `MatDialog.open` calls for members/organizers from `season-home.ts`.
  - [x] Delete `troupe-members-dialog.ts`, `season-organizers-dialog.ts` and their spec files **after** migrating tests to new page/modals — or keep thin deprecated wrappers only if needed for incremental PR (prefer delete in same story).
  - [x] Do **not** modify `legacy/`.

- [x] **Tests** (AC: 10)
  - [x] Page spec: unauthorized redirect; single-tab vs dual-tab visibility; query param tab selection.
  - [x] Membres tab: search filter, inactive filter, auto-save revert on error (mock 409), export/import menu triggers API mocks.
  - [x] Organisateurs tab: add/remove flows, CSV buttons absent.
  - [x] Season header: one menu item, router link present.
  - [x] Port critical cases from `troupe-members-dialog.spec.ts` and `season-organizers-dialog.spec.ts`.
  - [x] Run `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.

### Review Findings

- [x] [Review][Defer] Multi-troupe route resolution uses the first troupe — `AdminMembres.loadPage()` resolves `/saison/:slug/admin/membres` through `listMyTroupes()[0]` before `getSeasonBySlug`, matching the existing season-home pattern but risking "Saison introuvable" or wrong-troupe resolution for multi-troupe users; deferred to Story 2.4 because multi-troupe switching is explicitly out of scope for Story 2.8. [`apps/web/src/app/pages/admin-membres/admin-membres.ts`:144]
- [x] [Review][Patch] CSV import file inputs live inside `mat-menu` labels and may be destroyed before file `change` fires; move hidden file inputs outside the menu and trigger them from menu buttons. [`apps/web/src/app/pages/admin-membres/membres-tab.html`:22]
- [x] [Review][Patch] Successful member import refresh depends on the close button result; Escape/backdrop closes skip the required list refresh after a successful import. [`apps/web/src/app/pages/admin-membres/membres-tab.ts`:283]
- [x] [Review][Patch] Inline display-name edit can double-save on Enter then blur, sending duplicate PATCH requests and racing reload/revert handling. [`apps/web/src/app/pages/admin-membres/membres-tab.html`:74]
- [x] [Review][Patch] `membersChanged` is emitted after member mutations but not bound by the parent page, leaving permissions stale after self-demote/deactivate until a full refresh. [`apps/web/src/app/pages/admin-membres/admin-membres.html`:44]
- [x] [Review][Patch] Season organizer lookup failures leave the organizer id set empty, so the UI can offer "Nommer organisateur·ice" for already delegated users during API/network errors. [`apps/web/src/app/pages/admin-membres/membres-tab.ts`:366]
- [x] [Review][Patch] Search fields miss the locked clear (×) affordance from UX-DR10. [`apps/web/src/app/pages/admin-membres/membres-tab.html`:3]
- [x] [Review][Patch] Member role control is rendered as a stroked button instead of the locked `mat-chip` + menu pattern. [`apps/web/src/app/pages/admin-membres/membres-tab.html`:99]
- [x] [Review][Patch] Tests do not actually cover CSV imports, organizer remove confirmation, or inactive-member hiding (the inactive test fixture has no inactive member). [`apps/web/src/app/pages/admin-membres/membres-tab.spec.ts`:79]

## Dev Notes

### Scope boundaries

- **In scope:** Angular UI migration to UX-DR10 route; small presentational modals (add member, add organizer, import results); navigation/menu wiring; tests.
- **Out of scope:** Backend/API/OpenAPI changes; Story 3.8 Participants screen; event organizers UI (stays on event settings); new CSV contract; multi-troupe switcher (Story 2.4).

### Normative UX source

Primary spec: [`_bmad-output/planning-artifacts/ux-design-specification.md`](../planning-artifacts/ux-design-specification.md) — **approved 2026-05-23**, status locked.

Mirror: [`ux-design-hatcast-v2.md` § Admin Membres](../planning-artifacts/ux-design-hatcast-v2.md#screen-admin-membres).

Correct Course record: [`sprint-change-proposal-2026-05-23-ux-dr10.md`](../planning-artifacts/sprint-change-proposal-2026-05-23-ux-dr10.md).

### Migration map (must implement)

| Current | Target |
|---------|--------|
| Settings → Membres + Organisateur·ices (2 items) | Settings → **Membres** (1 item → route) |
| `TroupeMembersDialog` | Route + Membres tab |
| `SeasonOrganizersDialog` | Route + Organisateur·ices tab |
| Inline add + CSV in dialog body | Toolbar + modals |
| `mat-select` status | `mat-slide-toggle` Actif |
| Dates in list | Hidden |
| Verbose dialog layout | Compact list rows |

### Permission matrix (enforce in UI; server remains authority)

| Capability | Membres tab | Organisateur·ices tab | CSV buttons |
|------------|-------------|------------------------|-------------|
| `canManageMembers` | Full | — | Visible on Membres |
| `canManageSeasonOrganizers` only | — | Full | Hidden |
| Both | Full | Full | Visible on Membres |
| Neither | Route blocked | Route blocked | — |

Load flags via `OrganizerApiService.mySeasonPermissions(seasonId)` — same as `season-home.ts`.

### Reuse — do not reinvent

| Need | Location |
|------|----------|
| Member CRUD + CSV API | `apps/web/src/app/core/troupes/troupe-api.service.ts` |
| Organizer API | `apps/web/src/app/core/permissions/organizer-api.service.ts` |
| Confirm dialog | `apps/web/src/app/pages/seasons-list/confirm-dialog.ts` |
| Route loading pattern | `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts` |
| Season slug → season | `SeasonApiService` (same as season-home) |
| CSRF on mutations | `csrfHeaders()` via services |
| Member dialog logic to extract | `apps/web/src/app/pages/season-home/troupe-members-dialog.ts` (~578 lines) |
| Organizer dialog logic | `apps/web/src/app/pages/season-home/season-organizers-dialog.ts` |
| Settings header | `apps/web/src/app/pages/season-home/season-header.html` |

### Architecture guardrails

- Angular **21.2.x** + Material **21.2.x**; standalone components; signals where existing pages use them.
- French UI copy throughout.
- Material defaults + existing SCSS tokens — no Tailwind as primary surface (**UX-DR11**).
- Security: hiding UI is not the boundary; route must still handle 403 from API gracefully.
- Sort members: active first, then alphabetical by display name (client sort after fetch).

### Suggested file structure

```
apps/web/src/app/pages/admin-membres/
  admin-membres.ts          # page shell, tabs, permissions, route params
  admin-membres.html
  admin-membres.scss
  admin-membres.spec.ts
  membres-tab.ts            # or inline in page if small enough
  organisateurs-tab.ts
  add-member-dialog.ts
  add-organizer-dialog.ts
  import-results-dialog.ts  # shared for user + member import results
```

Adjust naming to match repo conventions after reading neighbouring pages; flat folder under `pages/` is acceptable.

### Previous story intelligence

**Story 2.2 (done):** Backend member admin complete. UI was shipped as dialog intentionally; Correct Course superseded with Story 2.8. Last-admin guard, baseline roles `MEMBER` | `TROUPE_ADMIN`, soft deactivate via DELETE. Review deferred Problem Details format — keep existing error handling patterns.

**Story 2.3 (done):** CSV API + dialog UI done. Import results table columns: ligne, email, résultat, message. User CSV before member CSV for V1 migration — move to collapsed accordion + Importer ▾ menu.

**Story 3.5 (review):** Retest organizer add/remove on new tab after this story. `SeasonOrganizersDialog` removal must not break event-level organizer management in `event-form-dialog` (different surface).

### Git intelligence

Recent pattern commits:

- `030cb2f feat(troupe): Add member admin and baseline roles` — API + dialog
- `5f32271 feat(troupe): Add CSV member import and export` — CSV in dialog
- `1925e19 feat(organizers): Add delegation` — organizer dialog pattern

Follow same `feat(web):` scope for UI-only migration.

### Testing commands

- Focused: `npm run test -w @hatcast/web -- --watch=false admin-membres`
- Full web: `npm run test -w @hatcast/web -- --watch=false`
- Build: `npm run build -w @hatcast/web`
- No API test changes expected.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-28--route-admin-membres-ux-dr10`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md`]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-23-ux-dr10.md`]
- [Source: `_bmad-output/implementation-artifacts/2-2-administration-des-membres-et-roles-de-base.md`]
- [Source: `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md`]
- [Source: `_bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md`]
- [Source: `apps/web/src/app/app.routes.ts`]
- [Source: `DOMAIN.md` — baseline roles vs organizer delegation]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- MatSnackBar mock not intercepted when `MatSnackBarModule` imported on page; unauthorized redirect verified via `Router.navigate` in tests.

### Completion Notes List

- Migrated `TroupeMembersDialog` and `SeasonOrganizersDialog` to route `/saison/:slug/admin/membres` with UX-DR10 compact layout (tabs, toolbar, modals).
- Membres tab: client search (150 ms debounce), inactive filter, inline name edit, auto-save role/toggle with optimistic revert on 409, CSV import/export, last-admin guard, nommer orga saison.
- Settings menu consolidated to single **Membres** link; legacy dialog files removed.
- 81 web tests pass; build succeeds. No backend changes.
- Code review patches applied: CSV input robustness, import refresh, inline edit double-save guard, parent permission refresh, organizer lookup failure handling, search clear buttons, role chip menu, and expanded migrated-flow tests.

### File List

- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.html`
- `apps/web/src/app/pages/admin-membres/admin-membres.scss`
- `apps/web/src/app/pages/admin-membres/admin-membres.spec.ts`
- `apps/web/src/app/pages/admin-membres/membres-tab.ts`
- `apps/web/src/app/pages/admin-membres/membres-tab.html`
- `apps/web/src/app/pages/admin-membres/membres-tab.scss`
- `apps/web/src/app/pages/admin-membres/membres-tab.spec.ts`
- `apps/web/src/app/pages/admin-membres/organisateurs-tab.ts`
- `apps/web/src/app/pages/admin-membres/organisateurs-tab.html`
- `apps/web/src/app/pages/admin-membres/organisateurs-tab.scss`
- `apps/web/src/app/pages/admin-membres/organisateurs-tab.spec.ts`
- `apps/web/src/app/pages/admin-membres/add-member-dialog.ts`
- `apps/web/src/app/pages/admin-membres/add-organizer-dialog.ts`
- `apps/web/src/app/pages/admin-membres/import-results-dialog.ts`
- `apps/web/src/app/pages/admin-membres/import-csv.helpers.ts`
- `apps/web/src/app/pages/season-home/season-header.ts`
- `apps/web/src/app/pages/season-home/season-header.html`
- `apps/web/src/app/pages/season-home/season-header.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- Deleted: `apps/web/src/app/pages/season-home/troupe-members-dialog.ts`
- Deleted: `apps/web/src/app/pages/season-home/troupe-members-dialog.spec.ts`
- Deleted: `apps/web/src/app/pages/season-home/season-organizers-dialog.ts`
- Deleted: `apps/web/src/app/pages/season-home/season-organizers-dialog.spec.ts`

### Change Log

- 2026-05-23: Story 2.8 — Admin Membres route UI (UX-DR10); replaced wide member/organizer modals with tabbed admin page.
- 2026-05-23: Code review — applied 8 patch findings, deferred multi-troupe route resolution to Story 2.4, story marked done.

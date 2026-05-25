# Story 17.15: Infos tab — event organizers; remove participants from form

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — UX backlog #4–#5)

## Story

As an **organizer** with rights on a spectacle,
I want **event organizers managed from the Infos tab** and **event-only participants managed outside the planning dialog**,
so that **create/edit stays focused on scheduling** and admin flows are not duplicated in `EventFormDialog`.

## Acceptance Criteria

1. **Given** event detail **Infos** tab and organizer-management rights, **when** the tab loads, **then** an **Organisateur·ices** section shows assigned organizers as **chips** (names), with **inline remove** when permitted and an **« Ajouter »** control that opens a **dedicated add-only Material dialog** (autocomplete membres troupe ou email). Pattern aligné sur la section « Groupe de spectacles » (17.8). [Source: epics 17.15 AC1 — amendé review 2026-05-25 ; ux-backlog #4]
2. **Given** organizer management on Infos, **when** the user adds via the dialog or removes via chip, **then** APIs `listEventOrganizers`, `addEventOrganizer`, `removeEventOrganizer` are used with French status messages (404 → « Utilisateur introuvable. », snackbars sur l’onglet Infos). Add = modale ; remove = chip sur l’onglet. [Source: review 2026-05-25 — remplace bloc monolithique `EventFormDialog`]
3. **Given** `!canManageEventOrganizers` for this event, **when** Infos loads, **then** organizers section is hidden or read-only summary only (no CTA) — mirror **17.14** read-only pattern for type/roles. [Source: `event-infos-tab` + `canManageEvents` pattern]
4. **Given** `EventFormDialog` (create **or** edit), **when** opened, **then** **no** « Organisateur·ices du spectacle » section. [Source: epics 17.15 AC2]
5. **Given** `EventFormDialog` (create **or** edit), **when** opened, **then** **no** « Participants du spectacle » section. [Source: epics 17.15 AC2; ux-backlog #5]
6. **Given** scope admin menu on Infos, **when** user with event-only participant rights chooses **Participants du spectacle**, **then** a **dedicated participants dialog** opens (same CRUD as today’s form section) — **not** `EventFormDialog`. [Source: epics 17.15 AC3; `event-detail.ts` `openEventParticipantsAdmin`]
7. **Given** scope admin menu, **when** user with event-only organizer rights chooses **Organisateur·ices du spectacle**, **then** the **same organizers dialog** as Infos CTA opens — **not** `EventFormDialog`. [Source: `event-detail.ts` `openEventOrganizersAdmin`]
8. **Given** **Modifier** from admin menu (`openEdit`), **when** dialog opens, **then** it passes **no** `canManageEventOrganizers` / `canManageEventParticipants` flags and shows **only** planning fields (title, date/time, location, description). [Source: SCP DoD; **17.14** slim form]
9. **Given** season agenda **edit** from `season-home`, **when** dialog opens, **then** same slim form — no organizer/participant flags in `EventFormDialogData`. [Source: `season-home.ts` L529–537]
10. **Given** tests, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** new dialogs + Infos specs pass; form/dialog regressions guard removed sections; **17.14** / **17.13** / **17.8** blocks stay green. [Source: repo norms]
11. **Given** story **3.8** trace, **when** docs updated, **then** AC11 in [`3-8-rosters-participants-saison-et-evenement.md`](3-8-rosters-participants-saison-et-evenement.md) is marked **superseded** by **17.15** for event-form placement (admin menu + dedicated dialog remain). [Source: SCP; ux-backlog #5]

## Tasks / Subtasks

- [x] **Extract `EventOrganizersDialog`** (AC: 1, 2, 7)
  - [x] Add `apps/web/src/app/pages/event-detail/event-organizers-dialog.ts` (+ `.html`, `.scss`, `.spec.ts`).
  - [x] Move organizer UI from [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html) L60–117 and logic from [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) L134–242.
  - [x] Dialog data: `{ seasonId: string; eventId: string }`; close value: `boolean` (`true` if list changed) or `undefined` (cancel) — mirror admin-menu reload pattern in `event-detail`.
  - [x] Reuse `.organizers-section` styles from [`event-form-dialog.scss`](../../apps/web/src/app/pages/season-home/event-form-dialog.scss) L69+ (move to dialog SCSS or shared partial under `event-detail/`).
  - [x] Title: « Organisateur·ices du spectacle »; keep help copy about composition rights without season-wide admin.

- [x] **Extract `EventParticipantsDialog`** (AC: 5, 6)
  - [x] Add `apps/web/src/app/pages/event-detail/event-participants-dialog.ts` (+ `.html`, `.scss`, `.spec.ts`).
  - [x] Move participant UI from `event-form-dialog.html` L120–181 and logic from `event-form-dialog.ts` L248–302.
  - [x] Dialog data: `{ seasonId: string; eventId: string }`; same close semantics as organizers dialog.
  - [x] APIs unchanged: `ParticipantApiService.listEventParticipants`, `createEventParticipant`, `removeEventParticipant`.

- [x] **Infos tab — organizers read + CTA** (AC: 1, 3)
  - [x] Extend [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) / `.html` / `.scss`:
    - New input: `canManageEventOrganizers = input(false)`.
    - On init/effect: `listEventOrganizers(seasonId, eventId)` for summary display.
    - Section **Organisateur·ices** after **Format et besoins**, before **Groupe de spectacles** (equity).
    - Summary: e.g. « Aucun·e organisateur·ice dédié·e » or « 2 organisateur·ices : Alice, Bob… » (truncate long lists).
    - If `canManageEventOrganizers()`: `mat-stroked-button` or icon edit → `MatDialog.open(EventOrganizersDialog)`; on close `true`, reload organizers list (no `eventUpdated` unless product wants full event refresh — organizers are not on `EventResponse`).
  - [x] Wire from [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html):
    ```typescript
    [canManageEventOrganizers]="canManageEventOrganizersFor(ev.id)"
    ```
  - [x] Add `canManageEventOrganizersFor(eventId)` computed/helper on [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts):
    `perms.canManageEventOrganizers === true || perms.eventOrganizerFor.includes(eventId)`.

- [x] **Slim `EventFormDialog` + callers** (AC: 4, 5, 8, 9)
  - [x] Remove organizer/participant HTML blocks, state, methods, API injections from `event-form-dialog.ts`.
  - [x] Remove `canManageEventOrganizers?` and `canManageEventParticipants?` from `EventFormDialogData` (or stop using — delete fields).
  - [x] Update [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts):
    - `openEventOrganizersAdmin()` → `EventOrganizersDialog`.
    - `openEventParticipantsAdmin()` → `EventParticipantsDialog`.
    - `openEdit()` → drop organizer/participant flags from `data`.
  - [x] Update [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) edit open — remove `canManageEventOrganizers` / `canManageEventParticipants` from dialog `data`.

- [x] **Tests** (AC: 10)
  - [x] `event-organizers-dialog.spec.ts`: list on open; add with email; remove row; 404 → French message.
  - [x] `event-participants-dialog.spec.ts`: list; add name/email; remove; 403 message.
  - [x] Extend [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts): summary visible; CTA hidden without permission; opens organizers dialog.
  - [x] [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts):
    - Replace `EventFormDialog participants section` describe with regression: no « Organisateur·ices du spectacle », no « Participants du spectacle », no `listEventOrganizers` / `listEventParticipants` calls.
  - [x] [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts):
    - `openEventParticipantsAdmin` / `openEventOrganizersAdmin` open **new** dialog components (mock `MatDialog.open` class or `dialog.open` spy args), not `EventFormDialog`.

- [x] **Docs** (AC: 11)
  - [x] In [`3-8-rosters-participants-saison-et-evenement.md`](3-8-rosters-participants-saison-et-evenement.md): note AC11 **superseded** — event participant admin = route **17.16** (`AdminEventParticipants`), not `event-form-dialog` or dialog.

## Dev Notes

### Product and UX rules

- **Placement:** Event organizers → **Infos tab** + dedicated dialog (**17.15**). Event-only participants → **admin scope menu** + dedicated dialog only (**no** Infos section required by epics).
- **Planning dialog:** After **17.14**, form = title, date/time, location, description only. This story completes Epic 17 form polish DoD.
- **Permissions — organizers:**
  - Manage: `canManageEventOrganizers` (troupe/season admin) **or** `eventOrganizerFor` includes event id (event-scoped organizer).
  - Infos CTA only when manage rights; others may see empty/hidden section (decide: hide entire section vs read-only count — prefer **read-only summary** if list is non-sensitive, else hide when no rights and empty list).
- **Permissions — participants:** Unchanged matrix from **3.8** — `canManageEventParticipants` or `eventParticipantAdminFor`; season-wide admins use router link to `/saison/:slug/admin/participants` (unchanged).
- **French copy:** Keep strings from current form sections verbatim where possible.
- **Reload after dialog:** `event-detail` today calls `reloadEvent('Spectacle mis à jour.')` when form closes with `ok` — for organizer/participant dialogs use same snackbar only if data changed (`afterClosed() === true`), or always reload event (harmless) — prefer **reload only on change** to avoid flicker.

### Explicit non-goals (scope guard)

- Do **not** add event participants block to Infos tab (out of epics AC).
- Do **not** change season-level organizers UI ([`organisateurs-tab`](../../apps/web/src/app/pages/admin-membres/organisateurs-tab.ts)) or season participants admin page.
- Do **not** change backend organizer/participant APIs or permission matrix.
- Do **not** move type/roles, equity tag, slug, datetime (**17.8**, **17.12**, **17.13**, **17.14** done).
- Do **not** change `openEdit` planning payload or PATCH fields.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Dialog pattern | Mirror [`event-type-roles-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts) / [`event-equity-tag-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-equity-tag-dialog.ts): `MAT_DIALOG_DATA`, `MatDialogRef`, width `min(100vw - 2rem, 28rem)` |
| Organizers API | [`OrganizerApiService`](../../apps/web/src/app/core/permissions/organizer-api.service.ts) — POST body `{ email }`, 404 → « Utilisateur introuvable. » |
| Participants API | [`ParticipantApiService`](../../apps/web/src/app/core/participants/participant-api.service.ts) — `createEventParticipant` body `{ displayName, email? }` |
| Admin menu | [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) `eventAdminItems()` — keep labels and visibility rules; only swap `action` implementations |
| Infos inputs | Add `canManageEventOrganizers`; keep existing `canManageEvents`, `seasonId`, `event` |
| Styles | Relocate `.organizers-section*` from `event-form-dialog.scss`; delete unused rules from form SCSS |
| Season edit | [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) L529–537 — remove permission flags from `openEditEvent` dialog data |

**Suggested `EventOrganizersDialogData`:**

```typescript
export interface EventOrganizersDialogData {
  seasonId: string
  eventId: string
}
```

**Suggested Infos section (sketch):**

```html
<section class="event-infos__organizers" aria-labelledby="event-infos-organizers-label">
  <div class="event-infos__organizers-header">
    <span id="event-infos-organizers-label" class="event-infos__label">Organisateur·ices</span>
    @if (canManageEventOrganizers()) {
      <button type="button" mat-icon-button aria-label="Gérer les organisateur·ices" (click)="openOrganizersDialog()">
        <mat-icon>edit</mat-icon>
      </button>
    }
  </div>
  <p class="event-infos__organizers-summary">{{ organizersSummary() }}</p>
</section>
```

Place **after** `event-infos__format`, **before** equity section.

**`event-detail` admin actions (after):**

```typescript
// openEventOrganizersAdmin / openEventParticipantsAdmin
this.dialog.open(EventOrganizersDialog, { data: { seasonId, eventId: ev.id }, width: '...' })
// NOT EventFormDialog
```

### API contract (unchanged — Stories 3.5 / 3.8)

| Operation | Path | Notes |
|-----------|------|--------|
| List event organizers | `GET .../events/{eventId}/organizers` | `OrganizerResponse[]` |
| Add | `POST .../organizers` body `{ email }` | User must exist |
| Remove | `DELETE .../organizers/{userId}` | |
| List event participants | `GET .../events/{eventId}/participants` | Admin list |
| Add | `POST .../participants` | `{ displayName, email? }` |
| Remove | `DELETE .../participants/{participantId}` | |

### Previous story intelligence

- **17.14** (review): Extracted type/roles to `EventTypeRolesDialog` + Infos CTA; explicitly **left** organizers/participants in form for **17.15**. Copy extraction pattern (move HTML/TS wholesale, colocate under `event-detail/`).
- **17.8** (done): Infos tab + `MatDialog` + optional reload/snackbar — organizers dialog does **not** PATCH `EventResponse`; reload organizers signal only unless you emit a no-op `eventUpdated` (avoid).
- **17.12 / 17.13** (done): Slim form fields — do not regress datetime/slug tests.
- **3.5** (done): Event organizer permission model and APIs.
- **3.8** (done): Event participant APIs; AC11 placed participants in form — **this story supersedes that placement only**.

### Git intelligence

- `7041ab3` — **17.14** moved type/roles off form; organizers/participants still in `event-form-dialog.html` L60–181.
- `4e020b8` — Infos tab + dialog pattern (**17.8**).
- `a32190b` — SCP planned **17.15** as final form polish slice.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| New dialogs | `apps/web/src/app/pages/event-detail/event-organizers-dialog.*`, `event-participants-dialog.*` |
| Infos tab | `apps/web/src/app/pages/event-detail/event-infos-tab.{ts,html,scss}` (+ spec) |
| Slim form | `apps/web/src/app/pages/season-home/event-form-dialog.{ts,html,scss}` (+ spec) |
| Event detail | `apps/web/src/app/pages/event-detail/event-detail.{ts,html}` (+ spec) |
| Season home | `apps/web/src/app/pages/season-home/season-home.ts` (edit dialog open) |
| APIs | `organizer-api.service.ts`, `participant-api.service.ts` (no change expected) |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- **Form regression:** `innerHTML` must not contain `Organisateur·ices du spectacle` or `Participants du spectacle`; `listEventOrganizers` / `listEventParticipants` never called from `EventFormDialog` lifecycle.
- **Infos:** With `canManageEventOrganizers: true`, edit button opens `EventOrganizersDialog`; with `false`, no edit button.
- **Event detail:** Event-only participant admin menu action opens `EventParticipantsDialog` (verify `MatDialog.open` first arg).
- **Organizers dialog:** Add invalid email → status message; successful add clears email field and refreshes list.
- **Do not break:** **17.14** type/roles Infos tests, **17.8** equity tests, **17.13** datetime tests, permission specs in `event-detail.spec.ts` for menu **labels** (only implementation of `action` changes).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.15]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md` — §5 17.15]
- [Source: `_bmad-output/planning-artifacts/ux-backlog-event-form-dialog.md` — #4, #5]
- [Source: `_bmad-output/implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md` — AC11 supersede]
- [Source: `_bmad-output/implementation-artifacts/17-14-onglet-infos-type-roles-modales.md` — extraction pattern; scope guard]
- [Source: `_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md` — Infos + dialog pattern]
- [Source: `apps/web/src/app/pages/season-home/event-form-dialog.html` — L60–181 to relocate/remove]
- [Source: `apps/web/src/app/pages/event-detail/event-detail.ts` — `openEventOrganizersAdmin`, `openEventParticipantsAdmin`, `openEdit`, `eventAdminItems`]
- [Source: `PLAN.md` — Epic 17 table 17.15]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Completion Notes List

- Extracted `EventOrganizersDialog` and `EventParticipantsDialog` under `event-detail/` with `true`/`undefined` close semantics; admin menu and Infos CTA open dedicated dialogs instead of `EventFormDialog`. **Note:** `EventParticipantsDialog` superseded by route **17.16** (`AdminEventParticipants`).
- Infos tab: organizers summary section (read-only when list non-empty; edit icon when `canManageEventOrganizers`); reload list only after dialog change.
- Slimmed `EventFormDialog` to planning fields only; removed permission flags from `EventFormDialogData` and all callers.
- Tests: 439 passing (`npm run test -w @hatcast/web -- --watch=false`); build OK (`npm run build -w @hatcast/web`).
- Story **3.8** AC11 placement note superseded by **17.15**.

### File List

- apps/web/src/app/pages/event-detail/event-organizers-dialog.ts
- apps/web/src/app/pages/event-detail/event-organizers-dialog.html
- apps/web/src/app/pages/event-detail/event-organizers-dialog.scss
- apps/web/src/app/pages/event-detail/event-organizers-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-participants-dialog.ts
- apps/web/src/app/pages/event-detail/event-participants-dialog.html
- apps/web/src/app/pages/event-detail/event-participants-dialog.scss
- apps/web/src/app/pages/event-detail/event-participants-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.html
- apps/web/src/app/pages/event-detail/event-infos-tab.scss
- apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.ts
- apps/web/src/app/pages/season-home/event-form-dialog.html
- apps/web/src/app/pages/season-home/event-form-dialog.scss
- apps/web/src/app/pages/season-home/event-form-dialog.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- _bmad-output/implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-25: Story **17.15** — Infos organizers section + dedicated dialogs; slim event form; tests and **3.8** AC11 supersede note.
- 2026-05-25: Code review — AC1/AC2 amendés (UX chips inline) ; patches modale multi-ajout + reload organisateurs ; status **done**.

### Review Findings

- [x] [Review][Decision] UX organisateurs Infos — **A** : chips inline + modale add-only ; AC1/AC2 amendés (review 2026-05-25).
- [x] [Review][Decision] Menu gear participants saison — **A** : revert changements non commités ; lien router « Participants » conservé pour admins saison.
- [x] [Review][Patch] Modale organisateurs multi-ajout [`event-organizers-dialog.ts`] — reste ouverte après ajout ; `close()` renvoie `true` si changement.
- [x] [Review][Patch] Reload organisateurs admin menu [`event-detail.ts`] — `organizersReloadTrigger` + snackbar alignés sur Infos (sans `reloadEvent`).
- [x] [Review][Patch] Changements non commités [`event-detail.ts`, `event-detail.spec.ts`] — revert effectué (decision 2A).
- [x] [Review][Defer] Autocomplete membres limité à 100 [`event-organizers-dialog.ts:107`] — deferred, pre-existing pattern.

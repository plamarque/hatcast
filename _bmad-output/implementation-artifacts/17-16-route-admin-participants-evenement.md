# Story 17.16: Event participant admin route — UX polish

Status: review

<!-- Phase 1 done 2026-05-25 (route, merged roster API, dialog removal). Phase 2 UX polish PO 2026-05-26. -->

## Story

As an **organizer** managing spectacle participants,
I want the **event participant admin page** to match **season participant admin UX** (toolbar add button + modal, compact list, quick filter for event-only additions),
so that **I can scan a long roster quickly** and **find ponctual / non-member additions** without scrolling past an inline form.

## Product context (PO 2026-05-26)

- **Phase 1 (done):** Dedicated route `/saison/:slug/event/:eventSlug/admin/participants`, merged roster (season − exclusions + event supplements), breadcrumb chrome, backend `EventRosterService`.
- **Phase 2 (this iteration):** UX only — no API or permission changes.
- **Reference UX:** [`AdminParticipants`](../../apps/web/src/app/pages/admin-participants/admin-participants.html) toolbar (`Rechercher` + `Ajouter` → modal) and compact row layout.
- **Primary pain:** Inline add section at page bottom pushes the list; two chips per row (`Saison`/`Spectacle` + kind) make rows tall; event-only / non-member additions are hard to spot in a long season roster.

## Acceptance Criteria

### Phase 1 — route & roster (done)

1. Route, breadcrumb, permissions, merged roster API, menu navigation — **unchanged from Phase 1**; see [Completion Notes](#dev-agent-record) below.

### Phase 2 — toolbar & add modal (PO 2026-05-26)

2. **Given** the page toolbar, **when** loaded, **then** `Rechercher` field and **`Ajouter`** button sit on the **same row** (flex toolbar, mirror [`admin-participants.html`](../../apps/web/src/app/pages/admin-participants/admin-participants.html) L49–61). [Source: PO 2026-05-26; UX-DR10 admin pattern]
3. **Given** user clicks **`Ajouter`**, **when** the dialog opens, **then** a **Material dialog** collects **nom affiché** + **email (optionnel)** and calls `createEventParticipant` — **not** an inline form on the page. [Source: `AddParticipantDialog` pattern]
4. **Given** successful add via dialog, **when** dialog closes with `true`, **then** roster reloads and snackbar confirms (e.g. « Participant ajouté au spectacle. »); dialog stays reusable for multi-add (close only on Annuler or after successful submit — mirror season dialog). [Source: `add-participant-dialog.ts`]
5. **Given** the page body after Phase 2, **when** rendered, **then** **no** inline « Ajouter un participant ponctuel » section remains (remove `admin-event-participants__add*` block). [Source: PO 2026-05-26]

### Phase 2 — compact list

6. **Given** the participant list, **when** displayed, **then** each row is **more compact** than today: single-line primary text where possible (name + email on one line or truncated secondary), reduced vertical padding (target ≤ `0.45rem` row padding), actions aligned right — align visually with season admin list density. [Source: PO 2026-05-26]
7. **Given** a season-inherited participant (`source === 'SEASON'`), **when** listed, **then** **no** redundant « Saison » chip is shown (implicit default); show **kind** chip only when not `MEMBER` (e.g. « Nom seul », « Lié »). [Source: PO 2026-05-26 — reduce noise]
8. **Given** an event-only supplement (`source === 'EVENT'`), **when** listed, **then** row shows a visible **« Ajout spectacle »** badge/chip (distinct from season rows) so ponctual additions stand out without reading two chips. [Source: PO 2026-05-26]

### Phase 2 — find event-only / non-member additions

9. **Given** the toolbar, **when** user toggles filter **« Ajouts au spectacle »** (mat-chip toggle or stroked toggle button beside search), **then** list shows **only** `source === 'EVENT'` participants; toggling off restores full roster (respecting current search query). [Source: PO 2026-05-26]
10. **Given** filter active + search query, **when** both apply, **then** intersection filter (name/email match **and** `source === 'EVENT'`). [Source: composable filters]
11. **Given** filter active and zero matches, **when** list renders, **then** empty state: « Aucun ajout ponctuel sur ce spectacle. » (or equivalent French copy). [Source: repo copy norms]

### Regression & quality

12. **Given** remove action on a row, **when** user clicks « Retirer du spectacle », **then** behaviour unchanged (season → exclusion API; event-only → delete API). [Source: Phase 1]
13. **Given** mobile (`max-width: 480px`), **when** on this page, **then** toolbar wraps gracefully (search full width, Ajouter + filter on next row if needed); breadcrumb rules unchanged (**17.1**). [Source: 17.1]
14. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass; update `admin-event-participants.spec.ts` for toolbar button, dialog open, filter, no inline add section. [Source: repo norms]

## Tasks / Subtasks

- [x] **Add dialog component** (AC: 3, 4)
  - [x] Create `add-event-participant-dialog.ts` under `admin-event-participants/` (or colocate in `pages/admin-event-participants/`).
  - [x] Data: `{ seasonId: string; eventId: string }`; close `boolean` on success.
  - [x] Reuse field copy from removed inline section + hint from [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts) (email linking).
  - [x] Width: `min(100vw - 2rem, 28rem)` (match other admin dialogs).

- [x] **Toolbar refactor** (AC: 2, 5, 9)
  - [x] Add `Ajouter` button → `MatDialog.open(AddEventParticipantDialog)`; inject `MatDialog` in page component.
  - [x] Add filter toggle « Ajouts au spectacle »; extend `filteredRoster` computed to apply `showEventOnlyFilter` signal.
  - [x] Remove inline add HTML/TS/state (`addDisplayName`, `addEmail`, `addEventOnlyParticipant` from page — move to dialog).

- [x] **Compact list styling** (AC: 6–8)
  - [x] Update `admin-event-participants.html` row template: inline name/email, conditional chips per AC7–8.
  - [x] Tighten SCSS row padding and chip density; use M3 tokens (keep dark-mode contrast from Phase 1).

- [x] **Tests** (AC: 14)
  - [x] Spec: toolbar has Ajouter, no inline add section in DOM.
  - [x] Spec: Ajouter opens dialog (mock `MatDialog.open`).
  - [x] Spec: filter toggle limits list to `source: 'EVENT'` rows.
  - [x] Keep existing permission redirect test green.

- [x] **Docs** (optional, if UX journey mentions inline add)
  - [x] One-line note in `ux-design-journey-league-agenda.md` if it describes inline add (currently route-only — likely no change).

## Dependencies

- **Phase 1 (17.16)** — route, APIs, page shell — **done**.
- **AdminParticipants** — toolbar + `AddParticipantDialog` pattern (**3.8** season admin).
- **17.11 / 17.1** — breadcrumb chrome (unchanged).

## Non-goals

- Backend or API contract changes.
- Season roster admin page changes.
- Bulk import, membership conversion, or Infos-tab participant section.
- Replacing « Retirer du spectacle » with icons-only without explicit PO approval.

## Dev Notes

### UX rules (Phase 2)

| Element | Rule |
|--------|------|
| Toolbar | `[ search (flex 1) ] [ filter toggle ] [ Ajouter primary ]` — same row on desktop; wrap on mobile |
| Add flow | Modal only — **never** inline form at page bottom |
| Season rows | Default silent (no « Saison » chip); kind chip if not `MEMBER` |
| Event rows | Always show **« Ajout spectacle »** chip/badge |
| Filter | « Ajouts au spectacle » = `source === 'EVENT'`; composable with search debounce (150ms existing) |
| Copy FR | « Ajouter », « Ajouts au spectacle », « Ajout spectacle », « Aucun ajout ponctuel sur ce spectacle. » |

### Implementation guardrails

| Concern | Action |
|--------|--------|
| Dialog pattern | Mirror [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts): inline template or small `.html`, `MAT_DIALOG_DATA`, `MatDialogRef<boolean>` |
| API | `ParticipantApiService.createEventParticipant(seasonId, eventId, { displayName, email? })` — unchanged |
| Page TS | Add `MatDialog` import; remove `addDisplayName`/`addEmail` signals from page |
| Filter state | `eventOnlyFilter = signal(false)`; in `filteredRoster`: if filter on, `list = list.filter(p => p.source === 'EVENT')` before search |
| Do not duplicate | Do **not** copy season dialog wholesale — event dialog calls `createEventParticipant`, not `createSeasonParticipant` |

**Suggested dialog data:**

```typescript
export interface AddEventParticipantDialogData {
  seasonId: string
  eventId: string
}
```

**Suggested `filteredRoster` extension:**

```typescript
protected readonly eventOnlyFilter = signal(false)

protected readonly filteredRoster = computed(() => {
  let list = this.roster()
  if (this.eventOnlyFilter()) {
    list = list.filter((p) => p.source === 'EVENT')
  }
  const q = this.debouncedSearch().trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false),
    )
  }
  return list
})
```

### Project structure

| Layer | Paths |
|-------|--------|
| Page | `apps/web/src/app/pages/admin-event-participants/admin-event-participants.{ts,html,scss,spec.ts}` |
| New dialog | `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts` |
| Reference | `apps/web/src/app/pages/admin-participants/admin-participants.{ts,html}`, `add-participant-dialog.ts` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- DOM must **not** contain « Ajouter un participant ponctuel » heading or inline add fields after Phase 2.
- Click **Ajouter** → verify `MatDialog.open` called with event participant dialog component.
- With mixed roster fixture (1 SEASON + 1 EVENT row), filter toggle shows only EVENT row.
- Event row template includes « Ajout spectacle » label; season MEMBER row does not show « Saison » chip.
- Permission redirect test unchanged.

### Previous story intelligence (Phase 1)

- Merged roster via `listEventParticipantRoster`; remove uses exclusion vs delete by `source`.
- `EventParticipantsDialog` removed — do **not** reintroduce; stay on full-page route.
- Dark-mode: use `var(--mat-sys-*)` tokens in SCSS (Phase 1 review fix).

### References

- [Source: `_bmad-output/implementation-artifacts/17-16-route-admin-participants-evenement.md` — Phase 1 completion]
- [Source: `apps/web/src/app/pages/admin-participants/admin-participants.html` — toolbar pattern]
- [Source: `apps/web/src/app/pages/admin-participants/add-participant-dialog.ts` — modal pattern]
- [Source: `apps/web/src/app/pages/admin-event-participants/admin-event-participants.html` — current inline add to remove]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — route entry]
- [Source: Story **3.8** — event participant domain]

## Dev Agent Record

### Phase 1 completion (2026-05-25) — done

- Route `/saison/:slug/event/:eventSlug/admin/participants` (+ `/ligue/...` alias) → `AdminEventParticipants` with breadcrumb `layout="event"`, leaf « Participants », mobile title.
- Event gear menu « Participants du spectacle » → `router.navigate` via `saisonEventParticipantsAdminPath()`.
- Merged roster via `listEventParticipantRoster`; exclusions + event supplements; backend `EventRosterService`, `V27__event_participant_exclusions.sql`.
- Removed `EventParticipantsDialog`; tests in `admin-event-participants.spec.ts`, `ParticipantControllerIntegrationTest`.

### Phase 1 file list

| Area | Files |
|------|--------|
| Page | `apps/web/src/app/pages/admin-event-participants/admin-event-participants.{ts,html,scss,spec.ts}` |
| Routes | `apps/web/src/app/app.routes.ts`, `troupe-routes.ts` |
| API client | `participant-api.service.ts` |
| Backend | `EventRosterService.kt`, `ParticipantController.kt`, migration V27 |

### Agent Model Used

Composer

### Debug Log References

- Phase 2: mirrored `AddParticipantDialog` pattern for event-only adds; toolbar filter uses stroked button with `aria-pressed`.

### Completion Notes List

- **Phase 2 (2026-05-26):** Toolbar aligned with season admin — `Rechercher` + filter « Ajouts au spectacle » + `Ajouter` (modal). Inline add section removed.
- `AddEventParticipantDialog` calls `createEventParticipant`; reload + snackbar on success.
- Compact rows: name/email inline, padding `0.45rem`; season MEMBER rows silent; event rows show « Ajout spectacle » chip; non-MEMBER kind chips only when needed.
- Filter composable with search debounce; empty state « Aucun ajout ponctuel sur ce spectacle. » when filter active with no matches.
- Tests: 6 specs in `admin-event-participants.spec.ts` (toolbar, dialog, filter, permissions). `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` pass.

### File List

| Area | Files |
|------|--------|
| Dialog | `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts` |
| Page | `apps/web/src/app/pages/admin-event-participants/admin-event-participants.{ts,html,scss,spec.ts}` |

### Change Log

- 2026-05-25: Story created — route (not dialog); event-only ponctual participants; season roster default eligibility. **Phase 1 done.**
- 2026-05-26: **Phase 2 UX polish** — toolbar Ajouter + modal, compact list, « Ajouts au spectacle » filter; status reset to **ready-for-dev**.
- 2026-05-26: **Phase 2 implemented** — dialog, toolbar refactor, compact list, filter, tests; status **review**.

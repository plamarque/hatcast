# Story 17.13: Event form — Material date and time pickers

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — UX backlog #2)

## Story

As an **organizer**,
I want **a Material calendar and hour/minute selectors** when scheduling a spectacle in the create/edit dialog,
so that **date/time entry is clearer and consistent** with other HatCast forms instead of native `datetime-local`.

## Acceptance Criteria

1. **Given** `EventFormDialog` (create or edit), **when** setting start date/time, **then** `MatDatepicker` with toggle replaces `type="datetime-local"`; time is chosen via **`ngx-mat-timepicker`** (24h, locale `fr-FR`) bound to `startTime` (`HH:mm`). [Source: epics 17.13; SCP §5; ux-backlog #2 — as-built 2026-05-25]
2. **Given** save (create or update), **when** submitted, **then** payload `startsAt` is an ISO-8601 instant from **local** date + hour + minute via `buildStartsAtIso`. Empty `startTime` → **00:00** local (date-only / not yet specified; field stays empty in UI). [Source: epics 17.13 AC2]
3. **Given** edit mode with existing `event.startsAt`, **when** dialog opens, **then** datepicker and `startTime` reflect that instant in the **user’s local timezone**; **00:00** displays as empty (`startTimeForForm`). [Source: `event-form-dialog.ts`]
4. **Given** invalid or incomplete date/time, **when** user submits, **then** form stays invalid with French `mat-error` (required date; invalid `HH:mm` → « Heure invalide »). Empty time is allowed. [Source: repo UX norms]
5. **Given** tests, **when** CI runs `npm run test -w @hatcast/web -- --watch=false`, **then** specs guard removal of `datetime-local`, assert `startsAt` on create/update, and stay green with 17.12 regressions. [Source: epics 17.13 implicit]

## Tasks / Subtasks

- [x] **Replace datetime-local UI** (AC: 1, 4)
  - [x] In [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html): remove `type="datetime-local"` / `formControlName="startsAtLocal"`.
  - [x] Add `MatDatepicker` + `mat-datepicker-toggle` (mirror [`season-form-dialog.ts`](../../apps/web/src/app/pages/seasons-list/season-form-dialog.ts) L99–110).
  - [x] Add hour (0–23) and minute (0–59) selectors in a `.datetime-row` layout (see season `.dates` flex pattern).
  - [x] Import `MatDatepickerModule`, `MatIconModule` in [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts).

- [x] **Form model and conversion** (AC: 2, 3)
  - [x] Replace `startsAtLocal: string` with `startDate: Date | null`, `startHour: number`, `startMinute: number` (defaults e.g. 20:00 for create if product-acceptable, or require explicit selection).
  - [x] Add helpers (component file or colocated utils):
    - `parseStartsAt(iso)` → `{ date, hour, minute }` using local `Date` getters; store date at **local noon** when binding to datepicker (same noon trick as `parseIsoDateOnly` in season dialog).
    - `buildStartsAtIso(date, hour, minute)` → `new Date(y, m, d, hour, minute, 0, 0).toISOString()`.
  - [x] Remove `toDatetimeLocalValue`; patch edit form via `parseStartsAt(e.startsAt)`.
  - [x] In `submit()`, use `buildStartsAtIso` instead of `new Date(v.startsAtLocal).toISOString()`.

- [x] **Styles** (AC: 1)
  - [x] In [`event-form-dialog.scss`](../../apps/web/src/app/pages/season-home/event-form-dialog.scss): `.datetime-row` flex wrap; date field full width on narrow screens; hour/minute fields min-width ~5rem.

- [x] **Tests** (AC: 5)
  - [x] Update [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts):
    - Regression: no `datetime-local`, no `formcontrolname="startsAtlocal"`.
    - Presence: `mat-datepicker` or `[matdatepicker]` in template.
    - `fillRequiredCreateFields`: patch `startDate`, `startHour`, `startMinute` (not `startsAtLocal`).
    - Create: assert `createEvent` body `startsAt` matches expected ISO for known local values (fix timezone in test by using UTC-safe wall clock or explicit `Date` construction in test).
    - Edit: after init, form hour/minute match `event.startsAt` local parts; `updateEvent` sends correct `startsAt` when only time changes.
  - [x] Keep **17.12** slug and **17.8** equity-tag regression blocks unchanged.

## Dev Notes

### Product and UX rules

- **Scope:** `EventFormDialog` only — create **and** edit from season agenda / season home (same dialog both modes per ux-backlog open question #2 — treat both modes equally).
- **Locale:** App already provides `MAT_DATE_LOCALE: 'fr-FR'` and `provideNativeDateAdapter()` in [`app.config.ts`](../../apps/web/src/app/app.config.ts) — datepicker labels follow French without extra setup.
- **Label:** Keep « Date et heure de début » as section intent; sub-labels « Date » + « Heure » (no « optionnel » on time label).
- **Time (as-built):** [`ngx-mat-timepicker`](https://www.npmjs.com/package/ngx-mat-timepicker) v21 in dialog + `NgxMatTimepickerModule.setLocale('fr-FR')` in [`app.config.ts`](../../apps/web/src/app/app.config.ts). Form control `startTime` (`HH:mm`, optional). Empty → stored as **00:00** for date comparisons; UI shows empty, not `00:00`. User may set time later.

### Explicit non-goals (scope guard)

- Do **not** change API contract (`startsAt` remains instant string on create/update).
- Do **not** move type, roles, organizers, participants, slug, or equity tag (**17.14–17.15**, **17.8**, **17.12**).
- Do **not** add end date/time, timezone picker, or duration fields.
- Do **not** refactor `season-form-dialog` (reference only).
- Do **not** change event display formatting on agenda/detail (`season-events.utils`, `event-infos-tab` formatters).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reference pattern | [`season-form-dialog.ts`](../../apps/web/src/app/pages/seasons-list/season-form-dialog.ts): `MatDatepickerModule`, toggle, `appearance="outline"`, `parseIsoDateOnly` / `toIsoDateOnly` noon trick for **date-only** — adapt for **datetime** by separate hour/minute |
| Current submit | L318: `const startsAt = new Date(v.startsAtLocal).toISOString()` → replace with `buildStartsAtIso` |
| Current edit load | L124: `startsAtLocal: toDatetimeLocalValue(e.startsAt)` → `parseStartsAt` |
| Validators | `startDate` required; `startHour` / `startMinute` required + min/max (0–23, 0–59) |
| Animations | Tests already use `NoopAnimationsModule` — keep in spec setup |

**Suggested form shape:**

```typescript
protected readonly form = this.fb.nonNullable.group({
  title: ['', [Validators.required]],
  startDate: [null as Date | null, [Validators.required]],
  startHour: [20, [Validators.required, Validators.min(0), Validators.max(23)]],
  startMinute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
  location: [''],
  description: [''],
  templateType: [DEFAULT_CREATE_EVENT_TYPE as EventTypeId, [Validators.required]],
})
```

**Suggested conversion helpers:**

```typescript
function parseStartsAt(iso: string): { date: Date; hour: number; minute: number } {
  const d = new Date(iso)
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0)
  return { date, hour: d.getHours(), minute: d.getMinutes() }
}

function buildStartsAtIso(date: Date, hour: number, minute: number): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    minute,
    0,
    0,
  ).toISOString()
}
```

**Template sketch (hour/minute via mat-select):**

```html
<div class="datetime-row">
  <mat-form-field appearance="outline" class="datetime-row__date">
    <mat-label>Date</mat-label>
    <input matInput [matDatepicker]="pickerStart" formControlName="startDate" />
    <mat-datepicker-toggle matIconSuffix [for]="pickerStart" />
    <mat-datepicker #pickerStart />
  </mat-form-field>
  <mat-form-field appearance="outline">
    <mat-label>Heure</mat-label>
    <mat-select formControlName="startHour">…</mat-select>
  </mat-form-field>
  <mat-form-field appearance="outline">
    <mat-label>Min</mat-label>
    <mat-select formControlName="startMinute">…</mat-select>
  </mat-form-field>
</div>
```

Generate hour/minute options in component as readonly arrays or `@for` 0..23 / 0..59.

### Previous story intelligence (17.12, 17.8)

- **17.12** (review): `event-form-dialog` uses `formError`, no slug field; tests in same spec file — **extend**, do not delete slug/equity regressions. `fillRequiredCreateFields` central — **must update** when renaming controls.
- **17.8** (review): Equity tag **not** in dialog — do not add fields outside datetime scope.
- **17.12** explicitly listed datetime move as **17.13** — this is the dedicated story for that UX item only.

### Git intelligence

- `a32190b` — SCP planning 17.12–17.15 (datetime = 17.13).
- Working tree already touches `event-form-dialog.*` for 17.12 — coordinate: implement 17.13 on top of slug removal branch; avoid reintroducing `startsAtLocal`.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| UI | `apps/web/src/app/pages/season-home/event-form-dialog.{ts,html,scss}` |
| Tests | `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts` |
| Date locale | `apps/web/src/app/app.config.ts` |
| Reference | `apps/web/src/app/pages/seasons-list/season-form-dialog.ts` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- DOM: `expect(html).not.toMatch(/datetime-local/i)`; `querySelector('[formcontrolname="startsAtLocal"]')` null.
- Create payload: after `fillRequiredCreateFields` + `submit()`, `createEvent` 2nd arg `startsAt` is ISO string; optional: decode and assert local wall time matches patched hour/minute.
- Edit init: for `startsAt: '2030-06-15T18:00:00Z'`, after `detectChanges`, `startHour`/`startMinute` match `new Date(iso)` in test environment (document if test uses UTC vs local — prefer constructing event ISO from local intent to avoid flaky CI).
- Do not break existing tests: equity tag, slug omit, participants permission, template change flows.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.13]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md` — §5 17.13]
- [Source: `_bmad-output/planning-artifacts/ux-backlog-event-form-dialog.md` — #2]
- [Source: `_bmad-output/implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md` — non-goals, test file]
- [Source: `_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md` — dialog scope]
- [Source: `apps/web/src/app/pages/seasons-list/season-form-dialog.ts` — MatDatepicker pattern]
- [Source: `PLAN.md` — Epic 17 table 17.13]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Completion Notes List

- Replaced native `datetime-local` with `MatDatepicker` + `ngx-mat-timepicker` (`startTime` `HH:mm`, 24h).
- Form: `startDate` (required), `startTime` (optional). Empty time → `00:00` in `startsAt`, empty in UI (`startTimeForForm` / `UNSPECIFIED_START_TIME_PARTS`).
- Helpers: `parseStartsAt`, `buildStartsAtIso`, `parseStartTime`, `resolveStartTimeParts`, `startTimeForForm`.
- Tests: `event-form-dialog.spec.ts` 26/26 (`dialogHarness`, `provideNativeDateAdapter`).

### File List

- `apps/web/src/app/pages/season-home/event-form-dialog.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.html`
- `apps/web/src/app/pages/season-home/event-form-dialog.scss`
- `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts`
- `apps/web/src/app/app.config.ts`
- `apps/web/package.json`
- `package-lock.json`

### Change Log

- 2026-05-25: Story 17.13 — Material date/time pickers in event form dialog (replaces `datetime-local`).

### Review Findings

- [x] [Review][Patch] Spec does not compile: direct access to protected `submit()` and `formError` — `ng test` fails with TS2445 [`event-form-dialog.spec.ts`]

#### Re-review 2026-05-25 (ngx-mat-timepicker)

- [x] [Review][Decision] AC1 — `ngx-mat-timepicker` accepted; story AC/Dev Notes updated.
- [x] [Review][Decision] Empty `startTime` → `00:00` in payload, empty in UI; not 20:00; label « Heure » without « optionnel ».
- [x] [Review][Patch] Test invalid `startTime` blocks submit [`event-form-dialog.spec.ts`]
- [x] [Review][Patch] `resolveStartTimeParts` no silent fallback on invalid parse [`event-form-dialog.ts`]
- [x] [Review][Patch] File List / Completion Notes synced with as-built implementation

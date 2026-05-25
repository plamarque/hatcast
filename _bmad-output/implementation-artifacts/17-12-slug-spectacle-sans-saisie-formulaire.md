# Story 17.12: Event slug — no form field

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — UX backlog #1)

## Story

As an **organizer**,
I want **shareable event URLs generated automatically** without editing a slug field in the create/edit dialog,
so that **the spectacle form stays focused on planning** and bookmark links remain stable.

## Acceptance Criteria

1. **Given** `EventFormDialog` (create or edit), **when** opened, **then** there is **no** « Identifiant URL » field, hint, or `formControlName="slug"` in the template. [Source: epics 17.12; SCP §5]
2. **Given** create with a valid title, **when** the user saves, **then** the client **does not** send `slug` in the POST body; the API allocates a unique slug from the title (`EventSlugGenerator`, dedupe `-2`, … per **17.6**). [Source: `EventService.create`]
3. **Given** edit with only title/date/location/description/type/roles changed, **when** saved, **then** the client **does not** send `slug` in PATCH; existing slug stays unchanged (API **17.6** — `EventServiceUpdateTest.update title does not change slug`). [Source: epics 17.12]
4. **Given** create succeeds, **when** `season-home` handles the dialog result, **then** navigation still uses `EventResponse.slug` from the API (unchanged post-create flow). [Source: 17.6 completion notes]
5. **Given** API errors on create/update (400/409), **when** the request fails, **then** a **generic** French error is shown in the dialog (not tied to a removed slug field). [Source: 17.6 review — `errorMessage` on `EventApiService`]
6. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** tests pass including regression guards (no slug UI; create/update payloads omit `slug`). [Source: repo norms]
7. **Given** product docs still say slug is user-editable in the form, **when** this story ships, **then** amend **epics.md** Story 17.6 AC (remove « éditable » for UI) and add a short amendment note in **17-6** story file (SCP). [Source: epics 17.12 implicit AC; SCP §5]

## Tasks / Subtasks

- [x] **Remove slug UI** (AC: 1)
  - [x] Delete slug `mat-form-field` block in [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html) (lines ~14–26).
  - [x] Remove `slug` from `FormBuilder` group; remove `slugTouched`, `slugError`, `onTitleBlur` slug logic, `onSlugInput`.
  - [x] Remove unused imports: `isValidSlug`, `slugifyTitle` from [`url-slug.ts`](../../apps/web/src/app/core/navigation/url-slug.ts) if no longer referenced in this component.
  - [x] Remove `(blur)="onTitleBlur()"` on title input if `onTitleBlur` only served slug preview.

- [x] **Payloads — omit slug** (AC: 2, 3)
  - [x] In `submit()`, build `payload` **without** `slug` for both create and update.
  - [x] In `ngOnInit` edit branch, stop patching `slug` into the form.
  - [x] Do **not** add server-side changes — optional `slug` on `CreateEventRequest` / PATCH remains for API clients only.

- [x] **Error surfacing** (AC: 5)
  - [x] Replace `slugError` with e.g. `formError` (or reuse title `mat-error`) for `r.errorMessage` from `createEvent` / `updateEvent`.
  - [x] Clear error on field change or at start of `submit()`.

- [x] **Tests** (AC: 1, 2, 3, 6)
  - [x] Replace `describe('EventFormDialog slug field')` in [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts) with:
    - Regression: no `Identifiant URL` / `formcontrolname="slug"` in DOM (mirror equity-tag guard in same file).
    - Create success: `createEvent` called with body **not** containing `slug` (use `expect.objectContaining` / inspect mock arg).
    - Edit success: `updateEvent` called without `slug` key.
    - API failure: generic error visible, dialog not closed.
  - [x] Update `fillRequiredCreateFields()` — remove `slug: 'cabaret-test'`.
  - [x] Grep `event-form-dialog` tests elsewhere; adjust if they assert slug field.

- [x] **Docs amendment** (AC: 7)
  - [x] [`epics.md`](../planning-artifacts/epics.md) Story 17.6: change AC « slug proposé … ; **éditable** » → server allocation only; UI non-editable (17.12).
  - [x] [`17-6-slug-evenement-dans-les-urls.md`](17-6-slug-evenement-dans-les-urls.md): note in Dev Notes / Change Log that form field was removed in 17.12 (API unchanged).

### Review Findings

- [x] [Review][Patch] Test manquant pour erreur API en édition (AC 5) [`event-form-dialog.spec.ts`]
- [x] [Review][Patch] `formError` effacé seulement sur saisie du titre [`event-form-dialog.ts` — `form.valueChanges`]
- [x] [Review][Defer] AC6 — suite web complète non revalidée ici ; échecs préexistants `event-infos-tab.spec.ts` (17.8) — deferred, pre-existing

## Dev Notes

### Product and UX rules

- **Scope is web-only.** API slug behavior from **17.6** stays: create derives from title; update changes slug **only** if `slug` is present in PATCH (form will never send it).
- **Stable links:** Users cannot change slug from the dialog; changing **title** must **not** change slug (already enforced server-side).
- **Post-create navigation:** [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) closes dialog with `EventResponse` and navigates via `result.slug` — **no change** required if API still returns `slug`.
- **French UI:** Remove label « Identifiant URL » and hint « Lien partageable : /saison/…/event/identifiant » entirely — do not relocate to Infos tab (out of scope; no slug management UI in 17.12).

### Explicit non-goals (scope guard)

- Do **not** change `EventSlugGenerator`, Flyway, OpenAPI, or PATCH slug API (admin/scripts could still send `slug` later).
- Do **not** implement slug display/edit on **Infos** tab (**17.14–17.15** territory if ever needed).
- Do **not** auto-rewrite slug when title changes on server (already non-goal in 17.6).
- Do **not** move type, roles, organizers, participants, datetime, or equity tag (**17.13–17.15**, **17.8** done).
- Do **not** change UUID→slug canonicalization on event detail routes.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Form shape | `form` controls: `title`, `startsAtLocal`, `location`, `description`, `templateType` only |
| Create POST | `{ title, startsAt, location, description, templateType, roleSlots }` — no `slug` |
| Edit PATCH | Same fields as today minus `slug` |
| API create | [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) L107–118: empty/missing `body.slug` → `slugify(title)` + `allocateUniqueSlug` |
| API update | L220–234: `body.slug` only applied if present — omitting keeps `e.slug` |
| Errors | Use `EventMutationResult.errorMessage` (already wired in 17.6 review) on a dialog-level message |

**Suggested error UX (minimal diff):**

```typescript
protected formError = ''

// submit() start: this.formError = ''
// on failure: this.formError = r.errorMessage ?? 'Enregistrement impossible.'
```

Template: single `@if (formError)` block after title field or above `mat-dialog-actions`.

### Previous story intelligence (17.8, 17.6)

- **17.8** (review): Established **regression test pattern** in `event-form-dialog.spec.ts` — `innerHTML` / `querySelector` guards for removed fields. Reuse for slug (same file, same dialog).
- **17.8** explicitly deferred slug removal to **17.12** — do not touch equity tag or Infos tab.
- **17.6** (done): Added slug field, `onTitleBlur` preview, `slugError` for API messages, navigation by `EventResponse.slug`. This story **reverts only the form field**, keeps routing/API client types.
- **17.6 review:** Slug UUID format rejected client+server; collision on PATCH auto-dedupes — irrelevant once PATCH omits `slug`.

### Git intelligence

- `d27e465` — API slugs + equity tags (backend).
- `a32190b` — SCP event-form UX (17.12–15 planned).
- Current branch already has **17.8** web changes in `event-form-dialog.spec.ts` (equity tag guard) — merge-friendly: add slug guard beside it, delete slug-specific tests.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| UI | `apps/web/src/app/pages/season-home/event-form-dialog.{ts,html,scss}` |
| Tests | `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts` |
| Parent | `apps/web/src/app/pages/season-home/season-home.ts` (create navigate — verify only) |
| Docs | `_bmad-output/planning-artifacts/epics.md`, `17-6-slug-evenement-dans-les-urls.md` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

(No `./mvnw test` unless docs-only.)

### Testing requirements

- `createEvent` mock: `expect(createEvent).toHaveBeenCalledWith('season-1', expect.not.objectContaining({ slug: expect.anything() }))` or assert arg has no `'slug'` key.
- DOM: `expect(html).not.toMatch(/Identifiant URL/)`, `querySelector('[formcontrolname="slug"]')` null.
- Keep existing equity-tag regression test intact.
- Optional: edit-mode test that `updateEvent` body has no `slug` after title change.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.12]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md` — §5 17.12]
- [Source: `_bmad-output/planning-artifacts/ux-backlog-event-form-dialog.md` — #1]
- [Source: `_bmad-output/implementation-artifacts/17-6-slug-evenement-dans-les-urls.md` — form field added; amend after 17.12]
- [Source: `_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md` — non-goals, test patterns]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §4 event slugs]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt` — create/update slug rules]
- [Source: `PLAN.md` — Epic 17 table 17.12]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Completion Notes List

- Removed « Identifiant URL » field and all slug form logic from `EventFormDialog`; create/update payloads omit `slug` (API allocates on create, stable on edit per 17.6).
- Replaced `slugError` with dialog-level `formError` surfaced via `.form-error` alert; cleared on title input and at submit start.
- Added regression tests (DOM guard, payload guards, API error, success); 9/9 pass in `event-form-dialog.spec.ts`.
- Amended epics.md Story 17.6 AC and 17-6 story Change Log / Dev Notes for 17.12 scope.
- Full web build OK; suite has 2 pre-existing failures in `event-infos-tab.spec.ts` (17.8, unrelated).

### File List

- apps/web/src/app/pages/season-home/event-form-dialog.ts
- apps/web/src/app/pages/season-home/event-form-dialog.html
- apps/web/src/app/pages/season-home/event-form-dialog.scss
- apps/web/src/app/pages/season-home/event-form-dialog.spec.ts
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/implementation-artifacts/17-6-slug-evenement-dans-les-urls.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md

### Change Log

- 2026-05-25: Story 17.12 — slug field removed from event form; server-side slug allocation only; docs amended.
- 2026-05-25: Code review — test erreur update (AC 5), `formError` effacé via `form.valueChanges`.

# Story 17.8: Infos tab UI — optional equity tag

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — tag moved off `EventFormDialog`)

## Story

As a **troupe admin or organizer** with rights to manage the spectacle,
I want to **set or clear an optional equity tag on the Infos tab** of the event detail,
so that **draws and stats partition correctly** without overloading the create/edit dialog.

## Acceptance Criteria

1. **Given** event detail with **Infos** tab, **when** the tab loads, **then** a **Groupe de spectacles** section is shown when `canManageEvents` or an existing tag is set: chip (read-only or removable) or CTA **« Mettre dans un groupe »** (lien primaire, même style que **« Ajouter un·e organisateur·ice »**) opening `EventEquityTagDialog` — not in `EventFormDialog`. [Source: epics 17.8; SCP 2026-05-25; 17.14 rename; copy 2026-05-25]
2. **Given** troupe glossary, **when** the user opens the tag dialog and types, **then** autocomplete suggests entries from `GET /v1/troupes/{troupeId}/equity-tags` (API **17.7**). [Source: epics 17.8 AC2; `EventEquityTagDialog`]
3. **Given** an unknown tag string, **when** saved per product policy, **then** glossary may be extended (same rules as API 17.7 — auto-create on event PATCH). [Source: epics 17.7 AC6]
4. **Given** clear action (`×`) or empty value, **when** saved, **then** `equity_tag` is null (principal equity); UI does **not** show a « principal » option. [Source: ADR 0013 §3; epics 17.8]
5. **Given** the tag dialog, **when** open, **then** `mat-hint` explains that tagged participations count in a separate pool (chances/draw/stats) — Screen 6b journey. [Source: ux-design-journey Screen 6b; `EQUITY_TAG_HELP` in dialog]
6. **Given** save, **when** PATCH succeeds, **then** event detail and header refresh; errors use Material feedback (snackbar / field error). [Source: epics 17.8]
7. **Given** season agenda list, **when** event has a tag, **then** optional discrete badge on the row (MVP). [Source: epics 17.8; ux-design-journey line 3]
8. **Given** create/edit spectacle dialog, **when** opened, **then** it does **not** contain the equity tag field. [Source: SCP; verify no regression]

## Tasks / Subtasks

- [x] **API types on web** (AC: 3, 4, 6)
  - [x] Add `equityTag?: string | null` to `EventResponse` in [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts).
  - [x] Add `equityTag?: string | null` to `UpdateEventBody` (and optionally `CreateEventBody` for parity — **do not** expose in create dialog).
  - [x] Add `listEquityTags(troupeId)` on [`troupe-api.service.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) → `GET /v1/troupes/{troupeId}/equity-tags` returning `{ slug, label }[]`.

- [x] **Infos tab — tag block** (AC: 1–6)
  - [x] Extend [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) / `.html` / `.scss`: **Groupe de spectacles** section — chip + removable `×`, or CTA **« Mettre dans un groupe »** (primary link); edit via [`event-equity-tag-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-equity-tag-dialog.ts) (`MatAutocomplete`, `mat-hint`, **Enregistrer**).
  - [x] New inputs: `troupeId`, `canManageEvents`; section visible when `canManageEvents` **or** `equityTag` set (read-only chip for others).
  - [x] Load glossary on Infos tab (chip label) and in dialog; filter client-side like [`add-organizer-dialog.ts`](../../apps/web/src/app/pages/admin-membres/add-organizer-dialog.ts).
  - [x] Save: `EventApiService.updateEvent(seasonId, eventId, { equityTag: slug | null })` — **send JSON `null` to clear** (matches 17.7 `JsonNullable`).
  - [x] On success: emit `eventUpdated` (or callback) so [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) updates `event` signal + snackbar « Tag enregistré » / clear « Tag retiré ».
  - [x] On 400: show `errorMessage` from API on field or snackbar (French messages from server).

- [x] **Event detail wiring** (AC: 1, 6)
  - [x] Pass `troupeId()`, `canManageEvents()`, `seasonId()` into `app-event-infos-tab` from [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html).
  - [x] Handle refreshed `EventResponse` after PATCH (title/header unchanged; tag may affect future 17.9 draw only).

- [x] **Season agenda badge** (AC: 7)
  - [x] In [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html) `.agenda-card__badges`, when `ev.equityTag` set, show small stroked badge (e.g. glossary `label` or short slug — load glossary once in `season-home` and pass `Map<slug, label>` or helper input).
  - [x] Style: discrete, same row as composition badge — see journey examples `dépl.`, `apérock`.

- [x] **Regression guard** (AC: 8)
  - [x] Confirm [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html) has **no** equity tag field; add/extend [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts) querySelector guard.

- [x] **Tests** (AC: 6–8)
  - [x] `event-infos-tab.spec.ts` (new): manage vs non-manage visibility; dialog persist/clear; clear sends `equityTag: null`.
  - [x] `event-equity-tag-dialog.spec.ts` (new): glossary load; autocomplete filter; submit trim / empty → null.
  - [x] Extend [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) mock `EventResponse` with `equityTag` where needed.
  - [x] `season-agenda.spec.ts`: badge visible when `equityTag` set.

## Dev Notes

### Product and UX rules

- **Placement:** Event detail → tab **Infos** only — **not** `EventFormDialog` (SCP 2026-05-25). New events get `equityTag: null` until set post-create on Infos.
- **Principal compartment:** `equityTag === null` in API — never show « Principal » radio/select; empty field + save (or clear `×`) → PATCH `{ "equityTag": null }`.
- **Single tag:** One optional value per event; free text allowed → API normalizes + auto-glossary (17.7).
- **Help copy (French, `mat-hint`):** e.g. *« Les participations à ce spectacle comptent dans un compartiment d’équité séparé pour les chances au tirage et les statistiques. »*
- **Away shows:** Prefer **normal template + tag `deplacements`** over `templateType=deplacement` for new data (document in hint or internal comment only — **do not** block `deplacement` template in UI this story).
- **Read-only members:** When `!canManageEvents` and tag set, show chip without remove/edit (implemented).
- **Edit UX (code review 2026-05-25):** Chip + `EventEquityTagDialog` instead of inline field on the tab — keeps Infos tab scannable; autocomplete/help live in the dialog.
- **UI copy (2026-05-25, post-17.14):** Section label **Groupe de spectacles** (user-facing; API field remains `equityTag`). Empty state CTA **Mettre dans un groupe** (not « Ajouter un groupe » — at most one tag per event). CTA uses `var(--mat-sys-primary)` like organisateur·ices add link (`.event-infos__add-organizer` / `.event-infos__add-tag` shared styles).

### Explicit non-goals (scope guard)

- Do **not** change draw/chances or stats partitioning (**17.9**, **17.10**) — `CompositionSelectionHistoryService` unchanged.
- Do **not** move type, roles, organizers, slug, datetime out of `EventFormDialog` (**17.12–17.15**).
- Do **not** add equity tag to **Mon agenda** (`user-agenda`) unless time permits — AC7 targets **season agenda** only.
- Do **not** add troupe admin UI to edit/delete glossary entries.
- Do **not** add `equityTag` to create dialog or POST from form.
- Do **not** implement backend changes (17.7 **done**).

### Frontend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Autocomplete | [`event-equity-tag-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-equity-tag-dialog.ts) — same pattern as [`add-organizer-dialog.ts`](../../apps/web/src/app/pages/admin-membres/add-organizer-dialog.ts); max ~8 options |
| Permissions | Reuse `canManageEvents` from [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) (`seasonPermissions()?.canManageEvents`) — same as « Modifier » in scope admin menu |
| PATCH clear | `body: JSON.stringify({ equityTag: null })` — TypeScript `UpdateEventBody` must allow `null` |
| PATCH set | Send trimmed user string (display label or slug); API normalizes (`Déplacements` → `deplacements`) |
| Reserved slugs | API rejects `principal`, `main` (17.7 review) — surface French error in UI |
| Save UX | Explicit **Enregistrer** button next to field **or** save on blur with debounce — avoid silent failed PATCH; mirror snackbar patterns in `event-detail.ts` / `troupe-hub-preferences-sheet.ts` |
| Header refresh | After PATCH, replace `event` signal with `data` from `EventMutationResult` |
| Glossary load | `GET /v1/troupes/{troupeId}/equity-tags` — any active troupe member; call once per Infos tab visit |
| Display label | Autocomplete options use `label`; saved value is canonical `slug` from response |
| Agenda badge | Use glossary `label` when available, else `slug`; keep short (CSS `max-width` + ellipsis) |

**Suggested `event-infos-tab` inputs/outputs:**

```typescript
troupeId = input.required<string>()
seasonId = input.required<string>()
canManageEvents = input(false)
event = input.required<EventResponse>()
eventUpdated = output<EventResponse>()
```

**`UpdateEventBody` addition:**

```typescript
equityTag?: string | null  // null clears to principal
```

**`TroupeEquityTag` type:**

```typescript
export interface TroupeEquityTag { slug: string; label: string }
```

### API contract (17.7 — already shipped)

| Operation | Path | Notes |
|-----------|------|--------|
| List glossary | `GET /v1/troupes/{troupeId}/equity-tags` | `[{ slug, label }]` sorted by label |
| Set/clear tag | `PATCH /v1/seasons/{seasonId}/events/{eventId}` | `{ "equityTag": "deplacements" }` or `{ "equityTag": null }` |
| Read | Event detail/list responses | `equityTag: null` = principal |

OpenAPI: [`services/api/openapi/equity-tags.yaml`](../../services/api/openapi/equity-tags.yaml), [`events.yaml`](../../services/api/openapi/events.yaml).

### Previous story intelligence (17.7)

- **17.7 done:** `V25__equity_tags.sql`, `EquityTagNormalizer`, `TroupeEquityTagService.ensureTag` on create/update, `GET` glossary, `EventResponseDto.equityTag`.
- **Web intentionally skipped in 17.7** — `EventResponse` in Angular still **lacks** `equityTag`; this story adds client types + UI.
- **PATCH semantics:** Present `null` clears; omitted field leaves tag unchanged (do not send `undefined` in JSON body for partial PATCH from infos tab — send only `equityTag` key).
- **Auto-glossary:** Unknown non-empty tag on PATCH creates `troupe_equity_tags` row (idempotent).
- **Integration tests:** `@SpringBootTest` may fail locally on H2/Flyway V23 — rely on CI Postgres; unit tests with mocks are fine for web.

### Git intelligence

- `d27e465` — `feat(api): Add event slugs and equity tags` (backend 17.6 + 17.7).
- `a32190b` — docs SCP event-form UX (17.8 placement on Infos tab).
- Epic 17 web patterns: Material outline fields, French UI strings, `MatSnackBar` 3–6s, Vitest + `TestBed`.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| API client | `apps/web/src/app/core/events/event-api.service.ts`, `apps/web/src/app/core/troupes/troupe-api.service.ts` |
| Infos UI | `apps/web/src/app/pages/event-detail/event-infos-tab.{ts,html,scss}` |
| Parent | `apps/web/src/app/pages/event-detail/event-detail.{ts,html}` |
| Agenda badge | `apps/web/src/app/pages/season-home/season-agenda.{html,ts,scss}`, optionally `season-home.ts` (glossary prefetch) |
| Form guard | `apps/web/src/app/pages/season-home/event-form-dialog.{html,spec.ts}` |
| Tests | `event-infos-tab.spec.ts`, `event-detail.spec.ts`, `season-agenda.spec.ts`, `event-form-dialog.spec.ts` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
# optional smoke: ./scripts/start-dev.sh then manual Infos tab PATCH
```

(No API module changes expected.)

### Testing requirements

- Mock `EventApiService.updateEvent` and `TroupeApiService.listEquityTags` in component tests.
- Assert `canManageEvents: false` → no tag form field in DOM.
- Assert clear → `updateEvent` called with `{ equityTag: null }`.
- Assert successful save → `eventUpdated` emitted / parent signal updated.
- `event-form-dialog.spec.ts`: no `mat-label` / text « Tag » / `equityTag` control.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.8]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §3 Equity tag]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 6b, agenda row line 3]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md`]
- [Source: `_bmad-output/planning-artifacts/ux-backlog-event-form-dialog.md`]
- [Source: `_bmad-output/implementation-artifacts/17-7-api-tag-equite-glossaire-troupe.md` — API contract, non-goals]
- [Source: `_bmad-output/implementation-artifacts/17-6-slug-evenement-dans-les-urls.md` — web test patterns]
- [Source: `DOMAIN.md` — equity tag glossary]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Completion Notes List

- Added `equityTag` to web API types and `TroupeApiService.listEquityTags`.
- Infos tab: optional tag field with autocomplete, French help hint, clear (×), explicit Enregistrer, PATCH with JSON null to clear, snackbar feedback, `eventUpdated` to refresh parent event signal.
- Season agenda: discrete equity badge using glossary labels prefetched in `season-home`.
- Regression: `event-form-dialog` has no equity tag field (spec guard).
- Tests: `event-infos-tab.spec.ts` (new), extended `season-agenda`, `event-form-dialog`, `event-detail`, `season-home` mocks. All 396 web tests pass.

### File List

- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.html
- apps/web/src/app/pages/event-detail/event-infos-tab.scss
- apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-equity-tag-dialog.ts
- apps/web/src/app/pages/event-detail/event-equity-tag-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/season-home/season-agenda.ts
- apps/web/src/app/pages/season-home/season-agenda.html
- apps/web/src/app/pages/season-home/season-agenda.scss
- apps/web/src/app/pages/season-home/season-agenda.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.spec.ts

### Change Log

- 2026-05-25: Story 17.8 — Infos tab equity tag UI, season agenda badge, web API client types and tests.
- 2026-05-25: Code review — chip+dialog UX ratified; glossary race guard; dialog dead state removed.
- 2026-05-25: UX copy — section **Groupe de spectacles**; CTA **Mettre dans un groupe** + primary link styling (aligned with organisateur·ices).

### Review Findings

- [x] [Review][Decision] Inline Infos field vs chip + dialog — **Resolved:** keep chip + `EventEquityTagDialog`; AC/tasks/dev notes updated 2026-05-25.
- [x] [Review][Patch] Story File List incomplete — resolved in story File List (2026-05-25).
- [x] [Review][Patch] Glossary load race on troupe change — post-await `troupeId` guard in `loadGlossary` (2026-05-25).
- [x] [Review][Patch] Dead state in dialog — removed unused `saving` / `error` from `EventEquityTagDialog` (2026-05-25).
- [x] [Review][Defer] Duplicate glossary fetch — Infos tab `effect` and dialog `ngOnInit` both call `listEquityTags`; harmless but redundant network on each edit.
- [x] [Review][Defer] `event-form-dialog.spec.ts` slug test edits in same working tree — changes look like 17.12 slug work bundled with 17.8 equity regression guard; not a functional regression for 17.8.

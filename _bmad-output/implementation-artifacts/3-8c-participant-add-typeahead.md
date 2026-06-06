# Story 3.8c: Participant add — name typeahead

---
baseline_commit: 5b4358cd65920f524644261e28f189b5a9060e52
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **authorized season or event participant administrator**,  
I want **name suggestions with avatars when adding a participant**,  
so that **I can quickly link troupe members instead of typing names manually** while **preserving name-only creation** when no suggestion fits (**FR43**, **FR44**, **FR45**).

**Plan source:** [plan-participant-roster-ux-enhancements.md](../planning-artifacts/plan-participant-roster-ux-enhancements.md) — **Lot A** (approved backlog, 2026-06-06).

## Acceptance Criteria

1. **Given** an organizer on **« Ajouter un participant »** (season admin **or** event-only admin), **when** they type in **Nom affiché**, **then** matching **active troupe members** appear in a dropdown with **display name** and **`app-user-avatar`** per row. [Source: plan Lot A AC1 ; stories **2.8**, **17.15** autocomplete patterns]
2. **Given** a suggestion is selected, **when** the dialog is submitted, **then** the participant is created with **display name** and **email prefilled when available** so the API links `user_id` per **FR45** (existing `POST` create — no new persistence model). [Source: plan Lot A AC2]
3. **Given** no suggestion is selected, **when** the organizer submits a non-empty name, **then** a **name-only** (or email-assisted) participant is created unchanged — **FR45** semantics preserved. [Source: plan Lot A AC3 ; story **3.8**]
4. **Given** the **email** field, **when** displayed, **then** it remains **optional** with the existing French hint that auto-link applies; optionally extend hint to mention **future notifications** (Epic **8** backlog) — **no invite implementation** in this story. [Source: plan Lot A AC4 ; Lot C]
5. **Given** a troupe member **already ACTIVE** on the season roster (membership-synced or explicit), **when** the season add dialog suggests members, **then** that member is **excluded** from suggestions (avoid duplicate create / confusing 409). [Source: story **3.8** membership sync ; `SeasonParticipantService.create` conflict rules]
6. **Given** the shipped dialog shell (**commit `570ce4b0`**), **when** autocomplete is added, **then** preserve **inner `.participant-form-dialog`**, `subscriptSizing="dynamic"`, paragraph hints (not `mat-hint`), and `mat-dialog-content` **overflow visible** — no label clip / ghost scroll regression. [Source: ux-design-participant-roster-admin.md §2]
7. **Non-goals (Lot A):** invitation emails; mandatory email; gender field on add dialog; edit-dialog typeahead; backend search endpoint (client-side filter is sufficient for MVP troupe size). [Source: plan Lot A out of scope]

**Product coverage:** FR43–FR45, UX-DR10, [ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md) §2–3.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the add dialogs, **when** typeahead is implemented, **then** use `mat-form-field` (outline) + `matInput` + `mat-autocomplete` + `mat-option` (same stack as [`event-organizers-dialog`](../../apps/web/src/app/pages/event-detail/event-organizers-dialog.ts) and [`event-category-dialog`](../../apps/web/src/app/pages/event-detail/event-category-dialog.ts)) ; avatar rows via existing `app-user-avatar` inside `mat-option` (mirror [`availability-subject-selector.html`](../../apps/web/src/app/shared/availability/availability-subject-selector.html)). [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** option row layout and hints, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; reuse `.participant-form-dialog__hint` / `__error` tokens from shipped dialogs. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** the add dialog is open, **then** autocomplete panel and option rows remain readable ; touch targets on options follow Material defaults ; dialog width stays `min(100vw - 2rem, 28rem)`. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **N/A** — admin-only dialogs under `/saison/.../admin/participants` and event participant admin ; no member chrome change.

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; note any waived items in Dev Notes.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` only — **no** `services/api/` or Flyway changes unless a blocking gap is found (expected: reuse existing create endpoints).
- [x] **Extend dialog data** (AC: 1, 2, 5)
  - [x] Add `troupeId: string` to `AddParticipantDialogData` — pass from [`admin-participants.ts`](../../apps/web/src/app/pages/admin-participants/admin-participants.ts) (`troupeId()` signal already loaded).
  - [x] Add `troupeId: string` to `AddEventParticipantDialogData` — pass from [`admin-event-participants.ts`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts).
- [x] **Season add — typeahead** (AC: 1–3, 5, 6) — [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts)
  - [x] Import `MatAutocompleteModule`, `UserAvatarComponent`, `TroupeApiService`, `computed`/`OnInit` as needed.
  - [x] On init: `troupeApi.listMembers(troupeId, 0, 100)` — same call pattern as [`event-organizers-dialog.ts:113-117`](../../apps/web/src/app/pages/event-detail/event-organizers-dialog.ts).
  - [x] Optionally load `listSeasonParticipants(seasonId)` once to build `Set` of active `userId` / normalized display names for exclusion (AC5).
  - [x] `filteredSuggestions` computed: ACTIVE members only ; filter by query (displayName + email, case-insensitive) ; cap ~8 results like organizers dialog.
  - [x] Wire `mat-autocomplete` on **Nom affiché** input ; `optionSelected` → set `displayName`, `email` (if member has email), and internal `selectedMember` signal.
  - [x] Free typing clears `selectedMember` binding but keeps typed text (AC3).
  - [x] Submit unchanged: `createSeasonParticipant` with trimmed name + optional email.
- [x] **Event-only add — typeahead** (AC: 1–4, 6) — [`add-event-participant-dialog.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts)
  - [x] Same autocomplete pattern on **Nom affiché**.
  - [x] Exclusion set: active members already on **event roster** via `listEventParticipantRoster` (or equivalent loaded once) — avoid suggesting people already eligible for the spectacle.
  - [x] Preserve event-only intro hint paragraph above fields.
- [x] **Shared UX polish** (AC: 6, M3-1)
  - [x] Option template: flex row with `app-user-avatar` (size **24**) + display name ; optional muted email suffix for disambiguation (organizers dialog pattern).
  - [x] **Prefer** extracting a small shared component under `apps/web/src/app/shared/participant-add/` (e.g. `participant-name-typeahead-field.ts`) **only if** season + event dialogs would duplicate >~40 lines — otherwise inline duplication is acceptable for minimal diff.
  - [x] Ensure autocomplete panel is not clipped: keep `:host mat-dialog-content { overflow: visible; max-height: none; }`.
- [x] **Hint copy (optional AC4)** — If product approves in implementation: append to email hint — *« L'email pourra aussi servir aux invitations et notifications à venir. »* — without implementing Epic **8**.
- [x] **Tests** (AC: 1–3, 5)
  - [x] New `add-participant-dialog.spec.ts`: loads members ; filters by query ; selection prefills email ; submit calls `createSeasonParticipant` with linked email ; free-text submit without selection ; excludes already-active season participant from suggestions.
  - [x] New `add-event-participant-dialog.spec.ts` (or extend [`admin-event-participants.spec.ts`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.spec.ts)): parallel coverage for event dialog.
  - [x] Update `admin-participants` open-dialog test to expect `troupeId` in `MAT_DIALOG_DATA` if asserted.
  - [x] Regression: `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.

---

## Dev Notes

### Product and UX rules

- **Surfaces in scope:** Season add [`AddParticipantDialog`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts) ; event-only add [`AddEventParticipantDialog`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts). **Edit** dialog [`edit-participant-dialog`](../../apps/web/src/app/shared/edit-participant-dialog/edit-participant-dialog.ts) is **out of scope**.
- **Suggestion pool:** **Active troupe members** (`TroupeMemberAdmin`, `status === 'ACTIVE'`) — primary source per plan. Do **not** suggest inactive memberships.
- **Linking on submit:** No new API. Existing create bodies `{ displayName, email? }` + server-side `ParticipantLinkService.resolveUserId` handle **FR45**. Selecting a member prefills **email** when `member.email` is present.
- **Reactivation edge case:** If admin picks a **removed** season participant (same user/email/name), existing API `create` may **reactivate** the same row (story **3.19**) — typeahead may **include** removed members if they are still troupe members and not in ACTIVE exclusion set; document in tests if behaviour is verified.
- **Membership-synced ACTIVE members:** Already on roster via `ensureMembershipParticipants` — **exclude from season add suggestions** (AC5). Submitting their name manually would hit duplicate-name conflict only for explicit rows (`troupeMembershipIdIsNull`) but UX should prevent confusion.
- **Dispos / roster guardrails (do not regress):** [ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md) §3 — typeahead is **optional**; name-only path must remain.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| **Reuse autocomplete** | Copy filter/slice pattern from [`event-organizers-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-organizers-dialog.ts) (`filteredMembers` computed, max 8). |
| **Avatar in options** | Copy markup from [`availability-subject-selector.html`](../../apps/web/src/app/shared/availability/availability-subject-selector.html) (`subject-selector__option` flex pattern). |
| **Dialog shell** | Keep grid `.participant-form-dialog`, `subscriptSizing="dynamic"`, paragraph hints — [ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md) §2. |
| **Data wiring** | `admin-participants` already resolves `troupeId` ; pass into dialog `data`. Event admin page has season/troupe context — verify `troupeId` available on load. |
| **API client** | [`participant-api.service.ts`](../../apps/web/src/app/core/participants/participant-api.service.ts) unchanged ; [`troupe-api.service.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) `listMembers(troupeId, page, size)`. |
| **Tokens** | `--mat-sys-on-surface`, `--mat-sys-error` only. |

### Explicit non-goals

- Sending invitation emails or Epic **8** notification implementation.
- Mandatory email or gender on add dialog (Lot B).
- New `GET /members/search` endpoint or pagination beyond first page (100) unless product requests — troupe sizes in HatCast MVP fit client filter.
- Typeahead on **edit** participant dialog.
- Changes to `legacy/`.

### Dependencies

| Story / artifact | Status | Relationship |
|------------------|--------|----------------|
| **3.8** | done | Parent — roster CRUD, create API, dialog shells |
| **3.19** | done | Reactivation on re-add ; exclusion rules for ACTIVE rows |
| **17.15** | done | Reference autocomplete (organizers) |
| **17.16** | done | Event participant admin route + add dialog |
| **2.8** | done | `listMembers` API client pattern |
| **570ce4b0** | shipped | Dialog M3 layout baseline |
| **ux-design-participant-roster-admin.md** | as-built | Layout + guardrails §2–3 |
| **plan-participant-roster-ux-enhancements.md** | approved | Lot A requirements |

### Architecture compliance

- **Monorepo V2:** [ARCH.md](../../ARCH.md) — front-only change under `apps/web/`.
- **Auth:** Session + CSRF on mutations unchanged (`credentials: 'include'`).
- **Authorization:** Dialogs only open for users who already pass admin gates on parent pages — no new permission flags.
- **API:** Reuse `POST /v1/seasons/{seasonId}/participants` and `POST .../events/{eventId}/participants` — [openapi/participants.yaml](../../services/api/openapi/participants.yaml).

### File structure (expected touch list)

| File | Action |
|------|--------|
| `apps/web/src/app/pages/admin-participants/add-participant-dialog.ts` | UPDATE — autocomplete + tests |
| `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts` | UPDATE — autocomplete |
| `apps/web/src/app/pages/admin-participants/admin-participants.ts` | UPDATE — pass `troupeId` in dialog data |
| `apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts` | UPDATE — pass `troupeId` in dialog data |
| `apps/web/src/app/shared/participant-add/*` | NEW (optional) — shared typeahead field |
| `apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts` | NEW |
| `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.spec.ts` | NEW (or extend existing spec) |

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **Unit (Vitest)** | Member load ; query filter ; option select prefills email ; free-text create ; ACTIVE exclusion |
| **Component** | Dialog renders autocomplete ; avatar in option template |
| **Regression** | `admin-participants.spec.ts`, `admin-event-participants.spec.ts` still green |

### Previous story intelligence

**From story 3.8 (done):**

- Create endpoints and FR45 linking are stable — **extend UI only**.
- Season list already includes membership-synced rows — typeahead must not encourage re-adding them.
- Duplicate explicit name → **409** French message already in dialog `errorMessage`.

**From recent UX fixes (2026-06-06):**

- **`570ce4b0`** — participant dialog layout: inner wrapper, dynamic subscript, paragraph hints, `overflow: visible`. **Do not** revert when adding `mat-autocomplete`.
- **`0af82cb3`** — Dispos subject selector uses event roster — unrelated to add dialog but confirms avatar+name row pattern is established.
- **`5b4358cd`** — `ux-design-participant-roster-admin.md` documents as-built contracts for Lot A.

**From 17.15 (done):**

- `event-organizers-dialog` is the canonical **troupe member autocomplete** in admin context — reuse `listMembers(troupeId, 0, 100)` + client filter, not a new search service.

### Git intelligence (recent commits)

| Commit | Relevance |
|--------|-----------|
| `5b4358cd` | UX as-built doc for participant admin — story guardrails |
| `570ce4b0` | Dialog layout to preserve |
| `41bc5f1b` | Plan Lot A approved — source of AC |
| `0af82cb3` | Avatar+name option row precedent (Dispos) |

### Latest tech notes

- **Angular 21.2** + **@angular/material 21.2** — `MatAutocompleteModule` already used in production code ; no new dependencies.
- **Autocomplete in dialogs:** Panel positioning can clip inside scrollable parents — shipped fix sets `overflow: visible` on `mat-dialog-content` ; retain it.
- **`mat-option` + custom content:** Supported ; use `[value]` carrying member id or email for selection handler.

### Project context reference

- [project-context.md](../../project-context.md) — stack, FRONTEND_UI.md, test commands
- [plan-participant-roster-ux-enhancements.md](../planning-artifacts/plan-participant-roster-ux-enhancements.md) — Lot A
- [ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md) — as-built §2–3
- [3-8-rosters-participants-saison-et-evenement.md](./3-8-rosters-participants-saison-et-evenement.md) — parent story
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — M3 checklist

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log

- Reused inline autocomplete in both dialogs (duplication < shared component threshold per story).
- Season dialog passes `troupeId` via `season.troupeId` (canonical on `SeasonResponse`).
- Fixed stale `resolveSeasonSlug` mocks in parent page specs → `resolveSeasonInTroupe` + canonical route params.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-06-06).
- **2026-06-06:** Season + event add dialogs: `mat-autocomplete` on **Nom affiché** with `app-user-avatar` rows, client filter on `listMembers(troupeId, 0, 100)`, exclusion sets (ACTIVE season participants / event roster userIds), free-text path preserved, optional Epic 8 hint appended.
- **M3 checklist:** M3-1–M3-3 validated ; M3-4 N/A ; no waived items.
- **Tests:** 9 season dialog + 6 event dialog + 5 filter unit tests ; parent open-dialog specs updated ; all story-touched specs green (20/20). Full web suite: échecs pré-existants hors scope ; build OK.
- **2026-06-06 (code review):** Refactor autocomplete → signal + `(input)` + `userId` string values (pattern organizers) ; email cleared on re-type / member sans email ; event `excludedDisplayNames` ; tests `onMemberOptionSelected` + AC5 `'alice'`.
- **2026-06-06 (guardrails):** TEA automate +13 tests (errors 409/403, cap 8, avatar overlay, hints AC4) → 33/33 green on story specs.

### File List

- `apps/web/src/app/shared/participant-add/participant-member-suggestions.ts` (new)
- `apps/web/src/app/shared/participant-add/participant-member-suggestions.spec.ts` (new)
- `apps/web/src/app/core/troupes/troupe-api.service.ts` (modified — `gender` on `TroupeMemberAdmin` for avatar)
- `apps/web/src/app/pages/admin-participants/add-participant-dialog.ts` (modified)
- `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts` (modified)
- `apps/web/src/app/pages/admin-participants/admin-participants.ts` (modified)
- `apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts` (modified)
- `apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts` (new)
- `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.spec.ts` (new)
- `apps/web/src/app/pages/admin-participants/admin-participants.spec.ts` (modified)
- `apps/web/src/app/pages/admin-event-participants/admin-event-participants.spec.ts` (modified)
- `_bmad-output/test-artifacts/automation-summary.md` (new)
- `_bmad-output/test-artifacts/test-design-story-3-8c.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — story `done`)

### Change Log

- 2026-06-06: Story created from plan Lot A (`bmad-create-story`).
- 2026-06-06: Lot A typeahead on season/event add participant dialogs (dev-story).
- 2026-06-06: Code review patches — signal autocomplete pattern, email stale fixes, event displayName exclusion, tests renforcés.
- 2026-06-06: Guardrail tests (TEA automate) ; story closed `done`.

### Review Findings

- [x] [Review][Decision] Exclusion event roster par `displayName` — **Décision : 1A** — aligner le dialog événement sur la saison (`excludedDisplayNames` depuis le roster).
- [x] [Review][Decision] Suggestions à focus vide — **Décision : 2B** — garder « taper pour filtrer » (`[]` si requête vide) ; conforme AC1.
- [x] [Review][Patch] Exclusion event roster par `displayName` (décision 1A) — appliqué : `excludedDisplayNames` depuis `listEventParticipantRoster`.
- [x] [Review][Patch] Crash autocomplete (`FormControl` + objet) — appliqué : pattern signal + `(input)` + `mat-option [value]="member.userId"` + `onMemberOptionSelected` (aligné `event-organizers-dialog`).
- [x] [Review][Patch] Email périmé après sélection d'un membre sans email — appliqué : `this.email.set(member.email ?? '')`.
- [x] [Review][Patch] Email non effacé après édition libre du nom — appliqué : vidage email si `hadSelection` dans `onDisplayNameInput`.
- [x] [Review][Patch] Abonnement `valueChanges` sans teardown — appliqué : suppression `FormControl` / `valueChanges` (signal + `(input)`).
- [x] [Review][Patch] Code mort `onDisplayNameInput` — appliqué : méthode branchée au template ; suppression `displayTroupeMemberSuggestion` inutilisé.
- [x] [Review][Patch] Tests contournent le flux autocomplete — appliqué : tests via `onMemberOptionSelected(userId)`.
- [x] [Review][Patch] Test AC5 exclusion saison non probant — appliqué : requête `'alice'` → `[]`.
- [x] [Review][Patch] `excludedDisplayNames` non testé dans le helper — appliqué : test ajouté dans `participant-member-suggestions.spec.ts`.
- [x] [Review][Defer] Échecs API silencieux (`listMembers` / roster) — [`add-participant-dialog.ts:228`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts) — deferred, même pattern que `event-organizers-dialog.ts` ; pas de régression introduite par rapport à la référence story.
- [x] [Review][Defer] Double fetch réseau à l'ouverture du dialog — parent + dialog rechargent participants/roster — deferred, optimisation hors scope Lot A.
- [x] [Review][Defer] Duplication template/logique entre dialogs saison et événement — deferred, story autorise inline si < ~40 lignes ; helper filtre déjà extrait.
- [x] [Review][Defer] Pas d'état loading pendant `initializeSuggestions` — deferred, `event-organizers-dialog` n'en a pas non plus.
- [x] [Review][Defer] M3-5 checklist sans artefact attaché — deferred, validation manuelle documentée dans Dev Notes ; pas de preuve automatisée viewport 480px.
- [x] [Review][Defer] `openAddDialog` retour silencieux si `troupeId` manquant — deferred, pattern défensif pré-existant sur les pages parentes.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (plan / FR / stories)
- [x] Section **Material 3** remplie (admin UI dialogs)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` / `ng build` mentionnés

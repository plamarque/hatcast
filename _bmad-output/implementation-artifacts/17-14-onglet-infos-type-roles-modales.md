# Story 17.14: Infos tab — event type and roles (modals)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — UX backlog #3)

## Story

As an **organizer**,
I want **event type and role requirements on the Infos tab** with a dedicated modal to customize them,
so that **the create/edit dialog stays focused on scheduling** (title, date/time, location, description).

## Acceptance Criteria

1. **Given** event detail **Infos** tab, **when** loaded, **then** **format** (icon + label) and **role summary** (emoji + label + counts for slots &gt; 0, or « Aucun besoin renseigné » on tab; dialog summary may use « Aucun rôle configuré ») are visible for all users. [Source: epics 17.14 AC1; copy aligned 2026-05-25 review]
2. **Given** `canManageEvents`, **when** Infos tab is shown, **then** a discreet **edit icon** (`aria-label` « Modifier format et besoins ») opens a **dedicated Material dialog** — not inline editing on the tab. [Source: epics 17.14; SCP §5; ux-backlog #3; review 2026-05-25]
3. **Given** the type/roles dialog, **when** the user changes **role counts only**, **then** `templateType` **remains unchanged** (format is not inferred from slots). **Given** the type/roles dialog, **when** the user changes **template type** via the format dropdown, confirms template overwrite, or saves, **then** behavior matches prior dialog logic (template picker, « Changement de format » confirm, summary vs grid, counts 0–`ROLE_COUNT_MAX`). `detectTemplateFromRoles` is used **only** as fallback when API `templateType` is missing or invalid — **not** on role count edits. [Source: Story **3.4**; amend SCP 2026-06-08 / story **17.37**]
4. **Given** save from the dialog succeeds, **when** PATCH returns, **then** `eventUpdated` refreshes detail; **Équipe** tab sees updated `roleSlots` (parent `event` signal); snackbar in French (e.g. « Format et besoins enregistrés »). [Source: epics 17.14 AC4; `onEventInfosUpdated`; copy aligned 2026-05-25 review]
5. **Given** `EventFormDialog` (create **or** edit), **when** opened, **then** **no** type select, template-change confirm, role summary, « Personnaliser », or role grid; submit sends **only** planning fields (`title`, `startsAt`, `location`, `description`). [Source: epics 17.14 AC2; SCP]
6. **Given** **create** from season agenda, **when** saved, **then** POST **omits** `templateType` and `roleSlots`; API applies defaults (`cabaret` + template slots per `EventService.create`). Organizer customizes later on Infos. [Source: `EventService.kt` L99–105]
7. **Given** **edit** from `EventFormDialog`, **when** saved, **then** PATCH **omits** `templateType` and `roleSlots` (JsonNullable absent = unchanged). [Source: 3.4 PATCH semantics; 17.12 slug pattern]
8. **Given** `!canManageEvents`, **when** Infos tab loads, **then** type + role summary are read-only; **no** customize CTA (mirror equity tag read-only chip pattern in **17.8**). [Source: `event-infos-tab` equity section]
9. **Given** tests, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** new dialog + Infos specs pass; `event-form-dialog` regressions guard removed UI and omitted API fields; existing **17.8** / **17.12** / **17.13** blocks in the same spec file stay green. [Source: repo norms]

## Tasks / Subtasks

- [x] **Extract type/roles dialog** (AC: 2, 3)
  - [x] Add [`event-type-roles-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts) (+ `.spec.ts`) — **single** modal for type + roles (PO open question #3: one dialog, not tabs).
  - [x] Move from [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts): `selectedTemplateType`, `roleSlots`, `showRoleInputs`, `showTemplateChangeConfirmation`, `pendingTemplateId`, `onTemplateSelected`, `confirmTemplateChange`, `cancelTemplateChange`, `enableCustomization`, `hideCustomization`, `onRoleCountChange`, `roleCount`, `summaryRoles`, and related template imports from [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts).
  - [x] Dialog data: `{ event: EventResponse }` or `{ templateType, roleSlots }` initial state; result: `undefined` (cancel) or `{ templateType, roleSlots }` on save.
  - [x] Reuse markup/styles from [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html) L36–99 and [`event-form-dialog.scss`](../../apps/web/src/app/pages/season-home/event-form-dialog.scss) (`.template-confirm`, `.roles-summary`, `.roles-grid`) — colocate in dialog component or shared partial SCSS under `event-detail/`.
  - [x] On **Enregistrer**: `EventApiService.updateEvent(seasonId, eventId, { templateType, roleSlots: normalizeRoleSlots(roleSlots) })` — **full replace** of `roleSlots` when key present (3.4).

- [x] **Infos tab — read + CTA** (AC: 1, 2, 4, 8)
  - [x] Extend [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) / `.html` / `.scss`:
    - Section **Format et besoins** after **Lieu** (before equity tag section): icon + `getEventTypeLabel(event().templateType)`; inline role summary.
    - If `canManageEvents()`: `mat-icon-button` (edit) opens `EventTypeRolesDialog` via `MatDialog` (width ~`min(100vw - 2rem, 32rem)`).
  - [x] On dialog close with result: PATCH, `eventUpdated.emit`, snackbar; handle API errors like equity tag (`MatSnackBar` + French `errorMessage`).
  - [x] Import helpers: `getEventTypeIcon`, `getEventTypeLabel`, `rolesWithSlots`, `ROLE_LABELS`, `ROLE_EMOJIS`, `normalizeRoleSlots`.

- [x] **Slim `EventFormDialog`** (AC: 5, 6, 7)
  - [x] Remove template/role block from HTML; remove state + methods from TS; drop `templateType` from `FormBuilder` group.
  - [x] `submit()` payload:
    ```typescript
    { title, startsAt, location, description }  // no templateType, roleSlots, slug
    ```
  - [x] Remove unused imports from `event-types` in form dialog (keep only if still needed — likely none).
  - [x] **Do not** remove organizer/participant sections (**17.15**).

- [x] **Tests** (AC: 9)
  - [x] New `event-type-roles-dialog.spec.ts`: template change confirm; save emits result; role count clamp.
  - [x] Extend [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts): type label visible; role summary; CTA hidden without manage; dialog open + PATCH `{ templateType, roleSlots }`; `eventUpdated` emitted.
  - [x] Extend [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts):
    - DOM: no `formcontrolname="templateType"`, no « Personnaliser », no `.roles-grid`, no « Changement de type ».
    - `createEvent` / `updateEvent` bodies omit `templateType` and `roleSlots`.
  - [x] Optional: [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) — Infos shows type after mock event with `templateType: 'match'`.

- [x] **Regression / integration sanity**
  - [x] After PATCH roles, open **Équipe** tab: slot rows match new counts (parent `event` updated — no extra reload).
  - [x] Season agenda card still shows type icon from `ev.templateType` after Infos save (list refresh if user returns to agenda — out of scope unless agenda caches stale event; document if observed).

## Dev Notes

### Product and UX rules

- **Placement:** Event detail → tab **Infos** only for type/roles editing — **not** `EventFormDialog` (SCP 2026-05-25, same split as equity tag **17.8**).
- **Create flow:** Light modal creates spectacle with API default **cabaret** + cabaret role template; organizer opens spectacle → Infos → customizes type/roles before composition/draw. Acceptable per ux-backlog « noyau planning ».
- **Edit planning vs configuration:** « Modifier le spectacle » from admin menu still opens slim dialog (title, date, location, description only). Type/roles: Infos CTA only.
- **One modal:** Combine type select + role summary/customization in `EventTypeRolesDialog` (move existing UX block wholesale — avoids two modals).
- **French copy:** UI label **Format et besoins** (section Infos, dialog title, snackbar succès). Keep dialog strings (« Changement de type de spectacle », « Personnaliser », « Voir résumé », role labels from `ROLE_LABELS`). Empty tab summary: « Aucun besoin renseigné ».
- **Read-only members:** Show type + roles summary without CTA when `!canManageEvents` (even if all role counts are 0).

### Explicit non-goals (scope guard)

- Do **not** move organizers or participants out of `EventFormDialog` (**17.15**).
- Do **not** add equity tag to form (**17.8** done — regression guard stays).
- Do **not** change slug, datetime pickers (**17.12**, **17.13**), or API enums/validation (**3.4** backend unchanged).
- Do **not** change draw/chances/stats (**17.9**, **17.10**).
- Do **not** add type/roles to season **create** wizard elsewhere — only Infos post-create/edit path.
- Do **not** implement backend changes.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Dialog pattern | Mirror [`event-equity-tag-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-equity-tag-dialog.ts): `MAT_DIALOG_DATA`, `MatDialogRef`, `afterClosed` in Infos tab |
| PATCH body | `{ templateType: selectedTemplateType, roleSlots: normalizeRoleSlots(roleSlots) }` — both keys on save |
| Edit load in dialog | Init from `event.templateType` (prefer API value over `detectTemplateFromRoles` only — **3.4** review fix) + `normalizeRoleSlots(event.roleSlots)` |
| Create form | Omit optional fields; API `EventTypes.DEFAULT_CREATE` = `cabaret` |
| Update form | Omit `templateType`/`roleSlots` so PATCH does not reset roles when editing title/date |
| Parent refresh | `event-detail` already `(eventUpdated)="onEventInfosUpdated($event)"` — reuse |
| Équipe tab | Uses `input.required<EventResponse>()` — updates when parent `event` signal changes |
| Styles | Move or duplicate `.template-confirm`, `.roles-summary`, `.roles-grid` from `event-form-dialog.scss` |

**Suggested `EventTypeRolesDialogData`:**

```typescript
export interface EventTypeRolesDialogData {
  seasonId: string
  eventId: string
  templateType: string
  roleSlots: Record<string, number>
}

export type EventTypeRolesDialogResult =
  | { templateType: EventTypeId; roleSlots: Record<string, number> }
  | undefined
```

**Suggested Infos tab section (sketch):**

```html
<section class="event-infos__format" aria-labelledby="event-infos-format-label">
  <div class="event-infos__format-header">
    <span id="event-infos-format-label" class="event-infos__label">Format et besoins</span>
    @if (canManageEvents()) {
      <button type="button" mat-icon-button aria-label="Modifier format et besoins" (click)="openTypeRolesDialog()">
        <mat-icon>edit</mat-icon>
      </button>
    }
  </div>
  <!-- type row + roles summary -->
</section>
```

Place section **after Lieu**, **before** Groupe de spectacles (consistent field order).

### API contract (unchanged — Story 3.4)

| Operation | Fields | Notes |
|-----------|--------|--------|
| POST create | `templateType?`, `roleSlots?` | Omitted → `cabaret` + `RoleTemplates.slotsFor(cabaret)` |
| PATCH update | `templateType?`, `roleSlots?` | Omitted → unchanged; present → validate + persist (roleSlots full replace) |

### Previous story intelligence

- **17.8** (done): Infos tab + dialog + PATCH + `eventUpdated` + snackbar — **copy this wiring**, not equity-specific APIs.
- **17.12** (done): Omit fields from form submit that moved off-dialog (`slug`) — same pattern for `templateType`/`roleSlots`.
- **17.13** (review/in progress): Form may use `startDate`/`startHour`/`startMinute` — do not touch datetime controls; keep `fillRequiredCreateFields` compatible when editing specs.
- **3.4** (done): All template/role business rules live in [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) + API — **reuse**, do not reimplement templates.
- **6.2** (done): Full-screen detail with Infos/Dispos/Équipe tabs — this story only extends **Infos**.

### Git intelligence

- `4e020b8` — Infos equity tag dialog pattern (reference implementation).
- `a32190b` — SCP added 17.12–17.15; 17.14 = move type + roles off form.
- Working tree may include 17.13 datetime changes — implement 17.14 on latest `event-form-dialog` (no `templateType` in form after this story).

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| New dialog | `apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts` (+ spec) |
| Infos tab | `apps/web/src/app/pages/event-detail/event-infos-tab.{ts,html,scss}` (+ spec) |
| Slim form | `apps/web/src/app/pages/season-home/event-form-dialog.{ts,html,scss}` (+ spec) |
| Domain | `apps/web/src/app/core/events/event-types.ts` (no change expected) |
| API client | `apps/web/src/app/core/events/event-api.service.ts` (`UpdateEventBody` already has fields) |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- **Dialog:** Changing template with customized roles shows confirm panel; Appliquer resets slots; Enregistrer calls `updateEvent` with normalized map.
- **Infos:** `canManageEvents: false` → no customize button; `true` → opens dialog with `MatDialog.open(EventTypeRolesDialog, ...)`.
- **Form regression:** `innerHTML` must not match `/Type de spectacle/` select in form OR assert `querySelector('[formcontrolname="templateType"]')` null.
- **Payload:** Inspect `createEvent` mock 2nd arg — no `templateType`/`roleSlots`; `updateEvent` 3rd arg same.
- **Do not break:** equity tag specs, slug omit specs, participants permission specs, 17.13 datetime specs if present.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.14]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md` — §5 17.14]
- [Source: `_bmad-output/planning-artifacts/ux-backlog-event-form-dialog.md` — #3, triage]
- [Source: `_bmad-output/implementation-artifacts/3-4-types-devenement-et-roles-requis-optionnels.md` — templates, PATCH]
- [Source: `_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md` — Infos + dialog pattern]
- [Source: `_bmad-output/implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md` — omit fields from submit]
- [Source: `_bmad-output/implementation-artifacts/17-13-formulaire-spectacle-datepicker-heure.md` — form scope guard]
- [Source: `apps/web/src/app/pages/season-home/event-form-dialog.ts` — lines 91–315, 329–336 to relocate/remove]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt` — create defaults]
- [Source: `PLAN.md` — Epic 17 table 17.14]

### Review Findings

- [x] [Review][Decision] Terminologie « Format et besoins » — **Résolu (1A)** : AC et sketch story mis à jour pour refléter le rename produit ; le code actuel est la référence.
- [x] [Review][Decision] CTA gestionnaire — **Résolu (2A)** : conserver `mat-icon-button` + `aria-label` ; AC2 mis à jour.
- [x] [Review][Patch] Test manquant : échec PATCH type/rôles [`event-infos-tab.spec.ts`] — Ajout test snackbar + pas d’`eventUpdated` si PATCH échoue.
- [x] [Review][Dismiss] Libellé vide « Aucun besoin renseigné » — Non applicable après 1A (terminologie retenue).
- [x] [Review][Patch] `mat-select` après annulation changement de type [`event-type-roles-dialog.ts`] — `writeValue` sur `#formatSelect` dans `cancelTemplateChange` + test annulation.
- [x] [Review][Defer] Renommage copy tag d’équité dans le même commit [`event-equity-tag-dialog.ts`] — Hors périmètre strict 17.14 mais cohérent avec « Groupe de spectacles » sur l’onglet Infos ; acceptable en lot UX. CTA sans tag finalisé ensuite : **« Mettre dans un groupe »** (2026-05-25, hors 17.14).
- [x] [Review][Defer] Fichiers `event-form-dialog.*` absents du commit `7041ab3` — AC5–7 déjà satisfaits dans l’arbre (payload sans `templateType`/`roleSlots`, régressions spec) ; pas de régression détectée sur la branche actuelle.

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- PATCH for type/roles runs in `EventInfosTab.persistTypeRoles` (same pattern as equity tag **17.8**); dialog returns result only.
- Équipe tab refresh: parent `event` signal updated via `eventUpdated` — no extra reload code required.
- Agenda list refresh after Infos save: out of scope; existing list uses `templateType` from loaded events.

### Completion Notes List

- Added `EventTypeRolesDialog` with template-change confirm, role summary/grid, and normalized close payload.
- Extended Infos tab: read-only type + roles for all users; CTA + PATCH + snackbar for managers.
- Slimmed `EventFormDialog` to planning fields only; create/update omit `templateType` and `roleSlots` (API defaults on create).
- Tests: 425/425 pass; `npm run build -w @hatcast/web` OK.

### File List

- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts` (new)
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.html` (new)
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.scss` (new)
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.spec.ts` (new)
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.scss`
- `apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.html`
- `apps/web/src/app/pages/season-home/event-form-dialog.scss`
- `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-25: Story 17.14 — type/roles moved from event form to Infos tab + `EventTypeRolesDialog`.
- 2026-05-25: Code review — AC alignés sur libellés « Format et besoins » et CTA icône (décisions 1A, 2A).
- 2026-05-25: Code review patches — test échec PATCH, reset `mat-select` après Ignorer, `overrideProvider(MatSnackBar)` dans specs Infos.

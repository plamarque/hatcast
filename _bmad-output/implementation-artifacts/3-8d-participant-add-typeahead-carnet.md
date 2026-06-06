# Story 3.8d: Participant add typeahead — carnet pool

---
baseline_commit: cdf6f6c03fd7a59fbcacd067b7dc44fd335319d7
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **authorized season or event participant administrator**,  
I want **name suggestions to include troupe members, carnet externes, and relevant season roster rows**,  
so that **I can re-invite Ruben or Laetitia without retyping** while **preserving name-only creation** when no suggestion fits (**ADR-0021** P3, **FR43–FR45**).

**Plan source:** [plan-participant-roster-ux-enhancements.md](../planning-artifacts/plan-participant-roster-ux-enhancements.md) — **Lot A-ext** (approved 2026-06-06).  
**Extends:** story **3.8c** (done — do **not** reopen CR).

## Acceptance Criteria

1. **Given** an organizer on **« Ajouter un participant »** (season or event admin), **when** they type in **Nom affiché**, **then** matching suggestions include **active carnet rows** (`MEMBER` + `TROUPE_ADMIN` + `EXTERNE`) **and** **context-appropriate season roster rows** (ACTIVE season participants for event add; deduped against carnet), each row showing **display name** and **`app-user-avatar`**. [Source: ADR-0021 §4.3; epics 3.8d AC1; plan Lot A-ext]
2. **Given** a carnet or season-roster suggestion is selected, **when** the dialog is submitted, **then** **display name** and **email** are prefilled when available; **`troupeMembershipId`** is sent when the selection maps to a carnet row (prep for stable re-inclusion); scope hints/checkbox from story **3.23** remain correct. [Source: epics 3.8d AC2; 3.23 UI]
3. **Given** no suggestion is selected, **when** the organizer submits a non-empty name, **then** a **name-only** (or email-assisted) participant is created unchanged — **FR45** semantics preserved. [Source: epics 3.8d AC3; story **3.8c** AC3]
4. **Given** an **EXTERNE** carnet row **without** linked `userId` (name-only contact), **when** the organizer types a matching name, **then** that externe **appears** in suggestions (fixes 3.8c filter that required `userId != null`). [Source: ADR-0021 §1 name-only carnet; 3.23 Dev Notes]
5. **Given** exclusion rules from **3.8c**, **when** suggestions are built, **then** **ACTIVE** season participants are excluded on **season add** ; people already on **event roster** are excluded on **event add** (by `userId` and normalized `displayName`). [Source: 3.8c AC5; SCP §3.8d AC4]
6. **Given** the shipped dialog shell, **when** autocomplete is extended, **then** preserve **inner `.participant-form-dialog`**, `subscriptSizing="dynamic"`, paragraph hints, **`overflow: visible`** on `mat-dialog-content`, and **3.23** scope hints/checkbox — no layout regression. [Source: ux-design-participant-roster-admin.md §2; 3.8c AC6]
7. **Non-goals:** global HatCast user search; backend search endpoint; edit-dialog typeahead; reopening **3.8c** review; scoped dispos/agenda (**3.25**). [Source: ADR-0021 out of scope; plan Lot A-ext]

**Product coverage:** FR43–FR45; ADR-0021 P3; plan Lot A-ext; [ux-design-participant-roster-admin.md](../planning-artifacts/ux-design-participant-roster-admin.md) §2–3.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** extended typeahead, **when** implemented, **then** keep `mat-form-field` (outline) + `matInput` + `mat-autocomplete` + `mat-option` ; optional muted **« Externe »** suffix on carnet `EXTERNE` rows (same flex row as **3.8c**). [Source: FRONTEND_UI.md; 3.8c M3-1]

**M3-2. Tokens & thème** — **Given** option rows and hints, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; update hint copy to reflect expanded pool (French). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** add dialog is open, **then** autocomplete panel and option rows remain readable ; dialog width `min(100vw - 2rem, 28rem)`. [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** — admin-only dialogs.

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; note waived items in Dev Notes.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` only — **no** `services/api/` changes unless blocking gap found (expected: reuse `listMembers` + existing participant list APIs + `troupeMembershipId` on create from **3.23**).
- [x] **Unified suggestion model** (AC: 1, 2, 4)
  - [x] Extend [`participant-member-suggestions.ts`](../../apps/web/src/app/shared/participant-add/participant-member-suggestions.ts) (or rename to `participant-add-suggestions.ts` with re-export) with `ParticipantAddSuggestion` type: stable **`key`** for `mat-option [value]`, fields for displayName, email, userId, avatarUrl, gender, `baselineRole`, `troupeMembershipId`, `source` (`carnet` | `season`).
  - [x] **`buildParticipantAddSuggestions`**: merge carnet (`listMembers` ACTIVE: MEMBER | TROUPE_ADMIN | EXTERNE — **allow `userId == null`**) + season roster rows (`SeasonParticipantAdmin[]`) ; dedupe by `troupeMembershipId`, then `userId`, then normalized `displayName` ; client filter + cap 8.
- [x] **Season add dialog** (AC: 1–6) — [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts)
  - [x] Replace `filterTroupeMemberSuggestions` + `userId`-only option values with unified suggestions.
  - [x] `initializeSuggestions`: keep `listMembers` + `listSeasonParticipants` ; pass season rows into builder (season ACTIVE rows feed dedupe/exclusion, not duplicate suggestions).
  - [x] `optionSelected` → prefill name/email ; track `selectedSuggestion` with `troupeMembershipId` when present.
  - [x] `submit`: include `troupeMembershipId` in create body when carnet selection ; member path unchanged.
  - [x] Update hint: carnet + externes + participants saison (French).
- [x] **Event add dialog** (AC: 1–6) — [`add-event-participant-dialog.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts)
  - [x] Same suggestion builder ; add `listSeasonParticipants` fetch alongside event roster (season ACTIVE rows appear when not already on event roster / deduped).
  - [x] Preserve **3.23** scope hint + « Ajouter aussi à la saison » checkbox behaviour.
- [x] **Option template** (AC: 1, M3-1)
  - [x] Keep `app-user-avatar` size 24 ; add muted **Externe** label when `baselineRole === 'EXTERNE'`.
- [x] **Tests** (AC: 1–5)
  - [x] Extend [`participant-member-suggestions.spec.ts`](../../apps/web/src/app/shared/participant-add/participant-member-suggestions.spec.ts): EXTERNE without userId ; season row merge ; dedupe carnet vs season ; cap 8 ; exclusions.
  - [x] Update [`add-participant-dialog.spec.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts) and [`add-event-participant-dialog.spec.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.spec.ts): externe suggestion ; `troupeMembershipId` on submit ; season roster suggestion on event dialog.
  - [x] Regression: `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.

### Review Findings

- [x] [Review][Decision] Hint « participants de la saison » sur le dialog saison — **Résolu : option 1** — hint carnet-only sur dialog saison ; hint complet (carnet + saison) conservé sur event add.
- [x] [Review][Patch] Hint carnet-only sur dialog saison [`add-participant-dialog.ts:106`] — Corrigé : *« Suggestions : membres et externes du carnet. »*
- [x] [Review][Patch] `troupeMembershipId` envoyé pour sélections roster saison (AC2) [`add-participant-dialog.ts:307`, `add-event-participant-dialog.ts:326`] — Corrigé : `selection?.source === 'carnet' && selection.troupeMembershipId`.
- [x] [Review][Patch] Test manquant : submit event dialog avec sélection roster saison [`add-event-participant-dialog.spec.ts`] — Ajouté : `submits season roster selection without troupeMembershipId`.
- [x] [Review][Defer] M3-5 viewport 480px non automatisé — deferred, waived explicitement dans Dev Notes (revue manuelle).

---

## Dev Notes

### Product and UX rules

- **Pool (ADR-0021 §4.3):** `MEMBER` + `TROUPE_ADMIN` + `EXTERNE` active carnet + season roster rows per UI context.
- **Season add context:** carnet is primary ; season ACTIVE rows excluded (AC5) ; REMOVED season rows not in list API — re-inclusion via carnet EXTERNE after **3.23**.
- **Event add context:** carnet + season ACTIVE participants not already on event roster (useful for season-scoped guests excluded from one spectacle or quick pick).
- **Name-only externe:** must appear without `userId` — use **`membership.id`** as option key (`m:{id}`).
- **Submit with carnet pick:** pass `troupeMembershipId` ; backend **3.23** upserts/reactivates by carnet match even for EXTERNE (guest path ignores EXTERNE id in `resolveActiveMemberMembership` but name/email must match carnet row).
- **Free-text path:** unchanged — no `troupeMembershipId` ; server cascade creates carnet (**3.23**).
- **Hint copy (FR):** replace « membres actifs de la troupe » → e.g. *« Suggestions : membres, externes du carnet et participants de la saison. »*

### Previous story intelligence

**From 3.8c (done):** Signal autocomplete pattern preserved ; helper extended in place.

**From 3.23 (done):** Scope hints/checkbox via `isGuestScopeSuggestion()` ; create APIs accept `troupeMembershipId`.

### Project context reference

- [docs/adr/0021-troupe-externes-carnet-invitations.md](../../docs/adr/0021-troupe-externes-carnet-invitations.md) — §4.3, P3
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log

- Extended `participant-member-suggestions.ts` in place (no rename) with `buildParticipantAddSuggestions` + `isGuestScopeSuggestion`.
- Season add: `includeSeasonRoster: false` — pool is carnet-only ; season list used for exclusion sets only.
- Event add: `includeSeasonRoster: true` — merges ACTIVE season rows not on event roster.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-06-06).
- **2026-06-06:** Lot A-ext — unified suggestion pool (carnet MEMBER/ADMIN/EXTERNE + season roster on event add) ; EXTERNE sans `userId` ; `troupeMembershipId` on submit ; hint FR mis à jour ; label « Externe » dans les options.
- **M3 checklist:** M3-1–M3-3 validés ; M3-4 N/A ; M3-5 revue manuelle (pas de preuve viewport 480px automatisée).
- **Tests:** 56/56 green on story specs ; `ng build` OK.
- **2026-06-06 recette manuelle (Patrice, seed Improbots):** A–J PASS après fix BUG-010 (`displayWith`) et BUG-011 (include roster API pour membre exclu spectacle).
- **2026-06-06 Murat:** cahier `_bmad-output/test-artifacts/recette-manuelle-story-3-8d.md` ; E2E `recette-3.8d.spec.ts` + fixture `POST /v1/e2e/fixtures/story-3-8d/reset` (T1 uniquement — §10 staging).

### File List

- `apps/web/src/app/shared/participant-add/participant-member-suggestions.ts` (modified)
- `apps/web/src/app/shared/participant-add/participant-member-suggestions.spec.ts` (modified)
- `apps/web/src/app/pages/admin-participants/add-participant-dialog.ts` (modified)
- `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts` (modified)
- `apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts` (modified)
- `apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.spec.ts` (modified)
- `apps/web/src/app/core/participants/participant-api.service.ts` (modified)
- `apps/web/e2e/recette-3.8d.spec.ts` (new)
- `apps/web/e2e/helpers/story-3-8d.ui.ts` (new)
- `apps/web/e2e/helpers/e2e-api.ts` (modified)
- `apps/web/e2e/fixtures/story-3-8d.constants.ts` (new)
- `apps/web/playwright.config.ts` (modified)
- `apps/web/e2e/README.md` (modified)
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E2eFixtureService.kt` (modified)
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E2eFixtureController.kt` (modified)
- `services/api/src/main/kotlin/com/hatcast/api/e2e/dto/Story38dFixtureResponse.kt` (new)
- `services/api/README.md` (modified)
- `ISSUES.md` (modified — BUG-010, BUG-011, LIMIT-004)
- `_bmad-output/test-artifacts/recette-manuelle-story-3-8d.md` (new)
- `_bmad-output/implementation-artifacts/3-8d-participant-add-typeahead-carnet.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modified)

### Change Log

- 2026-06-06: Story created (`bmad-create-story`) — Lot A-ext / ADR-0021 P3.
- 2026-06-06: Lot A-ext typeahead carnet pool implemented (dev-story).
- 2026-06-06: Code review — hint saison contextualisé, AC2 `troupeMembershipId` carnet-only, test submit roster saison.
- 2026-06-06: Recette manuelle PASS ; fix BUG-010/011 ; E2E Murat (T1) ; story done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR / epics / plan)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` mentionné

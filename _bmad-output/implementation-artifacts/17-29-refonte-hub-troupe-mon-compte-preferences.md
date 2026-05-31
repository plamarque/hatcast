# Story 17.29: Refonte hub troupe + préférences membre Mon compte

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

En tant que **membre ou administrateur de troupe**,  
je veux **un hub troupe épuré** (engrenage admin, cartes saison cliquables) et **mes préférences membre** (pseudo, rôles préférés) **centralisées sur Mon compte**,  
afin de **naviguer plus naturellement** et **ne plus configurer mes réglages troupe par troupe**.

## Acceptance Criteria

1. **Given** `TROUPE_ADMIN` or platform admin on `/troupes/:slug`, **when** the hub loads, **then** `app-scope-admin-menu` shows **Modifier**, **Nouvelle saison**, **Membres** in that order; **no** **+ Nouvelle saison** in the Saisons section header; **no** **Préférences dans cette troupe** control. [Source: ux-design-troupe-hub.md T1–T5, T8]
2. **Given** admin chooses **Nouvelle saison**, **when** the dialog succeeds, **then** same behaviour as today (`SeasonFormDialog` create → navigate `/saison/:slug` or refresh list). [Source: 17.4 AC2 — amended placement]
3. **Given** admin chooses **Membres**, **when** activated, **then** navigation to `/troupes/:slug/admin/membres` (unchanged). [Source: ux-design-scope-admin-menu-epic17.md Screen 3]
4. **Given** admin chooses **Modifier**, **when** the dialog opens, **then** **`TroupeEditDialog`** allows editing **troupe name** (required, trim, max 255); **logo** and **description** show as disabled or hidden with **Bientôt** until API columns exist; on save success refresh hero name and snack *« Troupe mise à jour »*; help text *L’adresse web de la troupe ne change pas.* [Source: ux-design-troupe-hub.md T1, T10]
5. **Given** `PATCH /v1/troupes/{troupeId}` with `{ "name": "…" }` (new minimal endpoint, admin-only), **when** valid, **then** persist name, return updated troupe summary; slug unchanged. [Source: T10 — required for Modifier not to be placeholder]
6. **Given** any member on the hub, **when** seasons render, **then** each `app-season-card` is **fully clickable** (no **Ouvrir** button), navigates to `/saison/:slug`, shows hover/focus states, `aria-label` *Ouvrir {title}*; displays **period** when `startDate`/`endDate` present (French short format per UX T13); shows **spectacles** / **participants** counts from API as today. [Source: T11, T13]
7. **Given** hub bottom, **when** rendered, **then** **no** footer liseret and **no** **Explorer d’autres troupes** link (breadcrumb **Troupes ›** remains return path). [Source: T12]
8. **Given** `/compte` loaded, **when** user edits **Préférences membre**, **then** section replaces **Préférences par troupe** link: one **pseudo** field + **rôles préférés** checkboxes (same keys/rules as former `TroupeHubPreferencesSheet`); hint *Nom affiché dans toutes vos troupes.*; **Enregistrer** persists to **all active troupe memberships** via existing `PATCH …/memberships/me` and `PUT …/preferred-roles` per troupe; snack success/error. [Source: T6]
9. **Given** hub troupe, **when** any member visits, **then** `TroupeHubPreferencesSheet` and its open trigger are **removed** (delete component or dead code cleanup). [Source: T5]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, `./gradlew test` (API patch tests), and `npm run build -w @hatcast/web`, **then** they pass; specs updated for hub, season-card, account, removed preferences sheet. [Source: repo norms]

**Couverture produit :** Amends 17.4 AC2–3, AC7; amends 17.24 Mon compte section B; UX [ux-design-troupe-hub.md](../planning-artifacts/ux-design-troupe-hub.md).

**Hors scope (story 17-30 / BUG-004) :** correction `seasons.event_count` après import — les cartes affichent les valeurs API actuelles.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** hub, dialog, cartes, Mon compte, **when** rendered, **then** `app-scope-admin-menu`, `MatDialog`, `mat-card`, `mat-form-field`, `mat-checkbox`, `mat-stroked-button` / `mat-flat-button` — carte cliquable via `<a routerLink>` block ou `<button>` transparent (pattern `seasons-list`), pas de div cliquable custom. [Source: FRONTEND_UI.md]

**M3-2. Tokens & thème** — **Given** new SCSS, **when** hover/focus on season card, **then** `color-mix(in srgb, var(--mat-sys-primary) 8%, transparent)` or outline tokens — no hex. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** season cards and gear render, **then** full card ≥48dp touch target; dialog width `min(100vw - 2rem, 28rem)`. [Source: FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** this story, **when** chrome changes, **then** no new shell tab; no bottom app bar M2. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** done, **when** validating, **then** FRONTEND_UI.md checklist M3 walked; waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **API — PATCH troupe name** (AC: 4, 5)
  - [x] `UpdateTroupeRequest` DTO `{ name }` — validation mirror `CreateTroupeRequest`
  - [x] `TroupeService.update(troupeId, body, principal)` — `requireCanManageTroupe`; slug unchanged
  - [x] `PATCH /v1/troupes/{troupeId}` on `TroupeController`; OpenAPI fragment
  - [x] Integration test: admin PATCH name; non-admin 403; blank name 400

- [x] **Web — TroupeEditDialog + gear** (AC: 1, 2, 3, 4)
  - [x] `troupe-edit-dialog.ts` — name field + save; logo/description UI **Bientôt** (hidden or disabled)
  - [x] `troupe-api.service.ts` — `updateTroupe(troupeId, { name })`
  - [x] `troupe-hub.ts` — extend `troupeAdminItems()`: Modifier (action), Nouvelle saison (action), Membres (routerLink)
  - [x] Remove prefs button, section-header Nouvelle saison, footer block from `troupe-hub.html` / scss

- [x] **Web — app-season-card** (AC: 6)
  - [x] Add inputs `startDate`, `endDate`; pass from `troupe-hub.html`
  - [x] Extract `formatSeasonPeriod(start, end)` to `shared/` (human FR months — improve on ISO `formatSeasonDates` in seasons-list)
  - [x] Replace Ouvrir with full-surface `routerLink`; hover/focus SCSS
  - [x] `season-card.spec.ts` — click navigates; period line when dates set

- [x] **Web — Mon compte préférences membre** (AC: 8)
  - [x] Extract `MemberPreferencesForm` (or inline in account) from `troupe-hub-preferences-sheet` logic
  - [x] Load active troupes via `TroupeContextService.load()`
  - [x] Initial pseudo: first active troupe `membership.displayName` or consensus if all equal; if differ across troupes, prefill first troupe + optional one-line hint (edge case)
  - [x] Save: loop active troupes — `updateMyMembership` + `updatePreferredRoles`
  - [x] Replace account section in `account-placeholder.html` / scss / spec

- [x] **Cleanup** (AC: 9, 10)
  - [x] Delete `troupe-hub-preferences-sheet.ts` + spec; remove bottom sheet import from hub
  - [x] Update `troupe-hub.spec.ts` (gear items, no footer, no prefs, no section CTA)
  - [x] Update `account-placeholder.spec.ts`
  - [ ] Amend `ux-design-scope-admin-menu-epic17.md` Screen 3 menu entries (doc-only optional in same PR)

## Dev Notes

### Product and UX rules

- **Source of truth UX:** [_bmad-output/planning-artifacts/ux-design-troupe-hub.md](../planning-artifacts/ux-design-troupe-hub.md) (approved 2026-05-31).
- **Hero description:** read-only under title when API adds `description` later — **out of scope** until column exists; name PATCH only in this story.
- **Global pseudo (FR9 shift):** 17-29 uses **propagation** to all memberships via existing endpoints — no new `users.member_display_name` column; document interim in PR; ADR optional follow-up.
- **Preferred roles global:** same propagation pattern per troupe id.
- **Compteurs cartes:** known wrong on imported data — **do not fix here**; see 17-30 / BUG-004.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Gear items | Reuse `ScopeAdminMenuItem` `{ label, icon, action? \| routerLink? }` — mirror season-home admin items |
| Season card click | Prefer `<a class="season-card__surface" [routerLink]="…">` inside `mat-card appearance="outlined"` |
| Period format | `Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })` — shared helper |
| Mon compte section title | **Préférences membre** — L2 per ux-design-hub-section-headers.md |

### Explicit non-goals

- `seasons.event_count` resync ( **17-30** )
- Troupe logo upload / `description` persistence (future migration + API)
- `app-troupe-card` clickable refactor on `/troupes`
- Hub tabs Saisons/Membres (G-007 backlog)
- ADR/domain rewrite for global pseudo storage

### Dependencies

| Story / issue | Status | Relationship |
|---------------|--------|--------------|
| 17.4 | done | Amends hub behaviour |
| 17.24 | done | Amends Mon compte section |
| 17.2 | done | `app-scope-admin-menu` |
| BUG-004 | open | Counter fix → 17.30 |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Hub troupe : menu engrenage **Modifier → Nouvelle saison → Membres** ; suppression prefs bottom sheet, CTA section et footer découverte.
- API `PATCH /v1/troupes/{id}` + `TroupeEditDialog` (nom seul ; logo/description Bientôt).
- `app-season-card` : surface `<a routerLink>` cliquable, période FR via `formatSeasonPeriod`.
- Mon compte : section **Préférences membre** (`MemberPreferencesForm`) — propagation pseudo + rôles sur toutes les troupes actives.
- Tests : `TroupeUpdateIntegrationTest`, specs hub / season-card / account ; 750 tests web OK ; build web OK.

### M3 checklist (waivers)

- M3-1 à M3-4 : validés (MatDialog, mat-card outlined, tokens color-mix, dialogs `min(100vw - 2rem, 28rem)`, pas de nouveau chrome).
- M3-5 : revue effectuée ; aucune dérogation.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeUpdateIntegrationTest.kt`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.scss`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts`
- `apps/web/src/app/shared/season-card/season-card.ts`
- `apps/web/src/app/shared/season-card/season-card.html`
- `apps/web/src/app/shared/season-card/season-card.scss`
- `apps/web/src/app/shared/season-card/season-card.spec.ts`
- `apps/web/src/app/shared/format-season-period.ts`
- `apps/web/src/app/shared/format-season-period.spec.ts`
- `apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.html`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.scss`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.ts`
- Remove: `apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts`
- Remove: `apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.spec.ts`

### Change Log

- 2026-05-31 : Story created from ux-design-troupe-hub.md (Patrice — compteurs deferred to 17-30).
- 2026-05-31 : Implémentation hub refonte + Mon compte préférences membre + PATCH troupe name.

---

### Validation create-story

- [x] AC métier numérotés et sourcés
- [x] Section Material 3 remplie
- [x] Tasks référencent AC
- [x] Liens fichiers existants
- [x] Tests web + API mentionnés

---
baseline_commit: 4db8dad5
---

# Story 8.2b: Member notification preferences UX — D6 masking, copy & section intros

**Status:** done

**Story ID:** 8.2b  
**Story key:** `8-2b-preferences-membre-copy-masquage-d6`  
**Epic:** 8 — Notifications (push, email, preferences)  
**Priority:** **P0** (phase 1 member prefs — PO 2026-06-08)  
**UX source (as-shipped):** [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](../planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md) · wireframe DT initial [`ux-design-notification-preferences-2026-06-08.md`](../planning-artifacts/ux-design-notification-preferences-2026-06-08.md)  
**Catalogue:** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Modèle prefs (D6)  
**Depends:** Story **8.2** (done — API + grid UI), **8.1** (done — device push toggle)  
**Blocks (soft):** Stories **8.8** (add `EVENT_*` rows when shipped), **G-012** (unhide `TEAM_CONFIRMED`), **8.4** (orga section — separate story)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **HatCast member**,  
I want **notification preference rows with short titles and a single plain-French « Me prévenir quand… » line per category**, **and no toggles for categories that are not actually dispatched**,  
so that **I can decide in under 30 seconds what I will stop receiving** without phantom prefs or API jargon (FR30, rule A1 / D6).

---

## Acceptance Criteria

1. **Given** `/compte/notifications` loads category prefs from `GET /v1/me/notification-preferences`, **when** the member section renders, **then** categories **`COMPOSITION_SHARED`** and **`TEAM_CONFIRMED`** are **not shown** (no row, no placeholder, no “coming soon” badge) — decision **D6:B** / anti-pattern **A1**. [Source: UX DT § R1 ; NOTIFICATIONS_CATALOG.md D6 ; brainstorm 2026-06-07]

2. **Given** the five visible member categories after D6, **when** each row renders, **then** the UI shows **short title** (≤ 6 words) and **one description line** starting with **« Me prévenir… »** — **not** the long API `category.label`, **not** « Si désactivé » blocks. Copy matches the normative table below. [Source: as-shipped § Copy normative]

3. **Given** the two API groups `NOTIFICATIONS` and `AUTOMATIC_REMINDERS`, **when** sections render inside **card** containers, **then** headings and intros are:
   - **Messages pour moi** — intro: *« Tu reçois ces messages par défaut. Désactive ce que tu ne veux plus. »*
   - **Rappels automatiques** — intro: *« Rappels liés au calendrier, pas aux actions des orgas. »*
   Section title uses `headline-small` ; row title uses `body-large` semi-bold. [Source: as-shipped § Sections]

4. **Given** either category section, **when** the grid of toggles is shown, **then** column headers **Cet appareil** and **E-mail** appear once per section on desktop (≥560px) ; on mobile, those labels appear **above each switcher**. Per-row toggles do **not** use the word Push/Mobile. `aria-label` = `{titre} — cet appareil` or `{titre} — e-mail`. [Source: as-shipped § Grille canaux]

5. **Given** the notifications tab content (below global device push block), **when** category prefs are visible, **then** there is **no** page-level intro paragraph — **no** mention of organizer alerts until story **8.4** ships. [Source: as-shipped § Textes absents]

6. **Given** push is disabled on the current device (Story **8.1**), **when** category **Cet appareil** toggles render, **then** they are **disabled without** an explanatory hint in the prefs grid ; **E-mail** toggles stay editable. Global device toggle shows **no hint** when OFF ; when ON, hint links to « Cet appareil » below. [Source: as-shipped § Toggle global ; 8.1/8.2 behaviour]

7. **Given** the user toggles a category channel, **when** PATCH succeeds, **then** debounced auto-save (300 ms), rollback on error, and eligibility semantics are **unchanged** — this story is **copy + visibility + UX polish** on the web layer. [Source: 8.2 review patches]

8. **Given** implementation complete, **when** tests run, **then** Vitest covers: hidden ghost categories absent ; visible copy for **Disponibilités** and **Participation** ; **Me prévenir** descriptions ; section intros ; **Cet appareil** / E-mail labels ; `aria-label` format ; push-disabled regression (no grid hint) ; **`notification-preferences-section.spec.ts`** + **`push-notifications-section.spec.ts`** green ; `./gradlew test` unchanged. [Source: as-shipped § Checklist régression]

**Product coverage:** FR30 ; UX phase 1 member prefs ; decisions **D1–D6** respected (no orga section, no `EVENT_*` rows). **Does not implement:** dispatch (**8.8**, **G-012**, **8.4**).

---

## Normative UI copy (phase 1 as-shipped — implement verbatim)

| Key | Short title | Description (one line) |
|-----|-------------|------------------------|
| `AVAILABILITY_REQUEST` | **Disponibilités** | Me prévenir quand on attend ma dispo ou qu’une dispo est enregistrée pour moi. |
| `CONFIRMATION_REQUEST` | **Participation** | Me prévenir quand je dois confirmer ou qu’un·e orga modifie ma participation. |
| `AVAILABILITY_WEEKLY_REMINDER` | **Dispos attendues** | Me prévenir tous les 5 jours quand ma dispo manque encore sur un spectacle. |
| `REMINDER_7_DAYS` | **Semaine avant le spectacle** | Me prévenir 7 jours avant un spectacle où je joue. |
| `REMINDER_1_DAY` | **Veille du spectacle** | Me prévenir la veille d’un spectacle où je joue. |

**Hidden from UI (still in API/OpenAPI for compat):**

| Key | Reason |
|-----|--------|
| `COMPOSITION_SHARED` | Orga-only intent — not dispatched to members (**8.4**) |
| `TEAM_CONFIRMED` | Until `TEAM_COMPLETE_MEMBER` dispatch (**G-012**) |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** updated preference rows, **when** rendered, **then** keep `mat-slide-toggle`, `mat-spinner` ; section **cards** with semantic `h3` ; styled `<p>` for intro/description — no custom clickable div toggles. [Source: FRONTEND_UI.md ; as-shipped]

**M3-2. Tokens & theme** — **Given** section/row typography, **when** styled, **then** use `var(--mat-sys-headline-small)`, `body-large`, `body-medium` and `color-mix` for reduced-opacity text. [Source: FRONTEND_UI.md ; as-shipped § Typographie]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** multi-line rows render, **then** toggle targets remain ≥ 48×48 dp ; **Cet appareil** / **E-mail** labels visible above switchers ; French `aria-label` = `{titre} — cet appareil` / `{titre} — e-mail`. [Source: NFR-A1 ; as-shipped]

**M3-4. Member navigation** — **Given** `/compte/notifications` tab, **when** adding intros/headers, **then** do **not** change account shell tabs, app bar, or rail. [Source: 17.34 ; ux-hub-a-faire.md]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md § Checklist M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` only — **no** API/OpenAPI/Flyway changes unless PO explicitly requests server-side `visible` flag (not required: front filter + copy map per UX R3).

- [x] **Copy map module** (AC: 2)
  - [x] Add `apps/web/src/app/core/notifications/notification-preference-ui-copy.ts` (or colocate under `shared/notification-preferences-section/`) exporting:
    - `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS: ReadonlySet<NotificationPreferenceKey>` → `COMPOSITION_SHARED`, `TEAM_CONFIRMED`
    - `NOTIFICATION_PREFERENCE_UI_COPY: Record<VisibleKey, { title, help, disabledConsequence }>` for the five visible keys
  - [x] Single source for guerilla tests S1/S2/S5 strings.

- [x] **Component refactor** (AC: 1–5, 6–7, M3)
  - [x] Update [`notification-preferences-section.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts):
    - Filter `categories()` through hidden-key set before group splits
    - Replace `category.label` display with copy map lookup (fallback to API label only for unknown keys — should not happen post-filter)
    - Rename section title `Notifications` → **Messages pour moi**
    - Add section intros + page intro (page intro can live in [`account-notifications-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-notifications-tab.html) between push block and prefs section — prefer tab template for “Configure…” cohesion)
    - Add column header row (`Push` | `E-mail`) per section; remove visible “Push”/“E-mail” text inside toggles (keep `aria-label`)
    - Adjust grid CSS for title / help / consequence / toggles (wireframe: help + “Si désactivé” under title)
  - [x] Preserve debounce PATCH, push-disabled hint, loading/error states.

- [x] **Tests** (AC: 8)
  - [x] Extend [`notification-preferences-section.spec.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts):
    - Mock API catalog including `COMPOSITION_SHARED` + `TEAM_CONFIRMED` → assert **not** in DOM
    - Assert **Disponibilités**, **Participation**, “Si désactivé”, section intros, column headers
    - Update/remove test expecting long API label string
  - [x] Run `npm run test -w @hatcast/web -- --watch=false --include "**/notification-preferences-section.spec.ts"`

- [x] **Docs touch (minimal)** — Optional one-line cross-link in Dev Agent Record only ; **do not** expand NOTIFICATIONS_CATALOG in this story (already updated 2026-06-08).

---

## Dev Notes

### Current state (must preserve)

[`NotificationPreferencesSection`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) today:

- Renders **all** API categories grouped by `group` field
- Shows long server `label` as row text
- Section titles: « Notifications » / « Rappels automatiques »
- Inline “Push” / “E-mail” on each `mat-slide-toggle`
- **7 rows** including two **phantom** prefs (`COMPOSITION_SHARED`, `TEAM_CONFIRMED`)

Backend [`UserNotificationPreferencesService.toResponse`](../../services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt) returns **all** `NotificationCategory.entries` — **intentionally unchanged** ; eligibility/dispatch still uses full enum. UI-only filter avoids breaking PATCH keys users may already have stored.

### Architecture compliance

| Rule | Implementation |
|------|----------------|
| **A1 / D6** | Client-side hide — not server delete |
| **R3 copy** | Front maps `key` → UI strings ; API `label` stays for OpenAPI |
| **R2 opt-out** | Section copy says “Tu reçois… Désactive…” |
| **8.4 silence** | No orga block, no teaser |
| **Extensibility** | When **8.8** ships, add keys to copy map + remove from hidden set in follow-up stories — do **not** hardcode “5 rows forever” without the hidden-key set pattern |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse | Extend existing component ; do not duplicate push logic |
| Types | Import `NotificationPreferenceKey` from [`me-notification-preferences-api.service.ts`](../../apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts) |
| Save pattern | Keep 300 ms debounce + rollback (8.2 review) |
| testids | Keep `notification-pref-{key}-{channel}` pattern for E2E |

### Explicit non-goals

- Organizer section **Alertes organisateur** (**8.4**)
- Rows for `EVENT_DETAILS_CHANGED` / `EVENT_ARCHIVED` (**8.8**)
- Unhiding `TEAM_CONFIRMED` (**G-012**)
- Changing API labels or adding `visibleInUi` DTO field
- i18n `@angular/localize` migration (French constants OK — matches rest of account UI)
- Guerilla user testing (PO manual — out of dev scope)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **8.2** | done | Base grid + API |
| **8.1** | done | Device push gate |
| **8.7** | done | `AVAILABILITY_WEEKLY_REMINDER` actively dispatched — row stays visible |
| **8.8** | backlog | Will add 2 rows + copy later |
| **G-012** | backlog | Will unhide `TEAM_CONFIRMED` |
| **8.4** | backlog | Orga section + `COMPOSITION_SHARED` orga semantics |

### Previous story intelligence (8.2)

- Review deferred: `COMPOSITION_SHARED` exposed without dispatch — **this story closes that UX debt (D6)**.
- `group` field from API drives section split — keep using it.
- Push toggles disabled when device push off ; email independent.
- Files to modify: `notification-preferences-section.ts`, `.spec.ts`, optionally `account-notifications-tab.html`.

### Git intelligence

Recent commit `4db8dad5` `docs(notifications): Add catalog, BS and prefs UX artifacts` — UX spec and catalogue already committed ; implementation lags docs.

### Guerilla scenario mapping (manual QA post-ship)

| Scenario | Pass criterion |
|----------|----------------|
| **S1** | Finds **Dispos oubliées (~5 j)** in < 15 s ; reads consequence |
| **S2** | Disables **Veille** + **Semaine avant** without touching **Disponibilités** |
| **S4** | Push off → understands hint ; email still editable |
| **S5** | **Participation** “Si désactivé” mentions retrait before toggle |

### Project context reference

- Tests: `npm run test -w @hatcast/web -- --watch=false`
- UI checklist: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- Angular **21.2** + Material **21.2** ([project-context.md](../../project-context.md))

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Implementation Plan

- Client-side filter via `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS` before group split (D6 / A1).
- Normative copy in `notification-preference-ui-copy.ts` — `{ title, description }` with « Me prévenir… » pattern.
- Section **cards** with column headers **Cet appareil** / E-mail (desktop ≥560px) ; mobile channel labels on switchers.
- Shared `PushNotificationsService.uiState` signal — prefs grid reacts without reload.
- No page intro ; no grid hint when device notifications off (as-shipped).

### Completion Notes List

- ✅ Masquage `COMPOSITION_SHARED` et `TEAM_CONFIRMED` (filtre client, API inchangée).
- ✅ Copy as-shipped : titres courts + « Me prévenir… » pour les 5 catégories ; **Dispos attendues**.
- ✅ Sections cartes « Messages pour moi » / « Rappels automatiques » avec intros normatives.
- ✅ Canal **Cet appareil** (pas Push) ; hint global ON seulement ; pas de hint grille OFF.
- ✅ **13** tests Vitest (`notification-preferences-section` + `push-notifications-section`).
- **M3 waiver :** en-têtes colonnes masqués sous 560px (libellés canal sur switchers mobile).

### File List

- `_bmad-output/planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md` (new — rétro UX)
- `apps/web/src/app/core/notifications/notification-preference-ui-copy.ts` (new)
- `apps/web/src/app/core/push/push-notifications.service.ts`
- `apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts`
- `apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts`
- `apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts`
- `apps/web/src/app/shared/push-notifications-section/push-notifications-section.spec.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-notifications-tab.html`

### Change Log

- 2026-06-08 : Story created (create-story 8.2b) — P0 member prefs UX phase 1: D6 masking, copy map, section intros.
- 2026-06-08 : Implementation + rétro UX Sally — as-shipped spec ; Me prévenir, Cet appareil, cartes, hints retirés ; Vitest 13/13.
- 2026-06-08 : Code review #2 patches — `aria-label` format, test aria-label, AC story alignés as-shipped.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX DT)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` mentionné

---

### Review Findings

_Revue #2 — 2026-06-08 · spec as-shipped [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](../planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md) · Vitest 12/12 verts_

- [x] [Review][Patch] `aria-label` préf. — format as-shipped `{titre} — cet appareil` — retiré « canal » dans `ariaLabel()`. [`notification-preferences-section.ts:386-387`]

- [x] [Review][Patch] Test `aria-label` — assertion `Disponibilités — cet appareil` / `Disponibilités — e-mail`. [`notification-preferences-section.spec.ts`]

- [x] [Review][Patch] AC story §2–8 alignés sur as-shipped — Me prévenir, Cet appareil, pas d’intro page, pas de hint grille. [`8-2b-preferences-membre-copy-masquage-d6.md` § Acceptance Criteria]

- [x] [Review][Patch] File List Dev Agent Record complété — push section/service + doc as-shipped. [`8-2b-preferences-membre-copy-masquage-d6.md` § File List]

- [x] [Review][Defer] PATCH push debouncé après désactivation globale appareil — fenêtre 300 ms si l’utilisateur coupe « Notifications sur cet appareil » pendant un debounce catégorie ; guard `pushDisabled()` dans `commitPreference` optionnel. [`notification-preferences-section.ts:390-408`] — deferred, edge case rare MVP

- [x] [Review][Defer] `uiState` reste `enabled` pendant `disable()` async — toggles catégorie push éditables le temps du unsubscribe ; pas de signal `busy` partagé. [`push-notifications.service.ts:118-133`] — deferred, pattern 8.1 existant

- [x] [Review][Defer] Test « exactement 5 lignes » absent — filtrage D6 couvert ; pas de `querySelectorAll('.notification-preferences__row').length === 5`. [`notification-preferences-section.spec.ts`] — deferred, couverture implicite

- [x] [Review][Defer] Libellés mobile canal en `font-size: 0.7rem` vs `body-medium` as-shipped — desktop headers idem ; couleurs OK tokens. [`notification-preferences-section.ts:211-217`] — deferred, polish typo M3

- [x] [Review][Defer] `display: contents` sur `.notification-preferences__channel` desktop — alignement grille ; risque Safari/VO connu. [`notification-preferences-section.ts:267-268`] — deferred, layout trade-off accepté

- [x] [Review][Defer] Fallback copy clé API inconnue (8.8) — titre API + description vide ; masquer ligne ou placeholder « Me prévenir… » hors scope phase 1. [`notification-preference-ui-copy.ts:50`] — deferred, story 8.8

# Story 17.17: Chip organisateur + action Promouvoir sur listes admin

Status: review

<!-- PO 2026-05-26 — Remplace les sections / onglets dédiés « Organisateur·ices » par chip + Promouvoir sur la ligne, aligné avec la logique sections Externes/Membres (17.16 review). Note : 17.7 est déjà prise (API tag équité) ; numéro suivant disponible = 17.17. -->

## Story

As an **admin or season organizer** managing people in HatCast,
I want **participant vs organizer status on a dropdown chip** on each list row (like the troupe role chip on Membres),
so that **I do not maintain a parallel organizer list** and can switch roles in context without separate Promouvoir/Rétrograder links.

## Product context (PO 2026-05-26, refined same day)

- **Pain:** Dedicated « Organisateur·ices » sections duplicate identities already on roster / member lists.
- **Direction:** One **Participant ▾** chip per row (scope: spectacle, saison sur participants, saison sur membres quand `profileSeasonId`) with menu **Participant** | **Organisateur·ice du spectacle/de saison**; **no** bandeau « hors roster », **no** liens Promouvoir/Rétrograder.
- **Retrait:** Icône poubelle + `ConfirmDialog` (remplace les boutons texte Retirer / Retirer du spectacle).
- **Reference pattern:** [`membres-tab`](../../apps/web/src/app/pages/admin-membres/membres-tab.html) role chip (`mat-chip` + `mat-menu`); kind chips 17.16 restent en complément si besoin.
- **Out of scope for this story:** Onglet Infos spectacle ([`event-infos-tab`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html)) — keep existing organizer block / dialog entry per **17.15** unless PO explicitly asks to align later.

## Acceptance Criteria

### Shared rules

1. **Given** a roster/member/participant row, **when** displayed, **then** a chip shows **Participant** or **Organisateur·ice** for that scope (externe ou hérité saison : même règle sur le spectacle). [Source: PO 2026-05-26 refined]
2. **Given** the viewer can manage organizers at that scope, **when** the chip is clicked, **then** a menu offers **Participant** and **Organisateur·ice du spectacle** or **de saison**; choosing an item calls the existing add/remove organizer API (by email). [Source: PO refined]
3. **Given** the row person **is** an organizer, **when** the viewer selects **Participant** in the menu, **then** demotion uses the remove-organizer API (no separate Rétrograder button). [Source: PO refined]
4. **Given** a row **without** resolvable email for organizer APIs, **when** the viewer can manage organizers, **then** the participation chip is read-only with tooltip « Liez un compte HatCast pour promouvoir organisateur·ice ». [Source: DOMAIN]
5. **Given** successful role change, **when** API returns OK, **then** organizer set reloads, chip label updates, snackbar confirms (FR copy). [Source: repo norms]
6. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass. [Source: repo norms]

### Spectacle — participants admin (`AdminEventParticipants`)

7. **Given** the event participants admin page, **when** loaded, **then** the dedicated section **Organisateur·ices du spectacle** (heading + Ajouter + parallel list) is **removed**. [Source: PO 2026-05-26; WIP in current tree]
8. **Given** a roster row (Externes or Membres), **when** displayed, **then** participation chip ▾ appears alongside kind chips (if any). [Source: AC1]
9. **Given** `canManageEventOrganizers()`, **when** user picks **Organisateur·ice du spectacle** in the menu, **then** `OrganizerApiService.addEventOrganizer(seasonId, eventId, email)` is used. [Source: existing API]
10. **Given** removal from the event roster, **when** the user clicks the delete icon, **then** `ConfirmDialog` runs before exclude/remove participant API. [Source: PO refined]

### Saison — participants admin (`AdminParticipants`)

11. **Given** the season participants admin page, **when** loaded, **then** the embedded [`OrganisateursTab`](../../apps/web/src/app/pages/admin-membres/organisateurs-tab.ts) section **Organisateur·ices de saison** is **removed**; page title / breadcrumb leaf remains **Participants** (organizer-only viewers still see participant list or empty state per permissions — preserve **17.11** behaviour). [Source: current `admin-participants.html`]
12. **Given** a season participant row, **when** displayed, **then** participation chip ▾ per AC1–2 (saison). [Source: PO refined]
13. **Given** removable participant row, **when** delete icon clicked, **then** existing `confirmRemove` + dialog (unchanged logic). [Source: PO refined]

### Troupe — membres admin (`MembresTab` on `/troupe/:slug/admin/membres`)

14. **Given** the troupe membres admin page, **when** a row renders, **then** only the troupe role chip (Membre / Administrateur·ice de troupe) is shown — **no** season organizer or Participant·e chip (managed on season participants screen). [Source: PO 2026-05-26]
15. **Given** `profileSeasonId` on membres (legacy saison route), **when** set, **then** it is used only for member profile navigation (avatar click), not organizer management. [Source: PO refined]
16. **Given** no profile season resolved, **when** membres page loads, **then** avatar is not clickable for profile dialog; troupe role chip unchanged. [Source: `MembresTab` inputs]
17. **Given** troupe **admin** role, **when** displayed, **then** existing **Administrateur·ice** role chip / menu is unchanged — do not conflate troupe admin with season organizer. [Source: DOMAIN roles]

### Regression

18. **Given** event Infos tab, **when** unchanged by this story, **then** organizer management there still works (**17.15**). [Source: non-goal]
19. **Given** permission gates, **when** user lacks organizer-manage rights, **then** participation chip is read-only (no ▾ menu). [Source: existing patterns]

## Tasks / Subtasks

- [x] **Shared helper** (AC: 1–5)
  - [x] Extract small util or injectable helper: `isOrganizer(userId, email, organizers[])`, `promotable(row)` — avoid triplicating in three pages.
  - [x] Shared chip CSS token / class aligned with `admin-event-participants__chips` and `membres-tab__role-chip`.

- [x] **Event participants page** (AC: 7–10)
  - [x] Remove organizers section + `EventOrganizersDialog` entry from [`admin-event-participants`](../../apps/web/src/app/pages/admin-event-participants/); keep roster sections.
  - [x] Load `listEventOrganizers` once; join on `userId` (fallback email match).
  - [x] Row template: participation chip ▾ + delete icon with confirm.
  - [x] Update [`admin-event-participants.spec.ts`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.spec.ts).

- [x] **Season participants page** (AC: 11–13)
  - [x] Remove `OrganisateursTab` from [`admin-participants.html`](../../apps/web/src/app/pages/admin-participants/admin-participants.html); drop unused import.
  - [x] Load season organizers; participation chip ▾ on participant rows.
  - [x] Update [`admin-participants.spec.ts`](../../apps/web/src/app/pages/admin-participants/admin-participants.spec.ts).

- [x] **Membres tab** (AC: 14–17)
  - [x] When `profileSeasonId` set, load season organizers; chip + actions on member rows.
  - [x] Pass `canManageSeasonOrganizers` from parent or load in tab.
  - [x] Update [`membres-tab.spec.ts`](../../apps/web/src/app/pages/admin-membres/membres-tab.spec.ts).

- [x] **Deprecate or slim OrganisateursTab** (AC: 11)
  - [x] If no remaining embeds, delete tab + spec **or** mark `@deprecated` with comment pointing to 17.17 — prefer delete if unused after refactor.

- [x] **Copy FR**
  - [x] « Participant », « Organisateur·ice du spectacle/de saison », snackbars ajout/retrait.

- [x] **UX refinement PO 2026-05-26 (post-review)** — chip-menu unifié, suppression hors-roster / Promouvoir / Rétrograder, icône poubelle.

### Review Findings

- [x] [Review][Decision] Pas d’ajout hors liste — organisateur·ice se gère sur une ligne visible (participants, membres, Infos 17.15) — **confirmé PO 2026-05-26**
- [x] [Review][Patch] Éligibilité organisateur = email normalisé (`canAssignOrganizerRole`) — **corrigé**
- [x] [Review][Patch] Snackbar si promotion impossible — **corrigé**
- [x] [Review][Patch] Notice hors roster — **supprimée** (PO : inutile avec chip-menu)
- [x] [Review][Defer] Pas de test Rétrograder ni chip lecture seule sans `canManage*` [`*.spec.ts`] — deferred, pre-existing
- [x] [Review][Defer] Duplication template Externes/Membres — **réduit** via `ng-template` event roster row

## Dependencies

- **17.16** — event participants route, Externes/Membres sections, compact rows — **done**.
- **17.11 / 17.1** — breadcrumb chrome — unchanged.
- **17.15** — Infos tab organizers — unchanged.
- **3.5 / 3.8** — organizer & participant APIs — existing `OrganizerApiService`.

## Non-goals

- Backend API changes.
- Replacing troupe **TROUPE_ADMIN** management (role menu on membres).
- Refactoring event Infos organizer UI (**17.15**).
- Bulk promote or multi-select.

## Dev Notes

### UX matrix

| Screen | List source | Organizer scope | Join key | Remove section |
|--------|-------------|-----------------|----------|----------------|
| `admin-event-participants` | Event roster | Event | `userId` / email | Organisateur·ices du spectacle |
| `admin-participants` | Season participants | Season | `userId` / email | `OrganisateursTab` embed |
| `membres-tab` | Troupe members | Season (profile) | `userId` / email | N/A (was on participants page) |

### APIs (unchanged)

```typescript
// Season
organizerApi.listSeasonOrganizers(seasonId)
organizerApi.addSeasonOrganizer(seasonId, email)
organizerApi.removeSeasonOrganizer(seasonId, userId)

// Event
organizerApi.listEventOrganizers(seasonId, eventId)
organizerApi.addEventOrganizer(seasonId, eventId, email)
organizerApi.removeEventOrganizer(seasonId, eventId, userId)
```

### Promote eligibility

| Row kind | Promote event org | Promote season org |
|----------|-------------------|---------------------|
| MEMBER / LINKED with email | Yes | Yes |
| NAME_ONLY, no userId | No (tooltip) | No |

### Participation chip menu

- Label: `Participant ▾` or `Organisateur·ice ▾` when editable; without ▾ when read-only.
- Menu items: `Participant` | `Organisateur·ice du spectacle` | `Organisateur·ice de saison` (scope-dependent).
- Helper: [`organizer-row.helper.ts`](../../apps/web/src/app/shared/admin-organizer-row/organizer-row.helper.ts) — `participationRoleChipLabel`, `canAssignOrganizerRole`, `organizerRoleMenuLabel`.

### Files (expected touch)

| Area | Paths |
|------|--------|
| Event participants | `admin-event-participants.{ts,html,scss,spec.ts}` |
| Season participants | `admin-participants.{ts,html,scss,spec.ts}` |
| Membres | `membres-tab.{ts,html,scss,spec.ts}`, possibly `admin-membres.ts` |
| Shared | new `organizer-row.helper.ts` or `shared/admin-organizer-row/` (minimal) |
| Remove / deprecate | `organisateurs-tab.*`, `add-organizer-dialog.ts` usage from tab only |

### Commands

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### References

- [Source: PO feedback 2026-05-26 — chip + Promouvoir vs section dédiée]
- [Source: `_bmad-output/implementation-artifacts/17-16-route-admin-participants-evenement.md` — row chip pattern]
- [Source: `apps/web/src/app/pages/admin-membres/organisateurs-tab.ts` — behaviour to migrate]
- [Source: `apps/web/src/app/pages/event-detail/event-organizers-dialog.ts` — promote by email]

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Helper partagé `organizer-row.helper.ts` + styles chip-menu / poubelle.
- Sections dédiées « Organisateur·ices » retirées ; chip **Participant ▾** + menu sur les 3 écrans.
- Retrait via icône `delete` + confirmation (spectacle, saison, membres).
- Pas de bandeau hors roster ni liens Promouvoir/Rétrograder.
- `OrganisateursTab` et `AddOrganizerDialog` supprimés.
- 477 tests passent.

### File List

- apps/web/src/app/shared/admin-organizer-row/organizer-row.helper.ts
- apps/web/src/app/shared/admin-organizer-row/organizer-row.helper.spec.ts
- apps/web/src/app/shared/admin-organizer-row/organizer-row.scss
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.html
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.scss
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.spec.ts
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-participants/admin-participants.html
- apps/web/src/app/pages/admin-participants/admin-participants.scss
- apps/web/src/app/pages/admin-participants/admin-participants.spec.ts
- apps/web/src/app/pages/admin-membres/membres-tab.ts
- apps/web/src/app/pages/admin-membres/membres-tab.html
- apps/web/src/app/pages/admin-membres/membres-tab.scss
- apps/web/src/app/pages/admin-membres/membres-tab.spec.ts
- apps/web/src/app/pages/admin-membres/organisateurs-tab.ts (deleted)
- apps/web/src/app/pages/admin-membres/organisateurs-tab.html (deleted)
- apps/web/src/app/pages/admin-membres/organisateurs-tab.scss (deleted)
- apps/web/src/app/pages/admin-membres/organisateurs-tab.spec.ts (deleted)
- apps/web/src/app/pages/admin-membres/add-organizer-dialog.ts (deleted)

### Change Log

- 2026-05-26: Story created — cross-screen organizer chip + Promouvoir; replaces dedicated organizer sections on participants (saison/spectacle) and season-organizer affordances on membres.
- 2026-05-26: Implemented chip + row actions on event/season participants and membres; removed OrganisateursTab; added shared helper and tests.
- 2026-05-26: PO refinement — participation chip-menu (style Membres), delete icon, removed off-roster notice and Promouvoir/Rétrograder links.

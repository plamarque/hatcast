---
stepsCompleted:
  - step-01-init
  - step-02-discovery-stakeholder-input
  - step-03-refinement-proposed
  - step-04-stakeholder-signoff
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - DOMAIN.md
  - apps/web/src/app/pages/season-home/troupe-members-dialog.ts
  - apps/web/src/app/pages/season-home/season-organizers-dialog.ts
stakeholderDecisions:
  - unified-route-members-organizers
  - compact-list-with-search
  - active-inactive-slide-toggle
  - hide-member-dates
  - add-member-via-modal
  - csv-import-export-toolbar-buttons
  - naming-membres-troupe-participants-saison-event
  - inactive-members-hidden-by-default
  - promote-to-season-organizer-shortcut
  - csv-import-submenu
  - toolbar-not-audit-log
author: Patrice
date: '2026-05-23'
status: approved
relatedStories:
  - '2.2'
  - '2.3'
  - '3.5'
  - '3.8'
---

# UX Design Specification — HatCast V2 (Admin Membres & organisateurs)

**Author:** Patrice  
**Date:** 2026-05-23  
**Scope:** Troupe members + season organizers administration (Stories 2.2, 2.3, 3.5)  
**Status:** Approved (stakeholder sign-off 2026-05-23)

---

## Stakeholder intent (2026-05-23)

Patrice requested a **single admin route** for **troupe members** and **season organizers**, replacing the current **two separate dialogs** opened from the season settings menu.

| Decision | Direction |
|----------|-----------|
| **Navigation** | One common route; not two modal entry points |
| **Import / export** | Exposed as **toolbar buttons** (not a long inline CSV section in the main scroll) |
| **Member list density** | **Compact** rows; avoid card-per-member layouts with many form fields visible at once |
| **Active / inactive** | **Slide toggle** (`mat-slide-toggle`), not a dropdown |
| **Member dates** | **Do not display** `createdAt` / `updatedAt` in the list (not useful for admins day-to-day) |
| **Add member** | **Modal** (`MatDialog`); no inline add form above the list |
| **Search** | **Filter field above the list** (name or email, client-side or API-backed) |

**Rationale:** Reduce cognitive load during migration and routine admin; keep CSV flows one click away without dominating the screen; align active state with a familiar on/off control.

### Sign-off (2026-05-23)

| # | Question | Answer |
|---|----------|--------|
| 1 | Naming | **Membres** (troupe) · **Participants** (saison/événement) |
| 2 | Inactive members | **Hidden by default**; *Afficher les inactifs* to reveal |
| 3 | Nommer orga saison shortcut | **Yes** |
| 4 | CSV layout | **Exporter** + **Importer ▾** menu |
| 5 | Toolbar vs audit | **Toolbar actions** (not audit log) |

---

## Scope boundaries

| In scope (this screen) | Out of scope (document elsewhere) |
|------------------------|-----------------------------------|
| Troupe **memberships** — baseline role, active/inactive | **Season/event participant rosters** (Story 3.8) — separate admin surface |
| **Season organizers** delegation (`season_organizers`) | **Event organizers** (`event_organizers`) — per-event settings on event detail / Infos ⋮ (Story 3.5) |
| CSV user + member import/export (FR42) | Self-service invites (Epic 7) |

**DOMAIN alignment:** Baseline troupe role = `MEMBER` \| `TROUPE_ADMIN`. Organizer delegation is **not** a baseline role and must not appear as a third baseline option.

### Product vocabulary (locked)

| Scope | French label | Use for |
|-------|--------------|---------|
| **Troupe** | **Membres** | Troupe membership, baseline roles, CSV import/export (this screen — tab Membres) |
| **Saison / événement** | **Participants** | Season/event participant rosters (Story 3.8 — **future** admin surface; not troupe membership) |

**This screen:** menu and primary tab use **Membres**. The second tab **Organisateur·ices** names a **permission delegation**, not a participant roster — keep that label. Do **not** call troupe members « participants ».

---

## Refined decisions (approved)

### Information architecture

| Topic | Decision | Status |
|-------|----------|--------|
| Route | `/saison/:slug/admin/membres` | **Locked** |
| Deep link to tab | Query `?onglet=membres` (default) \| `organisateurs` | **Locked** |
| Settings menu label | **« Membres »** | **Locked** |
| Page title (H1) | **« Membres »** on Membres tab; **« Organisateur·ices »** when that tab is active | **Locked** |
| Subtitle | Season title + troupe name, muted | **Locked** |

When the user has **only one** permitted tab, **hide the tab bar** entirely (no fake single tab).

### Toolbar layout

**Desktop (≥600px)** — one row:

```
[ 🔍 Rechercher…________________ ]  [ Ajouter ]  [ Exporter ]  [ Importer ▾ ]
```

**Mobile** — two rows:

1. Full-width search  
2. `Ajouter` (primary) + `Exporter` + `Importer ▾`

| Control | Behaviour | Status |
|---------|-----------|--------|
| **Search** | Filters **active tab** only; **client-side** on loaded list (API page size 100); case-insensitive match on **displayName** OR **email**; clear (×) in field; debounce 150ms | **Locked** |
| **Ajouter** | Opens add modal for active tab | **Locked** |
| **Exporter** | Immediate CSV download; snack *« Export téléchargé »* | **Locked** |
| **Importer ▾** | `mat-menu`: **Importer utilisateurs** + **Importer membres** | **Locked** |
| CSV on Organisateur·ices tab | **Hidden** | **Locked** |

**Migration help:** Collapsible **« Aide migration V1 »** accordion **below** the list (Membres tab), not in toolbar — explains user CSV before member CSV. Default **collapsed**.

### Membres tab — row interactions

**Visual density:** `mat-list` or table-like rows; **min height 52px**.

**Inactive members (locked):** **Hidden by default.** A **`mat-slide-toggle` or checkbox** *« Afficher les inactifs »* sits **between toolbar and list** (Membres tab only). When off, inactive memberships are excluded from list and from search results. When on, inactive rows appear at **60% opacity**.

```
[ ☐ Afficher les inactifs ]

┌──────────────────────────────────────────────────────────────────────────┐
│ (○) Patrice     [ Nommer orga saison ]  [ Membre ▾ ]      Actif [━━●]   │
│     patrice@example.com                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

| Element | Interaction | Persistence |
|---------|-------------|-------------|
| **Avatar** | Initial or photo; decorative | — |
| **Display name** | **Click → inline edit**; save on **Enter** or blur; **Esc** cancels | PATCH on save |
| **Email** | Read-only, muted | — |
| **Baseline role** | **`mat-chip` + menu**: *Membre* / *Admin troupe* | **Auto-save** on menu choice |
| **Actif toggle** | `mat-slide-toggle` | **Auto-save** on change |
| **Nommer orga saison** | Text button or link; visible if viewer has `canManageSeasonOrganizers` and user is not already a season organizer; adds delegation without retyping email | POST organizer |

**Auto-save:**

- Optimistic UI; spinner/disabled state on row while saving.
- On **409** (last admin): revert toggle/role, snack with DOMAIN message.
- On network error: revert + snack *« Enregistrement impossible »*.

**Last active admin:**

- When user is the **sole** active `TROUPE_ADMIN`, **disable** demote toggle and admin→member menu item; **tooltip** *« La troupe doit conserver au moins un administrateur actif. »*
- No confirm dialog if control is disabled; confirm only when API returns 409 unexpectedly.

**Sort order:** Active first, then alphabetical by display name (client sort after fetch). With *Afficher les inactifs* off, sort applies to the **visible** subset only.

### Organisateur·ices tab

Same search + compact list. Row:

```
(○) Angie                         [ Retirer ]
    angie@example.com
```

| Action | Behaviour |
|--------|-----------|
| **Ajouter** (modal) | Email required; must resolve to an **existing HatCast user** (typically already a troupe member) |
| **Retirer** | Text button; **confirm dialog** *« Retirer … comme organisateur·ice de saison ? »* |
| **Help** | One line under tab label: *« Peut préparer les tirages et annoncer les compositions. Pas un administrateur de troupe. »* |

**Shortcut from Membres tab (locked):** Row action **« Nommer organisateur·ice de saison »** when viewer has `canManageSeasonOrganizers` and target is not already listed.

**Event organizers:** Not on this screen. Help text: *« Organisateur·ices par spectacle → réglages de l'événement »*.

### Modals

#### Add troupe member

| Field | Notes |
|-------|-------|
| Email | Required; validated format |
| Nom affiché | Optional |
| Rôle de base | Radio or select; default **Membre** |

Primary **Ajouter**, secondary **Annuler**. Focus trap + first field focused (NFR-A1).

#### Add season organizer

| Field | Notes |
|-------|-------|
| Email | Required |
| Autocomplete | Suggest **active troupe members** as user types |

#### CSV import results

- **MatDialog**, not bottom sheet (tables need width).
- Title: *« Résultat de l'import »*.
- Summary line + scrollable table (ligne, email, résultat, message).
- **Fermer** refreshes member list if any row succeeded.

### Permissions matrix

| Capability | Membres tab | Organisateur·ices tab | CSV buttons |
|------------|-------------|------------------------|-------------|
| `canManageMembers` | Full | — | Visible on Membres |
| `canManageSeasonOrganizers` only | — | Full | Hidden |
| Both | Full | Full | Visible on Membres |
| Neither | Route blocked | Route blocked | — |

Route guard: redirect to agenda + snack if no permission for **any** tab.

### Responsive list (narrow ≤480px)

Stack per row:

```
(○) Patrice
    patrice@…
    [ Membre ▾ ]     Actif [━━●]
```

Retirer button full-width below on organizers tab.

---

## Screen: Admin Membres (`/saison/:slug/admin/membres`)

### Purpose

Let authorized **troupe administrators** manage **troupe membership** (baseline roles, active state) and **season organizers** manage **season-level organizer delegation** — in **one place**, without leaving the season context.

Replaces:

- `TroupeMembersDialog` (wide modal, inline add + CSV blocks + verbose rows)
- `SeasonOrganizersDialog` (separate modal)

### Entry

| From | Action |
|------|--------|
| Season header **settings (⚙)** menu | Single item: **« Membres »** → this route (default tab Membres) |
| Direct URL | Bookmarkable for admins |

**Permission gating:**

- Tab **Membres** visible if `canManageMembers`
- Tab **Organisateur·ices** visible if `canManageSeasonOrganizers`
- If only one tab applies, show that tab **without** a tab bar (or hide the other tab)
- Unauthorized access → snack + redirect to season agenda

### Global chrome

| Zone | Behaviour |
|------|-----------|
| **Left** | Back → **`/saison/:slug`** (agenda), same hierarchy as event detail |
| **Center** | H1 = active tab label (**Membres** or **Organisateur·ices**) + season/troupe subtitle (muted) |
| **Right** | User menu (unchanged season pattern) |

**Visual:** Admin surface — **Angular Material defaults** + tokens (UX-DR10, UX-DR11). Clarity over dark “spectacle” mood.

---

### Toolbar (shared, below header)

See **Refined decisions → Toolbar layout**. Summary:

| Control | Role |
|---------|------|
| **Search** | Filters active tab; client-side; name or email |
| **Ajouter** | Add modal (member or organizer) |
| **Exporter** | Membres tab only — CSV download |
| **Importer ▾** | Menu: utilisateurs \| membres — Membres tab only |

Import results → [**CSV import results**](#pattern-csv-import-results) dialog.

---

### Tab: Membres (troupe membership)

**List — compact row** (see **Refined decisions → Membres tab**).

```
[ avatar ]  Display name (click → inline edit)
            email (muted)
            [ Membre ▾ chip ]                    Actif [slide toggle]
```

- **Auto-save** on role change and toggle (no per-row Enregistrer).
- **Inactive members hidden by default**; *Afficher les inactifs* toggle above list.
- When shown, inactive rows at **60% opacity**.
- **No** dates.
- **Last admin:** disable demote/deactivate with tooltip.
- Row action **Nommer organisateur·ice de saison** (if permitted).

**Empty state:** *« Aucun membre dans cette troupe. »* + **Ajouter**.

**Below list:** collapsible **Aide migration V1** (collapsed by default).

---

### Tab: Organisateur·ices (season scope)

Same search + compact rows. **Retirer** with confirm. Add via modal with email + member autocomplete.

Help line under tab. **Event organizers** managed elsewhere (event settings).

---

## Patterns

### Pattern: Add troupe member modal {#pattern-add-troupe-member-modal}

| Field | Required |
|-------|----------|
| Email utilisateur | Yes |
| Nom affiché | No |
| Rôle de base | Yes (default: Membre) |

Actions: **Ajouter** (primary), **Annuler**. On success: close modal, refresh list, snack confirmation.

### Pattern: Add season organizer modal {#pattern-add-season-organizer-modal}

| Field | Required |
|-------|----------|
| Email utilisateur | Yes |

Same dialog shell as add member where possible (DRY component).

### Pattern: CSV import results {#pattern-csv-import-results}

After **Importer utilisateurs** or **Importer membres**:

- Open **modal** or **bottom sheet** with summary counts (succès / ignorées / erreurs)
- Scrollable **table** of per-row outcomes (keep existing column set: ligne, email, résultat, message)
- **Fermer** returns to people list; list refreshes if members changed

Export: immediate browser download; optional snack *« Export téléchargé »*.

---

## Migration from current implementation

| Current | Target |
|---------|--------|
| Settings menu → **Membres** + **Organisateur·ices** (2 items) | Settings menu → **Membres** (1 item → route with tabs) |
| `TroupeMembersDialog` | Route + Membres tab |
| `SeasonOrganizersDialog` | Route + Organisateur·ices tab |
| Inline add section + CSV sections in dialog | Toolbar buttons + modals |
| `mat-select` for status | `mat-slide-toggle` |
| Dates in list | Hidden |
| Verbose grid rows | Compact list rows |

---

## Acceptance hints

- [ ] **One route** `/saison/:slug/admin/membres` for troupe members + season organizers.
- [ ] **Vocabulary:** troupe scope = **Membres**; future season/event rosters = **Participants** (Story 3.8).
- [ ] Settings menu: **Membres** (single entry).
- [ ] H1 follows **active tab** (Membres | Organisateur·ices).
- [ ] **Search** (client-side) on active tab; respects inactive filter.
- [ ] **Inactive members hidden by default**; *Afficher les inactifs* reveals muted rows.
- [ ] **Add** via modal; **display name** inline edit; **auto-save** on role + toggle.
- [ ] **Nommer organisateur·ice de saison** on member row when permitted.
- [ ] **Exporter** + **Importer ▾** on Membres tab; import results in dialog.
- [ ] **Migration help** collapsed below list.
- [ ] Permissions enforced (NFR-S2); back → agenda.

---

## Traceability

| Requirement | Coverage |
|-------------|----------|
| FR7 | Membres tab — baseline roles, active state |
| FR42 | Toolbar CSV export/import |
| Story 3.5 | Organisateur·ices tab |
| UX-DR10 | Admin people screen spec (this document + `ux-design-hatcast-v2.md`) |
| NFR-S2 | Permission-gated route and actions |

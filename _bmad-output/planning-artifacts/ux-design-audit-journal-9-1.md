---
title: UX — Journal d'audit (Story 9.1)
author: Patrice
date: '2026-06-01'
status: approved — v3 visual cards (2026-06-01)
relatedStories:
  - '9.1'
  - '9.2'
relatedArtifacts:
  - _bmad-output/implementation-artifacts/9-1-consultation-de-la-piste-d-audit-pour-utilisateurs-autorises.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/adr/0018-v2-audit-events-postgres.md
  - docs/v2/technical/FRONTEND_UI.md
stakeholderDecisions:
  - menu-label-journal-d-audit
  - one-menu-item-per-scope-troupe-season
  - canViewAudit-gating
  - event-organizer-gear-event-detail-only
  - event-scope-activite-tab-primary
  - event-activite-moi-tous-participant-filter
  - audit-entry-compact-one-liner-no-expand
  - audit-entry-actor-last-when-proxy
  - audit-actor-explicit-vs-system
  - audit-draw-block-expand-assignments
  - audit-entry-visual-cards-v3
  - audit-semantic-pills-slot-colors
  - audit-actor-avatar-badge-popover
stakeholderSignOff: '2026-06-01 — Patrice (menu label, scope gating, event-only organizer entry); 2026-06-01 — Patrice (Activité tab + Moi/Tous); 2026-06-01 — Patrice (compact one-liner, no expand, no raw JSON); 2026-06-01 — Patrice (actor last + muted when ≠ subject, no orga suffix); 2026-06-01 — Patrice (visual cards v3: pills, avatar subject, actor badge + tap popover — story 9.1 sign-off)'
---

# UX Design — Journal d'audit (Story 9.1)

**Purpose:** Normative UX for **authorized** audit trail consultation (FR35 read path). Complements [Story 9.1](../implementation-artifacts/9-1-consultation-de-la-piste-d-audit-pour-utilisateurs-autorises.md). Member self-service history remains **Story 9.2**.

**Product voice:** French UI, tutoiement — [ux-voice-and-tone.md](./ux-voice-and-tone.md).

---

## Stakeholder decisions (2026-06-01)

| # | Decision | Direction |
|---|----------|-----------|
| 1 | **Menu label** | **Journal d'audit** (not « Piste d'audit », not « Historique ») |
| 2 | **Menu structure** | **One flat item per scope** in the existing `app-scope-admin-menu` — no submenu, no duplicate entries |
| 3 | **Visibility** | Show **Journal d'audit** only when `canViewAudit === true` for the current scope (backend + `MySeasonPermissionsDto` / troupe equivalent) |
| 4 | **Event organizer** | Gear with **Journal d'audit** appears on **event detail only** — **not** on season workspace when user is event organizer without season/troupe admin rights |
| 5 | **Event scope entry (amended)** | **Primary:** 4th tab **Activité** on event detail (`history` icon). **No** « Journal d'audit » in event gear menu (avoid duplicate). Troupe + season keep gear → full admin page. |
| 6 | **Event Activité filter** | Toolbar like Dispos: **Participant** selector (orga proxy) + **Moi / Tous** toggle to filter event audit by participant scope |
| 7 | **Entry format (2026-06-01)** | **Single compact line** per row; **no expand**, **no raw JSON** in UI |
| 8 | **Actor placement (2026-06-01)** | When actor ≠ subject: **actor last**, styled `--mat-sys-on-surface-variant`; no `(orga)` suffix. Self-actions: no trailing actor — scan column stays aligned |
| 9 | **Draw presentation (2026-06-01)** | `COMPOSITION_DRAW_COMPLETED` → **1 header line** (spectacle + tirage) + **1 line per assignment** diffed from before/after snapshot (display expansion; DB stays 1 row per ADR 9.0 R1) |
| 10 | **Segment order (2026-06-01)** | `{time} · {subject?} · {action} · {detail?} · {actor?}` — subject before action for participant-centric scan |
| 11 | **Actor semantics (2026-06-01)** | **Explicit** human action → trailing actor when applicable; **system** state change (`actorUserId` null) → **no** actor segment |
| 12 | **Lifecycle audit capture (2026-06-01)** | **In scope 9.1** — persist derived `CompositionLifecycle` transitions with `actorUserId = null` |
| 13 | **Entry layout v3 (2026-06-01)** | **Card rows** with **2 visual lines** max: compact head + **semantic pills** — supersedes strict single-line one-liner (v2) |
| 14 | **Semantic pills (2026-06-01)** | State changes use **participation gradient tokens** (`--hatcast-participation-*-gradient-strong`) — same language as Dispos / Équipe slots |
| 15 | **Subject row (2026-06-01)** | **Avatar + season pseudo** (`displayName` participant) when subject shown — not plain text alone |
| 16 | **Actor badge (2026-06-01)** | **Compact avatar badge** (not trailing muted name): **proxy** = tertiary card tint + badge; **direct** = organizer action without subject; **tap popover** on mobile |
| 17 | **Action hint (2026-06-01)** | French action label stays on **head line** but **attenuated** (`on-surface-variant`) — pills carry primary meaning |

### Amendment — Entry presentation v3 — visual cards (2026-06-01)

Patrice validated story **9.1** after iterative review. **Supersedes** § Entry presentation v2 (single-line one-liner + trailing muted actor) for **visual layout**. Keep v2 **segment order** and **actor semantics** for `fullText`, screen readers, and `title` tooltip.

**Rationale:** Mobile-first users scan **colour and badges** faster than prose. Proxy vs self vs system must be obvious without reading a full sentence.

#### Card structure

Each entry = rounded card (`audit-journal-list__entry`), not a flat `mat-list-item` one-liner.

| Zone | Content | Styling |
|------|---------|---------|
| **Head** (line 1, `nowrap` + ellipsis) | `{time}` · `{avatar + pseudo?}` · `{action hint}` | Action hint: smaller, `on-surface-variant`, not bold — **secondary** to pills |
| **Visuals** (line 2, when diff exists) | Pills + optional `Avant → Après` transition | Semantic colours — see § Semantic pills |
| **Actor badge** (overlay) | When explicit actor applies — see § Actor badge | Top-right default; bottom-right when no subject **and** visuals row present |

**Still forbidden:** expand panels, chevrons, raw JSON, English enum keys.

**Accessibility:** `fullText` on card = joined segments (` · `) for `title` / `aria-label`; popover duplicates actor detail for tap discovery.

#### Semantic pills

Reuse tokens from composition / availability UI — implement as `.audit-pill--{tone}`:

| Domain | Examples | Tone / token |
|--------|----------|--------------|
| Availability | Dispo, Pas dispo | `available`, `unavailable`, `unknown` gradients |
| Participation | Confirmé 👍, À confirmer ⏳, Décliné 👎 | `confirmed` (violet), `pending`, `declined` |
| Team lifecycle | Préparation, Collecte, Confirmé | Same mapping as `composition-equipe-status__badge` (`success`, `warning`, `info`, `neutral`) |
| Roles | 🎭 Comédien·ne, 🎤 MC | Neutral surface pill (`role`) — emoji + French label |

Transitions: `[pill before] → [pill after]` on visuals row (e.g. `Préparation → Confirmé`).

#### Subject (when shown)

| Property | Value |
|----------|--------|
| Control | `app-user-avatar` + pseudo text |
| Label source | Season/event participant `displayName` (pseudo), not legal account name when participant exists |
| API | `AuditIdentity.avatarUrl` resolved server-side |
| **Moi** mode | Omit subject block when viewer **is** the subject (same as v2) |

#### Actor badge — explicit actions only

Replaces **trailing muted actor text** from v2.

| Mode | When | Card | Badge | Popover lead |
|------|------|------|-------|--------------|
| **None** | System row (`actorUserId` null) or self-action (`actor = subject`) | Default surface | Hidden | — |
| **Proxy** | `actor ≠ subject` | Light **tertiary-container** tint | Tertiary ring, avatar only, top-right | « Action effectuée par un organisateur » + name |
| **Direct** | Explicit actor, **no** subject (e.g. Compo validée, tirage header) | Default surface | Primary/neutral ring, top-right | « Action effectuée par » + name |

**Interaction (mobile-first):**

- **Tap** badge → toggle compact popover (not hover-only `matTooltip`).
- Popover: lead line + avatar + display name; dismiss on outside tap, scroll, or Escape.
- Badge size ~28 px outer; avatar fills inner area (`--user-avatar-size` must match badge inner box — no overflow).
- `aria-expanded`, French `aria-label` on badge.

**Placement:**

- Default: **top-right** of card (entries with subject).
- **Bottom-right** when no subject **and** visuals row exists (statut équipe + actor) — avoids crowding head.

#### Action hint vs pills

Do **not** duplicate meaning in bold colour on the action hint (e.g. avoid violet « Participation confirmée » competing with violet Confirmé pill). Action hint = **fallback** if pills unread; pills = primary scan surface.

#### Draw block (unchanged intent)

Header + indented children; header keeps **direct** actor badge when organizer ran draw; children unchanged.

### Amendment — Event tab « Activité » (2026-06-01)

Patrice proposed consolidating **event-scoped** audit into the spectacle workflow (alongside Infos · Dispos · Équipe) instead of only a gear-menu deep link. **Approved.**

**Rationale:** When someone asks « qui a touché la dispo de Léa sur *ce* spectacle ? », the natural place is **inside the event**, not a separate admin page reached via ⚙️.

---

## Scope boundaries

| In scope (9.1) | Out of scope |
|----------------|--------------|
| Admin/orga read-only journal (troupe, season, event scopes) | Global « Mon historique » account page (**9.2** — except **Moi** slice on event tab, see below) |
| Troupe + season: gear → full admin page | CSV/PDF export, edit/delete audit rows |
| Event: **Activité** tab + Moi/Tous participant filter | Notification-delivery audit |
| Paginated list + filters + readable before/after | |
| **System lifecycle transitions** (`COMPOSITION_LIFECYCLE_CHANGED`, null actor) | |
| `canViewAudit` permission flag | |

**9.1 / 9.2 overlap on event tab:** The **Moi** mode on **Activité** delivers event-scoped « me concerning » history (actor or subject = linked participant). Story **9.2** may still add account-level aggregation later; do not block 9.1 on 9.2.

---

## Personas & jobs-to-be-done

| Persona | Typical question | Entry screen |
|---------|------------------|--------------|
| **Amira** — troupe admin | « Qui a retiré ce membre ? Qui a changé les droits orga ? » | Hub troupe → Journal d'audit (troupe) |
| **Camille** — season organizer | « Qui a modifié la dispo de Léa pour le spectacle du 12 ? » | Saison → Journal d'audit (saison) |
| **Marc** — event organizer only | « Qui a validé la compo de *mon* spectacle ? » | Détail spectacle → onglet **Activité** (Tous) |
| **Léa** — member (linked participant) | « Qui a modifié ma dispo ? » | Détail spectacle → onglet **Activité** (Moi) |

**Emotional goal:** Replace suspicion with **traceability** — acteur vs sujet must be obvious at a glance (especially proxy actions from Stories 5.5 / 6.8).

---

## Navigation — entry points

Uses existing **`app-scope-admin-menu`** ([ux-design-scope-admin-menu-epic17.md](./ux-design-scope-admin-menu-epic17.md)). **Do not** add audit to toolbar actions, breadcrumb links, or account menu.

### Menu item (all scopes)

| Property | Value |
|----------|--------|
| **Label** | `Journal d'audit` |
| **Icon** | `history` (Material Symbols) |
| **Type** | `routerLink` to scope-specific admin route |
| **Position** | **Last item** in the flat menu list (after operational admin entries like Participants, Exporter, Archiver) |

### Screen A — Troupe hub (`/troupes/:slug`)

**Who sees gear:** `TROUPE_ADMIN` or platform admin (`canManageTroupe()` today).

**Menu addition (when `canViewAuditTroupe`):**

| Label | Route |
|-------|-------|
| Journal d'audit | `/troupes/:slug/admin/audit` |

Insert **after** existing entries (`Modifier`, `Nouvelle saison`, `Membres`).

### Screen B — Season workspace (`/saison/:slug`)

**Who sees gear + Journal d'audit:**

| Role | Sees season gear? | Sees Journal d'audit in menu? |
|------|-------------------|-------------------------------|
| Troupe admin | Yes | Yes (`canViewAuditSeason`) |
| Season organizer | Yes | Yes (`canViewAuditSeason`) |
| Event organizer **only** | **No** (no season-level audit entry) | **No** — use event detail |
| Member | No | No |

**Menu addition (when `canViewAuditSeason`):**

| Label | Route |
|-------|-------|
| Journal d'audit | `/saison/:slug/admin/audit` |

Insert **after** last permitted admin item (typically after **Exporter** or **Participants**).

### Screen C — Event detail (`/saison/:slug/event/:eventSlug`) — **Activité tab**

**Primary entry:** 4th tab in `mat-tab-group` — **not** gear menu (no duplicate « Journal d'audit » on event ⚙️).

| Tab order | Label | Icon (`mat-icon`) |
|-----------|-------|-------------------|
| 1 | Infos | `info` |
| 2 | Dispos | `grid_on` |
| 3 | Équipe | `groups` |
| 4 | **Activité** | **`history`** (journal / timeline — Material Symbols) |

**Tab visibility:**

| Role | Sees Activité tab? | Default mode |
|------|-------------------|--------------|
| Troupe admin, season organizer, event organizer | Yes | **Tous** if `canViewAuditEvent`; else **Moi** |
| Linked participant (member), no orga rights | Yes | **Moi** only |
| Visitor / no linked participant | No | — |

**Gear menu on event detail:** unchanged for Participants, Modifier, Archiver, etc. — **do not add** Journal d'audit here.

#### Tab chrome layout (mirror Dispos)

Reference: [`event-dispos-tab.html`](../../apps/web/src/app/shared/availability/event-dispos-tab.html).

```
┌─────────────────────────────────────────────────────────────┐
│ [ Infos | Dispos | Équipe | Activité ]                       │
├─────────────────────────────────────────────────────────────┤
│ (orga only, Moi mode)  [ Participant ▾ ]                    │
│                        [ Moi | Tous ]  ← mat-button-toggle   │
├─────────────────────────────────────────────────────────────┤
│ Audit rows (newest first) + pagination                       │
└─────────────────────────────────────────────────────────────┘
```

#### Toolbar behaviour

| Control | When shown | Behaviour |
|---------|------------|-----------|
| **`app-availability-subject-selector`** (reuse) | `canSwitchSubject()` **and** view = **Moi** | Pick participant to filter audit entries where they are **actor or subject** (proxy/orga view) |
| **Moi / Tous** toggle | Always when tab visible | See matrix below |
| Type d'action / dates filters | **Tous** mode only (orga) | Optional compact row below toggle — same filters as admin page, minus spectacle picker (already bound to event) |

#### Moi / Tous matrix

| Mode | Who | API filter (conceptual) | UI |
|------|-----|-------------------------|-----|
| **Moi** | Any user with linked participant | `eventId` + participant = self (or selected subject if orga) + `(actor = me ∨ subject = me)` | Toggle visible; **Tous** hidden or disabled if `!canViewAuditEvent` |
| **Tous** | `canViewAuditEvent` only | All audit rows for `eventId`; optional further filter by selected participant in toolbar extension (future) | Full event journal |

**Default on tab open:**

- Orga/admin → **Tous**
- Member only → **Moi** (no toggle if single mode — hide toggle group when user lacks `canViewAuditEvent`)

#### Row content

Same **compact one-liner** model as § Entry presentation — shared `audit-line-formatter.ts` with troupe/season admin pages.

#### Route note

Event-scoped audit is **in-tab** (`?tab=activite` or internal tab state). The standalone route `/saison/:slug/event/:eventSlug/admin/audit` is **optional** (deep link only); if implemented, it redirects to event detail with Activité tab selected — **not** a separate full page.

**Removed from prior spec:** gear menu item « Journal d'audit » on event detail.

---

## Entry presentation — visual cards v3 (2026-06-01)

> **Supersedes** the strict **single-line one-liner** rules in the sections below for **rendered layout**. Those sections remain normative for **segment order**, **actor semantics**, **draw block**, and **`fullText`** / accessibility strings. See **§ Amendment — Entry presentation v3** for the shipped card model (Patrice sign-off, story 9.1).

**Design goal:** Scannable **activity cards** — semantic colour aligned with Dispos / Équipe, compact head line, pills for state. Not narrative prose, not expandable, **no raw JSON**.

| Persona | Job | Card must answer |
|---------|-----|------------------|
| **Léa** (**Moi**) | Se souvenir de ses actions | *Quoi* changed (pills) |
| **Marc / Camille** (**Tous**) | Reconstituer une séquence | *Quand* · *sur qui* (avatar+ pseudo) · *changement* · *qui a agi* (badge if proxy/orga) |

**Principle:** Up to **two visual lines** per card (head + pills). Ellipsis on head overflow; full line in `title`. **No expand**, **no raw JSON**.

### Line template (logical / `fullText` / a11y)

Fixed segment order — **omit** empty segments; join with middle dot ` · `:

```
{time} · {subject?} · {action} · {detail?} · {actor?}
```

*(Rendered UI maps `detail` → pills/transition; `actor` → badge + popover when applicable — not inline trailing text.)*

| Segment | Always? | Content |
|---------|---------|---------|
| **time** | Yes | `HH:mm` (**Moi**) · `HH:mm:ss` (**Tous** / admin pages) |
| **subject** | When the action concerns a participant and adds context | Display name, or `Sujet supprimé` — **before action**; omit in **Moi** when viewer is the subject |
| **action** | Yes | Short French label — e.g. `Dispo modifiée`, `Compo validée`, `Créneau assigné` |
| **detail** | When diff exists | Compact change — `Indispo → Dispo`, `MC`, `Confirmée · MC` |
| **actor** | See § Actor semantics + § Actor badge (v3) | Badge + popover when explicit; **`fullText`** may append name for a11y — **not** inline muted span in v3 |

**Scan column alignment:** Stable prefix `heure · sujet · action · détail`; **explicit** administered rows add muted **actor** at the end; **system** state rows never do.

### Actor semantics — explicit vs system (2026-06-01)

Not every audit row represents « someone clicked a button ». Distinguish:

| Kind | Source | `actorUserId` | Trailing actor in UI |
|------|--------|---------------|----------------------|
| **Explicit** | User gesture (validate compo, proxy dispo, tirage, grant orga…) | Present | See rules below |
| **System** | Derived state when preconditions are met (ex. all slots confirmed → équipe confirmée) | **`null`** | **Never** — no `(orga)`, no muted name |

**Explicit — when to show trailing actor:**

| Case | Trailing actor? | Example |
|------|-----------------|---------|
| Self-service (`actor = subject`) | No | `14:28:15 · Léa · Dispo modifiée · Dispo · MC` |
| Administered (`actor ≠ subject`) | Yes (muted) | `14:32:08 · Léa · Dispo modifiée · Indispo → Dispo · MC · Camille` |
| Event-level button, no subject participant | Yes (muted) | `14:35:02 · Compo validée · Camille` |
| Tirage header | Yes (muted) if organizer ran draw | `14:36:41 · Tirage · Impro du 12 juin · Camille` |

**System — state transitions (mainly lifecycle / badge):**

No human pressed a button; the platform **recomputed** status from existing data (confirmations, slots, dispos…).

| Example line | Notes |
|--------------|-------|
| `14:41:02 · Statut équipe · Préparation → Confirmée` | Event **Activité** tab — spectacle implicit |
| `Impro du 12 juin · 14:41:02 · Statut équipe · Préparation → Confirmée` | Season/troupe admin — spectacle in prefix |
| `14:40:55 · Léa · Participation confirmée · MC` | **Explicit** — Léa clicked confirm (separate row, may precede system row) |
| `14:41:02 · Statut équipe · Préparation → Confirmée` | **System** — follows when last required confirmation satisfied |

**Action labels (system):** prefer `Statut équipe`, `Statut spectacle`, or `Statut composition` + detail `Avant → Après` using the same French labels as `teamStatusBadge` / `compositionLifecycle` (`Préparation`, `Confirmée`, `Collecte`, `Compo complète`, etc.).

**Backend (in scope 9.1):** `audit_events.actor_user_id` is nullable (V43). After composition-related mutations, when **`CompositionLifecycleService.computeRawLifecycle`** changes for an event, persist **`COMPOSITION_LIFECYCLE_CHANGED`** with `actorUserId = null`, `before` / `after` carrying at minimum `compositionLifecycle` (and optionally `teamStatusBadgeKey` for UI label mapping). Hook via a shared helper invoked from participation, slot assignment, draw, validate/unlock/publish paths — same transaction as the triggering mutation. See Story 9.1 tasks § System lifecycle audit capture.

**Do not** invent a synthetic actor (« Système », « Automatique ») in the UI — absence of the segment is the signal.

**Moi mode:**

| Case | Example line | Trailing actor |
|------|----------------|----------------|
| Self acted | `14:28 · Dispo modifiée · Indispo → Dispo · MC` | — |
| Someone acted for me | `14:32 · Dispo modifiée · Indispo → Dispo · MC · Camille` | `Camille` (muted) |
| Participation self | `14:40 · Participation confirmée · MC` | — |

**Tous mode:**

| Case | Example line | Trailing actor |
|------|----------------|----------------|
| Self-service (actor = subject) | `14:28:15 · Léa · Dispo modifiée · Dispo · MC, Loueur` | — |
| Administered (proxy) | `14:32:08 · Léa · Dispo modifiée · Indispo → Dispo · MC · Camille` | `Camille` (muted) |
| Event-level explicit (validate…) | `14:35:02 · Compo validée · Camille` | `Camille` (muted) |
| **System state** | `14:41:02 · Statut équipe · Préparation → Confirmée` | — |
| **Tirage** | **Draw block** — see § Draw block | header only |
| Slot administered (manual) | `14:37:03 · Léa · Créneau assigné · MC (2) · Camille` | `Camille` (muted) |

**Season/troupe admin pages:** prepend spectacle when not event-scoped:

`Impro du 12 juin · 14:32:08 · Léa · Dispo modifiée · Indispo → Dispo · MC · Camille`

### Actor badge (v3 — replaces trailing muted text)

See **§ Amendment — Entry presentation v3 — Actor badge**. Summary:

| Case | UI |
|------|-----|
| Self-service | No badge |
| Proxy (`actor ≠ subject`) | Tertiary-tinted card + avatar badge top-right + tap popover |
| Direct orga action (no subject) | Avatar badge + popover (e.g. Compo validée) |
| System (`actorUserId` null) | No badge |

### Actor styling v2 (superseded for layout)

~~Render trailing **actor** as muted inline span~~ — **replaced by actor badge (v3)**. Keep muted colour idiom only inside popover secondary line if needed.

### Visual pattern (v3)

```
┌─────────────────────────────────────────────────────────────┐
│  ——— Aujourd'hui ———                                        │
├─────────────────────────────────────────────────────────────┤
│ 14:32:08  [av] Léa  Dispo modifiée              [av acteur]│  ← head + proxy badge
│ [Pas dispo] → [Dispo]  [🎭 Comédien·ne]                     │  ← semantic pills
├─────────────────────────────────────────────────────────────┤
│ 14:35:02  Compo validée                        [av acteur]│  ← direct actor badge
├─────────────────────────────────────────────────────────────┤
│ 14:41:02  Statut équipe                                     │
│ [Préparation] → [Confirmé]                       [av acteur]│  ← badge bottom-right if orga
├─────────────────────────────────────────────────────────────┤
│ 14:36:41  Tirage · Impro du 12 juin              [av acteur]│  ← draw header
│   14:36:41  [av] Léa  Créneau assigné                        │
│   [🎭 Comédien·ne (1)]                                      │  ← indented child
└─────────────────────────────────────────────────────────────┘
```

- **Component:** `app-audit-line-view` inside `audit-journal-list` cards — **read-only**.
- **Card tint:** `audit-journal-list__entry--proxy` when proxy mode.
- **Day dividers:** agenda month-pill pattern between date groups.
- **No** chevrons, expansion panels, or row actions in MVP.

### Detail segment rules (`audit-line-formatter.ts`)

| Change type | Detail format |
|-------------|---------------|
| Status | `Indispo → Dispo` (reuse availability French labels) |
| Roles only | `MC, Loueur` or `MC` |
| Status + roles | `Indispo → Dispo · MC` |
| Participation | `Confirmée · MC` / `Déclinée · MC` |
| Slot | `MC (2)` — role + 1-based slot index |
| Draw (header) | spectacle title only — **no** assignment count in detail |
| Draw (child) | `{roleKey} ({slotIndex})` — subject in its own segment before action |
| Event field | `Lieu : Studio B` or `Studio B` if single field |
| Creation | `MC` (after only) |
| Deletion | `Supprimée` / `Retiré` |
| System lifecycle | `Préparation → Confirmée` (badge/lifecycle French labels) |

Multi-field changes: show **at most two** fragments in `detail`, joined by ` · ` — prioritize status/participation over comment.

### Draw block — `COMPOSITION_DRAW_COMPLETED` (2026-06-01)

**Backend (9.0):** one audit row per tirage with aggregated `assignmentsByRole` before/after ([ADR 9.0 R1](../implementation-artifacts/9-0-capture-backend-piste-audit.md)). **UI (9.1):** expand at display time into a **contiguous block** — never a single « 12 assignations » summary line.

#### Block structure

| Row | Role | Line pattern |
|-----|------|--------------|
| **Header** | Draw event | `{time} · Tirage · {spectacleTitle} · {actor?}` |
| **Child × N** | Each new/changed assignment from diff | `{time} · {subject} · Créneau assigné · {roleKey} ({slotIndex})` |

- **Spectacle title** on header: **required** on troupe/season admin pages; **omitted** on event **Activité** tab (spectacle already implicit).
- **Actor** on header only (organizer who ran the draw) — trailing muted segment when present; **not repeated** on child lines.
- **Child lines:** no trailing actor; optional visual indent (see below).
- **Same `occurredAt`** on header and all children (single source audit event).

#### Diff → children (implement in `audit-draw-expander.ts`)

From `before.assignmentsByRole` vs `after.assignmentsByRole`, emit one child row per slot where:

- assignee **added** (was empty → participant), or
- assignee **changed** (participant A → B) during this draw (FULL redraw included).

Do **not** emit children for slots unchanged by the draw. Order children: `roleKey` ascending, then `slotIndex` ascending (match `AuditSnapshots.drawAssignments`).

Resolve `subject` display names via API-resolved labels on the DTO page (batch participant lookup — same as other rows).

#### Visual grouping

```
14:36:41 · Tirage · Impro du 12 juin · Camille
  14:36:41 · Léa · Créneau assigné · MC (1)
  14:36:41 · Marc · Créneau assigné · Arbitre (1)
```

| CSS (suggested) | Purpose |
|-----------------|--------|
| `.audit-line--draw-header` | Normal weight; spectacle title in default on-surface |
| `.audit-line--draw-child` | `padding-inline-start: 1rem`; optional `border-inline-start: 2px solid var(--mat-sys-outline-variant)` |

Children stay **one line each** (same ellipsis/`title` rules). Block stays **contiguous** in the feed — do not interleave other entries between header and children.

#### Pagination & filters

- **Pagination** counts **source audit events** (one draw = one paginated item); a page may render more visual lines after expansion.
- **Type filter « Tirage »:** show full block (header + children).
- **Type filter « Créneau assigné »:** show matching **child** lines; include draw **header** immediately above when any child matches (orphan children forbidden).
- **Moi mode:** show block if viewer is actor **or** any child subject matches filtered participant.

#### Anti-patterns (draw)

| ❌ | ✅ |
|----|-----|
| `Tirage · 12 assignations` single line | Header + N assignment lines |
| Separate DB row per draw slot | Display expansion from one `COMPOSITION_DRAW_COMPLETED` |
| Actor repeated on every child | Actor on header only |

**Manual** `SLOT_ASSIGNED` rows (outside draw) keep the standard one-liner — not nested under a draw block.

### Navigation (journal-level only)

No per-row navigation. Journal-level controls only:

| Control | Behaviour |
|---------|-----------|
| Sort | Newest first (fixed) |
| Day dividers | « Aujourd'hui », « Hier », `dd MMMM yyyy` |
| Pagination | `mat-paginator`, default 25 |
| Filters (**Tous** / admin) | Type + dates → reset page 0 |
| Moi / Tous + Participant | Event Activité toolbar |

### Empty copy (Activité tab)

| Case | Message |
|------|---------|
| **Moi**, no rows | « Aucune activité te concernant sur ce spectacle. » |
| **Tous**, no rows | « Aucune activité enregistrée pour ce spectacle. » |
| Filtered empty | « Aucun résultat pour ces filtres. » + Réinitialiser |

### Anti-patterns (forbidden)

| ❌ | ✅ |
|----|-----|
| Narrative sentences | Head segments + semantic pills |
| Violet/bold action hint competing with pills | Attenuated action hint; pills carry colour |
| Trailing muted actor name (v2) | Actor avatar badge + tap popover (v3) |
| Large « Par … » footer band | Compact badge only |
| Hover-only actor info on mobile | Tap toggles popover |
| Expand / chevron | All info in card (max 2 lines + badge) |
| Raw JSON / « Données brutes » | Never in UI — API/debug only |
| English enum keys | French labels + emojis where Dispos uses them |
| `(orga)` suffix | Popover « organisateur » copy instead |
| Synthetic « Système » actor | Omit badge when `actorUserId` null |
| Draw as one aggregated line | Draw block: header + per-assignment children |
| Clickable rows (MVP) | Read-only list; **except** actor badge tap |

### Shared component

`audit-journal-list` + `app-audit-line-view` render cards on **Activité** tab and troupe/season admin pages. Formatters: `audit-line-view-model.ts`, `audit-line-formatter.ts`, `audit-draw-expander.ts`, `audit-display-labels.ts`, `audit-labels.ts`.

---

### Explicit non-placement

| Surface | Rule |
|---------|------|
| `/agenda`, `/accueil`, `/compte` | No Journal d'audit |
| Season workspace for **event-only organizer** | No gear / no audit menu item |
| Event Infos tab body, Dispos toolbar, Équipe toolbar | No second audit entry — **Activité tab** only |
| Event gear menu | **No** Journal d'audit (tab replaces it) |
| Raw JSON in UI | **Forbidden** — not exposed in frontend |

---

## Admin pages — two routes + in-tab event surface

**Shared list component:** `audit-journal-list` (suggested) — used by troupe/season admin pages **and** event **Activité** tab.

**Admin page component:** `AdminAuditJournal` with `scope: 'troupe' | 'saison'` from route only.

| Scope | Route / surface | Page title |
|-------|-----------------|------------|
| Troupe | `/troupes/:slug/admin/audit` | `Journal d'audit` |
| Season | `/saison/:slug/admin/audit` | `Journal d'audit` |
| Event | **In-tab** — `/saison/:slug/event/:eventSlug` tab **Activité** | Tab label `Activité` (not « Journal d'audit » on tab) |

**Reference layout:** mirror [admin-participants](../apps/web/src/app/pages/admin-participants/admin-participants.html) — `app-context-breadcrumb`, mobile H1, spinner, empty states, no back chevron (17.11).

**Route helpers (add to `troupe-routes.ts`):**

```typescript
export function troupeAdminAuditPath(troupeSlug: string): string[] {
  return ['/', TROUPE_HUB_ROUTE_PREFIX, troupeSlug, 'admin', 'audit']
}

export function saisonAdminAuditPath(seasonSlug: string): string[] {
  return ['/saison', seasonSlug, 'admin', 'audit']
}

// Event: prefer tab deep link — optional helper
export function saisonEventActiviteTabPath(seasonSlug: string, eventSlug: string): string[] {
  return ['/saison', seasonSlug, 'event', eventSlug]
  // + query ?tab=activite or router state when implementing
}
```

---

## Page layout — desktop (≥ 841 px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison › … › Journal d'audit                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Scope hint (mat-chip):  « Saison · Impro 2025-26 »  or event title      │
├─────────────────────────────────────────────────────────────────────────┤
│ FILTERS (wrap on narrow desktop)                                        │
│ [ Type d'action ▾ ] [ Du 📅 ] [ Au 📅 ] [ Réinitialiser ]               │
│ (Season/troupe scope only: optional [ Spectacle ▾ ] when not event page)│
├─────────────────────────────────────────────────────────────────────────┤
│ LIST — newest first (one line per entry)                                │
│ 14:32:08 · Léa · Dispo modifiée · Indispo → Dispo · MC · Camille       │
│ 14:28:15 · Léa · Dispo modifiée · Dispo · MC, Loueur                   │
├─────────────────────────────────────────────────────────────────────────┤
│ [ MatPaginator — aria-label="Pagination du journal d'audit" ]           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Page layout — mobile (≤ 480 px)

```
┌──────────────────────────┐
│ Troupe › Saison › …      │
│ Journal d'audit          │  ← mobile H1 (admin-participants pattern)
├──────────────────────────┤
│ [ Saison · … ] chip      │
├──────────────────────────┤
│ Type ▾                   │  ← stacked mat-form-field / mat-select
│ Du / Au (full width)     │
│ [ Réinitialiser ]        │
├──────────────────────────┤
│ One line per row (ellipsis if long) │
│ Paginator                         │
└──────────────────────────┘
```

**No horizontal-only table** on mobile — same one-liner list; ellipsis + `title` for full text.

---

## Audit row — content model

Each row = **one formatted line** from `audit-line-formatter.ts`. No expand state.

### Segment mapping

| Source field | Segment | Position |
|--------------|---------|----------|
| `occurredAt` | `time` | 1 |
| `subjectLabel` | `subject` | 2 — omit in **Moi** when viewer is subject |
| `actionType` | `action` | 3 |
| `before` / `after` / `metadata` | `detail` | 4 |
| `actorLabel` | `actor` | **Last**, only when **explicit** (`actorUserId` present) and rules in § Actor semantics apply |

### Proxy emphasis (FR17 / FR26)

Explicit proxy: **subject · action · detail · muted actor**. System rows: **no actor**. No `(orga)` label.

---

## Diff formatting — French labels

Map `AuditActionType` → chip label (implement in `core/audit/audit-labels.ts`):

| Enum group | Example chip label |
|------------|-------------------|
| `AVAILABILITY_*` | Disponibilité créée / modifiée / supprimée |
| `EVENT_*` | Spectacle créé / modifié / archivé / réactivé |
| `SEASON_PARTICIPANT_*` | Participant saison ajouté / modifié / retiré |
| `EVENT_PARTICIPANT_*` | Participant spectacle … |
| `TROUPE_MEMBER_*` | Membre troupe … |
| `*_ORGANIZER_*` | Rôle organisateur accordé / retiré |
| `COMPOSITION_*` | Composition publiée / validée / déverrouillée / tirage terminé |
| `COMPOSITION_LIFECYCLE_CHANGED` | **Statut équipe** (system — detail = badge label before → after) |
| `SLOT_*` | Créneau assigné / vidé |
| `PARTICIPATION_*` | Participation confirmée / déclinée / réinitialisée |

**Field labels (before → after):**

| Key | Label |
|-----|--------|
| `status` | Disponibilité |
| `roleKeys` | Rôles |
| `comment` | Commentaire |
| `participationStatus` | Statut de participation |
| `roleKey` / `slotIndex` | Rôle / créneau |
| `title`, `startsAt`, `location` | Titre / Date / Lieu |
| `archived` | Archivé |
| `displayName` | Nom affiché |

**Value enums:** reuse existing French labels from availability/participation helpers where possible (`availability-status.ts`, `participation-status.ts`).

**Empty states:**

| Case | Teaser text |
|------|-------------|
| No `beforeJson` | « Création » or omit before column |
| No `afterJson` | « Suppression » or « Réinitialisation » |
| `COMPOSITION_DRAW_COMPLETED` | Expand to draw block (§ Draw block) — not a single summary line |

---

## Filters

| Filter | Scope availability | Control | API param |
|--------|-------------------|---------|-----------|
| Type d'action | All | `mat-select` multi or single | `actionType` |
| Du / Au | All | `mat-datepicker` pair | `from`, `to` (ISO UTC) |
| Spectacle | Troupe + season pages only | `mat-select` optional | `eventId` |
| (none) | Event page | Pre-bound to current event | `eventId` fixed |

**Réinitialiser:** `mat-stroked-button`, clears filters and reloads page 0.

**Default sort:** `occurredAt` descending (newest first). No user-facing sort control in MVP.

---

## Permissions — `canViewAudit`

Add to API permissions DTO (names illustrative — align with backend):

| Flag | When true |
|------|-----------|
| `canViewAuditTroupe` | Troupe admin or platform admin for troupe |
| `canViewAuditSeason` | Troupe admin, platform admin, or season organizer for season |
| `canViewAuditEvent` | Troupe admin, season organizer, or event organizer for **this** event |

**Frontend gating:**

```typescript
// Season workspace — include Journal d'audit only if:
permissions.canViewAuditSeason === true

// Event detail — include Journal d'audit only if:
permissions.canViewAuditEvent === true

// Troupe hub — include Journal d'audit only if:
canViewAuditTroupe === true
```

**Gear rule unchanged:** if after gating the menu has **zero** items, hide gear entirely (`items.length === 0`).

**Direct URL:** unauthorized users see same pattern as `admin-participants` — snackbar or inline message: « Tu n'as pas accès à cette page. » + optional link back to season/agenda.

---

## States

| State | UI |
|-------|-----|
| **Loading** | Centered `mat-spinner` (diameter 40) |
| **Empty (authorized, no rows)** | « Aucune entrée dans le journal pour ce périmètre. » |
| **Empty (filtered)** | « Aucun résultat pour ces filtres. » + Réinitialiser |
| **Error (network)** | « Impossible de charger le journal. Réessaie. » + retry button |
| **403** | « Tu n'as pas accès à cette page. » |
| **Pagination** | `mat-paginator`, `pageSizeOptions: [10, 25, 50]`, default **25** |

---

## Material 3 & accessibility

| Rule | Detail |
|------|--------|
| Components | `mat-list`, `mat-form-field`, `mat-select`, `mat-datepicker`, `mat-stroked-button`, `mat-paginator`, `mat-spinner` |
| Tokens | `--mat-sys-*` only in SCSS |
| Paginator | `aria-label="Pagination du journal d'audit"` |
| List rows | `title` attribute = full one-liner when truncated; rows read-only (no expand) |
| Touch | Filter controls ≥ 48 dp; actor badge tap target compact (~28 px) — **popover on tap required**; head line ellipsis OK on mobile |
| Copy | Tutoiement — « Tu n'as pas accès… », « Réessaie » |

See [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) checklist at story completion.

---

## API contract hints (for dev alignment)

| Scope | Suggested GET |
|-------|----------------|
| Troupe | `/v1/troupes/{troupeId}/audit-events?page&size&seasonId&eventId&actionType&from&to` |
| Season | `/v1/seasons/{seasonId}/audit-events?...` |
| Event | `/v1/seasons/{seasonId}/events/{eventId}/audit-events?...&scope=moi\|tous&participantId=` |

Query `scope=moi` restricts to entries where caller's linked participant (or `participantId` when orga proxy) is **actor or subject**. `scope=tous` requires `canViewAuditEvent`.

Response: existing `Paged*Response` shape; each item includes resolved `actorLabel`, `subjectLabel`, `actionLabel`, `before`, `after`, `metadata`, scope ids.

---

## Implementation mapping

| Area | File / action |
|------|----------------|
| Routes | `app.routes.ts` — troupe + season audit pages only |
| Event tab | `shared/audit/event-activite-tab.ts` — mirror `event-dispos-tab` |
| Shared list | `shared/audit-journal-list/` + `audit-line-view/` — cards + paginator (tab + admin pages) |
| Page | `pages/admin-audit-journal/` — troupe + season scopes |
| API client | `core/audit/audit-api.service.ts` — `listForEvent(..., scope, participantId?)` |
| Labels/diff | `audit-line-view-model.ts`, `audit-display-labels.ts`, `audit-line-formatter.ts`, `audit-draw-expander.ts`, `audit-labels.ts` |
| Menu wiring | `troupe-hub.ts`, `season-home.ts` only — **not** event gear |
| Event detail | `event-detail.html` — 4th tab **Activité**; `showActiviteTab` gating |
| Reuse | `app-availability-subject-selector`, Dispos toggle pattern |
| Permissions | `canViewAudit*` + linked participant for tab visibility |
| Backend | `AuditEventController`, `AuditAccessService`, OpenAPI `audit.yaml` |
| Tests | `event-activite-tab.spec.ts`, `admin-audit-journal.spec.ts`, `AuditEventReadIntegrationTest.kt` |

---

## Acceptance checklist (UX sign-off)

- [x] Menu label is exactly **Journal d'audit** with icon `history` (**troupe + season gear only**)
- [x] Event scope: **Activité** tab (icon `history`), **no** gear menu duplicate
- [x] Activité tab: **Moi / Tous** toggle + participant selector (orga, Moi mode) — parity with Dispos toolbar
- [x] **Tous** only when `canViewAuditEvent`; **Moi** for linked participants
- [x] One gear menu item per troupe/season scope; hidden unless `canViewAudit*`
- [x] Event-only organizer: no season workspace gear; uses **Activité** tab on their event(s)
- [x] Each row is a **card** with head line + **semantic pills** (v3)
- [x] Subject shown as **avatar + pseudo** when applicable
- [x] **Actor badge** for explicit actions (proxy + direct without subject); **never** when `actorUserId` null or self-action
- [x] **Tap popover** on actor badge (mobile-first) — not hover-only
- [x] **System** state rows: lifecycle pills, no actor badge; **`COMPOSITION_LIFECYCLE_CHANGED`** captured in 9.1
- [x] **Draw block:** header + per-assignment children; actor badge on header only
- [x] **No expand**, **no raw JSON** in UI
- [x] **Tous** / admin: `HH:mm:ss`; **Moi**: `HH:mm`; day dividers
- [x] Mobile card layout; no horizontal table trap
- [x] Paginator with French aria-label
- [x] 403 / empty / error states in French

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-01 | **Entry presentation v3** — visual cards, semantic pills, avatar subject, actor badge + tap popover; Patrice story 9.1 sign-off |
| 2026-06-01 | **Lifecycle capture in 9.1** — `COMPOSITION_LIFECYCLE_CHANGED`, null actor |
| 2026-06-01 | **Actor semantics** — explicit vs system state transitions |
| 2026-06-01 | **Segment order** — `time · subject? · action · detail? · actor?` |
| 2026-06-01 | **Draw block** — expand tirage to header + per-assignment lines (UI only; 9.0 single DB row) |
| 2026-06-01 | **Actor last** when ≠ subject (muted color); drop `(orga)` suffix |
| 2026-06-01 | **Entry design v2** — compact one-liner, no expand, no raw JSON in UI |
| 2026-06-01 | Entry design v1 (narrative + expand) — superseded |
| 2026-06-01 | **Amendment** — Event scope: **Activité** tab (Moi/Tous + participant filter); remove event gear « Journal d'audit » |
| 2026-06-01 | Initial spec — stakeholder sign-off: Journal d'audit label, canViewAudit gating, event-organizer event-detail-only entry |

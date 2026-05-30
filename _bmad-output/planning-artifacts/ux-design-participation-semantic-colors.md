---
title: UX — Participation semantic colors (V1 parity)
author: Sally (UX) + Patrice
date: '2026-05-29'
lastUpdated: '2026-05-29'
status: approved
stakeholderDecisions:
  - restore-violet-for-selections-globally
  - restore-orange-for-declines-globally
  - keep-red-for-unavailability-only
  - pending-must-be-visually-distinct-from-declined
  - pending-uses-amber-gold-not-tertiary-orange
  - centralize-tokens-in-hatcast-semantic-colors
  - extend-chart-api-status-selected-not-available
  - gradient-strong-unified-v1-tailwind-palette
  - same-gradient-strong-on-counters-chart-modal-dispos-equipe
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - docs/v2/technical/FRONTEND_UI.md
  - legacy/src/styles/status-colors.css
  - legacy/src/components/ConfirmationModal.vue
  - legacy/src/components/PlayerModal.vue
  - apps/web/src/styles/_hatcast-semantic-colors.scss
inputDocuments:
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - docs/v2/technical/FRONTEND_UI.md
  - legacy/src/styles/status-colors.css
  - legacy/src/components/ConfirmationModal.vue
  - legacy/src/components/PlayerModal.vue
  - apps/web/src/styles/_hatcast-semantic-colors.scss
  - apps/web/src/app/shared/member-profile/member-profile-dialog.scss
  - services/api/src/main/kotlin/com/hatcast/api/memberprofile/SeasonGlanceStatsProvider.kt
revisionNotes:
  - '2026-05-29 (PM): Gradient canon locked to V1 Tailwind stops (ConfirmationModal.vue). -gradient-strong is the single fill for counters, chart, modal, Dispos toggles, Équipe rows/badges. M3 color-mix gradients superseded for participation fills.'
---

# UX Design — Participation semantic colors

**Purpose:** Implementation-ready spec to restore **V1 colour semantics** across HatCast V2 for **availability**, **selection**, **decline**, and **unknown** states. Fixes the Mes Stats mismatch (purple summary vs green chart blocks) and red/red confusion between **désistement** and **indispo**.

**Principle:** One **participation colour language** shared by Mes Stats, Équipe tab, Dispos tab, agenda badges, participation modal, and any future surface. **Hue semantics** (violet = sélection, orange→jaune = en attente, rouge→orange = désistement, etc.) match V1. **Rendering** uses the **V1 Tailwind gradient stops** defined once in `_hatcast-semantic-colors.scss`; features consume CSS variables only (M3 / FRONTEND_UI).

**Normative gradient rule (2026-05-29):** For every participation state listed below, the **canonical fill** is `-gradient-strong` (135°, saturated Tailwind 500 stops). Same token on Mes Stats counters, chart blocks, modal actions, Dispos status toggles (checked), and Équipe slot rows / status badges. Do **not** derive participation fills from `--mat-sys-primary` / `color-mix` on surface — that produced hues that diverged from V1.

---

## User story

**Angie** opens **Mes Stats**. She sees **Sélections** in violet at the top — her mental model from years on V1. She scans the month chart: blocks where she played show **the same violet**, with a role emoji inside. A block where she said *pas dispo* is **red**. A block where she was picked then declined is **orange vif** — unmistakable, not “another shade of red”. On the **Équipe** tab of tonight’s match, confirmed slots use **violet**, slots **en attente de confirmation** use **ambre doré** (gold-leaning — *“j’ai encore une action à faire”*), and the declines section uses **orange** (*“c’est acté, j’ai lâché”*). She never confuses *en attente* with *désisté*, and never asks *“is green my dispo or my selection?”*

---

## Problem statement (V2 as-is)

| Issue | Where | Impact |
|-------|-------|--------|
| Selection summary **violet**, chart blocks **green** | `member-profile-panel` + `SeasonGlanceStatsProvider` returns `status: "available"` for slotted roles | Breaks at-a-glance scan; contradicts counter semantics |
| **Decline** and **unavailable** both use `--mat-sys-error` at different opacities | `_hatcast-semantic-colors.scss` chart tokens | Two reds hard to distinguish, especially on mobile |
| Decline counter uses **pale red** hardcoded rgba | `member-profile-dialog.scss` | Third red variant; not aligned with chart or V1 |
| Équipe **confirmed** row uses **green** | `event-equipe-tab.scss` `--confirmed` | V1 used violet for confirmed selection |
| Declines badge on Équipe uses **red** rgba | `event-equipe-tab.scss` `--declines-badge` | Should be orange per V1 / stakeholder decision |
| Hardcoded hex/rgba in feature SCSS | `member-profile-dialog.scss`, `composition-participation-dialog.scss`, `event-equipe-tab.scss` | Bypasses theme; breaks light/dark consistency |

---

## Design decisions

| # | Topic | Decision |
|---|--------|----------|
| P1 | **Semantic model** | Five participation states (see table below), distinct hues |
| P2 | **Selection / in team** | **Violet** — `var(--mat-sys-primary)` and derived tokens |
| P3 | **Decline / désistement** | **Orange** — `var(--mat-sys-tertiary)` and derived tokens |
| P4 | **Unavailable (pas dispo)** | **Red** — `var(--mat-sys-error)` (unchanged intent) |
| P5 | **Available (dispo only)** | **Green** — existing `--hatcast-sys-positive*` (unchanged) |
| P6 | **Unknown / neutral** | **Grey** — existing unknown/neutral tokens (unchanged) |
| P7 | **Pending confirmation** | **Ambre / jaune-or** — dedicated token family; **not** tertiary orange (see § Pending vs declined) |
| P13 | **Pending ≠ declined** | Must remain distinguishable at a glance on Équipe rows, participation modal, and chart (when `pending` is exposed) |
| P8 | **Token source** | Single file: `apps/web/src/styles/_hatcast-semantic-colors.scss` |
| P9 | **No raw colours in features** | Replace rgba/hex in scoped files with semantic variables |
| P10 | **Chart API status** | Backend emits `selected` (or `in_team`) when `roleKey` present and not declined — **not** `available` |
| P11 | **V1 parity scope** | Full app surfaces listed in § Surfaces; legacy V1 unchanged |
| P12 | **Docs** | Update `FRONTEND_UI.md` + `ux-design-hatcast-v2.md` § Member profile chart |
| P14 | **Gradient canon** | Participation **fills** use **V1 Tailwind diagonal gradients** (`ConfirmationModal.vue`, `status-colors.css`) — not M3 `color-mix` on `--mat-sys-*` |
| P15 | **`-gradient-strong` unification** | Counters, chart blocks, modal buttons, Dispos toggles (checked), Équipe rows and équipe status badges share the **same** `-gradient-strong` per state |
| P16 | **Gradient stops** | Fixed hex stops exposed as `--hatcast-v1-*` in `_hatcast-semantic-colors.scss`; features reference `--hatcast-participation-*-gradient-*` only |

---

## Semantic colour chart

| State | User label (FR) | Meaning | Hue | M3 base | New token prefix (proposed) |
|-------|-----------------|---------|-----|---------|----------------------------|
| `available` | Disponible | Member marked available for the event (no locked selection) | Green | `--hatcast-sys-positive` | `--hatcast-participation-available-*` (alias existing availability tokens) |
| `selected` | Sélection / Dans l'équipe | Assigned to a role on a locked composition; active participation | **Violet** | `--mat-sys-primary` | `--hatcast-participation-selected-*` |
| `pending` | En attente de confirmation | Selected but participation not yet confirmed | **Ambre / jaune-or** | `--hatcast-sys-pending*` (amber palette) | `--hatcast-participation-pending-*` |
| `declined` | Désistement / Décliné | Was selected (or decline-only) then withdrew | **Orange vif** | `--mat-sys-tertiary` | `--hatcast-participation-declined-*` |
| `unavailable` | Pas dispo / Indisponible | Explicitly not available | **Red** | `--mat-sys-error` | `--hatcast-participation-unavailable-*` |
| `neutral` | Non renseigné | No data / archived neutral | Grey | outline / on-surface mix | `--hatcast-participation-neutral-*` |

**Non-negotiable pairings (stakeholder):**

- **Violet = selection confirmée** (never reuse green for “in team”).
- **Ambre / jaune-or = en attente** (never reuse violet or orange désistement).
- **Orange vif = désistement** (never reuse error red; never reuse pending amber).
- **Red = indispo / pas dispo** only.

---

## Pending vs declined — differentiation (P13)

These two states both sit *after* a selection, so they need **different hues**, not just different opacities of the same orange.

| Dimension | `pending` (en attente) | `declined` (désisté) |
|-----------|------------------------|----------------------|
| **Meaning** | Action still expected from the member | Commitment ended; slot freed or marked declined |
| **V1 reference** | `status-pending` — **orange → yellow** gradient (`ConfirmationModal` À confirmer) | `status-declined` — **red → orange** gradient (`ConfirmationModal` Décliner) |
| **V2 render** | `--hatcast-participation-pending-gradient-strong` | `--hatcast-participation-declined-gradient-strong` |
| **Hue read** | **Orange→yellow** (waiting, hourglass) | **Red→orange** (withdrawal, step back) |
| **M3 flat badges** (optional) | `--hatcast-sys-pending*` for `-badge-fg` on light bg | `--mat-sys-tertiary` or `--hatcast-v1-orange` for decline badge fg |
| **Emotional cue** | “Clock / hourglass” — waiting | “Step back” — withdrawal |
| **Équipe row** | Dashed or solid border in pending amber; background pending-container | Declines badge + list in declined orange |
| **Participation modal** | Middle action **En attente** — pending tokens | **Décliner** action — declined tokens |

**Implementation rule:** `pending` and `declined` **gradient fills** must use **different stop pairs** (orange→yellow vs red→orange). Do not derive both from the same hue with opacity tweaks.

**Side-by-side QA check:** Place one pending row and one declined badge on the same viewport (Équipe tab with open declines panel). A member who knows HatCast V1 should name both states correctly without reading labels.

---

## V1 gradient chart (canonical — normative)

Source of truth for **visual rendering** (approved 2026-05-29):

| State | V1 reference | Direction | Stop A → Stop B | Tailwind | Token (`-gradient-strong`) |
|-------|--------------|-----------|-----------------|----------|----------------------------|
| `selected` | `ConfirmationModal` Confirmer ; `status-confirmed` | **135°** (`gradient-to-br`) | `#a855f7` → `#ec4899` | purple-500 → pink-500 | `--hatcast-participation-selected-gradient-strong` |
| `pending` | `ConfirmationModal` À confirmer ; `status-pending` | **135°** | `#f97316` → `#eab308` | orange-500 → yellow-500 | `--hatcast-participation-pending-gradient-strong` |
| `declined` | `ConfirmationModal` Décliner ; `status-declined` | **135°** | `#ef4444` → `#f97316` | red-500 → orange-500 | `--hatcast-participation-declined-gradient-strong` |
| `available` | `status-available` | **135°** | `#22c55e` → `#10b981` | green-500 → emerald-500 | `--hatcast-participation-available-gradient-strong` |
| `unavailable` | `status-unavailable` | **135°** | `#ef4444` → `#dc2626` | red-500 → red-600 | `--hatcast-participation-unavailable-gradient-strong` |
| `neutral` | `status-unanswered` | **135°** | `#9ca3af` → `#6b7280` | gray-400 → gray-500 | `--hatcast-participation-neutral-gradient-strong` |

**Stop variables** (defined once, referenced by all gradient variants):

`--hatcast-v1-purple`, `--hatcast-v1-pink`, `--hatcast-v1-red`, `--hatcast-v1-orange`, `--hatcast-v1-yellow`, `--hatcast-v1-green`, `--hatcast-v1-emerald`, `--hatcast-v1-gray-mid`, `--hatcast-v1-gray`

### Gradient variants

| Suffix | Angle | Saturation | Use |
|--------|-------|------------|-----|
| `-gradient-strong` | 135° | Full stops (table above) | **Default fill** — counters, chart blocks, modal actions, Dispos toggles (checked), Équipe rows, équipe status badges, declines badge |
| `-gradient-medium` | 135° | ~72% stop mixed with `--hatcast-participation-chart-tint` | Hover / secondary emphasis (optional) |
| `-gradient-soft` | 135° | ~60% stop mixed with `--hatcast-participation-surface-tint` | Equivalent to V1 `from-*-500/60` on light surfaces |
| `-gradient-row` | 90° | ~60% stop mixed with surface (`status-colors.css` `to-r`) | Legacy row tint; **Équipe rows now use `-gradient-strong`** per P15 |

### Typography on `-gradient-strong`

| Property | Value |
|----------|-------|
| Text / icons | `#fff` |
| Border | `1px solid color-mix(in srgb, #fff 32%, transparent)` |
| Chart block border | `color-mix(in srgb, #fff 28%, transparent)` or state border token |

**M3 base colours** (`--mat-sys-primary`, `--hatcast-sys-pending`, etc.) remain for **non-gradient** surfaces (flat containers, badge foreground on light bg, theme chrome). They do **not** drive participation gradient fills.

---

## Token specification (CSS)

All participation gradients and aliases live in `@mixin hatcast-semantic-color-tokens()` in `_hatcast-semantic-colors.scss`.

### Canonical aliases (features consume these)

| Alias | Points to |
|-------|-----------|
| `-stat-bg` | `-gradient-strong` (Mes Stats counters) |
| `-chart-fill` | `-gradient-strong` (month chart blocks) |
| `-surface` | `-gradient-strong` (Dispos toggles when checked) |

### Flat container tokens (secondary)

For **non-filled** contexts (outline badges, chips on white background), keep `-container`, `-badge-bg`, `-badge-fg` as `color-mix` on semantic hues. **Do not** use `-container` for primary filled CTAs or stat cards — use `-gradient-strong`.

**BEM modifiers** (`participation-status.ts`):

`--available` | `--selected` | `--pending` | `--declined` | `--unavailable` | `--unknown`

**Legacy aliases:** `--hatcast-availability-*` remain for dispo-only surfaces; map to participation tokens where meaning matches.

---

## Surfaces — per-screen mapping (implemented)

### 1. Mes Stats / Member profile (`member-profile-panel`)

| Element | State | Token / class |
|---------|-------|---------------|
| Stat card **Disponibilités** | available | `--hatcast-participation-available-stat-bg` → `-gradient-strong` |
| Stat card **Sélections** | selected | `--hatcast-participation-selected-stat-bg` → `-gradient-strong` |
| Stat card **Désistements** | declined | `--hatcast-participation-declined-stat-bg` → `-gradient-strong` |
| Chart block | `available` | `--chart-block--available` |
| Chart block | `selected` | `--chart-block--selected` |
| Chart block | `pending` | `--chart-block--pending` |
| Chart block | `unavailable` | `--chart-block--unavailable` |
| Chart block | `declined` | `--chart-block--declined` |
| Chart block | `neutral` | `--chart-block--neutral` |

All chart modifiers use `-chart-fill` (= `-gradient-strong`). White text on stat cards.

### 2. Équipe tab (`event-equipe-tab`)

| Element | Token |
|---------|-------|
| Row **confirmed** | `--hatcast-participation-selected-gradient-strong` |
| Row **pending** | `--hatcast-participation-pending-gradient-strong` |
| **Declines** badge | `--hatcast-participation-declined-gradient-strong` |
| Empty slot / gap hint | Pending border or neutral dashed — **not** declined orange |

Participation modal (`composition-participation-dialog`):

| Action | Token |
|--------|-------|
| **Confirmer** | `--hatcast-participation-selected-gradient-strong` |
| **À confirmer** | `--hatcast-participation-pending-gradient-strong` |
| **Décliner** | `--hatcast-participation-declined-gradient-strong` |

Équipe status header badge (`composition-equipe-status-header`):

| Tone | Gradient |
|------|----------|
| `success` (Équipe complète) | selected `-gradient-strong` |
| `warning` / `info` (Confirmations en cours, En préparation, À compléter) | pending `-gradient-strong` |
| default / neutral | neutral `-gradient-strong` |

### 3. Dispos tab (`availability-form`)

| Toggle (checked) | Token |
|------------------|-------|
| Dispo | `--hatcast-participation-available-surface` |
| Pas dispo | `--hatcast-participation-unavailable-surface` |
| Non renseigné | `--hatcast-participation-neutral-surface` |

Each alias = corresponding `-gradient-strong`. White label when checked.

### 4. Agenda badges (`_hatcast-agenda-dispo-badge.scss`)

| Modifier | Target |
|----------|--------|
| `--available` | Green flat badge (unchanged) |
| `--unavailable` | Red flat badge |
| `--unknown` | Grey flat badge |
| `--in-team` / `--selected` | Violet badge fg |
| `--declined` | Orange badge (future / when decline context on history) |

Agenda badges may stay **flat** (`-badge-bg`); chart and CTAs use **gradients**.

### 5. Season agenda participant focus (`season-agenda.ts`)

When focus is in-team → `--selected` (violet). Do not fall back to `--available` green.

---

## API contract (chart blocks)

**Current:** `MemberProfileChartBlockDto.status` ∈ `available` | `unavailable` | `declined` | `neutral` — selections wrongly use `available`.

**Target:**

| Condition | `status` | `roleKey` |
|-----------|----------|-----------|
| Locked + slot assignment, `participationStatus === CONFIRMED` | `selected` | role key |
| Locked + slot assignment, `participationStatus === PENDING` | `pending` | role key |
| Locked + decline (slot or decline-only row) | `declined` | role key if known |
| Availability AVAILABLE, not selected | `available` | null |
| Availability UNAVAILABLE | `unavailable` | null |
| No availability, not locked / no slot | `neutral` | null |

**OpenAPI / TS:** Update `MemberProfileChartBlock.status` union to include `selected` | `pending` | `declined` | `available` | `unavailable` | `neutral` in API + `member-profile-api.service.ts`.

---

## V1 reference (parity checklist)

| V1 (`status-colors.css` / `PlayerModal`) | V2 target |
|-------------------------------------------|-----------|
| `status-available` green | `available` |
| `status-confirmed` purple | `selected` |
| `status-pending` orange → **yellow** | `pending` (amber / gold) |
| `status-declined` **red** → orange | `declined` (tertiary orange) |
| `status-unavailable` red | `unavailable` |
| `status-unanswered` grey | `neutral` |

---

## Accessibility & M3

| Rule | Requirement |
|------|-------------|
| Contrast | Container + on-container pairs must meet WCAG AA for text; chart blocks rely on tooltip + aria-label (existing) |
| Colour alone | Role emoji in chart blocks + French tooltips remain mandatory |
| Theme | Gradient **stops** are fixed V1 hex in `_hatcast-semantic-colors.scss` only (`--hatcast-v1-*`); features use gradient token variables — no feature hex |
| Touch | Chart blocks keep `cursor: help`; min 2rem desktop / 1.35rem mobile (existing) |

---

## Acceptance criteria

### AC-P1 — Token centralization

- [x] All participation hues and gradients defined only in `_hatcast-semantic-colors.scss`
- [x] `FRONTEND_UI.md` table extended with participation states + V1 gradient chart
- [x] No new raw green/red/purple/orange hex in feature SCSS under `apps/web/` (stops live in semantic file)

### AC-P2 — Mes Stats consistency

- [x] Top **Sélections** card and chart blocks with role emoji share **violet→pink** `-gradient-strong`
- [x] Top **Désistements** card and chart `declined` blocks share **red→orange** `-gradient-strong`
- [x] **Disponibilités** card and `available` blocks share **green→emerald** `-gradient-strong`
- [x] `unavailable` blocks are **red**, visually distinct from `declined`

### AC-P3 — Équipe tab

- [x] Confirmed slot rows use **selected** `-gradient-strong` (not green)
- [x] Declines badge uses **declined** `-gradient-strong` (not error red)
- [x] Pending rows use **pending** `-gradient-strong` (orange→yellow)
- [x] Participation modal: Confirmer / À confirmer / Décliner use **three V1 gradient pairs**

### AC-P6 — Pending vs declined distinction

- [x] `pending` gradient = orange → yellow (V1 `status-pending`)
- [x] `declined` gradient = red → orange (V1 `status-declined`) — different palette sources
- [ ] Side-by-side QA on Équipe tab: pending row + declines badge identifiable without reading text labels

### AC-P4 — API

- [x] Chart blocks for in-team members return `status: "selected"` or `"pending"`, not `"available"`
- [x] Front maps `selected` / `pending` → chart modifiers

### AC-P5 — Regression

- [x] Dispos tab toggles use `-gradient-strong` (green / red / grey) — same family as Mes Stats dispo states
- [x] `availabilityBadgeModifier()` behaviour for pure dispo flat badges unchanged on agenda
- [x] Unit tests updated for new status union and CSS class bindings

### AC-P7 — Gradient unification (2026-05-29)

- [x] `-gradient-strong` matches V1 `ConfirmationModal.vue` stops (purple→pink, red→orange, orange→yellow)
- [x] Same `-gradient-strong` on counters, chart, modal, Dispos (checked), Équipe rows
- [ ] Visual sign-off Patrice on light theme (Mes Stats + Équipe + modal)

---

## Implementation notes (for dev / architect)

**Suggested story slice:** one story “Participation semantic colors” or split:

1. Tokens + helpers + `FRONTEND_UI.md` + API `selected` / `pending` status
2. Mes Stats / member profile panel
3. Équipe tab + participation modal + equipe status header badges
4. Agenda badges + member-home-todo confirm actions
5. Audit pass (grep hardcoded rgba) + doc chances vs dispo distinction

See **§ Surface inventory** for full checklist.

**Files likely touched:**

| Layer | Files |
|-------|-------|
| Tokens | `apps/web/src/styles/_hatcast-semantic-colors.scss` |
| Helpers | `availability-status.ts` or new `participation-status.ts` |
| Docs | `docs/v2/technical/FRONTEND_UI.md`, `ux-design-hatcast-v2.md` § Member profile |
| API | `SeasonGlanceStatsProvider.kt`, OpenAPI member profile schema |
| Front (high) | `member-profile-dialog.scss`, `member-profile-panel.html`, `event-equipe-tab.scss`, `composition-participation-dialog.scss` |
| Front (medium) | `_hatcast-agenda-dispo-badge.scss`, `season-agenda.ts`, `member-home-todo.scss`, `composition-equipe-status-header.scss` |
| Tests | `member-season-glance.spec.ts`, `SeasonGlanceStatsProviderTest.kt`, `event-equipe-tab.spec.ts` |

---

## Surface inventory (audit 2026-05-29)

Full scan of `apps/web/` for participation / availability colour usage. **Priority:** High = wrong hue or hardcoded; Medium = partial / missing state; Low = out of scope or OK; N/A = false positive.

### Foundation

| File | Status |
|------|--------|
| `_hatcast-semantic-colors.scss` | **Done** — V1 gradient stops + participation tokens |
| `_hatcast-agenda-dispo-badge.scss` | **Partial** — `--selected` alias; `--declined` optional |
| `participation-status.ts` | **Done** |
| `FRONTEND_UI.md` | **Done** — participation + gradient chart |

### Mes Stats / Member profile

| File | Status |
|------|--------|
| `member-profile-panel` + dialog SCSS | **Done** |
| `SeasonGlanceStatsProvider.kt` | **Done** — `selected` / `pending` |
| API + front types | **Done** |

### Équipe tab & composition UI

| File | Status |
|------|--------|
| `event-equipe-tab` | **Done** — `-gradient-strong` rows + declines badge |
| `composition-participation-dialog` | **Done** — V1 gradients |
| `composition-equipe-status-header` | **Done** — badge gradients |
| `composition-status-badge.scss` | **Low** — lifecycle badges (separate semantics) |

### Disponibilité

| File | Status |
|------|--------|
| `availability-form.scss` | **Done** — checked toggles use `-surface` (= `-gradient-strong`) |

### Remaining (medium / low)

| File | Gap | Prio |
|------|-----|------|
| `member-home-todo` | Confirm actions could use pending accent | Med |
| `availability-tous-panel` | Document chances vs dispo in FRONTEND_UI | Med |
| Agenda `--declined` badge | When history shows decline context | Med |

### Critical gaps — resolved (2026-05-29)

1. ~~Mes Stats selection chart green~~ → violet→pink gradient
2. ~~Équipe confirmed row green~~ → selected gradient
3. ~~Modal pending ≈ decline~~ → distinct orange→yellow vs red→orange
4. ~~Tokens missing~~ → `_hatcast-semantic-colors.scss`
5. ~~API `available` for slots~~ → `selected` / `pending`

---

## Out of scope

| Item | Reason |
|------|--------|
| Legacy V1 Vue app restyle | Production on Firebase; reference only |
| Season admin statistics table colours | Separate band semantics (JEU/DECORUM); not participation states |
| Changing stat **formulas** | DOMAIN/SPEC unchanged; colours only |

---

## Stakeholder sign-off

| # | Question | Answer (2026-05-29) |
|---|----------|---------------------|
| 1 | Violet for selections app-wide? | **Yes** — Patrice |
| 2 | Orange for désistements app-wide? | **Yes** — Patrice |
| 3 | Red reserved for indispo? | **Yes** — Patrice |
| 4 | Pending confirmation stays amber (not violet)? | **Yes** — V1 parity |
| 5 | Pending must be clearly distinct from désisté (not same orange family)? | **Yes** — Patrice (2026-05-29) |
| 6 | Participation fills = V1 Tailwind gradients (ConfirmationModal), unified `-gradient-strong`? | **Yes** — Patrice (2026-05-29) |

**Status:** **Approved** — Patrice sign-off 2026-05-29. Implementation in progress; gradient canon locked same day.

---

## Traceability

- Supersedes ambiguous chart colour bullets in [ux-design-hatcast-v2.md § Member profile](ux-design-hatcast-v2.md#pattern-member-profile) (updated 2026-05-29).
- **Normative for implementation:** `docs/v2/technical/FRONTEND_UI.md` § Couleurs sémantiques — participation.
- **Code source of truth for stops:** `apps/web/src/styles/_hatcast-semantic-colors.scss`.
- Implements stakeholder feedback from UX review session 2026-05-29 (Mes Stats screenshot + ConfirmationModal gradient parity).

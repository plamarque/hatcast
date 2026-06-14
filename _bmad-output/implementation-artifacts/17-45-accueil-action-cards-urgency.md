---
retroactive: true
checkpoint: implemented locally 2026-06-14 (uncommitted)
ux_spec: _bmad-output/planning-artifacts/ux-design-accueil-actions-requises.md
addenda: C (layout trailing chip+chevron, type icon, filled tint) + D (urgency ramp, variant A)
---

# Story 17.45 : Accueil — cartes Actions requises (urgence + action-info)

Status: review

<!-- Retroactive story — documents local implementation delivered 2026-06-14; not re-implement. -->

## Story

As a **member** on **`/accueil`**,  
I want **action cards** that signal **urgency at a glance** (filled tint, date chip, type icon) instead of flat grey list rows,  
so that **I prioritise the right task immediately** without reading clipped metadata.

**Retroactive story** — UX addenda C + D from [`ux-design-accueil-actions-requises.md`](../planning-artifacts/ux-design-accueil-actions-requises.md) (approved 2026-06-14); code delivered locally, pending commit and code review.

**Parent / related:** extends **17.19** (hub MVP), **17.21** (`GET /me/inbox` actions) ; supersedes type-coloured card surfaces from addendum B/C for **background colour** (addendum D variant A).

---

## Acceptance Criteria

1. **Given** ≥1 inbox action on `/accueil`, **when** **Actions requises** renders, **then** each row is a **full-width action card** (`<button type="button">`) — **not** `mat-nav-list` / `mat-list-item` ; card `min-height` ≥ **48 dp** ; tap navigates via `action.deepLink`. [Source: ux-design-accueil-actions-requises.md A1, A2 ; addendum C C9]
2. **Given** an action card, **when** layout renders, **then** **line 1** = verb only (`Confirme ta présence` / `Donne ta dispo`, `font-weight: 700`, `on-surface`) ; **line 2** = event title (1-line ellipsis) ; for `composition_confirm_pending`, role appended (`{title} · {role}`) ; **no line 3** metadata on the card (date/troupe not duplicated in body). [Source: addendum C C2 ; B2]
3. **Given** an action card, **when** rendered, **then** **leading** `mat-icon` type icon (`how_to_reg` confirm · `edit_calendar` dispo), `aria-hidden="true"`, colour **`on-surface-variant`** (variant A — type not colour-coded). [Source: addendum C C4 ; addendum D D3]
4. **Given** an action card, **when** trailing column renders, **then** optional **date chip** + **`chevron_right`** share one horizontal row (`member-home-todo__action-card-trailing`), vertically centred in the card — chip is **not** on line 1 or embedded in title text. [Source: addendum C C3]
5. **Given** `startsAt` within **7 Paris calendar days** (`SOON_DAYS`), **when** chip renders, **then** label is **« Aujourd'hui »**, **« Demain »**, or **« Dans N j »** via `relativeDayLabel()` ; chip uses plain `<span>` (not `mat-chip`). [Source: addendum B5 / C7]
6. **Given** chip offset ≤ **2** Paris calendar days (`URGENT_DAYS`), **when** chip renders, **then** chip modifier `--urgent` (error tone) ; **when** offset 3–7 days, **then** default chip uses tertiary mix. [Source: addendum C C7 ; D5]
7. **Given** any inbox action, **when** card background applies, **then** tier follows **urgency only** (addendum D variant A) via `inboxActionUrgencyTier()` : **urgent** ≤2 j → `color-mix(error 12%, surface)` + `--todo-accent` error ; **soon** 3–7 j → `color-mix(tertiary 14%, surface)` ; **normal** >7 j → `color-mix(action-info 10%, surface)` + `--hatcast-sys-action-info` accent for focus ring. **No** outer border, **no** left accent bar. [Source: addendum D D1–D4, D6 ; C1]
8. **Given** `_hatcast-semantic-colors.scss`, **when** theme loads, **then** **`--hatcast-sys-action-info*`** family exists (`mat.$blue-palette`, `light-dark()` pair) — scope **Accueil inbox cards only** ; does **not** replace neutral participation tokens on agenda badges / Dispos toggles. [Source: addendum C C5 ; ux-design-participation-semantic-colors.md P17]
9. **Given** user taps an action and completes it server-side, **when** they return to `/accueil`, **then** **ghost card** flow unchanged : sessionStorage `hatcast.todo.acted` → brief **done** card (tertiary circle + white `check`, meta **« C'est noté ! »**) → `animate.leave` collapse → **« Tout est à jour »** celebration blooms ; `prefers-reduced-motion: reduce` disables motion. [Source: addendum C C8 ; B8–B9]
10. **Given** card `<button>`, **when** focused or hovered, **then** `:focus-visible` outline **2px** `var(--todo-accent)` (tier colour) `outline-offset: 2px` ; no layout shift. [Source: addendum C C1 ; D4]
11. **Given** action card, **when** a11y tree is inspected, **then** full French **`aria-label`** via `actionAriaLabel()` (verb + title + role if confirm + date/urgency) ; decorative icons `aria-hidden`. [Source: ux spec § Accessibility ; 17.19 M3-3]
12. **Given** >5 inbox actions, **when** section renders, **then** max **5** visible + **« Voir tout dans l'agenda »** (`mat-stroked-button`) unchanged ; `data-testid` **`todo-action-confirm`** / **`todo-action-dispo`** on cards. [Source: 17.19 AC6 ; addendum C implementation notes]
13. **Given** **Prochain spectacle**, **Accès rapides**, celebration block, inbox SWR skeleton, **when** this story ships, **then** those zones are **unchanged** (scope = Zone 1 action cards + tokens only). [Source: ux spec § Scope]
14. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false --include='**/member-home-todo*.spec.ts'`, **then** **42** tests pass covering urgency tiers, trailing layout, ghost-on-return, verb copy, chip labels, navigation, and inbox regressions. [Source: repo norms]

**Product coverage:** [ux-design-accueil-actions-requises.md](../planning-artifacts/ux-design-accueil-actions-requises.md) addenda **C** + **D** ; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Zone 1 amend. 2026-06-14 ; **FR15** (dispo reminder UX) ; **FR48** (member hub navigation).

**Out of scope:** badge on section title vs nav tab ; **Prochain spectacle** card redesign ; new inbox action types ; agenda badge colour for unknown dispo ; persistent checked history ; mini-chart (**17.44**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** action cards on `/accueil`, **when** controls render, **then** use **`mat-icon`** (leading type icon + trailing `chevron_right`) on semantic `<button>` cards ; date chip = token-styled `<span>` (not `mat-chip`) ; section footer **`mat-stroked-button`** for see-all ; celebration / quick links unchanged (`mat-flat-button`, `mat-stroked-button`). **No** `mat-list-item` for actions. [Source: FRONTEND_UI.md ; addendum C M3-1 ; UX-DR11]

**M3-2. Tokens & thème** — **Given** action card SCSS, **when** colours apply, **then** only `var(--mat-sys-*)`, `var(--hatcast-sys-action-info*)`, `var(--hatcast-sys-pending*)` (if referenced), and `color-mix(in srgb, var(--mat-sys-…) …)` / `color-mix(in srgb, var(--hatcast-sys-action-info) …)` — **no** hex/rgb on feature SCSS. Urgency tiers: error / tertiary / action-info mixes per addendum D. [Source: FRONTEND_UI.md ; addendum C M3-2 ; D2]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** action cards render, **then** card tap target **≥ 48×48 dp** (`min-height: 3rem`, padding `0.6rem 0.75rem`) ; full French **`aria-label`** on each card button ; trailing chip + chevron remain aligned (no clip overlap). Title ellipsis 1 line OK. [Source: NFR-A1 ; addendum C M3-3]

**M3-4. Navigation membre** — **Given** this story, **when** delivered, **then** **no** new bottom app bar or rail changes ; hub chrome (title **Accueil**, member shell nav from **17.22**) unchanged. [Source: ux-hub-a-faire.md ; addendum C M3-4]

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md ; addendum C M3-5]

---

## Tasks / Subtasks

- [x] **Tokens action-info** (AC: 8, M3-2)
  - [x] Add `--hatcast-sys-action-info`, `--hatcast-sys-action-info-container`, `--hatcast-sys-on-action-info`, `--hatcast-sys-on-action-info-container` in [`_hatcast-semantic-colors.scss`](../../apps/web/src/styles/_hatcast-semantic-colors.scss) (`mat.$blue-palette`, `light-dark()`).
  - [x] Document scope in [`FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) and [`ux-design-participation-semantic-colors.md`](../planning-artifacts/ux-design-participation-semantic-colors.md) § Inbox action tokens.

- [x] **Urgency util** (AC: 7, 14)
  - [x] Add `inboxActionUrgencyTier()` + `InboxActionUrgencyTier` in [`member-home-todo.utils.ts`](../../apps/web/src/app/core/member-home/member-home-todo.utils.ts).
  - [x] Unit tests in [`member-home-todo.utils.spec.ts`](../../apps/web/src/app/core/member-home/member-home-todo.utils.spec.ts) (urgent ≤2, soon 3–7, normal >7).

- [x] **Component — card structure** (AC: 1–4, 10–12)
  - [x] [`member-home-todo.html`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.html): icon leading ; verb L1 + title L2 ; trailing `__action-card-trailing` (chip + chevron) ; modifiers `--urgent` / `--soon` / `--normal` from `actionUrgencyTier()` ; ghost uses circle+check (not checkbox).
  - [x] [`member-home-todo.ts`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.ts): `actionUrgencyTier()`, `actionLeadingIcon()` ; retain `actionVerbLabel`, `actionDateBadge`, ghost sessionStorage flow.

- [x] **SCSS — filled urgency ramp** (AC: 5–7, 10, M3-2)
  - [x] [`member-home-todo.scss`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.scss): remove border/left-bar ; filled backgrounds per tier ; neutral type icon + verb (`on-surface` / `on-surface-variant`) ; trailing flex row ; `__date-chip` urgent/default ; reduced-motion guards.

- [x] **Tests** (AC: 9, 11–14, M3-3)
  - [x] Update [`member-home-todo.spec.ts`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts): `--soon` class on 3-day action ; role on title line only ; ghost-on-return ; verb copy ; no metadata line 3.

- [x] **UX trace** (AC: product coverage)
  - [x] Amend [`ux-design-accueil-actions-requises.md`](../planning-artifacts/ux-design-accueil-actions-requises.md) addenda C + D (approved).
  - [x] Amend [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) § Zone 1.

---

## Dev Notes

### Product and UX rules

- **Verb copy (shipped):** `Confirme ta présence` · `Donne ta dispo` — not uppercase tags or legacy « Indiquer ta dispo » inline title.
- **Colour = urgency (variant A):** card background encodes deadline tier ; **icon + verb stay neutral** — dispo vs confirm distinguished by icon shape + copy only (not amber/blue card pairing).
- **Normal tier (>7 j):** uses **action-info blue** tint — inciting without green (`positive` = already answered) or grey (`participation-neutral`).
- **Date chip:** only within 7 days ; full calendar date remains in `aria-label` only.
- **Ghost sequence:** celebration banner gated until ghosts clear (`showAllCaughtUpBanner` excludes `completedGhosts().length > 0`).
- **Inbox source:** actions from `MemberInboxBadgeService` / `GET /me/inbox` (**17.21**) — no API change in this story.

### Explicit non-goals

| Item | Reason |
|------|--------|
| Type-coloured card backgrounds (variant B) | Rejected in addendum D sign-off |
| Checkbox affordance on pending cards | Removed in addendum C (misleading) |
| `mat-chip` for date pill | MDC grey override — use `<span>` pill |
| Agenda / Dispos neutral → action-info | Scope guard P17 — inbox cards only |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Urgency math | Reuse `calendarDaysFromNow` + `AGENDA_TIME_ZONE` (`Europe/Paris`) — same as chip |
| Focus ring | `--todo-accent` CSS variable per tier on `.member-home-todo__action-card` |
| DRY | Do **not** merge with `agenda-card` — different hierarchy (verb-first vs date-first) |
| Animation | `animate.leave` on cards + ghost ; `prefers-reduced-motion` disables transitions |

### Key implementation map

| Modifier class | Background | `--todo-accent` (focus) |
|----------------|------------|-------------------------|
| `--urgent` | `color-mix(error 12%, surface)` | `--mat-sys-error` |
| `--soon` | `color-mix(tertiary 14%, surface)` | `--mat-sys-tertiary` |
| `--normal` | `color-mix(action-info 10%, surface)` | `--hatcast-sys-action-info` |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.19** | done | Hub `/accueil` MVP, action section shell |
| **17.21** | done | `InboxAction[]` + `deepLink` source |
| **17.22** | done | Member shell chrome (unchanged) |
| **perf-12** | done | Progressive render / inbox cache (SWR paths preserved) |

### Testing

```bash
npm run test -w @hatcast/web -- --watch=false --include='**/member-home-todo*.spec.ts'
# Expected: 42 passed (2 files: component + utils)
```

### References

- [ux-design-accueil-actions-requises.md](../planning-artifacts/ux-design-accueil-actions-requises.md) — addenda C (2026-06-14), D (variant A)
- [ux-design-participation-semantic-colors.md](../planning-artifacts/ux-design-participation-semantic-colors.md) — P17 inbox action-info scope
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — action-info token table
- [17-19-hub-accueil-a-faire-mvp.md](./17-19-hub-accueil-a-faire-mvp.md)
- [17-21-api-me-inbox-hub-membre.md](./17-21-api-me-inbox-hub-membre.md)

---

## Dev Agent Record

### Agent Model Used

Local implementation (Patrice + Cursor agent) — 2026-06-14

### Completion Notes List

- Addendum C: filled tint cards, trailing chip+chevron column, type `mat-icon` leading, removed checkbox on pending cards.
- Addendum D variant A: `inboxActionUrgencyTier()` drives `--urgent` / `--soon` / `--normal` backgrounds ; neutral icon + verb ; focus ring follows tier accent.
- Tokens `--hatcast-sys-action-info*` added (`mat.$blue-palette`).
- Ghost-on-return + celebration gating unchanged from addendum B8.
- **42** unit tests green (`member-home-todo.spec.ts` + `member-home-todo.utils.spec.ts`).
- **Uncommitted** — pending commit + code review.

### Checklist M3 (self-check 2026-06-14)

| Point | Statut | Note |
|-------|--------|------|
| M3-1 Composants | OK | `mat-icon`, `mat-button` variants ; no `mat-list-item` for actions |
| M3-2 Tokens | OK | `--mat-sys-*`, `--hatcast-sys-action-info*`, `color-mix` only |
| M3-3 Mobile / a11y | OK | ≥48dp cards ; French `aria-label` ; chip+chevron aligned |
| M3-4 Nav membre | OK | No chrome change |
| M3-5 Revue | OK | FRONTEND_UI inbox action-info row documented |

### File List

- `apps/web/src/app/pages/member-home-todo/member-home-todo.html`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.scss`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.spec.ts`
- `apps/web/src/app/core/member-home/member-home-todo.utils.ts`
- `apps/web/src/app/core/member-home/member-home-todo.utils.spec.ts`
- `apps/web/src/styles/_hatcast-semantic-colors.scss`
- `docs/v2/technical/FRONTEND_UI.md`
- `_bmad-output/planning-artifacts/ux-design-accueil-actions-requises.md`
- `_bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md`
- `_bmad-output/planning-artifacts/ux-hub-a-faire.md`

### Change Log

- 2026-06-14 : Retroactive story **17.45** created — documents addenda C+D implementation (local, uncommitted).
- 2026-06-14 : Implementation delivered — urgency ramp, action-info tokens, card layout refresh on `MemberHomeTodo`.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (UX spec addenda C/D, 17.19/17.21)
- [x] Section **Material 3** remplie (M3-1 … M3-5)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` member-home-todo specs mentionnés (42 verts)

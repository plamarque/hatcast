# Story 17.11: Breadcrumb on admin back-office pages

Status: ready-for-dev

<!-- Correct Course 2026-05-25 — LIMIT-002; SCP sprint-change-proposal-2026-05-25-epic17-admin-chrome-stories.md -->

## Story

As an **organizer or admin** opening **Participants** or **Membres** administration from the scope gear menu,
I want the same **context breadcrumb** as on season and event member screens (and **no legacy back chevron**),
so that **wayfinding is consistent** across Epic 17 navigation (ADR 0013).

## Acceptance Criteria

1. **Given** `/saison/:slug/admin/participants` (or `/ligue/...` alias), **when** the page loads with resolved troupe + season context, **then** the header shows **`app-context-breadcrumb`** (desktop: troupe › saison › **Participants** as current leaf) and **no** chevron-back to agenda/workspace. [Source: LIMIT-002; UX Screen 8; ADR 0013 §2]
2. **Given** event-scoped participants admin (same `AdminParticipants` component when opened for one spectacle), **when** loaded, **then** breadcrumb is troupe › saison (link) › spectacle (link) › **Participants** (leaf) and **no** chevron back. [Source: LIMIT-002; event admin entry from 17.2 menu]
3. **Given** `/troupe/:slug/admin/membres` or `/troupes/:slug/admin/membres`, **when** `TROUPE_ADMIN` (or permitted member), **then** breadcrumb shows troupe context (e.g. **Troupes › Troupe name › Membres** or troupe › **Membres** per UX decision) and **no** chevron back to `/seasons`. [Source: LIMIT-002; UX Screen 7]
4. **Given** mobile (`max-width: 480px`), **when** on any of the above, **then** breadcrumb follows **17.1** mobile rules (logo troupe in header slot; page title below if needed). [Source: Story 17.1]
5. **Given** missing or failed troupe/season/event resolution, **when** context cannot be trusted, **then** breadcrumb is **not** shown (same gating as season/event headers). [Source: Story 17.1 AC8]
6. **Given** header row on these admin pages, **when** rendered, **then** account avatar menu remains top-right; **no** scope admin gear in breadcrumb row (admin entry remains on origin screens per 17.2). [Source: 17.2]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with tests for breadcrumb presence, absent chevron, and link targets. [Source: repo norms]

## Tasks / Subtasks

- [ ] **Inventory & routes** (AC: 1–3)
  - [ ] Confirm all admin participants URLs (saison vs event scope) in `app.routes.ts`.
  - [ ] Confirm membres routes (`/troupe`, `/troupes`, legacy aliases).

- [ ] **`AdminParticipants` header refactor** (AC: 1, 2, 4–6)
  - [ ] Resolve `troupeSlug`, `troupeName`, `seasonSlug`, `seasonTitle`, optional `eventTitle` / `eventId` from route + existing loaders.
  - [ ] Replace `admin-participants__back` chevron with `app-context-breadcrumb` (`layout="season"` or extended layout for event-scoped admin).
  - [ ] Keep title « Participants » in body or as breadcrumb leaf only (avoid duplicate H1 + leaf).
  - [ ] Update `admin-participants.spec.ts`.

- [ ] **`AdminMembres` header refactor** (AC: 3, 4–6)
  - [ ] Replace chevron back with breadcrumb (troupe hub parent; canonical `/troupes` list segment if product agrees).
  - [ ] Update `admin-membres` tests if present.

- [ ] **Shared helper (optional, minimal)**
  - [ ] Only if duplication is real: thin wrapper `admin-page-header` composing breadcrumb + account menu — **do not** over-abstract.

- [ ] **Docs** (AC: 1–3)
  - [ ] Update UX journey Screens 7–8 status from « gap » to implemented when done.
  - [ ] Close or update **LIMIT-002** in ISSUES.md when verified.

- [ ] **Tests & build** (AC: 7)

## Dev Notes

### Product context (PO 2026-05-25)

Captured at **17.2** closure — **out of scope** for 17.1/17.2. Entry to these pages is correct (17.2 gear menu); **destination chrome** was never migrated.

### Reference implementation

| Source | Reuse |
|--------|--------|
| `shared/context-breadcrumb/` | Desktop/mobile trail, `troupeHubPath`, `saisonWorkspacePath` |
| `season-header` / `event-detail-header` | Account menu pattern, no breadcrumb-row gear |
| `TroupeSeasonResolverService` | Troupe + season resolution (already used on admin pages) |

### Breadcrumb segments (proposed)

| Page | Desktop trail |
|------|----------------|
| Saison participants | `[logo] Troupe › Saison title › Participants` |
| Event participants | `[logo] Troupe › Saison › Spectacle title › Participants` |
| Troupe membres | `Troupes › Troupe name › Membres` **or** `[logo] Troupe › Membres` — **confirm with UX** ([ux-design-scope-admin-menu-epic17.md](../planning-artifacts/ux-design-scope-admin-menu-epic17.md) § Follow-up) |

### Scope boundaries

| In scope | Out of scope |
|----------|----------------|
| Header chrome on 3 admin surfaces | Toolbar/content redesign (Story 2.8 / 3.8 bodies) |
| Remove chevron back | New admin features |
| Tests for navigation chrome | Full E2E suite rewrite |

### Dependencies

- **17.1** done — `app-context-breadcrumb` exists.
- **17.2** done — entry paths from gear menu.
- **Recommended:** **17.5** done before dev (stable `/troupes` redirects) — not a hard blocker for `/saison/` paths.

### Non-goals

- Do not add scope admin gear to admin destination pages.
- Do not change participant/member list behaviour.

## References

- [ISSUES.md](../../ISSUES.md) — LIMIT-002
- [ux-design-scope-admin-menu-epic17.md](../planning-artifacts/ux-design-scope-admin-menu-epic17.md) § Follow-up
- [17-1-breadcrumb-contexte-responsive.md](./17-1-breadcrumb-contexte-responsive.md)
- [17-2-bandeau-administration-par-scope.md](./17-2-bandeau-administration-par-scope.md)
- [docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)

## Dev Agent Record

### Completion Notes List

### File List

### Change Log

- 2026-05-25: Story created (Correct Course) from LIMIT-002 / PO feedback at 17.2 closure.

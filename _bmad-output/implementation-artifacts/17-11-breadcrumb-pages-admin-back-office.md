# Story 17.11: Breadcrumb on admin back-office pages

Status: done

<!-- Correct Course 2026-05-25 — LIMIT-002; SCP sprint-change-proposal-2026-05-25-epic17-admin-chrome-stories.md -->

## Story

As an **organizer or admin** opening **Participants** or **Membres** administration from the scope gear menu,
I want the same **context breadcrumb** as on season and event member screens (and **no legacy back chevron**),
so that **wayfinding is consistent** across Epic 17 navigation (ADR 0013).

## Acceptance Criteria

1. **Given** `/saison/:slug/admin/participants` (or `/ligue/...` alias), **when** the page loads with resolved troupe + season context, **then** the header shows **`app-context-breadcrumb`** (desktop: troupe › saison › **Participants** as current leaf) and **no** chevron-back to agenda/workspace. [Source: LIMIT-002; UX Screen 8; ADR 0013 §2]
2. ~~**Given** event-scoped participants admin…~~ **Moved to Story 17.16** — PO 2026-05-25: route dédiée (pas de dialog) pour participants **événement-only** ponctuels ; roster par défaut = participants saison. `ContextBreadcrumb` event+leaf prêt ; voir [17-16-route-admin-participants-evenement.md](./17-16-route-admin-participants-evenement.md).
3. **Given** `/troupe/:slug/admin/membres` or `/troupes/:slug/admin/membres`, **when** `TROUPE_ADMIN` (or permitted member), **then** breadcrumb shows troupe context (e.g. **Troupes › Troupe name › Membres** or troupe › **Membres** per UX decision) and **no** chevron back to `/seasons`. [Source: LIMIT-002; UX Screen 7]
4. **Given** mobile (`max-width: 480px`), **when** on any of the above, **then** breadcrumb follows **17.1** mobile rules (logo troupe in header slot; page title below if needed). [Source: Story 17.1]
5. **Given** missing or failed troupe/season/event resolution, **when** context cannot be trusted, **then** breadcrumb is **not** shown (same gating as season/event headers). [Source: Story 17.1 AC8]
6. **Given** header row on these admin pages, **when** rendered, **then** account avatar menu remains top-right; **no** scope admin gear in breadcrumb row (admin entry remains on origin screens per 17.2). [Source: 17.2]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with tests for breadcrumb presence, absent chevron, and link targets. [Source: repo norms]

## Tasks / Subtasks

- [x] **Inventory & routes** (AC: 1–3)
  - [x] Confirm all admin participants URLs (saison vs event scope) in `app.routes.ts`.
  - [x] Confirm membres routes (`/troupe`, `/troupes`, legacy aliases).

- [x] **`AdminParticipants` header refactor** (AC: 1, 2, 4–6)
  - [x] Resolve `troupeSlug`, `troupeName`, `seasonSlug`, `seasonTitle`, optional `eventTitle` / `eventId` from route + existing loaders.
  - [x] Replace `admin-participants__back` chevron with `app-context-breadcrumb` (`layout="season"` or extended layout for event-scoped admin).
  - [x] Keep title « Participants » in body or as breadcrumb leaf only (avoid duplicate H1 + leaf).
  - [x] Update `admin-participants.spec.ts`.

- [x] **`AdminMembres` header refactor** (AC: 3, 4–6)
  - [x] Replace chevron back with breadcrumb (troupe hub parent; canonical `/troupes` list segment if product agrees).
  - [x] Update `admin-membres` tests if present.

- [x] **Shared helper (optional, minimal)**
  - [x] Only if duplication is real: thin wrapper `admin-page-header` composing breadcrumb + account menu — **do not** over-abstract. *(Skipped — direct breadcrumb reuse.)*

- [x] **Docs** (AC: 1–3)
  - [x] Update UX journey Screens 7–8 status from « gap » to implemented when done.
  - [x] Close or update **LIMIT-002** in ISSUES.md when verified.

- [x] **Tests & build** (AC: 7)

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

- Extended `ContextBreadcrumb` with `leafTitle`, `eventSlug`, and `layout="troupe"` for admin leaves and future event-scoped admin pages.
- `AdminParticipants`: breadcrumb `Troupe › Saison (link) › Participants`; mobile H1 below header; chevron removed.
- `AdminMembres`: `layout="troupe"` on `/troupes/:slug/admin/membres`, `layout="season"` + leaf on legacy `/saison/:slug/admin/membres`; chevron removed.
- AC2 **deferred → Story 17.16** (PO 2026-05-25): route admin participants événement ; participants ponctuels event-only ; roster défaut = saison. `ContextBreadcrumb` event+leaf ready.
- UX decision: troupe membres uses `[logo] Troupe › Membres` (not `Troupes › …` list prefix).
- LIMIT-002 closed in ISSUES.md; Screens 7–8 updated in UX journey.
- `npm run test -w @hatcast/web -- --watch=false` (459 tests) and `npm run build -w @hatcast/web` pass.

### File List

- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts`
- `apps/web/src/app/pages/admin-participants/admin-participants.ts`
- `apps/web/src/app/pages/admin-participants/admin-participants.html`
- `apps/web/src/app/pages/admin-participants/admin-participants.scss`
- `apps/web/src/app/pages/admin-participants/admin-participants.spec.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.html`
- `apps/web/src/app/pages/admin-membres/admin-membres.scss`
- `apps/web/src/app/pages/admin-membres/admin-membres.spec.ts`
- `ISSUES.md`
- `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md`
- `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md`

### Change Log

- 2026-05-25: Story created (Correct Course) from LIMIT-002 / PO feedback at 17.2 closure.
- 2026-05-25: Story 17.11 implemented — admin back-office breadcrumb chrome; LIMIT-002 fixed.
- 2026-05-25: Code review — patches applied (AdminMembres showBreadcrumb gating, aria-current fix, tests) ; AC2 deferred to Story 17.16.

### Review Findings

- [x] [Review][Defer] AC2 event-scoped participants breadcrumb — **Follow-up Story 17.16** (PO 2026-05-25): route dédiée remplace `EventParticipantsDialog` ; focus participants ponctuels event-only ; participants saison = roster par défaut du spectacle.
- [x] [Review][Patch] `showBreadcrumb` AdminMembres incomplet en layout `season` [`admin-membres.ts:113`] — n’exige pas `season()?.title` contrairement à `AdminParticipants` ; route legacy `/saison/:slug/admin/membres` peut afficher un segment saison vide (violation AC5).
- [x] [Review][Patch] Double `aria-current="page"` sur layout event+leaf sans `eventSlug` [`context-breadcrumb.html:37-56`] — si `leafTitle` est défini mais `eventSlug` absent, l’événement et la feuille portent tous deux `aria-current`.
- [x] [Review][Patch] Test manquant breadcrumb legacy membres [`admin-membres.spec.ts`] — pas de test pour `/saison/:slug/admin/membres` (layout season, lien saison, feuille Membres).
- [x] [Review][Patch] Test manquant gating breadcrumb pendant chargement AdminMembres [`admin-membres.spec.ts`] — symétrie avec le test ajouté sur `AdminParticipants`.
- [x] [Review][Defer] Breadcrumb visible brièvement avant redirect « Accès non autorisé » [`admin-participants.ts`, `admin-membres.ts`] — deferred, pre-existing (même fenêtre qu’avec l’ancien titre H1).
- [x] [Review][Defer] Pas de test viewport mobile 480px pour AC4 — deferred, pattern 17.1 non testé automatiquement sur les autres headers non plus.

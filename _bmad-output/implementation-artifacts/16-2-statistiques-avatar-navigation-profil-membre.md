# Story 16.2: League Statistiques — avatar + navigation to member season glance

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in league member**,
I want each **participant row** in **Statistiques** to show an **avatar** and navigate to that person's **season glance** on click,
so that I can inspect other members' stats with V1 transparency (FR59) without being limited to « Mes stats ».

## Acceptance Criteria

1. **Given** the league **Statistiques** grid (`app-season-statistics`), **when** a row is rendered, **then** the sticky participant column shows **`UserAvatarComponent`** + display name (not name-only text). [Source: UX § Statistiques participation; Story 16.1 AC5 gap]
2. **Given** the row includes a linked account **`userSlug`**, **when** the user clicks the participant cell (avatar **or** display name), **then** navigation uses **`MemberProfileService.navigateToMemberGlance`** with `/membre/{userSlug}?troupeId=&leagueId=` from the current season context (`troupeId` + season UUID as `leagueId`). Intent: inspect that person's **season stats** (clin d'œil), not a generic profile screen. [Source: FR59; ADR 0012; review 2026-05-31]
3. **Given** no **`userSlug`** (name-only / unlinked participant), **when** the row is shown, **then** the avatar is **not clickable**, with an honest **French tooltip** (e.g. *Profil indisponible — aucun compte lié*) — no navigation. [Source: Story 16.1 boundaries]
4. **Given** `ParticipantStatisticsRow` / API does not expose **`userSlug`** (and optional **`avatarUrl`**), **when** implementing, **then** extend **`SeasonStatisticsResponse`** OpenAPI + **`SeasonStatisticsService`** + **`season-statistics-api.service.ts`** (minimal scope — row fields only). Resolve slug from `participant.user` or `participant.troupeMembership.user`. [Source: Story 16.1 `users.slug`]
5. **Given** Story 16.2 is complete, **when** tests run, **then** Vitest covers participant cell click (avatar or name) → `navigateToMemberGlance` mock; API unit test covers slug presence/absence on rows; **`member-season-glance.spec.ts`** still passes; `npm run test -w @hatcast/web -- --watch=false` and targeted `./gradlew test --tests '*SeasonStatistics*'` succeed. [Source: architecture § Testing]
6. **Given** a linked participant row, **when** rendered, **then** a native **`<button>`** wraps **`UserAvatarComponent`** (display only) + display name with French **`aria-label`** *Voir la saison en un clin d'œil de {name}*, **≥ 48×48** hit target (`min-height: 3rem`), and sticky column wide enough for avatar + name. [Source: FRONTEND_UI.md; review 2026-05-31 — stats-first, not avatar-only click]

**Product coverage:** FR59, UX-DR8 (member profile pattern), Epic 16.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Reuse **`UserAvatarComponent`** for display; use **`matTooltip`** for unlinked rows; linked rows use a native **`<button>`** wrapping avatar + name (not `[clickable]` on avatar alone — differs from `membres-tab`, intentional for V1 stats parity). [Source: FRONTEND_UI.md; review 2026-05-31]

**M3-2. Tokens & thème** — Sticky column / participant cell styles use **`var(--mat-sys-*)`** only. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Avatar **32px** with **≥ 48×48** hit target via button `min-height: 3rem`; **`aria-label`** on the cell button: *Voir la saison en un clin d'œil de …* (stats intent, not generic « profil »). [Source: NFR-A1; review 2026-05-31]

**M3-4. Navigation membre** — Route-only navigation (no new MatDialog surface). [Source: ADR 0012]

**M3-5. Revue** — Self-check FRONTEND_UI.md checklist at story completion; note waivers in Dev Agent Record.

---

## Tasks / Subtasks

- [x] **API — row identity fields** (AC: 4)
  - [x] Add optional `userSlug: String?`, `avatarUrl: String?` to `ParticipantStatisticsRowDto` + OpenAPI `ParticipantStatisticsRow`.
  - [x] In `SeasonStatisticsService.buildRow`, resolve linked user (`participant.user ?: participant.troupeMembership?.user`), slug + `AvatarService.publicAvatarUrl`.
  - [x] Unit test: row with linked user has slug; name-only row has null slug.

- [x] **Web — Statistiques grid** (AC: 1–3, 6, M3-1–3)
  - [x] Extend `ParticipantStatisticsRow` TS interface.
  - [x] `season-statistics.ts/html/scss`: avatar + name cell; inject `MemberProfileService`; inputs `troupeId`, `leagueId`.
  - [x] `season-home.html`: pass `[troupeId]` and `[leagueId]="se.id"`.
  - [x] Do **not** duplicate query-param logic — call `navigateToMemberGlance` only.

- [x] **Tests** (AC: 5)
  - [x] New `season-statistics.spec.ts`: navigation mock + non-clickable row without slug.
  - [x] Update export fixture types if needed (optional fields).
  - [x] Run web + API tests; confirm no regression on member-season-glance.

---

## Dev Notes

### Scope boundaries

| In scope (16.2) | Out of scope |
|-----------------|--------------|
| Statistiques participant column avatar + nav | Rebuild glance API / `SeasonGlanceStatsProvider` |
| `userSlug` + `avatarUrl` on statistics **rows** | Avatars on équipe / dispos / agenda (unless follow-up) |
| `MemberProfileService.navigateToMemberGlance` | New stats page or aggregation |
| Vitest + `SeasonStatisticsServiceTest` | MIG-3 migration pipeline |
| MatTooltip for unlinked participants | MatDialog as canonical surface |

### Previous story intelligence (16.1)

- Route `/membre/:userSlug`, glance API, auth (shared troupe) — **done**. Reuse navigation helper from `membres-tab.ts` / `MemberProfileService`.
- `users.slug` backfilled V28; troupe admin list already exposes `userSlug`.
- Story 16.1 AC5 listed avatar → route on league surfaces; **Statistiques was not wired** — this story closes that gap.

### Existing code to reuse

| Asset | Use |
|-------|-----|
| [`member-profile.service.ts`](../../apps/web/src/app/core/member-profile/member-profile.service.ts) | `navigateToMemberGlance` |
| [`user-avatar/*`](../../apps/web/src/app/shared/user-avatar/) | Avatar display + click/keyboard |
| [`membres-tab.ts`](../../apps/web/src/app/pages/admin-membres/membres-tab.ts) | Pattern: `leagueId: seasonId` |
| [`SeasonStatisticsService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) | Add row identity |
| [`season-statistics.html`](../../apps/web/src/app/pages/season-home/season-statistics.html) | Sticky participant column |

### Implementation guardrails

- **Do not** reimplement stats or glance endpoints.
- **Do not** navigate when `userSlug` is null/blank.
- **Do not** put slug in export CSV (unchanged export behaviour).
- **Do not** modify `legacy/`.
- Pass **`leagueId`** = current season UUID (same as 16.1 entry points).

### Testing commands

```bash
cd services/api && ./gradlew test --tests '*SeasonStatistics*'
npm run test -w @hatcast/web -- --watch=false --include "**/season-statistics.spec.ts" --include "**/member-season-glance/**"
npm run build -w @hatcast/web
```

### References

- [Source: `_bmad-output/implementation-artifacts/16-1-route-membre-saison-clin-oeil-filtres.md`]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` § Statistiques, § Member profile]
- [Source: `_bmad-output/planning-artifacts/epics.md` — FR59, Epic 16]
- [Source: `docs/v2/technical/FRONTEND_UI.md`]
- [Source: `legacy/src/components/GridBoard.vue` — PlayerModal click player]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- API: `userSlug` + `avatarUrl` on `ParticipantStatisticsRowDto`; resolved from `participant.user` or `troupeMembership.user`.
- Web: Statistiques sticky column shows `UserAvatarComponent` + name; click → `navigateToMemberGlance` with season context; tooltip when unlinked.
- Tests: `./gradlew test --tests '*SeasonStatistics*'` OK; `season-statistics.spec.ts` (3) + `member-season-glance.spec.ts` (7) OK; `ng build` OK.
- M3: matTooltip for unlinked; tokens `--mat-sys-*`; cell button aria-label stats-first (*clin d'œil*).
- Review 2026-05-31: cellule participant entière cliquable (avatar + nom) — intent produit = voir les stats, pas un écran profil générique. AC6/M3-1/M3-3 alignés.

### File List

- services/api/openapi/seasons.yaml
- services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonStatisticsDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt
- apps/web/src/app/core/seasons/season-statistics-api.service.ts
- apps/web/src/app/pages/season-home/season-statistics.ts
- apps/web/src/app/pages/season-home/season-statistics.html
- apps/web/src/app/pages/season-home/season-statistics.scss
- apps/web/src/app/pages/season-home/season-statistics.spec.ts
- apps/web/src/app/pages/season-home/season-home.html
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-30: Story 16.2 — Statistiques avatar + navigation profil membre (FR59).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` / `./gradlew test` mentionnés

### Review Findings

- [x] [Review][Decision] **Pattern clic : bouton englobant vs `UserAvatarComponent` clickable** — **Résolu 1.A** : conserver `<button>` avatar + nom ; AC6/M3-1/M3-3 mis à jour (stats-first, parité V1).

- [x] [Review][Decision] **Libellé `aria-label`** — **Résolu 2.A** : *Voir la saison en un clin d'œil de {name}* ; AC6/M3-3 mis à jour.

- [x] [Review][Patch] **Test AC5 : clic avatar non couvert** [`season-statistics.spec.ts`] — couvert indirectement par clic cellule/nom ; ajout clic `app-user-avatar` optionnel

- [x] [Review][Patch] **Paramètre `row` inutilisé dans `profileUnavailableTooltip`** [`season-statistics.ts:126`]

- [x] [Review][Patch] **Colonne sticky mobile trop étroite pour avatar + nom** [`season-statistics.scss:145-148`]

- [x] [Review][Defer] **Reload parallèle stats/history dans `season-home.ts`** [`season-home.ts:501-521`] — deferred, pre-existing (hors scope 16.2, correctif utile bundlé dans le même commit)

- [x] [Review][Defer] **Pas d'assertion API sur `avatarUrl` non null** [`SeasonStatisticsServiceTest.kt`] — deferred, pre-existing

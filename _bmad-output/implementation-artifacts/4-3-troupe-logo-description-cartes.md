# Story 4.3: Troupe logo and description on cards

Status: done

<!-- bmad-create-story — 2026-06-01 — follow-up UX post-4.1 ; logo + description on troupe cards + admin edit dialog -->

## Story

As a **member or visitor**,  
I want to **see a troupe logo and short description on troupe cards** (Mes troupes and Découvrir on `/troupes`),  
so that **I can identify and choose a troupe more easily** before opening the hub.

## Acceptance Criteria

1. **Given** a troupe with **logo** and **description** set, **when** its card renders on `/troupes` (Mes troupes or Découvrir), **then** the logo replaces the generic `groups` icon (fallback when absent) and the description appears under the name (truncated to ~2 lines on mobile via CSS line-clamp). [Source: follow-up 4.1 ; epics 17.3 cards logo ; ux-design-troupe-hub.md §Hero pattern reused on cards]
2. **Given** a troupe administrator (or platform admin), **when** they open **Modifier la troupe** (`TroupeEditDialog`), **then** they can edit a **description** (plain text, max **500** chars per UX spec) and **upload or replace a logo** (JPEG/PNG/WebP/AVIF, max **2 Mo**, same rules as member avatar) or **remove** the logo. [Source: ux-design-troupe-hub.md T1 ; FR52 identity scope]
3. **Given** `GET /v1/public/troupes`, **when** it serves the public directory, **then** each item includes nullable `logoUrl` and `description` — **without** membership, join policy, email, or other admin fields (NFR-S2). [Source: Story 4.1 ; FR32]
4. **Given** `GET /v1/troupes` (Mes troupes, authenticated), **when** the list is returned, **then** the same `logoUrl` and `description` fields are present on each `TroupeListItem`. [Source: Story 17.3]
5. **Given** a troupe logo stored on the server, **when** an anonymous visitor loads a discover card, **then** the logo image is served via a **public read** endpoint (cache-busted URL in DTO) without session — only for troupes that would appear in the public directory (`listed_in_directory = true`, `is_demo = false`). [Source: NFR-S2 ; Story 4.1 security model]
6. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, `npm run build -w @hatcast/web`, and `./gradlew test`, **then** they pass; tests cover card with/without logo, description line-clamp, admin edit + upload, public DTO fields, and no sensitive-field leakage. [Source: NFR-P1]

**Product coverage:** UX follow-up 4.1 ; epics 17.3 (deferred card logo) ; ux-design-troupe-hub.md §Logo/description (T1 + T7 hero). **Out of scope:** public season/event pages (4.2), rich text/markdown description, image crop UI, social links.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** troupe cards and the edit dialog, **when** rendered, **then** keep `mat-card` + full-surface clickable link/button (Story 4.1 / `season-card` pattern) ; logo upload via existing Material pattern (`mat-button` + hidden `<input type="file">` or `mat-menu` like `account-placeholder`) — no custom drag-drop zone. [Source: FRONTEND_UI.md ; ux-design-troupe-hub.md T1]

**M3-2. Tokens & thème** — **Given** logo circle and description text, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; logo fallback circle matches current `.troupe-card__logo` primary tint. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** card is shown, **then** full card surface remains ≥ 48×48 dp ; French `aria-label` « Ouvrir/Voir {nom} » on the surface ; description truncation must not break tap target. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** `/troupes`, **when** this story touches chrome, **then** no bottom app bar ; breadcrumb **Accueil › Troupes** unchanged (Story 17.3). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — troupe model, logo storage, cards, edit dialog

### API — schema + logo service (AC: 2, 3, 4, 5, 6)

- [x] Flyway **`V42__troupe_logo_description.sql`**: add `description TEXT NULL`, `logo_storage_key VARCHAR(512) NULL`, `logo_updated_at TIMESTAMPTZ NULL` on `troupes`. Do **not** reuse `V41` (already `listed_in_directory` in Story 4.1).
- [x] Extend [`TroupeEntity`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt) with new columns.
- [x] Create **`TroupeLogoService`** mirroring [`AvatarService`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt): reuse [`AvatarStorage`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarStorage.kt) + same content-type/size validation (2 Mo, jpeg/png/webp/avif) ; storage keys `troupe-logos/{troupeId}/{uuid}.{ext}` ; `publicLogoUrl(troupeId, logoUpdatedAt)` → `/v1/public/troupes/{troupeId}/logo?v={epochMilli}`.
- [x] Extend [`UpdateTroupeRequest`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) with optional `description` (`@Size(max = 500)` ; empty string → `null` in DB). Keep `name` required on PATCH.
- [x] Extend [`PublicTroupeDirectoryItemDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) and [`TroupeListItemDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) with `logoUrl: String?`, `description: String?` (computed in service layer from entity + `TroupeLogoService.publicLogoUrl`).
- [x] Update [`PublicTroupeService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeService.kt) and [`TroupeMembershipService.buildTroupeListItemForViewer`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) (or equivalent list builder) to map new fields.
- [x] New endpoints on [`TroupeController`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) (admin via `troupeAccess.requireCanManageTroupe`):
  - `POST /v1/troupes/{troupeId}/logo` — `multipart/form-data`, field `file`
  - `DELETE /v1/troupes/{troupeId}/logo`
- [x] New public content endpoint on [`PublicTroupeController`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeController.kt):
  - `GET /v1/public/troupes/{troupeId}/logo` — `permitAll` ; return **404** if troupe not listed / demo / no logo (do not leak private troupe existence beyond listed set).
- [x] [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt): `permitAll()` for `GET /v1/public/troupes/*/logo` only.
- [x] OpenAPI: extend [`seasons.yaml`](../../services/api/openapi/seasons.yaml) (or troupe fragment) with new fields and logo routes.
- [x] Integration tests: extend [`PublicTroupeIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/PublicTroupeIntegrationTest.kt) + new `TroupeLogoIntegrationTest` — public list includes logoUrl/description ; upload as admin ; anonymous logo GET ; hidden/demo troupe logo 404 ; JSON has no `membership`/`email` on public list.

### Web — cards + edit dialog (AC: 1, 2, 6)

- [x] Extend [`TroupeCard`](../../apps/web/src/app/shared/troupe-card/troupe-card.ts): inputs `logoUrl?`, `description?` ; render `<img>` in `.troupe-card__logo` with `(error)` fallback to `mat-icon groups` ; add `.troupe-card__description` with `-webkit-line-clamp: 2`.
- [x] Propagate fields in [`troupes-list.html`](../../apps/web/src/app/pages/troupes-list/troupes-list.html) for Mes troupes and Découvrir grids.
- [x] Extend [`troupe-api.service.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.ts): types `logoUrl?`, `description?` on `TroupeListItem` and `PublicTroupeDirectoryItem` ; `updateTroupe` body includes `description?` ; add `uploadTroupeLogo(troupeId, file)` and `deleteTroupeLogo(troupeId)`.
- [x] Replace « Bientôt » placeholders in [`troupe-edit-dialog.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts):
  - `mat-form-field` textarea for description (maxlength 500, counter optional)
  - Logo preview (circle) + `mat-stroked-button` « Choisir une image » + hidden file input (`accept="image/jpeg,image/png,image/webp,image/avif"`) — copy pattern from [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html)
  - « Supprimer le logo » when present
  - On save: PATCH name + description first, then optional logo upload if file selected ; close dialog with updated `TroupeListItem`
- [x] **Do not** change [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) hero in this story (hub still shows generic icon — non-goal).

### Explicit non-goals (scope guard)

- [x] No hub hero logo/description (ux-design-troupe-hub.md T7 — follow-up story).
- [x] No rich text / markdown in description.
- [x] No image crop UI — simple file pick only.
- [x] No change to `listed_in_directory` admin toggle (Story 4.1 deferred).
- [x] No `GET /v1/public/troupes/{slug}` — slug resolution stays client-side from public list (Story 4.1).

### Tests & build (AC: 6)

- [x] [`troupe-card.spec.ts`](../../apps/web/src/app/shared/troupe-card/troupe-card.spec.ts): logo img vs fallback icon ; description rendered ; image error → fallback.
- [x] [`troupe-edit-dialog.spec.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.spec.ts): description save ; upload/delete logo mocks.
- [x] [`troupes-list.spec.ts`](../../apps/web/src/app/pages/troupes-list/troupes-list.spec.ts): cards receive logoUrl/description from API mocks.
- [x] [`troupe-api.service.spec.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.spec.ts): new methods + extended types.
- [x] Run web tests + build + API tests.

---

## Dev Notes

### Product and UX rules

- **Intent:** Complete the visual identity deferred from Story **4.1** (generic `groups` icon) and Story **17.3** AC (« cards logo »). Cards become scannable; edit path is the existing hub gear → **Modifier** dialog (placeholders today).
- **Vocabulary:** UI **Troupe** ; stats unchanged (« X membres », « Y spectacles à venir »).
- **Description:** Plain text only ; empty/null → hide description line on card (no placeholder text).
- **Logo visibility:** Public logo URL only for directory-eligible troupes ; members see logo on Mes troupes cards even if troupe is hidden from directory (authenticated list uses same DTO fields).

### Data model

| Column | Type | Notes |
|--------|------|-------|
| `description` | `TEXT NULL` | Max 500 chars server-side ; trim ; empty → `NULL` |
| `logo_storage_key` | `VARCHAR(512) NULL` | Internal storage key ; never expose in JSON |
| `logo_updated_at` | `TIMESTAMPTZ NULL` | Cache buster for public URL ; `NULL` when no logo |

### API contract summary

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /v1/public/troupes` | None | Directory cards — add `logoUrl`, `description` |
| `GET /v1/troupes` | Session | Mes troupes — add `logoUrl`, `description` |
| `PATCH /v1/troupes/{id}` | Admin | Update `name` + optional `description` |
| `POST /v1/troupes/{id}/logo` | Admin | Upload/replace logo |
| `DELETE /v1/troupes/{id}/logo` | Admin | Remove logo |
| `GET /v1/public/troupes/{id}/logo` | None | Serve logo bytes for listed non-demo troupes |

**Security (NFR-S2):** Public DTO and logo endpoint must not expose membership, emails, join policy, or storage keys. Logo GET returns 404 for non-listed or demo troupes.

### Logo implementation guardrails

- **Reuse, do not reinvent:** [`AvatarService`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt) validation + [`AvatarStorage`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarStorage.kt) — same bucket/base path is acceptable (`hatcast-avatars` parent dir) with distinct key prefix `troupe-logos/`.
- **Public URL shape:** Mirror avatar cache bust: `/v1/public/troupes/{troupeId}/logo?v={logoUpdatedAt.toEpochMilli()}`.
- **Front img error:** Always fall back to `mat-icon groups` on load error (broken file, 404) — card remains usable.

### `/troupes` card layout (after change)

```
┌─────────────────────────┐
│ [logo/img] Troupe name  │
│ Short description…      │  ← line-clamp 2, omit if null
│ 4 membres               │
│ 2 spectacles à venir    │
└─────────────────────────┘
   ↑ full surface link/button (unchanged from 4.1)
```

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`apps/web/src/app/shared/troupe-card/`](../../apps/web/src/app/shared/troupe-card/) | Card shell ; add logo + description |
| [`apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts) | Replace « Bientôt » rows (lines 44–52) |
| [`apps/web/src/app/pages/account-placeholder/`](../../apps/web/src/app/pages/account-placeholder/) | Avatar file input + size check (`MAX_AVATAR_BYTES = 2_097_152`) |
| [`AvatarService`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt) | Upload validation, storage, delete-old-on-replace |
| [`PublicTroupeService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeService.kt) | Batch list mapping pattern |
| [`TroupeService.update`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt) | Extend PATCH for description |

### Previous story intelligence (4.1 — annuaire public)

Story **4.1** (status **review**) established:

- `GET /v1/public/troupes` unauthenticated ; `PublicTroupeDirectoryItemDto` currently **without** logo/description — extend, do not create a second public list endpoint.
- `/troupes` loads Découvrir without session ; Mes troupes gated ; discover excludes member slugs client-side.
- `app-troupe-card` uses full-surface `<a>` / `<button>` — **keep** ; do not reintroduce separate CTA buttons (4.1 review fix).
- `V41__troupe_listed_in_directory.sql` already merged — next migration is **V42**.
- Hub `accessDenied` vs `notFound` — unchanged by 4.3.

### Git intelligence

Recent related work:

- Story **4.1** implementation in working tree (public API, troupe cards, hub gate) — build on those files ; do not revert anonymous Découvrir behaviour.
- `troupe-edit-dialog.ts` still has explicit « Bientôt » for logo/description — this story removes them.
- Follow Epic 17/18 patterns: standalone components, signals, Vitest + `TestBed`, Kotlin `@SpringBootTest` integration tests.

### Project Structure Notes

**New / touch API:**

- `services/api/src/main/resources/db/migration/V42__troupe_logo_description.sql`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeLogoService.kt` (or `troupe/` package)
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeLogoController.kt` (optional split from TroupeController)
- Touch: `TroupeEntity.kt`, `TroupeDtos.kt`, `TroupeService.kt`, `PublicTroupeService.kt`, `TroupeController.kt`, `PublicTroupeController.kt`, `SecurityConfig.kt`, `openapi/seasons.yaml`
- `services/api/src/test/kotlin/.../TroupeLogoIntegrationTest.kt`

**Touch web:**

- `apps/web/src/app/core/troupes/troupe-api.service.ts` (+ spec)
- `apps/web/src/app/shared/troupe-card/*` (+ spec)
- `apps/web/src/app/pages/troupes-list/troupes-list.html` (+ spec if needed)
- `apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts` (+ spec)

### References

- [Source: `_bmad-output/implementation-artifacts/4-1-annuaire-public-des-troupes.md` — prerequisite]
- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 17.3 cards logo AC]
- [Source: `_bmad-output/planning-artifacts/ux-design-troupe-hub.md` — T1 edit dialog, T7 hero (hub deferred), §Logo/description API table]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2b `/troupes`]
- [Source: `docs/v2/technical/FRONTEND_UI.md` — M3 checklist]
- [Source: `project-context.md` — stack, test commands]

---

## Dev Agent Record

### Agent Model Used

GPT-5.5

### Completion Notes List

- Implemented troupe identity fields end-to-end: `description`, `logo_storage_key`, `logo_updated_at`, public cache-busted logo URLs, and authenticated/public DTO propagation.
- Added admin logo upload/delete endpoints and anonymous public logo serving restricted to listed non-demo troupes; hidden/demo/missing logo cases return 404.
- Updated `/troupes` cards to show logo image with `groups` fallback and two-line clamped description; kept full-card click surface and French `aria-label`.
- Replaced edit-dialog placeholders with description textarea, logo preview, file picker, delete action, and save flow PATCH → upload/delete.
- M3 checklist: Material components used for dialog/buttons/field; styles use `--mat-sys-*`/`color-mix`; mobile tap surface unchanged; no bottom app bar/chrome change.
- Post-review: hub hero + fil d’Ariane (`troupe-hub`, `app-context-breadcrumb` sur saison/spectacle/admin) ; `GET /v1/troupes/{id}/logo` pour membres actifs (logos hors annuaire public) ; correctifs revue (`revokeObjectURL`, `logoLoadFailed` reset).
- Validation passed: `npm run test -w @hatcast/web -- --watch=false`, `npm run build -w @hatcast/web`, `./gradlew test` from `services/api/`.

### File List

- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.scss`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-header.html`
- `apps/web/src/app/pages/season-home/season-header.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail-header.html`
- `apps/web/src/app/pages/event-detail/event-detail-header.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.html`
- `apps/web/src/app/pages/admin-membres/admin-membres.ts`
- `apps/web/src/app/pages/admin-participants/admin-participants.html`
- `apps/web/src/app/pages/admin-participants/admin-participants.ts`
- `apps/web/src/app/pages/admin-event-participants/admin-event-participants.html`
- `apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.html`
- `apps/web/src/app/pages/troupes-list/troupes-list.spec.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.html`
- `apps/web/src/app/shared/troupe-card/troupe-card.scss`
- `apps/web/src/app/shared/troupe-card/troupe-card.spec.ts`
- `services/api/openapi/seasons.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeLogoService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/resources/db/migration/V42__troupe_logo_description.sql`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/PublicTroupeIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeLogoIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeUpdateIntegrationTest.kt`

### Change Log

- 2026-06-01 : Story 4.3 created (`bmad-create-story`) — logo + description on troupe cards ; comprehensive dev guide.
- 2026-06-01 : Implemented story 4.3 — troupe logo/description API, public logo endpoint, cards, edit dialog, tests and validations.
- 2026-06-01 : Code review + hub/breadcrumb logo, authenticated member logo URL, story closed `done`.

---

### Review Findings

- [x] [Review][Defer] Logo invisible sur « Mes troupes » pour troupes hors annuaire — résolu : `GET /v1/troupes/{id}/logo` + `memberLogoUrl` dans `TroupeListItemDto`.

- [x] [Review][Patch] Fuite mémoire `URL.createObjectURL` [apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts] — corrigé : `revokeObjectURL` au remplacement et à la destruction du dialog.

- [x] [Review][Patch] `logoLoadFailed` non réinitialisé si `logoUrl` change [apps/web/src/app/shared/troupe-card/troupe-card.ts] — corrigé : `effect` sur `logoUrl()` (même pattern que `user-avatar`).

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
- [x] Non-goals explicites (hub hero, 4.2, rich text)

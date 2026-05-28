# Story 2.11: Troupe creation (API + minimal UI)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in user**,
I want to **create a new troupe with a single name field**,
so that **I can bootstrap a real troupe on staging/production (MIG-0) and become its administrator without manual SQL or dev seeds**.

## Acceptance Criteria

1. **Given** an authenticated session, **when** the client sends `POST /v1/troupes` with body `{ "name": "<non-empty trimmed name>" }` and valid CSRF (`X-XSRF-TOKEN`), **then** the API persists a new `troupes` row and an **active** `troupe_memberships` row for the caller with `baselineRole = TROUPE_ADMIN`, and returns **201** with a payload compatible with `TroupeListItemDto` (`id`, `name`, `slug`, `membership`, `activeMemberCount = 1`, `upcomingEventCount = 0`). [Source: [PLAN.md](../../PLAN.md) § MIG-0 / Story 2.11; [DOMAIN.md](../../DOMAIN.md) § baseline troupe role]
2. **Given** the troupe name, **when** the slug is allocated, **then** it is **auto-generated** from the name (NFD normalize, lowercase, `[a-z0-9-]`, collapse dashes, max 128 chars) — **no user slug field** — and **globally unique** across `troupes.slug` using suffix `-2`, `-3`, … on collision (same algorithm spirit as `SeasonSlugGenerator`). [Source: [PLAN.md](../../PLAN.md) Story 2.11; Story 17.12 season slug pattern]
3. **Given** an empty or whitespace-only name, or a name that slugifies to empty, **when** `POST /v1/troupes` is called, **then** the API returns **400** with a coherent French error message and **no** partial rows. [Source: repo validation patterns]
4. **Given** no session or invalid CSRF, **when** `POST /v1/troupes` is called, **then** **401** / CSRF failure respectively — no troupe created. [Source: [SecurityConfig.kt](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt); Story 2.1]
5. **Given** troupe creation succeeds, **when** the creator calls `GET /v1/troupes`, **then** the new troupe appears in the membership list and `TroupeAccessService.requireCanManageTroupe` succeeds for admin surfaces (members CSV import/export per Story 2.3). [Source: MIG-0 runbook [preprod-reset-and-migrate.md](../../docs/v2/migration/preprod-reset-and-migrate.md) Procedure B]
6. **Given** the signed-in user on `/troupes`, **when** they tap **Créer une troupe**, **then** a **MatDialog** collects the troupe name (Material form field), shows a short hint that the URL slug is computed automatically, and on success navigates to `/troupes/:slug` (existing hub). [Source: Story 17.3 `/troupes`; ADR 0013]
7. **Given** zero memberships on `/troupes`, **when** the empty state renders, **then** offer **Créer une troupe** **in addition to** the existing demo-troupe join CTA (do not remove demo join — still useful on `dev` profile). [Source: Story 17.3 AC5]
8. **Given** implementation complete, **when** tests run, **then** API integration tests cover happy path, slug collision suffix, 400/401; web unit tests cover dialog submit + navigation; `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass. [Source: AGENTS.md]

**Product coverage:** MIG-0 gate ([ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md)); enables CSV import Story 2.3 on empty `cloud` Neon. **Not** a new FR — operational bootstrap until Epic 4 self-service join exists.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the create-troupe dialog, **when** rendered, **then** use `MatDialog`, `mat-form-field`, `matInput`, `mat-button` / `mat-flat-button` for actions — no custom clickable divs for primary actions. [Source: FRONTEND_UI.md; UX-DR11]

**M3-2. Tokens & thème** — **Given** dialog SCSS, **when** colors are applied, **then** only `var(--mat-sys-*)` / `color-mix` — no hardcoded error reds on new surfaces (reuse existing dialog error pattern or tokens). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport ≤480px, **when** the dialog and `/troupes` CTA are shown, **then** primary buttons meet ≥48×48 dp touch targets; dialog width `min(100vw - 2rem, 28rem)` (match `SeasonFormDialog`). [Source: NFR-A1; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** this story adds a CTA on `/troupes` only, **when** implemented, **then** do **not** add bottom app bar or change global member chrome (17.22 rail). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md checklist M3 and note waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` — API creation endpoint + minimal dialog on `/troupes`

- [x] **API — slug helper + repository** (AC: 2, 3)
  - [x] Add `existsBySlug(slug: String): Boolean` (and optional `findBySlug`) to `TroupeRepository`.
  - [x] Add `TroupeSlugGenerator` (or shared `SlugGenerator.slugify` extracted from `SeasonSlugGenerator` + troupe-level `allocateUniqueSlug`) — **global** uniqueness on `troupes.slug`, not per-parent.
  - [x] Reuse NFD/`MAX_SLUG_LEN = 128` rules from [SeasonSlugGenerator.kt](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonSlugGenerator.kt).

- [x] **API — create service + endpoint** (AC: 1, 3, 4, 5)
  - [x] Add `CreateTroupeRequest` DTO: `@NotBlank @Size(max = 255) name`.
  - [x] Add `TroupeService.create(body, principal)` (preferred) or method on `TroupeMembershipService` — **single `@Transactional`**:
    - Insert `TroupeEntity(id = UUID.randomUUID(), name, slug, createdAt)`.
    - Insert `TroupeMembershipEntity` for caller: `ACTIVE`, `TROUPE_ADMIN`, `displayName = MemberDisplayNameResolver.resolve(user)`.
    - Catch `DataIntegrityViolationException` on slug race → retry or map to 409 if retry exhausted (prefer same loop as season slug).
  - [x] Add `POST /v1/troupes` on `TroupeController` → **201** + `TroupeListItemDto`.
  - [x] **Authorization:** any **authenticated** user may create (no platform super-admin gate — required for MIG-0 on empty staging).
  - [x] Document in OpenAPI [seasons.yaml](../../services/api/openapi/seasons.yaml) fragment.

- [x] **API — tests** (AC: 8)
  - [x] Integration test: POST creates troupe + admin membership; GET lists it; admin can hit members export route.
  - [x] Integration test: second troupe named like seed colliding slug → `-2` suffix.
  - [x] Integration test: blank name → 400; unauthenticated → 401.

- [x] **Web — API client** (AC: 1, 6)
  - [x] Add `CreateTroupeRequest` / response type to [troupe-api.service.ts](../../apps/web/src/app/core/troupes/troupe-api.service.ts).
  - [x] `createTroupe(body)` → `POST /v1/troupes` with CSRF + credentials.

- [x] **Web — dialog + `/troupes` wiring** (AC: 6, 7, M3)
  - [x] Create `create-troupe-dialog.ts` (inline template OK — mirror [season-form-dialog.ts](../../apps/web/src/app/pages/seasons-list/season-form-dialog.ts) minimal create mode: name only + slug auto hint).
  - [x] [troupes-list.ts](../../apps/web/src/app/pages/troupes-list/troupes-list.ts): section header action **Créer une troupe** when loaded; empty state secondary/primary pair (create + demo join).
  - [x] On success: `router.navigate(troupeHubPath(slug))`, snack « Troupe créée. », refresh list optional.
  - [x] French copy; `aria-label` on icon-only controls if any.

- [x] **Web — tests** (AC: 8)
  - [x] `troupes-list.spec.ts`: create button opens dialog; mock API success → navigates to hub path.
  - [x] `troupe-api.service.spec.ts`: POST body + CSRF headers.
  - [x] `create-troupe-dialog.spec.ts` (optional if covered via list spec).

- [x] **Docs (minimal)** (AC: 5)
  - [x] If ARCH/DOMAIN still imply troupes only via seed/SQL on cloud, add one sentence pointing to Story 2.11 product bootstrap — **do not** expand SPEC scope.

---

## Dev Notes

### Why this story exists (MIG-0)

| Context | Detail |
|---------|--------|
| **ADR-0014** | Profile `cloud` runs Flyway **`db/migration` only** — no La Malice seed on staging/prod. |
| **Runbook** | [preprod-reset-and-migrate.md](../../docs/v2/migration/preprod-reset-and-migrate.md) Procedure B requires a **V2 troupe UUID** before CSV user/member import (Story 2.3). |
| **Today** | Operators would insert SQL manually — this story replaces that with product flow. |
| **Gate** | **MIG-0** in [PLAN.md](../../PLAN.md) — must ship **before** first staging migration import. |

**Note on story ID:** An older SCP referenced « Story 2.11 Admin Membres polish » — superseded by this **MIG-0** story per PLAN 2026-05-28.

### Scope boundaries

| In scope | Out of scope |
|----------|--------------|
| `POST /v1/troupes` + creator `TROUPE_ADMIN` | Troupe edit/rename/archive API |
| Auto slug from name (global unique) | User-editable slug field |
| MatDialog on `/troupes` | Full troupe settings page |
| Empty-state + header CTA | Public directory / join requests (Epic 4) |
| OpenAPI + integration tests | Rate limiting / anti-spam quotas |
| | Bundled first season creation |
| | Platform-only « super admin creates troupe » gate |
| | Changes under `legacy/` |
| | Re-enabling Flyway seed on `cloud` |

### API design guardrails

**Endpoint:** `POST /v1/troupes`

```json
// Request
{ "name": "La Malice" }

// Response 201 — TroupeListItemDto
{
  "id": "uuid",
  "name": "La Malice",
  "slug": "la-malice",
  "membership": { "id": "…", "displayName": "…", "status": "ACTIVE", "baselineRole": "TROUPE_ADMIN", … },
  "activeMemberCount": 1,
  "upcomingEventCount": 0
}
```

**Slug rules:** Same `slugify()` semantics as seasons ([Story 17.12](../../_bmad-output/implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md)). Uniqueness scope is **`troupes.slug` UNIQUE** (DB constraint in `V3__troupes_seasons.sql`), **not** per-troupe like seasons.

**Transaction:** Troupe + membership must commit atomically. Creator must satisfy DOMAIN invariant « at least one active TROUPE_ADMIN » from birth.

**Security:** Spring already requires authentication for `/v1/troupes/**`. No extra `@PreAuthorize` beyond session — **any signed-in user** can bootstrap (staging operator use case). Document in OpenAPI description.

**Do not** reuse `POST /v1/troupes/{id}/memberships/me` — that remains **demo seed join** with `MEMBER` role only ([TroupeController.kt](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) L53–63).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| **Pattern** | Copy dialog structure from `SeasonFormDialog` (create mode): title, one `mat-form-field`, hint about auto slug, Annuler / Créer buttons. |
| **Placement** | `/troupes` only (Story 17.3) — **not** `/seasons` admin list. |
| **Navigation** | `troupeHubPath(slug)` from [troupe-routes.ts](../../apps/web/src/app/core/navigation/troupe-routes.ts). |
| **Context** | Optional: `TroupeContextService.selectTroupe(id)` after create if hub expects selected troupe — check [troupe-hub.ts](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) load path. |
| **CSRF** | `csrfHeaders()` from [hatcast-csrf.ts](../../apps/web/src/app/core/http/hatcast-csrf.ts) — same as `joinTroupe`. |
| **Errors** | Map 400 → inline form error; 409 slug race → generic retry message; network → snack. |

### Existing code to reuse

| File | Reuse |
|------|--------|
| `SeasonSlugGenerator.kt` | `slugify` + suffix allocation pattern |
| `SeasonFormDialog` | Dialog UX, width, form validation |
| `TroupeMembershipService.ensureActiveMembership` | Membership field defaults (display name) |
| `MemberDisplayNameResolver.kt` | Creator display name |
| `TroupeListItemDto` | Response shape — avoid new DTO if counts can be 1/0 |
| `troupes-list.ts` / `.html` | Host page for CTA + empty state |
| `TroupeMemberCsvImportService` / Story 2.3 UI | **Downstream** — admin imports after create on staging |

### Architecture compliance

- **Stack:** Kotlin 3.4 + Spring Boot JPA; Angular 21 + Material 3 in `apps/web/`.
- **Conventions:** camelCase JSON, snake_case DB, UUID public ids, French API error messages for user-facing validation.
- **OpenAPI:** Extend [seasons.yaml](../../services/api/openapi/seasons.yaml) — keep troupe endpoints in one fragment.
- **Flyway:** **No migration required** — `troupes` + `troupe_memberships` tables exist (`V3`, `V9`).
- **Profiles:** Dev seed (`db/seed`) unchanged; this flow is for **`cloud`** empty DB.

### Testing standards

```bash
# API
cd services/api && ./gradlew test

# Web
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

Integration test pattern: follow [TroupeMembershipIntegrationTest.kt](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt) session + CSRF helpers.

### M3 checklist (implementation review)

| Item | Status |
|------|--------|
| M3-1 Material components | OK — MatDialog, mat-form-field, mat-flat-button |
| M3-2 Tokens | OK — opacity/hint only; mat-error for server errors |
| M3-3 Mobile/touch | OK — 3rem min-height buttons, dialog `min(100vw - 2rem, 28rem)` |
| M3-4 No chrome change | OK — `/troupes` only |
| M3-5 Waivers | None |

### Previous story intelligence

- **Story 2.1** — Membership model, CSRF, `GET /v1/troupes` membership-scoped list; demo join limited to seed troupe.
- **Story 2.2** — `TROUPE_ADMIN` baseline role + last-admin invariant (creation satisfies by design).
- **Story 2.3** — CSV import is the **next operator step** after MIG-0 troupe exists; creator must be admin.
- **Story 2.4** — Multi-troupe context; after create user may have 2+ troupes — hub navigation must work without assuming `[0]`.
- **Story 17.3** — `/troupes` page shell, empty state, demo join — **extend**, do not replace.
- **Story 17.4** — Hub at `/troupes/:slug` already exists — post-create destination.

### Git intelligence (recent patterns)

Recent commits: ops/CI (`docs(ci)`, `fix(api)` Flyway), `chore(api): dev seed for context switcher`. Use Conventional Commits: `feat(api): Add troupe creation endpoint`, `feat(web): Add create troupe dialog on /troupes`.

### Project context reference

See [project-context.md](../../project-context.md) — Material 3 checklist mandatory; no legacy edits.

### Explicit non-goals

- Epic 4 public troupe directory or join-request flows.
- Editing troupe name/slug after creation.
- Automatic first season/league creation (operators create season via existing UI after import).
- Removing demo-troupe join on dev.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 2.1 | done | Membership + auth patterns |
| 2.2 | done | `TROUPE_ADMIN` role |
| 2.3 | done | **Consumer** — CSV import after troupe exists (MIG-0) |
| 17.3 | done | `/troupes` host UI |
| 17.4 | done | Post-create navigation target |
| MIG-2 | backlog | **Blocked on** this story for staging bootstrap |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- Added `POST /v1/troupes` with `TroupeService` (atomic troupe + `TROUPE_ADMIN` membership), `TroupeSlugGenerator` (global slug uniqueness via `SeasonSlugGenerator.slugify`).
- Web: `CreateTroupeDialog` on `/troupes` (header + empty state CTAs), navigation to hub on success.
- Tests: `TroupeCreationIntegrationTest` (4 cases); web specs for API client and list dialog flow.
- Docs: one sentence in `ARCH.md` for MIG-0 product bootstrap.
- `./gradlew test --tests TroupeCreationIntegrationTest` and `npm run test -w @hatcast/web -- --watch=false` pass.

### File List

- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeSlugGenerator.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCreationIntegrationTest.kt (new)
- services/api/openapi/seasons.yaml
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/core/troupes/troupe-api.service.spec.ts
- apps/web/src/app/pages/troupes-list/create-troupe-dialog.ts (new)
- apps/web/src/app/pages/troupes-list/troupes-list.ts
- apps/web/src/app/pages/troupes-list/troupes-list.html
- apps/web/src/app/pages/troupes-list/troupes-list.scss
- apps/web/src/app/pages/troupes-list/troupes-list.spec.ts
- ARCH.md

### Change Log

- 2026-05-28 : Story created (create-story workflow) — ready-for-dev
- 2026-05-28 : Implemented MIG-0 troupe creation (API + UI) — review
- 2026-05-28 : Code review patches (CSRF + slugify-empty tests, 409 message, dialog maxLength 255) — done

---

### Review Findings

- [x] [Review][Patch] Ajouter test d’intégration CSRF sur `POST /v1/troupes` (session sans `.with(csrf())` → 403), calqué sur `join seed troupe requires csrf` — AC4 / AC8 [`TroupeCreationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCreationIntegrationTest.kt)
- [x] [Review][Patch] Ajouter test d’intégration nom non slugifiable (ex. `{"name":"!!!"}`) → 400 sans ligne persistée — AC3 / AC8 [`TroupeCreationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCreationIntegrationTest.kt)
- [x] [Review][Patch] Après épuisement des retries slug, lever `ResponseStatusException(CONFLICT, "Impossible de créer la troupe, réessayez.")` au lieu de relancer `DataIntegrityViolationException` (message générique du handler) [`TroupeService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt)
- [x] [Review][Patch] Limiter le champ nom à 255 caractères côté dialog (`maxlength` / `Validators.maxLength`) — aligné DTO [`create-troupe-dialog.ts`](../../apps/web/src/app/pages/troupes-list/create-troupe-dialog.ts)
- [x] [Review][Defer] `TroupeRepository.findBySlug` ajouté mais non utilisé (optionnel dans la story) [`TroupeRepository.kt:13`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeRepository.kt) — deferred, pas bloquant MIG-0

### Validation create-story

- [x] AC métier numérotés et sourcés (PLAN MIG-0, ADR-0014, DOMAIN, Story 17.x)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test -w @hatcast/web` mentionnés

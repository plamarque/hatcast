# Story 17.38: Admin category glossary API

Status: done

baseline_commit: ad52b5e139a102c5816a240cd35bee555c6298e0

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md](../planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md) (product decisions 2026-06-08)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **troupe admin** (via API consumers including Angular stories **17.39** / **17.40**),
I want **admin CRUD on the troupe category glossary** and **strict validation when organizers assign a category to an event**,
so that **categories are a controlled vocabulary** (no typo duplicates from free typing) and **deletion shows impact before cascade to Spectacle ordinaire** (`category: null`).

## Acceptance Criteria

1. **Given** a troupe admin (or platform admin), **when** `POST /v1/troupes/{troupeId}/categories` with body `{ "label": "Apérock", "slug": "aperock" }` (slug optional — derived from label if omitted), **then** a glossary row is created with normalized slug and trimmed label; response `201` + `TroupeCategoryDto`. **Given** slug `principal` or `main`, **then** `400` French error. **Given** duplicate `(troupe_id, slug)`, **then** `409`. [Source: SCP §4.6 ; ADR 0013 §3 amended]
2. **Given** troupe admin, **when** `PATCH /v1/troupes/{troupeId}/categories/{slug}` with `{ "label": "Apérock !" }`, **then** only `label` updates; slug immutable; `404` if slug missing for troupe. [Source: SCP §4.6 ; UX 17.39 S3]
3. **Given** troupe admin, **when** `GET /v1/troupes/{troupeId}/categories/{slug}/delete-preview`, **then** `{ "eventCount": N }` where **N** counts non-archived events in **any season of the troupe** with `events.category = slug` (exact slug match — **not** legacy `template_type = deplacement` unless `category = 'deplacements'`). [Source: SCP §4.6 ; UX S4]
4. **Given** troupe admin, **when** `DELETE /v1/troupes/{troupeId}/categories/{slug}`, **then** in one transaction: (a) `UPDATE events SET category = NULL` for matching events in troupe seasons; (b) delete glossary row; response `{ "affectedEventCount": N }` (same count as preview). `404` if slug not in glossary. [Source: SCP §4.6 ; DOMAIN category delete cascade]
5. **Given** active troupe member, **when** `GET /v1/troupes/{troupeId}/categories`, **then** list returns DB rows sorted by `label ASC`; **if no `deplacements` row exists**, lazily seed idempotent row `{ slug: "deplacements", label: "Déplacements" }` before returning (so built-in appears without orga typing). Never expose `principal` as a row. [Source: SCP §2, §4.6 ; MIG-4]
6. **Given** organizer with event manage permission, **when** `POST/PATCH` event with `"category": "<value>"`, **then** slug is normalized via [`CategorySlugNormalizer`](../../services/api/src/main/kotlin/com/hatcast/api/event/CategorySlugNormalizer.kt) and **must exist** in troupe glossary — **no** auto-create (`ensureTag` removed); unknown slug → `400` French error (`Catégorie inconnue.` or equivalent). **Given** `"category": null` on PATCH, **then** clear to Spectacle ordinaire. [Source: SCP §4.4 amend 17.7 AC]
7. **Given** non-admin member, **when** POST/PATCH/DELETE on `/categories` (except GET list + delete-preview forbidden), **then** `403`. **Given** non-member, **then** `403` on all category endpoints. [Source: `TroupeAccessService` patterns]
8. **Given** implementation complete, **when** `./gradlew -q test` (API module) and OpenAPI [`categories.yaml`](../../services/api/openapi/categories.yaml) updated, **then** tests pass; integration tests cover CRUD, delete cascade, preview count, event validation rejection, lazy `deplacements` seed, and idempotent list. [Source: repo norms]

**Product coverage:** Epic 17 category governance; blocks **17.39** (selection UI) and **17.40** (troupe settings tab). **UI : N/A** — no changes under `apps/web/` in this story.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — backend-only story; Angular consumers land in **17.39** / **17.40**.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — OpenAPI, Flyway optional, tests
- [x] **DTOs** (AC: 1, 2, 3, 4)
  - [x] `CreateTroupeCategoryRequest(label, slug?)`, `UpdateTroupeCategoryLabelRequest(label)`, `CategoryDeletePreviewDto(eventCount)`, `CategoryDeleteResultDto(affectedEventCount)`
  - [x] Validation: non-empty label (max 128); optional slug normalized when provided
- [x] **`TroupeCategoryService` refactor** (AC: 1–6)
  - [x] Replace public `ensureTag` usage from events with `requireExistingCategory(troupeId, raw) -> slug`
  - [x] `createCategory(troupeId, request, principal)` — admin; normalize slug; reject reserved
  - [x] `updateLabel(troupeId, slug, label, principal)` — admin; make entity `label` mutable (`var`)
  - [x] `deleteCategory(troupeId, slug, principal)` — admin; transactional cascade + delete row
  - [x] `deletePreview(troupeId, slug, principal)` — admin; read-only count
  - [x] `listForTroupe` — call `ensureDeplacementsSeed(troupeId)` (idempotent) before query
  - [x] Keep `ensureTag` **private** or remove if unused; do **not** call from `EventService`
- [x] **`EventRepository` query** (AC: 3, 4)
  - [x] `@Query` + `@Modifying` `countEventsByTroupeIdAndCategory(troupeId, categorySlug): Long`
  - [x] `@Modifying` `clearCategoryOnTroupeEvents(troupeId, categorySlug): Int` — join `events` → `seasons` → `troupes`
- [x] **`TroupeController` endpoints** (AC: 1–7)
  - [x] `POST /{troupeId}/categories`
  - [x] `PATCH /{troupeId}/categories/{slug}`
  - [x] `GET /{troupeId}/categories/{slug}/delete-preview`
  - [x] `DELETE /{troupeId}/categories/{slug}`
  - [x] Permissions: GET list → `requireActiveMember`; mutations + preview → `requireCanManageTroupe`
- [x] **`EventService` validation** (AC: 6)
  - [x] `resolveCategoryForCreate` → `requireExistingCategory` (not `ensureTag`)
  - [x] Update path in `update()` — same validation
- [x] **Optional Flyway** (AC: 5)
  - [x] Lazy seed in service sufficient for AC5 — no Flyway migration added
- [x] **OpenAPI** (AC: 8)
  - [x] Extend `categories.yaml` with POST/PATCH/DELETE/preview paths and request/response schemas
- [x] **Tests** (AC: 8)
  - [x] Refactor `TroupeCategoryIntegrationTest`: admin CRUD + delete cascade + preview + reject auto-create
  - [x] Extend `EventControllerIntegrationTest` / `EventServiceUpdateTest`: unknown category → 400
  - [x] Unit test: `CategorySlugNormalizer` copy updated (« catégorie »)
  - [x] `EventTestSupport.ensureGlossaryCategory` for integration tests using custom categories
- [x] **Docs** (same PR, minimal)
  - [x] Dev Agent Record only — no ADR/DOMAIN/SPEC amend (per story scope)

## Dev Notes

### Product and domain rules

- **Spectacle ordinaire** = `events.category IS NULL` — never a glossary row; UI label only.
- **Déplacements** = slug `deplacements` — built-in via lazy seed on GET list; admin may delete (row removed + events with that slug → null).
- **Organizers** assign existing slugs only; **admins** curate glossary.
- **Delete cascade** sets `category = NULL` only — does **not** change `template_type`; legacy `template_type = deplacement` read rules in [`SpectacleCategory`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt) stay unchanged for stats/draw (**17.9**, **17.10**).
- **Slug immutability** after create — matches UX spec (17.39 S3).

### Explicit non-goals (scope guard)

- Do **not** implement Angular UI (**17.39**, **17.40**).
- Do **not** change stats filter or draw compartment logic (**17.9**, **17.10**, **19.8**).
- Do **not** add FK from `events.category` to `troupe_categories`.
- Do **not** backfill or rewrite legacy `template_type = deplacement` events (MIG-4 already handled import).
- Do **not** add audit log entries for category CRUD unless existing troupe-admin patterns require it (out of scope unless trivial).
- Do **not** extend [`TroupeApiService`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) — **17.39** / **17.40** will add client methods.

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Permissions | [`TroupeAccessService.requireCanManageTroupe`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) for mutations; `requireActiveMember` for GET list |
| Slug rules | Reuse [`CategorySlugNormalizer`](../../services/api/src/main/kotlin/com/hatcast/api/event/CategorySlugNormalizer.kt) + [`EventSlugGenerator.slugify`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventSlugGenerator.kt); reserved `principal`, `main` |
| PATCH event semantics | Unchanged: [`UpdateEventRequestDeserializer`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializer.kt) — present `null` clears category |
| Transaction | `@Transactional` on delete (clear events then delete row); preview is read-only |
| Idempotent seed | `ensureDeplacementsSeed`: `if (!existsByTroupe_IdAndSlug(troupeId, "deplacements")) insert` with catch duplicate race (same pattern as old `ensureTag`) |
| Entity change | `TroupeCategoryEntity.label` → `var` for PATCH label update; `slug` stays `val` |
| French errors | `ResponseStatusException` messages like existing troupe APIs |
| JSON naming | camelCase `eventCount`, `affectedEventCount`; paths under `/v1/troupes/{troupeId}/categories` |

**Suggested repository methods:**

```kotlin
// EventRepository.kt
@Query("""
    SELECT COUNT(e) FROM EventEntity e
    WHERE e.season.troupe.id = :troupeId
      AND e.archived = false
      AND e.category = :categorySlug
""")
fun countByTroupeIdAndCategory(troupeId: UUID, categorySlug: String): Long

@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("""
    UPDATE EventEntity e SET e.category = NULL
    WHERE e.season.troupe.id = :troupeId AND e.category = :categorySlug
""")
fun clearCategoryForTroupe(troupeId: UUID, categorySlug: String): Int
```

**API contract edge cases**

| Input | Expected |
|-------|----------|
| POST `{ "label": "Apérock" }` | slug → `aperock` (via normalizer) |
| POST duplicate slug | 409 |
| PATCH event `category: "unknown"` | 400 — not in glossary |
| PATCH event `category: "Déplacements"` | normalize → `deplacements`; OK if row exists |
| DELETE `deplacements` after seed | row gone; list no longer includes until admin re-creates |
| GET list first time for new troupe | auto-seed `deplacements` row |
| Non-admin POST categories | 403 |

**OpenAPI file:** extend [`services/api/openapi/categories.yaml`](../../services/api/openapi/categories.yaml) — today GET-only.

### Previous story intelligence (17.7)

- **17.7** shipped `troupe_categories`, `events.category`, `GET /categories`, and **`ensureTag` on event save** — **this story reverses the auto-create policy** per SCP.
- Migration chain: `V25__equity_tags.sql` → `V25_1__rename_equity_tag_to_category.sql`; table is `troupe_categories`.
- **17.7 review fixes** still apply: reserved slugs, idempotent insert race handling — reuse for seed/create.
- Integration tests: `@SpringBootTest` + Postgres in CI; local H2 may block on Flyway `pgcrypto` (known defer — CI is source of truth).

### Git intelligence

Recent related commit: `3d1fba96 docs(planning): Capture category glossary UX course correction`. Category field rename and stats integration already on `main`. Follow Kotlin patterns from Epic 17 API work: standalone `@Service`, French `ResponseStatusException`, `@Transactional` on multi-step writes.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| Service | `troupe/TroupeCategoryService.kt` |
| Controller | `troupe/TroupeController.kt` |
| DTOs | `troupe/dto/TroupeCategoryDtos.kt` (+ new request/response types) |
| Entity | `troupe/TroupeCategoryEntity.kt` (`var label`) |
| Events | `event/EventService.kt`, `event/EventRepository.kt` |
| OpenAPI | `services/api/openapi/categories.yaml` |
| Tests | `troupe/TroupeCategoryIntegrationTest.kt`, `event/EventControllerIntegrationTest.kt`, `event/EventServiceUpdateTest.kt` |

**Commands:**

```bash
cd services/api && ./gradlew -q test
```

### References

- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md` — §4.6, §2 Technical impact]
- [Source: `_bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md` — S3/S4 API contract for preview + delete]
- [Source: `_bmad-output/implementation-artifacts/17-7-api-tag-equite-glossaire-troupe.md` — baseline to amend]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §3 category glossary]
- [Source: `DOMAIN.md` — category pool definition]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt` — read rules unchanged]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 17.38)

### Completion Notes List

- Admin CRUD API on `/v1/troupes/{troupeId}/categories` (POST/PATCH/DELETE + delete-preview GET).
- Removed `ensureTag` auto-create on event save; `requireExistingCategory` validates against glossary (`400 Catégorie inconnue.`).
- Lazy idempotent seed of `deplacements` on GET list; delete cascade sets `events.category = NULL` in one transaction.
- `CategorySlugNormalizer` error copy aligned to « catégorie ».
- `EventTestSupport.ensureGlossaryCategory` added for integration tests assigning custom categories.
- Story-specific tests pass (`TroupeCategoryIntegrationTest`, event category tests, normalizer, `EventServiceUpdateTest`).
- Full API suite: 3 pre-existing failures on baseline `ad52b5e` (availability chances / draw history) — not introduced by 17.38.

### File List

- `services/api/openapi/categories.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/event/CategorySlugNormalizer.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeCategoryDtos.kt`
- `services/api/src/test/kotlin/com/hatcast/api/support/EventTestSupport.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCategoryIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/CategorySlugNormalizerTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningIntegrationTest.kt`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-09: Story 17.38 created — admin category glossary API (SCP 2026-06-08).
- 2026-06-09: Implemented admin CRUD, strict event validation, delete cascade/preview, tests (dev-story).
- 2026-06-09: Code review — 1 decision-needed, 6 patch, 4 defer, 3 dismissed.
- 2026-06-09: Code review patches applied — all 7 patch items fixed; story done.

### Review Findings

#### Decision needed

- [x] [Review][Decision] Seed `deplacements` dans `requireExistingCategory` ? — **Résolu : option 1** — appeler `ensureDeplacementsSeed` avant `existsBySlug` dans `requireExistingCategory`.

#### Patch

- [x] [Review][Patch] Seed `deplacements` dans `requireExistingCategory` — [`TroupeCategoryService.kt:127-137`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt) : appeler `ensureDeplacementsSeed(troupeId)` avant la vérification d'existence (décision review).

- [x] [Review][Patch] `clearCategoryForTroupe` efface aussi les événements archivés — [`EventRepository.kt:200-210`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt) : le COUNT filtre `archived = false` mais l'UPDATE non ; viole AC4 et la doc OpenAPI DELETE (« non archivés »). Ajouter `AND e.archived = false` à l'UPDATE.
- [x] [Review][Patch] Écriture dans transaction `readOnly` sur GET list — [`TroupeCategoryService.kt:25-37`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt) : `listForTroupe` est `@Transactional(readOnly = true)` mais appelle `ensureDeplacementsSeed` (INSERT). Retirer `readOnly` ou isoler la seed en `@Transactional(propagation = REQUIRES_NEW)`.
- [x] [Review][Patch] Changement hors périmètre 17.38 dans `EventService.create` — [`EventService.kt:245`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) : `organizerAccess.seedEventOrganizersFromSeason` appartient au travail notifications/organizer (8.4b), pas à cette story. Retirer de ce changeset.
- [x] [Review][Patch] Slug path non normalisé sur PATCH/DELETE/preview — [`TroupeCategoryService.kt:86,103,116`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt) : `{slug}` passé tel quel à `requireCategoryEntity` alors que `requireExistingCategory` normalise. Normaliser via `CategorySlugNormalizer` (ou documenter casse stricte).
- [x] [Review][Patch] Tests AC7 incomplets — [`TroupeCategoryIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCategoryIntegrationTest.kt) : PATCH et DELETE non testés en 403 pour non-admin ; aucun test non-membre 403 sur tous les endpoints.
- [x] [Review][Patch] Tests 404 slug manquant — [`TroupeCategoryIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCategoryIntegrationTest.kt) : PATCH et DELETE sur slug inexistant non couverts (AC2/AC4).

#### Deferred (pre-existing or out of scope)

- [x] [Review][Defer] OpenAPI `events.yaml` non mis à jour pour le 400 catégorie inconnue — hors scope explicite story (AC8 = `categories.yaml` only) ; deferred, pre-existing doc gap.
- [x] [Review][Defer] Constantes réservées dupliquées (`RESERVED_SLUGS` vs `HIDDEN_SLUGS`) — [`CategorySlugNormalizer.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/CategorySlugNormalizer.kt) / [`TroupeCategoryService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeCategoryService.kt) ; deferred, risque faible aujourd'hui.
- [x] [Review][Defer] `labelForAutoCreate` code mort post-AC6 — [`CategorySlugNormalizer.kt:33-43`](../../services/api/src/main/kotlin/com/hatcast/api/event/CategorySlugNormalizer.kt) ; deferred, nettoyage cosmétique.
- [x] [Review][Defer] Fenêtre race preview → delete inter-requêtes — pas de token de confirmation ; comportement UX standard accepté pour v1 ; deferred.

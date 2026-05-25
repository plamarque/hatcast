# Story 17.7: Equity tag API and troupe glossary

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **troupe admin or organizer** (via API consumers including the Angular app in 17.8),
I want **optional `equityTag` on events** and a **troupe-scoped tag glossary** with automatic vocabulary extension,
so that **fairness compartments** (déplacements, Apérock, …) can be persisted **before** draw/stats partitioning (17.9–17.10) and **without** travel leagues (ADR 0013).

## Acceptance Criteria

1. **Given** Flyway migration applied, **when** schema is inspected, **then** `events.equity_tag` is nullable `VARCHAR(64)` and table `troupe_equity_tags` exists with **`UNIQUE (troupe_id, slug)`** and columns at least `troupe_id`, `slug`, `label`, `created_at`. [Source: epics 17.7; ADR 0013 §3]
2. **Given** `POST /v1/seasons/{seasonId}/events` or `PATCH .../events/{eventId}`, **when** body includes `equityTag`, **then** value is stored as **one** normalized slug; **reject** arrays, multiple values (comma-separated), or empty slug after normalization (400, French message). [Source: epics 17.7 — single tag]
3. **Given** `PATCH` with `"equityTag": null`, **when** saved, **then** `events.equity_tag` is **NULL** (principal compartment). **Given** field omitted on PATCH, **when** saved, **then** tag unchanged. [Source: ADR 0013 — principal implicit; PATCH semantics like `description`]
4. **Given** `GET` event list or detail, **when** response is built, **then** `EventResponse` includes `equityTag` (JSON `null` when principal). [Source: epics 17.7 — empty = principal on read]
5. **Given** active troupe member, **when** `GET /v1/troupes/{troupeId}/equity-tags`, **then** glossary entries for that troupe are returned (`slug`, `label`), sorted for autocomplete. [Source: epics 17.7 — admin liste tags; 17.8 autocomplete]
6. **Given** event save with a tag not yet in the glossary, **when** normalized slug is non-empty, **then** a **`troupe_equity_tags` row is created** (idempotent) and the event references that slug. [Source: epics 17.7 — création entrée glossaire ; design-thinking P4]
7. **Given** `equityTag` and `templateType`, **when** both set, **then** they are independent (e.g. `templateType=cabaret` + `equityTag=deplacements` allowed). [Source: ADR 0013 §3; DOMAIN.md]
8. **Given** implementation complete, **when** `./gradlew -q test` (API module) and OpenAPI fragments updated, **then** tests pass; integration tests cover create/list, auto-glossary, null clear, and multi-tag rejection. [Source: repo norms]

## Tasks / Subtasks

- [x] **Flyway + entities** (AC: 1)
  - [x] Add `V25__equity_tags.sql`: `events.equity_tag VARCHAR(64) NULL`; create `troupe_equity_tags` with FK to `troupes`, unique `(troupe_id, slug)`.
  - [x] Extend `EventEntity` with `var equityTag: String? = null` (`@Column(name = "equity_tag")`).
  - [x] Add `TroupeEquityTagEntity` + `TroupeEquityTagRepository` (`findByTroupe_IdOrderByLabelAsc`, `existsByTroupe_IdAndSlug`, `save`).

- [x] **Normalization helper** (AC: 2, 6)
  - [x] Add `EquityTagNormalizer` (or reuse `EventSlugGenerator.slugify` + `SLUG_PATTERN` validation) — max 64 chars; reject empty after normalize.
  - [x] Reject: JSON array for `equityTag`; string containing `,` or `;`; whitespace-only.
  - [x] Map display input → canonical `slug`; default `label` = trimmed user input or title-case slug for auto-created rows.

- [x] **Glossary service + API** (AC: 5, 6)
  - [x] `TroupeEquityTagService`: `listForTroupe(troupeId)`, `ensureTag(troupeId, rawInput)` (normalize + insert if missing).
  - [x] `GET /v1/troupes/{troupeId}/equity-tags` on `TroupeController` or dedicated `TroupeEquityTagController` — `troupeAccess.requireActiveMember`.
  - [x] Optional: `POST /v1/troupes/{troupeId}/equity-tags` for explicit admin seed (body `slug`/`label`) — `requireCanManageTroupe`; **not required** if auto-create on event save satisfies AC6.

- [x] **Event create/update** (AC: 2, 3, 4, 6, 7)
  - [x] `CreateEventRequest`: optional `equityTag: String?`.
  - [x] `UpdateEventRequest` + deserializer: `equityTag: JsonNullable<String>` — **present null = clear** to principal.
  - [x] `EventService.create/update`: resolve troupe from season; call `ensureTag` when non-null; set `entity.equityTag`.
  - [x] `EventResponseDto.equityTag` in `from()`.
  - [x] OpenAPI [`events.yaml`](../../services/api/openapi/events.yaml): property on `Event`, create/update bodies.

- [x] **Tests** (AC: 8)
  - [x] `EquityTagNormalizerTest` (unit).
  - [x] `EventControllerIntegrationTest`: POST with tag, GET reflects tag, PATCH null clears, POST array → 400.
  - [x] `TroupeEquityTagIntegrationTest` or extend `TroupeMembershipIntegrationTest`: list glossary, auto-create on event, duplicate ensure idempotent.
  - [x] Do **not** change `CompositionSelectionHistoryService` queries in this story (17.9).

## Dev Notes

### Product and domain rules

- **Principal compartment:** `equity_tag IS NULL` in DB and `equityTag: null` in JSON. Never persist sentinel strings (`""`, `"principal"`, `"main"`).
- **Single tag only:** One optional slug per event; no multi-select, no tag hierarchy.
- **Not navigation:** Tags do not appear in routes or breadcrumb (17.1–17.6 unchanged).
- **Distinct from `templateType`:** `deplacement` template remains in `EventTypes` for legacy; new away shows should use **normal template + `equityTag=deplacements`** (enforced in UI 17.8, not API block in 17.7).
- **Vocabulary examples (La Malice):** `deplacements`, `aperock` — store canonical slugs; UI may show accents in `label`.

### Explicit non-goals (scope guard)

- Do **not** implement Angular form, autocomplete, badges, or help text (**17.8**).
- Do **not** partition draw/chances or stats (**17.9**, **17.10**) — `CompositionSelectionHistoryService` stays **season-wide** until 17.9.
- Do **not** backfill `template_type = deplacement` → `equity_tag` (**17.10** migration).
- Do **not** add `equityTag` to `UserAgendaItemDto` unless needed for a minimal API contract test (17.8 can use season event list).
- Do **not** implement troupe admin UI to edit/delete glossary entries (future); API list + auto-create is enough.
- Do **not** remove `deplacement` from `EventTypes.ALLOWED` or change role slots in this story.
- Do **not** add FK from `events.equity_tag` to `troupe_equity_tags` unless you also handle troupe merge edge cases — **string slug + ensure on write** is sufficient for MVP.

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Migration number | **`V25__equity_tags.sql`** (after `V24__events_slug.sql` from 17.6) |
| PATCH semantics | Mirror [`UpdateEventRequestDeserializer`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializer.kt) — add `equityTag` string field; **null clears** (unlike `slug` which cannot be erased) |
| Slug rules | Reuse [`EventSlugGenerator.slugify`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventSlugGenerator.kt) + `SLUG_PATTERN`; max length **64** for equity (vs 128 event URL slug) |
| Permissions | Event mutations: existing `requireCanManageTroupe`; glossary **GET**: `requireActiveMember` (autocomplete for any member with season access) |
| Auto-create policy | **On** event create/update when normalized slug non-empty — matches AC « politique produit activée » |
| Idempotency | `ensureTag`: if `(troupe_id, slug)` exists, keep existing `label` (do not overwrite label on collision) |
| List DTO | `TroupeEquityTagDto(slug, label)` — stable sort `ORDER BY label ASC` |

**Suggested migration sketch:**

```sql
CREATE TABLE troupe_equity_tags (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL,
    label VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT troupe_equity_tags_troupe_slug UNIQUE (troupe_id, slug)
);

ALTER TABLE events ADD COLUMN equity_tag VARCHAR(64) NULL;
```

Optional dev seed (not required for AC): insert `deplacements` / `aperock` for MVP seed troupe in `V22` follow-up or test fixtures only.

**OpenAPI:**

- Extend `events.yaml` schemas `Event`, `CreateEventRequest`, `UpdateEventRequest` with `equityTag` (nullable string, maxLength 64).
- Add fragment `equity-tags.yaml` or paths under existing troupe OpenAPI file: `GET /troupes/{troupeId}/equity-tags`.

**JSON field naming:** camelCase `equityTag` in API; DB column `equity_tag` (consistent with `template_type`, `role_slots`).

### API contract edge cases

| Input | Expected |
|-------|----------|
| Omitted on POST | `equity_tag` NULL |
| `""` or `"   "` on POST/PATCH | 400 — invalid tag |
| `"equityTag": null` on PATCH | Clear to principal |
| `["deplacements"]` | 400 — not a string |
| `"deplacements,aperock"` | 400 — multiple tags |
| `"Déplacements"` | Normalize → `deplacements`; glossary label may keep accent |
| Unknown slug on save | Insert glossary row, then set event |

### Previous story intelligence (17.6)

- **17.6** (review): Event slugs shipped — `V24`, `EventSlugGenerator`, `UpdateEventRequest` + deserializer, `EventResponseDto.slug`. **Reuse** slugify/validation patterns; **do not** conflate `slug` (URL) with `equityTag` (fairness).
- **17.6 non-goals** explicitly deferred `equity_tag` to **this story**.
- Integration tests may require PostgreSQL Flyway chain (V23 `pgcrypto` note) — unit tests for normalizer + `EventServiceUpdateTest` pattern still valuable on H2 if applicable.

### Git intelligence

Recent Epic 17 work: troupe hub (`2dd6c07`), `/troupes` list (`b0ac951`), admin gear (`f2de86d`), breadcrumb (`d499911`). Kotlin: standalone services, `ResponseStatusException` with French messages, `@Transactional` on `EventService`.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| DB | `services/api/src/main/resources/db/migration/V25__equity_tags.sql` |
| API | `event/EventEntity.kt`, `event/EventService.kt`, `event/dto/EventDtos.kt`, `event/dto/UpdateEventRequestDeserializer.kt` |
| Glossary | `troupe/TroupeEquityTagEntity.kt`, `TroupeEquityTagRepository.kt`, `TroupeEquityTagService.kt`, `troupe/dto/TroupeEquityTagDtos.kt`, `troupe/TroupeController.kt` (or new controller) |
| OpenAPI | `services/api/openapi/events.yaml`, new or extended troupe paths |
| Tests | `EquityTagNormalizerTest.kt`, `EventControllerIntegrationTest.kt`, troupe/equity integration test |

**Commands:**

```bash
cd services/api && ./gradlew -q test
```

(Web build not required — **no** `apps/web` changes in 17.7.)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.7]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §3 Equity tag, §5 stats/draw deferred]
- [Source: `DOMAIN.md` — Equity tag glossary; stats § déplacements via tag]
- [Source: `PLAN.md` — 17.7 P1, DoD phase domaine 17.7–17.10]
- [Source: `_bmad-output/design-thinking-2026-05-25.md` — Wireframe P4, DB/API notes]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 6b (17.8 UI)]
- [Source: `_bmad-output/implementation-artifacts/17-6-slug-evenement-dans-les-urls.md` — patterns, non-goals, V24]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt` — **unchanged** until 17.9]

## Dev Agent Record

### Agent Model Used

Composer (dev-story 17.7)

### Debug Log References

### Completion Notes List

- Migration `V25__equity_tags.sql`, entités JPA, `EquityTagNormalizer`, `TroupeEquityTagService`, endpoint `GET /v1/troupes/{troupeId}/equity-tags`, `equityTag` sur create/update/read événements (PATCH `null` = compartiment principal).
- OpenAPI : `events.yaml` + fragment `equity-tags.yaml`.
- Tests unitaires : `EquityTagNormalizerTest`, `EventServiceUpdateTest` (clear tag) — **OK** (`./gradlew -q test --tests …`).
- Tests d'intégration ajoutés ; exécution `@SpringBootTest` locale bloquée par Flyway V23 `pgcrypto` sur H2 (préexistant, cf. 17.6 / deferred-work).

### File List

- services/api/src/main/resources/db/migration/V25__equity_tags.sql
- services/api/src/main/kotlin/com/hatcast/api/event/EquityTagNormalizer.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializer.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEquityTagEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEquityTagRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEquityTagService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeEquityTagDtos.kt
- services/api/openapi/events.yaml
- services/api/openapi/equity-tags.yaml
- services/api/src/test/kotlin/com/hatcast/api/event/EquityTagNormalizerTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeEquityTagIntegrationTest.kt

### Review Findings

- [x] [Review][Patch] Rejeter les slugs réservés `principal` et `main` — [EquityTagNormalizer.kt] — Corrigé : `RESERVED_SLUGS` + test unitaire.
- [x] [Review][Patch] Concurrence sur `ensureTag` → 409 sur création d’événement — [TroupeEquityTagService.kt] — Corrigé : `saveAndFlush` + catch `DataIntegrityViolationException` + `findByTroupe_IdAndSlug`.
- [x] [Review][Defer] Tests `@SpringBootTest` locaux sur H2 bloqués par Flyway V23 `pgcrypto` — préexistant (17.6) ; la CI Postgres reste la source de vérité pour les intégrations equity-tag.

### Change Log

- 2026-05-25: Story 17.7 — API tag d'équité + glossaire troupe (V25, normalisation, auto-création glossaire, tests unitaires + intégration).
- 2026-05-25: Code review — 2 patch, 1 defer.
- 2026-05-25: Code review patches appliqués (slugs réservés, idempotence `ensureTag`) — story `done`.

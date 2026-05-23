# Story 3.4: Event types and required / optional roles

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **administrator**,  
I want to **configure spectacle types and required or optional role slots** when creating or editing an event,  
so that **availability and composition screens** (epics 5–6) follow troupe business rules (**FR14**, **UX-DR10**).

## Acceptance Criteria

1. **Given** an admin creates or edits a spectacle, **when** they pick an **event type** from the preset catalogue and optionally **customize role counts**, **then** `templateType` and per-role slot counts are **persisted in Postgres** and returned on all event list/detail API responses — **FR14**.
2. **Given** a saved event, **when** a member loads the season **Agenda** (story **3.3**), **then** each card shows the **correct type icon** (replacing the generic `celebration` placeholder) next to the title — **UX-DR2**.
3. **Given** an event with role slots, **when** downstream code reads the event, **then** roles with **count > 0** are **required slots** for composition; roles with **count = 0** are **absent** from this event (not offered for dispo/composition) — aligns V1 [`ROLE_TEMPLATES`](../../legacy/src/services/storage.js) semantics and [DOMAIN.md](../../DOMAIN.md) § Statistiques (local vs `deplacement`).
4. **Given** the admin changes the event type after customizing roles, **when** counts differ from the new template, **then** the UI shows a **confirmation** before overwriting (V1 parity [`EventModal.vue`](../../legacy/src/components/EventModal.vue)) — user can apply or keep current counts.
5. **Given** role count inputs, **when** the admin edits them, **then** each count is an **integer 0–20** (V1 max) and invalid values are rejected client-side and server-side.
6. **Given** events created before this story (migration), **when** listed, **then** they receive a **safe default** (`templateType = custom`, default role map matching V1 `custom` template or story 3.2 implicit defaults) without breaking list/agenda flows.
7. **Given** PATCH semantics from story **3.2**, **when** optional fields are updated, **then** `templateType` and `roleSlots` follow the same **JsonNullable** pattern: absent key = unchanged; explicit `null` on `roleSlots` = **400** (must be object); partial role map merges or replaces — **document the chosen rule in code** (recommendation: **full replace** of `roleSlots` on PATCH when key present, simpler and matches create body).
8. **Couverture:** **FR14** ; **UX-DR10** (admin spectacles — type + équipe in create/edit dialog) ; supports **FR16**, **FR19–FR21** (future) via stable API contract.

### Explicit placeholders (not blockers for 3.4 done)

- **Availability UI per role** — epic **5** ; expose data only.
- **Composition slots / draw** — epic **6** ; consume `roleSlots` + `templateType`.
- **Historique JEU sub-columns** — story **3.6** ; consume `templateType` for category mapping.
- **Troupe-level custom template library** (editable presets per troupe) — **out of scope** ; V1 uses **global presets** + per-event override — port that model.

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.2 (done)** | Event CRUD, pagination, `scope=upcoming\|all` — **no** type/roles |
| **3.3 (done)** | Agenda shell, generic type icon placeholder |
| **3.4 (this)** | `templateType` + `roleSlots` persistence, admin form, agenda type icons |
| **3.6 (ready-for-dev)** | Historique stats — needs `templateType` for JEU/DEPLAC. categories |
| **Epic 5** | Role-level availability when slots exist |
| **Epic 6** | One slot per role count, draw, validation |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Migration Flyway** `V7__event_types_and_role_slots.sql`:
  - Add `template_type VARCHAR(32) NOT NULL DEFAULT 'custom'`.
  - Add `role_slots TEXT NOT NULL DEFAULT '{}'` (JSON map via `RoleSlotsJsonConverter` — H2/Postgres compatible).
  - Backfill existing rows: `template_type = 'custom'`, `role_slots` = all-zero map.
- [x] **API domain:**
  - Extend [`EventEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt) with `templateType` + `roleSlots`.
  - Validation: `templateType` ∈ allowed enum ; each role key ∈ allowed set ; count ∈ [0, 20].
  - Extend [`EventDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt) + [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) create/update/list paths.
  - Register paths in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) if new routes (unlikely — extend existing event endpoints).
- [x] **OpenAPI:** extend [`openapi/events.yaml`](../../services/api/openapi/events.yaml) — `templateType`, `roleSlots` on Event / Create / Update schemas ; document enum values.
- [x] **Angular constants:** new `apps/web/src/app/core/events/event-types.ts` — port from V1:
  - `EVENT_TYPE_IDS`, `EVENT_TYPE_LABELS`, `EVENT_TYPE_ICONS`, `ROLE_KEYS`, `ROLE_LABELS`, `ROLE_TEMPLATES`, `TEMPLATE_DISPLAY_ORDER`.
  - Pure helpers: `applyTemplate(typeId)`, `detectTemplateFromRoles(slots)`, `rolesWithSlots(slots)`, `isDeplacementType(typeId)`, `jeuSubColumn(typeId)`.
- [x] **Extend [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts):**
  - MatSelect for type (icons + labels).
  - Read-only summary of non-zero roles ; **Personnaliser** expands numeric inputs (MatFormField type=number).
  - Template-change confirmation panel (apply / cancel).
  - Submit includes `templateType` + full `roleSlots` map on create and update.
- [x] **Agenda + detail:** replace generic icon in [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html) and [`event-detail-placeholder`](../../apps/web/src/app/pages/event-detail-placeholder/) with type glyph from `EVENT_TYPE_ICONS` (emoji acceptable for MVP — matches V1 ; optional MatIcon mapping later).
- [x] **Client API:** extend [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) types + bodies.
- [x] **Tests:**
  - API integration: create cabaret with expected slots ; invalid type/role/count → 400 ; list returns new fields ; migration default on old rows.
  - Unit: TS helpers (template apply, detect, jeu category).
  - Component: type select changes slots ; confirmation when customized.
  - Regression: `./gradlew test`, `ng test`, `ng build` ; existing `EventControllerIntegrationTest` + agenda tests green.

### Review Findings

- [x] [Review][Patch] Edit dialog ignores persisted `templateType` and infers type from slots [`apps/web/src/app/pages/season-home/event-form-dialog.ts:95`]
- [x] [Review][Patch] Corrupt `role_slots` JSON can crash event reads [`services/api/src/main/kotlin/com/hatcast/api/event/RoleSlotsJsonConverter.kt:18`]
- [x] [Review][Patch] No integration test for PATCH `templateType` / `roleSlots` [`services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`]
- [x] [Review][Defer] Seed events (V6) keep `custom`/zero slots — agenda icons stay ❓ for titled spectacles — deferred, migration scope only

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON: [architecture.md](../planning-artifacts/architecture.md) (camelCase DTOs, Flyway migrations, OpenAPI source of truth).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; mutations with `credentials: 'include'` + CSRF.
- UI admin surfaces: [ux-design — Admin functional scope](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope) — Material defaults OK for dialog (**UX-DR10**).
- Member-facing agenda mood: dark cards, type icon left of title ([ux-design — Season calendar](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar)).

### V1 reference model (port semantics, not Firestore)

| V1 field | V2 proposal | Notes |
|----------|-------------|-------|
| `templateType` | `templateType` (API camelCase) | e.g. `cabaret`, `match`, `deplacement` |
| `roles` | `roleSlots` | `{ "player": 5, "mc": 1, "dj": 1, … }` — counts only, not selected players |
| `playerCount` | **deprecated** | Derive from `roleSlots.player` if needed for compat |

**Allowed `templateType` values** (match V1 [`ROLE_TEMPLATES`](../../legacy/src/services/storage.js)):

`cabaret`, `longform`, `freeform`, `match`, `catch`, `deplacement`, `survey`, `custom`

**Display order** (dropdown): `TEMPLATE_DISPLAY_ORDER` from V1.

**Allowed role keys** (match V1 `ROLES`):

`player`, `volunteer`, `mc`, `dj`, `referee`, `assistant_referee`, `lighting`, `coach`, `stage_manager`

**Preset templates** — copy exact default counts from V1 `ROLE_TEMPLATES` (e.g. match: 5 player, 1 mc, 1 referee, 2 assistant_referee, 5 volunteer ; cabaret: 5 player, 1 mc, 1 dj ; deplacement: 5 player only).

**Icons** — V1 [`EVENT_TYPE_ICONS`](../../legacy/src/services/storage.js): emoji per type (⚔️ match, 🎪 cabaret, 🚌 deplacement, …).

### Downstream contract (implement helpers now)

Epics 5–6 and story 3.6 **must not re-derive** business rules ad hoc:

```typescript
// apps/web/src/app/core/events/event-types.ts (illustrative)
export function rolesRequiredForEvent(roleSlots: Record<string, number>): string[] {
  return ROLE_DISPLAY_ORDER.filter((k) => (roleSlots[k] ?? 0) > 0)
}

export function totalSlots(roleSlots: Record<string, number>): number {
  return Object.values(roleSlots).reduce((a, b) => a + b, 0)
}

export function jeuSubColumn(templateType: string): 'match' | 'cabaret' | 'longform' | 'autre' | null {
  if (templateType === 'deplacement') return null
  if (templateType === 'match') return 'match'
  if (templateType === 'cabaret') return 'cabaret'
  if (templateType === 'longform') return 'longform'
  if (['freeform', 'catch', 'custom', 'survey'].includes(templateType)) return 'autre'
  return 'autre'
}
```

Mirror equivalent helpers in Kotlin (`EventRoleSlots.kt` or extension on DTO) for API-side validation and future server aggregates.

### Database shape

```sql
-- Illustrative — adjust naming to project conventions
ALTER TABLE events
  ADD COLUMN template_type VARCHAR(32) NOT NULL DEFAULT 'custom',
  ADD COLUMN role_slots JSONB NOT NULL DEFAULT '{}';

-- Backfill example (application layer may be safer for complex default JSON)
UPDATE events SET role_slots = '{"player":0,"mc":0,"dj":0,...}'::jsonb WHERE role_slots = '{}'::jsonb;
```

**JSONB vs normalized table:** prefer **JSONB on `events`** for MVP — matches V1 document shape, fewer joins, adequate for troupe-scale data. Revisit if troupe-level template catalog arrives later.

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Event CRUD + PATCH JsonNullable | [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt), [`UpdateEventRequestDeserializer`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/) |
| Event form dialog (extend) | [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) |
| Agenda cards (icon hook) | [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html) |
| Event client | [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) |
| V1 modal UX reference | [`EventModal.vue`](../../legacy/src/components/EventModal.vue) |
| V1 constants | [`storage.js`](../../legacy/src/services/storage.js) — `ROLE_TEMPLATES`, `EVENT_TYPE_ICONS`, `ROLES` |
| Domain categories | [DOMAIN.md](../../DOMAIN.md) § Statistiques de composition |

### UI behaviour (event form — V1 parity)

1. **Type dropdown** — shows icon + label ; on change, if current slots differ from template defaults → **confirmation** before apply.
2. **Summary row** — compact list of roles with count > 0 (emoji + label + count).
3. **Personnaliser** — reveals grid of numeric inputs for all roles in `ROLE_DISPLAY_ORDER` ; optional “Plus de rôles” for low-priority roles (lighting, coach, stage_manager) acceptable.
4. **Create default** — preselect `cabaret` (first in V1 display order) or `custom` with zero slots — **pick one and document** ; recommend **`cabaret`** for faster admin flow (V1 create modal default).

### Migration / backward compatibility

- Existing events from story 3.2: set `templateType = 'custom'`, `roleSlots` all zeros OR soft default `{ player: 5, mc: 1, dj: 1, …}` — **prefer all-zero `custom`** to avoid inventing composition obligations on legacy rows ; agenda still works.
- Do **not** break `scope=upcoming`, pagination, archive, or season-home reload patterns from 3.3 review fixes.

### Security & permissions

- Same provisional admin rule as 3.2/3.3 until epic-2: authenticated seed troupe member can mutate events.
- Validate role keys server-side — reject unknown keys (prevent JSONB injection of arbitrary fields).

### Out of scope

- Troupe-editable template catalogue (CRUD templates in DB).
- Availability capture, cast, draw, historique grid computation.
- Event filter by type in agenda toolbar (optional nice-to-have — not required for AC).
- Replacing emoji with custom SVG assets.

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **API integration** | POST with each template type ; PATCH roleSlots ; invalid enum/count ; list/detail include fields |
| **Unit (Kotlin)** | Role slot validation, template enum parsing |
| **Unit (TS)** | Template apply/detect, `jeuSubColumn`, `rolesRequiredForEvent` |
| **Component** | Dialog: type change confirmation ; customize toggles ; submit payload |
| **Regression** | Agenda still renders ; event CRUD from 3.2 ; no API scope regression |

### Previous story intelligence

**From 3.3 (done):**
- Agenda uses `celebration` MatIcon as **explicit placeholder** — replace with type-aware display.
- Keep `Europe/Paris` grouping ; do not touch pagination cap logic unless event DTO size affects performance (negligible).
- Event form opened from agenda kebab + “Nouveau spectacle” — same dialog extension covers both entry points.
- Review lesson: route param changes must reload event state — when dialog saves new type/roles, parent should **refresh list** (existing pattern).

**From 3.2 (done):**
- Story explicitly deferred type/roles to 3.4 ; `V5__events` has no type columns — **this story adds V6 migration**.
- PATCH uses `JsonNullable` for optional clears — extend deserializer for `templateType` / `roleSlots`.
- `EventControllerIntegrationTest` is the integration test anchor — extend, do not duplicate.

### Git intelligence (recent commits)

- `01bb2ae` — season agenda shell ; icon placeholder at `season-agenda.html` line ~47.
- `b22a865` — event PATCH JsonNullable patterns ; reuse for new fields.
- `02f53db` — event API foundation ; extend same controller/service.

### Latest tech notes

- **Angular 19+** standalone components, signals — match `season-home` / dialog patterns.
- **Angular Material 19** — `mat-select` for type ; `mat-form-field` + `type="number"` for roles.
- **PostgreSQL JSONB** — supported by Neon ; Hibernate `@JdbcTypeCode(SqlTypes.JSON)` or `@Convert` for `Map<String, Int>`.
- **Kotlin 2.x / Spring Boot 3** — validate JSON body with Jakarta `@Valid` + custom validator for role maps.

### Project context reference

- [Epics — Story 3.4](../planning-artifacts/epics.md)
- [PRD — FR14](../planning-artifacts/prd.md)
- [UX V2 — Admin surfaces](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope)
- [UX V2 — Event detail type icon](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-infos-tab)
- [Story 3.2](./3-2-spectacles-dans-la-saison-et-liste-pour-les-membres.md)
- [Story 3.3](./3-3-vue-calendrier-agenda-saison-filtres-bascule-agenda-historique.md)
- [Story 3.6 dependency](./3-6-vue-historique-colonnes-roles-mois-export-masquage.md)
- [DOMAIN.md](../../DOMAIN.md)
- [SPEC.md](../../SPEC.md) — event type icon in full-screen header

## Dev Agent Record

### Agent Model Used

Cursor agent (bmad-dev-story, story 3.4)

### Debug Log References

_(aucun)_

### Completion Notes List

- **Migration V7:** `template_type` + `role_slots` (TEXT + `RoleSlotsJsonConverter` for H2/Postgres parity) ; backfill legacy events → `custom` + all-zero slots.
- **API:** `EventTypes`, `RoleTemplates`, validation 0–20 ; create defaults to `cabaret` template ; PATCH `roleSlots` = full replace when key present ; `null` → 400.
- **Web:** `event-types.ts` (V1 presets + helpers) ; `event-form-dialog` with type select, role summary/customize, template-change confirmation ; agenda + event detail show emoji type icons.
- **Tests:** `EventRoleSlotsTest`, extended `EventControllerIntegrationTest`, `event-types.spec.ts`, `event-form-dialog.spec.ts` ; `./gradlew test`, `ng test` (53), `ng build` OK.
- **Review fixes:** edit dialog charge `e.templateType` (parité V1) ; `RoleSlotsJsonConverter` tolère JSON invalide ; test PATCH + `RoleSlotsJsonConverterTest`.

### File List

- `services/api/src/main/resources/db/migration/V7__event_types_and_role_slots.sql`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/RoleSlotsJsonConverter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializer.kt`
- `services/api/openapi/events.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventRoleSlotsTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializerTest.kt`
- `apps/web/src/app/core/events/event-types.ts`
- `apps/web/src/app/core/events/event-types.spec.ts`
- `apps/web/src/app/core/events/event-api.service.ts`
- `apps/web/src/app/core/events/event-api.service.spec.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.html`
- `apps/web/src/app/pages/season-home/event-form-dialog.scss`
- `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts`
- `apps/web/src/app/pages/season-home/season-agenda.ts`
- `apps/web/src/app/pages/season-home/season-agenda.html`
- `apps/web/src/app/pages/season-home/season-agenda.spec.ts`
- `apps/web/src/app/pages/season-home/season-events.utils.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.html`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts`
- `services/api/src/test/kotlin/com/hatcast/api/event/RoleSlotsJsonConverterTest.kt`
- `_bmad-output/implementation-artifacts/deferred-work.md`

- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-23 : Story 3.4 — types d’événement + rôles requis/optionnels (API, formulaire admin, icônes agenda) ; story en **review**.
- 2026-05-23 : Code review — 3 patch appliqués ; story **done**.

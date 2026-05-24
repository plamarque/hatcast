# Story 6.1: Composition lifecycle states and UI consistency

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **authorized user** (troupe member with season access),  
I want to **see a consistent composition lifecycle state** on each spectacle (preparing, draft, awaiting confirmations, gaps to fill, complete),  
so that **I understand where the team-building process stands** (**FR28**, **UX-DR4**).

## Acceptance Criteria

1. **Given** a spectacle in a season I can access, **when** the API returns event data, **then** each event includes a canonical **`compositionLifecycle`** value among: `preparing`, `draftComposition`, `awaitingConfirmations`, `gapsToFill`, `complete` — **FR28**.
2. **Given** lifecycle computation rules (see Dev Notes), **when** no composition row or slot assignments exist for the event, **then** `compositionLifecycle` is **`preparing`**.
3. **Given** a composition with at least one slot assignment and **`validatedAt` is null**, **when** lifecycle is computed, **then** state is **`draftComposition`**.
4. **Given** a composition with **`validatedAt` set**, no empty required slots, and not every filled slot has participation **`confirmed`**, **when** lifecycle is computed, **then** state is **`awaitingConfirmations`**.
5. **Given** a validated composition with **at least one empty required slot** (after decline or withdrawal), **when** lifecycle is computed, **then** state is **`gapsToFill`** — priority over `awaitingConfirmations` when both could apply.
6. **Given** a validated composition where **every filled required slot** has participation **`confirmed`** OR an organizer **waived** the slot (future stories may add explicit waive; for 6.1 document waiver as admin-only flag on slot row if implemented), **when** lifecycle is computed, **then** state is **`complete`**.
7. **Given** the **Agenda** on `/saison/:slug`, **when** events load for an authenticated member, **then** each card’s **composition badge** shows a **simplified team status label** derived from lifecycle (not an empty placeholder): **Collecte des dispos** / **Équipe en préparation** / **Équipe confirmée** with semantic colours (cyan / orange / green) — **UX-DR4**, story **3.3** placeholder replaced.
8. **Given** event detail at `/saison/:slug/event/:eventId`, **when** the user views the **Infos** area (placeholder shell today; tab bar from **5.3** / **6.2** later), **then** a **status row** displays the same simplified badge + optional short hint consistent with lifecycle — **UX-DR4**.
9. **Given** a **regular member** and a composition in **`draftComposition`** that is **not published** (story **6.3** rule), **when** they fetch event lifecycle, **then** API returns **`preparing`** for display purposes (draft hidden) OR omits draft-specific UI until publish — align with **FR22** default; **6.3** owns publish action but **6.1** must not leak draft assignments in labels.
10. **Given** an **organizer or administrator** who **`canManageComposition`**, **when** a draft exists unpublished, **then** simplified badge may show **Équipe en préparation** (not “Collecte”) even if members still see **Collecte** — document chosen rule in tests; minimum: organizers see **`draftComposition`** mapped to **preparing** badge until **6.3** publish flag exists.
11. **Given** list and detail endpoints, **when** an unauthenticated or non-member caller requests events, **then** lifecycle fields are **omitted** or request returns **403** (same gate as season event list today) — **NFR-S2**.
12. **Couverture:** **FR28** ; **UX-DR4** ; **NFR-Q1** — at least one automated API test per lifecycle transition path ; **NFR-P2** — lifecycle computed in SQL/service layer without N+1 per event on list.

### Explicit out of scope (later stories — do not implement in 6.1)

| Story | Deferred capability |
|-------|---------------------|
| **6.2** | Full three-tab event detail shell, canonical header chrome, kebab menu actions |
| **6.3** | Draft publish action, `publishedAt`, member visibility rules for slot assignments |
| **6.4** | Weighted draw, animation, odds display |
| **6.5** | Manual slot assignment UI |
| **6.6** | Validate / unlock actions (may stub `validatedAt` via migration seed or test fixtures only) |
| **6.7–6.9** | Member confirm/decline, proxy, gap-fill actions |
| **6.10** | Share & announce modal |
| **Équipe tab** | Six-state detailed badge (`À composer`, `Confirmations en cours`, etc.) — port [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) in **6.2+** / **6.6** when slots UI exists |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.3 (done)** | Agenda cards with **empty** composition badge placeholder |
| **3.4 (done)** | `roleSlots` on events — required for slot counts |
| **3.5 (done)** | `OrganizerAccessService.canManageComposition` |
| **3.8 (done)** | Participant rosters — slot assignees reference `season_participants` / `event_participants` |
| **5.1–5.2 (done/in-progress)** | Availability — **`preparing`** phase semantics |
| **5.3 (in-progress)** | Event Dispos tab + minimal tab bar on placeholder |
| **6.1 (this)** | FR28 lifecycle model, persistence skeleton, API enrichment, agenda + Infos badges |
| **6.3+** | Mutations that transition lifecycle states |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Flyway** `V18__event_composition_lifecycle.sql` (V17 reserved for Malice seed):
  - Table **`event_compositions`**: `event_id UUID PK REFERENCES events(id) ON DELETE CASCADE`, `validated_at TIMESTAMPTZ NULL`, `published_at TIMESTAMPTZ NULL` (for **6.3**), `created_at`, `updated_at`.
  - Table **`event_composition_slots`**: `id UUID PK`, `event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE`, `role_key VARCHAR(64) NOT NULL`, `slot_index INT NOT NULL`, `participant_id UUID NULL REFERENCES season_participants(id)` (nullable until assigned), `participation_status VARCHAR(16) NOT NULL DEFAULT 'PENDING'` CHECK IN (`PENDING`, `CONFIRMED`, `DECLINED`), `waived BOOLEAN NOT NULL DEFAULT FALSE`, `created_at`, `updated_at`; unique `(event_id, role_key, slot_index)`.
  - Index `idx_composition_slots_event` on `(event_id)`.
  - **No backfill** — empty tables mean all events stay `preparing` until later stories write slots.
- [x] **Domain package** `com.hatcast.api.composition`:
  - `CompositionLifecycle` enum: `PREPARING`, `DRAFT_COMPOSITION`, `AWAITING_CONFIRMATIONS`, `GAPS_TO_FILL`, `COMPLETE`.
  - `EventCompositionEntity`, `EventCompositionSlotEntity`, repositories.
  - **`CompositionLifecycleService`**: pure function `computeLifecycle(composition, slots, roleSlots, viewerCanSeeDraft: Boolean): CompositionLifecycle` — evaluation order:
    1. No composition row OR zero assigned slots → `PREPARING`
    2. `validatedAt == null` → `DRAFT_COMPOSITION` (if viewer cannot see draft → treat as `PREPARING` for DTO mapping)
    3. Any required slot empty (count slots with assignee vs `roleSlots`) → `GAPS_TO_FILL`
    4. All filled slots `CONFIRMED` or `waived` → `COMPLETE`
    5. Else → `AWAITING_CONFIRMATIONS`
  - **`TeamStatusBadge`** mapper for UI: port V1 [`mapToSimplifiedStatus`](../../legacy/src/services/eventStatusService.js):
    - `preparing` (+ hidden draft for members) → **Collecte des dispos** (`collecting`)
    - `draftComposition`, `awaitingConfirmations`, `gapsToFill` → **Équipe en préparation** (`preparing`)
    - `complete` → **Équipe confirmée** (`confirmed`)
  - Batch loader `loadLifecycleByEventIds(ids, principal)` for list endpoint — **no N+1**.
- [x] **API enrichment:**
  - Extend [`EventResponseDto`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt) with optional `compositionLifecycle: String?` and `teamStatusBadge: { key, label, tone }?` (`tone` = `collecting | preparing | confirmed` for SCSS).
  - Wire in [`EventService.listEvents`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) and add `GET /v1/seasons/{seasonId}/events/{eventId}` if missing (detail uses same DTO).
  - Optional dedicated read `GET .../composition/lifecycle` returning full FR28 enum + `teamStatusBadge` — only if detail needs refresh without full event PUT; prefer event DTO fields for MVP.
  - Register routes in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt).
- [x] **OpenAPI:** extended [`openapi/events.yaml`](../../services/api/openapi/events.yaml) — enums, `TeamStatusBadge`, `GET` detail.
- [x] **Angular:**
  - `apps/web/src/app/core/composition/composition-lifecycle.ts` — types + `teamStatusBadgeLabel`, `teamStatusBadgeModifier` (mirror [`availability-status.ts`](../../apps/web/src/app/core/availability/availability-status.ts) pattern).
  - Extend [`EventResponse`](../../apps/web/src/app/core/events/event-api.service.ts) interface.
  - **Agenda:** replace empty badge in [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html) lines 56–58 with dynamic label + SCSS modifiers in [`season-agenda.scss`](../../apps/web/src/app/pages/season-home/season-agenda.scss) (`--collecting`, `--preparing`, `--confirmed`).
  - **Event detail:** add status row to [`event-detail-placeholder.html`](../../apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.html) above main content; if **5.3** tab bar lands first, place badge inside **Infos** tab panel — same component `composition-status-badge`.
  - Shared presentational component `composition-status-badge` (inputs: `badge` DTO) for reuse agenda + detail.
- [x] **Test fixtures (integration tests only):**
  - Helper to insert composition + slots with varied `validated_at` / `participation_status` — **do not** expose public admin mutation API in 6.1 unless needed for QA; tests seed via `@Sql` or repository in test profile.
  - Cover all five FR28 paths + member vs organizer draft visibility (AC 9–10).
- [x] **Tests:**
  - Unit: `CompositionLifecycleService` table-driven (≥ 8 cases including priority `gapsToFill` over `awaitingConfirmations`).
  - API integration: list events includes badges for member ; draft hidden for non-org ; complete path ; 403 outsider.
  - Component: agenda renders badge text/colour ; detail Infos row visible.
  - **NFR-Q1:** one integration test tagged to FR28 path.
  - Regression: `./gradlew test`, `ng test`, `ng build`.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON camelCase: [architecture.md](../planning-artifacts/architecture.md).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; reads with session cookie.
- Authorization: lifecycle is **not secret metadata** for troupe members (badge is visible on agenda in V1), but **draft slot assignees** must not leak until **6.3** — 6.1 only exposes aggregate lifecycle, not slot names.
- UI mood: [ux-design — Infos status row](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-infos-tab) ; reference [`event-detail-infos-tab-v1.png`](../planning-artifacts/ux-references/event-detail-infos-tab-v1.png).
- **Two concepts — do not conflate:**
  - **FR28 structural lifecycle** (API `compositionLifecycle`) — five states for product logic and notifications (**6.6**, **8.3**).
  - **Simplified team badge** (UI `teamStatusBadge`) — three labels on Agenda/Infos per V1 [`eventStatusService.js`](../../legacy/src/services/eventStatusService.js) and UX-DR4 orange/green (+ cyan collecte).

### FR28 ↔ simplified badge mapping

| `compositionLifecycle` (API) | `teamStatusBadge.key` | Label (FR) |
|-----------------------------|----------------------|------------|
| `preparing` | `collecting` | Collecte des dispos |
| `draftComposition` | `preparing` | Équipe en préparation |
| `awaitingConfirmations` | `preparing` | Équipe en préparation |
| `gapsToFill` | `preparing` | Équipe en préparation |
| `complete` | `confirmed` | Équipe confirmée |

Short labels for narrow agenda: **Collecte** / **Préparation** / **Confirmé** — port [`getShortStatusLabel`](../../legacy/src/services/eventStatusService.js).

### Équipe tab six-state model (reference only — not 6.1 UI)

When **6.2+** implements Équipe tab, port evaluation order from [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md) and [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) `compositionStatus` computed. **6.1** only ensures API lifecycle stays consistent with that future mapping.

### V1 cast shape (persistence reference)

Firestore `seasons/{id}/casts/{eventId}` fields used by V1 (port to Postgres gradually):

| V1 field | V2 (6.1 skeleton) |
|----------|-------------------|
| `roles` (role → player ids) | `event_composition_slots.participant_id` per `(role_key, slot_index)` |
| `confirmed` (organizer validated) | `event_compositions.validated_at IS NOT NULL` |
| `playerStatuses` (pending/confirmed/declined) | `event_composition_slots.participation_status` |
| `confirmedByAllPlayers` | derived: lifecycle `COMPLETE` |
| Draft visibility | `published_at` (**6.3**) |

### Slot count vs roleSlots

Required slot count = sum of [`EventEntity.roleSlots`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt) values. **Empty slot** = required index exists but no row with assignee OR row with null `participant_id`. Seed slots lazily in **6.4/6.5** or create rows on first draw — **6.1** tests insert rows explicitly.

### Permissions

Reuse [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) for `viewerCanSeeDraft` until `published_at` logic in **6.3**.

### Coordination with story 5.3

If **5.3** merges first with tab bar on `event-detail-placeholder`, mount `composition-status-badge` in **Infos** tab content only. If **6.1** lands first, add status row above placeholder copy; **5.3** should extract badge into Infos tab without duplicating logic.

### Project structure notes

```
services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionLifecycle.kt
  CompositionLifecycleService.kt
  EventCompositionEntity.kt
  EventCompositionSlotEntity.kt
  EventCompositionRepository.kt
  EventCompositionSlotRepository.kt

apps/web/src/app/core/composition/
  composition-lifecycle.ts
apps/web/src/app/shared/composition/
  composition-status-badge.ts (+ html/scss)
```

### References

- [epics.md — Story 6.1](../planning-artifacts/epics.md) ; Epic 6 overview (**FR20–FR28**)
- [prd.md — FR28](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Composition lifecycle vs team status](../planning-artifacts/ux-design-hatcast-v2.md#composition-lifecycle-status)
- [SPEC.md — Composition status messages](../../SPEC.md) (Équipe tab — future)
- [DOMAIN.md — Cast status values](../../DOMAIN.md)
- Story **3.3** — agenda badge placeholder
- Story **3.5** — organizer permissions
- Story **5.1** — badge modifier pattern in [`availability-status.ts`](../../apps/web/src/app/core/availability/availability-status.ts)

## Dev Agent Record

### Agent Model Used

Composer (dev-story 6-1)

### Debug Log References

- Migration numbered **V18** (V17 already used by Malice seed).
- H2 tests require `TIMESTAMP` (not `TIMESTAMPTZ`) and valid `season_participants` FK for slot seeds.

### Completion Notes List

- FR28 lifecycle computed in `CompositionLifecycleService` with batch enrichment on event list/detail (no N+1).
- Draft `draftComposition` masked as `preparing` for regular members; organizers/admins see real lifecycle (AC 9–10).
- Agenda + Infos tab show `teamStatusBadge` via shared `composition-status-badge` (cyan/orange/green).
- Added `GET /v1/seasons/{seasonId}/events/{eventId}`; event detail uses it instead of paginated list scan.

### File List

- services/api/src/main/resources/db/migration/V18__event_composition_lifecycle.sql
- services/api/src/main/kotlin/com/hatcast/api/composition/*.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt
- services/api/openapi/events.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/*.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- apps/web/src/app/core/composition/composition-lifecycle.ts
- apps/web/src/app/core/composition/composition-status-hint.ts
- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/shared/composition/composition-status-badge.*
- apps/web/src/app/pages/season-home/season-agenda.*
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.*

### Change Log

- 2026-05-24: Story 6.1 — composition lifecycle API + agenda/Infos badges (FR28, UX-DR4).
- 2026-05-24: Code review — patchs appliqués (DECLINED→gapsToFill, tests AC 11/12, hint Infos).

### Review Findings

- [x] [Review][Patch] Tests d'intégration API manquants pour `awaitingConfirmations` et `gapsToFill` — AC 12 exige au moins un test automatisé par chemin de transition FR28 ; seuls `preparing`, `draftComposition` (masqué/visible) et `complete` sont couverts en intégration. [CompositionLifecycleIntegrationTest.kt]
- [x] [Review][Patch] Pas de test 403 pour un utilisateur authentifié hors troupe — AC 11 : seul le cas non authentifié (401) est testé ; ajouter un membre d'une autre troupe sur GET list et GET detail. [CompositionLifecycleIntegrationTest.kt]
- [x] [Review][Patch] Slot `DECLINED` avec `participantId` non null compte comme rempli — peut produire `awaitingConfirmations` au lieu de `gapsToFill` (AC 5) ; traiter `participationStatus == DECLINED` comme slot vide dans `hasEmptyRequiredSlot` / `allRequiredSlotsComplete`. [CompositionLifecycleService.kt:61-81]
- [x] [Review][Patch] AC 10 : visibilité brouillon testée uniquement via troupe admin — ajouter un test avec organisateur d'événement (non admin) voyant `draftComposition`. [CompositionLifecycleIntegrationTest.kt]
- [x] [Review][Patch] Hint Infos non couvert par test composant — le test detail vérifie le badge mais pas `compositionStatusHint` pour `awaitingConfirmations` / `gapsToFill`. [event-detail-placeholder.spec.ts]
- [x] [Review][Defer] Réponses POST/PATCH event sans enrichment lifecycle — les endpoints mutation renvoient `compositionLifecycle`/`teamStatusBadge` null ; acceptable pour 6.1 (rechargement via list/detail). [EventService.kt:123,204] — deferred, pre-existing pattern for mutation DTOs

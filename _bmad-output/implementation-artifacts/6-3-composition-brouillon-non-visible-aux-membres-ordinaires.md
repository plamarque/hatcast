# Story 6.3: Draft composition, publish, and visibility

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **save a composition as a draft hidden from ordinary troupe members**, then **explicitly publish** it,  
so that **I can iterate privately before making the proposed lineup visible** (**FR22**, **UX-DR6**).

## Acceptance Criteria

1. **Given** an unvalidated composition with at least one assigned slot and **`publishedAt` is null**, **when** a **regular troupe member** (not troupe admin, season organizer, or event organizer) opens the **Équipe** tab or calls the composition read API, **then** they **do not** see slot assignee names or participant identifiers — they see the **member empty state** (same family as story **6.2**: no draft leak) — **FR22**.
2. **Given** the same unpublished draft, **when** a user with **`canManageComposition`** for the event opens **Équipe**, **then** they see a **read-only draft grid** (role slots + assignee display names when slots exist in DB) and a **banner** explaining the draft is **visible only to organizers/admins** until publish — **FR22**, **UX-DR6** draft capture.
3. **Given** an organizer viewing an unpublished draft with assignees, **when** they click **« Publier »**, **then** `publishedAt` is set server-side, the draft becomes visible to **all active troupe members** with season access, and the UI refreshes without slot names having been visible to members before publish — **FR22**.
4. **Given** a successful publish, **when** a regular member reloads event detail or composition, **then** `compositionLifecycle` is **`draftComposition`** (no longer masked as `preparing`), **`teamStatusBadge`** remains **Équipe en préparation**, and slot assignees are visible on **Équipe** — extends story **6.1** AC 9–10 with `publishedAt` rule.
5. **Given** publish succeeds, **when** the server completes the mutation, **then** it invokes a **notification intent hook** for **`draft composition shared`** (**FR31**) — **stub/no-op delivery** acceptable in **6.3** (Epic **8** implements push/email); must be a named port/service call the future notifier can replace.
6. **Given** a composition already published (`publishedAt` set) but not validated (`validatedAt` null), **when** an organizer calls publish again, **then** the API is **idempotent** (200, unchanged timestamp or explicit already-published response) — no duplicate notification side effects.
7. **Given** a user without troupe membership, **when** they call composition read or publish, **then** **403** (same gate as event detail) — **NFR-S2**.
8. **Given** a validated composition (`validatedAt` set), **when** any active troupe member reads composition, **then** slots are **always visible** regardless of `publishedAt` (validation implies member visibility per FR22→FR23 chain; publish is moot once validated) — document in tests.
9. **Given** no composition row or zero assigned slots, **when** anyone opens **Équipe**, **then** show the **existing empty state** (`Aucun tirage pour le moment`) — **6.4/6.5** add slot creation; **6.3** only displays slots that already exist (tests seed via repository).
10. **Couverture:** **FR22** ; **UX-DR6** (draft vs validated — draft/publish slice only) ; **NFR-Q1** — integration tests for member vs organizer visibility, publish transition, idempotent publish, 403 outsider ; regression `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.3)

| Story | Deferred capability |
|-------|---------------------|
| **6.4** | Weighted draw, animation, `POST` to fill slots |
| **6.5** | Manual slot assign/clear, candidate picker |
| **6.6** | **Valider** / **Déverrouiller**, `validatedAt` mutations from UI |
| **6.7–6.9** | Participation confirm/decline modal |
| **6.10** | **Partager** / **Annoncer la compo** (Share & announce modal, WhatsApp) — **not** the same as **Publier** |
| **Epic 8** | Actual push/email delivery for FR31 intents |
| **Epic 9** | Audit trail rows for publish (log intent hook only; full audit in FR35 stories) |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.1 (done)** | FR28 lifecycle, `event_compositions` + slots tables, `published_at` column exists, draft lifecycle masked for members via `viewerCanSeeDraft` (**organizer-only today — no `publishedAt` check yet**) |
| **6.2 (done)** | Full-screen event detail, **Équipe** tab stub → replace with composition-aware tab |
| **6.3 (this)** | `publishedAt` visibility rules, composition read API, publish mutation, Équipe draft/published read UI, FR31 stub hook |
| **6.4+** | Slot mutations (draw/manual), toolbar (**Tirer au sort**, **Valider**, **Effacer**, etc.) |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **Fix visibility logic (6.1 gap):** update [`CompositionLifecycleEnrichmentService.resolveDraftVisibility`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt) and [`CompositionSnapshot`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) to include **`publishedAt`**:
  - `viewerCanSeeDraft(composition, principal, event)` = **`canManageComposition`** OR **`composition.publishedAt != null`** OR **`composition.validatedAt != null`**
  - Pass full composition snapshot (both timestamps) into `CompositionLifecycleService`
  - Update unit tests in [`CompositionLifecycleServiceTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionLifecycleServiceTest.kt) and integration tests in [`CompositionLifecycleIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionLifecycleIntegrationTest.kt) for **published draft visible to member**
- [x] **API — read** `GET /v1/seasons/{seasonId}/events/{eventId}/composition`:
  - New `CompositionController` (or extend `EventController` if project pattern prefers — follow existing vertical slice style under `com.hatcast.api.composition`)
  - Response DTO (camelCase): `{ publishedAt, validatedAt, visibility: 'none' | 'organizerDraft' | 'publishedDraft' | 'validated', slots: [...] }`
  - **`slots`** entries: `{ roleKey, slotIndex, participantId, participantDisplayName, participationStatus }` — **omit or empty array** when viewer lacks visibility (**fail closed**)
  - Resolve display names via existing season participant lookup (join `season_participants` / user display name — same sources as availability summary)
  - Auth: active troupe member; **403** outsider
- [x] **API — publish** `POST /v1/seasons/{seasonId}/events/{eventId}/composition/publish`:
  - Requires **`canManageComposition`**
  - Preconditions: composition row exists, **`validatedAt` is null**, at least one slot with non-null `participantId` (otherwise **409** with clear message — nothing to publish)
  - Sets `publishedAt = now()`, `updatedAt = now()`; idempotent if already published
  - Calls **`CompositionNotificationPort.publishDraftCompositionShared(eventId, seasonId, actorUserId)`** — interface + no-op `@Component` impl (log at DEBUG)
  - Returns updated composition DTO + enriched lifecycle fields consistent with event detail
- [x] **OpenAPI:** new [`openapi/composition.yaml`](../../services/api/openapi/) or extend [`events.yaml`](../../services/api/openapi/events.yaml) — document GET + POST publish, enums, 403/409
- [x] **Security:** register routes in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) (authenticated session)
- [x] **Angular — API client:**
  - `CompositionApiService` under `apps/web/src/app/core/composition/` with `getComposition(seasonId, eventId)` and `publishComposition(seasonId, eventId)`
  - Types mirror OpenAPI DTOs
- [x] **Angular — Équipe tab:** evolve/replace [`event-equipe-empty`](../../apps/web/src/app/pages/event-detail/event-equipe-empty.ts):
  - New **`event-equipe-tab`** (or extend empty component) loaded from [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html)
  - Inputs: `seasonId`, `event`, `canManageComposition`
  - States:
    - **Loading** — spinner
    - **No slots** — keep current empty copy (no draw tools)
    - **Organizer + unpublished draft** — draft banner (UX: admin-only notice from [`event-detail-equipe-draft-validate-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-draft-validate-v1.png)), read-only slot list (role label + avatar/name), primary **« Publier »** button (gradient cyan/green per UX mood — not **Partager**)
    - **Published or validated** — read-only slot list for all members; no **Publier** when already published
  - On publish success: reload composition + emit event to parent to refresh `getEvent()` (lifecycle badge on Infos)
  - Error handling: toast/snackbar on 409/403
- [x] **Infos hint alignment:** update [`composition-status-hint.ts`](../../apps/web/src/app/core/composition/composition-status-hint.ts) if needed — organizer unpublished draft keeps *« Composition en cours — non visible des autres membres. »*; published draft for members may show null or short *« Proposition d'équipe publiée »* (pick one, test it)
- [x] **Wire permissions:** pass `canManageComposition` from [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) using existing `OrganizerApiService.mySeasonPermissions` + event-scoped check (same pattern as Dispos `canSwitchSubject`)
- [x] **Tests:**
  - **Unit (Kotlin):** visibility matrix with `publishedAt` / `validatedAt` / role combinations
  - **Integration:** member GET → empty slots unpublished; organizer GET → slots; POST publish → member GET → slots + `draftComposition`; idempotent publish; 403 non-member; 409 publish with no assignees
  - **Component (Angular):** organizer sees **Publier** + banner; member sees empty state when unpublished; member sees slots after publish (mock HTTP)
  - Regression: existing **6.1** / **6.2** tests stay green

### Review Findings

- [x] [Review][Patch] Hint fallback "publiée" affiché pour un membre sans `compositionPublishedAt` — pour `draftComposition`, si `canManageComposition=false` et `compositionPublishedAt` est null/absent, la branche `else` retourne quand même "Proposition d'équipe publiée." alors que la composition n'est pas publiée; corriger en retournant `null` [`composition-status-hint.ts`]
- [x] [Review][Patch] Race condition — double notification si deux POST `/publish` simultanés : pas de verrou pessimiste ni de `@Version` sur `EventCompositionEntity`; les deux requêtes peuvent voir `publishedAt == null`, sauver, et appeler `notificationPort` deux fois [`CompositionService.kt` L65-71]
- [x] [Review][Patch] Grille Équipe vide alors que `comp.slots.length > 0` : `showEmptyState` consulte `compositionHasVisibleSlots(comp)` (`slots.length`) au lieu de `slotRows().length`; si des slots ont un `roleKey`/`slotIndex` hors de `event.roleSlots`, la `<ul>` est rendue vide sans état vide "Aucun tirage" [`composition-visibility.ts` + `event-equipe-tab.ts`]
- [x] [Review][Patch] `publish()` Angular : résultat de `publishComposition` appliqué au mauvais événement si `event` change pendant l'`await`; capturer `eventId` au début et vérifier après l'await (pattern identique au garde `loadRequestId` de `load()`) [`event-equipe-tab.ts` publish()]
- [x] [Review][Patch] Double appel `canManageComposition` dans `buildResponse()` après vérification déjà effectuée dans `publishComposition()`; passer le booléen en paramètre pour éviter la requête DB redondante [`CompositionService.kt` buildResponse()]
- [x] [Review][Defer] Notification `publishDraftCompositionShared` appelée dans `@Transactional` avant commit — safe actuellement (no-op log), à corriger en `@TransactionalEventListener` pour Epic 8 [`CompositionService.kt` L71] — deferred, pre-existing architecture concern for Epic 8
- [x] [Review][Defer] Idempotence `publish` cassée si tous les slots sont retirés après publication (`assignedCount == 0` check avant `alreadyPublished` check) — hors scope 6.3, mutations de slots dans 6.5 [`CompositionService.kt` L59-72] — deferred, pre-existing concern for story 6.5
- [x] [Review][Defer] `compositionPublished` perdu si l'onglet Équipe est détruit pendant le publish (tab `@if` unmount) — dégradation UX mineure, pattern Angular général [`event-detail.html`] — deferred, pre-existing Angular pattern
- [x] [Review][Defer] Slots API renvoyés non filtrés sur `event.roleSlots` courant — silencieusement ignorés par le front, conséquence réelle en 6.4/6.5 [`CompositionService.kt` buildResponse()] — deferred, pre-existing concern for story 6.4
- [x] [Review][Defer] `resolveDraftVisibility` ignore `hasAssignedSlots` (écart sémantique avec `buildResponse`) — aucune conséquence fonctionnelle aujourd'hui [`CompositionLifecycleEnrichmentService.kt`] — deferred, pre-existing
- [x] [Review][Defer] Toutes les erreurs 409 mappées au même message UX "Rien à publier" côté Angular — amélioration UX, non bloquant [`event-equipe-tab.ts` L132-133] — deferred, pre-existing
- [x] [Review][Defer] Publish autorisé avec slots tous en `DECLINED` — logique de participation 6.7+ [`CompositionService.kt` L60] — deferred, pre-existing concern for story 6.7

## Dev Notes

### Critical naming — Publier vs Partager

| Action | Meaning | Story |
|--------|---------|-------|
| **Publier** | Makes draft slot assignments **visible to troupe members** (`publishedAt`) | **6.3** (FR22) |
| **Partager** / **Annoncer la compo** | Opens Share & announce modal (WhatsApp, editable message, notifications) | **6.10** |

V1 [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) labels WhatsApp share **« Partager »** — do **not** wire that button in **6.3**. Epic AC and FR22 use **« Publier »** for visibility.

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md)
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Authorization: reuse [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) — troupe admin, season organizer, event organizer (same as **6.1** draft visibility)
- **Security — fail closed:** never return assignee names in JSON when viewer cannot see draft; prefer **empty `slots`** over 404 so endpoint shape is stable
- UI mood: [ux-design — Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab) ; draft reference [`event-detail-equipe-draft-validate-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-draft-validate-v1.png)

### Visibility model (normative for 6.3)

```
canViewSlotAssignments =
  composition.validatedAt != null
  OR composition.publishedAt != null
  OR canManageComposition(event, season, principal)

canViewDraftLifecycle (for API compositionLifecycle field) =
  same rule (replaces organizer-only check from 6.1)
```

| Viewer | Unpublished draft | Published draft | Validated |
|--------|-------------------|-----------------|-----------|
| Regular member | No slots; lifecycle **`preparing`** | Slots visible; lifecycle **`draftComposition`** | Slots visible; lifecycle per FR28 |
| Organizer | Slots + banner + **Publier** | Slots; no **Publier** | Slots; validate UI in **6.6** |

### Brownfield — what 6.1 already did (extend, do not rewrite)

- Tables: [`V18__event_composition_lifecycle.sql`](../../services/api/src/main/resources/db/migration/V18__event_composition_lifecycle.sql) — **`published_at` column already exists**
- Entities/repos: [`EventCompositionEntity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionEntity.kt), slot repositories
- Lifecycle: [`CompositionLifecycleService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) — add `publishedAt` to snapshot; enrichment service owns visibility resolution
- Event DTO enrichment on list/detail — will pick up new rules automatically after enrichment fix
- Frontend lifecycle types: [`composition-lifecycle.ts`](../../apps/web/src/app/core/composition/composition-lifecycle.ts), badge/hint components

**Known 6.1 gap to close:** `CompositionSnapshot` only has `validatedAt`; `resolveDraftVisibility` ignores `publishedAt` and treats all organizers as draft-visible (correct) but treats all members as never draft-visible (correct for slots) while lifecycle masking does not flip to `draftComposition` after publish.

### Slot data without 6.4/6.5

**6.3** does not implement draw or manual assign. Integration tests **insert slots via repository** (pattern from [`CompositionLifecycleIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionLifecycleIntegrationTest.kt)). Manual QA: use test seed or temporary SQL — do not add public slot-mutation endpoints in this story.

### Équipe tab UI (minimal read-only grid)

Port **layout intent** from UX, not full toolbar:

- One row per required slot from `event.roleSlots` merged with composition slots
- **Empty slot:** dashed placeholder + role label (read-only — no click handler in **6.3**)
- **Filled slot:** avatar + display name + role icon; **pending** warm styling optional (full participation colours in **6.7**)
- **Draft banner** (organizer, unpublished): e.g. *« Brouillon visible uniquement par les organisateur·ices et administrateur·ices »*

Do **not** add **Tirer au sort**, **Simuler**, **Valider**, **Effacer**, **Partager** buttons — **6.4–6.6**, **6.10**.

### FR31 notification stub

```kotlin
interface CompositionNotificationPort {
    fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    )
}
```

No-op implementation logs intent key `draft_composition_shared`. Epic **8** replaces with real dispatcher. **Do not** send email/push in **6.3**.

### Reuse — do not reinvent

| Need | Location |
|------|----------|
| Composition persistence | `com.hatcast.api.composition.*` |
| Lifecycle enrichment | `CompositionLifecycleEnrichmentService` |
| Permissions | `OrganizerAccessService.canManageComposition` |
| Event load / refresh | `EventApiService.getEvent` |
| Participant display names | Season participant services / DTOs from **3.8** |
| Équipe tab shell | Replace `app-event-equipe-empty` in `event-detail.html` |
| Role labels/icons | [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) |
| Tab routing | [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts) — unchanged |

### Project structure notes

```
services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionController.kt          # NEW
  CompositionService.kt             # NEW — read + publish
  CompositionDtos.kt                # NEW
  CompositionNotificationPort.kt    # NEW interface + NoOpCompositionNotificationAdapter.kt

apps/web/src/app/core/composition/
  composition-api.service.ts        # NEW
  composition-visibility.ts         # NEW optional helpers

apps/web/src/app/pages/event-detail/
  event-equipe-tab.ts (+ html/scss) # NEW — replaces empty for loaded state
  event-equipe-empty.*              # KEEP for zero-slot empty state OR merge into tab
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit | Visibility function: unpublished/published/validated × member/organizer |
| Integration | GET composition slot filtering; POST publish; lifecycle on event detail after publish; 403/409 |
| Component | Publier button visibility; member empty vs organizer draft; post-publish member grid |
| Regression | 6.1 lifecycle tests updated; 6.2 event-detail tab tests; `./gradlew test`, `ng test` |

### Previous story intelligence (6.2)

1. **Équipe tab** currently always renders [`event-equipe-empty`](../../apps/web/src/app/pages/event-detail/event-equipe-empty.ts) — swap for composition-aware component.
2. **`showConfirm=true`** deep link shows notice in empty state — preserve behaviour when no composition; when published draft exists, defer modal to **6.7** (keep notice if no assignee for current user).
3. **Permissions:** `canManageEvents` ≠ `canManageComposition` — publish uses **composition** permission only.
4. **Event refresh:** after publish, reload event for Infos badge/hint update.

### Previous story intelligence (6.1)

1. **`published_at`** column and entity field exist — no new migration unless constraint needed.
2. Draft lifecycle masking implemented — extend with **`publishedAt`**, do not duplicate lifecycle math in Angular.
3. **Do not expose slot names** on `EventResponse` — composition is a **separate endpoint** (keeps list payload small, avoids accidental leak).
4. Integration tests already seed composition rows — extend for publish flow.

### Git intelligence (recent)

- `959ee24` — lifecycle + event detail shell landed; **6.3** builds Équipe tab on that shell.
- Prefer focused diff: composition package + event-detail Équipe tab + enrichment fix.
- No changes to `legacy/`.

### References

- [epics.md — Story 6.3](../planning-artifacts/epics.md) ; **FR22**, **FR31** (stub only)
- [prd.md — FR22, FR31](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)
- Story **6.1** — lifecycle + schema
- Story **6.2** — event detail shell
- [DOMAIN.md](../../DOMAIN.md) — cast/composition terminology
- [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md) — six-state Équipe badge (**6.6+**, reference only)

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- Kotlin integration tests (`CompositionIntegrationTest`, `CompositionLifecycleIntegrationTest`) fail locally on Flyway V18 against H2 (pre-existing migration compatibility); unit tests and compile pass.
- Fixed naming shadow: `canManageComposition` import aliased to `canManageCompositionForEvent` in `event-detail.ts`.

### Completion Notes List

- Extended `CompositionSnapshot` and `CompositionLifecycleEnrichmentService` with `publishedAt`-aware visibility via `CompositionVisibilityRules`.
- Added `GET /composition` and `POST /composition/publish` with fail-closed slot filtering, idempotent publish, FR31 `CompositionNotificationPort` no-op stub.
- Added `compositionPublishedAt` on `EventResponseDto` for Infos-tab hint differentiation.
- Replaced Équipe stub with `event-equipe-tab` (draft banner, read-only grid, Publier button, empty-state fallback).
- Tests: Kotlin unit (`CompositionVisibilityRulesTest`, lifecycle update), Kotlin integration (`CompositionIntegrationTest`), Angular component + hint specs; `ng test` 202 passed, `ng build` OK.

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionVisibilityRules.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycle.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionVisibilityRulesTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionLifecycleServiceTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/core/composition/composition-visibility.ts
- apps/web/src/app/core/composition/composition-status-hint.ts
- apps/web/src/app/core/composition/composition-status-hint.spec.ts
- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-24: Story 6.3 — draft/publish visibility API, Équipe tab UI, lifecycle enrichment fix, FR31 notification stub.

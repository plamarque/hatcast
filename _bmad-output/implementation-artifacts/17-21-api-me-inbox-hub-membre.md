# Story 17.21 : API `GET /me/inbox` — confirmations et résumé hub

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,  
I want the **À faire** hub to load a single **`GET /v1/me/inbox`** response that lists **availability actions** and **composition confirmations** plus **next event** and **shortcut hints**,  
so that **I complete my urgent tasks without N per-event API calls** (**FR25**, **FR28**).

## Acceptance Criteria

1. **Given** `GET /v1/me/inbox` with a valid session, **when** the member is authenticated, **then** the API returns **200** with `actions[]`, `nextEvent` (nullable), `shortcuts`, and `noParticipation` (same semantics as agenda for “no league/event participation”). [Source: epics 17.21; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Phase 3]
2. **Given** each entry in `actions[]`, **when** serialized, **then** `type` is **`availability_unknown`** or **`composition_confirm_pending`**, and shared fields include `eventId`, `eventSlug`, `leagueSlug`, `title`, `startsAt`, `troupeName`, `leagueTitle`, `location` (nullable), `troupeId`, `leagueId`, `deepLink` (path + query, e.g. `/saison/{leagueSlug}/event/{eventSlug}?tab=dispos` or `?showConfirm=true`). [Source: ux-hub Phase 3 payload]
3. **Given** `type === availability_unknown`, **when** aggregated server-side, **then** include only events where the viewer’s `myAvailabilityStatus === unknown`, `startsAt` is **upcoming** (≥ start of today **Europe/Paris**, same boundary as `GET /me/agenda`), and within the **next 30 calendar days** (Paris) — **parity with Story 17.19** client derivation. [Source: 17.19 AC2; `member-home-todo.utils.ts`]
4. **Given** `type === composition_confirm_pending`, **when** aggregated, **then** include only when: composition **`validatedAt != null`**, the viewer has an **assigned slot** (via linked season/event participant ids per **6.7**), and that slot’s **`participationStatus === pending`**; event is **non-archived**, league **non-archived**, `startsAt` **upcoming** (Paris). **Do not** include draft/unvalidated compositions, empty slots, or `confirmed` / `declined` slots. [Source: FR25; FR28 `awaitingConfirmations`; ux-hub § Règles métier]
5. **Given** `composition_confirm_pending`, **when** serialized, **then** include `roleKey` and French **`roleLabel`** (reuse server role label map, e.g. `SeasonStatisticsService.ROLE_LABELS` or shared `RoleTemplates` labels) for the assigned slot. [Source: ux-hub wireframe « + rôle »]
6. **Given** `deepLink` for `composition_confirm_pending`, **when** built, **then** use **`?showConfirm=true`** (Équipe tab + participation flow per [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts) and **6.10**); for `availability_unknown`, use **`?tab=dispos`**. [Source: SPEC query params; 17.19 navigation]
7. **Given** merged `actions[]`, **when** sorted for display, **then** order by `startsAt` ascending; for **equal** `startsAt`, **`composition_confirm_pending` before `availability_unknown`**. [Source: ux-hub § Tri]
8. **Given** `nextEvent`, **when** at least one upcoming participated event exists, **then** return the **earliest** by `startsAt` (all troupes, unfiltered) as a **`UserAgendaItem`-compatible** object (same fields as `GET /me/agenda` items, including `myAvailabilityStatus` when known). [Source: 17.19 AC4]
9. **Given** `shortcuts`, **when** returned, **then** include `lastSeasonSlug: string | null` (most recently relevant participated league slug if derivable server-side, else `null`) and `seasonGlanceQuery: { troupeId?, leagueId? }` derived from `nextEvent` or first upcoming row — **client may still prefer `lastVisitedSeason` localStorage** for season chip; inbox hints are **best-effort** for first paint. [Source: ux-hub Phase 3]
10. **Given** unauthenticated request, **when** `GET /v1/me/inbox`, **then** **401**. [Source: `SecurityConfig` pattern for `/v1/me/agenda`]
11. **Given** OpenAPI, **when** published, **then** new fragment **`services/api/openapi/me-inbox.yaml`** documents path, schemas, and security; referenced from repo OpenAPI index if applicable. [Source: epics 17.21]
12. **Given** Kotlin integration tests, **when** `./gradlew test` runs, **then** scenarios cover: member with **pending** assigned slot on **validated** compo → `composition_confirm_pending`; member with **unknown** dispo → `availability_unknown`; both on same event → two actions, confirm sorts first at equal time; **no** action when compo not validated or slot not assigned; **401** without session. [Source: NFR-Q1; 6.7 patterns]
13. **Given** hub `/accueil` ([`MemberHomeTodo`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.ts)), **when** loaded, **then** it calls **`GET /v1/me/inbox`** (not agenda-only derivation) for **Actions requises**, **Prochain spectacle** (`nextEvent`), and optional shortcut hints; **remove** client-only `deriveAvailabilityActions` from the load path (keep utils for tests or merge helper that maps inbox DTOs). [Source: epics 17.21; 17.19 phase 3 handoff]
14. **Given** inbox action row UI, **when** `composition_confirm_pending`, **then** line copy **« Confirmer ta participation — *{title}* »** with sub-line **date · troupe · {roleLabel}**; tap navigates via `deepLink` or `Router` with `showConfirm=true`. [Source: ux-hub § Zone 1]
15. **Given** inbox action row UI, **when** `availability_unknown`, **then** preserve **17.19** copy, **Bientôt** badge (7 days), max **5** visible + « Voir tout dans l'agenda », and `tab=dispos` navigation. [Source: 17.19]
16. **Given** inbox fetch failure, **when** non-auth error, **then** retryable error block unchanged from 17.19; **401** → `/connexion`. [Source: 17.19 AC10]
17. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, `./gradlew test`, and `npm run build -w @hatcast/web`, **then** all pass with new API service specs, hub component specs (both action types, sort order, confirm navigation), and utils tests updated for inbox merge if retained. [Source: repo norms]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) **phase 3** ; **FR25** (confirm/decline after validate) ; **FR28** (`awaitingConfirmations`). **Hors scope :** navigation bar badge (**17.22**), `lastMemberEntryPath` (**17.20**), organizer tasks in hub, push notifications.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** hub action list changes for confirm rows, **when** rendered, **then** continue `mat-nav-list` / `mat-list-item`, `mat-chip` (**Bientôt**), `mat-stroked-button` / `mat-flat-button` — no new custom clickable rows. [Source: FRONTEND_UI.md ; 17.19]

**M3-2. Tokens & thème** — **Given** new or touched SCSS, **when** colors apply, **then** only `var(--mat-sys-*)` and `color-mix` — unchanged from 17.19. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** confirm action rows, **when** displayed on ≤480px, **then** full French **`aria-label`** e.g. « Confirmer ta participation pour {title}, rôle {roleLabel}, {date} » ; targets **≥ 48×48 dp**. [Source: ux-hub § Accessibilité]

**M3-4. Navigation membre** — **Given** this story, **when** chrome is touched, **then** **no** bottom nav bar (**17.22**) ; top app bar only. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **OpenAPI contract** (AC: 1–2, 4–6, 11)
  - [x] Add `services/api/openapi/me-inbox.yaml` with `GET /me/inbox`, `InboxResponse`, `InboxAction`, `InboxActionType` enum, `InboxShortcuts`, reuse or `$ref` `UserAgendaItem` from `me-agenda.yaml` for `nextEvent`.
  - [x] Document `deepLink` as relative app path (leading `/`).

- [x] **Backend — controller & security** (AC: 1, 10)
  - [x] `MeInboxController` at `@RequestMapping("/v1/me/inbox")`, `GET`, `SessionUserPrincipal`.
  - [x] Register `GET /v1/me/inbox` authenticated in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt).

- [x] **Backend — aggregation service** (AC: 3–9)
  - [x] `MeInboxService` + `MeInboxRepository` (or extend agenda/composition queries):
    - Upcoming events for user (reuse [`UserAgendaRepository.findUpcomingForUser`](../../services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt) with `size` cap **50**, same as hub MVP).
    - Availability map via [`AvailabilityService.myStatusByEventIds`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt).
    - Pending confirmations: join `EventCompositionSlotEntity` + composition `validatedAt != null` + assignee ∈ [`CompositionLinkedParticipantResolver`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLinkedParticipantResolver.kt) viewer ids + `SlotParticipationStatus.PENDING`.
  - [x] Build `actions`, sort (AC 7), `nextEvent`, `shortcuts`, `noParticipation`.
  - [x] DTOs under `com.hatcast.api.inbox.dto` (or `agenda.dto` if preferred colocation).

- [x] **Backend — integration tests** (AC: 12)
  - [x] `MeInboxIntegrationTest.kt` following [`UserAgendaIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt) fixtures: seed validated compo + pending slot, unknown availability, 401.

- [x] **Frontend — API client** (AC: 1, 13)
  - [x] `apps/web/src/app/core/inbox/me-inbox-api.service.ts` — types mirroring OpenAPI, `GET /v1/me/inbox`, `{ ok, status, data? }` pattern like [`UserAgendaApiService`](../../apps/web/src/app/core/agenda/user-agenda-api.service.ts).

- [x] **Frontend — merge & hub wiring** (AC: 7, 13–17)
  - [x] Extend [`member-home-todo.utils.ts`](../../apps/web/src/app/core/member-home/member-home-todo.utils.ts): map inbox actions to view model; `mergeAndSortInboxActions` if server does not pre-sort (prefer **server sort**; client test only).
  - [x] [`member-home-todo.ts`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.ts): replace `UserAgendaApiService.listAgenda` load with `MeInboxApiService`; signals for `actions`, `nextEvent`, `noParticipation`.
  - [x] Template: `@for` over unified action model; branch label + `openAction(action)` by `type`.
  - [x] Optional: apply `shortcuts.seasonGlanceQuery` when local `lastVisitedSeason` absent (document choice in Dev Agent Record).

- [x] **Tests** (AC: 12, 17)
  - [x] Kotlin integration tests green.
  - [x] `member-home-todo.spec.ts`: confirm row label + navigate with `showConfirm`; availability row regression; mixed sort; empty states with `noParticipation`.
  - [x] Mocks inbox dans `member-home-todo.spec.ts` (pas de spec service dédié).

- [x] **Docs trace** (AC: 11)
  - [x] Story file liée depuis [`epics.md`](../planning-artifacts/epics.md) Story 17.21.
  - [x] [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) row **17.21** → `done`.

## Dev Notes

### Product and UX rules

- **Phase 3** replaces **17.19** client-only dispo derivation; **one** inbox call on hub load.
- **Confirmations** use same urgent copy as ux-hub; **dispo** copy unchanged.
- **Tri :** server-side `startsAt` asc, confirm before dispo at equal timestamp (AC 7).
- **Horizon :** 30 calendar days for **availability** only; confirmations = any **upcoming** event with pending assigned slot.
- **deepLink** paths use canonical **`/saison/`** prefix (not `/ligue/`).
- **Post-login** still **not** `/accueil` by default (unchanged).

### Suggested API shape

```yaml
InboxResponse:
  actions:
    - type: availability_unknown | composition_confirm_pending
      eventId, eventSlug, leagueSlug, leagueId, leagueTitle
      troupeId, troupeName
      title, startsAt, location?
      roleKey?, roleLabel?   # composition only
      deepLink: string       # e.g. /saison/x/event/y?showConfirm=true
  nextEvent: UserAgendaItem | null
  shortcuts:
    lastSeasonSlug: string | null
    seasonGlanceQuery:
      troupeId?: uuid
      leagueId?: uuid
  noParticipation: boolean
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | Reuse `enrichAgendaCardFields`, `isSoonAction`, `MAX_VISIBLE_ACTIONS`, agenda card markup |
| Auth | Same 401 → login as 17.19 |
| Signals | `computed` for `visibleActions` from inbox `actions` |
| deepLink | Prefer `router.navigateByUrl(action.deepLink)` or parse path + `queryParams` — must match `showConfirm` / `tab=dispos` contracts |
| Agenda API | Hub **stops** calling `/me/agenda` for main load; `/agenda` page **unchanged** |

### Explicit non-goals

| Item | Story |
|------|-------|
| Bottom nav / badge on À faire | **17.22** |
| `lastMemberEntryPath` | **17.20** |
| Paginated inbox beyond 50 upcoming events | Defer (same cap as 17.19) |
| Organizer hub tasks | Post-MVP per ux-hub |
| Changing participation POST semantics | **6.7** — consume only |

### Backend implementation hints

- **Viewer participant ids:** mirror **6.7** — [`CompositionLinkedParticipantResolver.resolveViewerParticipantIds`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLinkedParticipantResolver.kt) per event (batch by event ids to avoid N+1).
- **Validated only:** `composition.validatedAt != null` (not merely published draft).
- **Lifecycle:** inbox lists **pending confirmation** slots regardless of whether UI badge is `awaitingConfirmations` vs `gapsToFill` — if slot is filled + pending, member must confirm (**FR25**).
- **Performance:** target **one** inbox HTTP round-trip; internal queries may be 2–3 (events + availability + slots) but **no** per-event client calls.

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`UserAgendaService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt) | Participation context, availability batching, agenda row mapping |
| [`UserAgendaIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt) | Test harness, cookies, seed data |
| [`CompositionParticipationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt) | Validated compo + pending slot fixtures |
| [`member-home-todo.*`](../../apps/web/src/app/pages/member-home-todo/) | Hub UI — extend, do not rewrite |
| [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts) | `showConfirm` → équipe tab |
| [`event-urls.ts`](../../apps/web/src/app/core/messaging/event-urls.ts) | Confirm URL pattern |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **6.7** | done | Participation pending/confirmed semantics |
| **17.19** | done | Hub `/accueil` MVP — inbox replaces agenda derivation |
| **12.2** | done | `UserAgendaItem` shape for `nextEvent` |
| **17.22** | backlog | Will consume `actions.length` for nav badge |

### Project structure notes

| Layer | Paths |
|-------|--------|
| OpenAPI | `services/api/openapi/me-inbox.yaml` |
| API | `services/api/src/main/kotlin/com/hatcast/api/inbox/*` (suggested package) |
| Tests | `services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxIntegrationTest.kt` |
| Web core | `apps/web/src/app/core/inbox/me-inbox-api.service.ts` |
| Web utils | `apps/web/src/app/core/member-home/member-home-todo.utils.ts` |
| Hub page | `apps/web/src/app/pages/member-home-todo/*` |

**Commands:**

```bash
./gradlew test --tests '*MeInbox*'
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- **API:** pending confirm included/excluded matrix (validated, assignee, status); unknown dispo 30-day boundary; sort tie-break; 401.
- **Web:** confirm row copy + navigation; availability regression; `noParticipation` empty; load error retry.
- **Regression:** `CompositionParticipationIntegrationTest`, `member-home-todo.spec.ts`, post-login specs untouched.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.21]
- [Source: `_bmad-output/planning-artifacts/ux-hub-a-faire.md` — Phase 3, tri, wireframe]
- [Source: `_bmad-output/implementation-artifacts/17-19-hub-accueil-a-faire-mvp.md`]
- [Source: `_bmad-output/implementation-artifacts/6-7-confirmation-ou-declinaison-de-participation-membre.md`]
- [Source: `PLAN.md` — Epic 17 row 17.21]
- [Source: `SPEC.md` — query params `showConfirm`, `tab`]
- [Source: `docs/v2/technical/FRONTEND_UI.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- `GET /v1/me/inbox` agrège dispos unknown (30 j Paris), confirmations compo validée + slot pending assigné, `nextEvent`, `shortcuts`, `noParticipation`.
- Hub `/accueil` charge l’inbox (plus `/me/agenda`) ; navigation via `deepLink` ; clin d’œil : `lastVisitedSeason` prioritaire, sinon `shortcuts.seasonGlanceQuery`.
- M3 : `mat-nav-list` / chips / boutons inchangés ; `aria-label` français pour les lignes confirm.

### Revue code (2026-05-27) — correctifs post-CR

- Requête `MeInboxRepository` + participation agenda alignées sur liaison 6.7 (`user` ou `troupeMembership` actif).
- `MeInboxService` : batch `findAllById` + cache `viewerIds` par événement.
- Tests intégration : membership-only, horizon 30 j, slot non assigné, slot assigné à un autre membre.
- `last-visited-league-storage.spec.ts` : `beforeEach(localStorage.clear)` pour stabilité suite web.

### Checklist M3 (M3-5)

| Point | Statut |
|-------|--------|
| M3-1 Composants Material | Validé — `mat-nav-list`, chips, boutons |
| M3-2 Tokens | Validé — `var(--mat-sys-*)` / `color-mix` |
| M3-3 Mobile / tactile | Validé — `min-height: 3rem`, `aria-label` confirm FR |
| M3-4 Pas de bottom nav | N/A — hors scope 17.21 |
| M3-5 Revue checklist | Validé — voir tableau ci-dessus |

### File List

- `services/api/openapi/me-inbox.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/inbox/*`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/AgendaTimeBoundary.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxIntegrationTest.kt`
- `apps/web/src/app/core/inbox/me-inbox-api.service.ts`
- `apps/web/src/app/core/member-home/member-home-todo.utils.ts`
- `apps/web/src/app/pages/member-home-todo/*`

### Change Log

- 2026-05-27 : Story **17.21** created via `/bmad-create-story` — API `GET /v1/me/inbox` + hub `/accueil` integration.
- 2026-05-27 : Implémentation dev story **17.21** (API + hub + tests).
- 2026-05-27 : Correctifs revue code — liaison participant 6.7, perf inbox, tests AC12, M3-5, spec storage.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie (M3-1 … M3-5)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés

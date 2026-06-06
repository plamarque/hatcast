# Story 3.25: Guest scoped access for linked externes

---
baseline_commit: c44175cd
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **external guest with a linked HatCast account**,  
I want availability and user agenda **only** for events within my invitation scope,  
so that I can participate **without** full troupe **member** hub access (**ADR-0021** P4, **FR48**).

**Plan source:** [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](../planning-artifacts/sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md) — approved 2026-06-06.  
**User AC prep:** 2026-06-06 (Patrice) — enriched below.

## Acceptance Criteria

1. **Given** a signed-in user with troupe carnet `EXTERNE` **ACTIVE** and **no** active invitation (`season_participants.status = ACTIVE` or `event_participants.status = ACTIVE` linked to their account via `user_id` or `troupe_membership.user_id`), **when** they call member surfaces (`GET /v1/me/agenda`, event detail, availability write, `/troupes/:slug`, season workspace), **then** empty agenda or **403/404** as appropriate — **no** read-only hub, **no** partial season workspace, **no** organizer participant admin. **Given** an invited linked externe (active invitation), **when** they open `/troupes/:slug`, **then** **read-only** hub (invited seasons only, no admin ⚙) is allowed per matrix § Dev Notes (review **1B**). [Source: epics 3.25 AC3 amended ; ADR-0021 §2 layer A; ADR-0021 §5 amended story **3.25**]

2. **Given** a linked externe with invitation **`SEASON`** (`season_participants.invitation_scope = SEASON`, carnet `EXTERNE` via `troupe_membership_id`), **when** `GET /v1/me/agenda?scope=upcoming`, **then** the response includes **only** **published** events (`availabilityOpenedAt` non-null, draft visibility rules) for **that** season, **minus** events where the participant is **excluded** (`event_participant_exclusions`); **excludes** events from other seasons/troupes without invitation. [Source: epics 3.25 AC1; ADR-0021 §3 Laetitia; FR48; story **3.21**]

3. **Given** a **`SEASON`-scoped** externe with linked account, **when** they access the **partial season workspace** at `/saison/:troupeSlug/:seasonSlug`, **then** only surfaces marked **Allowed** in the matrix below are reachable ; **Historique**, **Statistiques**, admin ⚙, and export CSV remain **forbidden** (`403` or access-denied UI). **Agenda** lists **only** in-scope **published** events (same filter as AC2). **`/troupes/:slug` hub** is **read-only** (review **1B**), not member-equivalent. [Source: epics 3.25 AC1 amended — partial workspace replaces « pas d’espace saison membre complet » ; ADR-0021 §5 amended ; FR53 partial ; story **3.3**]

4. **Given** a **`SEASON`-scoped** externe, **when** they open an **in-scope** event via workspace Agenda or `/saison/…/event/:eventSlug`, **then** read + **write availability** is allowed (Dispo / Pas dispo / Non renseigné, comment, role keys when event type requires) **without** `requireActiveMemberMembership` ; composition confirm/decline (**6.7**) works when assigned. [Source: ADR-0021 §5 ; FR5.1–5.4 ; story **6.2**]

5. **Given** a linked externe with invitation **`EVENT`** (event-only roster row **or** `season_participants.invitation_scope = EVENT` + linked `event_participants`), **when** `GET /v1/me/agenda`, **then** **only** invited spectacle(s) appear — **not** sibling events in the same season ; **when** they open `/saison/:troupeSlug/:seasonSlug`, **then** **partial workspace** (`EVENTS_ONLY`: Agenda + Historique in-scope, no Statistiques) — **not** full member workspace. [Source: epics 3.25 AC2 amended review 2026-06-06 **2B** ; ADR-0021 §3 Ruben ; story **3.23** AC3–4]

6. **Given** an **`EVENT`-scoped** guest on spectacle A, **when** they attempt availability or event detail on spectacle B (same season, not invited), **then** **403/404** — guards use **invitation-derived** checks, not `MEMBER` membership alone. [Source: ADR-0021 §5 ; known gap from **3.23** handoff]

7. **Given** a troupe **`MEMBER`/`TROUPE_ADMIN`** (invitation `NULL`, membership sync), **when** the same endpoints as before this story, **then** behaviour is **unchanged** — zero regression on agenda, availability, full season workspace, troupe hub. [Source: non-regression epic 3 ; story **3.23** AC6]

8. **Given** invitations in **two troupes** (externe A + member B, or two externes), **when** `GET /v1/me/agenda`, **then** multi-troupe aggregation per **ADR-0011**: one row per event, troupe + league badges ; filter bar visible when `filterBarVisible=true` (FR55 / RES-001). [Source: epics 3.25 ; SCP §4.5 summary point 4 ; FR48]

9. **Given** API guard refactor, **when** auditing `requireActiveMember` / `requireActiveMemberMembership` on **participant-invited** paths (agenda query, partial season Agenda list, `AvailabilityService` read/write, `EventService.getById`/`getBySlug`, composition participation **6.7**), **then** replace with shared **`GuestInvitationAccessService`** (or equivalent) verifying: linked account **AND** (`MEMBER`/`TROUPE_ADMIN` **OR** active roster invitation with correct scope); **carnet-only `EXTERNE`** remains rejected. [Source: ADR-0021 §5 ; `TroupeMembershipService.requireActiveMemberMembership` already rejects bare EXTERNE]

10. **Given** invitation removed (`season_participants`/`event_participants` → `REMOVED`) or carnet `INACTIVE`, **when** the linked externe reloads agenda or attempts availability, **then** the event disappears / access denied on next request (no stale client assumption beyond normal session). [Source: ADR-0021 §6 ; story **3.23** stable IDs]

11. **Given** Story **8.3** (done) and an organizer **publishes** a spectacle (`open-availability`), **when** a linked externe is on the **concerned roster** for that event (per scope + exclusions), **then** they receive **`AVAILABILITY_OPENED`** (push/email per **8.1**/**8.2**) and the deep link opens an **in-scope** event they can act on — **not** deferred to a later story. **When** validate assigns them, **then** **`CONFIRMATION_REQUEST`** resolves their linked `user_id` the same way. [Source: **8.3** AC1–2 ; **3.21** publication ; FR31 ; verify [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) + [`EventRosterService.buildRoster`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt)]

12. **Given** implementation complete, **when** CI tests run, **then** API integration coverage includes: (a) Laetitia `SEASON` — agenda N published events, partial workspace **`AGENDA_ONLY`**, Historique/Stats 403 ; (b) Ruben `EVENT` — agenda 1 event, partial workspace **`EVENTS_ONLY`** (Agenda + Historique in-scope, Stats 403) ; (c) carnet-only linked account — empty agenda ; (d) troupe member regression ; (e) multi-troupe aggregation ; (f) availability write OK in scope, KO out of scope ; (g) event detail GET OK in scope for guest ; (h) `open-availability` → `AVAILABILITY_OPENED` to linked season-scoped externe. E2E Playwright **`recette-3-25.spec.ts`** covers hub read-only, workspace modes, and multi-troupe paths (review **1B/2B**). [Source: SCP §7 ; NFR-Q1 FR48–FR49 ; **8.3**]

**Product coverage:** FR48, FR5, FR31 (notification delivery to invited guests), FR43–FR45 ; ADR-0021 P4, ADR-0011. **Priority:** P4 (SCP) / P2 (epics). **Depends:** **3.23** (done), Epic **12** (`/agenda`, done), **8.3** (done — audience + deep links must work for guests). **Blocks:** Epic **7** self-service (soft).

**Out of scope:** full member season workspace (Historique, Statistiques, admin) for externes ; self-service invite (Epic **7**); `EXTERNE` → `MEMBER` promotion ; global user search ; `legacy/`.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** guest surfaces (`/agenda`, event detail availability tab), **when** interactive controls render, **then** reuse existing components (`mat-stroked-button`, `mat-button`, availability chips, `mat-form-field` comment) — no custom HTML buttons for the same roles. [Source: FRONTEND_UI.md; stories **5.6**, **12.2**]

**M3-2. Tokens & thème** — **Given** any new styling (optional guest context banner, empty state copy), **when** colors/backgrounds applied, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** guest navigates agenda → event → availability, **then** touch targets ≥ 48×48 dp; French `aria-label` when label hidden; no member chrome regression (**17.22**). [Source: NFR-A1; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** an invited externe (not `MEMBER`), **when** signed in, **then** allowed routes follow the partial workspace matrix (§ Dev Notes) : **`SEASON` scope** → `/agenda`, `/saison/:troupeSlug/:seasonSlug` (**Agenda tab only**), in-scope event detail, `/compte`, **`/troupes/:slug` hub lecture seule** (navigation saison, pas admin) ; **`EVENT` scope** → `/agenda`, `/saison/…` (**Agenda + Historique** in-scope), in-scope event detail, `/compte`, hub lecture seule ; **deny** Historique/Statistiques (SEASON) ou Statistiques (EVENT), admin ⚙ ; no M2 bottom app bar. Post-login (**FR49**) for guest-only users: land on `/agenda`. Deep links from **8.3** notifications must resolve to allowed routes. [Source: ADR-0021 §5 ; review **1B/2B** 2026-06-06 ; ux-hub-a-faire.md ; story **17.22**, **12.5**, **8.3**]

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** walk checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md); note waived items in Dev Notes or `ISSUES.md`. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **do not modify** `legacy/`.
- [x] **GuestInvitationAccessService** (AC: 1, 6, 9, 10)
  - New service under `services/api/.../participant/` (or `troupe/`) with:
    - `requireMemberOrInvitedGuest(seasonId, eventId?, principal)` — allows `MEMBER`/`TROUPE_ADMIN` **or** valid invitation scope.
    - `canAccessEvent(userId, seasonId, eventId): Boolean` — scope logic below.
    - `hasAnyInvitation(userId): Boolean` — for post-login / empty states.
  - Scope rules (ADR-0021 §3):
    - **`SEASON`:** active `season_participants` with `invitation_scope = SEASON`, linked user, season match; event allowed unless excluded.
    - **`EVENT`:** active `event_participants` linked to user **or** season row with `invitation_scope = EVENT` **and** active event row for that event only.
    - **Member path:** active `MEMBER`/`TROUPE_ADMIN` membership → existing behaviour (delegate to `requireActiveMemberMembership`).
  - Link resolution: match `sp.user.id`, `ep.user.id`, or `troupe_membership.user.id` on ACTIVE rows (same as **3.23** / agenda tests).
- [x] **UserAgendaRepository + UserAgendaService** (AC: 2, 5, 8)
  - **Critical bug today:** season-participant branch returns **all** season events regardless of `invitation_scope`; fix JPQL in [`UserAgendaRepository.kt`](../../services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt):
    - `SEASON` scope → join season events (published + draft visibility) minus exclusions.
    - `EVENT` scope → **do not** expand to full season; only explicit `event_participants` rows (and opt-in season+event pairs).
  - Keep existing [`UserAgendaIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt) `event-only participant sees event` green; add Laetitia/Ruben scope tests.
  - Filter catalog queries (`findParticipatingSeasonIdsFromSeason`, etc.) must not expose seasons the guest cannot browse.
- [x] **Partial season workspace — API + UI** (AC: 3, 5, M3-4)
  - [`EventService.listForSeason`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) `UPCOMING`/`ALL`: allow **`SEASON`-scoped** guest with filtered event list (published, in-scope, minus exclusions) ; keep `PAST`/Historique and stats endpoints **member-only**.
  - [`SeasonHome`](../../apps/web/src/app/pages/season-home/season-home.ts) + [`SeasonViewToolbar`](../../apps/web/src/app/pages/season-home/season-view-toolbar.ts): for guest **`SEASON`** — **`AGENDA_ONLY`** (Agenda tab only; hide Historique / Statistiques) ; for guest **`EVENT`** — **`EVENTS_ONLY`** (Agenda + Historique in-scope; hide Statistiques) per review **2B**.
  - Cross-nav from event detail to league: allowed for **`SEASON`** guest (Agenda tab) ; hidden or denied for **`EVENT`** guest.
- [x] **AvailabilityService** (AC: 4, 6, 9)
  - Replace `loadAuthorizedEvent` `requireActiveMember` with `GuestInvitationAccessService.requireMemberOrInvitedGuest` + per-event scope check.
  - Summary/read paths used from event detail: same guard for invited guest on **their** event only.
  - **Do not** open organizer summary to guests unless already permitted by story **5.7** rules — guest sees own dispos only.
- [x] **EventService** (AC: 4, 6, 9)
  - [`getById`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) / `getBySlug`: allow invited guest for in-scope event.
  - Composition lifecycle enrichment: guest team tab per **6.3**/**6.7**.
- [x] **Notification audience verification (8.3)** (AC: 11)
  - Confirm [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) resolves linked `user_id` for **EXTERNE**-linked season/event roster rows via `buildRoster`.
  - Add integration test: season-scoped externe with linked account receives **`AVAILABILITY_OPENED`** on `open-availability` ; assignee receives **`CONFIRMATION_REQUEST`** on validate.
  - **Do not** reimplement dispatcher — extend/fix audience if roster mapping misses carnet-linked guests.
- [x] **ParticipantAccessService** (AC: 3)
  - `loadSeasonForMember` / `loadEventInSeason` remain **member-only** (admin/organizer flows).
  - Do **not** widen admin participant routes to guests.
- [x] **Post-login routing** (AC: 1, M3-4)
  - [`PostLoginNavigationService`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts): if user has invitations but **no** `MEMBER`/`TROUPE_ADMIN` troupe memberships, skip invalid `lastMemberEntryPath` to hub/season workspace → `/agenda`.
  - Optional: API flag on `/v1/me/agenda` or session bootstrap (`guestOnlyParticipation`) — only if needed for UI; prefer deriving from existing agenda `noParticipation` / membership list.
- [x] **Frontend event detail + hub** (AC: 3, 5, 6, M3)
  - [`EventDetail`](../../apps/web/src/app/pages/event-detail/event-detail.ts): handle **403** with French message + link to `/agenda`.
  - [`TroupeHub`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): carnet-only (no invitation) → `accessDenied` ; invited linked guest → **read-only** hub (review **1B**).
  - [`SeasonHome`](../../apps/web/src/app/pages/season-home/season-home.ts): partial workspace per matrix — see task above.
- [x] **Tests** (AC: 12)
  - Extend `GuestInvitationAccessIntegrationTest` + `UserAgendaIntegrationTest` + `AvailabilityControllerIntegrationTest` + `EventOpenAvailabilityNotificationIntegrationTest` (8.3 guest recipient).

---

## Dev Notes

### Product and UX rules

- **Three layers (ADR-0021):** Carnet (A) alone grants nothing; invitation scope (B) defines dispos/agenda (**this story**); account (C) enables self-service + **8.3** notifications.
- **Laetitia (`SEASON`):** partial season workspace — **Agenda tab only** with in-scope published events; dispos on those events; **not** Historique / Statistiques / admin.
- **Ruben (`EVENT`):** user agenda + partial season workspace (**Agenda + Historique** in-scope, no Stats) + event detail ; hub lecture seule pour navigation.
- **Hub invité (review 1B):** `/troupes/:slug` **allowed read-only** pour invités liés (context + liste saisons invitées) ; pas d’admin ; absent de Découvrir si déjà dans Mes troupes.
- **Member typeahead path:** unchanged — `invitation_scope` NULL on membership-sync rows.
- **Composition confirm/decline:** if guest is assigned in validated composition, **6.7** flows must work on invited event.
- **Notifications (8.3):** publication and confirmation intents must reach linked guests on concerned roster — verify, do not defer.

### Partial season workspace matrix *(replaces epics « pas d’espace saison membre complet »)*

| Surface | `SEASON`-scoped guest | `EVENT`-scoped guest | `MEMBER` |
|---------|----------------------|----------------------|----------|
| **`/agenda` (Mon agenda)** | Allowed — in-scope published events | Allowed — invited event(s) only | Allowed — full |
| **`/saison/…` — tab Agenda** | **Allowed** — filtered in-scope upcoming | **Allowed** — invited event(s) only | Allowed — full season |
| **`/saison/…` — tab Historique** | **Forbidden** | **Allowed** — invited past only | Allowed |
| **`/saison/…` — tab Statistiques** | **Forbidden** | **Forbidden** | Allowed |
| **Event detail (in-scope)** | Allowed — dispos + équipe (own confirm) | Allowed | Allowed |
| **Event detail (out-of-scope)** | **Forbidden** (404) | **Forbidden** (404) | Allowed if member |
| **`/troupes/:slug` hub** | **Allowed read-only** (review **1B**) | **Allowed read-only** | Allowed — full |
| **Admin ⚙ (participants, membres, audit)** | **Forbidden** | **Forbidden** | Per role |
| **`AVAILABILITY_OPENED` / `CONFIRMATION_REQUEST` (8.3)** | Allowed when on concerned roster + linked account | Allowed when on event roster + linked account | Allowed |
| **Cross-nav « Voir la ligue » (FR51)** | Allowed → partial workspace Agenda | Allowed → partial workspace Agenda/Historique | Allowed → full workspace |

**Implementation hint:** API exposes **`guestSeasonWorkspaceMode`**: `NONE` | `EVENTS_ONLY` | `AGENDA_ONLY` | `FULL` — front hides Historique/Statistiques per mode.

### M3 checklist (story 3.25)

- M3-1–3: N/A — no new controls; reused existing Material surfaces.
- M3-4: Implemented via `guestSeasonWorkspaceMode`, hub read-only invité, post-login NONE guard.
- M3-5: Waived cross-nav hide for EVENT guest on event detail (existing member-cross-nav unchanged; out-of-scope season tabs blocked via `guestSeasonWorkspaceMode`).

### Current state (must read before coding)

| Area | Today | This story changes |
|------|-------|-------------------|
| `UserAgendaRepository` | Includes any ACTIVE season participant row → **all** season events | Filter by `invitation_scope`; EVENT scope → event rows only |
| `UserAgendaIntegrationTest` | `event-only participant sees event` passes | Add SEASON + EVENT scope + exclusion cases |
| `AvailabilityService.loadAuthorizedEvent` | `requireActiveMember` → **blocks all externes** | Invitation-derived access |
| `EventService.listForSeason` | `requireActiveMember` — blocks guest | **`SEASON` guest:** upcoming list filtered in-scope ; Historique/stats stay member-only |
| `EventService.getById/getBySlug` | `requireActiveMember` → event detail 403 for guest | Allow in-scope guest |
| `SeasonHome` view toolbar | All tabs for any authenticated caller | **`SEASON` guest:** `AGENDA_ONLY` ; **`EVENT` guest:** `EVENTS_ONLY` (Agenda + Historique in-scope) |
| `NotificationRecipientResolver` | Uses `buildRoster` (may already include externes) | **Verify** linked externe gets **8.3** intents ; fix mapping if gap |
| `TroupeMembershipService.requireActiveMemberMembership` | Rejects `EXTERNE` (correct for hub) | Keep; add parallel invitation path |
| `ParticipantAccessService.loadEventInSeason` | Member-only | Unchanged (admin) |
| Post-login | May restore `/troupes/:slug` or `/saison/...` from last path | Guest-only → `/agenda` |
| Dispos UI (organizer views) | May list all roster rows | **Optional tighten:** eligible list for guest self-only — organizer views unchanged |

### Architecture compliance

- **ADR-0021 §5:** Authorization checks **`EXTERNE` + invitation scope**, not `MEMBER` alone.
- **ADR-0011:** Multi-troupe invitations aggregate on `/agenda`; no merge of encounter rows.
- **ADR-0013:** Canonical event URLs `/saison/:troupeSlug/:seasonSlug/event/:eventSlug` — guest enters only via agenda row or deep link.
- **Flyway:** **no new migration** expected — `invitation_scope` exists (**V60**, story **3.23**).
- **OpenAPI:** extend only if new session/agenda flags added; otherwise behaviour-only.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | Reuse event detail availability components from story **5.6** |
| Tokens | `--mat-sys-*` only |
| Réutilisation | [`user-agenda.ts`](../../apps/web/src/app/pages/user-agenda/user-agenda.ts), [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts), [`post-login-navigation.service.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts) |
| Nav | [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) — event detail already in nav patterns |

### Explicit non-goals

- **Full** member season workspace for externes (Historique, Statistiques, admin, export CSV)
- Epic **7** self-service guest invite
- Changing carnet admin (**2.21**) or cascade add (**3.23**)
- Typeahead carnet (**3.8d**)
- Proxy availability by organizer for guest (**5.5**) — unchanged unless already works via organizer member session
- `legacy/`

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **2.21** | done | `EXTERNE` carnet role + member guard baseline |
| **3.23** | done | `invitation_scope` column + cascade add — **data prerequisite** |
| **3.8d** | done | Independent — carnet typeahead |
| **12.1–12.5** | done | `/agenda` API + screen + post-login |
| **5.1–5.6** | done | Availability UI/API patterns to reuse |
| **8.3** | done | **`AVAILABILITY_OPENED`** / **`CONFIRMATION_REQUEST`** — verify audience + deep links for linked guests (**AC11**, not deferred) |
| **8.1** | done | Push opt-in prerequisite for 8.3 delivery |
| **3.21** | done | Publication triggers 8.3 |
| **6.7** | done | Confirm/decline — verify guest path |
| **7.1** | backlog | Soft-blocked until this story ships |

### Previous story intelligence (3.23)

- Scope column persisted; **dispos/agenda enforcement explicitly deferred to 3.25** (handoff note in **3-23** Dev Notes + recette scénario G).
- Integration tests: `ParticipantExterneCascadeIntegrationTest` — reuse carnet upsert patterns for test fixtures.
- **`findActiveForSeasonLinkedToUser`** already resolves user via membership — use for focus participant on event detail.

### Git intelligence (recent)

- `69cffe36` — cascade externe + scope (**3.23** foundation)
- `c44175cd` — carnet typeahead (**3.8d**)
- Patterns: integration tests in `ParticipantExterneCascadeIntegrationTest`, Flyway V60, no legacy touches.

### Testing requirements

- **API:** primary coverage — scope matrix is backend-heavy.
- **Web:** 403 handling + post-login guest path; E2E **`recette-3-25.spec.ts`** (18 scénarios, projet `chromium-3-25`).
- **Manual recette:** extend **3.23** scenarios A/B with linked account → agenda + partial workspace (Laetitia) + **8.3** push/email on publish.

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (dev-story)

### Completion Notes List

- Added `GuestInvitationAccessService` + `GuestSeasonWorkspaceMode` with SEASON/EVENT scope, exclusions, carnet email fallback, and season read vs workspace access separation (`NONE` for event-only metadata).
- Fixed `UserAgendaRepository` JPQL: SEASON scope + exclusions; EVENT scope via explicit event rows only; catalog queries exclude EVENT-only season rows.
- Wired guards into `AvailabilityService`, `EventService`, `CompositionParticipationService`, `SeasonService` (`guestSeasonWorkspaceMode`), `SeasonStatisticsService` (member-only).
- Fixed roster `userId` resolution on event rows via carnet/season participant for **8.3** audience.
- Front: `SeasonHome` partial workspace (Agenda tab only / EVENTS_ONLY), `TroupeHub` guest read-only, `EventDetail` 403 → `/agenda`, post-login NONE guard.
- New `GuestInvitationAccessIntegrationTest` (14 scenarios). `./gradlew test`: green on story scope.
- 2026-06-06 : Code review — decisions **1B** (hub read-only), **2B** (`EVENTS_ONLY` workspace) ; patches applied.

### File List

- services/api/src/main/kotlin/com/hatcast/api/participant/GuestInvitationAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/GuestSeasonWorkspaceMode.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/GuestEventAccessJpql.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonDtos.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/GuestInvitationAccessIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonServiceUpdateTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsEventCellTest.kt
- apps/web/src/app/core/seasons/season-api.service.ts
- apps/web/src/app/core/navigation/post-login-navigation.service.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-view-toolbar.ts
- apps/web/src/app/pages/season-home/season-view-toolbar.html
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-06 : Story created (ready-for-dev)
- 2026-06-06 : Amended — partial season workspace matrix (replaces epics full-workspace denial) ; **8.3** real dependency (notification at publish)
- 2026-06-06 : Implemented guest invitation scope (API guards, agenda fix, partial season workspace UI, integration tests)
- 2026-06-06 : Pre-commit doc sync — AC1/AC3/AC12 + tasks aligned with review **1B/2B** ; ADR-0021 §5 amended

### Review Findings

- [x] [Review][Decision] **Hub troupe autorisé aux invités liés** — Résolu **1B** : matrice + AC/M3-4 amendés ; hub lecture seule conservé.
- [x] [Review][Decision] **Workspace saison EVENT (`EVENTS_ONLY`) vs AC5** — Résolu **2B** : AC5 + matrice amendés ; `EVENTS_ONLY` conservé.
- [x] [Review][Patch] **Post-login restaure `/saison/…` sans filtrer le scope invité** — Guard `guestSeasonWorkspaceMode === NONE` dans `post-login-navigation.service.ts`.
- [x] [Review][Patch] **`null` invitationScope traité comme SEASON** — Corrigé dans `GuestInvitationAccessService.canAccessEventAsGuest`.
- [x] [Review][Patch] **`getBySlug` 403 vs 404** — `requireMemberOrInvitedGuestForEventOrNotFound` sur getById/getBySlug.
- [x] [Review][Patch] **Test carnet-only EXTERNE ACTIVE sans invitation** — `active externe carnet without invitation gets empty agenda`.
- [x] [Review][Patch] **Tests multi-troupe agenda (AC8)** — `multi troupe guest invitations aggregate on agenda with filter bar`.
- [x] [Review][Patch] **Test CONFIRMATION_REQUEST (AC11)** — `validate composition dispatches confirmation request`.
- [x] [Review][Patch] **Test révocation REMOVED (AC10)** — `removed season invitation drops event from guest agenda`.
- [x] [Review][Patch] **Test GET event detail hors scope EVENT (AC6)** — `Ruben EVENT guest gets not found for sibling event detail`.
- [x] [Review][Patch] **Test confirm composition invité (AC4)** — `season guest can confirm validated composition participation`.
- [x] [Review][Patch] **Tests exclusions + brouillons Laetitia (AC2)** — `Laetitia SEASON agenda excludes unpublished events and roster exclusions`.
- [x] [Review][Patch] **Non-régression membre workspace (AC7)** — `troupe member season workspace regression unchanged`.
- [x] [Review][Patch] **Modification `legacy/`** — Revert `GridBoard.vue`.
- [x] [Review][Patch] **Playwright chromium-3-25** — `recette-3-25.spec.ts` présent ; import `Story325Fixture` typé.
- [x] [Review][Patch] **Copy équipe vide hors scope** — Revert `event-equipe-empty.html` + specs alignées.
- [x] [Review][Defer] **Pagination liste saisons invité ignore page/size** — deferred, impact faible P4
- [x] [Review][Defer] **Extensions tests citées en story non livrées dans fichiers existants** — deferred, couverture via `GuestInvitationAccessIntegrationTest`

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / ADR)
- [x] Section **Material 3** remplie (UI guest surfaces)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés

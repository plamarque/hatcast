# Story 5.3: Organizer availability view — per-role grids and Moi / Tous modes

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer** (or any member viewing the event),  
I want to **see who is available for each role**, with a **subject selector** (me / another participant) and a **Moi / Tous** toggle,  
so that **I can prepare composition with full lottery transparency** (**FR19**, **UX-DR5**).

## Acceptance Criteria

1. **Given** a spectacle with availability rows and `roleSlots` from story **3.4**, **when** I open the **Dispos** tab on event detail, **then** I see the **Moi / Tous** segmented control (purple active state per UX) and role-aware content — **FR19**, **UX-DR5**.
2. **Given** **Moi** is active and the subject is **myself**, **when** I interact with the panel, **then** I can set **Dispo / Pas dispo / Non renseigné** and **role candidacy** using the **same semantics** as stories **5.1** and **5.2** (immediate save, volunteer rule, preferred-role pre-check) — reuse dialog logic inline or via shared component — **UX-DR5**.
3. **Given** **Tous** is active, **when** the panel loads, **then** I see **one collapsible section per required role** with header **icon + French label + ratio** `({candidates}/{slots})` (e.g. **DJ (6/1)**) and a **two-column grid** of **avatar + display name + estimated %** sorted by descending chance — **FR19**, **UX-DR5**.
4. **Given** candidates exist for a role, **when** percentages render, **then** they use the **V1 weighted-chance algorithm** (malus from past selections × slot count, practical % = weight / total weight); when composition history is not yet available in V2, **past selection count defaults to 0** (equal odds among candidates) — **FR19** transparency rule.
5. **Given** a participant is **Dispo** with **empty `roleKeys`**, **when** they appear in **Tous**, **then** they count as a candidate for **every required role** on the event (V1 “dispo générale” parity from story **5.2**) — **FR16** downstream.
6. **Given** a participant is **Dispo** with explicit **`roleKeys`**, **when** **Tous** renders, **then** they appear **only** under roles listed in their saved `roleKeys` — **FR16**.
7. **Given** I am a **troupe admin, season organizer, or event organizer** for this spectacle, **when** **Moi** is active, **then** a **subject selector** (avatar + name dropdown) lets me pick **another season participant** to **view** their availability state and role candidacy **read-only** in the Moi panel — **FR19** (edit for others deferred to **5.5** / **FR17**).
8. **Given** I am a **regular member** (not organizer/admin), **when** I open Dispos, **then** the subject selector is **hidden or fixed to self**; I can still switch **Moi / Tous** and view **Tous** percentages — **UX-DR5** permissions table.
9. **Given** I have organizer rights and tap a person in **Tous**, **when** the click is handled, **then** the UI switches to **Moi** with that participant as subject (**read-only** until **5.5**); tooltip *« Cliquer pour modifier la disponibilité »* only when **5.5** proxy PUT exists — for **5.3** use *« Voir la disponibilité »* or read-only sheet — **UX-DR5** gated affordance.
10. **Given** the event has **no roles** (`totalSlots === 0`), **when** **Tous** renders, **then** show a **flat grid** of participants with **available / unavailable / unknown** status (V1 “all players” fallback) — port [`EventRoleGroupingView.vue`](../../legacy/src/components/EventRoleGroupingView.vue) lines 4–65.
11. **Given** event detail route `/saison/:slug/event/:eventId`, **when** Dispos is implemented, **then** upgrade [`event-detail-placeholder`](../../apps/web/src/app/pages/event-detail-placeholder/) with a **minimal tab bar** (**Infos** stub + **Dispos** functional + **Équipe** stub) so the feature is reachable without waiting for story **6.2** shell — **6.2** later replaces stubs with full Infos/Équipe content.
12. **Given** API access, **when** any **active troupe member** calls the new summary endpoint, **then** they receive aggregated availability for **eligible participants** (season roster ∪ event-only participants per **3.8**); **403** for non-members — **NFR-S2**.
13. **Couverture:** **FR19** ; **UX-DR5** ; **NFR-P2** (single summary read ≤ 500 ms p95 target) ; **NFR-Q1** (automated test on summary + role filtering path).

### Explicit out of scope (later stories — do not implement in 5.3)

| Story | Deferred capability |
|-------|---------------------|
| **5.4** | Optional comment field on availability |
| **5.5** | Proxy PUT for another participant + audit actor (**FR17**) ; click-to-edit in Tous for others |
| **6.2** | Full Infos tab content, canonical query params (`?tab=dispos`), Équipe tab |
| **6.4** | Real past-selection counts from confirmed compositions (wire into chance malus when casts exist) |
| **6.5** | Manual assignment from candidate lists |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.4 (done)** | `roleSlots` on events |
| **3.5 (done)** | `OrganizerAccessService` — reuse `canManageComposition` to gate subject selector |
| **3.8 (done)** | Season/event participants + `GET .../participants/selectors` |
| **5.1 (done)** | Three-state availability + MatDialog from agenda |
| **5.2 (done/in-progress)** | `roleKeys` on `event_availability` ; role checklist in dialog |
| **5.3 (this)** | Event Dispos tab, summary API, Tous grids + %, Moi inline edit (self), subject view (org) |
| **5.5** | Proxy write + audit |
| **6.2** | Complete three-tab event detail shell |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **API — summary endpoint** `GET /v1/seasons/{seasonId}/events/{eventId}/availability/summary`:
  - Extend [`AvailabilityController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt).
  - Auth: active troupe membership (same gate as `/availability/me`).
  - **Eligible participants:** union of ACTIVE `season_participants` for the season + ACTIVE `event_participants` for this event (dedupe by participant id; event-only rows not in season roster).
  - Join `event_availability` on `(event_id, user_id)` where participant has linked `user_id`; name-only / unlinked → `status: unknown`, `roleKeys: []`.
  - Response DTO (camelCase):
    - `eventId`, `roleSlots` (echo for client)
    - `participants[]`: `{ participantId, userId?, displayName, avatarUrl?, status, roleKeys }`
    - `roles[]`: `{ roleKey, requiredCount, candidates[] }` where each candidate is `{ participantId, displayName, avatarUrl?, chancePercent }` (integer 0–100, rounded).
  - **Candidate filter:** `status === available` AND (`roleKeys` empty OR `roleKey ∈ roleKeys`) — mirror [`isAvailableForRole`](../../legacy/src/services/playerAvailabilityService.js).
  - **Chance computation:** new `AvailabilityChanceCalculator` (Kotlin) porting V1 [`chancesService.js`](../../legacy/src/services/chancesService.js) `calculateWeightedChances` + `calculatePracticalChance`; **`pastSelectionCount = 0`** stub until Epic 6 (document TODO); exclude current event from counts when wired later.
  - Sort candidates by `chancePercent` descending.
- [x] **OpenAPI:** extend [`openapi/availability.yaml`](../../services/api/openapi/availability.yaml) — document summary schemas + 403/404.
- [x] **Angular — API client:**
  - Extend [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) with `getEventAvailabilitySummary(seasonId, eventId)`.
  - Optional shared TS module `availability-chances.ts` mirroring server rules for unit tests (port from legacy `chancesService.js` lines 100–131).
- [x] **Angular — Dispos feature components** under `apps/web/src/app/shared/availability/` or `features/event-dispos/`:
  - **`event-dispos-tab`** — toolbar (subject selector + Moi/Tous toggle) + panel switcher.
  - **`availability-moi-panel`** — embed same UX as [`availability-dialog`](../../apps/web/src/app/shared/availability/availability-dialog.ts) without MatDialog chrome OR extract shared **`availability-form`** used by dialog + panel (preferred — avoid duplicating save logic).
  - **`availability-tous-panel`** — accordion per role, 2-col grid, green/orange % styling per UX refs.
  - **`availability-subject-selector`** — `mat-select` over season participants; visible when `canManageComposition` from [`OrganizerApiService`](../../apps/web/src/app/core/organizer/) / permissions DTO; default subject = current user's season participant row.
- [x] **Event detail integration:**
  - Upgrade [`event-detail-placeholder.ts`](../../apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts): tab bar (Infos | Dispos | Équipe), load event + summary on Dispos tab, pass `seasonId`, `troupeId`, `event`, permissions.
  - Infos / Équipe tabs: keep placeholder copy (*« prochaine version »*) — **6.2** fills them.
  - Support `?tab=dispos` query param (optional but aligns with SPEC deep links).
- [x] **Permissions wiring:**
  - Load `GET /v1/seasons/{seasonId}/permissions/me` (existing organizer permissions) to set `canSwitchSubject = canManageComposition(eventId)`.
  - **Moi** self-edit: always when subject is connected user's linked participant.
  - **Moi** other subject: **read-only** display of status + role checkboxes disabled — **5.5** enables edit.
  - **Tous** click person: if `canSwitchSubject`, set subject + switch to Moi (read-only); else no-op or view-only snackbar.
- [x] **Tests:**
  - API integration: summary returns correct candidates per role ; empty roleKeys = all roles ; unavailable excluded ; unlinked participant = unknown ; 403 outsider ; chancePercent equal when no history.
  - Unit: `AvailabilityChanceCalculator` ; TS `isCandidateForRole` helper.
  - Component: Moi/Tous toggle ; Tous accordion counts ; subject selector hidden for non-org ; Moi saves via existing PUT `/me`.
  - **NFR-Q1:** at least one integration test covering **FR19** summary path.
  - Regression: `./gradlew test`, `ng test`, `ng build`.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON camelCase: [architecture.md](../planning-artifacts/architecture.md).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; reads with session cookie.
- **NFR-P2:** one summary GET per Dispos tab open — avoid N+1 per participant; server aggregates.
- UI mood: [ux-design — Dispos tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab).
- Reference screenshots:
  - [`event-detail-dispos-tous-v1.png`](../planning-artifacts/ux-references/event-detail-dispos-tous-v1.png)
  - [`event-detail-dispos-moi-dispo-roles-v1.png`](../planning-artifacts/ux-references/event-detail-dispos-moi-dispo-roles-v1.png)
  - [`event-detail-dispos-moi-unset-v1.png`](../planning-artifacts/ux-references/event-detail-dispos-moi-unset-v1.png)

### V1 reference model (port semantics, not Firestore)

| V1 concept | V2 (5.3) |
|------------|----------|
| `EventRoleGroupingView` | `availability-tous-panel` |
| `GridBoard` Moi/Tous toggle | `event-dispos-tab` toolbar |
| `isAvailableForRole(name, role, eventId)` | Server-side candidate filter on `roleKeys` |
| `chancesService.calculatePracticalChance` | `AvailabilityChanceCalculator` |
| `playerAvailability[player][event]` | `event_availability` joined via `user_id` |
| Subject dropdown (organizer) | `participants/selectors` + permissions |

**Eligible participant for a role (canonical):**

```text
status == available
AND (
  roleKeys is empty   → candidate for ALL required roles
  OR roleKey in roleKeys
)
```

**Ratio header:** `{candidates.length}/{roleSlots[roleKey]}` — show **0/N** when no candidates.

**Percentage colours (UX):** green tint for higher %, orange for lower — reuse V1 thresholds from [`chancesService.getChanceColorClass`](../../legacy/src/services/chancesService.js) or approximate with CSS variables in dark theme.

### Chance algorithm (MVP)

Port from V1:

```javascript
malus = 1 / (1 + pastSelectionCount)
weightedChances = malus * requiredCount
practicalChance = (weightedChances / sum(weights)) * 100
```

**5.3 stub:** `pastSelectionCount = 0` for all participants → equal weights → equal % within a role.

**TODO (Epic 6):** inject real counts from composition history excluding current event and archived events — mirror `countCasts` in [`chancesService.js`](../../legacy/src/services/chancesService.js).

### participant_id vs user_id

Stories **5.1–5.2** persist availability on **`user_id`**. Story **3.8** introduced **`season_participants`**.

**5.3 join strategy (do not block on migration):**

1. Load eligible `SeasonParticipantEntity` / `EventParticipantEntity` rows.
2. For each with non-null `user_id`, lookup `event_availability` by `(eventId, userId)`.
3. Display name / avatar from participant row (not user table) for roster consistency.

Optional follow-up: add `participant_id` FK on `event_availability` — not required for **5.3** AC.

### Subject selector & permissions

| Capability | Rule (5.3) |
|------------|------------|
| View **Tous** + % | Any active troupe member with event access |
| Edit **own** dispo in **Moi** | Linked participant (`user_id` on season participant) |
| **Subject selector** visible | `OrganizerAccessService.canManageComposition(eventId, seasonId, principal)` |
| View **other** subject in **Moi** | Same as selector visibility — **read-only** |
| Edit **other** subject | **5.5** — do not add proxy PUT here |

Resolve **current user's participant id** by matching `season_participants.user_id = session.userId` (membership-synced row).

### UI behaviour

1. **Tab entry:** event detail route already exists — add Dispos tab; agenda card navigation unchanged.
2. **Moi panel:** reuse feedback strings from dialog (*« Tu n'as pas renseigné de dispo. »*); when subject ≠ self, use third person (*« Patrice n'a pas renseigné… »*).
3. **Auto-save:** keep immediate persist from **5.2** — no separate Save button (**5.4** adds comment field).
4. **Unsaved changes:** switching Moi ↔ Tous after local edits should not occur if auto-save on each action (same as dialog).
5. **Empty states:** role section with 0 candidates → message *« Aucun candidat pour ce rôle »* ; no participants in roster → explain admin must add participants (**3.8**).
6. **Archived events:** match V1 — disable edits when event archived (if flag exists on `EventResponse`).

### Extract shared availability form (recommended)

[`availability-dialog.ts`](../../apps/web/src/app/shared/availability/availability-dialog.ts) already implements **5.2** logic. Refactor to:

- **`AvailabilityFormComponent`** — inputs: `seasonId`, `eventId`, `roleSlots`, `troupeId`, `subjectUserId`, `readOnly`, `initialStatus`, `initialRoleKeys` ; outputs: `saved` event.
- **`AvailabilityDialog`** — thin MatDialog wrapper around form (agenda entry unchanged).
- **`AvailabilityMoiPanel`** — hosts form inline on event detail.

This prevents **5.3** from forking save/pre-check/volunteer logic.

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Availability API (me) | [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt), [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) |
| Role rules | [`AvailabilityRoleRules.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt), [`availability-role-rules.ts`](../../apps/web/src/app/core/availability/availability-role-rules.ts) |
| Role labels/emojis | [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) |
| Participant selectors | [`participant-api.service.ts`](../../apps/web/src/app/core/participants/participant-api.service.ts) |
| Organizer permissions | [`OrganizerAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) |
| Event detail shell | [`event-detail-placeholder/*`](../../apps/web/src/app/pages/event-detail-placeholder/) |
| V1 Tous layout | [`EventRoleGroupingView.vue`](../../legacy/src/components/EventRoleGroupingView.vue) |
| V1 chance math | [`chancesService.js`](../../legacy/src/services/chancesService.js) |

### Downstream contract

| Story | Consumes |
|-------|----------|
| **5.4** | Adds `comment` to participant rows in summary + Moi form |
| **5.5** | Proxy PUT + subject edit ; enable Tous click-to-edit tooltip |
| **6.2** | Embeds `event-dispos-tab` in full tab shell |
| **6.4** | Real `pastSelectionCount` in chance calculator |
| **6.5** | Candidate ordering from same summary DTO |

Keep summary DTO stable — add fields rather than breaking renames.

### Security & permissions

- Summary exposes **all participants' availability status and role candidacy** to troupe members — intentional per UX (*Tous* visible to all with event access).
- Do **not** expose participant **email** in summary (use selector/admin DTOs for that).
- Server recomputes candidates — never trust client filtering for org views.
- Rate-limit not required MVP ; single payload per tab open meets **NFR-P2**.

### Testing requirements

| Layer | What to test |
|-------|----------------|
| API integration | Summary shape ; role filtering ; empty roleKeys ; 403 ; equal chances stub |
| Chance unit | Weight math ; zero candidates → empty list ; single candidate → 100% |
| Angular component | Moi/Tous ; accordion ; subject selector gating ; read-only other subject |
| A11y | Accordion keyboard ; Moi/Tous toggle focus ; tab order in toolbar |
| Regression | **5.1**/**5.2** dialog + agenda tests still green |

### Previous story intelligence (5.2 — patterns to extend)

From **5.2** ([`5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md`](./5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md)):

1. **`roleKeys`** JSON column on `event_availability` (migration **V16**) — summary must read it.
2. **Dispo générale** (`roleKeys: []` while available) — critical for **Tous** candidate lists.
3. **Do not rewrite** dialog — extract shared form for **5.3** Moi panel.
4. **Volunteer auto-rule** applies only on **write** — summary displays persisted keys only.
5. **Interim `user_id` subject** — join via participant linkage ; document `participant_id` debt.
6. Story **5.2** explicitly deferred org aggregate to **5.3** — this story adds the first **cross-participant read** endpoint.

From **5.1** (**done**):

1. Immediate save UX — extend to inline Moi panel.
2. Agenda badge unchanged — no role summary on agenda cards.
3. `/availability/me` remains self-edit only until **5.5**.

From **3.8** (**done**):

1. **`GET .../participants/selectors`** for subject dropdown labels/avatars.
2. Event-only participants appear in summary union for that spectacle.

### Git intelligence (recent work)

Recent commits reinforce patterns:

- `843cf61 feat(availability): Add per-event availability entry` — availability package layout, integration tests.
- `f0b5c5e feat(participants): Add season and event rosters` — participant union for eligibility.
- `d8d2178 feat(member-profile): Add popover and preferred roles` — avatar URL patterns for grids.

Uncommitted **5.2** work in tree: [`availability-dialog.ts`](../../apps/web/src/app/shared/availability/availability-dialog.ts), [`AvailabilityRoleRules.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt) — **5.3 depends on 5.2 merged first** (roleKeys on reads).

### Latest tech notes

- **Angular 21** standalone components ; **Material** `MatExpansionPanel` or custom accordion for Tous ; `MatButtonToggleGroup` for Moi/Tous.
- **Spring Boot 3.x** — no new migration required if reading existing `event_availability` + participant tables.
- **PostgreSQL / Neon** — batch-load availabilities: `findByEvent_Id(eventId)` single query.
- No new npm/Maven dependencies expected.

### Project context reference

- [SPEC.md](../../SPEC.md) — event detail Dispos tab behaviour, chance display on upcoming events.
- [DOMAIN.md](../../DOMAIN.md) — availability schema ; `%` denominator rules for history (future).
- [epics.md](../planning-artifacts/epics.md) — Epic 5, Story 5.3 AC.
- [prd.md](../planning-artifacts/prd.md) — **FR19**, **NFR-P2**, **NFR-Q1**.

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- Summary integration test initially failed: `@Transactional(readOnly = true)` blocked `ensureMembershipParticipants` writes — fixed by using read-write transaction on `getSummary`.
- Angular `AvailabilityForm` field initializers accessed required inputs before binding — moved init to `effect()`.

### Completion Notes List

- Added `GET .../availability/summary` with participant union, role candidate filtering, and V1-weighted chance % (stub `pastSelectionCount = 0`).
- Extracted `AvailabilityForm` shared by MatDialog (agenda) and inline Moi panel on event detail.
- Upgraded `event-detail-placeholder` with Infos | Dispos | Équipe tabs, `?tab=dispos` query param, organizer subject selector, Tous accordion grids.
- Tests: 22 API availability tests, 170 Angular tests, production build OK.

### File List

- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityRoleRulesTest.kt
- services/api/openapi/availability.yaml
- apps/web/src/app/core/availability/availability-api.service.ts
- apps/web/src/app/core/availability/availability-chances.ts
- apps/web/src/app/core/availability/availability-chances.spec.ts
- apps/web/src/app/core/permissions/organizer-permissions.ts
- apps/web/src/app/shared/availability/availability-form.ts
- apps/web/src/app/shared/availability/availability-form.html
- apps/web/src/app/shared/availability/availability-form.scss
- apps/web/src/app/shared/availability/availability-dialog.ts
- apps/web/src/app/shared/availability/availability-dialog.html
- apps/web/src/app/shared/availability/availability-dialog.types.ts
- apps/web/src/app/shared/availability/availability-dialog.spec.ts
- apps/web/src/app/shared/availability/availability-moi-panel.ts
- apps/web/src/app/shared/availability/availability-moi-panel.html
- apps/web/src/app/shared/availability/availability-subject-selector.ts
- apps/web/src/app/shared/availability/availability-subject-selector.html
- apps/web/src/app/shared/availability/availability-subject-selector.scss
- apps/web/src/app/shared/availability/availability-tous-panel.ts
- apps/web/src/app/shared/availability/availability-tous-panel.html
- apps/web/src/app/shared/availability/availability-tous-panel.scss
- apps/web/src/app/shared/availability/event-dispos-tab.ts
- apps/web/src/app/shared/availability/event-dispos-tab.html
- apps/web/src/app/shared/availability/event-dispos-tab.scss
- apps/web/src/app/shared/availability/event-dispos-tab.spec.ts
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.html
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.scss
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts

### Review Findings

- [x] [Review][Patch] D2→P8 — Double entrée summary si même `userId` sur deux participant rows sans lien `seasonParticipant` : dédupliquer par `userId` dans `loadEligibleParticipants` (garder le participant saison en priorité) [`AvailabilityService.kt`]
- [x] [Review][Patch] P1 — `seasonIds` mal nommé → renommé `seasonParticipantIds` [`AvailabilityService.kt`]
- [x] [Review][Patch] P2 — Onglet Dispos non rechargé si l'événement change : remplacé `ngOnInit`+`loadStarted` par un `effect()` sur `event().id` [`event-dispos-tab.ts`]
- [x] [Review][Patch] P3 — Supprimé le fallback `participants[0]` : si l'utilisateur n'a pas de participant lié, `subjectParticipantId` reste vide → état vide visible [`event-dispos-tab.ts`]
- [x] [Review][Patch] P4 — Ajout `loadRequestId` sur `load()` et `reloadSummary()` pour ignorer les réponses obsolètes [`event-dispos-tab.ts`]
- [x] [Review][Patch] P5 — Ajout état d'erreur `loadError` + `@else if (loadError())` avec message et bouton « Réessayer » [`event-dispos-tab.html`, `event-dispos-tab.ts`]
- [x] [Review][Patch] P6 — Ajout `@else` dans la branche Moi quand `subjectParticipant()` est null : message explicite [`event-dispos-tab.html`]
- [x] [Review][Patch] P7 — Reset du sujet vers soi si le participant disparaît du summary après reload [`event-dispos-tab.ts`]
- [x] [Review][Defer] W1 — GET /summary déclenche `ensureMembershipParticipants` (écriture dans transaction lecture) — design voulu pour cohérence du roster, pré-existant [`AvailabilityService.kt`] — deferred, pre-existing
- [x] [Review][Defer] W2 — Arrondissements des % ne totalisent pas toujours 100 — inhérent au stub `pastSelectionCount=0`, revisiter Epic 6 [`AvailabilityChanceCalculator.kt`] — deferred, pre-existing
- [x] [Review][Defer] W3 — Accordéons Tous réinitialisés (tous ouverts) à chaque reload du summary — UX mineure [`availability-tous-panel.ts:29`] — deferred, pre-existing
- [x] [Review][Defer] W4 — `requiredCount` algébriquement neutre dans le stub actuel (annulé dans le ratio malus/total) — pertinent quand Epic 6 injecte l'historique [`AvailabilityChanceCalculator.kt`] — deferred, pre-existing
- [x] [Review][Defer] W5 — Purple active state Moi/Tous toggle non vérifiable sans contenu SCSS dans le diff — deferred, pre-existing

## Change Log

- 2026-05-24: Story 5.3 — summary API, Dispos tab (Moi/Tous), shared availability form, organizer read-only subject view.

## References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.3](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md — Dispos tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab)
- [Source: _bmad-output/planning-artifacts/prd.md — FR19](../planning-artifacts/prd.md)
- [Source: _bmad-output/implementation-artifacts/5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md](./5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md)
- [Source: _bmad-output/implementation-artifacts/5-1-saisie-de-disponibilite-par-evenement-etats-dispo-pas-dispo-non-renseigne.md](./5-1-saisie-de-disponibilite-par-evenement-etats-dispo-pas-dispo-non-renseigne.md)
- [Source: _bmad-output/implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md](./3-8-rosters-participants-saison-et-evenement.md)
- [Source: legacy/src/components/EventRoleGroupingView.vue](../../legacy/src/components/EventRoleGroupingView.vue)
- [Source: legacy/src/services/chancesService.js](../../legacy/src/services/chancesService.js)
- [Source: legacy/src/services/playerAvailabilityService.js](../../legacy/src/services/playerAvailabilityService.js)

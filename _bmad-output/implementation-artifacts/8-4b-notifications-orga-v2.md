---
baseline_commit: 3d1fba96
parent_story: 8-4-notifications-ops-organisateurs
spec_kernel: _bmad-output/specs/spec-notifications-orga-v2/SPEC.md
---

# Story 8.4b: Organizer ops notifications v2 refinements (FR31b extension)

**Status:** done

**Story ID:** 8.4b  
**Story key:** `8-4b-notifications-orga-v2`  
**Epic:** 8 — Notifications (push, email, preferences)  
**Priority:** **P2** — post-ship extension of story **8.4** (FR31b)  
**Spec (canonical):** [`SPEC.md`](../specs/spec-notifications-orga-v2/SPEC.md) · companions: [`orga-notification-catalog.md`](../specs/spec-notifications-orga-v2/orga-notification-catalog.md), [`orga-recipient-rules.md`](../specs/spec-notifications-orga-v2/orga-recipient-rules.md), [`role-promotion-alerts.md`](../specs/spec-notifications-orga-v2/role-promotion-alerts.md)  
**Catalogue runtime:** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Ops organisateur (runtime v2)  
**Parent (brownfield):** [`8-4-notifications-ops-organisateurs.md`](./8-4-notifications-ops-organisateurs.md) (shipped — cascade, `ASSIGNEE_DECLINED`, 8.4 copy)  
**UX prefs:** [`ux-notification-prefs-orga-section-brief.md`](../planning-artifacts/ux-notification-prefs-orga-section-brief.md)  
**Depends:** Story **8.4** (review/done — dispatcher, prefs opt-in, jobs, UI section), **3.5** (organizer delegation API), **3.21** (draft gate), **17.15** (organizer list on Infos tab)  
**Blocks (soft):** *(closed — catalogue runtime v2 aligné, story done)*

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As an **event or season organizer** (or troupe admin receiving a new coordination role),  
I want **explicit delegation, clearer French labels, per-intent audiences, team-regression alerts, and a one-shot transactional email when I am promoted**,  
so that **ops notifications match how coordination actually works** — without implicit cascade surprises (FR31b v2, spec CAP-1…CAP-7).

---

## Critical distinctions (do not regress)

| Topic | **Keep as-is** | **Change in 8.4b** |
|-------|----------------|---------------------|
| Member `TEAM_COMPLETE_MEMBER` (**8.9**) | Opt-out `TEAM_CONFIRMED` ; assignees + event orgas | Unchanged |
| Orga `TEAM_COMPLETE` | Opt-in `ORG_TEAM_COMPLETE` ; lifecycle `→ COMPLETE` | Audience → **event organizers only** (not cascade) |
| Dual dispatch on `→ COMPLETE` | Both intents fire independently | Unchanged |
| Orga prefs model | Opt-in OFF/OFF default for `ORG_*` | Unchanged (CAP-2) |
| `COMPOSITION_SHARED` | Orga-only ; hidden from member prefs | Audience → **event organizers only** (retire circle) |
| Decline on validated compo | `ASSIGNEE_DECLINED` immediate dispatch | Replace with lifecycle **`TEAM_REGRESSED`** on `COMPLETE → ¬COMPLETE` |
| Recipient resolver | `resolveOrganizerCascadeRecipients` + `resolveOrganizerCircleRecipients` | Per-intent explicit lists per [`orga-recipient-rules.md`](../specs/spec-notifications-orga-v2/orga-recipient-rules.md) |
| Event create | No event organizers seeded | Copy season orgas → event orgas (CAP-7) |

**Frozen product decisions (do not reopen):** no implicit cascade in v2 ; promotion email is transactional even if ops prefs OFF ; regression has **no daily dedupe** ; immediate event signals → event orgas only ; scheduled reminders → event + season escalation with per-user dedupe per tick ; **no backfill** on existing events (OQ-5c).

---

## Acceptance Criteria

### CAP-1 — French labels & payload copy (AC 1–3)

1. **Given** `/compte/notifications` → section **Alertes organisateur**, **when** orga pref rows render, **then** titles and descriptions match v2 copy — in particular: **Nouveau spectacle** (not « Nouveau brouillon »), **Compo proposée** (not « Brouillon partagé »), **Équipe plus complète** (replaces **Déclin immédiat**). [Source: CAP-1 ; `orga-notification-catalog.md` ; FR31b ; NOTIFICATIONS_CATALOG § Copy normative v2]

2. **Given** each orga intent in CAP-1 fires with channel allowed, **when** [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) builds push/email, **then** push titles and email subjects match the normative v2 table (e.g. `📝 Nouveau spectacle`, `👥 Compo proposée`, `⚠️ Équipe plus complète` with `{reasonSummary}` in body). [Source: CAP-1 ; `orga-notification-catalog.md` ; NOTIFICATIONS_CATALOG]

3. **Given** story ship, **when** OpenAPI + `GET /v1/me/notification-preferences` expose orga categories, **then** long API `label` fields align with v2 descriptions where applicable ; **`ORG_ASSIGNEE_DECLINED` is removed** ; **`ORG_TEAM_REGRESSED`** and **`ORG_SCOPE_GRANTED`** are added. [Source: CAP-1 ; CAP-3 ; `notification-preferences.yaml`]

### CAP-2 — Opt-in unchanged (AC 4)

4. **Given** a user gains organizer scope (season, event, or troupe admin), **when** they open prefs and no `ORG_*` row exists in JSON, **then** every orga ops category remains **push OFF, email OFF** — grant does **not** pre-enable any ops pref. [Source: CAP-2 ; SPEC constraints ; 8.4 AC11]

### CAP-3 — Transactional promotion email (AC 5–7)

5. **Given** a **new** grant of event organizer, season organizer, or troupe `TROUPE_ADMIN` (idempotent re-grant returns existing row unchanged), **when** the grant transaction commits, **then** intent **`ORGANIZER_SCOPE_GRANTED`** dispatches a **one-shot transactional email** to the granted user with subject `Tu es {roleLabel} sur HatCast`, body naming scope + CTA link to `/compte/notifications` — **exempt from ops opt-in**. [Source: CAP-3 ; `role-promotion-alerts.md` ; OQ-2]

6. **Given** the same grant, **when** push is attempted, **then** push is sent **only if** optional pref `ORG_SCOPE_GRANTED` push is ON (default OFF) ; transactional email still sends regardless. [Source: CAP-3 ; `role-promotion-alerts.md`]

7. **Given** dedupe for promotion, **when** the same user is re-granted the same scope without row deletion, **then** no second transactional email fires (dedupe key: user + role kind + scope id). [Source: CAP-3 ; `role-promotion-alerts.md`]

### CAP-4 — `TEAM_REGRESSED` replaces `ASSIGNEE_DECLINED` (AC 8–11)

8. **Given** a **validated** composition (`validatedAt != null`), **when** lifecycle transitions **`before == COMPLETE && after != COMPLETE`** in [`CompositionLifecycleAuditRecorder.recordIfChanged`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt), **then** intent **`TEAM_REGRESSED`** dispatches **after commit** to **event organizers** (per CAP-5), with **`reasonSummary`** in payload context. [Source: CAP-4 ; `orga-notification-catalog.md` § Triggers]

9. **Given** each distinct `COMPLETE → ¬COMPLETE` edge, **when** dispatch runs, **then** exactly **one** `TEAM_REGRESSED` alert per edge per opted-in event organizer — **no daily dedupe** (contrast SLA/weekly marks). [Source: CAP-4 ; OQ-3 ; SPEC]

10. **Given** causes listed in companion (decline, participation reset to `PENDING`, slot cleared, composition unlock), **when** each causes the edge above, **then** `reasonSummary` reflects the cause (e.g. `déclin de {name}`, `confirmation à renouveler`, `composition déverrouillée`, `place à pourvoir`). [Source: CAP-4 ; `orga-notification-catalog.md`]

11. **Given** story ship, **when** codebase is searched, **then** **`ASSIGNEE_DECLINED`** intent and **`ORG_ASSIGNEE_DECLINED`** category are **removed** from dispatcher, prefs API, OpenAPI, UI copy, and tests — decline path no longer publishes `AssigneeDeclinedEvent` for orga ops (lifecycle hook owns regression). [Source: CAP-4 ; NOTIFICATIONS_CATALOG § Retire]

### CAP-5 — Per-intent audiences (AC 12–15)

12. **Given** intent **`EVENT_DRAFT_CREATED`**, **when** recipients resolve, **then** audience = **season organizers** only (exclude actor when `actorUserId` set). [Source: CAP-5 ; `orga-recipient-rules.md`]

13. **Given** intents **`COMPOSITION_SHARED`**, **`TEAM_COMPLETE`**, **`TEAM_REGRESSED`**, **when** recipients resolve, **then** audience = **event organizers** only — **not** cascade, **not** organizer circle union. [Source: CAP-5 ; retires 8.4 AC8–9]

14. **Given** intents **`SLA_OPEN_AVAILABILITY`**, **`COMPOSITION_INCOMPLETE_WEEKLY`**, **`COMPOSITION_INCOMPLETE_DAILY_J7`**, **when** scheduled jobs resolve recipients, **then** audience = union of **event organizers + season organizers**, deduped by `userId` — **at most one delivery per user per intent per scheduled tick** even if user holds both roles. [Source: CAP-5 ; `orga-recipient-rules.md` § Scheduled reminder dedupe]

15. **Given** Pierrick (season organizer) and Charlene (event organizer) on Improbots seed troupe, **when** recette scenarios in [`orga-recipient-rules.md`](../specs/spec-notifications-orga-v2/orga-recipient-rules.md) § Recette matrix are executed with prefs ON, **then** Mailpit `SENT` matches the matrix deterministically (draft → Pierrick only ; compo/complete/regression → Charlene when sole event orga ; reminders escalate to both when both roles + opted in). [Source: CAP-5 ; CAP-6 ; FR31b]

### CAP-6 — Dev recette seed (AC 16)

16. **Given** local dev per [`DEVELOPMENT.md`](../../DEVELOPMENT.md) (seed `@seed.improbots.test`, password = `users.slug`, Mailpit with `--with-push` or email enabled), **when** recette runs without seed changes, **then** login + prefs opt-in + orga email paths remain valid — **no seed rework** unless regression found ; document any new seed accounts only if CAP-7 forces it. [Source: CAP-6 ; DEVELOPMENT.md]

### CAP-7 — Explicit event organizer delegation (AC 17–20)

17. **Given** a new event is created via [`EventService.create`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt), **when** the event row is persisted, **then** all **season organizers** are copied to **event organizers** ; if no season organizers exist, active **troupe admins** are promoted to season organizers first, then copied. [Source: CAP-7 ; `orga-recipient-rules.md` § Domain]

18. **Given** any event after creation, **when** organizer lists are inspected, **then** **≥1 event organizer** always exists ; API [`revokeEventOrganizer`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) rejects removal of the **last** event organizer without assigning a replacement first (HTTP 409 or equivalent clear error). [Source: CAP-7 ; SPEC invariant]

19. **Given** a member (non-manager) views event Infos, **when** `event_organizers` exist, **then** organizer names remain **visible** as contact (existing [`event-infos-tab`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) behaviour — verify still works after CAP-7 seeding). [Source: CAP-7 ; story 17.15]

20. **Given** season organizers are added/removed **after** event creation, **when** time passes, **then** event organizer list does **not** auto-sync — manual co-orga/delegate only ; **no Flyway backfill** on pre-existing events without event organizers (OQ-5c). [Source: CAP-7 ; SPEC Non-goals]

### Cross-cutting (AC 21–22)

21. **Given** any v2 orga intent, **when** domain mutation succeeds but notification fails, **then** domain state unchanged ; NFR-R2 per-recipient isolation in dispatcher. [Source: 8.4 AC10 ; SPEC constraints]

22. **Given** story complete, **when** catalogue is updated, **then** remove § **Écart runtime (8.4 livré)** note ; mark `TEAM_REGRESSED` and `ORGANIZER_SCOPE_GRANTED` **Actif** ; confirm cascade/circle documented as **retired**. [Source: NOTIFICATIONS_CATALOG ; AGENTS.md]

**Product coverage:** FR31b v2 ; CAP-1…CAP-7 ; decisions OQ-1…OQ-5 (frozen).  
**Out of scope:** Inbox `/accueil` ; prefs per season/troupe ; brownfield backfill ; member→orga messaging ; auto-removal of season orgas when delegate added ; changing member notification semantics.

---

## Normative copy — v2 (implement verbatim)

See [`orga-notification-catalog.md`](../specs/spec-notifications-orga-v2/orga-notification-catalog.md) and NOTIFICATIONS_CATALOG § Copy normative (v2). Key UI rows:

| API key | UI title | UI description (pattern) |
|---------|----------|----------------------------|
| `ORG_EVENT_DRAFT_CREATED` | **Nouveau spectacle** | Me prévenir quand un spectacle **en brouillon** est créé (dispos pas encore ouvertes). |
| `ORG_DRAFT_COMPOSITION` | **Compo proposée** | Me prévenir quand une composition est **partagée** avec le cercle orga. |
| `ORG_TEAM_COMPLETE` | **Équipe bouclée** | Me prévenir quand toutes les confirmations sont reçues (lifecycle complet). |
| `ORG_TEAM_REGRESSED` | **Équipe plus complète** | Me prévenir quand une équipe **confirmée** n'est plus complète (déclin, statut à confirmer, déverrouillage, etc.). |
| `ORG_SCOPE_GRANTED` | **Nouveau rôle orga** | Me prévenir par notification push quand on m'ajoute comme orga de spectacle, orga de saison ou admin de troupe. |
| `ORG_SLA_OPEN_AVAILABILITY` | **Ouvrir les dispos** | *(unchanged)* |
| `ORG_COMPOSITION_INCOMPLETE` | **Compo incomplète** | *(unchanged)* |

**Retire:** `ORG_ASSIGNEE_DECLINED` / « Déclin immédiat ».

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** updated orga pref rows on `/compte/notifications`, **when** rendered, **then** reuse existing `mat-slide-toggle` grid in [`notification-preferences-section`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) — no custom toggles. [Source: FRONTEND_UI.md ; 8.4 M3-1]

**M3-2. Tokens & theme** — **Given** copy-only changes, **when** styled, **then** `--mat-sys-*` tokens only ; titles outside card pattern unchanged. [Source: 8.2b as-shipped]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** new/changed rows render, **then** toggles ≥ 48dp ; French `aria-label` on switches including renamed rows (**Équipe plus complète**, **Nouveau spectacle**, etc.). [Source: NFR-A1]

**M3-4. Member navigation** — **Given** prefs page only, **when** updating copy/keys, **then** no account shell / tab / rail changes. [Source: 8.4 M3-4]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** FRONTEND_UI.md § Checklist M3 ; S3 guérilla test updated: user finds **Équipe plus complète** (not « Déclin immédiat ») in **Alertes organisateur** < 20s. [Source: ux brief ; AGENTS.md]

**CAP-7 UI (if API error surfaced):** last-organizer removal guard — if web calls `removeEventOrganizer`, surface API error via existing Material pattern (`MatSnackBar` or dialog) ; no new custom alert divs.

---

## Tasks / Subtasks

Recommended order: **Lot A** (domain + audiences) before **Lot B** (intents/copy/prefs) so resolver and CAP-7 invariant are stable before copy/recette.

### Lot A — Domain + audiences (CAP-7, CAP-5)

- [x] **Scope:** `services/api/` (+ minimal web if last-orga guard UX) — AC 12–14, 17–20
- [x] **CAP-7 event create:** In `EventService.create` (after save), copy season organizers → `event_organizers` ; fallback troupe admins → season organizers → copy. Extract helper on `OrganizerAccessService` or dedicated seeding service to avoid duplicating grant audit logic.
- [x] **CAP-7 invariant:** In `OrganizerAccessService.revokeEventOrganizer`, reject when `count == 1` unless replacement flow exists ; add integration test.
- [x] **CAP-5 resolver:** Replace cascade/circle usage in [`NotificationDispatcher.resolveRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) with per-intent methods on [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt):
  - `resolveSeasonOrganizerRecipients(seasonId, actorUserId?)`
  - `resolveEventOrganizerRecipients(eventId, actorUserId?)`
  - `resolveEventAndSeasonOrganizerRecipients(eventId, seasonId, actorUserId?)` with dedupe
  - Deprecate or restrict `resolveOrganizerCascadeRecipients` / `resolveOrganizerCircleRecipients` to tests only or delete if unused
- [x] **Jobs:** Wire `OrganizerSlaOpenAvailabilityJob` + `CompositionIncompleteReminderJob` to escalation resolver ; verify per-tick dedupe when user is both event + season orga.
- [x] **Tests:** Update `NotificationRecipientResolverTest`, `OrganizerOpsRecipientMatrixIntegrationTest` for Pierrick/Charlene matrix scenarios.

### Review Findings (Lot A — patches applied 2026-06-09)

- [x] [Review][Patch] Matrice recette Pierrick/Charlene — `OrganizerOpsRecipientMatrixIntegrationTest`
- [x] [Review][Patch] Test garde dernier orga événement — `OrganizerControllerIntegrationTest`
- [x] [Review][Patch] Tests audiences par intent — resolver + matrix integration
- [x] [Review][Patch] Seeding saison avec audit — `bootstrapSeasonOrganizer` dans `OrganizerAccessService`
- [x] [Review][Patch] Invariant ≥1 event organizer — exception si seed impossible
- [x] [Review][Patch] `displayName` jobs planifiés — `recipientsFromExplicitUserIds`
- [x] [Review][Patch] `requireTroupeId` retiré (code mort)
- [x] [Review][Patch] Dedupe dual rôle au niveau job — tests SLA + compo incomplète
- [x] [Review][Patch] Cadence hebdo non écoulée — test `CompositionIncompleteReminderJobTest`
- [x] [Review][Patch] Exclusion acteur saison — `resolveSeasonOrganizerRecipients excludes actor`

### Lot B — Intents, copy, prefs, promotion (CAP-1, CAP-2, CAP-3, CAP-4)

- [x] **Scope:** `services/api/` + `apps/web/` + OpenAPI + catalogue — AC 1–11, 5–7, 21–22, M3
- [x] **CAP-4 lifecycle:** Extend `CompositionLifecycleAuditRecorder.recordIfChanged` — on `COMPLETE → ¬COMPLETE`, publish `TeamRegressedOrganizerRequestedEvent` with `reasonSummary` derived from transition context (decline already recorded in participation service — prefer lifecycle-centric hook over duplicate `AssigneeDeclinedEvent`).
- [x] **CAP-4 cleanup:** Remove `ASSIGNEE_DECLINED`, `AssigneeDeclinedEvent` listener path, `ORG_ASSIGNEE_DECLINED` ; add `TEAM_REGRESSED` + `ORG_TEAM_REGRESSED` in `NotificationIntent.kt` / `toCategory()`.
- [x] **CAP-3 promotion:** Hook `grantEventOrganizer`, `grantSeasonOrganizer`, and troupe admin promotion (`TroupeMembership` baseline role → `TROUPE_ADMIN`) to dispatch `ORGANIZER_SCOPE_GRANTED` after commit ; transactional email bypasses ops opt-in gate in dispatcher or dedicated adapter ; push respects `ORG_SCOPE_GRANTED`.
- [x] **CAP-1 payloads:** Update `NotificationPayloadBuilder` v2 copy ; extend `NotificationDispatchContext` with `reasonSummary` if needed.
- [x] **CAP-1/CAP-2 prefs API:** Update `UserNotificationPreferencesService` category list, OpenAPI enum, default opt-in unchanged for `ORGANIZER_ALERTS`.
- [x] **Web:** Update [`notification-preference-orga-ui-copy.ts`](../../apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts) keys/order (`ORG_TEAM_REGRESSED`, `ORG_SCOPE_GRANTED` ; remove `ORG_ASSIGNEE_DECLINED`) ; [`me-notification-preferences-api.service.ts`](../../apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts) types ; [`notification-preferences-section.spec.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts).
- [x] **Tests:** `NotificationPayloadBuilderOrganizerOpsTest` v2 copy ; `TEAM_REGRESSED` decline integration ; `MeNotificationPreferencesIntegrationTest` new keys. *(Unlock/gap/promotion idempotency : couverture partielle — dedupe via `NotificationReminderMarkService`.)*
- [x] **Docs:** NOTIFICATIONS_CATALOG — close runtime gap ; `./gradlew test` + targeted Vitest green.

### Review Findings (Lot B — patches applied 2026-06-09)

- [x] [Review][Patch] **CAP-4** — `TeamRegressedOrganizerRequestedEvent` sur `COMPLETE → ¬COMPLETE`
- [x] [Review][Patch] **CAP-4 / AC 11** — Chemin `AssigneeDeclinedEvent` retiré ; lifecycle + `reasonSummary`
- [x] [Review][Patch] **CAP-4** — `TEAM_REGRESSED` / `ORG_TEAM_REGRESSED` ; retrait `ASSIGNEE_DECLINED`
- [x] [Review][Patch] **CAP-4** — `CompositionLifecycleTransitionContext` branché (déclin, reset PENDING, unlock, slot clear)
- [x] [Review][Patch] **CAP-3** — `OrganizerScopeGranted*` + `OrganizerScopeGrantedNotificationService`
- [x] [Review][Patch] **CAP-3** — Hooks grant saison/événement + promotion `TROUPE_ADMIN`
- [x] [Review][Patch] **CAP-1** — Copy UI v2 (`Équipe plus complète`, `Nouveau spectacle`, `Compo proposée`)
- [x] [Review][Patch] **CAP-1** — Payloads `TEAM_REGRESSED` avec `{reasonSummary}`
- [x] [Review][Patch] **CAP-1 / AC 3** — OpenAPI `ORG_TEAM_REGRESSED` + `ORG_SCOPE_GRANTED`
- [x] [Review][Patch] **AC 22** — `NOTIFICATIONS_CATALOG.md` aligné runtime v2
- [x] [Review][Patch] **M3-5** — Vitest `Équipe plus complète` / `org-team-regressed`
- [x] [Review][Patch] **Tests** — `OrganizerOpsNotificationIntegrationTest` → `TEAM_REGRESSED`

### Lot C — Tests complémentaires & catalogue (AC 7–10, 22, CAP-6)

- [x] **TEAM_REGRESSED edges** — tests intégration déclin, déverrouillage, reset `PENDING` (`OrganizerOpsNotificationIntegrationTest`)
- [x] **Promotion CAP-3** — email transactionnel + dedupe idempotent (`OrganizerScopeGrantedNotificationIntegrationTest`)
- [x] **Catalogue AC 22** — `TEAM_REGRESSED` et `ORGANIZER_SCOPE_GRANTED` marqués **Actif** ; cascade/cercle documentés comme retirés
- [x] **Validation** — `./gradlew test --tests "com.hatcast.api.notification.*"` vert

### Lot D — Gate Murat defer gaps (CONCERNS → PASS)

- [x] **AC10** — `OrganizerOpsNotificationIntegrationTest` : slot clear validé → `TEAM_REGRESSED` `place à pourvoir`
- [x] **AC9** — `OrganizerOpsNotificationIntegrationTest` : 2 edges `COMPLETE→¬COMPLETE` → 2 dispatches (pas de dedupe journalier)
- [x] **AC3** — `MeNotificationPreferencesIntegrationTest` : `ORG_SCOPE_GRANTED` présent ; `ORG_ASSIGNEE_DECLINED` absent
- [x] **AC1** — Vitest copy v2 : Nouveau spectacle, Compo proposée, Nouveau rôle orga
- [x] **AC6** — `OrganizerScopeGrantedNotificationServiceTest` : push ON si pref `ORG_SCOPE_GRANTED`
- [x] **AC17** — `OrganizerControllerIntegrationTest` : seed event organizers à la création (+ wire `EventService.create`)
- [x] **Validation** — `./gradlew test --tests "com.hatcast.api.notification.*"` vert · Vitest prefs 17/17 vert

---

### Current runtime vs v2 target (read before coding)

| Area | **Shipped 8.4 (today)** | **v2 target** |
|------|-------------------------|---------------|
| `EventService.create` | Publishes `EventDraftCreatedEvent` only ; **no** `event_organizers` rows | Copy season orgas → event orgas (CAP-7) |
| `revokeEventOrganizer` | Deletes last organizer allowed | Reject last removal without replacement |
| `NotificationDispatcher` | Cascade for most orga intents ; circle for `COMPOSITION_SHARED` | Per-intent matrix (CAP-5) |
| `CompositionLifecycleAuditRecorder` | Publishes `TeamComplete*` on `→ COMPLETE` only | Add `COMPLETE → ¬COMPLETE` → `TEAM_REGRESSED` |
| `CompositionParticipationService` | Publishes `AssigneeDeclinedEvent` on decline | Remove ; lifecycle owns regression |
| Intents / categories | `ASSIGNEE_DECLINED` / `ORG_ASSIGNEE_DECLINED` | `TEAM_REGRESSED` / `ORG_TEAM_REGRESSED` |
| Promotion grant | Audit only | + `ORGANIZER_SCOPE_GRANTED` transactional email |
| UI copy | Nouveau brouillon, Brouillon partagé, Déclin immédiat | CAP-1 v2 labels |
| Member organizer visibility | `event-infos-tab` shows organizers when `length > 0` | CAP-7 ensures new events always have ≥1 |

### Per-intent resolver sketch (normative)

```text
EVENT_DRAFT_CREATED:
  recipients = seasonOrganizerRepository.findBySeason_Id(seasonId)

COMPOSITION_SHARED | TEAM_COMPLETE | TEAM_REGRESSED:
  recipients = eventOrganizerRepository.findByEvent_Id(eventId)

SLA_OPEN_AVAILABILITY | COMPOSITION_INCOMPLETE_*:
  recipients = distinctByUserId(eventOrgas ∪ seasonOrgas)
  // jobs: one mark per user per intent per tick (existing NotificationReminderMarkService)
```

**Do not** fall back to troupe admin for ops intents when event organizer list is empty — CAP-7 guarantees ≥1 event organizer on new events ; brownfield empty lists are out of scope (OQ-5c).

### `TEAM_REGRESSED` — `reasonSummary` hints

Capture at lifecycle edge in recorder or pass via event payload:

| Transition context | `reasonSummary` |
|--------------------|-----------------|
| Decline row written | `déclin de {assigneeName}` |
| Status → `PENDING` on validated slot | `confirmation à renouveler` |
| Assignee cleared / gap | `place à pourvoir` |
| Unlock composition | `composition déverrouillée` |

Only fire when `validatedAt != null` and `before == COMPLETE`.

### Promotion email — implementation guardrails

- Fire only on **new** row insert (existing idempotent grant returns early — see `grantSeasonOrganizer` / `grantEventOrganizer` patterns).
- Troupe admin: detect **baseline role promotion** to `TROUPE_ADMIN` (membership update), not every save.
- Email channel: bypass `ORGANIZER_ALERTS` opt-in check ; still require non-blank `users.email`.
- Push channel: normal pref gate on `ORG_SCOPE_GRANTED`.
- Deep link: `/compte/notifications` (absolute URL in email per existing builder patterns).

### Architecture compliance

| Rule | Implementation |
|------|----------------|
| After-commit | Domain events → `@TransactionalEventListener(AFTER_COMMIT)` ; promotion hook after grant transaction |
| Orga ≠ member prefs | Disjoint keys ; `ORG_SCOPE_GRANTED` email exempt only for transactional grant |
| NFR-R2 | Per-recipient try/catch in dispatcher (8.3 pattern) |
| A1 | Ship pref rows with dispatch — add `ORG_TEAM_REGRESSED` + `ORG_SCOPE_GRANTED` UI rows same release |
| No cascade v2 | Delete or stop calling cascade/circle for orga ops intents |

### Explicit non-goals

- Inbox/history on `/accueil`
- Per-season/troupe pref matrices
- Backfill `event_organizers` on existing events
- Notify other orgas when someone is promoted
- Revocation alerts
- `TEAM_REGRESSED` when composition never reached `COMPLETE`
- Reopening D5:B « decline only » — superseded by spec v2

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 8.4 | review | Parent — extend, do not rewrite from scratch |
| 8.9 | done | `TEAM_COMPLETE_MEMBER` untouched |
| 3.5 | done | Organizer grant/revoke API |
| 3.21 | done | Draft create gate |
| 17.15 | done | Organizer list on Infos tab |
| 8.2b | done | UI copy/grid pattern |

### Previous story intelligence (8.4)

- Cascade + circle shipped and tested — **replace resolver wiring**, keep dispatcher/prefs/job shell.
- `OrganizerOpsNotificationIntegrationTest` is the primary integration harness — extend for v2 matrix, do not fork.
- Opt-in defaults in `UserNotificationPreferencesService` — only add categories, do not flip member opt-out.
- Vitest `notification-preferences-section.spec.ts` asserts « Déclin immédiat » — update to « Équipe plus complète ».
- `./gradlew test` had 3 pre-existing failures outside notification package — do not chase unless this story touches those areas.

### Git intelligence

Recent commits are Epic 17 web UX — **no conflict** with notification package. Baseline for brownfield: 8.4 file list in parent story Dev Agent Record.

### Recette checklist (Pierrick + Charlene)

Prerequisites: `./scripts/start-dev.sh` with Mailpit (`HATCAST_NOTIFICATION_EMAIL_ENABLED=true`) ; prefs **E-mail ON** per account in **Alertes organisateur**.

| Step | Actor | Action | Expected Mailpit |
|------|-------|--------|------------------|
| 1 | Orga | Create draft event | Season orga (Pierrick) receives `EVENT_DRAFT_CREATED` if pref ON |
| 2 | Pierrick | Remove self as event orga ; Charlene remains | — |
| 3 | Charlene | Publish draft compo | `COMPOSITION_SHARED` → Charlene only |
| 4 | Charlene | Complete team lifecycle | `TEAM_COMPLETE` → Charlene only |
| 5 | Assignee | Decline on validated compo | `TEAM_REGRESSED` with `déclin de…` → Charlene only |
| 6 | — | SLA / incomplete job tick | Both if both roles + prefs ON — **one** email each per tick |
| 7 | New user | Granted event orga | Transactional promotion email (prefs still OFF) |

Login: `pierrick@seed.improbots.test` / `charlene@seed.improbots.test` ; password = slug ([`DEVELOPMENT.md`](../../DEVELOPMENT.md)).

### Project context reference

- Tests: `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false --include "**/notification-preferences-section.spec.ts"`
- UI checklist: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- Push recette: `./scripts/start-dev.sh --with-push`

---

## Dev Agent Record

### Agent Model Used

Dev: Amelia (lots A/B/C) · QA gate: Murat (TEA trace 2026-06-09) · VD: Paige (2026-06-09)

### Completion Notes List

- Lots A/B/C livrés ; patches review Amelia 2026-06-09 appliqués.
- Recette Mailpit Pierrick/Charlene (CK Patrice 2026-06-09) — 7/7 PASS.
- Gate TEA Murat (2026-06-09) : `CONCERNS` → **done** (P0 100 %, waiver AC16 ; gaps tests = defer qualité).
- **Lot D (2026-06-09)** : gaps defer Murat combés — AC1/3/6/9/10/17 ; wire `seedEventOrganizersFromSeason` dans `EventService.create` ; slot clear validé + `place à pourvoir` ; suites vertes (164 notif + 17 Vitest).
- VD Paige (2026-06-09) : NOTIFICATIONS_CATALOG AC22 **PASS** — patches M1–M3 appliqués.
- `./gradlew test --tests "com.hatcast.api.notification.*"` vert · Vitest prefs 17/17 vert.
- Trace : `_bmad-output/test-artifacts/traceability/traceability-matrix-8-4b.md`

### File List

_(confirmé — commit `33d9120d` + clôture VD 2026-06-09)_

**API — composition & event**

- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt

**API — tests (Lot D)**

- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerOpsNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/MeNotificationPreferencesIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerScopeGrantedNotificationServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt

**Web (Lot D)**

- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts

**API — notification**

- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/OrganizerSlaOpenAvailabilityJob.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/CompositionIncompleteReminderJob.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/OrganizerScopeGrantedNotificationService.kt

**API — composition & organizer**

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleTransitionContext.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerScopeGrantedEvents.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerScopeGrantedEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt

**API — tests**

- services/api/src/test/kotlin/com/hatcast/api/notification/CompositionIncompleteReminderJobTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/MeNotificationPreferencesIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderOrganizerOpsTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPreferenceEligibilityAdapterTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerOpsNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerOpsRecipientMatrixIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerScopeGrantedNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerScopeGrantedNotificationServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerSlaOpenAvailabilityJobTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/StoredNotificationPreferencesTest.kt
- services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt

**Web & contrat**

- services/api/openapi/notification-preferences.yaml
- apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts
- apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts
- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts

**Docs & tracking**

- docs/v2/technical/NOTIFICATIONS_CATALOG.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/8-4b-notifications-orga-v2.md
- _bmad-output/test-artifacts/traceability/traceability-matrix-8-4b.md

### Change Log

- 2026-06-09 : Lot D — gaps defer gate Murat (AC1/3/6/9/10/17) ; wire CAP-7 seed ; slot clear validé.
- 2026-06-09 : Clôture story — runtime v2 orga (CAP-1…7) ; catalogue AC22 ; gate TEA CONCERNS→done ; VD Paige PASS (M1–M3).
- 2026-06-08 : Story created (bmad-create-story) — v2 refinements post-8.4.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (CAP-1…CAP-7, FR31b, NOTIFICATIONS_CATALOG, spec companions)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d'AC (y compris M3-x) ; lots A/B ordonnés
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / Vitest mentionnés
- [x] Distinction **`TEAM_COMPLETE` orga vs `TEAM_COMPLETE_MEMBER`** explicite
- [x] Décisions figées OQ-1…OQ-5 documentées ; hors scope explicite
- [x] Parent story 8.4 brownfield analysée — pas de réinvention

# Story 6.10b: Manual availability reminder + anti-spam guard

baseline_commit: 3c0718f8cc8a227ac804c84ef929898534673c1a

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to send a **one-click, customizable availability reminder** when roster responses are still missing,  
so that **I can nudge members without waiting for automatic reminders**, while **avoiding accidental spam** (UX-DR7, FR31 P1, SCP 2026-06-01).

## Acceptance Criteria

1. **Given** a **published** event (`availabilityOpenedAt != null`, Story **3.21**) and at least one **roster participant** with availability **`unknown`** (no row or explicit unknown — **not** « Pas dispo »), **when** an organizer with `canManageComposition` opens **« Rappel dispos »** on the **Dispos** tab, **then** the shared [`ShareAnnounceDialog`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts) opens with intent **`availability_nudge`**, title **« Rappel disponibilité »**, a **reminder** default template (⏰ tone — distinct from first-open `event` template in 6.10), editable textarea, WhatsApp action, recipient block, and **« Envoyer les notifications »** — **UX-DR7**, epics 6.10b. [Source: epics § 6.10b ; brainstorming § Category #17]

2. **Given** intent **`availability_nudge`**, **when** recipients are resolved server-side, **then** the audience is **only roster participants whose availability is `unknown`** for this event (same roster pool as `AVAILABILITY_OPENED` — season + event participants, exclusions respected) ; participants **without linked `user_id`** appear in the list as **manual** (yellow card) ; push/email eligibility follows **8.3** rules (`PushNotificationEligibilityPort`, email present, **8.2** category `AVAILABILITY_REQUEST` when port available). [Source: FR31 ; 8.3 AC5]

3. **Given** the dialog is open and the organizer clicks **« Envoyer les notifications »**, **when** the client calls **`POST …/share-recipients/notify`** with `{ intent: "availability_nudge", messageText }`, **then** the server dispatches intent **`MANUAL_AVAILABILITY_NUDGE`** via **`NotificationDispatcher`** using the **edited `messageText`** as push body / email body (title/subject from reminder template), deep link **`/saison/{slug}/event/{slug}?tab=dispos`**, returns **200** without blocking on channel failure (**NFR-R2**), and records **`lastManualNudgeAt`** for the event. [Source: SCP §4.7 ; Appendix A MANUAL_AVAILABILITY_NUDGE]

4. **Given** a manual nudge was sent **within the configured guard window** (default **3 calendar days**, property `hatcast.notifications.manual-availability-nudge-guard-days`), **when** the organizer opens **« Rappel dispos »** or attempts send, **then** the UI shows a warning **« Un rappel a déjà été envoyé il y a X jour(s) »** and a **`MatDialog` / `ConfirmDialog`** requires **explicit confirmation** before POST ; first send in window or after guard expiry sends without extra step. [Source: epics 6.10b AC2 ; brainstorming R5 ; SCP §4.8 decision 4]

5. **Given** API **`GET …/share-recipients?intent=availability_nudge`**, **when** the organizer loads the dialog, **then** the response includes **`lastManualNudgeAt`** (ISO-8601 or null) and **`guardDays`** so the client can show the warning without a separate round-trip ; **403** without `canManageComposition` ; **409** when event is still draft, archived, or **zero** unknown participants. [Source: NFR-S2]

6. **Given** intent **`draw`**, **`composition`**, or **`event`** (Story **6.10**), **when** 6.10b ships, **then** existing share/announce flows are **unchanged** ; **`requestManualAnnouncement`** for non-`availability_nudge` intents still **logs only** (draw/compo manual copy) unless product later wires them — **do not** regress 6.10 tests. [Source: 8.3 AC8 ; 6.10 explicit non-goals]

7. **Given** a member **without** `canManageComposition`, **when** they view **Dispos**, **then** **« Rappel dispos »** is **not** shown. [Source: NFR-S2]

8. **Given** member inbox (`GET /v1/me/inbox`, **17.21**), **when** a manual nudge is sent, **then** inbox rows are **not** created as a send side-effect — same pull/push separation as **8.3**. [Source: SCP §4.8 R1]

9. **Given** implementation complete, **when** tests run, **then** Kotlin integration tests cover: GET/POST `availability_nudge` happy path, 409 draft / no-unknown, guard metadata in GET, dispatcher invoked with `MANUAL_AVAILABILITY_NUDGE`, `lastManualNudgeAt` updated ; Angular tests cover button visibility, anti-spam confirm flow, dialog title/template ; `./gradlew test`, `npm run test -w @hatcast/web -- --watch=false` green. [Source: project-context.md ; NFR-Q1]

**Product coverage:** UX-DR7 ; FR31 P1 manual intent ; FR15 (organizer nudge for missing dispos) ; NFR-R2, NFR-S2, NFR-A1. **Depends:** **6.10** (dialog shell), **3.21** (publish gate), **8.1**, **8.3** (dispatcher), **8.2** optional (category gating). **Complements:** **8.4** auto SLA (P2) — does **not** replace.

### Explicit out of scope

| Item | Reason |
|------|--------|
| **8.4** organizer auto SLA / cron reminders | P2 ; distinct intents (FR31b) |
| **8.5** assignee J-7/J-1 presence reminders | Separate intent family |
| **Audit row FR35** for manual nudge send | Epic 9 optional follow-up |
| **intent=event** Infos tab entry (6.10 AC9) | Still deferred ; nudge uses Dispos entry |
| **Hard API block** inside guard window | UX soft guard only (organizer can confirm resend) |
| **Custom per-recipient message** | Same edited text broadcast to all notifiable recipients (6.10 parity) |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** **« Rappel dispos »** and the share dialog, **when** rendered, **then** use **`mat-stroked-button`** (Dispos toolbar), **`MatDialog`** / existing share shell, **`mat-spinner`** on send, and **`ConfirmDialog`** (or shared confirm pattern) for anti-spam — no custom clickable divs. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** Dispos toolbar + dialog SCSS, **when** styling, **then** only `var(--mat-sys-*)` / `color-mix` — reuse [`share-announce-dialog.scss`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.scss) tokens ; nudge CTA not hard-coded hex outside theme. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **≤ 480px**, **when** **« Rappel dispos »** is shown, **then** target **≥ 48×48 dp** ; dialog close control keeps **`aria-label="Fermer"`** (French). [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** — entry on existing event **Dispos** tab ; no new global chrome.

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; update outdated copy in share dialog hint (*« push arrivent avec l’Epic 8 »* → reflect live push when **8.1** enabled). [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` or Firebase.

- [x] **API — intent & enum** (AC 2–3, 5)
  - [x] Add `NotificationIntent.MANUAL_AVAILABILITY_NUDGE` ; map `toCategory()` → `NotificationCategory.AVAILABILITY_REQUEST` (same prefs as open-dispos).
  - [x] Extend `ShareRecipientIntent` with `AVAILABILITY_NUDGE` (`availability_nudge` query/body value).
  - [x] `NotificationDispatchContext`: add optional `customMessageBody: String?` for manual text ; wire in `NotificationPayloadBuilder` / dispatcher when set.

- [x] **API — recipients & guard** (AC 2, 4–5)
  - [x] In [`ShareRecipientsService`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt): resolve unknown-only participants (reuse availability index from [`AvailabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) patterns).
  - [x] Validate lifecycle: `availabilityOpenedAt != null`, not archived, ≥1 unknown recipient.
  - [x] Flyway migration: `event_manual_availability_nudges` (`event_id` PK, `last_sent_at`, `last_actor_user_id`) or equivalent ; service read/write on notify.
  - [x] Extend `ShareRecipientsResponseDto` with `lastManualNudgeAt`, `guardDays` ; config in `application.yml`.

- [x] **API — dispatch** (AC 3, 6)
  - [x] In [`CompositionWorkflowNotificationAdapter.requestManualAnnouncement`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt): when `intent == "availability_nudge"`, call `dispatcher.dispatch(MANUAL_AVAILABILITY_NUDGE, …)` with custom body ; other intents unchanged (DEBUG log).
  - [x] Add `NotificationRecipientResolver.resolveUnknownAvailabilityRecipients(seasonId, eventId)` (or inline in share service → user IDs for dispatcher).
  - [x] Update `ShareRecipientsService.buildResponse`: set `channels.push` from `PushNotificationEligibilityPort` (not hard-coded `false`).

- [x] **OpenAPI** — extend [`composition.yaml`](../../services/api/openapi/composition.yaml): enum `availability_nudge` ; response fields `lastManualNudgeAt`, `guardDays`.

- [x] **Angular — templates & types** (AC 1)
  - [x] Extend `ShareAnnounceIntent` with `'availability_nudge'`.
  - [x] Add `buildAvailabilityReminderMessage()` (⏰ reminder copy — mirror V1 [`notificationTemplates.js`](../../legacy/src/services/notificationTemplates.js) `availability_reminder` tone).
  - [x] Dialog titles/labels for nudge intent in [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts).

- [x] **Angular — Dispos entry point** (AC 1, 4, 7)
  - [x] [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts): computed `canNudgeAvailability()` (organizer, published, has unknown in summary) ; button **« Rappel dispos »**.
  - [x] Pass season/event slugs into dialog (from parent [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) if needed).
  - [x] Anti-spam: if `lastManualNudgeAt` within guard, open confirm before `sendNotifications()` ; snack on success.

- [x] **Tests** (AC 9)
  - [x] `ShareRecipientsIntegrationTest`: nudge intent matrix, 409 cases, dispatch verify, timestamp update.
  - [x] `NotificationDispatcherTest` or dedicated integration: custom body in payload.
  - [x] `share-announce-dialog.spec.ts`, `event-dispos-tab.spec.ts`: nudge template prefix, confirm gate.

---

## Dev Notes

### Distinction: announce vs nudge vs draw/compo (critical)

| Share intent | API value | Trigger surface | Audience | Notification intent |
|--------------|-----------|-----------------|-----------|---------------------|
| First availability call | `event` | Draft publish / optional Infos (6.10 AC9 deferred) | Full season roster | *(manual POST — still stub unless wired)* |
| **Availability reminder** | **`availability_nudge`** | **Dispos « Rappel dispos »** | **Unknown dispos only** | **`MANUAL_AVAILABILITY_NUDGE`** |
| Draw share | `draw` | Équipe overflow | Assignees | stub log |
| Compo announce | `composition` | Équipe validated | Assignees | stub log |

**Do not** reuse `intent=event` for nudge — different audience and template.

### Unknown participant definition

Match inbox/agenda semantics ([`MeInboxService`](../../services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt)): participant is **unknown** when no availability row exists **or** stored status maps to API **`unknown`**. Exclude **`available`** and **`unavailable`**.

Front signal: `summary.participants.some(p => p.status === 'unknown')` from [`EventAvailabilitySummary`](../../apps/web/src/app/core/availability/availability-api.service.ts).

### Anti-spam guard (soft UX)

- **Server:** persist `lastManualNudgeAt` per **event** (not per recipient) on each successful notify POST.
- **Client:** compare `lastManualNudgeAt` + `guardDays` from GET ; if inside window → [`ConfirmDialog`](../../apps/web/src/app/shared/confirm-dialog/confirm-dialog.ts) (or existing pattern) with copy from brainstorming.
- **Not** a 409 on POST — organizer may intentionally resend after confirm (comm team timing).

Default **`guardDays: 3`** — override via `hatcast.notifications.manual-availability-nudge-guard-days` in [`application.yml`](../../services/api/src/main/resources/application.yml).

### Custom message in dispatcher

6.10 already sends `messageText` to `requestManualAnnouncement` but adapter ignores it. For 6.10b:

1. Pass `messagePreview` into `NotificationDispatchContext.customMessageBody`.
2. `NotificationPayloadBuilder.build`: when `customMessageBody != null` for `MANUAL_AVAILABILITY_NUDGE`, use it as **body** ; email subject e.g. `Rappel disponibilité · {title} ({date})` (V1 parity).
3. Truncate to **500** chars (existing `@Size` on notify DTO).

### Files to create / extend

**Create:**

| Asset | Purpose |
|-------|---------|
| `V52__event_manual_availability_nudges.sql` | Guard timestamp storage |
| `EventManualAvailabilityNudgeRepository.kt` (+ entity) | Read/write last send |
| Integration test class or extend `ShareRecipientsIntegrationTest` | FR31 nudge path |

**Extend:**

| Asset | Change |
|-------|--------|
| `NotificationIntent.kt` | `MANUAL_AVAILABILITY_NUDGE` + category mapping |
| `NotificationDispatcher.kt` | Recipient branch for nudge |
| `NotificationPayloadBuilder.kt` | Reminder title + custom body |
| `NotificationDispatchContext.kt` | `customMessageBody` |
| `ShareRecipientsService.kt` | Nudge intent, unknown filter, push channels, guard fields |
| `CompositionWorkflowNotificationAdapter.kt` | Wire nudge dispatch |
| `composition.yaml` | OpenAPI |
| `share-announce-messages.ts` | Reminder template |
| `share-announce-dialog.*` | Nudge UX + guard confirm |
| `event-dispos-tab.*` | Entry button |
| `event-detail.ts` / template | Pass slugs to Dispos if missing |

**Do not change:** automatic `AVAILABILITY_OPENED` on publish ; validate confirmation flow ; legacy Firebase.

### Pitfalls (prevent LLM mistakes)

1. **Nudging « Pas dispo » members** — only **`unknown`** ; declining is a valid answer.
2. **Draft events** — hide button and 409 API (`availabilityOpenedAt == null`).
3. **Calling publish/open-availability** on notify — manual nudge only dispatches ; no domain state change.
4. **Inbox side effects** — no new inbox rows on send.
5. **Hard-blocking POST in guard window** — UX confirm only.
6. **Duplicating ShareAnnounceDialog** — extend existing shell with new intent.
7. **Wrong URL** — `/saison/` not `/season/` ; `?tab=dispos`.
8. **Breaking draw/compo notify** — keep non-nudge intents on DEBUG stub path.
9. **Forgetting push eligibility in recipient cards** — update `channels.push` now that **8.1**/**8.3** ship.
10. **Transactional dispatch** — POST handler may call adapter synchronously (manual path is not `@TransactionalEventListener` like publish) ; channel failures must not roll back HTTP 200 (NFR-R2).

### Previous story intelligence (6.10)

- Reuse **one** `ShareAnnounceDialog` ; add intent variant — do not fork modal.
- [`ShareRecipientsService`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) already validates lifecycle per intent — add nudge rules parallel to `EVENT`.
- Email obfuscation stays server-side ; `@for` track `participantId`.
- Équipe **Partager** / **Annoncer** unchanged ; nudge lives on **Dispos**.

### Previous story intelligence (8.3 / 8.5)

- Dispatcher + eligibility ports are production — wire nudge, do not reintroduce NoOp for this intent.
- Category **`AVAILABILITY_REQUEST`** when **8.2** present ; default allow if port absent (8.3 pattern).
- **8.5** explicitly lists **6.10b** as out of scope — no overlap with J-7/J-1 reminders.

### Git intelligence (recent)

- `e35d1c00` — notifications dispatch **after commit** ; manual POST is direct — still avoid throwing on channel errors.
- `4c6efbb0` — Mailpit / push local dev ; test nudge with `./scripts/start-dev.sh --with-push` optional.
- Composition epic pattern — extend existing services, minimal new surface area.

### Latest tech information

- **Angular 21.2** + **Material 21.2** — same dialog patterns as 6.10.
- **Spring Boot 3** — Flyway V52 ; `@ConfigurationProperties` for guard days.
- **web-push** (existing **8.3** sender) — no new dependency expected.

### References

- [epics.md — Story 6.10b](../planning-artifacts/epics.md)
- [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md §4.7](../planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md)
- [brainstorming-session-2026-06-01-notifications-epic8.md § Category #17](../brainstorming/brainstorming-session-2026-06-01-notifications-epic8.md)
- [6-10-partage-et-annonce-message-editable-canaux.md](./6-10-partage-et-annonce-message-editable-canaux.md)
- [8-3-notifications-mep-dispos-et-confirmation-assignes.md](./8-3-notifications-mep-dispos-et-confirmation-assignes.md)
- [ux-design-hatcast-v2.md § Share & announce](../planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce)
- V1: [`notificationTemplates.js`](../../legacy/src/services/notificationTemplates.js) (`availability_reminder`)

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- API: intent `availability_nudge` → `MANUAL_AVAILABILITY_NUDGE` with custom push/email body, unknown-only roster filter, guard metadata (`lastManualNudgeAt`, `guardDays` default 3), Flyway V52.
- Front: bouton **Rappel dispos** onglet Dispos (orga, spectacle publié, dispos unknown) ; `ShareAnnounceDialog` variant reminder + garde anti-spam (avertissement + `ConfirmDialog` avant renvoi).
- Tests: `ManualAvailabilityNudgeIntegrationTest`, `NotificationPayloadBuilderManualNudgeTest`, specs Angular nudge/guard ; `./gradlew test` + `npm run test -w @hatcast/web -- --watch=false` green.
- M3: `mat-stroked-button`, tokens `--mat-sys-*`, cible tactile ≥ 48dp mobile, hint push/email mis à jour.

### File List

- `services/api/src/main/resources/db/migration/V52__event_manual_availability_nudges.sql`
- `services/api/src/main/kotlin/com/hatcast/api/share/EventManualAvailabilityNudgeEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/share/EventManualAvailabilityNudgeRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationProperties.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationConfiguration.kt`
- `services/api/src/main/resources/application.yml`
- `services/api/openapi/composition.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderManualNudgeTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt`
- `apps/web/src/app/core/messaging/share-announce-messages.ts`
- `apps/web/src/app/core/messaging/share-announce-messages.spec.ts`
- `apps/web/src/app/core/share-announce/share-announce-api.service.ts`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.ts`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.html`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.html`
- `apps/web/src/app/shared/availability/event-dispos-tab.scss`
- `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`

### Change Log

- 2026-06-01 : Story 6.10b created (manual availability nudge + anti-spam guard).
- 2026-06-01 : Implemented manual availability nudge (API dispatch + Dispos UI + anti-spam guard + tests).

---

### Review Findings

- [x] [Review][Patch] Push eligibility scoped to all share intents — regression AC6 [`ShareRecipientsService.kt:266-286`] — fixed: push + notifiable count limited to `AVAILABILITY_NUDGE`.
- [x] [Review][Patch] Missing test for anti-spam confirm gate before POST — AC9 [`share-announce-dialog.spec.ts`] — added decline + accept confirm tests.
- [x] [Review][Patch] Guard warning has no themed styling — M3-2 [`share-announce-dialog.scss`] — added `.share-announce-dialog__guard-warning` with `--mat-sys-*` tokens.
- [x] [Review][Patch] Missing integration test for archived event 409 — AC5 [`ManualAvailabilityNudgeIntegrationTest.kt`] — added archived lifecycle test.

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés

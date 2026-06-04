# Story 6.17: Manual event announce dispatch + channel transparency dates

Status: review

baseline_commit: bd842b8a4565556d62260da3f1d7259e5d527615

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want **Annoncer** (dialog intent `event`) to **actually send** push/email to the full active roster and to see **when** each recipient was last notified per channel,  
so that **I avoid blind re-sends** and the UI matches product decisions **D12**, **NOT-1**, **NOT-2** (tech spec 6.17).

## Acceptance Criteria

1. **Given** POST `share-recipients/notify` with `intent=event` and non-empty `messageText` (≤ 500), **when** the organizer has `canManageComposition` and roster members are notifiable, **then** the API dispatches **`MANUAL_AVAILABILITY_ANNOUNCE`** with `customMessageBody` to **`resolveConcernedRosterRecipients(seasonId, eventId)`** (same pool as `AVAILABILITY_OPENED`) ; **then** `notifiedCount` equals preview `notifiableCount` (no longer `0`) ; delivery logs are written with `SENT` or `PARTIAL` per channel.

2. **Given** GET `share-recipients?intent=event`, **when** building channel status, **then** `notified` / `lastNotifiedAt` consider logs with intent ∈ `{ AVAILABILITY_OPENED, MANUAL_AVAILABILITY_ANNOUNCE }` and status ∈ `{ SENT, PARTIAL }` ; `lastNotifiedAt` is ISO-8601 UTC `max(created_at)` per `(user_id, channel)` or `null` if none.

3. **Given** GET `share-recipients?intent=availability_nudge`, **when** building channel status, **then** mapped log intents are `{ AVAILABILITY_OPENED, MANUAL_AVAILABILITY_NUDGE, MANUAL_AVAILABILITY_ANNOUNCE }` so auto-open or manual announce shows colored pills on **Relance dispos** (family transparency).

4. **Given** GET for `event` or `availability_nudge`, **when** a linked user has push allowed for category `AVAILABILITY_REQUEST`, **then** `push.eligible` is `true` (fix 6.16 regression: push was nudge-only).

5. **Given** GET/POST unchanged guards, **when** manual notify runs, **then** anti-spam per dialog intent (`event_manual_share_notify` key via `intentApiValue(EVENT)`), lifecycle validation, permissions, nudge dispatch, WhatsApp/copy, and **6.15** confirm-on-click remain green.

6. **Given** POST succeeds for `event` with `notifiedCount > 0`, **when** the snack helper runs, **then** copy is *« {n} notification(s) envoyée(s). »* (same pattern as nudge) — not *Demande enregistrée.*

7. **Given** GET returns `lastNotifiedAt` on a channel with `notified: true`, **when** the recipient detail row renders, **then** the French **`aria-label`** includes a human-readable date (e.g. *« email déjà envoyé le 2 juin 2026 »*) ; channel icons stay `aria-hidden="true"`.

8. **Regression:** OpenAPI `ShareRecipientChannelStatus` documents `lastNotifiedAt` ; Angular normalizes optional field ; `draw` / `composition` POST remain stub (`notifiedCount = 0`) ; integration tests for nudge and 6.16 channel shape stay green.

**Product coverage:** UX-DR7, UX-DR11 ; [**tech-spec-share-announce-transparency-6-17.md**](../planning-artifacts/tech-spec-share-announce-transparency-6-17.md) (D12, AUD-1/2, NOT-1/2, GUARD-1) ; SPEC/DOMAIN « Known divergence » removed or updated in same PR.

### Explicit out of scope

| Item | Reason |
|------|--------|
| `draw` / `composition` real dispatch | Story **6.18** backlog |
| Cross-family anti-spam confirm (Annoncer + Relance < 3 j) | Story **6.19** optional |
| Material tooltip *« Notifié le … »* visible | `aria-label` MVP per tech spec |
| FR35 per-line manual audit UI | Epic 9 |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** share-announce dialog changes, **when** rendered, **then** keep existing `mat-dialog`, `mat-expansion-panel`, `mat-list`, `mat-icon` channel pills — no new custom controls.

**M3-2. Tokens & thème** — **Given** any SCSS touch, **when** styling, **then** only `var(--mat-sys-*)` / `color-mix` — no new hex.

**M3-3. Mobile & tactile** — **Given** viewport ≤ 480px, **when** detail expanded, **then** unchanged scroll/legend behavior from 6.16 ; longer `aria-label` must not break layout.

**M3-4. Navigation membre** — **N/A**

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) checklist ; note waived items in Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **do not modify** `legacy/`.

- [x] **API — enum & dispatch** (AC 1, 5)
  - [x] Add `MANUAL_AVAILABILITY_ANNOUNCE` to [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt) ; `toCategory()` → `AVAILABILITY_REQUEST`.
  - [x] [`NotificationDispatcher.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt): resolve recipients like `AVAILABILITY_OPENED`.
  - [x] [`CompositionWorkflowNotificationAdapter.requestManualAnnouncement`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt): branch `intent == "event"` → dispatch `MANUAL_AVAILABILITY_ANNOUNCE` with `customMessageBody` (remove debug-only stub path for `event`).
  - [x] [`NotificationPayloadBuilder.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt): push/email body uses `customMessageBody` when set ; subject distinct from auto open (e.g. *« Annonce spectacle · {title} ({date}) »*) — tone aligned with front [`buildAvailabilityAnnouncementMessage`](../../apps/web/src/app/core/messaging/share-announce-messages.ts) (📢 / invite dispos, not nudge ⏰).
  - [x] Update `NotificationDispatcherTest`, add `NotificationPayloadBuilderManualAnnounceTest` (mirror nudge tests).

- [x] **API — ShareRecipientsService** (AC 1–4, 8)
  - [x] [`ShareRecipientChannelStatusDto`](../../services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt): add `lastNotifiedAt: Instant? = null`.
  - [x] Extend `resolveDeliveryLogIntents()` per mapping table in tech spec (§ GET mapping).
  - [x] Replace `loadNotifiedChannelKeys` with batch load returning per `(userId, channel)` → `{ notified, lastNotifiedAt }` from same query (max `createdAt`).
  - [x] Push eligibility: `hasPush = row.userId != null && pushEligibilityPort.isPushAllowedForCategory(...)` when intent is **`EVENT` or `AVAILABILITY_NUDGE`** (not nudge-only).
  - [x] `notifyRecipients`: `notifiedCount = previewResponse.notifiableCount` for **`EVENT`** and **`AVAILABILITY_NUDGE`**.
  - [x] Keep `draw` / `composition` `notifiedCount = 0`.

- [x] **API — OpenAPI & tests** (AC 2, 3, 8)
  - [x] [`composition.yaml`](../../services/api/openapi/composition.yaml): `lastNotifiedAt` on `ShareRecipientChannelStatus` ; describe intent mapping in GET operation description.
  - [x] New [`ManualAvailabilityAnnounceIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityAnnounceIntegrationTest.kt) — pattern from [`ManualAvailabilityNudgeIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt) (`@MockBean NotificationDispatcher`).
  - [x] Extend [`ShareRecipientsIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt): POST event → logs + GET notified + `lastNotifiedAt` ; GET nudge after `AVAILABILITY_OPENED` log ; GET event `push.eligible` when prefs OK.

- [x] **Angular — types & snack** (AC 6, 8)
  - [x] [`share-announce-api.service.ts`](../../apps/web/src/app/core/share-announce/share-announce-api.service.ts): `lastNotifiedAt?: string | null` on channel status ; extend `normalizeShareRecipientChannelStatus`.
  - [x] [`share-announce-snack.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.ts): treat `event` like nudge when `notifiedCount > 0` ; remove `event` from `STUB_INTENTS` for snack purposes (POST still records manual notify).
  - [x] Update [`share-announce-snack.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.spec.ts).

- [x] **Angular — dialog aria** (AC 7, M3)
  - [x] [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts): map `lastNotifiedAt` in `RecipientCard` ; extend `rowAriaLabel()` with `formatNotifiedDate(iso)` via `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })`.
  - [x] [`share-announce-dialog.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts): aria-label contains date when mock provides `lastNotifiedAt`.

- [x] **Docs** (AC 8 product)
  - [x] After implementation: remove or shorten **Known divergence** blocks in [`SPEC.md`](../../SPEC.md) and [`DOMAIN.md`](../../DOMAIN.md) pointing at 6.17.

---

## Dev Notes

### Normative spec (read first)

Primary: [**tech-spec-share-announce-transparency-6-17.md**](../planning-artifacts/tech-spec-share-announce-transparency-6-17.md)  
UX: [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) — **D12** (two menu actions), **D10** (pills, unchanged).

### Runtime gap (today → target)

| Area | Current (post-6.16) | This story |
|------|---------------------|------------|
| `CompositionWorkflowNotificationAdapter` L86–93 | `event` → `log.debug` only | Real `dispatcher.dispatch` |
| `ShareRecipientsService.notifyRecipients` L120–125 | `notifiedCount = 0` except nudge | Include `EVENT` |
| `resolveDeliveryLogIntents` L333–342 | Nudge: `MANUAL_AVAILABILITY_NUDGE` only ; Event: `AVAILABILITY_OPENED` only | Sets per tech spec § mapping |
| `buildResponse` push | `nudgeIntent && …` | `EVENT \|\| AVAILABILITY_NUDGE` |
| Channel DTO | `{ eligible, notified }` | + `lastNotifiedAt` |
| `share-announce-snack.ts` L9 | `event` in `STUB_INTENTS` | Count-aware when `notifiedCount > 0` |

### Delivery log batch (no N+1)

Reuse existing repository method:

```kotlin
findByEventIdAndUserIdInAndIntentInAndStatusIn(eventId, userIds, logIntents, {SENT, PARTIAL})
```

In service, fold to `Map<Pair<UUID, NotificationChannel>, Instant>` taking **max** `createdAt`. `notified = map contains key` ; `lastNotifiedAt = map[key]`.

Participants **without** `userId`: `notified = false`, `lastNotifiedAt = null` (unchanged 6.16 rule).

### Payload alignment with front template

Default message for `event` intent is [`buildAvailabilityAnnouncementMessage`](../../apps/web/src/app/core/messaging/share-announce-messages.ts) (email-style invite). Server-built push title/body should be consistent when `customMessageBody` is the edited dialog text (organizer may shorten — body = custom, title/subject = announce variant).

Do **not** reuse `MANUAL_AVAILABILITY_NUDGE` subject *« Rappel disponibilité · … »* for announce.

### POST flow order (preserve NFR-R2)

Unchanged from 6.10b/6.15:

1. Validate permissions, lifecycle, non-empty message.
2. Build preview GET response.
3. `notificationPort.requestManualAnnouncement(...)`.
4. `recordManualNotify(...)`.
5. Return `ShareNotifyResponseDto` with counts from preview.

Channel failures must not roll back accepted POST (existing dispatcher behavior).

### Anti-spam

- Table `event_manual_share_notify` keyed by `(eventId, intentApiValue)` — `event` and `availability_nudge` are **separate** rows (GUARD-1).
- `guardDays` from `HATCAST_MANUAL_AVAILABILITY_NUDGE_GUARD_DAYS` (default 3) — unchanged.

### Dialog refresh after POST

6.15 closes dialog on success — **no** in-dialog re-fetch required. Optional: caller may re-open; integration tests prove GET after POST. Snack uses `notifiedCount` from POST response.

### Previous story intelligence (6.16 — done)

- Nested `channels.{email,push}.{eligible,notified}` — extend with optional `lastNotifiedAt` (backward compatible if front normalizer defaults `null`).
- **Critical:** 6.16 explicitly scoped push eligibility to **nudge only** — **6.17 intentionally widens** to `event` per tech spec (NOT a regression).
- Batch log query exists — extend aggregation, do not add per-recipient queries.
- `normalizeShareRecipientsResponse()` handles legacy flat booleans — add `lastNotifiedAt` passthrough in normalizer.

### Previous story intelligence (6.15, 6.10b)

- `ConfirmDialog` on guard breach — separate copy for nudge vs announce already in `guardConfirmMessage()`.
- Entry: gear **Relance dispos** (`availability_nudge`) vs **Annoncer** (`event`) — do not merge (D12).

### Testing commands

```bash
./gradlew test --tests 'com.hatcast.api.share.*'
./gradlew test --tests 'com.hatcast.api.notification.NotificationPayloadBuilder*'
./gradlew test --tests 'com.hatcast.api.notification.NotificationDispatcherTest'
npm run test -w @hatcast/web -- --watch=false --include='**/share-announce*'
```

### Git intelligence (recent)

- `eaee6c24` — 6.16 channel status in dialog (touch same files).
- `99c5ae2d` — gear menu Relance dispos (entry points stable).

### Project context reference

[project-context.md](../../project-context.md) — UX-DR11, [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md), conventional commits, AGENTS.md doc sync when runtime matches SPEC.

### Files expected to change

| Layer | Files |
|-------|--------|
| API core | `NotificationIntent.kt`, `NotificationDispatcher.kt`, `CompositionWorkflowNotificationAdapter.kt`, `NotificationPayloadBuilder.kt` |
| API share | `ShareRecipientsService.kt`, `ShareRecipientsDtos.kt`, `composition.yaml` |
| API tests | `ManualAvailabilityAnnounceIntegrationTest.kt` (new), `ShareRecipientsIntegrationTest.kt`, `NotificationDispatcherTest.kt`, payload builder tests |
| Web | `share-announce-api.service.ts`, `share-announce-api.service.spec.ts`, `share-announce-dialog.ts`, `share-announce-dialog.spec.ts`, `share-announce-snack.ts`, `share-announce-snack.spec.ts` |
| Docs | `SPEC.md`, `DOMAIN.md` (post-merge divergence cleanup) |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- API: `MANUAL_AVAILABILITY_ANNOUNCE` dispatch on POST `event` ; GET mapping + `lastNotifiedAt` (max log `createdAt`) ; push eligible for `event` and `availability_nudge`.
- Web: snack count-aware for `event` when `notifiedCount > 0` ; `aria-label` includes French date from `lastNotifiedAt`.
- Tests: share + payload builder suites green ; `ng test --include='**/share-announce*.spec.ts'` — 33 passed.
- M3: no new controls/hex ; legend unchanged ; aria-only date (M3-5 checklist: no SCSS touch — N/A waived).

### File List

- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt
- services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderManualAnnounceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt
- services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityAnnounceIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt
- apps/web/src/app/core/share-announce/share-announce-api.service.ts
- apps/web/src/app/core/share-announce/share-announce-api.service.spec.ts
- apps/web/src/app/shared/share-announce/share-announce-snack.ts
- apps/web/src/app/shared/share-announce/share-announce-snack.spec.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts
- SPEC.md
- DOMAIN.md

### Change Log

- 2026-06-04 : Story created (ready-for-dev) from tech spec + sprint 6.17.
- 2026-06-04 : Implemented dispatch, transparency dates, front aria/snack ; status → review.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (tech spec, UX D10–D12, NOT-1/2)
- [x] Section **Material 3** remplie (dialog aria/snack scope)
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants et état runtime documenté
- [x] Commandes de test listées

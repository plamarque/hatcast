# Story 6.16: Statut canal par destinataire (modales Partager / Annoncer)

Status: done

baseline_commit: 58003bfca037a1a43d294524788615a46364f09a

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want the **recipient detail** in Share / Announce modals to show **per-channel status** (email / push) instead of obfuscated emails,  
so that **I know who was already notified and on which channel** before I click Notifier (**UX-DR7**, amendement **D10**).

## Acceptance Criteria

1. **Given** any supported share intent and GET `share-recipients` succeeds, **when** the organizer expands *Voir le détail*, **then** each row shows **display name** + **channel pills** (email `mail`, push `notifications_active`) with **3 visual states** — **absent** (not eligible), **grey** (eligible, not yet notified), **colored** (`color="primary"`, already notified) — per [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) **D10** ; **no** obfuscated email line ; **no** `check_circle` / `warning` leading icon except *Contact manuel* when **no** channel is eligible.

2. **Given** the expanded detail list, **when** rendered, **then** a **one-line legend** appears below the list : *« Icône colorée = déjà notifié · grise = prévu au prochain envoi · absente = canal indisponible »* ; each `mat-list-item` has a synthetic French **`aria-label`** (e.g. *« Marie Dupont — email déjà envoyé, push prévu au prochain envoi »*) ; channel icons are `aria-hidden="true"`.

3. **Given** GET `share-recipients`, **when** the API responds, **then** each recipient’s `channels.email` and `channels.push` are objects `{ eligible: boolean, notified: boolean }` (not flat booleans) ; `notifiableCount` / `manualCount` / summary N/X/Y **unchanged in meaning** (`notifiable` = at least one `eligible`) ; `emailObfuscated` may remain in DTO for compat but is **not used** by the dialog.

4. **Given** dialog intent, **when** computing `notified`, **then** the server queries `notification_delivery_log` for matching `(event_id, user_id, channel, intent)` with `status` ∈ `{ SENT, PARTIAL }` :

   | Dialog intent | Log intents |
   |---------------|-------------|
   | `availability_nudge` | `MANUAL_AVAILABILITY_NUDGE` |
   | `event` | `AVAILABILITY_OPENED` |
   | `draw`, `composition` | none (stub) → `notified` always `false` |

5. **Given** a participant **without** linked `user_id`, **when** building channel status, **then** push `eligible` follows existing push rules ; `notified` is `false` (no log row possible).

6. **Given** POST notify succeeds for `availability_nudge`, **when** the dialog would refresh channel state (re-open or future in-dialog refresh), **then** GET reflects updated `notified` after dispatch — **today** dialog closes on success (6.15) ; integration test proves GET `notified: true` after manual nudge + log write.

7. **Regression:** **Given** stories **6.10**, **6.10b**, **6.15**, **when** tests run, **then** intent matrices, permissions, guard confirm-on-click, WhatsApp, snack helpers, and nudge dispatch remain green ; OpenAPI + Angular types updated.

**Product coverage:** UX-DR7, UX-DR11 ; amendement **D10** (Patrice 2026-06-04). **Depends:** **6.15**, **6.10b**, **8.3** (auto `AVAILABILITY_OPENED` logs). **Does not** add tooltip *« Notifié le … »* (Epic 9 / FR35 UI).

### Explicit out of scope

| Item | Reason |
|------|--------|
| Per-channel timestamp in UI | Epic 9 / FR35 |
| Real dispatch for `draw` / `composition` / `event` manual POST | Epic 8 follow-up |
| Change summary N/X/Y copy or actions row | D5 / D4 unchanged |
| New channels (SMS, WhatsApp auto) | — |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the recipient detail panel, **when** rendered, **then** use existing `mat-expansion-panel`, `mat-list`, `mat-list-item`, `mat-icon` for channel pills ; grey state via token class (e.g. `color-mix` + `--mat-sys-on-surface-variant`) — no custom `<button>` per channel.

**M3-2. Tokens & thème** — **Given** channel pill styles in `share-announce-dialog.scss`, **when** colored vs grey, **then** only `var(--mat-sys-*)` / `color-mix` ; no hex for state colors.

**M3-3. Mobile & tactile** — **Given** viewport ≤ 480px, **when** detail expanded, **then** list scrolls inside `mat-dialog-content` ; legend wraps ; channel pills remain visible (no overlap with name).

**M3-4. Navigation membre** — **N/A**

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) checklist ; UX source [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) § D10 already updated (2026-06-04).

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` — **do not modify** `legacy/`.

- [x] **API — DTO & OpenAPI** (AC 3, 7)
  - [x] Add `ShareRecipientChannelStatusDto(eligible, notified)` ; change `ShareRecipientChannelsDto` to nested objects.
  - [x] Update [`composition.yaml`](../../services/api/openapi/composition.yaml) schemas `ShareRecipientChannels`, examples.
  - [x] Keep `emailObfuscated` on `ShareRecipientDto` (nullable) for backward compat / existing tests — mark deprecated in KDoc if useful.

- [x] **API — delivery log lookup** (AC 4, 5, 6)
  - [x] Extend [`NotificationDeliveryLogRepository`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogRepository.kt) with batch query, e.g. `findByEventIdAndUserIdInAndIntentInAndStatusIn(...)` — **one query per GET**, not N+1 per recipient.
  - [x] In [`ShareRecipientsService.buildResponse`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt): map dialog intent → `Set<NotificationIntent>` ; compute `eligible` (existing logic) + `notified` from logs ; `notifiableCount` = count where any channel `eligible`.
  - [x] Extract small private helper `resolveDeliveryLogIntents(intent: ShareRecipientIntent): Set<NotificationIntent>` for clarity.

- [x] **API — tests** (AC 6, 7)
  - [x] Update [`ShareRecipientsIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt): assert new JSON shape ; `draw` still returns obfuscated email field if present but channels are objects.
  - [x] Add case: after publish + `AVAILABILITY_OPENED` log, GET `intent=event` shows email/push `notified: true` for concerned user.
  - [x] Add case: after manual nudge dispatch, GET `intent=availability_nudge` shows `notified: true` on channels actually sent.
  - [x] Re-run [`ManualAvailabilityNudgeIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt).

- [x] **Angular — types & mapping** (AC 3)
  - [x] Update [`share-announce-api.service.ts`](../../apps/web/src/app/core/share-announce/share-announce-api.service.ts) interfaces to match nested channels.

- [x] **Angular — dialog UI** (AC 1, 2, M3)
  - [x] Rewrite recipient rows in [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html): name + channel pills row ; *Contact manuel* branch ; legend `mat-hint`.
  - [x] Update [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts): `recipientCards` shape with `channels: { email, push }` each `{ eligible, notified }` ; helper `channelAriaLabel(card)` ; `notifiable` derived from `eligible`.
  - [x] SCSS in [`share-announce-dialog.scss`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.scss): flex layout name | pills ; `.share-announce-dialog__channel--pending` grey ; remove unused manual-icon styles if obsolete.

- [x] **Angular — tests** (AC 1, 2, 7)
  - [x] Update [`share-announce-dialog.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts): mock nested channels ; assert no obfuscated email in DOM ; legend text ; grey vs primary icons ; manual-only row.

---

## Dev Notes

### UX source of truth

Primary spec: [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) — **D10** (approved Patrice 2026-06-04). Pattern index: [ux-design-hatcast-v2.md § Share & announce](../planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce).

### Current implementation (must read before edit)

| File | Today | This story |
|------|-------|------------|
| [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html) | `check_circle` / `warning` + `emailObfuscated` line | Channel pills + legend (D10) |
| [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts) | `notifiable: channels.email \|\| channels.push` (booleans) | Map `{ eligible, notified }` |
| [`ShareRecipientsService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) | Flat `ShareRecipientChannelsDto(email: Boolean, push: Boolean)` | Nested status + log lookup |
| [`NotificationDeliveryLogRepository.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogRepository.kt) | Empty JPA repo | Batch query for GET enrichment |

**Preserve:** summary N/X/Y, collapsed default, guard confirm-on-click (6.15), intent lifecycle 409s, snack behavior, message templates, all entry points.

### Channel eligibility (unchanged logic)

From [`ShareRecipientsService.buildResponse`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) (~L270–290):

- **email `eligible`:** normalized email non blank on participant row.
- **push `eligible`:** only for `AVAILABILITY_NUDGE` intent **and** linked `userId` **and** `pushEligibilityPort.isPushAllowedForCategory(userId, AVAILABILITY_REQUEST)`.
- For `draw` / `composition` / `event` intents: push stays non-eligible today (same as 6.10b regression fix).

### Notified semantics

- Source table: [`notification_delivery_log`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogEntity.kt) — match `eventId`, `userId`, `channel` (`EMAIL` / `PUSH`), `intent` in mapped set, `status` in `SENT`, `PARTIAL`.
- Participants without `userId`: `notified` always `false` for both channels.
- **Do not** treat `FAILED` / `SKIPPED` as notified.

### API breaking change note

Nested `channels` replaces flat booleans. **Only consumer** is HatCast V2 Angular app — update service + dialog in same PR. If integration tests assert `$.recipients[0].channels.email` as boolean, update assertions.

### Suggested UI structure (per row)

```html
<mat-list-item [attr.aria-label]="rowAriaLabel(card)">
  <span matListItemTitle class="share-announce-dialog__recipient-name">{{ card.displayName }}</span>
  @if (card.manualOnly) {
    <span matListItemLine>… warning + Contact manuel</span>
  } @else {
    <span matListItemMeta class="share-announce-dialog__channels">
      @if (card.channels.email.eligible) {
        <mat-icon [color]="card.channels.email.notified ? 'primary' : undefined" …>mail</mat-icon>
      }
      …
    </span>
  }
</mat-list-item>
```

Use `matListItemMeta` or flex wrapper per existing list patterns ; ensure meta aligns right on mobile.

### Previous story intelligence (6.15)

- Dialog **closes** on successful notify — no in-dialog refresh required for AC ; prove `notified` via GET integration test after dispatch.
- **6.10b regression:** push eligibility scoped to `AVAILABILITY_NUDGE` only — do not widen when touching `buildResponse`.
- Review pattern: `@for` track by `participantId` (6.10 review patch).

### Testing commands

```bash
npm run test -w @hatcast/web -- --watch=false --include='**/share-announce*'
./gradlew test --tests 'com.hatcast.api.share.*'
```

### Project context reference

[project-context.md](../../project-context.md) — UX-DR11, FRONTEND_UI.md before UI changes, conventional commits, AGENTS.md doc sync if API contract changes production behavior.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- API: nested `ShareRecipientChannelStatusDto` ; batch `notification_delivery_log` lookup via `resolveDeliveryLogIntents` ; `notifiableCount` unchanged semantics (any `eligible` channel).
- UI D10: channel pills (`mail`, `notifications_active`) with absent / grey (`--pending`) / primary states ; legend ; French `aria-label` per row ; manual-only `warning` branch preserved.
- Tests: `./gradlew test --tests 'com.hatcast.api.share.*'` green ; `share-announce-dialog.spec.ts` 16/16 green.
- M3 checklist: mat-expansion-panel / mat-list / mat-icon ; tokens only (`color-mix` + `--mat-sys-*`) ; mobile scroll via existing dialog content (M3-3 N/A extra work).
- Recette Les Improbots OK (2026-06-04) ; code review OK — fix `normalizeShareRecipientsResponse()` pour DTO legacy plat + tests `share-announce-api.service.spec.ts`.

### File List

- apps/web/src/app/core/share-announce/share-announce-api.service.ts
- apps/web/src/app/core/share-announce/share-announce-api.service.spec.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.html
- apps/web/src/app/shared/share-announce/share-announce-dialog.scss
- apps/web/src/app/shared/share-announce/share-announce-dialog.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt
- services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogRepository.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt

### Change Log

- 2026-06-04 : Story created (`bmad-create-story` 6.16) from UX amendement D10 (Patrice).
- 2026-06-04 : Implementation complete — API channel status + dialog D10 UI (`bmad-dev-story` 6.16).
- 2026-06-04 : Recette + code review OK — story closed (`done`).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (UX D10, epics 6 / FR31 context)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants
- [x] `npm run test` / `./gradlew test` mentionnés

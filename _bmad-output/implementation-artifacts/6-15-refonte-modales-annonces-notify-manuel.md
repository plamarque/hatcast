---
baseline_commit: d24756da107d3a03cdfc446d5a3c6e6ea3a3c942
---

# Story 6.15: Refonte modales annonces + notify manuel simplifié

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want a **Material 3 share/announce dialog** with a comfortable message area, **copy** and **WhatsApp**, and a **clear single notify action** with honest feedback after send,  
so that **I can communicate about draw, composition, or availability without V1-style modal debt**, while **anti-spam guards** reduce accidental duplicate sends (**UX-DR7**, **UX-DR11**, V2.0.0 cutover SCP 2026-06-02).

## Acceptance Criteria

1. **Given** any supported share intent (`draw`, `composition`, `event`, `availability_nudge`) and `canManageComposition`, **when** the organizer opens the dialog from entry points (Équipe, Dispos, draft publish banner, **gear événement · Annoncer**), **then** `ShareAnnounceDialog` uses the **M3 shell** (`mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`), `mat-form-field appearance="outline"` + `textarea matInput` with **autosize**, and a **single actions row** in content: **Notifier {X} personnes** (`mat-flat-button primary`, first) · **Copier** (`mat-stroked-button`, label *Copier*, `aria-label="Copier le message"`) · **WhatsApp** (`mat-stroked-button`) — [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) D1–D4, D9 ; intent `event` title **Annonce de spectacle** ; **do not** keep V1 dark gradient or custom green HTML buttons.

2. **Given** recipients load successfully, **when** the dialog renders, **then** a **compact summary** shows *« N personnes concernées — X notifiables automatiquement, Y à contacter manuellement »* and the **nominal recipient list is collapsed by default** (`mat-expansion-panel`) **below** the actions row — UX spec § Destinataires.

3. **Given** the organizer taps **Copier**, **when** clipboard write succeeds, **then** a snack shows *Message copié.* ; **when** WhatsApp is tapped, **then** `whatsapp://send?text=` uses the **current** editor text (existing `buildWhatsAppSendUrl`).

4. **Given** `notifiableCount` from GET, **when** the actions row renders, **then** **Notifier {X} personnes** is the **first** `mat-flat-button color="primary"` in the content row (or *Aucune notification automatique* disabled when `X === 0`) ; footer `mat-dialog-actions` contains **Fermer** only — **remove** duplicate in-body *Envoyer les notifications* row and **do not** place Notifier in footer.

5. **Given** POST notify succeeds, **when** the dialog closes, **then** callers show a snack for **~5 s** with **count-aware copy**: real dispatch (`availability_nudge`, `notifiedCount > 0`) → *« {notifiedCount} notifications envoyées. »* ; stub intents (`draw`, `composition`, `event`) after Notifier → *« Demande enregistrée. »* ; nudge with `notifiedCount === 0` → *« Message prêt — partage-le via Copier ou WhatsApp. »* — [`share-announce-snack.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.ts).

6. **Given** manual notify for **any** intent, **when** the server records the send, **then** persist **last send per `(eventId, intent)`** and expose on GET `lastManualNotifyAt` + `guardDays` (default **3**) ; **when** inside window, **only** show `ConfirmDialog` **on Notifier click** (no persistent bandeau in dialog) — SCP anti-spam, UX D7.

7. ~~**Given** published event, **when** intent `event` or `availability_nudge`, **then** info bandeau auto-notif~~ — **WAIVED** recette 2026-06-03 (Patrice) : trop de bruit ; garde confirm couvre doublons manuels.

8. ~~**Given** `composition` validated, **when** intent `composition`, **then** info bandeau confirmation request~~ — **WAIVED** recette 2026-06-03 (Patrice).

9. **Given** POST notify, **when** the API responds, **then** body includes `{ accepted, notifiedCount, manualCount, intent }` ; OpenAPI updated — unchanged from prior AC9.

10. **Regression:** **Given** stories **6.10** / **6.10b**, **when** tests run, **then** intent matrices, permissions, WhatsApp encoding, nudge dispatch, lifecycle 409s, and **6.10b** guard for `availability_nudge` remain green ; add tests for M3 structure, copy button, collapsed recipients, per-intent guard confirm-on-click, snack helpers, POST counts — `npm run test -w @hatcast/web -- --watch=false`, `./gradlew test`.

**Product coverage:** UX-DR7, UX-DR11 ; V2.0.0 Wave C ([PLAN.md](../../PLAN.md) § 6.15). **Depends:** **6.10**, **6.10b**, **3.21**, **8.3** (auto-notif semantics). **Does not wire** real dispatch for `draw` / `composition` / `event` manual POST (Epic 8 follow-up).

### Explicit out of scope

| Item | Reason |
|------|--------|
| Real FCM/email for `draw` / `composition` / `event` manual intents | Epic 8 — keep adapter DEBUG/stub |
| FR35 audit per manual send | Epic 9 |
| New channels (SMS, etc.) | — |
| Per-recipient custom message | Broadcast text only |
| Template copy rewrite (emoji/tone) | Unless blocking UX |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the refactored dialog, **when** rendered, **then** use `MatDialog` structure with `mat-dialog-title` / `mat-dialog-content` / `mat-dialog-actions`, `mat-form-field`, `matInput` textarea, `mat-stroked-button`, `mat-flat-button`, `mat-icon`, `mat-expansion-panel` or documented equivalent, `mat-progress-spinner` / `mat-progress-bar`, `ConfirmDialog` for guards — **no** `.share-announce-dialog__whatsapp` custom buttons. Model: [`account-change-email-dialog.html`](../../apps/web/src/app/pages/account-placeholder/dialogs/account-change-email-dialog.html).

**M3-2. Tokens & thème** — **Given** `share-announce-dialog.scss`, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix` ; **remove** hardcoded `#1a2744`, `#16a34a`, `#c4b5fd`, etc. ; remove or neutralize global `.share-announce-dialog-panel` overrides that force V1 background.

**M3-3. Mobile & tactile** — **Given** viewport ≤ 480px, **when** Notifier / Copier / WhatsApp shown, **then** targets ≥ 48dp ; actions stack in column ; `aria-label="Fermer"` on close `mat-icon-button`.

**M3-4. Navigation membre** — **N/A**

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md checklist ; confirm [`ux-design-hatcast-v2.md`](../planning-artifacts/ux-design-hatcast-v2.md) § Share & announce links to **ux-design-share-announce-6-15.md**.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.

- [x] **Angular — dialog M3 refactor** (AC 1–4, M3-1–3)
  - [x] Rewrite [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html) to Material dialog sections + subtitle line under title.
  - [x] Replace SCSS with token-based layout ; delete V1 gradient card wrapper if redundant with dialog surface.
  - [x] [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts): import Material modules ; `copyMessage()` ; actions row Notifier-first ; `ConfirmDialog` on notify click when guard active (no bandeau).
  - [x] Optional char hint near 500 limit.

- [x] **Angular — entry gear Annoncer** (AC 1, D9)
  - [x] [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts): admin menu **Annoncer** for published events via [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts).
  - [x] Intent `event` dialog title **Annonce de spectacle** ([`share-announce-messages.ts`](../../apps/web/src/app/core/messaging/share-announce-messages.ts) or dialog title map).

- [x] **Angular — call-site snacks** (AC 5)
  - [x] Add shared helper [`share-announce-snack.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.ts) ; stub intents → *Demande enregistrée.*
  - [x] Wire `afterClosed` on equipe + draft-banner + dispos.

- [x] **API — per-intent manual send guard** (AC 6, 9)
  - [x] Flyway V54 ; entity + repository ; POST counts ; GET `lastManualNotifyAt` + `guardDays`.

- [x] **API — GET context flags** (AC 7–8) — **waived UI** ; no bandeaux rendered ; flags in dialog data optional / unused.

- [x] **OpenAPI + Angular client** (AC 9)
  - [x] Update schemas ; fix `availability_nudge` enum.

- [x] **Tests** (AC 10)
  - [x] Dialog spec: actions row order, Copier label, guard confirm-on-click, no bandeaux.
  - [x] API integration tests green.

---

## Dev Notes

### UX source of truth

Primary spec: [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) (`status: approved`, amendée recette Patrice 2026-06-03). Pattern index: [ux-design-hatcast-v2.md § Share & announce](../planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce).

### Current implementation (must read before edit)

| File | Today | This story |
|------|-------|------------|
| [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html) | Custom header/body, native textarea, dual CTAs | M3 dialog layout |
| [`share-announce-dialog.scss`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.scss) | V1 hex/gradient | Token-only |
| [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts) | Guard only nudge via `lastManualNudgeAt` | All intents + copy |
| [`ShareRecipientsService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) | Nudge timestamp table only | Generalized per-intent |
| [`ShareNotifyResponseDto`](../../services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt) | `{ accepted }` only | Add counts |

**Preserve:** message templates ([`share-announce-messages.ts`](../../apps/web/src/app/core/messaging/share-announce-messages.ts)), canonical URLs, intent lifecycle 409 rules, `ConfirmDialog` pattern, `canManageComposition` gates, entry-point visibility rules from **6.10**.

### Intent matrix (unchanged behavior)

| Intent | Trigger | Notify backend |
|--------|---------|----------------|
| `draw` | Équipe overflow Partager | Stub log |
| `composition` | Équipe Annoncer la compo | Stub log |
| `event` | Post-publish banner **or** gear **Annoncer** | Stub log |
| `availability_nudge` | Dispos Rappel dispos | `MANUAL_AVAILABILITY_NUDGE` dispatch |

### Anti-spam (extend 6.10b)

- **Server:** record `last_sent_at` per `(event_id, intent)` on each successful POST.
- **Client:** `calendarDaysSince(lastManualNotifyAt) < guardDays` → **`ConfirmDialog` on Notifier click only** (no persistent bandeau) — UX D7, recette Patrice 2026-06-03.
- **6.10b regression:** `availability_nudge` guard must still work after table migration.

### Auto-notif info bandeaux — **WAIVED** (recette 2026-06-03)

Proposition initiale (bandeaux publish **3.21** / validate **8.3**) non retenue. `availabilityOpenedAt` / `compositionValidatedAt` may remain in dialog data but are **not rendered**.

### MatDialog open config (keep)

```typescript
width: 'min(42rem, 96vw)',
maxHeight: '92vh',
autoFocus: 'first-titled-element',
// panelClass: drop V1 background override or rename
```

### Previous story intelligence (6.10 / 6.10b)

- **One dialog** — never split Draw/Compo modals again.
- **WhatsApp + edited text** — tested in 6.10 review patches.
- **Nudge:** `lastManualNudgeAt` + `guardDays` on GET only for nudge today — **generalize** without breaking [`ManualAvailabilityNudgeIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt).
- **OpenAPI drift:** `ShareNotifyRequest.intent` enum missing `availability_nudge` — fix in this story.
- **Review lesson:** remove duplicate `role="dialog"` on inner template — M3 `mat-dialog-title` handles semantics.

### Files to touch (expected)

**Angular**

- `apps/web/src/app/shared/share-announce/*`
- `apps/web/src/app/core/share-announce/share-announce-api.service.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts`
- `apps/web/src/app/shared/share-announce/share-announce-open.ts`
- New: `apps/web/src/app/shared/share-announce/share-announce-snack.ts` (or `core/messaging/`)

**API**

- `services/api/src/main/kotlin/com/hatcast/api/share/*`
- `services/api/src/main/resources/db/migration/V53__*.sql`
- `services/api/openapi/composition.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/share/*`

### Testing commands

```bash
npm run test -w @hatcast/web -- --watch=false --include='**/share-announce*'
./gradlew test --tests 'com.hatcast.api.share.*'
```

### Project context reference

[project-context.md](../../project-context.md) — UX-DR11, FRONTEND_UI.md before UI changes, conventional commits, no legacy edits.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Refactored `ShareAnnounceDialog` to Material 3 shell ; **actions row** in content: Notifier (first) · Copier · WhatsApp ; footer **Fermer** only.
- Snack helper: nudge with count → *X notifications envoyées* ; stub intents after Notifier → *Demande enregistrée.* ; nudge X=0 → Copier/WhatsApp hint.
- API V54 per-intent guard ; GET `lastManualNotifyAt` + `guardDays` ; POST counts.
- **Recette Patrice 2026-06-03:** no in-dialog guard/auto bandeaux ; ConfirmDialog on Notifier click only ; label **Copier** ; title **Annonce de spectacle** ; gear menu **Annoncer** via `share-announce-open.ts`.
- Tests: dialog + snack + API share green.

### File List

- apps/web/src/app/shared/share-announce/share-announce-dialog.html
- apps/web/src/app/shared/share-announce/share-announce-dialog.scss
- apps/web/src/app/shared/share-announce/share-announce-dialog.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts
- apps/web/src/app/shared/share-announce/share-announce-snack.ts
- apps/web/src/app/shared/share-announce/share-announce-snack.spec.ts
- apps/web/src/app/shared/share-announce/share-announce-open.ts
- apps/web/src/app/shared/share-announce/share-announce-open.spec.ts
- apps/web/src/app/core/share-announce/share-announce-api.service.ts
- apps/web/src/app/shared/availability/event-dispos-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts
- services/api/src/main/resources/db/migration/V54__event_manual_share_notify.sql
- services/api/src/main/kotlin/com/hatcast/api/share/EventManualShareNotifyEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/share/EventManualShareNotifyRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt
- services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt

### Change Log

- 2026-06-03 : Story created (`bmad-create-story` 6.15) from UX spec + SCP V2.0.0 Wave C.
- 2026-06-03 : Implementation — M3 dialog, per-intent anti-spam, POST counts, snack helpers.
- 2026-06-03 : Recette Patrice — UX spec **approved** ; AC 7–8 waived ; actions row Notifier-first ; gear **Annoncer** ; snack stub *Demande enregistrée.* ; docs alignés.

---

### Review Findings (2026-06-03 — UX `approved` + recette Patrice)

**Contexte :** revue relancée après alignement story/UX (D4–D9, AC 7–8 waived, Notifier-first, snack stub, gear **Annoncer**). Périmètre : `git diff HEAD` (~20 fichiers, +744/−449).

**Tests :** `./gradlew test --tests 'com.hatcast.api.share.*'` OK ; `ng test` ciblé `share-announce-{dialog,snack,open}.spec.ts` → **17/17** OK.

**Verdict :** implémentation **conforme** aux AC amendés et à [ux-design-share-announce-6-15.md](../planning-artifacts/ux-design-share-announce-6-15.md). Les écarts de la première revue (footer vs rangée, bandeaux, libellé Copier, snack stub, menu gear) sont **invalidés** par la recette documentée.

- [x] [Review][Patch] Couverture test titre intent `event` — **AC1 / D9** : test *« Annonce de spectacle »* ajouté. [share-announce-dialog.spec.ts]

- [x] [Review][Patch] Couverture test ordre DOM actions — **AC1 / D4** : Notifier (`mat-flat-button`) avant *Copier* dans `.share-announce-dialog__actions-row`. [share-announce-dialog.spec.ts]

- [x] [Review][Defer] `event-equipe-tab` / `event-dispos-tab` n’utilisent pas `openShareAnnounceDialog` — duplication d’ouverture `MatDialog` ; comportement identique. [event-equipe-tab.ts:490] [event-dispos-tab.ts:129]

- [x] [Review][Defer] Intents stub : `notifiableCount` compte les e-mails GET mais POST envoie 0 canal — libellé *Notifier X* + snack *Demande enregistrée.* ; cohérent **D8** jusqu’à Epic 8. [ShareRecipientsService.kt:292-318]

- [x] [Review][Defer] `notifiedCount` POST = preview GET (nudge) — pattern **NFR-R2** / 6.10b. [ShareRecipientsService.kt:114-118]

**Rejetés (bruit / conformes) :** bandeaux AC7–8 absents (waived) ; garde sans bandeau (D7) ; Notifier hors footer (AC4) ; label *Copier* court ; panelClass V1 retiré ; migration V54 + OpenAPI `lastManualNotifyAt` / `availability_nudge`.

### Validation create-story

- [x] AC métier numérotés et sourcés (UX-DR7, SCP, 6.10/6.10b)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` / `./gradlew test` mentionnés

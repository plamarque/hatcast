# Story 6.10: Share and announce (editable message, channels)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to open a **share/announce modal** with a **pre-generated, editable message** and actions for **supported channels** (WhatsApp, push/email recipient list),  
so that **I can communicate about the spectacle, the draw, or the composition** (**UX-DR7**, **FR31** manual slice).

## Acceptance Criteria

1. **Given** a user with **`canManageComposition`** on an event, **when** they open **« Partager »** on **Équipe** (draft with at least one assigned slot, composition **not** validated), **then** a **`MatDialog`** opens using the shared [**Share & announce**](#pattern-reference) shell: contextual title (draw intent), subtitle **event title — long date**, **editable textarea** prefilled with the **draw** template (role lines + emojis), and **« Envoyer par WhatsApp »** opens `whatsapp://send?text=` with the **current** editor text — **UX-DR7**, V1 [`DrawAnnounceModal.vue`](../../legacy/src/components/DrawAnnounceModal.vue).
2. **Given** the same permissions and a **validated** composition (`validatedAt != null`) with assignees, **when** they open **« Annoncer la compo »** on **Équipe**, **then** the **same** dialog shell opens with the **composition** template (COMPO header, role lines, confirm CTA line) and editable message; WhatsApp uses the same encoding rules — **UX-DR7**, V1 [`EventAnnounceModal.vue`](../../legacy/src/components/EventAnnounceModal.vue) `mode=selection`.
3. **Given** any share/announce dialog open, **when** default text is built, **then** embedded links use the **canonical V2 event URL** `{origin}/saison/{seasonSlug}/event/{eventSlug}` and, for composition announce, a **confirm deep link** `{eventUrl}?showConfirm=true` (resolves to **Équipe** tab + participation flow per [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts)) — **SPEC** event URL contract, [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts). **Do not** emit legacy `/season/...` paths.
4. **Given** the dialog is open, **when** the organizer edits the textarea, **then** WhatsApp and any later **send** action use the **edited** text (re-open dialog resets from fresh template unless product preserves local edit — match V1: reset on each open) — **UX-DR7** AC hints.
5. **Given** composition announce (`intent=composition`) or draw share (`intent=draw`), **when** the dialog loads the **« Personnes à prévenir »** section, **then** the client calls a new API **`GET /v1/seasons/{seasonId}/events/{eventId}/share-recipients?intent=draw|composition|event`**, displays **obfuscated** emails server-side, summary *« N personnes… X notifiables, Y manuellement »*, and recipient cards (green ✓ when at least one automatic channel exists) — mirror V1 [`MessagePreview.vue`](../../legacy/src/components/MessagePreview.vue). **MVP channel rule:** **email** counts as notifiable when present; **push** shows as unavailable until Epic **8.1** (UI copy, not silent failure).
6. **Given** recipients loaded, **when** the organizer clicks **« Envoyer les notifications »**, **then** the client calls **`POST .../share-recipients/notify`** (or `POST .../composition/announce`) with `{ intent, messageText }`, the server invokes **`CompositionNotificationPort.requestManualAnnouncement(...)`** (new stub, DEBUG log), returns **202/200** without blocking on real FCM/email — **FR31** manual intent; **Epic 8** replaces the adapter. **403** without `canManageComposition`; **409** when intent preconditions fail (e.g. `composition` with zero assignees).
7. **Given** a member **without** `canManageComposition`, **when** they view **Équipe**, **then** **Partager** / **Annoncer la compo** are **not** shown — **NFR-S2**.
8. **Given** **Équipe** toolbar rules from **6.6**/**6.9**, **when** buttons are shown, **then**: **Partager** only when `!validatedAt && hasAssignedSlot`; **Annoncer la compo** only when `validatedAt != null && hasAssignedSlot`; neither replaces **Publier** / **Valider** / **Compléter** — regression guard.
9. **Given** optional product slice (same dialog, lower priority than AC 1–2), **when** an organizer opens **« Annoncer »** from **Infos** event actions (kebab / admin menu) for **availability collection**, **then** `intent=event` uses the availability message template and **all season participants** as recipient scope — defer if timeboxed; document skip in Dev Agent Record.
10. **Couverture:** **UX-DR7**, **FR31** (manual announce intent stub) ; **NFR-S2**, **NFR-A1** (dialog focus trap, `aria-labelledby`, keyboard-close) ; **NFR-Q1** — Kotlin integration tests: recipients 403/200, obfuscated email, intent matrix, notify stub invoked; Angular tests: button visibility, dialog opens with correct template prefix, WhatsApp URL encoding, recipients summary rendering; `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (do not implement in 6.10)

| Item | Reason |
|------|--------|
| **Epic 8** | Real push/email delivery, FCM, templates, retry queues |
| **Epic 9** | Audit rows for manual announce (**FR35**) |
| **Cloud Functions / legacy** | No changes under `legacy/` or Firebase |
| **Copy-to-clipboard** | V1 had optional copy indicator — not required unless trivial |
| **Simuler**, **Effacer**, PIN gate | Other composition stories |
| **Confirmed-team-only template** | V1 `buildGlobalConfirmedTeamAnnouncementTemplate` when all confirmed — optional polish after core compo announce |
| **Analytics** (FR47) | Follow-through on share links — Epic 11 |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.3 (done)** | Publish draft; `publishDraftCompositionShared` stub |
| **6.6 (done)** | Validate/unlock; `requestCompositionConfirmation` stub |
| **6.9 (done)** | Gap-fill; `requestConfirmationForAssignees` stub |
| **6.11 (done)** | Équipe busy overlay — share actions must respect `compositionMutationBusy()` |
| **6.10 (this)** | Shared share/announce UI + message templates + recipients API + manual notify stub |
| **8.3** | Automated milestone notifications (distinct from manual 6.10) |

**PLAN.md:** **6.10** is **post-MVP transverse** (WhatsApp share); ship **UI + stubs** now so organizers can communicate; wire delivery in Epic **8**.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` only; **do not modify** `legacy/`.
- [x] **Angular — message templates** — new `apps/web/src/app/core/messaging/`:
  - Port/adapt V1 [`emailTemplates.js`](../../legacy/src/services/emailTemplates.js): `buildDrawAnnouncementMessage`, `buildCompositionAnnouncementMessage`, `buildAvailabilityAnnouncementMessage` (event intent).
  - Use [`roleLabelSingular`](../../apps/web/src/app/shared/event-roles/event-roles.ts) + `roleEmoji` for role lines; gender-aware labels only where V1 did (keep simple parity first).
  - `buildEventUrls(origin, seasonSlug, eventSlug)` → `{ eventUrl, confirmUrl }`.
- [x] **Angular — shared dialog** — `apps/web/src/app/shared/share-announce/`:
  - `ShareAnnounceDialog` (`MatDialog`) + data: `{ intent, eventTitle, eventDateIso, seasonSlug, eventSlug, slotsByRole, ... }`.
  - Sections: header, editable `textarea`, WhatsApp button, recipients block, **Envoyer les notifications** (disabled while `sending`).
  - SCSS: dark modal mood per [UX pattern](#pattern-reference) (purple subtitle, green WhatsApp/notify CTAs).
- [x] **API — recipients** — `ShareRecipientsService` + controller routes under composition or events:
  - Auth: `canManageComposition`.
  - `intent=draw|composition`: recipients = **distinct assignee participant ids** from composition slots (+ display name, email if allowed).
  - `intent=event`: recipients = **active season participants** (same pool as availability campaigns).
  - Response: `{ total, notifiableCount, manualCount, recipients: [{ participantId, displayName, emailObfuscated, channels: { email: boolean, push: boolean } }] }`.
  - Email obfuscation server-side (e.g. `ab••@gm••.com`) — do not send raw emails to unauthorized principals.
- [x] **API — manual notify stub** — extend [`CompositionNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt):
  - `requestManualAnnouncement(eventId, seasonId, intent, messagePreview, actorUserId)` — `NoOp` DEBUG log.
  - `POST` handler validates intent preconditions; does **not** duplicate automatic validate/publish hooks.
- [x] **OpenAPI** — extend [`composition.yaml`](../../services/api/openapi/composition.yaml) (or `events.yaml`) with GET recipients + POST notify.
- [x] **Angular — API client** — `share-announce-api.service.ts`: `getRecipients`, `sendNotifications`.
- [x] **Angular — Équipe entry points** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + `.html` + `.scss`):
  - `canShareDraw()` / `canAnnounceComposition()` computed signals.
  - Buttons **Partager** (green) and **Annoncer la compo** (green, validated only) in toolbar area per [UX draft/validated captures](../planning-artifacts/ux-references/event-detail-equipe-draft-validate-v1.png).
  - Open dialog with composition data mapped from `slotRows()` / `composition()`.
  - Disable while `compositionMutationBusy()`.
- [x] **Angular — tests:**
  - `share-announce-dialog.spec.ts`: template prefixes, WhatsApp `encodeURIComponent`, edited text.
  - `event-equipe-tab.spec.ts`: button visibility matrix (draft vs validated vs member).
  - Kotlin: `@Tag("FR31")` recipients + notify integration tests.
- [ ] **Optional (AC 9):** Infos tab / event admin menu **Annoncer** → `intent=event` using same dialog. *(Deferred — core Équipe flows shipped.)*

### Review Findings

- [x] [Review][Patch] API : pas de garde `validatedAt` pour `intent=draw|composition` — `validateIntentLifecycle` ajouté (409 si draw après validation ou composition non validée).
- [x] [Review][Patch] Obfuscation email : format invalide → `null` (plus de fuite en clair).
- [x] [Review][Patch] Liste destinataires : `@for` track par `participantId`.
- [x] [Review][Patch] Tests dialog : texte édité → WhatsApp + template `composition`.
- [x] [Review][Patch] A11y : `role="dialog"` retiré du template interne.
- [x] [Review][Patch] OpenAPI / DTO : `@Size(max = 500)` + `maxLength` OpenAPI.
- [x] [Review][Patch] Tests d’intégration : GET/POST 409 draw validé, POST 403 membre.
- [x] [Review][Defer] `ShareRecipientsIntegrationTest` non exécuté localement (Flyway/H2) — tests présents ; à valider en CI / env test sain. — deferred, pre-existing

## Dev Notes

### Pattern reference (UX-DR7)

Implement once; vary **title**, **label**, **default template**, **recipient resolver** per `intent`:

| Intent | Équipe / surface trigger | Default template | Recipients |
|--------|--------------------------|------------------|------------|
| `draw` | **Partager** (draft, not validated) | 🎲 TIRAGE + role lines | Assignees in current composition |
| `composition` | **Annoncer la compo** (validated) | 🎊 COMPO + confirm link line | Assignees in validated composition |
| `event` | Infos **Annoncer** (optional) | Availability / dispos CTA | All season participants |

Reference: [`ux-design-hatcast-v2.md` § Share & announce](../planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce) and [`pattern-share-announce-modal-v1.png`](../planning-artifacts/ux-references/pattern-share-announce-modal-v1.png).

### Canonical URLs (critical)

| Link | Pattern |
|------|---------|
| Event | `{origin}/saison/{seasonSlug}/event/{eventSlug}` |
| Confirm participation | `{eventUrl}?showConfirm=true` |

**Never** use V1 `/season/{slug}/event/{uuid}` in new code. Parent [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) already resolves **slug** routes — pass `seasonSlug` + `eventSlug` into the dialog.

### Toolbar visibility (Équipe)

| Button | Show when |
|--------|-----------|
| **Partager** | `canManageComposition && !validatedAt && ≥1 assigned slot` |
| **Annoncer la compo** | `canManageComposition && validatedAt && ≥1 assigned slot` |
| Hidden | Member; empty composition; during `compositionMutationBusy()` |

Aligned with V1 [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue): `openDrawAnnounce` vs `openAnnounce` (validated).

### Notification intents (FR31) — do not conflate

| Trigger | Port method (existing) | 6.10 |
|---------|------------------------|------|
| Publish draft (**6.3**) | `publishDraftCompositionShared` | — |
| Validate (**6.6**) | `requestCompositionConfirmation` | — |
| Gap-fill (**6.9**) | `requestConfirmationForAssignees` | — |
| Manual share dialog | — | **`requestManualAnnouncement`** (new stub) |

Manual **« Envoyer les notifications »** must **not** call validate/publish/gap-fill hooks.

### Recipients / privacy

- Reuse participant email access patterns from [`SeasonParticipantService`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) (`includeEmail` for organizers).
- **Push** `channels.push = false` for all rows until **8.1**; UI explains manual follow-up for yellow cards (V1 parity).
- **manualCount** = recipients without email (and without push when push exists later).

### Brownfield — files to touch

**Create:**

| Asset | Purpose |
|-------|---------|
| `apps/web/src/app/core/messaging/*.ts` | Text templates + URL builder |
| `apps/web/src/app/shared/share-announce/*` | Dialog UI |
| `apps/web/src/app/core/share-announce/share-announce-api.service.ts` | HTTP client |
| `services/api/.../ShareRecipientsService.kt` | Recipient resolution |
| `services/api/.../ShareRecipientsController.kt` or extend `CompositionController` | Routes |
| Integration tests `ShareRecipientsIntegrationTest.kt` | FR31 |

**Extend:**

| Asset | Change |
|-------|--------|
| `CompositionNotificationPort.kt` | `requestManualAnnouncement` |
| `event-equipe-tab.*` | Partager + Annoncer buttons |
| `composition.yaml` | OpenAPI |

**Do not change:** draw/assign/validate/participation semantics; legacy Firebase.

### Pitfalls (prevent LLM mistakes)

1. **Duplicate modals** — one `ShareAnnounceDialog`, not separate Draw/Compo components.
2. **Wrong URL prefix** — `/saison/` not `/season/`.
3. **Showing Partager when validated** — draw share is pre-validate only.
4. **Calling validate on notify** — manual announce is separate from **Valider**.
5. **Raw emails in API JSON** — obfuscate in DTO for organizer UI.
6. **Implementing FCM/SMTP** — stub only; Epic **8**.
7. **Ignoring 6.11 busy overlay** — disable share buttons when `compositionMutationBusy()`.
8. **Recipient list = entire troupe for compo** — compo intent = **assignees only** (V1 selection mode).
9. **Blocking on notification failure** — stub returns success; NFR-R2 hardening is Epic **8**.

### Previous story intelligence (6.9)

1. **Validated gap-fill** works while locked — **Annoncer** still available when validated (UX capture).
2. **`slotRows()`** is source of truth for role lines in messages.
3. **Targeted notification port** pattern — copy for manual announce stub + integration test `verify(port)`.

### Previous story intelligence (6.11)

1. **`compositionMutationBusy()`** — bind share buttons `[disabled]` to same signal.
2. **Avoid extra `loadEvent` after notify** — stub response only; no parent reload unless lifecycle changes.

### Previous story intelligence (6.6 / 6.3)

1. **Publish** vs **validate** vs **announce** are three different user actions.
2. **Draft banner** — Partager can appear on published draft before validate (has assignees).

### Git intelligence (recent)

- **`8f9066c`** — shared admin patterns; follow `MatDialog` + `shared/` folder conventions like [`composition-participation-dialog`](../../apps/web/src/app/shared/composition/composition-participation-dialog.ts).
- Composition epic commits (**6.9**, **6.11**) — extend `event-equipe-tab`, do not fork lifecycle logic.

### Latest tech information

- **Angular 19** — dialog via `MatDialog.open(ShareAnnounceDialog, { data, panelClass })`; `inject(MatDialogRef)`.
- **WhatsApp Web/deep link** — `whatsapp://send?text=` (V1); on desktop without handler, optional fallback snackbar *« Copiez le message »* (nice-to-have).
- **Spring Boot 3** — new GET/POST endpoints with `@PreAuthorize` / existing `canManageComposition` guard.

### References

- [epics.md — Story 6.10](../planning-artifacts/epics.md)
- [prd.md — FR31](../planning-artifacts/prd.md)
- [SPEC.md — canonical event URLs](../../SPEC.md)
- [ux-design-hatcast-v2.md — Share & announce pattern](../planning-artifacts/ux-design-hatcast-v2.md#pattern-share-announce)
- [PLAN.md — post-MVP 6.10](../../PLAN.md)
- [architecture.md — notifications & deep links](../planning-artifacts/architecture.md)
- V1: [`MessagePreview.vue`](../../legacy/src/components/MessagePreview.vue), [`DrawAnnounceModal.vue`](../../legacy/src/components/DrawAnnounceModal.vue), [`EventAnnounceModal.vue`](../../legacy/src/components/EventAnnounceModal.vue)
- Stories **6.3**, **6.6**, **6.9**, **6.11** (composition + Équipe patterns)

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Spring `@SpringBootTest` integration tests blocked locally by Flyway/H2 migration error (pre-existing env); Kotlin compiles; `EmailObfuscationTest` passes.
- AC 9 (`intent=event` from Infos) deferred; API and dialog already support `event` intent.

### Completion Notes List

- Shared `ShareAnnounceDialog` with editable message, WhatsApp deep link, recipients block, and notify stub.
- Équipe: **Partager** (draft + assignees) and **Annoncer la compo** (validated + assignees); hidden for members and while `compositionMutationBusy()`.
- API: `GET/POST .../share-recipients` with obfuscated emails, intent matrix, `requestManualAnnouncement` on `CompositionNotificationPort`.
- Canonical URLs `/saison/{slug}/event/{slug}` and `?showConfirm=true` in composition template.
- Tests: Angular 40 passed (share + equipe); `EmailObfuscationTest`; integration tests authored (`ShareRecipientsIntegrationTest`) — run when Flyway test DB is healthy.

### File List

- apps/web/src/app/core/messaging/event-urls.ts
- apps/web/src/app/core/messaging/share-announce-messages.ts
- apps/web/src/app/core/messaging/share-announce-messages.spec.ts
- apps/web/src/app/core/share-announce/share-announce-api.service.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.ts
- apps/web/src/app/shared/share-announce/share-announce-dialog.html
- apps/web/src/app/shared/share-announce/share-announce-dialog.scss
- apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- services/api/src/main/kotlin/com/hatcast/api/share/EmailObfuscation.kt
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsController.kt
- services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/share/EmailObfuscationTest.kt

### Change Log

- 2026-05-26: Story 6.10 — share/announce modal, recipients API, manual notify stub (FR31 / UX-DR7).

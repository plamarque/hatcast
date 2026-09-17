---
title: 'Notify unanswered availability requests'
type: feature
created: '2026-09-17'
status: in-progress
review_loop_iteration: 0
feature_branch: feat/availability-reminder-notify
baseline_commit: 2041bc67e7791035f1c1f14d8bf3b3b265dc9fa7
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Reminders only support manual sharing; email preview ignores preferences (BUG-022).

**Approach:** Implement the mockup approved by Patrice and Nicolas: **Copier / WhatsApp / Notifier**, then a stacked confirmation listing channels and manual contacts. Supersede manual-only policy for `availability_nudge` only.

## Boundaries & Constraints

**Always:** Respect Disponibilités preferences (`AVAILABILITY_REQUEST`), individual sends and unanswered-only deduplicated recipients. Preserve edited text. Recheck authorization, lifecycle and eligibility server-side. Develop in the isolated feature worktree.

**Ask First:** Expanding to other share intents, adding guest delivery or a notification category, production sending, integration or deployment.

**Never:** Override opt-outs, expose emails, create an inbox, change sprint status or claim delivery from acceptance.

## I/O & Edge-Case Matrix

| State / action | Expected behavior | Failure handling |
|---|---|---|
| Push only / email only / both enabled and available | Show exact eligible channels beside each name; deliver via existing dispatcher | Delivery remains subject to provider availability |
| Both preferences disabled | Separate named section: notifications disabled; suggest Copier / WhatsApp | Never send |
| Missing linked account, email or active push subscription | Explain unavailable channels, without calling it an opt-out | Manual contact when none usable |
| Already notified but still unanswered | Include in reminder audience; show recent reminder warning when applicable | No silent exclusion |
| Audience or channels change after preview | Reject stale confirmation before dispatch; refresh recipient summary | Require a new explicit confirmation |
| Nobody eligible / preview error | Disable send; retain manual actions and retry | No POST |
| Cancel / double click / request failure | Cancel sends nothing; lock during request; preserve text | No automatic resend after ambiguous network failure |
| POST accepted | Show “Demande de rappel prise en compte”; keep manual-contact names available | Never say messages were delivered |

</frozen-after-approval>

## Code Map and Execution

Path aliases: `web` = `apps/web/src/app`; `api` = `services/api/src/main/kotlin/com/hatcast/api`; `tests` = `services/api/src/test/kotlin/com/hatcast/api`. 

- [ ] `api/share/ShareRecipientsService.kt`, `api/share/dto/ShareRecipientsDtos.kt`: fix BUG-022 using account email, category preferences and linked-user eligibility. Expose unavailable reasons, confirmation fingerprint and `acceptedCount`. Reject stale reminder previews before side effects; require a fingerprint for nudge POST.
- [ ] `api/notification/NotificationDispatcher.kt`, `NotificationDispatchContext.kt`, `CompositionWorkflowNotificationAdapter.kt`, `api/composition/CompositionNotificationPort.kt`: constrain dispatch to confirmed users/channels and recheck preferences. Reuse `NotificationRecipientResolver.resolveUnknownAvailabilityRecipients`; unlike preview participant rows, it excludes unlinked accounts. Existing dispatch absorbs transport failures: acceptance is not delivery.
- [ ] `web/core/share-announce/share-announce-api.service.ts`: carry the typed preview, fingerprint, reasons and conflicts; preserve non-reminder callers.
- [ ] `web/shared/share-announce/share-announce-dialog.{ts,html,scss}` and new `availability-reminder-confirm-dialog.{ts,html,scss}`: three actions, stacked confirmation, per-person channels, manual-contact section and request states. Preserve edited message and existing other intents. Use existing reminder dates for information, not a new cooldown.
- [ ] Adjacent Angular `.spec.ts` files and `tests/share/{ShareRecipientsIntegrationTest,ManualAvailabilityNudgeIntegrationTest}.kt`: test the matrix, deduplication, account/participant email divergence, guests, permission rejection and stale previews with no side effects.
- [ ] `apps/web/e2e/availability-reminder-notify.spec.ts`, `apps/web/playwright.config.ts`: register targeted desktop/mobile coverage for four channel cases, focus, cancellation, manual sharing and confirmation. Use isolated fixtures and fake transports.
- [ ] `services/api/openapi/composition.yaml`, `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `docs/v2/technical/NOTIFICATIONS_CATALOG.md`, `_bmad-output/planning-artifacts/ux-design-share-announce-manual-only.md`, `ISSUES.md`: document the approved reminder exception, API contract and BUG-022 fix. Keep scheduling in PLAN only.

## Acceptance Criteria

- Given an authorized organizer, when opening Relance dispos, then three actions appear and only final confirmation requests notifications.
- Given a confirmed preview, when sending, then no additional person or channel is used and current opt-outs remain authoritative.
- Given other intents, when sharing, then manual-only behavior remains unchanged.

## Acceptance Criteria — Material 3 (UI)

- Given either theme, when rendering, then use MatDialog, Material buttons/icons and system tokens (M3-1/2).
- Given 320–480px width or keyboard navigation, when using stacked dialogs, then preserve readable controls, 48px targets, French labels and focus restoration (M3-3).
- Given final review, when checking FRONTEND_UI, then record compliance; global navigation is unchanged (M3-4/5).

## Spec Change Log

### Review Findings

- [x] [Review][Patch] Classer correctement les personnes ayant désactivé les deux canaux [apps/web/src/app/shared/share-announce/availability-reminder-confirm-dialog.ts:22]
- [x] [Review][Patch] Lier l’empreinte de confirmation à l’identité du compte destinataire [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:477]
- [x] [Review][Patch] Ne pas présenter le compteur d’acceptation comme un compteur de livraison [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:145]
- [x] [Review][Patch] Empêcher les confirmations concurrentes et les rappels dupliqués [apps/web/src/app/shared/share-announce/share-announce-dialog.ts:193]
- [x] [Review][Patch] Revalider l’audience inconnue au moment du dispatch [services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt:232]
- [x] [Review][Patch] Couvrir le flux de confirmation et les conflits d’aperçu par des tests UI, API et E2E [apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts:1]

### Review Findings — final review (2026-09-18)

- [x] [Review][Patch] Refuser une sélection vide ou sans destinataire éligible avant tout enregistrement [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:121]
- [x] [Review][Patch] Rendre une confirmation inutilisable après un premier envoi et bloquer les modales concurrentes [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:115]
- [x] [Review][Patch] Classer les préférences désactivées comme opt-out, même lorsqu’un autre canal est techniquement indisponible [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:340]
- [x] [Review][Patch] Stabiliser l’empreinte et les clés Angular sur participantId plutôt que sur le seul nom affiché [services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:477]
- [x] [Review][Patch] Afficher l’avertissement de relance récente fourni par l’aperçu [apps/web/src/app/shared/share-announce/share-announce-dialog.ts:121]
- [x] [Review][Patch] Documenter recipientParticipantIds et unavailableReason dans le contrat OpenAPI [services/api/openapi/composition.yaml:729]
- [x] [Review][Patch] Garantir trois actions lisibles et accessibles sur une seule ligne à 320px [apps/web/src/app/shared/share-announce/share-announce-dialog.scss:62]
- [x] [Review][Patch] Ajouter les tests UI, API et E2E du flux : sélection, opt-outs, conflits d’aperçu, canaux et mobile [apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts:1]

## Verification

Run focused Angular tests and `npm run build -w @hatcast/web`; run `./gradlew test --tests '*ShareRecipientsIntegrationTest' --tests '*ManualAvailabilityNudgeIntegrationTest'` from `services/api`, plus affected dispatcher tests. Run `git diff --check`.

After runtime readiness, execute the registered Playwright project with `scripts/v2/story-e2e-evidence.sh`; inspect persisted evidence before human smoke. No implicit browser download. Independent review and human smoke precede integration.

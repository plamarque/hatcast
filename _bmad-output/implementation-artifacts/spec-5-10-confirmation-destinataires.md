---
title: 'Story 5.10: Confirm accepted reminder recipients'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'dispatch'
baseline_commit: 61ea6883d463228c2a8eb036db99a12831dcfd9d
review_loop_iteration: 0
context:
  - docs/v2/technical/FRONTEND_UI.md
  - SPEC.md
  - _bmad-output/implementation-artifacts/spec-5-10-voir-les-personnes-sans-reponse-aux-disponibilites.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After an availability reminder request, organizers receive only a generic acknowledgement and cannot see who was actually included.

**Approach:** Replace the form after sending with the approved compact result, naming people whose notification had a SENT or PARTIAL transport result and separately showing failures. Verify the complete flow with isolated browser tests and produce a playable video for Patrice showing the full organizer journey through the final names.

## Boundaries & Constraints

**Always:** Derive names from the server-confirmed recipients after the existing unanswered-recipient recheck, not solely from the earlier preview. De-duplicate by account consistently with dispatch. Preserve server authorization, the fingerprint check, preference and channel filtering, explicit confirmation, retry handling and other share intents. A success must reflect at least one SENT or PARTIAL transport result; distinguish failures and do not guarantee device receipt. An empty accepted set must never present names or a successful notification claim. E2E uses isolated test data and explicitly disabled external transports. Keep a playable recording of the complete success journey for human viewing.

**Never:** Send real email or push notifications during verification, expose private channel identifiers, alter availability, claim notification success for failed or skipped transports, change the general organizer selection flow, or deploy.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Accepted | Two eligible unanswered accounts, one excluded | Server response and compact confirmation name people with successful or partial transport results and omit the excluded person | Failed transports are shown separately |
| Changed | A person answers after preview | The final server recheck excludes that account from the accepted result | Empty final audience is reported truthfully |
| Duplicate | Multiple participant rows map to one account | Confirmation contains one deterministic name per dispatched account | No duplicate claim |
| Rejected | Stale fingerprint, failed request, or cancellation | No success confirmation or names are shown | Existing refresh/retry behavior remains |
| Other intents | Draw, composition, event | Existing behavior and response compatibility remain intact | No new reminder acknowledgement |
| Accessibility | Mobile, desktop, keyboard and screen reader | Names and acceptance status remain readable and accessible | No dependency on transient snackbar alone |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt`: builds and checks the current preview and `confirmedChannels`; currently returns count before the downstream recheck.
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt`: rechecks unknown recipients and filters `recipientChannels` before dispatch. `CompositionNotificationPort.kt` supplies the boundary; handle its no-op implementation truthfully.
- `services/api/src/main/kotlin/com/hatcast/api/share/dto/ShareRecipientsDtos.kt` and `services/api/openapi/composition.yaml`: response contract.
- `services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt`: local API integration tests with dispatcher mock; compare final returned recipients with dispatch context.
- `apps/web/src/app/core/share-announce/share-announce-api.service.ts`: response typing.
- `apps/web/src/app/shared/share-announce/share-announce-dialog.*`: post-request UI, failure, preview and accessibility behavior.
- `apps/web/e2e/story-5-10-organizer.spec.ts`, `apps/web/playwright.config.ts`: isolated browser journey and transport configuration. Ensure no externally configured email or push transports can run.

## Tasks & Acceptance

**Execution:**
- [x] `CompositionNotificationPort.kt`, `CompositionWorkflowNotificationAdapter.kt`, `ShareRecipientsService.kt` and DTO/OpenAPI — return final accepted recipient identities with accurate count, handling rechecks, deduplication and the no-op implementation.
- [x] `ManualAvailabilityNudgeIntegrationTest.kt` — prove final identities, exclusions, races, duplicates and unchanged other-intent behavior with mocked dispatcher.
- [x] `share-announce-api.service.ts`, `share-announce-dialog.*` and tests — render accessible post-send confirmation using server data and accurately handle zero/error/stale responses.
- [x] `SPEC.md` — document accepted-recipient acknowledgement and its distinction from delivery.
- [x] `story-5-10-organizer.spec.ts` and Playwright setup — test real local API confirmation with multiple eligible/ineligible participants; explicitly disable external transports and preserve isolated fixtures.
- [x] Run focused API and Angular tests, isolated E2E and applicable build; record exact test counts and Material 3 checklist. Retain and inspect a playable recording of the complete organizer success journey and provide its path for human review.

**Acceptance Criteria:**
- Given an organizer confirms a reminder, when the server accepts recipients, then the confirmation names only those returned by the server after its unanswered recheck.
- Given a cancelled, stale, failed or empty request, when the flow completes, then no misleading success names appear.
- Given the E2E test runs, when it confirms a reminder, then it checks the response and displayed names without sending real notifications.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

- Targeted Kotlin integration tests and Angular component tests pass.
- Isolated Playwright runs the organizer success journey with multiple recipients and explicitly disabled external transports.
- Angular build and `git diff --check` pass.


## Verification complémentaire — 2026-11-07

- API : tests ciblés du rappel, du dispatcher, de l’adaptateur, du transport E2E et des autres intentions réussis.
- Interface : 27 tests ciblés et compilation réussis.
- Playwright : parcours isolé organisateur réussi sur les ports 14210 et 19080 ; vidéo enregistrée ; transport E2E simulé sans envoi réel.
- Revue indépendante : correction des erreurs de traitement, des participants en doublon, des canaux refusés ou ignorés, du garde-fou de cible E2E et de la vérification de la date de relance. Dernière revue des corrections sans nouveau défaut relevé.
- Incident de test : avant correction de l’URL API des fixtures, deux réinitialisations de fixtures E2E ont atteint le service du port 8080 ; le périmètre exact des données affectées dépend de ce service.


## Approved UX revision — 2026-11-07

Patrice approved the compact success mockup and asked to show the full recorded journey. The form is replaced after the result; names are displayed in two columns and failures are identified separately. A simulated sender is enabled explicitly only in the isolated E2E run.


## Final review and verification

Independent API and UI reviews completed. CORS compatibility and inherited Spring datasource/profile risks were corrected and re-reviewed. Isolated Playwright passed with deliberately invalid inherited datasource and profile settings; 24 targeted UI tests and 56 API tests passed. The Material 3 dialog, focus, live status, keyboard-scrollable names, mobile layout and single dismissal control were checked; no checklist waiver was introduced.

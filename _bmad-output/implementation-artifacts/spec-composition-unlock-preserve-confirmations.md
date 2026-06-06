---
title: 'Composition unlock — preserve participation status'
type: 'spec-amendment'
created: '2026-06-06'
amended: '2026-06-07'
status: 'approved'
route: 'sprint-change-proposal'
parent: '../planning-artifacts/sprint-change-proposal-2026-06-06-composition-unlock-preserve-confirmations.md'
supersedes: '6-6 unlock global pending reset (2026-05 V2)'
related:
  - 'spec-composition-notify-on-validate-only.md'
  - '6-6-validation-verrouillage-de-la-composition.md'
  - '6-8-confirmation-ou-declinaison-de-participation-membre.md'
---

## Intent

**Problem:** Unlocking a validated composition resets every assigned slot to `pending`, erasing confirmation progress and forcing full re-confirmation cycles. Organizer proxy confirm is blocked in draft. This contradicts V1 (`unconfirmCast` preserved `playerStatuses`) and the 2026-06-06 notification matrix (revalidate → notify non-confirmed only).

**Approach:** Unlock clears structural lock only (`validatedAt`). Preserve slot participation statuses. Reset `pending` only when draft edits change a slot's assignee. Allow organizer proxy participation in organizer draft without notification until validate/revalidate.

## Boundaries & Constraints

**Always:**

- Unlock: clear `validatedAt`; keep assignees and `participationStatus` values.
- Member visibility after unlock: ordinary members do **not** see slot assignments until re-validation (existing `CompositionVisibilityRules`).
- Member self-service confirm/decline: requires `validatedAt != null` (FR25 unchanged).
- Draft slot assign/replace: new assignee → `pending` (existing `assignParticipant` behaviour).
- **First validate** and **revalidate:** slots with status `confirmed` are **preserved** (no notification); other assigned slots → `pending` before dispatch (`CONFIRMATION_REQUEST` on first validate, `RECONFIRMATION_REQUEST` on revalidate) — amendment **2026-06-07**.
- Revalidate after prior validate audit: `RECONFIRMATION_REQUEST` to assignees with status ≠ `confirmed` only.
- Audit: slot assignment and participation proxy actions recorded (FR35).

**Ask First:**

- Whether former assignees removed during draft post-unlock receive `REMOVED_FROM_COMPOSITION` on **revalidate** only — **proposed yes** (aligns with 8.5 intent; may require diff vs pre-unlock snapshot).

**Never:**

- Notify on unlock.
- Notify on draft assign/replace/clear or organizer proxy in draft.
- Reset all slots to `pending` on unlock.
- Allow linked members to confirm/decline in organizer draft.

## Participation status rules

| Mutation | Condition | `participationStatus` effect |
|----------|-----------|------------------------------|
| **Unlock** | slot has assignee | **No change** |
| **Validate (first)** | status = `confirmed` | **No change**, no notification |
| **Validate (first)** | status ≠ `confirmed` | → `pending` (+ `CONFIRMATION_REQUEST` for that assignee only) |
| **Revalidate** | status ≠ `confirmed` | → `pending` before dispatch (+ `RECONFIRMATION_REQUEST` for that assignee only) |
| **Revalidate** | status = `confirmed` | **No change**, no notification |
| **Draft assign/replace** | assignee changes | that slot → `pending` |
| **Draft assign/replace** | same assignee (no-op) | no change |
| **Organizer proxy** | draft or validated | set per request; notify only when validated/revalidate rules apply |

## Notification matrix (delta vs notify-on-validate-only)

Unchanged except **precondition** for revalidate row: confirmed assignees must **survive unlock** for « notify non-confirmed only » to hold.

| Trigger | State | Dispatch | Forbidden |
|---------|-------|----------|-----------|
| Unlock | validated → organizer draft | — | Any intent; **status reset** |
| Org proxy confirm/decline | organizer draft | — | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `PROXY_CONFIRMATION_RECORDED`¹ |
| Revalidate | draft → validated (2nd+ validate) | `RECONFIRMATION_REQUEST` (non-`confirmed` assignees); `REMOVED_FROM_COMPOSITION` (former assignees dropped in draft, if implemented) | `CONFIRMATION_REQUEST`, `TEAM_VALIDATED_FYI` |

¹ `PROXY_CONFIRMATION_RECORDED` on validated slots unchanged from existing spec.

## Code map (expected touch points)

| File | Change |
|------|--------|
| `CompositionService.kt` | Remove participation reset loop in `unlockComposition` |
| `CompositionParticipationService.kt` | Allow `canManageComposition` when `validatedAt == null`; keep member gate on validated only |
| `CompositionSlotAssignmentService.kt` | Verify assignee change → `pending` (likely already); wire `CompositionAssigneeRemovedEvent` on draft replace if removal-on-revalidate needed |
| `CompositionService.kt` (`validateComposition`) | Revalidate path unchanged if statuses preserved at unlock |
| OpenAPI `composition.yaml` | Description updates |

## Acceptance criteria (implementation story)

1. **Given** a validated composition with slots `confirmed`, `pending`, and `declined`, **when** unlock runs, **then** `validatedAt` is null, assignees unchanged, each slot keeps its prior `participationStatus`, and members see no slots.
2. **Given** unlock with a confirmed assignee on slot A and pending on slot B, **when** an organizer proxy-confirms slot B in draft, **then** slot B becomes `confirmed` and no notification is dispatched.
3. **Given** unlock with Alice confirmed on slot 0, **when** organizer replaces slot 0 with Bob, **then** Bob is `pending`, other slots unchanged, no notification until revalidate.
4. **Given** unlock preserving Alice `confirmed` and Bob `pending`, **when** revalidate runs, **then** only Bob receives `RECONFIRMATION_REQUEST`; Alice is not notified.
5. **Given** first validate on a draft with mixed statuses (e.g. organizer proxy-confirmed in draft), **when** validate runs, **then** `confirmed` slots stay `confirmed`; other assignees → `pending` + `CONFIRMATION_REQUEST` **only** for non-`confirmed` assignees (same preservation rule as revalidate).
6. **Given** a linked member (non-organizer), **when** they POST participation on a draft composition, **then** **409** « Les confirmations ne sont pas encore ouvertes ».

## Verification (preview)

```bash
cd services/api && ./gradlew test \
  --tests "com.hatcast.api.composition.CompositionValidateUnlockIntegrationTest" \
  --tests "com.hatcast.api.notification.ReconfirmationNotificationIntegrationTest" \
  --tests "com.hatcast.api.notification.CompositionNotificationTriggerMatrixIntegrationTest" \
  --tests "com.hatcast.api.composition.CompositionParticipationIntegrationTest"
```

## Traceability

| Requirement | Coverage |
|-------------|----------|
| FR23 | Unlock preserve + targeted draft reset |
| FR25 | Member validated-only (regression) |
| FR26 | Organizer proxy in draft |
| FR31 | Notify matrix + G-014 resolved |
| FR35 | Audit unchanged |

## Deferred (unchanged)

- **G-012** — collective team-validated FYI when all confirmed
- PIN before unlock

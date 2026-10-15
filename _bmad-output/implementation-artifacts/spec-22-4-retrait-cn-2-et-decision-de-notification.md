---
title: 'Retire CN-2 and decide removal notification'
type: 'feature'
created: '2026-10-14'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'cecf365accfa51661a6ac0c00a4b5b3b0203996c'
context:
  - 'AGENTS.md'
  - '_bmad-output/specs/spec-composition-needs-safety/SPEC.md'
  - 'docs/v2/technical/NOTIFICATIONS_CATALOG.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Epic 22 has replaced CN-2's separate regularization experience with the Équipe slot workflow, but CN-2's historical material and old regularization wording still need a bounded retirement audit. An explicit deletion of an assigned slot now exists as an atomic operation, yet its member-removal notification rule remains undecided and conflicts between the safety contract and the as-shipped notification catalogue.

**Approach:** Retire only CN-2-only active surfaces and wording while retaining traceable superseded history; revalidate the CN-1 organizer/member projection boundary against the integrated 22.3 path; then retain explicit-removal evidence through the unlocked draft and notify only on successful revalidation, with preference and idempotency coverage.

## Boundaries & Constraints

**Always:** Preserve `roleSlots` as the canonical role-need model; retain assigned out-of-model slots until an organizer explicitly clears or deletes them; keep them organizer-only in composition, agenda, recipient, and statistics projections. Treat Hors modèle retention as non-notifiable. After unlock, use the existing `SLOT_DELETED` audit evidence since the latest `COMPOSITION_UNLOCKED` event as the explicit-removal diff, without dispatching; on a successful revalidation, dispatch the existing `REMOVED_FROM_COMPOSITION` after commit, subject to eligibility and its one-shot delivery mark. Keep superseded CN-2 evidence auditable without exposing its obsolete organizer workflow as active product behavior.

**Never:** Merge or reproduce the CN-2 worktree prototype; add a new notification category, manual messaging workflow, schema migration, or a generic audit-diff system; notify for a draft/invisible composition; alter ordinary-member projection redaction; rewrite historical audit entries; push, deploy, or modify the generated tracker outside its controller.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CN-2 retirement | Current Epic 22 path available; CN-2 prototype remains unmerged | Active docs and UI expose Équipe/Hors modèle only; CN-2 remains marked superseded in history | Do not delete historical evidence or merge prototype code |
| Explicit assigned-slot deletion after unlock | Organizer confirms deletion of a previously member-visible assignment while `validatedAt` is null | Atomic structural mutation and removal diff; no immediate member delivery | Rollback produces neither mutation nor stored removal diff |
| Revalidation after an explicit deletion | The unlocked draft with a stored removal diff validates successfully | One eligible former assignee receives at most one `REMOVED_FROM_COMPOSITION` delivery after commit | Failed validation sends nothing and preserves no partially dispatched delivery |
| Out-of-model retention | Template change makes an assigned slot non-required | Organizer sees neutral Hors modèle row; members see no affected assignment; no removal notification | Existing CN-1 filtering remains in force |
| Empty deletion / unlinked or opted-out former assignee | No former linked recipient or channel eligibility | Structural change completes; no delivery is attempted or recorded as a successful send | No substitute recipient or organizer-only detail leaks |
| Duplicate/retry | Same deletion event reaches after-commit handling twice | Existing one-shot `(intent, event, user)` mark prevents a duplicate delivery | A later re-selection and independently approved future removal must remain distinguishable |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotStructureService.kt` -- atomic required-slot and out-of-model deletion, authorization, lock guard, role-slot compaction, and `SLOT_DELETED` audit record containing the former subject.
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventRepository.kt` and `CompositionService.kt` -- query explicit assigned-slot deletions after the latest `COMPOSITION_UNLOCKED` boundary during revalidation and publish their domain events in that transaction; no new persistence schema.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt` -- after-commit bridge for `CompositionAssigneeRemovedEvent`; reuse only after the product timing decision.
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt` -- existing `REMOVED_FROM_COMPOSITION` recipient resolution, preferences, and `ONCE` reminder-mark idempotency to invoke only from successful revalidation.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` and `.html` -- explicit destructive confirmation and separate required/out-of-model delete calls; preserve this distinction and make no CN-2 regularization surface.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt` and `CompositionDtos.kt` -- CN-1 reconciliation data remains manager-only and powers the integrated Hors modèle rows.
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt` and `CompositionSlotAssignmentIntegrationTest.kt` -- existing out-of-model, deletion, compaction, lock, and projection fixtures to extend.
- `services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt` -- notification matrix coverage for removal and draft/revalidation cases.
- `_bmad-output/specs/spec-composition-needs-safety/{SPEC.md,delivery-plan.md}` and `docs/v2/technical/NOTIFICATIONS_CATALOG.md` -- active contracts to align after the decision; preserve historical CN-1/CN-2 artifacts as superseded evidence.

## Tasks & Acceptance

**Execution:**
- [x] Audit `apps/web/`, `services/api/`, active normative docs, and the unmerged CN-2 branch -- enumerate CN-2-only surfaces, remove or supersede only active references, and preserve historical traceability.
- [x] `CompositionSlotStructureService.kt`, `AuditEventRepository.kt`, validation service, and notification event boundary -- derive the approved explicit-removal diff from `SLOT_DELETED` audit records after the latest unlock, then dispatch it only after successful revalidation commits -- make member communication match the approved product decision without a migration.
- [x] `CompositionIntegrationTest.kt`, `CompositionSlotAssignmentIntegrationTest.kt`, and `CompositionNotificationTriggerMatrixIntegrationTest.kt` -- prove the selected timing, no-send paths, rollback, projection redaction, and one-shot delivery -- lock CN-1/CN-3 safety behavior.
- [x] `_bmad-output/specs/spec-composition-needs-safety/`, `docs/v2/technical/NOTIFICATIONS_CATALOG.md`, and affected implementation artifacts -- state one active rule and mark CN-2-only wording superseded -- prevent contradictory future implementation.

**Acceptance Criteria:**
- Given Epic 22 is available, when an organizer uses Équipe, then no active regularization screen or copy is exposed and the historical CN-2 record remains explicitly superseded.
- Given a template only retains an assigned slot as Hors modèle, when the update commits, then no removal notification is emitted and ordinary-member projections remain redacted.
- Given an organizer explicitly deletes an assigned slot after unlocking a previously visible composition, when the deletion commits, then the former assignee receives no immediate delivery and the draft retains the removal diff for revalidation.
- Given that draft revalidates successfully, when its transaction commits, then the former linked assignee receives at most one eligible `REMOVED_FROM_COMPOSITION` delivery after commit.
- Given the deletion or revalidation rolls back, the composition is draft/invisible, the former assignee is unlinked or ineligible, or the same event retries, when dispatch is considered, then no unintended delivery occurs.
- Given an ordinary member reads composition, agenda/focus, notification-recipient, or statistics-derived data after template changes or deletion, when an out-of-model assignment exists, then no organizer-only detail or count leaks.

## Implementation Notes

- Baseline investigation: local `v2` commit `a25d8248185ed468db6d9414262ba08534173293` already integrates 22.3 (`cde79ce7`), while `codex/cn-2-expliquer-regulariser-selections` remains unmerged.
- Product decision (2026-10-14): after an unlock, explicit deletion of an assigned slot is silent; the former assignee is notified only after the draft successfully revalidates. The current structural-delete service rejects validated compositions and does not publish `CompositionAssigneeRemovedEvent`; the notification adapter already provides preference-aware, one-shot delivery for the revalidation path.
- Technical decision: derive pending removals from existing `SLOT_DELETED` audit entries bounded by the latest `COMPOSITION_UNLOCKED` event. This retains one source of historical truth and avoids a new queue/table; clear/unassign (`SLOT_CLEARED`) and Hors modèle retention remain excluded.
- Implementation: `CompositionService` publishes only still-absent former assignees, after recording successful revalidation; its existing after-commit listener and adapter retain preference/eligibility and `ONCE` delivery enforcement. `AuditEventRecorder` now preserves sub-second precision so the latest unlock boundary is deterministic for rapid successive actions.
- Evidence: `./gradlew test --tests 'com.hatcast.api.composition.CompositionIntegrationTest' --tests 'com.hatcast.api.composition.CompositionSlotAssignmentIntegrationTest' --tests 'com.hatcast.api.notification.CompositionNotificationTriggerMatrixIntegrationTest'` passed. The Angular build is unverified in this prepared worktree because `apps/web/node_modules` is absent (`ng: command not found`); no web source changed and no mutable dependency tree was linked.

## Design Notes

The user-visible distinction is deliberately narrow: **Hors modèle** means a person is preserved safely and is not a removal; **Supprimer cette place** removes the person only after an explicit destructive confirmation. Notification copy must state only the member-relevant outcome, never reveal organizer-only rationale or reconciliation data.

## Review Triage Log

| Finding | Verdict | Route | Evidence |
| --- | --- | --- | --- |
| Edge-case: `SLOT_DELETED` for Hors modèle could notify | high | patch | `deleteOutOfModelSlot` records `outsideModel: true`; the revalidation filter now excludes it and matrix case M-E5 verifies no delivery. |
| Edge-case: unpublished prior composition could notify | false | reject | `CompositionVisibilityRules` makes every validated composition member-visible, independently of `publishedAt`; unlock requires that validated state. |
| Blind hunter: Hors modèle deletion could notify | high | patch | Same verified defect as the edge-case finding; the `outsideModel` filter and M-E5 close it. |
| Blind hunter: invisible composition could notify | false | reject | The reachable unlock path starts from `validatedAt != null`, which is the member-visible domain state. |
| Blind hunter: later re-selection needs a fresh delivery mark | false | reject | The approved intent explicitly reuses the existing one-shot `(intent, event, user)` mark and promises at most one delivery. |
| Blind hunter: audit scan is unbounded | low | reject | A revalidation reads one event's audit history; introducing a new query/index is disproportionate without demonstrated event-history pressure. |
| Blind hunter: latest deletion role/index is incidental | false | reject | The repository returns newest audits first; full-precision recording and `distinctBy` retain the newest deletion for an absent former assignee. |
| Blind hunter: exact timestamp ties remain possible | maybe-false | reject | The recorder now preserves the database-supported Instant precision; no reachable collision was demonstrated, while M-E3 asserts strict persisted ordering. |
| Blind hunter: exclusion boundaries lack coverage | high | patch | M-E5 now covers out-of-model deletion, and M-E3 asserts persisted unlock/deletion ordering; rollback and re-selection are already matrix cases. |
| Verification gap: audit ordering precision not pinned | high | patch | M-E3 reads persisted audit rows and asserts deletion occurs strictly after the latest unlock, so a return to second truncation fails. |

## Verification

**Commands:**
- `bash scripts/v2/story-status-sync.test.sh` -- expected: tracker controller remains compatible with historical accented keys.
- `./gradlew :services:api:test --tests '*CompositionIntegrationTest' --tests '*CompositionSlotAssignmentIntegrationTest' --tests '*CompositionNotificationTriggerMatrixIntegrationTest'` -- expected: selected CN-1/CN-3 projection, mutation, rollback, and notification matrix tests pass.
- `npm run test:unit -- --runInBand` from `apps/web` with focused Équipe spec selection -- expected: explicit deletion confirmation and organizer-only Hors modèle rendering stay covered.
- `npm run build:web` -- expected: Angular production build passes.

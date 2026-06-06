---
title: 'Composition notify on validate only'
type: 'bugfix'
created: '2026-06-06'
status: 'done'
route: 'one-shot'
baseline_commit: '115776cd33d69152e2b700ad95504b1353df5346'
recette: '2026-06-06 Troupe Démo — OK'
---

## Intent

**Problem:** Push/email confirmation notifications were sent when assigning slots or running a draw on a draft (unvalidated) composition, before the team was visible to members.

**Approach:** Gate all slot-level notification events on `validatedAt != null`; validate-time and validated gap-fill notifications unchanged; no auto roster FYI on first validate.

## Boundaries & Constraints

**Always:** Notify assignees when composition is validated (validate action or gap-fill on locked composition). Proxy availability/participation follow ADR operational rules.

**Ask First:** Whether unlock should send reconfirmation — **resolved 2026-06-06: no**; revalidate sends `RECONFIRMATION_REQUEST` to non-`CONFIRMED` assignees only.

**Never:** Notify on draft manual assign, draft draw, draft slot clear/replace, or unlock. Auto `TEAM_VALIDATED_FYI` on first validate (→ G-012 / modale Annoncer orga).

## Dispatch intent matrix (recette-validated)

| Trigger | State | Dispatch | Forbidden |
|---------|-------|----------|-----------|
| Manual assign / full draw | draft | — | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `REMOVED_FROM_COMPOSITION` |
| First validate | draft → validated | `CONFIRMATION_REQUEST` (all assignees) | `TEAM_VALIDATED_FYI` |
| Gap-fill assign / fillEmpty draw | validated | `CONFIRMATION_REQUEST` (new assignee) | — |
| Unlock | validated → organizer draft | — | Any composition workflow intent; **must not** mutate participation statuses |
| Replace / clear slot | draft post-unlock | — | `REMOVED_FROM_COMPOSITION`, `RECONFIRMATION_REQUEST` |
| Revalidate | organizer draft → validated (2nd+ validate) | `RECONFIRMATION_REQUEST` (assignees with status ≠ `confirmed` at validate time) | `CONFIRMATION_REQUEST` (if prior validate audit exists), `TEAM_VALIDATED_FYI` |
| Org proxy confirm/decline | organizer draft | — | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `PROXY_CONFIRMATION_RECORDED`¹ |
| Proxy dispo available, no roles | — | — (defer) | `PROXY_AVAILABILITY_RECORDED` |
| Proxy dispo + roles | — | `PROXY_AVAILABILITY_RECORDED` | — |
| Proxy confirm / decline | validated slot | `PROXY_CONFIRMATION_RECORDED` | — |

¹ Org proxy in **organizer draft** is silent until validate/revalidate — SCP 2026-06-06 composition-unlock-preserve-confirmations.

Participation status preservation on unlock: [`spec-composition-unlock-preserve-confirmations.md`](spec-composition-unlock-preserve-confirmations.md)

Full traceability: [composition-notification-trigger-test-design.md](investigations/composition-notification-trigger-test-design.md)

## Code Map

- `CompositionDrawService.kt` — draw notification gate (`isLocked`)
- `CompositionSlotAssignmentService.kt` — no draft assign/clear/replace notifications
- `CompositionService.kt` — unlock silent; revalidate → targeted reconfirmation; no FYI on validate
- `AvailabilityService.kt` — defer proxy dispo until roles recorded

## Tasks & Acceptance

**Execution:** all done (2026-06-06).

**Acceptance Criteria:**
- Given an unvalidated composition, when an organizer assigns a slot or runs a full draw, then no composition workflow intent is dispatched
- Given validation is triggered with assigned slots, when validate succeeds, then assignees receive `CONFIRMATION_REQUEST` and **no** `TEAM_VALIDATED_FYI`
- Given a validated composition with empty slots, when gap-fill assign or fillEmpty draw runs, then new assignees receive `CONFIRMATION_REQUEST`
- Given a validated composition, when unlock runs, then no notification is dispatched
- Given draft edits after unlock, when slot replace or clear runs, then no `REMOVED_FROM_COMPOSITION` or `RECONFIRMATION_REQUEST`
- Given revalidation after unlock, when validate succeeds, then pending assignees receive `RECONFIRMATION_REQUEST` only
- Given proxy availability without roles, when saved, then no dispatch until roles are recorded
- Given proxy confirm/decline on validated slot, when saved, then `PROXY_CONFIRMATION_RECORDED` is dispatched

## Verification

**Matrix suite (canonical):**

```bash
cd services/api && ./gradlew test --tests "com.hatcast.api.notification.CompositionNotificationTriggerMatrixIntegrationTest"
```

**Regression suites:**

```bash
./gradlew test --tests "com.hatcast.api.notification.*"
```

## Deferred product

- **G-012** — collective « équipe confirmée » when all assignees confirmed

## Resolved (SCP 2026-06-06)

- ~~**G-014** — proxy confirm in draft~~ → in scope via [`spec-composition-unlock-preserve-confirmations.md`](spec-composition-unlock-preserve-confirmations.md)

## Suggested Review Order

- Draw gate: [`CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt)
- Draft slot mutations: [`CompositionSlotAssignmentService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt)
- Validate/unlock/revalidate: [`CompositionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt)
- Matrix tests: [`CompositionNotificationTriggerMatrixIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt)

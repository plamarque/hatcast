---
title: 'DW-105 — IdP deleteUser post-commit'
type: 'refactor'
created: '2026-06-07'
status: 'done'
baseline_commit: 'd4001c05ef69fac6d2ef0d046b415608b9343fb7'
context:
  - '{project-root}/services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Account deletion (story 1.7) calls `FirebaseAuth.deleteUser` inside `@Transactional deleteAccount()`, keeping the DB transaction open during a network call and blurring failure semantics if Firebase fails after Postgres commit.

**Approach:** Publish a domain event at the end of `deleteAccount()` and handle IdP cleanup in a `@TransactionalEventListener(phase = AFTER_COMMIT)` listener, matching existing notification/composition patterns. Preserve best-effort semantics and observable API behavior.

## Boundaries & Constraints

**Always:**
- HatCast anonymization stays in the existing `@Transactional` method; no client-side `deleteUser`.
- IdP deletion remains **best-effort** (log + continue); DB anonymization must not roll back on Firebase failure.
- `google_sub` / `idp_uid` retention rules from story 1.7 AC 6 unchanged until IdP delete succeeds (then clear `idp_uid`).
- Follow existing `ApplicationEventPublisher` + `@TransactionalEventListener(AFTER_COMMIT)` pattern (e.g. `CompositionNotificationEventListener`).

**Ask First:**
- Changing sign-in block semantics when Firebase is down but DB is anonymized.
- Moving `google_sub` clearing into the listener (currently not cleared on delete).

**Never:**
- Client-side Firebase `deleteUser` on signup or delete flows.
- Synchronous blocking IdP call inside `@Transactional`.
- New user-facing API or front-end changes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Valid `idpUid`, Firebase initialized | DB commit completes; listener calls `deleteUser`; `idp_uid` cleared | N/A |
| NO_IDP | User has no `idpUid` (Google-only) | No event published; DB anonymization only | N/A |
| FIREBASE_DOWN | `deleteUser` throws | DB already committed; warn log; `idp_uid` still cleared if lookup succeeds | No rollback |
| FIREBASE_NOT_INIT | `FirebaseApp.getApps().isEmpty()` | Skip delete; warn log | No rollback |
| TX_ROLLBACK | Sole-admin guard or re-auth fails | No event; no IdP call | Existing 409/401 |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt` — publish event instead of inline Firebase call
- `services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionRequestedEvent.kt` — new event payload (`userId`, `idpUid`)
- `services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListener.kt` — AFTER_COMMIT listener; move `deleteIdentityPlatformUserBestEffort` logic here
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt` — reference pattern
- `services/api/src/test/kotlin/com/hatcast/api/auth/AccountDeletionIntegrationTest.kt` — regression suite (must stay green)
- `services/api/src/test/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListenerTest.kt` — new unit test for listener edge cases
- `_bmad-output/implementation-artifacts/deferred-work.md` — close DW-105 entry on completion

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionRequestedEvent.kt` — add event data class — decouple IdP cleanup from transaction
- [x] `services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListener.kt` — AFTER_COMMIT listener with moved Firebase logic — post-commit side effect
- [x] `services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt` — inject `ApplicationEventPublisher`; publish event when `idpUid` present; remove inline Firebase call — shorten transaction
- [x] `services/api/src/test/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListenerTest.kt` — unit tests: no-op when blank uid / Firebase absent; clears `idp_uid` on success and on delete failure — lock edge-case matrix
- [x] `services/api/src/test/kotlin/com/hatcast/api/auth/AccountDeletionIntegrationTest.kt` — run unchanged; fix only if event wiring breaks tests
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` — move DW-105 to archive section with closure note

**Acceptance Criteria:**
- Given a successful `DELETE /v1/auth/me`, when the DB transaction commits, then user data is anonymized and audit recorded before any Firebase call.
- Given a user with `idpUid`, when deletion succeeds, then `deleteUser` is invoked only after commit and `idp_uid` is eventually cleared.
- Given Firebase `deleteUser` fails, when deletion otherwise succeeded, then HatCast anonymization remains committed and a warning is logged.
- Given transaction rollback (409 sole admin), when delete is rejected, then no IdP deletion event is published.

## Spec Change Log

## Design Notes

Mirror composition notifications: `eventPublisher.publishEvent(...)` at end of transactional method; listener owns external I/O.

```kotlin
// AccountDeletionService (end of deleteAccount)
if (!idpUidForCleanup.isNullOrBlank()) {
    eventPublisher.publishEvent(
        IdentityPlatformUserDeletionRequestedEvent(user.id, idpUidForCleanup),
    )
}
```

Listener runs existing `deleteIdentityPlatformUserBestEffort` body unchanged in behavior.

## Verification

**Commands:**
- `./gradlew :services:api:test --tests "com.hatcast.api.auth.*"` — expected: all auth deletion tests pass
- `./gradlew :services:api:test` — expected: full API suite green

**Manual checks (if no CLI):**
- Confirm `deleteAccount` method body contains no `FirebaseAuth` import after refactor.

## Suggested Review Order

**Post-commit IdP cleanup**

- Transaction ends by publishing event, not calling Firebase inline.
  [`AccountDeletionService.kt:79`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt#L79)

- AFTER_COMMIT listener owns external I/O and idp_uid clearing.
  [`IdentityPlatformUserDeletionEventListener.kt:14`](../../services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListener.kt#L14)

- Firebase deleteUser best-effort extracted for testability.
  [`IdentityPlatformUserDeletionSupport.kt:14`](../../services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionSupport.kt#L14)

- Event payload decouples DB commit from IdP side effect.
  [`IdentityPlatformUserDeletionRequestedEvent.kt:5`](../../services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionRequestedEvent.kt#L5)

**Tests & tracking**

- Listener edge cases: blank uid, Firebase absent, idp_uid clear.
  [`IdentityPlatformUserDeletionEventListenerTest.kt:26`](../../services/api/src/test/kotlin/com/hatcast/api/auth/IdentityPlatformUserDeletionEventListenerTest.kt#L26)

- DW-105 closure in deferred backlog.
  [`deferred-work.md:21`](deferred-work.md#L21)

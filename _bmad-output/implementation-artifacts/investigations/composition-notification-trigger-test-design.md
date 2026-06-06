# Composition notification trigger matrix — test design

**Author:** Murat (Test Architect) · **Date:** 2026-06-06  
**Spec:** [spec-composition-notify-on-validate-only.md](../spec-composition-notify-on-validate-only.md)  
**Recette:** Troupe Démo, manuelle Patrice 2026-06-06 (OK)

## Scope

Assert **dispatch intent** at `NotificationDispatcher` boundary (`@MockBean`).  
**Out of scope:** push/email delivery, Mailpit, preference opt-out (covered elsewhere).

## Architecture under test

```
HTTP mutation → domain service → ApplicationEvent → @TransactionalEventListener
  → CompositionNotificationPort / ProxyNotificationPort → NotificationDispatcher.dispatch(context)
```

Integration tests exercise the full chain up to `NotificationDispatcher`; unit tests cover payload copy (`NotificationPayloadBuilderProxyTest`).

## Traceability matrix

| ID | Recette bloc | Trigger | Composition state | Expected dispatch | Forbidden dispatch |
|----|--------------|---------|-------------------|-------------------|------------------|
| M-D1 | A1 | PUT slot assign | draft | — | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `REMOVED_FROM_COMPOSITION`, `TEAM_VALIDATED_FYI` |
| M-D2 | A2 | POST draw full | draft | — | `CONFIRMATION_REQUEST` |
| M-V1 | B | POST validate (1st) | draft → validated | `CONFIRMATION_REQUEST` (all assignees) | `TEAM_VALIDATED_FYI` |
| M-G1 | C | PUT slot gap-fill | validated, empty slot | `CONFIRMATION_REQUEST` (new assignee) | — |
| M-G2 | C | POST draw fillEmpty | validated | `CONFIRMATION_REQUEST` (new assignee) | — |
| M-U1 | D | POST unlock | validated → draft | — | `RECONFIRMATION_REQUEST`, `TEAM_VALIDATED_FYI` |
| M-E1 | E | PUT replace slot | draft post-unlock | — | `RECONFIRMATION_REQUEST`, `REMOVED_FROM_COMPOSITION` |
| M-E2 | E | PUT clear slot | draft post-unlock | — | `REMOVED_FROM_COMPOSITION` |
| M-R1 | F | POST validate (2nd) | revalidation | `RECONFIRMATION_REQUEST` (pending assignees) | `CONFIRMATION_REQUEST`, `TEAM_VALIDATED_FYI` |
| M-P1 | A2 | PUT proxy dispo available, no roles | — | — (deferred) | `PROXY_AVAILABILITY_RECORDED` |
| M-P2 | A2 | PUT proxy dispo + roles | — | `PROXY_AVAILABILITY_RECORDED` ×1 | — |
| M-P3 | D2 | POST proxy confirm | validated | `PROXY_CONFIRMATION_RECORDED` | — |
| M-P4 | D2 | POST proxy decline | validated | `PROXY_CONFIRMATION_RECORDED` | — |

## Implementation

| Artifact | Role |
|----------|------|
| `CompositionNotificationTriggerMatrixIntegrationTest.kt` | Single matrix suite (`@Tag("notification-trigger-matrix")`) |
| Existing per-story tests | Kept for regression; matrix is canonical map |

## Run

```bash
cd services/api && ./gradlew test --tests "com.hatcast.api.notification.CompositionNotificationTriggerMatrixIntegrationTest"
```

## Deferred product (no auto-dispatch today)

- **G-012** — `TEAM_VALIDATED_FYI` or successor when équipe **confirmée** (complete)
- **G-014** — proxy confirm in draft (no dispatch until validate)

## Spec amendments

- Story **8-5** AC1: auto FYI on validate **withdrawn** → G-012 / modale Annoncer
- **PRD FR31** post-MEP FYI: still valid as **opt-in future**, not wired to validate

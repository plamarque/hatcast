---
title: 'Cover availability reminders for a non-admin organizer'
type: 'feature'
created: '2026-09-18'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'b50cb15affaf41f2cf040ac720437c3fa0efc612'
context:
  - 'apps/web/e2e/README.md'
  - 'docs/v2/technical/DEPLOYMENT_WORKFLOW.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The availability-reminder E2E journey is authenticated only as the staging administrator. It does not prove that a dedicated, non-admin organizer can open and send the same reminder.

**Approach:** Introduce an isolated organizer E2E persona for local and staging runs, and cover the organizer's complete reminder journey through the existing E1 gate.

## Boundaries & Constraints

**Always:** Authenticate the new persona separately from the administrator; assert it is an organizer without troupe or platform administrator privileges; keep the existing administrator and member journeys intact; run the scenario in both local E2E and the staging gate.

**Ask First:** Creating or configuring the Identity Platform account and GitHub staging secrets/variables is an operator action; report the exact required configuration rather than creating credentials or changing staging roles.

**Never:** Grant the organizer persona administrator privileges; mutate a pre-existing staging member's role during a test; send a real notification to end users; weaken or exclude existing E1 projects.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Non-admin organizer reminder | Dedicated active organizer is assigned to the discovered E1 season and an event has unanswered participants | The organizer opens `Relance dispos`, previews recipients, reaches the confirmation dialog, and cannot submit an empty audience | Missing organizer credentials or assignment fails setup with a clear configuration error before the journey starts |
| Role separation | Dedicated persona is authenticated | The test proves the account has organizer access while not being a troupe or platform administrator | Fail the test if the role assertions do not hold |

</frozen-after-approval>

## Code Map

- `apps/web/playwright.config.ts:25-63` -- add a dedicated organizer setup/storage state and a project that selects only the new organizer reminder spec; retain admin and member routing.
- `apps/web/e2e/auth.setup.ts:16-37` and `apps/web/e2e/auth-member.setup.ts:18-55` -- patterns for local token auth, staging email/password auth, and persisted Playwright state.
- `apps/web/e2e/helpers/staging-member-bootstrap.ts:35-181` -- staging configuration validation and authenticated account bootstrap pattern; extend only for the dedicated organizer persona, without changing another account's privileges.
- `apps/web/e2e/fixtures/e1-cutover.constants.ts:1-4` and `services/api/src/main/kotlin/com/hatcast/api/auth/E2eGoogleIdTokenService.kt:15-43` -- local E2E identity tokens and test-profile identities.
- `apps/web/e2e/helpers/e2e-api.ts:7-27, 180-205` -- E1 fixture identifiers and authenticated event/organizer API helpers.
- `apps/web/e2e/e1/orga-availability-reminder.desktop.spec.ts:11-28` -- existing preview and empty-audience reminder journey to reuse under the organizer persona.
- `apps/web/src/app/pages/event-detail/event-detail.ts:267-280, 474-490` -- UI visibility and dialog entry depend on composition-management access.
- `services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt:176-183` and `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt:332-355` -- preview/send require the same organizer composition permission; event and season organizers are supported.
- `.github/workflows/e1-preprod-gate.yml:22-97`, `apps/web/e2e/README.md:152-160, 231-242`, and `docs/v2/technical/DEPLOYMENT_WORKFLOW.md:199-220` -- staging gate environment, project documentation, and operator-owned secret/variable contract.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/e2e` auth, fixture, and Playwright configuration -- add an isolated local/staging organizer persona and project, with explicit non-admin role checks.
- [x] `apps/web/e2e/e1` -- add or route a desktop organizer reminder E2E that reuses the existing preview/confirmation flow while proving the session is the non-admin organizer.
- [x] `.github/workflows/e1-preprod-gate.yml` -- pass the organizer credentials/identity configuration and execute its project in the blocking E1 gate.
- [x] `apps/web/e2e/README.md` and `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` -- document the required dedicated staging account, its non-admin organizer assignment, and its GitHub environment secret/variable names.

**Acceptance Criteria:**
- Given the local E2E fixture, when the dedicated organizer runs the reminder journey, then the preview, recipient confirmation, and disabled empty-audience state are visible without administrator privileges.
- Given staging configuration is complete, when the E1 preprod gate runs, then it executes the dedicated organizer reminder project alongside the existing member, mobile organizer, and desktop administrator projects.
- Given staging configuration is missing or the persona is improperly privileged, when setup starts, then the run fails with a precise configuration/role message before testing the reminder UI.

## Spec Change Log

## Design Notes

Use a season organizer for the dedicated staging persona: the dynamic E1 event discovery stays valid without mutating live roles, while the backend's shared `canManageComposition` guard proves the intended non-admin permission boundary. The local fixture must mirror that scope.

## Verification

**Commands:**
- `npm run test:e2e -- --list --project=e1-desktop-reminder-organizer` -- expected: only the dedicated organizer reminder scenario and its setup are selected.
- `CI=1 PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e -- e2e/e1/reminder-organizer.desktop.spec.ts --project=e1-desktop-reminder-organizer` -- expected: the local non-admin organizer journey passes.
- `CI=1 PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e -- e2e/e1/orga-availability-reminder.desktop.spec.ts --project=e1-desktop-orga` -- expected: the administrator regression journey still passes.
- `bash -n scripts/run_e2e.sh` and `git diff --check` -- expected: no shell syntax or whitespace errors.

## Suggested Review Order

**Persona boundary**

- Authenticate a separate persona and reject both troupe and platform administrators.
  [`auth-reminder-organizer.setup.ts:25`](../../apps/web/e2e/auth-reminder-organizer.setup.ts#L25)

- Seed the local equivalent as a season organizer without changing production roles.
  [`E1CutoverFixtureService.kt:149`](../../services/api/src/main/kotlin/com/hatcast/api/e2e/E1CutoverFixtureService.kt#L149)

**Gate execution**

- Register the isolated storage state and avoid executing it as the administrator.
  [`playwright.config.ts:37`](../../apps/web/playwright.config.ts#L37)

- Make the staging gate require credentials and execute the new project.
  [`e1-preprod-gate.yml:31`](../../.github/workflows/e1-preprod-gate.yml#L31)

- Keep the local E1 gate aligned with the staging project selection.
  [`run_e2e.sh:77`](../../scripts/run_e2e.sh#L77)

**Journey evidence**

- Prove the non-admin role before reaching the existing reminder confirmation journey.
  [`reminder-organizer.desktop.spec.ts:14`](../../apps/web/e2e/e1/reminder-organizer.desktop.spec.ts#L14)

- Document the operator-owned staging account and secret setup.
  [`DEPLOYMENT_WORKFLOW.md:211`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md#L211)

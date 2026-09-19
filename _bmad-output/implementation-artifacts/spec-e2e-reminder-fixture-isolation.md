---
title: 'Isolate availability reminder E2E fixtures'
type: 'bugfix'
created: '2026-09-19'
status: 'done'
review_loop_iteration: 0
baseline_commit: '49f2371de1a23888eb9e77a63402f696563aafed'
context:
  - '{project-root}/apps/web/e2e/README.md'
  - '{project-root}/docs/v2/technical/DEPLOYMENT_WORKFLOW.md'
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The E1 staging gate shares dynamically discovered Malice events among member, draw, activity, administrator reminder, and non-admin organizer journeys. Those events are mutable and discovery requires the signed-in user to be a participant, which contradicts the dedicated organizer persona. This makes the reminder menu disappear or the organizer setup fail.

**Approach:** Create an isolated, idempotent staging reminder fixture and a dedicated reminder context. Test administrators and a non-admin season organizer against that immutable anchor, while preserving member, draw, and activity fixtures for their own journeys.

## Boundaries & Constraints

**Always:** Keep production untouched; create only scoped staging E2E data; prove the organizer is an active troupe member and season organizer but neither platform/troupe administrator nor season participant; retain all existing E1 projects; fail fast on a malformed reminder fixture; never dispatch a real reminder from Playwright.

**Ask First:** Any use of a real non-E2E troupe, season, member, or notification provider.

**Never:** Select an arbitrary migrated event as a reminder fallback; share a reminder event with tests that change availability/composition; weaken permission assertions or skip a failing E1 project.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Stable reminder fixture | Gate bootstrap runs twice | One dedicated staging event is open, published, future, and has an unanswered notifiable E2E recipient | Idempotent reset restores unknown availability |
| Non-participant organizer | Active troupe member is season organizer only | Can preview reminder on dedicated event without appearing in season participants | Setup fails with role/fixture invariant message |
| Invalid fixture | Missing, archived, closed, or no-unknown reminder event | Discovery refuses to start the UI journey | Clear contract failure; no arbitrary fallback |
| Concurrent E1 suites | Member/draw/activity tests mutate their own anchors | Reminder admin/mobile/organizer tests remain deterministic | Distinct fixture names/slugs prevent aliasing |

</frozen-after-approval>

## Code Map

- `apps/web/e2e/helpers/staging-event-discovery.ts` -- actor-dependent event discovery; split member and reminder contexts, validate exact pinned reminder state.
- `apps/web/e2e/helpers/e1-staging.ts` and `e2e-api.ts` -- current single cached `E1CutoverFixture`; introduce separate reminder context/cache without changing member behavior.
- `apps/web/e2e/e1/orga-availability-reminder.{desktop,mobile}.spec.ts` and `reminder-organizer.desktop.spec.ts` -- three read-only reminder journeys must consume the dedicated anchor.
- `apps/web/e2e/auth-reminder-organizer.setup.ts` -- retain role separation and add the explicit non-participant invariant.
- `apps/web/playwright.config.ts`, `scripts/run_e2e.sh`, `.github/workflows/e1-preprod-gate.yml` -- preserve all four E1 projects; bootstrap and pass the staging reminder fixture contract before Playwright.
- `scripts/v2/e1-staging-migration-assert.mjs` -- existing scoped Neon connection/probe pattern to reuse for the staging-only idempotent bootstrap.
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E1CutoverFixtureService.kt` -- local isolated reminder event/persona counterpart; do not alter shared draw/activity seed behavior.
- `services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt` -- current admin success/member denial coverage; add non-admin season-organizer preview and selected-notify authorization.
- `apps/web/src/app/pages/event-detail/event-detail.ts` -- visibility contract: composition authority, open availability, and at least one unknown participant; product behavior is read-only evidence.
- `apps/web/e2e/README.md` and `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` -- correct staging persona contract from season participant to non-participant season organizer.

## Tasks & Acceptance

**Execution:**
- [x] Staging bootstrap + workflow -- create/reset a reserved E2E reminder event, recipient, and organizer idempotently through the scoped staging database connection; export/pass its exact slug and require it before Playwright.
- [x] Playwright contexts and reminder specs -- split member-specific discovery from actor-independent reminder discovery; make all three reminder journeys use the dedicated anchor and verify non-empty preview without sending.
- [x] Local fixture parity -- supply a separate local reminder event and non-participant organizer persona, preserving draw/activity/member fixture semantics.
- [x] Fast regression tests -- cover pinned reminder discovery validity, non-participant organizer resolution, alias prevention, and local gate project selection.
- [x] API authorization -- prove a season organizer with no administrator role can preview and notify selected unknown recipients, while an ordinary member remains forbidden.
- [x] Documentation -- document the revised staging fixture/persona contract and required variable names.

**Acceptance Criteria:**
- Given the staging gate starts, when its fixture bootstrap completes, then the three reminder projects target one dedicated open event with at least one unknown recipient and no other E1 scenario mutates it.
- Given the non-admin organizer account, when it loads that event, then it proves active troupe membership, season-organizer access, no platform/troupe admin, no participant link, and sees the reminder preview.
- Given the fixture contract is absent or invalid, when discovery runs, then it fails before navigation with an actionable error rather than choosing live Malice data.
- Given a local E1 gate, when it is run after this change, then it includes member, mobile-admin, desktop-admin, and organizer reminder projects and validates the same role boundary without waiting for staging.

## Spec Change Log

## Design Notes

The dedicated reminder event is read-only to Playwright: each UI scenario opens the preview, proves the initial notifiable audience, then deselects it to prove the disabled confirmation state. Its E2E-member recipient is used only on this event and its availability is reset before every staging gate. The database bootstrap is staging-only because `@Profile("e2e")` fixture endpoints are intentionally unavailable on Cloud Run.

## Verification

**Commands:**
- `npm run test:e2e -w @hatcast/web -- --list --project=e1-mobile-member --project=e1-mobile-orga --project=e1-desktop-orga --project=e1-desktop-reminder-organizer` -- expected: all four projects and setups are selected.
- `./scripts/run_e2e.sh --gate` -- expected: local E1 fixture and all four projects pass without staging.
- `./gradlew test --tests '*ManualAvailabilityNudgeIntegrationTest'` from `services/api` -- expected: administrator, non-admin organizer, and ordinary member authorization cases pass.
- `git diff --check` -- expected: no whitespace errors.

**Completed:**
- `node --test scripts/v2/e1-staging-reminder-fixture.test.mjs` — 2 passing contract cases, including organizer boundary, alias, malformed, and no-unknown rejection.
- `npm run test:migrate` — 120 passing tests, including the fixture-contract test.
- `./gradlew cleanTest test --tests '*ManualAvailabilityNudgeIntegrationTest'` from `services/api` — successful, including the non-admin organizer selected-notify case and normal-member denial.
- `./scripts/run_e2e.sh --gate` — passed locally: all four E1 projects, 36 tests.
- `npm run test:e2e -w @hatcast/web -- --list --project=e1-mobile-member --project=e1-mobile-orga --project=e1-desktop-orga --project=e1-desktop-reminder-organizer` — 36 tests selected.
- `git diff --check` — passed.

## Suggested Review Order

**Staging safety and deterministic data**

- Guards the scoped writer, resets state, and proves the complete fixture contract.
  [`e1-staging-reminder-fixture.mjs:54`](../../scripts/v2/e1-staging-reminder-fixture.mjs#L54)

- Runs the fixture only after the Malice probe confirms staging is ready.
  [`e1-preprod-gate.yml:89`](../../.github/workflows/e1-preprod-gate.yml#L89)

**Independent reminder resolution**

- Pins reminder discovery to its exact identity and validates a notifiable audience.
  [`staging-event-discovery.ts:317`](../../apps/web/e2e/helpers/staging-event-discovery.ts#L317)

- Mirrors the isolation locally and removes stale answers, exclusions, and delivery traces.
  [`E1CutoverFixtureService.kt:193`](../../services/api/src/main/kotlin/com/hatcast/api/e2e/E1CutoverFixtureService.kt#L193)

**Organizer authorization and user journey**

- Proves a non-admin, non-participant season organizer can notify a selected recipient.
  [`ManualAvailabilityNudgeIntegrationTest.kt:381`](../../services/api/src/test/kotlin/com/hatcast/api/share/ManualAvailabilityNudgeIntegrationTest.kt#L381)

- Asserts the organizer persona and a genuinely enabled initial reminder audience.
  [`reminder-organizer.desktop.spec.ts:15`](../../apps/web/e2e/e1/reminder-organizer.desktop.spec.ts#L15)

**Supporting contracts**

- Keeps the staging fixture guard and malformed-state tests fast and executable.
  [`e1-staging-reminder-fixture.test.mjs:1`](../../scripts/v2/e1-staging-reminder-fixture.test.mjs#L1)

- Records the exact staging fixture and organizer setup contract for operators.
  [`DEPLOYMENT_WORKFLOW.md:198`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md#L198)

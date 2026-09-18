---
title: 'Run the mobile availability reminder E2E as an organizer only'
type: 'bugfix'
created: '2026-09-18'
status: 'done'
review_loop_iteration: 0
baseline_commit: 8dafbd179a643cf8bb2aa2d06f80f637b1204c55
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The staging promotion gate fails E1-ORG-031 before opening the
availability reminder dialog. The organizer-only mobile scenario is selected by
both the member-mobile and organizer-mobile Playwright projects. Its member run
cannot render the event administration menu, so the test reports a missing gear
instead of exercising the reminder journey.

**Approach:** Assign the organizer reminder file to its dedicated organizer
project only. Preserve every other mobile member scenario and retain the
existing reminder UI, API behavior, fixture reset, and accessibility contract.

## Boundaries & Constraints

**Always:** Keep the mobile reminder scenario authenticated as the E2E admin;
keep Pixel 5 coverage; preserve the three-action one-line assertion at mobile
width; use the existing Playwright project and storage-state setup; run the
targeted list and organizer journey after the change.

**Ask First:** Expanding this work to alter reminder eligibility, event admin
permissions, dialog layout, fixtures, or other E2E project ownership.

**Never:** Bypass the staging E2E gate, weaken the missing-admin-menu check,
run the organizer action as a member, or change production code merely to make
an incorrectly authenticated test pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Organizer reminder | `orga-availability-reminder.mobile.spec.ts` selected | Only `e1-mobile-orga` executes E1-ORG-031 with `admin.json` | A failing organizer run remains a real gate failure |
| Other mobile E1 coverage | Any non-reminder `e1/*.mobile.spec.ts` file | `e1-mobile-member` still selects and runs it with `member.json` | No broad match is removed |
| Member access | Reminder file considered by the member project | It is ignored before execution | No admin-menu assertion runs in a member session |

</frozen-after-approval>

## Code Map

- `apps/web/playwright.config.ts` -- `e1-mobile-member` currently matches all
  mobile E1 files; `e1-mobile-orga` separately selects the reminder file. Add
  an exact ignore to the former so ownership is disjoint while all other member
  matches remain unchanged.
- `scripts/run_e2e.sh` and `.github/workflows/e1-preprod-gate.yml` -- normal E1
  gate selectors must run the dedicated organizer-mobile project after the
  member project stops owning its scenario.
- `apps/web/e2e/e1/orga-availability-reminder.mobile.spec.ts` -- organizer
  scenario: opens Infos, the event admin menu, then `Relance dispos` and checks
  the three dialog actions share a row. It is correct and remains unchanged.
- `apps/web/e2e/helpers/e1.ui.ts` -- `openEventAdminMenu()` expects
  `.scope-admin-menu__trigger`; this is valid only with organizer permissions.
- `apps/web/e2e/.auth/member.json` and `apps/web/e2e/.auth/admin.json` --
  existing project storage states that make the project distinction material.
- `apps/web/src/app/pages/event-detail/event-detail.ts` -- supplies the
  `Relance dispos` menu item when authorization and unknown availability permit;
  read-only evidence, not part of this fix.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/playwright.config.ts` -- exclude exactly
  `orga-availability-reminder.mobile.spec.ts` from `e1-mobile-member` while
  preserving its broad coverage of other mobile E1 files; the dedicated
  `e1-mobile-orga` project remains the only runner for that file.
- [x] `apps/web/playwright.config.ts` -- keep the existing Pixel 5 device and
  `admin.json` storage state for the organizer project; do not alter test,
  helper, application, API, or fixture behavior.
- [x] `scripts/run_e2e.sh` and `.github/workflows/e1-preprod-gate.yml` -- add
  `e1-mobile-orga` to the local and CI E1 gates so the organizer-only scenario
  remains a blocking staging check.

**Acceptance Criteria:**

- Given E1-ORG-031 is listed across the member and organizer mobile projects,
  when Playwright resolves project ownership, then it appears exactly once under
  `e1-mobile-orga` and never under `e1-mobile-member`.
- Given the organizer mobile project runs the reminder scenario, when the event
  Infos tab opens, then the admin menu and `Relance dispos` action are available
  and the existing three-actions-on-one-row assertion can execute.
- Given any other mobile E1 test file, when the member project is listed, then
  its existing member-run selection remains available.

## Spec Change Log

- [Review][Patch] Add the dedicated organizer-mobile project to both E1 gate
  entry points; without it, excluding the test from the member project would
  silently remove the reminder journey from the staging promotion gate.

## Design Notes

The project selector is the authentication boundary for this test suite. An
exact ignore is safer than replacing the member glob with a negative lookahead:
it documents the intentional exception and cannot inadvertently stop unrelated
future member mobile files from running.

## Verification

**Commands:**

- `cd apps/web && npx playwright test --list --project=e1-mobile-member --project=e1-mobile-orga --grep 'E1-ORG-031'` -- expected: one listed test, under `e1-mobile-orga` only.
- `cd apps/web && npx playwright test e2e/e1/orga-availability-reminder.mobile.spec.ts --project=e1-mobile-orga` -- expected: E1-ORG-031 passes with the admin session.
- `git diff --check` -- expected: no whitespace errors.

## Suggested Review Order

**Gate ownership**

- Keep the organizer reminder under its dedicated authenticated project.
  [`playwright.config.ts:39`](../../apps/web/playwright.config.ts#L39)

- Include the dedicated project in the local staging gate preset.
  [`run_e2e.sh:80`](../../scripts/run_e2e.sh#L80)

- Mirror the organizer-mobile project in the preproduction CI gate.
  [`e1-preprod-gate.yml:96`](../../.github/workflows/e1-preprod-gate.yml#L96)

**Deferred release blocker**

- Preserve the independent draw-chance failure for a focused follow-up.
  [`deferred-work.md:42`](deferred-work.md#L42)

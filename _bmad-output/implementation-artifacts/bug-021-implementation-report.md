# BUG-021 — Implementation and verification

Worktree: `hatcast-bug-021-availability-consistency`  
Branch: `feat/bug-021-availability-consistency`  
Baseline: `aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c`

## Changes

- `AvailabilityForm`: draft-only status, Material role checkboxes, no preferred-role precheck, one submit carrying status/roles/comment. Local role requirement and comment validation; API/network error retains draft. Existing volunteer rule remains.
- `AvailabilityDialog`: persistent footer submit, Annuler without result, server response returned only on success. Dismiss, Escape and backdrop disabled while writing; heading supports initial focus.
- `AgendaEventCard` / `AgendaEventActionsService`: shared presentation and actions for Home and My agenda; metadata and participation workflow retained, body navigation separate from badge action, each parent reloads only after saved changes. Failed event/availability reads cannot open a fabricated roleless editor. Archived events rejected before editor.
- API shared write validation rejects normalized empty roles for available responses with offered roles, self and proxy. General availability remains valid for roleless events; historical reads/draw semantics and storage are unchanged.
- Poll retains valid-vote autosave, including final unchecked role becoming unknown. Comment changes to a legacy general response now explain that a role must first be chosen; generic 400 no longer falsely claims comment length.
- DOMAIN, SPEC, UI guidance, OpenAPI and BUG-021 issue updated. Season agenda handles newly surfaced availability-load errors.

## Matrix evidence

| Scenario | Evidence |
|---|---|
| Single/multiple explicit roles, one save | Form unit test verifies one payload; mobile light/dark E2E saves DJ + MC and comment, reopens with persisted checks |
| Available with no role | Form unit test shows error and no write; controller test covers absent, empty and whitespace roles on self/proxy before insert and before update, preserving stored roles/comment |
| Cancel | Dialog unit test and light/dark E2E edit status, roles and comment, cancel, assert no PUT and reopen unchanged |
| No role slots | Form unit test plus controller self/proxy roleless-event test |
| Unavailable/unknown | Form parameterized tests; controller existing three-state and clearing tests; poll final-role test |
| Legacy general response | Form unit test leaves unchecked and rejects next available submit; controller summary test seeds legacy empty row directly and verifies general candidate eligibility; poll comment guard retains draft |
| Home and agenda entry points | Same shared card and service; card tests distinguish badge/body, both page tests verify refresh only after save; E2E uses the same real event from both locations and checks navigation |
| Failed read/write | Service unit tests reject event and availability read failures; dialog/form unit tests retain failed draft; E2E aborts PUT then GET and checks error/draft/no fabricated editor |
| Team participation | Existing E2E confirmation, decline, season agenda and static-history cases pass; shared eligibility tests retain active-member and withdrawn restrictions |
| M3 / mobile | Light/dark Pixel 5 E2E, checkbox keyboard Space and accessible checked state, footer in viewport after content scroll, submit >=48 px, screenshots inspected |

The E2E Home comparison replaces only inbox `nextEvent` with the same real API event, so unrelated seed event ordering cannot change the test subject. Availability persistence, loading and UI interactions use the isolated real API.

## Commands and results

- `npm ci --ignore-scripts`: dependencies installed from lockfile. Runtime preparation subsequently ran the repository's `npm ci` and cached Chromium install check; existing browser directories remained dated before this task. No new browser directory observed.
- `npm run build -w @hatcast/web`: PASS, including final build; existing Sass import deprecations and unrelated account/troupe style-budget warnings remain.
- `NODE_OPTIONS=--no-experimental-webstorage npm run test -w @hatcast/web -- --watch=false --include='**/availability-form.spec.ts' --include='**/availability-dialog.spec.ts' --include='**/availability-poll.spec.ts' --include='**/agenda-event-*.spec.ts' --include='**/user-agenda.spec.ts' --include='**/member-home-todo.spec.ts' --include='**/event-dispos-tab.spec.ts'`: 111 passed, one baseline failure below. Node v26.8.2 needs this option for jsdom localStorage; initial run without it failed page setup.
- From `services/api`: `./gradlew test --tests '*AvailabilityControllerIntegrationTest'`: PASS, 29 tests, zero failures/skips, isolated `test` profile with H2 in memory. XML: `services/api/build/test-results/test/TEST-com.hatcast.api.availability.AvailabilityControllerIntegrationTest.xml`.
- `HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 bash scripts/v2/story-e2e-evidence.sh --target agenda-participation --rationale 'BUG-021 review patches including dismissal and touch targets' --project chromium-agenda-participation --spec apps/web/e2e/recette-agenda-participation-cell.spec.ts --attestation _bmad-output/implementation-artifacts/e2e-evidence/bug-021.json`: 12/12 passed on the final run (44.9 seconds), including completed checkmark animation before captures. Persisted attestation and HTML report are authoritative for the last run. Initial attempts exposed test-selector/teardown issues, corrected without disabling tests.
- `git diff --check`: PASS.

## Baseline failure evidence

`user-agenda.spec.ts` test “redirige vers connexion avec snackbar si la session est invalide” expects no agenda request. Both the original assertion and the unchanged bootstrap are present at baseline:

```ts
// HEAD user-agenda.ts, ngOnInit
const [session] = await Promise.all([
  this.auth.ensureHatcastSession(),
  this.loadAgenda(),
  this.loadViewerGender(),
])
if (!session.ok) {
  await this.redirectToLogin()
  return
}
// HEAD user-agenda.spec.ts
expect(agendaApi.listAgenda).not.toHaveBeenCalled()
```

Direct comparison via `git show HEAD:...` and current diff confirms neither block changed. The behavior/expectation conflict remains recorded under LIMIT-007; no test disabled or weakened. Decide this bootstrap contract separately.

## Remaining gates and operational scope

Workflow review and human smoke remain to be performed by the parent workflow/operator. No deployment, push, integration, commit, migration, sprint-status edit or unrelated process shutdown. Integration worktree `v2` checked clean. E2E uses dedicated fresh servers with reuse disabled and no implicit browser install in the runner; post-run runtime inspection confirms ports 8080/4200 free and READINESS=ready.

M3 checklist: Material checkboxes/buttons/dialogs; theme tokens preserved; French labels and explicit saved/draft distinction; keyboard and mobile footer verified. Global navigation redesign, account role preferences and composition assignment changes are out of scope. The reported CCAS assignment cause remains unproven.


Visual evidence inspected:
- `apps/web/test-results/recette-agenda-participati-d0bce-reopen-from-Home-and-agenda-chromium-agenda-participation/availability-light.png`
- `apps/web/test-results/recette-agenda-participati-77c4d-reopen-from-Home-and-agenda-chromium-agenda-participation/availability-dark.png`

Both show explicit checked DJ/MC and unchecked player, readable labels, scrollable content and the visible Enregistrer footer. Partial status toggle at the top is the intentional scrolled viewport position, not horizontal clipping.

## Review patches and final verification

All nine requested patch findings addressed without changing business intent:

1. Persisted player without volunteer initializes the volunteer opt-out; server reconciliation preserves its meaning. Regression covers reopen/save and later role changes.
2. Unknown-to-unknown save does not emit first-response analytics; unknown-to-unavailable does. Regression verifies both.
3. Event and season fixtures now submit valid player roles. Notification matrix rejects empty response with no notification, then notifies exactly once for a complete response. Historical unfulfilled-role fixture seeds its legacy row directly, preserving the historical-read assertion.
4. Browser test holds PUT open, attempts Annuler/Escape/backdrop and verifies dialog remains open; releasing PUT closes and reopens the persisted response. Separate Escape/backdrop-before-save test verifies no PUT and unchanged saved state.
5. Dirty message appears in the fixed footer; browser assertion and inspected screenshot confirm visibility.
6. Temporary available/unavailable/available changes preserve selected roles; only nonavailable writes clear payload roles. Unit regression covers both behaviors.
7. Fresh focus showing team membership returns an explicit refresh result plus feedback; parent updates its card. Service and agenda failure-refresh tests cover this race.
8. Agenda applies the saved response before reload, retaining rows and saved state if reload fails. Unit regression verifies this without changing initial/filter loading errors.
9. Browser measures actual checkbox touch targets, role labels, status buttons and Annuler: each width/height >=48px; the existing submit check remains.

Final API command from services/api:
`./gradlew test --tests '*AvailabilityControllerIntegrationTest' --tests '*EventControllerIntegrationTest' --tests '*SeasonDeleteIntegrationTest' --tests '*CompositionNotificationTriggerMatrixIntegrationTest' --tests '*UnfulfilledRoleRequestServiceTest'`

Result: **75/75 passed** (29 availability, 18 events, 5 season deletion, 16 notification matrix, 7 unfulfilled roles), zero failures. Initial patch run identified the legacy helper still using the newly rejected endpoint; final run passes after direct historical seeding.

Final full targeted Angular command above: **111/112**, only the unchanged LIMIT-007 bootstrap assertion fails. No tests skipped or disabled. Final build passes with existing warnings. Final Playwright: **12/12**, attestation parsed as passed with the expected project/spec. Updated light/dark capture retains readable labels, visible dirty hint and footer. Runtime inspect after E2E: both ports free and READINESS=ready. Parent review artifact was not modified.

## Final integration verification — 2026-09-17

After the accepted compact round-selector change, all 12 targeted Playwright tests passed (52.7 seconds). Canonical evidence: `e2e-evidence/bug-021-availability-consistency.json`. Delivery re-verification passed with valid evidence and owned smoke state stopped. The user approved the visual result and subsequently authorized integration and publication. Earlier pending-E2E notes above are superseded by this final run. No application code changed after the run.

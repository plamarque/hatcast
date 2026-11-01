---
title: 'Preserve the Advent surprise and preview production content'
type: 'feature'
created: '2026-11-01'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 2
baseline_commit: 'bf1359c82aeaffc439a302a795f21e8308dca9f4'
context:
  - '_bmad-output/planning-artifacts/sprint-change-proposal-2026-11-01-avent-surprise.md'
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Early deployment risks revealing Advent in ordinary navigation, including failures; the organizers also need to check actual production content before opening.

**Approach:** Keep ordinary entry silent until 1 December 2026 at 00:00 Europe/Paris, while a separate, server-authorized direct-URL preview lets Patrice and Toinou inspect and answer future quizzes safely. Protect this contract through mandatory regression checks.

## Boundaries & Constraints

**Always:** Authenticate and verify active troupe membership and both privileged identities server-side; URL knowledge alone grants nothing. Preview uses actual production content and personal, persistent final answers, with immediate personal result and explanation. Preserve other members' future-content and result secrecy, rankings and state. Exclude both accounts from ranking; allow their production answers in future participation totals, excluding isolated development data. Never send anecdotes, choices, correctness or unrevealed scores to analytics. Enforce privacy on portraits, APIs, logs and caches. Maintain Material accessibility, Advent visual isolation and normal member behavior after opening.

**Never:** Treat preview as isolated test mode, change the shared clock, expose simulation, reset or replay in production, delete answers, deploy, alter production data, or publish secret content in release notes. No production operation is authorized by this spec.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Before opening | Ordinary desktop/mobile navigation, including refresh, re-login, 404, 5xx, timeout or network failure | No gift, welcome, Advent-specific error or other ordinary-navigation cue. |
| Opening | Server time crosses Paris midnight; eligible member and quiz | Gift appears and eligible welcome opens; ordinary future content remains restricted. |
| Authorized preview | Either verified active privileged user opens direct URL and selects a future gift | Actual authorized portrait and quiz appear; a final answer immediately yields that user's result and explanation and remains recoverable across sessions. |
| Unauthorized access | Third, inactive or unauthenticated user; forged mode/date headers; direct API and portrait requests | Future content and private results remain inaccessible; possession of URL or headers changes nothing. |
| Isolation | Both privileged users answer future gifts, including out of order | No shared clock or other member state changes; ordinary scores and ranks remain unchanged; no other user can retrieve their results. |
| Production controls | Any user requests simulated date, reset or replay; production has an offset configured | Controls are denied and production uses actual server time. |
| Cache and session | Account changes, service worker, retries or failures | No private cross-account or stale future content is exposed. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — active membership and isolated `canControl`; add a separate fail-closed preview authorization, leaving `/entry` ordinary and controls isolated.
- `AdventMemberGame.kt`, `AdventMemberClock.kt`, `AdventTestAnswers.kt` and `AdventNoStoreFilter.kt` in the same directory — date gate, calendar, quiz, reservation, confirmation, result, ranking and no-store; preserve locked server-time sampling and user isolation. Portrait data is attached only after authorized reads.
- `apps/web/src/app/layout/member-shell/` — entry 2xx, auto-open and currently revealing error; protect all ordinary failure paths without trusting browser time.
- `apps/web/src/app/pages/advent-test/` — session, calendar, selection and result; distinguish server-authorized preview from test mode and preserve identity/projection guards. `apps/web/ngsw-config.json` controls caching.
- `services/api/src/test/kotlin/com/hatcast/api/advent/`, `apps/web/src/app/layout/member-shell/member-shell.spec.ts`, `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` — extend existing fixtures; exercise real authorization separately from mocked browser UI.
- `.github/workflows/api-test.yml`, `apps-web.yml`, `e2e-smoke.yml`, `deploy-v2-cloud-run.yml` — targeted checks are not presently guaranteed on all delivery paths; production deployment skips staging smoke.
- The real-API smoke needs a server clock fixed in a strictly isolated fixture: never depend on the calendar date when CI runs; exercise before and after opening. The normal shell must silently refresh after a transient failure and across the access boundary without trusting browser time to authorize entry.
- Fail the deploy gate when required Advent troupe/exclusion configuration is missing or malformed; disclose preview scores as provisional when future answers can still change a streak bonus.
- The prior implementation and tests were preserved for reference in `/private/tmp/hatcast-avent-surprise-final-review.diff` before the review loopback; re-derive the implementation with the review corrections and preserve the listed KEEP constraints.
- The second review snapshot is `/private/tmp/hatcast-avent-surprise-review-loop-1.diff`. Periodic checks must not reopen a voluntarily exited welcome; exercise the actual same-page opening transition. Validate only UUID encodings accepted by Java. Add HTTP authorization tests for preview history and PostgreSQL preview mutation tests.

## Tasks & Acceptance

**Execution:**
- [ ] `AdventMemberController.kt`, `AdventMemberGame.kt` and related API files — enforce distinct preview capability, future reads and final personal answer/result lifecycle; retain time, ranking, portrait and production-control boundaries.
- [ ] `member-shell/`, `advent-test/` and `ngsw-config.json` — make ordinary failures silent before launch and support accessible privileged calendar, answer, result and persisted state without cache leakage.
- [ ] `SPEC.md`, `DOMAIN.md`, `ARCH.md`, Advent PRD, architecture AD-2/3/4/6, `DESIGN.md`, `EXPERIENCE.md` and `hatcast-avent/epics.md` — reconcile approved exception and notification/participation contracts, preserving completed history; add a separately tracked story through the prescribed controller.
- [ ] API, Angular and browser tests above — cover the matrix, including server boundary 30 November 23:59:59/1 December 00:00 Paris, authorization, personal result isolation, ranking, out-of-order answers, production controls, service worker and account changes using synthetic fixtures.
- [ ] CI workflows and release scripts — run nonempty relevant regression suites on every change and each release path until launch; make failure block delivery and document actual coverage and any external branch-protection limitation.
- [ ] Local full stack and production-equivalent pre-release — verify ordinary and privileged journeys, responsive UI, keyboard/focus, reduced motion and HatCast isolation; record results and gaps. Actual production revision/configuration and real content require separate deployment authorization and later verification.

**Acceptance Criteria:**
- Given a proposed release, when the required tests fail or do not execute, then the applicable delivery path cannot proceed.
- Given notifications and analytics, when preview is used, then no surprise notification or sensitive answer data reaches other members; future 25.7 and 25.9 contracts reflect the exception without inventing those features.
- Given the UI checklist, when the change is reviewed, then applicable Material 3 and Advent accessibility and visual checks pass or explicit limitations are recorded.

## Implementation Notes

The direct preview route is `/avent?preview=1`; the server checks active membership, the two configured excluded IDs and a verified privileged email on every preview request. The API keeps normal `reveal_at` values and applies the exception only to the requesting account. The ordinary entry projection remains separate. The delivery workflow injects troupe and excluded-ID configuration from each GitHub environment; actual production values are not verified here. Story 25.15 is tracked as `review` pending the staging smoke.

## Spec Change Log

- Review found the real-API smoke depends on the real calendar, stationary shells do not recover or refresh at opening, deployment accepts missing configuration, and out-of-order preview bonuses can change without explanation. Require isolated deterministic time, silent server-authorized refresh, fail-closed configuration and honest provisional scoring. KEEP membership and email checks, personal result isolation, production control denial, existing scoring rules, no-store protections, real-API browser smoke and all passing regressions.
- Second review found refresh can reopen a dismissed welcome and Python accepts UUID forms rejected by Java. Restrict refresh-driven opening to the relevant transition and enforce runtime-compatible UUID encoding. Add tests for HTTP preview history authorization and PostgreSQL mutations. KEEP the first review fixes and deterministic isolated clock.

## Review Triage Log

- medium — The full-stack smoke assumes the real server date is before 1 December; its mandatory deployment gate will fail after opening. Use a deterministic server clock confined to the isolated fixture, and verify both sides of the boundary.
- medium — Entry failures are silent and a stationary shell has no immediate retry; navigation triggers another check, so the claim that recovery requires recreating the shell is false. The remaining no-navigation recovery gap requires an appropriate silent retry.
- medium — A shell left open through midnight does not refresh until navigation; the same applies after access closes. The claim that checks happen only on identity changes is false because navigation also checks.
- high — Deployment accepts missing Advent troupe and exclusion configuration; both GitHub staging and production environments currently lack those named environment variables. Repository-level variables and actual deployment configuration must be checked before concluding whether values are inherited; add fail-closed validation to the delivery path.
- medium — Preview results calculate streak bonuses over all currently recorded days, so a future day answered out of order can display a bonus that changes after earlier days are answered. The affected preview score needs an explicit coherent presentation and regression coverage.
- false — The claim that a recovered network connection can only be detected by shell recreation overlooks the navigation-end handler, which performs another server check. A stationary page remains an uncovered case as noted above.
- false — The claim that entry checks run only on identity change overlooks the navigation-end handler; a continuously open page remains an uncovered case as noted above.

Preproduction evidence: Cloud Run `hatcast-v2-staging-00129-pr4` in `impro-selector/europe-west9` is running an existing image; this uncommitted change cannot be present in that revision. The active revision has no Advent environment variable names. GitHub environment-specific staging and production variable lists lack the two Advent names; repository-level inheritance remains to be checked. The `v2` branch protection endpoint reported no classic branch protection and the repository rulesets endpoint returned no rulesets; organization rules have not been ruled out. No deployment or data mutation was performed.

- high — Periodic refresh calls auto-open even after a voluntary exit without answering; the immediate navigation suppression does not apply to the next interval.
- high — `uuid.UUID` accepts unhyphenated or braced IDs rejected by Java's `UUID.fromString`; deployment validation must match the runtime.
- medium — PostgreSQL tests do not execute the preview reconcile/reserve/confirm/acknowledge mutation chain; H2 is insufficient evidence for production SQL.
- medium — The smoke tests start separate servers on either side of the boundary and do not verify a stationary page crossing it.
- medium — Preview history HTTP authorization is not covered for a third party and authorized preview account; direct route coverage is required to protect future content.
- maybe-false — Direct invocation of an older workflow revision may bypass the newly introduced release gate; verify effective GitHub environment and organization protections before relying on this path.
- maybe-false — The PostHog class/config tests do not prove the remotely configured SDK emits no sensitive payload; inspect actual traffic and effective replay configuration in an isolated production-equivalent environment.
- false — The validator does not accept whitespace around the troupe UUID: Python's parser rejects it, as does the runtime.
- maybe-false — The approved proposal authorizes preview of future gifts by the two identities without setting an end date; some normative wording says “before 1 December”. Reconcile the wording with that approved intent; no change to ordinary-member restrictions follows from it.
- low — Preview acknowledgment persists the user's seen state, so the same result is not prioritized a second time after its normal reveal. The approved proposal explicitly permits persistent personal progression; the result remains available in the calendar.
- maybe-false — The local production promotion guard refuses old tags lacking the gate; whether an approved emergency rollback has another supported path requires operational verification.
- medium — Syntactically valid but incorrect configured identities pass deployment validation; matching actual production accounts and troupe must be verified independently before release.
- medium — The PostHog tests assert the block class and mock configuration but do not observe real SDK autocapture/replay payloads; add an isolated SDK integration test with synthetic content and intercepted traffic.

## Verification

Run focused API, Angular and full-stack browser tests with isolated synthetic content; record commands and counts. Exercise production-equivalent security and delivery workflows separately, including 5xx and network failures. Report unverified external branch protections and any checks requiring an independently authorized deployment.

- `./gradlew test --no-daemon --tests '*AdventMemberSecurityTest' --tests '*AdventMemberGameTest' --tests '*AdventOfflineIntegrationTest'`: 41 passed, none skipped, H2 synthetic fixtures. The 39 game/security cases were also rerun with `--rerun-tasks`.
- Against a disposable local PostgreSQL 16 container, `./gradlew test --no-daemon --tests '*AdventMemberPostgresTest' --tests '*AdventRankingPostgresTest' --tests '*AdventResultPostgresTest'`: 8 passed, none skipped, including a PostgreSQL check that a future result remains scoped to its owner. The container was stopped after the run. The CI gate now runs these suites on a disposable PostgreSQL service and rejects missing or skipped suites.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --watch=false --include='**/advent-test.spec.ts' --include='**/member-shell.spec.ts'`: 159 passed. The Node option is needed for the local Node 26 environment.
- `PLAYWRIGHT_WEB_PORT=4321 PLAYWRIGHT_BASE_URL=https://127.0.0.1:4321 npx playwright test e2e/advent-member.spec.ts --project=chromium-advent-answer`: 10 passed, including direct preview, keyboard, reduced motion, 320 px layout and reloading a recorded answer. These browser scenarios mock the API and therefore do not prove end-to-end authorization or production configuration. The frontend was started separately; the existing API on port 8080 was not modified.
- A further Playwright scenario passed for 404, 500 and network failures on ordinary mobile and desktop navigation and refresh. It uses synthetic API responses.
- A production-local build succeeded after removing hidden duplicate decorative CSS (BUG-076); the existing Sass deprecation and stylesheet budget warnings remain. `ADVENT_WORKER_BUILD=/private/tmp/hatcast-advent-build/browser node e2e/advent-isolation/preview-service-worker.smoke.cjs` passed against the actual built worker and a synthetic private API: account-specific responses remained separate, no Advent API request appeared in Cache Storage, and offline access did not return cached content. The reusable gate runs both the configuration guard and this worker smoke.
- A real local full-stack smoke passed with the e2e-profile API bound to `127.0.0.1:18080`, H2 in memory, synthetic quiz seed `apps/web/e2e/advent-isolation/fixtures/V999__advent_preview_synthetic.sql`, and the production-local build served only at `127.0.0.1:14331`. The e2e-only identity verifier supplies verified synthetic sessions; a read-only guard refuses the smoke unless the API uses its expected in-memory H2 database. `node e2e/advent-isolation/full-stack-preview.smoke.cjs` verified ordinary entry and forged-preview denial, both privileged journeys, final answers, session changes, reload recovery, personal-result isolation, production reset/replay denial, mobile/desktop entry, and an active service worker with empty Advent API caches and no offline disclosure. Both test servers were stopped afterward; port 8080 was untouched. One earlier rerun timed out waiting for preview after a sign-in; its cause was not established, and a subsequent fresh-stack run passed.
- After the PostHog privacy marker and explicit replay block configuration were added, `npm run build -- --configuration production-local --output-path /private/tmp/hatcast-advent-build` succeeded with the existing Sass and stylesheet-budget warnings. `ADVENT_WORKER_BUILD=/private/tmp/hatcast-advent-build/browser scripts/v2/run-advent-full-stack-smoke.sh` then passed against that fresh build; its isolated processes stopped on completion. This smoke uses the e2e identity provider and H2 and does not establish the effective remote PostHog configuration.
- The reusable `advent-regression.yml` runs on pushes and pull requests and is a prerequisite of the current deployment workflow. Local production promotion and redeployment scripts reject refs without that gate. GitHub branch protection, arbitrary manual invocations of older workflow revisions and external delivery paths are not verified.
- A production-equivalent pre-release environment, screen-reader and measured contrast checks, and actual release/configuration remain unverified. The local full-stack run used the e2e profile and H2, rather than a production-equivalent identity provider and database. Actual production revision, access and content require separate deployment authorization and later checks. The older service-worker smoke script targets an isolated offline stack and resets its data; it was not run against the unidentified process on port 8080.
- Review-loop verification: `./gradlew test --no-daemon --tests '*AdventMemberGameTest'` passed all 32 tests, including a synthetic preview answered in order 3, 2, 1: day 3's bonus changed from 0 to 2, another member could not read the result, and their rank and score stayed unchanged. An initial test placed the ordinary ranking before opening and correctly received 404; the comparison was moved to 1 December.
- `python3 scripts/v2/test-advent-config.py` passed: the deployment validator accepts a valid troupe and two distinct UUIDs and rejects seven missing, malformed, duplicate or extra-ID cases. The regression workflow runs the same check; actual GitHub environment values and effective configuration remain unverified.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --watch=false --include='**/member-shell.spec.ts'` passed 24 tests, including recovery after a network failure on a stationary page and removal of entry after access closes. The full Advent and shell run passed 161 tests before the network-failure assertion was strengthened.
- A fresh production-local build and `ADVENT_WORKER_BUILD=/private/tmp/hatcast-advent-build/browser scripts/v2/run-advent-full-stack-smoke.sh` passed both runs using the final same synthetic fixture: 30 November 23:59:59 and 1 December 00:00 Europe/Paris. The latter includes a day-one quiz and verifies automatic welcome. This e2e-only clock requires the sole `e2e` profile, no Cloud Run service and the named in-memory H2 database. The smoke remains synthetic and does not establish production-equivalent identity, database or remote configuration.

- Second review reimplementation: `python3 scripts/v2/test-advent-config.py` passed, including rejection of unhyphenated and braced UUIDs. `NODE_OPTIONS=--no-experimental-webstorage npm test -- --watch=false --include='**/member-shell.spec.ts' --include='**/advent-test.spec.ts'` passed 161 tests, including periodic refresh after leaving the welcome.
- `./gradlew test --no-daemon --tests '*AdventMemberSecurityTest' --tests '*AdventMemberGameTest' --tests '*AdventOfflineIntegrationTest'` passed, including direct HTTP preview-history authorization. PostgreSQL 16 in a disposable local container passed `AdventMemberPostgresTest`, `AdventRankingPostgresTest` and `AdventResultPostgresTest`, including preview reconcile, reserve, confirm and acknowledge; the container was stopped.
- A fresh production-local build and `ADVENT_WORKER_BUILD=/private/tmp/hatcast-advent-review-build/browser scripts/v2/run-advent-full-stack-smoke.sh` passed the before, after and stationary-page transition runs with synthetic data. The transition changes only the guarded e2e in-memory fixture clock while the same page remains open. Existing Sass and stylesheet-budget warnings remain; real production configuration, identity and content remain unverified.
- Final review verification: API security, game, offline, clock, Paris-time and portrait suites passed; Angular passed 162 tests in three files. The real PostHog SDK smoke intercepted and inspected autocapture and replay payloads with synthetic data and passed. The isolated full-stack smoke passed the private preview, opening, and stationary-page boundary journeys again. Remote PostHog settings and actual deployed environments remain unverified.

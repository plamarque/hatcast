# ISSUES

This document is the **factual issue registry** for the project. It tracks bugs, defects, limitations, and anomalous behaviors discovered during development, testing, or usage.

This is **not** a planning document. Fixing an issue may result in a task in PLAN.md or be handled opportunistically during a slice. ISSUES.md is **informational (non-normative)**; SPEC, PLAN, and ARCH remain the normative sources for requirements, delivery, and architecture.

**When adding an issue:** use a unique ID (e.g. BUG-002), and include at least: Status, Severity, Affected area, Observed behavior, Expected behavior, Notes/context. Optional: Cause, Fix, Repro.

---

## Current follow-up

This index is the active reading surface. Full evidence remains in the
historical registry below.

### Open defects and limitations

BUG-062 (intermittent Advent loading failure; bounded read retry implemented locally, root cause unknown).

BUG-054 (PWA banner overflows at 200% text size on a narrow screen).

BUG-049 (production scheduled reminder encountered a database connection timeout).

LIMIT-011 (repeated release validation and deployment cycles), and LIMIT-012
(release evidence is not fully bound to the promoted candidate).

BUG-041 (manual PWA application-version check), and BUG-042 (analytics bootstrap import failure).

BUG-039 (PR #15: denied sessionStorage access escapes chunk recovery handler).

BUG-038 (intermittent composition smoke assertions observed on v2.6.3-rc.2).

BUG-BMAD-001 (accented versus ASCII story keys in sprint controller).

BUG-BMAD-002 (sprint tracker timestamp rejected by BMAD validator).

BUG-031 (format cancellation),
BUG-028 (mobile season chart), BUG-023 (stale Home badge), LIMIT-009 (Dispos
view), BUG-018 (staging traffic), LIMIT-008 (Loop policy), LIMIT-007 (web unit
stability), LIMIT-004 (seed roster), BUG-008 (push preferences), LIMIT-001
(legacy E2E), LIMIT-003 (development PWA install), and LIMIT-002 (shared API
integration database).

### Pending verification or operational follow-up

BUG-056 is corrected locally in story 25.2; integration and real-browser isolation verification remain pending.

BUG-POSTHOG-002 is closed locally with its reviewed fix integrated into v2 and regression tests passing; corrected CI execution remains pending.

BUG-033 needs an authorised production data repair. BUG-027, BUG-026, BUG-025,
BUG-024, and BUG-021 have local fixes but still require their stated review,
human-smoke, integration, or validation gate.

BUG-037 and BUG-029 have fixture-only corrections verified by the complete API suite and independent review; integration remains pending.

### BUG-062 — Advent quiz intermittently fails to load in development
- **Status**: Mitigation implemented locally; root cause not established.
- **Severity**: Undetermined.
- **Affected area**: Advent member journey in the development environment.
- **Observed behavior**: On 2026-10-31, navigating to the 2 December quiz displayed “Le lutin est indisponible. Réessaie.”; a later retry loaded the quiz successfully.
- **Expected behavior**: An available quiz loads reliably, with a retry offered if a transient failure occurs.
- **Notes/context**: The client uses one generic error for network, HTTP, and timeout failures. A priority result lookup at 11:32:36 UTC took 40.7 seconds and returned HTTP 200, beyond the client’s 10-second deadline; another lookup completed in 0.19 seconds. This is consistent with, but does not conclusively identify, the failure. Subsequent quiz requests succeeded. A single retry of transient GET failures is implemented locally; prolonged or repeated failures can still occur. Do not infer that the portrait or database was missing.

### BUG-061 — Advent test controls wrap on mobile
- **Status**: Corrected locally; awaiting human verification.
- **Severity**: Low.
- **Affected area**: Advent test header on mobile.
- **Observed behavior**: Test controls wrap onto a second line and push the quiz content down.
- **Expected behavior**: Test controls stay on one line on mobile, using the space occupied by the quiz title.
- **Notes/context**: Reported with a phone screenshot during story 25.4. Chromium checks passed at widths from 320 to 430 px with all controls visible and 44 px touch targets.

### BUG-060 — Advent test reveal obscures the simulated day
- **Status**: Corrected locally; human verification accepted on 2026-10-31.
- **Severity**: Low.
- **Affected area**: V2 isolated Advent test navigation.
- **Observed behavior**: A reveal shows the quiz date while the shared simulated date is not displayed, making the day and the effect of Continue ambiguous.
- **Expected behavior**: The simulated day is visible between the test arrows; Continue opens the current day without advancing the clock.
- **Notes/context**: Reported during story 25.3a human testing. The existing continuation reads the shared clock; no extra clock-advance request was found in the code. Regression coverage verifies the 8-to-9 journey; Patrice accepted the UX after testing.

### BUG-059 — Revisiting an answered Advent test day shows a closed gift
- **Status**: Corrected locally; awaiting human verification.
- **Affected area**: V2 isolated Advent test navigation.
- **Observed behavior**: Navigating back to an answered day redisplayed the unopened gift until it was tapped again.
- **Expected behavior**: An answered day opens directly to its recorded state without reopening the gift.
- **Notes/context**: Reported with a mobile recording. Angular tests and a real Tailscale browser navigation check passed. Detailed result reveal remains part of story 25.3.

### BUG-058 — Offline seed accounts cannot access Advent test
- **Status**: Corrected locally; verified with an offline seed session through the Tailscale proxy.
- **Affected area**: V2 offline Advent test access.
- **Observed behavior**: The development seed identity verifier leaves `emailVerified` false, while the Advent test controller requires a verified email session even offline. Thus the documented seed sign-in cannot access the Advent preview.
- **Expected behavior**: An eligible offline seed account can access the isolated Advent test while verified-email protection remains appropriate for real identities.
- **Notes/context**: Validated seed credentials now produce a verified synthetic identity; real identities retain the provider verification result. The offline seed sign-in, protected Advent read, and CSRF-protected reconciliation were verified through Tailscale. `DEVELOPMENT.md` documents offline seed access to the preview.

### BUG-057 — Advent test can wait indefinitely on a stalled request
- **Status**: Fixed locally in the unintegrated story 25.2 implementation; integration and browser network-stall verification remain pending.
- **Affected area**: V2 isolated Advent test interface.
- **Observed behavior**: A fetch that never settles leaves the interface loading, checking, or submitting without a timeout or retry; relevant test-day controls remain disabled. The close link remains available.
- **Expected behavior**: A stalled request can be recovered without an indefinite wait while preserving safe answer reconciliation.
- **Notes/context**: Requests and response parsing now time out after 10 seconds. A timed-out confirmation is reconciled before retry; a timed-out reconciliation remains uncertain. Component tests cover stalled preview, reconciliation and confirmation. No network-stall browser test has yet been run.

### BUG-056 — Uncertain Advent submission may allow a conflicting retry
- **Status**: Corrected locally; integration pending.
- **Affected area**: V2 isolated Advent test answer confirmation.
- **Observed behavior**: After a failed confirmation response, the state check can return available while the initial confirmation is still being processed. A member may change their choice and retry, while the original selection can still be recorded.
- **Expected behavior**: An uncertain confirmation must be reconciled without allowing a conflicting choice to be submitted.
- **Notes/context**: A server-side reservation and reconciliation generation invalidate delayed confirmations and reservations. The targeted H2 integration tests cover both confirmation/reconciliation orders, delayed reservation and member isolation; Angular tests cover a lost response and reopening. Offline API tests check verified-email access. Browser tests use mocked API responses and do not establish real API/CSRF or service-worker cache isolation; PostgreSQL concurrency and integration remain to be verified.

### BUG-055 — Late Advent test answer alters a revealable bonus
- **Status**: Corrected locally; integration pending.
- **Severity**: High (result data can change after it is eligible for reveal).
- **Affected area**: V2 isolated Advent test answer scoring.
- **Observed behavior**: A quiz response received earlier but persisted after later responses can cause their stored streak bonuses to be recalculated, including after their reveal time.
- **Expected behavior**: Pending confirmations close at midnight and scoring data remains stable when results become revealable.
- **Notes/context**: The late-lock and simulated-clock reproductions now pass locally after the 2026-10-30 decision. A transaction paused after its deadline check and before commit remains unverified; the issue stays open pending a complete guarantee. The feature has not been integrated or deployed.

### BUG-054 — PWA banner overflows at increased text size
- **Status**: Open.
- **Severity**: Medium (content may require horizontal scrolling at increased text size).
- **Affected area**: V2 PWA system banner on `/avent-test`.
- **Observed behavior**: In Chromium at a 320 px viewport with the root text size at 200%, the banner actions extend beyond the viewport and the document scrolls horizontally. The Advent quiz fits after dismissing the banner.
- **Expected behavior**: The banner and its actions remain within the viewport and readable at increased text size.
- **Notes/context**: Observed with fictional quiz content and intercepted API responses during story 25.2 browser verification. This is distinct from BUG-050, which concerned a banner covering the test label. On 2026-10-31, the same overflow was observed on `/avent` in a mocked Chromium member-ranking test at 320 px and 200% text size: banner actions reached approximately 343–347 px. Real devices have not been checked.

### BUG-053 — Development Google sign-in rejected the Cloud Run origin
- **Status**: OAuth configuration updated; awaiting end-to-end user verification.
- **Affected area**: V2 development Google sign-in on the Cloud Run `-od.a.run.app` hostname.
- **Observed behavior**: Google returned HTTP 400 `origin_mismatch` because the development service origin was missing from the OAuth client’s authorized JavaScript origins.
- **Expected behavior**: The development URL can initiate Google sign-in and return to the requested test page.
- **Notes**: The missing origin was added on 2026-10-30. Google reports that propagation may take from five minutes to several hours.

### BUG-052 — Unverified identity email can link an existing account
- **Status**: Mitigated for the two development testers; the general account-linking behavior remains open.
- **Affected area**: Identity Platform sign-in and email-based account linking.
- **Observed behavior**: The Identity Platform token payload does not carry email verification state, and a sign-in may link an existing user by email without checking that the email was verified. The proposed Advent test allowlist relies on that session email.
- **Expected behavior**: Access to the Advent preview must establish possession of the allowed address using the current authenticated identity; an unverified identity must not claim an existing tester account.
- **Notes**: The actual exploitability depends on Identity Platform account configuration; do not deploy the email-based preview until the boundary is verified and protected.

### BUG-051 — Advent preview diverged from approved design
- **Status**: Reopened for the approved 2026-10-30 visual direction; alignment in progress.
- **Affected area**: V2 Advent stories 25.1 and 25.2 test preview.
- **Observed behavior**: The original preview lacked the festive palette, decorated full-page door, floating ornaments and visible opening with light from the approved UX direction.
- **Expected behavior**: The preview reflects the approved door and quiz direction, including an equivalent reduced-motion experience.
- **Notes**: Automatic entry on eligible visits belongs to story 25.6 and is not implemented in this preview. The 2026-10-30 approved design handoff is the current visual reference. A 390 px capture of the current confirmation shows a closer hierarchy but lacks the full festive setting of the reference; remaining work is recorded in the Advent visual foundation spec.

### BUG-050 — PWA banner masked the Advent test label
- **Status**: Fixed locally in story 25.1; integration and deployment not yet verified.
- **Severity**: Medium (the test-only label was hidden on mobile).
- **Affected area**: V2 `/avent-test`, PWA install/update banners.
- **Observed behavior**: The fixed install banner covered the test label and part of the title at 320–375 px.
- **Expected behavior**: The test label and page content remain visible below banners, including at increased zoom.
- **Notes**: The Advent route places the existing banners in normal flow. Local Chromium captures used fictional data and intercepted all network requests; browser checks cover one or two banners and 200% zoom. Other routes were not changed.

### PERF-003 — Accueil shifts when an empty-inbox confirmation appears after revalidation
- **Status**: Fixed locally — human smoke accepted; real-device and production CLS checks pending
- **Severity**: Medium (visual stability on mobile)
- **Affected area**: `apps/web` — `/accueil`, `MemberHomeTodo`
- **Observed behavior**: PR #14 reports repeated production shifts around 0.140 at 375×766 when the “Tout est à jour” banner is inserted above existing cached content.
- **Expected behavior**: Reserve the eligible confirmation's space with a visible skeleton. Do not replay unchanged empty feedback. Newly received tasks remain visible and cancel dismissal. The approved transient confirmation intentionally collapses after its fade; this movement must be assessed separately from the initial insertion defect.
- **Verification**: 62 focused unit tests plus 34 auth/shell tests passed in isolated runs; production build passed; 12 controlled-response Chromium/WebKit mobile/desktop checks passed. Independent review findings addressed. Firefox could not launch locally; real devices and production metrics remain unverified.
- **Evidence**: [PR #14](https://github.com/plamarque/hatcast/pull/14); local source analysis. Production frequency remains unquantified.

### Historical registry

### BUG-049 — Scheduled reminder failed to acquire a database connection
- **Status**: Open — observed in production logs; impact and recurrence not established.
- **Severity**: Undetermined.
- **Affected area**: V2 API `AssigneePresenceReminderJob`, datasource connection acquisition.
- **Observed behavior**: On 2026-10-28 at approximately 08:00 Paris time, the scheduled job logged `CannotCreateTransactionException` following a Hikari connection acquisition timeout. Whether any eligible reminder was missed is unknown.
- **Expected behavior**: Scheduled reminder processing can access its database or recover from a transient failure.
- **Notes/context**: Observed during a read-only Cloud Run log inspection on 2026-10-29; no production data or infrastructure was changed. Root cause, retry behavior and relation to CPU allocation remain unverified.

### BUG-DOC-002 — ARCH retains a deferred V2 release topology
- **Status**: Fixed locally — ARCH now distinguishes the existing V2 Cloud Run release topology from the historical V1 Firebase description.
- **Severity**: Medium (conflicting architecture inputs).
- **Affected area**: `ARCH.md`, section « Évolution V2 »; V2 release-delivery architecture planning.
- **Observed behavior**: `ARCH.md` says staging/production Cloud Run are deferred and production remains V1. The V2 deployment runbook, release skill and 2026-10-23 release audit describe the staging/prod chain; `.github/workflows/deploy-v2-cloud-run.yml` configures staging branch and production-tag targets.
- **Expected behavior**: Normative as-is architecture and release documentation agree on the deployed product line and release topology.
- **Notes/context**: Found during planning-only `bmad-architecture` activation on 2026-10-23. Corrected on 2026-10-27 with Patrice's approval using the existing workflow and deployment runbook; no runtime change or fresh cloud inspection.

### BUG-048 — Event details fail when a new troupe has unseeded categories
- **Status**: Open — correction deferred; explicitly accepted as non-blocking for release 2.7.0 by Patrice on 2026-10-23. Reproduced on staging `v2.7.0-rc.2`, revision `hatcast-v2-staging-00129-pr4`. Not fixed.
- **Severity**: High (opening an event can fail for a newly created troupe).
- **Affected area**: `EventPageService.loadPageById/loadPageBySlug` → `TroupeCategoryService.ensureDeplacementsSeed`.
- **Observed behavior**: The isolated E2E troupe `e2e-rc2-accueil-20261023` has six visible agenda events and one active MEMBER_SYNC participant. Clicking event 04 from Accueil navigates to its detail URL then returns to `/agenda`. Authenticated GET of the event itself and `/page?tab=dispos` succeed; `/page?tab=infos` returns HTTP 403. Cloud Run logs show `cannot execute INSERT in a read-only transaction` while inserting into `troupe_categories`, through `ensureDeplacementsSeed` inside the read-only event-page transaction.
- **Expected behavior**: Opening a visible event in a new troupe loads its information without failing category initialization.
- **Release disposition (2026-10-23)**: Patrice confirms production currently has a single, already initialized troupe, so the missing-category trigger does not apply to the intended production scope. He explicitly accepts deferring this fix without blocking production validation for 2.7.0. This is a scoped acceptance of the defect, not a passing reproduction or authorization to deploy. Reassess before introducing a new or uninitialized troupe; production initialization was stated by the owner, not independently queried for this disposition.
- **Evidence and limits**: `/private/tmp/hatcast-2.7.0-rc2-proof/event-detail-error.txt` and RC2 browser report. Five-card display, full-agenda navigation, and persisted availability from card 04 passed. CI/E1 green does not cover this fresh-troupe case. No category seeding workaround, code change, production reproduction or production promotion performed; no regression attribution to the Accueil delta established.

### LIMIT-011 — V2 release repeats full validation and staging deployment
- **Status**: Open — audited 2026-10-23; no gate changed.
- **Severity**: Medium (delivery latency and repeated CI work).
- **Affected area**: V2 staging/release/prod scripts and GitHub Actions.
- **Observed behavior**: `deploy_staging.sh` runs the full local E2E suite, then pushes staging (full CI E2E, image build/deploy, E1 T2). `release_version.sh` changes release metadata and pushes staging again, triggering another full cycle, then syncs to `v2` and triggers its matching workflows. `deploy_prod.sh` runs the full local E2E suite again. On 23 October, staging runs [39897194431](https://github.com/plamarque/hatcast/actions/runs/39897194431) and [39899222776](https://github.com/plamarque/hatcast/actions/runs/39899222776) took 13:47 and 22:18; their intervening Git diff contains only six version/changelog files. The latter includes 8:01 installing Chromium, not executing tests.
- **Expected behavior**: Make repeated work and actual coverage explicit; any removal or risk-based selection requires an approved release contract. Existing gates remain applicable.
- **Evidence**: [Release chain audit](docs/v2/technical/RELEASE_CHAIN_AUDIT_2026-10-23.md). Local and human times were not measured; no one-hour end-to-end timing is claimed from CI alone.

### LIMIT-012 — Release checks do not mechanically attest all candidate evidence
- **Status**: Open — source audit 2026-10-23; no invalid production promotion established.
- **Severity**: Medium (confidence and provenance of release validation).
- **Affected area**: `scripts/v2/promote-tag-to-prod.sh`, `promote-to-staging.sh`, and E1 preprod workflow/specs.
- **Observed behavior**: Local pre-push E2E runs on the current checkout, without explicitly checking out the promoted RC (prod) or the final merged candidate (staging). The prod script checks tag identity and staging ancestry, but does not itself read CI/T2 results or human smoke disposition; the release skill delegates those checks to the operator. E1 uses a mutable staging URL; its YAML has no explicit expected-SHA assertion. Missing Malice probe results skip Playwright with a warning. E1-MEM-031/032 skip persistence writes on staging, and E1-ORG-001–002 can return after visibility alone when drawing is unavailable.
- **Expected behavior**: Treat these as distinct, bounded proofs; a green E1 result must not be described as complete persisted C2/C3 validation. Any future fast path must bind required evidence to its exact candidate and record omitted/waived coverage.
- **Notes/context**: Detailed T2 runs inspected did execute Playwright (34 passed, 2 skipped). The human smoke contract already requires persisted outcomes. External GitHub environment/branch protection was not inspected. No gate bypass, data corruption or deployed regression is inferred from this limitation.
- **Evidence**: [Release chain audit](docs/v2/technical/RELEASE_CHAIN_AUDIT_2026-10-23.md); [E1 run](https://github.com/plamarque/hatcast/actions/runs/39897194431).

### BUG-047 — Google sign-in reports an unapproved V2 staging origin
- **Status**: Observed during the 2.7.0-rc.1 browser smoke; Google sign-in itself was not exercised.
- **Severity**: Low (staging-only console finding; impact on Google sign-in requires verification).
- **Affected area**: Google Identity Services on `https://hatcast-v2-staging-gz5evlelnq-od.a.run.app/connexion`.
- **Observed behavior**: The login page emits `[GSI_LOGGER]: The given origin is not allowed for the given client ID.` Browser extensions emit separate unrelated warnings.
- **Expected behavior**: A supported staging login origin is accepted by the configured Google OAuth web client.
- **Evidence and limits**: Browser console during the 2026-10-23 RC smoke, revision `hatcast-v2-staging-00127-r66`; email/password login passed for both configured E2E roles. No Google login attempt, client configuration change, or production impact is established.

### BUG-046 — Guest navigation E2E expects an incomplete fixture title
- **Status**: Fixed locally — complete E2E suite passed (100 passed, 4 skipped); CI verification pending.
- **Severity**: Low (release verification blocked; no application defect established).
- **Affected area**: `apps/web/e2e/recette-3-25.spec.ts`, scenario 3.25-E2E-10.
- **Observed behavior**: CI run [39851377774](https://github.com/plamarque/hatcast/actions/runs/39851377774) fails because the season menu displays `Guest 325 Ruben EVENT` while the assertion expects `Guest 325 Ruben`.
- **Expected behavior**: Assert the complete season title created by `E2eStory325FixtureService`, preserving the destination URL and navigation checks.
- **Cause and correction**: The fixture explicitly creates `Guest 325 Ruben EVENT`; the menu correctly uses the season title. Correct only the exact text expectation; no production behavior or fixture changes.

### BUG-045 — Unlock rejected while composition appears validated
- **Status**: Closed locally on 2026-10-22 — Patrice accepted the phone recipe and authorized local closure. Not deployed.
- **Severity**: Medium (conditional organizer blockage after concurrent unlock).
- **Affected area**: Event Équipe tab, composition unlock lifecycle.
- **Observed behavior**: Patrice's CCAS screen retained “Annoncer la compo” and “Déverrouiller” after the API returned “La composition n'est pas validée”. Repeated clicks could not recover.
- **Confirmed cause**: The activity-journal screenshot supplied by Patrice shows “Composition déverrouillée” at **15:42:35**, attributed to Nicolas (N), after Patrice loaded Équipe at approximately **15:42:09** and before his first rejected unlock around **15:43:37**. Patrice retained a formerly valid screen while Nicolas changed the server state. The journal also shows Nicolas assigning Antoine at 15:43:13, assigning/releasing Viviane at 15:43:22/26, and assigning Aurélien at 15:45:16. This is a confirmed concurrent-edit case; its production frequency has not been measured.
- **Fix**: On unlock HTTP 409, reload the authoritative composition, propagate it to the parent, and restore draft actions. Acknowledge an already-unlocked draft only after a successful read. Preserve assignments/statuses, retain other errors, ignore responses after navigation/destruction, and keep interactions blocked through recovery. The backend contract is unchanged.
- **Verification**: 158 tests passed across the Équipe component and event-detail parent, including 18 new recovery cases; production build passed. Independent review findings addressed. Patrice verified the prepared two-tab scenario on his phone and explicitly accepted closure. Existing Material controls and layout are reused, with no checklist waiver.
- **Replay evidence**: Patrice's [recording](https://eu.posthog.com/project/193437/replay/home?sessionRecordingId=01a163d8-be3e-7feb-bb5b-4b0c4c7ba97d), release `2.6.3:c93d2c81`, shows Équipe GET 200 around 00:18, then three unlock conflicts at 01:46, 01:50 and 02:12 with no subsequent composition refresh. These refused requests did not perform an unlock. Nicolas's [later recording](https://eu.posthog.com/project/193437/replay/home?sessionRecordingId=01a16416-762e-7413-b635-ade2e3c4d720) starts at 16:49:16 Paris on the same event and shows publication of the spectacle, an already editable draft, then composition validation. The journal screenshot places validation at 16:50:03. The later replay does not contain the earlier unlock; the journal resolves that provenance.
- **Scope/limits**: Recovery is validated for this incident pattern. This does not add live synchronization or prevent concurrent edits. Production records were inspected through the provided replays and screenshots; no production data was modified.

### LIMIT-010 — Troupe hub navigation links depend on displayed content
- **Status**: Closed locally on 2026-10-22 under the approved member-troupe-navigation contract; Patrice accepted the mobile recipe. Not deployed.
- **Severity**: Low (alternative routes exist, but direct page navigation is conditional).
- **Affected area**: `apps/web/src/app/pages/troupe-hub/troupe-hub.html` and `season-hub-mini-chart.utils.ts`.
- **Observed behavior**: The selected season's "Voir tous les spectacles" link is rendered only with a nonempty upcoming-event teaser. "Voir toutes les stats" is inside `showSeasonMiniChart()`, whose chart builder returns null with fewer than three past events. Loading/error states can also hide these links. Selecting another season in the hub changes the dashboard rather than opening its workspace.
- **Implemented behavior**: A compact group directly below the selected season title exposes agenda and permitted statistics links independently of teaser/chart content. Season guest restrictions remain enforced.
- **Evidence/limits**: Template regression tests cover direct links without the mini-chart or upcoming teaser and during dashboard errors. Patrice confirmed human acceptance on 2026-10-22. Existing seasonal view controls and troupe breadcrumb are preserved.

### BUG-044 — Phone recovery fixture cannot always be restarted with another client open
- **ID**: BUG-044
- **Status**: Closed — repeated two-client checks pass; Patrice confirmed phone repeatability 2026-10-21; temporary fixture removed at closure
- **Severity**: Medium (blocks repeated human verification)
- **Affected area**: Temporary phone fixture reset dashboard at Tailscale :8443, service-worker cache reset.
- **Observed behavior**: Patrice reports that the scenario works only once. Three consecutive single-client cycles pass; keeping a second client open on B reproduces a timeout loading the reset A home. The old worker can remain associated with a live client while its caches are cleared.
- **Expected behavior**: Reset always starts a fresh A screen and permits another complete recovery, including when Chrome and the installed PWA remain open.
- **Notes/context**: Fix: test reset preserves worker registrations and caches needed by other live clients, restores server A, and bypasses worker navigation only for its initial test Home document. Three consecutive complete cycles pass with another B client left open. Keep this separate from production ChunkRecoveryService. Phone screenshot also requests primary-left / dismiss-right actions in one row; scoped dialog CSS and DOM order corrected. Actual dark-theme Chromium at 320px: primary width151px/height56px, dismiss width81px/height48px, same row, no overflow. Patrice confirmed repeatability on Android. Temporary fixture and phone access removed at closure.


### BUG-043 — Optional storage failure can prevent reload after PWA activation
- **ID**: BUG-043
- **Status**: Fixed locally — optional changelog storage isolated; post-activation reload regression passes; not deployed
- **Severity**: Medium (conditional mixed-version runtime after user-confirmed update)
- **Affected area**: `apps/web/src/app/core/pwa/pwa-update.service.ts`, `applyUpdate()`.
- **Observed behavior**: The method activates the worker version, writes the optional changelog flag to sessionStorage, then reloads. If the storage getter/setItem throws after successful activation, the catch clears refreshing without reloading, leaving old JavaScript running after the client-version switch.
- **Expected behavior**: Optional storage bookkeeping must not prevent full navigation after a successful activation; it should be isolated as best effort.
- **Verification (2026-10-21)**: Executed the exact existing applyUpdate method with activateUpdate resolving true and setItem throwing: activation happened, reload did not, refreshing became false. This is a deterministic method-level test, not a production frequency or browser reproduction.
- **Context**: See `pr-15-recovery-party-review.md`, R7. The ordinary update path keeps its existing activation policy with only the optional storage flag guarded; recovery uses a separate readiness-check/full-navigation path.

### BUG-040 — Stale client cannot load removed lazy chunks after deployment
- **ID**: BUG-040
- **Status**: Fixed locally — recovery verified; phone smoke accepted 2026-10-21; not deployed
- **Severity**: Medium (navigation can remain blocked until update/reload)
- **Affected area**: V2 static asset serving, router lazy imports and PWA client lifecycle.
- **Observed behavior**: [PR #15](https://github.com/plamarque/hatcast/pull/15), reviewed at `8740a147c63397623b5cc7bd3e2cadc1197491cb`, describes an old open client requesting removed hashed chunks and receiving HTML instead. Its one occurrence in 30 days is author-reported, not a fresh analytics measurement. Its blind reload did not establish coherent active-SW recovery. The replacement uses consent-only readiness checks and full navigation; six real-browser fixture cases, including a real active worker, pass locally.
- **Expected behavior**: Global generic update dialog after detected failure, explicit consent, ready-version check followed by full navigation when controlled, and exact destination restoration in web and installed PWA.
- **Notes/context**: A healthy SW prefetches old chunks, so controlled-client reproduction must include cache loss. Use this free ID instead of the PR's colliding BUG-038. See `spec-pr-15-stale-client-recovery.md` and supporting investigation/verification artifacts. Bootstrap-before-shell failures are outside modal reach. Accepted rare residual: NO_NEW_VERSION_DETECTED is broadcast to all worker clients; a simultaneous check against a different manifest can make an inconclusive local check appear known. A consented reload may then need another refresh. No cross-tab correlation is added for this low-impact case.

### BUG-041 — Manual PWA check does not request Angular application-version check
- **ID**: BUG-041
- **Status**: Open — pre-existing behavior identified during PR #15 investigation; not included as a general manual-check refactor
- **Severity**: Medium (manual update feedback may miss a deploy with unchanged worker script)
- **Affected area**: `apps/web/src/app/core/pwa/pwa-update.service.ts`, `checkForUpdatesManually()` and `pollForAppUpdate()`.
- **Observed behavior**: These methods call registration.update() and await VERSION_READY/waiting worker, but never call SwUpdate.checkForUpdate(). Updating the worker script is distinct from checking the Angular app manifest; deployment may change app chunks without changing the worker script.
- **Expected behavior**: An explicit application-update check requests Angular's application-version check and distinguishes no update from failure.
- **Evidence/limits**: Source inspection against baseline `3a0a08482a4e9d1961f9b2469123ffc874a685c5`, installed Angular 21.2.9 and official SwUpdate documentation. A recovery-specific API is planned; no standalone manual-check browser reproduction or fix is claimed.

### BUG-042 — Failed lazy analytics import can prevent application bootstrap
- **ID**: BUG-042
- **Status**: Open — pre-existing source-level finding; outside the post-bootstrap recovery scope
- **Severity**: Medium (conditional failure before recovery UI exists)
- **Affected area**: `apps/web/src/app/app.config.ts`, `core/analytics/product-analytics.service.ts` and `posthog-browser.client.ts`.
- **Observed behavior**: The app initializer awaits ProductAnalyticsService.bootstrap(); ensureInitialized() propagates rejection from the lazy posthog-js import when configured. A failed import can reject bootstrap before App and its recovery dialog exist.
- **Expected behavior**: A failed optional analytics initialization should not prevent the application shell from starting.
- **Evidence/limits**: Verified promise chain in the integration baseline; conditional on analytics being configured and the import failing. No production frequency or browser reproduction established. Record separately rather than claiming the recovery modal covers a shell that never starts.

### BUG-039 — PR #15 chunk recovery throws when storage access is denied
- **ID**: BUG-039
- **Status**: Open — review finding on PR #15 at `8740a147c63397623b5cc7bd3e2cadc1197491cb`; not a confirmed deployed defect
- **Severity**: Medium (navigation error handling fails under browser storage restrictions)
- **Affected area**: `apps/web/src/app/core/app/chunk-load-recovery.ts:22` and its registration in `app.config.ts` in [PR #15](https://github.com/plamarque/hatcast/pull/15).
- **Observed behavior (2026-10-21)**: The default argument `storage = sessionStorage` reads the browser property before the function body and its `try`. If that getter throws `SecurityError`, the router error handler throws instead of returning `false`, including for unrelated navigation errors. The existing unavailable-storage test only makes `getItem()` throw on an explicitly supplied object.
- **Expected behavior**: Classify the navigation error first, then resolve default browser storage inside the guarded block; denied storage access returns `false` without replacing the original error.
- **Verification**: Reproduced against the exact PR helper, transpiled with the installed TypeScript compiler: a throwing global `sessionStorage` getter escapes for both chunk and unrelated errors. Direct checks also verified first recovery, suppression inside the guard window, and handling of an injected `getItem()` failure. This is focused helper evidence, not browser or full-suite verification.
- **Additional PR review finding**: The PR assigns `BUG-038` to stale chunks, but the integration branch already assigns it to composition smoke retries below (commit `c70139a9`). Use a free identifier for the stale-chunk issue before integration; preserve the existing record.

### BUG-POSTHOG-002 — Production promotion capture fails its acceptance guard
- **ID**: BUG-POSTHOG-002
- **Status**: Closed locally (2026-10-23) — reviewed correction integrated into local v2; regression tests pass; corrected CI execution pending. Historical deployment workflows remain unchanged.
- **Recurrence (2026-10-23)**: Production 2.7.0 [workflow 39910450325](https://github.com/plamarque/hatcast/actions/runs/39910450325), commit `37e1bfd27c9107aaca3d44dd796255de1ed70187`: deploy succeeded; revision `hatcast-v2-00026-wn2` serves 100% of traffic. The PostHog job fails with the same acceptance-guard message. Public version 2.7.0 / production channel, health UP and PWA smoke passed in the historical release evidence. This observability failure did not undo deployment. No quota/billing/credential change or retry performed; the message alone does not prove quota exhaustion.
- **Severity**: Medium (release observability incomplete; deployment remains successful)
- **Affected area**: `scripts/v2/posthog-lifecycle-dashboard.mjs`, production workflow `posthog-lifecycle` job.
- **Observed behavior**: [Workflow 39130429450](https://github.com/plamarque/hatcast/actions/runs/39130429450), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: deployment succeeded, revision `hatcast-v2-00024-5n9` serves 100% of traffic, but lifecycle synchronization failed with `PostHog promotion capture was not accepted without quota limits`. Overall workflow is red despite its successful deployment job. Read-only checks returned version 2.6.3, production channel, and health UP.
- **Expected behavior**: Promotion capture is accepted without quota limitation and lifecycle dashboard synchronization completes.
- **Notes/context**: The guard raises for either `status !== 1` or a nonempty `quota_limited` list; the redacted log does not distinguish those cases, so a quota exhaustion diagnosis is not established. Dashboard provisioning is not reached after this error. No retry, quota/billing change, credential change, or production rollback was performed. The prior staging E1 gate was green; user approved production using the existing human recipe and requested no repeat tests.
- **Established defect**: The guard requires numeric `1`, whereas the EU capture success contract returns the string `"Ok"` ([official response contract](https://posthog.com/docs/api#responses)). The [capture implementation](https://github.com/PostHog/posthog/blob/master/rust/capture/src/api.rs) derives Serde serialization for enum `CaptureResponseCode::Ok`: its Rust discriminant `= 1` does not make its JSON serialization numeric. Thus even an accepted, non-limited response is rejected before dashboard provisioning. HTTP success alone remains insufficient because quota-limited captures also return HTTP 200.
- **Remote evidence (read-only, 2026-10-23)**: In EU project `193437`, the SQL below returned exactly two rows: `2.7.0:20d972b0`, count `1`, first promotion `2026-10-23T06:20:55Z`; `2.6.3:c93d2c81`, count `1`, first promotion `2026-10-18T13:16:04Z`. The 2.7.0 timestamp equals the successful `deploy` job's completion in the saved `ci-final.json`. Both real promotion events were ingested despite failed observability jobs; no new capture was required. The existing lifecycle dashboard `1032942` also reads 2.7.0 as its latest release reference. GitHub production environment metadata confirms the three expected secrets exist (`HATCAST_POSTHOG_PROJECT_API_KEY`, `HATCAST_POSTHOG_PERSONAL_API_KEY`, `HATCAST_POSTHOG_PROJECT_ID`), with no project-ID variable override. Secret values were neither fetched nor logged; existence alone does not attest current private-key permissions.
- **Production identity cross-check (2026-10-23)**: A fresh read of `https://hatcast.app/version.txt` returns `2.7.0`, `Production build - 2026-10-23`, `Git: 20d972b0`. `parseRelease` therefore derives exactly the ingested reference `2.7.0:20d972b0`, not an RC version. Local tags `v2.7.0` and `v2.7.0-rc.2` both resolve to promotion commit `37e1bfd27c9107aaca3d44dd796255de1ed70187`; the event identity uses the embedded version-file Git field, not the tag commit SHA. Docker patches the channel line for production without changing this identity. No backfill is necessary for this release reference. This does not attest every client event or execution of the corrected synchronization job.
- **Correction**: Extract capture acceptance into `capturePromotion`; accept exact `"Ok"` and legacy numeric `1`, only with absent or empty-array quota metadata. Nonempty quota arrays, malformed quota metadata, unknown status, HTTP failure, invalid JSON and transport failure remain errors and stop provisioning. Diagnostics contain only HTTP code, a fixed status classification, and quota absence/invalidity/count; no raw body, status value, resource names, token or authentication headers. Payload identity, promotion date, ownership and deployment gates are unchanged.
- **Verification**: `node --test scripts/v2/posthog-lifecycle-dashboard.test.mjs` passes all 8 tests, including EU/legacy success, quota rejection, malformed replies, HTTP/JSON/transport errors, sensitive diagnostic redaction, and `--apply` ordering (provision after acceptance; no provisioning after rejection). Existing ownership/idempotent-provisioning and no-ingestion validation tests remain green. Manifest preview and `git diff --check` pass.
- **Limits / delivery**: The historical response bodies and quota fields were not recorded and cannot be reconstructed; do not claim a captured historical `quota_limited=[]` or a full billing audit. The protocol mismatch is established by the official contract/source and the real ingested release references. No isolated `--validate` run was needed: it would mutate managed dashboard objects and would not exercise capture. No remote mutation, event, workflow rerun, release/promotion script, tag, traffic change, credentials/permissions/billing change, or push was performed for this fix. Local integration into v2 was authorized separately at closure. Current private API access and end-to-end success of the corrected CI job remain unverified. Historical reports under `/private/tmp/hatcast-2.7.0-prod-proof/` were read only and are not evidence that this correction has shipped.

Read-only diagnostic query (no People fields, distinct IDs or raw properties):

```sql
SELECT properties.release_id AS release_id, count() AS occurrences,
       min(timestamp) AS first_promoted_at
FROM events WHERE event = 'hatcast_release_promoted'
GROUP BY release_id ORDER BY first_promoted_at DESC LIMIT 10
```

### BUG-038 — Composition smoke tests intermittently require retry
- **ID**: BUG-038
- **Status**: Open — observed during v2.6.3-rc.2 validation; cause not established
- **Severity**: Medium (smoke reliability; no confirmed production defect)
- **Affected area**: `apps/web/e2e/e1/orga-composition.desktop.spec.ts` and `apps/web/e2e/draw-formula-choice.spec.ts`.
- **Observed behavior (2026-10-18)**: [RC2 workflow 39105565455](https://github.com/plamarque/hatcast/actions/runs/39105565455), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: E1-ORG-001–002 first failed waiting for the dialog after publication (15 s); E2E-WD-05 first failed pool preview with HTTP 400 `Rôle inconnu pour cet événement`. Both passed on automatic retry. Final local-profile CI smoke: 92 passed, 2 flaky, 4 skipped; job succeeded. This is not evidence of a clean first-attempt run.
- **Expected behavior**: Composition smoke journeys pass without retry, with deterministic fixture state and assertions aligned to supported behavior.
- **Audit follow-up (2026-10-23)**: [RC workflow 39899222776](https://github.com/plamarque/hatcast/actions/runs/39899222776) again reports E1-ORG-001–002 passing only on retry after a missing publication dialog; final T1 result is 99 passed, 1 flaky, 4 skipped. This recurrence does not establish a production defect or the root cause.
- **Notes/context**: Local preflight passed 94 tests with four skips. The separate deployed-staging E1 gate passed 34 tests with two skips, without reported retries. No tests were disabled or changed for these observations. Investigation and any fix remain separate from the API fixture correction; the production promotion and human staging smoke are not authorized by these green automated jobs.

### BUG-037 — API regression fixtures assume unsynchronized shared memberships
- **ID**: BUG-037
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Medium (API regression suite fails; no production behavior change)
- **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
- **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
- **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
- **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
- **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
- **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.

#### Initial release investigation (before the fixture correction)

- **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
- **Severity:** High for release validation; production impact not established.
- **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
- **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
- **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
- **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
- **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
- **Qualified causes:**
  - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
  - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
  - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
  - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
- **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
- **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
- **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

### BUG-BMAD-002 — Sprint tracker timestamp rejected by BMAD validator

- **Status:** Open
- **Severity:** Low
- **Affected area:** `sprint-status.yaml` and `bmad-sprint-planning` validation.
- **Observed behavior:** On 2026-10-30, `sprint_plan.py validate` returned `valid: false` because `last_updated` is `2026-10-30T00:31:05+01:00` while the validator expects `%m-%d-%Y %H:%M`.
- **Expected behavior:** The tracker produced by the supported controller and its validator agree on the timestamp format.
- **Notes/context:** Validation was read-only. The tracker was not edited or regenerated; the source of the format mismatch has not been investigated.

### BUG-BMAD-001 — Sprint controller disagrees with registered ASCII story keys

- **Status:** Open; explicit PO exception for the targeted 11.5 closure only (2026-10-18).
- **Severity:** Low (local tracking tooling).
- **Affected area:** BMad `sprint_plan.py generate --set` and `story-status-sync.py` key compatibility.
- **Observed behavior:** The registered `11-5-observabilite-installation-pwa-posthog` key is rejected by the sprint generator, which derives `11-5-observabilité-installation-pwa-posthog` from the canonical heading. The additive registration controller cannot change statuses.
- **Expected behavior:** Registered story keys can be updated without replacing historical entries or regenerating unrelated tracking state.
- **Notes/context:** The PO explicitly authorized correcting only the existing ASCII 11.5 entry to `done`. The controller itself is unchanged; the exception does not authorize future manual tracker changes.

### BUG-036 — Incomplete organizer analytics at composition boundaries

- **Status:** Fixed in Story 11.4; automated verification and human local smoke passed. Live PostHog delivery remains a post-deployment check.
- **Severity:** Medium (product observability).
- **Affected area:** V2 organizer composition and announcement analytics.
- **Observed behavior:** Direct Équipe bootstrap could omit workspace entry; animated draws could omit a persisted success; closing an announcement after choosing a channel could record an abandonment. Storage denial and cross-account dedupe could also lose or duplicate entries.
- **Expected behavior:** Count actual workspace entries once per event/session, confirmed mutations independently of animation, and dismissal only without a channel choice.
- **Fix:** Shared workspace capture boundary, API-success draw capture, explicit bounded announcement choices, storage fallback/session reset, allow-listed payload projection and caller regression tests. Operator funnels exclude refused outcomes and hold event context constant.

Entries below preserve the original evidence. A `Fixed` status means history,
not active work; items listed in the two sections above remain actionable.

### BUG-POSTHOG-001 — Lifecycle provisioning sends a scalar dashboard filter

- **ID**: BUG-POSTHOG-001
- **Status**: Fixed — regression passed and real CI validation succeeded on 2026-10-18
- **Severity**: Medium (lifecycle dashboard provisioning stops before insights are created)
- **Affected area**: `scripts/v2/posthog-lifecycle-dashboard.mjs`, manual PostHog CI validation.
- **Observed behavior**: CI run `39099092816`, attempt 2, reached PostHog but `GET /insights/?dashboards=<id>` returned HTTP 500.
- **Expected behavior**: List the owned dashboard's insights using the API's JSON-encoded array parameter.
- **Cause**: Official PostHog Insights code JSON-decodes `dashboards` and iterates dashboard IDs; a scalar number is not iterable.
- **Fix**: Send URL-encoded `[dashboard_id]` and assert that exact decoded array in the provisioning regression.
- **Notes/context**: No deployment or release-promotion event was sent. The temporary GitHub production branch exception was removed after the failed run. The dashboard itself may have been created before the list failure; the next attempt finds it by its ownership marker.
- **Verification**: Corrected commit `83bf536b`, CI run `39099343937`: all six owned insights computed successfully; lifecycle dashboard `1032942`. The temporary branch exception was removed after success and the original `v*` tag-only environment policy was verified restored.

### BUG-035 — Organiser view does not restore the selected participant's availability checks
- **ID**: BUG-035
- **Status**: Open — reported from replay; not reproduced by the focused regression test on the current checkout
- **Severity**: Medium (an organiser can mistake an already-recorded response for an unanswered one)
- **Affected area**: V2 event-detail **Dispos** tab, `EventDisposTab` / `AvailabilityPoll` subject switch.
- **Observed behavior**: An organiser opens **Dispos**, selects another participant, and their already-recorded availability checks appear unloaded.
- **Expected behavior**: Switching the subject must immediately render the selected participant's persisted status and every selected role; it must not inherit the previous participant's state or show an empty response.
- **Code evidence / current hypothesis**: The current path carries `SummaryParticipant.status` and `roleKeys` from the availability summary into `AvailabilityPoll`; `isRoleChecked()` derives each check from that selected subject. The regression now drives the organizer subject selector to a participant with two saved roles and asserts both are checked, an unsaved role remains unchecked, and neither self nor proxy availability API is written. It passes on the current checkout. No root cause is established; the replay may involve production data, a different deployed revision, or another interaction sequence.
- **Repro to complete**: Repeat the focused scenario against the replay's deployed revision and original event data. Capture the event id, participant id, stored response, and screen/replay timestamp if it fails.

### BUG-034 — Availability comments are persisted but unavailable to organisers outside the selected poll subject
- **ID**: BUG-034
- **Status**: Open — code-backed; no production replay reproduction claimed
- **Severity**: Medium (information entered by a participant cannot inform composition)
- **Affected area**: V2 availability summary, **Dispos** tab and composition workspace.
- **Observed behavior**: A participant can save an availability comment, but an organiser cannot see it while composing the team. In **Dispos**, it is only displayed in the editable/read-only comment field for the single participant selected in the subject picker; opening a candidate/name or filtering a member does not surface it.
- **Expected behavior**: An organiser can consult a participant's saved availability comment from the availability and composition decision paths, without editing that response.
- **Cause**: The API persists and returns `SummaryParticipant.comment`, and the Dispos subject poll binds it to the selected person's textarea. No candidate list, availability pool, composition slot/picker, or participant filter renders this field.
- **Verification**: `apps/web` focused `event-dispos-tab` + `availability-poll` tests: 34/34 passed on 2026-10-17. This verifies the existing poll behavior, not the missing organiser presentation.

### BUG-033 — Une adhésion active peut manquer du roster de saison

- **ID**: BUG-033
- **Status**: Fixed locally — targeted verification passed; production data repair pending explicit approval
- **Severity**: High (le membre peut ne plus voir les spectacles auxquels son adhésion de troupe lui donne accès)
- **Affected area**: V2 membership lifecycle and season participant synchronization (`TroupeMembershipService`, CSV member import).
- **Observed behavior**: Un membre ajouté par l'administration, importé par CSV, ou rejoignant une troupe ouverte pouvait avoir une adhésion `ACTIVE` sans ligne `season_participants`. Les projections Accueil / agenda s'appuient sur cette ligne et pouvaient donc n'afficher que les spectacles d'une autre troupe, par exemple la troupe démo.
- **Expected behavior**: Toute création ou réactivation d'adhésion membre active synchronise le roster de toutes les saisons de la troupe. Les retraits CSV inactivent aussi ces participations sans écraser un retrait explicite par l'administration de saison.
- **Cause**: Les chemins de création d'adhésion directe, d'import CSV et de self-join ne déclenchaient pas tous `SeasonParticipantMembershipSync`; seule une partie des réactivations était synchronisée.
- **Fix**: Le correctif appelle la synchronisation centrale après chaque création/réactivation concernée et couvre les transitions CSV active/inactive ainsi que self-join. Un ré-ajout administratif ou une ligne CSV inchangée guérit aussi une participation manquante, sans réactiver un retrait explicite de saison.
- **Notes/context**: Le code empêche une nouvelle dérive. Les adhésions créées avant son déploiement nécessitent un diagnostic de production en lecture seule puis une autorisation explicite avant toute réparation des données existantes.

### BUG-032 — Équipe mobile : le rôle masque les noms

- **ID**: BUG-032
- **Status**: Fixed (2026-10-14)
- **Severity**: Medium (la composition reste visible, mais les personnes assignées ne sont plus identifiables sur un téléphone étroit)
- **Affected area**: V2 `apps/web` — onglet Équipe, lignes de créneaux de composition.
- **Observed behavior**: À largeur mobile, la colonne fixe du rôle et son libellé occupaient assez de place pour tronquer, voire masquer visuellement, le nom de la personne assignée.
- **Expected behavior**: À `≤ 480 px`, chaque rôle reste identifiable par son emoji, tandis que le nom de la personne conserve l'espace horizontal prioritaire. Les libellés complets restent affichés au-delà de ce breakpoint.
- **Fix**: La colonne de rôle passe de `7.5rem` à `2.75rem` sur mobile, et le chip Équipe n'affiche que son emoji ; les actions et la grille existantes sont inchangées.
- **Notes/context**: Signalé avec la capture de l'onglet Équipe sur iPhone. Le contrôle de pool interactif conserve son `aria-label` complet.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Observed behavior**: Sur « Spectacle Long format Microphone », Nicolas a indiqué avoir voulu retirer uniquement le rôle Bénévole. Après avoir ouvert « Format et besoins », le bouton de pied de modale `Annuler` a persisté tous les effectifs à zéro ; l'onglet Équipe ne projette alors plus aucun créneau requis, bien que les affectations stockées existent encore. Un incident analogue a été signalé le 2026-10-12 pour « Apérock café ».
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

### BUG-030 — Seed login via MagicDNS is rejected by offline CORS

- **ID**: BUG-030
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: Offline local development — `SecurityConfig`, `application-offline.yml`
- **Observed behavior**: A seed member connecting from a phone through `https://<machine>.ts.net:4200` receives the generic 403 message « Ce compte n’est pas autorisé à accéder à HatCast », although the same token succeeds without an `Origin` header.
- **Cause**: The Angular proxy forwards the MagicDNS `Origin`; the offline CORS configuration allowed only localhost origins, so Spring rejected the request before seed authentication.
- **Fix**: Offline configuration now permits the scoped MagicDNS development origin pattern `https://*.ts.net:4200`.

### BUG-029 — Agenda performance fixture has too few future events
- **ID**: BUG-029
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Low (blocks a complete local API regression run, not runtime behavior)
- **Affected area**: `UserAgendaPerformanceIntegrationTest` seeded agenda fixture.
- **Observed behavior**: On 2026-10-12, `./gradlew test` fails before the performance assertion because the fixture exposes 19 upcoming events while the test requires at least 20.
- **Expected behavior**: The test fixture remains date-independent and supplies the documented minimum of 20 future events.
- **Repro**: Run `./gradlew test` in `services/api`; `UserAgendaPerformanceIntegrationTest` fails with `content.length=19`.
- **Notes/context**: Found while verifying CN-1. CN-1 targeted API/domain tests pass; this failure is unrelated to the reconciliation contract.
- **Follow-up evidence (2026-10-18)**: The fixed calendar exposes only 18 upcoming events. Replaced the shared seed dependency with a dedicated troupe, season, 24 published shows relative to execution time, 24 roster participants, 576 availability rows and 72 required composition slots. The existing >=20 result assertion and p95 <=500 ms threshold remain unchanged and pass in the targeted run and complete 1189-test regression (zero failures, five unchanged skips).
- **Review follow-up**: Warmup now checks returned fixture IDs, actual available status, composed/pending versus collecting projections. This exposed and corrected the linked member's fixture availability subject (`user_id`, not `season_participant_id`), while guest responses retain participant subjects. Final standalone performance test and complete regression pass with these assertions.

### BUG-028 — Mobile troupe hub season chart stacks month columns vertically
- **ID**: BUG-028
- **Status**: Open — BMAD diagnosis and corrective spec ready for approval
- **Severity**: Medium (collective season overview is not usable on narrow mobile viewports)
- **Affected area**: V2 `troupe-hub` season mini-chart (`/troupes/:slug`).
- **Observed behavior**: On a narrow Android viewport, the mini-chart shown for La Malice renders month columns one below another. The chart becomes taller than the viewport and visually continues behind the fixed member navigation.
- **Expected behavior**: Months form a horizontal timeline inside the season-card chart; event blocks for each month stack vertically, and any extra width scrolls horizontally inside the chart. The final chart CTA must remain reachable above the member navigation.
- **Cause**: `troupe-hub.html` renders `.member-profile__chart-month` elements directly in the chart container, omitting `.member-profile__chart-timeline` and `.member-profile__chart-months`. The shared chart SCSS applies its horizontal flex layout only to the omitted months wrapper.
- **Repro**: On staging, sign in to a member account and open `/troupes/la-malice` on a narrow Android viewport with at least three past events in the selected season.
- **Notes/context**: The fixed bottom navigation is not established as causal: `member-shell.scss` already reserves its height plus safe-area. The corrective mobile E2E will verify CTA reachability before any shell/navigation change is considered. UX spec `ux-design-hub-mini-chart-17-44.md` MC10 requires horizontal in-card scrolling.

### BUG-027 — Review controller dirties its own checkout
- **ID**: BUG-027
- **Status**: Fixed locally — regression coverage added; review pending
- **Severity**: High (blocks recording a delivery decision)
- **Affected area**: `scripts/v2/github_review_decision_controller.py`.
- **Observed behavior**: Running the controller can create `scripts/v2/__pycache__/` while it imports its validator. Its own clean-`v2` precondition then fails, and it emits only the generic `review controller unavailable` result before recording any GitHub decision.
- **Expected behavior**: The controller must leave the checkout unchanged while it snapshots and validates a PR; a clean checkout must remain eligible for a decision.
- **Cause**: Python bytecode writing was enabled before importing `validate_pr_preflight`.
- **Repro**: From a clean `v2` checkout, run the controller `record` command for an open eligible PR.
- **Notes/context**: The regression test copies the controller into its checked Git fixture and asserts both that no `__pycache__` is created and that `git status --porcelain` stays empty.

### BUG-026 — Human smoke handoff times out while Angular is compiling
- **ID**: BUG-026
- **Status**: Fixed locally — hermetic handoff coverage passed; live smoke rerun pending
- **Severity**: High (blocks the required human smoke handoff)
- **Affected area**: `scripts/v2/story-human-smoke-handoff.sh` startup wait and diagnostics.
- **Observed behavior**: The handoff records no usable URL because its endpoint wait ends before the Angular development server is ready on a cold start. The owned API can already be healthy on 8080 while `ng serve` is still compiling. The controller redirects the owned `start-dev.sh` output to `/dev/null`, leaving no startup reason in the handoff result.
- **Expected behavior**: The handoff waits for the bounded normal cold-start window, distinguishes an in-progress front build from a failed process, and retains a redacted diagnostic reference when startup fails.
- **Repro**: From a ready 21.4 unit with free 8080/4200, run `story-human-smoke-handoff.sh start --guide docs/v2/smoke/21-4-login-page.json`. In the observed run, 8080 was listening while the handoff had already failed and the Angular endpoint was still unavailable.
- **Notes/context**: The owned smoke group was stopped cleanly; no unrelated process was stopped. The handoff now allows a bounded 180-second cold-start window (maximum 300 seconds when overridden). Three older `start-dev.sh` processes in temporary test fixtures were observed separately and were left untouched.

### BUG-025 — Mes Stats defaults to a prior active season
- **ID**: BUG-025
- **Status**: Fixed locally — targeted verification passed; review pending
- **Severity**: High
- **Affected area**: V2 member season glance API and the “Mes Stats” page default scope.
- **Observed behavior**: With multiple active eligible seasons and no explicit season filter, “Mes Stats” can render the previous season by default. When the API resolves any default season, the page leaves its filter signals unset, so it displays “Toutes les…” rather than the actual displayed scope.
- **Expected behavior**: The default scope is the newest active eligible season and the filter visibly identifies that returned troupe and season; an explicit season filter remains authoritative.
- **Cause**: `MemberSeasonGlanceService.selectPrimarySeason` uses `maxWith` with descending start-date and update-date comparators. Under `maxWith`, that ordering selects the older date when candidates have the same active state. `MemberSeasonGlance` does not hydrate its unset filter signals from the API's `resolvedSeasonId` and `troupeId`.
- **Repro**: A member participates in active seasons beginning 2025-09-01 and 2026-09-01, then opens `/membre/{userSlug}` without a season query parameter.
- **Notes/context**: The client correctly leaves an unset default to server-side resolution. The correction retains one-season aggregation and access checks, hydrates the existing filter from the returned scope, and is covered by focused backend (4 tests) and web (8 tests) suites.

### BUG-022 — Aperçu des relances : éligibilité email sans préférence
- **ID**: BUG-022
- **Status**: Fixed (2026-09-17)
- **Severity**: Medium
- **Affected area**: `ShareRecipientsService.buildResponse`, GET `share-recipients` et compteurs du POST `share-recipients/notify`.
- **Observed behavior**: `channels.email.eligible` dépend uniquement de la présence d'une adresse participant. La préférence email de la catégorie `AVAILABILITY_REQUEST` n'est pas consultée dans cet aperçu, alors que le dispatcher vérifie les préférences pour les utilisateurs liés. `notifiableCount` peut donc inclure des personnes qui ont désactivé ce canal ; le POST reprend ce nombre comme `notifiedCount`, sans preuve de livraison.
- **Expected behavior**: Un aperçu destiné à confirmer un envoi doit refléter les règles effectives de sélection et de canal ; distinguer demande acceptée et livraison constatée.
- **Notes/context**: Corrigé par la relance avec confirmation : l’aperçu et le POST utilisent désormais le compte lié, ses préférences de disponibilité et les canaux réellement disponibles. Les changements entre aperçu et confirmation produisent un conflit sans envoi.

### BUG-023 — Home can retain a stale badge after saved response
- **ID**: BUG-023
- **Status**: Open — found during BUG-024 review; outside volunteer-rule scope
- **Severity**: Medium
- **Affected area**: V2 `member-home-todo.ts` availability/participation actions.
- **Observed behavior**: Code review shows `openAvailability` and `openParticipation` discard the returned updated item and only reload inbox. If that refresh fails after a successful save, `fetchInbox` retains the previously loaded card.
- **Expected behavior**: Keep the successful saved result visible even if the subsequent inbox refresh fails.
- **Evidence**: `member-home-todo.ts:309-314` and its `fetchInbox` loaded-error path. This behavior exists in the incorporated BUG-021 dependency before the volunteer correction; no live production reproduction claimed.

### BUG-024 — Available participants can opt out of volunteer availability
- **ID**: BUG-024
- **Status**: Fixed locally — verification recorded; pending human smoke and integration
- **Severity**: Medium
- **Affected area**: V2 availability dialog/form, availability poll, shared role rules and self/proxy availability API.
- **Observed behavior**: The tested dialog starts an available draft without selected roles. Selecting player adds volunteer and displays a player-specific explanatory paragraph. Volunteer can then be unchecked and saved. Other roles do not trigger the rule. The screenshot matches the checkbox dialog in the BUG-021 worktree, not the current integration baseline.
- **Expected behavior**: User requests volunteer to be selected and non-removable as soon as availability is selected, with all other roles optional and volunteer-only availability allowed. Explain the rule beside the volunteer control with touch/keyboard-accessible help, replacing the player-specific paragraph. User confirmed on 2026-09-17: apply this rule only when volunteer is offered by the event; never add it to events that exclude it.
- **Cause**: `AvailabilityForm` and `AvailabilityPoll` retain explicit volunteer opt-out state. Both TypeScript and Kotlin normalizers only add volunteer for player when volunteer slots are positive; the API accepts `applyVolunteerRule=false`. This implements the former PRD FR16 opt-out contract, which the user now requests to replace.
- **Repro**: Open own availability for an event offering player and volunteer → select Dispo → select player → uncheck volunteer → save.
- **Notes/context**: Preserve BUG-021 checkbox/unified-save changes at commit `531256812b212a3145085236302169b857daf924`. Historical empty-role availability has wildcard candidacy semantics; no bulk migration or silent read-time narrowing is authorized. Correction adds mandatory offered volunteer to available writes and explicit drafts; verification recorded in the BUG-024 implementation report.

### BUG-021 — Agenda : rôles sélectionnés peu lisibles et sauvegarde distincte
- **ID**: BUG-021
- **Status**: Correctif implémenté et vérifié (API 29/29, E2E 10/10), revue et validation humaine restantes — cause de l’affectation DJ non établie
- **Severity**: Medium
- **Affected area**: V2 `AvailabilityDialog`, `AvailabilityForm`, `RoleToggleChipSet` ; agendas personnel et saison.
- **Observed behavior**: Retour transmis le 2026-09-17 : un membre souhaitait être comédien pour CCAS mais rapporte une affectation DJ. La capture montre la modale « Disponibilité de … » au-dessus de « Mon agenda », avec Comédien·ne rempli et DJ/MC en contour. Le code utilise `[highlighted]` sans coche visible ; les rôles restent un brouillon jusqu'au bouton « Enregistrer rôles et commentaire », placé après le commentaire dans le contenu défilant. « Fermer » ferme sans sauvegarder ce brouillon ni avertir. Le statut Dispo, lui, est enregistré immédiatement.
- **Expected behavior**: Rendre sans ambiguïté les rôles choisis et leur état d'enregistrement ; éviter qu'une fermeture soit comprise comme une validation. Solution autorisée : cases à cocher, validation groupée explicite, annulation du brouillon et rôle requis pour les nouvelles écritures disponibles proposant des rôles.
- **Correction**: Carte/actions partagées Accueil et agenda ; formulaire à brouillon, cases explicites, footer Enregistrer persistant ; annulation sans résultat ; échec conservant le brouillon. API self/proxy : rôle normalisé obligatoire si proposé, avant mutation. Historique vide préservé.
- **Repro initiale**: Mon agenda → badge personnel de disponibilité d'un spectacle pour lequel le membre actif n'est pas dans l'équipe et n'a pas un état de retrait → Dispo → modifier un rôle → Fermer sans utiliser le bouton d'enregistrement. Le clic sur le titre ouvre le détail spectacle, dont l'onglet Dispos utilise un sondage différent avec sauvegarde au clic sur les rôles.
- **Notes/context**: Parcours identifié dans le code local (`user-agenda.ts`, `open-agenda-availability-dialog.ts`, `availability-form.ts`, `availability-dialog.ts`), également appelé par `season-home.ts`. Pas de distinction administrateur/membre pour choisir la modale personnelle. Sur la capture, le rendu indique Comédien·ne sélectionné dans le formulaire, sans preuve de sauvegarde. Ni historique serveur de CCAS ni reproduction en production : aucune inversion DJ/comédien ou cause d'affectation n'est démontrée. Préserver la distinction disponibilité déclarée / affectation dans l'équipe.

- **Human smoke follow-up (2026-09-17)**: Initial single-column square checkboxes required excessive scrolling on a six-role match; errors appeared below the scroll. Changed to the poll's round multiple-selection checkmarks in two columns, with errors replacing the fixed-footer dirty hint. Verified visually in the local Chrome match dialog and with 27 targeted tests; full E2E rerun pending after this visual adjustment.

### BUG-020 — Relance dispos hidden until Dispos tab is opened
- **ID**: BUG-020
- **Status**: Fixed (2026-09-16)
- **Severity**: Medium (orga cannot relance from Infos)
- **Affected area**: Event detail gear menu — `event-detail` `canRelanceDispos` + PERF-03 tab-gated `availability/summary`
- **Observed behavior**: On Infos, gear shows Modifier / Annoncer / Participants / Désactiver. **Relance dispos** appears only after visiting the Dispos tab (summary then loaded).
- **Expected behavior**: Story **6.10c** AC1 — Relance dispos visible on every event-detail tab when published + `canManageComposition` + ≥1 unknown, without requiring a prior Dispos visit.
- **Cause**: PERF-03 gated summary load to Dispos; menu visibility required `disposSummary()`.
- **Fix**: Event page BFF `hasUnknownAvailability` on all tabs (no full summary on Infos); menu uses that flag until a live summary is present.
- **Repro**: Published event with unanswered members → Infos → gear (2026-09-16, Apérock café).

### BUG-019 — Dispos « Pas disponible » : dépliage vide (noms invisibles)
- **ID**: BUG-019
- **Status**: Fixed (2026-09-28, local verification)
- **Severity**: Medium (orga cannot see who is unavailable; roles still expand)
- **Affected area**: Onglet Dispos — `availability-poll` / `availability-poll-row` (spectacle publié, explainability on)
- **Observed behavior**: Tap on the « Pas disponible » gauge, counter, or avatars expands the row but shows no names. Role rows (Arbitre, MC, …) do expand with names.
- **Expected behavior**: Expanding « Pas disponible » lists the unavailable members by name (same as the compact avatar stack).
- **Cause**: Neutral name chips render only when `explainabilityEnabled` is false (`unavailablePoolShowNeutral`). On a published event, explainability is on, and unavailable people have no `chancePercent`, so none of the three pool branches (`chance preview` / `neutral` / `chances unavailable`) match — empty body.
- **Repro**: Event detail → Dispos → tap avatars/gauge on « Pas disponible » (screenshot orga Impro, 2026-09-16).
- **Reported by**: Organizer feedback (Nicolas Nasciet) via Patrice.
- **Verification**: `availability-poll.spec.ts` clicks the unavailable gauge with explainability enabled, confirms the unavailable member is rendered, and confirms no chance-summary request is made; `npm test -- --watch=false --include='src/app/shared/availability/availability-poll.spec.ts'` passes (22 tests).

### LIMIT-009 — Dispos V2 : plus d’entrée « Tous » ni liste des non-répondants
- **ID**: LIMIT-009
- **Status**: Open
- **Severity**: Medium (orga cannot scan the full troupe for one date)
- **Affected area**: Onglet Dispos — `availability-subject-selector` + sondage unifié (story 5.8)
- **Observed behavior**: The Participant pulldown lists individuals only (proxy edit). There is no « Tous ». The poll shows role/unavailable gauges + 3 avatars; members with status `unknown` do not appear. Organizers cannot see who has not answered.
- **Expected behavior (V1)**: Pulldown first option « Tous » (`selectedTeamPlayer.id === 'all'`) rendered `EventRoleGroupingView` — named candidates per role. Combined with the season grid, orgs could also see unanswered cells.
- **Notes**: Story 5.8 D1 removed Moi/Tous in favor of a WhatsApp-style poll (saisie + collective on one screen). Named unavailable list was an explicit non-goal (MVP+). Relance dispos (cog menu) still targets `unknown` but does not display the list. Organizer request 2026-09-16: restore a troupe overview, especially unanswered members.
- **Reported by**: Organizer feedback (Nicolas Nasciet) via Patrice.

### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-017 — Human smoke stop did not reach job-control child groups
- **ID**: BUG-017
- **Status**: Fixed (2026-08-26)
- **Severity**: High (owned development stack could remain running)
- **Affected area**: `scripts/start-dev.sh`; `scripts/v2/story-human-smoke-handoff.sh`
- **Observed behavior**: A human smoke handoff sent `TERM` to its verified
  `start-dev.sh` group, but job control had placed Gradle/API and the web
  process in separate groups. The parent remained waiting and the controller
  refused to record a clean stop.
- **Expected behavior**: The verified smoke group contains the stack it owns,
  and a bounded clean stop records completion only after both reserved ports
  are free.
- **Cause**: `start-dev.sh` enabled job control before parsing the dedicated
  smoke-owner option; the controller also timed out before the API's bounded
  cleanup period could complete.
- **Fix**: Disable job control only for the marked human-smoke invocation,
  extend the bounded stop wait, and safely record a stop that completed after
  the controller's earlier timeout only when the former PID is verifiably gone.
- **Repro**: Start a smoke handoff, then run its `stop` command while the API
  and front development processes are active.

### BUG-016 — Human smoke handoff rejected its declared prior E2E evidence
- **ID**: BUG-016
- **Status**: Fixed (2026-08-26)
- **Severity**: High (delivery smoke blocked)
- **Affected area**: `scripts/v2/story-human-smoke-handoff.sh` evidence gate
- **Observed behavior**: The 21.4 handoff derived an E2E evidence path from its
  own story key, although its Epic contract requires the prior 21.3 attestation.
  It therefore rejected a valid 21.3 evidence file before starting the stack.
- **Expected behavior**: The controller consumes the non-secret prior evidence
  reference declared by the feature spec and verifies that the referenced file
  matches its own evidence `story_key`.
- **Cause**: The initial implementation conflated the smoke-handoff story key
  with the already-validated E2E story key.
- **Fix**: Add `prior_e2e_evidence` to the feature spec; resolve and validate
  that declared repository-relative reference in the controller and its
  hermetic black-box test.
- **Repro**: From `feat/21-4-human-smoke-handoff`, start with the 21.3
  attestation present and no synthetic 21.4 attestation.

### BUG-015 — Targeted E2E attestations lost the selected coverage
- **ID**: BUG-015
- **Status**: Fixed (2026-08-26)
- **Severity**: High (verification evidence integrity)
- **Affected area**: `scripts/v2/story-e2e-evidence.sh` JSON attestation
- **Observed behavior**: A successful targeted execution wrote an empty
  `selection` array and duplicated selected entries under `discovered`.
- **Expected behavior**: The attestation keeps selected coverage separate from
  the complete discovered coverage list.
- **Cause**: The Python JSON writer treated both positional separators as the
  same marker, so it switched to the discovered bucket before reading selection.
- **Fix**: Use distinct `--selected` and `--discovered` markers and assert both
  arrays in the hermetic black-box test.

### LIMIT-008 — BMad Loop local policy does not match versioned Codex integration
- **ID**: LIMIT-008
- **Status**: Open
- **Severity**: Medium (workflow automation unavailable)
- **Affected area**: BMad Loop 0.11.1 local policy, CLI adapter and skill registration
- **Observed behavior**: `bmad-loop validate --project . --json` selects Claude for dev/review/triage, but `claude`, `.claude` hooks and required `.claude/skills` are absent. The repository instead versions Codex hooks. `.bmad-loop/policy.toml` is ignored and absent.
- **Expected behavior**: The operator-selected adapter, hooks and required skills agree, and Loop preflight is green before a real run.
- **Notes/context**: This is the first prerequisite in `_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md`; policy must not contain secrets.

### LIMIT-007 — V2 web unit suite is red and non-deterministic
- **ID**: LIMIT-007
- **Status**: Open
- **Severity**: Medium (development confidence / CI readiness)
- **Affected area**: V2 Angular/Vitest unit suite (`apps/web`)
- **Observed behavior**: On the same commit and dependency lock, three executions of `npm run test -w @hatcast/web -- --watch=false` failed with different aggregates: 20/89, 18/78, then 16/76 failed files/tests. Each run also reported one unhandled error.
- **Expected behavior**: The suite is reproducible on unchanged inputs and eventually green before it becomes a CI gate. A failure must identify either a product regression or the stale test/mock that needs updating.
- **Evidence**: Baseline and remediation order: `_bmad-output/implementation-artifacts/deferred-work.md` (DW-120). The observed clusters include incomplete troupe/season resolver doubles, canonical-route expectations, authentication expectations after BUG-014, and member bootstrap expectations.
- **Notes/context**: Run at `0d77badfb4b49134627c43126db9c96e5e8f76a9` with Node `v22.12.0`, npm `10.9.0`, and root `package-lock.json` SHA-256 `e29ea70abcd8d15866a29ee14c7898948153b1a1702cc9c4dc2c6024c3d5a11d`.

### LIMIT-006 — Fresh Git worktrees need live validation of BMad provisioning
- **ID**: LIMIT-006
- **Status**: Fixed (2026-08-25; live provisioning installed and verified the required skills)
- **Severity**: Medium (development workflow / parallel story isolation)
- **Affected area**: BMad local installation and fresh Git worktrees
- **Observed behavior**: A worktree created from `v2` contains tracked BMad customizations but not ignored local skills, so its runtime could not be verified reproducibly.
- **Expected behavior**: A dedicated story worktree can validate the project-standard manual BMad runtime without copying an untracked developer installation by hand.
- **Cause**: A fresh Git worktree contains the tracked BMad manifest, so BMad 6.11.0 treats it as an existing installation. The bootstrap passed `--action install`, which that state rejects before writing the ignored IDE skill files.
- **Fix**: `scripts/v2/story-worktree-bootstrap.sh` invokes the pinned `bmad-method` installer only in the requested clean unit and verifies the real `bmad-create-story`, `bmad-dev-story`, and `bmad-code-review` skills with `_bmad/scripts/memlog.py` and tracked custom policy. It uses BMad's update flow for a worktree containing the tracked manifest, then restores only the tracked `_bmad/` files so the ignored IDE skills are added without rewriting project-owned runtime configuration. A network download requires explicit `HATCAST_BMAD_ALLOW_NETWORK=1`; tests inject a local provisioner. `story-branch.sh start` preserves the unit for inspection if bootstrap fails. A live approved run on 2026-08-25 passed BMad 6.11.0 verification.

### BUG-014 — Mobile remembered session lost when the browser closes
- **ID**: BUG-014
- **Status**: Fixed (2026-08-24)
- **Severity**: High (authentication — returning mobile user)
- **Affected area**: V2 API Spring Session JDBC / `HATCAST_SESSION`; Angular Google and Identity Platform recovery paths
- **Observed behavior**: `rememberMe=true` selected the 30-day server inactivity interval but emitted a browser-session `HATCAST_SESSION` cookie. Closing a mobile browser removed the only Google GIS authentication handle, so `/v1/auth/me` could not restore the session.
- **Expected behavior**: A remembered Google or Identity Platform connection keeps a secure HttpOnly handle with `Max-Age=30 days` from its issuance or reissue; reopening within that still-valid cookie window restores the session when the sliding 30-day server inactivity limit has not expired. A non-remembered connection keeps its 30-minute server interval and browser-session cookie (no `Max-Age` / `Expires`). Browser session restoration can retain that latter cookie across a restart; HatCast does not add a client-side forced logout merely to override this user-agent behaviour.
- **Cause**: Spring Session cookie configuration had no per-sign-in persistence decision; the front-end boolean is not a credential and Google GIS intentionally does not establish a Firebase client session.
- **Fix**: `HatcastSessionCookieSerializer` uses the existing `rememberMe` request decision to issue `Max-Age=2592000` only for remembered sign-ins, while preserving `HttpOnly`, `SameSite=Lax`, and Cloud `Secure`. Omitted `rememberMe` remains `true`. Identity Platform can still re-exchange an existing Firebase user token after a missing cookie; Google relies on the persistent HatCast cookie and otherwise signs in again. Web Push delivery remains subscription-based, not session-based.
- **Evidence**: API integration and serializer tests assert both Google/IdP intervals and cookie attributes; Angular tests distinguish Google’s no-Firebase fallback from the Identity Platform fallback; `WebPushNotificationSenderTest` verifies the sender reads `user_push_subscriptions` by user ID without an `HttpSession`.

### BUG-013 — Neon Launch bill ~$78/mo while scale-to-zero enabled (Hikari pool)
- **ID**: BUG-013
- **Status**: Fixed (2026-08-04 — OPS-12)
- **Severity**: High (ops cost — ~$78/mo with near-zero product traffic)
- **Affected area**: V2 API Spring datasource / HikariCP defaults ; Neon compute (ADR-0009)
- **Observed behavior**: After leaving Neon Free for Launch, invoice ≈ **$78/month** despite scale-to-zero enabled and little/no app usage. Matches ~1 CU always-on compute (`730 h × $0.106`).
- **Expected behavior**: After ~5 minutes without SQL activity, Neon compute reaches **Idle** and compute charges approach **$0** (Free plan quota or Launch pay-per-use).
- **Cause**: HikariCP defaults (`minimumIdle` = `maximumPoolSize` ≈ 10) recreate connections after Neon suspends, preventing sustained Idle. Secondary wake: Spring Session JDBC cleanup cron default (**every minute**). No explicit `spring.datasource.hikari.*` / session cleanup override in cloud/dev YAML.
- **Fix**: OPS-12 (`ops-12-neon-hikari-scale-to-zero`) — `minimum-idle: 0`, `idle-timeout: 60s`, `connection-timeout: 20s`, `maximum-pool-size: 5`; `management.health.db.enabled: false`; `spring.session.jdbc.cleanup-cron` daily; docs Free CU-h + `--offline`. Verified Idle on Neon branche `local` with JVM still running.
- **Notes/context**: Cold start latency acceptable (PO). Related: [ADR-0009](docs/adr/0009-neon-postgres-environments.md); story `_bmad-output/implementation-artifacts/ops-12-neon-hikari-scale-to-zero.md`.

### BUG-012 — Chance breakdown showed false cross-category penalty (equity_tag line)
- **ID**: BUG-012
- **Status**: Fixed (2026-06-23)
- **Severity**: Medium (UX — misleading explainability; draw weights were already correct)
- **Affected area**: V2 API `ChanceBreakdownCalculator` ; UI `app-chance-breakdown-sheet` (story **19.7** / **19.8**)
- **Observed behavior**: Waterfall displayed « Compté dans un autre type de spectacle » with a negative delta (e.g. −23 pt) when a participant had validated selections in another event category (déplacements, etc.), implying a penalty on principal draws.
- **Expected behavior**: Category compartments isolate history; déplacements must not appear as a breakdown penalty on principal events. Only category-scoped `past_participation` should appear (e.g. « Déjà Comédienne 5 fois »).
- **Cause**: Story **19.8** explainability step simulated unscoped history as a separate waterfall factor (`compartmentExplainabilityPercent`).
- **Fix**: Skip `CategoryCompartmentFactor` in breakdown adjustments; tests + E2E guard. Spec: `_bmad-output/implementation-artifacts/spec-fix-breakdown-no-equity-tag-line.md`.
- **Repro**: Member with déplacement history → open Dispos/Équipe chance breakdown on principal match → previously showed equity_tag line (Patrice, 2026-06-23).

### BUG-010 — Participant add typeahead shows internal option key in name field
- **ID**: BUG-010
- **Status**: Fixed (2026-06-06)
- **Severity**: Medium (UX — confusing display; submit could still work via `selectedSuggestion`)
- **Affected area**: V2 `apps/web` — `add-participant-dialog`, `add-event-participant-dialog` (story **3.8d**)
- **Observed behavior**: After selecting a typeahead suggestion, the **Nom affiché** input displayed the internal mat-option value (e.g. `m:e0000001-0000-4000-8000-000000000018`) instead of the participant display name.
- **Expected behavior**: Input shows the human-readable name (e.g. `Max`) after selection.
- **Cause**: `mat-autocomplete` option `[value]` is the stable suggestion key; input used one-way `[value]` binding without `[displayWith]`.
- **Fix**: `[displayWith]="displaySuggestionLabel"` + `findParticipantAddSuggestionByKey()` lookup.
- **Repro**: Manual recette 3.8d scénario C (2026-06-06, Patrice).

### BUG-011 — Re-adding excluded season member via event typeahead lands in Externes section
- **ID**: BUG-011
- **Status**: Fixed (2026-06-06)
- **Severity**: High (functional — wrong roster section / duplicate event-only row)
- **Affected area**: V2 `apps/web` — `add-event-participant-dialog` ; API `EventParticipantService.createMemberEventParticipant` (unchanged — front now routes correctly)
- **Observed behavior**: After excluding a **troupe member** (e.g. Angie) from a spectacle roster, re-adding via typeahead created an **event-only** participant row (`source: EVENT`) shown under **Externes** instead of re-including the season row under **Membres**.
- **Expected behavior**: Re-add should call `POST …/participants/roster/season/{id}` (`includeSeasonParticipantOnEvent`) — same as reversing an exclusion.
- **Fix**: Event add dialog detects troupe-member selection with an ACTIVE season row and calls `includeSeasonParticipantOnEvent` instead of `createEventParticipant`.
- **Repro**: Manual recette 3.8d scénario H alternative Angie (2026-06-06, Patrice).

### LIMIT-004 — Apérock 2026 seed roster empty until first admin list (auto-sync)
- **ID**: LIMIT-004
- **Status**: Open (by design — `ensureMembershipParticipants`)
- **Severity**: Low (dev recette / test data only)
- **Affected area**: API `SeasonParticipantService.ensureMembershipParticipants` ; seed `V30` (`aperock-2026`, `participant_count: 0`)
- **Observed behavior**: First visit to admin participants (or any code path listing season participants) on **Apérock 2026** auto-creates ACTIVE rows for **all** troupe members. Recette 3.8d scénario C assumed an empty roster — requires removing members first or using **retirer + ré-ajouter** on the main season (story 3.23 option A).
- **Expected behavior**: Documented in recette ; E2E should use fixture reset or explicit single-member removal, not assume persistent empty roster.
- **Notes/context**: Manual recette 3.8d (2026-06-06). Not a product bug for organizers — new seasons intentionally sync membership.

### BUG-008 — Push opt-in does not refresh notification preference toggles until tab revisit
- **ID**: BUG-008
- **Status**: Open
- **Severity**: Low (UX — confusing but not blocking; accepted at E1 cutover 2026-06-04)
- **Affected area**: V2 `apps/web` — Mon compte → onglet **Notifications** ; global push activation vs per-category email/push switches
- **Observed behavior**: After enabling browser push from the account hub, the per-category push toggles in the Notifications tab do not update visually immediately; leaving the tab and returning shows they were enabled automatically in the background.
- **Expected behavior**: Toggles reflect the new push subscription state without requiring navigation away from the tab (or show a brief loading/sync state).
- **Notes/context**: Found during gate **E1** staging screen tour ([e1-cutover-screen-tour-staging-v2.0.0.md](_bmad-output/implementation-artifacts/e1-cutover-screen-tour-staging-v2.0.0.md) §2.4). PO accepted for V2.0.0 cutover; fix can wait until post-M4 unless prioritized.

### BUG-009 — changelog.json user notes wrong on first RC of a semver line
- **ID**: BUG-009
- **Status**: Fixed (2026-06-04)
- **Severity**: High (PWA « Nouveautés » — misleading release notes)
- **Affected area**: `scripts/lib/version-changelog.sh` (`hatcast_staging_changelog_range`), `scripts/generate-changelog.js`, `apps/web/public/changelog.json`
- **Observed behavior**: For `vX.Y.Z-rc.1`, the changelog range fell back to bare `git log HEAD` (~entire repo history) when tag `vX.Y.Z` did not exist yet. OpenAI then produced generic HatCast bullets (Dispos, modales, Saisons…) unrelated to the actual RC delta. `CHANGELOG.md` sections for `2.0.1`–`2.0.2` were similarly inflated.
- **Expected behavior**: Range = previous RC tag or latest **production** tag strictly older than the target version; empty `changes[]` when the diff has no user-facing commits; OpenAI must not invent features absent from the source commit list.
- **Fix**: `hatcast_latest_prod_tag_before` + RC fallback on prior patch line; fail fast instead of `HEAD`; skip OpenAI when no feat/fix commits; stricter prompt; corrected `changelog.json` entries for `2.0.1`–`2.0.3`.

### BUG-007 — Member shell chrome hidden on canonical saison URLs
- **ID**: BUG-007
- **Status**: Fixed (2026-06-03)
- **Severity**: Medium (UX — rail Accueil · Agenda · Stats and mobile account trigger missing)
- **Affected area**: V2 `apps/web` — `member-shell-nav-visibility.ts` after canonical routes `/saison/:troupeSlug/:seasonSlug/…`
- **Observed behavior**: Workspace, event, and admin pages under canonical saison URLs rendered without member navigation chrome (patterns only matched legacy `/saison/:seasonSlug/…`).
- **Expected behavior**: Same chrome as legacy routes; query params (`?view=agenda`, `?tab=equipe`) must not affect path matching.
- **Fix**: Extended `MEMBER_NAV_PATH_PATTERNS` for canonical paths; admin breadcrumb `seasonSlug` param reads `seasonSlug` route param (not legacy `slug`).

### BUG-006 — MIG-3 left migrated spectacles as drafts (availability_opened_at)
- **ID**: BUG-006
- **Status**: Fixed (2026-06-02) — pipeline `load-ac.sql` backfill; manual SQL in preprod-reset-and-migrate.md for existing loads
- **Severity**: High (functional — whole migrated season invisible in member agenda)
- **Affected area**: V1→V2 migration (MIG-2/MIG-3), Story 3.21 event draft gate
- **Observed behavior**: After `migrate-from-v1`, all spectacles of migrated season (e.g. La Malice 2025-2026) showed as **brouillon** (`availabilityOpenedAt` null). Manual publish was slow and could show « Publication impossible » while the server had applied open-availability.
- **Expected behavior**: Migrated V1 events are **published** (open for availability / visible in agendas), matching V1 where events were already public.
- **Cause**: MIG-2 `INSERT INTO events` did not set `availability_opened_at`; Flyway V45 backfill runs only on schema migrate, before data load.
- **Fix**: `buildMigratedEventsOpenAvailabilityBackfillSql` appended to `load-ac.sql` (rejouer migration sur base vierge) ; front `openAvailabilityResilient` for slow open-availability responses.

### BUG-005 — Archived events unreachable for reactivation in season workspace
- **ID**: BUG-005
- **Status**: Fixed (2026-06-01)
- **Severity**: High (functional dead-end for organizers)
- **Affected area**: Season workspace spectacle picker (`filter-event-picker`), agenda filtering (`season-home`), event detail admin menu, API events lifecycle
- **Observed behavior**: After archiving an event, it disappeared from the agenda and did not appear in the spectacle picker when checking « Inactifs » (especially archived past events). There was no API/UI path to unarchive.
- **Expected behavior**: Picker « Inactifs » lists all inactive events (V1 GridBoard matrix); selecting an inactive event shows it in the agenda/history grid; organizers can **Réactiver** from event detail to restore it to the agenda.
- **Fix**: V1 filter matrix in `filterEventPickerVisibleOptions`; pinned fetch of selected out-of-scope events in `season-home`; `POST …/actions/unarchive` + menu **Réactiver** on inactive event detail.

### LIMIT-001 — E2E tests depend on live base state; need fixture re-architecture
- **ID**: LIMIT-001
- **Status**: Open (V1 legacy) / **mitigated for V2** (2026-05-31 — TEST-1)
- **Severity**: Medium (tests are runnable but flaky / high maintenance, not blocking delivery)
- **Affected area**: E2E tests (Playwright); fixtures / test data
- **Observed behavior**: State-dependent E2E tests (e.g. composition status flows, event-details tabs, undo/transition scenarios) are unstable and difficult to pass. They rely heavily on the current state of the database (seasons, events, composition status, casts). Results vary with data; many tests end up skipped or failing depending on the base.
- **Expected behavior** (future): A fixture system that allows injecting known data sets (or using a dedicated test DB/emulator with seeded data) so E2E tests can assert transitions and statuses reliably without depending on live content.
- **Notes/context**: **V2 (2026-05-31):** infra E2E under `apps/web/e2e/` + API profile `e2e` (H2 + seeds + mock Google auth + `POST /v1/e2e/fixtures/story-3-19/reset`) + smoke 3.19 green target in CI (`e2e-smoke.yml`). Legacy V1 Playwright (`legacy/tests/`) still state-dependent — not migrated in this slice. See PLAN **TEST-1**, ARCH.md § Testing V2.

### LIMIT-003 — PWA install blocked on Tailscale dev URL (self-signed TLS)
- **ID**: LIMIT-003
- **Status**: Open (dev environment)
- **Severity**: Low (dev/recette only; production uses trusted certs)
- **Affected area**: PWA install (Story 10.1) — Chrome desktop on `*.ts.net` (Tailscale Serve) with Angular basic-ssl / self-signed certificate
- **Observed behavior**: Chrome shows « Not Secure » despite `https://`. Install banner and address-bar ⊕ icon appear, but clicking **Installer** or the native install control does nothing ( `beforeinstallprompt.prompt()` may hang ).
- **Expected behavior**: On trusted HTTPS (production) or `https://localhost:4200`, native install works. On dev Tailscale URL, native install is skipped (manual steps dialog only); limitation documented for developers in [DEVELOPMENT.md](DEVELOPMENT.md) and this issue — not shown to end users in production.
- **Notes/context**: Discovered 2026-06-02 during Story 10.2 recette. Workaround: test desktop PWA install via `https://localhost:4200` with `--with-push`. Mobile tailnet install may work if cert is accepted on device.

### LIMIT-002 — API integration suite shares one DB; `TroupeMembershipIntegrationTest` flaky in full run
- **ID**: LIMIT-002
- **Status**: Open
- **Severity**: Low (not blocking; targeted runs are green, only the full-suite run is affected)
- **Affected area**: `services/api` Spring integration tests — `@SpringBootTest` with a shared `test` H2 database; `TroupeMembershipIntegrationTest` (platform-admin / join-policy / active-member-count cases).
- **Observed behavior**: `./gradlew test` (full suite) intermittently fails ~1–3 methods in `TroupeMembershipIntegrationTest` with `expected:<200> but was:<409>`. The same suite passes when run in isolation (`--tests '*TroupeMembershipIntegrationTest*'`). Reproduced on `v2` **without** any participant-service changes (baseline 2026-05-31), so it is pre-existing and independent of Story 3.19.
- **Expected behavior**: Deterministic results regardless of execution order — per-test isolation (transactional rollback / `@DirtiesContext` / unique fixtures) so shared seed-troupe state cannot leak between tests.
- **Notes/context**: Likely cross-test state accumulation on the shared seed troupe / reused `sub-platform-members-admin` identity. Discovered 2026-05-31 while validating the re-add reactivation work. Recommend isolating the suite or resetting state between tests before relying on the full-suite gate in CI.

---

## Fixed

### BUG-004 — Season `event_count` drift after bulk import and archive
- **ID**: BUG-004
- **Status**: Fixed
- **Severity**: Medium (misleading hub troupe season cards; data trust)
- **Affected area**: `seasons.event_count` denormalized column; V1→V2 migration SQL load; `EventService.archive`; `app-season-card` / troupe hub
- **Observed behavior**: After troupe/season import (bulk `INSERT INTO events`), season list cards show **0 spectacles** while the season workspace agenda lists events. Creating events via API increments the counter; archiving does not decrement it. Seeds manually run `UPDATE seasons SET event_count = COUNT(*)` but migration pipeline does not.
- **Expected behavior**: `SeasonResponse.eventCount` matches the number of **non-archived** events for the season, including after import and after archive/unarchive lifecycle changes.
- **Fix**: Story **17-30** — `SeasonEventCountSync.recountEvents()` on archive; reconcile SQL appended to MIG-2 `load.sql`; migration pipeline smoke reconciles and asserts `season_event_count`; admin script `scripts/v2/reconcile-season-event-counts.mjs` for imported troupes. Canonical rule: non-archived events only (seeds V6/V26/V34 aligned).
- **Notes/context**: Discovered 2026-05-31 on imported troupe (La Malice). UX spec [ux-design-troupe-hub.md](_bmad-output/planning-artifacts/ux-design-troupe-hub.md) T14.

### BUG-003 — Dispos « Tous » hint « estimés » trompeur après tirage multi-rôles
- **ID**: BUG-003
- **Status**: Fixed
- **Severity**: Medium (recette manuelle 2026-05-31)
- **Affected area**: `CompositionDrawService` ; `AvailabilityService` ; UI `availability-tous-panel`
- **Observed behavior**: Après tirage sur événement passé **AAAA**, hint global **« estimés »** alors que la majorité des % étaient capturés ; candidats multi-rôles (Max mc, Sophie dj) sans snapshot **player**.
- **Expected behavior**: Snapshots à l'**ouverture** du tirage par rôle ; hint **« capturés »** si snapshots existent ; avertissement **par rôle** seulement en cas de repli partiel.
- **Cause**: Snapshots pris par itération de slot avec `crossRoleExcluded` cumulatif (ordre dj→mc→player) ; `chanceSource` global `estimated` dès un candidat sans snapshot.
- **Fix**: `captureOpeningDrawSnapshots()` ; `chanceSource=snapshot` si snapshots ; `hasPartialEstimatedChances` + icône/tooltip par rôle.
- **Notes/context**: Story **6.14** ; re-draw nécessaire sur événements déjà tirés pour régénérer les snapshots.

### BUG-002 — Member glance stats ignore decline-only compositions (V1 parity gap)
- **ID**: BUG-002
- **Status**: Fixed
- **Severity**: Medium (post-migration recette: stats « Mes stats » diverge from V1 prod)
- **Affected area**: V2 API `SeasonGlanceStatsProvider` (`services/api/.../memberprofile/`); member profile UI (`apps/web/.../member-profile/`). **Not** MIG-3 load — declines are in `event_composition_declines`.
- **Observed behavior**: After La Malice migration cycle 1 (2026-05-29), member stats on staging show **0 désistements** and fewer **sélections** than V1 prod for the same user (e.g. Patrice: V1 3 declines / 10 selections vs V2 0 / 8). Disponibilités match. Decline rows exist in migrated SQL (`load-ac.sql`).
- **Expected behavior**: V1 parity (`GridBoard.vue` `getPlayerStats`): a player who was selected then declined counts toward **initial selections** and **désistements** even when they appear only in `cast.declined` (no slot in `cast.roles`). V2 should treat `event_composition_declines` without a matching slot the same way.
- **Cause**: `hasInitialSelection()` only considers `event_composition_slots` and excludes declined slots; decline-only migrated records are ignored. `chartBlockForEvent` may show decline-only as unavailable instead of declined.
- **Fix**: `SeasonGlanceStatsProvider` — `hasDeclineOnlyInitialSelection()` for MIG-3 decline-only rows; `hasSlottedInitialSelection()` kept for effective availability (V1 `countEffectiveAvailability`); `chartBlockForEvent` surfaces decline-only as `declined`. Tests: `SeasonGlanceStatsProviderTest`.
- **Notes/context**: Documented in `_bmad-output/implementation-artifacts/migration-recette-malicie-cycle-1-findings.md` (FINDING-001). Discovered during manual migration recette; **does not fail** automated migrate smoke.

### BUG-DOC-001 — V1 export docs/scripts use `--database=default` instead of `(default)`
- **ID**: BUG-DOC-001
- **Status**: Fixed
- **Severity**: Medium (blocked V1 production exports/migration until the correct id is used)
- **Affected area**: Migration tooling — `docs/v2/migration/preprod-reset-and-migrate.md`, `scripts/v1-export-*.js`, `scripts/replay/loadSeasonData.js`, ADR-0014
- **Observed behavior**: Running V1 export/inspection against production with `--database=default` fails with gRPC `5 NOT_FOUND`. `firebase-admin` `getFirestore(app, 'default')` looks for a database literally named `default`, which does not exist.
- **Expected behavior**: Production Firestore default database id is `(default)`. Commands must pass `--database='(default)'` (or scripts should normalize `default` → `(default)`).
- **Cause**: Docs/scripts conflate the human label "default" with the Firestore default database id `(default)` (already noted correctly in ADR-0002/ADR-0014 context).
- **Fix**: Story **MIG-2** — added `normalizeDatabaseId()` in `scripts/replay/loadSeasonData.js`; `getDb` now maps `default`/empty → `(default)`, so both `--database=default` and `--database='(default)'` work. Runbook `preprod-reset-and-migrate.md` updated (matrix + note).
- **Notes/context**: Discovered 2026-05-29 while profiling La Malice for MIG-3 (ADR-0016); fixed same day with MIG-2.

### UX-001 — Onglet Équipe : mutations lentes sans retour visuel global
- **ID**: UX-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: V2 `apps/web` — `event-equipe-tab`
- **Observed behavior** (recette MVP pilote, 2026-05-25) : mutations composition sans feedback visible global.
- **Expected behavior**: Retour immédiat pendant appels API et rechargements.
- **Fix**: Story **6.11** — overlay onglet pour mutations courantes ; tirage : panneau « Nous préparons le tirage… », animation visible, slots remplis progressivement ; plus de `loadEvent` redondant.
- **Notes/context**: Recette validée 2026-05-27. Clôture story **6.11**.

### UX-002 — Bouton « Déverrouiller » peu identifiable comme action
- **ID**: UX-002
- **Status**: Fixed
- **Severity**: Low
- **Affected area**: V2 `event-equipe-tab`
- **Observed behavior**: Déverrouiller peu distinct de Valider.
- **Expected behavior**: Bouton secondaire Material (`mat-stroked-button`).
- **Fix**: Story **6.11** — `mat-stroked-button` sur Déverrouiller.
- **Notes/context**: Recette validée 2026-05-27.

### PERF-001 — Actions composition (API + rechargements) anormalement lentes en dev
- **ID**: PERF-001
- **Status**: Fixed (accepted residual)
- **Severity**: Medium
- **Affected area**: V2 API composition + front `event-detail`
- **Observed behavior**: Mutations composition ressenties lentes en recette MVP.
- **Expected behavior**: Réduire allers-retours front ; latence API acceptable pour opérations peu fréquentes.
- **Fix**: Story **6.11** — suppression rechargements redondants (`loadEvent`, GET composition post-tirage) ; fast path API mutations (commit `a92d260`). Résiduel ~1 s sur `POST /composition/draw` en dev : **pas de profiling serveur supplémentaire** (décision produit 2026-05-27, tirage non fréquent).
- **Notes/context**: Perçu acceptable après panneau préparation + animation.

### PERF-002 — Lenteur globale pages membre V2 (sur-fetch API)
- **ID**: PERF-002
- **Status**: Open (Vague 1 done — Vague 2 in progress)
- **Severity**: Medium
- **Affected area**: V2 `apps/web` — agenda, season-home, event-detail, member-shell, accueil
- **Observed behavior** (dev local `--with-push`, 2026-06-09): Pages membre ressenties lentes malgré peu de données ; baseline Playwright agenda **5,9 s** / **37** appels `/v1/*` (32× preferences).
- **Post Vague 1** (`.local/perf-profile/web-perf-2026-06-09T19-46-21-738Z.json`, pages prioritaires) : Accueil **1501 ms**, Agenda **1940 ms**, Event Infos **1951 ms**, Dispos **2231 ms**, Équipe **2263 ms** — au-dessus des cibles ; goulots : `me/agenda` ~900 ms, bootstrap event ~10 appels, composition+summary ~1 s Dispos.
- **Expected behavior**: Pages prioritaires ≤ **1,0–1,5 s** ; NFR-P1/P2 ([perf-improvement-plan-v2-wave2.md](_bmad-output/planning-artifacts/perf-improvement-plan-v2-wave2.md)).
- **Fix**: Epic **perf-v2** — Vague 1 **PERF-01…08** done ; Vague 2 **PERF-09…15** (BFF event-detail, API agenda, accueil progressif, lazy dispos).
- **Notes/context**: Script `page.goto` sur-estime vs navigation in-app — PERF-14 prévu.

### LIMIT-002 — Admin back-office pages still use legacy header (chevron back, no breadcrumb)
- **ID**: LIMIT-002
- **Status**: Fixed
- **Severity**: Low (UX inconsistency; navigation works)
- **Affected area**: V2 `apps/web` — admin chrome on `/saison/:slug/admin/participants`, `/troupes/:slug/admin/membres` (and legacy aliases)
- **Observed behavior** (recette post–Story 17.2, 2026-05-25): These screens kept a **chevron back** and **no** `app-context-breadcrumb`.
- **Expected behavior**: Breadcrumb (troupe › saison › … › admin leaf) and **no** redundant back chevron; consistent with member-facing deep screens (ADR 0013).
- **Fix**: Story **17.11** — extended `app-context-breadcrumb` with `leafTitle`, `layout="troupe"`, and event admin link support; refactored `AdminParticipants` and `AdminMembres` headers (breadcrumb + account menu, mobile page title). Event-scoped participant admin: route `/saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants` (**17.16**); dialog removed.
- **Notes/context**: Closed 2026-05-25 with Story 17.11.

### BUG-001 — Unlock composition clears all player confirmation statuses
- **ID**: BUG-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: Composition / Storage
- **Observed behavior**: When an administrator clicks "Déverrouiller" (unlock) on a composition, all players who had confirmed (or declined) are reset to "à confirmer" (pending). The information about who had already confirmed is lost.
- **Expected behavior**: Unlocking should only clear the organizer's lock (`confirmed` / `confirmedByAllPlayers`). Individual player statuses (confirmed, declined, pending) should be preserved so that admins do not lose that information and are not forced to ask everyone to confirm again.
- **Cause**: In [src/services/storage.js](src/services/storage.js), `unconfirmCast` reads current data from the subcollection **`selections`** to preserve `playerStatuses`, but the cast data (including `playerStatuses`) is stored in the **`casts`** subcollection. The read therefore typically returns no or wrong data; `preservedPlayerStatuses` is empty and the update overwrites `playerStatuses` with an empty object.
- **Fix**: In `unconfirmCast`, use `getDocument('seasons', seasonId, 'casts', eventId)` instead of `getDocument('seasons', seasonId, 'selections', eventId)` when reading the current cast to preserve `playerStatuses`. The rest of the logic (copying current `playerStatuses` into the update) already intends to preserve them.
- **Notes/context**: Code comments and variable names in `unconfirmCast` explicitly state the intent to preserve player statuses; this is an implementation bug (wrong collection name), not a deliberate design choice. **Fixed:** Read in `unconfirmCast` was switched from `selections` to `casts` so preserved statuses are applied correctly.

---

## Deferred / Accepted Issues

### LIMIT-005 — Pas de bascule membre → externe après import V1 (ex. Laetitia Landelle)
- **ID**: LIMIT-005
- **Status**: Resolved — story **2.26** + [ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md) (2026-07-12)
- **Severity**: Low (workaround manuel possible ; friction orga)
- **Affected area**: V1→V2 migration (`export:v1-members` / import CSV 2.3) ; admin **Membres** (`edit-troupe-member-dialog`, `add-member-dialog`) ; API `TroupeMembershipService.updateMember` / `TroupeMemberCsvImportService` ; ADR-0021 (carnet `EXTERNE`)
- **Observed behavior** (2026-07-12, Patrice, prod `hatcast.app` — La Malice) : après migration M4, **Laetitia Landelle** apparaissait comme **membre** troupe (import V1). L’organisateur souhaitait la traiter comme **externe** sur la saison passée et la nouvelle saison, mais **aucun parcours UI** ne permettait de basculer un membre existant vers le carnet Externe (LIMIT-005).
- **Resolution (2026-07-12, story 2.26) :** chip rôle **Membres** admin (*Membre* / *Administrateur·ice* / *Externe*) ; conversion bidirectionnelle + **season participation mode** ([ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md)).
- **Cause (historique, by design before 2.26) :**
  - Export V1 `members.csv` : `baselineRole` ∈ `{ MEMBER, TROUPE_ADMIN }` seulement — pas de statut externe V1 ([`scripts/v1/troupeMembersCsv.js`](scripts/v1/troupeMembersCsv.js)).
  - API refuse `MEMBER` → `EXTERNE` via `PATCH` membre et via import CSV membre : *« Utilisez l'ajout Externe pour les entrées carnet. »* ([`TroupeMembershipService.kt`](services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt), [`TroupeMemberCsvImportService.kt`](services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMemberCsvImportService.kt)).
  - UI édition membre : pas de changement de rôle vers Externe ([`edit-troupe-member-dialog.ts`](apps/web/src/app/pages/admin-membres/edit-troupe-member-dialog.ts)).
- **Notes/context** : Investigation 2026-07-12 → [member-externe-conversion-investigation.md](_bmad-output/implementation-artifacts/investigations/member-externe-conversion-investigation.md). **Décision produit :** conversion bidirectionnelle + **mode de participation par saison** ([ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md)). **Livré :** story **2.26** (recette OK 2026-07-12).

### LIMIT-007 — Complément de preuve : attente de test agenda antérieure au chargement parallèle
- **Status**: Open (2026-09-17)
- **Observed behavior**: `user-agenda.spec.ts` attend zéro appel agenda en cas de session invalide, tandis que `ngOnInit` lance session, agenda et préférences dans `Promise.all`. Le test et ce bloc sont identiques au baseline `aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c`. Vérification ciblée sous Node 26 avec `NODE_OPTIONS=--no-experimental-webstorage` : seule cette attente échoue ; le reste des tests pages passe.
- **Scope**: Décider séparément si le bootstrap doit attendre la session ou si le test doit accepter la requête anticipée. Aucun test désactivé dans BUG-021.

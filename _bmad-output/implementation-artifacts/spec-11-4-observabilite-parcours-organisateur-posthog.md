---
title: 'Organizer journey observability'
type: 'feature'
created: '2026-10-17'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '2f2dc3cf31cb7ca0d734fed59bb25fa3e79e503a'
context:
  - 'AGENTS.md'
  - '_bmad-output/implementation-artifacts/11-4-observabilite-parcours-organisateur-posthog.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Product operators cannot distinguish member and organizer journeys in PostHog without risking collection of personal or business content.

**Approach:** Add bounded, event-local role context and semantic workflow captures for composition and availability reminders, while preserving existing FR47 event compatibility.

## Boundaries & Constraints

**Always:** Derive `actor_scope` from loaded permissions only, with precedence `platform_admin`, `troupe_admin`, `season_organizer`, `event_organizer`, `member`. Capture only success or a bounded outcome; retain the existing pseudonymous event, season, troupe, and demo context. Keep a single global People trait, `has_ever_organized: true`, only when it is supported by the PostHog facade. A successful composition publication emits `publish`; in the composition announcement dialog, Copy and WhatsApp emit successful `announce` events with a bounded channel, while closing it emits a refused `announce`. These events describe organizer action, never message delivery or reception.

**Never:** Send participant identifiers, names, role labels, slugs, notification text, free-form messages, availability comments, raw API payloads/errors, email, or avatar data. Do not alter permissions, create PostHog dashboards/insights, change the M4 People-property exception, or add analytics UI.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Workspace loaded | Authorized organizer with loaded composition | One `composition_workspace_opened` per event/session, bounded lifecycle and context | No capture if composition is unavailable or permissions are not loaded |
| Mutation succeeds | Slot, draw, validation, publication, or announcement returns success | One semantic action/outcome capture with allow-listed properties | Failed/refused actions capture only bounded outcome when specified |
| Availability reminder | Notification request succeeds/fails | `availability_reminder_sent` with outcome and recipient count bucket only | Never send recipient IDs or message text |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/core/analytics/fr47-event-names.ts` and `product-analytics.service.ts` -- event constants, typed facade, allow-lists, and session dedupe.
- `apps/web/src/app/core/permissions/organizer-api.service.ts` and `organizer-permissions.ts` -- loaded scope data; do not make a second permissions request.
- `apps/web/src/app/pages/event-detail/event-detail.ts` -- owns event, permissions, composition load, notification-link context, and parent-to-child scope propagation.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` -- authoritative successful composition mutations.
- `apps/web/src/app/shared/share-announce/share-announce-dialog.ts` and `share-announce-open.ts` -- reminder send result and bounded recipient volume.
- `apps/web/src/app/shared/availability/availability-persist.service.ts` and `availability-form.ts` -- existing FR47 availability capture compatibility.
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` -- PostHog EU operator runbook.

## Tasks & Acceptance

**Execution:**
- [x] Analytics contract files -- define `ActorScope`, event schemas, bounded values, property allow-lists, and safe dedupe.
- [x] Event detail and availability files -- enrich existing FR47 events only where the loaded context is available, without extra calls.
- [x] Composition tab -- capture loaded workspace and each successful supported composition operation without participant data.
- [x] Share/announce files -- propagate context to reminder delivery and capture success/failure with recipient buckets.
- [x] Focused specs -- assert precedence, dedupe, allowed properties, forbidden-property absence, and existing event compatibility.
- [x] PostHog runbook -- document event catalogue, precedence, dedupe, filters, and two operator funnels.

**Acceptance Criteria:**
- Given loaded event permissions, when a workflow capture is emitted, then its `actor_scope` is event-local and uses the documented precedence.
- Given an existing FR47 event, when its context is available, then it retains its name and existing properties while adding `actor_scope`.
- Given a captured Story 11.4 event, when inspected, then every property belongs to its typed allow-list and no prohibited content is present.
- Given a product operator, when using PostHog, then the documented filters support the workspace-to-validate and validate-to-announce funnels without an in-app dashboard.

## Implementation Notes

- Existing uncommitted code is retained as the Build starting point by explicit human decision on 2026-10-17.

## Spec Change Log

- 2026-10-18 — PO clarified that Publish makes the composition visible and opens the announcement dialog. Manual announcement telemetry measures button choices (copy/WhatsApp) and dismissal without a choice, never delivery. The slot action also covers successful structural format/slot-count changes without inventing a new operation value.

## Review Triage Log

- `medium / patch` — a direct `equipe` bootstrap stores its composition without passing through `loadComposition`, so no workspace event is captured; capture it from the trusted bootstrap response too.
- `high / intent_gap` — the frozen intent requires a successful announcement event, but the only composition announcement actions are manual copy/WhatsApp and have no server-success boundary; the current reminder-only send path cannot truthfully emit `announce`.
- `high / intent_gap` — the frozen intent requires publication instrumentation, but the current `publish()` API performs validation and opens a manual announcement dialog; no distinct publication-success operation exists to map to `publish`.
- `medium / intent_gap` — format/template saves are successful composition operations, but the frozen allow-list has no semantic `format` action or slot operation for that change; `slot` without an operation is not a coherent contract.
- `medium / patch` — storage-blocked sessions need an in-memory workspace-open dedupe fallback.
- `medium / patch` — reset must also clear workspace-open session keys so a new account in the same tab starts a new analytics session.
- `medium / patch` — optional dialog troupe IDs can create blank context; make the analytics path require it or skip capture.
- `medium / patch` — runtime property rebuilding should also cover enriched FR47 methods, rather than spreading arbitrary caller props.
- `false` — bounded failed/refused composition outcomes are not required by the frozen matrix; it only requires them where specified, namely reminders.
- `medium / patch` — add caller coverage for validated and published workspace lifecycle mapping.
- `medium / patch` — add a picker-assignment caller assertion for the `assign` mutation.
- `medium / patch` — add a poll/persistence caller assertion for `availability_first_submission` actor scope propagation.
- `false` — unloaded permissions cannot pass `canManageComposition()`; the capture is already suppressed until page permissions are set.

## Design Notes

### Final review — 2026-10-18

Four independent review layers completed; every source finding is tracked below. No product decision, deferred item or unresolved high/medium finding remains after these corrections. Edge-case and verification reviewers independently reread the corrected code and confirmed their findings resolved.

| Source | Finding | Verdict and resolution |
|---|---|---|
| blind-hunter | Animated draw success lost on navigation | medium / patched — capture full/fillEmpty on confirmed API success, not animation callback. |
| blind-hunter | Workspace capture while still on Infos | medium / patched — require active Équipe; capture an already-loaded composition on actual entry. |
| blind-hunter | Storage getter can throw before fallback | medium / patched — getter access is inside try; throwing-getter regression test passes. |
| blind-hunter | Reminder bucket uses selected count | medium / patched — use server acceptedCount; test request and accepted count differing. |
| blind-hunter | Refused announcement counted as conversion | medium / patched — successful outcome required in funnel, abandonment measured separately. |
| blind-hunter | Validation funnel ordered inconsistently | medium / patched — middle step now requires editing/draw before composition_validated. |
| blind-hunter | Cross-event funnel correlation missing | medium / patched — document constant event_id and season/troupe filters. |
| blind-hunter | Organizer People trait absent from FR47 events | medium / patched — shared enabled capture boundary sets trait from bounded scope; member/organizer regression test. |
| blind-hunter | Mutation caller coverage incomplete | medium / patched — assertions cover preview, draw, assignment, release, both removal boundaries, restoration, format, slot addition and failed publication. |
| edge-case-hunter | Storage getter denial | medium / patched — same demonstrated storage defect; reviewer confirmed corrected code. |
| edge-case-hunter | Navigation interrupts animated draw telemetry | medium / patched — same demonstrated timing defect; reviewer confirmed corrected code. |
| verification-gap | Animated path lacks exactly-once assertion | medium / patched — test expects one capture before animation completion and still one after. |
| verification-gap | Parent scope bindings untested | medium / patched — page-to-Dispos and Dispos-to-poll/persistence tests cover the actual template bindings. |
| verification-gap | Contaminated context/FR47 payload projection untested | medium / patched — exact four-event payload assertions reject injected extra fields. |
| acceptance-auditor | Successful animated draw omitted | medium / patched — API success is now the capture boundary independently of presentation. |
| acceptance-auditor | Announcement funnel includes abandonment | medium / patched — documented conversion requires succeeded outcome. |

Material 3 checklist: presentation, copy, controls, tokens, layout and accessibility unchanged. The existing standard Material dismiss control only receives an analytics handler; no visual waiver is needed. Live PostHog delivery and human smoke were not run.

Composition mutations and reminders use confirmed API outcomes. Manual composition announcement is explicitly a button-choice metric: `announce/succeeded` with `announcement_channel=copy|whatsapp` records a click, including a failed clipboard attempt; `announce/refused` records a dismissal without a channel choice. Closing after a choice adds no abandonment. Publication is captured on the successful existing validation/publication operation. Notifications sent automatically by the server are separate.

### Resolution of the preceding review

All preceding patch findings are addressed in the 2026-10-18 corrected diff. The three historical intent gaps are resolved: Publish and announcement follow the PO clarification above; structural format/slot-count changes are `slot` mutations without an operation because the approved operation vocabulary describes assignment/removal/restoration only. No unresolved product decision remains.

## Verification

**Commands:**
- `npm run test -w @hatcast/web -- --watch=false --include='src/app/core/analytics/**/*.spec.ts'` -- expected: all relevant analytics specs pass.
- `npm run build -w @hatcast/web` -- expected: production build succeeds.

**Verified 2026-10-18:**
- `NODE_OPTIONS=--localstorage-file=/private/tmp/hatcast-posthog-test-localstorage npm run test -w @hatcast/web -- --watch=false --include='src/app/core/analytics/**/*.spec.ts' --include='src/app/pages/event-detail/event-equipe-tab.spec.ts' --include='src/app/pages/event-detail/event-detail.spec.ts' --include='src/app/shared/share-announce/*.spec.ts' --include='src/app/shared/availability/*.spec.ts'` — 17 files, 266 tests passed.
- `npm run build -w @hatcast/web` — passed; existing Sass deprecation and unrelated stylesheet budget warnings remain.
- `git diff --check` — passed.
- Story branch assertion and runtime inspection — valid dedicated worktree, `READINESS=ready`.
- Four independent review layers completed; all retained findings patched. Edge and verification layers confirmed their corrections by rereading the final code.
- Human smoke: Patrice completed the organizer journey without error on 2026-10-18 and explicitly requested local closure. The offline full stack was verified (health UP, unauthenticated auth 401, front 200) before handoff. Live PostHog ingestion and deployment remain outside this evidence.

### Review Findings

- [x] [Review][Patch] Enforce Story 11.4 event property allow-lists at runtime [apps/web/src/app/core/analytics/product-analytics.service.ts:208]
- [x] [Review][Patch] Omit actor_scope until event permissions are loaded [apps/web/src/app/pages/event-detail/event-detail.ts:642]
- [x] [Review][Patch] Capture successful animated draws and declined-participant restoration [apps/web/src/app/pages/event-detail/event-equipe-tab.ts:1115]
- [x] [Review][Patch] Record refused and rejected availability reminders with bounded outcomes [apps/web/src/app/shared/share-announce/share-announce-dialog.ts:214]
- [x] [Review][Patch] Enrich availability_first_submission with loaded event-local actor scope [apps/web/src/app/shared/availability/availability-persist.service.ts:142]
- [x] [Review][Patch] Set the permitted has_ever_organized People trait when the facade supports it [apps/web/src/app/core/analytics/product-analytics.service.ts:49]
- [x] [Review][Patch] Assert analytics at event-detail, Équipe, and reminder caller boundaries [apps/web/src/app/pages/event-detail/event-detail.spec.ts:310]

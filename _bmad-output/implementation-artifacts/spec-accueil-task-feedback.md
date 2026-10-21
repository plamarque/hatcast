---
title: 'Stable Accueil task feedback'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent approved in the preceding Sally and party-mode discussion">

## Intent

**Problem:** Accueil inserts its all-caught-up banner after revalidating an empty inbox cache, moving the next event and shortcuts. A permanently visible banner also occupies space after its confirmation has been read.

**Approach:** During the first cached-empty verification, show a token-based skeleton in the exact banner box. On successful verification with no actions, show “Tout est à jour” briefly, fade it, then smoothly collapse its space. Remember presentation across route navigation for the authenticated user. A subsequent unchanged empty result must not recreate either the confirmation or its skeleton. Observing new tasks rearms confirmation; tasks always take precedence over any dismissal timer. Refresh inbox on every Accueil entry. Cached data and failed requests must never count as fresh confirmation. Keep the useful no-upcoming-event explanation and “Mes troupes” destination visible; do not automatically remove that empty state. Respect reduced motion and announce confirmations without moving focus. Use existing inbox APIs, cache and ghost-card completion flow; do not change task rules, add polling, or change notifications.

</frozen-after-approval>

## Implementation Notes

- Route assessment: no unresolved intent gaps and no irreversible actions. Small, cohesive frontend change scoped to inbox presentation state, the existing Accueil component/template/styles, focused tests and documentation. No backend/API contract, dependency, remote or deployment changes.
- Baseline: `3a0a08482a4e9d1961f9b2469123ffc874a685c5`, local v2 explicitly selected by the user; isolated worktree branch `feat/accueil-task-feedback`. Preserve unrelated ISSUES.md/work changes in the integration checkout. PR #14 is context, not merged or modified remotely.
- Reuse `MeInboxApiService.bindSessionUser` / `invalidateCache` to reset presentation scope; `MemberInboxBadgeService.refresh` observes successful snapshots; Accueil distinguishes visual cache application from confirmed responses. No transition is inferred for changes never observed by inbox.
- Presentation timing: readable hold 3000 ms, fade 220 ms, collapse 280 ms. Clear timers on new data, errors and destruction; reduced motion removes animated phases. These are reversible implementation parameters for the approved interaction.
- Acceptance Criteria — Material 3 (UI): Given revalidation of a first empty cache, when waiting for the server, then a visible skeleton uses the eventual banner dimensions and M3 tokens. Given an already presented unchanged zero-task state, when returning, then neither banner nor its skeleton is recreated. Given new tasks, when returned by the API, then they display and any prior dismissal is canceled. Given those tasks become empty, when confirmed, then confirmation is shown and can fade/collapse again. Given an error, when cache is empty, then no success is announced. Given no upcoming event, when empty is confirmed, then the useful empty state and Mes troupes persist. Given reduced motion, when dismissing, then no fade/collapse animation runs. Given navigation or account changes, when entering, then request freshness and user isolation remain intact.
- Verification plan: focused Angular component/inbox tests, production build, mocked browser checks in Chromium/WebKit/Firefox where installed; validate geometry, transitions, route return, errors, keyboard/ARIA and reduced motion. Do not claim device or human verification from emulation.

- Implementation completed: `InboxFeedbackService` holds presentation eligibility and a scope revision. Existing API invalidation resets it; badge refresh observes tasks. API and badge discard responses from a previous scope. Accueil separates cached display from confirmed data, sequences hold/fade/collapse, cancels timers on all interruption phases/destruction, and reconciles completion ghosts only on confirmed data. No route polling, dependency change, or backend mutation was added.
- Material 3 self-check: existing Material icons/buttons and system theme tokens retained; no new custom interactive controls, palette, navigation chrome, or UI waiver. Mobile 375×766 and desktop 1280×900 verified; hidden skeleton is inert and excluded from accessibility, persistent Mes troupes is keyboard-focusable, confirmation uses a polite live region, reduced-motion dismissal is unit-tested.
- Final verification: 62 Accueil/inbox tests passed; auth 19/19 and shell 15/15 passed in separate runs; production build passed, with pre-existing Sass deprecations and component-style budget warnings in account-placeholder and troupe-hub. `git diff --check` passed.
- An expanded combined unit run initially reported two shell navigation-persistence failures while workers shared the same NODE_OPTIONS localStorage file. Both passed in the isolated 15-test shell run with its own storage file; auth passed 19/19 separately. No tests were disabled. A shared-storage harness interaction is suspected, not established as an application defect.
- Browser verification: production bundle, controlled `/v1` responses, 12/12 Chromium and WebKit checks across mobile/desktop. Checks assert equal skeleton/banner height and next-card position (<1 px difference), intermediate collapse height, no residual space, unchanged-return suppression, new tasks, subsequent confirmation, error fallback and persistent keyboard navigation. The persisted `chromium-accueil-feedback` project runs `e2e/accueil-feedback.spec.ts`. Service workers are blocked only in these API-mocked browser tests; installed-PWA lifecycle and real devices were not tested.
- Firefox could not launch: local `sandbox_extension_issue_file_to_process` error and `RenderCompositorSWGL failed mapping default framebuffer`, followed by a bounded launch timeout. No Firefox validation claimed. No human smoke, full-stack E2E suite, production CLS claim, or live PostHog observation. The intentional timed collapse remains a separate layout movement to assess in human review.
- Only the active one-shot Blind Hunter review layer ran; no configured review layer was omitted. Follow-up inspection confirmed all six findings addressed and found no concrete remaining regression. Commit, local integration, push and deployment remain separate authorization boundaries; changes are left reviewable and uncommitted in the dedicated worktree.

## Review Triage Log

| Finding | Verdict and evidence | Resolution |
| --- | --- | --- |
| Previous-account response can rearm feedback | medium: an awaited inbox result can arrive after logout/account switch. | Patched: API/cache and badge/feedback updates check scope revision; deferred-response test proves old response is ignored. |
| Bootstrap can resume after page destruction | low: leaving while ensureReady awaits could start an abandoned inbox fetch. | Patched: destruction guard immediately after bootstrap; test proves no inbox request starts. |
| DOM tests do not establish geometry | medium: class assertions alone cannot prove layout stability or collapse. | Patched verification: mobile/desktop Chromium/WebKit compare exact boxes, observe intermediate height and assert final zero residual space. |
| Cached ghost reconciliation lacked coverage | medium: applying a cache must not consume acted-action records or start success timing. | Patched verification: delayed cache/failure preserves records; confirmed removal shows ghost before the full confirmation hold. |
| Interruption tested only during fade | medium: shown/collapsing timers are also reachable. | Patched verification: parameterized interruption at 0/3000/3220 ms; tasks survive old deadlines and next confirmation receives full hold. |
| Persistent empty-state navigation/focus lacked coverage | medium: separate persistent branch must retain its action through pending/failing revalidation. | Patched verification: unit and Chromium/WebKit route-return tests verify visible/focusable Mes troupes outside inert/aria-hidden. |

## Human walkthrough and embedded-browser check — 2026-10-21

- User reported completing the manual recipe and accepting the behavior.
- The complete worktree stack runs through `scripts/start-dev.sh --offline`: frontend HTTPS responds 200, API health is UP, and unauthenticated proxied auth responds 401.
- Subsequent agent verification used only the existing embedded browser tab against this real local stack. Starting state: Cabaret Halloween was Pas dispo with no tasks. Agenda-to-Accueil return did not replay the banner. Saving Non renseigné from Agenda produced one visible availability task and the navigation badge. Saving Pas dispo again removed the task, replayed the visible confirmation, then automatically removed its region and moved the next-event card upward. The initial Pas dispo state was restored. No application issue was observed on this path.
- The skeleton and exact fade timing were not independently measured in this embedded-browser pass; their controlled browser checks remain the earlier evidence. This is not real-device or installed-PWA validation.
- Screenshots saved locally: `/private/tmp/hatcast-accueil-tache-verifiee.png`, `/private/tmp/hatcast-accueil-confirmation-verifiee.png`, `/private/tmp/hatcast-accueil-final-verifie.png`. Stack left running for the user. Human acceptance does not perform commit, integration, push or deployment.

## Local closure preparation — 2026-10-22

Patrice explicitly authorized the feature commit, local integration into v2 and cleanup of this dedicated worktree/branch, excluding push and deployment. This is a freeform one-shot evolution: its spec status is already done and it has no canonical epic/story sprint key, so no sprint-status entry is created or manually changed. The final feature checkout rerun passed all 62 Accueil/inbox tests. Prior human acceptance, real local-stack embedded-browser verification and production-build evidence remain applicable. The navigation evolution now present on v2 must be preserved during integration.

---
title: 'Opt in to Advent test mode'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: '891f1b9e215b59b43189fc050675f983ed682b28'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Authorized testers always see test controls and receive test-specific behavior, preventing them from experiencing the normal member journey.

**Approach:** Give authorized testers an initially off, accessible toggle at the left of the red Advent app bar. When on, show a compact, full-width contextual test toolbar directly below the bar, in normal flow so it pushes content down. Keep it visible throughout Advent navigation until switched off.

## Boundaries & Constraints

**Always:** Off follows normal member time, answer and ranking rules even for authorized testers; on uses the existing isolated-development test rules. Server authorization remains authoritative. Keep the toggle available to an authorized tester even if the normal journey is unavailable outside its dates. Switching reloads current data safely without losing the test-mode choice during navigation. Match the validated compact, single-line mobile design with meaningful accessible names, pressed state and touch targets. Preserve priority reveals, session isolation, privacy and Advent-only styling. Use the normal server clock when off, including any existing development offset; no browser clock. Show only applicable test actions for the current screen; preserve existing confirmation for global reset and the explanation that personal reset erases an answer.

**Never:** Grant control by trusting a client flag alone, enable tests in production, erase responses or reset the shared game during mode switching, leak pending points in member mode, modify global HatCast styling, deploy or push.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior |
|---|---|---|
| Tester enters | Initial load | Toggle off; no toolbar; normal member rules. |
| Tester enables | Any Advent screen including unavailable state | Toolbar opens below red bar; isolated test behavior enabled. |
| Navigation | Mode on | Toolbar remains shown and controls reflect the current screen. |
| Tester disables | Mode on | Toolbar disappears and member projection is reloaded; no reset. |
| Normal member or production | No test entitlement | No toggle or test toolbar; server rejects test privileges. |
| In-flight work | Mode change requested during mutation | Avoid changing mode until mutation is settled; stale responses cannot overwrite the new projection. |
| Calendar | Mode on | Personal day reset available only when applicable, respecting existing guards. |
| Ranking | Mode off/on | Apply member-revealed / isolated-test current scores respectively. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `.scss` — separate capability from chosen mode; reload safely on switching, retain choice across internal navigation, scope toolbar and use existing Material controls and date/replay/reset guards. Session headers currently carry the simulated date.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — `canControl` establishes entitlement but currently also selects ranking and answer behavior; distinguish a validated active-mode request from entitlement for state, confirm, reconcile, reserve and ranking. Keep command authorization and date validation server-side.
- `AdventMemberGame` and `AdventMemberClock` — reuse real and simulated clock and existing game rules; do not mutate shared time or invent a separate game.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts`, Advent API tests — cover toggling, unavailable startup, contextual controls, authorization, pending-score privacy and race boundaries.
- Advent `DESIGN.md`, `EXPERIENCE.md`, AD-4 in `ARCHITECTURE-SPINE.md`, `ARCH.md` as appropriate — record the approved opt-in behavior and preserve AD-7.

## Tasks & Acceptance

**Execution:**
- [ ] Implement explicit authorized test-mode selection across client and server, preserving default member semantics and safe async transitions.
- [ ] Implement the approved single-line responsive toolbar, contextual actions and accessible toggle using existing Advent and Material components.
- [ ] Add focused API, component and browser coverage for the matrix, including ordinary members and production authorization boundaries.
- [ ] Update relevant Advent UX and architecture contracts for the approved behavior.

**Acceptance Criteria:**
- Given an authorized tester, when entering Advent, then test mode is off and the server applies the same time, answer and score visibility rules as for a regular member.
- Given an authorized tester, when activating test mode, then the toolbar appears below the header on each Advent screen and only applicable test actions are available.
- Given a tester switching mode, when pending operations settle, then displayed data reflects the newly selected mode and no data reset occurs.
- Given a normal member or production request, when test mode is requested, then test privileges and simulated dates remain unavailable.
- Given mobile widths, keyboard and enlarged text, when operating the toolbar, then actions remain legible, reachable and labeled, with no effect on other HatCast surfaces (M3-1–M3-5, AD-7).

## Implementation Notes

The toolbar uses a compact contextual row with a visible confirmation before personal answer deletion. The button stays available when the member journey is outside the Advent dates. A mode change reloads the projection and restores calendar or ranking when no priority reveal supersedes it.

## Spec Change Log

## Review Triage Log

- Medium, patched: personal deletion needed a visible explanation on touch devices; confirmation now precedes deletion.
- Medium, patched: narrow toolbars could hide actions in horizontal overflow; compact labels and sizing avoid scrolling at 320 px.
- Medium, patched: an identity change during mode switching could restore a screen for the wrong identity; restoration now checks identity and generation.
- Medium, patched: coverage lacked mode changes from calendar and ranking and reveal priority; focused Angular tests added.
- Low, unverified: keyboard focus may need explicit restoration when the toggle is disabled while loading; automated tests exercise keyboard activation but do not audit focus after the reload.
- Unverified: a client timeout does not establish that a server mutation has completed; existing response reconciliation remains relevant. No new server completion guarantee is claimed.
- Coverage limitations: production verified-operator request and delayed old-mode reads have no new dedicated browser test; existing API authorization and component epoch protections remain in place.

## Verification

Run targeted Advent API and Angular tests, production build, and relevant browser scenarios. Inspect test off/on, calendar and ranking at phone widths, keyboard focus and isolation from HatCast. Provide a usable full-stack preview if requested and report any unverified accessibility checks.

Results: 97 focused Angular tests passed; the full `*Advent*` API suite passed; five Chromium member scenarios passed using fictional mocked API responses, including 320 px. Production build passed with existing Sass deprecation and CSS warning budgets. Full screen-reader, contrast, zoom for the new toolbar and HatCast style-isolation checks were not performed. The worktree tracker controller reported `STORY_KEY_UNKNOWN`; sprint tracking was not changed.

Human validation: Patrice tested the full offline stack on a phone and confirmed the mode works on 2026-10-31. Standalone spec is the agreed tracking record; no sprint key exists.

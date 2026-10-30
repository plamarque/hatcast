---
title: 'Show five upcoming home events with page scrolling'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
feature_branch: feat/home-viewport-upcoming
baseline_commit: 4319478f6e73b16b116103d6ebb3399f6f812701
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Removing home quick access frees space, but home still displays only one upcoming show.

**Approach:** Show a stable preview of up to five chronological upcoming shows with natural whole-page scrolling, followed by a Material link labelled “Voir plus” to `/agenda`, which may be below the fold. Keep the existing cards unchanged, without title truncation, density changes or an internal scrolling area. Keep required actions first and preserve event navigation, participation controls and existing empty/no-membership states. Request ten upcoming shows through the existing unfiltered agenda API; render the first five, retain the inbox first-event fallback on request failure, and reconcile a successful empty result. The user explicitly approved Sally's proposal on 2026-10-22, superseding viewport-based card selection.

</frozen-after-approval>

## Implementation Notes

### Current implementation — approved five-card preview

- `member-home-todo.ts` requests ten unfiltered upcoming shows and presents the first five. Usable cached inbox data can start agenda expansion independently of inbox revalidation. The latest-response generation and destruction guard remain active.
- The template uses unchanged shared agenda cards in a normal flex column. The whole document scrolls; no viewport-fitting directive, clipping, inert cards or nested scroller remains. “Voir plus” follows the preview and uses a 48px Material target.
- Preserve an existing preview when refreshing the same first event, apply successful edits to their existing keyed cards immediately, and reconcile with the subsequent agenda response. This avoids removing a later focused card during save/revalidation.
- Current automated checks cover a five-of-ten preview, shorter lists, cached expansion on inbox failure, later-card availability/participation save, response races, empty/failure fallback and unchanged inbox feedback. Browser checks cover mobile/desktop page scroll, stable count after resize, keyboard access, required-action priority and the agenda destination.

### Historical viewport investigation and verification — superseded

The following earlier notes are retained as history only. Their instructions to implement viewport fitting and their test counts do not describe the active implementation. See the current implementation above and the final verification below.

- User approved deleting `work/`, then explicitly approved a dedicated worktree from local `v2`, which contains the recent navigation work and is ten commits ahead of `origin/v2`. This freeform change does not introduce an epic tracker key. No integration, push or deployment is authorized; commits require separate authorization under the user's established workflow.
- Code map: `pages/member-home-todo/member-home-todo.{ts,html,scss,spec.ts}` owns the inbox and first card; `core/agenda/user-agenda-api.service.ts` already provides paginated upcoming shows; `shared/participation/agenda-event-card` preserves card actions; `layout/member-shell/member-shell.scss` reserves mobile navigation/safe-area space.
- Add a focused viewport-fitting directive that measures the real cards, keeps overflow cards inert and outside normal layout, and disposes observers/listeners on destruction. Measure from the page's unscrolled origin so scrolling does not reveal additional rows.
- Load the first agenda page of 10 shows after confirmed inbox refresh, retaining the initial inbox card while loading or on failure. Discard outdated requests and ignore responses after destruction. No API requests on viewport resize.
- Update the functional specification and home UX section for the explicitly requested behavior.
- Verify targeted Angular home/directive tests, production build, and mocked browser scenarios for small/tall/desktop viewports, resizing, unequal card heights, priority actions, hidden-card keyboard exclusion and the agenda link. Material 3: shared cards, token spacing, Material link with 48px target; no new colors or navigation chrome.

- Implemented the shared-card viewport directive, chronological agenda expansion, empty-response reconciliation, latest-request guard and Material agenda link. All card actions remain shared with the agenda.
- Verified: 48 targeted Angular tests; 12 mocked Chromium scenarios across 375×766 and 1280×900, larger resizes and 350px-high screens; production build successful with existing Sass/style-budget warnings. The participation-cell integration fixture was updated for the new agenda request; that real-API suite was not run in this change.
- Browser captures inspected: 3 complete cards on the test phone and 5 on desktop, with a maximal fitting prefix, no hidden-card scroll overflow and “Voir plus” above navigation. Browser tests also cover focus recovery after shrink, inert hidden cards, API failure, required-action priority and caught-up collapse. These are automated local checks with controlled data, not human full-stack smoke.
- Material 3 checklist: existing shared cards and typography, Material link, 48px target, existing tokens, mobile-first geometry and keyboard behavior; no new waiver. Dialog, tabs and navigation-chrome checklist items are outside this change.
- Review: one context-free Blind Hunter; all six findings patched or completed as described below. No deferred work. No commit, integration, push or deployment performed.

## Review Triage Log

### Historical viewport review — superseded

- medium / patch: A focused card could become hidden on shrink. Transfer focus to the agenda link before setting inert; browser regression passes.
- medium / patch: Very tall absolute overflow cards could enlarge page scrolling. Clip the list's overflow with a small focus-outline allowance; a deliberately enormous hidden title no longer increases document height.
- medium / patch: Successful empty agenda data previously retained a stale inbox card. Reconcile both upcoming cards and nextEvent to the authoritative successful result; no-upcoming regression passes. Request failures still retain the inbox fallback.
- low / patch: Browser coverage did not prove the maximal fitting prefix. Assert every visible card ends before the footer and the next complete card cannot fit, including reserved shell/page spacing.
- low / patch: Geometry unit coverage did not exercise observer wiring. Add observer/event scheduling, coalescing and destruction checks; callbacks cannot reconnect observers after destruction.
- low / patch: Add short-screen scenarios preserving exactly one complete accessible card, priority actions and the reachable agenda link through ordinary scrolling.

- User follow-up: reduced the home agenda request from 50 to 10 shows; the displayed count still follows viewport geometry and the final link opens the full agenda. Updated the existing request-parameter regression.

- Screenshot follow-up: persisted measured geometry with the two viewport captures. On the 375×766 fixture the three card wrappers measure 115.58, 209.48 and 115.58px. The footer ends at 607.03px and mobile navigation starts at 694px, leaving 86.97px; adding the next card requires 122.17px plus the 12px list gap. Even reclaiming all bottom spacing cannot fit the fourth complete card. Both focused browser tests pass. Production behavior was unchanged for this diagnostic.


## Approved UX revision — natural scrolling

- User explicitly approved the proposal to show up to five unchanged cards with natural page scrolling. This replaces the earlier viewport-fitting design and its observer/focus/hidden-card machinery.
- Removed the temporary viewport-fitting directive and its tests/styles entirely. No card is hidden/inert based on geometry. Kept shared agenda cards, the ten-item API request, latest-response protection and the final Material agenda link.
- Acceptance: fewer than five candidates show all; five or more show exactly the first five; resize and priority actions do not change that count; long titles remain unchanged; keyboard and normal page scroll reach the fifth card and “Voir plus”; empty/error handling stays intact.
- Earlier viewport-specific measurements and verification above describe the superseded iteration. New targeted tests and screenshots validate the approved stable preview.


### Current scrolling review

- medium / patch: Refreshing the inbox collapsed later cards. Preserve the existing keyed preview for the same first event, apply the edited item immediately and verify the fourth card survives both pending and completed refreshes for availability and participation.
- medium / patch: A failed inbox revalidation prevented cached home expansion. Start the independently protected agenda load from usable cached data too; regression added.
- low / patch: The interaction fixture could lie outside the ten-result home page. Its dedicated route now reads the fixture independently through the established fifty-result fixture lookup before isolating it. The production home request remains ten.
- low / patch: A nonnegative document scroll assertion did not prove absence of nesting. Assert positive document scrolling where needed, zero ancestor scroll offsets and no constrained ancestor with auto/scroll overflow.
- low / patch: Later-card participation controls lacked save coverage. Add output-binding regressions for both controls on the fourth card, checking the event identity, immediate saved state and refreshed state without card recreation.
- low / patch: Spec instructions and evidence mixed the superseded viewport design with the approved design. Separate current implementation/verification from explicitly historical viewport notes while preserving the earlier review history.


## Final verification — approved natural-scroll version

- 50 targeted Angular home tests passed after the final review fixes.
- 12 mocked Chromium scenarios passed on phone/desktop, including 350px-high screens, stable five-card previews after resize, positive document scrolling without nested scrollers, preserved titles, keyboard access, agenda navigation, cached revalidation and inbox feedback.
- Production build passed with existing Sass/style-budget warnings; `git diff --check` passed.
- Inspected the refreshed phone/desktop screenshots. The fifth card and final agenda link are reachable through normal page scrolling. No viewport-based directive or hidden-card machinery remains.
- Material 3 checklist: existing shared cards retained unchanged, Material text link and 48px target retained, existing tokens, mobile-first and keyboard behavior verified; no new waiver. No changes to dialog/tab/chrome patterns.
- All six findings from the current review were addressed; no deferred findings. The separate real-API participation integration fixture was adapted but not executed; these results do not claim human smoke or production evidence.
- Work remains local on `feat/home-viewport-upcoming`; no commit, integration, push or deployment performed. The isolated browser-check server is stopped after verification.

- Spacing follow-up: reduced root bottom padding from 32px to 8px and removed the upcoming section's trailing 24px margin. The final link now ends 8px above the mobile navigation when scrolled to the bottom, with the shell navigation/safe-area reservation retained. Both targeted phone/desktop browser scenarios pass; the phone screenshot was visually inspected. No card layout changes.

## Authorized closure and RC2 integration — 2026-10-23

- Patrice confirmed the earlier human recipe was accepted and explicitly requested committing/integrating this worktree into v2, updating the 2.7.0 release notes and preparing RC2 with staging evidence showing five shows on mobile and desktop.
- This is a one-shot evolution with spec status already done and no canonical epic/story sprint key. No new sprint key or manual sprint-status edit applies.
- Rechecked the dedicated worktree: only this feature's nine files are changed; all 50 targeted home tests pass. Preserve the separate BUG-047 observation in the integration checkout outside the release commits.
- Previously superseded viewport-fitting notes remain historical. The approved behavior is five unchanged cards, natural page scrolling, and the final Material agenda link.

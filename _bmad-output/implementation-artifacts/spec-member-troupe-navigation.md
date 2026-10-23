---
title: 'Compact member troupe navigation'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '1c307c8528a7e98233931a5491314dd1bd767e76'
context:
  - '{project-root}/_bmad-output/specs/spec-member-troupe-navigation/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-member-troupe-navigation/navigation-contract.md'
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent approved in chat on 2026-10-22">

## Intent

**Problem:** Home shortcuts distract from required actions. Their destinations must remain easy to reach.

**Approach:** Replace Ma troupe navigation with a Material three-entry dynamic menu, remove home quick access, and consolidate troupe-page navigation. User explicitly approved the existing scoped spec and requested implementation in a dedicated worktree followed by mobile human smoke preparation. The context documents are the complete acceptance contract.

## Boundaries & Constraints

**Always:** Visible menu labels are troupe name, season title, Statistiques; same resolved troupe-season pair. Browser memory wins, then newest membership.createdAt; season memory is per-troupe then latest active startDate. Preserve rights, personal Mes stats, home/agenda aggregation, canonical URLs. Keep existing stored context on transient errors; no menu-open side effects. Follow all twelve scoped acceptance scenarios and M3 checklist.

**Never:** Extra menu rows/selectors, cross-troupe season targets, backend model changes, skipped tests, commits, integration, push, deploy, unrelated cleanup. Work only in this worktree on codex/member-troupe-navigation. The original checkout contains separate uncommitted spec work and unrelated work/; preserve it. No sprint key exists for this freeform unit; do not alter sprint-status.yaml.

## I/O & Edge-Case Matrix

| Scenario | Input/state | Expected behavior | Error handling |
|---|---|---|---|
| Remembered | Accessible troupe A and active season A1 | Three matching short labels and exact links | None |
| Cross-troupe | Global season B1, chosen troupe A | Use A memory/fallback only | Never borrow B1 |
| Missing/stale | No valid remembered troupe/season | Membership creation and active-season date fallbacks, deterministic ties | Reject definitive 403/404 targets |
| Empty | No troupe or no active season | Three-row disabled/fallback contract | Existing list remains reachable |
| Transient | API network/5xx | Disable unresolved links, retain names/memory, retry on reopening | Accessible concise feedback |
| Restricted | Guest EVENTS_ONLY/AGENDA_ONLY | Do not enable unauthorized season/statistics destination | Existing access enforced |
| Sparse dashboard | No upcoming and fewer than three past shows | Independent permitted season/statistics links | Data failure does not revoke rights |

</frozen-after-approval>

## Code Map

Paths below are relative to repository root.
- `apps/web/src/app/shared/member-nav/member-nav.{ts,html,scss,spec.ts}`: rail and bottom bar; use MatMenu, preserve other entries. Watch refresh effect and avoid signal-triggered fetch loops.
- `apps/web/src/app/core/navigation/`: add shared pure selection helpers and a read-only menu resolver service. Reuse last-visited storage, canonical routes. Capture HTTP status rather than conflating absence/network failure.
- `apps/web/src/app/core/troupes/troupe-api.service.ts`: listMyTroupes and resolveTroupeContextBySlug confirm member/guest/admin access without side effects. Avoid TroupeContext.resolveTroupeBySlug and resolveSeasonInTroupe for menu preparation because they conflate errors/select context.
- `apps/web/src/app/core/seasons/season-api.service.ts`: paginated listSeasons, getSeasonBySlug and guestSeasonWorkspaceMode. Load all pages for deterministic selection; restrict workspace/statistics rights.
- `apps/web/src/app/pages/troupe-hub/troupe-hub.{ts,html,scss,spec.ts}`: pickDefaultSeason, loadSeasons, selectSeason, content-dependent CTA conditions. Share season picking rules; remember successfully resolved default season. Move other-troupes link into hero area.
- `apps/web/src/app/pages/member-home-todo/member-home-todo.{ts,html,scss,spec.ts}`: remove quick access section and obsolete component logic/styles only; retain inbox handling and demo join.
- `SPEC.md`, `ISSUES.md`: copied scoped intent and LIMIT-010; update factual state locally. Spec folder remains the approved input; do not rewrite its intent.

## Tasks & Acceptance

**Execution:**
- [x] `core/navigation/` under `apps/web/src/app/` -- implement read-only shared resolution and edge-case unit tests.
- [x] `apps/web/src/app/shared/member-nav/` -- implement accessible rail/mobile menu and interaction tests.
- [x] `apps/web/src/app/pages/troupe-hub/` -- independent links, other-troupe placement, coherent memory and regression tests.
- [x] `apps/web/src/app/pages/member-home-todo/` -- remove quick links and adapt regressions preserving required content.
- [x] `SPEC.md`, `ISSUES.md` -- align implementation documentation and LIMIT-010; retain scoped input and unrelated records.

**Acceptance Criteria:**
- Given each matrix state, when opening the menu, then executed tests prove the specified pair, labels, links, disabled/error handling and no selection/storage mutations.
- Given mobile and desktop layouts, when opening Ma troupe, then the menu contains exactly three entries and normal Material focus/dismissal works.
- Given a resolved troupe season, when chart/teaser is absent or content loading fails, then permitted navigation remains visible near its selector.
- Given any home state, when rendering, then no quick-access section remains and inbox/event actions retain their tested behavior.
- Given navigation between season views and troupe pages, when revisiting the menu, then the context follows successful memories while Mes stats remains unchanged.

## Implementation Notes

- Planning: one cohesive navigation goal, no unresolved intent gap or irreversible action. User-approved scoped spec is the approval checkpoint; implementation explicitly authorized. Root baseline clean before copying only this chat's SPEC.md, ISSUES.md and scoped spec into the new worktree.
- Runtime: existing accueil-task-feedback stack owns 4200/8080; user explicitly authorized replacing it for this recipe. Parent will handle runtime and browser smoke. Do not stop processes from the implementation subagent.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
|---|---|---|
| Blind 1: menu active style missing | medium | Class is styled only on rail items; exact-view menu links need scoped visible styling. Patch. |
| Blind 2: missing menu aria-current | low | Confirmed no current-state attributes on menu entries, including troupe. Direct template correction; patch. |
| Blind 3: mobile role mixture | false | Runtime at 390 px renders native button with role=tab, aria-selected and MatTabNav handling, not a role=button child. Menu opens normally; keep tested existing nav pattern. |
| Blind 4: async initial focus | false | Material focuses menu panel when all entries are disabled; after resolution ArrowDown/Up provides standard keyboard access. No trapped or unreachable item established. Verify delayed keyboard flow in runtime. |
| Blind 5: prior-account names on transient failure | low | Root snapshot can retain disabled old names after account switch plus failed resolution; no unauthorized link remains enabled. Unusual combined condition; rejected under low-complexity rule rather than adding session subscriptions. |
| Blind 6: legacy menu/hub mismatch | medium | Global-only season memory affects menu but not hub default; shared slugs cannot prove global identity. Delete optional legacy-global reuse; per-troupe memory then date fallback in both. Patch. |
| Blind 7: multi-troupe browser journey absent | medium | Existing automated browser suite does not cover full A/B/return sequence. Patch verification through isolated H2 browser smoke and documented human scenario; no production data. |
| Blind 8: desktop browser coverage absent | low | Unit overlay tests cover both surfaces; parent authenticated real desktop smoke opens menu, troupe and stats on same stack. Gap resolved with runtime evidence, no additional test framework. |
| Blind 9: long names and geometry unverified | medium | Short fixtures alone cannot prove wrapping/viewport fit. Patch verification with long local fixture names and 390/320 px DOM geometry and screenshots. |
| Blind 10: scoped spec historical status | false | Scoped document explicitly dated specification input; root and execution artifact distinguish implementation and pending human acceptance. Do not rewrite approved input based on status wording. |
| Edge 1: legacy default changes on troupe visit | medium | Same confirmed optional global-memory inconsistency as Blind 6; one shared deletion/test patch. |
| Gap 1: hub pagination regression absent | medium | Hub's loader is separate from resolver and its fixtures return one page. Add two-page hub test including links and memory. Patch. |
| Gap 2: mono-troupe test checks removed footer | low | Query is now vacuous; replace with actual relocated-link negative assertion. Patch. |
| Gap other: recette-3-25 removed shortcut | medium | Existing E2E still queries todo-shortcut-season. Adapt to real menu path preserving invited access. Patch. |


## Verification

- Run targeted Angular resolver/menu/home/hub tests without skips; use NODE_OPTIONS=--localstorage-file=/private/tmp/hatcast-member-navigation-storage if required.
- Run production Angular build and git diff --check. Add/update meaningful browser coverage for changed menu navigation when feasible, using isolated seeds rather than production data.
- Parent must verify full-stack local health, API proxy, mobile viewport, Tailscale URL and provide a human recipe. Human acceptance remains pending; no closure or integration.

- Implementation verification: 119/119 scoped Angular tests passed, no skips; production build and diff check passed. Browser regressions updated/discovery-checked, not yet executed. Node test localStorage is serialized via /private/tmp/member-navigation-vitest.mjs.


## Final verification and handoff

- Final execution: 128/128 scoped Angular tests across four files passed with no skips; final production build passed after production-code patches; subsequent keyboard-only tests needed no build repeat. Logs: `/private/tmp/member-navigation-final-tests.log`, `/private/tmp/member-navigation-final-build.log`.
- Review patches are complete: scoped active/current menu indicators, removal of ambiguous legacy-global season reuse, hub pagination and relocated-link regressions, and invited-season browser scenario updated. Each of 14 original findings is triaged above. No unresolved confirmed release blocker; rare disabled-name carryover on account switch plus outage was rejected as low-impact under the workflow rule.
- Keyboard regression follow-up: 29 member-nav tests pass, including delayed all-disabled resolution, ArrowDown and Escape focus restoration on both surfaces. IAB's simulated key path observed BODY after closing; the component keyboard tests prove normal Material restoration. Physical-device acceptance remains pending; do not claim the IAB focus observation explained.
- Real-stack parent checks: authenticated seed login through Tailscale; desktop menu/troupe/stats; mobile 390 and 320 px three-entry menu, zero-show hub links, per-troupe season switching and A/B/A memory; long menu labels stay within the viewport and rows measure 48 px.
- Mobile guide: `member-troupe-navigation-mobile-recette.md`. Full-stack owner is this worktree; original accueil-task-feedback stack was stopped only after explicit user permission. API PID 21752 and front PID 21816 were verified at preparation. Launcher tool session 88925 is left running. Tailscale Serve was reused, not reconfigured.
- M3 self-check: standard Material menu/buttons; French short copy and full accessible names; tokens for active colors; mobile wrapping and touch geometry checked; no intentional waiver. Dialog-specific checklist is not applicable to this navigation change. Human physical-phone acceptance and full E1/e2e-profile suite remain unverified.
- No commit: preserved the user's separate authorization boundary for version-control recording and integration. No sprint-status change (freeform unit), integration, push, deployment or other-worktree cleanup. `done` here means build execution completed, not human acceptance or local story closure.


## Human acceptance and local closure — 2026-10-22

Patrice confirmed: "c’est validé. on peut clôturer". This supersedes the pending-human-acceptance statements in the historical handoff above. The freeform build unit is complete; there is no canonical sprint story key or controller entry to mutate. LIMIT-010 is closed locally.

The authorized closure records the scoped changes, integrates them into local `v2`, verifies the integration checkout, and retires only the dedicated recipe stack, worktree and local branch. The 128 targeted tests and production build passed before acceptance; the full E1/e2e-profile suite remains unexecuted. No push, deployment or remote cleanup is part of this closure.

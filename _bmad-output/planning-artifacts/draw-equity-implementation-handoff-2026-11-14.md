# Draw equity — implementation handoff (draft)

**Basis:** [approved change proposal](sprint-change-proposal-2026-11-14-draw-equity.md). **Status:** preparation; warning presentation and unresolved decisions require review before implementation. No story IDs or tracker statuses are assigned by this document.

## Existing story reconciliation

Story 6.20's artifact declares `review`, with implementation tasks checked, whereas the sprint tracker says `backlog`. Commit `7d6e3d8b` (2026-06-05, `feat(composition): Add consecutive-show warning UX`) contains the story artifact and is an ancestor of the current `v2` checkout; the existing API and UI are present there. The artifact records API/front tests and a build, but these historical records are not a current rerun or proof of acceptance. Do not overwrite either status; inspect the controller and any additional lifecycle evidence before reconciliation. Prefer a new successor story for the new cross-category requirement so the historic 6.20 contract stays traceable. Existing AC-04 expressly forbids cross-category warnings: the approved change supersedes that behavior only after normative updates.

## Delivery slices

### A — Explain replay adjustment (BUG-117)

**Goal:** avoid telling a candidate that they participated in the preceding show when the displayed positive change results from other candidates' weights.

**Acceptance:** a non-replaying candidate has a truthful explanation of the pool effect; an actual replay has a truthful role/show explanation; no nonzero adjustment is falsely attributed when the mode is off; existing custom formulas and positive and negative changes remain supported. Test the breakdown independently and exercise the accessible mobile sheet. Preserve the documented approximate probability contract.

**Dependencies:** independent of the troupe's Aperock policy. Update normative/UX text only if it describes incorrect behavior.

### B — Warnings for successive shows

**Goal:** give organizers non-blocking information after manual assignment or draw, for every role independently.

**Acceptance:** compare an assignee's same role against the immediate previous chronologically validated show across all categories, including CCAS and travel, and independently against the immediate previous chronologically validated show in the current category, in the same season. A person being MC previously does not generate a player warning. If both tests match, convey both scopes; preserve title/date details. When events differ, show each relevant predecessor. Clear or replace an assignee and recompute; retain organizer-only access; never alter draw weights, prevent publication or reveal drafts. Preserve non-archived/declined filtering and deterministic equal-date tie-break pending explicit change.

**Warning UI direction — confirmed by Patrice:** retain the existing `Joue deux fois de suite` warning for either situation. Enrich its opened detail with the applicable checks and their relevant previous shows, dates and category; make clear whether each refers to all shows or the same category. If both scopes refer to one event, communicate both meanings without unnecessarily repeating its details. Keep the existing slot actions and non-blocking behavior. Adapt the existing accessible tap/keyboard detail as needed; validate the exact content and rendering on mobile without assuming a hover-only tooltip works on phones. Respect `docs/v2/technical/FRONTEND_UI.md` and the story template's M3 acceptance criteria.

**Dependencies:** reconcile story 6.20 and update its successor's domain and UX contracts; preview before implementation.

### C — History groups and standard formula

**Goal:** for Nicolas's troupe, group ordinary and Aperock histories, retain CCAS and travel as independent histories, keep event categories, and use only the standard formula for ordinary/Aperock events.

**Acceptance:** same-role history aggregates ordinary and Aperock mutually; CCAS and travel affect only their own groups; MC and player never cross-count; validated/archived/declined behavior and season isolation are preserved unless changed by an approved decision; other troupes and unrelated categories keep their established defaults. Dispos, breakdown, eligible pool and actual draw resolve the same approved history and formula; preserve stats by event category, draw snapshots and old compositions. No permanent exclusion factor or weight is introduced for consecutive shows.

**Design gate:** propose a troupe-scoped, maintainable grouping representation and backwards-compatible defaults; identify category and legacy-travel data with read-only checks. Do not infer CCAS by title. Confirm handling of other categories and future validated shows against the approved proposal; do not silently change existing operational semantics. Provide test cases for the above and for separate troupe/season overrides. Configuration application to production requires a separate target-specific authorization and reversible before/after plan.

## Sequencing and review

1. Reconcile 6.20 evidence and tracker using the project controller; do not alter state while ambiguous.
2. Resolve the history-group design and produce explicit story acceptance criteria and scope before coding; preserve the approved existing warning label and validate the enriched detail in a mobile preview.
3. Deliver A and B independently where practical; deliver C after its product/data model is settled. Never report one slice as proof another is complete.
4. Run focused API/UI and regression tests, plus mobile visual and accessibility checks. For manual review, use the documented full-stack offline worktree workflow and verify front and API before handing over the actual URL.
5. Treat deployment and the troupe's remote configuration as distinct operations requiring separate approval. Do not modify historical draws or other troupes.

## Workspace constraints

`v2` contained an untracked `generated_images/` image after the approved proposal was committed; it is unrelated and must be preserved. The worktree start controller requires a clean integration checkout. Establish a safe, authorized way to satisfy that precondition before creating a dedicated worktree; do not clean, stash, or move the user's files without an agreed plan.

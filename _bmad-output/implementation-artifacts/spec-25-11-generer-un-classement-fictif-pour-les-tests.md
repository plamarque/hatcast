---
title: 'Generate a fictional ranking for testing'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '5d8bc04a6625ba8ab9c33d6b4920c1d4f5b70030'
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Testers cannot conveniently observe varied Advent ranking configurations.

**Approach:** Provide an accessible action in the three-dot test actions menu on the ranking screen in authorized isolated test mode that varies only displayed total scores, including the current user’s score, to visualize plausible rankings and ties without simulating games.

## Boundaries & Constraints

**Always:** Restrict the control to authorized, explicitly enabled isolated test mode; exclude production preview. Use the existing server-provided roster, names, eligibility and exclusion rules unchanged; generate plausible total scores and some ties when the roster permits, and show the fictional nature clearly. Generate a new score distribution on each activation. Keep the projection in the current tab and only while this ranking is open; offer an explicit return to the calculated ranking and discard it on leaving, reload, mode, account or session change. Do not persist it or share it across devices. Preserve descending score order and the existing lowest-position tie rule. Keep score, position, membership and exclusions internally consistent. Preserve reveal priority, account and mode isolation, real quiz answers and calculated ranking. Follow Advent DESIGN, EXPERIENCE, AD-7 and the Material 3 checklist, including responsive layout, keyboard, focus and accessible names. Update affected functional, UX and architecture contracts as appropriate.

**Never:** Write fictional values into production data or real answers, reveal protected data, change the global HatCast design system, deploy or push as part of this story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior | Error handling |
|---|---|---|---|
| Generate | Authorized isolated test mode, ranking open | Keep the server roster and generate plausible fictional total scores, including the personal score, with some ties when possible; repeated activation changes the distribution. | Existing ranking remains usable if generation cannot complete. |
| Return | Fictional ranking displayed | An explicit action restores the calculated ranking; leaving or reloading discards the projection. | Fetch failures retain existing recovery behavior. |
| Ties and exclusion | Equal scores or excluded current tester | Ties use the last position of their group; personal score and rank do not misrepresent an excluded user. | No misleading personal position. |
| Access and transitions | Ordinary member, production preview, mode or account change | No fictional control or stale fictional data crosses the authorization or session boundary. | Preserve existing recovery and stale-response safeguards. |
| Priority reveal | Unseen result takes precedence over ranking | Preserve the existing reveal flow before ranking opens. | Preserve existing error handling. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts` — `AdventRanking`, `testControls`, `testMode`, `ranking`, `isTied`, `openRanking` and `closeRanking`; preserve session guards and priority reveal.
- `apps/web/src/app/pages/advent-test/advent-test.html` and `advent-ranking.scss` — Advent toolbar, test controls and ranking display; add accessible, visually isolated controls and fictional indication.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`, `AdventMemberGame.kt` — server validates active membership, isolated environment, tester identity and mode; ranking honors session and reveal priority. Preserve these boundaries.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — ranking calculator defines descending scores, exclusions and last-position ties; preserve its semantics.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts`, and `services/api/src/test/kotlin/com/hatcast/api/advent/` — extend relevant existing mode, ranking, authorization and journey coverage.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`, Advent UX and architecture contracts — reconcile only the behavior affected by the selected approach.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/pages/advent-test/` — implement a transient client-side score projection, fictional indicator, restore action and lifecycle without modifying the server roster.
- [x] `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — cover generation, ties, exclusions, lifecycle, access, transitions and the matrix.
- [x] `apps/web/e2e/advent-member.spec.ts` — exercise the ranking interaction, keyboard and responsive behavior in an authorized isolated journey.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md` and relevant Advent contracts — reconcile changed behavior and document the transient projection and its lifetime.

**Acceptance Criteria:**
- Given an authorized tester in isolated test mode, when they activate the accessible ranking action, then a visibly fictional ranking with the same eligible players, newly generated plausible totals, a consistent personal score and correct tie positions appears.
- Given production, production preview or ordinary member mode, when the ranking is displayed, then the fictional action and its state are unavailable and actual scores and answers are unchanged.
- Given a mode, account or session transition, when prior responses arrive, then no fictional state or stale response crosses the boundary.
- Given mobile, keyboard and enlarged text, when the control is used, then its label, focus, target and ranking remain usable and Advent styling does not affect HatCast.

## Implementation Notes

The projection remains in memory and retains the server roster. Verified with 162 of 162 Angular tests passing after correcting BUG-091. The isolated Playwright journey passed, including keyboard and responsive checks.

## Spec Change Log

## Review Triage Log

- medium — Leaving for welcome retained the projection; `previewWelcome` now clears the ranking and a test covers it.
- medium — Repeated zero draws on an empty roster could preserve the personal score; the fallback now changes it and is tested.
- medium — Rendering the fictional scores and restored scores was not verified; DOM assertions now cover both.
- low — Keyboard reachability was not proven by direct focus; the browser test now reaches the icon by tabbing.
- false — Test-mode scores need not follow the simulated date: AD-4 includes all recorded test answers irrespective of that date.
- low — Equal-score ordering may preserve the received order rather than the server's secondary order; the story requires consistent scores and ranks, not a secondary ordering contract.
- false — The browser mock path is correct: `requestJson` rewrites `/v1/advent-test` to `/v1/advent` before fetch.
- medium — DESIGN and DOMAIN contradicted the approved preview replay exception; the user clarified the rule and both documents were reconciled, recorded as resolved BUG-092.
- low — Screenshots alone do not prove readability; mobile and desktop captures were inspected and browser checks include zoom and overflow.

## Verification

Run focused Angular tests, reporting actual test counts; run the applicable Playwright journey with isolated fictional fixtures. Inspect mobile and desktop layouts, keyboard focus and fictional labeling, and check the Material 3 checklist and Advent visual isolation. Verify that quiz answers and calculated rankings remain unchanged.

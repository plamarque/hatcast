---
title: 'Warn about consecutive shows across categories'
type: 'feature'
created: '2026-11-14'
status: 'done'
baseline_commit: 950d5660463af5af9158fe7b90c187a4f8091c02
feature_branch: feat/6-25-avertir-des-spectacles-consecutifs-toutes-categories
prior_e2e_evidence: _bmad-output/implementation-artifacts/e2e-evidence/6-25-avertir-des-spectacles-consecutifs-toutes-categories.json
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/draw-equity-implementation-handoff-2026-11-14.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Organizers only see same-role consecutive assignment warnings within one category, so a consecutive show in another category is missed.

**Approach:** Compare the immediate previous validated show in the season both across all categories and within the current category. Preserve the existing `Joue deux fois de suite` trigger and show the matching events in a concise date-and-title list.

## Boundaries & Constraints

**Always:** compare each role independently; use event calendar chronology in the same season; include all categories including travel and CCAS in the global comparison; check only the immediately preceding eligible show, not the person's last attended show; keep category and global checks independent; preserve existing validated/non-archived and non-declined assignment filtering, identity resolution, organizer-only visibility, draft confidentiality, and equal-time ordering `(startsAt, createdAt, id)`. Preserve the label and tap/keyboard accessibility. Show each event as `dd/MM : title` without scope labels, quotation marks or parentheses. When both checks identify one event, show it once. If events differ, include both. Match roles exactly (MC and player are distinct).

**Never:** modify draw probabilities, selection weights, replay factor semantics, event category, assignments, publication or confirmation behavior. Warning must never block or alter a draw, assignment, or validation. Do not expose organizer-only metadata to members. Preserve existing separate category resolver used by weighted draw; avoid changing its semantics.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Global only | Prior event is travel, assignee held same role; no same-role hit on previous category event | One warning; detail lists global previous show | No role hit means no global entry |
| Category only | Prior global show is different category and lacks person; previous category show has same role | One warning; detail lists prior same-category show | No predecessor means no entry |
| Both, same predecessor | Both checks resolve same event and role | One warning; detail shows the event once | Preserve title and date |
| Both, distinct | Different global/category events each contain matching role | One trigger; detail lists both correctly dated shows | Never merge two distinct events |
| Different role | Previous MC, current player | No warning for that comparison | Role identity always matters |
| Unusable predecessor | Archived or unvalidated event; declined assignment | Ignore event or declined assignment according to existing rules | First show, no match: no warning |
| Lifecycle | Assign, draw, replace, remove, unlock or revalidate | Warning refreshes with composition response; no draft leak to members | Preserve existing permissions |
| Equal date/time | Prior same-time event | Use existing created-at then id ordering for deterministic strict predecessor | Never depend on database row order |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`: current category-filtered immediate predecessor query. Add separately scoped global query retaining season, valid composition, archive and ordering conditions.
- `services/api/src/main/kotlin/com/hatcast/api/composition/ImmediatePredecessorEventResolver.kt`: existing category resolver is shared by replay draw factor; preserve it; add a warning-specific global path without changing callers' behavior.
- `services/api/src/main/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningService.kt`: compute both scopes in batches; reuse `ImmediatePredecessorRoleReplayService.playedSameRoleOnPredecessor` and participant identity resolver; avoid redundant query when predecessor events coincide.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt` and `dto/CompositionDtos.kt`: warning enrichment is organizer-authorized; evolve response to represent both scopes while maintaining compatible behavior for existing clients.
- `apps/web/src/app/core/composition/consecutive-show-warning.ts` and `composition-api.service.ts`: existing trigger label, tooltip helper and types. Keep exact label and enhance accessible detail.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html` and `.ts`: existing `matTooltip` trigger supports click and `aria-label`; do not introduce an unapproved modal or change slot actions.
- `services/api/src/test/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningIntegrationTest.kt`, `apps/web/src/app/core/composition/consecutive-show-warning.spec.ts`, `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`: existing behavioral regression coverage to extend.
- `DOMAIN.md`, `SPEC.md`, `_bmad-output/planning-artifacts/ux-design-composition-consecutive-show-warning.md`: update previous same-category-only warning contract; leave draw-factor contract unchanged. Story 6.20 tracker remains ambiguous and must not be altered.

## Tasks & Acceptance

**Execution:**
- [x] `EventRepository.kt` and warning resolver -- implement deterministic all-category predecessor without touching draw resolution.
- [x] `ConsecutiveShowWarningService.kt`, `CompositionDtos.kt` -- batch both scoped matches and expose safe consistent data; retain organizer visibility in `CompositionService`.
- [x] `consecutive-show-warning.ts`, `composition-api.service.ts`, `event-equipe-tab` -- keep warning label and deliver the approved date-and-title list for touch, keyboard and assistive technology.
- [x] `ConsecutiveShowWarningIntegrationTest.kt` and front specs -- cover matrix and prove replay draw factor remains unchanged.
- [x] `DOMAIN.md`, `SPEC.md`, UX spec -- document validated scope; retain standard draw rules and story 6.20 historical record.
- [x] Apply `FRONTEND_UI.md` M3 checklist: tokens, focus/touch accessibility, mobile non-overlap; no member-navigation change.

**Acceptance Criteria:**
- Given a global-only, category-only, same-event-both or distinct-event-both assignment, when an organizer opens the warning, then each applicable previous show is listed once with its date and title.
- Given an ordinary member reads composition, when warnings exist, then organizer-only details do not appear in API or UI.
- Given a warning, when the organizer changes a slot or publishes/validates, then lifecycle remains functional without a new restriction or changed draw weight.

## Implementation Notes

## Spec Change Log

- Human review: display only one line per event, `dd/MM : title`, without scope labels, quotation marks or parentheses. The underlying comparisons remain independent.

- Human review: shorten the tooltip to scope, title and date; omit repeated name, role and category labels. Keep both scopes distinct and retain the existing trigger.

## Review Triage Log

- Medium, patch: legacy fields selected the global event even when a category match existed; category match is now preferred and tested.
- False: the E2E member port is fixed to 4200 because the isolated E2E contract explicitly reserves 4200/8080; it does not use a worktree human-smoke port.
- Maybe-false, deferred: the existing draw integration test and unchanged category resolver support unchanged behavior, but no numerical before/after comparison of weights was performed.
- Maybe-false, deferred: cross-event identity forms are resolved by the existing shared identity resolver, but two distinct predecessor identities have no dedicated regression.
- Medium, patch: the new global query lacked a cross-season regression; an integration test now covers it in both resolver and response.
- Maybe-false, deferred: the global query has no category filter, but a dedicated custom CCAS category test is absent.
- Medium, patch: long detail and keyboard behavior were unverified; the tooltip sizing and mobile E2E now cover a long title, touch and Enter after focus.
- Maybe-false, deferred: the full Angular suite has 57 failures in 15 files under Node 20; their baseline origin is not yet established.
- Medium, patch: the UX guidance retained contradictory same-category-only wording; its current body now describes both scopes.
- Medium, patch (verification-gap): cross-season isolation was not tested; the integration test now exercises a newer event in another season.

## Verification

- Isolated E2E evidence: `e2e-evidence/6-25-avertir-des-spectacles-consecutifs-toutes-categories.json` (passed; mobile, real API and H2). Patrice approved the mobile simulation video; isolated mobile E2E exercises touch and Enter. Physical-device review was not performed.
- API targeted tests: 22 passed (15 warning integration, 6 replay unit, 1 replay integration). Angular targeted tests: 104 passed. Angular build passed with Node 20. Full Angular suite: 57 then 46 failures in 15 files and one unhandled error on each run under Node 20; baseline comparison: 47 failures, 45 shared; one story-only analytics failure passed in isolation (LIMIT-007).

**Commands:**
- `cd services/api && ./gradlew test --tests '*ConsecutiveShowWarningIntegrationTest'` -- API scenarios pass.
- `npm run test -w @hatcast/web -- --watch=false` -- warning helper and team UI regressions pass.
- `npm run build -w @hatcast/web` -- build passes.

**Manual checks:** serve the documented offline full-stack worktree, verify front and API/proxy, open a mobile view, inspect warning detail for each scope and keyboard/touch access; provide a reachable review link and distinguish human approval from automated tests.

**Offline human smoke prepared:** fixture `Recette 6.25 — spectacle courant` in the Improbots seed season, with a global travel predecessor and a distinct same-category predecessor; front, proxy and API returned HTTP 200 and the local UI exposed both scopes. Patrice approved the mobile simulation video.

**Human review:** Patrice approved the mobile recipe in conversation after viewing the date-and-title list. Patrice subsequently requested local story closure; no deployment is authorized.

**Local closure verification:** On 2026-11-14, the targeted API suite and 104 Angular tests passed. LIMIT-007 was separately integrated on `v2` at `2d290f14` with 2,281 Angular tests passed; final combined verification follows integration.

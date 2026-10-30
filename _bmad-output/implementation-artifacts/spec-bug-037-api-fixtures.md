---
title: Restore deterministic API regression fixtures
type: bugfix
created: 2026-10-18
status: done
route: dispatch
baseline_commit: fa1a27b241c2c4fb0395835cae18ae9a43bedce4
review_loop_iteration: 0
context:
  - AGENTS.md
  - project-context.md
  - ARCH.md
---

<frozen-after-approval reason="User approved adapting the tests and fixtures after the causal investigation">

## Intent

Restore the full API regression suite without changing production behavior. The user explicitly approved adapting tests and fixtures, especially the missing future shows, after the diagnosis of 37 failures on the v2.6.3 lineage.

## Boundaries & Constraints

Always preserve the meaning of existing business assertions, membership synchronization, organizer-only out-of-model assignments, and the performance latency threshold. Use deterministic, isolated test data with explicit membership and season scope. Keep all changes in this dedicated worktree on `codex/bug-037-api-fixtures`.

Never change production Kotlin, migrations, production seeds, CI gates, API contracts, user data, or sprint tracking. Never disable, delete, skip or loosen failing assertions merely to obtain green results. The initial correction did not authorize commit or integration. On 2026-10-18 the user explicitly authorized committing and integrating this correction into v2 and attempting a new 2.6.3 RC, including the required push and staging workflow. Production promotion remains a separate authorization. UI: N/A.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
| --- | --- | --- |
| Empty or scoped member projection | Test account with explicitly controlled memberships and season participation | Agenda, inbox, season glance and profile assert exactly their intended events and scopes, without shared seed contamination |
| Membership auto-sync | Member joins or is added to a troupe | Current automatic roster synchronization remains enabled; setup does not pretend it creates no participants |
| Audit lifecycle setup | Participant was already synchronized | Fixture reuses or explicitly provisions the intended participant without attempting a duplicate |
| Read-only availability summary | Deliberately unsynchronized member/season fixture | Setup establishes and asserts the precondition; GET summary still performs no membership synchronization |
| Statistics selection / pending slot | Assigned slot has explicit required role count and valid zero-based index | Selection and pending chart outcomes remain asserted; out-of-model slots remain excluded |
| Future-show performance | Dedicated representative fixture with at least 24 published upcoming shows relative to test execution | At least 20 results are asserted before the unchanged p95 latency check; the fixture cannot shrink as calendar dates pass |
| Member-to-externe conversion | Fixture has an explicit, isolated set of active and archived seasons | Every active season is accounted for, archived membership history is retained, conversion assertions pass alone and in the full suite |

</frozen-after-approval>

## Code Map

All paths below are repository-relative. Run commands from this worktree, never the integration checkout.

- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt`: 15 failures; signIn joins the shared seed troupe, producing seed and other test events after BUG-033.
- `services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxIntegrationTest.kt`: 9 failures; the same membership helper pollutes exact action counts and no-participation assertions.
- `services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceIntegrationTest.kt` and `memberprofile/MemberProfileIntegrationTest.kt`: one failure each from extra scopes / seeded charts.
- `services/api/src/test/kotlin/com/hatcast/api/audit/AuditEventReadIntegrationTest.kt`: one failure; synchronized member is added again and API correctly returns 409.
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt`: one failure; read-only summary test's unsynchronized-participant precondition is already false after joining.
- `services/api/src/test/kotlin/com/hatcast/api/memberprofile/SeasonGlanceStatsProviderTest.kt`: 3 failures; fixtures omit roleSlots, but CN-1 correctly filters slots through isRequiredBy. Role slots use zero-based indices.
- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaPerformanceIntegrationTest.kt`: BUG-029; fixed seed calendar has only 18 future events on 18 October, below the existing minimum 20. Replace dependency on calendar-sensitive seed content with dedicated future events, not a lower minimum or deletion of the performance assertion.
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipLifecycleIntegrationTest.kt`: 5 failures only in full run; conversion gets 400 because shared active seasons are not covered by its payload. All 7 class tests pass in the targeted run.
- `services/api/src/test/kotlin/com/hatcast/api/support/TestAuthSupport.kt`: existing auth fixture patterns. Add scoped test-only helpers if useful; avoid globally changing auth helper semantics for unrelated tests.
- Production references (read only): `troupe/TroupeMembershipService.kt` commit 0eaa9238 synchronizes memberships across seasons; `troupe/TroupeMembershipLifecycleService.kt` requires a decision for every active season; `memberprofile/SeasonGlanceStatsProvider.kt` commit b9b0b17c filters required slots; `composition/CompositionService.kt` defines isRequiredBy.
- Test configuration: `services/api/src/test/resources/application-test.yml` uses shared H2 `hatcast_test`; contexts may overlap. Per-test/per-class isolation must be verified in the full run, not inferred from DirtiesContext alone.
- Baseline evidence: local full run 1189 tests / 37 failures / 5 skipped, matching GitHub 39100395161 and earlier 38815714661. Nine affected classes alone: 102 tests / 32 failures, with lifecycle 7/7 passing. Earlier CI 38422699386 already had stats 3 + performance 1 failures.

## Tasks & Acceptance

**Execution:**
- [x] Isolate fixture scope in the affected projection, audit, availability and lifecycle tests while preserving assertions.
- [x] Declare valid required-slot needs in the three failing statistics fixtures.
- [x] Create a dedicated, execution-date-independent performance show fixture with at least 24 future published events and representative existing projection data.
- [x] Verify the nine affected classes, then run the complete Gradle suite and investigate any remaining failures without broadening production scope.
- [x] Update `ISSUES.md` with BUG-037 and BUG-029 evidence; preserve unrelated historical registry content.

**Acceptance Criteria:**
- Given the approved fixture-only scope, when reviewing the diff, then production behavior and CI gates are unchanged and no existing test is deleted or disabled.
- Given any calendar date, when the performance fixture is constructed, then at least 24 published events are future-relative and the existing >=20 and p95 assertions remain meaningful.
- Given all API tests together, when `./gradlew test --no-daemon` runs, then all enabled tests pass and the original five environment-specific skips are not increased.
- Given isolated affected classes, when they run separately, then membership conversion and projections retain their asserted semantics.

## Implementation Notes

The user approved the concrete remediation in the preceding causal investigation. No unresolved intent choice or irreversible action is needed. Initial implementation and verification are delegated sequentially under bmad-build; review follows the resulting diff.

Implementation uses UUID-owned troupe/season fixtures while preserving real membership synchronization. The read-only summary test explicitly simulates its legacy missing-row state. Performance data supplies future-relative shows, user-keyed availability for the linked member, participant-keyed availability for guests, and required composition slots. Review strengthened the benchmark response checks and the single-event agenda assertion. Production sources, seeds, configuration and tracker are unchanged by this correction. The initial handoff left the changes uncommitted; the user subsequently authorized integration into v2 and a new 2.6.3 RC. The detailed initial release diagnosis is preserved in ISSUES.md.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Blind 1: summary cache can mask synchronization | false | The normal newcomer join creates its season row and `SeasonParticipantMembershipSync.ensureForMembership` invalidates that season's cache. `MembershipRequestScopeFilter` clears thread-local scope after each request. No sync is called between that join and the GET; deleting the row does not repopulate either cache. |
| Blind 2: Kotlin assertions can be disabled | false | The supported verification command is Gradle Test with JVM assertions enabled (`-ea`), verified in the executor command. These existing assertions are unchanged; no supported runner disabling them was identified. |
| Blind 3: benchmark response shape is not asserted | medium | The added warmup assertions exposed a real fixture mistake: the linked member's availability was recorded under season_participant_id instead of user_id, so agenda projected unknown. Resolved by correcting that fixture subject and asserting available plus collecting/composed outcomes. Standalone and final full regression pass; no production change. |
| Blind 4: benchmark lacks exhaustive status combinations | false | This fixture measures the existing agenda workload for available users across composed and uncomposed events, with 24 participants and 576 responses. Exhaustive status coverage is supplied by dedicated agenda/inbox/composition tests; no lost required branch or wrong outcome was identified. |
| Blind 5: validated composition is missing MC/DJ assignments | false | `CompositionService.validateComposition` permits partial lineups when at least one slot is assigned. Six required player slots are assigned; this is a reachable supported state, not an invalid legacy composition. |
| Blind 6: required-slot exclusion boundaries lack tests | false | Existing `CompositionSlotRequirementTest` asserts index == count is excluded and a removed role is excluded, plus required positions survive increases. All three tests ran and passed in the full suite. |
| Blind 7: isolated scopes persist across executions | false | Fixtures are UUID-owned in the in-memory H2 test database. The Gradle JVM lifecycle resets that database across executions and `forkEvery=50` bounds lifetime within the suite. No collision with a caller or leaked external persistence was shown. |
| Blind 8: single-event agenda assertion is only nonempty | low | Resolved by retaining the created event ID and asserting exactly one matching event, with the original scope checks preserved. Targeted, standalone and final full regression pass. |
| Blind 9: separate-class evidence is missing | low | Resolved by running each of the nine affected classes in its own Gradle invocation after the patches; all nine invocations pass. |
| Edge-case hunter | false | No findings returned after tracing the patch and claims. No open edge-case action. |
| Verification-gap reviewer | false | No verification gaps returned after examining the test coverage and recorded execution evidence. |

## Verification

- Run Gradle from `services/api`, using the existing wrapper and JDK 21 toolchain.
- Target the nine affected classes by Gradle `--tests` filters; then run `./gradlew test --no-daemon` across the full suite.
- Capture counts, assert skipped count did not increase, inspect fixture event dates and cardinality, run `git diff --check`, inspect the complete diff.

### Verified implementation (2026-10-18)

- JDK 21, nine affected classes via Gradle `--tests` filters: 102 tests, zero failures/errors/skips; BUILD SUCCESSFUL in 59s.
- Initial complete `./gradlew test --no-daemon`: 1189 tests, 170 classes, zero failures/errors, five unchanged skips; BUILD SUCCESSFUL in 5m 30s.
- After review patches: both edited agenda classes passed (21 tests). Each of the nine affected classes then passed in its own Gradle invocation (102 tests in total, no failures/errors/skips).
- Final complete `./gradlew test --no-daemon` on the reviewed implementation: 1189 tests, 170 classes, zero failures/errors, five unchanged skips; BUILD SUCCESSFUL in 5m 27s. XML totals independently checked. Skips remain two `NeonAgendaPerformanceIntegrationTest` and three `NeonCompositionSummaryPerformanceIntegrationTest` tests.
- Performance fixture supplies 24 published events at execution time +1 through +24 days, 24 participants, 576 availability rows and 72 valid required composition slots. The original >=20 results and p95 <=500 ms assertions pass.
- `git diff --check` passes; all production code, migrations, production seeds and CI configuration are unchanged. All seven matrix scenarios have passing execution coverage. Formal independent review completed with all retained findings resolved and nothing deferred. The subsequent user instruction authorizes local commit, integration and a new RC; production promotion remains separate.

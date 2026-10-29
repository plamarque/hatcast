# Release selection contract

Two categories and their semantic eligibility criteria are adopted. Common staging controls and critical/noncritical outcome principles are adopted; exact selectors, fixture contracts and remaining outcome mechanics require architecture decisions; this document does not activate reduced coverage.

## Decision boundary — CAP-5, CAP-6, CAP-10

After requested closure integrates a story into v2, assess the entire unreleased delta from actually served production, including dependencies and cumulative interactions. Recommend release with a justified path or waiting. Only explicit release go starts A; refusal starts no release preparation. Story checks and existing integration CI are separate.

Release all pending changes or wait. Never extract the latest correction from a broader pending delta. Reassess the whole set after the next development. Waiting is a delivery decision, not a third verification path.

## Targeted eligibility

Every condition must be demonstrated for the complete delta:

| Condition | Evidence expected |
| --- | --- |
| Bounded behavior | Pending changes, affected screens/actions/roles and cumulative interactions are understood. Multiple small changes do not automatically remain bounded together. |
| Sensitive contracts/rules unchanged | No changed auth/session/permissions, cross-troupe visibility, business rules, shared API/DTO meaning, schema/migration or data lifecycle semantics. |
| Known callers/neighbors | Affected shared-component consumers and state transitions are named and covered, including relevant roles, responsive layouts and positive/negative paths. |
| No cross-cutting/external effect | No global routing/theme/PWA/cache change, dependency/build/CI/infra change, notification audience/dispatch change or other external effect. |
| Credible verification | Regression and neighbor assertions exist or are added; selection is explicit and staging has safe compatible fixtures. |
| Detection/recovery | Identify failure signals, read-only production delivery observations and a credible recovery target with its limits. |

A shared component is not automatically excluded when all affected callers are understood and covered. Small local evolutions and fixes may qualify; urgency, semver, file count or a green story are not eligibility evidence. A false or unknown condition selects Complete.

A known failed required check cannot become an omission. Complete selection does not make a missing fixture or failed assertion successful: the affected gate may remain blocked.

Diagnosed flakiness, fixture or environment failure is not automatically release-wide blocking. It blocks when it prevents verification on the critical path linked to the cumulative delta and its affected neighbors. Otherwise continuation is possible with explicit missing coverage and residual risk; the failure remains recorded, never converted to success. Unexplained failures and product defects are not covered by this allowance.

Skipped or unexecuted checks of cumulative changes or affected neighbors require verification before delivery. Outside that perimeter, they may be nonblocking with justification and missing coverage visible in the release proposal; they never count as passed.

### Neighbor determination — adopted method

Trace changed components/services/API/rules to callers, parent/shared consumers and downstream behaviors/data. Include relevant roles, mobile/desktop, cancellation/error and concurrency cases. For every selected neighbor, state **dependency link → risk → verification scenario**, across the complete cumulative delta. Code search locates callers but does not by itself prove business-effect boundaries. Unknown or broad propagation selects Complete. Exact test/fixture mapping remains Q-2.

## Verification scope

Later merges onto v2 do not interrupt an in-progress release or change its selected candidate. Newly merged changes remain pending for the next assessment; the selected candidate's entire cumulative delta remains the unit of delivery.

Before go release, disclose the selected path, blocking and deferred checks, and any accepted verification gaps. Go release applies to that scope; a new verification gap outside it requires Patrice's decision before proceeding. After results and Patrice's staging acceptance, distinct go prod authorizes production promotion with reuse of still-valid verification, without automatically repeating a full campaign.

| Concern | Targeted | Complete |
| --- | --- | --- |
| Blocking CI | Change regression, components/callers/neighbors, pertinent API tests and justified Playwright selection | Full T1; full API when governing scope requires it |
| Actual staging T2 | Expected deployed version, API health and PWA loading plus changed/neighbor assertions | Same technical baseline plus full governing E1 with usable fixtures and explicit outcomes |
| Human staging smoke | C1 always; C2–C5 when affected by cumulative delta or neighbors; changed/neighbor journeys and persisted results where relevant | C1–C5 systematically plus delta and risk-specific compatibility/device checks |
| Deferred checks | Optional declared staging-compatible scenarios after blocking checks, while awaiting go prod and during/after MEP; cancellable by next candidate | Full required coverage remains blocking |
| Shared delivery | Final candidate/notes, required build/test successes, one staging cycle, current evidence, existing authority gates, separate prod build, read-only delivery observations and prepared recovery | Same |

Local E2E remains on demand and recommended when release is declined; it is not a substitute for required CI proof.

Before go, record blocking, deferred and deliberately omitted assertions, rationale, residual risk and policy authority. Deferred checks may be cancelled before completion; Targeted therefore does not promise later complete validation or equivalent assurance to Complete.

## Deferred staging outcomes

Deferred tests may start automatically on staging after blocking checks while awaiting go prod, then continue during/after MEP without delaying its launch. They target the selected staging revision, never production. Failures discovered before MEP are presented for decision under adopted criticality rules. They require compatible assertions/safe fixtures; T1/H2 tests do not automatically work on cloud staging.

A newer authorized staging candidate cancels old deferred runs. Preserve completed observations, reports and known failures; mark remaining coverage cancelled/incomplete. Stop owned operations before the switch, reject late/mixed-version proof and validate the new candidate independently. No completion-long staging reservation, automatic replay or inherited full pass.

For an attributable failure, diagnose product defect, test mismatch, fixture/environment problem or inconclusive result. Present evidence, likely impact and recommendation to Patrice. He decides repair, justified test adjustment, investigation or rollback. Neither rollback nor the assumption that a failed test is wrong is automatic.

## Decisions still open

Q-2 maps adopted controls to executable assertions, human scenarios and safe fixtures. Q-3 implements adopted critical/noncritical dispositions and disclosure, with unexplained failure followed by retry success on change-related verification requiring both results, analysis and residual risk to be presented to Patrice for his decision to proceed; no automatic validation or abandonment. Q-4 designs early deferred launch, cancellation, owned cleanup and diagnostic handoff. Q-1 designs Actions lookup, validity/invalidation and human traces. Q-5 designs stable candidate/recovery mechanisms and implements mandatory Patrice arbitration before replacing an in-progress pre-production candidate when another release needs staging. No expiry, retry quota, timeout, mandatory deferred suite, automatic global suspension or third lane is inferred.

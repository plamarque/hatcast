---
title: 'Reconstruct missing role chance photographs'
type: 'feature'
created: '2026-11-21'
status: 'in-progress'
baseline_commit: ba3288254d2e48625fdfa0501be8d5fbf586b812
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/docs/v2/technical/FRONTEND_UI.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Published compositions created before role photographs lack comparable chance information. Historical data can be incomplete or ambiguous.

**Approach:** Examine production evidence read-only, replay actual decision activity chronologically to estimate each missing photograph for La Malice 2026–2027, including selected draft compositions, and report assumptions and discrepancies. Keep reconstructed estimates visibly distinct from observed captures.

## Boundaries & Constraints

**Always:** Restrict the operation explicitly to the approved current season; include draft compositions with selections. Calculate estimates from the available reconstructed decision state and disclose reasonable assumptions without claiming historical certainty. Preserve existing role captures, individual selection chances, assignments and statuses. Reconstruct in attested decision order, never event-date order alone. Explain uncertainty, provenance and missing evidence; protect existing visibility gates. Verify staging backup and restoration, target, schema and migration restart before replacement. Preserve a reproducible report and restart/rollback procedure. Do not send notifications. Human staging acceptance includes Match Cambo and incomplete cases.

**Never:** Write to production or deploy there, conflate reconstructed and observed data, overwrite historical values, or require a preliminary simulation. A separate authorization is required for production writes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Missing photograph with adequate evidence | Historical decision and candidate data | Store a separate labelled reconstruction with assumptions | Report ambiguous or unavailable inputs |
| Existing photograph or individual chance | Replay differs | Preserve originals and report comparison | Never overwrite |
| Incomplete chronology, formula or pool | Insufficient evidence | Report gap and avoid invented certainty | Leave unsupported values unavailable |
| Interrupted or repeated execution | Partial staging run | Reproducible, idempotent recovery | Restore verified backup if necessary |
| New observed capture after reconstruction | Successful later draw | Observed capture takes precedence | No stale estimate resurfacing |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/composition/RoleChanceBaselineCaptureService.kt` and `services/api/src/main/resources/db/migration/V88__role_chance_baselines.sql` — observed role capture; existing replacement and null markers must remain intact.
- `CompositionDrawService.kt`, `CompositionSlotAssignmentService.kt`, `AvailabilityChanceCalculator` and draw factors — reuse the actual candidate and scoring rules; operational history depends on validated compositions at decision time. Legacy draw snapshots can contain several draws and do not identify formula.
- Audit events record availability before/after, assignment diffs and draw before/after; draw metadata does not establish formula or internal role order. Investigate evidence and label gaps rather than assuming current configuration.
- `AvailabilityService.kt`, `AvailabilityDtos.kt`, `CompositionExplainabilityService.kt` — preserve visibility gates and distinguish provenance per role and on the detail sheet. Individual assignment chances remain separate.
- `apps/web/src/app/shared/availability/availability-poll-row.html`, `availability-tous-panel.html`, and chance breakdown sheet — identify reconstructed estimates and estimated dates accessibly; observed wording must not be reused for estimates.
- `docs/v2/technical/FRONTEND_UI.md`, `SPEC.md`, `DOMAIN.md`, `ARCH.md` — apply UI checklist and document observable behavior and architecture.

## Tasks & Acceptance

**Execution:**
- [ ] Read-only production feasibility report by event and role, including decision ordering, availability, exclusions, formula evidence, historical snapshots, individual chances, assumptions and gaps.
- [ ] `services/api/src/main/resources/db/migration/` and composition persistence — separate provenance and reconstructed values without altering existing records; define priority when an observed capture replaces an estimate.
- [ ] API and replay tooling — reconstruct only supportable values from attested state, report discrepancies, protect existing data, be idempotent and resumable without notifications.
- [ ] Availability and explainability APIs and Angular surfaces — show provenance and uncertainty at each existing entry point while retaining authorization and individual-chance behavior.
- [ ] Relevant API, script and UI tests — cover matrix, chronological ambiguity, mixed roles, partial pool, replay repeat, visibility and observed replacement.
- [ ] Verify backup and restore path, staging target and served revision; synchronize and migrate staging only after those checks. Run replay and report differences; prepare human mobile/desktop acceptance including Match Cambo.
- [ ] Update applicable normative docs and record verification and limitations.

**Acceptance Criteria:** Given production evidence, when feasibility is examined read-only, then each affected event and role has a traceable result or explicit gap. Given staging with a verified rollback, when replay runs, then original data is preserved, estimates are labelled, and discrepancies and incomplete evidence are reported.

## Implementation Notes

- 2026-11-21: Production is Flyway V86; staging V88. Production audit has 36 draw completion events with before/after assignments but no metadata. Match Cambo has five draw events and 124 availability events. Several historical role snapshots contain multiple timestamps; old snapshots cannot be assumed to be common role photographs.

## Spec Change Log

- 2026-11-21: Patrice clarified that replay must follow the actual activity chronology and calculate candidate estimates at each historical decision, including selected drafts, scoped to La Malice 2026–2027. The comparison’s exploratory numbers are not approved as migration data.

## Review Triage Log

## Verification

Run focused API and frontend tests, migration/replay safety and idempotence checks; verify staging data and access, then conduct human staging acceptance on mobile and desktop.

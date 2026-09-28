# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-fix-stats-current-season.md`
  summary: Define a deterministic default-season tie-break when active state, dates, and title are identical.
  evidence: `MemberSeasonGlanceService.selectPrimarySeason` receives candidates from a set and has no stable final ID comparator; changing this equal-value policy requires product direction under the approved spec.

## Deferred from: code review of spec-19-20-ui-admin-politiques-tirage (2026-09-15)

- E2E AC9 Formules→Équipe : repose sur couverture 19.21 (`event-equipe-tab.spec.ts`, `draw-formula-choice.spec.ts`) ; pas de chaîne E2E assign UI 19.20 → Équipe dans ce diff.
- Note UX maquette (footnote « une catégorie = une formule ») : non listée dans les AC story 19.20.
- `defaultRule.allowedFormulaIds` non realigné après publish d’une nouvelle formule sans re-GET politique : follow-up produit.

Active queue for Epic 21 only. Historical and non-Epic-21 entries are preserved in `deferred-work-backlog.md`; promote an entry here only when it is ready for an Epic 21 delivery sweep.

### DW-126: A fresh Git clone without its ignored, locally provisioned BMad skills fails the upstream-skills validation before the Loop preflight can pass.
origin: spec-deferred 5e29daf747f0
location: scripts/v2/story-worktree-bootstrap.sh:46
source_spec: `21-1-loop-readiness-contract.md`
severity: medium
reason: The clean-clone check reported missing bmad-build-auto and legacy review-layer skills; the same check passed after the existing local BMad runtime was provisioned.
status: done 2026-08-27
resolution: already resolved: scripts/v2/story-worktree-bootstrap.sh:46-88 provisions and validates the pinned ignored runtime; scripts/v2/story-branch.test.sh:24-55 and :114-119 cover clean-clone and installer paths.

### DW-127: Human smoke handoff should prepare approved runtime prerequisites before asking an operator to start a smoke.
origin: operator feedback 2026-08-26
location: scripts/v2/story-human-smoke-handoff.sh; scripts/v2/story-worktree-runtime.sh
source_spec: `spec-21-4-human-smoke-handoff.md`
severity: medium
reason: A freshly bootstrapped feature worktree can have an explicit `DEPENDENCIES=missing` readiness result. The current handoff then refuses only when the operator starts the smoke, although the approved `prepare` operation can link the local environment and install the bounded runtime prerequisites without a separate human decision.
status: open

### DW-128: Create every new HatCast worktree under a shared worktrees directory.
origin: operator feedback 2026-08-26
location: scripts/v2/story-branch.sh; `.bmad-loop/policy.toml`; BMad Loop external-worktree resolution
source_spec: `21-2-worktree-runtime-readiness`
severity: medium
reason: New HatCast worktrees are currently created beside the repository, which scatters delivery units across `/Users/patrice/GitHub`. Define and enforce `/Users/patrice/GitHub/worktrees` as their common parent for both repository scripts and BMad Loop external-worktree runs; preserve the safety, cleanup, and runtime-provisioning contracts.
status: open

- source_spec: `spec-bug-024-mandatory-volunteer.md`
  summary: BUG-023 - Preserve saved Home card state if inbox refresh fails.
  evidence: Existing BUG-021 dependency member-home-todo.ts openAvailability/openParticipation discard result.item and fetchInbox retains prior state on refresh failure.

- source_spec: none
  summary: Fix E2E-WD-07 so distinct draw formulas produce distinct preview chances when their rules differ.
  evidence: Split from the staging-release gate because the draw formula calculation failure is independently shippable from the mobile availability-reminder failure.

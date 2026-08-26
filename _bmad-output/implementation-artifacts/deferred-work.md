# Deferred Work

Active queue for Epic 21 only. Historical and non-Epic-21 entries are preserved in `deferred-work-backlog.md`; promote an entry here only when it is ready for an Epic 21 delivery sweep.

### DW-126: A fresh Git clone without its ignored, locally provisioned BMad skills fails the upstream-skills validation before the Loop preflight can pass.
origin: spec-deferred 5e29daf747f0
location: scripts/v2/story-worktree-bootstrap.sh:46
source_spec: `21-1-loop-readiness-contract.md`
severity: medium
reason: The clean-clone check reported missing bmad-build-auto and legacy review-layer skills; the same check passed after the existing local BMad runtime was provisioned.
status: open

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

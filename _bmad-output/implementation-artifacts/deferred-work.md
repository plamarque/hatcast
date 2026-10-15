# Deferred Work — Active Queue

Only currently actionable entries belong here. Historical notes, resolved
entries, and the long-term backlog are retained in `deferred-work-backlog.md`.

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

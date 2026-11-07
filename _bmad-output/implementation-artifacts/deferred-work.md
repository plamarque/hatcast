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

- source_spec: `spec-25-3a-simulated-date-and-continuation.md`
  summary: Verify the live announcement of the simulated Advent day with a real screen reader.
  evidence: Medium, unverified: the number has a polite live region and a full accessible label; actual announcement on day changes varies by assistive technology and needs a device check.
- source_spec: `_bmad-output/implementation-artifacts/spec-avent-loading.md`
  summary: Avoid waiting for a stalled answer-state read when the quiz is already missing.
  evidence: The parallel reads currently both finish before missing content is displayed; safely cancelling the remaining read requires cancellation handling.
- source_spec: `_bmad-output/implementation-artifacts/spec-advent-past-result-ranking.md`
  summary: Preserve the past result if loading the ranking fails (BUG-067).
  evidence: Existing navigation clears the result before requesting the ranking; an error returns the member to the calendar.

- source_spec: `_bmad-output/implementation-artifacts/spec-avent-surprise-production-preview.md`
  summary: Verify whether direct invocation of an older workflow revision can bypass the Advent deployment gate.
  evidence: Unverified medium/high risk; inspect effective GitHub environment and organization protections and exercise the authorized release path.
- source_spec: `_bmad-output/implementation-artifacts/spec-avent-surprise-production-preview.md`
  summary: Verify the emergency rollback path for production tags predating the Advent regression gate.
  evidence: Unverified medium/high risk; the current local promotion guard rejects old tags, but alternative authorized rollback paths were not inspected.
- source_spec: `_bmad-output/implementation-artifacts/spec-avent-surprise-production-preview.md`
  summary: Verify effective PostHog privacy settings and traffic in a production-equivalent deployed environment.
  evidence: Unverified high risk; the real SDK passed local synthetic capture and replay tests, but remote settings and deployed traffic remain unchecked.

- source_spec: `_bmad-output/implementation-artifacts/spec-stabilize-availability-e2e.md`
  summary: Exercise availability interception cleanup with an intentionally in-flight inbox request.
  evidence: Unverified medium risk; the exact already-handled route cause was not established and the current scenario does not deterministically hold a handler during cleanup.

- source_spec: `spec-25-25-lire-les-anecdotes-completes-avant-de-choisir.md`
  summary: Verify screen-reader navigation of Advent radio choices and story controls.
  evidence: Unverified medium accessibility risk: controls are individually keyboard-operable, but no assistive-technology session checked their announcements inside the radiogroup.

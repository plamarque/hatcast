# Lifecycle contract

## State flow

`selected` → `prepare unit` → `develop and verify` → `human review` → `explicit integration approval` → `integrate, push, verify remote` → `local cleanup`

The transition from `human review` to `explicit integration approval` is human-only. A failed, paused, or rejected transition ends in a preserved `inspectable unit` state; it never proceeds to cleanup.

## Preparation

- A declarative `.bmad-loop` plugin receives Loop context at `pre_story` and `pre_bundle`.
- It accepts only a validated story key and invokes the repository-owned `story-branch.sh start` contract from the clean V2 checkout.
- It asserts the branch, adjacent worktree registration, and required BMad runtime before returning control to Loop.
- It is idempotent for a valid existing unit. It fails closed without starting a development session when the unit cannot be prepared.

## Handoff

- A post-delivery handoff is evidence, not an approval.
- It records the story key, branch, derived worktree path, Loop run or bundle identifier when available, outcome, and evidence locations.
- It states whether the next action is human review, resolving an escalation, or an explicitly approved integration. It must never claim that a review was approved or an integration occurred unless it has evidence.

## Integration and cleanup

- The operator invokes a separate, repository-owned integration entrypoint from clean `v2` after human review and an explicit approval input.
- That entrypoint delegates to `scripts/v2/story-branch.sh integrate`; it may add preflight validation and structured reporting but may not reimplement Git operations.
- The existing command remains authoritative for merge, push, remote verification, and local worktree/branch removal after success.
- A failure at any stage preserves the local feature unit and reports the recovery boundary. The remote feature branch is never removed automatically.

## Build launch

- The supported `bmad-build` and `bmad-build-auto` launchers invoke the preparation/assertion contract before calling a skill.
- Customizations may add operational context, but correctness must not depend on a model following that text.
- The launcher rejects a mismatched branch, a non-adjacent/unregistered worktree, a missing runtime, or a call from the V2 integration checkout.

## Verification matrix

| Situation | Required result |
| --- | --- |
| Missing eligible unit | Correct `feat/{story-key}` unit is created before Loop proceeds. |
| Valid existing unit | Unit is reused without mutating another worktree. |
| Invalid unit or dirty V2 | Preparation fails closed with recovery guidance. |
| Loop/sweep delivery ends | Durable non-secret handoff names the preserved unit and next action. |
| No explicit approval | Integration is unavailable; nothing is merged, pushed, or removed. |
| Integration push/remote check fails | Feature unit remains intact. |
| Integration succeeds | Local worktree and branch are cleaned by the established command; remote feature branch is retained. |

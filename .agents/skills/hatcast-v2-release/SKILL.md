---
name: hatcast-v2-release
description: >-
  Orchestrate a HatCast V2 release lifecycle: approved smoke contract,
  bilingual release notes, staging RC, human staging smoke, and explicitly
  approved production promotion. Use for V2 Cloud Run release, RC, staging
  smoke, production promotion, or release notes; not for V1 Firebase releases
  or recurring PostHog analysis.
disable-model-invocation: true
---

# HatCast V2 — release lifecycle

Run an evidence-backed V2 release through the existing V2 scripts. The outcome
is a validated RC lineage and, only when explicitly authorized, a production
tag plus GitHub Release. This skill never turns a green test, CI job, or staging
smoke into authority to push, tag, or deploy production.

The smoke contract is a stable, approved baseline: do not query PostHog as part
of an ordinary release. Use `hatcast-posthog-smoke-analysis` only when the user
explicitly asks to establish or refresh the data-informed contract.

Use the current repository state as authoritative. Read
[`docs/v2/technical/DEPLOYMENT_WORKFLOW.md`](../../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md)
for the supported branch/tag flow. Read
[`references/staging-smoke-contract.md`](references/staging-smoke-contract.md)
when selecting, running, or recording a human staging smoke.

## Modes and authority

| Mode | Trigger | External effect |
|---|---|---|
| `preview` | default release request or “dry run” | Read-only preflight and bilingual notes in chat. |
| `stage` | explicit request to create/apply the RC or promote to staging, after Gate A/B | May invoke the staging/RC scripts that push staging and RC refs. |
| `promote` | explicit “OK prod” after all staging gates | May invoke `deploy_prod.sh`; creates the production tag and GitHub Release. |

Never infer `stage` from approval of notes, nor `promote` from approval of a
smoke. Ask for the missing explicit authorization at the relevant gate. A user
may authorize both staging and RC in one request; production remains a separate
authorization.

## 1. Preview — preflight and release notes

1. Run `./scripts/v2/release-context.sh [--patch|--minor|--major] [--json]`.
2. In apply modes, halt on a dirty tree. In preview, report dirt without
   altering it.
3. Read the commit range and matching story artifacts. If subjects are too
   technical, inspect the diff; do not invent customer-facing changes.
4. Draft `changes` in French and `changes_en` in English, each with at most
   five customer-visible bullets. Read `argil-editorial.md`,
   `argil-editorial-en.md`, and `examples.md` before drafting.
5. Present Gate A: explicit approval of both note sets. Until then, do not
   write a cutover, commit, tag, push, or invoke a release script without
   `--dry-run`.

Use the existing cutover JSON schema. `changes` is PWA content; `changes_en`
is for the eventual GitHub Release and is not published on a RC.

## 2. Stage — staging and RC gates

After Gate A, show the proposed cutover JSON and the technical changelog. Gate
B is an explicit instruction to apply the release/staging action.

For Gate B:

1. Write `scripts/v2/changelog-entries/vX.Y.Z-cutover.json` only after the
   notes are approved; commit it with the release artifacts using the project
   Conventional Commit rules.
2. If the user authorized staging, run `./scripts/deploy_staging.sh` and verify
   the CI deployment/E2E result on the promoted commit. Never use `--skip-e2e`
   unless the user explicitly asks and the waiver is recorded in the handoff.
3. If the user authorized the RC, run `./scripts/release_version.sh` with the
   selected bump. Verify the pushed RC tag resolves to the expected staging
   lineage and that the V2 branch sync completed.
4. Wait for the relevant staging deploy and the E1 preprod gate. A T2 warning
   that Malice is absent is not proof of the member/organizer path; report the
   reduced coverage and require an explicit disposition before promotion.

Do not create a GitHub Release for an RC. No production action occurs in this
mode.

## 3. Smoke — execute and record the staging contract

Run the contract against the staging URL only after its deployed revision is
identified and the CI/E1 status is known. Use dedicated fixtures where an
action mutates data. Verify the final persisted state by reload or an
independent view; opening a modal is not a successful journey.

Report, for every path: target revision, role/fixture, actions, observation,
evidence link or event, result, and any mutation/cleanup. Distinguish:

- **pass** — all assertions and persistence checks succeeded;
- **failed** — an expected result did not occur;
- **blocked** — fixture, access, or staging state prevented execution;
- **waived** — an explicit user decision, with reason and residual risk.

Present Gate C only when all P0 paths pass or have an explicit waiver. Gate C
approves the staging smoke; it is not production authorization.

## 4. Promote — separate production gate

Before promotion, verify the exact remote RC tag and commit, that it is in the
staging lineage, a recent matching staging deployment, CI/E1 result, and the
recorded smoke disposition. Run `./scripts/deploy_prod.sh --dry-run` first if
the user requests a preview or if the target is ambiguous.

Gate D requires an explicit user instruction such as “OK prod” or “promote to
production”. Only then run `./scripts/deploy_prod.sh` without `--dry-run`.
This creates/pushes the production tag and GitHub Release; report both as
external effects. Then verify the production deploy/run and perform a minimal,
read-only production reachability check. Do not create data, change settings,
or run a mutating production journey as a smoke.

## Stops and anti-patterns

- Never use the V1 `scripts/release-version.sh` or the Firebase staging branch.
- Never hand-edit `staging-v2`, tags, changelog JSON, or a production release to
  bypass the supported scripts.
- Stop on a dirty tree, divergent tag, failed required CI/E1 path, failed P0
  smoke path, unknown fixture mutation, or docs/code conflict.
- Do not push, deploy, create a tag, create a GitHub Release, or dismiss an E1
  warning without the specific authority required above.
- A passing local E2E suite, PostHog ranking, or automated staging gate does not
  substitute for the targeted human smoke.

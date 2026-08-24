#!/usr/bin/env bash
# Local-only black-box tests for the isolated story worktree lifecycle.

set -euo pipefail

source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/hatcast-story-worktree.XXXXXX")" && pwd)"
trap 'rm -rf "${tmp_root}"' EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { "$@" >/dev/null 2>&1 && fail "command unexpectedly succeeded: $*" || true; }
assert_file() { [[ -f "$1" ]] || fail "missing file: $1"; }
assert_eq() { [[ "$1" == "$2" ]] || fail "expected '$1', got '$2'"; }
run_story() {
  local root="$1"
  shift
  HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${root}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" \
    bash "${root}/scripts/v2/story-branch.sh" "$@"
}

make_fixture() {
  local name="$1" root origin
  root="${tmp_root}/${name}"
  origin="${tmp_root}/${name}-origin.git"
  git init --bare "${origin}" >/dev/null
  git clone "${origin}" "${root}" >/dev/null
  git -C "${root}" config user.email test@example.invalid
  git -C "${root}" config user.name "Story workflow test"
  mkdir -p "${root}/scripts" "${root}/_bmad/scripts" "${root}/_bmad/custom" "${root}/_bmad/_config"
  cp -R "${source_root}/scripts/v2" "${root}/scripts/"
  cp "${source_root}/_bmad/scripts/memlog.py" "${root}/_bmad/scripts/"
  cp "${source_root}/_bmad/custom/config.toml" "${root}/_bmad/custom/"
  cp "${source_root}/_bmad/custom/story-branch-workflow.md" "${root}/_bmad/custom/"
  cp "${source_root}/_bmad/_config/manifest.yaml" "${root}/_bmad/_config/"
  cp "${source_root}/.gitignore" "${root}/"
  printf '{"name":"fixture"}\n' >"${root}/package.json"
  printf 'baseline\n' >"${root}/README.md"
  git -C "${root}" add .
  git -C "${root}" commit -m "test: Add worktree fixture" >/dev/null
  git -C "${root}" branch -M v2
  git -C "${root}" push -u origin v2 >/dev/null
  cd "${root}" && pwd -P
}

integration="$(make_fixture integration)"
unit_alpha="${integration}-alpha-unit"
unit_beta="${integration}-beta-unit"

run_story "${integration}" start alpha-unit >"${tmp_root}/alpha.out"
assert_file "${unit_alpha}/.agents/skills/bmad-create-story/SKILL.md"
assert_file "${unit_alpha}/.agents/skills/bmad-dev-story/SKILL.md"
assert_file "${unit_alpha}/.agents/skills/bmad-code-review/SKILL.md"
assert_file "${unit_alpha}/_bmad/scripts/memlog.py"
assert_eq "v2" "$(git -C "${integration}" rev-parse --abbrev-ref HEAD)"
assert_eq "feat/alpha-unit" "$(git -C "${unit_alpha}" rev-parse --abbrev-ref HEAD)"
grep -q '^FEATURE_BRANCH=feat/alpha-unit$' "${tmp_root}/alpha.out" || fail "start metadata missing branch"
grep -q '^BASELINE_COMMIT=[0-9a-f]\{40\}$' "${tmp_root}/alpha.out" || fail "start metadata missing full baseline"

expect_fail bash "${integration}/scripts/v2/story-branch.sh" assert alpha-unit
bash "${unit_alpha}/scripts/v2/story-branch.sh" assert alpha-unit >/dev/null
status_output="$(bash "${integration}/scripts/v2/story-branch.sh" status alpha-unit)"
[[ "${status_output}" == *"WORKTREE_PATH=${unit_alpha}"* ]] || fail "status did not report unit path: ${status_output}"

printf 'independent\n' >"${unit_alpha}/unit.txt"
[[ ! -e "${integration}/unit.txt" ]] || fail "unit edit leaked into integration checkout"
git -C "${unit_alpha}" add unit.txt
git -C "${unit_alpha}" commit -m "test: Change alpha unit" >/dev/null

run_story "${integration}" start beta-unit >/dev/null
assert_eq "feat/beta-unit" "$(git -C "${unit_beta}" rev-parse --abbrev-ref HEAD)"
reopen_output="$(bash "${integration}/scripts/v2/story-branch.sh" start beta-unit 2>&1)" || fail "valid reopen failed: ${reopen_output}"
[[ "${reopen_output}" == *"REOPENED_UNIT_WORKTREE="* ]] || fail "reopen was not reported: ${reopen_output}"

run_story "${integration}" start stale-unit >/dev/null
rm -rf "${integration}-stale-unit"
mkdir "${integration}-stale-unit"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start stale-unit

printf 'dirty\n' >"${integration}/dirty.txt"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start dirty-unit
rm "${integration}/dirty.txt"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start ../unsafe
mkdir "${integration}-conflict-unit"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start conflict-unit

foreign="$(make_fixture foreign)"
git -C "${foreign}" branch feat/checked-elsewhere origin/v2
git -C "${foreign}" worktree add "${tmp_root}/checked-elsewhere" feat/checked-elsewhere >/dev/null
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${foreign}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${foreign}/scripts/v2/story-branch.sh" start checked-elsewhere

broken="$(make_fixture broken)"
network_output="$(bash "${broken}/scripts/v2/story-branch.sh" start unavailable-runtime 2>&1)" && fail "network confirmation guard unexpectedly succeeded"
[[ "${network_output}" == *"NETWORK_CONFIRMATION_REQUIRED="* ]] || fail "missing explicit network confirmation"
[[ -d "${broken}-unavailable-runtime" ]] || fail "failed bootstrap unit was not preserved"

printf 'uncommitted\n' >"${unit_alpha}/uncommitted.txt"
expect_fail bash "${integration}/scripts/v2/story-branch.sh" merge alpha-unit
rm "${unit_alpha}/uncommitted.txt"

upstream="${tmp_root}/upstream"
git clone "${tmp_root}/integration-origin.git" "${upstream}" >/dev/null
git -C "${upstream}" config user.email test@example.invalid
git -C "${upstream}" config user.name "Story workflow test"
git -C "${upstream}" checkout -b v2 origin/v2 >/dev/null
printf 'upstream\n' >"${upstream}/upstream.txt"
git -C "${upstream}" add upstream.txt
git -C "${upstream}" commit -m "test: Advance v2 upstream" >/dev/null
git -C "${upstream}" push origin v2 >/dev/null

bash "${integration}/scripts/v2/story-branch.sh" merge alpha-unit >/dev/null
assert_eq "v2" "$(git -C "${integration}" rev-parse --abbrev-ref HEAD)"
assert_eq "feat/alpha-unit" "$(git -C "${unit_alpha}" rev-parse --abbrev-ref HEAD)"
assert_file "${integration}/upstream.txt"
git -C "${integration}" show --quiet --format=%s HEAD | grep -q 'feat(story): merge alpha-unit' || fail "merge commit missing"

echo "PASS: story worktree lifecycle"

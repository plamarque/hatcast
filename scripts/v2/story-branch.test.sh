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
creation_baseline="$(git -C "${integration}" rev-parse HEAD)"

run_story "${integration}" start alpha-unit >"${tmp_root}/alpha.out"
assert_file "${unit_alpha}/.agents/skills/bmad-create-story/SKILL.md"
assert_file "${unit_alpha}/.agents/skills/bmad-dev-story/SKILL.md"
assert_file "${unit_alpha}/.agents/skills/bmad-code-review/SKILL.md"
assert_file "${unit_alpha}/_bmad/scripts/memlog.py"
[[ -z "$(git -C "${unit_alpha}" status --porcelain)" ]] || fail "bootstrap changed tracked unit files"
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

run_story "${integration}" start beta-unit >/dev/null
assert_eq "feat/beta-unit" "$(git -C "${unit_beta}" rev-parse --abbrev-ref HEAD)"
assert_file "${unit_alpha}/unit.txt"
[[ -n "$(git -C "${unit_alpha}" status --porcelain)" ]] || fail "uncommitted alpha work was lost"
git -C "${unit_alpha}" add unit.txt
git -C "${unit_alpha}" commit -m "test: Change alpha unit" >/dev/null
reopen_output="$(bash "${integration}/scripts/v2/story-branch.sh" start beta-unit 2>&1)" || fail "valid reopen failed: ${reopen_output}"
[[ "${reopen_output}" == *"REOPENED_UNIT_WORKTREE="* ]] || fail "reopen was not reported: ${reopen_output}"

run_story "${integration}" start stale-unit >/dev/null
rm -rf "${integration}-stale-unit"
mkdir "${integration}-stale-unit"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start stale-unit

printf 'dirty\n' >"${integration}/dirty.txt"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start dirty-unit
! git -C "${integration}" show-ref --verify --quiet refs/heads/feat/dirty-unit || fail "dirty start created a branch"
[[ ! -e "${integration}-dirty-unit" ]] || fail "dirty start created a worktree"
rm "${integration}/dirty.txt"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start ../unsafe
! git -C "${integration}" show-ref --verify --quiet refs/heads/feat/unsafe || fail "unsafe start created a branch"
mkdir "${integration}-conflict-unit"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start conflict-unit
! git -C "${integration}" show-ref --verify --quiet refs/heads/feat/conflict-unit || fail "conflicting start created a branch"

foreign="$(make_fixture foreign)"
git -C "${foreign}" branch feat/checked-elsewhere origin/v2
git -C "${foreign}" worktree add "${tmp_root}/checked-elsewhere" feat/checked-elsewhere >/dev/null
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_PROVISIONER="${foreign}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${foreign}/scripts/v2/story-branch.sh" start checked-elsewhere

broken="$(make_fixture broken)"
network_output="$(bash "${broken}/scripts/v2/story-branch.sh" start unavailable-runtime 2>&1)" && fail "network confirmation guard unexpectedly succeeded"
[[ "${network_output}" == *"NETWORK_CONFIRMATION_REQUIRED="* ]] || fail "missing explicit network confirmation"
[[ -d "${broken}-unavailable-runtime" ]] || fail "failed bootstrap unit was not preserved"

failed_unit="${integration}-failed-installer"
expect_fail env HATCAST_BMAD_TEST_MODE=1 HATCAST_BMAD_TEST_FAIL=1 HATCAST_BMAD_PROVISIONER="${integration}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" bash "${integration}/scripts/v2/story-branch.sh" start failed-installer
[[ -d "${failed_unit}" ]] || fail "failed installer unit was not preserved"
[[ -z "$(git -C "${failed_unit}" status --porcelain)" ]] || fail "failed installer left tracked changes"
run_story "${integration}" start failed-installer >/dev/null

mock_bin="${tmp_root}/mock-bin"
mkdir "${mock_bin}"
ln -s "${source_root}/scripts/v2/test-fixtures/mock-npx.sh" "${mock_bin}/npx"
ln -s "${source_root}/scripts/v2/test-fixtures/mock-bmad-provisioner.sh" "${mock_bin}/mock-bmad-provisioner.sh"
production_unit="${integration}-production-path"
HATCAST_BMAD_NPX_LOG="${tmp_root}/npx.log" HATCAST_BMAD_FIXTURE_DIR="${source_root}/scripts/v2/test-fixtures" PATH="${mock_bin}:${PATH}" HATCAST_BMAD_ALLOW_NETWORK=1 bash "${integration}/scripts/v2/story-branch.sh" start production-path >/dev/null
grep -Fx -- '--action' "${tmp_root}/npx.log" >/dev/null
grep -Fx -- 'update' "${tmp_root}/npx.log" >/dev/null
assert_file "${production_unit}/.agents/skills/bmad-code-review/SKILL.md"
[[ -z "$(git -C "${production_unit}" status --porcelain)" ]] || fail "production installer path changed tracked unit files"

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
remote_before_merge="$(git --git-dir="${tmp_root}/integration-origin.git" rev-parse refs/heads/v2)"

bash "${integration}/scripts/v2/story-branch.sh" merge alpha-unit >/dev/null
assert_eq "v2" "$(git -C "${integration}" rev-parse --abbrev-ref HEAD)"
assert_eq "feat/alpha-unit" "$(git -C "${unit_alpha}" rev-parse --abbrev-ref HEAD)"
assert_file "${integration}/upstream.txt"
git -C "${integration}" show --quiet --format=%s HEAD | grep -q 'feat(story): merge alpha-unit' || fail "merge commit missing"
assert_eq "${remote_before_merge}" "$(git --git-dir="${tmp_root}/integration-origin.git" rev-parse refs/heads/v2)"
status_after_upstream="$(bash "${integration}/scripts/v2/story-branch.sh" status alpha-unit)"
[[ "${status_after_upstream}" == *"BASELINE_COMMIT=${creation_baseline}"* ]] || fail "creation baseline changed after upstream advance"

automated="$(make_fixture automated)"
expect_fail bash "${automated}/scripts/v2/story-branch.sh" integrate absent-unit
run_story "${automated}" start integrate-unit >/dev/null
integrate_unit="${automated}-integrate-unit"
printf 'integrate\n' >"${integrate_unit}/integrate.txt"
git -C "${integrate_unit}" add integrate.txt
git -C "${integrate_unit}" commit -m "test: Change integrate unit" >/dev/null
git -C "${integrate_unit}" push -u origin feat/integrate-unit >/dev/null
printf 'dirty\n' >"${automated}/dirty.txt"
expect_fail bash "${automated}/scripts/v2/story-branch.sh" integrate integrate-unit
rm "${automated}/dirty.txt"
integrate_output="$(bash "${automated}/scripts/v2/story-branch.sh" integrate integrate-unit)"
[[ "${integrate_output}" == *"REMOTE_FEATURE_BRANCH=unchanged"* ]] || fail "integration did not report remote feature branch preservation"
[[ ! -e "${integrate_unit}" ]] || fail "successful integration kept the unit worktree"
! git -C "${automated}" show-ref --verify --quiet refs/heads/feat/integrate-unit || fail "successful integration kept the local feature branch"
git --git-dir="${tmp_root}/automated-origin.git" show-ref --verify --quiet refs/heads/feat/integrate-unit || fail "successful integration deleted the remote feature branch"
git --git-dir="${tmp_root}/automated-origin.git" merge-base --is-ancestor "$(git -C "${automated}" rev-parse HEAD)" refs/heads/v2 || fail "remote v2 does not contain the integrated head"

run_story "${automated}" start rejected-unit >/dev/null
rejected_unit="${automated}-rejected-unit"
printf 'rejected\n' >"${rejected_unit}/rejected.txt"
git -C "${rejected_unit}" add rejected.txt
git -C "${rejected_unit}" commit -m "test: Change rejected unit" >/dev/null
hook="${tmp_root}/automated-origin.git/hooks/pre-receive"
printf '%s\n' '#!/usr/bin/env bash' 'while read -r _old _new ref; do' '  if [[ "${HATCAST_REJECT_V2:-0}" == "1" && "${ref}" == "refs/heads/v2" ]]; then exit 1; fi' 'done' 'exit 0' >"${hook}"
chmod +x "${hook}"
expect_fail env HATCAST_REJECT_V2=1 bash "${automated}/scripts/v2/story-branch.sh" integrate rejected-unit
[[ -d "${rejected_unit}" ]] || fail "rejected push removed the unit worktree"
git -C "${automated}" show-ref --verify --quiet refs/heads/feat/rejected-unit || fail "rejected push removed the local feature branch"
expect_fail bash "${automated}/scripts/v2/story-branch.sh" integrate rejected-unit

verification="$(make_fixture verification)"
run_story "${verification}" start verification-unit >/dev/null
verification_unit="${verification}-verification-unit"
printf 'verification\n' >"${verification_unit}/verification.txt"
git -C "${verification_unit}" add verification.txt
git -C "${verification_unit}" commit -m "test: Change verification unit" >/dev/null
hook="${tmp_root}/verification-origin.git/hooks/post-receive"
printf '%s\n' '#!/usr/bin/env bash' 'while read -r old new ref; do' '  if [[ "${HATCAST_REWIND_V2_AFTER_PUSH:-0}" == "1" && "${ref}" == "refs/heads/v2" ]]; then git update-ref "${ref}" "${old}" "${new}"; fi' 'done' >"${hook}"
chmod +x "${hook}"
expect_fail env HATCAST_REWIND_V2_AFTER_PUSH=1 bash "${verification}/scripts/v2/story-branch.sh" integrate verification-unit
[[ -d "${verification_unit}" ]] || fail "failed remote verification removed the unit worktree"
git -C "${verification}" show-ref --verify --quiet refs/heads/feat/verification-unit || fail "failed remote verification removed the local feature branch"
expect_fail bash "${verification}/scripts/v2/story-branch.sh" integrate verification-unit

echo "PASS: story worktree lifecycle"

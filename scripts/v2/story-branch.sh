#!/usr/bin/env bash
# HatCast V2 — isolated Git worktrees for manual BMad story delivery.
#
# Usage:
#   ./scripts/v2/story-branch.sh start STORY_KEY   # create or reopen an adjacent unit worktree
#   ./scripts/v2/story-branch.sh assert STORY_KEY  # verify this checkout owns the unit
#   ./scripts/v2/story-branch.sh merge STORY_KEY   # local merge into v2, without push or cleanup
#   ./scripts/v2/story-branch.sh status STORY_KEY  # print stable unit metadata

set -euo pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${_script_dir}/lib/git-branches.sh"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> <story-key>

Commands:
  start STORY_KEY   Create or reopen the adjacent feat/STORY_KEY unit worktree from origin/\${HATCAST_V2_BRANCH_DEV}
  assert STORY_KEY  Verify this checkout is the unit worktree for feat/STORY_KEY
  merge STORY_KEY   Merge feat/STORY_KEY locally into \${HATCAST_V2_BRANCH_DEV} from clean integration
  status STORY_KEY  Print stable branch, baseline, and worktree metadata

Exemple:
  ./scripts/v2/story-branch.sh start 17-43-event-detail-contexte-infos

The current checkout must be the clean \${HATCAST_V2_BRANCH_DEV:-v2} integration worktree for start and merge.
EOF
}

require_story_key() {
  local story_key="$1"
  if [[ ! "${story_key}" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "ERROR: story_key must use lowercase letters, digits, and single hyphens." >&2
    exit 1
  fi
}

unit_path_for() {
  printf '%s-%s\n' "$1" "$2"
}

baseline_config_key() {
  local branch="$1"
  printf 'hatcast.story.%s.baseline\n' "${branch#feat/}"
}

persist_creation_baseline() {
  local branch="$1" dev_ref="$2"
  git config --local "$(baseline_config_key "${branch}")" "$(git rev-parse "${dev_ref}")"
}

read_creation_baseline() {
  local branch="$1" dev_ref="$2" baseline path metadata
  while IFS= read -r path; do
    metadata="$(git show "${branch}:${path}" 2>/dev/null || true)"
    baseline="$(awk -v expected="${branch}" '
      /^---$/ { delimiters++; next }
      delimiters == 1 && $0 == "feature_branch: " expected { matched = 1 }
      delimiters == 1 && /^baseline_commit: / { baseline = $2 }
      delimiters == 2 && matched && baseline != "" { print baseline; exit }
    ' <<<"${metadata}")"
    baseline="${baseline#\'}"
    baseline="${baseline%\'}"
    baseline="${baseline#\"}"
    baseline="${baseline%\"}"
    if [[ -n "${baseline}" ]]; then
      printf '%s\n' "${baseline}"
      return
    fi
  done < <(git ls-tree -r --name-only "${branch}" -- _bmad-output/implementation-artifacts)
  baseline="$(git config --local --get "$(baseline_config_key "${branch}")" 2>/dev/null || true)"
  if [[ -n "${baseline}" ]]; then
    printf '%s\n' "${baseline}"
  fi
}

worktree_path_for_branch() {
  git worktree list --porcelain | awk -v wanted="refs/heads/$1" '
    /^worktree / { path = substr($0, 10) }
    $1 == "branch" && $2 == wanted { print path; exit }
  '
}

is_valid_worktree_path() {
  local path="$1"
  [[ -d "${path}" && "$(git -C "${path}" rev-parse --show-toplevel 2>/dev/null || true)" == "${path}" ]]
}

assert_integration_worktree() {
  local dev="$1" current
  current="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "${current}" != "${dev}" ]]; then
    echo "ERROR: start and merge must run from the ${dev} integration worktree, not ${current}." >&2
    exit 1
  fi
  hatcast_v2_assert_clean
}

print_metadata() {
  local branch="$1" dev_ref="$2" path="$3" baseline
  printf 'FEATURE_BRANCH=%s\n' "${branch}"
  printf 'WORKTREE_PATH=%s\n' "${path}"
  printf 'DEV_REF=%s\n' "${dev_ref}"
  if git rev-parse --verify "${dev_ref}" >/dev/null 2>&1; then
    baseline="$(read_creation_baseline "${branch}" "${dev_ref}")"
    printf 'BASELINE_COMMIT=%s\n' "${baseline:-unavailable}"
  else
    printf 'BASELINE_COMMIT=unavailable\n'
    printf 'DEV_REF_STATUS=unavailable\n'
  fi
}

start_story_branch() {
  local story_key="$1" branch dev dev_ref integration_root unit_path existing_path created=false

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  integration_root="${HATCAST_V2_PROJECT_ROOT}"
  dev="${HATCAST_V2_BRANCH_DEV}"
  dev_ref="$(hatcast_v2_dev_ref)"
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  unit_path="$(unit_path_for "${integration_root}" "${story_key}")"
  assert_integration_worktree "${dev}"

  existing_path="$(worktree_path_for_branch "${branch}")"
  if [[ -e "${unit_path}" && "${existing_path}" != "${unit_path}" ]]; then
    echo "ERROR: unit path already exists and is not the requested ${branch} worktree: ${unit_path}" >&2
    exit 1
  fi
  if [[ -n "${existing_path}" && "${existing_path}" != "${unit_path}" ]]; then
    echo "ERROR: ${branch} is already checked out in another worktree: ${existing_path}" >&2
    exit 1
  fi

  hatcast_v2_fetch
  if ! git rev-parse --verify "${dev_ref}" >/dev/null 2>&1; then
    echo "ERROR: ${dev_ref} is unavailable after fetch." >&2
    exit 1
  fi

  if [[ "${existing_path}" == "${unit_path}" ]]; then
    if ! is_valid_worktree_path "${unit_path}"; then
      echo "ERROR: ${branch} is registered but its unit worktree cannot be validated: ${unit_path}" >&2
      exit 1
    fi
    echo "REOPENED_UNIT_WORKTREE=${unit_path}"
    if bash "${_script_dir}/story-worktree-bootstrap.sh" --verify "${unit_path}"; then
      print_metadata "${branch}" "${dev_ref}" "${unit_path}"
      return 0
    fi
  elif git show-ref --verify --quiet "refs/heads/${branch}"; then
    git worktree add "${unit_path}" "${branch}"
  elif git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
    git worktree add -b "${branch}" "${unit_path}" "origin/${branch}"
  else
    git worktree add -b "${branch}" "${unit_path}" "${dev_ref}"
    created=true
  fi

  if [[ "${created}" == true ]]; then
    persist_creation_baseline "${branch}" "${dev_ref}"
  fi

  if ! is_valid_worktree_path "${unit_path}"; then
    echo "ERROR: created or reopened unit path is not a valid Git worktree: ${unit_path}" >&2
    exit 1
  fi
  if ! bash "${_script_dir}/story-worktree-bootstrap.sh" "${unit_path}"; then
    echo "ERROR: BMad bootstrap failed; the unit worktree was preserved for inspection: ${unit_path}" >&2
    exit 1
  fi
  print_metadata "${branch}" "${dev_ref}" "${unit_path}"
}

assert_story_branch() {
  local story_key="$1" branch root actual_path
  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  root="${HATCAST_V2_PROJECT_ROOT}"
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  actual_path="$(worktree_path_for_branch "${branch}")"
  if [[ "$(git rev-parse --abbrev-ref HEAD)" != "${branch}" || "${actual_path}" != "${root}" ]]; then
    echo "ERROR: run manual BMad work from the ${branch} unit worktree. From clean ${HATCAST_V2_BRANCH_DEV}, run: ./scripts/v2/story-branch.sh start ${story_key}" >&2
    exit 1
  fi
  bash "${_script_dir}/story-worktree-bootstrap.sh" --verify "${root}"
  print_metadata "${branch}" "$(hatcast_v2_dev_ref)" "${root}"
}

merge_story_branch() {
  local story_key="$1"
  local branch dev unit_path merge_msg

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  dev="${HATCAST_V2_BRANCH_DEV}"
  assert_integration_worktree "${dev}"
  unit_path="$(worktree_path_for_branch "${branch}")"
  if [[ -z "${unit_path}" ]] || ! is_valid_worktree_path "${unit_path}"; then
    echo "ERROR: no valid unit worktree exists for ${branch}. Review it before integration." >&2
    exit 1
  fi
  if [[ -n "$(git -C "${unit_path}" status --porcelain)" ]]; then
    echo "ERROR: unit worktree is not clean; commit or stash its changes before integration: ${unit_path}" >&2
    git -C "${unit_path}" status --short >&2
    exit 1
  fi
  merge_msg="feat(story): merge ${story_key}"

  if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
    echo "❌ Branche locale ${branch} introuvable — rien à merger." >&2
    exit 1
  fi

  hatcast_v2_fetch
  git pull --ff-only origin "${dev}"

  echo "Merging ${branch} into ${dev} locally; no push or unit checkout change..."
  git merge --no-ff "${branch}" -m "${merge_msg}"
  echo "MERGED_BRANCH=${branch}"
  echo "INTEGRATION_BRANCH=${dev}"
  echo "NEXT_ACTION=Push ${dev} manually after any required checks. The unit worktree was kept at ${unit_path}."
}

status_story_branch() {
  local story_key="$1"
  local branch dev_ref path

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  dev_ref="$(hatcast_v2_dev_ref)"
  path="$(worktree_path_for_branch "${branch}")"
  printf 'STORY_KEY=%s\n' "${story_key}"
  if [[ -z "${path}" ]]; then
    printf 'UNIT_WORKTREE=absent\n'
    return 0
  fi
  if ! is_valid_worktree_path "${path}"; then
    echo "ERROR: ${branch} is registered but its unit worktree cannot be validated: ${path}" >&2
    exit 1
  fi
  if ! bash "${_script_dir}/story-worktree-bootstrap.sh" --verify "${path}"; then
    echo "ERROR: ${branch} worktree exists but its BMad runtime validation failed: ${path}" >&2
    exit 1
  fi
  print_metadata "${branch}" "${dev_ref}" "${path}"
}

main() {
  local cmd="${1:-}"
  local story_key="${2:-}"

  case "${cmd}" in
    start) start_story_branch "${story_key}" ;;
    assert) assert_story_branch "${story_key}" ;;
    merge) merge_story_branch "${story_key}" ;;
    status) status_story_branch "${story_key}" ;;
    -h | --help | help | "") usage; exit 0 ;;
    *)
      echo "❌ Commande inconnue : ${cmd}" >&2
      usage >&2
      exit 1
      ;;
  esac
}

main "$@"

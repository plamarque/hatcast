#!/usr/bin/env bash
# Read-only release context for Cursor skill hatcast-v2-release (no git writes, no sandbox).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${SCRIPT_DIR}/lib/git-branches.sh"
# shellcheck source=../lib/version-changelog.sh
source "${SCRIPT_DIR}/../lib/version-changelog.sh"

hatcast_v2_detect_project_root
hatcast_changelog_sync_repo_root_from_git

ROOT_PACKAGE="package.json"
WEB_PACKAGE="apps/web/package.json"
VERSION_TXT="apps/web/public/version.txt"

VERSION_BUMP=""
EXPLICIT_VERSION=""
JSON_OUTPUT=false
bump_flag_count=0

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Contexte read-only pour une release staging V2 (skill hatcast-v2-release).
Aucune modification git ; pas de sandbox.

Options (alignées sur release-staging.sh) :
  --patch, --minor, --major   Bump semver produit simulé
  --version=X.Y.Z             Version de base explicite + rc.1
  --json                      Sortie JSON (stdout)
  --help, -h                  Aide
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --patch) VERSION_BUMP="patch"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --minor) VERSION_BUMP="minor"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --major) VERSION_BUMP="major"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --version=*) EXPLICIT_VERSION="${arg#*=}" ;;
    --json) JSON_OUTPUT=true ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "❌ Option inconnue : ${arg}" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "${bump_flag_count}" -gt 1 ]]; then
  echo "❌ Options bump incompatibles: une seule parmi --patch/--minor/--major." >&2
  exit 1
fi

if [[ -n "${EXPLICIT_VERSION}" && -n "${VERSION_BUMP}" ]]; then
  echo "❌ --version ne peut pas être combiné avec --patch/--minor/--major." >&2
  exit 1
fi

read_product_version_hint() {
  local from_file from_web
  from_file=""
  if [[ -f "${VERSION_TXT}" ]]; then
    from_file="$(head -1 "${VERSION_TXT}" | tr -d '\n\r')"
  fi
  from_web="$(hatcast_read_package_version "${WEB_PACKAGE}")"
  if [[ -n "${from_web}" ]]; then
    echo "${from_web}"
  else
    echo "${from_file}"
  fi
}

collect_commits_by_category() {
  local commit_range="$1"
  local commit_line commit_msg

  FEATS=()
  FIXES=()
  IMPROVEMENTS=()
  OTHERS=()

  while IFS= read -r commit_line; do
    [[ -z "${commit_line}" ]] && continue
    commit_msg="$(echo "${commit_line}" | cut -d' ' -f2-)"
    if [[ "${commit_msg}" =~ ^(chore: bump version|release: version|chore\(v2\): bump version|chore\(v2\): release staging) ]]; then
      continue
    fi
    if [[ "${commit_msg}" =~ ^feat ]]; then
      FEATS+=("${commit_line}")
    elif [[ "${commit_msg}" =~ ^fix ]]; then
      FIXES+=("${commit_line}")
    elif [[ "${commit_msg}" =~ ^(improve|perf|refactor|style) ]]; then
      IMPROVEMENTS+=("${commit_line}")
    else
      OTHERS+=("${commit_line}")
    fi
  done < <(git log --oneline "${commit_range}" 2>/dev/null || true)
}

json_string_array() {
  if (($# == 0)); then
    echo '[]'
    return 0
  fi
  printf '%s\n' "$@" | jq -R . | jq -s .
}

FILE_HINT="$(read_product_version_hint)"
FILE_HINT_BASE="$(hatcast_strip_prerelease_suffix "${FILE_HINT}")"

read -r NEW_VERSION RC_NUM RELEASE_TAG_NAME <<< "$(hatcast_resolve_staging_rc_release "${VERSION_BUMP}" "${EXPLICIT_VERSION}" "${FILE_HINT_BASE}" "${FILE_HINT}")"

COMMIT_RANGE="$(hatcast_staging_changelog_range "${NEW_VERSION}" "${RC_NUM}")"
USER_CHANGELOG_RANGE="$(hatcast_staging_changelog_user_json_range "${NEW_VERSION}" "${RC_NUM}" 2>/dev/null || echo "${COMMIT_RANGE}")"

CUTOVER_FILE="$(hatcast_cutover_entry_path "${NEW_VERSION}")"
CUTOVER_EXISTS=false
if [[ -f "${CUTOVER_FILE}" ]]; then
  CUTOVER_EXISTS=true
fi

collect_commits_by_category "${COMMIT_RANGE}"

if [[ "${JSON_OUTPUT}" == true ]]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq requis pour --json." >&2
    exit 1
  fi

  feats_json="$(json_string_array "${FEATS[@]+"${FEATS[@]}"}")"
  fixes_json="$(json_string_array "${FIXES[@]+"${FIXES[@]}"}")"
  improvements_json="$(json_string_array "${IMPROVEMENTS[@]+"${IMPROVEMENTS[@]}"}")"
  others_json="$(json_string_array "${OTHERS[@]+"${OTHERS[@]}"}")"

  jq -nc \
    --arg product_version "${NEW_VERSION}" \
    --arg rc_num "${RC_NUM}" \
    --arg release_tag "${RELEASE_TAG_NAME}" \
    --arg commit_range "${COMMIT_RANGE}" \
    --arg user_changelog_range "${USER_CHANGELOG_RANGE}" \
    --arg cutover_file "${CUTOVER_FILE#${_HATCAST_REPO_ROOT}/}" \
    --argjson cutover_exists "$( [[ "${CUTOVER_EXISTS}" == true ]] && echo true || echo false )" \
    --argjson feat_count "${#FEATS[@]}" \
    --argjson fix_count "${#FIXES[@]}" \
    --argjson feats "${feats_json}" \
    --argjson fixes "${fixes_json}" \
    --argjson improvements "${improvements_json}" \
    --argjson others "${others_json}" \
    '{
      product_version: $product_version,
      rc_num: ($rc_num | tonumber),
      release_tag: $release_tag,
      commit_range: $commit_range,
      user_changelog_range: $user_changelog_range,
      cutover_file: $cutover_file,
      cutover_exists: $cutover_exists,
      feat_count: $feat_count,
      fix_count: $fix_count,
      commits: { feat: $feats, fix: $fixes, improve: $improvements, other: $others }
    }'
  exit 0
fi

echo "📋 Release context (read-only)"
echo "   Version produit : ${NEW_VERSION}"
echo "   Tag RC prévu    : ${RELEASE_TAG_NAME} (rc.${RC_NUM})"
echo "   Plage CHANGELOG : ${COMMIT_RANGE}"
if [[ "${USER_CHANGELOG_RANGE}" != "${COMMIT_RANGE}" ]]; then
  echo "   Plage changelog.json : ${USER_CHANGELOG_RANGE}"
fi
echo "   Cutover         : ${CUTOVER_FILE#${_HATCAST_REPO_ROOT}/} ($([[ "${CUTOVER_EXISTS}" == true ]] && echo existe || echo absent — requis pour release))"
echo ""
echo "### ✨ Features (${#FEATS[@]})"
if [[ ${#FEATS[@]} -gt 0 ]]; then
  printf '%s\n' "${FEATS[@]}"
else
  echo "(aucun)"
fi
echo ""
echo "### 🐛 Fixes (${#FIXES[@]})"
if [[ ${#FIXES[@]} -gt 0 ]]; then
  printf '%s\n' "${FIXES[@]}"
else
  echo "(aucun)"
fi
echo ""
echo "### 🔧 Improvements (${#IMPROVEMENTS[@]})"
if [[ ${#IMPROVEMENTS[@]} -gt 0 ]]; then
  printf '%s\n' "${IMPROVEMENTS[@]}"
else
  echo "(aucun)"
fi
echo ""
echo "### 📝 Other (${#OTHERS[@]})"
if [[ ${#OTHERS[@]} -gt 0 ]]; then
  printf '%s\n' "${OTHERS[@]}"
else
  echo "(aucun)"
fi

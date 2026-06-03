#!/usr/bin/env bash
# Release staging V2 : bump semver produit, changelog, tag RC vX.Y.Z-rc.N sur staging-v2.
# Le déploiement Cloud Run staging reste déclenché par le push sur staging-v2 (CI).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${SCRIPT_DIR}/lib/git-branches.sh"
# shellcheck source=../lib/version-changelog.sh
source "${SCRIPT_DIR}/../lib/version-changelog.sh"

hatcast_v2_detect_project_root

DRY_RUN=false
VERSION_BUMP=""
EXPLICIT_VERSION=""
bump_flag_count=0
stashed_before_switch=false
DRY_STAGING=""

ROOT_PACKAGE="package.json"
WEB_PACKAGE="apps/web/package.json"
VERSION_TXT="apps/web/public/version.txt"

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Release staging HatCast V2 (depuis la branche staging configurée).
Bump version produit (racine + apps/web), CHANGELOG, tag annoté vX.Y.Z-rc.N, push staging-v2 + tag.
Le déploiement staging est assuré par GitHub Actions sur push de staging-v2 (pas sur le tag seul — OPS-5).

Sans option de bump : incrémente uniquement le numéro RC (ex. v2.0.0-rc.2 → v2.0.0-rc.3).
Avec --patch|--minor|--major : bump la semver de base et repart à rc.1.

Première RC cutover (arbre encore en X.Y.Z-SNAPSHOT, aucun tag RC) :
  git checkout staging-v2 && ./scripts/v2/release-staging.sh --version=2.0.0

Options:
  --dry-run, -n       Simulation (sandbox .dry-run-sandbox-v2, branche dry-run-staging-v2-*)
  --patch             Bump patch + rc.1
  --minor             Bump minor + rc.1
  --major             Bump major + rc.1
  --version=X.Y.Z     Version de base explicite + rc.1
  --help, -h          Aide

Configuration : scripts/v2/branches.env
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --dry-run|-n) DRY_RUN=true ;;
    --major) VERSION_BUMP="major"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --minor) VERSION_BUMP="minor"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --patch) VERSION_BUMP="patch"; bump_flag_count=$((bump_flag_count + 1)) ;;
    --version=*) EXPLICIT_VERSION="${arg#*=}" ;;
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
  echo "❌ Options bump incompatibles: utilisez une seule option parmi --patch/--minor/--major." >&2
  exit 1
fi

if [[ -n "${EXPLICIT_VERSION}" && -n "${VERSION_BUMP}" ]]; then
  echo "❌ Options incompatibles: --version ne peut pas être combiné avec --patch/--minor/--major." >&2
  exit 1
fi

execute_cmd() {
  local cmd="$1"
  local description="$2"
  if [[ "${DRY_RUN}" == true ]]; then
    echo "📝 EXECUTING: ${description}"
    echo "   └─ ${cmd}"
    eval "${cmd}"
  else
    echo "📝 ${description}"
    eval "${cmd}"
  fi
}

print_cmd_only() {
  local cmd="$1"
  echo "📝 WOULD RUN: ${cmd}"
}

create_dry_run_sandbox() {
  local timestamp dry_sandbox
  timestamp="$(date +%Y%m%d-%H%M%S)"
  DRY_STAGING="dry-run-staging-v2-${timestamp}"
  dry_sandbox=".dry-run-sandbox-v2"

  echo "🏗️  Sandbox dry-run V2…"
  rm -rf "${dry_sandbox}"
  mkdir -p "${dry_sandbox}"
  find . -maxdepth 1 -not -name '.dry-run-sandbox-v2' -not -name '.' -exec cp -r {} "${dry_sandbox}/" \; 2>/dev/null || true
  cd "${dry_sandbox}"
  git fetch --tags origin 2>/dev/null || true
  git branch "${DRY_STAGING}" "${HATCAST_V2_BRANCH_STAGING}" 2>/dev/null || git branch "${DRY_STAGING}" "origin/${HATCAST_V2_BRANCH_STAGING}"
  git checkout "${DRY_STAGING}"
  echo "✅ Sandbox : ${DRY_STAGING}"
}

cleanup_dry_run_sandbox() {
  if [[ -z "${DRY_STAGING}" ]]; then
    return 0
  fi
  echo "🧹 Nettoyage sandbox dry-run…"
  git checkout "${HATCAST_V2_BRANCH_STAGING}" 2>/dev/null || true
  if [[ "${stashed_before_switch}" == true ]]; then
    git stash pop 2>/dev/null || true
  fi
  git branch -D "${DRY_STAGING}" 2>/dev/null || true
  echo "📁 Répertoire sandbox conservé : .dry-run-sandbox-v2"
}

read_product_version_hint() {
  local from_file from_web
  from_file=""
  if [[ -f "${VERSION_TXT}" ]]; then
    from_file="$(head -1 "${VERSION_TXT}" | tr -d '\n\r')"
  fi
  from_web="$(hatcast_read_package_version "${WEB_PACKAGE}")"

  if [[ -n "${from_web}" && -n "${from_file}" ]]; then
    local web_base file_base
    web_base="$(hatcast_strip_prerelease_suffix "${from_web}")"
    file_base="$(hatcast_strip_prerelease_suffix "${from_file}")"
    if [[ "${web_base}" != "${file_base}" ]]; then
      echo "⚠️  Divergence version détectée (web=${from_web}, version.txt=${from_file}) — priorité à apps/web/package.json." >&2
    fi
  fi

  if [[ -n "${from_web}" ]]; then
    echo "${from_web}"
  else
    echo "${from_file}"
  fi
}

align_v2_package_versions() {
  local root_v web_v root_major web_base
  root_v="$(hatcast_read_package_version "${ROOT_PACKAGE}")"
  web_v="$(hatcast_read_package_version "${WEB_PACKAGE}")"

  if [[ "${root_v}" == "${web_v}" ]]; then
    return 0
  fi

  root_major="${root_v%%.*}"
  web_base="$(hatcast_strip_prerelease_suffix "${web_v}")"

  if [[ "${root_major}" == "0" && "${web_base}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "ℹ️  Alignement racine (${root_v}) sur version web V2 ${web_base}…"
    hatcast_set_package_json_version "${ROOT_PACKAGE}" "${root_v}" "${web_base}"
    hatcast_set_package_json_version "${WEB_PACKAGE}" "${web_v}" "${web_base}"
    return 0
  fi

  echo "❌ Versions divergentes : racine=${root_v} apps/web=${web_v}" >&2
  echo "   Alignez manuellement ou corrigez avant release." >&2
  exit 1
}

assert_package_versions_match() {
  local root_v web_v
  root_v="$(hatcast_read_package_version "${ROOT_PACKAGE}")"
  web_v="$(hatcast_read_package_version "${WEB_PACKAGE}")"
  if [[ "${root_v}" != "${web_v}" ]]; then
    echo "❌ Versions divergentes : racine=${root_v} apps/web=${web_v}" >&2
    exit 1
  fi
}

write_version_txt() {
  local version="$1" build_date="$2" git_hash="$3" build_time="$4"
  mkdir -p "$(dirname "${VERSION_TXT}")"
  cat > "${VERSION_TXT}" << EOF
${version}
Staging RC build - ${build_date}
Git: ${git_hash}
Build: ${build_time}
EOF
}

bump_both_package_json() {
  local old_version="$1" new_version="$2"
  hatcast_set_package_json_version "${ROOT_PACKAGE}" "${old_version}" "${new_version}"
  local web_old
  web_old="$(hatcast_read_package_version "${WEB_PACKAGE}")"
  hatcast_set_package_json_version "${WEB_PACKAGE}" "${web_old}" "${new_version}"
  assert_package_versions_match
}

assert_tag_available() {
  local tag_name="$1"
  if git rev-parse --verify "refs/tags/${tag_name}" >/dev/null 2>&1; then
    echo "❌ Le tag ${tag_name} existe déjà localement." >&2
    exit 1
  fi
  if git ls-remote --tags origin "refs/tags/${tag_name}" 2>/dev/null | grep -q .; then
    echo "❌ Le tag ${tag_name} existe déjà sur origin." >&2
    exit 1
  fi
}

# --- Début ---

if [[ "${DRY_RUN}" == true ]]; then
  echo "🔍 DRY RUN — release staging V2 (RC tag)"
  create_dry_run_sandbox
  trap cleanup_dry_run_sandbox EXIT
  CURRENT_STAGING="${DRY_STAGING}"
else
  echo "🚀 Release staging V2 (RC tag)"
  hatcast_v2_assert_branch "${HATCAST_V2_BRANCH_STAGING}"
  hatcast_v2_assert_clean
  hatcast_v2_fetch
  CURRENT_STAGING="${HATCAST_V2_BRANCH_STAGING}"
fi

git checkout "${CURRENT_STAGING}" 2>/dev/null || true

FILE_HINT="$(read_product_version_hint)"
FILE_HINT_BASE="$(hatcast_strip_prerelease_suffix "${FILE_HINT}")"

read -r NEW_VERSION RC_NUM RELEASE_TAG_NAME <<< "$(hatcast_resolve_staging_rc_release "${VERSION_BUMP}" "${EXPLICIT_VERSION}" "${FILE_HINT_BASE}" "${FILE_HINT}")"

BUILD_DATE="$(date +%Y-%m-%d)"
GIT_HASH="$(git rev-parse --short HEAD)"
BUILD_TIME="$(date '+%Y-%m-%dT%H:%M:%S%z')"
COMMIT_RANGE="$(hatcast_staging_changelog_range "${NEW_VERSION}" "${RC_NUM}")"

echo "📋 Version produit : ${NEW_VERSION}"
echo "📋 Tag RC : ${RELEASE_TAG_NAME} (rc.${RC_NUM})"
echo "📋 Plage CHANGELOG : ${COMMIT_RANGE}"

if [[ "${DRY_RUN}" == true ]]; then
  echo "🤔 Confirmation release ${RELEASE_TAG_NAME} : oui (dry-run)"
else
  read -r -p "🤔 Confirmer la release staging ${RELEASE_TAG_NAME} ? (y/N) " -n 1 reply
  echo ""
  [[ "${reply}" =~ ^[Yy]$ ]] || exit 1
fi

assert_tag_available "${RELEASE_TAG_NAME}"

align_v2_package_versions
CURRENT_PKG="$(hatcast_read_package_version "${ROOT_PACKAGE}")"
bump_both_package_json "${CURRENT_PKG}" "${NEW_VERSION}"
if [[ "$(hatcast_read_package_version "${ROOT_PACKAGE}")" != "${NEW_VERSION}" ]]; then
  echo "❌ Échec du bump package.json" >&2
  exit 1
fi
write_version_txt "${NEW_VERSION}" "${BUILD_DATE}" "${GIT_HASH}" "${BUILD_TIME}"

echo "📝 Génération CHANGELOG (${COMMIT_RANGE})…"
hatcast_generate_changelog_md "${NEW_VERSION}" "${BUILD_DATE}" "${COMMIT_RANGE}"
hatcast_mirror_changelog_fr "${NEW_VERSION}" "${BUILD_DATE}"

if [[ -f CHANGELOG.md ]]; then
  echo ""
  echo "📄 Extrait CHANGELOG :"
  awk "/^## \\[${NEW_VERSION}\\]/,/^---$/{if(/^---$/) exit; print}" CHANGELOG.md || true
  echo ""
fi

COMMIT_MSG="chore(v2): release staging ${RELEASE_TAG_NAME}"

if [[ "${DRY_RUN}" == true ]]; then
  print_cmd_only "git add ${ROOT_PACKAGE} ${WEB_PACKAGE} ${VERSION_TXT} CHANGELOG.md CHANGELOG_FR.md"
  print_cmd_only "git commit -m \"${COMMIT_MSG}\""
  print_cmd_only "git tag -a \"${RELEASE_TAG_NAME}\" -m \"Staging RC ${RELEASE_TAG_NAME} (${BUILD_DATE}, ${GIT_HASH})\""
  print_cmd_only "git push origin ${HATCAST_V2_BRANCH_STAGING}"
  print_cmd_only "git push origin \"${RELEASE_TAG_NAME}\""
else
  execute_cmd "git add ${ROOT_PACKAGE} ${WEB_PACKAGE} ${VERSION_TXT} CHANGELOG.md CHANGELOG_FR.md" "Indexation fichiers version"
  execute_cmd "git commit -m \"${COMMIT_MSG}\"" "Commit sur staging"
  execute_cmd "git tag -a \"${RELEASE_TAG_NAME}\" -m \"Staging RC ${RELEASE_TAG_NAME} (${BUILD_DATE}, ${GIT_HASH})\"" "Tag ${RELEASE_TAG_NAME}"
  execute_cmd "git push origin ${HATCAST_V2_BRANCH_STAGING}" "Push staging"
  execute_cmd "git push origin \"${RELEASE_TAG_NAME}\"" "Push tag RC"
fi

ACTIONS_URL="$(hatcast_v2_github_actions_url)"

if [[ "${DRY_RUN}" == true ]]; then
  echo ""
  echo "✅ DRY RUN terminé — tag prévu : ${RELEASE_TAG_NAME} (produit ${NEW_VERSION})"
  echo "📊 En réel : push ${HATCAST_V2_BRANCH_STAGING} + tag ${RELEASE_TAG_NAME} → CI staging (branch push)"
  echo "ℹ️  Déploiement sur tag seul : scope OPS-5 (non implémenté ici)."
else
  echo ""
  echo "✅ Release staging initiée — ${RELEASE_TAG_NAME} (produit ${NEW_VERSION})"
  echo "🌐 CI : ${ACTIONS_URL}"
  echo "☁️  Service Cloud Run : hatcast-v2-staging (push branche ${HATCAST_V2_BRANCH_STAGING})"
  echo "ℹ️  Le tag RC sert de piste d’audit ; le deploy reste sur push branche jusqu’à OPS-5."
fi

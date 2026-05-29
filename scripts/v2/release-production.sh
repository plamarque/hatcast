#!/usr/bin/env bash
# Release production V2 : version, changelog, tag, merge staging-v2 → production-v2.
# Le déploiement Cloud Run est déclenché par le push sur production-v2 (CI).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${SCRIPT_DIR}/lib/git-branches.sh"
# shellcheck source=../lib/version-changelog.sh
source "${SCRIPT_DIR}/../lib/version-changelog.sh"

hatcast_v2_detect_project_root

DRY_RUN=false
VERSION_BUMP="patch"
EXPLICIT_VERSION=""
stashed_before_switch=false
DRY_STAGING=""
DRY_PRODUCTION=""

ROOT_PACKAGE="package.json"
WEB_PACKAGE="apps/web/package.json"
VERSION_TXT="apps/web/public/version.txt"

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Release production HatCast V2 (depuis la branche staging configurée).
Bump version (racine + apps/web), CHANGELOG, merge vers production, tag vX.Y.Z.
Le déploiement est assuré par GitHub Actions sur push de production-v2.

Options:
  --dry-run, -n       Simulation (branches sandbox dry-run-*)
  --patch             Bump patch (défaut)
  --minor             Bump minor
  --major             Bump major
  --version=X.Y.Z     Version explicite
  --help, -h          Aide

Configuration : scripts/v2/branches.env
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --dry-run|-n) DRY_RUN=true ;;
    --major) VERSION_BUMP="major" ;;
    --minor) VERSION_BUMP="minor" ;;
    --patch) VERSION_BUMP="patch" ;;
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

create_dry_run_sandbox() {
  local timestamp dry_sandbox
  timestamp="$(date +%Y%m%d-%H%M%S)"
  DRY_STAGING="dry-run-staging-v2-${timestamp}"
  DRY_PRODUCTION="dry-run-production-v2-${timestamp}"
  dry_sandbox=".dry-run-sandbox-v2"

  echo "🏗️  Sandbox dry-run V2…"
  rm -rf "${dry_sandbox}"
  mkdir -p "${dry_sandbox}"
  find . -maxdepth 1 -not -name '.dry-run-sandbox-v2' -not -name '.' -exec cp -r {} "${dry_sandbox}/" \; 2>/dev/null || true
  cd "${dry_sandbox}"
  git fetch --tags origin 2>/dev/null || true
  git branch "${DRY_STAGING}" "${HATCAST_V2_BRANCH_STAGING}" 2>/dev/null || git branch "${DRY_STAGING}" "origin/${HATCAST_V2_BRANCH_STAGING}"
  git branch "${DRY_PRODUCTION}" "origin/${HATCAST_V2_BRANCH_PRODUCTION}" 2>/dev/null || git branch "${DRY_PRODUCTION}" "${HATCAST_V2_BRANCH_PRODUCTION}"
  git checkout "${DRY_STAGING}"
  echo "✅ Sandbox : ${DRY_STAGING} / ${DRY_PRODUCTION}"
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
  git branch -D "${DRY_STAGING}" "${DRY_PRODUCTION}" 2>/dev/null || true
  echo "📁 Répertoire sandbox conservé : .dry-run-sandbox-v2"
}

read_production_version() {
  local prod_ref="$1"
  local from_file
  from_file="$(git show "${prod_ref}:${VERSION_TXT}" 2>/dev/null | head -1 | tr -d '\n\r' || true)"
  if [[ -n "${from_file}" ]]; then
    echo "${from_file}"
    return 0
  fi
  git show "${prod_ref}:${ROOT_PACKAGE}" 2>/dev/null | grep -o '"version": "[^"]*"' | head -1 | cut -d'"' -f4 || echo "0.0.0"
}


align_web_package_version_to_root() {
  local root_v web_v
  root_v="$(hatcast_read_package_version "${ROOT_PACKAGE}")"
  web_v="$(hatcast_read_package_version "${WEB_PACKAGE}")"
  if [[ "${root_v}" == "${web_v}" ]]; then
    return 0
  fi
  echo "ℹ️  Alignement apps/web (${web_v}) sur version racine ${root_v}…"
  hatcast_set_package_json_version "${WEB_PACKAGE}" "${web_v}" "${root_v}"
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
Production build - ${build_date}
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

handle_hotfixes_on_production() {
  local staging_ref="$1"
  local production_ref="$2"
  local count
  count="$(git rev-list --count "${staging_ref}..${production_ref}" 2>/dev/null || echo 0)"
  if [[ "${count}" -eq 0 ]]; then
    echo "✅ ${production_ref} n’a pas de commits absents de ${staging_ref} (pas de hotfix prod détecté)."
    return 0
  fi

  echo "⚠️  ${count} commit(s) sur ${production_ref} absents de ${staging_ref} :"
  git log --oneline "${staging_ref}..${production_ref}"
  echo ""
  echo "1) Rebaser staging sur production (recommandé)"
  echo "2) Continuer sans rebase (risqué)"
  echo "3) Arrêter"
  read -r -p "Choix (1/2/3) : " -n 1 choice
  echo ""
  case "${choice}" in
    1)
      if [[ "${DRY_RUN}" == true ]]; then
        git checkout "${DRY_STAGING}"
        git rebase "${DRY_PRODUCTION}" || {
          git rebase --abort 2>/dev/null || true
          echo "❌ DRY RUN : conflit de rebase simulé" >&2
          exit 1
        }
        echo "✅ DRY RUN : rebase réussi"
      else
        local backup="backup-${HATCAST_V2_BRANCH_STAGING}-$(date +%Y%m%d-%H%M%S)"
        git branch "${backup}"
        git rebase "${production_ref}" || {
          echo "❌ Conflit — résoudre puis git rebase --continue (backup : ${backup})" >&2
          exit 1
        }
        git branch -d "${backup}"
        echo "✅ Rebase terminé"
      fi
      ;;
    2)
      read -r -p "Confirmer sans rebase (taper YES) : " confirm
      [[ "${confirm}" == "YES" ]] || exit 1
      ;;
    3)
      echo "❌ Release annulée"
      exit 1
      ;;
    *)
      echo "❌ Choix invalide" >&2
      exit 1
      ;;
  esac
}

# --- Début ---

if [[ "${DRY_RUN}" == true ]]; then
  echo "🔍 DRY RUN — release production V2"
  create_dry_run_sandbox
  trap cleanup_dry_run_sandbox EXIT
  CURRENT_STAGING="${DRY_STAGING}"
  CURRENT_PRODUCTION="${DRY_PRODUCTION}"
  PROD_REF="${DRY_PRODUCTION}"
else
  echo "🚀 Release production V2"
  hatcast_v2_assert_branch "${HATCAST_V2_BRANCH_STAGING}"
  hatcast_v2_assert_clean
  hatcast_v2_fetch
  CURRENT_STAGING="${HATCAST_V2_BRANCH_STAGING}"
  CURRENT_PRODUCTION="origin/${HATCAST_V2_BRANCH_PRODUCTION}"
  PROD_REF="${CURRENT_PRODUCTION}"
fi

if ! git rev-parse --verify "${PROD_REF}" >/dev/null 2>&1; then
  echo "❌ Branche production introuvable : ${PROD_REF}" >&2
  echo "💡 git checkout -b ${HATCAST_V2_BRANCH_PRODUCTION} ${HATCAST_V2_BRANCH_STAGING} && git push -u origin ${HATCAST_V2_BRANCH_PRODUCTION}" >&2
  exit 1
fi

handle_hotfixes_on_production "${CURRENT_STAGING}" "${PROD_REF}"

CURRENT_VERSION="$(read_production_version "${PROD_REF}")"
NEW_VERSION="$(hatcast_bump_semver "${CURRENT_VERSION}" "${VERSION_BUMP}" "${EXPLICIT_VERSION}")"
BUILD_DATE="$(date +%Y-%m-%d)"
GIT_HASH="$(git rev-parse --short HEAD)"
BUILD_TIME="$(date '+%Y-%m-%dT%H:%M:%S%z')"

echo "📋 Version production actuelle : ${CURRENT_VERSION}"
echo "📋 Nouvelle version : ${NEW_VERSION}"

if [[ "${DRY_RUN}" == true ]]; then
  echo "🤔 Confirmation version ${NEW_VERSION} : oui (dry-run)"
else
  read -r -p "🤔 Confirmer la release ${NEW_VERSION} ? (y/N) " -n 1 reply
  echo ""
  [[ "${reply}" =~ ^[Yy]$ ]] || exit 1
fi

# Bump fichiers (référence prod pour la semver ; fichiers modifiés sur staging)
align_web_package_version_to_root
bump_both_package_json "$(hatcast_read_package_version "${ROOT_PACKAGE}")" "${NEW_VERSION}"
if [[ "$(hatcast_read_package_version "${ROOT_PACKAGE}")" != "${NEW_VERSION}" ]]; then
  echo "❌ Échec du bump package.json racine" >&2
  exit 1
fi
write_version_txt "${NEW_VERSION}" "${BUILD_DATE}" "${GIT_HASH}" "${BUILD_TIME}"

LAST_TAG="v${CURRENT_VERSION}"
if git show-ref --tags --quiet "${LAST_TAG}" 2>/dev/null; then
  COMMIT_RANGE="${LAST_TAG}..HEAD"
else
  COMMIT_RANGE="HEAD"
fi

echo "📝 Génération CHANGELOG (${COMMIT_RANGE})…"
hatcast_generate_changelog_md "${NEW_VERSION}" "${BUILD_DATE}" "${COMMIT_RANGE}"
hatcast_mirror_changelog_fr "${NEW_VERSION}" "${BUILD_DATE}"

if [[ -f CHANGELOG.md ]]; then
  echo ""
  echo "📄 Extrait CHANGELOG :"
  awk "/^## \\[${NEW_VERSION}\\]/,/^---$/{if(/^---$/) exit; print}" CHANGELOG.md || true
  echo ""
fi

execute_cmd "git add ${ROOT_PACKAGE} ${WEB_PACKAGE} ${VERSION_TXT} CHANGELOG.md CHANGELOG_FR.md" "Indexation fichiers version"
execute_cmd "git commit -m \"chore(v2): bump version to ${NEW_VERSION} for production release\"" "Commit sur staging"

if [[ "${DRY_RUN}" == false ]]; then
  execute_cmd "git push origin ${HATCAST_V2_BRANCH_STAGING}" "Push staging"
fi

if [[ "${DRY_RUN}" == true ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    execute_cmd "git stash push -m 'dry-run-temp'" "Stash avant changement de branche"
    stashed_before_switch=true
  fi
  execute_cmd "git checkout ${DRY_PRODUCTION}" "Checkout sandbox production"
  execute_cmd "git merge ${DRY_STAGING} --no-ff -m \"release(v2): version ${NEW_VERSION}\"" "Merge staging → production (sandbox)"
else
  execute_cmd "git checkout ${HATCAST_V2_BRANCH_PRODUCTION}" "Checkout production"
  execute_cmd "git pull origin ${HATCAST_V2_BRANCH_PRODUCTION}" "Pull production"
  execute_cmd "git merge ${HATCAST_V2_BRANCH_STAGING} --no-ff -m \"release(v2): version ${NEW_VERSION}

Merge ${HATCAST_V2_BRANCH_STAGING} to ${HATCAST_V2_BRANCH_PRODUCTION}
- Version: ${NEW_VERSION}
- Build: ${BUILD_DATE}
- Hash: ${GIT_HASH}\"" "Merge staging → production"
fi

RELEASE_TAG_NAME="v${NEW_VERSION}"
if [[ "${DRY_RUN}" == true ]]; then
  RELEASE_TAG_NAME="v${NEW_VERSION}-dry-run-$(date +%Y%m%d%H%M%S)"
fi
execute_cmd "git tag -a \"${RELEASE_TAG_NAME}\" -m \"Release V2 ${NEW_VERSION} (${BUILD_DATE}, ${GIT_HASH})\"" "Tag ${RELEASE_TAG_NAME}"

if [[ "${DRY_RUN}" == false ]]; then
  execute_cmd "git push origin ${HATCAST_V2_BRANCH_PRODUCTION}" "Push production"
  execute_cmd "git push origin \"v${NEW_VERSION}\"" "Push tag"
  echo "🔄 Rebase ${HATCAST_V2_BRANCH_STAGING} sur ${HATCAST_V2_BRANCH_PRODUCTION}…"
  execute_cmd "git checkout ${HATCAST_V2_BRANCH_STAGING}" "Checkout staging"
  execute_cmd "git rebase ${HATCAST_V2_BRANCH_PRODUCTION}" "Rebase staging"
  execute_cmd "git push origin ${HATCAST_V2_BRANCH_STAGING}" "Push staging synchronisée"
else
  execute_cmd "git checkout ${DRY_STAGING}" "Retour sandbox staging"
fi

ACTIONS_URL="$(hatcast_v2_github_actions_url)"

if [[ "${DRY_RUN}" == true ]]; then
  echo ""
  echo "✅ DRY RUN terminé — ${CURRENT_VERSION} → ${NEW_VERSION}"
  echo "📊 En réel : push ${HATCAST_V2_BRANCH_PRODUCTION} + tag v${NEW_VERSION} → CI production"
else
  echo ""
  echo "✅ Release initiée — version ${NEW_VERSION}"
  echo "🌐 CI : ${ACTIONS_URL}"
  echo "☁️  Service Cloud Run : hatcast-v2 (branche ${HATCAST_V2_BRANCH_PRODUCTION})"
fi

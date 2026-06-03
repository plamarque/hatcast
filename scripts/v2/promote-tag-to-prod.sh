#!/usr/bin/env bash
# Promote a validated staging RC lineage to production semver tag.
# Deploy is triggered by GitHub Actions on tag push (OPS-5).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${SCRIPT_DIR}/lib/git-branches.sh"
# shellcheck source=../lib/version-changelog.sh
source "${SCRIPT_DIR}/../lib/version-changelog.sh"

hatcast_v2_detect_project_root

DRY_RUN=false
EXPLICIT_VERSION=""
EXPLICIT_RC_TAG=""
FORCE=false

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Promote a staging RC lineage to production tag vX.Y.Z.
This script only creates/pushes tags. Production deploy is handled by CI on tag push.

Façade développeur : ./scripts/deploy_prod.sh (auto-detect dernier RC)

Options:
  --version=X.Y.Z   Required semver target (example: 2.0.0)
  --rc-tag=vX.Y.Z-rc.N
                    Optional explicit RC source tag (default: latest RC for --version)
  --dry-run, -n     Simulation only (no tag creation/push)
  --force           Allow replacing a mismatched local tag (never rewrites remote tags)
  --help, -h        Show this help
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --version=*) EXPLICIT_VERSION="${arg#*=}" ;;
    --rc-tag=*) EXPLICIT_RC_TAG="${arg#*=}" ;;
    --dry-run|-n) DRY_RUN=true ;;
    --force) FORCE=true ;;
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

if [[ -z "${EXPLICIT_VERSION}" ]]; then
  echo "❌ --version=X.Y.Z est obligatoire." >&2
  exit 1
fi

if [[ ! "${EXPLICIT_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ --version invalide : ${EXPLICIT_VERSION} (attendu X.Y.Z)." >&2
  exit 1
fi

if [[ -n "${EXPLICIT_RC_TAG}" ]] && [[ ! "${EXPLICIT_RC_TAG}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+$ ]]; then
  echo "❌ --rc-tag invalide : ${EXPLICIT_RC_TAG}" >&2
  exit 1
fi

if [[ "${DRY_RUN}" == false ]]; then
  hatcast_v2_assert_clean
fi
hatcast_v2_fetch

BASE_VERSION="${EXPLICIT_VERSION}"
PROD_TAG="v${BASE_VERSION}"

if [[ -n "${EXPLICIT_RC_TAG}" ]]; then
  RC_TAG="${EXPLICIT_RC_TAG}"
else
  RC_TAG="$(hatcast_latest_rc_tag "${BASE_VERSION}" || true)"
fi

if [[ -z "${RC_TAG}" ]]; then
  echo "❌ Aucun tag RC trouvé pour ${BASE_VERSION} (attendu: v${BASE_VERSION}-rc.N)." >&2
  exit 1
fi

read -r RC_BASE RC_NUM <<< "$(hatcast_parse_rc_tag "${RC_TAG}")"
if [[ "${RC_BASE}" != "${BASE_VERSION}" ]]; then
  echo "❌ RC tag ${RC_TAG} ne correspond pas à la version cible ${BASE_VERSION}." >&2
  exit 1
fi

if ! git rev-parse --verify "${RC_TAG}^{commit}" >/dev/null 2>&1; then
  echo "❌ Tag RC introuvable localement : ${RC_TAG}" >&2
  exit 1
fi

RC_COMMIT="$(git rev-list -n 1 "${RC_TAG}")"
TAG_MESSAGE="Release V2 ${BASE_VERSION} promoted from ${RC_TAG}"

REMOTE_RC_COMMIT="$(git ls-remote --tags origin "refs/tags/${RC_TAG}^{}" | awk '{print $1}' | sed -n '1p')"
if [[ -z "${REMOTE_RC_COMMIT}" ]]; then
  REMOTE_RC_COMMIT="$(git ls-remote --tags origin "refs/tags/${RC_TAG}" | awk '{print $1}' | sed -n '1p')"
fi
if [[ -z "${REMOTE_RC_COMMIT}" ]]; then
  echo "❌ Le tag RC ${RC_TAG} n'existe pas sur origin." >&2
  echo "   Refus de promouvoir un tag uniquement local." >&2
  exit 1
fi
if [[ "${REMOTE_RC_COMMIT}" != "${RC_COMMIT}" ]]; then
  echo "❌ Le tag RC local ${RC_TAG} diverge d'origin (${REMOTE_RC_COMMIT})." >&2
  echo "   Veuillez synchroniser les tags avant promotion." >&2
  exit 1
fi

STAGING_REMOTE_REF="$(hatcast_v2_origin_ref "${HATCAST_V2_BRANCH_STAGING}")"
if ! git rev-parse --verify "${STAGING_REMOTE_REF}^{commit}" >/dev/null 2>&1; then
  echo "❌ Référence distante de staging introuvable : ${STAGING_REMOTE_REF}" >&2
  exit 1
fi
if ! git merge-base --is-ancestor "${RC_COMMIT}" "${STAGING_REMOTE_REF}"; then
  echo "❌ Le commit RC ${RC_COMMIT} n'appartient pas à la lignée ${STAGING_REMOTE_REF}." >&2
  echo "   Promotion refusée: RC non validé dans la lignée staging." >&2
  exit 1
fi

remote_prod_exists=false
if git ls-remote --tags origin "refs/tags/${PROD_TAG}" | rg -q .; then
  remote_prod_exists=true
fi

local_prod_exists=false
if git rev-parse --verify "${PROD_TAG}^{commit}" >/dev/null 2>&1; then
  local_prod_exists=true
fi

if [[ "${remote_prod_exists}" == true ]]; then
  REMOTE_COMMIT="$(git ls-remote --tags origin "refs/tags/${PROD_TAG}^{}" | awk '{print $1}' | head -1)"
  if [[ -z "${REMOTE_COMMIT}" ]]; then
    REMOTE_COMMIT="$(git ls-remote --tags origin "refs/tags/${PROD_TAG}" | awk '{print $1}' | head -1)"
  fi
  if [[ "${REMOTE_COMMIT}" != "${RC_COMMIT}" ]]; then
    echo "❌ Le tag distant ${PROD_TAG} existe déjà sur un autre commit (${REMOTE_COMMIT})." >&2
    echo "   Refus de réécrire un tag distant." >&2
    exit 1
  fi
fi

if [[ "${local_prod_exists}" == true ]]; then
  LOCAL_COMMIT="$(git rev-list -n 1 "${PROD_TAG}")"
  if [[ "${LOCAL_COMMIT}" != "${RC_COMMIT}" ]]; then
    if [[ "${FORCE}" == true && "${remote_prod_exists}" == false ]]; then
      echo "⚠️  Remplacement du tag local ${PROD_TAG} (FORCE) -> ${RC_COMMIT}"
      git tag -d "${PROD_TAG}" >/dev/null
      local_prod_exists=false
    else
      echo "❌ Le tag local ${PROD_TAG} existe déjà sur un autre commit (${LOCAL_COMMIT})." >&2
      echo "   Utilisez --force uniquement si le tag n'existe pas sur origin." >&2
      exit 1
    fi
  fi
fi

echo "📋 Promotion OPS-5"
echo "  - Version cible : ${BASE_VERSION}"
echo "  - Tag RC source : ${RC_TAG}"
echo "  - Commit source : ${RC_COMMIT}"
echo "  - Tag prod      : ${PROD_TAG}"

if [[ "${DRY_RUN}" == true ]]; then
  if [[ "${local_prod_exists}" == false && "${remote_prod_exists}" == false ]]; then
    echo "🧪 DRY RUN: git tag -a \"${PROD_TAG}\" \"${RC_COMMIT}\" -m \"${TAG_MESSAGE}\""
  else
    echo "🧪 DRY RUN: ${PROD_TAG} déjà présent et aligné sur ${RC_COMMIT}"
  fi
  echo "🧪 DRY RUN: git push origin \"${PROD_TAG}\""
  echo "🌐 Actions: $(hatcast_v2_github_actions_url)"
  exit 0
fi

if [[ "${local_prod_exists}" == false && "${remote_prod_exists}" == false ]]; then
  git tag -a "${PROD_TAG}" "${RC_COMMIT}" -m "${TAG_MESSAGE}"
fi

if [[ "${remote_prod_exists}" == false ]]; then
  # Re-check distant state just before push to make concurrent runs idempotent.
  REMOTE_PUSH_COMMIT="$(git ls-remote --tags origin "refs/tags/${PROD_TAG}^{}" | awk '{print $1}' | sed -n '1p')"
  if [[ -z "${REMOTE_PUSH_COMMIT}" ]]; then
    REMOTE_PUSH_COMMIT="$(git ls-remote --tags origin "refs/tags/${PROD_TAG}" | awk '{print $1}' | sed -n '1p')"
  fi
  if [[ -n "${REMOTE_PUSH_COMMIT}" ]]; then
    if [[ "${REMOTE_PUSH_COMMIT}" != "${RC_COMMIT}" ]]; then
      echo "❌ Le tag distant ${PROD_TAG} a été créé entre-temps sur un autre commit (${REMOTE_PUSH_COMMIT})." >&2
      exit 1
    fi
    echo "ℹ️  Tag distant ${PROD_TAG} déjà présent et conforme; pas de push nécessaire."
  else
    git push origin "${PROD_TAG}"
  fi
else
  echo "ℹ️  Tag distant ${PROD_TAG} déjà présent et conforme; pas de push nécessaire."
fi

echo "✅ Promotion terminée: ${RC_TAG} -> ${PROD_TAG}"
echo "🌐 Suivre le déploiement: $(hatcast_v2_github_actions_url)"

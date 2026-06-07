#!/usr/bin/env bash
# OPS-11 — Promouvoir le dernier RC staging en prod (tag vX.Y.Z auto-detect).
# Façade : scripts/v2/promote-tag-to-prod.sh + gh workflow pour --redeploy

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=v2/lib/git-branches.sh
source "${SCRIPT_DIR}/v2/lib/git-branches.sh"
# shellcheck source=lib/version-changelog.sh
source "${SCRIPT_DIR}/lib/version-changelog.sh"

hatcast_v2_detect_project_root

DRY_RUN=false
REDEPLOY=false
FORWARD_ARGS=()

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Promouvoir le **dernier tag RC distant** (vX.Y.Z-rc.N) vers production (tag vX.Y.Z).
Aucun --version ni --rc-tag requis.

Workflow développeur :
  ./scripts/deploy_staging.sh
  ./scripts/release_version.sh [--patch|--minor|--major]
  # recette staging…
  ./scripts/deploy_prod.sh

Options :
  --redeploy      Re-déclencher le deploy Cloud Run prod pour le tag prod courant (sans nouveau tag)
  --no-github-release
                  Ne pas créer la GitHub Release (tag prod uniquement)
  --force         Remplacer un tag prod local divergent (transmis à promote-tag-to-prod.sh ; jamais de réécriture distante)
  --dry-run, -n   Simulation (inclut preview des notes GitHub Release)
  --help, -h      Aide

Implémentation : scripts/v2/promote-tag-to-prod.sh
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --dry-run|-n) DRY_RUN=true; FORWARD_ARGS+=("${arg}") ;;
    --redeploy) REDEPLOY=true ;;
    --help|-h)
      usage
      exit 0
      ;;
    --version=*|--rc-tag=*)
      echo "❌ ${arg%%=*} n’est plus nécessaire — le script détecte le dernier RC distant." >&2
      exit 1
      ;;
    --force|--no-github-release)
      FORWARD_ARGS+=("${arg}")
      ;;
    *)
      echo "❌ Option inconnue : ${arg}" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "${REDEPLOY}" == true && "${DRY_RUN}" == true ]]; then
  echo "🧪 DRY RUN — redeploy prod"
fi

hatcast_v2_fetch

if [[ "${REDEPLOY}" == true ]]; then
  PROD_TAG="$(hatcast_latest_remote_release_tag || true)"
  if [[ -z "${PROD_TAG}" ]]; then
    echo "❌ Aucun tag prod vX.Y.Z sur origin — lancez ./scripts/deploy_prod.sh d’abord." >&2
    exit 1
  fi

  echo "📦 deploy_prod — redeploy ${PROD_TAG}"
  if [[ "${DRY_RUN}" == true ]]; then
    echo "🧪 DRY RUN: gh workflow run deploy-v2-cloud-run.yml --ref ${PROD_TAG}"
    exit 0
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "❌ gh CLI requis pour --redeploy (brew install gh)." >&2
    exit 1
  fi

  gh workflow run deploy-v2-cloud-run.yml --ref "${PROD_TAG}"
  echo "✅ Workflow prod déclenché pour ${PROD_TAG}"
  echo "🌐 Suivre : $(hatcast_v2_github_actions_url)"
  exit 0
fi

RC_TAG="$(hatcast_latest_remote_rc_tag || true)"
if [[ -z "${RC_TAG}" ]]; then
  echo "❌ Aucun tag RC vX.Y.Z-rc.N sur origin." >&2
  echo "   Lancez d’abord : ./scripts/release_version.sh" >&2
  exit 1
fi

read -r BASE_VERSION _rc_num <<< "$(hatcast_parse_rc_tag "${RC_TAG}")"
PROD_TAG="v${BASE_VERSION}"

RC_COMMIT="$(hatcast_remote_tag_commit "${RC_TAG}")"
if [[ -z "${RC_COMMIT}" ]]; then
  echo "❌ Impossible de résoudre le commit du tag RC ${RC_TAG} sur origin." >&2
  exit 1
fi

PROD_COMMIT="$(hatcast_remote_tag_commit "${PROD_TAG}")"
if [[ -n "${PROD_COMMIT}" && "${PROD_COMMIT}" != "${RC_COMMIT}" ]]; then
  NEXT_VERSION="$(hatcast_bump_semver "${BASE_VERSION}" "patch" "")"
  echo "❌ Prod figée sur ${PROD_TAG} (commit ${PROD_COMMIT:0:12})." >&2
  echo "   Dernier RC staging : ${RC_TAG} (${RC_COMMIT:0:12})." >&2
  echo "" >&2
  echo "   Le tag prod ${PROD_TAG} est déjà pris sur un autre commit : impossible de promouvoir ce RC sous la même semver." >&2
  echo "   Pour avancer avec une nouvelle version produit :" >&2
  echo "     ./scripts/release_version.sh --patch   # → v${NEXT_VERSION}-rc.1" >&2
  echo "     # recette staging, puis ./scripts/deploy_prod.sh" >&2
  echo "" >&2
  echo "   → Pour redéployer la prod actuelle sans nouveau tag :" >&2
  echo "     ./scripts/deploy_prod.sh --redeploy" >&2
  exit 1
fi

echo "📦 deploy_prod — ${RC_TAG} → ${PROD_TAG}"
echo "   Commit : ${RC_COMMIT:0:12}"
echo ""

# Bash 3.2 (macOS) + set -u : ne pas expandre un tableau vide avec "${arr[@]}".
if ((${#FORWARD_ARGS[@]} > 0)); then
  exec "${SCRIPT_DIR}/v2/promote-tag-to-prod.sh" \
    --version="${BASE_VERSION}" \
    --rc-tag="${RC_TAG}" \
    "${FORWARD_ARGS[@]}"
else
  exec "${SCRIPT_DIR}/v2/promote-tag-to-prod.sh" \
    --version="${BASE_VERSION}" \
    --rc-tag="${RC_TAG}"
fi

#!/usr/bin/env bash
# OPS-11 — Release semver staging (auto-detect RC, pas de --version manuel).
# Façade : scripts/v2/release-staging.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=v2/lib/git-branches.sh
source "${SCRIPT_DIR}/v2/lib/git-branches.sh"

hatcast_v2_detect_project_root

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Release staging V2 : bump semver, changelog, tag vX.Y.Z-rc.N, push staging.

Sans option bump : incrémente uniquement le numéro RC (ex. rc.3 → rc.4).
Avec --patch|--minor|--major : bump la version produit et repart à rc.1.

Prérequis : smoke E2E staging vert après ./scripts/deploy_staging.sh

Options :
  --patch, --minor, --major   Bump semver produit
  --dry-run, -n               Simulation
  --no-user-changelog         Ne pas modifier apps/web/public/changelog.json
  --help, -h                  Aide

Implémentation : scripts/v2/release-staging.sh
EOF
}

FORWARD_ARGS=()
for arg in "$@"; do
  case "${arg}" in
    --help|-h)
      usage
      exit 0
      ;;
    --version=*)
      echo "❌ --version= n’est plus nécessaire — le script détecte la semver depuis les tags distants." >&2
      echo "   Première RC cutover : contactez ops ou utilisez scripts/v2/release-staging.sh --version=X.Y.Z une fois." >&2
      exit 1
      ;;
    *)
      FORWARD_ARGS+=("${arg}")
      ;;
  esac
done

is_dry_run=false
for arg in "${FORWARD_ARGS[@]}"; do
  if [[ "${arg}" == "--dry-run" || "${arg}" == "-n" ]]; then
    is_dry_run=true
    break
  fi
done

current="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

if [[ "${is_dry_run}" == false ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ L’arbre de travail n’est pas propre — committez ou stash avant release." >&2
    exit 1
  fi

  if [[ "${current}" == "${HATCAST_V2_BRANCH_DEV}" ]]; then
    echo "ℹ️  Bascule sur ${HATCAST_V2_BRANCH_STAGING} pour la release…"
    hatcast_v2_fetch
    git checkout "${HATCAST_V2_BRANCH_STAGING}"
    git pull origin "${HATCAST_V2_BRANCH_STAGING}"
  elif [[ "${current}" != "${HATCAST_V2_BRANCH_STAGING}" ]]; then
    echo "❌ Branche courante : ${current} — attendu ${HATCAST_V2_BRANCH_DEV} ou ${HATCAST_V2_BRANCH_STAGING}." >&2
    exit 1
  fi
fi

echo "📦 release_version — semver staging (auto-detect tags distants)"
echo ""

"${SCRIPT_DIR}/v2/release-staging.sh" "${FORWARD_ARGS[@]}"
exit_code=$?

if [[ "${is_dry_run}" == false && "${current}" == "${HATCAST_V2_BRANCH_DEV}" ]]; then
  git checkout "${HATCAST_V2_BRANCH_DEV}" 2>/dev/null || true
  echo "↩️  Retour sur ${HATCAST_V2_BRANCH_DEV}"
fi

exit "${exit_code}"

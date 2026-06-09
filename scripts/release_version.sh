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

Notes « Nouveautés » : cutover requis dans
  scripts/v2/changelog-entries/vX.Y.Z-cutover.json
  (skill Cursor hatcast-v2-release recommandée — voir AGENTS.md)

Options :
  --patch, --minor, --major   Bump semver produit
  --dry-run, -n               Simulation
  --no-user-changelog         Ne pas modifier apps/web/public/changelog.json
  --help, -h                  Aide

Implémentation : scripts/v2/release-staging.sh
EOF
}

FORWARD_ARGS=()
is_dry_run=false
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
    --dry-run|-n)
      is_dry_run=true
      FORWARD_ARGS+=("${arg}")
      ;;
    *)
      FORWARD_ARGS+=("${arg}")
      ;;
  esac
done

if [[ "${is_dry_run}" == false ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ L’arbre de travail n’est pas propre — committez ou stash avant release." >&2
    exit 1
  fi
fi

echo "📦 release_version — semver staging (auto-detect tags distants)"
echo ""

# Bash 3.2 (macOS) + set -u : ne pas expandre un tableau vide avec "${arr[@]}".
if ((${#FORWARD_ARGS[@]} > 0)); then
  "${SCRIPT_DIR}/v2/release-staging.sh" "${FORWARD_ARGS[@]}"
else
  "${SCRIPT_DIR}/v2/release-staging.sh"
fi

exit $?

#!/usr/bin/env bash
# OPS-11 — Pousser dev → staging (merge + E2E smoke + deploy Cloud Run staging).
# Façade : scripts/v2/promote-to-staging.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=v2/lib/git-branches.sh
source "${SCRIPT_DIR}/v2/lib/git-branches.sh"

hatcast_v2_detect_project_root

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Merge la branche dev V2 dans staging, push, et déclenche la CI staging (E2E + Cloud Run).

Exécute d’abord les E2E locaux (./scripts/run_e2e.sh) — parité gate CI e2e-smoke.

Workflow développeur :
  git push origin v2          # dev cloud
  ./scripts/deploy_staging.sh # E2E locaux + staging + E2E CI
  ./scripts/release_version.sh [--patch|--minor|--major]  # après smoke vert

Options (transmises au script interne) :
  --dry-run, -n   Simulation
  --ff-only       Merge fast-forward uniquement
  --skip-e2e      Ne pas lancer les E2E locaux avant le push (déconseillé)
  --help, -h      Aide

Implémentation : scripts/v2/promote-to-staging.sh
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --help|-h)
      usage
      exit 0
      ;;
  esac
done

current="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [[ "${current}" != "${HATCAST_V2_BRANCH_DEV}" && "${current}" != "${HATCAST_V2_BRANCH_STAGING}" ]]; then
  echo "⚠️  Branche courante : ${current} (habituellement ${HATCAST_V2_BRANCH_DEV})." >&2
fi

echo "📦 deploy_staging — promotion ${HATCAST_V2_BRANCH_DEV} → ${HATCAST_V2_BRANCH_STAGING}"
echo ""

exec "${SCRIPT_DIR}/v2/promote-to-staging.sh" "$@"

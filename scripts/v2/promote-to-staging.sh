#!/usr/bin/env bash
# Fusionne origin/DEV → branche staging V2 et pousse (déclenche CI Cloud Run staging).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${SCRIPT_DIR}/lib/git-branches.sh"

hatcast_v2_detect_project_root

DRY_RUN=false
FF_ONLY=false

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Promouvoir le développement V2 vers staging : merge origin/$HATCAST_V2_BRANCH_DEV
dans $HATCAST_V2_BRANCH_STAGING puis push (workflow Deploy V2 → environnement staging).

Façade développeur : ./scripts/deploy_staging.sh

Options:
  --dry-run, -n   Afficher les commits et commandes sans exécuter
  --ff-only       Merge fast-forward uniquement (défaut : --no-ff)
  --help, -h      Cette aide

Configuration : scripts/v2/branches.env
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --dry-run|-n) DRY_RUN=true ;;
    --ff-only) FF_ONLY=true ;;
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

DEV_REF="$(hatcast_v2_origin_ref "${HATCAST_V2_BRANCH_DEV}")"
STAGING_REF="$(hatcast_v2_origin_ref "${HATCAST_V2_BRANCH_STAGING}")"

if [[ "${DRY_RUN}" == true ]]; then
  echo "🔍 DRY RUN — promotion vers staging V2"
  echo "   DEV=${HATCAST_V2_BRANCH_DEV}  STAGING=${HATCAST_V2_BRANCH_STAGING}"
  hatcast_v2_fetch
else
  echo "🚀 Promotion V2 : ${HATCAST_V2_BRANCH_DEV} → ${HATCAST_V2_BRANCH_STAGING}"
  hatcast_v2_assert_clean
  hatcast_v2_fetch
fi

if ! git rev-parse --verify "${DEV_REF}" >/dev/null 2>&1; then
  echo "❌ Référence introuvable : ${DEV_REF}" >&2
  exit 1
fi
if ! git rev-parse --verify "${STAGING_REF}" >/dev/null 2>&1; then
  echo "❌ Référence introuvable : ${STAGING_REF}" >&2
  echo "💡 Créer la branche : git checkout -b ${HATCAST_V2_BRANCH_STAGING} ${HATCAST_V2_BRANCH_DEV} && git push -u origin ${HATCAST_V2_BRANCH_STAGING}" >&2
  exit 1
fi

COMMIT_COUNT="$(git rev-list --count "${STAGING_REF}..${DEV_REF}" 2>/dev/null || echo 0)"
if [[ "${COMMIT_COUNT}" -eq 0 ]]; then
  echo "✅ Aucun commit sur ${DEV_REF} absent de ${STAGING_REF} — rien à promouvoir."
  exit 0
fi

echo ""
echo "📋 ${COMMIT_COUNT} commit(s) à intégrer :"
git log --oneline "${STAGING_REF}..${DEV_REF}"
echo ""

MERGE_FLAG="--no-ff"
if [[ "${FF_ONLY}" == true ]]; then
  MERGE_FLAG="--ff-only"
fi

if [[ "${DRY_RUN}" == true ]]; then
  echo "📝 Commandes qui seraient exécutées :"
  echo "   git checkout ${HATCAST_V2_BRANCH_STAGING}"
  echo "   git pull origin ${HATCAST_V2_BRANCH_STAGING}"
  echo "   git merge ${MERGE_FLAG} ${DEV_REF} -m \"chore(v2): promote ${HATCAST_V2_BRANCH_DEV} to ${HATCAST_V2_BRANCH_STAGING}\""
  echo "   git push origin ${HATCAST_V2_BRANCH_STAGING}"
  echo "   git checkout ${HATCAST_V2_BRANCH_DEV}"
  echo ""
  echo "⏳ Après le push : attendre le smoke E2E vert avant ./scripts/release_version.sh"
  echo ""
  echo "✅ DRY RUN terminé."
  exit 0
fi

git checkout "${HATCAST_V2_BRANCH_STAGING}"
git pull origin "${HATCAST_V2_BRANCH_STAGING}"
git merge ${MERGE_FLAG} "${DEV_REF}" -m "chore(v2): promote ${HATCAST_V2_BRANCH_DEV} to ${HATCAST_V2_BRANCH_STAGING}"
git push origin "${HATCAST_V2_BRANCH_STAGING}"

ACTIONS_URL="$(hatcast_v2_github_actions_url)"
echo ""
echo "✅ Push effectué sur origin/${HATCAST_V2_BRANCH_STAGING}"
echo "🌐 Suivre le déploiement : ${ACTIONS_URL}"
echo "☁️  Service Cloud Run attendu : hatcast-v2-staging (environnement GitHub « staging »)"
echo "⏳ Attendre le smoke E2E vert avant ./scripts/release_version.sh"

git checkout "${HATCAST_V2_BRANCH_DEV}"
echo "↩️  Retour sur la branche ${HATCAST_V2_BRANCH_DEV}"

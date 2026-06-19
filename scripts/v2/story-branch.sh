#!/usr/bin/env bash
# HatCast V2 — branche Git dédiée par user story BMad.
#
# Usage:
#   ./scripts/v2/story-branch.sh start STORY_KEY   # fetch origin, créer ou checkout feat/STORY_KEY depuis origin/v2
#   ./scripts/v2/story-branch.sh assert STORY_KEY  # vérifier qu'on est sur feat/STORY_KEY (HALT sinon)
#   ./scripts/v2/story-branch.sh merge STORY_KEY   # merge --no-ff feat/STORY_KEY → v2 (local, sans push)
#   ./scripts/v2/story-branch.sh status STORY_KEY    # afficher branche courante vs attendue

set -euo pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/git-branches.sh
source "${_script_dir}/lib/git-branches.sh"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> <story-key>

Commands:
  start STORY_KEY   Fetch origin, créer ou basculer sur feat/STORY_KEY depuis origin/\${HATCAST_V2_BRANCH_DEV}
  assert STORY_KEY  Vérifier que HEAD est feat/STORY_KEY (code 1 sinon)
  merge STORY_KEY   Merge --no-ff feat/STORY_KEY dans \${HATCAST_V2_BRANCH_DEV} (local, arbre propre requis)
  status STORY_KEY  Afficher branche courante, baseline, divergences éventuelles

Exemple:
  ./scripts/v2/story-branch.sh start 17-43-event-detail-contexte-infos

Convention : branche feat/{story-key}, intégration sur \${HATCAST_V2_BRANCH_DEV:-v2} après code review.
EOF
}

require_story_key() {
  local story_key="$1"
  if [[ -z "${story_key}" ]]; then
    echo "❌ story_key requis (ex. 17-43-event-detail-contexte-infos)" >&2
    usage >&2
    exit 1
  fi
  if [[ "${story_key}" =~ [[:space:]/] ]]; then
    echo "❌ story_key invalide : « ${story_key} »" >&2
    exit 1
  fi
}

start_story_branch() {
  local story_key="$1"
  local branch dev_ref current

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  dev_ref="$(hatcast_v2_dev_ref)"

  hatcast_v2_fetch

  if ! git rev-parse --verify "${dev_ref}" >/dev/null 2>&1; then
    echo "❌ ${dev_ref} introuvable — vérifiez le remote origin et la branche dev (${HATCAST_V2_BRANCH_DEV})" >&2
    exit 1
  fi

  current="$(git rev-parse --abbrev-ref HEAD)"

  if [[ "${current}" == "${branch}" ]]; then
    echo "✅ Déjà sur ${branch}"
    _print_branch_metadata "${branch}" "${dev_ref}"
    return 0
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ Arbre de travail non propre — committez ou stashez avant de basculer vers ${branch} :" >&2
    git status --short >&2
    exit 1
  fi

  if git show-ref --verify --quiet "refs/heads/${branch}"; then
    echo "↪ Bascule sur branche existante ${branch}"
    git checkout "${branch}"
  elif git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
    echo "↪ Branche distante trouvée — checkout ${branch} (tracking origin/${branch})"
    git checkout -b "${branch}" "origin/${branch}"
  else
    echo "🌿 Création de ${branch} depuis ${dev_ref}"
    git checkout -b "${branch}" "${dev_ref}"
  fi

  echo "✅ Branche story prête : ${branch}"
  _print_branch_metadata "${branch}" "${dev_ref}"
}

assert_story_branch() {
  local story_key="$1"
  local branch current

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  current="$(git rev-parse --abbrev-ref HEAD)"

  if [[ "${current}" != "${branch}" ]]; then
    echo "❌ Branche courante : ${current} — attendu : ${branch}" >&2
    echo "💡 Exécutez : ./scripts/v2/story-branch.sh start ${story_key}" >&2
    exit 1
  fi

  echo "✅ Sur ${branch}"
  _print_branch_metadata "${branch}" "$(hatcast_v2_dev_ref)"
}

merge_story_branch() {
  local story_key="$1"
  local branch dev current merge_msg

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  hatcast_v2_assert_clean

  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  dev="${HATCAST_V2_BRANCH_DEV}"
  merge_msg="feat(story): merge ${story_key}"

  if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
    echo "❌ Branche locale ${branch} introuvable — rien à merger." >&2
    exit 1
  fi

  hatcast_v2_fetch

  current="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "${current}" != "${branch}" ]]; then
    git checkout "${branch}"
  fi

  echo "🔀 Merge ${branch} → ${dev} (local, sans push automatique)…"
  git checkout "${dev}"
  git pull origin "${dev}"
  git merge --no-ff "${branch}" -m "${merge_msg}"

  echo "✅ ${branch} mergée dans ${dev} (local)."
  echo "ℹ️  Prochaine étape manuelle : git push origin ${dev}"
  echo "ℹ️  Optionnel : git branch -d ${branch} && git push origin --delete ${branch}"
}

status_story_branch() {
  local story_key="$1"
  local branch dev_ref current ahead behind

  require_story_key "${story_key}"
  hatcast_v2_detect_project_root
  branch="$(hatcast_v2_story_branch_name "${story_key}")"
  dev_ref="$(hatcast_v2_dev_ref)"
  current="$(git rev-parse --abbrev-ref HEAD)"

  echo "Story key      : ${story_key}"
  echo "Branche attendue: ${branch}"
  echo "Branche courante: ${current}"
  echo "Dev ref        : ${dev_ref}"

  if git show-ref --verify --quiet "refs/heads/${branch}"; then
    _print_branch_metadata "${branch}" "${dev_ref}"
    if git rev-parse --verify "${dev_ref}" >/dev/null 2>&1; then
      ahead="$(git rev-list --count "${dev_ref}..${branch}" 2>/dev/null || echo 0)"
      behind="$(git rev-list --count "${branch}..${dev_ref}" 2>/dev/null || echo 0)"
      echo "Commits ahead of ${dev_ref}: ${ahead}"
      echo "Commits behind ${dev_ref}: ${behind}"
      if [[ "${behind}" != "0" ]]; then
        echo "⚠️  Rebase recommandé : git fetch origin && git checkout ${branch} && git rebase ${dev_ref}"
      fi
    fi
  else
    echo "Branche locale ${branch} : absente"
  fi
}

_print_branch_metadata() {
  local branch="$1"
  local dev_ref="$2"
  echo "FEATURE_BRANCH=${branch}"
  echo "BASELINE_COMMIT=$(git rev-parse HEAD)"
  if git rev-parse --verify "${dev_ref}" >/dev/null 2>&1; then
    echo "DEV_REF=${dev_ref}"
    echo "DEV_HEAD=$(git rev-parse "${dev_ref}")"
  fi
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

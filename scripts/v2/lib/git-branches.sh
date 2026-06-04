#!/usr/bin/env bash
# HatCast V2 — configuration des branches et helpers Git partagés.

set -euo pipefail

_hatcast_v2_lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_hatcast_v2_scripts_dir="$(cd "${_hatcast_v2_lib_dir}/.." && pwd)"

# Variables déjà exportées avant l’appel du script (tests / CI) priment sur branches.env.
_hatcast_v2_env_dev="${HATCAST_V2_BRANCH_DEV-}"
_hatcast_v2_env_staging="${HATCAST_V2_BRANCH_STAGING-}"

_branches_env="${_hatcast_v2_scripts_dir}/branches.env"
if [[ -f "${_branches_env}" ]]; then
  # shellcheck source=/dev/null
  source "${_branches_env}"
elif [[ -f "${_hatcast_v2_scripts_dir}/branches.env.example" ]]; then
  # shellcheck source=/dev/null
  source "${_hatcast_v2_scripts_dir}/branches.env.example"
else
  echo "❌ Fichier branches.env introuvable dans ${_hatcast_v2_scripts_dir}" >&2
  exit 1
fi

[[ -n "${_hatcast_v2_env_dev}" ]] && HATCAST_V2_BRANCH_DEV="${_hatcast_v2_env_dev}"
[[ -n "${_hatcast_v2_env_staging}" ]] && HATCAST_V2_BRANCH_STAGING="${_hatcast_v2_env_staging}"

HATCAST_V2_BRANCH_DEV="${HATCAST_V2_BRANCH_DEV:-v2}"
HATCAST_V2_BRANCH_STAGING="${HATCAST_V2_BRANCH_STAGING:-staging-v2}"

for _var in HATCAST_V2_BRANCH_DEV HATCAST_V2_BRANCH_STAGING; do
  _val="${!_var}"
  if [[ -z "${_val}" || "${_val}" =~ [[:space:]] ]]; then
    echo "❌ ${_var} invalide : « ${_val} »" >&2
    exit 1
  fi
done

hatcast_v2_detect_project_root() {
  local root
  root="$(git -C "${_hatcast_v2_scripts_dir}" rev-parse --show-toplevel 2>/dev/null)" || {
    echo "❌ Ce dépôt n’est pas un clone Git" >&2
    exit 1
  }
  if [[ ! -f "${root}/package.json" ]]; then
    echo "❌ package.json introuvable à la racine du dépôt" >&2
    exit 1
  fi
  cd "${root}"
  export HATCAST_V2_PROJECT_ROOT="${root}"
}

hatcast_v2_fetch() {
  echo "📡 git fetch origin…"
  git fetch origin
  echo "📡 git fetch --tags origin…"
  git fetch --tags origin
}

hatcast_v2_assert_clean() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ L’arbre de travail n’est pas propre :" >&2
    git status
    exit 1
  fi
}

hatcast_v2_assert_branch() {
  local expected="$1"
  local current
  current="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "${current}" != "${expected}" ]]; then
    echo "❌ Branche courante : ${current} — attendu : ${expected}" >&2
    exit 1
  fi
}

hatcast_v2_origin_ref() {
  local branch="$1"
  echo "origin/${branch}"
}

hatcast_v2_github_actions_url() {
  local remote slug
  remote="$(git config --get remote.origin.url 2>/dev/null || true)"
  slug="$(echo "${remote}" | sed -E 's#.*github\.com[:/]([^/]+/[^/.]+).*#\1#')"
  if [[ -n "${slug}" && "${slug}" != "${remote}" ]]; then
    echo "https://github.com/${slug}/actions"
  else
    echo "(voir l’onglet Actions du dépôt GitHub)"
  fi
}

HATCAST_V2_ORIGINAL_BRANCH=""

hatcast_v2_remember_current_branch() {
  HATCAST_V2_ORIGINAL_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
}

hatcast_v2_restore_remembered_branch() {
  local current
  if [[ -z "${HATCAST_V2_ORIGINAL_BRANCH}" ]]; then
    return 0
  fi
  current="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if [[ "${current}" == "${HATCAST_V2_ORIGINAL_BRANCH}" ]]; then
    return 0
  fi
  echo "↩️  Retour sur ${HATCAST_V2_ORIGINAL_BRANCH}…"
  git checkout "${HATCAST_V2_ORIGINAL_BRANCH}" 2>/dev/null || true
}

# Checkout staging-v2 (pull) from v2 or staging-v2 — no manual branch switch needed.
hatcast_v2_prepare_staging_worktree() {
  local current
  current="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

  if [[ "${current}" == "${HATCAST_V2_BRANCH_STAGING}" ]]; then
    git pull origin "${HATCAST_V2_BRANCH_STAGING}"
    return 0
  fi

  if [[ "${current}" == "${HATCAST_V2_BRANCH_DEV}" ]]; then
    echo "ℹ️  Bascule sur ${HATCAST_V2_BRANCH_STAGING} pour la release…"
    git checkout "${HATCAST_V2_BRANCH_STAGING}"
    git pull origin "${HATCAST_V2_BRANCH_STAGING}"
    return 0
  fi

  echo "❌ Branche courante : ${current} — attendu ${HATCAST_V2_BRANCH_DEV} ou ${HATCAST_V2_BRANCH_STAGING}." >&2
  exit 1
}

# Leave the worktree on dev with origin pulled — resume coding without manual git steps.
hatcast_v2_checkout_dev_updated() {
  echo ""
  echo "↩️  Prêt pour le dev sur ${HATCAST_V2_BRANCH_DEV} (version.txt, changelog.json à jour)…"
  git checkout "${HATCAST_V2_BRANCH_DEV}"
  git pull origin "${HATCAST_V2_BRANCH_DEV}"
  HATCAST_V2_ORIGINAL_BRANCH="${HATCAST_V2_BRANCH_DEV}"
}

# After release-staging.sh: merge staging-v2 → dev so version.txt, changelog.json and
# package.json bumps are available on the dev branch (local ng serve, next promote cycle).
hatcast_v2_sync_release_artifacts_to_dev() {
  local dry_run="$1"
  local release_tag_name="$2"
  local dev_ref staging_ref merge_msg

  dev_ref="$(hatcast_v2_origin_ref "${HATCAST_V2_BRANCH_DEV}")"
  staging_ref="$(hatcast_v2_origin_ref "${HATCAST_V2_BRANCH_STAGING}")"
  merge_msg="chore(v2): sync release ${release_tag_name} artifacts to ${HATCAST_V2_BRANCH_DEV}"

  if [[ "${dry_run}" == true ]]; then
    echo ""
    echo "🔄 Sync ${HATCAST_V2_BRANCH_STAGING} → ${HATCAST_V2_BRANCH_DEV} (version.txt, changelog.json) :"
    echo "   git checkout ${HATCAST_V2_BRANCH_DEV}"
    echo "   git pull origin ${HATCAST_V2_BRANCH_DEV}"
    echo "   git merge --no-ff ${staging_ref} -m \"${merge_msg}\""
    echo "   git push origin ${HATCAST_V2_BRANCH_DEV}"
    echo "   git checkout ${HATCAST_V2_BRANCH_DEV}"
    echo "   git pull origin ${HATCAST_V2_BRANCH_DEV}"
    return 0
  fi

  if ! git rev-parse --verify "${staging_ref}" >/dev/null 2>&1; then
    echo "⚠️  ${staging_ref} introuvable — sync dev ignorée." >&2
    return 0
  fi

  echo ""
  echo "🔄 Synchronisation version/changelog vers ${HATCAST_V2_BRANCH_DEV}…"
  git checkout "${HATCAST_V2_BRANCH_DEV}"
  git pull origin "${HATCAST_V2_BRANCH_DEV}"

  if git merge-base --is-ancestor "${staging_ref}" HEAD; then
    echo "ℹ️  ${HATCAST_V2_BRANCH_DEV} contient déjà ${staging_ref} — rien à synchroniser."
    hatcast_v2_checkout_dev_updated
    return 0
  fi

  git merge --no-ff "${staging_ref}" -m "${merge_msg}"
  git push origin "${HATCAST_V2_BRANCH_DEV}"
  echo "✅ ${HATCAST_V2_BRANCH_DEV} synchronisé (version.txt, changelog.json, package.json)"
  hatcast_v2_checkout_dev_updated
}

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

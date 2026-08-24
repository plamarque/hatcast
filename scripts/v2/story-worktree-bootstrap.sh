#!/usr/bin/env bash
# Provision and validate the pinned standard BMad workflows for one unit.

set -euo pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bmad-runtime.env
source "${_script_dir}/bmad-runtime.env"

usage() { echo "Usage: $(basename "$0") [--verify] [--allow-network] <unit-worktree-path>" >&2; }

validate_root() {
  local root="$1"
  local required=(
    "$root/_bmad/scripts/memlog.py"
    "$root/_bmad/custom/config.toml"
    "$root/_bmad/custom/story-branch-workflow.md"
    "$root/.agents/skills/bmad-create-story/SKILL.md"
    "$root/.agents/skills/bmad-dev-story/SKILL.md"
    "$root/.agents/skills/bmad-code-review/SKILL.md"
  )
  local path skill
  for path in "${required[@]}"; do
    if [[ ! -f "${path}" ]]; then
      echo "ERROR: incomplete BMad runtime; required file is missing: ${path}" >&2
      return 1
    fi
  done
  for skill in bmad-create-story bmad-dev-story bmad-code-review; do
    if ! grep -Fqx "name: ${skill}" "$root/.agents/skills/${skill}/SKILL.md"; then
      echo "ERROR: standard BMad skill declaration is invalid: ${skill}" >&2
      return 1
    fi
  done
  if ! grep -Fqx "installation:" "$root/_bmad/_config/manifest.yaml" || ! grep -Fqx "  version: ${HATCAST_BMAD_RUNTIME_VERSION}" "$root/_bmad/_config/manifest.yaml"; then
    echo "ERROR: pinned BMad ${HATCAST_BMAD_RUNTIME_VERSION} is not recorded in the manifest." >&2
    return 1
  fi
}

provision_standard_bmad() {
  local root="$1"
  if [[ -n "${HATCAST_BMAD_PROVISIONER:-}" ]]; then
    if [[ "${HATCAST_BMAD_TEST_MODE:-0}" != "1" ]]; then
      echo "ERROR: HATCAST_BMAD_PROVISIONER is test-only; set HATCAST_BMAD_TEST_MODE=1 in an isolated test." >&2
      return 1
    fi
    bash "${HATCAST_BMAD_PROVISIONER}" "${root}" "${HATCAST_BMAD_RUNTIME_VERSION}"
    return
  fi
  if [[ "${HATCAST_BMAD_ALLOW_NETWORK:-0}" != "1" ]]; then
    echo "NETWORK_CONFIRMATION_REQUIRED=Set HATCAST_BMAD_ALLOW_NETWORK=1 to download ${HATCAST_BMAD_PACKAGE}@${HATCAST_BMAD_RUNTIME_VERSION} and its pinned modules for this unit." >&2
    return 1
  fi
  echo "NETWORK_PROVISIONING=${HATCAST_BMAD_PACKAGE}@${HATCAST_BMAD_RUNTIME_VERSION} modules=${HATCAST_BMAD_MODULES}" >&2
  npx --yes "${HATCAST_BMAD_PACKAGE}@${HATCAST_BMAD_RUNTIME_VERSION}" install \
    --directory "${root}" \
    --modules "${HATCAST_BMAD_MODULES}" \
    --tools "${HATCAST_BMAD_TOOLS}" \
    --action install \
    --all-stable \
    --pin "bmb=${HATCAST_BMAD_PIN_BMB}" \
    --pin "cis=${HATCAST_BMAD_PIN_CIS}" \
    --pin "tea=${HATCAST_BMAD_PIN_TEA}" \
    --communication-language French \
    --document-output-language English \
    --output-folder _bmad-output \
    --yes
}

main() {
  local verify=false allow_network=false root
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --verify) verify=true ;;
      --allow-network) allow_network=true ;;
      *) break ;;
    esac
    shift
  done
  root="${1:-}"
  [[ -n "${root}" && $# -eq 1 ]] || { usage; exit 1; }
  root="$(cd "${root}" && pwd)"
  [[ -f "${root}/package.json" ]] || { echo "ERROR: not a HatCast worktree: ${root}" >&2; exit 1; }

  if [[ "${verify}" == false ]]; then
    if [[ "${allow_network}" == true ]]; then export HATCAST_BMAD_ALLOW_NETWORK=1; fi
    provision_standard_bmad "${root}"
  fi
  validate_root "${root}"
  printf 'BMAD_RUNTIME_SOURCE=pinned-installer\n'
  printf 'BMAD_RUNTIME_VERSION=%s\n' "${HATCAST_BMAD_RUNTIME_VERSION}"
  printf 'BMAD_RUNTIME_VERIFICATION=passed\n'
}

main "$@"

#!/usr/bin/env bash
# Inspect or prepare the local runtime for one isolated HatCast unit worktree.
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
usage() { echo "Usage: $(basename "$0") [inspect|prepare]" >&2; }
state() { printf '%s=%s\n' "$1" "$2"; }
has_command() { command -v "$1" >/dev/null 2>&1; }
browser_cache() { if [[ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ]]; then printf '%s\n' "${PLAYWRIGHT_BROWSERS_PATH}"; elif [[ "$(uname -s)" == Darwin ]]; then printf '%s\n' "${HOME}/Library/Caches/ms-playwright"; else printf '%s\n' "${HOME}/.cache/ms-playwright"; fi; }
node_npm_state() { local v; has_command node && has_command npm || { echo unavailable; return; }; v="$(node --version 2>/dev/null || true)"; [[ "${v}" =~ ^v([0-9]+) ]] && (( BASH_REMATCH[1] >= 20 )) && echo ready || echo unavailable; }
jdk_state() { local v; has_command java || { echo unavailable; return; }; v="$(java -version 2>&1 | sed -nE '1s/.*version "([0-9]+).*/\1/p')"; [[ "${v}" =~ ^[0-9]+$ ]] && (( v >= 21 )) && echo ready || echo unavailable; }
e2e_files_state() { [[ -f "${root}/package-lock.json" && -f "${root}/apps/web/package.json" && -x "${root}/services/api/gradlew" ]] && echo ready || echo unavailable; }
python_state() { has_command python3 && python3 -c 'import os' >/dev/null 2>&1 && echo ready || echo unavailable; }
browser_ready() { compgen -G "$(browser_cache)/chromium-*/INSTALLATION_COMPLETE" >/dev/null 2>&1; }
unit_valid() {
  [[ -n "${root}" && -f "${root}/package.json" && "$(git -C "${root}" rev-parse --show-toplevel 2>/dev/null || true)" == "${root}" && "$(git -C "${root}" branch --show-current 2>/dev/null || true)" == feat/* ]] || return 1
  git -C "${root}" worktree list --porcelain | awk -v expected="${root}" '/^worktree / { path = substr($0, 10) } /^branch refs\/heads\/feat\// && path == expected { found = 1 } END { exit(found ? 0 : 1) }'
}
integration_env() {
  local path=""
  while IFS= read -r line; do case "${line}" in 'worktree '*) path="${line#worktree }" ;; 'branch refs/heads/v2') [[ -f "${path}/.env" ]] && { printf '%s\n' "${path}/.env"; return 0; } ;; esac; done < <(git -C "${root}" worktree list --porcelain)
  return 1
}
environment_state() {
  local source target canonical
  source="$(integration_env 2>/dev/null || true)"
  if [[ -e "${root}/.env" || -L "${root}/.env" ]]; then
    [[ -L "${root}/.env" && -e "${root}/.env" && -n "${source}" ]] || { echo conflict; return; }
    target="$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "${root}/.env" 2>/dev/null || true)"
    canonical="$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "${source}" 2>/dev/null || true)"
    [[ -n "${target}" && "${target}" == "${canonical}" ]] && echo linked || echo conflict
  elif [[ -n "${source}" ]]; then echo available; else echo source-unavailable; fi
}
port_state() {
  local rc
  has_command lsof || { echo unknown; return; }
  if lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; then rc=0; else rc=$?; fi
  [[ ${rc} -eq 0 ]] && { echo unavailable; return; }
  [[ ${rc} -eq 1 ]] && echo free || echo unknown
}
bmad_state() { bash "${script_dir}/story-worktree-bootstrap.sh" --verify "${root}" >/dev/null 2>&1 && echo ready || echo unavailable; }
inspect() {
  local ready=true value key
  state MODE inspect
  if ! unit_valid; then state WORKTREE invalid; state READINESS not-ready; return 1; fi
  state WORKTREE valid
  for key in BMAD NODE_NPM JDK E2E_FILES PYTHON; do
    case "${key}" in BMAD) value="$(bmad_state)" ;; NODE_NPM) value="$(node_npm_state)" ;; JDK) value="$(jdk_state)" ;; E2E_FILES) value="$(e2e_files_state)" ;; PYTHON) value="$(python_state)" ;; esac
    state "${key}" "${value}"; [[ "${value}" == ready ]] || ready=false
  done
  if [[ -d "${root}/node_modules" && -f "${root}/node_modules/.package-lock.json" ]]; then state DEPENDENCIES ready; else state DEPENDENCIES missing; ready=false; fi
  if browser_ready; then state CHROMIUM ready; else state CHROMIUM missing; ready=false; fi
  value="$(environment_state)"; state ENVIRONMENT "${value}"; [[ "${value}" == linked ]] || ready=false
  for key in 8080 4200; do value="$(port_state "${key}")"; state "PORT_${key}" "${value}"; [[ "${value}" == free ]] || ready=false; done
  state E2E_PROFILE 'PLAYWRIGHT_REUSE_SERVERS=0'
  [[ "${ready}" == true ]] && { state READINESS ready; return 0; }; state READINESS not-ready; return 1
}
prepare_failure() { inspect || true; state PREPARATION "$1"; return 1; }
link_environment() {
  local source relative
  source="$(integration_env)" || return 1
  relative="$(python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1],sys.argv[2]))' "${source}" "${root}" 2>/dev/null)" || return 1
  [[ -n "${relative}" ]] && ln -s "${relative}" "${root}/.env"
}
prepare() {
  local env check port
  unit_valid || { prepare_failure invalid-worktree; return 1; }
  env="$(environment_state)"
  [[ "${env}" == conflict ]] && { prepare_failure environment-conflict; return 1; }
  [[ "${env}" == source-unavailable ]] && { prepare_failure environment-source-unavailable; return 1; }
  for check in bmad_state node_npm_state jdk_state e2e_files_state python_state; do [[ "$(${check})" == ready ]] || { prepare_failure preconditions-unavailable; return 1; }; done
  for port in 8080 4200; do [[ "$(port_state "${port}")" == free ]] || { prepare_failure ports-unavailable; return 1; }; done
  [[ "${env}" == linked ]] || { link_environment || { prepare_failure environment-link-failed; return 1; }; }
  (cd "${root}" && npm ci >/dev/null 2>&1) || { prepare_failure dependencies-failed; return 1; }
  (cd "${root}/apps/web" && npx playwright install chromium >/dev/null 2>&1) || { prepare_failure chromium-failed; return 1; }
  inspect && { state PREPARATION ready; return 0; }; state PREPARATION not-ready; return 1
}
mode="${1:-inspect}"; [[ $# -le 1 ]] || { usage; exit 2; }
case "${mode}" in inspect) inspect ;; prepare) prepare ;; --help|-h) usage ;; *) usage; exit 2 ;; esac

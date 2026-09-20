#!/usr/bin/env bash
# Measure, but do not publish or consume, a safe dependency-tree materialization.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
cleanup_tmp=""

state() { printf '%s=%s\n' "$1" "$2"; }
fail() { state CODE "$1"; state FEASIBILITY no-go; exit "${2:-2}"; }
usage() { echo "Usage: $(basename "$0") evaluate" >&2; }

unit_valid() {
  [[ -n "${root}" && -f "${root}/.git" && -f "${root}/package.json" && -f "${root}/package-lock.json" ]] || return 1
  [[ "$(git -C "${root}" branch --show-current 2>/dev/null || true)" == feat/* ]] || return 1
  git -C "${root}" worktree list --porcelain | awk -v expected="${root}" '
    /^worktree / { path = substr($0, 10) }
    /^branch refs\/heads\/feat\// && path == expected { found = 1 }
    END { exit(found ? 0 : 1) }'
}
dependency_inputs_clean() {
  git -C "${root}" diff --quiet -- package-lock.json .npmrc &&
    git -C "${root}" diff --cached --quiet -- package-lock.json .npmrc
}

elapsed_ms() {
  local start="$1" end
  end="$(python3 -c 'import time; print(time.monotonic_ns())')"
  printf '%s\n' "$(((end - start) / 1000000))"
}
storage_kib() { du -sk "$1" 2>/dev/null | awk 'NR == 1 { print $1 }'; }
archive_repo() { git -C "${root}" archive --format=tar HEAD | tar -xf - -C "$1"; }
run_npm_ci() { (cd "$1" && npm ci --no-audit --no-fund >/dev/null); }

evaluate() {
  local tmp baseline source materialization baseline_start baseline_ms source_start source_ms
  local before during after method="unsupported" candidate_ms="" candidate_kib="" source_kib=""
  local probe_source probe_materialization
  unit_valid || fail DC_INVALID_WORKTREE
  dependency_inputs_clean || fail DC_DIRTY_DEPENDENCY_INPUTS
  command -v npm >/dev/null 2>&1 || fail DC_NPM_UNAVAILABLE
  command -v python3 >/dev/null 2>&1 || fail DC_MEASUREMENT_UNAVAILABLE
  command -v git >/dev/null 2>&1 || fail DC_GIT_UNAVAILABLE
  command -v tar >/dev/null 2>&1 || fail DC_TAR_UNAVAILABLE
  command -v shasum >/dev/null 2>&1 || fail DC_SHASUM_UNAVAILABLE
  command -v cp >/dev/null 2>&1 || fail DC_COPY_UNAVAILABLE
  [[ -z "${WORKTREE_DEPENDENCY_CACHE_REPORT:-}" ]] || fail DC_REPORT_TARGET_UNSAFE

  tmp="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-worktree-dependency-cache.XXXXXX")" || fail DC_TEMPORARY_DIRECTORY_FAILED
  cleanup_tmp="${tmp}"
  trap 'rm -rf -- "${cleanup_tmp}"' EXIT
  mkdir -p "${tmp}/baseline" "${tmp}/source" "${tmp}/materialization" "${tmp}/npm-cache"
  archive_repo "${tmp}/baseline" || fail DC_ARCHIVE_FAILED 1
  baseline_start="$(python3 -c 'import time; print(time.monotonic_ns())')"
  NPM_CONFIG_CACHE="${tmp}/npm-cache" run_npm_ci "${tmp}/baseline" || fail DC_BASELINE_NPM_CI_FAILED 1
  baseline_ms="$(elapsed_ms "${baseline_start}")"
  archive_repo "${tmp}/source" || fail DC_ARCHIVE_FAILED 1
  source_start="$(python3 -c 'import time; print(time.monotonic_ns())')"
  NPM_CONFIG_CACHE="${tmp}/npm-cache" run_npm_ci "${tmp}/source" || fail DC_SOURCE_NPM_CI_FAILED 1
  source_ms="$(elapsed_ms "${source_start}")"
  source_kib="$(storage_kib "${tmp}/source/node_modules" || true)"

  # This existing file is intentionally copied with node_modules.  Editing it
  # through the materialization detects both a tree symlink and a hard-linked
  # file, without hashing every package file (which would dominate the timing).
  probe_source="${tmp}/source/node_modules/.hatcast-cow-probe/nested/write-check"
  probe_materialization="${tmp}/materialization/node_modules/.hatcast-cow-probe/nested/write-check"
  mkdir -p "$(dirname "${probe_source}")"
  printf 'source-original\n' >"${probe_source}"
  before="$(shasum "${probe_source}" | awk '{print $1}')" || fail DC_PROBE_FAILED 1
  if candidate_start="$(python3 -c 'import time; print(time.monotonic_ns())')" && cp -cR "${tmp}/source/node_modules" "${tmp}/materialization/node_modules" 2>/dev/null; then
    candidate_ms="$(elapsed_ms "${candidate_start}")"
    printf 'materialization-mutated\n' >"${probe_materialization}"
    during="$(shasum "${probe_source}" | awk '{print $1}')" || fail DC_PROBE_FAILED 1
    after="$(shasum "${probe_source}" | awk '{print $1}')" || fail DC_PROBE_FAILED 1
    candidate_kib="$(storage_kib "${tmp}/materialization/node_modules" || true)"
    if [[ "${before}" == "${during}" && "${before}" == "${after}" ]]; then method="clone-requested"; fi
  fi

  state MODE evaluate
  state BASELINE_NPM_CI_MS "${baseline_ms}"
  state SOURCE_NPM_CI_MS "${source_ms}"
  state COPY_METHOD "${method}"
  state COPY_MS "${candidate_ms:-unavailable}"
  state SOURCE_STORAGE_KIB "${source_kib:-unavailable}"
  state MATERIALIZATION_STORAGE_KIB "${candidate_kib:-unavailable}"
  if [[ "${method}" == clone-requested ]]; then
    state ISOLATION passed
    state FEASIBILITY go
  else
    state ISOLATION failed
    state FEASIBILITY no-go
  fi
}

[[ $# -eq 1 ]] || { usage; exit 2; }
case "$1" in evaluate) evaluate ;; --help|-h) usage ;; *) usage; exit 2 ;; esac

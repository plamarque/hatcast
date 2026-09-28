#!/usr/bin/env bash
# Measure, but do not publish or consume, a safe dependency-tree materialization.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
cleanup_tmp=""

state() { printf '%s=%s\n' "$1" "$2"; }
fail() { state CODE "$1"; state FEASIBILITY no-go; exit "${2:-2}"; }
usage() { echo "Usage: $(basename "$0") identity WORKTREE | prepare CACHE_ROOT WORKTREE | detach CACHE_ROOT WORKTREE | evaluate | symlink-hit CACHE_ROOT WORKTREE | probe-npm-ci CACHE_ROOT WORKTREE" >&2; }

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

path_inside() {
  python3 -c 'import os,sys
root=os.path.realpath(sys.argv[1]); candidate=os.path.realpath(sys.argv[2])
sys.exit(0 if os.path.commonpath([root, candidate]) == root else 1)' "$1" "$2"
}

# Production snapshots are intentionally only consumed here.  A future owner
# publishes `${CACHE_ROOT}/${identity}/node_modules` and writes the matching
# identity to `${CACHE_ROOT}/${identity}/.hatcast-worktree-dependency-cache`.
# This script never creates or changes either file.
identity() {
  local worktree="$1" lock_hash node_version npm_version
  [[ -d "${worktree}" && -f "${worktree}/package-lock.json" ]] || return 1
  command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 || return 1
  lock_hash="$(shasum -a 256 "${worktree}/package-lock.json" 2>/dev/null | awk '{print $1}')" || return 1
  node_version="$(node --version 2>/dev/null || true)"
  npm_version="$(npm --version 2>/dev/null || true)"
  [[ "${lock_hash}" =~ ^[0-9a-f]{64}$ && "${node_version}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+ && "${npm_version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]] || return 1
  printf 'lock-%s-node-%s-npm-%s\n' "${lock_hash}" "${node_version#v}" "${npm_version}"
}
cache_root_canonical() {
  local cache_root="$1"
  [[ -n "${cache_root}" && -d "${cache_root}" && ! -L "${cache_root}" ]] || return 1
  python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "${cache_root}" 2>/dev/null
}
tree_immutable() {
  local tree="$1"
  [[ -d "${tree}" && ! -L "${tree}" ]] || return 1
  ! find -P "${tree}" \( -perm -200 -o -perm -020 -o -perm -002 \) -print -quit | grep -q .
}
external_entries_safe() {
  local source="$1"
  # Workspace entries are deliberately replaced by links into the consuming
  # worktree. Every other symlink, including nested package links, must stay
  # in the immutable snapshot before we expose or copy it.
  python3 - "${source}" <<'PY'
import os, sys
source = os.path.realpath(sys.argv[1])
for directory, dirs, files in os.walk(source, followlinks=False):
    for name in dirs + files:
        path = os.path.join(directory, name)
        relative = os.path.relpath(path, source)
        if relative == "hatcast-legacy" or relative.startswith("@hatcast" + os.sep):
            continue
        if os.path.islink(path):
            resolved = os.path.realpath(path)
            if os.path.commonpath([source, resolved]) != source:
                raise SystemExit(1)
PY
}
workspace_links() {
  local worktree="$1"
  node -e '
const fs = require("fs"), path = require("path");
const root = process.argv[1], pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json")));
const workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces && pkg.workspaces.packages;
if (!Array.isArray(workspaces)) process.exit(1);
for (const directory of workspaces) {
  if (typeof directory !== "string" || directory.includes("*") || path.isAbsolute(directory)) process.exit(1);
  const workspaceRoot = path.resolve(root, directory);
  if (path.relative(root, workspaceRoot).startsWith(".." + path.sep)) process.exit(1);
  const child = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json")));
  if (typeof child.name !== "string" || !/^(@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)$/i.test(child.name)) process.exit(1);
  process.stdout.write(`${child.name}\t${directory}\n`);
}' "${worktree}"
}
create_workspace_links() {
  local worktree="$1" target="$2" package directory link parent relative
  while IFS=$'\t' read -r package directory; do
    [[ -n "${package}" && -n "${directory}" && -d "${worktree}/${directory}" ]] || return 1
    link="${target}/${package}"
    parent="$(dirname "${link}")"
    mkdir -p "${parent}" || return 1
    relative="$(python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1],sys.argv[2]))' "${worktree}/${directory}" "${parent}")" || return 1
    ln -s "${relative}" "${link}" || return 1
  done < <(workspace_links "${worktree}")
}
snapshot_source() {
  local supplied_root="$1" worktree="$2" canonical_root key snapshot metadata modules
  canonical_root="$(cache_root_canonical "${supplied_root}")" || return 1
  key="$(identity "${worktree}")" || return 1
  snapshot="${canonical_root}/${key}"
  metadata="${snapshot}/.hatcast-worktree-dependency-cache"
  modules="${snapshot}/node_modules"
  [[ -d "${snapshot}" && ! -L "${snapshot}" && -f "${metadata}" && ! -L "${metadata}" ]] || return 1
  [[ "$(cat "${metadata}" 2>/dev/null || true)" == "${key}" ]] || return 1
  path_inside "${canonical_root}" "${snapshot}" || return 1
  path_inside "${canonical_root}" "${modules}" || return 1
  tree_immutable "${snapshot}" || return 1
  tree_immutable "${modules}" || return 1
  external_entries_safe "${modules}" || return 1
  printf '%s\n' "${modules}"
}
prepare_snapshot() {
  local cache_root="$1" worktree="$2" source target entry name
  target="${worktree}/node_modules"
  [[ ! -e "${target}" && ! -L "${target}" ]] || { state CACHE_HIT unavailable; return 3; }
  source="$(snapshot_source "${cache_root}" "${worktree}")" || { state CACHE_HIT unavailable; return 3; }
  mkdir "${target}" || { state CODE DC_OVERLAY_DIRECTORY_FAILED; return 1; }
  for entry in "${source}"/* "${source}"/.[!.]*; do
    [[ -e "${entry}" || -L "${entry}" ]] || continue
    name="${entry##*/}"
    [[ "${name}" == '@hatcast' || "${name}" == 'hatcast-legacy' ]] && continue
    ln -s "${entry}" "${target}/${name}" || { rm -rf -- "${target}"; state CODE DC_OVERLAY_LINK_FAILED; return 1; }
  done
  create_workspace_links "${worktree}" "${target}" || { rm -rf -- "${target}"; state CODE DC_OVERLAY_WORKSPACE_FAILED; return 1; }
  printf '%s\n' "$(identity "${worktree}")" >"${target}/.hatcast-worktree-dependency-overlay" || { rm -rf -- "${target}"; state CODE DC_OVERLAY_MARKER_FAILED; return 1; }
  state CACHE_HIT overlay
}
cache_source() {
  local cache_root="$1" source="${1}/node_modules"
  [[ -d "${cache_root}" && -f "${source}/.package-lock.json" ]] || return 1
  path_inside "${cache_root}" "${source}" || return 1
  printf '%s\n' "${source}"
}
symlink_hit() {
  local cache_root="$1" worktree="$2" source target start ms
  source="$(cache_source "${cache_root}")" || fail DC_CACHE_INVALID
  [[ -d "${worktree}" && ! -e "${worktree}/node_modules" && ! -L "${worktree}/node_modules" ]] || fail DC_WORKTREE_TARGET_CONFLICT
  target="${worktree}/node_modules"
  start="$(python3 -c 'import time; print(time.monotonic_ns())')"
  ln -s "${source}" "${target}" || fail DC_LINK_FAILED 1
  ms="$(elapsed_ms "${start}")"
  state MODE symlink-hit
  state CACHE_HIT linked
  state LINK_MS "${ms}"
  state FEASIBILITY go
}
probe_npm_ci() {
  local cache_root="$1" worktree="$2" source target before after link_state rc
  source="$(cache_source "${cache_root}")" || fail DC_CACHE_INVALID
  target="${worktree}/node_modules"
  [[ -L "${target}" ]] || fail DC_WORKTREE_LINK_REQUIRED
  path_inside "${cache_root}" "${target}" || fail DC_LINK_OUTSIDE_CACHE
  before="$(shasum "${source}/.hatcast-cache-sentinel" | awk '{print $1}')" || fail DC_SENTINEL_MISSING
  set +e
  (cd "${worktree}" && npm ci --ignore-scripts --no-audit --no-fund >/dev/null)
  rc=$?
  set -e
  after="$(shasum "${source}/.hatcast-cache-sentinel" | awk '{print $1}')" || fail DC_SENTINEL_MISSING
  [[ -L "${target}" ]] && link_state=retained || link_state=replaced
  state MODE probe-npm-ci
  state NPM_CI_LINK "${link_state}"
  [[ ${rc} -eq 0 ]] && state NPM_CI_RESULT succeeded || state NPM_CI_RESULT refused
  if [[ "${before}" == "${after}" ]]; then state SNAPSHOT unchanged; state FEASIBILITY go; else state SNAPSHOT mutated; state FEASIBILITY no-go; fi
}
detach() {
  local cache_root="$1" worktree="$2" source target staging backup entry name
  source="$(snapshot_source "${cache_root}" "${worktree}")" || fail DC_CACHE_INVALID
  target="${worktree}/node_modules"
  [[ -d "${target}" && ! -L "${target}" && -f "${target}/.hatcast-worktree-dependency-overlay" && "$(cat "${target}/.hatcast-worktree-dependency-overlay")" == "$(identity "${worktree}")" ]] || fail DC_WORKTREE_OVERLAY_REQUIRED
  staging="${worktree}/.node_modules.detach.$$"
  [[ ! -e "${staging}" && ! -L "${staging}" ]] || fail DC_DETACH_STAGING_CONFLICT
  mkdir "${staging}" || fail DC_DETACH_STAGING_FAILED 1
  # Do not dereference the snapshot's own workspace links: they are relative
  # to its original producer. Copy only cache-backed dependencies, then build
  # fresh workspace links below for this worktree.
  for entry in "${source}"/* "${source}"/.[!.]*; do
    [[ -e "${entry}" || -L "${entry}" ]] || continue
    name="${entry##*/}"
    [[ "${name}" == '@hatcast' || "${name}" == 'hatcast-legacy' ]] && continue
    cp -RL "${entry}" "${staging}/${name}" || { rm -rf -- "${staging}"; fail DC_DETACH_COPY_FAILED 1; }
  done
  chmod -R u+w "${staging}" || { rm -rf -- "${staging}"; fail DC_DETACH_WRITABLE_FAILED 1; }
  create_workspace_links "${worktree}" "${staging}" || { rm -rf -- "${staging}"; fail DC_DETACH_WORKSPACE_FAILED 1; }
  backup="${worktree}/.node_modules.detach-backup.$$"
  mv "${target}" "${backup}" || fail DC_DETACH_REMOVE_FAILED 1
  if ! mv "${staging}" "${target}"; then
    mv "${backup}" "${target}" || true
    fail DC_DETACH_REPLACE_FAILED 1
  fi
  rm -rf -- "${backup}"
  state MODE detach
  state DETACH local-writable
  state FEASIBILITY go
}

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

case "$1" in
  identity) [[ $# -eq 2 ]] || { usage; exit 2; }; identity "$2" || exit 1 ;;
  prepare) [[ $# -eq 3 ]] || { usage; exit 2; }; prepare_snapshot "$2" "$3" ;;
  evaluate) [[ $# -eq 1 ]] || { usage; exit 2; }; evaluate ;;
  symlink-hit) [[ $# -eq 3 ]] || { usage; exit 2; }; symlink_hit "$2" "$3" ;;
  probe-npm-ci) [[ $# -eq 3 ]] || { usage; exit 2; }; probe_npm_ci "$2" "$3" ;;
  detach) [[ $# -eq 3 ]] || { usage; exit 2; }; detach "$2" "$3" ;;
  --help|-h) usage ;;
  *) usage; exit 2 ;;
esac

#!/usr/bin/env bash
set -euo pipefail

source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-dependency-cache-test.XXXXXX")"
trap 'chmod -R u+w "${tmp}" 2>/dev/null || true; rm -rf "${tmp}"' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
expect() { grep -Fqx -- "$2" "$1" || fail "missing $2"; }
expect_fail() { if "$@" >/dev/null 2>&1; then fail "unexpected success: $*"; fi; }

fixture="${tmp}/integration"; git init "${fixture}" >/dev/null
git -C "${fixture}" config user.email test@example.invalid; git -C "${fixture}" config user.name Test
mkdir -p "${fixture}/scripts/v2"; cp "${source_root}/scripts/v2/worktree-dependency-cache.sh" "${fixture}/scripts/v2/"
printf '{"name":"fixture","version":"1.0.0"}\n' >"${fixture}/package.json"
printf '{"name":"fixture","lockfileVersion":3,"packages":{"":{"name":"fixture","version":"1.0.0"}}}\n' >"${fixture}/package-lock.json"
git -C "${fixture}" add . && git -C "${fixture}" commit -m 'test: Add dependency fixture' >/dev/null
git -C "${fixture}" branch -M v2; git -C "${fixture}" worktree add -b feat/cache-unit "${fixture}-unit" >/dev/null
unit="${fixture}-unit"; evaluator="${unit}/scripts/v2/worktree-dependency-cache.sh"

bin="${tmp}/bin"; mkdir "${bin}"
printf '#!/usr/bin/env bash\nmkdir -p node_modules/pkg; printf dependency >node_modules/pkg/value\n' >"${bin}/npm"
printf '#!/usr/bin/env bash\n[[ "$1" == "-cR" ]] || exit 71\ncase "${CACHE_CP_MODE:-safe}" in unsupported) exit 1 ;; unsafe-link) /bin/ln -s "$2" "$3" ;; *) /bin/cp -R "$@" ;; esac\n' >"${bin}/cp"
chmod +x "${bin}/npm" "${bin}/cp"
env PATH="${bin}:${PATH}" bash "${evaluator}" evaluate >"${tmp}/safe.out"
expect "${tmp}/safe.out" 'MODE=evaluate'; expect "${tmp}/safe.out" 'COPY_METHOD=clone-requested'; expect "${tmp}/safe.out" 'ISOLATION=passed'; expect "${tmp}/safe.out" 'FEASIBILITY=go'
! grep -Fq "${unit}" "${tmp}/safe.out" || fail 'report leaked path'
[[ -z "$(git -C "${unit}" status --porcelain)" ]] || fail 'evaluation changed repository'
env PATH="${bin}:${PATH}" CACHE_CP_MODE=unsupported bash "${evaluator}" evaluate >"${tmp}/unsupported.out"
expect "${tmp}/unsupported.out" 'COPY_METHOD=unsupported'; expect "${tmp}/unsupported.out" 'ISOLATION=failed'; expect "${tmp}/unsupported.out" 'FEASIBILITY=no-go'
env PATH="${bin}:${PATH}" CACHE_CP_MODE=unsafe-link bash "${evaluator}" evaluate >"${tmp}/unsafe-link.out"
expect "${tmp}/unsafe-link.out" 'COPY_METHOD=unsupported'; expect "${tmp}/unsafe-link.out" 'ISOLATION=failed'; expect "${tmp}/unsafe-link.out" 'FEASIBILITY=no-go'
expect_fail env PATH="${bin}:${PATH}" WORKTREE_DEPENDENCY_CACHE_REPORT=unsafe bash "${evaluator}" evaluate
cp "${evaluator}" "${fixture}/scripts/v2/worktree-dependency-cache.sh"
expect_fail env PATH="${bin}:${PATH}" bash "${fixture}/scripts/v2/worktree-dependency-cache.sh" evaluate
git clone -q "${fixture}" "${fixture}-clone"
git -C "${fixture}-clone" checkout -qb feat/unregistered
expect_fail env PATH="${bin}:${PATH}" bash "${fixture}-clone/scripts/v2/worktree-dependency-cache.sh" evaluate

# Snapshot identity must change with each declared compatibility input.  These
# local command stubs keep the check independent from the installed versions.
identity_bin="${tmp}/identity-bin"; mkdir "${identity_bin}"
printf '#!/usr/bin/env bash\nprintf "v22.0.0\\n"\n' >"${identity_bin}/node"
printf '#!/usr/bin/env bash\nprintf "10.0.0\\n"\n' >"${identity_bin}/npm"
chmod +x "${identity_bin}/node" "${identity_bin}/npm"
identity_one="$(env PATH="${identity_bin}:${PATH}" bash "${evaluator}" identity "${unit}")"
printf ' ' >>"${unit}/package-lock.json"
identity_lock_changed="$(env PATH="${identity_bin}:${PATH}" bash "${evaluator}" identity "${unit}")"
[[ "${identity_one}" != "${identity_lock_changed}" ]] || fail 'lockfile did not change cache identity'
git -C "${unit}" checkout -- package-lock.json
printf '#!/usr/bin/env bash\nprintf "v23.0.0\\n"\n' >"${identity_bin}/node"
identity_node_changed="$(env PATH="${identity_bin}:${PATH}" bash "${evaluator}" identity "${unit}")"
[[ "${identity_one}" != "${identity_node_changed}" ]] || fail 'Node version did not change cache identity'
printf '#!/usr/bin/env bash\nprintf "v22.0.0\\n"\n' >"${identity_bin}/node"
printf '#!/usr/bin/env bash\nprintf "11.0.0\\n"\n' >"${identity_bin}/npm"
identity_npm_changed="$(env PATH="${identity_bin}:${PATH}" bash "${evaluator}" identity "${unit}")"
[[ "${identity_one}" != "${identity_npm_changed}" ]] || fail 'npm version did not change cache identity'

# Production consumption is exercised only in this disposable fixture. The
# snapshot layout is deliberately assembled here, never by production code.
cache_root="${tmp}/cache"; mkdir -p "${cache_root}" "${tmp}/symlink-unit"
mkdir -p "${tmp}/symlink-unit/legacy" "${tmp}/symlink-unit/apps/web"
printf '{"name":"symlink-fixture","version":"1.0.0","workspaces":["legacy","apps/web"]}\n' >"${tmp}/symlink-unit/package.json"
printf '{"name":"hatcast-legacy"}\n' >"${tmp}/symlink-unit/legacy/package.json"
printf '{"name":"@hatcast/web"}\n' >"${tmp}/symlink-unit/apps/web/package.json"
printf '{"name":"symlink-fixture","lockfileVersion":3,"packages":{"":{"name":"symlink-fixture","version":"1.0.0"}}}\n' >"${tmp}/symlink-unit/package-lock.json"
key="$(bash "${evaluator}" identity "${tmp}/symlink-unit")"
cache_snapshot="${cache_root}/${key}"; cache_modules="${cache_snapshot}/node_modules"
mkdir -p "${cache_modules}/pkg"
printf '%s\n' "${key}" >"${cache_snapshot}/.hatcast-worktree-dependency-cache"
printf 'immutable\n' >"${cache_modules}/.hatcast-cache-sentinel"
printf 'dependency\n' >"${cache_modules}/pkg/value"
mkdir -p "${cache_modules}/@hatcast"
ln -s ../../apps/web "${cache_modules}/@hatcast/web"
ln -s ../legacy "${cache_modules}/hatcast-legacy"
chmod -R a-w "${cache_snapshot}"
bash "${evaluator}" prepare "${cache_root}" "${tmp}/symlink-unit" >"${tmp}/hit.out"
expect "${tmp}/hit.out" 'CACHE_HIT=overlay'
[[ -d "${tmp}/symlink-unit/node_modules" && ! -L "${tmp}/symlink-unit/node_modules" ]] || fail 'cache hit did not create local overlay'
[[ -L "${tmp}/symlink-unit/node_modules/pkg" ]] || fail 'cache hit did not link dependency'
[[ "$(readlink "${tmp}/symlink-unit/node_modules/@hatcast/web")" == ../../apps/web ]] || fail 'workspace link did not resolve locally'
bash "${evaluator}" detach "${cache_root}" "${tmp}/symlink-unit" >"${tmp}/detach.out"
expect "${tmp}/detach.out" 'MODE=detach'; expect "${tmp}/detach.out" 'DETACH=local-writable'; expect "${tmp}/detach.out" 'FEASIBILITY=go'
[[ ! -L "${tmp}/symlink-unit/node_modules" ]] || fail 'detach retained symlink'
printf 'local-change\n' >"${tmp}/symlink-unit/node_modules/.hatcast-cache-sentinel"
[[ "$(cat "${cache_modules}/.hatcast-cache-sentinel")" == immutable ]] || fail 'local change mutated cache snapshot'
mkdir -p "${tmp}/local-install"; : >"${tmp}/local-install/.package-lock.json"
rm -rf "${tmp}/symlink-unit/node_modules"; mv "${tmp}/local-install" "${tmp}/symlink-unit/node_modules"
expect_fail bash "${evaluator}" detach "${cache_root}" "${tmp}/symlink-unit"
[[ -f "${tmp}/symlink-unit/node_modules/.package-lock.json" ]] || fail 'detach removed a normal local install'
rm -rf "${tmp}/symlink-unit/node_modules"
chmod u+w "${cache_snapshot}" "${cache_modules}"
mkdir -p "${tmp}/outside-package"; ln -s "${tmp}/outside-package" "${cache_modules}/escape"
expect_fail bash "${evaluator}" prepare "${cache_root}" "${tmp}/symlink-unit"
[[ ! -e "${tmp}/symlink-unit/node_modules" ]] || fail 'unsafe snapshot created an overlay'
rm "${cache_modules}/escape"; chmod a-w "${cache_snapshot}" "${cache_modules}"
rm -rf "${tmp}/symlink-unit/node_modules"
bash "${evaluator}" prepare "${cache_root}" "${tmp}/symlink-unit" >/dev/null
chmod u+w "${cache_snapshot}"; mv "${cache_snapshot}/.hatcast-worktree-dependency-cache" "${cache_snapshot}/metadata-hidden"
expect_fail bash "${evaluator}" detach "${cache_root}" "${tmp}/symlink-unit"
[[ -f "${tmp}/symlink-unit/node_modules/.hatcast-worktree-dependency-overlay" ]] || fail 'unsafe detach removed overlay'
mv "${cache_snapshot}/metadata-hidden" "${cache_snapshot}/.hatcast-worktree-dependency-cache"; chmod a-w "${cache_snapshot}"
fail_copy_bin="${tmp}/fail-copy-bin"; mkdir "${fail_copy_bin}"
printf '#!/usr/bin/env bash\nexit 1\n' >"${fail_copy_bin}/cp"; chmod +x "${fail_copy_bin}/cp"
expect_fail env PATH="${fail_copy_bin}:${PATH}" bash "${evaluator}" detach "${cache_root}" "${tmp}/symlink-unit"
[[ -f "${tmp}/symlink-unit/node_modules/.hatcast-worktree-dependency-overlay" ]] || fail 'failed copy removed overlay'
fail_move_bin="${tmp}/fail-move-bin"; mkdir "${fail_move_bin}"
printf '#!/usr/bin/env bash\ncount=0; [[ -f "${MOVE_COUNT}" ]] && count="$(cat "${MOVE_COUNT}")"; count=$((count + 1)); printf "%%s\\n" "${count}" >"${MOVE_COUNT}"; [[ "${count}" -eq 2 ]] && exit 1; /bin/mv "$@"\n' >"${fail_move_bin}/mv"; chmod +x "${fail_move_bin}/mv"
expect_fail env PATH="${fail_move_bin}:${PATH}" MOVE_COUNT="${tmp}/move-count" bash "${evaluator}" detach "${cache_root}" "${tmp}/symlink-unit"
[[ -f "${tmp}/symlink-unit/node_modules/.hatcast-worktree-dependency-overlay" ]] || fail 'failed replacement did not restore overlay'
outside="${tmp}/outside/node_modules"; mkdir -p "${outside}"; : >"${outside}/.package-lock.json"
rm -rf "${tmp}/symlink-unit/node_modules"; ln -s "${outside}" "${tmp}/symlink-unit/node_modules"
expect_fail bash "${evaluator}" prepare "${cache_root}" "${tmp}/symlink-unit"
[[ -L "${tmp}/symlink-unit/node_modules" ]] || fail 'invalid link was replaced'
[[ -z "$(find "${tmp}" -maxdepth 1 -name 'hatcast-worktree-dependency-cache.*' -print -quit)" ]] || fail 'temporary probe survived'
echo 'PASS: worktree dependency cache evaluator'

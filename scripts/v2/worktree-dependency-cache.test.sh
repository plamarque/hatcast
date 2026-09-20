#!/usr/bin/env bash
set -euo pipefail

source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-dependency-cache-test.XXXXXX")"
trap 'rm -rf "${tmp}"' EXIT
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
[[ -z "$(find "${tmp}" -maxdepth 1 -name 'hatcast-worktree-dependency-cache.*' -print -quit)" ]] || fail 'temporary probe survived'
echo 'PASS: worktree dependency cache evaluator'

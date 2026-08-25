#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/hatcast-runtime.XXXXXX")" && pwd)"
trap 'rm -rf "${tmp_root}"' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { if "$@" >/dev/null 2>&1; then fail "command unexpectedly succeeded: $*"; fi; }
expect() { grep -Fqx "$2" "$1" || fail "missing '$2'"; }
make_fixture() {
  local root="${tmp_root}/integration"
  git init "${root}" >/dev/null
  git -C "${root}" config user.email test@example.invalid
  git -C "${root}" config user.name "Runtime test"
  mkdir -p "${root}/scripts/v2" "${root}/apps/web" "${root}/services/api" "${root}/_bmad/scripts" "${root}/_bmad/custom" "${root}/_bmad/_config" "${root}/.agents/skills"
  cp "${source_root}/scripts/v2/story-worktree-runtime.sh" "${source_root}/scripts/v2/story-worktree-bootstrap.sh" "${source_root}/scripts/v2/bmad-runtime.env" "${root}/scripts/v2/"
  cp "${source_root}/_bmad/custom/config.toml" "${root}/_bmad/custom/"
  cp "${source_root}/_bmad/custom/story-branch-workflow.md" "${root}/_bmad/custom/"
  cp "${source_root}/_bmad/_config/manifest.yaml" "${root}/_bmad/_config/"
  cp "${source_root}/_bmad/scripts/memlog.py" "${root}/_bmad/scripts/"
  printf '.env\n' >"${root}/.gitignore"
  printf '{"name":"fixture"}\n' >"${root}/package.json"
  printf '{"lockfileVersion":3}\n' >"${root}/package-lock.json"
  printf '{"name":"web"}\n' >"${root}/apps/web/package.json"
  printf '#!/usr/bin/env bash\n' >"${root}/services/api/gradlew"; chmod +x "${root}/services/api/gradlew"
  for skill in bmad-create-story bmad-dev-story bmad-code-review; do mkdir -p "${root}/.agents/skills/${skill}"; printf 'name: %s\n' "${skill}" >"${root}/.agents/skills/${skill}/SKILL.md"; done
  . "${source_root}/scripts/v2/bmad-runtime.env"
  printf '%s\n' "${HATCAST_BMAD_RUNTIME_VERSION}" >"${root}/.agents/skills/.hatcast-bmad-runtime-version"
  git -C "${root}" add . && git -C "${root}" commit -m "test: Add runtime fixture" >/dev/null
  git -C "${root}" branch -M v2
  printf 'non-secret=test-value\n' >"${root}/.env"
  git -C "${root}" worktree add -b feat/runtime-unit "${root}-unit" >/dev/null
  printf '%s\n' "${root}-unit"
}
make_mock_bin() {
  local bin="$1" command
  mkdir -p "${bin}"
  printf '#!/usr/bin/env bash\nprintf "v22.0.0\\n"\n' >"${bin}/node"
  printf '#!/usr/bin/env bash\nprintf "openjdk version \\"21.0.1\\"\\n" >&2\n' >"${bin}/java"
  chmod +x "${bin}/node" "${bin}/java"
  printf '#!/usr/bin/env bash\nmkdir -p node_modules; : >node_modules/.package-lock.json\nprintf "npm:%%s:%%s " "$PWD" "$*" >>"${RUNTIME_LOG}"\n' >"${bin}/npm"
  printf '#!/usr/bin/env bash\n[[ "${RUNTIME_NPX_FAIL:-0}" != 1 ]] || exit 1\nmkdir -p "${PLAYWRIGHT_BROWSERS_PATH}/chromium-test"; : >"${PLAYWRIGHT_BROWSERS_PATH}/chromium-test/INSTALLATION_COMPLETE"\nprintf "npx:%%s:%%s " "$PWD" "$*" >>"${RUNTIME_LOG}"\n' >"${bin}/npx"
  printf '#!/usr/bin/env bash\n[[ "${RUNTIME_LSOF_ERROR:-0}" != 1 ]] || exit 2\n[[ -n "${RUNTIME_PORT_CONFLICT:-}" && "$*" == *"-iTCP:${RUNTIME_PORT_CONFLICT}"* ]]\n' >"${bin}/lsof"
  printf '#!/usr/bin/env bash\n[[ "${RUNTIME_LINK_FAIL:-0}" != 1 ]] || exit 1\n/bin/ln "$@"\n' >"${bin}/ln"
  chmod +x "${bin}/npm" "${bin}/npx" "${bin}/lsof" "${bin}/ln"
}
unit="$(make_fixture)"; bin="${tmp_root}/bin"; make_mock_bin "${bin}"
runtime="${unit}/scripts/v2/story-worktree-runtime.sh"
unit_physical="$(cd "${unit}" && pwd -P)"
base_env=(env PATH="${bin}:${PATH}" PLAYWRIGHT_BROWSERS_PATH="${tmp_root}/browser-cache" RUNTIME_LOG="${tmp_root}/runtime.log")
"${base_env[@]}" bash "${runtime}" inspect >"${tmp_root}/inspect.out" 2>&1 && fail "missing prerequisites unexpectedly ready"
expect "${tmp_root}/inspect.out" 'MODE=inspect'; expect "${tmp_root}/inspect.out" 'ENVIRONMENT=available'; expect "${tmp_root}/inspect.out" 'DEPENDENCIES=missing'; expect "${tmp_root}/inspect.out" 'CHROMIUM=missing'; expect "${tmp_root}/inspect.out" 'E2E_PROFILE=PLAYWRIGHT_REUSE_SERVERS=0'
[[ ! -e "${unit}/.env" && ! -e "${unit}/node_modules" && ! -e "${tmp_root}/browser-cache" ]] || fail "inspection mutated runtime"
[[ -z "$(git -C "${unit}" status --porcelain)" ]] || fail "inspection changed Git state"
! grep -Fq 'test-value' "${tmp_root}/inspect.out" || fail "inspection exposed environment value"
! grep -Fq "${unit}" "${tmp_root}/inspect.out" || fail "inspection exposed absolute path"
expect_fail "${base_env[@]}" RUNTIME_LINK_FAIL=1 bash "${runtime}" prepare
[[ ! -e "${unit}/.env" && ! -e "${unit}/node_modules" && ! -e "${tmp_root}/browser-cache" ]] || fail "failed link mutated later prerequisites"
if ! "${base_env[@]}" bash "${runtime}" prepare >"${tmp_root}/prepare.out" 2>&1; then cat "${tmp_root}/prepare.out" >&2; fail "preparation failed"; fi
[[ -L "${unit}/.env" && -f "${unit}/node_modules/.package-lock.json" && -f "${tmp_root}/browser-cache/chromium-test/INSTALLATION_COMPLETE" ]] || fail "preparation did not establish runtime"
expect "${tmp_root}/prepare.out" 'READINESS=ready'
[[ "$(cat "${tmp_root}/runtime.log")" == "npm:${unit_physical}:ci npx:${unit_physical}/apps/web:playwright install chromium " ]] || fail "preparation commands did not use required directories: $(cat "${tmp_root}/runtime.log")"
"${base_env[@]}" bash "${runtime}" prepare >/dev/null || fail "idempotent preparation failed"
[[ "$(cat "${tmp_root}/runtime.log")" == "npm:${unit_physical}:ci npx:${unit_physical}/apps/web:playwright install chromium npm:${unit_physical}:ci npx:${unit_physical}/apps/web:playwright install chromium " ]] || fail "idempotent preparation did not repeat the bounded reproducibility checks"
rm -rf "${tmp_root}/browser-cache"; expect_fail "${base_env[@]}" RUNTIME_NPX_FAIL=1 bash "${runtime}" prepare
[[ ! -e "${tmp_root}/browser-cache/chromium-test" ]] || fail "failed browser preparation claimed success"
rm "${unit}/.env"; printf 'operator-owned\n' >"${unit}/.env"; expect_fail "${base_env[@]}" bash "${runtime}" prepare
[[ -f "${unit}/.env" && ! -L "${unit}/.env" ]] || fail "existing environment entry was replaced"
rm "${unit}/.env"; ln -s missing-env "${unit}/.env"
"${base_env[@]}" bash "${runtime}" inspect >"${tmp_root}/broken.out" 2>&1 && fail "broken environment unexpectedly ready"; expect "${tmp_root}/broken.out" 'ENVIRONMENT=conflict'
printf 'different\n' >"${tmp_root}/integration/.env.alternate"
rm "${unit}/.env"; ln -s ../integration/.env.alternate "${unit}/.env"
"${base_env[@]}" bash "${runtime}" inspect >"${tmp_root}/noncanonical.out" 2>&1 && fail "noncanonical environment unexpectedly ready"; expect "${tmp_root}/noncanonical.out" 'ENVIRONMENT=conflict'
expect_fail "${base_env[@]}" bash "${runtime}" prepare
rm "${unit}/.env"; ln -s ../integration/.env "${unit}/.env"
"${base_env[@]}" RUNTIME_PORT_CONFLICT=8080 bash "${runtime}" inspect >"${tmp_root}/port.out" 2>&1 && fail "port conflict unexpectedly ready"; expect "${tmp_root}/port.out" 'PORT_8080=unavailable'
"${base_env[@]}" RUNTIME_PORT_CONFLICT=4200 bash "${runtime}" inspect >"${tmp_root}/port4200.out" 2>&1 && fail "port conflict unexpectedly ready"; expect "${tmp_root}/port4200.out" 'PORT_4200=unavailable'
"${base_env[@]}" RUNTIME_LSOF_ERROR=1 bash "${runtime}" inspect >"${tmp_root}/lsof-error.out" 2>&1 && fail "lsof error unexpectedly ready"; expect "${tmp_root}/lsof-error.out" 'PORT_8080=unknown'; expect "${tmp_root}/lsof-error.out" 'PORT_4200=unknown'
no_lsof_bin="${tmp_root}/no-lsof-bin"; mkdir "${no_lsof_bin}"
for command in bash git awk dirname uname sed python3 node npm npx ln; do if [[ -e "${bin}/${command}" ]]; then /bin/ln -s "${bin}/${command}" "${no_lsof_bin}/${command}"; else /bin/ln -s "$(command -v "${command}")" "${no_lsof_bin}/${command}"; fi; done
/bin/ln -sf /bin/bash "${no_lsof_bin}/bash"
env PATH="${no_lsof_bin}" PLAYWRIGHT_BROWSERS_PATH="${tmp_root}/browser-cache" RUNTIME_LOG="${tmp_root}/runtime.log" /bin/bash "${runtime}" inspect >"${tmp_root}/no-lsof.out" 2>&1 && fail "missing lsof unexpectedly ready"
grep -Fqx 'PORT_8080=unknown' "${tmp_root}/no-lsof.out" || { cat "${tmp_root}/no-lsof.out"; fail "missing lsof did not fail closed"; }
expect "${tmp_root}/no-lsof.out" 'PORT_4200=unknown'
rm "${unit}/.env" "${tmp_root}/integration/.env"
"${base_env[@]}" bash "${runtime}" inspect >"${tmp_root}/source-missing.out" 2>&1 && fail "missing source unexpectedly ready"; expect "${tmp_root}/source-missing.out" 'ENVIRONMENT=source-unavailable'
! grep -Eqi 'pid|command|process' "${tmp_root}/port.out" || fail "port output exposed process details"
echo "PASS: story worktree runtime readiness"

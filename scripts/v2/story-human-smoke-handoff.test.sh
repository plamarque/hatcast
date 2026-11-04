#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-human-smoke.XXXXXX")"
trap 'rm -rf "${tmp_root}"' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { if "$@" >/dev/null 2>&1; then fail "command unexpectedly succeeded: $*"; fi; }
integration="${tmp_root}/integration"; unit="${tmp_root}/unit"; bin="${tmp_root}/bin"; launch_log="${tmp_root}/launch.log"
git init "${integration}" >/dev/null; git -C "${integration}" config user.email test@example.invalid; git -C "${integration}" config user.name 'Human smoke test'
mkdir -p "${integration}/scripts/v2" "${integration}/_bmad-output/implementation-artifacts/e2e-evidence"
cp "${source_root}/scripts/v2/story-human-smoke-handoff.sh" "${integration}/scripts/v2/"
# Deterministic reservation fixture; actual allocation and concurrency have separate tests.
cat >"${integration}/scripts/v2/worktree-ports.py" <<'PYCODE'
import pathlib, sys
root = pathlib.Path(sys.argv[sys.argv.index('--worktree') + 1])
path = root / '.local/worktree-ports.json'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text('{\"front\":22420,\"api\":28080}')
print('FRONT_PORT=22420')
print('API_PORT=28080')
PYCODE
printf '#!/usr/bin/env bash\nprintf "READINESS=ready\\n"\n' >"${integration}/scripts/v2/story-worktree-runtime.sh"
printf '#!/usr/bin/env bash\nif [[ "$*" != *"--human-smoke-owner="* ]]; then set -m; fi\nprintf "started\\n" >>"${SMOKE_LAUNCH_LOG}"\nfor arg in "$@"; do case "$arg" in --human-smoke-owner=*) marker="${arg#--human-smoke-owner=}";; esac; done\nprintf "HUMAN_SMOKE_PORTS=%%s:%%s:%%s\\n" "$marker" "${SMOKE_ACTUAL_FRONT:-22420}" "${SMOKE_ACTUAL_API:-28080}"\ntrap "exit 0" TERM INT\nsleep 600 &\nwait $!\n' >"${integration}/scripts/start-dev.sh"
chmod +x "${integration}/scripts/v2/"*.sh "${integration}/scripts/start-dev.sh"
printf '%s\n' '---' 'feature_branch: feat/21-4-human-smoke-handoff' 'baseline_commit: BASELINE' 'prior_e2e_evidence: _bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json' '---' >"${integration}/_bmad-output/implementation-artifacts/spec-21-4-human-smoke-handoff.md"
printf '%s\n' '{"route":"/connexion","account_or_fixture_reference":"fixture: smoke-member","actions":["Open the route","Sign in"],"expected_observations":["The page loads","The member area appears"]}' >"${integration}/guide.json"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":["project:chromium-21-4"],"discovered":["project:chromium-21-4"],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-4"}' >"${integration}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
printf '{"name":"fixture"}\n' >"${integration}/package.json"
git -C "${integration}" add . && git -C "${integration}" commit -m 'test: Add smoke fixture' >/dev/null
baseline="$(git -C "${integration}" rev-parse HEAD)"
sed -i.bak "s/BASELINE/${baseline}/" "${integration}/_bmad-output/implementation-artifacts/spec-21-4-human-smoke-handoff.md"; rm "${integration}/_bmad-output/implementation-artifacts/spec-21-4-human-smoke-handoff.md.bak"
git -C "${integration}" add . && git -C "${integration}" commit -m 'test: Add baseline identity' >/dev/null && git -C "${integration}" branch -M v2
git -C "${integration}" worktree add -b feat/21-4-human-smoke-handoff "${unit}" >/dev/null
mkdir -p "${bin}"
printf '#!/usr/bin/env bash\nif [[ -n "${SMOKE_PORT_CONFLICT:-}" && "$*" == *"${SMOKE_PORT_CONFLICT}"* ]]; then exit 0; fi\nrelease_port="${SMOKE_PORT_RELEASE_PORT:-28080}"\nif [[ -n "${SMOKE_PORT_RELEASE_MARKER:-}" && -e "${SMOKE_PORT_RELEASE_MARKER}" && "$*" == *"-iTCP:${release_port}"* ]]; then\n  count=0; [[ -f "${SMOKE_PORT_PROBE_COUNT_FILE}" ]] && count="$(cat "${SMOKE_PORT_PROBE_COUNT_FILE}")"\n  count=$((count + 1)); printf "%%s\\n" "${count}" >"${SMOKE_PORT_PROBE_COUNT_FILE}"\n  (( count <= ${SMOKE_PORT_RELEASE_AFTER:-0} )) && exit 0\nfi\nexit 1\n' >"${bin}/lsof"
printf '#!/usr/bin/env bash\n[[ "${SMOKE_ENDPOINTS:-ready}" == ready ]]\n' >"${bin}/curl"
chmod +x "${bin}/lsof" "${bin}/curl"
# The controller marker is a documented, real start-dev option; verify its
# parser without starting product services by taking the legacy early exit.
parser_root="${tmp_root}/start-dev-parser"; mkdir -p "${parser_root}/scripts" "${parser_root}/bin"
cp "${source_root}/scripts/start-dev.sh" "${source_root}/scripts/load-dotenv.sh" "${parser_root}/scripts/"
printf '#!/usr/bin/env bash\nprintf "%s\\n" "$*" >"${START_DEV_NPM_LOG}"\n' >"${parser_root}/bin/npm"; chmod +x "${parser_root}/bin/npm"
env PATH="${parser_root}/bin:${PATH}" START_DEV_NPM_LOG="${tmp_root}/start-dev-npm.log" bash "${parser_root}/scripts/start-dev.sh" --legacy --human-smoke-owner=smoke-parser
[[ -s "${tmp_root}/start-dev-npm.log" ]] || fail 'real start-dev parser did not accept the smoke owner option'
expect_fail env PATH="${parser_root}/bin:${PATH}" bash "${parser_root}/scripts/start-dev.sh" --legacy --human-smoke-owner=unsafe_marker
grep -Fqx 'set -m' "${source_root}/scripts/start-dev.sh" || fail 'real start-dev does not isolate child process groups'
gate="${unit}/scripts/v2/story-human-smoke-handoff.sh"
grep -Fqx '  local attempts="${HATCAST_SMOKE_WAIT_ATTEMPTS:-180}" i' "${gate}" || fail 'cold-start wait budget changed unexpectedly'
release_marker="${tmp_root}/release-ports"; probe_count="${tmp_root}/port-probes"
base=(env PATH="${bin}:${PATH}" SMOKE_LAUNCH_LOG="${launch_log}" HATCAST_SMOKE_WAIT_ATTEMPTS=1 HATCAST_SMOKE_STOP_PORT_WAIT_ATTEMPTS=5 SMOKE_PORT_RELEASE_MARKER="${release_marker}" SMOKE_PORT_PROBE_COUNT_FILE="${probe_count}" SMOKE_PORT_RELEASE_AFTER=2 SMOKE_PORT_RELEASE_PORT=28080)
printf '%s\n' '{"route":"/connexion","actions":["Open"],"expected_observations":["Loaded"]}' >"${unit}/guide.bad.json"
expect_fail "${base[@]}" bash "${gate}" start --guide guide.bad.json
[[ ! -e "${launch_log}" ]] || fail 'invalid guide launched a stack'
printf '%s\n' '{"route":"/connexion","account_or_fixture_reference":"password=not-a-guide","actions":["Open"],"expected_observations":["Loaded"]}' >"${unit}/guide.unsafe.json"
expect_fail "${base[@]}" bash "${gate}" start --guide guide.unsafe.json
printf '%s\n' 'guide.ignored.json' >>"${integration}/.git/info/exclude"
cp "${unit}/guide.json" "${unit}/guide.ignored.json"
expect_fail "${base[@]}" bash "${gate}" start --guide guide.ignored.json
[[ ! -e "${launch_log}" ]] || fail 'unsafe or ignored guide launched a stack'
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"failed:1","disposition":"run"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" bash "${gate}" start --guide guide.json
[[ ! -e "${launch_log}" ]] || fail 'failed E2E evidence launched a stack'
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":["project:chromium-21-4"],"discovered":["project:chromium-21-4"],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-4"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":[],"discovered":[],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-4"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" bash "${gate}" start --guide guide.json
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":["project:chromium-21-4"],"discovered":["project:chromium-21-4"],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-4"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" SMOKE_PORT_CONFLICT='-iTCP:28080' bash "${gate}" start --guide guide.json
[[ ! -e "${launch_log}" ]] || fail 'occupied port launched a stack'
"${base[@]}" bash "${gate}" start --guide guide.json >"${tmp_root}/handoff.json"
state="${unit}/_bmad-output/implementation-artifacts/human-smoke/21-4-human-smoke-handoff.json"
[[ -f "${state}" && "$(cat "${launch_log}")" == started ]] || fail 'ready handoff did not start the owned stack'
grep -Fq 'https://localhost:22420' "${tmp_root}/handoff.json" || fail 'handoff omitted clickable URL'
grep -Fq 'story-human-smoke-handoff.sh stop' "${tmp_root}/handoff.json" || fail 'handoff omitted stop command'
! grep -Fq "${unit}" "${state}" || fail 'state exposed absolute worktree path'
"${base[@]}" bash "${gate}" status >"${tmp_root}/status.json"
grep -Fq 'fixture: smoke-member' "${tmp_root}/status.json" || fail 'status did not supply the guide'
# Existing v1 states without api_port remain usable with their fixed ports.
python3 - "${state}" <<'PYCODE'
import json,sys
p=json.load(open(sys.argv[1])); p.pop('api_port'); p['url']='https://localhost:4200'; json.dump(p,open(sys.argv[1],'w'))
PYCODE
"${base[@]}" bash "${gate}" status >"${tmp_root}/legacy.json"
grep -Fq 'https://localhost:4200' "${tmp_root}/legacy.json" || fail 'legacy fixed state not accepted'
python3 - "${state}" <<'PYCODE'
import json,sys
p=json.load(open(sys.argv[1])); p['api_port']=28080; p['url']='https://localhost:22420'; json.dump(p,open(sys.argv[1],'w'))
PYCODE
# A running state's endpoints come from that state, even if metadata changes.
printf '{"front":23000,"api":23001}\n' >"${unit}/.local/worktree-ports.json"
"${base[@]}" bash "${gate}" status >"${tmp_root}/saved-pair.json"
grep -Fq 'https://localhost:22420' "${tmp_root}/saved-pair.json" || fail 'running state used a newer reservation'

python3 - "${state}" <<'PY'
import json,sys
p=json.load(open(sys.argv[1])); p['baseline_commit']='deadbeef'; json.dump(p, open(sys.argv[1], 'w'))
PY
expect_fail "${base[@]}" bash "${gate}" status
python3 - "${state}" "${baseline}" <<'PY'
import json,sys
p=json.load(open(sys.argv[1])); p['baseline_commit']=sys.argv[2]; json.dump(p, open(sys.argv[1], 'w'))
PY
expect_fail "${base[@]}" bash "${gate}" start --guide guide.json
touch "${release_marker}"
"${base[@]}" bash "${gate}" stop >"${tmp_root}/stop.out"
grep -Fqx 'SMOKE_STOP=clean' "${tmp_root}/stop.out" || fail 'owned stack did not cleanly stop'
grep -Fq '"result": "stopped"' "${state}" || fail 'clean stop result was not persisted'
[[ "$(cat "${probe_count}")" == 3 ]] || fail 'stop did not wait for delayed port release'
rm -f "${release_marker}" "${probe_count}"
# Historical stopped state can name a former pair without blocking a new run.
python3 - "${state}" <<'PYCODE'
import json,sys
p=json.load(open(sys.argv[1])); p['url']='https://localhost:21000'; p['api_port']=21001; json.dump(p,open(sys.argv[1],'w'))
PYCODE
group="$(python3 - "${state}" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['owned_process_group'])
PY
)"
! kill -0 "${group}" 2>/dev/null || fail 'clean stop left the owned group alive'
# Simulate reassignment by start-dev after the preflight: the handoff must use
# its reported actual pair, not the earlier reservation.
"${base[@]}" SMOKE_ACTUAL_FRONT=22521 SMOKE_ACTUAL_API=28181 SMOKE_PORT_RELEASE_PORT=22521 bash "${gate}" start --guide guide.json >"${tmp_root}/reassigned.json"
grep -Fq 'https://localhost:22521' "${tmp_root}/reassigned.json" || fail 'handoff ignored actual reassigned port'
python3 - "${state}" <<'PYCODE'
import json,sys
p=json.load(open(sys.argv[1])); assert p['api_port']==28181
PYCODE
touch "${release_marker}"
"${base[@]}" SMOKE_PORT_RELEASE_PORT=22521 bash "${gate}" stop >"${tmp_root}/second-stop.out"
grep -Fqx 'SMOKE_STOP=clean' "${tmp_root}/second-stop.out" || fail 'port 22420 did not cleanly stop after delayed release'
[[ "$(cat "${probe_count}")" == 3 ]] || fail 'stop did not wait for delayed port 22420 release'
rm -f "${release_marker}" "${probe_count}"
"${base[@]}" bash "${gate}" start --guide guide.json >/dev/null
expect_fail "${base[@]}" SMOKE_PORT_CONFLICT='-iTCP:28080' bash "${gate}" stop
grep -Fq '"result": "stopped:ports-unreleased"' "${state}" || fail 'persistent port conflict was not persisted'
"${base[@]}" bash "${gate}" start --guide guide.json >/dev/null
group="$(python3 - "${state}" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['owned_process_group'])
PY
)"
kill -TERM -- "-${group}"
for ((i=0; i<20; i++)); do kill -0 -- "-${group}" 2>/dev/null || break; sleep 0.1; done
"${base[@]}" bash "${gate}" stop >"${tmp_root}/recovered-stop.out"
grep -Fqx 'SMOKE_STOP=clean' "${tmp_root}/recovered-stop.out" || fail 'completed owned stop was not recorded'
expect_fail "${base[@]}" bash "${gate}" status
expect_fail "${base[@]}" bash "${gate}" stop
python3 - "${state}" <<'PY'
import json, sys
p=json.load(open(sys.argv[1])); p['result']='running'; p['owned_process_group']='1'; p['owned_process_marker']='not-ours'; json.dump(p, open(sys.argv[1], 'w'))
PY
expect_fail "${base[@]}" bash "${gate}" stop
grep -Fq '"result": "running"' "${state}" || fail 'unowned stop rewrote state'
rm -f "${state}"
"${base[@]}" SMOKE_ENDPOINTS=down bash "${gate}" start --guide guide.json >/dev/null 2>&1 && fail 'failed startup unexpectedly succeeded'
grep -Fq '"result": "startup-failed"' "${state}" || fail 'startup failure was not persisted'
group="$(python3 - "${state}" <<'PY'
import json,sys
print(json.load(open(sys.argv[1]))['owned_process_group'])
PY
)"
! kill -0 "${group}" 2>/dev/null || fail 'startup failure left the owned group alive'
rm -f "${state}"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"not-run","disposition":"test-now:apps/web/e2e/new-smoke.spec.ts","selection":[],"discovered":[]}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
"${base[@]}" bash "${gate}" start --guide guide.json >/dev/null
"${base[@]}" bash "${gate}" stop >/dev/null
echo 'PASS: story human smoke handoff'

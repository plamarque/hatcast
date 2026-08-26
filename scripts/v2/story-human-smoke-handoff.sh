#!/usr/bin/env bash
# Start, inspect, and stop a non-secret human smoke handoff for one feat/* unit.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
runtime="${script_dir}/story-worktree-runtime.sh"
starter="${root}/scripts/start-dev.sh"
url="https://localhost:4200"
health_url="http://127.0.0.1:8080/actuator/health"
owned_group_id=""; owned_marker=""; launch_active=false

usage() {
  cat >&2 <<'EOF'
Usage: story-human-smoke-handoff.sh start --guide RELATIVE_JSON
       story-human-smoke-handoff.sh status
       story-human-smoke-handoff.sh stop

The guide JSON contains exactly: route, account_or_fixture_reference, actions,
and expected_observations. It is never copied into the persisted smoke state.
EOF
}
die() { echo "Human smoke handoff gate: $*" >&2; exit 2; }
relative_path() { [[ "$1" != /* && "$1" != *".."* && "$1" =~ ^[A-Za-z0-9._/-]+$ ]]; }
safe_path_components() {
  local path="$1" component current
  relative_path "${path}" || return 1
  current="${root}"
  IFS=/ read -r -a components <<<"${path}"
  for component in "${components[@]}"; do current="${current}/${component}"; [[ ! -L "${current}" ]] || return 1; done
}
safe_existing_file() { safe_path_components "$1" && [[ -f "${root}/$1" && ! -L "${root}/$1" ]]; }
unit_valid() {
  [[ -n "${root}" && "$(git -C "${root}" branch --show-current 2>/dev/null || true)" == feat/* ]] || return 1
  git -C "${root}" worktree list --porcelain | awk -v expected="${root}" '/^worktree / { path = substr($0, 10) } /^branch refs\/heads\/feat\// && path == expected { found = 1 } END { exit(found ? 0 : 1) }'
}
port_state() {
  local rc
  command -v lsof >/dev/null 2>&1 || { echo unknown; return; }
  if lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; then rc=0; else rc=$?; fi
  [[ ${rc} -eq 0 ]] && { echo unavailable; return; }
  [[ ${rc} -eq 1 ]] && echo free || echo unknown
}
story_key() { git -C "${root}" branch --show-current | sed 's#^feat/##'; }
story_baseline() {
  local story="$1"
  python3 - "${root}" "${story}" <<'PY'
import os, re, subprocess, sys
root, story = sys.argv[1:]
matches = []
for base, dirs, names in os.walk(os.path.join(root, '_bmad-output', 'implementation-artifacts')):
    dirs[:] = [d for d in dirs if not os.path.islink(os.path.join(base, d))]
    for name in names:
        path = os.path.join(base, name)
        if not name.endswith('.md') or os.path.islink(path): continue
        try: text = open(path, encoding='utf-8').read(8192)
        except OSError: continue
        branch = re.search(r'(?m)^feature_branch:\s*[\'\"]?([^\s\'\"]+)', text)
        baseline = re.search(r'(?m)^baseline_commit:\s*[\'\"]?([0-9a-fA-F]{7,40})', text)
        if branch and baseline and branch.group(1) == 'feat/' + story:
            matches.append((os.path.relpath(path, root), baseline.group(1)))
if len(matches) != 1: raise SystemExit(1)
path, baseline = matches[0]
subprocess.check_call(['git', '-C', root, 'rev-parse', '--verify', '-q', baseline + '^{commit}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(path + '\t' + baseline)
PY
}
story_e2e_reference() {
  local story="$1"
  python3 - "${root}" "${story}" <<'PY'
import os, re, sys
root, story = sys.argv[1:]
matches = []
for base, dirs, names in os.walk(os.path.join(root, '_bmad-output', 'implementation-artifacts')):
    dirs[:] = [d for d in dirs if not os.path.islink(os.path.join(base, d))]
    for name in names:
        path = os.path.join(base, name)
        if not name.endswith('.md') or os.path.islink(path): continue
        try: text = open(path, encoding='utf-8').read(8192)
        except OSError: continue
        branch = re.search(r'(?m)^feature_branch:\s*[\'\"]?([^\s\'\"]+)', text)
        evidence = re.search(r'(?m)^prior_e2e_evidence:\s*[\'\"]?([^\s\'\"]+)', text)
        if branch and evidence and branch.group(1) == 'feat/' + story:
            matches.append(evidence.group(1))
if len(matches) != 1: raise SystemExit(1)
print(matches[0])
PY
}
state_path() { printf '_bmad-output/implementation-artifacts/human-smoke/%s.json\n' "$(story_key)"; }
ensure_state_parent() {
  local parent component current
  parent="${1%/*}"; current="${root}"
  IFS=/ read -r -a components <<<"${parent}"
  for component in "${components[@]}"; do
    current="${current}/${component}"; [[ ! -L "${current}" ]] || die "state parent must not be a symlink"
    [[ -e "${current}" ]] || mkdir "${current}"
    [[ -d "${current}" && ! -L "${current}" ]] || die "state parent must be a directory"
  done
}
safe_text() {
  [[ -n "$1" && "$1" != *$'\n'* && "$1" != *$'\r'* && "$1" != *".."* ]] || return 1
  [[ ! "$1" =~ (^|[[:space:]])[A-Za-z_][A-Za-z0-9_]*= ]] || return 1
  [[ ! "$1" =~ (secret|password|token|private[_-]?key|environment) ]] || return 1
}
validate_guide() {
  local guide="$1"
  safe_existing_file "${guide}" || die "guide must be an existing non-symlink relative file"
  git -C "${root}" check-ignore -q -- "${guide}" && die "guide must not be ignored"
  python3 - "${root}/${guide}" <<'PY' || die "guide is missing required non-secret fields"
import json, re, sys
try:
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    assert set(data) == {'route', 'account_or_fixture_reference', 'actions', 'expected_observations'}
    assert isinstance(data['route'], str) and re.fullmatch(r'/[A-Za-z0-9._~!$&\'()*+,;=:@%/?#-]*', data['route'])
    assert isinstance(data['account_or_fixture_reference'], str) and data['account_or_fixture_reference'].strip()
    for key in ('actions', 'expected_observations'):
        assert isinstance(data[key], list) and data[key] and all(isinstance(x, str) and x.strip() for x in data[key])
    def safe(value):
        return ('\n' not in value and '\r' not in value and '..' not in value
                and not re.search(r'(^|\s)[A-Za-z_][A-Za-z0-9_]*=', value)
                and not re.search(r'(secret|password|token|private[_-]?key|environment)\s*[:=]', value, re.I)
                and not re.search(r'(sk-[A-Za-z0-9_-]{12,}|AIza[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN)', value)
                and not re.search(r'(^|\s)/(?!/)', value))
    assert all(safe(value) for value in [data['account_or_fixture_reference'], *data['actions'], *data['expected_observations']])
except Exception:
    raise SystemExit(1)
PY
}
validate_evidence() {
  local story="$1" evidence
  evidence="$(story_e2e_reference "${story}")" || die "prior E2E evidence reference is missing or unsafe"
  safe_existing_file "${evidence}" || die "prior E2E evidence is missing or unsafe"
  python3 - "${root}" "${evidence}" <<'PY' || die "prior E2E evidence lacks a permitted outcome or disposition"
import datetime, json, os, re, sys
try:
    root, evidence = sys.argv[1:]
    data = json.load(open(os.path.join(root, evidence), encoding='utf-8'))
    assert data['schema'] == 'hatcast.story-e2e-evidence.v1'
    assert evidence.endswith('/' + data['story_key'] + '.json')
    outcome, disposition = data['outcome'], data['disposition']
    rel = lambda p: isinstance(p, str) and re.fullmatch(r'[A-Za-z0-9._/-]+', p) and '..' not in p and not p.startswith('/')
    selected = data.get('selection'); discovered = data.get('discovered')
    if outcome == 'passed':
        assert disposition == 'run' and isinstance(selected, list) and selected and selected == discovered
        assert all(re.fullmatch(r'(project:[A-Za-z0-9._-]+|spec:apps/web/e2e/[A-Za-z0-9._/-]+\.spec\.ts)', x) for x in selected)
        assert data.get('report_reference') == 'apps/web/playwright-report/index.html'
        assert re.fullmatch(r'HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e\.sh -- .+', data.get('command', ''))
    else:
        assert outcome == 'not-run' and selected == [] and discovered == []
        kind, ref = disposition.split(':', 1); assert kind in {'test-now', 'cited-equivalent', 'waiver'} and rel(ref)
        if kind == 'cited-equivalent': assert os.path.isfile(os.path.join(root, ref)) and not os.path.islink(os.path.join(root, ref))
        if kind == 'waiver':
            policy=json.load(open(os.path.join(root, ref), encoding='utf-8')); authority=policy['authority']; fields=policy['required_fields']; approval=policy['approval']
            assert isinstance(authority, str) and isinstance(fields, list) and fields and approval['authority'] == authority
            assert all(isinstance(k, str) and approval.get(k) for k in fields)
            assert datetime.date.fromisoformat(approval['expires_on']) >= datetime.date.today()
    encoded = json.dumps(data, sort_keys=True)
    assert not re.search(r'(^|[\\s"])/(Users|home|tmp|var)/', encoded)
    assert not re.search(r'(secret|password|token|private[_-]?key)', encoded, re.I)
except Exception:
    raise SystemExit(1)
PY
  printf '%s\n' "${evidence}"
}
write_state() {
  local result="$1" group="$2" marker="$3" story="$4" baseline="$5" guide="$6" evidence="$7" outcome="$8" state temporary
  state="$(state_path)"; ensure_state_parent "${state}"; [[ ! -L "${root}/${state}" ]] || die "state destination must not be a symlink"
  temporary="$(mktemp "${root}/${state}.tmp.XXXXXX")"
  python3 - "${temporary}" "${story}" "${baseline}" "${guide}" "${evidence}" "${outcome}" "${url}" "$(id -un)" "${result}" "${group}" "${marker}" <<'PY'
import json, sys
path, story, baseline, guide, evidence, outcome, url, owner, result, group, marker = sys.argv[1:]
json.dump({'schema': 'hatcast.story-human-smoke-handoff.v1', 'branch': 'feat/' + story,
           'baseline_commit': baseline, 'guide_reference': guide, 'e2e_reference': evidence,
           'e2e_outcome': outcome, 'url': url, 'owner': owner, 'result': result,
           'owned_process_group': group, 'owned_process_marker': marker}, open(path, 'w', encoding='utf-8'), indent=2, sort_keys=True)
open(path, 'a', encoding='utf-8').write('\n')
PY
  mv -f "${temporary}" "${root}/${state}"
}
read_state() {
  local state="$(state_path)"
  safe_existing_file "${state}" || die "smoke state is missing, unsafe, or stale"
  python3 - "${root}/${state}" "$(story_key)" <<'PY' || die "smoke state is malformed or belongs to another unit"
import json, re, sys
try:
    data=json.load(open(sys.argv[1], encoding='utf-8')); story=sys.argv[2]
    required={'schema','branch','baseline_commit','guide_reference','e2e_reference','e2e_outcome','url','owner','result','owned_process_group','owned_process_marker'}
    assert set(data) == required and data['schema']=='hatcast.story-human-smoke-handoff.v1'
    assert data['branch']=='feat/'+story and re.fullmatch(r'[0-9a-fA-F]{7,40}', data['baseline_commit'])
    assert re.fullmatch(r'[A-Za-z0-9._/-]+', data['guide_reference']) and re.fullmatch(r'[A-Za-z0-9._/-]+', data['e2e_reference'])
    assert data['url']=='https://localhost:4200' and re.fullmatch(r'[A-Za-z0-9._-]+', data['owner'])
    assert re.fullmatch(r'(running|startup-failed|stopped|stopped:ports-unreleased)', data['result'])
    assert re.fullmatch(r'[0-9]+', data['owned_process_group']) and re.fullmatch(r'[A-Za-z0-9-]+', data['owned_process_marker'])
    print('\t'.join(str(data[k]) for k in ('baseline_commit','guide_reference','e2e_reference','e2e_outcome','owner','result','owned_process_group','owned_process_marker')))
except Exception: raise SystemExit(1)
PY
}
owned_group() {
  local group="$1" marker="$2" pgid command
  kill -0 "${group}" 2>/dev/null || return 1
  pgid="$(ps -o pgid= -p "${group}" 2>/dev/null | tr -d '[:space:]')"; [[ "${pgid}" == "${group}" ]] || return 1
  command="$(ps -o command= -p "${group}" 2>/dev/null || true)"
  [[ "${command}" == *"--human-smoke-owner=${marker}"* ]]
}
wait_for_endpoints() {
  local attempts="${HATCAST_SMOKE_WAIT_ATTEMPTS:-60}" i
  [[ "${attempts}" =~ ^[1-9][0-9]*$ ]] || attempts=60
  for ((i=0; i<attempts; i++)); do
    curl -kfsS "${health_url}" >/dev/null 2>&1 && curl -kfsS "${url}" >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}
stop_group() {
  local group="$1" i
  kill -TERM -- "-${group}" 2>/dev/null || return 1
  for ((i=0; i<20; i++)); do kill -0 -- "-${group}" 2>/dev/null || return 0; sleep 0.5; done
  return 1
}
cleanup_owned_launch() {
  local ec=$?
  if [[ "${launch_active}" == true && -n "${owned_group_id}" ]] && owned_group "${owned_group_id}" "${owned_marker}"; then
    stop_group "${owned_group_id}" || true
  fi
  exit "${ec}"
}
trap cleanup_owned_launch EXIT INT TERM
emit_handoff() {
  local story="$1" baseline="$2" guide="$3" evidence="$4" outcome="$5" owner="$6" result="$7"
  python3 - "${root}/${guide}" "${story}" "${baseline}" "${guide}" "${evidence}" "${outcome}" "${owner}" "${result}" <<'PY'
import json, sys
guide, story, baseline, guide_ref, evidence, outcome, owner, result = sys.argv[1:]
data=json.load(open(guide, encoding='utf-8'))
data.update({'e2e_result': outcome, 'url': 'https://localhost:4200', 'stop_command': 'scripts/v2/story-human-smoke-handoff.sh stop'})
print(json.dumps({'branch': 'feat/' + story, 'baseline_commit': baseline, 'guide_reference': guide_ref, 'guide': data, 'e2e_reference': evidence, 'owner': owner, 'url': 'https://localhost:4200', 'result': result}, indent=2, sort_keys=True))
PY
}
start() {
  local guide="$1" story baseline_info story_ref baseline evidence evidence_outcome runtime_output status state marker group previous_result=""
  unit_valid || die "must run from a registered feat/{story-key} worktree"
  [[ -x "${runtime}" && -x "${starter}" ]] || die "runtime or development stack is unavailable"
  story="$(story_key)"; baseline_info="$(story_baseline "${story}")" || die "story baseline identity is unavailable"; IFS=$'\t' read -r story_ref baseline <<<"${baseline_info}"
  validate_guide "${guide}"; evidence="$(validate_evidence "${story}")"; evidence_outcome="$(python3 - "${root}/${evidence}" <<'PY'
import json,sys
print(json.load(open(sys.argv[1], encoding='utf-8'))['outcome'])
PY
)"
  state="$(state_path)"
  if [[ -e "${root}/${state}" || -L "${root}/${state}" ]]; then
    local old; old="$(read_state)"; IFS=$'\t' read -r _ _ _ _ _ old_result _ _ <<<"${old}"
    [[ "${old_result}" == stopped || "${old_result}" == stopped:ports-unreleased || "${old_result}" == startup-failed ]] || die "existing smoke state is not demonstrably owned by this controller"
    previous_result="${old_result}"
  fi
  set +e; runtime_output="$(bash "${runtime}" inspect 2>&1)"; status=$?; set -e
  (( status == 0 )) && grep -Fqx 'READINESS=ready' <<<"${runtime_output}" || die "runtime readiness is not ready"
  [[ "$(port_state 8080)" == free && "$(port_state 4200)" == free ]] || die "reserved ports are unavailable"
  marker="smoke-$(date +%s)-$$"; python3 -c 'import os,sys; os.setsid(); os.execv(sys.argv[1], sys.argv[1:])' "${starter}" --no-tailscale "--human-smoke-owner=${marker}" >/dev/null 2>&1 & group=$!
  owned_group_id="${group}"; owned_marker="${marker}"; launch_active=true
  write_state running "${group}" "${marker}" "${story}" "${baseline}" "${guide}" "${evidence}" "${evidence_outcome}"
  if wait_for_endpoints; then emit_handoff "${story}" "${baseline}" "${guide}" "${evidence}" "${evidence_outcome}" "$(id -un)" running; launch_active=false; return 0; fi
  owned_group "${group}" "${marker}" && stop_group "${group}" || true
  write_state startup-failed "${group}" "${marker}" "${story}" "${baseline}" "${guide}" "${evidence}" "${evidence_outcome}"
  launch_active=false
  die "startup did not expose both required endpoints"
}
status() {
  local values baseline guide evidence outcome owner result group marker canonical baseline_info
  unit_valid || die "must run from a registered feat/{story-key} worktree"; values="$(read_state)"; IFS=$'\t' read -r baseline guide evidence outcome owner result group marker <<<"${values}"
  [[ "${result}" == running ]] || die "smoke handoff is not running"; owned_group "${group}" "${marker}" || die "smoke state is not demonstrably owned by this controller"
  baseline_info="$(story_baseline "$(story_key)")" || die "canonical story baseline is unavailable"; IFS=$'\t' read -r _ canonical <<<"${baseline_info}"
  [[ "${baseline}" == "${canonical}" ]] || die "smoke state baseline no longer matches the story"
  [[ "$(validate_evidence "$(story_key)")" == "${evidence}" ]] || die "smoke state evidence no longer matches the canonical attestation"
  [[ "$(python3 - "${root}/${evidence}" <<'PY'
import json,sys
print(json.load(open(sys.argv[1], encoding='utf-8'))['outcome'])
PY
)" == "${outcome}" ]] || die "smoke state E2E outcome no longer matches the attestation"
  curl -kfsS "${health_url}" >/dev/null 2>&1 && curl -kfsS "${url}" >/dev/null 2>&1 || die "smoke endpoints are no longer running"
  validate_guide "${guide}"; emit_handoff "$(story_key)" "${baseline}" "${guide}" "${evidence}" "${outcome}" "${owner}" "${result}"
}
stop() {
  local values baseline guide evidence outcome owner result group marker story
  unit_valid || die "must run from a registered feat/{story-key} worktree"; values="$(read_state)"; IFS=$'\t' read -r baseline guide evidence outcome owner result group marker <<<"${values}"
  [[ "${result}" == running ]] || die "smoke handoff is not running"; owned_group "${group}" "${marker}" || die "smoke state is not demonstrably owned by this controller"
  stop_group "${group}" || die "owned smoke process group did not stop"
  [[ "$(port_state 8080)" == free && "$(port_state 4200)" == free ]] || { write_state stopped:ports-unreleased "${group}" "${marker}" "$(story_key)" "${baseline}" "${guide}" "${evidence}" "${outcome}"; die "owned stack stopped but reserved ports remain unavailable"; }
  write_state stopped "${group}" "${marker}" "$(story_key)" "${baseline}" "${guide}" "${evidence}" "${outcome}"
  echo 'SMOKE_STOP=clean'
}

command="${1:-}"; shift || true
case "${command}" in
  start) [[ $# -eq 2 && "$1" == --guide ]] || { usage; exit 2; }; start "$2" ;;
  status) [[ $# -eq 0 ]] || { usage; exit 2; }; status ;;
  stop) [[ $# -eq 0 ]] || { usage; exit 2; }; stop ;;
  --help|-h) usage ;;
  *) usage; exit 2 ;;
esac

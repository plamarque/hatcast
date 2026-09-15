#!/usr/bin/env bash
# Compose retained delivery evidence without starting services or authorizing Git.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
runtime="${script_dir}/story-worktree-runtime.sh"

usage() {
  cat >&2 <<'EOF'
Usage: story-delivery-gates.sh request-human-smoke
       story-delivery-gates.sh reverify --confirmation TOKEN

This controller only verifies retained evidence. It never starts or stops a
service, runs E2E, or approves review or integration.
EOF
}
die() { echo "Delivery gates: $*" >&2; exit 2; }
relative_path() { [[ "$1" != /* && "$1" != *".."* && "$1" =~ ^[A-Za-z0-9._/-]+$ ]]; }
safe_path_components() {
  local path="$1" component current
  relative_path "${path}" || return 1
  current="${root}"
  IFS=/ read -r -a components <<<"${path}"
  for component in "${components[@]}"; do
    current="${current}/${component}"
    [[ ! -L "${current}" ]] || return 1
  done
}
safe_existing_file() { safe_path_components "$1" && [[ -f "${root}/$1" && ! -L "${root}/$1" ]]; }
safe_nonignored_file() { safe_existing_file "$1" && ! git -C "${root}" check-ignore -q -- "$1"; }
unit_valid() {
  [[ -n "${root}" && "$(git -C "${root}" branch --show-current 2>/dev/null || true)" == feat/* ]] || return 1
  git -C "${root}" worktree list --porcelain | awk -v expected="${root}" '/^worktree / { path = substr($0, 10) } /^branch refs\/heads\/feat\// && path == expected { found = 1 } END { exit(found ? 0 : 1) }'
}
story_key() { git -C "${root}" branch --show-current | sed 's#^feat/##'; }
canonical_spec() {
  python3 - "${root}" "$(story_key)" <<'PY'
import os, re, subprocess, sys
root, story = sys.argv[1:]
matches = []
base_dir = os.path.join(root, '_bmad-output', 'implementation-artifacts')
for base, dirs, names in os.walk(base_dir):
    dirs[:] = [d for d in dirs if not os.path.islink(os.path.join(base, d))]
    for name in names:
        path = os.path.join(base, name)
        if not name.endswith('.md') or os.path.islink(path):
            continue
        try:
            text = open(path, encoding='utf-8').read(8192)
        except OSError:
            continue
        branch = re.search(r'(?m)^feature_branch:\s*[\'\"]?([^\s\'\"]+)', text)
        baseline = re.search(r'(?m)^baseline_commit:\s*[\'\"]?([0-9a-fA-F]{7,40})', text)
        evidence = re.search(r'(?m)^prior_e2e_evidence:\s*[\'\"]?([^\s\'\"]+)', text)
        if branch and branch.group(1) == 'feat/' + story:
            if not baseline or not evidence:
                raise SystemExit(1)
            matches.append((os.path.relpath(path, root), baseline.group(1), evidence.group(1)))
if len(matches) != 1:
    raise SystemExit(1)
path, baseline, evidence = matches[0]
if not re.fullmatch(r'[A-Za-z0-9._/-]+', path) or '..' in path:
    raise SystemExit(1)
subprocess.check_call(['git', '-C', root, 'rev-parse', '--verify', '-q', baseline + '^{commit}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print('\t'.join((path, baseline, evidence)))
PY
}
validate_evidence() {
  local evidence="$1"
  safe_nonignored_file "${evidence}" || die "prior E2E evidence is missing, ignored, or unsafe"
  python3 - "${root}" "${evidence}" <<'PY' || die "prior E2E evidence lacks a permitted outcome or disposition"
import datetime, json, os, re, sys
try:
    root, evidence = sys.argv[1:]
    data = json.load(open(os.path.join(root, evidence), encoding='utf-8'))
    assert data['schema'] == 'hatcast.story-e2e-evidence.v1'
    assert evidence.endswith('/' + data['story_key'] + '.json')
    outcome, disposition = data['outcome'], data['disposition']
    rel = lambda p: isinstance(p, str) and re.fullmatch(r'[A-Za-z0-9._/-]+', p) and '..' not in p and not p.startswith('/')
    selected, discovered = data.get('selection'), data.get('discovered')
    if outcome == 'passed':
        assert disposition == 'run' and isinstance(selected, list) and selected and selected == discovered
        assert all(re.fullmatch(r'(project:[A-Za-z0-9._-]+|spec:apps/web/e2e/[A-Za-z0-9._/-]+\.spec\.ts)', x) for x in selected)
        assert data.get('report_reference') == 'apps/web/playwright-report/index.html'
        assert re.fullmatch(r'HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e\.sh -- .+', data.get('command', ''))
    else:
        assert outcome == 'not-run' and selected == [] and discovered == []
        kind, ref = disposition.split(':', 1)
        assert kind in {'test-now', 'cited-equivalent', 'waiver'} and rel(ref)
        if kind == 'cited-equivalent':
            assert os.path.isfile(os.path.join(root, ref)) and not os.path.islink(os.path.join(root, ref))
        if kind == 'waiver':
            policy = json.load(open(os.path.join(root, ref), encoding='utf-8'))
            authority, fields, approval = policy['authority'], policy['required_fields'], policy['approval']
            assert isinstance(authority, str) and isinstance(fields, list) and fields and approval['authority'] == authority
            assert all(isinstance(key, str) and approval.get(key) for key in fields)
            assert datetime.date.fromisoformat(approval['expires_on']) >= datetime.date.today()
    encoded = json.dumps(data, sort_keys=True)
    assert not re.search(r'(^|[\\s\"])/(Users|home|tmp|var)/', encoded)
    assert not re.search(r'(secret|password|token|private[_-]?key)', encoded, re.I)
except Exception:
    raise SystemExit(1)
PY
  python3 - "${root}/${evidence}" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding='utf-8'))['outcome'])
PY
}
state_path() { printf '_bmad-output/implementation-artifacts/delivery-gates/%s.json\n' "$(story_key)"; }
smoke_path() { printf '_bmad-output/implementation-artifacts/human-smoke/%s.json\n' "$(story_key)"; }
ensure_state_parent() {
  local path="$1" parent component current
  parent="${path%/*}"; current="${root}"
  IFS=/ read -r -a components <<<"${parent}"
  for component in "${components[@]}"; do
    current="${current}/${component}"
    [[ ! -L "${current}" ]] || die "delivery state parent must not be a symlink"
    [[ -e "${current}" ]] || mkdir "${current}"
    [[ -d "${current}" && ! -L "${current}" ]] || die "delivery state parent must be a directory"
  done
}
request_identity() {
  python3 - "$1" "$2" "$3" "$4" <<'PY'
import hashlib, json, sys
print(hashlib.sha256(json.dumps(dict(zip(('branch','baseline_commit','e2e_reference','e2e_outcome'), sys.argv[1:])), sort_keys=True, separators=(',', ':')).encode()).hexdigest())
PY
}
write_request() {
  local state="$1" story="$2" spec="$3" baseline="$4" evidence="$5" outcome="$6" identity="$7" temporary
  ensure_state_parent "${state}"
  [[ ! -L "${root}/${state}" ]] || die "delivery state destination must not be a symlink"
  temporary="$(mktemp "${root}/${state}.tmp.XXXXXX")"
  python3 - "${temporary}" "${story}" "${spec}" "${baseline}" "${evidence}" "${outcome}" "${identity}" <<'PY'
import json, sys
path, story, spec, baseline, evidence, outcome, identity = sys.argv[1:]
payload = {
  'schema': 'hatcast.story-delivery-gates.v1', 'branch': 'feat/' + story,
  'spec_reference': spec, 'baseline_commit': baseline,
  'e2e_reference': evidence, 'e2e_outcome': outcome,
  'request_identity': identity,
  'readiness': 'ready', 'human_smoke_request': 'permitted',
  'review_integration_approval': 'external',
}
with open(path, 'w', encoding='utf-8') as stream:
    json.dump(payload, stream, indent=2, sort_keys=True)
    stream.write('\n')
PY
  mv -f "${temporary}" "${root}/${state}"
}
emit_request() {
  local state="$1"
  python3 - "${root}/${state}" <<'PY'
import json, sys
print(json.dumps(json.load(open(sys.argv[1], encoding='utf-8')), indent=2, sort_keys=True))
PY
}
validate_request() {
  local state="$1" story="$2" spec="$3" baseline="$4" evidence="$5" outcome="$6" identity="$7"
  safe_existing_file "${state}" || die "prior human-smoke request is missing, unsafe, or stale"
  python3 - "${root}/${state}" "${story}" "${spec}" "${baseline}" "${evidence}" "${outcome}" "${identity}" <<'PY' || die "prior human-smoke request is malformed or inconsistent"
import json, re, sys
try:
    path, story, spec, baseline, evidence, outcome, identity = sys.argv[1:]
    data = json.load(open(path, encoding='utf-8'))
    assert set(data) == {'schema','branch','spec_reference','baseline_commit','e2e_reference','e2e_outcome','request_identity','readiness','human_smoke_request','review_integration_approval'}
    assert data == {
      'schema': 'hatcast.story-delivery-gates.v1', 'branch': 'feat/' + story,
      'spec_reference': spec, 'baseline_commit': baseline,
      'e2e_reference': evidence, 'e2e_outcome': outcome,
      'request_identity': identity,
      'readiness': 'ready', 'human_smoke_request': 'permitted',
      'review_integration_approval': 'external',
    }
    assert all(not isinstance(value, str) or ('..' not in value and not value.startswith('/')) for value in data.values())
except Exception:
    raise SystemExit(1)
PY
}
validate_smoke() {
  local smoke="$1" story="$2" baseline="$3" evidence="$4" outcome="$5" identity="$6"
  safe_existing_file "${smoke}" || die "human-smoke state is missing, unsafe, or stale"
  python3 - "${root}" "${smoke}" "${story}" "${baseline}" "${evidence}" "${outcome}" "${identity}" <<'PY' || die "human-smoke state is malformed, incomplete, or inconsistent"
import hashlib, json, os, re, subprocess, sys
try:
    root, path, story, baseline, evidence, outcome, identity = sys.argv[1:]
    data = json.load(open(os.path.join(root, path), encoding='utf-8'))
    required = {'schema','branch','baseline_commit','guide_reference','e2e_reference','e2e_outcome','url','owner','result','owned_process_group','owned_process_marker'}
    assert set(data) == required and data['schema'] == 'hatcast.story-human-smoke-handoff.v1'
    assert data['branch'] == 'feat/' + story and data['baseline_commit'] == baseline
    assert data['e2e_reference'] == evidence and data['e2e_outcome'] == outcome
    assert data['result'] == 'stopped' and data['url'] == 'https://localhost:4200'
    assert re.fullmatch(r'[A-Za-z0-9._/-]+', data['guide_reference']) and '..' not in data['guide_reference']
    guide = data['guide_reference']; assert os.path.isfile(os.path.join(root, guide)) and not os.path.islink(os.path.join(root, guide))
    ignored = subprocess.call(['git', '-C', root, 'check-ignore', '-q', '--', guide]) == 0; assert not ignored
    assert re.fullmatch(r'[A-Za-z0-9._-]+', data['owner'])
    assert re.fullmatch(r'[0-9]+', data['owned_process_group']) and re.fullmatch(r'[A-Za-z0-9-]+', data['owned_process_marker'])
    canonical = json.dumps({'branch': data['branch'], 'baseline_commit': data['baseline_commit'], 'e2e_reference': data['e2e_reference'], 'e2e_outcome': data['e2e_outcome']}, sort_keys=True, separators=(',', ':'))
    assert hashlib.sha256(canonical.encode()).hexdigest() == identity
except Exception:
    raise SystemExit(1)
PY
}
request_human_smoke() {
  local story spec_info spec baseline evidence outcome readiness_output readiness_status state identity
  unit_valid || die "must run from a registered feat/{story-key} worktree"
  [[ -x "${runtime}" ]] || die "runtime inspection is unavailable"
  story="$(story_key)"; spec_info="$(canonical_spec)" || die "canonical story spec, baseline, or E2E reference is missing or ambiguous"
  IFS=$'\t' read -r spec baseline evidence <<<"${spec_info}"
  safe_nonignored_file "${spec}" || die "canonical story spec is missing, ignored, or unsafe"
  outcome="$(validate_evidence "${evidence}")"
  set +e; readiness_output="$(bash "${runtime}" inspect 2>&1)"; readiness_status=$?; set -e
  (( readiness_status == 0 )) && grep -Fqx 'READINESS=ready' <<<"${readiness_output}" || die "runtime readiness is not ready"
  identity="$(request_identity "feat/${story}" "${baseline}" "${evidence}" "${outcome}")"; state="$(state_path)"
  if [[ -e "${root}/${state}" || -L "${root}/${state}" ]]; then
    validate_request "${state}" "${story}" "${spec}" "${baseline}" "${evidence}" "${outcome}" "${identity}"
  else
    write_request "${state}" "${story}" "${spec}" "${baseline}" "${evidence}" "${outcome}" "${identity}"
  fi
  emit_request "${state}"
}
reverify() {
  local confirmation="$1" story spec_info spec baseline evidence outcome state smoke identity readiness_output readiness_status
  [[ "${confirmation}" =~ ^[A-Za-z0-9._-]{8,128}$ ]] || die "confirmation token is unsafe or missing"
  unit_valid || die "must run from a registered feat/{story-key} worktree"
  [[ -x "${runtime}" ]] || die "runtime inspection is unavailable"
  story="$(story_key)"; spec_info="$(canonical_spec)" || die "canonical story spec, baseline, or E2E reference is missing or ambiguous"
  IFS=$'\t' read -r spec baseline evidence <<<"${spec_info}"
  safe_nonignored_file "${spec}" || die "canonical story spec is missing, ignored, or unsafe"
  outcome="$(validate_evidence "${evidence}")"
  set +e; readiness_output="$(bash "${runtime}" inspect 2>&1)"; readiness_status=$?; set -e
  (( readiness_status == 0 )) && grep -Fqx 'READINESS=ready' <<<"${readiness_output}" || die "runtime readiness is not ready"
  identity="$(request_identity "feat/${story}" "${baseline}" "${evidence}" "${outcome}")"
  state="$(state_path)"; validate_request "${state}" "${story}" "${spec}" "${baseline}" "${evidence}" "${outcome}" "${identity}"
  smoke="$(smoke_path)"; validate_smoke "${smoke}" "${story}" "${baseline}" "${evidence}" "${outcome}" "${identity}"
  python3 - "${story}" "${baseline}" "${evidence}" "${outcome}" "${smoke}" "${identity}" <<'PY'
import json, sys
story, baseline, evidence, outcome, smoke, identity = sys.argv[1:]
print(json.dumps({
  'schema': 'hatcast.story-delivery-gates-reverification.v1',
  'branch': 'feat/' + story, 'baseline_commit': baseline,
  'e2e_reference': evidence, 'e2e_outcome': outcome,
  'request_identity': identity,
  'smoke_state_reference': smoke, 'smoke_result': 'stopped',
  'evidence_status': 'valid', 'confirmation_received': True,
  'review_integration_approval': 'external',
}, indent=2, sort_keys=True))
PY
}

command="${1:-}"; shift || true
case "${command}" in
  request-human-smoke) [[ $# -eq 0 ]] || { usage; exit 2; }; request_human_smoke ;;
  reverify) [[ $# -eq 2 && "$1" == --confirmation ]] || { usage; exit 2; }; reverify "$2" ;;
  --help|-h) usage ;;
  *) usage; exit 2 ;;
esac

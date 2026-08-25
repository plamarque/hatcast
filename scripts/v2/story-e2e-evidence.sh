#!/usr/bin/env bash
# Attest targeted, isolated Playwright evidence for one feat/* worktree.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(git -C "${script_dir}/../.." rev-parse --show-toplevel 2>/dev/null || true)"
runtime="${script_dir}/story-worktree-runtime.sh"
runner="${root}/scripts/run_e2e.sh"
report_ref="apps/web/playwright-report/index.html"
target=""; rationale=""; attestation=""
projects=(); specs=()
test_now=""; cited_equivalent=""; waiver_policy=""
# macOS still ships Bash 3.2, where expanding a declared empty array under
# nounset aborts. All scalar inputs below remain explicitly validated.
set +u

usage() {
  cat >&2 <<'EOF'
Usage: story-e2e-evidence.sh --target TARGET --rationale TEXT [options]

Options:
  --project NAME             Declared Playwright project (repeatable).
  --spec PATH                Declared path below apps/web/e2e (repeatable).
  --attestation PATH         Relative evidence JSON destination.
  --test-now PATH            Relative reference to the test to add now.
  --cited-equivalent PATH    Relative existing evidence reference.
  --waiver-policy PATH       Relative operator policy JSON with authority,
                             required_fields and approval (including expires_on).

Without a declared coverage selection, exactly one disposition is required.
EOF
}
die() { echo "E2E evidence gate: $*" >&2; exit 2; }
relative_path() { [[ "$1" != /* && "$1" != *".."* && "$1" =~ ^[A-Za-z0-9._/-]+$ ]]; }
safe_text() {
  [[ -n "$1" && "$1" != *$'\n'* && "$1" != *$'\r'* && "$1" != /* && ! "$1" =~ (^|[[:space:]])/ ]] || return 1
  [[ ! "$1" =~ (^|[[:space:]])[A-Za-z_][A-Za-z0-9_]*= ]] || return 1
}
normalise() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]'; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="${2:-}"; shift 2 ;;
    --rationale) rationale="${2:-}"; shift 2 ;;
    --project) projects+=("${2:-}"); shift 2 ;;
    --spec) specs+=("${2:-}"); shift 2 ;;
    --attestation) attestation="${2:-}"; shift 2 ;;
    --test-now) test_now="${2:-}"; shift 2 ;;
    --cited-equivalent) cited_equivalent="${2:-}"; shift 2 ;;
    --waiver-policy) waiver_policy="${2:-}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

[[ -n "${root}" && "$(git -C "${root}" branch --show-current 2>/dev/null || true)" == feat/* ]] || die "must run from a feat/{story-key} worktree"
git -C "${root}" worktree list --porcelain | awk -v expected="${root}" '/^worktree / { path = substr($0, 10) } /^branch refs\/heads\/feat\// && path == expected { found = 1 } END { exit(found ? 0 : 1) }' || die "current checkout is not a registered feature worktree"
[[ -x "${runtime}" && -x "${runner}" ]] || die "required runtime or E2E runner is unavailable"
safe_text "${target}" || die "target is unsafe or missing"
safe_text "${rationale}" || die "rationale is unsafe or missing"
[[ -z "${PLAYWRIGHT_REUSE_SERVERS:-}" || "${PLAYWRIGHT_REUSE_SERVERS}" == 0 ]] || die "server reuse is not permitted"

story_key="$(git -C "${root}" branch --show-current | sed 's#^feat/##')"
[[ -n "${attestation}" ]] || attestation="_bmad-output/implementation-artifacts/e2e-evidence/${story_key}.json"
relative_path "${attestation}" || die "attestation must be a safe relative path"
[[ "${attestation}" == _bmad-output/implementation-artifacts/e2e-evidence/* ]] || die "attestation must stay under _bmad-output/implementation-artifacts/e2e-evidence"
[[ ! -L "${root}/${attestation}" ]] || die "attestation destination must not be a symlink"

for project in "${projects[@]}"; do
  [[ "${project}" =~ ^[A-Za-z0-9._-]+$ ]] || die "unsafe project selection"
  grep -Fq "name: '${project}'" "${root}/apps/web/playwright.config.ts" || die "unknown Playwright project: ${project}"
done
for spec in "${specs[@]}"; do
  relative_path "${spec}" && [[ "${spec}" == apps/web/e2e/* && -f "${root}/${spec}" ]] || die "spec must be an existing declared relative E2E spec"
done

# A target is discoverable if it maps to a declared project or a declared spec.
target_key="$(normalise "${target}")"
[[ -n "${target_key}" ]] || die "target must contain at least one letter or digit"
discovered=()
while IFS= read -r project; do
  [[ "$(normalise "${project}")" == *"${target_key}"* ]] && discovered+=("project:${project}")
done < <(sed -nE "s/^[[:space:]]*name: '([^']+)'.*/\1/p" "${root}/apps/web/playwright.config.ts")
while IFS= read -r spec; do
  [[ "$(normalise "${spec}")" == *"${target_key}"* ]] && discovered+=("spec:${spec}")
done < <(cd "${root}" && find apps/web/e2e -type f -name '*.spec.ts' -print | LC_ALL=C sort)

if ((${#projects[@]} + ${#specs[@]} > 0)); then
  selected=()
  for project in "${projects[@]}"; do
    [[ " ${discovered[*]} " == *" project:${project} "* ]] || die "selected project does not map to target: ${project}"
    selected+=("project:${project}")
  done
  for spec in "${specs[@]}"; do
    [[ " ${discovered[*]} " == *" spec:${spec} "* ]] || die "selected spec does not map to target: ${spec}"
    selected+=("spec:${spec}")
  done
else
  selected=("${discovered[@]}")
fi

disposition_count=0
[[ -n "${test_now}" ]] && ((disposition_count+=1))
[[ -n "${cited_equivalent}" ]] && ((disposition_count+=1))
[[ -n "${waiver_policy}" ]] && ((disposition_count+=1))
if ((${#selected[@]} == 0)); then
  ((disposition_count == 1)) || die "coverage is absent: provide exactly one disposition"
else
  ((disposition_count == 0)) || die "coverage disposition is only valid when coverage is absent"
fi

disposition="run"
if [[ -n "${test_now}" ]]; then relative_path "${test_now}" || die "test-now reference must be relative"; disposition="test-now:${test_now}"; fi
if [[ -n "${cited_equivalent}" ]]; then relative_path "${cited_equivalent}" && [[ -f "${root}/${cited_equivalent}" ]] || die "cited equivalent must be an existing relative file"; disposition="cited-equivalent:${cited_equivalent}"; fi
if [[ -n "${waiver_policy}" ]]; then
  relative_path "${waiver_policy}" && [[ -f "${root}/${waiver_policy}" ]] || die "waiver policy must be an existing relative file"
  python3 - "${root}/${waiver_policy}" <<'PY' || die "waiver policy is unauthorized, malformed, or expired"
import datetime, json, sys
try:
    policy = json.load(open(sys.argv[1], encoding='utf-8'))
    authority = policy['authority']; fields = policy['required_fields']; approval = policy['approval']
    assert isinstance(authority, str) and authority and isinstance(fields, list) and fields
    assert approval['authority'] == authority
    assert all(isinstance(field, str) and field and approval.get(field) for field in fields)
    expires = datetime.date.fromisoformat(approval['expires_on'])
    assert expires >= datetime.date.today()
except Exception:
    raise SystemExit(1)
PY
  disposition="waiver:${waiver_policy}"
fi

write_attestation() {
  local outcome="$1" command="$2" destination temporary
  destination="${root}/${attestation}"
  [[ ! -L "${destination}" ]] || die "attestation destination must not be a symlink"
  mkdir -p "${root}/$(dirname "${attestation}")"
  temporary="$(mktemp "${destination}.tmp.XXXXXX")"
  if ! python3 - "${temporary}" "${story_key}" "${target}" "${rationale}" "${report_ref}" "${outcome}" "${command}" "${disposition}" -- "${selected[@]}" -- "${discovered[@]}" <<'PY'
import json, sys
path, story, target, rationale, report, outcome, command, disposition, *rest = sys.argv[1:]
selected, discovered = [], []
bucket = selected
for value in rest:
    if value == '--':
        bucket = discovered
    else:
        bucket.append(value)
payload = {
  'schema': 'hatcast.story-e2e-evidence.v1', 'story_key': story,
  'target': target, 'rationale': rationale, 'discovered': discovered,
  'selection': selected,
  'disposition': disposition, 'outcome': outcome,
  'report_reference': report,
}
if command: payload['command'] = command
with open(path, 'w', encoding='utf-8') as stream:
    json.dump(payload, stream, indent=2, sort_keys=True)
    stream.write('\n')
PY
  then
    rm -f "${temporary}"
    return 1
  fi
  mv -f "${temporary}" "${destination}"
}

# Readiness is checked after all pure argument validation and before the runner.
# A non-ready state supersedes any previous passing attestation for this target.
readiness_output="$(bash "${runtime}" inspect 2>&1 || true)"
if ! grep -Fqx 'READINESS=ready' <<<"${readiness_output}"; then
  write_attestation "failed:not-ready" ""
  die "runtime readiness is not ready"
fi

if ((${#selected[@]} == 0)); then
  write_attestation "not-run" ""
  echo "E2E evidence disposition recorded: ${attestation}"
  exit 0
fi

runner_args=()
for item in "${selected[@]}"; do
  case "${item}" in project:*) runner_args+=("--project=${item#project:}") ;; spec:*) runner_args+=("${item#spec:}") ;; esac
done
normalized_command="PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- ${runner_args[*]}"
set +e
PLAYWRIGHT_REUSE_SERVERS=0 bash "${runner}" -- "${runner_args[@]}"
runner_status=$?
set -e
if ((runner_status == 0)); then
  if [[ ! -f "${root}/${report_ref}" ]]; then
    write_attestation "failed:report-missing" "${normalized_command}"
    echo "E2E evidence report is missing: ${report_ref}" >&2
    exit 1
  fi
  write_attestation "passed" "${normalized_command}"
  echo "E2E evidence recorded: ${attestation}"
  exit 0
fi
write_attestation "failed:${runner_status}" "${normalized_command}"
echo "E2E evidence recorded with failed outcome: ${attestation}" >&2
exit "${runner_status}"

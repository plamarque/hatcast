#!/usr/bin/env bash
# Hermetic tests for the additive BMad sprint-status controller.

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-story-status.XXXXXX")"
trap 'rm -rf "${tmp}"' EXIT
controller="${root}/scripts/v2/story-status-sync.py"

fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { "$@" >/dev/null 2>&1 && fail "command unexpectedly succeeded: $*" || true; }
make_project() {
  local name="$1" project
  project="${tmp}/${name}"
  mkdir -p "${project}/_bmad-output/planning-artifacts" "${project}/_bmad-output/implementation-artifacts"
  printf '%s\n' \
    '### Epic 21 — Delivery' \
    '' \
    '#### Story 21.6 : GitHub review decision controller' \
    '' \
    '#### Story 21.7 : Another planned story' >"${project}/_bmad-output/planning-artifacts/epics.md"
  printf '%s\n' \
    '# retained header' \
    'generated: "2026-09-22T00:00:00Z"' \
    'development_status:' \
    '  # retained comment' \
    '  epic-21: backlog' \
    '  legacy-key: done  # must remain' \
    '  retained-cancelled: cancelled' \
    '  retained-human-gate: awaiting-operator' \
    'action_items:' \
    '  - retain-this' >"${project}/_bmad-output/implementation-artifacts/sprint-status.yaml"
  printf '%s\n' "${project}"
}

project="$(make_project addition)"
output="$(python3 "${controller}" --project-root "${project}" --story-key 21-6-github-review-decision-controller)"
[[ "${output}" == *$'TRACKING=added'* ]] || fail "addition result missing"
grep -Fx '  21-6-github-review-decision-controller: backlog' "${project}/_bmad-output/implementation-artifacts/sprint-status.yaml" >/dev/null || fail "missing added key"
grep -Fx '  legacy-key: done  # must remain' "${project}/_bmad-output/implementation-artifacts/sprint-status.yaml" >/dev/null || fail "historical key changed"
grep -Fx 'action_items:' "${project}/_bmad-output/implementation-artifacts/sprint-status.yaml" >/dev/null || fail "action items changed"
before="$(shasum -a 256 "${project}/_bmad-output/implementation-artifacts/sprint-status.yaml" | awk '{print $1}')"
output="$(python3 "${controller}" --project-root "${project}" --story-key 21-6-github-review-decision-controller)"
after="$(shasum -a 256 "${project}/_bmad-output/implementation-artifacts/sprint-status.yaml" | awk '{print $1}')"
[[ "${output}" == *$'TRACKING=present'* && "${before}" == "${after}" ]] || fail "idempotency changed bytes"

historical="$(make_project historical)"
historical_file="${historical}/_bmad-output/implementation-artifacts/sprint-status.yaml"
historical_entries="$(for number in $(seq 1 238); do printf '  historical-%s: done\\n' "${number}"; done)"
awk -v entries="${historical_entries}" '/^action_items:/ { print entries } { print }' "${historical_file}" >"${historical_file}.tmp"
mv "${historical_file}.tmp" "${historical_file}"
output="$(python3 "${controller}" --project-root "${historical}" --story-key 21-6-github-review-decision-controller)"
[[ "$(grep -c '^  historical-' "${historical}/_bmad-output/implementation-artifacts/sprint-status.yaml")" == 238 ]] || fail "historical entries were not retained"
[[ "${output}" == *"HISTORICAL_ORPHANS=241"* ]] || fail "historical orphan count was not reported"

duplicate_epics="$(make_project duplicate-epics)"
printf '%s\n' '### Epic 1 — Historical duplicate' >>"${duplicate_epics}/_bmad-output/planning-artifacts/epics.md"
python3 "${controller}" --project-root "${duplicate_epics}" --story-key 21-6-github-review-decision-controller >/dev/null || fail "unrelated duplicate Epic blocked requested story"

mismatched_epic="$(make_project mismatched-epic)"
printf '%s\n' '### Epic 22 — Wrong enclosing epic' '#### Story 21.8 : Misplaced story' >>"${mismatched_epic}/_bmad-output/planning-artifacts/epics.md"
expect_fail python3 "${controller}" --project-root "${mismatched_epic}" --story-key 21-6-github-review-decision-controller

unterminated="$(make_project unterminated)"
unterminated_file="${unterminated}/_bmad-output/implementation-artifacts/sprint-status.yaml"
printf '%s' 'development_status:
  terminal-entry: done' >"${unterminated_file}"
python3 "${controller}" --project-root "${unterminated}" --story-key 21-6-github-review-decision-controller >/dev/null
grep -Fx '  21-6-github-review-decision-controller: backlog' "${unterminated_file}" >/dev/null || fail "unterminated status entry corrupted insertion"

unknown="$(make_project unknown)"
unknown_file="${unknown}/_bmad-output/implementation-artifacts/sprint-status.yaml"
unknown_before="$(shasum -a 256 "${unknown_file}" | awk '{print $1}')"
expect_fail python3 "${controller}" --project-root "${unknown}" --story-key 21-9-missing-story
[[ "${unknown_before}" == "$(shasum -a 256 "${unknown_file}" | awk '{print $1}')" ]] || fail "unknown key changed tracking"

ambiguous="$(make_project ambiguous)"
printf '%s\n' '#### Story 21.6 : GitHub review decision controller' >>"${ambiguous}/_bmad-output/planning-artifacts/epics.md"
ambiguous_file="${ambiguous}/_bmad-output/implementation-artifacts/sprint-status.yaml"
ambiguous_before="$(shasum -a 256 "${ambiguous_file}" | awk '{print $1}')"
expect_fail python3 "${controller}" --project-root "${ambiguous}" --story-key 21-6-github-review-decision-controller
[[ "${ambiguous_before}" == "$(shasum -a 256 "${ambiguous_file}" | awk '{print $1}')" ]] || fail "ambiguous key changed tracking"

malformed="$(make_project malformed)"
malformed_file="${malformed}/_bmad-output/implementation-artifacts/sprint-status.yaml"
printf 'development_status:\n' >>"${malformed_file}"
malformed_before="$(shasum -a 256 "${malformed_file}" | awk '{print $1}')"
expect_fail python3 "${controller}" --project-root "${malformed}" --story-key 21-6-github-review-decision-controller
[[ "${malformed_before}" == "$(shasum -a 256 "${malformed_file}" | awk '{print $1}')" ]] || fail "malformed tracking changed bytes"

echo "PASS: story status synchronization"

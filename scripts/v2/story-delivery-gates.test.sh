#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-delivery-gates.XXXXXX")"
trap 'rm -rf "${tmp_root}"' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { if "$@" >/dev/null 2>&1; then fail "command unexpectedly succeeded: $*"; fi; }
integration="${tmp_root}/integration"; unit="${tmp_root}/unit"; bin="${tmp_root}/bin"; calls="${tmp_root}/calls.log"
git init "${integration}" >/dev/null; git -C "${integration}" config user.email test@example.invalid; git -C "${integration}" config user.name 'Delivery gates test'
mkdir -p "${integration}/scripts/v2" "${integration}/_bmad-output/implementation-artifacts/e2e-evidence" "${integration}/_bmad-output/implementation-artifacts/human-smoke" "${integration}/docs/v2/smoke"
cp "${source_root}/scripts/v2/story-delivery-gates.sh" "${integration}/scripts/v2/"
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=not-ready\\n"\nexit 1\n' >"${integration}/scripts/v2/story-worktree-runtime.sh"
printf '#!/usr/bin/env bash\nprintf "integration\\n" >>"${GATE_CALLS}"\nexit 99\n' >"${integration}/scripts/v2/story-branch.sh"
chmod +x "${integration}/scripts/v2/"*.sh
printf '{"name":"fixture"}\n' >"${integration}/package.json"
printf '%s\n' '{"route":"/","account_or_fixture_reference":"fixture: member","actions":["Open"],"expected_observations":["Loaded"]}' >"${integration}/docs/v2/smoke/guide.json"
printf '%s\n' '---' 'feature_branch: feat/21-5-delivery-gates-integration' 'baseline_commit: BASELINE' 'prior_e2e_evidence: _bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json' '---' >"${integration}/_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":["project:chromium-21-5"],"discovered":["project:chromium-21-5"],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-5"}' >"${integration}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
git -C "${integration}" add . && git -C "${integration}" commit -m 'test: Add delivery fixture' >/dev/null
baseline="$(git -C "${integration}" rev-parse HEAD)"
sed -i.bak "s/BASELINE/${baseline}/" "${integration}/_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md"; rm "${integration}/_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md.bak"
git -C "${integration}" add . && git -C "${integration}" commit -m 'test: Set delivery baseline' >/dev/null && git -C "${integration}" branch -M v2
git -C "${integration}" worktree add -b feat/21-5-delivery-gates-integration "${unit}" >/dev/null
gate="${unit}/scripts/v2/story-delivery-gates.sh"; exclude="$(git -C "${unit}" rev-parse --git-path info/exclude)"; mkdir -p "${exclude%/*}"; base=(env GATE_CALLS="${calls}")
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
[[ ! -e "${unit}/_bmad-output/implementation-artifacts/delivery-gates" ]] || fail 'missing readiness created delivery state'
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=ready\\n"\n' >"${unit}/scripts/v2/story-worktree-runtime.sh"
chmod +x "${unit}/scripts/v2/story-worktree-runtime.sh"
printf '%s\n' 'not-json' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
[[ ! -e "${unit}/_bmad-output/implementation-artifacts/delivery-gates" ]] || fail 'malformed E2E created delivery state'
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"failed:1","disposition":"run"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
printf '%s\n' '_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json' >>"${exclude}"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
: >"${exclude}"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"not-run","disposition":"test-now:apps/web/e2e/new.spec.ts","selection":[],"discovered":[]}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
"${base[@]}" bash "${gate}" request-human-smoke >"${tmp_root}/request.json"
state="${unit}/_bmad-output/implementation-artifacts/delivery-gates/21-5-delivery-gates-integration.json"
[[ -f "${state}" ]] || fail 'valid disposition did not retain request state'
grep -Eq '"request_identity": "[0-9a-f]{64}"' "${state}" || fail 'request did not retain a portable request identity'
grep -Fq '"review_integration_approval": "external"' "${tmp_root}/request.json" || fail 'request asserted integration approval'
! grep -Fq "${unit}" "${state}" || fail 'request state exposed an absolute worktree path'
! grep -Fq integration "${calls}" || fail 'controller invoked integration'
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=not-ready\\n"\nexit 1\n' >"${unit}/scripts/v2/story-worktree-runtime.sh"
chmod +x "${unit}/scripts/v2/story-worktree-runtime.sh"
rm -f "${calls}"; expect_fail "${base[@]}" bash "${gate}" request-human-smoke
[[ "$(cat "${state}")" == *'"readiness": "ready"'* ]] || fail 'failed later request rewrote retained evidence'
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=ready\\n"\n' >"${unit}/scripts/v2/story-worktree-runtime.sh"
chmod +x "${unit}/scripts/v2/story-worktree-runtime.sh"
printf '%s\n' '{"schema":"hatcast.story-e2e-evidence.v1","story_key":"21-3-targeted-e2e-evidence","outcome":"passed","disposition":"run","selection":["project:chromium-21-5"],"discovered":["project:chromium-21-5"],"report_reference":"apps/web/playwright-report/index.html","command":"HATCAST_E2E_NO_BROWSER_INSTALL=1 PLAYWRIGHT_REUSE_SERVERS=0 scripts/run_e2e.sh -- --project=chromium-21-5"}' >"${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
rm "${state}"
"${base[@]}" bash "${gate}" request-human-smoke >/dev/null
request_before="$(cat "${state}")"; "${base[@]}" bash "${gate}" request-human-smoke >/dev/null
[[ "$(cat "${state}")" == "${request_before}" ]] || fail 'valid retained request was overwritten'
python3 - "${state}" <<'PY'
import json, sys
p=json.load(open(sys.argv[1])); p['request_identity']='0'*64; json.dump(p, open(sys.argv[1], 'w'))
PY
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
printf '%s\n' "${request_before}" >"${state}"
expect_fail "${base[@]}" bash "${gate}" reverify --confirmation operator-2026
smoke="${unit}/_bmad-output/implementation-artifacts/human-smoke/21-5-delivery-gates-integration.json"
mkdir -p "${smoke%/*}"
printf '%s\n' "{\"schema\":\"hatcast.story-human-smoke-handoff.v1\",\"branch\":\"feat/21-5-delivery-gates-integration\",\"baseline_commit\":\"${baseline}\",\"guide_reference\":\"docs/v2/smoke/guide.json\",\"e2e_reference\":\"_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json\",\"e2e_outcome\":\"passed\",\"url\":\"https://localhost:4200\",\"owner\":\"operator\",\"result\":\"running\",\"owned_process_group\":\"123\",\"owned_process_marker\":\"smoke-123\"}" >"${smoke}"
expect_fail "${base[@]}" bash "${gate}" reverify --confirmation operator-2026
sed -i.bak 's/"running"/"stopped"/' "${smoke}"; rm "${smoke}.bak"
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=not-ready\\n"\nexit 1\n' >"${unit}/scripts/v2/story-worktree-runtime.sh"; chmod +x "${unit}/scripts/v2/story-worktree-runtime.sh"
expect_fail "${base[@]}" bash "${gate}" reverify --confirmation operator-2026
printf '#!/usr/bin/env bash\nprintf "inspect\\n" >>"${GATE_CALLS}"\nprintf "READINESS=ready\\n"\n' >"${unit}/scripts/v2/story-worktree-runtime.sh"; chmod +x "${unit}/scripts/v2/story-worktree-runtime.sh"
"${base[@]}" bash "${gate}" reverify --confirmation operator-2026 >"${tmp_root}/reverify.json"
grep -Fq '"evidence_status": "valid"' "${tmp_root}/reverify.json" || fail 'valid completed smoke was not reverified'
grep -Fq '"review_integration_approval": "external"' "${tmp_root}/reverify.json" || fail 'reverification asserted approval'
! grep -Fq operator-2026 "${tmp_root}/reverify.json" || fail 'confirmation token was persisted or emitted'
grep -Eq '"request_identity": "[0-9a-f]{64}"' "${tmp_root}/reverify.json" || fail 'reverification did not bind the retained request identity'
! grep -Fq integration "${calls}" || fail 'reverification invoked integration'
cp "${integration}/_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md" "${unit}/_bmad-output/implementation-artifacts/spec-duplicate.md"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
rm "${unit}/_bmad-output/implementation-artifacts/spec-duplicate.md"
git -C "${unit}" rm --cached -q -- _bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json
printf '%s\n' '_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json' >"${exclude}"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
git -C "${unit}" reset -q HEAD -- _bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json; : >"${exclude}"
git -C "${unit}" rm --cached -q -- _bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md
printf '%s\n' '_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md' >"${exclude}"
expect_fail "${base[@]}" bash "${gate}" request-human-smoke
git -C "${unit}" reset -q HEAD -- _bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md; : >"${exclude}"
rm "${smoke}"
ln -s "${tmp_root}/outside" "${smoke}"
expect_fail "${base[@]}" bash "${gate}" reverify --confirmation operator-2026
echo 'PASS: story delivery gates'

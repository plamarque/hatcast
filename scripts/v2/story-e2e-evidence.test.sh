#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="$(mktemp -d "${TMPDIR:-/tmp}/hatcast-e2e-evidence.XXXXXX")"
trap 'rm -rf "${tmp_root}"' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
expect_fail() { if "$@" >/dev/null 2>&1; then fail "command unexpectedly succeeded: $*"; fi; }
fixture="${tmp_root}/integration"; unit="${tmp_root}/unit"; log="${tmp_root}/runner.log"
git init "${fixture}" >/dev/null; git -C "${fixture}" config user.email test@example.invalid; git -C "${fixture}" config user.name 'E2E evidence test'
mkdir -p "${fixture}/scripts/v2" "${fixture}/apps/web/e2e/e1" "${fixture}/_bmad-output/implementation-artifacts"
cp "${source_root}/scripts/v2/story-e2e-evidence.sh" "${fixture}/scripts/v2/"
printf '#!/usr/bin/env bash\nprintf "READINESS=%%s\\nE2E_PROFILE=%%s\\n" "${E2E_READY:-ready}" "${E2E_PROFILE:-PLAYWRIGHT_REUSE_SERVERS=0}"\n[[ "${E2E_READY:-ready}" == ready ]]\n' >"${fixture}/scripts/v2/story-worktree-runtime.sh"
printf '#!/usr/bin/env bash\nroot="$(cd "$(dirname "$0")/.." && pwd)"\nprintf "no-browser-install=%%s reuse=%%s args=%%s\\n" "${HATCAST_E2E_NO_BROWSER_INSTALL:-}" "${PLAYWRIGHT_REUSE_SERVERS:-}" "$*" >>"${E2E_RUNNER_LOG}"\nif [[ "${E2E_CREATE_REPORT:-1}" == 1 ]]; then mkdir -p "${root}/apps/web/playwright-report"; : >"${root}/apps/web/playwright-report/index.html"; fi\nexit "${E2E_RUNNER_STATUS:-0}"\n' >"${fixture}/scripts/run_e2e.sh"
chmod +x "${fixture}/scripts/v2/"*.sh "${fixture}/scripts/run_e2e.sh"
printf "export default { projects: [\n  {\n    name: 'chromium-3-19',\n    testMatch: /recette-3\\.19\\.spec\\.ts/,\n  },\n  {\n    name: 'e1-mobile-member',\n    testMatch: /e1\\/.*\\.mobile\\.spec\\.ts/,\n  },\n] }\n" >"${fixture}/apps/web/playwright.config.ts"
: >"${fixture}/apps/web/e2e/recette-3.19.spec.ts"; : >"${fixture}/apps/web/e2e/e1/member.mobile.spec.ts"
: >"${fixture}/apps/web/e2e/auth.setup.ts"
git -C "${fixture}" add . && git -C "${fixture}" commit -m 'test: Add fixture' >/dev/null && git -C "${fixture}" branch -M v2
git -C "${fixture}" worktree add -b feat/21-3-targeted-e2e-evidence "${unit}" >/dev/null
gate="${unit}/scripts/v2/story-e2e-evidence.sh"
base=(env E2E_RUNNER_LOG="${log}")
"${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage' >"${tmp_root}/pass.out"
evidence="${unit}/_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json"
[[ -f "${evidence}" ]] || fail 'missing successful attestation'
grep -Fq 'project:chromium-3-19' "${evidence}" || fail 'project mapping was not discovered'
grep -Fq 'spec:apps/web/e2e/recette-3.19.spec.ts' "${evidence}" || fail 'spec mapping was not discovered'
grep -Fqx 'no-browser-install=1 reuse=0 args=-- --project=chromium-3-19 e2e/recette-3.19.spec.ts' "${log}" || fail 'runner did not use isolated invocation without browser download'
! grep -Fq "${unit}" "${evidence}" || fail 'attestation exposed absolute path'
! grep -Eqi 'human smoke|integration approval|process|secret' "${evidence}" || fail 'attestation made prohibited claim or output'
rm -f "${log}"; expect_fail "${base[@]}" E2E_READY=not-ready bash "${gate}" --target 3-19 --rationale 'Story coverage'
[[ ! -e "${log}" ]] || fail 'runner was called when readiness was not ready'
grep -Fq '"outcome": "failed:not-ready"' "${evidence}" || fail 'not-ready state left a passed attestation'
rm -f "${log}"; expect_fail "${base[@]}" E2E_PROFILE=PLAYWRIGHT_REUSE_SERVERS=1 bash "${gate}" --target 3-19 --rationale 'Story coverage'
[[ ! -e "${log}" ]] || fail 'runner was called for a non-isolated runtime profile'
"${base[@]}" E2E_RUNNER_STATUS=7 bash "${gate}" --target 3-19 --rationale 'Story coverage' >/dev/null 2>&1 && fail 'failed runner unexpectedly succeeded'
grep -Fq '"outcome": "failed:7"' "${evidence}" || fail 'failed result was not attested'
expect_fail "${base[@]}" PLAYWRIGHT_REUSE_SERVERS=1 bash "${gate}" --target 3-19 --rationale 'Story coverage'
rm -f "${log}"
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage' --project e1-mobile-member
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage' --spec apps/web/e2e/e1/member.mobile.spec.ts
[[ ! -e "${log}" ]] || fail 'runner was called for unrelated explicit coverage'
expect_fail "${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage'
"${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage' --test-now apps/web/e2e/new-target.spec.ts >/dev/null
grep -Fq 'test-now:apps/web/e2e/new-target.spec.ts' "${evidence}" || fail 'test-now disposition missing'
"${base[@]}" bash "${gate}" --target auth --rationale 'Setup is not capability coverage' --test-now apps/web/e2e/auth-flow.spec.ts >/dev/null
grep -Fq 'test-now:apps/web/e2e/auth-flow.spec.ts' "${evidence}" || fail 'setup file was treated as capability coverage'
"${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage' --cited-equivalent apps/web/e2e/recette-3.19.spec.ts >/dev/null
grep -Fq 'cited-equivalent:apps/web/e2e/recette-3.19.spec.ts' "${evidence}" || fail 'cited equivalent disposition missing'
expect_fail "${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage' --test-now apps/web/e2e/new-target.spec.ts --cited-equivalent apps/web/e2e/recette-3.19.spec.ts
printf '{"authority":"release-manager","required_fields":["ticket"],"approval":{"authority":"release-manager","ticket":"E2E-42","expires_on":"2099-01-01"}}\n' >"${unit}/waiver.json"
"${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage' --waiver-policy waiver.json >/dev/null
printf '{"authority":"release-manager","required_fields":["ticket"],"approval":{"authority":"release-manager","expires_on":"2000-01-01"}}\n' >"${unit}/waiver.json"
expect_fail "${base[@]}" bash "${gate}" --target unmatched --rationale 'No declared coverage' --waiver-policy waiver.json
expect_fail "${base[@]}" bash "${gate}" --target unmatched --rationale 'TOKEN=not-safe' --test-now apps/web/e2e/new-target.spec.ts
expect_fail "${base[@]}" bash "${gate}" --target unmatched --rationale 'See /var/tmp/evidence' --test-now apps/web/e2e/new-target.spec.ts
expect_fail "${base[@]}" bash "${gate}" --target '---' --rationale 'No declared coverage' --test-now apps/web/e2e/new-target.spec.ts
rm -f "${unit}/apps/web/playwright-report/index.html"
expect_fail "${base[@]}" E2E_CREATE_REPORT=0 bash "${gate}" --target 3-19 --rationale 'Story coverage'
grep -Fq '"outcome": "failed:report-missing"' "${evidence}" || fail 'missing report left a passed attestation'
mkdir -p "${unit}/apps/web/playwright-report"; : >"${unit}/apps/web/playwright-report/index.html"
expect_fail "${base[@]}" E2E_CREATE_REPORT=0 bash "${gate}" --target 3-19 --rationale 'Story coverage'
grep -Fq '"outcome": "failed:report-missing"' "${evidence}" || fail 'stale report was accepted'
rm -rf "${unit}/apps/web/playwright-report"; mkdir -p "${tmp_root}/external-report"; : >"${tmp_root}/external-report/index.html"; ln -s "${tmp_root}/external-report" "${unit}/apps/web/playwright-report"
rm -f "${log}"
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage'
[[ -f "${tmp_root}/external-report/index.html" ]] || fail 'symlinked report parent was mutated'
[[ ! -e "${log}" ]] || fail 'runner was called for symlinked report parent'
rm "${unit}/apps/web/playwright-report"; mkdir -p "${unit}/apps/web/playwright-report"
rm -f "${evidence}"; : >"${tmp_root}/outside"; ln -s "${tmp_root}/outside" "${evidence}"
rm -f "${log}"
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage'
[[ -L "${evidence}" && "$(cat "${tmp_root}/outside")" == "" ]] || fail 'symlink attestation destination was followed or replaced'
[[ ! -e "${log}" ]] || fail 'runner was called for symlink attestation destination'
rm "${evidence}"; rmdir "${unit}/_bmad-output/implementation-artifacts/e2e-evidence"; ln -s "${tmp_root}" "${unit}/_bmad-output/implementation-artifacts/e2e-evidence"
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage'
[[ ! -e "${tmp_root}/21-3-targeted-e2e-evidence.json" ]] || fail 'symlink attestation parent was followed'
expect_fail "${base[@]}" bash "${gate}" --target 3-19 --rationale 'Story coverage' --project
echo 'PASS: story targeted E2E evidence'

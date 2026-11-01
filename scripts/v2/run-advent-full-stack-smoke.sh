#!/usr/bin/env bash
# CI-only isolated H2 stack; never attaches to an existing API or database.
set -euo pipefail
if [[ -z "${ADVENT_SMOKE_BOUNDARY:-}" ]]; then
  ADVENT_SMOKE_BOUNDARY=before "$0"
  ADVENT_SMOKE_BOUNDARY=after "$0"
  ADVENT_SMOKE_BOUNDARY=transition "$0"
  exit 0
fi
case "${ADVENT_SMOKE_BOUNDARY}" in
  before|transition) fixture_time=2026-11-30T22:59:59Z ;;
  after) fixture_time=2026-11-30T23:00:00Z ;;
  *) exit 1 ;;
esac
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
web_root="${ADVENT_WORKER_BUILD:-${root}/apps/web/dist/web/browser}"
logdir="$(mktemp -d)"
api_pid=""
web_pid=""
cleanup() {
  if [[ -n "${web_pid}" ]]; then kill -TERM -- "-${web_pid}" 2>/dev/null || true; fi
  if [[ -n "${api_pid}" ]]; then kill -TERM -- "-${api_pid}" 2>/dev/null || true; fi
  [[ -z "${web_pid}" ]] || wait "${web_pid}" 2>/dev/null || true
  [[ -z "${api_pid}" ]] || wait "${api_pid}" 2>/dev/null || true
  rm -rf "${logdir}"
}
trap cleanup EXIT
[[ -f "${web_root}/ngsw.json" ]] || { echo 'Production-local PWA build missing' >&2; exit 1; }
node -e "const n=require('node:net'); Promise.all([18080,14331].map(p=>new Promise((ok,no)=>{const s=n.createServer();s.once('error',no);s.listen(p,'127.0.0.1',()=>s.close(ok))}))).catch(e=>{console.error('Test port unavailable:',e.message);process.exitCode=1})"
(
  cd "${root}/services/api"
  exec python3 -c 'import os,sys; os.setsid(); os.execvp(sys.argv[1],sys.argv[1:])' env -i PATH="${PATH}" JAVA_HOME="${JAVA_HOME:-}" \
    HATCAST_ADVENT_E2E_FIXED_INSTANT="${fixture_time}" HATCAST_SPRING_PROFILE=e2e HATCAST_SERVER_PORT=18080 SERVER_ADDRESS=127.0.0.1 \
    HATCAST_CORS_ALLOWED_ORIGINS=http://127.0.0.1:14331 \
    HATCAST_ADVENT_TROUPE_ID=a0000001-0000-4000-8000-000000000001 \
    HATCAST_ADVENT_EXCLUDED_USER_IDS=d0000001-0000-4000-8000-000000000022,d0000001-0000-4000-8000-000000000003 \
    SPRING_FLYWAY_LOCATIONS="classpath:db/migration,classpath:db/seed,classpath:db/seed-postgresql,filesystem:${root}/apps/web/e2e/advent-isolation/fixtures" \
    ./gradlew bootRun --no-daemon >"${logdir}/api.log" 2>&1
) &
api_pid=$!
(
  cd "${root}/apps/web"
  exec python3 -c 'import os,sys; os.setsid(); os.execvp(sys.argv[1],sys.argv[1:])' env ADVENT_WORKER_BUILD="${web_root}" node e2e/advent-isolation/full-stack-preview-server.cjs >"${logdir}/web.log" 2>&1
) &
web_pid=$!
ready=false
for ((attempt=0; attempt<120; attempt++)); do
  if curl -fsS http://127.0.0.1:18080/actuator/health >/dev/null 2>&1 && curl -fsS http://127.0.0.1:14331/ >/dev/null 2>&1; then ready=true; break; fi
  if ! kill -0 "${api_pid}" 2>/dev/null || ! kill -0 "${web_pid}" 2>/dev/null; then break; fi
  sleep 2
done
if [[ "${ready}" != true ]]; then
  echo 'Isolated Advent stack failed to start' >&2
  tail -n 60 "${logdir}/api.log" "${logdir}/web.log" >&2
  exit 1
fi
cd "${root}/apps/web"
node e2e/advent-isolation/full-stack-preview.smoke.cjs

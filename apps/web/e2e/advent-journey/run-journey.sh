#!/usr/bin/env bash
# The real path uses the separately validated privileged clock guardian.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$dir/../../../.." && pwd)"
REAL_LAUNCH_ENABLED=1
action="${1:-}"
case "${1:-}" in
  --simulate-guardian) [[ $# == 1 ]] || exit 2; exec python3 "$dir/guardian-client.py" ;;
  --simulate-parent-loss) [[ $# == 1 ]] || exit 2; exec python3 "$dir/parent-loss-check.py" --simulate ;;
  --simulate-validation) [[ $# == 1 ]] || exit 2; exec python3 "$dir/privileged-validation.py" --simulate ;;
  --run|--recover|--preflight|--validate-clock|--recover-clock|--validate-parent-loss|--validate-guardian) [[ $# == 1 ]] || exit 2 ;;
  *) echo 'Choose --simulate-guardian, --preflight, --validate-clock, --recover-clock, --run or --recover.' >&2; exit 2 ;;
esac
if [[ "$1" == --validate-guardian ]]; then
  [[ "$(uname -s)" == Darwin ]] || { echo 'macOS required' >&2; exit 1; }
  exec /usr/bin/sudo /usr/bin/python3 "$dir/privileged-validation.py" --real
fi
if [[ "$1" == --validate-parent-loss ]]; then
  [[ "$(uname -s)" == Darwin ]] || { echo 'macOS required' >&2; exit 1; }
  /usr/bin/sudo -v
  exec python3 "$dir/parent-loss-check.py" --real
fi
if [[ "$1" == --validate-clock || "$1" == --recover-clock ]]; then
  [[ "$(uname -s)" == Darwin ]] || { echo 'macOS required' >&2; exit 1; }
  if [[ "$1" == --validate-clock ]]; then action_flag=--short-check; else action_flag=--recover; fi
  exec /usr/bin/sudo /usr/bin/python3 "$dir/clock-guardian.py" "$action_flag"
fi
if [[ "$1" != --preflight && "$REAL_LAUNCH_ENABLED" != 1 ]]; then
  echo 'BLOCKED: privileged guardian and recovery are not validated; no clock change or authentication attempted.' >&2
  exit 1
fi
[[ "$(uname -s)" == Darwin ]] || { echo 'macOS required' >&2; exit 1; }
if [[ "$1" == '--recover' ]]; then
  # Separate explicit recovery invocation; guardian validates the root-owned record.
  sudo -v
  exec sudo -n /usr/bin/python3 "$dir/clock-guardian.py" --recover
fi
web="$root/apps/web/dist/web/browser"
[[ -f "$web/ngsw.json" ]] || { echo 'Production PWA build missing.' >&2; exit 1; }
for port in 18080 14331; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is occupied; refusing reuse." >&2; exit 1; fi
done
umask 077
out="$(mktemp -d /private/tmp/hatcast-advent-journey.XXXXXXXX)"
api_pid='' web_pid=''
cleanup() {
  status=$?
  trap - EXIT INT TERM HUP
  [[ -z "$web_pid" ]] || kill -TERM -- "-$web_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || kill -TERM -- "-$api_pid" 2>/dev/null || true
  [[ -z "$web_pid" ]] || wait "$web_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || wait "$api_pid" 2>/dev/null || true
  rm -f "$out/portrait-refs.txt" "$out/expectations.json" "$out/fixtures/V999__advent_journey_private.sql"
  rmdir "$out/fixtures" 2>/dev/null || true
  if [[ "$action" == --preflight ]]; then rmdir "$out" 2>/dev/null || true; else echo "Evidence retained in private directory $out"; fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP
common_git="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
shared_root="$(dirname "$common_git")"
export NODE_PATH="$root/node_modules:$shared_root/node_modules${NODE_PATH:+:$NODE_PATH}"
command -v ffmpeg >/dev/null || { echo 'ffmpeg is required for the recording.' >&2; exit 1; }
node -e 'const fs=require("node:fs"), {chromium}=require("@playwright/test"); if(!fs.existsSync(chromium.executablePath())) { console.error("Playwright Chromium is missing."); process.exit(1) }'
if [[ -z "${ADVENT_OPERATOR_PRINCIPAL:-}" ]]; then
  ADVENT_OPERATOR_PRINCIPAL="$(gcloud config get-value account 2>/dev/null)"
  export ADVENT_OPERATOR_PRINCIPAL
fi
ADVENT_JOURNEY_PRIVATE_DIR="$out" node "$dir/private-catalogue.mjs"
(
 cd "$root/services/api"
 exec python3 -c 'import os,sys; os.setsid(); os.execvp(sys.argv[1],sys.argv[1:])' env -i PATH="$PATH" JAVA_HOME="${JAVA_HOME:-}" \
 HATCAST_SPRING_PROFILE=e2e HATCAST_SERVER_PORT=18080 SERVER_ADDRESS=127.0.0.1 \
 HATCAST_CORS_ALLOWED_ORIGINS=http://127.0.0.1:14331 \
 HATCAST_ADVENT_TROUPE_ID=a0000001-0000-4000-8000-000000000001 \
 HATCAST_ADVENT_EXCLUDED_USER_IDS=d0000001-0000-4000-8000-000000000022,d0000001-0000-4000-8000-000000000003 \
 SPRING_FLYWAY_LOCATIONS="classpath:db/migration,classpath:db/seed,classpath:db/seed-postgresql,filesystem:${out}/fixtures" \
 ./gradlew bootRun --no-daemon >/dev/null 2>&1
) & api_pid=$!
(
 cd "$root/apps/web"
 exec python3 -c 'import os,sys; os.setsid(); os.execvp(sys.argv[1],sys.argv[1:])' env ADVENT_WORKER_BUILD="$web" node e2e/advent-isolation/full-stack-preview-server.cjs >/dev/null 2>&1
) & web_pid=$!
ready=0
for ((n=0;n<120;n++)); do
 if curl -fsS -H 'X-Hatcast-E2E-Key: e2e-fixtures-secret' http://127.0.0.1:14331/v1/e2e/fixtures/advent-preview-guard 2>/dev/null | grep -q 'advent-e2e-memory'; then ready=1; break; fi
 kill -0 "$api_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null || break
 sleep 2
done
[[ "$ready" == 1 ]] || { echo 'Isolated stack failed; private diagnostics suppressed.' >&2; exit 1; }
curl -fsS http://127.0.0.1:14331/ >/dev/null
curl -fsS http://127.0.0.1:18080/actuator/health >/dev/null
echo 'Private catalogue, H2 migration, isolation guard, frontend and API preflight succeeded.'
if [[ "$1" == --preflight ]]; then exit 0; fi
# Authentication happens once before time changes; a single guardian retains privilege.
sudo -v
ADVENT_JOURNEY_OUTPUT="$out" ADVENT_JOURNEY_EXPECTATIONS="$out/expectations.json" python3 "$dir/guardian-client.py" --real-journey

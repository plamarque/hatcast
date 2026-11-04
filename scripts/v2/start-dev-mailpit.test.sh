#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
root="$tmp/repo"; bin="$tmp/bin"
mkdir -p "$root/scripts/v2/lib" "$root/services/api" "$root/apps/web/public" "$bin"
cp "$source_root/scripts/start-dev.sh" "$source_root/scripts/load-dotenv.sh" "$root/scripts/"
cp "$source_root/scripts/v2/lib/version-txt.sh" "$root/scripts/v2/lib/"
printf 'print("FRONT_PORT=23456")\nprint("API_PORT=23457")\n' >"$root/scripts/v2/worktree-ports.py"
printf '1.0.0\n' >"$root/apps/web/public/version.txt"
printf '#!/usr/bin/env bash\nprintf "%%s|%%s|%%s\\n" "${HATCAST_NOTIFICATION_EMAIL_ENABLED:-}" "${HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY:-unset}" "${HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY:-unset}" >"${ENV_LOG}"\nsleep 2\n' >"$root/services/api/gradlew"
chmod +x "$root/services/api/gradlew"
printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$*" >>"${DOCKER_LOG}"\ncase "$1" in info) exit 0;; ps) printf "hatcast-mailpit\\n";; *) exit 1;; esac\n' >"$bin/docker"
printf '#!/usr/bin/env bash\nexit 1\n' >"$bin/curl"
printf '#!/usr/bin/env bash\nexit 1\n' >"$bin/lsof"
chmod +x "$bin/docker" "$bin/curl" "$bin/lsof"
git init -q "$root"
printf 'certificate\n' >"$tmp/cert"; printf 'key\n' >"$tmp/key"
common=(PATH="$bin:$PATH" HATCAST_WEB_SSL_CERT="$tmp/cert" HATCAST_WEB_SSL_KEY="$tmp/key" HATCAST_NOTIFICATION_EMAIL_ENABLED=true HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY=public HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY=private ENV_LOG="$tmp/env.log" DOCKER_LOG="$tmp/docker.log")
# Startup is stopped by our fake API; no Docker action may happen in offline mode.
env "${common[@]}" bash "$root/scripts/start-dev.sh" --offline --no-tailscale >"$tmp/offline.log" 2>&1 || true
[[ "$(cat "$tmp/env.log")" == 'false|unset|unset' ]] || { echo 'FAIL: offline notification settings' >&2; exit 1; }
[[ ! -e "$tmp/docker.log" ]] || { echo 'FAIL: offline invoked Docker' >&2; exit 1; }
# A pre-existing container is never started, stopped, or reused.
if env "${common[@]}" bash "$root/scripts/start-dev.sh" --no-tailscale >"$tmp/online.log" 2>&1; then
  echo 'FAIL: existing Mailpit was accepted' >&2; exit 1
fi
grep -q 'existe déjà' "$tmp/online.log"
! grep -Eq '^(start|stop|run|rm) ' "$tmp/docker.log" || { echo 'FAIL: existing Mailpit mutated' >&2; exit 1; }
echo 'PASS: isolated Mailpit and offline notifications'

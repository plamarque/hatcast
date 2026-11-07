#!/usr/bin/env bash
set -euo pipefail
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d)"; launcher=""
cleanup_test() { [[ -z "$launcher" ]] || kill -TERM "$launcher" 2>/dev/null || true; rm -rf "$tmp"; }
trap cleanup_test EXIT
root="$tmp/repo"; bin="$tmp/bin"
mkdir -p "$root/scripts/v2/lib" "$root/services/api" "$root/apps/web/public" "$bin"
cp "$source_root/scripts/start-dev.sh" "$source_root/scripts/load-dotenv.sh" "$root/scripts/"
cp "$source_root/scripts/v2/lib/version-txt.sh" "$root/scripts/v2/lib/"
printf 'print("FRONT_PORT=23456")\nprint("API_PORT=23457")\n' >"$root/scripts/v2/worktree-ports.py"
cat >"$root/scripts/v2/tailscale-serve-route.py" <<'PYCODE'
import os,sys
with open(os.environ['ROUTE_LOG'], 'a') as f: f.write(' '.join(sys.argv[1:]) + '\n')
if sys.argv[1] == 'create' and os.environ.get('ROUTE_CREATE_FAIL') == '1': sys.exit(1)
PYCODE
cat >"$bin/tailscale" <<'SHELLCODE'
#!/usr/bin/env bash
printf '%s\n' '{"Self":{"DNSName":"machine.tailnet.ts.net."}}'
SHELLCODE
chmod +x "$bin/tailscale"
printf '1.0.0\n' >"$root/apps/web/public/version.txt"
printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$$" >"${API_PID_LOG}"\nsleep 120 &\nprintf "%%s\\n" "$!" >"${API_CHILD_LOG}"\nwait\n' >"$root/services/api/gradlew"
printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$*" >"${WEB_ARGS_LOG}"\nprintf "%%s\\n" "$$" >"${WEB_PID_LOG}"\nsleep 120 &\nprintf "%%s\\n" "$!" >"${WEB_CHILD_LOG}"\nwait\n' >"$bin/npm"
printf '#!/usr/bin/env bash\nprintf "hit\\n" >>"${CURL_LOG}"\nexit 0\n' >"$bin/curl"
printf '#!/usr/bin/env bash\nif [[ -n "${FOREIGN_LISTENER_PID:-}" && ( "${FOREIGN_AFTER_HEALTH:-0}" != 1 || -e "${CURL_LOG}" ) ]]; then printf "%%s\\n" "$FOREIGN_LISTENER_PID"; elif [[ -s "${API_PID_LOG}" ]]; then cat "${API_PID_LOG}"; else exit 1; fi\n' >"$bin/lsof"
printf '#!/usr/bin/env bash\nwhile [[ $# -gt 0 ]]; do if [[ "$1" == -p ]]; then shift; printf "%%s\\n" "$1"; exit 0; fi; shift; done; exit 1\n' >"$bin/ps"
chmod +x "$root/services/api/gradlew" "$bin/npm" "$bin/curl" "$bin/lsof" "$bin/ps"
git init -q "$root"
printf x >"$tmp/cert"; printf x >"$tmp/key"
for mode in normal smoke smoke_group tailscale tailscale_failed; do
  rm -f "$tmp/api.pid" "$tmp/api-child.pid" "$tmp/web.pid" "$tmp/web-child.pid"
  marker=--no-tailscale; skip_arg=--no-tailscale
  if [[ "$mode" == smoke || "$mode" == smoke_group ]]; then marker=--human-smoke-owner=smoke-test; fi
  if [[ "$mode" == tailscale || "$mode" == tailscale_failed ]]; then marker=--offline; skip_arg=--offline; fi
  route_fail=0; [[ "$mode" != tailscale_failed ]] || route_fail=1
  rm -f "$tmp/route.log"
  launch_prefix=(); [[ "$mode" != smoke_group ]] || launch_prefix=(python3 -c 'import os,sys; os.setsid(); os.execvpe(sys.argv[1], sys.argv[1:], os.environ)')
  env PATH="$bin:$PATH" HATCAST_WEB_SSL_CERT="$tmp/cert" HATCAST_WEB_SSL_KEY="$tmp/key" HATCAST_NOTIFICATION_EMAIL_ENABLED=false ROUTE_LOG="$tmp/route.log" ROUTE_CREATE_FAIL="$route_fail" CURL_LOG="$tmp/curl.log" API_PID_LOG="$tmp/api.pid" API_CHILD_LOG="$tmp/api-child.pid" WEB_PID_LOG="$tmp/web.pid" WEB_ARGS_LOG="$tmp/web-args" WEB_CHILD_LOG="$tmp/web-child.pid" ${launch_prefix[@]+"${launch_prefix[@]}"} bash "$root/scripts/start-dev.sh" --offline "$skip_arg" "$marker" >"$tmp/$mode.log" 2>&1 &
  launcher=$!
  for ((i=0; i<100; i++)); do [[ -s "$tmp/web-child.pid" && -s "$tmp/api-child.pid" ]] && break; sleep 0.1; done
  [[ -s "$tmp/web-child.pid" && -s "$tmp/api-child.pid" ]] || { echo "FAIL: $mode stack did not start" >&2; exit 1; }
  grep -Fq -- '--host 127.0.0.1' "$tmp/web-args" || { echo "FAIL: $mode web bind is not loopback" >&2; exit 1; }
  grep -Fq -- "--proxy-config $root/.local/worktree-proxy.json" "$tmp/web-args" || { echo "FAIL: $mode web uses wrong proxy configuration" >&2; exit 1; }
  python3 - "$root/.local/worktree-proxy.json" <<'PYCODE'
import json,sys
p=json.load(open(sys.argv[1])); assert all(p[k]['target']=='http://127.0.0.1:23457' for k in ('/v1','/actuator'))
PYCODE
  read -r api <"$tmp/api.pid"; read -r api_child <"$tmp/api-child.pid"; read -r web <"$tmp/web.pid"; read -r web_child <"$tmp/web-child.pid"
  if [[ "$mode" == smoke_group ]]; then kill -TERM -- "-$launcher"; else kill -TERM "$launcher"; fi
  for ((i=0; i<100; i++)); do kill -0 "$launcher" 2>/dev/null || break; sleep 0.1; done
  kill -0 "$launcher" 2>/dev/null && { echo "FAIL: $mode launcher survived TERM" >&2; exit 1; }
  wait "$launcher" || true; launcher=""
  for pid in "$api" "$api_child" "$web" "$web_child"; do
    kill -0 "$pid" 2>/dev/null && { echo "FAIL: $mode child $pid survived TERM" >&2; exit 1; }
  done
  [[ ! -e "$root/.local/worktree-stack.lock" ]] || { echo "FAIL: $mode lock retained" >&2; exit 1; }
  case "$mode" in
    tailscale)
      [[ "$(cat "$tmp/route.log")" == $'create machine.tailnet.ts.net 23456\nremove machine.tailnet.ts.net 23456' ]] || { echo 'FAIL: Serve create/remove mismatch' >&2; exit 1; }
      grep -Fq 'https://machine.tailnet.ts.net:23456' "$tmp/$mode.log" || { echo 'FAIL: missing mobile URL' >&2; exit 1; } ;;
    tailscale_failed)
      [[ "$(cat "$tmp/route.log")" == 'create machine.tailnet.ts.net 23456' ]] || { echo 'FAIL: unowned Serve route cleanup' >&2; exit 1; }
      ! grep -Fq 'https://machine.tailnet.ts.net:23456' "$tmp/$mode.log" || { echo 'FAIL: unconfirmed mobile URL' >&2; exit 1; } ;;
    *) [[ ! -e "$tmp/route.log" ]] || { echo 'FAIL: Tailscale called when disabled' >&2; exit 1; } ;;
  esac
done
# A healthy foreign listener appearing after reservation must never be used or signalled.
rm -f "$tmp/api.pid" "$tmp/curl.log" "$tmp/web.pid"
sleep 120 & foreign=$!
if env PATH="$bin:$PATH" HATCAST_WEB_SSL_CERT="$tmp/cert" HATCAST_WEB_SSL_KEY="$tmp/key" HATCAST_NOTIFICATION_EMAIL_ENABLED=false API_PID_LOG="$tmp/api.pid" API_CHILD_LOG="$tmp/api-child.pid" WEB_PID_LOG="$tmp/web.pid" WEB_ARGS_LOG="$tmp/web-args" WEB_CHILD_LOG="$tmp/web-child.pid" CURL_LOG="$tmp/curl.log" FOREIGN_LISTENER_PID="$foreign" bash "$root/scripts/start-dev.sh" --offline --no-tailscale >"$tmp/foreign.log" 2>&1; then
  kill "$foreign" 2>/dev/null || true
  echo 'FAIL: foreign listener accepted' >&2; exit 1
fi
kill -0 "$foreign" 2>/dev/null || { echo 'FAIL: foreign listener was signalled' >&2; exit 1; }
kill "$foreign"; wait "$foreign" 2>/dev/null || true
[[ ! -e "$tmp/curl.log" && ! -e "$tmp/web.pid" ]] || { echo 'FAIL: foreign API was used or web launched' >&2; exit 1; }
grep -q 'autre processus' "$tmp/foreign.log" || { echo 'FAIL: foreign listener not reported' >&2; exit 1; }
# If the listener changes during the health request, recheck prevents handoff.
rm -f "$tmp/api.pid" "$tmp/curl.log" "$tmp/web.pid"
sleep 120 & foreign=$!
if env PATH="$bin:$PATH" HATCAST_WEB_SSL_CERT="$tmp/cert" HATCAST_WEB_SSL_KEY="$tmp/key" HATCAST_NOTIFICATION_EMAIL_ENABLED=false API_PID_LOG="$tmp/api.pid" API_CHILD_LOG="$tmp/api-child.pid" WEB_PID_LOG="$tmp/web.pid" WEB_ARGS_LOG="$tmp/web-args" WEB_CHILD_LOG="$tmp/web-child.pid" CURL_LOG="$tmp/curl.log" FOREIGN_LISTENER_PID="$foreign" FOREIGN_AFTER_HEALTH=1 bash "$root/scripts/start-dev.sh" --offline --no-tailscale >"$tmp/changed.log" 2>&1; then
  kill "$foreign" 2>/dev/null || true; echo 'FAIL: changed listener accepted' >&2; exit 1
fi
kill -0 "$foreign" 2>/dev/null || { echo 'FAIL: changed listener was signalled' >&2; exit 1; }
kill "$foreign"; wait "$foreign" 2>/dev/null || true
[[ -s "$tmp/curl.log" && ! -e "$tmp/web.pid" ]] || { echo 'FAIL: changed listener was handed off' >&2; exit 1; }
grep -q 'propriétaire du port API a changé' "$tmp/changed.log" || { echo 'FAIL: changed listener not reported' >&2; exit 1; }
echo 'PASS: dynamic proxy, Serve lifecycle, TERM and listener ownership'

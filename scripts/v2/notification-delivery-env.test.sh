#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/notification-delivery-env.sh"
output=''
append_env() { output+="$1=$2"$'\n'; }
fail() { echo "FAIL: $*" >&2; exit 1; }
for TARGET_ENV in development staging production; do
  output=''
  HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY=example-private-key
  HATCAST_NOTIFICATION_EMAIL_ENABLED=true
  configure_notification_delivery
  if [[ "$TARGET_ENV" == development ]]; then
    [[ "$output" == *$'HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY=\n'* ]] || fail 'development push not disabled'
    [[ "$output" == *$'HATCAST_NOTIFICATION_EMAIL_ENABLED=false\n'* ]] || fail 'development email not disabled'
    [[ "$HATCAST_NOTIFICATION_EMAIL_ENABLED" == false ]] || fail 'subsequent checks see the wrong email state'
    [[ "$output" != *example-private-key* ]] || fail 'development inherited the private key'
  else
    [[ "$output" == *$'HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY=example-private-key\n'* ]] || fail "$TARGET_ENV push changed"
    [[ "$output" == *$'HATCAST_NOTIFICATION_EMAIL_ENABLED=true\n'* ]] || fail "$TARGET_ENV email changed"
  fi
done
printf '%s\n' 'PASS: development blocks notification delivery; staging and production keep their own settings'

#!/usr/bin/env bash
# Sourced by Cloud Run deployment, after append_env is defined.
# Never propagate production-like push subscriptions to real devices from dev.
configure_notification_delivery() {
  if [ "${TARGET_ENV}" = "development" ]; then
    append_env HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY ""
    append_env HATCAST_NOTIFICATION_EMAIL_ENABLED false
    # Keep subsequent workflow checks consistent with the actual deployment.
    HATCAST_NOTIFICATION_EMAIL_ENABLED=false
    return
  fi
  if [ -n "${HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY}" ]; then
    append_env HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY "${HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY}"
  else
    echo '::warning::HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY not set — server push send disabled until configured'
  fi
  if [ -n "${HATCAST_NOTIFICATION_EMAIL_ENABLED}" ]; then
    append_env HATCAST_NOTIFICATION_EMAIL_ENABLED "${HATCAST_NOTIFICATION_EMAIL_ENABLED}"
  fi
}

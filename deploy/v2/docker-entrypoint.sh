#!/bin/sh
set -e
PORT="${PORT:-8080}"
export PORT
export NGINX_PORT="$PORT"
# shellcheck disable=SC2016
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec /usr/bin/supervisord -c /etc/supervisord.conf

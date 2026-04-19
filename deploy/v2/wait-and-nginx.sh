#!/bin/sh
# Attend que l'API réponde sur /actuator/health avant Nginx, pour limiter les 502
# (sinon Nginx écoute sur $PORT alors que rien n'est sur 8081).
# Si le délai max est dépassé, Nginx démarre quand même (dégradé : API peut encore être indispo).
set -e
PORT_API="${HATCAST_SERVER_PORT:-8081}"
MAX_WAIT="${WAIT_FOR_API_SECONDS:-240}"
i=0
while [ "$i" -lt "$MAX_WAIT" ]; do
  if curl -sf "http://127.0.0.1:${PORT_API}/actuator/health" >/dev/null; then
    exec /usr/sbin/nginx -g "daemon off;"
  fi
  i=$((i + 1))
  sleep 1
done
echo "wait-and-nginx: timeout ${MAX_WAIT}s — démarrage de Nginx sans API prête (voir Neon / JVM)." >&2
exec /usr/sbin/nginx -g "daemon off;"

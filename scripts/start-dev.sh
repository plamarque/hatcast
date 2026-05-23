#!/usr/bin/env bash
# Démarre la stack de développement locale **V2** : API Spring + client Angular (proxy /v1 → API).
#
# Usage (depuis la racine du dépôt) :
#   ./scripts/start-dev.sh
#   ./scripts/start-dev.sh --legacy   # ancien comportement : seulement le serveur V1 (Vue / Vite)
#
# Prérequis : `npm install` à la racine ; JDK 21 pour Gradle.
# Variables : fichier `.env` à la racine du dépôt est chargé automatiquement (toutes les clés `KEY=value`
# reconnues, commentaires `#` ignorés). Utile pour `HATCAST_*`, `VITE_*` (mode --legacy), etc.
#
# URLs : API http://127.0.0.1:8080 — front https://localhost:4200 (TLS, `ng serve --host` : aussi sur le LAN).
# API : PostgreSQL obligatoire (Neon) — exporter HATCAST_DATASOURCE_URL, HATCAST_DATASOURCE_USERNAME,
# HATCAST_DATASOURCE_PASSWORD dans `.env` (Flyway + Spring Session sur cette base).

set -euo pipefail
# Contrôle de jobs : le PID du job en arrière-plan devient chef de groupe → `kill -TERM -$pid` arrête Gradle **et** la JVM.
set -m

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=load-dotenv.sh
source "$ROOT/scripts/load-dotenv.sh"
load_dotenv "$ROOT/.env"

cd "$ROOT"

if [[ "${1:-}" == "--legacy" ]]; then
  exec npm run dev -- --host
fi

API_PID=""
CLEANUP_RAN=0

# Arrête tout ce qui écoute sur 8080 et ressemble à la JVM Spring / Gradle (repli si le groupe de processus n’a pas suffi).
free_hatcast_api_port() {
  local p args
  for p in $(lsof -nP -tiTCP:8080 -sTCP:LISTEN 2>/dev/null || true); do
    args=$(ps -p "$p" -o args= 2>/dev/null || true)
    [[ "$args" == *java* ]] || [[ "$(ps -p "$p" -o comm= 2>/dev/null)" == *java* ]] || continue
    kill -TERM "$p" 2>/dev/null || true
  done
  sleep 1
  for p in $(lsof -nP -tiTCP:8080 -sTCP:LISTEN 2>/dev/null || true); do
    args=$(ps -p "$p" -o args= 2>/dev/null || true)
    [[ "$args" == *java* ]] || [[ "$(ps -p "$p" -o comm= 2>/dev/null)" == *java* ]] || continue
    kill -KILL "$p" 2>/dev/null || true
  done
}

stop_api_tree() {
  [[ -z "$API_PID" ]] && return 0
  if ! kill -0 "$API_PID" 2>/dev/null; then
    free_hatcast_api_port
    return 0
  fi
  # Tuer le groupe de processus (Gradle wrapper + JVM enfant).
  if kill -TERM -"$API_PID" 2>/dev/null; then
    :
  else
    kill -TERM "$API_PID" 2>/dev/null || true
  fi
  local i
  for ((i = 0; i < 40; i++)); do
    kill -0 "$API_PID" 2>/dev/null || break
    sleep 0.5
  done
  if kill -0 "$API_PID" 2>/dev/null; then
    kill -KILL -"$API_PID" 2>/dev/null || kill -KILL "$API_PID" 2>/dev/null || true
  fi
  wait "$API_PID" 2>/dev/null || true
  free_hatcast_api_port
}

cleanup() {
  local ec=$?
  [[ "$CLEANUP_RAN" -eq 1 ]] && exit "$ec"
  CLEANUP_RAN=1
  echo ""
  echo "Arrêt de la stack…"
  stop_api_tree
  exit "$ec"
}
trap cleanup EXIT INT TERM

if [[ ! -x "$ROOT/services/api/gradlew" ]]; then
  echo "Erreur : services/api/gradlew introuvable ou non exécutable."
  exit 1
fi

echo "→ Démarrage de l’API Spring (port 8080)…"
(
  cd "$ROOT/services/api"
  exec ./gradlew bootRun --no-daemon
) &
API_PID=$!

echo "→ Attente de actuator/health…"
ready=0
for _ in $(seq 1 120); do
  if curl -sf "http://127.0.0.1:8080/actuator/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "✗ L’API s’est arrêtée avant d’être prête (voir les logs ci-dessus)."
    exit 1
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "✗ Timeout : l’API n’a pas répondu sur http://127.0.0.1:8080/actuator/health"
  exit 1
fi

echo "✓ API prête : http://127.0.0.1:8080"
echo ""
echo "→ Démarrage du client Angular (ng serve, port 4200 par défaut)…"
echo ""
echo "  Stack V2 :"
echo "    • API   : http://127.0.0.1:8080"
echo "    • Front : https://0.0.0.0:4200  (TLS ; accessible sur le LAN via l’IP locale)"
echo ""
echo "  Ctrl+C arrête le front puis l’API."
echo ""

cd "$ROOT"
# `--` obligatoire : transmet `--host 0.0.0.0` à `ng serve` (pas à npm intermédiaire).
npm run dev -w @hatcast/web -- --host 0.0.0.0

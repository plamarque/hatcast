#!/usr/bin/env bash
# Démarre la stack de développement locale **V2** : API Spring + client Angular (proxy /v1 → API).
#
# Usage (depuis la racine du dépôt) :
#   ./scripts/start-dev.sh
#   ./scripts/start-dev.sh --with-push   # ng serve --configuration=production (service worker → push Web)
#   ./scripts/start-dev.sh --with-push --no-tailscale
#   ./scripts/start-dev.sh --no-tailscale   # sans Tailscale Serve (accès mobile MagicDNS)
#   ./scripts/start-dev.sh --legacy   # ancien comportement : seulement le serveur V1 (Vue / Vite)
#
# Prérequis : `npm install` à la racine ; JDK 21 pour Gradle.
# Variables : fichier `.env` à la racine du dépôt est chargé automatiquement (toutes les clés `KEY=value`
# reconnues, commentaires `#` ignorés). Utile pour `HATCAST_*`, `VITE_*` (mode --legacy), etc.
#   HATCAST_SKIP_TAILSCALE_SERVE=1 — équivalent à --no-tailscale
#   HATCAST_START_DEV_WITH_PUSH=1 — équivalent à --with-push
#   HATCAST_NOTIFICATION_EMAIL_ENABLED=true — démarre Mailpit (Docker), force SMTP local pour l’API,
#   arrête Mailpit à la fin du script ; voir `.env.example`.
#   --with-push + EMAIL_ENABLED : push (VAPID dans .env) et emails (Mailpit) en parallèle pour story 8.3.
#
# URLs : API http://127.0.0.1:8080 — front https://localhost:4200 (TLS, `ng serve --host`).
#   Accès mobile (tailnet) : `tailscale up` si déconnecté, puis Serve → https://<machine>.<tailnet>.ts.net
#   OAuth Google : origine MagicDNS sans :4200 — voir docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md
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

SKIP_TAILSCALE_SERVE="${HATCAST_SKIP_TAILSCALE_SERVE:-0}"
WITH_PUSH="${HATCAST_START_DEV_WITH_PUSH:-0}"
for arg in "$@"; do
  case "$arg" in
    --no-tailscale) SKIP_TAILSCALE_SERVE=1 ;;
    --with-push | --push-test) WITH_PUSH=1 ;;
  esac
done

if [[ "${1:-}" == "--legacy" ]]; then
  exec npm run dev -- --host
fi

API_PID=""
CLEANUP_RAN=0
TAILSCALE_SERVE_URL=""

# Cible du proxy Serve (ng serve en HTTPS auto-signé). Flags avant la cible (CLI ≥ 1.52).
HATCAST_TAILSCALE_SERVE_TARGET="${HATCAST_TAILSCALE_SERVE_TARGET:-https+insecure://127.0.0.1:4200}"

tailscale_backend_running() {
  local state
  state="$(tailscale status --json 2>/dev/null | sed -n 's/.*"BackendState": "\([^"]*\)".*/\1/p' | head -1)"
  [[ "$state" == "Running" ]]
}

ensure_tailscale_connected() {
  if tailscale_backend_running; then
    return 0
  fi
  echo "→ Connexion Tailscale (tailscale up)…"
  local up_out=0
  up_out="$(tailscale up 2>&1)" || {
    echo "$up_out"
    if [[ "$(uname -s)" == "Darwin" ]]; then
      echo "  → Ouverture de l’app Tailscale (basculez sur Connect si besoin)…"
      open -a Tailscale 2>/dev/null || true
    fi
  }
  local i
  for ((i = 0; i < 30; i++)); do
    if tailscale_backend_running; then
      echo "✓ Tailscale connecté"
      return 0
    fi
    sleep 1
  done
  echo "  ⚠ Tailscale reste déconnecté après 30 s — accès mobile indisponible."
  echo "    Activez Tailscale dans la barre de menu, puis relancez le script."
  return 1
}

tailscale_serve_already_configured() {
  local status
  status="$(tailscale serve status 2>/dev/null || true)"
  [[ "$status" == *":4200"* ]]
}

tailscale_serve_public_url() {
  tailscale serve status 2>/dev/null | grep -Eo 'https://[^[:space:]]+\.ts\.net' | head -1
}

ensure_tailscale_serve() {
  if [[ "$SKIP_TAILSCALE_SERVE" == "1" ]]; then
    return 0
  fi
  if ! command -v tailscale >/dev/null 2>&1; then
    echo "  ⚠ CLI tailscale introuvable — accès mobile via MagicDNS ignoré."
    return 0
  fi
  if ! ensure_tailscale_connected; then
    return 0
  fi
  if tailscale_serve_already_configured; then
    TAILSCALE_SERVE_URL="$(tailscale_serve_public_url || true)"
    echo "✓ Tailscale Serve déjà actif pour le port 4200"
    [[ -n "$TAILSCALE_SERVE_URL" ]] && echo "    • Mobile (tailnet) : $TAILSCALE_SERVE_URL"
    return 0
  fi
  echo "→ Tailscale Serve (HTTPS tailnet → ng serve :4200)…"
  if ! tailscale serve --yes --bg "$HATCAST_TAILSCALE_SERVE_TARGET" 2>&1; then
    echo "  ⚠ Échec : tailscale serve --bg $HATCAST_TAILSCALE_SERVE_TARGET"
    echo "    (HTTPS activé sur le tailnet ? voir https://tailscale.com/kb/1312/serve)"
    return 0
  fi
  TAILSCALE_SERVE_URL="$(tailscale_serve_public_url || true)"
  echo "✓ Tailscale Serve démarré"
  [[ -n "$TAILSCALE_SERVE_URL" ]] && echo "    • Mobile (tailnet) : $TAILSCALE_SERVE_URL"
}

MAILPIT_CONTAINER_NAME="${HATCAST_MAILPIT_CONTAINER_NAME:-hatcast-mailpit}"
MAILPIT_SMTP_PORT="${HATCAST_MAILPIT_SMTP_PORT:-1025}"
MAILPIT_UI_PORT="${HATCAST_MAILPIT_UI_PORT:-8025}"
MAILPIT_UI_URL="http://127.0.0.1:${MAILPIT_UI_PORT}"

mailpit_enabled() {
  [[ "${HATCAST_NOTIFICATION_EMAIL_ENABLED:-false}" == "true" ]]
}

warn_push_vapid_config() {
  [[ "$WITH_PUSH" == "1" ]] || return 0
  local missing=0
  if [[ -z "${HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY:-}" ]]; then
    echo "  ⚠ HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY absent — opt-in push (/compte) impossible."
    missing=1
  fi
  if [[ -z "${HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY:-}" ]]; then
    echo "  ⚠ HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY absent — envoi push serveur (story 8.3) ignoré."
    missing=1
  fi
  if [[ "$missing" -eq 0 ]]; then
    echo "✓ Clés VAPID Web Push présentes (.env)"
  fi
}

# start-dev pilote Mailpit : SMTP local pour bootRun (ignore les SPRING_MAIL_* Gmail du .env).
configure_local_mailpit_smtp() {
  mailpit_enabled || return 0
  export SPRING_MAIL_HOST=127.0.0.1
  export SPRING_MAIL_PORT="${MAILPIT_SMTP_PORT}"
  unset SPRING_MAIL_USERNAME SPRING_MAIL_PASSWORD \
    SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH \
    SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE 2>/dev/null || true
}

ensure_mailpit() {
  mailpit_enabled || return 0

  if ! command -v docker >/dev/null 2>&1; then
    echo "  ⚠ Docker introuvable — Mailpit non démarré (UI ${MAILPIT_UI_URL})."
    return 0
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "  ⚠ Docker daemon indisponible — Mailpit non démarré (UI ${MAILPIT_UI_URL})."
    return 0
  fi

  if docker ps --format '{{.Names}}' | grep -qx "$MAILPIT_CONTAINER_NAME"; then
    echo "✓ Mailpit déjà actif — UI ${MAILPIT_UI_URL}"
    wait_for_mailpit_smtp
    return 0
  fi

  if docker ps -a --format '{{.Names}}' | grep -qx "$MAILPIT_CONTAINER_NAME"; then
    echo "→ Redémarrage Mailpit (${MAILPIT_CONTAINER_NAME})…"
    if docker start "$MAILPIT_CONTAINER_NAME" >/dev/null 2>&1; then
      echo "✓ Mailpit redémarré — UI ${MAILPIT_UI_URL}"
      wait_for_mailpit_smtp
      return 0
    fi
    echo "  ⚠ Échec docker start ${MAILPIT_CONTAINER_NAME} — recréation…"
    docker rm -f "$MAILPIT_CONTAINER_NAME" >/dev/null 2>&1 || true
  fi

  echo "→ Démarrage Mailpit (SMTP :${MAILPIT_SMTP_PORT}, UI :${MAILPIT_UI_PORT})…"
  if docker run -d \
    --name "$MAILPIT_CONTAINER_NAME" \
    -p "${MAILPIT_SMTP_PORT}:1025" \
    -p "${MAILPIT_UI_PORT}:8025" \
    axllent/mailpit >/dev/null 2>&1; then
    echo "✓ Mailpit démarré — UI ${MAILPIT_UI_URL}"
  else
    echo "  ⚠ Échec docker run Mailpit — les emails peuvent échouer (voir logs API)."
    return 0
  fi

  wait_for_mailpit_smtp
}

mailpit_smtp_port_open() {
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "$MAILPIT_SMTP_PORT" >/dev/null 2>&1
    return $?
  fi
  (echo >/dev/tcp/127.0.0.1/"$MAILPIT_SMTP_PORT") >/dev/null 2>&1
}

stop_mailpit() {
  mailpit_enabled || return 0
  command -v docker >/dev/null 2>&1 || return 0
  if docker ps --format '{{.Names}}' | grep -qx "$MAILPIT_CONTAINER_NAME"; then
    echo "→ Arrêt Mailpit (${MAILPIT_CONTAINER_NAME})…"
    docker stop "$MAILPIT_CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
}

wait_for_mailpit_smtp() {
  mailpit_enabled || return 0

  local i
  for ((i = 0; i < 40; i++)); do
    if mailpit_smtp_port_open; then
      [[ "$i" -gt 0 ]] && echo "✓ Mailpit SMTP prêt (:${MAILPIT_SMTP_PORT})"
      return 0
    fi
    sleep 0.25
  done
  echo "  ⚠ Mailpit SMTP :${MAILPIT_SMTP_PORT} injoignable après 10 s — vérifiez Docker (docker ps)."
}

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
  stop_mailpit
  exit "$ec"
}
trap cleanup EXIT INT TERM

if [[ ! -x "$ROOT/services/api/gradlew" ]]; then
  echo "Erreur : services/api/gradlew introuvable ou non exécutable."
  exit 1
fi

configure_local_mailpit_smtp
ensure_mailpit
if [[ "$WITH_PUSH" == "1" ]]; then
  echo "→ Mode notifications push (--with-push) : front en build production (service worker actif)."
  warn_push_vapid_config
fi
echo ""

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
ensure_tailscale_serve
echo ""
if [[ "$WITH_PUSH" == "1" ]]; then
  echo "→ Démarrage du client Angular (ng serve --configuration=production, port 4200)…"
else
  echo "→ Démarrage du client Angular (ng serve, port 4200 par défaut)…"
fi
echo ""
echo "  Stack V2 :"
echo "    • API   : http://127.0.0.1:8080"
if [[ "$WITH_PUSH" == "1" ]]; then
  echo "    • Front : https://localhost:4200  (TLS ; build production + service worker ; recette push)"
  echo "      Attendre ~30 s après chargement pour l’enregistrement du SW ; activer push sur /compte."
else
  echo "    • Front : https://localhost:4200  (TLS ; ng serve --host 0.0.0.0 ; mode dev, pas de push)"
  echo "      Push local : relancer avec --with-push (voir DEVELOPMENT.md)."
fi
if [[ -n "$TAILSCALE_SERVE_URL" ]]; then
  echo "    • Mobile : $TAILSCALE_SERVE_URL  (Tailscale Serve ; OAuth : même origine dans Google Cloud)"
fi
if mailpit_enabled; then
  echo "    • Mailpit : ${MAILPIT_UI_URL}  (SMTP 127.0.0.1:${MAILPIT_SMTP_PORT} ; conteneur ${MAILPIT_CONTAINER_NAME})"
fi
echo ""
echo "  Ctrl+C arrête le front, l’API et Mailpit (Tailscale Serve reste actif en arrière-plan)."
echo ""

cd "$ROOT"
# `--` obligatoire : transmet les flags à `ng serve` (pas à npm intermédiaire).
if [[ "$WITH_PUSH" == "1" ]]; then
  npm run dev -w @hatcast/web -- --configuration=production --host 0.0.0.0
else
  npm run dev -w @hatcast/web -- --host 0.0.0.0
fi

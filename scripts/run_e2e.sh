#!/usr/bin/env bash
# Lance les tests E2E V2 (Playwright + API Spring profil e2e).
#
# Usage (depuis la racine du dépôt) :
#   ./scripts/run_e2e.sh              # suite complète (parité CI e2e-smoke)
#   ./scripts/run_e2e.sh --gate         # gate E1 (mobile membre + desktop orga)
#   ./scripts/run_e2e.sh --smoke        # auth + fixtures uniquement
#   ./scripts/run_e2e.sh -- --project=chromium-3-8d
#
# Par défaut : PLAYWRIGHT_REUSE_SERVERS=0 (boot API H2 e2e + ng serve).
# Arrêtez start-dev.sh avant — les ports 8080 et 4200 doivent être libres.
#
# Voir apps/web/e2e/README.md (sélecteurs, dépannage).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="${ROOT}/apps/web"

REUSE_SERVERS=0
PRESET="full"
PLAYWRIGHT_ARGS=()

usage() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS] [-- playwright-args...]

Lance les tests E2E V2 (Playwright, profil API e2e).

Options :
  --gate            Gate E1 (--project=e1-mobile-member --project=e1-desktop-orga)
  --smoke           Smoke minimal (--project=setup-admin)
  --reuse-servers   Réutiliser 8080/4200 si déjà up (API **doit** être profil e2e)
  --help, -h        Cette aide

Sans argument Playwright : suite complète (identique à la CI e2e-smoke).

Exemples :
  $(basename "$0")
  $(basename "$0") --gate
  $(basename "$0") -- --project=chromium-3-19

Prérequis : JDK 21+, npm ci, ports 8080/4200 libres (sauf --reuse-servers).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reuse-servers)
      REUSE_SERVERS=1
      shift
      ;;
    --gate)
      PRESET="gate"
      shift
      ;;
    --smoke)
      PRESET="smoke"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      PLAYWRIGHT_ARGS+=("$@")
      break
      ;;
    *)
      PLAYWRIGHT_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#PLAYWRIGHT_ARGS[@]} -eq 0 ]]; then
  case "${PRESET}" in
    gate)
      PLAYWRIGHT_ARGS=(--project=e1-mobile-member --project=e1-desktop-orga)
      ;;
    smoke)
      PLAYWRIGHT_ARGS=(--project=setup-admin)
      ;;
    full)
      ;;
  esac
fi

ensure_java() {
  if [[ -z "${JAVA_HOME:-}" ]] && command -v /usr/libexec/java_home >/dev/null 2>&1; then
    if JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null)"; then
      export JAVA_HOME
    elif JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null)"; then
      export JAVA_HOME
    fi
  fi
  if ! command -v java >/dev/null 2>&1; then
    echo "❌ JDK 21+ requis (java introuvable). Installez Temurin 21 ou exportez JAVA_HOME." >&2
    exit 1
  fi
}

assert_ports_free() {
  local port pid proc
  for port in 8080 4200; do
    if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "❌ Port ${port} déjà utilisé — les E2E ne peuvent pas démarrer l’API profil e2e." >&2
      echo "   Arrêtez ./scripts/start-dev.sh (ou tout processus sur ${port}), puis relancez." >&2
      echo "   Processus détecté :" >&2
      lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null | head -5 >&2 || true
      echo "" >&2
      echo "   Si l’API tourne déjà en profil e2e : $(basename "$0") --reuse-servers" >&2
      exit 1
    fi
  done
}

ensure_playwright_browser() {
  if [[ ! -f "${WEB}/package.json" ]]; then
    echo "❌ apps/web/package.json introuvable." >&2
    exit 1
  fi
  if [[ ! -d "${ROOT}/node_modules/@playwright/test" && ! -d "${WEB}/node_modules/@playwright/test" ]]; then
    echo "❌ @playwright/test manquant — lancez npm ci à la racine du dépôt." >&2
    exit 1
  fi
  local cache="${PLAYWRIGHT_BROWSERS_PATH:-${HOME}/Library/Caches/ms-playwright}"
  if [[ "$(uname -s)" == "Linux" ]]; then
    cache="${PLAYWRIGHT_BROWSERS_PATH:-${HOME}/.cache/ms-playwright}"
  fi
  if ! compgen -G "${cache}/chromium-"* >/dev/null 2>&1; then
    echo "→ Installation Chromium (Playwright)…"
    (cd "${WEB}" && npx playwright install chromium)
  fi
}

ensure_java

if [[ "${REUSE_SERVERS}" -eq 0 ]]; then
  assert_ports_free
  export PLAYWRIGHT_REUSE_SERVERS=0
else
  export PLAYWRIGHT_REUSE_SERVERS=1
  echo "⚠️  Réutilisation des serveurs sur 8080/4200 — l’API doit être en profil e2e."
fi

ensure_playwright_browser

echo "=== E2E V2 (Playwright) ==="
if ((${#PLAYWRIGHT_ARGS[@]} > 0)); then
  echo "   Projets / args : ${PLAYWRIGHT_ARGS[*]}"
else
  echo "   Suite complète (parité CI e2e-smoke)"
fi
echo ""

(
  cd "${WEB}"
  if ((${#PLAYWRIGHT_ARGS[@]} > 0)); then
    npm run test:e2e -- "${PLAYWRIGHT_ARGS[@]}"
  else
    npm run test:e2e
  fi
)

echo ""
echo "✓ E2E terminés avec succès."

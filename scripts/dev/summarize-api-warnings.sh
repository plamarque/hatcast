#!/usr/bin/env bash
# Summarize API warnings/issues without scrolling the dev terminal.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CURSOR="$ROOT/.cursor"

echo "=== Dernières WARN (sans stacktrace) — hatcast-api-warnings.log ==="
if [[ -f "$CURSOR/hatcast-api-warnings.log" ]]; then
  tail -n 40 "$CURSOR/hatcast-api-warnings.log"
else
  echo "(fichier absent — redémarrer l’API en profil dev)"
fi

echo ""
echo "=== WARN uniques (dernières 200 lignes du log complet) ==="
if [[ -f "$CURSOR/hatcast-api-dev.log" ]]; then
  rg "^[0-9].* WARN " "$CURSOR/hatcast-api-dev.log" 2>/dev/null | tail -n 200 | sed 's/ .* WARN / WARN /' | sort -u | tail -n 30 || true
else
  echo "(fichier absent)"
fi

#!/usr/bin/env bash
# Lance les tests automatisés de la stack **V2** : API Spring puis client Angular (Vitest via ng test).
#
# Usage (depuis la racine du dépôt) :
#   ./scripts/run-tests.sh
#
# Pour la V1 (Playwright + Vitest legacy), utiliser à la racine : `npm test` (voir legacy/tests/README.md).
#
# Charge `.env` à la racine (même logique que `start-dev.sh`) pour que les tests voient les mêmes
# variables que le dev local (ex. `HATCAST_*` si des tests les consomment plus tard).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=load-dotenv.sh
source "$ROOT/scripts/load-dotenv.sh"
load_dotenv "$ROOT/.env"

cd "$ROOT"

echo "=== API Spring (services/api) ==="
(
  cd "$ROOT/services/api"
  ./gradlew test --no-daemon
)

echo ""
echo "=== Client Angular (apps/web) ==="
(
  cd "$ROOT/apps/web"
  npx ng test --no-watch
)

echo ""
echo "✓ Tests V2 terminés avec succès."

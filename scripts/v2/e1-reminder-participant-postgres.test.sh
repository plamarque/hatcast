#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
name="hatcast-e1-fixture-test-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --pull=never --rm -d --name "$name" -e POSTGRES_PASSWORD=fixture-only -e POSTGRES_DB=fixture -p 127.0.0.1::5432 postgres:16-alpine >/dev/null
for i in {1..60}; do
  if docker exec "$name" pg_isready -h 127.0.0.1 -U postgres -d fixture >/dev/null 2>&1; then break; fi
  sleep 1
done
port=$(docker port "$name" 5432/tcp)
export E1_TEST_PG_PORT="${port##*:}"
node ./e1-reminder-participant-postgres.integration.mjs

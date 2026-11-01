#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
name="hatcast-avent-test-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --name "$name" -e POSTGRES_PASSWORD=fictional-test -e POSTGRES_DB=advent_catalogue_disposable -p 127.0.0.1::5432 postgres:16-alpine >/dev/null
for i in {1..60}; do
  if docker exec "$name" pg_isready -U postgres -d advent_catalogue_disposable >/dev/null 2>&1; then break; fi
  sleep 1
done
port=$(docker port "$name" 5432/tcp)
export ADVENT_TEST_PORT="${port##*:}"
node ./advent-catalogue-database.integration.cjs

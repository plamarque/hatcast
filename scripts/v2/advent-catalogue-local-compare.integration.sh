#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
name="hatcast-avent-local-test-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --name "$name" -e POSTGRES_PASSWORD=fictional-test -e POSTGRES_DB=advent_catalogue_disposable postgres:16-alpine >/dev/null
for i in {1..60}; do
  if docker exec "$name" pg_isready -U postgres -d advent_catalogue_disposable >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$name" psql -U postgres -d advent_catalogue_disposable -c 'CREATE TABLE advent_quizzes (quiz_day INTEGER PRIMARY KEY, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)' >/dev/null
# Run Node in the same isolated network namespace: PostgreSQL observes 127.0.0.1.
docker run --rm --network "container:$name" -u 0:0 --entrypoint sh -v "$PWD:/work:ro" -v "${ADVENT_TEST_NODE_MODULES:-$PWD/node_modules}:/deps:ro" -e NODE_PATH=/deps n8nio/n8n:latest -c '
  set -eu
  mkdir -m 700 /tmp/catalogue-private
  node -e '\''const fs=require("fs"); const quizzes=Array.from({length:24},(_,i)=>({day:i+1,kind:"contribution",name:"Synthetic",portrait:{type:"bucket-object",object:"portraits/synthetic.png"},statements:["One","Two","Three"],false_statement_index:2,reveal:null})); fs.writeFileSync("/tmp/catalogue-private/catalogue.json",JSON.stringify({schema_version:1,year:2026,index_base:0,quizzes}),{mode:0o600})'\''
  export ADVENT_CATALOGUE_FILE=/tmp/catalogue-private/catalogue.json ADVENT_DAYS=1
  export ADVENT_DATABASE_URL=postgres://postgres:fictional-test@127.0.0.1:5432/advent_catalogue_disposable
  export ADVENT_EXPECT_DATABASE=advent_catalogue_disposable ADVENT_EXPECT_ROLE=postgres
  output=$(node /work/scripts/v2/advent-catalogue-local-compare.mjs compare)
  printf "%s\n" "$output" | grep -q "Day 1: addition"
  printf "%s\n" "$output" | grep -q "not an apply plan"
  case "$output" in *Synthetic*|*fictional-test*) exit 1;; esac
  node -e '\''const {Client}=require("pg"); (async()=>{const c=new Client({connectionString:process.env.ADVENT_DATABASE_URL}); await c.connect(); await c.query("INSERT INTO advent_quizzes VALUES (1, $1, $2, $3, $4, $5, 2, NULL)",["Synthetic","synthetic.png","One","Two","Three"]); await c.end()})().catch(()=>process.exit(1))'\''
  output=$(node /work/scripts/v2/advent-catalogue-local-compare.mjs compare)
  printf "%s\n" "$output" | grep -q "Day 1: unchanged"
  node -e '\''const {Client}=require("pg"); (async()=>{const c=new Client({connectionString:process.env.ADVENT_DATABASE_URL}); await c.connect(); await c.query("UPDATE advent_quizzes SET false_choice=0 WHERE quiz_day=1"); await c.end()})().catch(()=>process.exit(1))'\''
  output=$(node /work/scripts/v2/advent-catalogue-local-compare.mjs compare)
  printf "%s\n" "$output" | grep -q "Day 1: divergence"
  echo "Local read-only diagnostic: addition, unchanged and divergence passed"
'

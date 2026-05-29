#!/usr/bin/env bash
# HatCast V2 — migrate one troupe/season from V1 Firestore production to Neon staging (MIG-6).
#
# Usage (from repo root):
#   ./scripts/migrate-from-v1.sh              # full staging cycle
#   ./scripts/migrate-from-v1.sh --dry-run    # export + transform SQL only
#   ./scripts/migrate-from-v1.sh --help
#
# One-time setup: .env.local with Firebase Admin, NEON_STAGING_URL, HATCAST_MIGRATION_API_KEY.
# GitHub staging env: HATCAST_MIGRATION_* secrets + deployed API (ADR-0017).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT}"

# shellcheck source=load-dotenv.sh
source "${SCRIPT_DIR}/load-dotenv.sh"
load_dotenv "${ROOT}/.env.local"
load_dotenv "${ROOT}/.env"

CONFIG_PATH="${ROOT}/export/malice/migrate.config.json"
EXAMPLE_CONFIG="${ROOT}/scripts/v2/migrate.config.example.json"
DRY_RUN=false
NO_PROMPT_RESET=false
EXTRA_ARGS=()

usage() {
  cat <<'EOF'
Usage: ./scripts/migrate-from-v1.sh [OPTIONS] [-- extra migrate:v2:run args]

Migrates V1 Firestore production data into V2 staging (orchestrator MIG-5).

Before running:
  1. Reset Neon branch "staging" in the Neon console (if replaying a cycle).
  2. Ensure Cloud Run staging is deployed with migration API key enabled.

Options:
  --dry-run           Export + transform only (no Neon writes, smoke skipped)
  --no-prompt-reset   Do not ask about Neon reset (omit --i-reset-neon)
  --help, -h          Show this help

Environment (via .env.local):
  NEON_STAGING_URL, HATCAST_MIGRATION_API_KEY
  FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID) + Admin credentials

Config: export/malice/migrate.config.json (copied from example on first run)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-prompt-reset)
      NO_PROMPT_RESET=true
      shift
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    --)
      shift
      EXTRA_ARGS=("$@")
      break
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

echo "=== HatCast migrate-from-v1 (staging) ==="

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "${NODE_MAJOR}" -lt 20 ]]; then
  echo "❌ Node.js >= 20 required (found $(node -v))" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql not found — install PostgreSQL client tools" >&2
  exit 1
fi

if [[ ! -d node_modules/pg ]]; then
  echo "📦 Installing dependencies (pg missing)…"
  npm install
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  mkdir -p "${ROOT}/export/malice"
  cp "${EXAMPLE_CONFIG}" "${CONFIG_PATH}"
  echo "📝 Created ${CONFIG_PATH} from example — review thresholds if needed."
fi

missing=()
[[ -z "${NEON_STAGING_URL:-}" ]] && missing+=("NEON_STAGING_URL")
[[ -z "${HATCAST_MIGRATION_API_KEY:-}" ]] && missing+=("HATCAST_MIGRATION_API_KEY")
proj="${FIREBASE_PROJECT_ID:-${VITE_FIREBASE_PROJECT_ID:-}}"
[[ -z "${proj}" ]] && missing+=("FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "❌ Missing environment variables in .env.local:" >&2
  printf '   - %s\n' "${missing[@]}" >&2
  exit 1
fi

API_BASE="$(node -e "
const fs = require('fs');
const j = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const raw = j.apiBaseUrl || process.env.HATCAST_MIGRATE_API_BASE || '';
const url = typeof raw === 'string' ? raw.replace(/\$\{[A-Z0-9_]+\}/g, '').trim() : '';
console.log(url || process.env.HATCAST_MIGRATE_API_BASE || '');
" "${CONFIG_PATH}")"

if [[ -z "${API_BASE}" ]]; then
  echo "❌ apiBaseUrl missing in migrate.config.json" >&2
  exit 1
fi

echo "🔍 Preflight API (${API_BASE})…"
HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Hatcast-Migration-Key: ${HATCAST_MIGRATION_API_KEY}" \
  -d '{"name":"migrate-from-v1 preflight"}' \
  "${API_BASE%/}/v1/troupes")"

if [[ "${HTTP_CODE}" != "201" ]]; then
  echo "❌ Migration API preflight failed (HTTP ${HTTP_CODE})." >&2
  echo "   Check HATCAST_MIGRATION_API_KEY and Cloud Run staging deploy (ADR-0017)." >&2
  exit 1
fi
echo "   Migration API OK (201)"

RESET_FLAG=()
if [[ "${DRY_RUN}" == false && "${NO_PROMPT_RESET}" == false ]]; then
  echo ""
  read -r -p "As-tu reset la branche Neon staging depuis le parent ? [y/N] " ans
  if [[ "${ans}" =~ ^[yY] ]]; then
    RESET_FLAG=(--i-reset-neon)
    echo "   → --i-reset-neon"
  else
    echo "   → continuing without --i-reset-neon"
  fi
fi

RUN_ARGS=(
  --config="${CONFIG_PATH}"
  --database-url="${NEON_STAGING_URL}"
  --migration-api-key="${HATCAST_MIGRATION_API_KEY}"
)
if [[ "${DRY_RUN}" == true ]]; then
  RUN_ARGS+=(--dry-run)
else
  RUN_ARGS+=(--yes --record-cycle)
  if [[ ${#RESET_FLAG[@]} -gt 0 ]]; then
    RUN_ARGS+=("${RESET_FLAG[@]}")
  fi
fi
if [[ ${#EXTRA_ARGS[@]} -gt 0 ]]; then
  RUN_ARGS+=("${EXTRA_ARGS[@]}")
fi

echo ""
echo "🚀 npm run migrate:v2:run -- ${RUN_ARGS[*]}"
echo ""
npm run migrate:v2:run -- "${RUN_ARGS[@]}"

if [[ "${DRY_RUN}" == false ]]; then
  echo ""
  REPLAY_LOG="${ROOT}/export/malice/replay-log.jsonl"
  npm run migrate:v2:validate-replay -- --path="${REPLAY_LOG}" --min=1 || true
  echo ""
  echo "Gate prod: ≥ 3 cycles → npm run migrate:v2:validate-replay -- --path=${REPLAY_LOG} --min=3"
fi

echo ""
echo "✅ migrate-from-v1 finished"

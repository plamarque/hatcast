#!/usr/bin/env bash
# HatCast V2 — migrate one troupe/season from V1 Firestore production to Neon staging (MIG-6).
#
# Usage (from repo root):
#   ./scripts/migrate-from-v1.sh              # full staging cycle
#   ./scripts/migrate-from-v1.sh --dry-run    # export + transform SQL only
#   ./scripts/migrate-from-v1.sh --help
#
# One-time setup: .env.local with Firebase Admin, NEON_STAGING_URL, HATCAST_MIGRATION_API_KEY.
# GitHub staging env: HATCAST_MIGRATION_* secrets + gh CLI (`gh auth login`) for post-reset redeploy.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT}"

# shellcheck source=load-dotenv.sh
source "${SCRIPT_DIR}/load-dotenv.sh"
# shellcheck source=v2/lib/git-branches.sh
source "${SCRIPT_DIR}/v2/lib/git-branches.sh"

load_dotenv "${ROOT}/.env.local"
load_dotenv "${ROOT}/.env"

CONFIG_PATH="${ROOT}/export/malice/migrate.config.json"
EXAMPLE_CONFIG="${ROOT}/scripts/v2/migrate.config.example.json"
DEPLOY_WORKFLOW_FILE="deploy-v2-cloud-run.yml"
HEALTH_WAIT_SECONDS="${HATCAST_MIGRATE_HEALTH_WAIT_SECONDS:-300}"
HEALTH_POLL_SECONDS="${HATCAST_MIGRATE_HEALTH_POLL_SECONDS:-10}"

DRY_RUN=false
NO_PROMPT_RESET=false
SKIP_STAGING_REDEPLOY=false
EXTRA_ARGS=()

usage() {
  cat <<EOF
Usage: ./scripts/migrate-from-v1.sh [OPTIONS] [-- extra migrate:v2:run args]

Migrates V1 Firestore production data into V2 staging (orchestrator MIG-5).

Full cycle after Neon reset:
  1. Confirm Neon branch reset (console — manual)
  2. Trigger GitHub Actions "Deploy V2 (Cloud Run)" on staging-v2 (restarts API + Flyway + sessions)
  3. Wait for /actuator/health + migration API preflight
  4. Run migrate:v2:run

Options:
  --dry-run                 Export + transform only (no Neon writes, smoke skipped)
  --no-prompt-reset         Skip Neon reset prompt and staging redeploy
  --skip-staging-redeploy   After Neon reset, skip gh deploy (you restarted staging yourself)
  --help, -h                This help

Environment (via .env.local):
  NEON_STAGING_URL, HATCAST_MIGRATION_API_KEY
  FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID) + Admin credentials

Requires: gh auth login (for redeploy after Neon reset)
EOF
}

hatcast_github_repo_slug() {
  local remote
  remote="$(git config --get remote.origin.url 2>/dev/null || true)"
  if [[ "${remote}" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  fi
}

migration_api_preflight() {
  local body http_code
  body="$(mktemp)"
  http_code="$(curl -sS -o "${body}" -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Hatcast-Migration-Key: ${HATCAST_MIGRATION_API_KEY}" \
    -d '{"name":"migrate-from-v1 preflight"}' \
    "${API_BASE%/}/v1/troupes")"
  if [[ "${http_code}" == "201" ]]; then
    rm -f "${body}"
    echo "   Migration API OK (201)"
    return 0
  fi
  echo "❌ Migration API preflight failed (HTTP ${http_code})." >&2
  if [[ -s "${body}" ]]; then
    echo "   Response: $(tr '\n' ' ' < "${body}" | head -c 200)" >&2
  fi
  rm -f "${body}"
  echo "   Check HATCAST_MIGRATION_API_KEY, staging deploy, and Neon reset + redeploy (ADR-0017)." >&2
  return 1
}

wait_for_actuator_health() {
  local url="${API_BASE%/}/actuator/health"
  local elapsed=0
  echo "⏳ Waiting for ${url} (max ${HEALTH_WAIT_SECONDS}s)…"
  while [[ "${elapsed}" -lt "${HEALTH_WAIT_SECONDS}" ]]; do
    if curl -sf "${url}" >/dev/null 2>&1; then
      echo "   Actuator health OK"
      return 0
    fi
    sleep "${HEALTH_POLL_SECONDS}"
    elapsed=$((elapsed + HEALTH_POLL_SECONDS))
  done
  echo "❌ Actuator health not ready after ${HEALTH_WAIT_SECONDS}s" >&2
  return 1
}

trigger_staging_redeploy_via_github() {
  local slug repo_args=() branch="${HATCAST_V2_BRANCH_STAGING}"
  slug="$(hatcast_github_repo_slug || true)"

  if ! command -v gh >/dev/null 2>&1; then
    echo "❌ gh CLI is required to redeploy staging after Neon reset." >&2
    echo "   Install: https://cli.github.com/ then: gh auth login" >&2
    echo "   Or rerun with --skip-staging-redeploy after a manual deploy." >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "❌ gh is not authenticated. Run: gh auth login" >&2
    exit 1
  fi

  if [[ -n "${slug}" ]]; then
    repo_args=(-R "${slug}")
  fi

  echo "☁️  Triggering Deploy V2 (Cloud Run) on branch ${branch}…"
  gh workflow run "${DEPLOY_WORKFLOW_FILE}" --ref "${branch}" "${repo_args[@]}"

  echo "⏳ Waiting for workflow run to appear…"
  sleep 8
  local run_id
  run_id="$(gh run list --workflow="${DEPLOY_WORKFLOW_FILE}" --branch="${branch}" --limit 1 \
    "${repo_args[@]}" --json databaseId --jq '.[0].databaseId')"

  if [[ -z "${run_id}" || "${run_id}" == "null" ]]; then
    echo "❌ Could not find workflow run. Check: $(hatcast_v2_github_actions_url)" >&2
    exit 1
  fi

  echo "   Run: https://github.com/${slug:-<repo>}/actions/runs/${run_id}"
  gh run watch "${run_id}" --exit-status "${repo_args[@]}"
  echo "✅ Staging deploy workflow completed"
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
    --skip-staging-redeploy)
      SKIP_STAGING_REDEPLOY=true
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

RESET_FLAG=()
if [[ "${DRY_RUN}" == false && "${NO_PROMPT_RESET}" == false ]]; then
  echo ""
  echo "📋 Neon reset (manual in console):"
  echo "   Neon → branch « staging » → Reset from parent"
  read -r -p "Reset effectué ? [y/N] " ans
  if [[ "${ans}" =~ ^[yY] ]]; then
    RESET_FLAG=(--i-reset-neon)
    echo "   → --i-reset-neon"

    if [[ "${SKIP_STAGING_REDEPLOY}" == false ]]; then
      echo ""
      trigger_staging_redeploy_via_github
      echo ""
      wait_for_actuator_health
    else
      echo "   → --skip-staging-redeploy (no GitHub deploy)"
      echo ""
      read -r -p "Staging Cloud Run redémarré / déployé ? [Enter pour continuer]"
    fi
  else
    echo "   → continuing without --i-reset-neon"
  fi
fi

echo ""
echo "🔍 Preflight API (${API_BASE})…"
migration_api_preflight

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

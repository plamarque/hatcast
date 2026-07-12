#!/usr/bin/env bash
# HatCast V2 — migrate one troupe/season from V1 Firestore production to Neon V2 (MIG-6).
#
# Usage (from repo root):
#   ./scripts/migrate-from-v1.sh --target=staging
#   ./scripts/migrate-from-v1.sh --target=development
#   ./scripts/migrate-from-v1.sh --target=local --dry-run
#   ./scripts/migrate-from-v1.sh --help
#
# Setup: .env.local — Firebase Admin, HATCAST_MIGRATION_API_KEY, URLs par cible (voir .env.example).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT}"

# shellcheck source=load-dotenv.sh
source "${SCRIPT_DIR}/load-dotenv.sh"

load_dotenv "${ROOT}/.env.local"
load_dotenv "${ROOT}/.env"

RESOLVE_TARGET_NODE="${SCRIPT_DIR}/v2/resolve-migrate-target.mjs"
EXAMPLE_CONFIG="${ROOT}/scripts/v2/migrate.config.example.json"
DEPLOY_WORKFLOW_FILE="deploy-v2-cloud-run.yml"
HEALTH_WAIT_SECONDS="${HATCAST_MIGRATE_HEALTH_WAIT_SECONDS:-300}"
HEALTH_POLL_SECONDS="${HATCAST_MIGRATE_HEALTH_POLL_SECONDS:-10}"

TARGET="staging"
DRY_RUN=false
NO_PROMPT_RESET=false
I_RESET_NEON=false
SKIP_REDEPLOY=false
SKIP_ENABLE_MIGRATION_API=false
RESTART_MODE=""
MIGRATION_API_CLOUD_RUN_CONFIGURED=false
SKIP_POST_SMOKE=false
EXTRA_ARGS=()
RESET_FLAG=()

usage() {
  cat <<EOF
Usage: ./scripts/migrate-from-v1.sh [OPTIONS] [-- extra migrate:v2:run args]

Migrates V1 Firestore production data into V2 (orchestrator MIG-5).

Targets (--target=, default: staging):
  local         Neon branche « local » (NEON_LOCAL_URL ou HATCAST_DATASOURCE_URL) + API http://127.0.0.1:8080
  development   Neon « development » + Cloud Run hatcast-v2-dev (redémarrage gcloud)
  staging       Neon « staging » + Cloud Run hatcast-v2-staging (redémarrage gcloud)
  production    Neon production + Cloud Run hatcast-v2 (pas de redeploy auto ; --confirm-prod requis)

Full cycle after Neon reset (sauf --no-prompt-reset):
  1. Confirm Neon branch reset (console)
  2. Restart API (local prompt / gcloud / gh workflow selon la cible)
  3. Wait for /actuator/health + migration API preflight
  4. Run migrate:v2:run

Options:
  --target=NAME             local | development | staging | production (default: staging)
  --dry-run                 Export + transform only (no Neon writes)
  --no-prompt-reset         Skip Neon reset prompt and API restart
  --i-reset-neon            Neon déjà reset + API déjà redémarrée (reprise après échec)
  --skip-redeploy           After Neon reset, skip API restart (you did it yourself)
  --skip-staging-redeploy   Alias of --skip-redeploy (backward compatible)
  --restart=MODE            Override: prompt-local | gcloud | github | none (staging défaut: gcloud)
  --skip-enable-migration-api
                            Ne pas pousser HATCAST_MIGRATION_API_* sur Cloud Run (défaut: auto pour development)
  --skip-post-smoke           Ne pas lancer migrate:malice:post-smoke après le pipeline
  --help, -h                This help

Environment (.env.local) — voir .env.example § migration V1:
  HATCAST_MIGRATION_API_KEY, HATCAST_MIGRATION_OPERATOR_EMAIL (requis pour --target=development)
  NEON_STAGING_URL | NEON_DEVELOPMENT_URL | NEON_LOCAL_URL | NEON_PRODUCTION_URL
  HATCAST_MIGRATE_API_BASE_* (optionnel si défaut local suffit)
  FIREBASE_PROJECT_ID (ou VITE_FIREBASE_PROJECT_ID) + Admin credentials

Requires: gcloud auth (cibles development/staging) ; gh auth login seulement si --restart=github
EOF
}

hatcast_github_repo_slug() {
  local remote
  remote="$(git config --get remote.origin.url 2>/dev/null || true)"
  if [[ "${remote}" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  fi
}

hatcast_v2_github_actions_url() {
  local remote slug
  remote="$(git config --get remote.origin.url 2>/dev/null || true)"
  slug="$(echo "${remote}" | sed -E 's#.*github\.com[:/]([^/]+/[^/.]+).*#\1#')"
  if [[ -n "${slug}" && "${slug}" != "${remote}" ]]; then
    echo "https://github.com/${slug}/actions"
  else
    echo "(voir l'onglet Actions du dépôt GitHub)"
  fi
}

migration_api_preflight() {
  local body http_code
  body="$(mktemp)"
  # GET /v1/auth/me with migration key — no troupe creation (POST /v1/troupes polluted staging).
  http_code="$(curl -sS -o "${body}" -w "%{http_code}" \
    -H "X-Hatcast-Migration-Key: ${HATCAST_MIGRATION_API_KEY}" \
    "${MIGRATE_API_BASE%/}/v1/auth/me")"
  if [[ "${http_code}" == "200" ]]; then
    rm -f "${body}"
    echo "   Migration API OK (GET /v1/auth/me → 200)"
    return 0
  fi
  echo "❌ Migration API preflight failed (HTTP ${http_code})." >&2
  if [[ -s "${body}" ]]; then
    echo "   Response: $(tr '\n' ' ' < "${body}" | head -c 200)" >&2
  fi
  rm -f "${body}"
  echo "   Check HATCAST_MIGRATION_API_KEY, API target (${TARGET}), migration API enabled (ADR-0017)." >&2
  return 1
}

wait_for_actuator_health() {
  local url="${MIGRATE_API_BASE%/}/actuator/health"
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

trigger_github_deploy() {
  local branch="$1"
  local slug repo_args=()
  slug="$(hatcast_github_repo_slug || true)"

  if ! command -v gh >/dev/null 2>&1; then
    echo "❌ gh CLI is required for GitHub redeploy (target ${TARGET})." >&2
    echo "   Install: https://cli.github.com/ then: gh auth login" >&2
    echo "   Or rerun with --skip-redeploy after a manual deploy." >&2
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
  echo "✅ Deploy workflow completed (${branch})"
}

cloud_run_migration_env_prefix() {
  if [[ "${MIGRATE_AUTO_ENABLE_MIGRATION_API:-0}" != "1" ]]; then
    return 0
  fi
  if [[ -z "${HATCAST_MIGRATION_OPERATOR_EMAIL:-}" ]]; then
    echo "❌ HATCAST_MIGRATION_OPERATOR_EMAIL requis pour activer l’API migration sur Cloud Run (target development)." >&2
    exit 1
  fi
  printf 'HATCAST_MIGRATION_API_ENABLED=true,HATCAST_MIGRATION_API_KEY=%s,HATCAST_MIGRATION_OPERATOR_EMAIL=%s,' \
    "${HATCAST_MIGRATION_API_KEY}" "${HATCAST_MIGRATION_OPERATOR_EMAIL}"
}

ensure_cloud_run_migration_api() {
  if [[ "${MIGRATE_AUTO_ENABLE_MIGRATION_API:-0}" != "1" ]]; then
    return 0
  fi
  if [[ "${MIGRATION_API_CLOUD_RUN_CONFIGURED}" == "true" ]]; then
    return 0
  fi
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "❌ gcloud CLI required to enable migration API on ${MIGRATE_CLOUD_RUN_SERVICE}." >&2
    exit 1
  fi
  local prefix vars
  prefix="$(cloud_run_migration_env_prefix)"
  vars="${prefix}HATCAST_RESTART_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "🔐 Activation API migration sur Cloud Run ${MIGRATE_CLOUD_RUN_SERVICE} (${MIGRATE_GCP_REGION})…"
  gcloud run services update "${MIGRATE_CLOUD_RUN_SERVICE}" \
    --region="${MIGRATE_GCP_REGION}" \
    --update-env-vars="${vars}"
  MIGRATION_API_CLOUD_RUN_CONFIGURED=true
  echo "✅ HATCAST_MIGRATION_API_ENABLED=true (et clé opérateur) appliqués sur la révision Cloud Run"
  wait_for_actuator_health
}

restart_cloud_run_gcloud() {
  ensure_cloud_run_migration_api
  if [[ "${MIGRATION_API_CLOUD_RUN_CONFIGURED}" == "true" ]]; then
    return 0
  fi
  local service="$1"
  local region="$2"
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "❌ gcloud CLI required to restart ${service}." >&2
    echo "   Or use --skip-redeploy after: gcloud run services update …" >&2
    exit 1
  fi
  echo "☁️  Restarting Cloud Run ${service} (${region})…"
  gcloud run services update "${service}" \
    --region="${region}" \
    --update-env-vars="HATCAST_RESTART_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "✅ Cloud Run update requested"
  wait_for_actuator_health
}

restart_api_for_target() {
  local mode="${RESTART_MODE:-${MIGRATE_RESTART_MODE:-gcloud}}"
  case "${mode}" in
    none)
      echo "   → no automatic API restart (target ${TARGET})"
      read -r -p "API prête pour ${TARGET} ? [Enter pour continuer]"
      ;;
    prompt-local)
      echo "   → redémarrer l’API locale (ex. ./scripts/start-dev.sh)"
      echo "   → HATCAST_MIGRATION_API_ENABLED=true dans .env si besoin"
      read -r -p "API locale prête ? [Enter pour continuer]"
      ;;
    gcloud)
      restart_cloud_run_gcloud "${MIGRATE_CLOUD_RUN_SERVICE}" "${MIGRATE_GCP_REGION}"
      ;;
    github)
      trigger_github_deploy "${MIGRATE_DEPLOY_GIT_BRANCH}"
      wait_for_actuator_health
      ;;
    *)
      echo "❌ Unknown restart mode: ${mode}" >&2
      exit 1
      ;;
  esac
}

handle_neon_reset_prompt() {
  if [[ "${DRY_RUN}" == true || "${NO_PROMPT_RESET}" == true ]]; then
    return 0
  fi

  if [[ "${I_RESET_NEON}" == true ]]; then
    RESET_FLAG=(--i-reset-neon)
    echo "   → --i-reset-neon (reprise — Neon reset et API déjà traités)"
    if [[ "${SKIP_REDEPLOY}" == false ]]; then
      echo ""
      restart_api_for_target
    fi
    echo "   ✅ Prêt pour migrate:v2:run"
    return 0
  fi

  echo ""
  echo "📋 Neon reset (manual in console):"
  echo "   Neon → branch « ${MIGRATE_NEON_BRANCH_LABEL} » → Reset from parent"
  read -r -p "Reset effectué ? [y/N] " ans
  if [[ ! "${ans}" =~ ^[yY] ]]; then
    echo "   → continuing without --i-reset-neon"
    return 0
  fi

  RESET_FLAG=(--i-reset-neon)
  echo "   → --i-reset-neon"

  if [[ "${SKIP_REDEPLOY}" == false ]]; then
    echo ""
    restart_api_for_target
  else
    echo "   → --skip-redeploy"
    echo ""
    read -r -p "API (${MIGRATE_TARGET}) redémarrée / déployée ? [Enter pour continuer]"
  fi
  echo "   ✅ Prêt pour migrate:v2:run"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target=*)
      TARGET="${1#*=}"
      shift
      ;;
    --target)
      TARGET="${2:?--target requires a value}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-prompt-reset)
      NO_PROMPT_RESET=true
      shift
      ;;
    --i-reset-neon)
      I_RESET_NEON=true
      shift
      ;;
    --skip-redeploy | --skip-staging-redeploy)
      SKIP_REDEPLOY=true
      shift
      ;;
    --restart=*)
      RESTART_MODE="${1#*=}"
      shift
      ;;
    --skip-enable-migration-api)
      SKIP_ENABLE_MIGRATION_API=true
      shift
      ;;
    --skip-post-smoke)
      SKIP_POST_SMOKE=true
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

if ! RESOLVE_SHELL="$(node "${RESOLVE_TARGET_NODE}" --target="${TARGET}" --format=shell 2>&1 | tr -d '\r')"; then
  echo "${RESOLVE_SHELL}" >&2
  node "${RESOLVE_TARGET_NODE}" --help >&2
  exit 1
fi
# shellcheck disable=SC1090
eval "${RESOLVE_SHELL}"

if [[ "${SKIP_ENABLE_MIGRATION_API}" == true ]]; then
  MIGRATE_AUTO_ENABLE_MIGRATION_API=0
fi

echo "=== HatCast migrate-from-v1 (${MIGRATE_TARGET}) ==="

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

CONFIG_PATH="${ROOT}/export/malice/migrate.config.${MIGRATE_TARGET}.json"
if [[ ! -f "${CONFIG_PATH}" ]]; then
  CONFIG_PATH="${ROOT}/export/malice/migrate.config.json"
fi
if [[ ! -f "${CONFIG_PATH}" ]]; then
  mkdir -p "${ROOT}/export/malice"
  cp "${EXAMPLE_CONFIG}" "${CONFIG_PATH}"
  echo "📝 Created ${CONFIG_PATH} from example — review thresholds if needed."
fi

missing=()
[[ -z "${MIGRATE_DATABASE_URL:-}" ]] && missing+=("database URL for ${MIGRATE_TARGET} (see resolve-migrate-target --help)")
[[ -z "${MIGRATE_API_BASE:-}" ]] && missing+=("API base URL for ${MIGRATE_TARGET}")
[[ -z "${HATCAST_MIGRATION_API_KEY:-}" ]] && missing+=("HATCAST_MIGRATION_API_KEY")
if [[ "${MIGRATE_AUTO_ENABLE_MIGRATION_API:-0}" == "1" ]]; then
  [[ -z "${HATCAST_MIGRATION_OPERATOR_EMAIL:-}" ]] && missing+=("HATCAST_MIGRATION_OPERATOR_EMAIL (activation API migration sur Cloud Run dev)")
fi
proj="${FIREBASE_PROJECT_ID:-${VITE_FIREBASE_PROJECT_ID:-}}"
[[ -z "${proj}" ]] && missing+=("FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "❌ Missing configuration in .env.local:" >&2
  printf '   - %s\n' "${missing[@]}" >&2
  node "${RESOLVE_TARGET_NODE}" --target="${TARGET}" --help >&2
  exit 1
fi

# apiBaseUrl JSON : repli seulement si --target= n’a pas résolu d’URL (HATCAST_MIGRATE_API_BASE_*)
API_FROM_CONFIG="$(node -e "
const fs = require('fs');
const j = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const raw = j.apiBaseUrl || '';
const url = typeof raw === 'string' ? raw.replace(/\$\{[A-Z0-9_]+\}/g, '').trim() : '';
console.log(url);
" "${CONFIG_PATH}")"
if [[ -z "${MIGRATE_API_BASE:-}" && -n "${API_FROM_CONFIG}" ]]; then
  MIGRATE_API_BASE="${API_FROM_CONFIG}"
fi

if [[ "${MIGRATE_REQUIRES_PROD_CONFIRM}" == "1" && "${DRY_RUN}" == false ]]; then
  echo ""
  echo "⚠️  Cible PRODUCTION — écritures Neon + API prod."
  read -r -p "Confirmer la migration vers production ? [y/N] " prod_ans
  if [[ ! "${prod_ans}" =~ ^[yY] ]]; then
    echo "Annulé."
    exit 0
  fi
fi

handle_neon_reset_prompt

if [[ "${MIGRATE_AUTO_ENABLE_MIGRATION_API:-0}" == "1" ]]; then
  echo ""
  ensure_cloud_run_migration_api
fi

echo ""
echo "🔍 Preflight API (${MIGRATE_API_BASE})…"
migration_api_preflight

RUN_ARGS=(
  --config="${CONFIG_PATH}"
  --migrate-env="${MIGRATE_TARGET}"
  --database-url="${MIGRATE_DATABASE_URL}"
  --api-base-url="${MIGRATE_API_BASE}"
  --target="${MIGRATE_LOAD_TARGET}"
  --migration-api-key="${HATCAST_MIGRATION_API_KEY}"
)
if [[ "${MIGRATE_REQUIRES_PROD_CONFIRM}" == "1" ]]; then
  RUN_ARGS+=(--confirm-prod="${MIGRATE_LOAD_TARGET}")
fi
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
  if [[ "${SKIP_POST_SMOKE}" == false ]]; then
    echo ""
    echo "🧪 Post-smoke (consultation paths)…"
    POST_SMOKE_ARGS=(
      --database-url="${MIGRATE_DATABASE_URL}"
      --api-base-url="${MIGRATE_API_BASE}"
      --migration-api-key="${HATCAST_MIGRATION_API_KEY}"
      --export-dir="$(node -e "
const fs = require('fs');
const p = process.argv[1];
try {
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log(j.exportDir || './export/malice-runs');
} catch { console.log('./export/malice-runs'); }
" "${CONFIG_PATH}")"
    )
    npm run migrate:malice:post-smoke -- "${POST_SMOKE_ARGS[@]}"
  fi
fi

echo ""
echo "✅ migrate-from-v1 finished (${MIGRATE_TARGET})"

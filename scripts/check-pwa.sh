#!/bin/bash

# PWA smoke checks for HatCast (V2 HTTPS origin).
# Usage:
#   BASE_URL=https://your-v2-origin ./scripts/check-pwa.sh
#   ./scripts/check-pwa.sh https://your-v2-origin
#
# V2 staging example (Cloud Run, see docs/v2/technical/DEPLOYMENT_WORKFLOW.md):
#   BASE_URL=https://hatcast-v2-staging-730278491306.europe-west9.run.app ./scripts/check-pwa.sh
#
# Legacy V1 production (opt-in only):
#   HATCAST_PWA_LEGACY=1 BASE_URL=https://selections.la-malice.fr ./scripts/check-pwa.sh

set -euo pipefail

BASE_URL="${BASE_URL:-${1:-}}"
BASE_URL="${BASE_URL%/}"

if [ -z "$BASE_URL" ]; then
  echo "Usage: BASE_URL=https://your-v2-origin ./scripts/check-pwa.sh"
  echo "   or: ./scripts/check-pwa.sh https://your-v2-origin"
  echo ""
  echo "V2 staging: see docs/v2/technical/DEPLOYMENT_WORKFLOW.md (Cloud Run URL, not committed as default)."
  exit 1
fi

if [[ "$BASE_URL" != https://* ]]; then
  echo "ERROR: BASE_URL must use HTTPS (got: $BASE_URL)"
  exit 1
fi

echo "🔍 HatCast PWA smoke — $BASE_URL"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERROR_COUNT=0
WARN_COUNT=0

print_result() {
  local status=$1
  local message=$2
  local details=${3:-}

  case "$status" in
    OK)
      echo -e "${GREEN}✅ $message${NC}"
      ;;
    WARN)
      echo -e "${YELLOW}⚠️  $message${NC}"
      WARN_COUNT=$((WARN_COUNT + 1))
      ;;
    ERROR)
      echo -e "${RED}❌ $message${NC}"
      ERROR_COUNT=$((ERROR_COUNT + 1))
      ;;
  esac

  if [ -n "$details" ]; then
    echo -e "   $details"
  fi
  echo ""
}

# 1. HTTPS reachability
echo "1. HTTPS reachability..."
HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$BASE_URL" 2>/dev/null || echo "000")
if [[ "$HTTP_STATUS" =~ ^2 ]]; then
  print_result "OK" "HTTPS active" "HTTP status: $HTTP_STATUS"
else
  print_result "ERROR" "Site unreachable" "HTTP status: $HTTP_STATUS"
fi

# 2. Manifest
echo "2. Manifest..."
MANIFEST_URL="$BASE_URL/manifest.webmanifest"
MANIFEST_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$MANIFEST_URL" 2>/dev/null || echo "000")

if [[ "$MANIFEST_STATUS" =~ ^2 ]]; then
  print_result "OK" "Manifest accessible" "$MANIFEST_URL"

  MANIFEST_CONTENT=$(curl -s "$MANIFEST_URL" 2>/dev/null)
  if echo "$MANIFEST_CONTENT" | jq . >/dev/null 2>&1; then
    print_result "OK" "Manifest JSON valid" ""

    REQUIRED_PROPS=("name" "short_name" "start_url" "display" "icons")
    for prop in "${REQUIRED_PROPS[@]}"; do
      if echo "$MANIFEST_CONTENT" | jq -e ".$prop" >/dev/null 2>&1; then
        print_result "OK" "Property $prop present" ""
      else
        print_result "ERROR" "Property $prop missing" "Add this property to manifest.webmanifest"
      fi
    done

    # V2 contract (10.7 parity)
    START_URL=$(echo "$MANIFEST_CONTENT" | jq -r '.start_url // empty')
    DISPLAY=$(echo "$MANIFEST_CONTENT" | jq -r '.display // empty')
    THEME=$(echo "$MANIFEST_CONTENT" | jq -r '.theme_color // empty')
    BG=$(echo "$MANIFEST_CONTENT" | jq -r '.background_color // empty')

    [ "$START_URL" = "/?source=pwa" ] && print_result "OK" "start_url is /?source=pwa" "" || print_result "ERROR" "start_url mismatch" "expected /?source=pwa, got $START_URL"
    [ "$DISPLAY" = "standalone" ] && print_result "OK" "display is standalone" "" || print_result "ERROR" "display mismatch" "expected standalone, got $DISPLAY"
    [ "$THEME" = "#6750A4" ] && print_result "OK" "theme_color is #6750A4" "" || print_result "ERROR" "theme_color mismatch" "expected #6750A4, got $THEME"
    [ "$BG" = "#FFFBFE" ] && print_result "OK" "background_color is #FFFBFE" "" || print_result "ERROR" "background_color mismatch" "expected #FFFBFE, got $BG"

    PURPOSES=$(echo "$MANIFEST_CONTENT" | jq -r '.icons[].purpose' 2>/dev/null | sort -u | tr '\n' ' ')
    echo "$PURPOSES" | grep -qw "any" && print_result "OK" "icons include purpose any" "" || print_result "ERROR" "icons missing purpose any" ""
    echo "$PURPOSES" | grep -qw "maskable" && print_result "OK" "icons include purpose maskable" "" || print_result "ERROR" "icons missing purpose maskable" ""

    ANY_COUNT=$(echo "$MANIFEST_CONTENT" | jq '[.icons[] | select(.purpose == "any")] | length' 2>/dev/null)
    MASKABLE_COUNT=$(echo "$MANIFEST_CONTENT" | jq '[.icons[] | select(.purpose == "maskable")] | length' 2>/dev/null)
    if [ "${ANY_COUNT:-0}" -ge 1 ] && [ "${MASKABLE_COUNT:-0}" -ge 1 ]; then
      print_result "OK" "split any + maskable icon entries (10.7)" ""
    else
      print_result "ERROR" "manifest missing split any/maskable icons (10.7)" "Redeploy staging-v2 with 10.7+ build"
    fi

    echo "$MANIFEST_CONTENT" | jq -e '.icons[] | select(.src | test("icon-192.png"))' >/dev/null 2>&1 \
      && print_result "OK" "manifest lists icon-192.png (any)" "" \
      || print_result "ERROR" "manifest missing icon-192.png" ""
    echo "$MANIFEST_CONTENT" | jq -e '.icons[] | select(.src | test("manifest-icon-512.maskable.png"))' >/dev/null 2>&1 \
      && print_result "OK" "manifest lists manifest-icon-512.maskable.png" "" \
      || print_result "ERROR" "manifest missing manifest-icon-512.maskable.png" ""
  else
    print_result "ERROR" "Manifest JSON invalid" "Syntax error in manifest.webmanifest"
  fi
else
  print_result "ERROR" "Manifest unreachable" "HTTP status: $MANIFEST_STATUS"
fi

# 3. Icons (10.7 contract)
echo "3. Icons..."
ICONS=(
  "/icons/manifest-icon-192.maskable.png"
  "/icons/manifest-icon-512.maskable.png"
  "/icons/icon-192.png"
  "/icons/icon-512.png"
  "/icons/apple-icon-180.png"
  "/icons/favicon.svg"
)

for icon in "${ICONS[@]}"; do
  ICON_URL="$BASE_URL$icon"
  ICON_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$ICON_URL" 2>/dev/null || echo "000")
  if [[ "$ICON_STATUS" =~ ^2 ]]; then
    print_result "OK" "Icon accessible: $icon" ""
  else
    print_result "ERROR" "Icon unreachable: $icon" "HTTP status: $ICON_STATUS"
  fi
done

# 4. Service worker (V2: custom-sw.js first)
echo "4. Service worker..."
SW_PATHS=("/custom-sw.js" "/ngsw-worker.js" "/sw.js" "/service-worker.js")
SW_FOUND=false

for sw_path in "${SW_PATHS[@]}"; do
  SW_URL="$BASE_URL$sw_path"
  SW_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$SW_URL" 2>/dev/null || echo "000")
  if [[ "$SW_STATUS" =~ ^2 ]]; then
    print_result "OK" "Service worker accessible: $sw_path" ""
    SW_FOUND=true
    break
  fi
done

if [ "$SW_FOUND" = false ]; then
  print_result "ERROR" "No service worker found" "Checked: ${SW_PATHS[*]}"
fi

# 5. version.txt + changelog.json (10.3)
echo "5. Version and changelog assets..."
for asset in "/version.txt" "/changelog.json"; do
  ASSET_URL="$BASE_URL$asset"
  ASSET_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$ASSET_URL" 2>/dev/null || echo "000")
  if [[ ! "$ASSET_STATUS" =~ ^2 ]]; then
    print_result "ERROR" "Asset unreachable: $asset" "HTTP status: $ASSET_STATUS"
    continue
  fi

  ASSET_BODY=$(curl -s "$ASSET_URL" 2>/dev/null || true)
  if [ -z "$ASSET_BODY" ]; then
    print_result "ERROR" "Asset empty: $asset" ""
    continue
  fi

  if echo "$ASSET_BODY" | grep -qi '<!doctype html\|<html'; then
    print_result "ERROR" "Asset serves SPA fallback (not static file): $asset" "Redeploy staging-v2 with 10.3+ build"
    continue
  fi

  if [ "$asset" = "/version.txt" ]; then
    FIRST_LINE=$(echo "$ASSET_BODY" | head -1)
    if [ -z "$FIRST_LINE" ]; then
      print_result "ERROR" "version.txt has no content" ""
    else
      print_result "OK" "version.txt readable" "First line: $FIRST_LINE"
    fi
  else
    if echo "$ASSET_BODY" | jq . >/dev/null 2>&1; then
      print_result "OK" "changelog.json valid JSON" ""
    else
      print_result "ERROR" "changelog.json invalid JSON" ""
    fi
  fi
done

# 6. pwa-debug.html (legacy only — WARN on V2)
echo "6. Diagnostic page (optional)..."
DEBUG_URL="$BASE_URL/pwa-debug.html"
DEBUG_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -I "$DEBUG_URL" 2>/dev/null || echo "000")
if [[ "$DEBUG_STATUS" =~ ^2 ]]; then
  print_result "OK" "pwa-debug.html accessible" "$DEBUG_URL"
elif [ "${HATCAST_PWA_LEGACY:-}" = "1" ]; then
  print_result "WARN" "pwa-debug.html not found (legacy V1)" "Only present under legacy/public/"
else
  print_result "WARN" "pwa-debug.html not found (expected on V2)" "Legacy diagnostic page; not required for V2 recette"
fi

# 7. Basic response time
echo "7. Basic response time..."
if command -v bc >/dev/null 2>&1; then
  START_TIME=$(date +%s.%N)
  curl -s "$BASE_URL" >/dev/null 2>&1 || true
  END_TIME=$(date +%s.%N)
  RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
  if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    print_result "OK" "Response time acceptable" "${RESPONSE_TIME}s"
  else
    print_result "WARN" "Slow response time" "${RESPONSE_TIME}s (ideal: < 5s)"
  fi
else
  print_result "WARN" "bc not installed" "Skipped response time check"
fi

# Summary
echo "=========================================================="
echo "📊 PWA smoke summary"
echo "=========================================================="
echo ""
echo "🌐 BASE_URL: $BASE_URL"
echo "❌ Errors: $ERROR_COUNT"
echo "⚠️  Warnings: $WARN_COUNT"
echo ""
echo "📱 Manual recette (Chrome DevTools → Application):"
echo "   • Manifest + HatCast 2 icons"
echo "   • Service workers: custom-sw.js + ngsw active"
echo "   • Update banner (10.2) + changelog auto-open (10.3) after deploy"
echo ""

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "FAILED: $ERROR_COUNT error(s). Fix before V2.0.0 PWA sign-off."
  exit 1
fi

echo "PASSED: all required PWA smoke checks OK."
exit 0

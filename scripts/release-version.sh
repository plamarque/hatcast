#!/usr/bin/env bash
# Compat V1 — délégué vers release-version-v1.sh (Firebase / staging → main).
# Pipeline V2 : ./scripts/release_version.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "ℹ️  Release V1 (Firebase) : scripts/release-version-v1.sh" >&2
echo "   Release V2 (Cloud Run) : scripts/release_version.sh" >&2
exec "${SCRIPT_DIR}/release-version-v1.sh" "$@"

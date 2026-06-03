#!/usr/bin/env bash
# Deprecated compatibility wrapper.
# Production release is now tag-first via promote-tag-to-prod.sh (OPS-5).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="${SCRIPT_DIR}/promote-tag-to-prod.sh"

cat >&2 <<'EOF'
⚠️  scripts/v2/release-production.sh is deprecated.
    Use scripts/v2/promote-tag-to-prod.sh instead (tag-first flow).
    Example:
      ./scripts/v2/promote-tag-to-prod.sh --version=2.0.0
EOF

exec "${TARGET_SCRIPT}" "$@"

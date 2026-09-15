#!/usr/bin/env bash
# Test-only npx double for the pinned BMad installer command path.

set -euo pipefail

[[ "$1" == "--yes" && "$2" == "bmad-method@6.11.0" && "$3" == "install" ]]
printf '%s\n' "$@" >"${HATCAST_BMAD_NPX_LOG:?HATCAST_BMAD_NPX_LOG is required}"

root=""
for ((index = 1; index <= $#; index++)); do
  if [[ "${!index}" == "--directory" ]]; then
    next=$((index + 1))
    root="${!next}"
    break
  fi
done
[[ -n "${root}" ]]
bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mock-bmad-provisioner.sh" "${root}" "6.11.0"

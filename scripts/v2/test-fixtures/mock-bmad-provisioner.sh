#!/usr/bin/env bash
# Test-only substitute for the pinned BMad installer. Never used in production.

set -euo pipefail

root="$1"
version="$2"
fixture_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[[ "${version}" == "6.11.0" ]]
mkdir -p "${root}/.agents/skills"
cp -R "${fixture_dir}/mock-standard-skills/." "${root}/.agents/skills/"

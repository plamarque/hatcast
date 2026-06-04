#!/usr/bin/env bash
# Fonctions semver et changelog Markdown (partagées V1/V2 si sourcées explicitement).
# Ne modifie pas release-version.sh — usage opt-in depuis les scripts V2.

hatcast_read_package_version() {
  local file="${1:-package.json}"
  grep -o '"version": "[^"]*"' "${file}" | head -1 | cut -d'"' -f4
}

hatcast_bump_semver() {
  local current="$1"
  local bump="${2:-patch}"
  local explicit="${3:-}"

  if [[ -n "${explicit}" ]]; then
    echo "${explicit}"
    return 0
  fi

  local major minor patch
  IFS='.' read -r major minor patch <<< "${current}"
  major="${major:-0}"
  minor="${minor:-0}"
  patch="${patch:-0}"

  case "${bump}" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      echo "❌ Type de bump inconnu : ${bump}" >&2
      return 1
      ;;
  esac
  echo "${major}.${minor}.${patch}"
}

hatcast_set_package_json_version() {
  local file="$1"
  local old_version="$2"
  local new_version="$3"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    sed -i '' "s/\"version\": \"${old_version}\"/\"version\": \"${new_version}\"/" "${file}"
  else
    sed -i "s/\"version\": \"${old_version}\"/\"version\": \"${new_version}\"/" "${file}"
  fi
}

# Strip common prerelease suffixes (-SNAPSHOT, etc.) from a semver string.
hatcast_strip_prerelease_suffix() {
  local version="$1"
  echo "${version%%-*}"
}

# Latest annotated/lightweight tag matching vX.Y.Z-rc.N (version sort, highest first).
# Optional $1=base semver to scope tags (e.g. 2.0.0 -> v2.0.0-rc.*).
hatcast_latest_rc_tag() {
  local base="${1:-}"
  if [[ -n "${base}" ]]; then
    git tag -l "v${base}-rc.*" --sort=-v:refname | head -1
    return 0
  fi
  git tag -l 'v*.*.*-rc.*' --sort=-v:refname | head -1
}

# Parse vMAJOR.MINOR.PATCH-rc.N → prints "BASE RC_NUM" on stdout.
hatcast_parse_rc_tag() {
  local raw="$1"
  local tag="${raw#v}"
  if [[ "${tag}" =~ ^([0-9]+\.[0-9]+\.[0-9]+)-rc\.([0-9]+)$ ]]; then
    echo "${BASH_REMATCH[1]} ${BASH_REMATCH[2]}"
    return 0
  fi
  echo "❌ Tag RC invalide : ${raw}" >&2
  return 1
}

# Latest production-style tag vX.Y.Z (no -rc suffix).
# Optional $1=base semver to target exact tag vX.Y.Z.
hatcast_latest_release_tag() {
  local base="${1:-}"
  if [[ -n "${base}" ]]; then
    local exact="v${base}"
    if git rev-parse --verify "${exact}^{commit}" >/dev/null 2>&1; then
      echo "${exact}"
      return 0
    fi
    return 1
  fi

  local tag
  while IFS= read -r tag; do
    if [[ "${tag}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "${tag}"
      return 0
    fi
  done < <(git tag -l 'v*.*.*' --sort=-v:refname)
  return 1
}

# Latest production tag vX.Y.Z strictly older than $1 (semver compare).
hatcast_latest_prod_tag_before() {
  local new_base="$1"
  local tag tbase

  while IFS= read -r tag; do
    if [[ "${tag}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      tbase="${tag#v}"
      # V2 staging : ignorer les tags prod V1 (v0.x) — trop bruyants pour le journal V2.
      if [[ ! "${tbase}" =~ ^2\.[0-9]+\.[0-9]+$ ]]; then
        continue
      fi
      if [[ "${tbase}" == "${new_base}" ]]; then
        continue
      fi
      if [[ "$(printf '%s\n%s\n' "${tbase}" "${new_base}" | sort -V | head -1)" != "${tbase}" ]]; then
        continue
      fi
      if ! git merge-base --is-ancestor "${tag}" HEAD >/dev/null 2>&1; then
        continue
      fi
      echo "${tag}"
      return 0
    fi
  done < <(git tag -l 'v*.*.*' --sort=-v:refname)
  return 1
}

# Decrement patch component (2.0.1 -> 2.0.0). Fails on 0.0.0.
hatcast_decrement_patch_semver() {
  local version="$1"
  local major minor patch
  IFS='.' read -r major minor patch <<< "${version}"
  if [[ -z "${patch}" || "${patch}" -le 0 ]]; then
    return 1
  fi
  patch=$((patch - 1))
  echo "${major}.${minor}.${patch}"
}

# True when commit_range has at least one feat/fix/improve/perf/refactor/style commit (after release skips).
hatcast_changelog_range_has_user_facing_commits() {
  local commit_range="${1:-HEAD..HEAD}"
  local commit_line commit_msg

  while IFS= read -r commit_line; do
    commit_msg="$(echo "${commit_line}" | cut -d' ' -f2-)"
    if [[ "${commit_msg}" =~ ^(chore: bump version|release: version|chore\(v2\): bump version|chore\(v2\): release staging) ]]; then
      continue
    fi
    if [[ "${commit_msg}" =~ ^(feat|fix|improve|perf|refactor|style) ]]; then
      return 0
    fi
  done < <(git log --oneline "${commit_range}" 2>/dev/null || true)
  return 1
}

# Remote tag names matching vX.Y.Z-rc.N (sorted ascending by version).
hatcast_remote_rc_tag_names() {
  local base="${1:-}"
  git ls-remote --tags origin 2>/dev/null \
    | awk '{print $2}' \
    | sed -n 's|^refs/tags/\(v[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*-rc\.[0-9][0-9]*\)$|\1|p' \
    | while IFS= read -r tag; do
        if [[ -z "${base}" ]] || [[ "${tag}" =~ ^v${base}-rc\.[0-9]+$ ]]; then
          echo "${tag}"
        fi
      done \
    | sort -V
}

# Latest vX.Y.Z-rc.N on origin (after git fetch --tags).
hatcast_latest_remote_rc_tag() {
  local base="${1:-}"
  hatcast_remote_rc_tag_names "${base}" | tail -n 1
}

# Latest vX.Y.Z prod tag on origin (no -rc suffix).
hatcast_latest_remote_release_tag() {
  git ls-remote --tags origin 2>/dev/null \
    | awk '{print $2}' \
    | sed -n 's|^refs/tags/\(v[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)$|\1|p' \
    | sort -V \
    | tail -n 1
}

# Commit SHA for a remote tag (peeled when annotated).
hatcast_remote_tag_commit() {
  local tag="$1"
  local sha=""
  sha="$(git ls-remote --tags origin "refs/tags/${tag}^{}" 2>/dev/null | awk '{print $1}' | sed -n '1p')"
  if [[ -z "${sha}" ]]; then
    sha="$(git ls-remote --tags origin "refs/tags/${tag}" 2>/dev/null | awk '{print $1}' | sed -n '1p')"
  fi
  echo "${sha}"
}

# Resolve staging RC release: prints "BASE_SEMVER RC_NUM TAG_NAME" (e.g. 2.0.0 3 v2.0.0-rc.3).
# $1=bump (empty|patch|minor|major)  $2=explicit_version  $3=file_base_hint (stripped)  $4=file_raw_hint (optional, may contain -SNAPSHOT)
hatcast_resolve_staging_rc_release() {
  local bump="${1:-}"
  local explicit="${2:-}"
  local file_hint="${3:-}"
  local file_raw="${4:-${file_hint}}"

  local latest_rc="" rc_base="" rc_num="" new_base="" new_rc="" tag_name="" target_base=""

  if [[ -n "${explicit}" ]] && [[ ! "${explicit}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ --version invalide: ${explicit} (attendu: X.Y.Z)." >&2
    return 1
  fi

  if [[ -n "${explicit}" ]]; then
    target_base="${explicit}"
  elif [[ -n "${file_hint}" && "${file_hint}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    target_base="${file_hint}"
  fi

  latest_rc="$(hatcast_latest_rc_tag "${target_base}" || true)"
  if [[ -n "${latest_rc}" ]]; then
    read -r rc_base rc_num <<< "$(hatcast_parse_rc_tag "${latest_rc}")"
  fi

  if [[ -z "${latest_rc}" && -z "${explicit}" && "${file_raw}" == *-* ]]; then
    echo "❌ Version ${file_raw} contient un suffixe de pré-release (-SNAPSHOT)." >&2
    echo "   Aucun tag v*.*.*-rc.* sur origin — passez --version=X.Y.Z pour la première RC." >&2
    echo "   Exemple cutover v2.0.0 : git checkout staging-v2 && ./scripts/v2/release-staging.sh --version=2.0.0" >&2
    return 1
  fi

  if [[ -n "${explicit}" ]]; then
    new_base="${explicit}"
    new_rc=1
  elif [[ -n "${bump}" ]]; then
    local source_base="${rc_base}"
    if [[ -z "${source_base}" ]]; then
      source_base="${file_hint}"
    fi
    if [[ -z "${source_base}" || "${source_base}" == *-* ]]; then
      echo "❌ Impossible de déterminer la version de base pour un bump ${bump}." >&2
      echo "   Passez --version=X.Y.Z (ex. première RC cutover : --version=2.0.0)." >&2
      return 1
    fi
    new_base="$(hatcast_bump_semver "${source_base}" "${bump}" "")"
    new_rc=1
  elif [[ -n "${rc_base}" ]]; then
    new_base="${rc_base}"
    new_rc=$((rc_num + 1))
  else
    if [[ -n "${file_hint}" && "${file_hint}" != *-* ]]; then
      new_base="${file_hint}"
      new_rc=1
    else
      echo "❌ Aucun tag RC et aucune version produit détectée." >&2
      echo "   Passez --version=X.Y.Z pour la première RC staging." >&2
      return 1
    fi
  fi

  tag_name="v${new_base}-rc.${new_rc}"
  echo "${new_base} ${new_rc} ${tag_name}"
}

# Changelog git range for a staging RC: previous RC or last release tag when rc.1.
hatcast_staging_changelog_range() {
  local base="$1"
  local rc="$2"
  local prev_tag=""

  if [[ "${rc}" -gt 1 ]]; then
    prev_tag="v${base}-rc.$((rc - 1))"
    if ! git rev-parse --verify "${prev_tag}^{commit}" >/dev/null 2>&1; then
      echo "❌ Tag RC précédent introuvable: ${prev_tag}" >&2
      return 1
    fi
  else
    # rc.1 : dernière RC de la lignée patch précédente, sinon dernier tag prod < base (jamais v${base} ni HEAD seul).
    local prior_base=""
    prior_base="$(hatcast_decrement_patch_semver "${base}" || true)"
    if [[ -n "${prior_base}" ]]; then
      prev_tag="$(hatcast_latest_rc_tag "${prior_base}" || true)"
    fi
    if [[ -z "${prev_tag}" ]]; then
      prev_tag="$(hatcast_latest_prod_tag_before "${base}" || true)"
    fi
    if [[ -z "${prev_tag}" ]]; then
      echo "⚠️  Aucune ancre changelog pour ${base}-rc.1 — plage vide (HEAD..HEAD)." >&2
      echo "HEAD..HEAD"
      return 0
    fi
  fi

  if ! git merge-base --is-ancestor "${prev_tag}" HEAD >/dev/null 2>&1; then
    echo "❌ Tag de départ changelog non ancêtre de HEAD: ${prev_tag}" >&2
    return 1
  fi

  echo "${prev_tag}..HEAD"
}

# Génère le bloc ## [version] dans CHANGELOG.md (racine).
# $1=new_version $2=build_date $3=commit_range (ex. v0.1.0..HEAD)
hatcast_generate_changelog_md() {
  local new_version="$1"
  local build_date="$2"
  local commit_range="${3:-HEAD}"
  local temp_changelog="changelog_new.md"

  cat > "${temp_changelog}" << EOF
# Changelog

## [${new_version}] - ${build_date}

EOF

  local -a features=() fixes=() improvements=() others=()
  local commit_line commit_msg

  while IFS= read -r commit_line; do
    commit_msg="$(echo "${commit_line}" | cut -d' ' -f2-)"
    if [[ "${commit_msg}" =~ ^(chore: bump version|release: version|chore\(v2\): bump version|chore\(v2\): release staging) ]]; then
      continue
    fi
    if [[ "${commit_msg}" =~ ^feat ]]; then
      features+=("- ${commit_msg}")
    elif [[ "${commit_msg}" =~ ^fix ]]; then
      fixes+=("- ${commit_msg}")
    elif [[ "${commit_msg}" =~ ^(improve|perf|refactor|style) ]]; then
      improvements+=("- ${commit_msg}")
    else
      others+=("- ${commit_msg}")
    fi
  done < <(git log --oneline "${commit_range}" 2>/dev/null || true)

  if [[ ${#features[@]} -gt 0 ]]; then
    echo "### ✨ New Features" >> "${temp_changelog}"
    printf '%s\n' "${features[@]}" >> "${temp_changelog}"
    echo "" >> "${temp_changelog}"
  fi
  if [[ ${#improvements[@]} -gt 0 ]]; then
    echo "### 🔧 Improvements" >> "${temp_changelog}"
    printf '%s\n' "${improvements[@]}" >> "${temp_changelog}"
    echo "" >> "${temp_changelog}"
  fi
  if [[ ${#fixes[@]} -gt 0 ]]; then
    echo "### 🐛 Bug Fixes" >> "${temp_changelog}"
    printf '%s\n' "${fixes[@]}" >> "${temp_changelog}"
    echo "" >> "${temp_changelog}"
  fi
  if [[ ${#others[@]} -gt 0 ]]; then
    echo "### 📝 Other Changes" >> "${temp_changelog}"
    printf '%s\n' "${others[@]}" >> "${temp_changelog}"
    echo "" >> "${temp_changelog}"
  fi
  if [[ ${#features[@]} -eq 0 && ${#fixes[@]} -eq 0 && ${#improvements[@]} -eq 0 && ${#others[@]} -eq 0 ]]; then
    echo "### 📦 Release" >> "${temp_changelog}"
    echo "- Version release (V2)" >> "${temp_changelog}"
    echo "" >> "${temp_changelog}"
  fi

  echo "---" >> "${temp_changelog}"
  echo "" >> "${temp_changelog}"

  if [[ -f CHANGELOG.md ]]; then
    if grep -q "^# Changelog" CHANGELOG.md; then
      tail -n +3 CHANGELOG.md >> "${temp_changelog}"
    else
      cat CHANGELOG.md >> "${temp_changelog}"
    fi
  fi

  mv "${temp_changelog}" CHANGELOG.md
}

# Préfixe la même section dans CHANGELOG_FR.md si le fichier existe.
hatcast_mirror_changelog_fr() {
  local new_version="$1"
  local build_date="$2"

  if [[ ! -f CHANGELOG_FR.md ]]; then
    return 0
  fi

  local fr_block="## [${new_version}] - ${build_date}

> Journal technique aligné sur CHANGELOG.md (entrée anglaise pour cette version).

"
  local temp_fr="changelog_fr_new.md"
  {
    echo "# Journal des modifications (FR)"
    echo ""
    echo -e "${fr_block}"
    if grep -q "^# " CHANGELOG_FR.md; then
      tail -n +3 CHANGELOG_FR.md
    else
      cat CHANGELOG_FR.md
    fi
  } > "${temp_fr}"
  mv "${temp_fr}" CHANGELOG_FR.md
}

# --- changelog.json (V2 PWA — Story 10.3 / OPS-6) ---

if _hatcast_git_root="$(git rev-parse --show-toplevel 2>/dev/null)" && [[ -n "${_hatcast_git_root}" ]]; then
  _HATCAST_REPO_ROOT="${_hatcast_git_root}"
else
  _HATCAST_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi
HATCAST_CHANGELOG_JSON_REL="apps/web/public/changelog.json"

hatcast_changelog_json_path() {
  echo "${_HATCAST_REPO_ROOT}/${HATCAST_CHANGELOG_JSON_REL}"
}

hatcast_load_openai_env() {
  # shellcheck source=../load-dotenv.sh
  source "${_HATCAST_REPO_ROOT}/scripts/load-dotenv.sh"
  load_dotenv "${_HATCAST_REPO_ROOT}/.env"
  load_dotenv "${_HATCAST_REPO_ROOT}/.env.local"
}

# Curated cutover entry (e.g. 2.0.0) — stdout JSON object; return 1 if no file.
hatcast_load_cutover_changelog_entry() {
  local version="$1"
  local build_date="$2"
  local entry_file="${_HATCAST_REPO_ROOT}/scripts/v2/changelog-entries/v${version}-cutover.json"

  if [[ ! -f "${entry_file}" ]]; then
    entry_file="${_HATCAST_REPO_ROOT}/scripts/v2/changelog-entries/${version}-cutover.json"
  fi
  if [[ ! -f "${entry_file}" ]]; then
    return 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq requis pour changelog.json (installer jq)." >&2
    return 1
  fi

  jq -c --arg date "${build_date}" 'del(.source, .notes) | .date = $date' "${entry_file}"
}

# Technical JSON from git log (same range/filters as hatcast_generate_changelog_md).
hatcast_build_technical_changelog_json() {
  local version="$1"
  local date="$2"
  local commit_range="${3:-HEAD}"

  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq requis pour changelog.json." >&2
    return 1
  fi

  local -a changes=()
  local commit_line commit_msg line

  while IFS= read -r commit_line; do
    commit_msg="$(echo "${commit_line}" | cut -d' ' -f2-)"
    if [[ "${commit_msg}" =~ ^(chore: bump version|release: version|chore\(v2\): bump version|chore\(v2\): release staging) ]]; then
      continue
    fi
    if [[ "${commit_msg}" =~ ^feat ]]; then
      line="✨ ${commit_msg}"
    elif [[ "${commit_msg}" =~ ^fix ]]; then
      line="🐛 ${commit_msg}"
    elif [[ "${commit_msg}" =~ ^(improve|perf|refactor|style) ]]; then
      line="🔧 ${commit_msg}"
    else
      line="📝 ${commit_msg}"
    fi
    changes+=("${line}")
  done < <(git log --oneline "${commit_range}" 2>/dev/null || true)

  local changes_json="[]"
  if [[ ${#changes[@]} -gt 0 ]]; then
    changes_json="$(printf '%s\n' "${changes[@]}" | jq -R -s 'split("\n") | map(select(length > 0))')"
  fi

  jq -nc --arg version "${version}" --arg date "${date}" --argjson changes "${changes_json}" \
    '{version: $version, date: $date, changes: $changes}'
}

hatcast_changelog_json_empty_entry() {
  local version="$1"
  local date="$2"
  jq -nc --arg version "${version}" --arg date "${date}" \
    '{version: $version, date: $date, changes: []}'
}

hatcast_transform_changelog_json_with_openai() {
  local technical_json="$1"
  local version="$2"

  hatcast_load_openai_env

  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    return 1
  fi

  local temp_out
  temp_out="$(mktemp)"
  if OPENAI_API_KEY="${OPENAI_API_KEY}" node "${_HATCAST_REPO_ROOT}/scripts/generate-changelog.js" \
    "${technical_json}" "${version}" >"${temp_out}"; then
    local result
    result="$(cat "${temp_out}")"
    rm -f "${temp_out}"
    if [[ -n "${result}" ]] && echo "${result}" | jq -e '.version and .date and (.changes | type == "array")' >/dev/null 2>&1; then
      echo "${result}"
      return 0
    fi
  else
    rm -f "${temp_out}"
  fi
  return 1
}

# Merge or prepend version entry in apps/web/public/changelog.json.
hatcast_update_changelog_json_file() {
  local new_version_json="$1"
  local version="$2"
  local changelog_file
  changelog_file="$(hatcast_changelog_json_path)"

  if ! echo "${new_version_json}" | jq empty 2>/dev/null; then
    echo "❌ JSON entrée changelog invalide pour ${version}." >&2
    return 1
  fi

  mkdir -p "$(dirname "${changelog_file}")"

  if [[ -f "${changelog_file}" ]] && [[ -s "${changelog_file}" ]]; then
    if ! jq empty "${changelog_file}" 2>/dev/null; then
      echo "⚠️  ${HATCAST_CHANGELOG_JSON_REL} invalide — régénération." >&2
      echo "[${new_version_json}]" >"${changelog_file}"
    else
      if ! jq --argjson new_version "${new_version_json}" \
        --arg snapshot_seed "${version}-SNAPSHOT" \
        'if any(.[]; .version == $new_version.version) then
           map(if .version == $new_version.version then $new_version else . end)
         else
           [$new_version] + .
         end
         | map(select(.version != $snapshot_seed))' "${changelog_file}" >"${changelog_file}.tmp" 2>/dev/null; then
        echo "❌ Échec jq sur ${HATCAST_CHANGELOG_JSON_REL}." >&2
        return 1
      fi
      mv "${changelog_file}.tmp" "${changelog_file}"
    fi
  else
    echo "[${new_version_json}]" >"${changelog_file}"
  fi

  if ! jq empty "${changelog_file}" 2>/dev/null; then
    echo "❌ ${HATCAST_CHANGELOG_JSON_REL} invalide après mise à jour." >&2
    return 1
  fi

  echo "✅ ${HATCAST_CHANGELOG_JSON_REL} mis à jour (version ${version})"
  return 0
}

# Orchestrator for release-staging.sh
hatcast_generate_changelog_json_for_release() {
  local version="$1"
  local date="$2"
  local commit_range="$3"
  local no_user_changelog="${4:-false}"
  local changelog_file entry_json technical_json user_json

  changelog_file="$(hatcast_changelog_json_path)"

  if [[ "${no_user_changelog}" == "true" ]]; then
    echo "⏭️  ${HATCAST_CHANGELOG_JSON_REL} inchangé (--no-user-changelog)"
    return 0
  fi

  if entry_json="$(hatcast_load_cutover_changelog_entry "${version}" "${date}")"; then
    echo "ℹ️  Changelog ${version} : entrée cutover curated (pas de git/OpenAI)"
    hatcast_update_changelog_json_file "${entry_json}" "${version}"
    return $?
  fi

  echo "📝 Génération ${HATCAST_CHANGELOG_JSON_REL} (${commit_range})…"
  if ! technical_json="$(hatcast_build_technical_changelog_json "${version}" "${date}" "${commit_range}")"; then
    echo "❌ Impossible de construire le JSON technique changelog." >&2
    return 1
  fi

  if ! hatcast_changelog_range_has_user_facing_commits "${commit_range}"; then
    echo "ℹ️  Aucun commit feat/fix dans ${commit_range} — entrée ${version} avec changes: [] (OpenAI ignoré)."
    user_json="$(hatcast_changelog_json_empty_entry "${version}" "${date}")"
  elif user_json="$(hatcast_transform_changelog_json_with_openai "${technical_json}" "${version}")"; then
    echo "ℹ️  Notes utilisateur générées (OpenAI / Argil)"
  else
    echo "⚠️  OpenAI indisponible ou échec — entrée ${version} avec changes: [] (pas de fallback technique)." >&2
    user_json="$(hatcast_changelog_json_empty_entry "${version}" "${date}")"
  fi

  hatcast_update_changelog_json_file "${user_json}" "${version}"
}

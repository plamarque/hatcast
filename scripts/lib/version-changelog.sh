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
    if [[ "${commit_msg}" =~ ^(chore: bump version|release: version|chore\(v2\): bump version) ]]; then
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

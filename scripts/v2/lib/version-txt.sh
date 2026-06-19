#!/usr/bin/env bash
# Shared version.txt helpers for V2 release and deploy pipelines.

hatcast_version_txt_build_line() {
  local channel="$1" build_date="$2"
  case "${channel}" in
    production)
      echo "Production build - ${build_date}"
      ;;
    staging)
      echo "Staging RC build - ${build_date}"
      ;;
    development)
      echo "Development build - ${build_date}"
      ;;
    local)
      echo "Local build - ${build_date}"
      ;;
    *)
      echo "❌ Canal version.txt inconnu : ${channel}" >&2
      return 1
      ;;
  esac
}

# write_version_txt VERSION BUILD_DATE GIT_HASH BUILD_TIME [CHANNEL] [OUTPUT_FILE]
write_version_txt() {
  local version="$1" build_date="$2" git_hash="$3" build_time="$4"
  local channel="${5:-staging}"
  local output_file="${6:-apps/web/public/version.txt}"
  local build_line

  build_line="$(hatcast_version_txt_build_line "${channel}" "${build_date}")" || return 1
  mkdir -p "$(dirname "${output_file}")"
  cat > "${output_file}" << EOF
${version}
${build_line}
Git: ${git_hash}
Build: ${build_time}
EOF
}

#!/bin/zsh

# =============================================================================
# SCRIPT DE GÉNÉRATION D'ICÔNES PWA — HatCast
# =============================================================================
#
# USAGE :
#   Legacy (V1, depuis la racine du repo) :
#     ./scripts/generate-icons.sh
#     ./scripts/generate-icons.sh --target legacy --source legacy/logo.svg
#
#   V2 (apps/web) :
#     ./scripts/generate-icons.sh --target apps/web
#     ./scripts/generate-icons.sh --target apps/web --source apps/web/public/icons/logo-hatcast-2.svg
#
# PRÉREQUIS : brew install inkscape imagemagick
# =============================================================================

set -euo pipefail

TARGET="legacy"
SOURCE=""
MASKABLE_BG="#EADDFF"
SCRIPT_DIR="${0:A:h}"
REPO_ROOT="${SCRIPT_DIR:h}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET="$2"
      shift 2
      ;;
    --source)
      SOURCE="$2"
      shift 2
      ;;
    --maskable-bg)
      MASKABLE_BG="$2"
      shift 2
      ;;
    -h | --help)
      echo "Usage: $0 [--target legacy|apps/web] [--source PATH] [--maskable-bg HEX]"
      exit 0
      ;;
    *)
      echo "❌ Option inconnue: $1"
      exit 1
      ;;
  esac
done

if [[ "$TARGET" == "apps/web" ]]; then
  ICONS_DIR="${REPO_ROOT}/apps/web/public/icons"
  PUBLIC_DIR="${REPO_ROOT}/apps/web/public"
  if [[ -z "$SOURCE" ]]; then
    SOURCE="${ICONS_DIR}/logo-hatcast-2.svg"
  fi
  # Dedicated, tightly-cropped favicon source (sharper at 16/32px) — falls back to the app icon.
  FAVICON_SOURCE="${ICONS_DIR}/favicon-hatcast-2.svg"
  if [[ ! -f "$FAVICON_SOURCE" ]]; then
    FAVICON_SOURCE="$SOURCE"
  fi
  FAVICON_SOURCE_ABS="$(cd "$(dirname "$FAVICON_SOURCE")" && pwd)/$(basename "$FAVICON_SOURCE")"
elif [[ "$TARGET" == "legacy" ]]; then
  ICONS_DIR="${REPO_ROOT}/legacy/public/icons"
  PUBLIC_DIR="${REPO_ROOT}/legacy/public"
  if [[ -z "$SOURCE" ]]; then
    SOURCE="${REPO_ROOT}/legacy/logo.svg"
  fi
else
  echo "❌ --target doit être 'legacy' ou 'apps/web' (reçu: $TARGET)"
  exit 1
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "❌ Fichier source introuvable: $SOURCE"
  exit 1
fi

if ! command -v inkscape &>/dev/null; then
  echo "❌ Inkscape requis: brew install inkscape"
  exit 1
fi

SOURCE_ABS="$(cd "$(dirname "$SOURCE")" && pwd)/$(basename "$SOURCE")"
mkdir -p "$ICONS_DIR"

echo "🎭 Génération des icônes HatCast"
echo "   Target : $TARGET"
echo "   Source : $SOURCE_ABS"
echo "   Output : $ICONS_DIR"

generate_icon() {
  local size=$1
  local filename=$2
  echo "📱 $filename (${size}x${size})"
  inkscape --export-type=png \
    --export-filename="${ICONS_DIR}/${filename}" \
    --export-width="$size" \
    --export-height="$size" \
    --export-area-page \
    "$SOURCE_ABS"
}

generate_icon_with_padding() {
  local size=$1
  local filename=$2
  local padding_pixels=${3:-4}
  local vertical_offset=${4:-0}
  local bg_fill=${5:-white}
  local temp_svg
  temp_svg="$(mktemp /tmp/hatcast-icon-XXXXXX.svg)"

  local center=$((size / 2))
  local radius=$((size / 2))
  local content_size=$((size - padding_pixels * 2))
  local offset_x=$padding_pixels
  local offset_y=$((padding_pixels + vertical_offset))

  cat >"$temp_svg" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${size}" height="${size}" fill="${bg_fill}"/>
  <image xlink:href="${SOURCE_ABS}"
         width="${content_size}"
         height="${content_size}"
         x="${offset_x}"
         y="${offset_y}"/>
</svg>
EOF

  inkscape --export-type=png \
    --export-filename="${ICONS_DIR}/${filename}" \
    --export-width="$size" \
    --export-height="$size" \
    "$temp_svg"

  rm -f "$temp_svg"
}

generate_maskable() {
  local size=$1
  local filename=$2
  # ~18% inset keeps glyph inside W3C 40% safe-zone radius on adaptive masks
  local padding=$((size * 18 / 100))
  generate_icon_with_padding "$size" "$filename" "$padding" 0 "$MASKABLE_BG"
}

if [[ "$TARGET" == "apps/web" ]]; then
  echo "\n🤖 V2 — icônes manifest + favicon..."

  # purpose: any — transparent, tight crop
  generate_icon 192 "icon-192.png"
  generate_icon 512 "icon-512.png"

  # purpose: maskable — full-bleed M3 primary-container background
  generate_maskable 192 "manifest-icon-192.maskable.png"
  generate_maskable 512 "manifest-icon-512.maskable.png"

  echo "\n🍎 Apple + Windows..."
  generate_icon_with_padding 180 "apple-icon-180.png" 36 0 "$MASKABLE_BG"
  generate_icon_with_padding 150 "mstile-150x150.png" 30 0 "$MASKABLE_BG"
  generate_icon 48 "icon-48x48.png"

  echo "\n🎨 Favicon SVG (source dédiée recadrée)..."
  cp "$FAVICON_SOURCE_ABS" "${ICONS_DIR}/favicon.svg"

  echo "\n🔗 Favicon PNG + ICO..."
  for fsize in 16 32 48; do
    echo "📱 favicon-${fsize}.png (${fsize}x${fsize})"
    inkscape --export-type=png \
      --export-filename="${ICONS_DIR}/favicon-${fsize}.png" \
      --export-width="$fsize" \
      --export-height="$fsize" \
      --export-area-page \
      "$FAVICON_SOURCE_ABS"
  done

  if command -v magick &>/dev/null; then
    magick "${ICONS_DIR}/favicon-16.png" "${ICONS_DIR}/favicon-32.png" "${ICONS_DIR}/favicon-48.png" \
      -background transparent \
      -alpha background \
      -colors 256 \
      -define icon:auto-resize=16,32,48 \
      "${ICONS_DIR}/favicon.ico"
    cp "${ICONS_DIR}/favicon.ico" "${PUBLIC_DIR}/favicon.ico"
    echo "✅ favicon.ico créé"
  else
    echo "⚠️  ImageMagick absent — favicon.ico non régénéré"
  fi

else
  # Legacy full generation (unchanged behaviour, paths relative to legacy/public)
  cd "${REPO_ROOT}/legacy"
  LOGO="${SOURCE_ABS}"
  ICONS_DIR="public/icons"
  PUBLIC_DIR="public"
  mkdir -p "$ICONS_DIR"

  generate_icon() {
    local size=$1
    local filename=$2
    echo "📱 Génération de $filename (${size}x${size})"
    inkscape --export-type=png \
      --export-filename="public/icons/$filename" \
      --export-width=$size \
      --export-height=$size \
      --export-area-page \
      "$LOGO"
  }

  generate_icon_with_padding() {
    local size=$1
    local filename=$2
    local padding_pixels=${3:-4}
    local vertical_offset=${4:-0}
    local temp_svg
    temp_svg="$(mktemp /tmp/hatcast-legacy-icon-XXXXXX.svg)"
    local center=$((size / 2))
    local radius=$((size / 2))
    local content_size=$((size - padding_pixels * 2))
    local offset_x=$padding_pixels
    local offset_y=$((padding_pixels + vertical_offset))

    cat >"$temp_svg" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="circle">
      <circle cx="${center}" cy="${center}" r="${radius}"/>
    </clipPath>
  </defs>
  <circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>
  <g clip-path="url(#circle)">
    <image xlink:href="${LOGO}"
           width="${content_size}"
           height="${content_size}"
           x="${offset_x}"
           y="${offset_y}"/>
  </g>
</svg>
EOF
    inkscape --export-type=png \
      --export-filename="public/icons/$filename" \
      --export-width=$size \
      --export-height=$size \
      "$temp_svg"
    rm -f "$temp_svg"
  }

  echo "\n🍎 Génération des Apple Touch Icons..."
  for size in 180 152 144 120 114 76 72 60 57; do
    if [ $size -eq 180 ]; then
      padding=8
      vertical_offset=7
    elif [ $size -eq 152 ]; then
      padding=8
      vertical_offset=6
    elif [ $size -eq 144 ]; then
      padding=8
      vertical_offset=5
    elif [ $size -eq 120 ]; then
      padding=8
      vertical_offset=4
    elif [ $size -eq 114 ]; then
      padding=8
      vertical_offset=6
    elif [ $size -ge 72 ]; then
      padding=6
      vertical_offset=2
    else
      padding=4
      vertical_offset=1
    fi
    generate_icon_with_padding $size "apple-touch-icon-${size}x${size}.png" $padding $vertical_offset
  done

  generate_icon_with_padding 180 "apple-touch-icon.png" 8 7

  echo "\n🤖 Génération des icônes Android/Manifest..."
  for size in 512 384 256 192 128 96 72 48 36; do
    if [ $size -eq 512 ]; then
      padding=12
      vertical_offset=25
    elif [ $size -eq 384 ]; then
      padding=12
      vertical_offset=18
    elif [ $size -eq 256 ]; then
      padding=12
      vertical_offset=7
    elif [ $size -eq 192 ]; then
      padding=8
      vertical_offset=7
    elif [ $size -ge 128 ]; then
      padding=8
      vertical_offset=4
    elif [ $size -ge 72 ]; then
      padding=6
      vertical_offset=2
    else
      padding=4
      vertical_offset=1
    fi
    generate_icon_with_padding $size "icon-${size}x${size}.png" $padding $vertical_offset
  done

  echo "\n🪟 Génération de l'icône Windows..."
  generate_icon 150 "mstile-150x150.png"

  echo "\n🎨 Génération des icônes SVG..."
  cp "$LOGO" public/icons/icon-192.svg
  cp "$LOGO" public/icons/icon-512.svg
  cp "$LOGO" public/icons/favicon.svg

  echo "\n🍎 Génération des icônes Apple alternatives..."
  generate_icon_with_padding 180 "apple-icon-180.png" 8 7

  echo "\n📱 Génération des icônes adaptatives Android..."
  generate_icon_with_padding 192 "manifest-icon-192.maskable.png" 8 7
  generate_icon_with_padding 512 "manifest-icon-512.maskable.png" 12 25

  echo "\n🔗 Génération du favicon..."
  generate_icon 32 "favicon-32.png"
  generate_icon 16 "favicon-16.png"
  generate_icon 48 "favicon-48x48.png"
  generate_icon 100 "logo-100.png"

  cp public/icons/favicon-32.png public/favicon-32.png
  cp public/icons/favicon-16.png public/favicon-16.png
  cp public/icons/logo-100.png public/logo-100.png

  if command -v magick &>/dev/null; then
    magick public/favicon-16.png public/favicon-32.png public/icons/favicon-48x48.png \
      -background transparent \
      -alpha background \
      -colors 256 \
      -define icon:auto-resize=16,32,48 \
      public/icons/favicon.ico
    cp public/icons/favicon.ico ./favicon.ico
    cp public/icons/favicon.ico public/favicon.ico
  fi
fi

echo "\n✅ Génération terminée !"
echo "📁 Icônes dans: $ICONS_DIR"
ls -la "$ICONS_DIR"

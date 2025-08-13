#!/bin/zsh

# =============================================================================
# SCRIPT DE GÉNÉRATION D'ICÔNES PWA
# =============================================================================
#
# DESCRIPTION :
# -------------
# Ce script génère automatiquement toutes les variantes d'icônes nécessaires
# pour une Progressive Web App (PWA) à partir d'un fichier logo.svg de référence.
#
# FICHIER SOURCE REQUIS :
# -----------------------
# - logo.svg : Fichier SVG source (doit être présent dans le répertoire courant)
#   Prérequis techniques du logo.svg :
#   * Format SVG vectoriel
#   * Taille recommandée : au moins 512x512px dans le viewBox
#   * Couleurs : RGB ou hexadécimal (pas de couleurs Pantone)
#   * Transparence : supportée
#   * Optimisé pour le web (pas de métadonnées inutiles)
#
# FICHIERS GÉNÉRÉS :
# ------------------
# Dans public/ :
#   - favicon.svg, favicon-16.png, favicon-32.png, logo-100.png
#   - favicon.ico (racine du projet)
#
# Dans public/icons/ :
#   - Apple Touch Icons (57x57 à 180x180)
#   - Android/Manifest Icons (36x36 à 512x512)
#   - Icônes adaptatives (maskable) pour Android
#   - Icônes Windows Tile
#   - Icônes SVG pour PWA
#
# PRÉREQUIS D'INSTALLATION :
# --------------------------
# 1. Inkscape (conversion SVG vers PNG)
#    brew install inkscape
#
# 2. ImageMagick (création favicon.ico multi-tailles)
#    brew install imagemagick
#
# 3. bc (calculs décimaux - généralement installé par défaut)
#    brew install bc
#
# INSTALLATION COMPLÈTE :
# brew install inkscape imagemagick bc
#
# USAGE :
# -------
# chmod +x generate-icons.sh
# ./generate-icons.sh
#
# =============================================================================

echo "🎭 Génération des icônes pour Impro Selector..."

# Créer le dossier icons s'il n'existe pas
mkdir -p public/icons

# Vérifier que logo.svg existe
if [[ ! -f "logo.svg" ]]; then
    echo "❌ Erreur: logo.svg non trouvé dans le répertoire courant"
    exit 1
fi

# Fonction pour générer une icône dans public/icons/
generate_icon() {
    local size=$1
    local filename=$2
    echo "📱 Génération de $filename (${size}x${size})"
    inkscape --export-type=png \
             --export-filename="public/icons/$filename" \
             --export-width=$size \
             --export-height=$size \
             --export-area-page \
             logo.svg
}



# Fonction pour générer une icône avec centrage correct
generate_icon_with_padding() {
    local size=$1
    local filename=$2
    local padding_pixels=${3:-4}  # 4 pixels de padding par défaut
    local vertical_offset=${4:-0}  # Décalage vertical en pixels (positif = vers le bas)
    
    echo "📱 Génération de $filename (${size}x${size}) avec centrage et ${padding_pixels}px de padding"
    
    # Calculer les valeurs pour le SVG
    local center=$((size / 2))
    local radius=$((size / 2))
    local content_size=$((size - padding_pixels * 2))
    local offset_x=$((padding_pixels))
    local offset_y=$((padding_pixels + vertical_offset))
    
    # Créer un SVG temporaire avec centrage correct
    cat > temp_padded.svg << EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circle">
      <circle cx="${center}" cy="${center}" r="${radius}"/>
    </clipPath>
  </defs>
  <circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>
  <g clip-path="url(#circle)">
    <image href="logo.svg" 
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
             temp_padded.svg
    
    # Nettoyer le fichier temporaire
    rm temp_padded.svg
}

# Apple Touch Icons
echo "\n🍎 Génération des Apple Touch Icons..."
for size in 180 152 144 120 114 76 72 60 57; do
    # Padding adaptatif : plus l'icône est grande, plus le padding peut être important
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

# Icône principale Apple
generate_icon_with_padding 180 "apple-touch-icon.png" 8 7

# Android/Manifest Icons
echo "\n🤖 Génération des icônes Android/Manifest..."
for size in 512 384 256 192 128 96 72 48 36; do
    # Padding adaptatif : plus l'icône est grande, plus le padding peut être important
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

# Windows Tile
echo "\n🪟 Génération de l'icône Windows..."
generate_icon 150 "mstile-150x150.png"

# Icônes SVG pour PWA
echo "\n🎨 Génération des icônes SVG..."
echo "📋 Copie de logo.svg vers les icônes SVG..."
cp logo.svg public/icons/icon-192.svg
cp logo.svg public/icons/icon-512.svg
cp logo.svg public/icons/favicon.svg
echo "✅ Icônes SVG créées depuis logo.svg"

# Icônes Apple alternatives
echo "\n🍎 Génération des icônes Apple alternatives..."
generate_icon_with_padding 180 "apple-icon-180.png" 8 7

# Icônes adaptatives (maskable) pour Android
echo "\n📱 Génération des icônes adaptatives Android..."
generate_icon_with_padding 192 "manifest-icon-192.maskable.png" 8 7
generate_icon_with_padding 512 "manifest-icon-512.maskable.png" 12 25

# Favicon (PNG pour compatibilité moderne)
echo "\n🔗 Génération du favicon..."
generate_icon 32 "favicon-32.png"
generate_icon 16 "favicon-16.png"
generate_icon 48 "favicon-48x48.png"

# Logo principal
echo "\n🎭 Génération du logo principal..."
generate_icon 100 "logo-100.png"

# Créer des liens/copies à la racine pour compatibilité
echo "\n🔗 Création des liens de compatibilité..."
cp public/icons/favicon-32.png public/favicon-32.png
cp public/icons/favicon-16.png public/favicon-16.png
cp public/icons/logo-100.png public/logo-100.png

# Créer un favicon.ico multi-tailles complet (nécessite ImageMagick)
if command -v magick &> /dev/null; then
    echo "🔄 Création du favicon.ico multi-tailles..."
    
    # Méthode 1: Créer depuis les PNG avec fond transparent
    magick public/favicon-16.png public/favicon-32.png public/icons/favicon-48x48.png \
            -background transparent \
            -alpha background \
            -colors 256 \
            -define icon:auto-resize=16,32,48 \
            public/icons/favicon.ico
    
    # Méthode 2: Créer directement depuis le SVG source (alternative plus propre)
    if command -v inkscape &> /dev/null; then
        echo "🎨 Création alternative depuis SVG source..."
        inkscape --export-type=png \
                 --export-filename="public/icons/favicon-temp-16.png" \
                 --export-width=16 \
                 --export-height=16 \
                 --export-area-page \
                 logo.svg
        
        inkscape --export-type=png \
                 --export-filename="public/icons/favicon-temp-32.png" \
                 --export-width=32 \
                 --export-height=32 \
                 --export-area-page \
                 logo.svg
        
        inkscape --export-type=png \
                 --export-filename="public/icons/favicon-temp-48.png" \
                 --export-width=48 \
                 --export-height=48 \
                 --export-area-page \
                 logo.svg
        
        magick public/icons/favicon-temp-16.png public/icons/favicon-temp-32.png public/icons/favicon-temp-48.png \
                -background transparent \
                -alpha background \
                -colors 256 \
                -define icon:auto-resize=16,32,48 \
                public/icons/favicon.ico
        
        # Nettoyer les fichiers temporaires
        rm public/icons/favicon-temp-*.png
    fi
    
    # Créer aussi un favicon.ico dans la racine pour compatibilité
    cp public/icons/favicon.ico ./favicon.ico
    cp public/icons/favicon.ico public/favicon.ico
    echo "✅ Favicon.ico créé avec les tailles 16x16, 32x32 et 48x48"
elif command -v convert &> /dev/null; then
    echo "🔄 Création du favicon.ico multi-tailles (ImageMagick v6)..."
    
    # Fallback pour ImageMagick v6
    convert public/favicon-16.png public/favicon-32.png public/icons/favicon-48x48.png \
            -background transparent \
            -alpha background \
            -colors 256 \
            -define icon:auto-resize=16,32,48 \
            public/icons/favicon.ico
    
    # Créer aussi un favicon.ico dans la racine pour compatibilité
    cp public/icons/favicon.ico ./favicon.ico
    cp public/icons/favicon.ico public/favicon.ico
    echo "✅ Favicon.ico créé avec les tailles 16x16, 32x32 et 48x48"
else
    echo "⚠️  ImageMagick non installé, favicon.ico non créé"
    echo "   Installez-le avec: brew install imagemagick"
fi

echo "\n✅ Génération terminée !"
echo "📁 Icônes créées dans: public/icons/"
echo "\n📋 Fichiers générés:"
ls -la public/icons/
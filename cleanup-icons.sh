#!/bin/zsh

# Script de nettoyage des icônes obsolètes
# Usage: ./cleanup-icons.sh

echo "🧹 Nettoyage des icônes obsolètes..."

# Fichiers obsolètes à supprimer
obsolete_files=(
    # Fichiers SVG redondants
    "public/icons/apple-icon-180.svg"
    "public/icons/manifest-icon-192.maskable.svg"
    "public/icons/manifest-icon-512.maskable.svg"
    
    # Anciens formats de favicon
    "public/icons/favicon-16x16.png"
    "public/icons/favicon-32x32.png"
    
    # Icônes redondantes
    "public/icons/icon-512.png"
    "public/icons/icon-192.png"
    
    # Fichiers obsolètes dans public/
    "public/logo.png"
    "public/mask-check.png"
    "public/logo.svg"
    "public/favicon.svg"
    
    # Fichiers déplacés (maintenant gérés par le script principal)
    "public/favicon-16.png"
    "public/favicon-32.png"
    "public/favicon.ico"
    "public/logo-100.png"
)

# Supprimer les fichiers obsolètes
for file in "${obsolete_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "🗑️  Suppression de $file"
        rm "$file"
    else
        echo "ℹ️  $file n'existe pas (déjà supprimé)"
    fi
done

echo "\n✅ Nettoyage terminé !"
echo "📋 Fichiers conservés :"
echo "   - logo.svg (référence - racine du projet)"
echo "   - public/icons/ (toutes les icônes PWA incluant favicon.svg)"
echo "   - favicon.ico (racine du projet - compatibilité navigateurs)"

echo "\n📁 Contenu du dossier public/ :"
ls -la public/ | grep -E "(favicon|logo)"

echo "\n📁 Contenu du dossier public/icons/ :"
ls -la public/icons/

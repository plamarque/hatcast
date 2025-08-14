#!/bin/bash

# Script de déploiement PWA pour HatCast
# Usage: ./deploy-pwa.sh

echo "🚀 Déploiement PWA HatCast"
echo "=========================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Vérifier que nous sommes dans le bon répertoire
print_step "Vérification du répertoire de travail..."
if [ ! -f "package.json" ]; then
    print_error "package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi
print_success "Répertoire de projet détecté"

# 2. Vérifier les dépendances
print_step "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules non trouvé. Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Échec de l'installation des dépendances"
        exit 1
    fi
else
    print_success "Dépendances déjà installées"
fi

# 3. Nettoyer le build précédent
print_step "Nettoyage du build précédent..."
rm -rf dist
print_success "Build précédent supprimé"

# 4. Build de l'application
print_step "Build de l'application avec PWA..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Échec du build"
    exit 1
fi
print_success "Build terminé avec succès"

# 5. Vérifier que les fichiers PWA sont présents
print_step "Vérification des fichiers PWA..."
if [ ! -f "dist/manifest.webmanifest" ]; then
    print_error "manifest.webmanifest non trouvé dans dist/"
    exit 1
fi

if [ ! -f "dist/sw.js" ]; then
    print_error "sw.js non trouvé dans dist/"
    exit 1
fi

if [ ! -d "dist/icons" ]; then
    print_error "Dossier icons non trouvé dans dist/"
    exit 1
fi

print_success "Tous les fichiers PWA sont présents"

# 6. Vérifier le contenu du manifest
print_step "Validation du manifest..."
if command -v jq &> /dev/null; then
    if jq . dist/manifest.webmanifest >/dev/null 2>&1; then
        print_success "Manifest JSON valide"
    else
        print_error "Manifest JSON invalide"
        exit 1
    fi
else
    print_warning "jq non installé, validation JSON ignorée"
fi

# 7. Préparer le déploiement
print_step "Préparation du déploiement..."
echo ""
echo "📋 Fichiers PWA générés :"
echo "   ✅ manifest.webmanifest"
echo "   ✅ sw.js"
echo "   ✅ icons/ (dossier)"
echo "   ✅ pwa-debug.html"
echo ""

# 8. Instructions de déploiement
echo "🚀 Instructions de déploiement :"
echo "================================"
echo ""
echo "1. Committez les changements :"
echo "   git add ."
echo "   git commit -m 'Fix PWA installation issues'"
echo "   git push origin main"
echo ""
echo "2. Attendez le déploiement GitHub Pages (2-5 minutes)"
echo ""
echo "3. Vérifiez le déploiement :"
echo "   ./check-pwa.sh"
echo ""
echo "4. Testez l'installation PWA :"
echo "   - Ouvrez https://selections.la-malice.fr sur Chrome Mobile"
echo "   - Appuyez sur le menu (3 points)"
echo "   - Cherchez 'Ajouter à l'écran d'accueil'"
echo ""
echo "5. Diagnostic détaillé :"
echo "   https://selections.la-malice.fr/pwa-debug.html"
echo ""

# 9. Vérification finale
print_step "Vérification finale..."
echo ""
echo "📋 Points à vérifier après déploiement :"
echo "   ✅ HTTPS actif sur le site"
echo "   ✅ Manifest accessible : https://selections.la-malice.fr/manifest.webmanifest"
echo "   ✅ Service worker accessible : https://selections.la-malice.fr/sw.js"
echo "   ✅ Icônes accessibles dans /icons/"
echo "   ✅ Page de diagnostic : https://selections.la-malice.fr/pwa-debug.html"
echo ""

print_success "Déploiement PWA préparé avec succès !"
echo ""
echo "💡 Rappel : Chrome peut prendre jusqu'à 24h pour détecter"
echo "   l'éligibilité PWA d'un site. Testez régulièrement."

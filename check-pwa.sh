#!/bin/bash

# Script de vérification PWA pour HatCast
# Usage: ./check-pwa.sh

echo "🔍 Vérification PWA HatCast - https://selections.la-malice.fr"
echo "=========================================================="
echo ""

BASE_URL="https://selections.la-malice.fr"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    local status=$1
    local message=$2
    local details=$3
    
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
    
    if [ ! -z "$details" ]; then
        echo -e "   $details"
    fi
    echo ""
}

# 1. Vérifier HTTPS
echo "1. Vérification HTTPS..."
if curl -s -I "$BASE_URL" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    # Vérifier que l'URL commence par https://
    if [[ "$BASE_URL" == https://* ]]; then
        print_result "OK" "HTTPS actif" "Le site est servi en HTTPS"
    else
        print_result "WARN" "HTTPS non détecté" "Vérifiez la configuration du serveur"
    fi
else
    print_result "ERROR" "Site inaccessible" "Impossible d'accéder au site"
    exit 1
fi

# 2. Vérifier le manifest
echo "2. Vérification du manifest..."
MANIFEST_URL="$BASE_URL/manifest.webmanifest"
MANIFEST_RESPONSE=$(curl -s -I "$MANIFEST_URL" 2>/dev/null)

if echo "$MANIFEST_RESPONSE" | grep -q "HTTP/.*200"; then
    print_result "OK" "Manifest accessible" "Le manifest est accessible"
    
    # Vérifier le contenu du manifest
    MANIFEST_CONTENT=$(curl -s "$MANIFEST_URL" 2>/dev/null)
    if echo "$MANIFEST_CONTENT" | jq . >/dev/null 2>&1; then
        print_result "OK" "Manifest JSON valide" "Le JSON est syntaxiquement correct"
        
        # Vérifier les propriétés requises
        REQUIRED_PROPS=("name" "short_name" "start_url" "display" "icons")
        for prop in "${REQUIRED_PROPS[@]}"; do
            if echo "$MANIFEST_CONTENT" | jq -e ".$prop" >/dev/null 2>&1; then
                print_result "OK" "Propriété $prop présente" ""
            else
                print_result "ERROR" "Propriété $prop manquante" "Ajoutez cette propriété au manifest"
            fi
        done
    else
        print_result "ERROR" "Manifest JSON invalide" "Le JSON contient des erreurs de syntaxe"
    fi
else
    print_result "ERROR" "Manifest inaccessible" "Erreur: $(echo "$MANIFEST_RESPONSE" | head -1)"
fi

# 3. Vérifier les icônes
echo "3. Vérification des icônes..."
ICONS=(
    "/icons/manifest-icon-192.maskable.png"
    "/icons/manifest-icon-512.maskable.png"
)

for icon in "${ICONS[@]}"; do
    ICON_URL="$BASE_URL$icon"
    ICON_RESPONSE=$(curl -s -I "$ICON_URL" 2>/dev/null)
    
    if echo "$ICON_RESPONSE" | grep -q "HTTP/.*200"; then
        print_result "OK" "Icône accessible: $icon" ""
    else
        print_result "ERROR" "Icône inaccessible: $icon" "Erreur: $(echo "$ICON_RESPONSE" | head -1)"
    fi
done

# 4. Vérifier le service worker
echo "4. Vérification du service worker..."
SW_URLS=("$BASE_URL/sw.js" "$BASE_URL/service-worker.js")
SW_FOUND=false

for sw_url in "${SW_URLS[@]}"; do
    SW_RESPONSE=$(curl -s -I "$sw_url" 2>/dev/null)
    if echo "$SW_RESPONSE" | grep -q "HTTP/.*200"; then
        print_result "OK" "Service worker accessible" "Le fichier $(basename "$sw_url") est accessible"
        SW_FOUND=true
        break
    fi
done

if [ "$SW_FOUND" = false ]; then
    print_result "WARN" "Service worker non trouvé" "Vérifiez que le build PWA a généré sw.js ou service-worker.js"
fi

# 5. Vérifier la page de diagnostic
echo "5. Vérification de la page de diagnostic..."
DEBUG_URL="$BASE_URL/pwa-debug.html"
DEBUG_RESPONSE=$(curl -s -I "$DEBUG_URL" 2>/dev/null)

if echo "$DEBUG_RESPONSE" | grep -q "HTTP/.*200"; then
    print_result "OK" "Page de diagnostic accessible" "Visitez: $DEBUG_URL"
else
    print_result "WARN" "Page de diagnostic non trouvée" "La page pwa-debug.html n'est pas accessible"
fi

# 6. Test de performance basique
echo "6. Test de performance basique..."
START_TIME=$(date +%s.%N)
curl -s "$BASE_URL" >/dev/null 2>&1
END_TIME=$(date +%s.%N)
RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    print_result "OK" "Temps de réponse acceptable" "Temps: ${RESPONSE_TIME}s"
else
    print_result "WARN" "Temps de réponse lent" "Temps: ${RESPONSE_TIME}s (idéal: < 2s)"
fi

# Résumé
echo "=========================================================="
echo "📊 Résumé de la vérification PWA"
echo "=========================================================="
echo ""
echo "🌐 Site: $BASE_URL"
echo "📱 Pour tester l'installation PWA:"
echo "   1. Ouvrez $BASE_URL sur Chrome Mobile"
echo "   2. Appuyez sur le menu (3 points)"
echo "   3. Cherchez 'Ajouter à l'écran d'accueil'"
echo ""
echo "🔍 Pour un diagnostic détaillé:"
echo "   Visitez: $DEBUG_URL"
echo ""
echo "📋 Critères d'éligibilité Chrome PWA:"
echo "   ✅ HTTPS requis"
echo "   ✅ Manifest valide avec icônes"
echo "   ✅ Service worker actif"
echo "   ✅ Display standalone"
echo "   ✅ Visites répétées (peut prendre 24h)"
echo ""
echo "💡 Conseil: Si la bannière n'apparaît pas, attendez 24h"
echo "   et testez régulièrement. Chrome peut être conservateur."

#!/bin/bash

# Script de déploiement simplifié pour HatCast
# Utilise GitHub Actions pour le build et déploiement sécurisé
# Usage: ./deploy-simple.sh

echo "🚀 Déploiement simplifié HatCast (GitHub Actions)"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 1. Vérifier le statut git
print_step "Vérification du statut Git..."
if [ -z "$(git status --porcelain)" ]; then
    print_success "Aucun changement à committer"
else
    print_warning "Changements détectés :"
    git status --short
    echo ""
fi

# 2. Demander confirmation
echo "🔄 Ce script va :"
echo "   1. Ajouter tous les changements"
echo "   2. Créer un commit"
echo "   3. Pousser sur GitHub"
echo "   4. Déclencher le déploiement automatique via GitHub Actions"
echo ""
read -p "Continuer ? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Déploiement annulé"
    exit 0
fi

# 3. Ajouter les changements
print_step "Ajout des changements..."
git add .
print_success "Changements ajoutés"

# 4. Demander le message de commit
echo ""
read -p "Message de commit (défaut: 'Deploy to production'): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy to production"
fi

# 5. Créer le commit
print_step "Création du commit..."
git commit -m "$commit_message"
if [ $? -ne 0 ]; then
    print_error "Échec de la création du commit"
    exit 1
fi
print_success "Commit créé : $commit_message"

# 6. Pousser sur GitHub
print_step "Push sur GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    print_error "Échec du push"
    exit 1
fi
print_success "Code poussé sur GitHub"

# 7. Instructions de suivi
echo ""
echo "🎉 Déploiement déclenché avec succès !"
echo "======================================"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. GitHub Actions se déclenche automatiquement"
echo "   2. Le build se fait sur GitHub (sécurisé avec tes secrets)"
echo "   3. Le déploiement se fait sur GitHub Pages"
echo "   4. Durée estimée : 2-5 minutes"
echo ""
echo "🔍 Suivre le déploiement :"
echo "   https://github.com/plamarque/hatcast/actions"
echo ""
echo "🌐 Vérifier le site :"
echo "   https://selections.la-malice.fr"
echo ""
echo "💡 Rappel : Tes clés Firebase sont maintenant sécurisées !"
echo "   Elles ne sont plus exposées dans ton code local."

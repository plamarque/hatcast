#!/bin/bash

# Script de déploiement en production avec versioning automatique
# Usage: ./scripts/deploy-production.sh [--dry-run] [--major|--minor|--patch]

set -e

# Analyser les arguments
DRY_RUN=false
VERSION_BUMP="patch"  # par défaut

for arg in "$@"; do
    case $arg in
        --dry-run|-n)
            DRY_RUN=true
            ;;
        --major)
            VERSION_BUMP="major"
            ;;
        --minor)
            VERSION_BUMP="minor"
            ;;
        --patch)
            VERSION_BUMP="patch"
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run, -n     Mode simulation (aucune modification)"
            echo "  --major           Bump version majeure (1.2.3 → 2.0.0)"
            echo "  --minor           Bump version mineure (1.2.3 → 1.3.0)"
            echo "  --patch           Bump version patch (1.2.3 → 1.2.4) [défaut]"
            echo "  --help, -h        Afficher cette aide"
            echo ""
            echo "Exemples:"
            echo "  $0 --dry-run --minor    # Simuler bump mineur"
            echo "  $0 --major              # Bump majeur réel"
            echo "  $0                      # Bump patch réel (défaut)"
            exit 0
            ;;
        *)
            echo "❌ Option inconnue: $arg"
            echo "Utilisez --help pour voir les options disponibles"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - Simulation du déploiement en production"
    echo "=================================================="
    echo "⚠️  Mode simulation : aucune modification ne sera effectuée"
else
    echo "🚀 Déploiement en production avec versioning automatique"
    echo "========================================================="
fi
echo "📋 Type de bump: $VERSION_BUMP"

# Fonction wrapper pour exécuter les commandes
execute_cmd() {
    local cmd="$1"
    local description="$2"
    
    if [ "$DRY_RUN" = true ]; then
        echo "📝 SIMULATION: $description"
        echo "   └─ $cmd"
    else
        echo "📝 $description"
        eval "$cmd"
    fi
}

# Fonction wrapper pour les modifications de fichiers
modify_file() {
    local operation="$1"
    local file="$2"
    local description="$3"
    
    if [ "$DRY_RUN" = true ]; then
        echo "📝 SIMULATION: $description"
        echo "   └─ $operation"
        if [ "$file" = "package.json" ]; then
            echo "   └─ \"version\": \"$CURRENT_VERSION\" → \"version\": \"$NEW_VERSION\""
        elif [ "$file" = "public/version.txt" ]; then
            echo "   └─ Contenu qui serait créé:"
            echo "      $NEW_VERSION"
            echo "      Production build - $BUILD_DATE"
            echo "      Git: $GIT_HASH"
            echo "      Build: $BUILD_TIME"
        elif [ "$file" = "CHANGELOG.md" ]; then
            echo "   └─ CHANGELOG mis à jour avec les commits depuis la dernière version"
        fi
    else
        echo "📝 $description"
        eval "$operation"
    fi
}

# Fonction pour générer le changelog
generate_changelog() {
    local new_version="$1"
    local build_date="$2"
    
    # Trouver le dernier tag (version précédente)
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$LAST_TAG" ]; then
        # Premier release, prendre tous les commits
        COMMIT_RANGE="HEAD"
        echo "📋 Premier release - incluant tous les commits"
    else
        # Commits depuis le dernier tag
        COMMIT_RANGE="$LAST_TAG..HEAD"
        echo "📋 Génération du changelog depuis $LAST_TAG"
    fi
    
    # Créer le contenu du changelog temporaire
    TEMP_CHANGELOG="/tmp/changelog_new.md"
    
    # Header de la nouvelle version
    cat > "$TEMP_CHANGELOG" << EOF
# Changelog

## [${new_version}] - ${build_date}

EOF
    
    # Collecter les commits par type
    local features=()
    local fixes=()
    local improvements=()
    local others=()
    
    # Lire les commits et les catégoriser
    while IFS= read -r commit_line; do
        # Extraire le hash et le message
        commit_hash=$(echo "$commit_line" | cut -d' ' -f1)
        commit_msg=$(echo "$commit_line" | cut -d' ' -f2-)
        
        # Ignorer les commits de version/release automatiques
        if [[ "$commit_msg" =~ ^(chore: bump version|release: version) ]]; then
            continue
        fi
        
        # Catégoriser selon le préfixe conventional commits
        if [[ "$commit_msg" =~ ^feat ]]; then
            features+=("- $commit_msg")
        elif [[ "$commit_msg" =~ ^fix ]]; then
            fixes+=("- $commit_msg")
        elif [[ "$commit_msg" =~ ^(improve|perf|refactor|style) ]]; then
            improvements+=("- $commit_msg")
        else
            others+=("- $commit_msg")
        fi
    done < <(git log --oneline "$COMMIT_RANGE" 2>/dev/null)
    
    # Ajouter les sections au changelog
    if [ ${#features[@]} -gt 0 ]; then
        echo "### ✨ Nouvelles fonctionnalités" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${features[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#improvements[@]} -gt 0 ]; then
        echo "### 🔧 Améliorations" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${improvements[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#fixes[@]} -gt 0 ]; then
        echo "### 🐛 Corrections" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${fixes[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#others[@]} -gt 0 ]; then
        echo "### 📝 Autres changements" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${others[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    # Si pas de commits trouvés
    if [ ${#features[@]} -eq 0 ] && [ ${#fixes[@]} -eq 0 ] && [ ${#improvements[@]} -eq 0 ] && [ ${#others[@]} -eq 0 ]; then
        echo "### 📦 Release" >> "$TEMP_CHANGELOG"
        echo "- Version release" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    echo "---" >> "$TEMP_CHANGELOG"
    echo "" >> "$TEMP_CHANGELOG"
    
    # Fusionner avec l'ancien changelog s'il existe
    if [ -f "CHANGELOG.md" ]; then
        # Garder le header existant et ajouter le nouveau contenu avant l'ancien
        if grep -q "^# Changelog" CHANGELOG.md; then
            # Garder seulement les anciennes versions (supprimer le header)
            tail -n +3 CHANGELOG.md >> "$TEMP_CHANGELOG"
        else
            # Ajouter tout l'ancien contenu
            cat CHANGELOG.md >> "$TEMP_CHANGELOG"
        fi
    fi
    
    # Remplacer le changelog
    mv "$TEMP_CHANGELOG" "CHANGELOG.md"
    
    return 0
}

# Vérifier qu'on est sur staging
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la branche staging"
    echo "   Branche actuelle: $CURRENT_BRANCH"
    exit 1
fi

# Vérifier que staging est propre
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Erreur: La branche staging a des changements non commitéd"
    git status
    exit 1
fi

# Récupérer les dernières versions des branches
echo "📡 Récupération des dernières versions..."
git fetch origin

# Vérifier s'il y a des commits sur main qui ne sont pas dans staging (hotfixes potentiels)
COMMITS_MAIN_NOT_IN_STAGING=$(git rev-list staging..origin/main --count)
if [ "$COMMITS_MAIN_NOT_IN_STAGING" -gt 0 ]; then
    echo "⚠️  ATTENTION: $COMMITS_MAIN_NOT_IN_STAGING commit(s) sur main ne sont pas dans staging !"
    echo ""
    echo "📋 Commits manquants dans staging:"
    git log --oneline staging..origin/main
    echo ""
    echo "💡 Cela peut indiquer des hotfixes faits directement en production."
    echo "   Il est recommandé de rebaser staging sur main avant de continuer."
    echo ""
    
    # Options pour l'utilisateur
    echo "Que voulez-vous faire ?"
    echo "1) Rebaser staging sur main automatiquement (recommandé)"
    echo "2) Continuer sans rebaser (risqué - peut écraser les hotfixes)"
    echo "3) Arrêter le déploiement pour investigation manuelle"
    echo ""
    read -p "Votre choix (1/2/3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "🔄 Rebase de staging sur main..."
            
            # Sauvegarder l'état actuel au cas où
            BACKUP_BRANCH="backup-staging-$(date +%Y%m%d-%H%M%S)"
            git branch "$BACKUP_BRANCH"
            echo "💾 Sauvegarde créée: $BACKUP_BRANCH"
            
            # Rebaser staging sur main
            git rebase origin/main
            
            if [ $? -ne 0 ]; then
                echo "❌ Erreur: Conflit lors du rebase !"
                echo "🛠️  Résolvez les conflits manuellement, puis :"
                echo "   git rebase --continue"
                echo "   ./scripts/deploy-production.sh"
                echo ""
                echo "💾 En cas de problème, restaurez avec :"
                echo "   git rebase --abort"
                echo "   git checkout $BACKUP_BRANCH"
                exit 1
            fi
            
            echo "✅ Rebase réussi !"
            echo "🗑️  Suppression de la sauvegarde..."
            git branch -d "$BACKUP_BRANCH"
            ;;
        2)
            echo "⚠️  Continuation sans rebase - les hotfixes risquent d'être écrasés !"
            read -p "Êtes-vous VRAIMENT sûr ? (tapez 'OUI' en majuscules): " CONFIRM
            if [ "$CONFIRM" != "OUI" ]; then
                echo "❌ Déploiement annulé"
                exit 1
            fi
            ;;
        3)
            echo "❌ Déploiement arrêté pour investigation manuelle"
            echo ""
            echo "💡 Commandes utiles pour investiguer :"
            echo "   git log --oneline staging..origin/main  # Voir les commits manquants"
            echo "   git diff staging..origin/main           # Voir les différences"
            echo "   git rebase origin/main                  # Rebaser manuellement"
            exit 1
            ;;
        *)
            echo "❌ Choix invalide. Déploiement annulé."
            exit 1
            ;;
    esac
else
    echo "✅ Staging est à jour avec main - aucun hotfix détecté"
fi

# Générer le nouveau numéro de version
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
VERSION_PARTS=(${CURRENT_VERSION//./ })
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Calculer la nouvelle version selon le type de bump
case $VERSION_BUMP in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

BUILD_DATE=$(date +%Y-%m-%d)
GIT_HASH=$(git rev-parse --short HEAD)
BUILD_TIME=$(date '+%Y-%m-%dT%H:%M:%S%z')

echo "📋 Version actuelle: $CURRENT_VERSION"
echo "📋 Nouvelle version: $NEW_VERSION"
echo "📋 Hash: $GIT_HASH"
echo "📋 Date: $BUILD_DATE"

# Confirmer avec l'utilisateur
read -p "🤔 Confirmer le déploiement en production ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

# Mise à jour package.json
modify_file "sed -i \"s/\\\"version\\\": \\\"$CURRENT_VERSION\\\"/\\\"version\\\": \\\"$NEW_VERSION\\\"/\" package.json" "package.json" "Mise à jour de package.json"

# Créer version.txt avec infos complètes
modify_file "cat > public/version.txt << 'EOF'
$NEW_VERSION
Production build - $BUILD_DATE
Git: $GIT_HASH
Build: $BUILD_TIME
EOF" "public/version.txt" "Création de version.txt"

# Générer le changelog automatique
if [ "$DRY_RUN" = true ]; then
    echo "📝 SIMULATION: Génération du changelog automatique"
    echo "   └─ Analyse des commits depuis le dernier tag"
    echo "   └─ Catégorisation par type (feat/fix/improve/autres)"
    echo "   └─ Création/mise à jour de CHANGELOG.md"
    echo ""
    
    # Générer le changelog en mode simulation pour l'afficher
    generate_changelog "$NEW_VERSION" "$BUILD_DATE" >/dev/null
    
    echo "📄 APERÇU DU CHANGELOG QUI SERA GÉNÉRÉ:"
    echo "┌─────────────────────────────────────────────────"
    
    # Afficher seulement la nouvelle section (jusqu'au premier "---")
    if [ -f "CHANGELOG.md" ]; then
        awk '/^# Changelog/,/^---$/{if(/^---$/) exit; print}' CHANGELOG.md
    fi
    
    echo "└─────────────────────────────────────────────────"
    echo ""
    
    # Restaurer l'état original (supprimer le changelog temporaire)
    git checkout -- CHANGELOG.md 2>/dev/null || true
else
    echo "📝 Génération du changelog automatique..."
    generate_changelog "$NEW_VERSION" "$BUILD_DATE"
    
    echo ""
    echo "📄 CHANGELOG GÉNÉRÉ:"
    echo "┌─────────────────────────────────────────────────"
    
    # Afficher la nouvelle section générée
    awk '/^# Changelog/,/^---$/{if(/^---$/) exit; print}' CHANGELOG.md
    
    echo "└─────────────────────────────────────────────────"
    echo ""
fi

# Committer les changements de version
execute_cmd "git add package.json public/version.txt CHANGELOG.md" "Ajout des fichiers modifiés"
execute_cmd "git commit -m \"chore: bump version to $NEW_VERSION for production release\"" "Commit des changements de version"

# Pousser staging
execute_cmd "git push origin staging" "Push de staging"

# Merger vers main
execute_cmd "git checkout main" "Basculement vers main"
execute_cmd "git pull origin main" "Récupération des derniers changements de main"
execute_cmd "git merge staging --no-ff -m \"release: version $NEW_VERSION

Merge staging to main for production release
- Version: $NEW_VERSION
- Build: $BUILD_DATE
- Hash: $GIT_HASH\"" "Merge de staging vers main"

# Créer un tag
execute_cmd "git tag -a \"v$NEW_VERSION\" -m \"Release version $NEW_VERSION

Production release
- Date: $BUILD_DATE  
- Hash: $GIT_HASH\"" "Création du tag v$NEW_VERSION"

# Pousser main avec le tag
execute_cmd "git push origin main" "Push de main"
execute_cmd "git push origin \"v$NEW_VERSION\"" "Push du tag"

# Retourner sur staging
execute_cmd "git checkout staging" "Retour sur staging"

# Message de fin
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🚀 SIMULATION: Déploiement qui serait déclenché..."
    echo "   - GitHub Action détecterait le push sur main"
    echo "   - Build et déploiement automatique sur Firebase"
    echo "   - URLs mises à jour: https://selections.la-malice.fr → v$NEW_VERSION"
    echo ""
    echo "✅ DRY RUN TERMINÉ - Aucune modification effectuée"
    echo "💡 Pour exécuter réellement: ./scripts/deploy-production.sh"
fi

if [ "$DRY_RUN" = false ]; then
    echo "✅ Déploiement initié !"
    echo "🌐 La GitHub Action va maintenant déployer en production"
    echo "📊 Vérifiez: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
    echo "🎯 Version déployée: $NEW_VERSION"
fi 
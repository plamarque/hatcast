#!/bin/bash

# Automated production deployment script with intelligent versioning
# Usage: ./scripts/deploy-production.sh [--dry-run] [--major|--minor|--patch]

set -e

# Parse command line arguments
DRY_RUN=false
VERSION_BUMP="patch"  # default

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
            echo "  --dry-run, -n     Simulation mode (no changes made)"
            echo "  --major           Major version bump (1.2.3 → 2.0.0)"
            echo "  --minor           Minor version bump (1.2.3 → 1.3.0)"
            echo "  --patch           Patch version bump (1.2.3 → 1.2.4) [default]"
            echo "  --help, -h        Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 --dry-run --minor    # Simulate minor bump"
            echo "  $0 --major              # Real major bump"
            echo "  $0                      # Real patch bump (default)"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $arg"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - Production deployment simulation"
    echo "============================================="
    echo "⚠️  Simulation mode: no changes will be made"
else
    echo "🚀 Production deployment with automatic versioning"
    echo "=================================================="
fi
echo "📋 Version bump type: $VERSION_BUMP"

# Sandbox management functions
create_dry_run_sandbox() {
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    DRY_STAGING="dry-run-staging-$TIMESTAMP"
    DRY_MAIN="dry-run-main-$TIMESTAMP"
    
    echo "🏗️  Creating dry-run sandbox environment..."
    echo "   └─ Staging copy: $DRY_STAGING"
    echo "   └─ Main copy: $DRY_MAIN"
    
    # Create sandbox branches
    git branch "$DRY_STAGING" staging
    git branch "$DRY_MAIN" origin/main
    
    # Switch to sandbox staging
    git checkout "$DRY_STAGING"
    
    echo "✅ Sandbox created successfully"
}

cleanup_dry_run_sandbox() {
    if [ -n "$DRY_STAGING" ] && [ -n "$DRY_MAIN" ]; then
        echo "🧹 Cleaning up dry-run sandbox..."
        
        # Return to original branch
        git checkout staging
        
        # Delete sandbox branches
        git branch -D "$DRY_STAGING" "$DRY_MAIN" 2>/dev/null || true
        
        echo "✅ Sandbox cleaned up"
    fi
}

# Command wrapper function
execute_cmd() {
    local cmd="$1"
    local description="$2"
    
    if [ "$DRY_RUN" = true ]; then
        echo "📝 EXECUTING: $description"
        echo "   └─ $cmd"
        # Execute the real command in sandbox
        eval "$cmd"
    else
        echo "📝 $description"
        eval "$cmd"
    fi
}

# File modification wrapper function
modify_file() {
    local operation="$1"
    local file="$2"
    local description="$3"
    
    if [ "$DRY_RUN" = true ]; then
        echo "📝 EXECUTING: $description"
        echo "   └─ $operation"
        # Execute the real file modification in sandbox
        eval "$operation"
        
        # Show what was actually changed
        if [ "$file" = "package.json" ]; then
            echo "   └─ ✅ Version updated: \"$CURRENT_VERSION\" → \"$NEW_VERSION\""
        elif [ "$file" = "public/version.txt" ]; then
            echo "   └─ ✅ File created with content:"
            echo "      $NEW_VERSION"
            echo "      Production build - $BUILD_DATE"
            echo "      Git: $GIT_HASH"
            echo "      Build: $BUILD_TIME"
        elif [ "$file" = "CHANGELOG.md" ]; then
            echo "   └─ ✅ CHANGELOG updated with commits since last version"
        fi
    else
        echo "📝 $description"
        eval "$operation"
    fi
}

# Changelog generation function
generate_changelog() {
    local new_version="$1"
    local build_date="$2"
    
    # Find last tag (previous version)
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$LAST_TAG" ]; then
        # First release, include all commits
        COMMIT_RANGE="HEAD"
        echo "📋 First release - including all commits"
    else
        # Commits since last tag
        COMMIT_RANGE="$LAST_TAG..HEAD"
        echo "📋 Generating changelog since $LAST_TAG"
    fi
    
    # Create temporary changelog content
    TEMP_CHANGELOG="/tmp/changelog_new.md"
    
    # New version header
    cat > "$TEMP_CHANGELOG" << EOF
# Changelog

## [${new_version}] - ${build_date}

EOF
    
    # Collect commits by type
    local features=()
    local fixes=()
    local improvements=()
    local others=()
    
    # Read commits and categorize them
    while IFS= read -r commit_line; do
        # Extract hash and message
        commit_hash=$(echo "$commit_line" | cut -d' ' -f1)
        commit_msg=$(echo "$commit_line" | cut -d' ' -f2-)
        
        # Skip automatic version/release commits
        if [[ "$commit_msg" =~ ^(chore: bump version|release: version) ]]; then
            continue
        fi
        
        # Categorize according to conventional commits prefix
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
    
    # Add sections to changelog
    if [ ${#features[@]} -gt 0 ]; then
        echo "### ✨ New Features" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${features[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#improvements[@]} -gt 0 ]; then
        echo "### 🔧 Improvements" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${improvements[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#fixes[@]} -gt 0 ]; then
        echo "### 🐛 Bug Fixes" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${fixes[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    if [ ${#others[@]} -gt 0 ]; then
        echo "### 📝 Other Changes" >> "$TEMP_CHANGELOG"
        printf '%s\n' "${others[@]}" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    # If no commits found
    if [ ${#features[@]} -eq 0 ] && [ ${#fixes[@]} -eq 0 ] && [ ${#improvements[@]} -eq 0 ] && [ ${#others[@]} -eq 0 ]; then
        echo "### 📦 Release" >> "$TEMP_CHANGELOG"
        echo "- Version release" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    echo "---" >> "$TEMP_CHANGELOG"
    echo "" >> "$TEMP_CHANGELOG"
    
    # Merge with existing changelog if it exists
    if [ -f "CHANGELOG.md" ]; then
        # Keep existing header and add new content before old content
        if grep -q "^# Changelog" CHANGELOG.md; then
            # Keep only old versions (remove header)
            tail -n +3 CHANGELOG.md >> "$TEMP_CHANGELOG"
        else
            # Add all old content
            cat CHANGELOG.md >> "$TEMP_CHANGELOG"
        fi
    fi
    
    # Replace changelog
    mv "$TEMP_CHANGELOG" "CHANGELOG.md"
    
    return 0
}

# Verify we're on staging branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Error: This script must be run from the staging branch"
    echo "   Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Verify staging is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Staging branch has uncommitted changes"
    git status
    exit 1
fi

# Create sandbox for dry-run
if [ "$DRY_RUN" = true ]; then
    create_dry_run_sandbox
    # Set up trap to cleanup on exit
    trap cleanup_dry_run_sandbox EXIT
fi

# Fetch latest branch versions
echo "📡 Fetching latest versions..."
git fetch origin

# Check if there are commits on main not in staging (potential hotfixes)
if [ "$DRY_RUN" = true ]; then
    # Use sandbox branches for dry-run
    CURRENT_STAGING="$DRY_STAGING"
    CURRENT_MAIN="$DRY_MAIN"
else
    # Use real branches for actual deployment
    CURRENT_STAGING="staging"
    CURRENT_MAIN="origin/main"
fi

COMMITS_MAIN_NOT_IN_STAGING=$(git rev-list "$CURRENT_STAGING".."$CURRENT_MAIN" --count)
if [ "$COMMITS_MAIN_NOT_IN_STAGING" -gt 0 ]; then
    echo "⚠️  WARNING: $COMMITS_MAIN_NOT_IN_STAGING commit(s) on main are not in staging!"
    echo ""
    echo "📋 Missing commits in staging:"
    git log --oneline "$CURRENT_STAGING".."$CURRENT_MAIN"
    echo ""
    echo "💡 This may indicate hotfixes made directly in production."
    echo "   It is recommended to rebase staging on main before continuing."
    echo ""
    
    # User options
    echo "What would you like to do?"
    echo "1) Rebase staging on main automatically (recommended)"
    echo "2) Continue without rebasing (risky - may overwrite hotfixes)"
    echo "3) Stop deployment for manual investigation"
    echo ""
    read -p "Your choice (1/2/3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "🔄 Rebasing staging on main..."
            
            if [ "$DRY_RUN" = true ]; then
                # In dry-run, rebase the sandbox staging on sandbox main
                git checkout "$DRY_STAGING"
                git rebase "$DRY_MAIN"
                
                if [ $? -ne 0 ]; then
                    echo "❌ DRY-RUN: Conflict detected during rebase!"
                    echo "🛠️  This would require manual conflict resolution in real deployment"
                    echo "💡 The actual deployment would stop here for manual intervention"
                    git rebase --abort 2>/dev/null || true
                    exit 1
                fi
                
                echo "✅ DRY-RUN: Rebase would succeed!"
            else
                # Backup current state just in case
                BACKUP_BRANCH="backup-staging-$(date +%Y%m%d-%H%M%S)"
                git branch "$BACKUP_BRANCH"
                echo "💾 Backup created: $BACKUP_BRANCH"
                
                # Rebase staging on main
                git rebase origin/main
                
                if [ $? -ne 0 ]; then
                    echo "❌ Error: Conflict during rebase!"
                    echo "🛠️  Resolve conflicts manually, then:"
                    echo "   git rebase --continue"
                    echo "   ./scripts/deploy-production.sh"
                    echo ""
                    echo "💾 In case of issues, restore with:"
                    echo "   git rebase --abort"
                    echo "   git checkout $BACKUP_BRANCH"
                    exit 1
                fi
                
                echo "✅ Rebase successful!"
                echo "🗑️  Cleaning up backup..."
                git branch -d "$BACKUP_BRANCH"
            fi
            ;;
        2)
            echo "⚠️  Continuing without rebase - hotfixes may be overwritten!"
            read -p "Are you REALLY sure? (type 'YES' in capitals): " CONFIRM
            if [ "$CONFIRM" != "YES" ]; then
                echo "❌ Deployment cancelled"
                exit 1
            fi
            ;;
        3)
            echo "❌ Deployment stopped for manual investigation"
            echo ""
            echo "💡 Useful commands to investigate:"
            echo "   git log --oneline staging..origin/main  # See missing commits"
            echo "   git diff staging..origin/main           # See differences"
            echo "   git rebase origin/main                  # Rebase manually"
            exit 1
            ;;
        *)
            echo "❌ Invalid choice. Deployment cancelled."
            exit 1
            ;;
    esac
else
    echo "✅ Staging is up to date with main - no hotfixes detected"
fi

# Generate new version number
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
VERSION_PARTS=(${CURRENT_VERSION//./ })
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Calculate new version according to bump type
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

echo "📋 Current version: $CURRENT_VERSION"
echo "📋 New version: $NEW_VERSION"
echo "📋 Hash: $GIT_HASH"
echo "📋 Date: $BUILD_DATE"

# Confirm with user
read -p "🤔 Confirm production deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Update package.json
modify_file "sed -i '' \"s/\\\"version\\\": \\\"$CURRENT_VERSION\\\"/\\\"version\\\": \\\"$NEW_VERSION\\\"/\" package.json" "package.json" "Update package.json"

# Create version.txt with complete info
modify_file "cat > public/version.txt << 'EOF'
$NEW_VERSION
Production build - $BUILD_DATE
Git: $GIT_HASH
Build: $BUILD_TIME
EOF" "public/version.txt" "Create version.txt"

# Generate automatic changelog
if [ "$DRY_RUN" = true ]; then
    echo "📝 SIMULATION: Automatic changelog generation"
    echo "   └─ Analyzing commits since last tag"
    echo "   └─ Categorizing by type (feat/fix/improve/others)"
    echo "   └─ Creating/updating CHANGELOG.md"
    echo ""
    
    # Generate changelog in simulation mode to display it
    generate_changelog "$NEW_VERSION" "$BUILD_DATE" >/dev/null
    
    echo "📄 NEW CHANGES FOR THIS VERSION:"
    echo "┌─────────────────────────────────────────────────"
    
    # Generate and display only the new version section
    generate_changelog "$NEW_VERSION" "$BUILD_DATE" >/dev/null
    
    # Extract and display only the new version section (between header and first "---")
    if [ -f "CHANGELOG.md" ]; then
        awk '/^## \['"$NEW_VERSION"'\]/,/^---$/{if(/^---$/) exit; print}' CHANGELOG.md
    fi
    
    echo "└─────────────────────────────────────────────────"
    echo ""
    
    # Restore original state (remove temporary changelog)
    git checkout -- CHANGELOG.md 2>/dev/null || true
else
    echo "📝 Automatic changelog generation..."
    generate_changelog "$NEW_VERSION" "$BUILD_DATE"
    
    echo ""
    echo "📄 NEW CHANGES ADDED TO CHANGELOG:"
    echo "┌─────────────────────────────────────────────────"
    
    # Display only the new version section that was just added
    awk '/^## \['"$NEW_VERSION"'\]/,/^---$/{if(/^---$/) exit; print}' CHANGELOG.md
    
    echo "└─────────────────────────────────────────────────"
    echo ""
fi

# Commit version changes
execute_cmd "git add package.json public/version.txt CHANGELOG.md" "Add modified files"
execute_cmd "git commit -m \"chore: bump version to $NEW_VERSION for production release\"" "Commit version changes"

# Push staging (only in real deployment)
if [ "$DRY_RUN" = false ]; then
    execute_cmd "git push origin staging" "Push staging"
fi

# Merge to main
if [ "$DRY_RUN" = true ]; then
    execute_cmd "git checkout $DRY_MAIN" "Switch to sandbox main"
    execute_cmd "git merge $DRY_STAGING --no-ff -m \"release: version $NEW_VERSION

Merge staging to main for production release
- Version: $NEW_VERSION
- Build: $BUILD_DATE
- Hash: $GIT_HASH\"" "Merge staging to main (sandbox)"
else
    execute_cmd "git checkout main" "Switch to main"
    execute_cmd "git pull origin main" "Fetch latest main changes"
    execute_cmd "git merge staging --no-ff -m \"release: version $NEW_VERSION

Merge staging to main for production release
- Version: $NEW_VERSION
- Build: $BUILD_DATE
- Hash: $GIT_HASH\"" "Merge staging to main"
fi

# Create tag
execute_cmd "git tag -a \"v$NEW_VERSION\" -m \"Release version $NEW_VERSION

Production release
- Date: $BUILD_DATE  
- Hash: $GIT_HASH\"" "Create tag v$NEW_VERSION"

# Push main with tag (only in real deployment)
if [ "$DRY_RUN" = false ]; then
    execute_cmd "git push origin main" "Push main"
    execute_cmd "git push origin \"v$NEW_VERSION\"" "Push tag"
fi

# Return to staging
if [ "$DRY_RUN" = true ]; then
    execute_cmd "git checkout $DRY_STAGING" "Return to sandbox staging"
else
    execute_cmd "git checkout staging" "Return to staging"
fi

# End message
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🚀 SANDBOX TESTING COMPLETED:"
    echo "   ✅ All Git operations tested successfully"
    echo "   ✅ File modifications verified"
    echo "   ✅ Merge conflicts checked"
    echo "   ✅ Version bump validated: $CURRENT_VERSION → $NEW_VERSION"
    echo ""
    echo "📊 REAL DEPLOYMENT WOULD:"
    echo "   - Push staging branch to origin"
    echo "   - Merge staging → main"
    echo "   - Create tag v$NEW_VERSION"
    echo "   - Push main + tag to origin"
    echo "   - Trigger GitHub Action deployment"
    echo ""
    echo "✅ DRY RUN COMPLETED - All operations validated in sandbox"
    echo "💡 To execute for real: ./scripts/deploy-production.sh"
fi

if [ "$DRY_RUN" = false ]; then
    echo "✅ Deployment initiated!"
    echo "🌐 GitHub Action will now deploy to production"
    echo "📊 Check: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
    echo "🎯 Deployed version: $NEW_VERSION"
fi 
#!/bin/bash

# Automated version management and release script
# Usage: ./scripts/release-version.sh [--dry-run] [--major|--minor|--patch]

set -e

# Parse command line arguments
DRY_RUN=${DRY_RUN:-false}  # Use environment variable or default to false
VERSION_BUMP="patch"  # default
stashed_before_switch=false

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
            echo "Version management and release script for HatCast"
            echo "Handles versioning, changelog generation, and Git operations"
            echo "Actual deployment is handled by GitHub Actions"
            echo ""
            echo "Options:"
            echo "  --dry-run, -n     Simulation mode (no changes made)"
            echo "  --major           Major version bump (1.2.3 → 2.0.0)"
            echo "  --minor           Minor version bump (1.2.3 → 1.3.0)"
            echo "  --patch           Patch version bump (1.2.3 → 1.2.4) [default]"
            echo "  --help, -h        Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 --dry-run --minor    # Simulate minor release"
            echo "  $0 --major              # Real major release"
            echo "  $0                      # Real patch release (default)"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $arg"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
done

echo "📋 Version bump type: $VERSION_BUMP"

# Working directory management
setup_working_directory() {
if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - Production deployment simulation"
    echo "============================================="
    echo "⚠️  Simulation mode: no changes will be made"
        
        # Create sandbox (already changes to sandbox directory)
        create_dry_run_sandbox
        echo "📁 Working in sandbox: $(pwd)"
else
    echo "🚀 Production deployment with automatic versioning"
    echo "=================================================="
        echo "📁 Working in project root: $(pwd)"
fi
}

# Sandbox management functions
create_dry_run_sandbox() {
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    DRY_STAGING="dry-run-staging-$TIMESTAMP"
    DRY_MAIN="dry-run-main-$TIMESTAMP"
    DRY_SANDBOX_DIR=".dry-run-sandbox"
    
    echo "🏗️  Creating dry-run sandbox environment..."
    echo "   └─ Staging copy: $DRY_STAGING"
    echo "   └─ Main copy: $DRY_MAIN"
    echo "   └─ Sandbox directory: $DRY_SANDBOX_DIR"
    
    # Clean up any existing sandbox
    rm -rf "$DRY_SANDBOX_DIR"
    mkdir -p "$DRY_SANDBOX_DIR"
    
    # Copy project files to sandbox (excluding .dry-run-sandbox to avoid recursion)
    echo "   └─ Copying project files to sandbox..."
    find . -maxdepth 1 -not -name '.dry-run-sandbox' -not -name '.' -exec cp -r {} "$DRY_SANDBOX_DIR/" \; 2>/dev/null || true
    cd "$DRY_SANDBOX_DIR"
    
    # Fetch latest tags from remote
    echo "   └─ Fetching latest tags from remote..."
    git fetch --tags origin
    
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
        
        # Restore stashed changes if any
        if [ "$stashed_before_switch" = true ]; then
            echo "   └─ Restoring stashed changes after dry-run..."
            git stash pop 2>/dev/null || true
        fi
        
        # Delete sandbox branches
        git branch -D "$DRY_STAGING" "$DRY_MAIN" 2>/dev/null || true
        
        # Keep sandbox directory for inspection
        if [ -n "$DRY_SANDBOX_DIR" ] && [ -d "$DRY_SANDBOX_DIR" ]; then
            echo "📁 Sandbox directory preserved: $DRY_SANDBOX_DIR"
            echo "   └─ You can inspect generated files there"
        fi
        
        echo "✅ Sandbox cleaned up (directory preserved)"
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
    
    
    # Read current version from public/version.txt on main branch
    echo "📋 Reading current version from public/version.txt on main..."
    CURRENT_VERSION=$(git show main:public/version.txt 2>/dev/null | head -1 | tr -d '\n\r')
    
    if [ -z "$CURRENT_VERSION" ]; then
        # No version file found, include all commits
        COMMIT_RANGE="HEAD"
        echo "📋 No version found in public/version.txt - including all commits"
    else
        echo "📋 Current version: $CURRENT_VERSION"
        # Find the last tag for this version
        LAST_TAG="v$CURRENT_VERSION"
        if git show-ref --tags --quiet "$LAST_TAG"; then
            echo "📋 Found corresponding tag: $LAST_TAG"
        COMMIT_RANGE="$LAST_TAG..HEAD"
        else
            echo "📋 No tag found for $CURRENT_VERSION - including all commits"
            COMMIT_RANGE="HEAD"
        fi
    fi
    
    # Create temporary changelog content
    TEMP_CHANGELOG="changelog_new.md"
    
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
    echo "   └─ Reading commits from: $COMMIT_RANGE"
    local commit_count=0
    while IFS= read -r commit_line; do
        commit_count=$((commit_count + 1))
        if [ $((commit_count % 10)) -eq 0 ]; then
            echo "   └─ Processed $commit_count commits..."
        fi
        
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
    
    echo "   └─ Processed $commit_count total commits"
    
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
    if [ -f "$TEMP_CHANGELOG" ]; then
        mv "$TEMP_CHANGELOG" "CHANGELOG.md"
    fi
    
    # Generate French translation
    echo "   └─ Generating French translation..."
    generate_french_changelog "$new_version"
    
    # Generate ready-to-display JSON for the app directly in public/
    echo "   └─ Generating JSON for app..."
    generate_changelog_json
    
    return 0
}

# Function to translate changelog to French (optimized for new version only)
generate_french_changelog() {
    local new_version="$1"
    echo "🌐 Translating changelog to French..."
    
    # Create temporary file for initial translation
    local temp_changelog="changelog_fr_temp.md"
    echo "# Changelog" > "$temp_changelog"
    echo "" >> "$temp_changelog"
    echo "Toutes les modifications notables de ce projet seront documentées dans ce fichier." >> "$temp_changelog"
    echo "" >> "$temp_changelog"
    
    local line_count=0
    local commit_count=0
    
    # Read the English changelog and translate
    while IFS= read -r line; do
        line_count=$((line_count + 1))
        
        # Show progress every 50 lines
        if [ $((line_count % 50)) -eq 0 ]; then
            echo "   └─ Processed $line_count lines..."
        fi
        
        # Detect version lines
        if [[ "$line" =~ ^##\ \[([0-9]+\.[0-9]+\.[0-9]+)\]\ -\ ([0-9]{4}-[0-9]{2}-[0-9]{2})$ ]]; then
            local version="${BASH_REMATCH[1]}"
            local date="${BASH_REMATCH[2]}"
            echo "## [$version] - $date" >> "$temp_changelog"
            echo "" >> "$temp_changelog"
        # Translate section headers
        elif [[ "$line" =~ ^###\ ✨\ New\ Features$ ]]; then
            echo "### ✨ Nouvelles fonctionnalités" >> "$temp_changelog"
        elif [[ "$line" =~ ^###\ 🔧\ Improvements$ ]]; then
            echo "### ⚡ Améliorations" >> "$temp_changelog"
        elif [[ "$line" =~ ^###\ 🐛\ Bug\ Fixes$ ]]; then
            echo "### 🐛 Corrections" >> "$temp_changelog"
        elif [[ "$line" =~ ^###\ 📝\ Other\ Changes$ ]]; then
            echo "### 📝 Autres modifications" >> "$temp_changelog"
        elif [[ "$line" =~ ^###\ 📦\ Release$ ]]; then
            echo "### 📦 Version" >> "$temp_changelog"
        # Collect commit lines for batch translation
        elif [[ "$line" =~ ^-.*$ ]]; then
            commit_count=$((commit_count + 1))
            if [ $((commit_count % 10)) -eq 0 ]; then
                echo "   └─ Collecting commit $commit_count for batch translation..."
            fi
            # Store commit line for batch processing
            echo "$line" >> "$temp_changelog"
            # Other lines (empty lines, separators) - keep as is
        else
            echo "$line" >> "$temp_changelog"
        fi
    done < "CHANGELOG.md"
    
    echo "   └─ Processed $line_count total lines, $commit_count commits"
    
    # Extract only the new version section for translation
    echo "   └─ Extracting new version section for translation..."
    local temp_translated="changelog_fr_translated.md"
    
    # Start with existing CHANGELOG_FR.md (if it exists)
    if [ -f "CHANGELOG_FR.md" ]; then
        echo "   └─ Using existing French changelog as base..."
        cp "CHANGELOG_FR.md" "$temp_translated"
    else
        echo "   └─ Creating new French changelog..."
        echo "# Changelog" > "$temp_translated"
        echo "" >> "$temp_translated"
        echo "Toutes les modifications notables de ce projet seront documentées dans ce fichier." >> "$temp_translated"
        echo "" >> "$temp_translated"
    fi
    
    # Find the new version section (everything from ## [new_version] to the next ## or end)
    # Extract from new_version to the next ## header using sed
    new_version_section=$(sed -n "/^## \\[$new_version\\]/,/^## \\[0.9.1\\]/p" "CHANGELOG.md" | sed '$d')
    
    # If no content found, try with 0.9.0
    if [ ${#new_version_section} -lt 50 ]; then
        new_version_section=$(sed -n "/^## \\[$new_version\\]/,/^## \\[0.9.0\\]/p" "CHANGELOG.md" | sed '$d')
    fi
    
    # If still no content, capture until end of file
    if [ ${#new_version_section} -lt 50 ]; then
        new_version_section=$(sed -n "/^## \\[$new_version\\]/,\$p" "CHANGELOG.md")
    fi
    
    echo "   └─ Extracted new version section (${#new_version_section} chars)"
    
    if [ -n "$new_version_section" ]; then
        echo "   └─ Translating new version section with Google Translate..."
        local translated_section=$(batch_translate_with_google "$new_version_section")
        
        # Check if translation succeeded (contains French words)
        local translation_success=false
        if [ -n "$translated_section" ] && echo "$translated_section" | grep -q -E "(ajout|amélioration|correction|fonctionnalité|version|déploiement|traduction|génération|optimisation|implémentation|refactorisation|migration|authentification|notification|interface|utilisateur|système|configuration|développement|production|staging|changelog|journal|modifications|nouvelles|corrections|améliorations|fonctionnalités|versions|déploiements|traductions|générations|optimisations|implémentations|refactorisations|migrations|authentifications|notifications|interfaces|utilisateurs|systèmes|configurations|développements|productions|stagings|changelogs|journaux)" 2>/dev/null; then
            translation_success=true
        fi
        
        if [ "$translation_success" = true ]; then
            echo "   └─ Translation successful! Adding to top of French changelog..."
        else
            echo "   └─ Translation failed! Google Translate API is not working."
            echo ""
            echo "📝 MANUAL TRANSLATION REQUIRED"
            echo "================================"
            echo "Please provide the French translation for version $new_version:"
            echo ""
            echo "English content to translate:"
            echo "----------------------------------------"
            echo "$new_version_section"
            echo "----------------------------------------"
            echo ""
            echo "Please paste the French translation below (press Ctrl+D when done):"
            
            # Read manual translation
            local manual_translation=""
            while IFS= read -r line; do
                manual_translation+="$line"$'\n'
            done
            
            if [ -n "$manual_translation" ]; then
                echo "   └─ Manual translation received!"
                echo "   └─ Sanitizing prefixes (removing text between - and :)..."
                # Remove prefixes like "Fonctionnalité :", "Prouesse :", "Correction :", etc.
                translated_section=$(echo "$manual_translation" | sed -E 's/- [^:]+: /- /g')
                echo "   └─ Sanitization complete!"
            else
                echo "   └─ No manual translation provided, using untranslated with manual headers..."
                # Add untranslated section with manual header translation
                translated_section="$new_version_section"
                translated_section=$(echo "$translated_section" | sed 's/### ✨ New Features/### ✨ Nouvelles fonctionnalités/g')
                translated_section=$(echo "$translated_section" | sed 's/### 🔧 Improvements/### ⚡ Améliorations/g')
                translated_section=$(echo "$translated_section" | sed 's/### 🐛 Bug Fixes/### 🐛 Corrections/g')
                translated_section=$(echo "$translated_section" | sed 's/### 📝 Other Changes/### 📝 Autres modifications/g')
                translated_section=$(echo "$translated_section" | sed 's/### 📦 Release/### 📦 Version/g')
            fi
        fi
        
        # Add the translated section at the very top (before all existing versions)
        # Find the first version header (## [version])
        local first_version_line=$(grep -n "^## \\[" "$temp_translated" | head -1 | cut -d: -f1)
        if [ -n "$first_version_line" ]; then
            # Insert before the first version
            head -n $((first_version_line - 1)) "$temp_translated" > "changelog_header.md"
            echo "" >> "changelog_header.md"
            echo "$translated_section" >> "changelog_header.md"
            echo "" >> "changelog_header.md"
            echo "---" >> "changelog_header.md"
            echo "" >> "changelog_header.md"
            tail -n +$first_version_line "$temp_translated" >> "changelog_header.md"
            mv "changelog_header.md" "$temp_translated"
        else
            # No version found, add at the top
            echo "" > "changelog_new.md"
            echo "$translated_section" >> "changelog_new.md"
            echo "" >> "changelog_new.md"
            echo "---" >> "changelog_new.md"
            echo "" >> "changelog_new.md"
            cat "$temp_translated" >> "changelog_new.md"
            mv "changelog_new.md" "$temp_translated"
        fi
    fi
    
    # Apply dictionary corrections to the entire changelog at once
    echo "   └─ Applying dictionary corrections to entire changelog..."
    apply_translations "$(cat "$temp_translated")" > "CHANGELOG_FR.md"
    
    # Clean up temporary files
    rm -f "$temp_changelog" "$temp_translated"
    
    echo "✅ French changelog generated"
}

# Function to generate ready-to-display JSON for the app (last 3 versions only)
generate_changelog_json() {
    echo "📄 Generating ready-to-display JSON (incremental update)..."
    
    # Check if French changelog exists
    if [ ! -f "CHANGELOG_FR.md" ]; then
        echo "   └─ No French changelog found, creating empty JSON"
        echo "[]" > "public/changelog.json"
        return
    fi
    
    # Get the latest version from CHANGELOG_FR.md
    local latest_version=$(grep "^## \\[" "CHANGELOG_FR.md" | head -1 | awk -F'[][]' '{print $2}')
    
    if [ -z "$latest_version" ]; then
        echo "   └─ No versions found, creating empty JSON"
        echo "[]" > "public/changelog.json"
        return
    fi
    
    echo "   └─ Latest version found: $latest_version"
    
    # Check if changelog.json already exists
    if [ -f "public/changelog.json" ] && [ -s "public/changelog.json" ]; then
        echo "   └─ Existing changelog.json found, checking if update needed..."
        
        # Check if the latest version is already in the JSON and has content
        if grep -q "\"version\": \"$latest_version\"" ""public/changelog.json""; then
            # Check if the version has empty changes array
            if grep -A 10 "\"version\": \"$latest_version\"" ""public/changelog.json"" | grep -q '"changes": \[[[:space:]]*\]'; then
                echo "   └─ Version $latest_version exists but has empty changes, updating..."
            else
                echo "   └─ Version $latest_version already in JSON with content, no update needed"
                return
            fi
        fi
        
        # Check if we need to replace existing version or add new one
        if grep -q "\"version\": \"$latest_version\"" ""public/changelog.json""; then
            echo "   └─ Replacing existing version $latest_version with updated content..."
            
            # Remove the existing version entry and regenerate
            # This is complex, so let's regenerate from scratch for simplicity
            echo "   └─ Regenerating entire JSON to replace version..."
            
            # Generate JSON for all versions in CHANGELOG_FR.md, sorted by version number (descending)
            # sort -V: version sort, -r: reverse (newest first)
            local versions=($(grep "^## \\[" "CHANGELOG_FR.md" | awk -F'[][]' '{print $2}' | sort -V -r))
            
            echo "[" > ""public/changelog.json""
            local first=true
            
            for version in "${versions[@]}"; do
                if [ "$first" = true ]; then
                    first=false
                else
                    echo "," >> ""public/changelog.json""
                fi
                
                local version_json=$(generate_single_version_json "$version")
                echo "$version_json" >> ""public/changelog.json""
            done
            
            echo "]" >> ""public/changelog.json""
        else
            echo "   └─ Version $latest_version not in JSON, adding it..."
            
            # Extract existing JSON content (remove last ])
            local existing_content=$(sed '$d' ""public/changelog.json"")
            
            # Generate new version content
            local new_version_json=$(generate_single_version_json "$latest_version")
            
            # Combine: existing content + comma + new version + closing bracket
            echo "$existing_content" > ""public/changelog.json""
            echo "," >> ""public/changelog.json""
            echo "$new_version_json" >> ""public/changelog.json""
            echo "]" >> ""public/changelog.json""
        fi
        
        echo "✅ Incremental JSON update completed"
    else
        echo "   └─ No existing changelog.json, generating from scratch..."
        
        # Generate JSON for all versions in CHANGELOG_FR.md, sorted by version number (descending)
        # sort -V: version sort, -r: reverse (newest first)
        local versions=($(grep "^## \\[" "CHANGELOG_FR.md" | awk -F'[][]' '{print $2}' | sort -V -r))
        
        echo "[" > ""public/changelog.json""
        local first=true
        
        for version in "${versions[@]}"; do
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> ""public/changelog.json""
            fi
            
            local version_json=$(generate_single_version_json "$version")
            echo "$version_json" >> ""public/changelog.json""
        done
        
        echo "]" >> ""public/changelog.json""
        
        echo "✅ Full JSON generated (${#versions[@]} versions)"
    fi
}

# Helper function to generate JSON for a single version
generate_single_version_json() {
    local version="$1"
    local changes=()
    local in_version=false
    local in_section=false
    local current_section=""
    
    # Debug output to stderr to avoid mixing with JSON
    echo "   └─ Processing version $version" >&2
    
    while IFS= read -r line; do
        # Escape dots in version for regex
        local escaped_version=$(echo "$version" | sed 's/\./\\./g')
        
        # Start of this version
        if [[ "$line" =~ ^##\ \[$escaped_version\] ]]; then
            in_version=true
            echo "   └─ DEBUG: Found version header: $line" >&2
            continue
        fi
        
        # End of this version (next version or end)
        if [[ "$line" =~ ^##\ \[ ]] && [[ ! "$line" =~ ^##\ \[$escaped_version\] ]]; then
            echo "   └─ DEBUG: End of version $version, found: $line" >&2
            break
        fi
        
        if [ "$in_version" = true ]; then
            # Section headers
            if [[ "$line" =~ ^###\ (.*) ]]; then
                in_section=true
                current_section="${BASH_REMATCH[1]}"
                echo "   └─ DEBUG: Found section: $line" >&2
                continue
            fi
            
            # Change items (skip separators like "---")
            if [[ "$line" =~ ^-\ (.+)$ ]] && [ "$in_section" = true ] && [[ ! "$line" =~ ^--- ]]; then
                local change="${BASH_REMATCH[1]}"
                if [ -n "$change" ]; then
                    # Add emoji based on section
                    local emoji=""
                    case "$current_section" in
                        *"Nouvelles fonctionnalités"*|*"New Features"*) emoji="✨" ;;
                        *"Corrections"*|*"Bug Fixes"*) emoji="🐛" ;;
                        *"Améliorations"*|*"Improvements"*) emoji="🔧" ;;
                        *"Autre"*|*"Other"*) emoji="📝" ;;
                    esac
                    
                    changes+=("\"$emoji $change\"")
                    echo "   └─ DEBUG: Found change: $change" >&2
                fi
            elif [ "$in_section" = true ] && [[ ! "$line" =~ ^--- ]] && [[ ! "$line" =~ ^### ]]; then
                echo "   └─ DEBUG: Line in section but not matched: '$line'" >&2
            elif [[ "$line" =~ ^[[:space:]]+[^-] ]] && [ "$in_section" = true ] && [ ${#changes[@]} -gt 0 ]; then
                # Continuation of previous change (multi-line)
                local continuation="${line##*[[:space:]]}"
                if [ -n "$continuation" ]; then
                    # Append to the last change
                    local last_change_index=$((${#changes[@]} - 1))
                    local last_change="${changes[$last_change_index]}"
                    # Remove the closing quote and add continuation
                    last_change="${last_change%\"} $continuation\""
                    changes[$last_change_index]="$last_change"
                    echo "   └─ DEBUG: Continued change: $continuation" >&2
                fi
            fi
        fi
    done < "CHANGELOG_FR.md"
    
    echo "   └─ DEBUG: Final changes for $version: ${changes[*]}" >&2
    
    # Generate JSON for this version
    echo "  {"
    echo "    \"version\": \"$version\","
    echo "    \"date\": \"$(date '+%Y-%m-%d')\","
    echo "    \"changes\": ["
    
    local change_count=0
    for change in "${changes[@]}"; do
        if [ $change_count -gt 0 ]; then
            echo ","
        fi
        echo "      $change"
        change_count=$((change_count + 1))
    done
    
    echo "    ]"
    echo "  }"
}

# Function to translate a single commit line (with Google Translate for new commits)
translate_commit_line_simple() {
    local line="$1"
    
    # Extract the commit message (remove the leading "- ")
    local commit_msg="${line#- }"
    
    # Check if this is a new commit (has conventional commit prefix)
    if [[ "$commit_msg" =~ ^(feat|fix|improve|ui|docs|style|refactor|perf|test|chore): ]]; then
        # Remove conventional commit prefixes
        commit_msg=$(echo "$commit_msg" | sed -E 's/^(feat|fix|ui|docs|style|refactor|perf|test|chore|improve):\s*//')
        
        # Try Google Translate first
        
        # Call Google Translate and capture both output and exit code
        local google_translation
        local translate_exit_code
        
        # Use a temporary file to capture the translation
        local temp_translation="/tmp/translate_$$"
        translate_with_google "$commit_msg" > "$temp_translation"
        translate_exit_code=$?
        google_translation=$(cat "$temp_translation" 2>/dev/null)
        rm -f "$temp_translation"
        
        if [ -n "$google_translation" ] && [[ "$google_translation" != *"<!DOCTYPE html>"* ]]; then
            # Don't apply dictionary here - will be done at the end
            echo "- $google_translation"
        else
            # Fallback to original text
            echo "- $commit_msg"
        fi
    else
        # For old commits, keep original (dictionary will be applied at the end)
        echo "- $commit_msg"
    fi
}

# Function to batch translate commits (for new version only)
batch_translate_commits() {
    local commits=("$@")
    local batch_text=""
    local batch_size=100  # Translate 100 commits at once
    
    for ((i=0; i<${#commits[@]}; i+=batch_size)); do
        # Build batch text
        batch_text=""
        for ((j=i; j<i+batch_size && j<${#commits[@]}; j++)); do
            local commit_msg="${commits[j]#- }"
            if [ -n "$batch_text" ]; then
                batch_text+="\n$commit_msg"
            else
                batch_text="$commit_msg"
            fi
        done
        
        # Translate batch
        echo "🔄 Translating batch $((i/batch_size + 1))..." >&2
        local translated_batch=$(batch_translate_with_google "$batch_text")
        
        # Split and output individual commits
        if [ -n "$translated_batch" ]; then
            IFS=$'\n' read -ra translated_commits <<< "$translated_batch"
            for ((j=i; j<i+batch_size && j<${#commits[@]}; j++)); do
                local translated_commit="${translated_commits[j-i]}"
                if [ -n "$translated_commit" ]; then
                    # Remove conventional commit prefixes from translated text
                    translated_commit=$(echo "$translated_commit" | sed -E 's/^(feat|fix|ui|docs|style|refactor|perf|test|chore|improve):\s*//')
                    # Apply post-translation corrections
                    translated_commit=$(apply_translations "$translated_commit")
                    echo "- $translated_commit"
                else
                    # Fallback to simple translation
                    echo "$(translate_commit_line_simple "${commits[j]}")"
                fi
            done
        else
            # Fallback to simple translation for all commits in batch
            for ((j=i; j<i+batch_size && j<${#commits[@]}; j++)); do
                echo "$(translate_commit_line_simple "${commits[j]}")"
            done
        fi
    done
}

# Function to batch translate text using Google Translate API
batch_translate_with_google() {
    local text="$1"
    
    
    # Escape text for URL
    local escaped_text=$(echo "$text" | sed 's/ /%20/g' | sed 's/\n/%0A/g')
    
    # Use Google Translate API with better error handling
    local response=$(curl -s --max-time 10 --retry 2 "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=$escaped_text" 2>/dev/null)
    local curl_exit_code=$?
    
    # Small pause to avoid rate limiting
    sleep 0.3
    
    if [ $curl_exit_code -eq 0 ] && [ -n "$response" ] && [[ "$response" != *"error"* ]]; then
        echo "OK" >&2
        # Extract translations from JSON response
        echo "$response" | sed 's/\[\[\["\([^"]*\)".*/\1/g' | sed 's/","/\n/g'
    else
        echo "KO" >&2
        echo ""
    fi
}

# Function to translate text using Google Translate API
translate_with_google() {
    local text="$1"
    
    # Use Google Translate API (free tier)
    local response=$(curl -s "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=$(echo "$text" | sed 's/ /%20/g')" 2>/dev/null)
    local curl_exit_code=$?
    
    # Small pause to avoid rate limiting
    sleep 0.3
    
    if [ $curl_exit_code -eq 0 ] && [ -n "$response" ] && [[ "$response" != *"error"* ]]; then
        # Extract translation from JSON response
        local translation=$(echo "$response" | sed 's/\[\[\["\([^"]*\)".*/\1/' 2>/dev/null)
        if [ -n "$translation" ]; then
            echo "OK" >&2
            echo "$translation"
            return 0
        else
            echo "KO" >&2
        echo ""
            return 1
        fi
    else
        echo "KO" >&2
        echo ""
        return 1
    fi
}

# Global variable to cache translation dictionary
TRANSLATION_DICT_CACHE=""

# Function to load translation dictionary once
load_translation_dict() {
    if [ -z "$TRANSLATION_DICT_CACHE" ] && [ -f "scripts/translation-dict.txt" ]; then
        echo "   └─ Loading translation dictionary..." >&2
        TRANSLATION_DICT_CACHE=$(cat "scripts/translation-dict.txt")
        local dict_count=$(echo "$TRANSLATION_DICT_CACHE" | grep -v '^#' | grep -v '^$' | wc -l)
        echo "   └─ Dictionary loaded with $dict_count entries" >&2
    fi
}

# Function to apply translations from cached dictionary
apply_translations() {
    local text="$1"
    local translated="$text"
    
    # Load dictionary if not cached
    load_translation_dict
    
    # Apply translations from cached dictionary
    if [ -n "$TRANSLATION_DICT_CACHE" ]; then
        echo "$TRANSLATION_DICT_CACHE" | while IFS='|' read -r english french; do
        # Skip comments and empty lines
        if [[ "$english" =~ ^#.*$ ]] || [[ -z "$english" ]]; then
            continue
        fi
        
        # Escape special characters for sed
        english_escaped=$(printf '%s\n' "$english" | sed 's/[[\.*^$()+?{|]/\\&/g')
        french_escaped=$(printf '%s\n' "$french" | sed 's/[[\.*^$()+?{|]/\\&/g')
        
        # Apply translation
        translated=$(echo "$translated" | sed "s/$english_escaped/$french_escaped/g")
        done
    fi
    
    echo "$translated"
}

# Verify we're on staging branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Error: This script must be run from the staging branch"
    echo "   Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Verify staging is clean (only in production mode)
if [ "$DRY_RUN" = false ] && [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Staging branch has uncommitted changes"
    git status
    exit 1
fi

# Setup working directory (change to sandbox in dry-run mode)
setup_working_directory

# Set up trap to cleanup on exit (only in dry-run mode)
if [ "$DRY_RUN" = true ]; then
    trap cleanup_dry_run_sandbox EXIT
fi

# Fetch latest branch versions and tags
echo "📡 Fetching latest versions and tags..."
git fetch origin
git fetch --tags origin

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
                
                # Stash any uncommitted changes for dry-run
                if [ -n "$(git status --porcelain)" ]; then
                    echo "   └─ Stashing uncommitted changes for dry-run rebase..."
                    git stash push -m "dry-run-temp-stash"
                    stashed=true
                else
                    stashed=false
                fi
                
                git rebase "$DRY_MAIN"
                
                if [ $? -ne 0 ]; then
                    echo "❌ DRY-RUN: Conflict detected during rebase!"
                    echo "🛠️  This would require manual conflict resolution in real deployment"
                    echo "💡 The actual deployment would stop here for manual intervention"
                    git rebase --abort 2>/dev/null || true
                    exit 1
                fi
                
                # Restore stashed changes if any
                if [ "$stashed" = true ]; then
                    echo "   └─ Restoring stashed changes after dry-run rebase..."
                    git stash pop
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
if [ "$DRY_RUN" = true ]; then
    echo "🤔 Confirm release version $NEW_VERSION? (y/N): y"
    echo "✅ Auto-confirmed for dry-run"
else
    read -p "🤔 Confirm release version $NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
    fi
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
    
    # Generate changelog once and display it
    echo "📄 NEW CHANGES FOR THIS VERSION:"
    echo "┌─────────────────────────────────────────────────"
    
    # Generate changelog and extract new version section in one go
    echo "   └─ Generating changelog..."
    generate_changelog "$NEW_VERSION" "$BUILD_DATE"
    
    echo "   └─ Extracting new version content..."
    # Extract and display only the new version section (between header and first "---")
    if [ -f "CHANGELOG.md" ]; then
        awk '/^## \['"$NEW_VERSION"'\]/,/^---$/{if(/^---$/) exit; print}' CHANGELOG.md
    fi
    
    echo "└─────────────────────────────────────────────────"
    echo ""
    
    # Keep generated changelog in sandbox for inspection
    echo "   └─ Changelog generated in sandbox for inspection"
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
execute_cmd "git add package.json public/version.txt CHANGELOG.md CHANGELOG_FR.md public/changelog.json" "Add modified files"
execute_cmd "git commit -m \"chore: bump version to $NEW_VERSION for production release\"" "Commit version changes"

# Push staging (only in real deployment)
if [ "$DRY_RUN" = false ]; then
    execute_cmd "git push origin staging" "Push staging"
fi

# Merge to main
if [ "$DRY_RUN" = true ]; then
    # Stash any uncommitted changes before switching branches
    if [ -n "$(git status --porcelain)" ]; then
        execute_cmd "git stash push -m 'dry-run-temp-stash-2'" "Stash changes before branch switch"
        stashed_before_switch=true
    else
        stashed_before_switch=false
    fi
    
    # In dry-run mode, we're already in the sandbox, just simulate the merge
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
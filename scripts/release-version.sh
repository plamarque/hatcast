#!/bin/bash

# Automated version management and release script
# Usage: ./scripts/release-version.sh [--dry-run] [--major|--minor|--patch]

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
    DRY_SANDBOX_DIR=".dry-run-sandbox"
    
    echo "🏗️  Creating dry-run sandbox environment..."
    echo "   └─ Staging copy: $DRY_STAGING"
    echo "   └─ Main copy: $DRY_MAIN"
    echo "   └─ Sandbox directory: $DRY_SANDBOX_DIR"
    
    # Clean up any existing sandbox
    rm -rf "$DRY_SANDBOX_DIR"
    mkdir -p "$DRY_SANDBOX_DIR"
    
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
    mv "$TEMP_CHANGELOG" "CHANGELOG.md"
    
    # Generate French translation
    echo "   └─ Generating French translation..."
    generate_french_changelog
    
    # Generate ready-to-display JSON for the app
    echo "   └─ Generating JSON for app..."
    generate_changelog_json
    
    # Copy to public directory for web access (lowercase for browser compatibility)
    # Only in real deployment, not in dry-run
    if [ "$DRY_RUN" = false ]; then
        cp "CHANGELOG_FR.md" "public/changelog_fr.md"
        cp "changelog.json" "public/changelog.json"
    fi
    
    # In dry-run mode, copy generated files to sandbox for inspection
    if [ "$DRY_RUN" = true ] && [ -n "$DRY_SANDBOX_DIR" ]; then
        cp "CHANGELOG.md" "$DRY_SANDBOX_DIR/"
        cp "CHANGELOG_FR.md" "$DRY_SANDBOX_DIR/"
        cp "changelog.json" "$DRY_SANDBOX_DIR/"
        echo "📁 Generated files saved to sandbox: $DRY_SANDBOX_DIR/"
    fi
    
    return 0
}

# Function to translate changelog to French (optimized for new version only)
generate_french_changelog() {
    echo "🌐 Translating changelog to French..."
    
    # Create temporary file for initial translation
    local temp_changelog="/tmp/changelog_fr_temp.md"
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
    local temp_translated="/tmp/changelog_fr_translated.md"
    
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
    
    # Find the new version section (everything from ## [NEW_VERSION] to the next ## or end)
    # Extract from NEW_VERSION to the next ## header using sed
    new_version_section=$(sed -n "/^## \\[$NEW_VERSION\\]/,/^## \\[0.9.1\\]/p" "CHANGELOG.md" | sed '$d')
    
    # If no content found, try with 0.9.0
    if [ ${#new_version_section} -lt 50 ]; then
        new_version_section=$(sed -n "/^## \\[$NEW_VERSION\\]/,/^## \\[0.9.0\\]/p" "CHANGELOG.md" | sed '$d')
    fi
    
    # If still no content, capture until end of file
    if [ ${#new_version_section} -lt 50 ]; then
        new_version_section=$(sed -n "/^## \\[$NEW_VERSION\\]/,\$p" "CHANGELOG.md")
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
            echo "Please provide the French translation for version $NEW_VERSION:"
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
        
        # Add the translated section at the top
        local header_lines=$(grep -n "^---$" "$temp_translated" | head -1 | cut -d: -f1)
        if [ -n "$header_lines" ]; then
            # Insert after the --- separator
            head -n "$header_lines" "$temp_translated" > "/tmp/changelog_header.md"
            echo "" >> "/tmp/changelog_header.md"
            echo "$translated_section" >> "/tmp/changelog_header.md"
            echo "" >> "/tmp/changelog_header.md"
            tail -n +$((header_lines + 1)) "$temp_translated" >> "/tmp/changelog_header.md"
            mv "/tmp/changelog_header.md" "$temp_translated"
        else
            # No separator found, add at the top
            echo "" > "/tmp/changelog_new.md"
            echo "$translated_section" >> "/tmp/changelog_new.md"
            echo "" >> "/tmp/changelog_new.md"
            cat "$temp_translated" >> "/tmp/changelog_new.md"
            mv "/tmp/changelog_new.md" "$temp_translated"
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
    echo "📄 Generating ready-to-display JSON (last 3 versions)..."
    
    # Create temporary file to collect all versions
    local temp_versions="/tmp/changelog_versions.json"
    echo "[" > "$temp_versions"
    
    local first_version=true
    local current_version=""
    local current_date=""
    local current_changes=""
    local in_feature_section=false
    local version_count=0
    
    # Read the French changelog and convert to JSON
    while IFS= read -r line; do
        # Detect version line (## [1.0.0] - 2025-01-01)
        if [[ "$line" =~ ^##\ \[([^\]]+)\](?:\s*-\s*(.+))? ]]; then
            # Save previous version if exists
            if [ -n "$current_version" ] && [ -n "$current_changes" ]; then
                if [ "$first_version" = true ]; then
                    first_version=false
                else
                    echo "," >> "$temp_versions"
                fi
                
                echo "  {" >> "$temp_versions"
                echo "    \"version\": \"$current_version\"," >> "$temp_versions"
                echo "    \"date\": \"$current_date\"," >> "$temp_versions"
                echo "    \"changes\": [" >> "$temp_versions"
                echo "$current_changes" >> "$temp_versions"
                echo "    ]" >> "$temp_versions"
                echo "  }" >> "$temp_versions"
                
                version_count=$((version_count + 1))
            fi
            
            current_version="${BASH_REMATCH[1]}"
            current_date="${BASH_REMATCH[2]:-}"
            current_changes=""
            in_feature_section=false
            continue
        fi
        
        # Detect feature sections
        if [[ "$line" =~ ^###\ ✨.*Nouvelles\ fonctionnalités ]] || [[ "$line" =~ ^###\ 🐛.*Corrections ]]; then
            in_feature_section=true
            continue
        fi
        
        # Detect end of section
        if [[ "$line" =~ ^###\  ]] && [[ ! "$line" =~ ✨ ]] && [[ ! "$line" =~ 🐛 ]]; then
            in_feature_section=false
            continue
        fi
        
        # Detect end of version
        if [[ "$line" =~ ^---$ ]]; then
            in_feature_section=false
            continue
        fi
        
        # Detect commit lines in feature sections
        if [[ "$line" =~ ^-\ (.+)$ ]] && [ "$in_feature_section" = true ] && [ -n "$current_version" ]; then
            local commit="${BASH_REMATCH[1]}"
            
            # Filter technical commits
            if [[ ! "$commit" =~ ^(chore:|refactor:|build:|ci:|deps:|dependencies): ]]; then
                # Determine emoji
                local emoji="🔧"
                if [[ "$commit" =~ feat: ]] || [[ "$commit" =~ ✨ ]]; then
                    emoji="✨"
                elif [[ "$commit" =~ fix: ]] || [[ "$commit" =~ 🐛 ]]; then
                    emoji="🐛"
                elif [[ "$commit" =~ improve: ]] || [[ "$commit" =~ ⚡ ]]; then
                    emoji="⚡"
                fi
                
                # Add comma if not first change
                if [ -n "$current_changes" ]; then
                    current_changes+=","
                fi
                
                # Escape quotes in commit message
                local escaped_commit=$(echo "$commit" | sed 's/"/\\"/g')
                
                current_changes+="
      {
        \"id\": \"$current_version-$(echo "$current_changes" | grep -o "," | wc -l)\",
        \"emoji\": \"$emoji\",
        \"description\": \"$escaped_commit\"
      }"
            fi
        fi
    done < "CHANGELOG_FR.md"
    
    # Add last version
    if [ -n "$current_version" ] && [ -n "$current_changes" ]; then
        if [ "$first_version" = true ]; then
            first_version=false
        else
            echo "," >> "$temp_versions"
        fi
        
        echo "  {" >> "$temp_versions"
        echo "    \"version\": \"$current_version\"," >> "$temp_versions"
        echo "    \"date\": \"$current_date\"," >> "$temp_versions"
        echo "    \"changes\": [" >> "$temp_versions"
        echo "$current_changes" >> "$temp_versions"
        echo "    ]" >> "$temp_versions"
        echo "  }" >> "$temp_versions"
        
        version_count=$((version_count + 1))
    fi
    
    echo "]" >> "$temp_versions"
    
    # Extract only the last 3 versions using jq (if available) or awk
    if command -v jq >/dev/null 2>&1; then
        jq '.[0:3]' "$temp_versions" > "changelog.json"
    else
        # Fallback: use awk to extract first 3 versions
        awk '
        BEGIN { in_version = 0; version_count = 0; print "[" }
        /^  {/ { 
            if (version_count > 0) print ","
            in_version = 1
            version_count++
        }
        in_version == 1 { print }
        /^  }/ { 
            in_version = 0
            if (version_count >= 3) exit
        }
        END { print "]" }
        ' "$temp_versions" > "changelog.json"
    fi
    
    # Clean up
    rm -f "$temp_versions"
    
    echo "✅ Ready-to-display JSON generated (last 3 versions)"
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
execute_cmd "git add package.json public/version.txt CHANGELOG.md CHANGELOG_FR.md changelog.json" "Add modified files"
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
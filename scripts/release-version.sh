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
    
    # Generate ready-to-display JSON for the app directly in public/
    echo "   └─ Generating JSON for app..."
    generate_changelog_json
    
    return 0
}


# Function to generate ready-to-display JSON for the app using new architecture
generate_changelog_json() {
    echo "📄 Generating changelog with new architecture..."
    
    # Get the latest version from CHANGELOG.md
    local latest_version=$(grep "^## \\[" "CHANGELOG.md" | head -1 | awk -F'[][]' '{print $2}')
    
    if [ -z "$latest_version" ]; then
        echo "   └─ No versions found, creating empty JSON"
        echo "[]" > "public/changelog.json"
        return
    fi
    
    echo "   └─ Latest version found: $latest_version"
    
    # Step 1: Read commits and create technical JSON
    echo "   └─ Step 1: Creating technical JSON from commits..."
    local technical_json=$(create_technical_json_from_commits "$latest_version")
    
    if [ -z "$technical_json" ]; then
        echo "   └─ ❌ Failed to create technical JSON, using fallback..."
        generate_json_from_english_changelog "$(sed -n "/^## \\[$latest_version\\]/,/^## \\[/p" "CHANGELOG.md" | head -n -1)" "$latest_version"
        return
    fi
    
    # Step 2: Generate CHANGELOG.md from technical JSON
    echo "   └─ Step 2: Generating CHANGELOG.md from technical JSON..."
    generate_changelog_md_from_json "$technical_json" "$latest_version"
    
    # Step 3: Transform technical JSON to user-focused JSON with OpenAI (same source)
    echo "   └─ Step 3: Transforming technical JSON to user-focused JSON with OpenAI..."
    local user_focused_json=$(transform_technical_json_with_openai "$technical_json" "$latest_version")
    
    if [ -n "$user_focused_json" ]; then
        echo "   └─ ✅ OpenAI transformation successful!"
        
        # Validate JSON structure
        if echo "$user_focused_json" | jq empty 2>/dev/null; then
            echo "   └─ ✅ JSON validation successful!"
            
            # Step 4: Update changelog.json with new version
            echo "   └─ Step 4: Updating changelog.json..."
            update_changelog_json "$user_focused_json" "$latest_version"
        else
            echo "   └─ ❌ JSON validation failed, using technical JSON as fallback..."
            update_changelog_json "$technical_json" "$latest_version"
        fi
    else
        echo "   └─ ❌ OpenAI transformation failed, using technical JSON as fallback..."
        update_changelog_json "$technical_json" "$latest_version"
    fi
}

# Function to create technical JSON from commits
create_technical_json_from_commits() {
    local version="$1"
    local date=$(date +%Y-%m-%d)
    
    echo "   └─ Extracting commits for version $version..." >&2
    
    # Get commits since last tag
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commits_cmd="git log --oneline"
    
    if [ -n "$last_tag" ]; then
        commits_cmd="$commits_cmd $last_tag..HEAD"
    else
        commits_cmd="$commits_cmd --max-count=50"
    fi
    
    # Get commits as array, properly handling spaces in commit messages
    local commits=()
    while IFS= read -r commit; do
        commits+=("$commit")
    done < <($commits_cmd)
    
    if [ ${#commits[@]} -eq 0 ]; then
        echo "   └─ No commits found" >&2
        return 1
    fi
    
    echo "   └─ Found ${#commits[@]} commits" >&2
    
    # Categorize commits
    local features=()
    local fixes=()
    local improvements=()
    local other=()
    
    for commit in "${commits[@]}"; do
        # Extract commit message (remove hash and first space)
        local commit_msg=$(echo "$commit" | sed 's/^[a-f0-9]\{7,\} //')
        
        if [[ "$commit_msg" =~ ^feat: ]]; then
            features+=("$commit_msg")
        elif [[ "$commit_msg" =~ ^fix: ]]; then
            fixes+=("$commit_msg")
        elif [[ "$commit_msg" =~ ^(improve|refactor|perf): ]]; then
            improvements+=("$commit_msg")
        else
            other+=("$commit_msg")
        fi
    done
    
    # Build JSON using printf for proper formatting
    local temp_json="/tmp/technical_json_$$.json"
    
    printf '{\n  "version": "%s",\n  "date": "%s",\n  "changes": [' "$version" "$date" > "$temp_json"
    
            local first=true
            
    # Add features
    for feature in "${features[@]}"; do
                if [ "$first" = true ]; then
                    first=false
                else
            printf "," >> "$temp_json"
        fi
        # Escape quotes and newlines in commit messages for JSON
        local escaped_feature=$(echo "$feature" | tr -d '\n' | sed 's/"/\\"/g' | sed "s/'/\\'/g")
        printf '\n    "✨ %s"' "$escaped_feature" >> "$temp_json"
    done
    
    # Add fixes
    for fix in "${fixes[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            printf "," >> "$temp_json"
        fi
        # Escape quotes and newlines in commit messages for JSON
        local escaped_fix=$(echo "$fix" | tr -d '\n' | sed 's/"/\\"/g' | sed "s/'/\\'/g")
        printf '\n    "🐛 %s"' "$escaped_fix" >> "$temp_json"
    done
    
    # Add improvements
    for improvement in "${improvements[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            printf "," >> "$temp_json"
        fi
        # Escape quotes and newlines in commit messages for JSON
        local escaped_improvement=$(echo "$improvement" | tr -d '\n' | sed 's/"/\\"/g' | sed "s/'/\\'/g")
        printf '\n    "🔧 %s"' "$escaped_improvement" >> "$temp_json"
    done
    
    # Add other changes
    for other_change in "${other[@]}"; do
            if [ "$first" = true ]; then
                first=false
            else
            printf "," >> "$temp_json"
        fi
        # Escape quotes and newlines in commit messages for JSON
        local escaped_other=$(echo "$other_change" | tr -d '\n' | sed 's/"/\\"/g' | sed "s/'/\\'/g")
        printf '\n    "📝 %s"' "$escaped_other" >> "$temp_json"
    done
    
    printf '\n  ]\n}' >> "$temp_json"
    
    # Debug: Display the generated JSON to stderr
    echo "   └─ DEBUG: Generated technical JSON:" >&2
    echo "==========================================" >&2
    cat "$temp_json" >&2
    echo "==========================================" >&2
    
    # Output the JSON and clean up
    cat "$temp_json"
    echo  # Add newline after JSON
    rm -f "$temp_json"
}

# Function to generate CHANGELOG.md from technical JSON
generate_changelog_md_from_json() {
    local technical_json="$1"
    local version="$2"
    
    echo "   └─ Converting technical JSON to CHANGELOG.md format..."
    
    # Debug: Display the received JSON to stderr
    echo "   └─ DEBUG: Received technical JSON:" >&2
    echo "==========================================" >&2
    echo "$technical_json" >&2
    echo "==========================================" >&2 
    
    # Extract version and date (clean JSON first)
    echo "DEBUG: About to parse JSON with jq..." >&2
    echo "DEBUG: First 50 chars of JSON: '$(echo "$technical_json" | head -c 50)'" >&2
    echo "DEBUG: Last 50 chars of JSON: '$(echo "$technical_json" | tail -c 50)'" >&2
    echo "DEBUG: JSON length: $(echo "$technical_json" | wc -c)" >&2
    local date=$(echo "$technical_json" | tr -d '\r' | jq -r '.date')
    
    # Create markdown section
    local markdown_section="## [$version] - $date\n\n"
    
    # Extract changes and categorize them
    local features=()
    local fixes=()
    local improvements=()
    local other=()
    
    # Parse changes from JSON
    while IFS= read -r change; do
        if [[ "$change" =~ ^✨ ]]; then
            features+=("${change#✨ }")
        elif [[ "$change" =~ ^🐛 ]]; then
            fixes+=("${change#🐛 }")
        elif [[ "$change" =~ ^🔧 ]]; then
            improvements+=("${change#🔧 }")
        else
            other+=("${change#📝 }")
        fi
    done < <(echo "$technical_json" | jq -r '.changes[]')
    
    # Add sections
    if [ ${#features[@]} -gt 0 ]; then
        markdown_section+="### ✨ New Features\n\n"
        for feature in "${features[@]}"; do
            markdown_section+="- $feature\n"
        done
        markdown_section+="\n"
    fi
    
    if [ ${#fixes[@]} -gt 0 ]; then
        markdown_section+="### 🐛 Bug Fixes\n\n"
        for fix in "${fixes[@]}"; do
            markdown_section+="- $fix\n"
        done
        markdown_section+="\n"
    fi
    
    if [ ${#improvements[@]} -gt 0 ]; then
        markdown_section+="### 🔧 Improvements\n\n"
        for improvement in "${improvements[@]}"; do
            markdown_section+="- $improvement\n"
        done
        markdown_section+="\n"
    fi
    
    if [ ${#other[@]} -gt 0 ]; then
        markdown_section+="### 📝 Other Changes\n\n"
        for other_change in "${other[@]}"; do
            markdown_section+="- $other_change\n"
        done
        markdown_section+="\n"
    fi
    
    # Insert at the beginning of CHANGELOG.md
    local temp_changelog="/tmp/changelog_temp.md"
    echo -e "$markdown_section" > "$temp_changelog"
    
    if [ -f "CHANGELOG.md" ]; then
        # Remove existing version if it exists
        sed "/^## \\[$version\\]/,/^## \\[/{ /^## \\[/!d; }" "CHANGELOG.md" > "/tmp/changelog_clean.md"
        cat "/tmp/changelog_clean.md" >> "$temp_changelog"
        mv "$temp_changelog" "CHANGELOG.md"
        rm -f "/tmp/changelog_clean.md"
    else
        mv "$temp_changelog" "CHANGELOG.md"
    fi
    
    echo "   └─ ✅ CHANGELOG.md updated"
}

# Function to transform technical JSON with OpenAI
transform_technical_json_with_openai() {
    local technical_json="$1"
    local version="$2"
    
    echo "   └─ Sending technical JSON to OpenAI for transformation..."
    
    # Call OpenAI script with technical JSON
    local transformed_json=$(node scripts/generate-changelog.js "$technical_json" "$version" 2>/dev/null)
    
    if [ -n "$transformed_json" ] && [ "$transformed_json" != "null" ]; then
        echo "$transformed_json"
        return 0
    else
        echo "   └─ ❌ OpenAI transformation failed"
        return 1
    fi
}

# Function to generate JSON from English changelog (fallback)
generate_json_from_english_changelog() {
    local english_changelog="$1"
    local version="$2"
    
    echo "   └─ Using fallback: parsing English changelog..."
    
    # Extract date from version header
    local date=$(echo "$english_changelog" | grep "^## \\[" | head -1 | sed 's/.*\[.*\] - //')
    if [ -z "$date" ]; then
        date=$(date +%Y-%m-%d)
    fi
    
    # Extract changes (lines starting with -)
    local changes=()
    while IFS= read -r line; do
        if [[ "$line" =~ ^- ]]; then
            # Remove leading "- " and add to changes array
            local change="${line#- }"
            changes+=("\"$change\"")
        fi
    done <<< "$english_changelog"
    
    # Generate JSON
    local json="{
  \"version\": \"$version\",
  \"date\": \"$date\",
  \"changes\": ["
    
    local first=true
    for change in "${changes[@]}"; do
        if [ "$first" = true ]; then
            first=false
            json+="\n    $change"
        else
            json+=",\n    $change"
            fi
        done
        
    json+="\n  ]\n}"
    
    # Update or create changelog.json
    update_changelog_json "$json" "$version"
}

# Function to update changelog.json with new version
update_changelog_json() {
    local new_version_json="$1"
    local version="$2"
    
    echo "   └─ Updating changelog.json with version $version..."
    
    # Check if changelog.json exists
    if [ -f "public/changelog.json" ] && [ -s "public/changelog.json" ]; then
        echo "   └─ Existing changelog.json found, adding new version..."
        
        # Check if version already exists
        if grep -q "\"version\": \"$version\"" "public/changelog.json"; then
            echo "   └─ Version $version already exists, replacing..."
            # Remove existing version and add new one
            # This is complex, so let's regenerate from scratch
            echo "   └─ Regenerating entire JSON..."
            echo "[$new_version_json]" > "public/changelog.json"
        else
            echo "   └─ Adding new version $version..."
            # Add new version to existing JSON
            local existing_content=$(sed '$d' "public/changelog.json")
            echo "$existing_content" > "public/changelog.json"
            echo "," >> "public/changelog.json"
            echo "$new_version_json" >> "public/changelog.json"
            echo "]" >> "public/changelog.json"
        fi
    else
        echo "   └─ No existing changelog.json, creating new one..."
        echo "[$new_version_json]" > "public/changelog.json"
    fi
    
    echo "✅ Changelog.json updated successfully"
}

# Verify we're on staging branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Function to generate user-focused changelog with OpenAI
generate_user_focused_changelog() {
    local english_section="$1"
    local version="$2"

    echo "   └─ Generating user-focused changelog with OpenAI..."

    # Check if OpenAI API key is available
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "   └─ ❌ OPENAI_API_KEY not found, using fallback..."
        return 1
    fi

    # Display the technical changelog in terminal for reference
        echo ""
    echo "📋 CHANGELOG TECHNIQUE (version $version) :"
    echo "=========================================="
    echo "$english_section"
    echo "=========================================="
    echo ""

    # Call OpenAI script
    local translation=$(node scripts/generate-changelog.js "$english_section" "$version" 2>/dev/null)
    
    if [ -n "$translation" ] && [ "$translation" != "null" ]; then
        echo "   └─ ✅ OpenAI translation successful!"
            echo "$translation"
            return 0
        else
        echo "   └─ ❌ OpenAI translation failed, using fallback..."
        return 1
    fi
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
# Commit Message Guidelines

Referred from [AGENTS.md](../../AGENTS.md) and [DEVELOPMENT.md](../../DEVELOPMENT.md) as the normative source for commit messages in this repo.

## Overview
This document outlines the standards for writing clear, consistent, and informative commit messages using the Conventional Commits specification.

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: Add user authentication system` |
| `fix` | Bug fix | `fix: Resolve image upload timeout issue` |
| `refactor` | Code restructuring without changing functionality | `refactor: Simplify storage service initialization` |
| `chore` | Maintenance tasks, dependencies, config files | `chore: Update package dependencies` |
| `perf` | Performance improvements | `perf: Optimize image resizing algorithm` |
| `ci` | Continuous integration changes | `ci: Add GitHub Actions workflow` |
| `ops` | Infrastructure, deployment, backup changes | `ops: Configure Firebase hosting rules` |
| `build` | Build system, dependencies, version changes | `build: Update Vite configuration` |
| `docs` | Documentation updates | `docs: Add API endpoint documentation` |
| `style` | Code formatting, whitespace, semicolons | `style: Fix indentation in components` |
| `revert` | Revert previous commit | `revert: Undo user authentication changes` |
| `test` | Test additions or corrections | `test: Add unit tests for storage service` |

## Rules for Great Commit Messages

### 1. Subject Line (50 characters max)
- **Capitalize** the first letter
- **No period** at the end
- Use **imperative mood** (like giving a command)
- Be **concise** and **descriptive**

✅ **Good examples:**
- `feat: Add user profile management`
- `fix: Resolve authentication token expiration`
- `refactor: Simplify data validation logic`

❌ **Bad examples:**
- `feat: added user profile management` (not imperative)
- `fix: resolving authentication token expiration` (not imperative)
- `feat: Add user profile management.` (ends with period)

### 2. Body (72 characters per line)
- Separate from subject with **blank line**
- Explain **what** and **why** (not how)
- Wrap at 72 characters
- Use present tense

### 3. Footer
- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: API now requires authentication`
- Co-authors: `Co-authored-by: Name <email>`

## Examples

### Simple Feature
```
feat: Add image upload progress indicator

Shows real-time progress bar during file uploads to improve
user experience and provide visual feedback.
```

### Bug Fix with Issue Reference
```
fix: Resolve storage service initialization race condition

Prevents multiple simultaneous initialization attempts that could
cause service state inconsistencies.

Closes #456
```

### Refactor with Breaking Change
```
refactor: Restructure authentication service

- Consolidate auth methods into single service class
- Remove deprecated login functions
- Improve error handling consistency

BREAKING CHANGE: Auth.login() method signature changed
```

### Chore/Maintenance
```
chore: Update dependencies and build tools

- Upgrade Vite to v5.0.0
- Update Tailwind CSS to v3.4.0
- Refresh lock files
```

## Scope Usage

Use scopes to group related changes:

```
feat(auth): Add password reset functionality
fix(storage): Resolve image upload timeout
refactor(ui): Simplify component structure
docs(api): Update endpoint documentation
```

## Common Scopes for This Project

- `auth` - Authentication and user management
- `storage` - File storage and management
- `ui` - User interface components
- `api` - Backend API and services
- `pwa` - Progressive Web App features
- `test` - Testing infrastructure
- `docs` - Documentation updates

## Best Practices

1. **Write in English** - All commit messages must be in English
2. **Be specific** - Avoid vague descriptions like "fix bug" or "update code"
3. **Reference issues** - Link commits to relevant issues or tickets
4. **Group related changes** - Use scopes to organize commits logically
5. **Keep it atomic** - Each commit should represent one logical change
6. **Test before committing** - Ensure code compiles and tests pass

## Template for Complex Commits

```
type(scope): Brief description of change

Detailed explanation of what was changed and why.
Include any important implementation details.

- Bullet point for specific changes
- Another bullet point if needed

Closes #issue-number
BREAKING CHANGE: Description of breaking change
```

## Tools and Automation

- **Commitizen**: Interactive commit message builder
- **Husky**: Git hooks for commit message validation
- **Conventional Changelog**: Automatic changelog generation

## Review Checklist

Before committing, ask yourself:
- [ ] Does the subject line clearly describe the change?
- [ ] Is the message under 50 characters?
- [ ] Does it use imperative mood?
- [ ] Is the body informative and under 72 characters per line?
- [ ] Are any breaking changes documented?
- [ ] Are relevant issues referenced?
- [ ] Is the commit atomic (one logical change)?

---

*Remember: Good commit messages help your team understand the project's history and make code reviews more effective.*

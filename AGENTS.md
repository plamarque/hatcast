# Agent workflow rules (HatCast)

**Location:** Repository root. Chosen so AI agents and humans see normative rules immediately; root is the natural entry point for "how to work in this repo."

This document defines how AI coding agents should work in this repository. Follow it when making changes or answering questions about the codebase.

---

## Sources of truth (normative files)

Treat these as authoritative. When they conflict with code, flag the conflict; do not silently prefer code over docs.

| Document | Role |
|----------|------|
| **AGENTS.md** (this file) | How agents work; scope; quality/safety. |
| **SPEC.md** | What the system does (functional spec). No tasks or order. |
| **DOMAIN.md** | Domain language, entities, business rules. |
| **ARCH.md** | Architecture as-is; topology; data flows; config; testing. |
| **PLAN.md** | Slices, tasks, order, status. Only place for "when / in which order." |
| **docs/adr/** | Recorded decisions. Refer to ADRs for "why" and alternatives. |
| **docs/technical/COMMIT_MESSAGE_GUIDELINES.md** | Commit message format (Conventional Commits). Mandatory when creating or suggesting commits. |

Code and config are the **runtime** source of truth. The docs above describe intent and constraints; when code clearly diverges, report it rather than changing behavior without explicit approval.

---

## Specification vs plan (strict separation)

- **Specification (WHAT, FOR WHOM):** SPEC.md, DOMAIN.md. Describe capability and scope. Must **not** reference implementation order, tasks, or slices.
- **Plan / tracking (WHEN, IN WHICH ORDER):** PLAN.md only. May reference SPEC/DOMAIN for goals; SPEC must not reference PLAN or task lists.

When adding or editing content, keep this separation. Do not put "Slice 2" or "Phase 3" in SPEC or DOMAIN.

---

## Scope discipline

- **Do not invent features.** Only document or implement behavior that exists in the repo or is explicitly requested. If unsure whether something exists, search the codebase or label as ASSUMPTION / OPEN QUESTION.
- When proposing a change, tie it to (a) an existing artifact (file, route, collection) or (b) an explicit user request. Do not add speculative features to SPEC or PLAN.

---

## Conflicts and ambiguity

- If docs contradict the code: **stop and report.** List the conflict (file + line or component), then ask for direction. Do not silently "fix" code to match docs or vice versa without approval.
- If two normative docs contradict each other: report and ask which source wins. Prefer the more specific document (e.g. ARCH over generic README for topology).
- If you cannot infer behavior from code: label as **OPEN QUESTION** or **ASSUMPTION** in the relevant doc (e.g. SPEC, DOMAIN).

---

## Updating docs when code changes

- When you change production behavior (features, APIs, data model, auth, deployment): update the relevant normative doc in the same change (SPEC, DOMAIN, ARCH, or ADR as appropriate).
- When you only fix bugs or refactor without changing observable behavior: update docs only if the previous wording was wrong or misleading.
- When adding a significant technical decision: add or update an ADR in `docs/adr/` and link from ARCH or PLAN if relevant.

---

## Quality and safety rules (repo-relevant)

- **Data safety:** Firestore is the main persistence. No destructive bulk deletes or schema changes without (1) backup/migration plan and (2) explicit approval. See `firestore.rules` and `functions/` for security boundaries.
- **Migrations:** Any change to Firestore collection names, document shape, or security rules must be documented (DOMAIN or ADR) and, if breaking, handled via migration or compatibility path. `scripts/` contains DB-related scripts; do not run destructive scripts against production without confirmation.
- **Destructive operations:** Deleting users, seasons, or audit data is sensitive. Prefer soft-delete or archival unless requirements explicitly say otherwise. Document any new destructive script in PLAN or an ADR.
- **Secrets:** Never commit secrets. Config comes from `.env` (local, gitignored) or CI secrets (e.g. `FIREBASE_*`). `.env.example` may list variable names only, no values. Do not add new secrets to the repo; use env or a secret manager and document in ARCH / DEVELOPMENT.
- **Tests:** Do not disable or skip tests to make a change pass. Fix the test or the behavior. Playwright and custom test runners are described in ARCH and DEVELOPMENT.

---

## Commit messages

When an agent creates or suggests a commit, it **must** follow the [Commit Message Guidelines](docs/technical/COMMIT_MESSAGE_GUIDELINES.md).

- **Format:** Conventional Commits, in **English**. Subject line: `type(scope): Description` — e.g. `feat(auth): Add password reset`, `docs: Update DEVELOPMENT.md`.
- **Types:** Use one of the allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `ops`, `build`, `style`, `revert`.
- **Subject line:** Imperative mood, 50 characters max, no period at the end. First letter capitalized.
- For scopes, body, footer, and examples, see [docs/technical/COMMIT_MESSAGE_GUIDELINES.md](docs/technical/COMMIT_MESSAGE_GUIDELINES.md).

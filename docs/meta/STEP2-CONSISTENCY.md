# Step 2: Consistency checks (post normative docs v0.1)

**Purpose:** After creating AGENTS, SPEC, DOMAIN, ARCH, ADRs, PLAN, and DEVELOPMENT, this report lists contradictions with code, open questions that could not be inferred from code, and the smallest next slice suggested for stability.

---

## Contradictions between docs and code

1. **README.md vs actual structure and deployment** — **Resolved (Slice 1).** README now states Firebase Hosting + CI; structure shows GridBoard.vue, firestoreService.js, and current views/functions.

2. **README Structure section vs firestoreService** — **Resolved (Slice 1).** README structure includes firestoreService.js, storage.js, and correct functions list.

3. **.env.example vs real config** — **Resolved (Slice 2).** README links to DEVELOPMENT.md (required env listed there). `.env.example` extended with variable names (no values) so required and optional vars are discoverable. See root `.env.example`.

No other direct contradictions were found between the new normative docs (SPEC, DOMAIN, ARCH) and the code; those docs were derived from the repo.

---

## What could not be inferred from code alone (OPEN QUESTIONS)

- **Super Admin:** Where exactly the list is stored (Firebase project config, Firestore doc, or code) and how it is updated. Code shows a callable or server-side check; the list itself is not in repo.
- **Offline behaviour:** Whether the product intends full offline support for draw/admin or only cache-for-read. Code has offline listeners and cache but no explicit "offline mode" guarantee in comments.
- **GitHub Pages:** Whether `pages.yml` and the `deploy` script (gh-pages) are still supported or legacy. firebase.json defines two hosting targets; pages.yml is workflow_dispatch-only.
- **Invitation lifecycle:** Expiry and single-use semantics for `invitations` and accept flow. Logic is in code but not summarised in one place.
- **Exact availability schema:** Subcollection path and field names for availability are used in `storage.js` and `playerAvailabilityService.js` but not declared in a single schema doc; DOMAIN mentions the ambiguity.

These are already reflected in SPEC.md and DOMAIN.md as OPEN QUESTION or ASSUMPTION where relevant.

---

## Smallest next slice to improve stability (no refactor risk)

**Recommended: PLAN Slice 1 (Align README and one-time doc fixes).**

- **Why:** Fixes the main contradiction (README vs deployment and structure) without touching production code or tests. Reduces confusion for humans and agents; README then points to normative docs (AGENTS, SPEC, ARCH, PLAN, DEVELOPMENT).
- **Scope:** Only README edits + optionally a one-line pointer in `docs/README.md` to root normative docs. Definition of Done: README accurate; links valid; no behaviour change.
- **Next after that:** Slice 2 (formalise consistency report and track any further contradictions) or Slice 3 (test/CI baseline) depending on priority.

This is recorded in PLAN.md under Slices 1–3; no separate "smallest slice" document is required beyond this report and PLAN.

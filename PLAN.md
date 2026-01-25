# Plan / delivery tracking (HatCast)

**Location:** Repository root. This is the single place for "when" and "in which order"; kept at root so it is easy to open with AGENTS, SPEC, and ARCH.

Slices are incremental deliverables to stabilise and evolve the repo. SPEC.md describes *what*; this plan describes *when* and *how* to get there.

---

## Current status summary

- **Normative docs (v0.1):** AGENTS.md, SPEC.md, DOMAIN.md, ARCH.md, PLAN.md, DEVELOPMENT.md, and `docs/adr/` are in place. Align code and behaviour with them over time.
- **Application:** Single Vue 3 SPA; Firebase backend; CI deploys to Firebase Hosting (staging/production). Tests: Playwright + custom runners; some envs require `test:with-server` when dev server cannot be started by Playwright.
- **Known gaps:** Some docs in `docs/` are topic-heavy and not yet cross-referenced with SPEC/DOMAIN. No formal "definition of done" for feature work beyond "tests pass and deploy works."

---

## Slices (incremental deliverables)

### Slice 0: Normative docs baseline (current)

- [x] AGENTS.md created
- [x] SPEC.md created
- [x] DOMAIN.md created
- [x] ARCH.md created
- [x] docs/adr/ index + 6 ADRs created
- [x] PLAN.md created
- [x] DEVELOPMENT.md created
- [x] Step 2 consistency report done: see `docs/STEP2-CONSISTENCY.md` (contradictions, OPEN QUESTIONS, recommended next slice). Quick doc fixes are deferred to Slice 1.

**DoD:** All normative files exist; ADR index lists 6 ADRs; no production code changed.

---

### Slice 1: Align README and one-time doc fixes

- [x] Update README: remove or correct Netlify/Vercel sentence; set deployment authority to Firebase + CI.
- [x] Update README structure section: replace Grille.vue with GridBoard.vue and current views/ structure (see `src/main.js`, `src/views/`, `src/components/GridBoard.vue`).
- [x] Add a short "Docs for agents and maintainers" paragraph in README linking to AGENTS.md, SPEC.md, ARCH.md, PLAN.md, DEVELOPMENT.md.
- [x] Fix audit doc link (README → docs/technical/AUDIT.md). Add normative-docs pointer in docs/README.md.

**DoD:** README matches current entrypoints and deployment; links to normative docs work. No behaviour change.

---

### Slice 2: Consistency and open questions

- [x] Run Step 2 checks: list contradictions between new docs and code; list OPEN QUESTIONS that could not be inferred from code. (Done in `docs/STEP2-CONSISTENCY.md`; updated post-Slice 1.)
- [x] For each contradiction: either update the doc or open a tracked issue/task; do not silently change behaviour. (Contradictions 1–2 resolved in Slice 1; 3 resolved by extending `.env.example` and README→DEVELOPMENT link.)
- [x] Add a "Known open questions" section to PLAN (below) for visibility.

**DoD:** Contradictions documented and resolved or tracked; OPEN QUESTIONS visible in a normative doc.

---

### Slice 3: Test and CI baseline (minimal, no refactor)

- [x] Ensure default `npm test` runs a minimal smoke set: `tests/basic.spec.js` (home page load, navigation, route `/seasons`). Document in DEVELOPMENT.md how to run tests with existing server (`test:with-server`) and that deploy workflows do not run Playwright.
- [x] No disabling or removing of existing tests; no behaviour change to "fix" CI.
- [x] Add one spec-compliance check: route `/seasons` returns 200 and body visible (`tests/basic.spec.js`).

**DoD:** DEVELOPMENT.md describes test commands, minimal smoke, and CI note; one critical-route test added; no new flakiness introduced.

---

### Slice 4: Doc–code cross-links (lightweight)

- [x] In SPEC and DOMAIN, add short "Code references" lines for critical flows (selection, cast, availability, auth, admin) pointing to key files.
- [x] In ARCH, make component table "Location / entry" cells use markdown links to files/dirs.
- [x] docs/README.md already has full normative docs pointer (AGENTS, SPEC, DOMAIN, ARCH, PLAN, DEVELOPMENT) from Slice 1.

**DoD:** Readers can jump from normative docs to code for main flows and components; docs/README does not contradict root normative set.

---

### Slice 5: Event-details Availability tab – row click to open availability popup

- [x] In `EventRoleGroupingView.vue`, remove the `AvailabilityCell` from both layouts (all players and by role).
- [x] Make the whole player row/card open the availability modal (reuse existing `openAvailabilityModal`); build the same payload as the cell would emit for `show-availability-modal`.
- [x] In the by-role layout, ensure the two percentage elements use `@click.stop` so they open the chance-detail popup(s) only and do not trigger the row’s availability open.
- [x] Respect disabled state when event is archived; protected players keep existing permission checks when the modal is opened.

**DoD:** SPEC behaviour satisfied (Availability tab has no availability cell; row click opens availability popup; percentage clicks open chance popup only); existing tests pass.

---

## Definition of Done / quality gates (per slice)

- **Doc-only slices:** No production code or config change; only markdown and links. Lint/format markdown if the project has a markdown rule.
- **Slices that touch config or tests:** `npm run build` still succeeds; existing Playwright (or agreed) test suite still passes; no new secrets committed.
- **Any slice:** No removal or rewriting of normative content without updating AGENTS/SPEC/DOMAIN/ARCH/PLAN consistently. Conflicts: report and resolve (see AGENTS.md).

---

## Risks / unknowns

- **Playwright web server start:** In some environments (e.g. sandboxed CI or agents), starting the dev server on a port may fail (EPERM). Mitigation: document and use `test:with-server` with a pre-running server; or run tests in an environment that allows port binding.
- **Firestore indexes:** Adding new queries may require new composite indexes; deploy may fail until `firestore.indexes.json` is updated and deployed. Unknown: whether all prod queries are already covered.
- **Super Admin list:** Location and update process (code vs Firebase/backend config) are not fully documented in repo; changes may require code or console access.
- **GitHub Pages:** Role unclear (secondary deploy or legacy). If deprecated, consider removing or archiving `pages.yml` and deploy script references to avoid confusion.

---

## Known open questions

These could not be inferred from code alone; they are tracked here and in `docs/STEP2-CONSISTENCY.md`. Resolve when making related changes or when product decisions are needed.

- **Super Admin:** Where the list is stored (Firebase project config, Firestore doc, or code) and how it is updated. Code shows a callable or server-side check; the list itself is not in repo.
- **Offline behaviour:** Whether the product intends full offline support for draw/admin or only cache-for-read. Code has offline listeners and cache but no explicit "offline mode" guarantee in comments.
- **GitHub Pages:** Whether `pages.yml` and the `deploy` script (gh-pages) are still supported or legacy. firebase.json defines two hosting targets; pages.yml is workflow_dispatch-only.
- **Invitation lifecycle:** Expiry and single-use semantics for `invitations` and accept flow. Logic is in code but not summarised in one place.
- **Exact availability schema:** Subcollection path and field names for availability are used in `storage.js` and `playerAvailabilityService.js` but not declared in a single schema doc; DOMAIN mentions the ambiguity.

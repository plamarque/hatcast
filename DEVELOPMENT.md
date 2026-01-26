# Development guide (HatCast)

**Location:** Repository root. Development setup is project-wide; root makes it easy to find next to README and other normative docs.

How to run locally, run tests, build, and deploy. For architecture and product intent, see ARCH.md and SPEC.md.

---

## Prerequisites

- **Node.js** 20.x (recommended; matches Cloud Functions runtime). Check: `node -v`.
- **npm** (e.g. from Node install). Install deps: `npm ci` or `npm install`.
- **Firebase:** Optional for local UI-only; required for Functions and full E2E. Install Firebase CLI if you deploy: `npm install -g firebase-tools` (or use npx).

---

## Environment and secrets

- **Local:** Copy `.env.example` to `.env.local` (or `.env`). Fill in Firebase and other keys. All client config uses `VITE_*` so Vite can inject it. Do not commit `.env.local` or `.env`.
- **Variables used in app (see CI and configService):**  
  `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`,  
  `VITE_ENVIRONMENT`, `VITE_FIRESTORE_DATABASE`, `VITE_STORAGE_PREFIX`.  
  Optional: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_HTTPS_CERT_PATH`, `VITE_HTTPS_KEY_PATH`.
- **Secrets:** Never commit secrets. CI uses GitHub Actions secrets (e.g. `FIREBASE_API_KEY`, ...) and writes a `.env` at build time. Functions use Firebase/Google Cloud config (e.g. `defineSecret` if used).

---

## Run locally

- **Dev server (default):**  
  `npm run dev`  
  Serves the app (default port 5173). Uses `.env.local` / `.env` for Vite env.

- **Dev server (network / mobile):**  
  `npm run dev -- --host`  
  Serves on all interfaces (e.g. https://192.168.x.x:5173 if HTTPS is set). HTTPS needs cert/key; see `vite.config.js` (CERT_PATH, KEY_PATH) and project rules (e.g. `.cursor/rules/dev-server.mdc`).

- **Preview production build:**  
  `npm run build` then `npm run preview`  
  Serves the built `dist` locally.

---

## Tests

- **Minimal smoke:** The default `npm test` runs all Playwright specs; the baseline smoke set is in `tests/basic.spec.js` (home page load, navigation, critical route `/seasons`). Use this to confirm the app and routes respond.

- **Playwright (default):**  
  `npm test`  
  Runs Playwright e2e tests. Playwright starts the dev server automatically (see `playwright.config.js` webServer) unless disabled. Requires a free port (default 5173).

- **When the dev server is already running (e.g. port in use, or you use `npm run dev -- --host`):**  
  Start the app yourself (e.g. `npm run dev -- --host`), then in another terminal run:  
  `npm run test:no-server`  
  This uses `SKIP_WEBSERVER=1` so Playwright does not start a second server; the base URL is taken from `playwright.config.js` or `playwright.config.local.js` (e.g. `https://192.168.1.134:5173`).  
  Alternatively, `npm run test:with-server` uses `BASE_URL=https://localhost:5173` if your app is reachable on localhost.

- **CI:**  
  The deploy workflows (`.github/workflows/deploy-staging.yml`, `deploy-production.yml`) do **not** run Playwright; they only build and deploy. To run tests in CI, add a job that installs deps, creates `.env`, runs the dev server in the background, then runs `npm run test:ci` (uses `BASE_URL=http://localhost:5173`). Do not disable or remove existing tests to fix CI; fix the test or the behaviour.

- **Other scripts:**  
  `test:ui`, `test:headed`, `test:email`, `test:full`, `test:all`, `test:audit-config`, etc. See `package.json` and `tests/README.md`. Global setup/teardown: `tests/global-setup.js`, `tests/global-teardown.js`.

- **Known limitation:** State-dependent E2E tests are currently sensitive to base content; a fixture re-architecture is tracked in ISSUES.md (LIMIT-001) for later.

---

## Build

- **Production build:**  
  `npm run build`  
  Output: `dist/`. Includes Vite bundle and PWA assets (manifest, service worker from `src/service-worker.js`). No server-side build; hosting serves `dist` as static files.

- **Functions (Firebase):**  
  From repo root, deploy with Firebase CLI; the Functions runtime builds as needed. Config: `functions/package.json`, `firebase.json` (source: `functions`, runtime Node 20).

---

## Deploy

- **Primary:** Firebase Hosting (+ optional Functions). Push to the configured branch (e.g. `staging` or `main`) triggers CI (see `.github/workflows/deploy-staging.yml`, `deploy-production.yml`). CI runs `npm ci`, builds env from secrets, `npm run build`, then `firebase deploy`. Two hosting targets (production, staging) are defined in `firebase.json`.

- **Local deploy (manual):**  
  Configure Firebase project (`firebase use`), then `firebase deploy`. Ensure `.env` or env vars match the target (e.g. staging DB name for staging).

- **GitHub Pages:** Workflow `pages.yml` exists (workflow_dispatch). Secondary to Firebase Hosting; see README or PLAN.md for current status.

---

## Release / version

- **Commande (depuis la racine du repo) :**  
  `./scripts/release-version.sh [--dry-run] [--major|--minor|--patch]`  
  Script principal pour créer une nouvelle version (bump de `package.json`, mise à jour des changelogs, tag Git, etc.). Détails dans [scripts/release-version.sh](scripts/release-version.sh).

- **Options :**
  - `--patch` : 0.43.1 → 0.43.2
  - `--minor` : 0.43.1 → 0.44.0
  - `--major` : 0.43.1 → 1.0.0
  - `--dry-run` : simulation sans modification des fichiers ni création de tag

- **Changelog :** [scripts/generate-changelog.js](scripts/generate-changelog.js) peut être utilisé pour générer le changelog ; voir [scripts/README.md](scripts/README.md) pour la gestion des versions.

---

## Commits

Commit messages must follow the [Commit Message Guidelines](docs/technical/COMMIT_MESSAGE_GUIDELINES.md) (Conventional Commits, in English). Example: `git commit -m "docs: Document release command in DEVELOPMENT.md"` or `feat(auth): Add password reset flow`.

---

## Lint / format

- No shared lint/format script was observed in package.json. Use editor/IDE defaults or add eslint/prettier and wire scripts in a later slice (see PLAN.md). Do not disable or skip tests to satisfy a linter.

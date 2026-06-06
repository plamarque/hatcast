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

## Assets

- **Static images:** Put them in `legacy/public/img/` and reference them as `/img/filename` (e.g. `/img/slide-1.jpg`). Full convention in [ARCH.md](ARCH.md) (Static assets).

---

## Run locally

- **Dev server (default):**  
  `npm run dev`  
  Serves the app (default port 5173). Uses `.env.local` / `.env` for Vite env.

- **Dev server (network / mobile):**  
  `npm run dev -- --host`  
  Serves on all interfaces (e.g. https://192.168.x.x:5173 if HTTPS is set). HTTPS needs cert/key; see [`legacy/vite.config.js`](legacy/vite.config.js) (cert paths default to PEM files at repo root) and project rules (e.g. `.cursor/rules/dev-server.mdc`).

- **Preview production build:**  
  `npm run build` then `npm run preview`  
  Serves the built `legacy/dist` locally.

### V2 — API Spring + client Angular (OAuth Google)

Stack : [`services/api/`](services/api/) (Kotlin / Spring Boot) et [`apps/web/`](apps/web/) (**Angular 21** + Material, démo OAuth sur la route par défaut). Ne modifie pas la V1 sous `legacy/`.

1. Créer un client OAuth **Web** dans Google Cloud Console ; ajouter l’origine JavaScript **`https://localhost:4200`** (dev Angular avec TLS par défaut, voir `apps/web/angular.json` → `serve.options.ssl`). Ajouter d’autres origines si vous utilisez `127.0.0.1`, le réseau local (`--host`), ou du HTTP sans SSL.
2. **Neon (V2)** : créer ou utiliser la branche **`local`** dans le projet Neon ; renseigner `HATCAST_DATASOURCE_URL`, `HATCAST_DATASOURCE_USERNAME`, `HATCAST_DATASOURCE_PASSWORD` dans **`.env`** (voir [`.env.example`](.env.example)). Cette branche est **distincte** de **`development`**, utilisée par Cloud Run `hatcast-v2-dev` — voir [ADR-0009](docs/adr/0009-neon-postgres-environments.md).
3. **API** : `cd services/api && export HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID="…" && ./gradlew bootRun` (port **8080**). Pour **email / mot de passe (Identity Platform)**, renseigner aussi `GOOGLE_APPLICATION_CREDENTIALS` (compte de service GCP) dans `.env` — voir [DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §6.1.

**Identity Platform — config client Angular (Google + email sur `/connexion`)** : le SPA lit la config au **build** (`environment.*.ts`), pas le `.env` à l’exécution. Deux chemins :

| Mode | Fichier | Comment le remplir |
|------|---------|-------------------|
| Dev classique (`./scripts/start-dev.sh`, `ng serve`) | `apps/web/src/environments/environment.development.ts` | Éditer `googleOAuthWebClientId` + bloc `firebase` (`apiKey`, `authDomain`, `projectId`) |
| Recette prod locale (`--with-push`) | `apps/web/src/environments/environment.production.local.ts` (**gitignored**) | `.env` : `HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`, `HATCAST_FIREBASE_*`, etc. — `start-dev.sh` injecte ce fichier via [`inject-google-client-id.mjs`](apps/web/scripts/inject-google-client-id.mjs) puis build `production-local` ; **`environment.ts` versionné inchangé** |
| Cloud Run / CI | `environment.ts` (build Docker) | Secrets GitHub `GOOGLE_OAUTH_WEB_CLIENT_ID`, `HATCAST_FIREBASE_*` — voir [DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) |

**Web Push (V2, story 8.1 + 8.3)** : renseigner `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` et `HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY` dans `.env` (même paire que V1 / Firebase Console). L’API expose la clé publique via `GET /v1/config/public`. Le mode dev standard (`ng serve` development) **désactive** le service worker → pas de push. Pour recetter push, PWA, **et** auth email comme en prod :

```bash
# .env : HATCAST_WEB_PUSH_VAPID_* + HATCAST_FIREBASE_* + HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID
# optionnel : HATCAST_NOTIFICATION_EMAIL_ENABLED=true (Mailpit)
./scripts/start-dev.sh --with-push
```

Équivalent : `HATCAST_START_DEV_WITH_PUSH=1`. Alias : `--push-test`. Le front : **build Angular production + watch** vers `dist/`, servi en **HTTPS statique** (port 4200, service worker actif) — pas `ng serve`. Mailpit reste géré comme d’habitude si l’email est activé. Déclencheur MEP : **Publier le spectacle** (`open-availability`), pas la seule création brouillon. Voir [DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md).

**Installation PWA en local** : recetter l’install native sur **`https://localhost:4200`** (même commande `--with-push`). Sur une URL Tailscale `*.ts.net` ou `.local`, Chrome peut afficher « Non sécurisé » et bloquer l’invite native : le client ouvre alors uniquement le dialog d’étapes manuelles (pas de message « Note importante » côté membre). Détail : [ISSUES.md](ISSUES.md) **LIMIT-003**.

**Notifications email (V2, story 8.3)** : dans `.env`, `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` (+ optionnel `HATCAST_NOTIFICATION_EMAIL_FROM`). Avec **`./scripts/start-dev.sh`** (recommandé) : le script démarre **Mailpit** via Docker, force `SPRING_MAIL_HOST=127.0.0.1:1025` pour l’API, attend le SMTP, arrête Mailpit à la fin. UI de recette : **http://127.0.0.1:8025**. Pas de `SPRING_MAIL_*` local requis (les lignes Gmail du `.env` sont ignorées par le script). **`npm run dev:api` seul** ne démarre pas Mailpit — utiliser `start-dev.sh` pour tester l’envoi email. Staging/prod : secrets GitHub `SPRING_MAIL_*` (Gmail), pas Mailpit.
4. **Client** : dans `apps/web`, éditer `src/environments/environment.development.ts` et renseigner `googleOAuthWebClientId` (même valeur publique que l’API) et, pour email/mot de passe, le bloc `firebase`, puis `npm install && npm run dev` (port **4200** en **HTTPS** ; le proxy envoie `/v1` et `/actuator` vers l’API en HTTP, voir `proxy.conf.json`). Routes : **`/`** redirige selon la session ; **`/connexion`** (Google + email si config Firebase présente) ; **`/accueil`** une fois connecté. Au premier chargement, le navigateur peut avertir sur le certificat de dev — accepter pour localhost.

**Tout-en-un (recommandé) :** `./scripts/start-dev.sh` à la racine — démarre l’API puis le client Angular (`ng serve --host`, HTTPS). Variables `HATCAST_*` lues depuis `.env` si le fichier existe.

Scripts racine optionnels : `npm run dev:api`, `npm run dev:web:v2`. Détail : [services/api/README.md](services/api/README.md), [apps/web/README.md](apps/web/README.md), [docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md](docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md).

**Trois troupes en local (`./scripts/start-dev.sh`, profil `dev`, Neon branche `local`) :**

| Troupe | UUID (suffixe) | Source | Cible du bouton « Rejoindre la démo » |
|--------|----------------|--------|--------------------------------------|
| **Les Improbots** | `…000001` | Flyway dev (voir ci-dessous) | Non |
| **Démo** | `…000099` | `db/migration` V33+ (tous profils incl. cloud) | Oui (`environment.demoTroupeId` / `DEMO_TROUPE_ID`) |
| **La Malice** | variable | migration V1 réelle | Non (jamais seed Flyway) |

#### Les Improbots — seeds dev Flyway

Données fictionnelles pour recette locale, tests H2/e2e et reset Neon branche **`local`**. **Absent du profil `cloud`** (staging/prod — [ADR-0014](docs/adr/0014-v2-preprod-migration-no-seed.md)).

| Emplacement | Rôle |
|-------------|------|
| `db/seed/V3_1`, `V4` | Troupe + saison (portable H2/PostgreSQL, idempotent) |
| `db/seed/V30`, `V31`, `V47`, … | Compléments dev (context switcher, QA drafts, etc.) |
| `db/seed/V6`, `V17`, `V19`, `V22`, `V26`, `V48`, `V49` | **Stubs no-op** — conservés pour l’historique Flyway (`SELECT 1 WHERE 1 = 0`) |
| **`db/seed-postgresql/R__seed_improbots_dev_demo.sql`** | **Seed unique** : ~30 spectacles, roster, dispos, compositions, MVP pilot, Historique — inserts idempotents (`NOT EXISTS`), schéma courant (`slug`, `season_participant_id`, `availability.id`, preset match `coach: 1`, etc.) |

**Profils Spring** (`dev`, `test`, `e2e`) : Flyway charge `db/migration` + `db/seed` + **`db/seed-postgresql`**. Le profil `dev` active `out-of-order: true` et `repair-on-migrate: true` (checksums après regénération).

**Regénérer** (après édition de `members.csv` à la racine — gitignored, PII) :

```bash
npm run generate:improbots-dev-seed
# alias : npm run generate:improbots-seed | generate:malice-seed
```

Écrit `R__seed_improbots_dev_demo.sql` + met à jour les stubs versionnés. Sans `members.csv`, le générateur relit le SQL existant (`R__seed_improbots_dev_demo.sql`).

**Reset Neon branche `local`** (schéma prod cloné, sans données Improbots) : reset branche → `./scripts/start-dev.sh` → Flyway applique migrations prod, stubs versionnés, puis le **`R__`** (repeatable, après toutes les versionnées). Pas de patch out-of-order par seed historique.

Recette MVP pilot (Patrice) : [scripts/v2/MVP-PILOT-RECETTE.md](scripts/v2/MVP-PILOT-RECETTE.md). Générateur : [scripts/v2/generate-improbots-seed-sql.js](scripts/v2/generate-improbots-seed-sql.js).

**Troupe Démo prod (ADR-0015) :** bootstrap idempotent Flyway `V33`–`V37` + repeatable `R__bootstrap_demo_admin_memberships.sql` (`db/migration`, profil `cloud` inclus). UUID `a0000001-0000-4000-8000-000000000099`. Les liens `TROUPE_ADMIN` pour `patrice.lamarque@gmail.com` / `impropick@gmail.com` sont appliqués idempotent à chaque migrate Flyway dès que les comptes `users` existent (première connexion Google sur Neon vide incluse). Smoke manuel après join : `/saison/demo/saison-2026-2027` — checklist opérateur dans [docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) § Post-deploy smoke.

**Déploiement V2 (Cloud Run, Neon, GitHub Actions)** : [docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) ; workflow Git (promote / release) : [docs/v2/technical/DEPLOYMENT_WORKFLOW.md](docs/v2/technical/DEPLOYMENT_WORKFLOW.md) ; branches / environnements : [docs/shared/technical/BRANCH_ENVIRONMENTS.md](docs/shared/technical/BRANCH_ENVIRONMENTS.md).

---

## Tests

- **V2 (API + Angular) :** `./scripts/run-tests.sh` à la racine (Gradle puis `ng test` sans watch).

- **V2 API (Spring, `services/api/`) seule :**  
  `cd services/api && ./gradlew test`

- **Minimal smoke:** The default `npm test` runs all Playwright specs; the baseline smoke set is in [`legacy/tests/basic.spec.js`](legacy/tests/basic.spec.js) (home page load, navigation, critical route `/seasons`). Use this to confirm the app and routes respond.

- **Playwright (default):**  
  `npm test`  
  Runs Playwright e2e tests. Playwright starts the dev server automatically (see [`legacy/playwright.config.js`](legacy/playwright.config.js) `webServer`) unless disabled. Requires a free port (default 5173).

- **When the dev server is already running (e.g. port in use, or you use `npm run dev -- --host`):**  
  Start the app yourself (e.g. `npm run dev -- --host`), then in another terminal run:  
  `npm run test:no-server`  
  This uses `SKIP_WEBSERVER=1` so Playwright does not start a second server; the base URL is taken from `legacy/playwright.config.js` or `legacy/playwright.config.local.js` (e.g. `https://192.168.1.134:5173`).  
  Alternatively, `npm run test:with-server` uses `BASE_URL=https://localhost:5173` if your app is reachable on localhost.

- **CI:**  
  The deploy workflows (`.github/workflows/deploy-staging.yml`, `deploy-production.yml`) do **not** run Playwright; they only build and deploy. To run tests in CI, add a job that installs deps, creates `.env`, runs the dev server in the background, then runs `npm run test:ci` (uses `BASE_URL=http://localhost:5173`). Do not disable or remove existing tests to fix CI; fix the test or the behaviour.

- **Other scripts:**  
  `test:ui`, `test:headed`, `test:email`, `test:full`, `test:all`, `test:audit-config`, etc. See root `package.json` / `legacy/package.json` and [`legacy/tests/README.md`](legacy/tests/README.md). Global setup/teardown: [`legacy/tests/global-setup.js`](legacy/tests/global-setup.js), [`legacy/tests/global-teardown.js`](legacy/tests/global-teardown.js).

- **Known limitation:** State-dependent E2E tests are currently sensitive to base content; a fixture re-architecture is tracked in ISSUES.md (LIMIT-001) for later.

---

## Build

- **Production build:**  
  `npm run build`  
  Output: **`legacy/dist/`**. Includes Vite bundle and PWA assets (manifest, service worker from `legacy/src/service-worker.js`). No server-side build; Firebase Hosting serves `legacy/dist` as static files (see [`firebase.json`](firebase.json)).

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

### V1 (Firebase — branche `staging`)

- **Commande (depuis la racine du repo) :**  
  `./scripts/release-version.sh [--dry-run] [--major|--minor|--patch]`  
  Script principal pour créer une nouvelle version V1 (bump de `package.json`, mise à jour des changelogs, tag Git, merge vers `main`, etc.). Détails dans [scripts/release-version.sh](scripts/release-version.sh).

- **Options :**
  - `--patch` : 0.43.1 → 0.43.2
  - `--minor` : 0.43.1 → 0.44.0
  - `--major` : 0.43.1 → 1.0.0
  - `--dry-run` : simulation sans modification des fichiers ni création de tag

- **Changelog :** [scripts/generate-changelog.js](scripts/generate-changelog.js) peut être utilisé pour générer le changelog ; voir [scripts/README.md](scripts/README.md).

### V2 (Cloud Run — branche `staging-v2`)

- **Promotion staging :** `./scripts/v2/promote-to-staging.sh [--dry-run] [--ff-only]`
- **Release production (tag-first) :** `./scripts/v2/promote-tag-to-prod.sh --version=X.Y.Z [--rc-tag=vX.Y.Z-rc.N] [--dry-run]`
- Guide : [docs/v2/technical/DEPLOYMENT_WORKFLOW.md](docs/v2/technical/DEPLOYMENT_WORKFLOW.md)

---

## Commits

Commit messages must follow the [Commit Message Guidelines](docs/shared/technical/COMMIT_MESSAGE_GUIDELINES.md) (Conventional Commits, in English). Example: `git commit -m "docs: Document release command in DEVELOPMENT.md"` or `feat(auth): Add password reset flow`.

---

## Lint / format

- No shared lint/format script was observed in package.json. Use editor/IDE defaults or add eslint/prettier and wire scripts in a later slice (see PLAN.md). Do not disable or skip tests to satisfy a linter.

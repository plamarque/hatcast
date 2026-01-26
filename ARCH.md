# Architecture (HatCast)

**Location:** Repository root. Architecture is project-wide; root keeps it discoverable for onboarding and evolution decisions.

Describes the system architecture **as-is** and principles for evolving safely. For "why" decisions, see `docs/adr/`.

---

## High-level component map

| Component | Responsibility | Location / entry |
|-----------|----------------|------------------|
| **Frontend SPA** | UI, routing, auth state, calls to Firestore and callable functions | [index.html](index.html), [src/main.js](src/main.js), [src/App.vue](src/App.vue), [src/views/](src/views/), [src/components/](src/components/) |
| **Firestore (client)** | All server persistence from the client; multi-database | [src/services/firestoreService.js](src/services/firestoreService.js), [src/services/storage.js](src/services/storage.js) |
| **Auth (client)** | Firebase Auth (email, Google, magic link, anonymous); session | [src/services/firebase.js](src/services/firebase.js), [src/services/authState.js](src/services/authState.js) |
| **Config** | Environment (test/dev/staging/prod), Firestore database name, API roots | [src/services/configService.js](src/services/configService.js) |
| **Permissions** | Super Admin + season admin checks; calls callable for Super Admin | [src/services/permissionService.js](src/services/permissionService.js) |
| **Domain services** | Casts, selection (draw), chances (weights), availability, players, seasons | [src/services/castService.js](src/services/castService.js), [src/services/selectionService.js](src/services/selectionService.js), [src/services/chancesService.js](src/services/chancesService.js), [src/services/playerAvailabilityService.js](src/services/playerAvailabilityService.js), [src/services/players.js](src/services/players.js), [src/services/seasons.js](src/services/seasons.js) |
| **Notifications (client)** | Push (FCM), reminders; write to pushQueue/reminderQueue | [src/services/notifications.js](src/services/notifications.js), [src/services/pushService.js](src/services/pushService.js), [src/services/reminderService.js](src/services/reminderService.js) |
| **Audit (client)** | Log actions and errors to Firestore / callable | [src/services/auditClient.js](src/services/auditClient.js) |
| **Cloud Functions** | Auth (custom token), audit triggers/queries, mail, reminders, push, admin, roles | [functions/index.js](functions/index.js), [functions/](functions/) |
| **Firestore (server)** | Triggers (audit, mail, reminder, push); admin DB access | [functions/](functions/) using `admin.firestore()` |
| **Hosting** | Serve static `dist`; SPA fallback | [firebase.json](firebase.json) hosting, [.github/workflows/](.github/workflows/) |

No separate API server; backend is Firebase (Firestore + Auth + Functions).

---

## Runtime topology

```
[Browser / PWA]
  ├── Vue SPA (Vite dev or static dist)
  ├── Firebase JS SDK (Auth, Firestore, Functions, Storage, Messaging)
  └── Service worker (PWA; src/service-worker.js)

[Firebase]
  ├── Firebase Hosting (serves dist)
  ├── Firebase Auth
  ├── Firestore (databases: default, staging, development)
  ├── Cloud Functions (Node 20; same project, region per config)
  └── (Storage, Messaging used where configured)
```

- **Local dev:** `npm run dev` → Vite dev server (default port 5173; optional HTTPS via cert paths in `vite.config.js`). App talks to Firebase project (and optionally emulators) via env.
- **Deploy:** CI (e.g. push to `staging` / `main`) builds with Vite, then `firebase deploy` for hosting (+ functions). Two hosting targets (production, staging) in `firebase.json`; which one is used depends on CI workflow and Firebase project/target.
- **Multi-environment:** Environment is derived from hostname or `VITE_ENVIRONMENT`; Firestore database name from `VITE_FIRESTORE_DATABASE` (see `configService.js`). Functions run in one backend project per deployment; database selection is client-side via Firestore SDK initialisation.

---

## Data flows (read/write paths)

- **Read:** Client → Firestore (via `firestoreService` / `storage`). Queries use collection paths and (where defined) indexes in `firestore.indexes.json`. Subcollections under `seasons/{id}` for events, players, casts, availability, admins.
- **Write (client):** Client → Firestore (add/update/delete) where rules allow. Batches and transactions used for consistency (e.g. in `storage.js`). Queues: client writes to `mail`, `reminderQueue`, `pushQueue`; no client read.
- **Write (server):** Functions triggered by Firestore (onCreate, etc.) or invoked via httpsCallable. Triggers: audit, processMail, processReminderQueue, processPushQueue. Callables: createCustomTokenForEmail, audit queries, admin, role-related. Functions use `admin.firestore()` (default database unless specified).
- **Auth:** Client ↔ Firebase Auth; custom tokens issued by callable `createCustomTokenForEmail` for magic-link-like flows. No direct DB of passwords; reset via Firebase Auth.

---

## Config strategy

- **Client:** All config comes from Vite env: `import.meta.env.VITE_*`. Keys observed in CI and config: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_ENVIRONMENT`, `VITE_FIRESTORE_DATABASE`, `VITE_STORAGE_PREFIX`. Optional: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_HTTPS_CERT_PATH`, `VITE_HTTPS_KEY_PATH` (see `.env.example`, `vite.config.js`, deploy workflows).
- **Secrets:** Not committed. Local: `.env.local` or `.env` (gitignored). CI: GitHub Actions secrets (e.g. `FIREBASE_API_KEY`, ...`) mapped into `.env` at build time.
- **Functions:** Use Firebase project config and, if defined, `defineSecret` / params (e.g. commented `GOOGLE_MAPS_API_KEY` in `functions/index.js`). No env file for functions in repo; secrets in Firebase/Google Cloud.
- **Single source of env detection:** `configService.detectEnvironment()` and `getFirestoreDatabase()` drive which DB and feature flags apply. Add new env vars in one place and document in DEVELOPMENT.md and/or ARCH.

---

## Static assets (public)

- **Location:** Static images and files that must be served as-is (no Vite bundling) go under **`public/img/`**.
- **Reference in code:** Use the **`/img/`** URL prefix (no `public` in the path). Example: `src="/img/slide-1.jpg"`.
- **Rationale:** Vite and Firebase Hosting serve `public/` at the site root; these files are not hashed or processed at build time.
- **Existing assets:** `public/icons/` and `public/logos/` remain unchanged; new product/images (e.g. explanation slides) use `public/img/` for a single place for generic images.

---

## Testing strategy (as-is + minimal improvements)

- **E2E (Playwright):** Default test runner. Config: `playwright.config.js`; baseURL from env or `playwright.config.local.js`. Runs full app against a URL (dev server started by Playwright or existing server with `SKIP_WEBSERVER=1`). Specs in `tests/*.spec.js` (e.g. basic, auth, player-protection, pwa, audit-config). Global setup/teardown in `tests/global-setup.js`, `global-teardown.js`.
- **Custom runners:** `tests/run-tests.js`, `run-manual.js`, email interceptor for flows that need controlled email/push behaviour. Not part of default `npm test`.
- **CI:** `test:ci` uses `BASE_URL=http://localhost:5173`; Playwright typically starts the dev server unless disabled. For agent/sandbox environments that cannot bind ports, `test:with-server` with an already-running server is an option.
- **Improvements (minimal, non-invasive):** Keep a single "smoke" suite that loads home and one season route; avoid disabling tests to fix CI; document test:with-server and env requirements in DEVELOPMENT.md. No refactor of test architecture required for v0.1.

---

## Key seams / extension points

- **Firestore abstraction:** `firestoreService.js` + `storage.js`. New collections or paths should go through these (or an agreed wrapper) so multi-database and rules stay consistent. Changing DB shape or adding indexes: update DOMAIN, firestore.rules, and firestore.indexes.json.
- **Permission boundary:** All admin checks go through `permissionService.js`. New "admin-only" features should use it; new roles or Super Admin logic belong in Functions + this service.
- **Callable functions:** New server actions should be added in `functions/index.js` (and optionally in separate modules); client calls via `callCloudFunction` in `firebase.js`. CORS and callable context are the integration contract.
- **Queue-based side effects:** Mail, reminders, push go through Firestore queues + triggers. To add a new kind of notification, add a collection (and rules), a trigger, and client code that writes to the queue.
- **Routes:** Add new routes in `main.js` (routes array and guards). Admin routes under `/season/:slug/admin` are already guarded; replicate the pattern for other protected areas.
- **PWA:** Manifest and service worker are configured in `vite.config.js` and `src/service-worker.js`. Changes to offline behaviour or push subscription touch these and possibly `notifications.js`.

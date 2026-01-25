# ADR-0001: Firebase as backend (Firestore, Auth, Functions)

- **Status:** Observed
- **Context:** The app needs persistence, authentication, and server-side logic (e.g. custom tokens, audit queries, mail/push). A single, managed backend was chosen instead of a custom server.
- **Decision:** Use Firebase as the full backend: Firestore for data, Firebase Auth for identity, Cloud Functions for server logic (callables and Firestore triggers). Hosting serves the static SPA from Vite build (`dist`). No separate API server or relational DB.
- **Consequences:**
  - Simpler ops (no server to maintain); scaling and security largely delegated to Firebase.
  - Vendor lock-in; schema and rules are Firestore-specific. Offline is cache-based.
  - Secrets and env are split: client (Vite env); Functions use Firebase/Google Cloud config.
- **Alternatives considered:** (Not recorded in repo.) Custom Node/Express API + Postgres would increase flexibility and portability at the cost of hosting and ops. Firebase was likely chosen for speed and integration with a single provider.

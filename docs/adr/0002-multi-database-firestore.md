# ADR-0002: Multi-database Firestore per environment

- **Status:** Observed
- **Context:** Need to run development, staging, and production against different data without sharing one Firestore database.
- **Decision:** Use Firestore multi-database support. One project can have multiple databases (e.g. `(default)`, `staging`, `development`). Client selects the database at runtime via `configService` using `VITE_FIRESTORE_DATABASE` and hostname-based environment detection. CI sets `VITE_FIRESTORE_DATABASE=staging` for staging deploy; local/dev uses development or default as configured.
- **Consequences:**
  - Safe isolation between envs; no accidental prod writes from staging builds.
  - All environments must have matching rules and indexes for the same logical schema; deployments may need to target the correct database in Firebase config.
  - Slightly more configuration and documentation (see `configService.js`, ARCH.md).
- **Alternatives considered:** Single database with env prefix in paths would avoid multi-database but mix data and increase risk. Separate Firebase projects per env would isolate fully but complicate project and billing management.

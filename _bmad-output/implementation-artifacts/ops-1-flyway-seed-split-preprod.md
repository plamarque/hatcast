# OPS-1 — Flyway schema / seed split for pre-production

**Status:** done (2026-05-25)  
**ADR:** [docs/adr/0014-v2-preprod-migration-no-seed.md](../../docs/adr/0014-v2-preprod-migration-no-seed.md)

## Outcome

- Schema migrations remain in `services/api/src/main/resources/db/migration/`.
- Dev/test seeds moved to `services/api/src/main/resources/db/seed/` (V3_1, V4, V6, V17, V19, V22, V26).
- `application-dev.yml` and `application-test.yml` load both locations.
- `application-cloud.yml` loads migration only.

## Verification

- `./gradlew test` in `services/api` passes.
- Cloud Run deploy applies schema without `@seed.la-malice.test` users.

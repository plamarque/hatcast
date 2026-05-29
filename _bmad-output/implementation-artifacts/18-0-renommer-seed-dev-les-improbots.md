# Story 18.0 : Renommer le seed dev → Les Improbots

Status: done

## Story

En tant que **développeur**,  
je veux que la troupe fictive locale s’appelle **Les Improbots**,  
afin de **ne pas confondre** seed dev, **Démo** prod et **La Malice** migration.

## Acceptance Criteria

1. Troupe seed `…000001` → **Les Improbots**, slug **`les-improbots`** (UUID inchangé). ✓
2. Saison principale → **Les Improbots 2026-2027** (`les-improbots-2026-2027`). ✓
3. Emails seed → **`@seed.improbots.test`**. ✓
4. Scripts/docs/`environment` alignés. ✓
5. Migration **V31** pour bases locales déjà seedées (rename legacy labels). ✓

**UI :** N/A

## Dev Agent Record

- ADR-0015 documents prod **Démo** bootstrap (Option A) — separate from this chore.
- Flyway filenames `*malice*` kept for checksum stability; content uses Les Improbots labels.
- Generator: `scripts/v2/generate-improbots-seed-sql.js` (+ deprecated re-export `generate-malice-seed-sql.js`).
- npm: `generate:improbots-*` scripts; `generate:malice-*` aliases preserved.

### Review Findings

- [x] [Review][Decision] Scope creep — bypass super-admin plateforme — **conservé dans 18.0** (choix Patrice 2026-05-28)
- [x] [Review][Patch] Test d'intégration : `seed-improbots-22` [`AvailabilityControllerIntegrationTest.kt:499`]
- [x] [Review][Patch] Générateur versionné : `scripts/v2/generate-improbots-seed-sql.js`
- [x] [Review][Patch] Migration V31 versionnée : `V31__seed_improbots_rename_legacy_labels.sql`
- [x] [Review][Patch] Commentaire `application.yml` — ligne V3 contradictoire supprimée
- [x] [Review][Patch] Docs ops `@seed.improbots.test` — `preprod-reset-and-migrate.md`, `PLAN.md`
- [x] [Review][Defer] Venue fiction « Local Malice, Lille » dans V26 — libellé lieu, pas identité troupe seed [`V26__seed_malice_past_events_historique.sql:164`] — deferred, pre-existing fiction
- [x] [Review][Defer] Noms export `buildMalicie*` dans le générateur improbots — dette de nommage acceptée (aliases npm malice conservés) — deferred, maintenance
- [x] [Review][Defer] Checksum Flyway seeds modifiés sur Neon persistant sans `repair-on-migrate` — pattern ops connu (V31 compense le contenu) — deferred, pre-existing
- [x] [Review][Defer] Collision slug `les-improbots` si troupe homonyme existe avant V31 — edge case dev rare — deferred, pre-existing
- [x] [Review][Defer] Fixtures unitaires front « La Malice » génériques (`troupe-context.service.spec.ts`) — non couplées au seed UUID — deferred, pre-existing

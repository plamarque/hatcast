-- Story 18.0 — rename legacy dev seed labels (DBs créées avant Les Improbots).
-- Complète V3_1/V4/V17 pour les bases locales déjà migrées Flyway.

UPDATE troupes
SET name = 'Les Improbots', slug = 'les-improbots'
WHERE id = 'a0000001-0000-4000-8000-000000000001'
  AND slug = 'la-malice';

UPDATE seasons
SET slug = 'les-improbots-2026-2027', title = 'Les Improbots 2026-2027'
WHERE id = 'b0000001-0000-4000-8000-000000000001'
  AND slug = 'la-malice-2026-2027';

UPDATE users
SET
    email = REPLACE(email, '@seed.la-malice.test', '@seed.improbots.test'),
    google_sub = REPLACE(google_sub, 'seed-malicie-', 'seed-improbots-')
WHERE email LIKE '%@seed.la-malice.test'
   OR google_sub LIKE 'seed-malicie-%';

UPDATE season_participants
SET normalized_email = REPLACE(normalized_email, '@seed.la-malice.test', '@seed.improbots.test')
WHERE normalized_email LIKE '%@seed.la-malice.test';

-- V17 s'exécute avant V28 : le backfill auto produit patrice-lamarque-auryl pour le compte test auryl.
UPDATE users
SET slug = 'auryl'
WHERE id = 'd0000001-0000-4000-8000-000000000023'
  AND slug = 'patrice-lamarque-auryl';

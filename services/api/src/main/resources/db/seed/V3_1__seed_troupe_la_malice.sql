-- Dev/test seed only (classpath:db/seed). Id aligné sur hatcast.troupe.seed-troupe-id.
-- Troupe fictive locale : Les Improbots (≠ Démo prod, ≠ La Malice migration V1).
-- Idempotent : safe when V3_1 is applied out-of-order (base déjà seedée avant le split OPS-1).
-- Portable H2 + PostgreSQL (pas de ON CONFLICT — H2 test profile).
INSERT INTO troupes (id, name, slug, created_at)
SELECT
    'a0000001-0000-4000-8000-000000000001',
    'Les Improbots',
    'les-improbots',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM troupes WHERE id = 'a0000001-0000-4000-8000-000000000001'
);

UPDATE troupes
SET name = 'Les Improbots', slug = 'les-improbots'
WHERE id = 'a0000001-0000-4000-8000-000000000001'
  AND (name <> 'Les Improbots' OR slug <> 'les-improbots');

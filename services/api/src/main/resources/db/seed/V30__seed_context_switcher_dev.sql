-- Story 17.23 — données dev pour tester le sélecteur troupe · saison (multi-contexte).
-- Profil dev : patrice@seed.la-malice.test (user d0000001-…-000022, déjà membre La Malice via V17).
-- Tout membre actif de La Malice reçoit aussi une adhésion « Les Zinzins » (connexion Google réelle incluse).
-- Flyway seed V30 (ne pas réutiliser V29 — réservé à db/migration).
-- Après migration : redémarrer l’API (profil dev) ou reset branche Neon dev.

-- Deuxième troupe (wireframe UX 17.23)
INSERT INTO troupes (id, name, slug, created_at)
SELECT
    'a0000001-0000-4000-8000-000000000002',
    'Les Zinzins',
    'les-zinzins',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM troupes WHERE id = 'a0000001-0000-4000-8000-000000000002'
);

-- Saison supplémentaire sur La Malice (2 saisons listables → sélecteur même avec une seule troupe)
INSERT INTO seasons (
    id,
    troupe_id,
    slug,
    title,
    description,
    start_date,
    end_date,
    archived,
    is_active,
    event_count,
    participant_count,
    created_at,
    updated_at
)
SELECT
    'b0000001-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'aperock-2026',
    'Apérock 2026',
    NULL,
    DATE '2026-01-01',
    DATE '2026-12-31',
    FALSE,
    FALSE,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM seasons WHERE id = 'b0000001-0000-4000-8000-000000000002'
);

-- Saison sur Les Zinzins
INSERT INTO seasons (
    id,
    troupe_id,
    slug,
    title,
    description,
    start_date,
    end_date,
    archived,
    is_active,
    event_count,
    participant_count,
    created_at,
    updated_at
)
SELECT
    'b0000001-0000-4000-8000-000000000003',
    'a0000001-0000-4000-8000-000000000002',
    'festibask-2025-26',
    'Festibask 2025-26',
    NULL,
    DATE '2025-09-01',
    DATE '2026-08-31',
    FALSE,
    FALSE,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM seasons WHERE id = 'b0000001-0000-4000-8000-000000000003'
);

-- Miroir des adhésions La Malice → Les Zinzins (évite une UI « créer troupe » en dev)
INSERT INTO troupe_memberships (
    id,
    troupe_id,
    user_id,
    status,
    baseline_role,
    display_name,
    preferred_role_keys,
    created_at,
    updated_at
)
SELECT
    CAST(
        ('e1000001-0000-4000-8000-' || SUBSTRING(CAST(m.id AS VARCHAR), 25, 12)) AS UUID
    ),
    'a0000001-0000-4000-8000-000000000002',
    m.user_id,
    m.status,
    m.baseline_role,
    m.display_name,
    m.preferred_role_keys,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM troupe_memberships m
WHERE m.troupe_id = 'a0000001-0000-4000-8000-000000000001'
  AND m.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM troupe_memberships z
      WHERE z.troupe_id = 'a0000001-0000-4000-8000-000000000002'
        AND z.user_id = m.user_id
  );

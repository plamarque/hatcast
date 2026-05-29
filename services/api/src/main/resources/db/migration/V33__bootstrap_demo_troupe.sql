-- Story 18.3 / ADR-0015 : troupe Démo prod (idempotent, all profiles including cloud).
-- KPI analytics (FR47) : exclude rows WHERE troupes.is_demo = true from pilot adoption metrics.
-- UUID …000099 — distinct from Les Improbots (…000001, db/seed).

INSERT INTO troupes (id, name, slug, created_at, join_policy, is_demo)
SELECT
    'a0000001-0000-4000-8000-000000000099',
    'Démo',
    'demo',
    CURRENT_TIMESTAMP,
    'OPEN',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM troupes WHERE id = 'a0000001-0000-4000-8000-000000000099'
);

UPDATE troupes
SET
    name = 'Démo',
    slug = 'demo',
    join_policy = 'OPEN',
    is_demo = TRUE
WHERE id = 'a0000001-0000-4000-8000-000000000099'
  AND (name <> 'Démo' OR slug <> 'demo' OR join_policy <> 'OPEN' OR is_demo <> TRUE);

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
    'b0000001-0000-4000-8000-000000000099',
    'a0000001-0000-4000-8000-000000000099',
    'saison-2026-2027',
    'Saison 2026-2027',
    'Saison de démonstration HatCast',
    DATE '2026-06-01',
    DATE '2027-05-31',
    FALSE,
    TRUE,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM seasons WHERE id = 'b0000001-0000-4000-8000-000000000099'
);

UPDATE seasons
SET
    slug = 'saison-2026-2027',
    title = 'Saison 2026-2027',
    start_date = DATE '2026-06-01',
    end_date = DATE '2027-05-31',
    archived = FALSE,
    is_active = TRUE
WHERE id = 'b0000001-0000-4000-8000-000000000099'
  AND (
    slug <> 'saison-2026-2027'
    OR title <> 'Saison 2026-2027'
    OR start_date <> DATE '2026-06-01'
    OR end_date <> DATE '2027-05-31'
    OR archived <> FALSE
    OR is_active <> TRUE
  );

-- Saison seed pour le dev local : évite de recréer une saison à la main après chaque reset DB.
-- Troupe : Les Improbots (même UUID que V3_1, …000001).
-- Slug aligné sur la règle slugify(titre) → les-improbots-2026-2027
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
    'b0000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'les-improbots-2026-2027',
    'Les Improbots 2026-2027',
    NULL,
    DATE '2026-09-01',
    DATE '2027-08-31',
    FALSE,
    FALSE,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM seasons WHERE id = 'b0000001-0000-4000-8000-000000000001'
);

UPDATE seasons
SET slug = 'les-improbots-2026-2027', title = 'Les Improbots 2026-2027'
WHERE id = 'b0000001-0000-4000-8000-000000000001'
  AND (slug <> 'les-improbots-2026-2027' OR title <> 'Les Improbots 2026-2027');

-- Saison seed pour le dev local : évite de recréer une saison à la main après chaque reset DB.
-- Troupe : même UUID que V3 (hatcast.troupe.seed-troupe-id).
-- Slug aligné sur la règle slugify(titre) → la-malice-2026-2027
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
VALUES (
    'b0000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'la-malice-2026-2027',
    'La Malice 2026-2027',
    NULL,
    DATE '2026-09-01',
    DATE '2027-08-31',
    FALSE,
    FALSE,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

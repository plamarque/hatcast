-- Story 17.6: human-readable event slugs (unique per season).
-- Portable SQL (H2 test profile + PostgreSQL).

ALTER TABLE events ADD COLUMN slug VARCHAR(128);

WITH normalized AS (
  SELECT
    e.id,
    e.season_id,
    e.created_at,
    left(
      trim(both '-' from regexp_replace(
        regexp_replace(
          lower(
            translate(
              e.title,
              'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ',
              'aaaaaaeeeeiiiiooooouuuuyyncAAAAAAEEEEIIIIOOOOOUUUUYYNC'
            )
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        '-+',
        '-',
        'g'
      )),
      128
    ) AS slug_base_raw
  FROM events e
),
base AS (
  SELECT
    id,
    season_id,
    created_at,
    CASE
      WHEN slug_base_raw IS NULL OR slug_base_raw = '' THEN
        'event-' || left(replace(cast(id as varchar), '-', ''), 12)
      ELSE slug_base_raw
    END AS slug_base
  FROM normalized
),
ranked AS (
  SELECT
    id,
    slug_base,
    row_number() OVER (PARTITION BY season_id, slug_base ORDER BY created_at ASC, id ASC) AS rn
  FROM base
),
final AS (
  SELECT
    id,
    CASE
      WHEN rn = 1 THEN slug_base
      ELSE
        rtrim(
          left(slug_base, greatest(1, 128 - length('-' || cast(rn as varchar)))),
          '-'
        ) || '-' || cast(rn as varchar)
    END AS final_slug
  FROM ranked
)
UPDATE events e
SET slug = f.final_slug
FROM final f
WHERE e.id = f.id;

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_season_slug UNIQUE (season_id, slug);

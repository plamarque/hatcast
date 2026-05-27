-- Story 17.6: human-readable event slugs (unique per season).
-- Portable SQL (H2 test profile + PostgreSQL): correlated UPDATE, no UPDATE … FROM.

ALTER TABLE events ADD COLUMN slug VARCHAR(128);

UPDATE events e
SET slug = (
  SELECT f.final_slug
  FROM (
    WITH normalized AS (
      SELECT
        ev.id,
        ev.season_id,
        ev.created_at,
        left(
          trim(both '-' from regexp_replace(
            regexp_replace(
              lower(
                translate(
                  ev.title,
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
      FROM events ev
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
    SELECT id, final_slug FROM final
  ) f
  WHERE f.id = e.id
);

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_season_slug UNIQUE (season_id, slug);

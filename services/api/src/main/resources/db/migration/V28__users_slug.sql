-- Story 16.1: stable account-level user slugs for /membre/:userSlug routes.

ALTER TABLE users ADD COLUMN slug VARCHAR(128);

WITH normalized AS (
  SELECT
    u.id,
    u.created_at,
    left(
      trim(both '-' from regexp_replace(
        regexp_replace(
          lower(
            translate(
              coalesce(nullif(trim(u.display_name), ''), split_part(coalesce(u.email, ''), '@', 1), 'user'),
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
  FROM users u
),
base AS (
  SELECT
    id,
    created_at,
    CASE
      WHEN slug_base_raw IS NULL OR slug_base_raw = '' THEN
        'user-' || left(replace(cast(id as varchar), '-', ''), 12)
      ELSE slug_base_raw
    END AS slug_base
  FROM normalized
),
ranked AS (
  SELECT
    id,
    slug_base,
    row_number() OVER (PARTITION BY slug_base ORDER BY created_at ASC, id ASC) AS rn
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
UPDATE users u
SET slug = f.final_slug
FROM final f
WHERE u.id = f.id;

ALTER TABLE users ALTER COLUMN slug SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_slug_unique UNIQUE (slug);

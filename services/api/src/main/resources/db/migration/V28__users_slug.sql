-- Story 16.1: stable account-level user slugs for /membre/:userSlug routes.
-- Portable SQL (H2 test profile + PostgreSQL): correlated UPDATE, no UPDATE … FROM.

ALTER TABLE users ADD COLUMN slug VARCHAR(128);

UPDATE users u
SET slug = (
  SELECT f.final_slug
  FROM (
    WITH normalized AS (
      SELECT
        usr.id,
        usr.created_at,
        left(
          trim(both '-' from regexp_replace(
            regexp_replace(
              lower(
                translate(
                  coalesce(
                    nullif(trim(usr.display_name), ''),
                    CASE
                      WHEN locate('@', coalesce(usr.email, '')) > 0
                      THEN substring(usr.email, 1, locate('@', usr.email) - 1)
                      ELSE nullif(trim(coalesce(usr.email, '')), '')
                    END,
                    'user'
                  ),
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
      FROM users usr
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
    SELECT id, final_slug FROM final
  ) f
  WHERE f.id = u.id
);

ALTER TABLE users ALTER COLUMN slug SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_slug_unique UNIQUE (slug);

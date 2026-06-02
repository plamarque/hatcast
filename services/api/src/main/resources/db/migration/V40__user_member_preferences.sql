-- Story 17.33: account-level member pseudo and preferred roles (single source of truth).
-- Portable SQL (H2 test profile + PostgreSQL): correlated UPDATE, no UPDATE … FROM.
-- Migration strategy (documented):
--   member_display_name: value from the ACTIVE membership with the latest updated_at per user.
--   preferred_role_keys: same rule (last-updated active membership).
--   Then harmonize all ACTIVE memberships to the consolidated account values.

ALTER TABLE users ADD COLUMN member_display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN preferred_role_keys TEXT NOT NULL DEFAULT '[]';

UPDATE users u
SET member_display_name = (
    SELECT pick.display_name
    FROM (
        SELECT
            m.user_id,
            m.display_name,
            ROW_NUMBER() OVER (PARTITION BY m.user_id ORDER BY m.updated_at DESC, m.id DESC) AS rn
        FROM troupe_memberships m
        WHERE m.status = 'ACTIVE'
    ) pick
    WHERE pick.user_id = u.id
      AND pick.rn = 1
)
WHERE EXISTS (
    SELECT 1
    FROM troupe_memberships m
    WHERE m.user_id = u.id
      AND m.status = 'ACTIVE'
);

UPDATE users u
SET preferred_role_keys = (
    SELECT pick.preferred_role_keys
    FROM (
        SELECT
            m.user_id,
            m.preferred_role_keys,
            ROW_NUMBER() OVER (PARTITION BY m.user_id ORDER BY m.updated_at DESC, m.id DESC) AS rn
        FROM troupe_memberships m
        WHERE m.status = 'ACTIVE'
    ) pick
    WHERE pick.user_id = u.id
      AND pick.rn = 1
)
WHERE EXISTS (
    SELECT 1
    FROM troupe_memberships m
    WHERE m.user_id = u.id
      AND m.status = 'ACTIVE'
);

UPDATE troupe_memberships m
SET
    display_name = COALESCE(
        (SELECT u.member_display_name FROM users u WHERE u.id = m.user_id),
        m.display_name
    ),
    preferred_role_keys = (
        SELECT u.preferred_role_keys FROM users u WHERE u.id = m.user_id
    )
WHERE m.status = 'ACTIVE';

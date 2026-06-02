-- Dev seed (profil dev / CI test) : opérateur·ices réels sur Les Improbots après première connexion Google.
-- Idempotent : INSERT si absent, promotion TROUPE_ADMIN si adhésion MEMBER existante (ex. self-join OPEN).

INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT
    'e0000001-0000-4000-8000-000000000901',
    'a0000001-0000-4000-8000-000000000001',
    u.id,
    'ACTIVE',
    'TROUPE_ADMIN',
    COALESCE(u.display_name, u.email),
    '[]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE lower(u.email) = 'patrice.lamarque@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM troupe_memberships tm
    WHERE tm.troupe_id = 'a0000001-0000-4000-8000-000000000001' AND tm.user_id = u.id
  );

INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT
    'e0000001-0000-4000-8000-000000000902',
    'a0000001-0000-4000-8000-000000000001',
    u.id,
    'ACTIVE',
    'TROUPE_ADMIN',
    COALESCE(u.display_name, u.email),
    '[]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE lower(u.email) = 'impropick@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM troupe_memberships tm
    WHERE tm.troupe_id = 'a0000001-0000-4000-8000-000000000001' AND tm.user_id = u.id
  );

UPDATE troupe_memberships tm
SET
    baseline_role = 'TROUPE_ADMIN',
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
FROM users u
WHERE tm.user_id = u.id
  AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000001'
  AND lower(u.email) IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com')
  AND (tm.baseline_role <> 'TROUPE_ADMIN' OR tm.status <> 'ACTIVE');

INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)
SELECT
    'f0000001-0000-4000-8000-000000000901',
    'b0000001-0000-4000-8000-000000000001',
    COALESCE(u.display_name, u.email),
    lower(u.email),
    u.id,
    tm.id,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000001'
WHERE lower(u.email) = 'patrice.lamarque@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM season_participants sp
    WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000001' AND sp.user_id = u.id
  );

INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)
SELECT
    'f0000001-0000-4000-8000-000000000902',
    'b0000001-0000-4000-8000-000000000001',
    COALESCE(u.display_name, u.email),
    lower(u.email),
    u.id,
    tm.id,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000001'
WHERE lower(u.email) = 'impropick@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM season_participants sp
    WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000001' AND sp.user_id = u.id
  );

UPDATE season_participants sp
SET
    status = 'ACTIVE',
    removed_at = NULL,
    removal_source = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000001'
  AND sp.status = 'REMOVED'
  AND EXISTS (
    SELECT 1
    FROM users u
    JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000001'
    WHERE sp.user_id = u.id
      AND sp.troupe_membership_id = tm.id
      AND lower(u.email) IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com')
  );

UPDATE seasons
SET
    participant_count = (
        SELECT COUNT(*) FROM season_participants sp
        WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'b0000001-0000-4000-8000-000000000001';

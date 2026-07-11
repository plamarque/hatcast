-- Story 18.3 AC7 (repeatable) : prod super-admin TROUPE_ADMIN on Démo when users exist.
-- Re-runs on every Flyway migrate (checksum change or pending repeatables) so first Google login
-- after an empty Neon bootstrap is picked up without a manual SQL runbook.

INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT
    'e0000099-0000-4000-8000-000000000101',
    'a0000001-0000-4000-8000-000000000099',
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
    WHERE tm.troupe_id = 'a0000001-0000-4000-8000-000000000099' AND tm.user_id = u.id
  );

INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT
    'e0000099-0000-4000-8000-000000000102',
    'a0000001-0000-4000-8000-000000000099',
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
    WHERE tm.troupe_id = 'a0000001-0000-4000-8000-000000000099' AND tm.user_id = u.id
  );

-- Promotion si self-join OPEN a créé une adhésion MEMBER avant ce bootstrap (parité Improbots dev).
UPDATE troupe_memberships tm
SET
    baseline_role = 'TROUPE_ADMIN',
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
FROM users u
WHERE tm.user_id = u.id
  AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000099'
  AND lower(u.email) IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com')
  AND (tm.baseline_role <> 'TROUPE_ADMIN' OR tm.status <> 'ACTIVE');

INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)
SELECT
    'f0000099-0000-4000-8000-000000000101',
    'b0000001-0000-4000-8000-000000000099',
    COALESCE(u.display_name, u.email),
    lower(u.email),
    u.id,
    tm.id,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000099'
WHERE lower(u.email) = 'patrice.lamarque@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM season_participants sp
    WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000099' AND sp.user_id = u.id
  );

INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)
SELECT
    'f0000099-0000-4000-8000-000000000102',
    'b0000001-0000-4000-8000-000000000099',
    COALESCE(u.display_name, u.email),
    lower(u.email),
    u.id,
    tm.id,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
JOIN troupe_memberships tm ON tm.user_id = u.id AND tm.troupe_id = 'a0000001-0000-4000-8000-000000000099'
WHERE lower(u.email) = 'impropick@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM season_participants sp
    WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000099' AND sp.user_id = u.id
  );

-- Organisateur·ices de saison : cascade notifications orga (parité R__bootstrap_improbots_dev_operator_memberships).
INSERT INTO season_organizers (season_id, user_id, granted_by_user_id, granted_at)
SELECT
    'b0000001-0000-4000-8000-000000000099',
    u.id,
    u.id,
    CURRENT_TIMESTAMP
FROM users u
WHERE lower(u.email) IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM season_organizers so
    WHERE so.season_id = 'b0000001-0000-4000-8000-000000000099' AND so.user_id = u.id
  );

UPDATE seasons
SET
    participant_count = (
        SELECT COUNT(*) FROM season_participants sp
        WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'b0000001-0000-4000-8000-000000000099';

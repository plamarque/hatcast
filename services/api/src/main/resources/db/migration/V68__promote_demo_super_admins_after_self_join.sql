-- Story 4.4 follow-up / fix(auth): promote Demo super-admins after OPEN self-join.
-- Do not edit V37 in place — staging Neon already applied the original checksum.

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

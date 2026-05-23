-- Story 2.2 : baseline troupe roles for member administration.
ALTER TABLE troupe_memberships
    ADD COLUMN baseline_role VARCHAR(32) NOT NULL DEFAULT 'MEMBER';

-- Preserve existing demo write access for memberships created before baseline roles.
UPDATE troupe_memberships
SET baseline_role = 'TROUPE_ADMIN',
    updated_at = CURRENT_TIMESTAMP
WHERE troupe_id = 'a0000001-0000-4000-8000-000000000001'
  AND status = 'ACTIVE';

CREATE INDEX idx_troupe_memberships_troupe_status_role
    ON troupe_memberships (troupe_id, status, baseline_role);

CREATE INDEX idx_troupe_memberships_troupe_status_display
    ON troupe_memberships (troupe_id, status, display_name);

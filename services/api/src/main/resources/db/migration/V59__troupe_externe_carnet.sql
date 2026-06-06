-- Story 2.21 / ADR-0021: carnet EXTERNE (name-only allowed, optional email)
ALTER TABLE troupe_memberships
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE troupe_memberships
    ADD COLUMN normalized_email VARCHAR(320) NULL;

ALTER TABLE troupe_memberships
    DROP CONSTRAINT IF EXISTS troupe_memberships_unique_user_troupe;

ALTER TABLE troupe_memberships
    ADD CONSTRAINT troupe_memberships_user_required_for_member_roles
        CHECK (
            baseline_role = 'EXTERNE'
            OR user_id IS NOT NULL
        );

-- PostgreSQL / H2 (PG mode): multiple NULL user_id rows allowed (name-only externes).
CREATE UNIQUE INDEX idx_troupe_memberships_troupe_user
    ON troupe_memberships (troupe_id, user_id);

-- Name homonyms allowed for MVP (no unique on display_name for EXTERNE).

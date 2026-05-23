-- Story 2.7 : troupe-scoped preferred event roles (FR46) on membership.
ALTER TABLE troupe_memberships
    ADD COLUMN preferred_role_keys TEXT NOT NULL DEFAULT '[]';

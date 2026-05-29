-- Story 18.1 : join policy model + demo troupe flag (FR62, FR64 prerequisite)
ALTER TABLE troupes ADD COLUMN join_policy VARCHAR(16) NOT NULL DEFAULT 'OPEN';
ALTER TABLE troupes ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE troupes
    ADD CONSTRAINT troupes_join_policy_chk CHECK (join_policy IN ('OPEN', 'INVITE_ONLY'));

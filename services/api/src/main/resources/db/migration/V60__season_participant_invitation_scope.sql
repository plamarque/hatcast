ALTER TABLE season_participants
    ADD COLUMN invitation_scope VARCHAR(16) NULL
        CHECK (invitation_scope IS NULL OR invitation_scope IN ('SEASON', 'EVENT'));

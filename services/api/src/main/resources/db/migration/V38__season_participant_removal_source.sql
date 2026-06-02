ALTER TABLE season_participants
    ADD COLUMN removal_source VARCHAR(32);

ALTER TABLE season_participants
    ADD CONSTRAINT season_participants_removal_source_check
        CHECK (removal_source IS NULL OR removal_source IN ('SEASON_ADMIN', 'MEMBERSHIP_INACTIVE'));

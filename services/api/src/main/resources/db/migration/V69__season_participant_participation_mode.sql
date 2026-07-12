-- ADR-0022 / story 2.26: per-season participation mode
ALTER TABLE season_participants
    ADD COLUMN participation_mode VARCHAR(32);

ALTER TABLE season_participants
    ADD CONSTRAINT chk_season_participants_participation_mode
        CHECK (
            participation_mode IS NULL
                OR participation_mode IN ('MEMBER_SYNC', 'GUEST_SEASON', 'GUEST_EVENT')
            );

UPDATE season_participants sp
SET participation_mode = CASE
    WHEN sp.invitation_scope = 'SEASON' THEN 'GUEST_SEASON'
    WHEN sp.invitation_scope = 'EVENT' THEN 'GUEST_EVENT'
    WHEN sp.troupe_membership_id IS NOT NULL THEN 'MEMBER_SYNC'
    ELSE NULL
END;

CREATE INDEX idx_season_participants_mode_active ON season_participants (season_id, participation_mode);

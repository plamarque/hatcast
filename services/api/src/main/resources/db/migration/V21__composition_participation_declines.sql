CREATE TABLE event_composition_declines (
    id UUID NOT NULL,
    event_id UUID NOT NULL,
    role_key VARCHAR(64) NOT NULL,
    slot_index INT NOT NULL,
    season_participant_id UUID NULL,
    event_participant_id UUID NULL,
    declined_by_user_id UUID NOT NULL,
    declined_at TIMESTAMPTZ NOT NULL,
    note VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT event_composition_declines_event_fk FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT event_composition_declines_declined_by_fk FOREIGN KEY (declined_by_user_id) REFERENCES users (id),
    CONSTRAINT event_composition_declines_season_participant_fk FOREIGN KEY (season_participant_id) REFERENCES season_participants (id) ON DELETE SET NULL,
    CONSTRAINT event_composition_declines_event_participant_fk FOREIGN KEY (event_participant_id) REFERENCES event_participants (id) ON DELETE SET NULL,
    CONSTRAINT event_composition_declines_participant_xor_chk CHECK (
        (season_participant_id IS NULL AND event_participant_id IS NULL)
        OR (season_participant_id IS NOT NULL AND event_participant_id IS NULL)
        OR (season_participant_id IS NULL AND event_participant_id IS NOT NULL)
    )
);

CREATE INDEX idx_composition_declines_event ON event_composition_declines (event_id);

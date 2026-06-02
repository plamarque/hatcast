CREATE TABLE event_draw_chance_snapshots (
    event_id UUID NOT NULL,
    role_key VARCHAR(64) NOT NULL,
    participant_id UUID NOT NULL,
    chance_percent INT NOT NULL,
    past_selection_count INT NOT NULL DEFAULT 0,
    required_count INT NOT NULL,
    candidate_count INT NOT NULL,
    snapshotted_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (event_id, role_key, participant_id),
    CONSTRAINT event_draw_chance_snapshots_event_fk
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT event_draw_chance_snapshots_chance_percent_chk
        CHECK (chance_percent BETWEEN 0 AND 100)
);

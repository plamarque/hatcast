-- Per-event opt-out from the season roster (virtual inheritance; no row copy).
CREATE TABLE event_participant_exclusions (
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    season_participant_id UUID NOT NULL REFERENCES season_participants (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (event_id, season_participant_id)
);

CREATE INDEX idx_event_participant_exclusions_event ON event_participant_exclusions (event_id);

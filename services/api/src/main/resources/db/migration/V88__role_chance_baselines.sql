CREATE TABLE event_chance_baseline_events (
    event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_role_chance_baselines (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role_key VARCHAR(64) NOT NULL,
    captured_at TIMESTAMPTZ,
    PRIMARY KEY (event_id, role_key)
);

CREATE TABLE event_role_chance_baseline_entries (
    event_id UUID NOT NULL,
    role_key VARCHAR(64) NOT NULL,
    participant_id UUID NOT NULL,
    chance_percent INTEGER NOT NULL CHECK (chance_percent BETWEEN 0 AND 100),
    PRIMARY KEY (event_id, role_key, participant_id),
    FOREIGN KEY (event_id, role_key) REFERENCES event_role_chance_baselines(event_id, role_key) ON DELETE CASCADE
);

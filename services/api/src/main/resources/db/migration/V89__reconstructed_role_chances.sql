-- Estimates are separate from observed captures and carry their supporting evidence.
CREATE TABLE event_role_chance_reconstructions (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role_key VARCHAR(64) NOT NULL,
    estimated_at TIMESTAMPTZ NOT NULL,
    evidence TEXT NOT NULL,
    assumptions TEXT NOT NULL,
    superseded_at TIMESTAMPTZ,
    PRIMARY KEY (event_id, role_key)
);

CREATE TABLE event_role_chance_reconstruction_entries (
    event_id UUID NOT NULL,
    role_key VARCHAR(64) NOT NULL,
    participant_id UUID NOT NULL,
    chance_percent INTEGER NOT NULL CHECK (chance_percent BETWEEN 0 AND 100),
    PRIMARY KEY (event_id, role_key, participant_id),
    FOREIGN KEY (event_id, role_key) REFERENCES event_role_chance_reconstructions(event_id, role_key) ON DELETE CASCADE
);

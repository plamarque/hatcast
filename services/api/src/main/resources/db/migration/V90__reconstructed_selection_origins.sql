-- Reconstructed origins never replace origins recorded by the application.
CREATE TABLE event_selection_origin_reconstructions (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role_key VARCHAR(64) NOT NULL,
    slot_index INTEGER NOT NULL,
    participant_id UUID NOT NULL,
    origin VARCHAR(16) NOT NULL CHECK (origin IN ('draw', 'manual', 'unknown')),
    evidence_at TIMESTAMPTZ,
    PRIMARY KEY (event_id, role_key, slot_index)
);

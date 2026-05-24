CREATE TABLE event_compositions (
    event_id UUID NOT NULL,
    validated_at TIMESTAMPTZ NULL,
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (event_id),
    CONSTRAINT event_compositions_event_fk FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

CREATE TABLE event_composition_slots (
    id UUID NOT NULL,
    event_id UUID NOT NULL,
    role_key VARCHAR(64) NOT NULL,
    slot_index INT NOT NULL,
    participant_id UUID NULL,
    participation_status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    waived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT event_composition_slots_event_fk FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT event_composition_slots_participant_fk FOREIGN KEY (participant_id) REFERENCES season_participants (id),
    CONSTRAINT event_composition_slots_status_chk CHECK (participation_status IN ('PENDING', 'CONFIRMED', 'DECLINED')),
    CONSTRAINT event_composition_slots_unique UNIQUE (event_id, role_key, slot_index)
);

CREATE INDEX idx_composition_slots_event ON event_composition_slots (event_id);

CREATE TABLE event_availability (
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('AVAILABLE', 'UNAVAILABLE')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT event_availability_event_fk FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT event_availability_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_event_availability_user ON event_availability (user_id);

-- participant_id UUID NULL reserved for Story 3.8 migration when rosters are canonical

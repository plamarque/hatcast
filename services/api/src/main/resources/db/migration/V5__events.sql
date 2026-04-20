CREATE TABLE events (
    id UUID NOT NULL PRIMARY KEY,
    season_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(512),
    starts_at TIMESTAMP NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT events_season_fk FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE
);

CREATE INDEX idx_events_season_starts ON events (season_id, starts_at ASC);

CREATE TABLE season_participants (
    id UUID NOT NULL PRIMARY KEY,
    season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    normalized_email VARCHAR(320) NULL,
    user_id UUID NULL REFERENCES users (id) ON DELETE SET NULL,
    troupe_membership_id UUID NULL REFERENCES troupe_memberships (id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REMOVED')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    removed_at TIMESTAMP NULL,
    CONSTRAINT uq_season_participant_membership UNIQUE (season_id, troupe_membership_id)
);

CREATE TABLE event_participants (
    id UUID NOT NULL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    normalized_email VARCHAR(320) NULL,
    user_id UUID NULL REFERENCES users (id) ON DELETE SET NULL,
    season_participant_id UUID NULL REFERENCES season_participants (id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REMOVED')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    removed_at TIMESTAMP NULL
);

CREATE INDEX idx_season_participants_season_status ON season_participants (season_id, status);
CREATE INDEX idx_event_participants_event_status ON event_participants (event_id, status);
CREATE INDEX idx_season_participants_email ON season_participants (normalized_email);
CREATE INDEX idx_event_participants_email ON event_participants (normalized_email);
CREATE INDEX idx_season_participants_user ON season_participants (user_id);
CREATE INDEX idx_event_participants_user ON event_participants (user_id);

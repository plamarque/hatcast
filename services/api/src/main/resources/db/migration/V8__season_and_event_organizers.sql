CREATE TABLE season_organizers (
    season_id UUID NOT NULL,
    user_id UUID NOT NULL,
    granted_at TIMESTAMP NOT NULL,
    granted_by_user_id UUID,
    CONSTRAINT season_organizers_pk PRIMARY KEY (season_id, user_id),
    CONSTRAINT season_organizers_season_fk FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE,
    CONSTRAINT season_organizers_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT season_organizers_granted_by_fk FOREIGN KEY (granted_by_user_id) REFERENCES users (id)
);

CREATE TABLE event_organizers (
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    granted_at TIMESTAMP NOT NULL,
    granted_by_user_id UUID,
    CONSTRAINT event_organizers_pk PRIMARY KEY (event_id, user_id),
    CONSTRAINT event_organizers_event_fk FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT event_organizers_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT event_organizers_granted_by_fk FOREIGN KEY (granted_by_user_id) REFERENCES users (id)
);

CREATE INDEX idx_season_organizers_user ON season_organizers (user_id);
CREATE INDEX idx_event_organizers_user ON event_organizers (user_id);

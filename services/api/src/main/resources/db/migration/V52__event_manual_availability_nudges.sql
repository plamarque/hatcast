CREATE TABLE event_manual_availability_nudges (
    event_id UUID PRIMARY KEY REFERENCES events (id) ON DELETE CASCADE,
    last_sent_at TIMESTAMPTZ NOT NULL,
    last_actor_user_id UUID NOT NULL REFERENCES users (id)
);

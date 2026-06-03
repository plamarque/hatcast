CREATE TABLE event_manual_share_notify (
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    intent VARCHAR(32) NOT NULL,
    last_sent_at TIMESTAMPTZ NOT NULL,
    last_actor_user_id UUID NOT NULL REFERENCES users (id),
    PRIMARY KEY (event_id, intent)
);

INSERT INTO event_manual_share_notify (event_id, intent, last_sent_at, last_actor_user_id)
SELECT event_id, 'availability_nudge', last_sent_at, last_actor_user_id
FROM event_manual_availability_nudges;

DROP TABLE event_manual_availability_nudges;

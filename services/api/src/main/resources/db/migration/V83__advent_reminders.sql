-- The Advent choice and attempts are independent of event notification settings.
CREATE TABLE advent_reminder_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    enabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE advent_reminder_attempts (
    quiz_day INTEGER NOT NULL CHECK (quiz_day BETWEEN 1 AND 24),
    user_id UUID NOT NULL REFERENCES users(id),
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (quiz_day, user_id)
);

-- Advent-only devices do not enroll in other HatCast notification categories.
CREATE TABLE advent_reminder_devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    endpoint VARCHAR(2048) NOT NULL UNIQUE,
    p256dh_key VARCHAR(512) NOT NULL,
    auth_key VARCHAR(512) NOT NULL,
    user_agent VARCHAR(512),
    created_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP
);
CREATE INDEX advent_reminder_devices_user_idx ON advent_reminder_devices (user_id);

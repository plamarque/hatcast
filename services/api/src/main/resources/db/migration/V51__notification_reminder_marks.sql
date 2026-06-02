CREATE TABLE notification_reminder_marks (
    id UUID PRIMARY KEY,
    intent VARCHAR(64) NOT NULL,
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reminder_window VARCHAR(16) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notification_reminder_marks UNIQUE (intent, event_id, user_id, reminder_window)
);

CREATE INDEX idx_notification_reminder_marks_event_id ON notification_reminder_marks (event_id);
CREATE INDEX idx_notification_reminder_marks_user_id ON notification_reminder_marks (user_id);

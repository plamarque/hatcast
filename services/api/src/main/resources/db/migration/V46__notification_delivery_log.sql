CREATE TABLE notification_delivery_log (
    id UUID PRIMARY KEY,
    intent VARCHAR(64) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id),
    channel VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    error_message TEXT,
    event_id UUID REFERENCES events (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_delivery_log_user_id ON notification_delivery_log (user_id);
CREATE INDEX idx_notification_delivery_log_event_id ON notification_delivery_log (event_id);
CREATE INDEX idx_notification_delivery_log_created_at ON notification_delivery_log (created_at);

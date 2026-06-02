-- Story 8.1: global browser push opt-in + per-device Web Push subscriptions.
-- Portable SQL (H2 test profile + PostgreSQL).

ALTER TABLE users ADD COLUMN push_notifications_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE user_push_subscriptions (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    endpoint VARCHAR(2048) NOT NULL,
    p256dh_key VARCHAR(512) NOT NULL,
    auth_key VARCHAR(512) NOT NULL,
    user_agent VARCHAR(512),
    created_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    CONSTRAINT fk_user_push_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_user_push_subscriptions_endpoint UNIQUE (endpoint)
);

CREATE INDEX idx_user_push_subscriptions_user_id ON user_push_subscriptions (user_id);

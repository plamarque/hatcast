-- Story 8.2: account-level notification preferences by category and channel.
-- PostgreSQL uses JSONB; H2 test/e2e profiles override the placeholder to JSON.

ALTER TABLE users
    ADD COLUMN notification_preferences ${notification_preferences_json_type} NOT NULL DEFAULT ${notification_preferences_json_default};

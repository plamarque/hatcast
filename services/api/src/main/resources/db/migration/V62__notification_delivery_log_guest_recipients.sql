ALTER TABLE notification_delivery_log
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE notification_delivery_log
    ADD COLUMN recipient_email TEXT;

CREATE INDEX idx_notification_delivery_log_recipient_email
    ON notification_delivery_log (recipient_email);

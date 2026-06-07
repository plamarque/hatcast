-- Story 8.7: periodic availability-pending reminder marks (5-day cadence).
-- Legacy window marks (J-7/J-1/ONCE) use sentinel civil date 1970-01-01; periodic marks store the Paris run date.

ALTER TABLE notification_reminder_marks
    ADD COLUMN reminder_civil_date DATE NOT NULL DEFAULT DATE '1970-01-01';

ALTER TABLE notification_reminder_marks
    DROP CONSTRAINT uq_notification_reminder_marks;

CREATE UNIQUE INDEX uq_notification_reminder_marks_dedupe
    ON notification_reminder_marks (intent, event_id, user_id, reminder_window, reminder_civil_date);

ALTER TABLE event_availability
    ADD COLUMN role_keys TEXT NOT NULL DEFAULT '[]';

UPDATE event_availability
SET role_keys = '[]'
WHERE role_keys IS NULL;

-- Story 3.21: event draft gate — NULL = brouillon (dispos fermées).
-- Backfill: events with existing availability rows keep prior behaviour (opened at creation).
ALTER TABLE events
    ADD COLUMN availability_opened_at TIMESTAMPTZ NULL;

UPDATE events e
SET availability_opened_at = e.created_at
WHERE EXISTS (
    SELECT 1
    FROM event_availability ea
    WHERE ea.event_id = e.id
);

-- Events without availability rows remain draft (NULL) for greenfield QA and new creates.

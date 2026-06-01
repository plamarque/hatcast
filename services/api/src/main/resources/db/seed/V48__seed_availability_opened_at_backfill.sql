-- Story 3.21: migration V45 backfills availability_opened_at before seed rows exist (V17+).
-- Re-open spectacles that already have availability answers in seed data.
UPDATE events e
SET availability_opened_at = e.created_at,
    updated_at = CURRENT_TIMESTAMP
WHERE availability_opened_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM event_availability ea
    WHERE ea.event_id = e.id
  );

-- QA drafts (V47): keep two upcoming spectacles closed for publish flow testing.
UPDATE events
SET availability_opened_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'c0000025-0000-4000-8000-000000000025',
    'c0000026-0000-4000-8000-000000000026'
);

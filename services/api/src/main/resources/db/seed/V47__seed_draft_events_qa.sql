-- Story 3.21 QA: keep two upcoming spectacles in draft for publish-flow testing.
-- V48 backfills opened_at from availability rows; this script forces them back to draft.
UPDATE events
SET availability_opened_at = NULL
WHERE id IN (
    'c0000025-0000-4000-8000-000000000025',
    'c0000026-0000-4000-8000-000000000026'
);

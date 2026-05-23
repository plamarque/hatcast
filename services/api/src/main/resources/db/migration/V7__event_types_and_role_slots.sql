ALTER TABLE events ADD COLUMN template_type VARCHAR(32) NOT NULL DEFAULT 'custom';

ALTER TABLE events ADD COLUMN role_slots TEXT NOT NULL DEFAULT '{}';

-- Backfill legacy rows: custom type with explicit zero counts for all known roles.
UPDATE events
SET role_slots = '{
  "player": 0,
  "volunteer": 0,
  "mc": 0,
  "dj": 0,
  "referee": 0,
  "assistant_referee": 0,
  "lighting": 0,
  "coach": 0,
  "stage_manager": 0
}'
WHERE role_slots = '{}';

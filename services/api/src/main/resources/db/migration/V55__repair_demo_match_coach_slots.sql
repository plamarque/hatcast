-- Story 3.22 (DW-101) : align demo troupe match events with template coach:1.
-- Idempotent repair for V34/V36 bootstrap (coach:0 at insert time). Scoped to demo UUIDs …000099 only.
-- Safe on prod after manual SQL: no-op when coach already 1 / slots already present.

UPDATE events
SET role_slots = REPLACE(role_slots, '"coach":0', '"coach":1'),
    updated_at = CURRENT_TIMESTAMP
WHERE season_id = 'b0000001-0000-4000-8000-000000000099'
  AND template_type = 'match'
  AND role_slots LIKE '%"coach":0%';

INSERT INTO event_composition_slots (
    id, event_id, role_key, slot_index,
    season_participant_id, event_participant_id,
    participation_status, waived, created_at, updated_at
)
SELECT CAST(v.id AS uuid), CAST(v.event_id AS uuid), v.role_key, v.slot_index,
       CAST(v.sp_id AS uuid), NULL, v.status, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('91000059-0000-4000-8000-000000000099', 'c0000002-0000-4000-8000-000000000099', 'coach', 0, 'f0000002-0000-4000-8000-000000000099', 'CONFIRMED'),
        ('91000061-0000-4000-8000-000000000099', 'c0000011-0000-4000-8000-000000000099', 'coach', 0, 'f0000003-0000-4000-8000-000000000099', 'PENDING'),
        ('91000060-0000-4000-8000-000000000099', 'c0000013-0000-4000-8000-000000000099', 'coach', 0, 'f0000004-0000-4000-8000-000000000099', 'CONFIRMED')
) AS v(id, event_id, role_key, slot_index, sp_id, status)
WHERE EXISTS (SELECT 1 FROM event_compositions ec WHERE ec.event_id = CAST(v.event_id AS uuid))
  AND NOT EXISTS (SELECT 1 FROM event_composition_slots s WHERE s.id = CAST(v.id AS uuid));

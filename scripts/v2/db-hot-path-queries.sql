-- PERF-16 hot-path queries for EXPLAIN (ANALYZE, BUFFERS).
-- Replace :placeholders before running (defaults = Les Improbots seed).
--   :season_id  = b0000001-0000-4000-8000-000000000001
--   :event_id   = c0000001-0000-4000-8000-000000000001
--   :user_email = patrice@seed.improbots.test

-- @name agenda_upcoming_events
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.*
FROM events e
JOIN seasons s ON s.id = e.season_id
WHERE s.troupe_id IN (
  SELECT tm.troupe_id FROM troupe_memberships tm
  JOIN users u ON u.id = tm.user_id
  WHERE lower(u.email) = lower('patrice@seed.improbots.test')
)
AND e.archived = FALSE
AND e.starts_at >= NOW()
ORDER BY e.starts_at ASC
LIMIT 50;

-- @name availability_summary
EXPLAIN (ANALYZE, BUFFERS)
SELECT ea.*
FROM event_availability ea
WHERE ea.event_id = 'c0000001-0000-4000-8000-000000000001'::uuid;

-- @name composition_slots
EXPLAIN (ANALYZE, BUFFERS)
SELECT cs.*
FROM event_composition_slots cs
JOIN event_compositions ec ON ec.id = cs.composition_id
WHERE ec.event_id = 'c0000001-0000-4000-8000-000000000001'::uuid;

-- @name season_participants
EXPLAIN (ANALYZE, BUFFERS)
SELECT sp.*
FROM season_participants sp
WHERE sp.season_id = 'b0000001-0000-4000-8000-000000000001'::uuid
AND sp.status = 'ACTIVE';
